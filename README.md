# CYBER SURVIVOR: AI-Powered Arcade Bullet Heaven

A web-based arcade survival ("bullet heaven") game featuring dynamic Generative AI upgrades, built for a school assignment demonstrating full-stack web development, GenAI integration, and cloud deployment on AWS.

---

## 🎮 Game Overview

Control a lone cyber-drone surviving against relentless waves of hostile digital entities. Defeat enemies, gather XP nanite crystals, and unlock dynamic upgrades synthesized by Generative AI at each level threshold.

### Core Gameplay Mechanics
- **Player Movement**: Responsive 8-directional control using **[W][A][S][D]** or **[Arrow Keys]**.
- **Auto-Targeting Blaster**: Automatically detects and fires high-velocity plasma bolts at the nearest hostile in range.
- **Wave Scaling**: Enemy speed, health, and spawn frequency scale over survival time with diverse enemy classes (Swarmer, Striker, Dreadnought).
- **XP & Nanite Attraction**: Defeated enemies drop nanite crystals. Entering your drone's magnetic collection field accelerates crystals toward you.
- **Generative AI Upgrades**: On level-up, the system contacts the backend to generate 3 tailored tactical upgrades with balanced stat multipliers.
- **Resilient Fallback System**: If the AI API is offline or unconfigured, an internal balanced upgrade pool ensures uninterrupted gameplay.
- **Game-Over & Reinitialization**: Tracks survival time, enemies purged, and final score with instant mission redeployment.

---

## 🏗️ Architecture

```text
Player Browser (HTML5 Canvas + Vanilla JS)
       │
       ▼ (HTTP Port 80)
AWS EC2 / Nginx (Reverse Proxy & Static Web Server)
       │
       ▼ (Proxy to localhost:5000)
Flask Backend (Python 3 / Gunicorn)
       │
       ▼ (HTTPS API Call)
OpenAI API (gpt-4o-mini)
```

---

## 🔒 Security Practices

- **Zero Secrets in Code**: No API keys are stored in HTML, JavaScript, or public repositories.
- **Backend Proxy**: The browser communicates strictly with the Flask backend. All AI API credentials stay protected in server environment variables.
- **Comprehensive `.gitignore`**: Protects `.env`, Terraform state files (`*.tfstate`), private keys (`*.pem`), and Python virtual environments from being committed.

---

## 🚀 Quickstart (Local Development in Ubuntu / WSL)

### 1. Prerequisites
- Python 3.10+
- `pip` and `virtualenv`

### 2. Setup Virtual Environment & Install Dependencies
```bash
# Clone or navigate to the project directory
cd /path/to/Web_spel

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# (Optional) Edit .env with your OpenAI API key
# nano .env
```
*(Note: If `OPENAI_API_KEY` is not set, the game automatically uses the local tactical fallback upgrade system!)*

### 4. Run the Game
```bash
python3 app.py
```
Open your browser and navigate to:
**`http://localhost:5000`**

---

## 📂 Project Structure

```text
Web_spel/
├── .gitignore              # Git ignore rules for secrets and state
├── .env.example            # Template for environment variables
├── README.md               # Project documentation
├── requirements.txt        # Python backend dependencies
├── app.py                  # Flask backend & AI API proxy
├── templates/
│   └── index.html          # Arcade HUD, Canvas, and modal dialogs
├── static/
│   ├── css/
│   │   └── style.css       # Retro arcade styling & animations
│   └── js/
│       └── game.js         # Canvas 60 FPS game engine
├── nginx/                  # Nginx reverse proxy configuration (Step 5)
└── terraform/              # AWS EC2 infrastructure as code (Step 5)
```

---

## 📄 License
Educational project for AWS & Generative AI demonstration.
