import os
import json
import logging
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = Flask(__name__)
CORS(app)

# Default fallback upgrades pool when AI API is unavailable or offline
FALLBACK_UPGRADES = [
    {
        "id": "rapid_fire",
        "name": "Overclocked Capacitors",
        "description": "Increases weapon attack speed by 25%.",
        "icon": "⚡",
        "stats": {"attack_speed": 0.25}
    },
    {
        "id": "plasma_multishot",
        "name": "Twin Spark Spread",
        "description": "Fires +1 additional projectile per volley.",
        "icon": "💥",
        "stats": {"projectile_count": 1}
    },
    {
        "id": "dense_rounds",
        "name": "Depleted Uranium Slugs",
        "description": "Increases base projectile damage by 30%.",
        "icon": "🎯",
        "stats": {"damage": 0.30}
    },
    {
        "id": "nanite_repair",
        "name": "Nanite Regeneration",
        "description": "Restores 25% max health and grants +1 HP/sec regen.",
        "icon": "💚",
        "stats": {"heal": 25, "hp_regen": 1.0}
    },
    {
        "id": "thruster_boost",
        "name": "Ion Micro-Thrusters",
        "description": "Increases movement speed by 20%.",
        "icon": "🚀",
        "stats": {"move_speed": 0.20}
    },
    {
        "id": "magnetic_field",
        "name": "Quantum Collector Coil",
        "description": "Expands XP gem collection radius by 50%.",
        "icon": "🧲",
        "stats": {"magnet_radius": 0.50}
    }
]

# Fallback boss events when AI API is offline
FALLBACK_BOSS_EVENTS = [
    {
        "boss_name": "NEXUS OVERSEER OMEGA",
        "title": "Corrupted Core AI",
        "transmission": "SECURITY PROTOCOL OVERRIDDEN. PURGING INTRUDER ANOMALY.",
        "modifier": "armored",
        "stats": {"health_mult": 4.5, "speed_mult": 0.75, "damage_mult": 1.8},
        "color": "#ff0055"
    },
    {
        "boss_name": "PHANTOM HYPERION",
        "title": "High-Frequency Interceptor",
        "transmission": "WARP VECTOR LOCKED. EVASION IS MATHEMATICALLY IMPOSSIBLE.",
        "modifier": "swift",
        "stats": {"health_mult": 3.0, "speed_mult": 1.4, "damage_mult": 1.4},
        "color": "#00f0ff"
    }
]

@app.route("/")
def index():
    """Serves the main arcade game client."""
    return render_template("index.html")

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint for load balancers, Nginx, and monitoring."""
    api_key_configured = bool(os.getenv("OPENAI_API_KEY"))
    return jsonify({
        "status": "healthy",
        "ai_ready": api_key_configured,
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "provider": "openai" if api_key_configured else "offline-fallback"
    }), 200

@app.route("/api/generate-upgrades", methods=["POST"])
def generate_upgrades():
    """
    Returns 3 upgrade choices for the player level-up screen.
    Uses OpenAI API with strict JSON mode if configured; falls back safely.
    """
    data = request.get_json(silent=True) or {}
    level = data.get("level", 1)
    player_stats = data.get("stats", {})
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        logging.info("OpenAI API key not configured. Using balanced fallback upgrades.")
        import random
        selected = random.sample(FALLBACK_UPGRADES, min(3, len(FALLBACK_UPGRADES)))
        return jsonify({
            "source": "fallback",
            "upgrades": selected
        }), 200

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        prompt = (
            f"You are a game designer balancing an arcade bullet-heaven survival game.\n"
            f"The player just reached Level {level}.\n"
            f"Current player stats: {player_stats}\n\n"
            f"Generate exactly 3 creative, balanced sci-fi upgrades.\n"
            f"Return a valid JSON object containing an 'upgrades' array with 3 objects.\n"
            f"Each upgrade object must have:\n"
            f"- 'id': unique snake_case string\n"
            f"- 'name': punchy arcade upgrade name (2-4 words)\n"
            f"- 'description': 1 clear sentence describing its flavor and mechanical effect\n"
            f"- 'icon': 1 relevant emoji\n"
            f"- 'stats': an object choosing 1 or 2 of these stat multipliers: "
            f"'damage' (0.15 to 0.40), 'attack_speed' (0.15 to 0.35), 'projectile_count' (1), "
            f"'move_speed' (0.10 to 0.25), 'magnet_radius' (0.25 to 0.60), 'heal' (20 to 50), 'hp_regen' (0.5 to 2.0)"
        )

        response = client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a specialized game design AI. Always respond in valid JSON with an 'upgrades' list."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=450
        )

        result = json.loads(response.choices[0].message.content.strip())
        upgrades = result.get("upgrades", [])

        if isinstance(upgrades, list) and len(upgrades) >= 3:
            return jsonify({
                "source": "openai",
                "model": model,
                "upgrades": upgrades[:3]
            }), 200
        else:
            raise ValueError("AI response did not return a valid list of 3 upgrades.")

    except Exception as e:
        logging.warning(f"AI upgrade generation failed: {e}. Using fallback protocol.")
        import random
        selected = random.sample(FALLBACK_UPGRADES, min(3, len(FALLBACK_UPGRADES)))
        return jsonify({
            "source": "fallback",
            "error": str(e),
            "upgrades": selected
        }), 200

@app.route("/api/generate-boss-event", methods=["POST"])
def generate_boss_event():
    """
    Generates a dynamic AI boss encounter with custom title, lore transmission, and modifiers.
    """
    data = request.get_json(silent=True) or {}
    survival_time = data.get("survival_time", 60)
    level = data.get("level", 1)
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        import random
        chosen = random.choice(FALLBACK_BOSS_EVENTS)
        return jsonify({
            "source": "fallback",
            "event": chosen
        }), 200

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        prompt = (
            f"You are the tactical AI director for a retro sci-fi bullet-heaven arcade game.\n"
            f"The player has survived {int(survival_time)} seconds and is at Level {level}.\n"
            f"Design a menacing cybernetic mini-boss dreadnought to spawn.\n"
            f"Return a valid JSON object with the following fields:\n"
            f"- 'boss_name': Capitalized futuristic boss name (e.g. 'ARCHON CYCLOPS')\n"
            f"- 'title': 2-3 word military or AI classification (e.g. 'Subversion Protocol')\n"
            f"- 'transmission': A 1-sentence menacing warning broadcast from the boss to the player\n"
            f"- 'modifier': One of 'armored', 'swift', or 'radiant'\n"
            f"- 'stats': Object with 'health_mult' (3.5 to 5.5), 'speed_mult' (0.8 to 1.3), 'damage_mult' (1.5 to 2.2)\n"
            f"- 'color': A hex color code (e.g. '#ff0055', '#ffe600', '#a855f7', '#00f0ff')"
        )

        response = client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a sci-fi game narrative director. Respond only in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.85,
            max_tokens=300
        )

        boss_event = json.loads(response.choices[0].message.content.strip())
        return jsonify({
            "source": "openai",
            "model": model,
            "event": boss_event
        }), 200

    except Exception as e:
        logging.warning(f"AI boss generation failed: {e}. Using fallback boss.")
        import random
        chosen = random.choice(FALLBACK_BOSS_EVENTS)
        return jsonify({
            "source": "fallback",
            "error": str(e),
            "event": chosen
        }), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
