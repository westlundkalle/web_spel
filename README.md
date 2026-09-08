# CYBER SURVIVOR: AI-Powered Arcade Bullet Heaven

A web-based arcade survival ("bullet heaven") game featuring dynamic Generative AI upgrades, built for an AWS & Generative AI school assignment demonstrating full-stack web development, prompt engineering, Infrastructure-as-Code (Terraform), and cloud deployment on AWS EC2.

---

## 🎮 Game Overview

Control a cyber-drone surviving against waves of digital hostiles. Defeat enemies, gather XP nanite crystals, and unlock dynamic upgrades synthesized in real-time by Generative AI at each level threshold.

### Core Gameplay Mechanics
- **Responsive Movement**: 8-directional movement via **[W][A][S][D]** or **[Arrow Keys]**.
- **Auto-Targeting Blaster**: Automatically locks onto and fires at the nearest hostile in range.
- **Wave Scaling**: Swarmer, Striker, and Dreadnought enemy variants scale in speed and health over time.
- **Magnetic XP Collection**: Defeated enemies drop nanite crystals. Entering your drone's magnetic field draws them in.
- **Procedural Synthesizer Audio**: 100% native Web Audio API retro laser chirps, hits, crystal chimes, boss klaxons, and explosion rumbles with zero external dependencies.
- **Dynamic AI Upgrades**: At each level up, OpenAI's `gpt-4o-mini` dynamically synthesizes 3 tailored tactical upgrades based on your current stats.
- **AI Boss Encounters**: At the 1-minute mark, the AI director synthesizes an emergency combat alert with a custom boss name, lore transmission, and combat modifiers.
- **Resilient Fallback System**: If the AI API is offline or unconfigured, an internal balanced upgrade pool ensures uninterrupted gameplay.

---

## 🏗️ Architecture

```text
Player Browser (HTML5 Canvas + Web Audio + Vanilla JS)
       │
       ▼ (HTTP Port 80)
AWS EC2 Instance (Ubuntu 22.04 LTS)
       │
       ├── Nginx (Reverse Proxy & Static Web Server)
       │       │
       │       ▼ (Proxy to localhost:5000)
       └── Gunicorn + Flask (Python 3 Backend)
               │
               ▼ (HTTPS API Call)
       OpenAI API (gpt-4o-mini)
```

---

## 🤖 Generative AI Implementation

Generative AI is a central, meaningful component of the gameplay:
1. **Dynamic Upgrades (`POST /api/generate-upgrades`)**:
   - The game sends current player level, damage multipliers, attack speed, movement speed, and health.
   - OpenAI `gpt-4o-mini` is invoked with structured JSON mode (`response_format={"type": "json_object"}`).
   - The AI returns punchy upgrade titles, lore descriptions, relevant emojis, and strictly balanced stat multipliers.
2. **Dynamic Boss Wave (`POST /api/generate-boss-event`)**:
   - At survival milestones, the AI generates a customized boss with a unique title, ominous transmission, and modifiers (`armored`, `swift`, `radiant`).
3. **Resilience & Fallback Protocol**:
   - The backend validates all responses. If the API key is missing or the external API fails, it smoothly falls back to a curated pool of upgrades, keeping gameplay responsive and costs controlled.

---

## 🔒 Security Practices

- **Zero Secrets in Code**: No API keys are stored in HTML, JavaScript, or public Git commits.
- **Server-Side Proxy**: The client browser communicates strictly with Flask; all external API keys stay protected on the server.
- **Strict `.gitignore`**: Excludes `.env`, Terraform state files (`*.tfstate`), private keys (`*.pem`), and Python virtual environments.

---

## 🚀 Local Development (Ubuntu / WSL)

### 1. Setup Virtual Environment
```bash
cd /path/to/Web_spel
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Optional: Add your OpenAI API key in .env
# nano .env
```

### 3. Run Locally
```bash
python3 app.py
```
Open **`http://localhost:5000`** in your browser.

---

## ☁️ AWS Deployment with Terraform

The infrastructure is provisioned using Terraform and automated via cloud-init (`user_data.sh`).

### Infrastructure Components:
- **Region**: `eu-north-1` (Stockholm)
- **EC2 Instance**: `t3.micro` running Ubuntu 22.04 LTS (free-tier eligible)
- **Security Group**: Inbound port 80 (HTTP for game access) and port 22 (SSH)
- **Web Server**: Nginx reverse proxy forwarding traffic to Gunicorn (3 workers)
- **Process Supervisor**: Systemd (`web_spel.service`) for automatic restart on failure

### Deploying to AWS:

```bash
# 1. Navigate to the terraform directory
cd terraform

# 2. Initialize Terraform
terraform init

# 3. Preview the infrastructure plan
terraform plan

# 4. Apply and provision the EC2 server
terraform apply
```
When Terraform finishes, it prints your live public game URL:
```text
Outputs:
game_url = "http://13.53.xxx.xxx"
public_ip = "13.53.xxx.xxx"
```
Open the `game_url` in your browser to play your live game on AWS!

### Inspecting the Server (Optional SSH):
```bash
ssh -i ~/.ssh/devops.school.level3.kalle-admin.pem ubuntu@<PUBLIC_IP>

# Check application service status
sudo systemctl status web_spel

# Check Nginx status
sudo systemctl status nginx

# View cloud-init deployment logs
sudo cat /var/log/user-data.log
```

### Clean Up (Destroy Infrastructure):
```bash
terraform destroy
```

---

## 📂 Project Structure

```text
Web_spel/
├── .gitignore              # Git ignore rules for secrets, .env, and .tfstate
├── .env.example            # Environment variables template
├── README.md               # Complete project documentation
├── requirements.txt        # Python backend dependencies
├── app.py                  # Flask backend & AI API proxy
├── templates/
│   └── index.html          # Semantic HTML5 layout, HUD, and modal overlays
├── static/
│   ├── css/
│   │   └── style.css       # Arcade styling & neon effects
│   └── js/
│       └── game.js         # Canvas engine, Web Audio synth & game logic
├── nginx/
│   └── web_spel.conf       # Nginx reverse proxy configuration
└── terraform/
    ├── main.tf             # AWS EC2, VPC, and Security Group definitions
    ├── variables.tf        # AWS region, instance type, and key pair variables
    ├── outputs.tf          # Public IP and clickable game URL
    └── user_data.sh        # Automated cloud-init provisioning script
```

---

## 📄 School Assignment Demonstration Checklist
- [x] Top-down 2D canvas bullet heaven gameplay
- [x] Player movement, auto-targeting, wave scaling, and XP collection
- [x] Generative AI integration (`gpt-4o-mini` with structured JSON mode)
- [x] Graceful offline fallback mechanism
- [x] Git version control with clean history and zero exposed secrets
- [x] Infrastructure as Code using Terraform
- [x] AWS EC2 hosting with Nginx reverse proxy and Gunicorn systemd service
