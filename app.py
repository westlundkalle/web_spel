import os
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
        "provider": "openai" if api_key_configured else "offline-fallback"
    }), 200

@app.route("/api/generate-upgrades", methods=["POST"])
def generate_upgrades():
    """
    Returns 3 upgrade choices for the player level-up screen.
    Tries OpenAI API if configured; falls back safely to predefined upgrades.
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
        
        prompt = (
            f"You are a game designer balancing an arcade bullet-heaven survival game.\n"
            f"The player reached Level {level}.\n"
            f"Current player stats: {player_stats}\n\n"
            f"Generate exactly 3 creative, balanced sci-fi upgrades formatted as a JSON array.\n"
            f"Each object in the array must strictly have:\n"
            f"- 'id': unique snake_case string\n"
            f"- 'name': punchy arcade upgrade name (2-4 words)\n"
            f"- 'description': 1 clear sentence of flavor and mechanical effect\n"
            f"- 'icon': 1 relevant emoji\n"
            f"- 'stats': an object choosing 1 or 2 of these stat multipliers: "
            f"'damage' (0.15 to 0.40), 'attack_speed' (0.15 to 0.35), 'projectile_count' (1), "
            f"'move_speed' (0.10 to 0.25), 'magnet_radius' (0.25 to 0.60), 'heal' (20 to 50), 'hp_regen' (0.5 to 2.0)\n\n"
            f"Respond ONLY with the JSON array, no extra commentary or markdown fences."
        )

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "You output strictly valid JSON with no markdown fences."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )

        content = response.choices[0].message.content.strip()
        # Clean any accidental markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        import json
        upgrades = json.loads(content)
        if isinstance(upgrades, list) and len(upgrades) >= 3:
            return jsonify({
                "source": "openai",
                "upgrades": upgrades[:3]
            }), 200
        else:
            raise ValueError("AI response did not return a valid list of 3 upgrades.")

    except Exception as e:
        logging.warning(f"AI generation failed: {e}. Falling back to default upgrades.")
        import random
        selected = random.sample(FALLBACK_UPGRADES, min(3, len(FALLBACK_UPGRADES)))
        return jsonify({
            "source": "fallback",
            "error": str(e),
            "upgrades": selected
        }), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
