/**
 * CYBER SURVIVOR: AI Bullet Heaven
 * Pure HTML5 Canvas + JavaScript Game Engine with 2x Arena Camera Viewport,
 * 5-Tier Boss Progression Enemies, Legendary Boss Artifact Evolutions & Google Gemini AI.
 */

// Canvas & Rendering Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// World Dimensions (2x Arena Expansion: 1920x1280 Virtual Arena)
const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1280;

// Camera System (+50% Visible Area Expansion: 1.5x World Area visible via Camera Zoom)
const CAMERA_ZOOM = 1 / Math.sqrt(1.5); // ~0.8165 gives exactly 1.5x visible area
const camera = {
  x: 0,
  y: 0,
  zoom: CAMERA_ZOOM,
  width: canvas.width / CAMERA_ZOOM,
  height: canvas.height / CAMERA_ZOOM,
  update(target) {
    if (!target) return;
    const targetX = target.x - this.width / 2;
    const targetY = target.y - this.height / 2;
    // Smooth lerp follow
    this.x += (targetX - this.x) * 0.14;
    this.y += (targetY - this.y) * 0.14;
    // Clamp to world
    this.x = Math.max(0, Math.min(WORLD_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(WORLD_HEIGHT - this.height, this.y));
  }
};

// Top Score Persistence (local to this player)
const TOP_SCORE_KEY = 'cyber_survivor_top_score';
let playerTopScore = 0;
try {
  playerTopScore = parseInt(localStorage.getItem(TOP_SCORE_KEY), 10) || 0;
} catch (e) {
  playerTopScore = 0;
}

// UI DOM Elements
const healthFill = document.getElementById('health-bar-fill');
const healthText = document.getElementById('health-text');
const xpFill = document.getElementById('xp-bar-fill');
const playerLevelDisplay = document.getElementById('player-level');
const timerDisplay = document.getElementById('timer-display');
const topScoreDisplay = document.getElementById('top-score-display');
const scoreDisplay = document.getElementById('score-display');
const killsDisplay = document.getElementById('kills-display');

const audioToggleBtn = document.getElementById('audio-toggle');
const aiStatusPill = document.getElementById('ai-status-indicator');
const aiStatusText = document.getElementById('ai-status-text');

const eventBanner = document.getElementById('event-banner');
const eventTagTitle = document.getElementById('event-tag-title');
const eventBossName = document.getElementById('event-boss-name');
const eventTransmission = document.getElementById('event-transmission');

const levelUpModal = document.getElementById('level-up-modal');
const upgradeCardsContainer = document.getElementById('upgrade-cards');
const aiBadge = document.getElementById('ai-badge');

const bossRewardModal = document.getElementById('boss-reward-modal');
const bossRewardCardsContainer = document.getElementById('boss-reward-cards');
const bossAiBadge = document.getElementById('boss-ai-badge');

const gameOverModal = document.getElementById('game-over-modal');
const finalTimeDisplay = document.getElementById('final-time');
const finalLevelDisplay = document.getElementById('final-level');
const finalKillsDisplay = document.getElementById('final-kills');
const finalScoreDisplay = document.getElementById('final-score');
const finalTopScoreDisplay = document.getElementById('final-top-score');
const restartBtn = document.getElementById('restart-btn');

// Leaderboard DOM Elements
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardCloseBtn = document.getElementById('leaderboard-close-btn');
const leaderboardDoneBtn = document.getElementById('leaderboard-done-btn');
const leaderboardRefreshBtn = document.getElementById('leaderboard-refresh-btn');
const leaderboardTableContainer = document.getElementById('leaderboard-table-container');
const viewLeaderboardFromGameOver = document.getElementById('view-leaderboard-from-gameover');
const callsignInput = document.getElementById('callsign-input');
const callsignSubmitBtn = document.getElementById('callsign-submit-btn');
const callsignStatus = document.getElementById('callsign-status');

const hudPilotPill = document.getElementById('hud-pilot-pill');
const hudPilotDisplay = document.getElementById('hud-pilot-display');
const leaderboardPilotInput = document.getElementById('leaderboard-pilot-input');
const leaderboardPilotSaveBtn = document.getElementById('leaderboard-pilot-save-btn');
const pilotSaveStatus = document.getElementById('pilot-save-status');

// Tactical Pause & Quit DOM Elements
const pauseBtn = document.getElementById('pause-btn');
const quitBtn = document.getElementById('quit-btn');
const pauseModal = document.getElementById('pause-modal');
const resumeBtn = document.getElementById('resume-btn');
const pauseQuitBtn = document.getElementById('pause-quit-btn');
const pauseTimeVal = document.getElementById('pause-time-val');
const pauseScoreVal = document.getElementById('pause-score-val');
const pauseKillsVal = document.getElementById('pause-kills-val');
const pauseLevelVal = document.getElementById('pause-level-val');

// Left-Side Hostile Intel Spawn Panel DOM Elements
const enemySpawnPanel = document.getElementById('enemy-spawn-panel');
const enemySpawnPill = document.getElementById('enemy-spawn-pill');
const spawnPanelToggle = document.getElementById('spawn-panel-toggle');
const enemySpawnList = document.getElementById('enemy-spawn-list');
const tabSpawnActive = document.getElementById('tab-spawn-active');
const tabSpawnAll = document.getElementById('tab-spawn-all');
const spawnActiveCount = document.getElementById('spawn-active-count');
const spawnTotalCount = document.getElementById('spawn-total-count');
const pillActiveCount = document.getElementById('pill-active-count');

let currentSpawnTab = 'active'; // 'active' or 'all'
let lastSpawnPanelUpdateSec = -1;

// Hostile Roster (Normal wave spawn pool - Ultra Boss strictly excluded)
const ENEMY_SPAWN_ROSTER = [
  {
    id: 'swarmer',
    name: 'SWARMER',
    unlockSec: 0,
    color: '#ff3366',
    role: 'Swarm Drone',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="20,12 4,5 9,12 4,19" fill="#ff3366"/><circle cx="12" cy="12" r="2" fill="#ffe600"/></svg>'
  },
  {
    id: 'striker',
    name: 'STRIKER',
    unlockSec: 0,
    color: '#9d4edd',
    role: 'Interceptor',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="#9d4edd"/><circle cx="12" cy="12" r="2.5" fill="#ffffff"/></svg>'
  },
  {
    id: 'dreadnought',
    name: 'DREADNOUGHT',
    unlockSec: 24, // > 0.4 min
    color: '#ff9100',
    role: 'Armored Cruiser',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#ff9100"/><polygon points="12,6 17,9.5 17,14.5 12,18 7,14.5 7,9.5" fill="#121926"/><circle cx="12" cy="12" r="2" fill="#ffe600"/></svg>'
  },
  {
    id: 'viper',
    name: 'VIPER',
    unlockSec: 60, // 1.0 min
    color: '#00f0ff',
    role: 'Stealth Dart',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="22,12 3,3 8,12 3,21" fill="#00f0ff"/><circle cx="11" cy="12" r="2" fill="#ffffff"/></svg>'
  },
  {
    id: 'bombard',
    name: 'BOMBARD',
    unlockSec: 120, // 2.0 min
    color: '#39ff14',
    role: 'Artillery Drone',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 21,9 18,21 6,21 3,9" fill="#39ff14"/><circle cx="12" cy="13" r="4.5" fill="#0a230a"/><circle cx="12" cy="13" r="2" fill="#ffffff"/></svg>'
  },
  {
    id: 'hydra',
    name: 'HYDRA',
    unlockSec: 180, // 3.0 min
    color: '#b5179e',
    role: 'Bio-Star Host',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 14,8 20,4 16,10 22,12 16,14 20,20 14,16 12,22 10,16 4,20 8,14 2,12 8,10 4,4 10,8" fill="#b5179e"/><circle cx="12" cy="12" r="2.5" fill="#e0aaff"/></svg>'
  },
  {
    id: 'phantom',
    name: 'PHANTOM',
    unlockSec: 240, // 4.0 min
    color: '#ffd700',
    role: 'Phase Warper',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#ffd700" stroke-width="2" stroke-dasharray="3,2"/><circle cx="12" cy="12" r="4" fill="#ffd700"/><circle cx="12" cy="12" r="1.5" fill="#ffffff"/></svg>'
  },
  {
    id: 'devourer',
    name: 'DEVOURER',
    unlockSec: 300, // 5.0 min
    color: '#e63946',
    role: 'Apex Leviathan',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 22,8 19,16 12,22 5,16 2,8" fill="#e63946"/><polygon points="12,7 17,11 15,16 12,19 9,16 7,11" fill="#200407"/><circle cx="12" cy="12" r="2" fill="#ff4d6d"/></svg>'
  }
];

const CALLSIGN_STORAGE_KEY = 'cyber_survivor_callsign';

// --- Helper Functions ---
function parseStatNumber(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const isPercent = val.includes('%');
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return isPercent ? num / 100 : num;
  }
  if (typeof val === 'object') {
    if (val.value !== undefined) return parseStatNumber(val.value);
    if (val.mult !== undefined) return parseStatNumber(val.mult);
  }
  return 0;
}

// --- Procedural Web Audio Synthesizer ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    audioToggleBtn.textContent = this.enabled ? '🔊' : '🔇';
    audioToggleBtn.style.opacity = this.enabled ? '1' : '0.5';
  }

  playShoot() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playHit() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.09);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.22);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {}
  }

  playGem() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.07);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {}
  }

  playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const freqs = [330, 440, 550, 660, 880];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.06);

        gain.gain.setValueAtTime(0.12, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.18);
      });
    } catch (e) {}
  }

  playBossAlert() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const freqs = [220, 180, 220, 160];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t + i * 0.15);

        gain.gain.setValueAtTime(0.15, t + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.15);
        osc.stop(t + i * 0.15 + 0.2);
      });
    } catch (e) {}
  }

  playLightning() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(820, t);
      osc.frequency.linearRampToValueAtTime(120, t + 0.14);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch (e) {}
  }

  playNova() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(960, t + 0.32);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch (e) {}
  }

  playGameOver() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const freqs = [350, 300, 240, 180, 120];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t + i * 0.12);

        gain.gain.setValueAtTime(0.18, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.22);
      });
    } catch (e) {}
  }

  playHealthPickup() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(1040, t + 0.18);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) {}
  }
}

const sounds = new SoundController();
document.addEventListener('click', () => sounds.init(), { once: true });
document.addEventListener('keydown', () => sounds.init(), { once: true });
audioToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sounds.init();
  sounds.toggle();
});

// Check AI Backend Connectivity
async function checkBackendAIStatus() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'healthy' && data.ai_ready) {
      aiStatusPill.className = 'ai-status-pill online';
      aiStatusText.textContent = `AI: ${(data.model || data.provider).toUpperCase()}`;
    } else {
      aiStatusPill.className = 'ai-status-pill fallback';
      aiStatusText.textContent = 'AI: FALLBACK';
    }
  } catch (e) {
    aiStatusPill.className = 'ai-status-pill fallback';
    aiStatusText.textContent = 'AI: OFFLINE';
  }
}
checkBackendAIStatus();

// --- Input Handling ---
const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyP' || e.code === 'Escape') {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      return;
    }
    // If leaderboard modal is open, ESC closes it
    if (leaderboardModal && !leaderboardModal.classList.contains('hidden')) {
      closeLeaderboardModal();
      return;
    }
    togglePause();
    return;
  }

  if (e.code === 'KeyQ') {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      return;
    }
    quitCurrentRun();
    return;
  }

  if (game.state === 'PAUSED') return;

  if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.w = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.a = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.s = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = true;
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.w = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.a = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.s = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = false;
});

// --- Entities & Systems ---

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    this.baseSpeed = 225;
    
    this.maxHealth = 100;
    this.health = 100;
    this.hpRegen = 0;
    
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 10;
    
    // Stats & Modifiers
    this.damageMult = 1.0;
    this.attackSpeedMult = 1.0;
    this.projectileCount = 1;
    this.moveSpeedMult = 1.0;
    this.baseMagnetRadius = 85;
    this.magnetRadiusMult = 1.0;

    // Combat timers
    this.baseCooldown = 0.45;
    this.attackTimer = 0;
    this.targetingRange = 560;
    
    // Invulnerability frames
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 0.5;

    // Legendary Subsystem Evolutions
    this.orbitalCount = 0;
    this.orbitalAngle = 0;
    this.hasChainLightning = false;
    this.chainLightningCooldown = 2.5;
    this.chainLightningTimer = 0;
    this.hasFrostNova = false;
    this.frostNovaCooldown = 5.5;
    this.frostNovaTimer = 0;
    this.pierceCount = 0;
    this.vampiricChance = 0;
  }

  get speed() {
    return this.baseSpeed * Math.max(0.2, Number(this.moveSpeedMult) || 1.0);
  }

  get magnetRadius() {
    return this.baseMagnetRadius * Math.max(0.5, Number(this.magnetRadiusMult) || 1.0);
  }

  update(dt, enemies, projectiles) {
    // Movement
    let dx = 0;
    let dy = 0;
    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // Keep within 1920x1280 World arena bounds
    this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, this.y));

    // Passive regeneration
    if (this.hpRegen > 0 && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + this.hpRegen * dt);
      updateHUD();
    }

    // Invulnerability countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Automatic Weapon Volley
    const currentCooldown = Math.max(0.12, this.baseCooldown / Math.max(0.2, Number(this.attackSpeedMult) || 1.0));
    this.attackTimer += dt;
    if (this.attackTimer >= currentCooldown) {
      this.attackTimer = 0;
      this.autoAttack(enemies, projectiles);
    }

    // Subsystem: Orbital Plasma Guard
    if (this.orbitalCount > 0) {
      this.orbitalAngle += dt * 3.5;
      const orbRadius = 65;
      for (let i = 0; i < this.orbitalCount; i++) {
        const a = this.orbitalAngle + (i * (Math.PI * 2 / this.orbitalCount));
        const ox = this.x + Math.cos(a) * orbRadius;
        const oy = this.y + Math.sin(a) * orbRadius;
        for (const e of enemies) {
          if (e.markedForDeletion) continue;
          if (Math.hypot(e.x - ox, e.y - oy) < e.radius + 10) {
            e.takeDamage(40 * dt * Math.max(0.5, Number(this.damageMult) || 1.0));
            spawnExplosion(ox, oy, '#00f0ff', 2);
          }
        }
      }
    }

    // Subsystem: Chain Lightning Discharge
    if (this.hasChainLightning) {
      this.chainLightningTimer -= dt;
      if (this.chainLightningTimer <= 0) {
        this.chainLightningTimer = this.chainLightningCooldown;
        this.triggerChainLightning(enemies);
      }
    }

    // Subsystem: Cryo Frost Nova
    if (this.hasFrostNova) {
      this.frostNovaTimer -= dt;
      if (this.frostNovaTimer <= 0) {
        this.frostNovaTimer = this.frostNovaCooldown;
        this.triggerFrostNova(enemies);
      }
    }
  }

  triggerChainLightning(enemies) {
    const validTargets = enemies.filter(e => !e.markedForDeletion && Math.hypot(e.x - this.x, e.y - this.y) <= 380);
    if (validTargets.length === 0) return;

    sounds.playLightning();
    validTargets.sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y));
    const chainTargets = validTargets.slice(0, 4);

    let prevX = this.x;
    let prevY = this.y;
    for (const target of chainTargets) {
      game.lightningBolts.push({
        x1: prevX, y1: prevY,
        x2: target.x, y2: target.y,
        lifespan: 0.18,
        color: '#00f0ff'
      });
      target.takeDamage(35 * Math.max(0.5, Number(this.damageMult) || 1.0));
      spawnExplosion(target.x, target.y, '#00f0ff', 6);
      prevX = target.x;
      prevY = target.y;
    }
  }

  triggerFrostNova(enemies) {
    sounds.playNova();
    game.novaRings.push({
      x: this.x, y: this.y,
      r: 0, maxR: 280,
      lifespan: 0.45,
      alpha: 1.0
    });

    for (const e of enemies) {
      if (e.markedForDeletion) continue;
      const dist = Math.hypot(e.x - this.x, e.y - this.y);
      if (dist <= 280) {
        e.slowTimer = 3.5;
        e.takeDamage(25 * Math.max(0.5, Number(this.damageMult) || 1.0));
        spawnExplosion(e.x, e.y, '#00f0ff', 4);
      }
    }
  }

  autoAttack(enemies, projectiles) {
    if (enemies.length === 0) return;

    let closestEnemy = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
      if (enemy.markedForDeletion) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < closestDist && dist <= this.targetingRange) {
        closestDist = dist;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      sounds.playShoot();
      const baseAngle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
      const count = Math.max(1, Math.min(16, Math.round(Number(this.projectileCount)) || 1));
      const safeDmg = Math.max(5, (Number(this.damageMult) || 1.0) * 25);

      if (count === 1) {
        projectiles.push(new Projectile(this.x, this.y, baseAngle, safeDmg, this.pierceCount));
      } else {
        const spreadArc = Math.min(Math.PI * 0.75, 0.22 * (count - 1));
        const startAngle = baseAngle - spreadArc / 2;
        const step = spreadArc / (count - 1);
        for (let i = 0; i < count; i++) {
          const angle = startAngle + i * step;
          projectiles.push(new Projectile(this.x, this.y, angle, safeDmg, this.pierceCount));
        }
      }
    }
  }

  takeDamage(amount) {
    if (this.invulnerableTimer > 0) return false;

    sounds.playHit();
    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = this.invulnerableDuration;
    createDamageNumber(this.x, this.y - 20, Math.round(amount), '#ff2a4b');
    updateHUD();

    if (this.health <= 0) {
      sounds.playGameOver();
      triggerGameOver();
    }
    return true;
  }

  addXP(amount) {
    sounds.playGem();
    this.xp += amount;
    game.score += amount * 10;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.round(this.xpToNext * 1.35 + 8);
      sounds.playLevelUp();
      triggerLevelUp();
    }
    updateHUD();
  }

  draw(ctx) {
    ctx.save();
    
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f0ff';

    // Ship Hull (Neon Cyan Core)
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner Core (White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Render Orbital Plasma Spheres
    if (this.orbitalCount > 0) {
      const orbRadius = 65;
      for (let i = 0; i < this.orbitalCount; i++) {
        const a = this.orbitalAngle + (i * (Math.PI * 2 / this.orbitalCount));
        const ox = this.x + Math.cos(a) * orbRadius;
        const oy = this.y + Math.sin(a) * orbRadius;
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f0ff';
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, angle, damage, pierce = 0) {
    this.x = x;
    this.y = y;
    this.speed = 520;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.radius = 4;
    this.damage = Math.max(1, Number(damage) || 25);
    this.pierceLeft = Number(pierce) || 0;
    this.hitEnemies = new Set();
    this.lifespan = 1.8;
    this.markedForDeletion = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifespan -= dt;

    if (this.lifespan <= 0 ||
        this.x < -40 || this.x > WORLD_WIDTH + 40 ||
        this.y < -40 || this.y > WORLD_HEIGHT + 40) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffe600';
    ctx.fillStyle = '#ffe600';

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Enemy Artillery Plasma Orb
class EnemyPlasmaOrb {
  constructor(x, y, angle, damage = 18, color = '#39ff14', speed = 175) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.radius = 7;
    this.damage = damage;
    this.color = color;
    this.lifespan = 5.0;
    this.markedForDeletion = false;
  }

  update(dt, player) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifespan -= dt;

    if (this.lifespan <= 0 || this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > WORLD_HEIGHT) {
      this.markedForDeletion = true;
    }

    if (Math.hypot(player.x - this.x, player.y - this.y) < player.radius + this.radius) {
      player.takeDamage(this.damage);
      this.markedForDeletion = true;
      spawnExplosion(this.x, this.y, this.color, 8);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Enemy {
  constructor(type, x, y, difficultyMultiplier, bossConfig = null) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.difficultyMultiplier = difficultyMultiplier || 1.0;
    this.angle = 0;
    this.slowTimer = 0;
    this.markedForDeletion = false;
    this.isBoss = false;
    this.splitsOnDeath = false;

    const mins = game.survivalTime / 60;
    // Speed scaling: scaled back by 15% before 10 min mark (0.05 -> 0.0425)
    const speedMult = Math.min(2.8, 1.0 + (mins <= 10 ? mins * 0.0425 : (0.425 + (mins - 10) * 0.05)));

    // Damage scaling: scaled back by 15% before 10 min mark (0.06 -> 0.051)
    let dmgScaling = 1.0;
    if (mins <= 10) {
      if (mins > 4) dmgScaling += (mins - 4) * 0.051;
    } else {
      dmgScaling += 0.306 + (mins - 10) * 0.06 + Math.max(0, (mins - 12) * 0.12);
    }

    if (type === 'boss' || bossConfig) {
      this.isBoss = true;
      const cfg = bossConfig || {};
      this.bossName = cfg.boss_name || 'TITAN LEVIATHAN';
      this.radius = 38;
      const stats = cfg.stats || {};
      this.speed = 70 * (stats.speed_mult || 1.0);

      // Base boss health calculation with compounding scaling in late and apex stages
      let baseHealth = 500 * (stats.health_mult || 4.0) * this.difficultyMultiplier;

      // Accelerated health curve matching 10+ and 20+ stacked player subsystem overclocks
      if (mins > 10) {
        const post10Tier = mins - 10;
        baseHealth *= (1.0 + post10Tier * 0.16);
      }
      if (mins > 20) {
        const post20Tier = mins - 20;
        baseHealth *= (1.0 + post20Tier * 0.35);
      }

      this.health = Math.round(baseHealth);
      this.maxHealth = this.health;
      this.damage = Math.round(40 * (stats.damage_mult || 1.8) * dmgScaling);
      this.color = cfg.color || '#ff0055';
      this.xpValue = 50;
    } else if (type === 'swarmer') {
      this.radius = 12;
      this.speed = 140 * (1 + speedMult * 0.04);
      this.health = 20 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(12 * dmgScaling);
      this.color = '#ff3366';
      this.xpValue = 1;
    } else if (type === 'striker') {
      this.radius = 16;
      this.speed = 105 * (1 + speedMult * 0.035);
      this.health = 50 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(22 * dmgScaling);
      this.color = '#9d4edd';
      this.xpValue = 3;
    } else if (type === 'dreadnought') {
      this.radius = 26;
      this.speed = 65 * (1 + speedMult * 0.025);
      this.health = 160 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(38 * dmgScaling);
      this.color = '#ff9100';
      this.xpValue = 8;
    } else if (type === 'viper') { // Unlocks after Boss 1 (Minute 1+)
      this.radius = 14;
      this.speed = 175 * (1 + speedMult * 0.03);
      this.health = 55 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(10 * dmgScaling); // Halved damage from 20 to 10
      this.color = '#00f0ff';
      this.xpValue = 4;
      this.dashTimer = 1.5 + Math.random() * 0.8;
      this.isDashing = false;
      this.dashDuration = 0;
      this.dashAngle = 0;
    } else if (type === 'bombard') { // Unlocks after Boss 2 (Minute 2+)
      this.radius = 22;
      this.speed = 60 * (1 + speedMult * 0.025);
      this.health = 140 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(25 * dmgScaling);
      this.color = '#39ff14';
      this.xpValue = 7;
      this.shootCooldown = Math.max(1.6, 3.2 - mins * 0.08);
      this.shootTimer = 1.0 + Math.random() * 1.5;
    } else if (type === 'hydra') { // Unlocks after Boss 3 (Minute 3+)
      this.radius = 24;
      this.speed = 85 * (1 + speedMult * 0.025);
      this.health = 190 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(32 * dmgScaling);
      this.color = '#b5179e';
      this.xpValue = 9;
      this.splitsOnDeath = true;
    } else if (type === 'hydra_spore') { // Spawned when Hydra dies
      this.radius = 10;
      this.speed = 155 * (1 + speedMult * 0.03);
      this.health = 35 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(14 * dmgScaling);
      this.color = '#e0aaff';
      this.xpValue = 2;
    } else if (type === 'phantom') { // Unlocks after Boss 4 (Minute 4+)
      this.radius = 18;
      this.speed = 100 * (1 + speedMult * 0.025);
      this.health = 160 * this.difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = Math.round(32 * dmgScaling);
      this.color = '#ffd700';
      this.xpValue = 10;
      this.warpCooldown = Math.max(1.5, 3.0 - mins * 0.06);
      this.warpTimer = 1.5 + Math.random() * 1.5;
    } else if (type === 'devourer') { // Unlocks after Boss 5 (Minute 5+) - Normal spawning elite wave enemy
      this.isBoss = false;
      this.enemyName = 'ABYSSAL DEVOURER';
      this.radius = 32;
      this.speed = 55 * (1 + speedMult * 0.02);
      let devourerHealth = 460 * this.difficultyMultiplier;
      if (mins > 8) {
        devourerHealth *= (1.0 + (mins - 8) * 0.16);
      }
      this.health = Math.round(devourerHealth);
      this.maxHealth = this.health;
      this.damage = Math.round(50 * dmgScaling);
      this.color = '#e63946';
      this.xpValue = 35;
    } else if (type === 'colossus') { // Ultra Boss at 10 min mark, or normal wave spawn starting at 20 min mark
      const isBossEncounter = (bossConfig || this.isBoss || this.isUltraBoss);
      if (isBossEncounter) {
        this.isBoss = true;
        this.isUltraBoss = true;
        this.bossName = 'VOID COLOSSUS OMEGA';
        this.radius = 48;
        this.speed = 68;
        const stats = (bossConfig && bossConfig.stats) ? bossConfig.stats : {};
        let colossusHealth = 500 * (stats.health_mult || 8.5) * this.difficultyMultiplier;
        if (mins > 10) {
          colossusHealth *= (1.0 + (mins - 10) * 0.16);
        }
        if (mins > 20) {
          colossusHealth *= (1.0 + (mins - 20) * 0.35);
        }
        this.health = Math.round(colossusHealth);
        this.maxHealth = this.health;
        this.damage = Math.round(55 * (stats.damage_mult || 2.2) * dmgScaling);
        this.color = '#b5179e';
        this.xpValue = 100;
      } else {
        // Normal wave spawn (Unlocked at Minute 20+)
        this.isBoss = false;
        this.isUltraBoss = false;
        this.enemyName = 'VOID COLOSSUS';
        this.radius = 38;
        this.speed = 58 * (1 + speedMult * 0.02);
        let colossusHealth = 780 * this.difficultyMultiplier;
        if (mins > 20) {
          colossusHealth *= (1.0 + (mins - 20) * 0.15);
        }
        this.health = Math.round(colossusHealth);
        this.maxHealth = this.health;
        this.damage = Math.round(58 * dmgScaling);
        this.color = '#7209b7';
        this.xpValue = 45;
      }
    }
  }

  update(dt, player) {
    let effectiveSpeed = this.speed;
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      effectiveSpeed *= 0.55;
    }

    // Special behavior: Viper straight-line lightning dart
    if (this.type === 'viper') {
      if (this.isDashing) {
        this.dashDuration -= dt;
        effectiveSpeed *= 2.6;
        // Lock straight line heading: do not re-calculate angle towards player
        this.angle = this.dashAngle;
        spawnExplosion(this.x, this.y, '#00f0ff', 1);
        if (this.dashDuration <= 0) {
          this.isDashing = false;
        }
      } else {
        // Track player normally when outside darting phase
        this.angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.dashTimer -= dt;
        if (this.dashTimer <= 0) {
          this.dashTimer = 1.8 + Math.random() * 0.5; // Lowered ability use time / cooldown
          this.isDashing = true;
          this.dashDuration = 0.35; // Lowered dart duration for a swift, crisp dash
          this.dashAngle = Math.atan2(player.y - this.y, player.x - this.x);
          this.angle = this.dashAngle;
        }
      }
    } else {
      this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    }

    // Special behavior: Bombard artillery plasma fire
    if (this.type === 'bombard') {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = this.shootCooldown;
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        game.enemyProjectiles.push(new EnemyPlasmaOrb(this.x, this.y, angleToPlayer, Math.round(this.damage * 0.75), '#39ff14', 180));
      }
    }

    // Special behavior: Encounter Boss Artillery Plasma Barrage
    if (this.isBoss) {
      if (this.bossShootTimer === undefined) {
        this.bossShootTimer = 2.0;
      }
      this.bossShootTimer -= dt;
      if (this.bossShootTimer <= 0) {
        const mins = game.survivalTime / 60;
        this.bossShootTimer = Math.max(1.1, 2.5 - mins * 0.05);
        const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
        const orbDamage = Math.round(this.damage * 0.55);

        if (this.isUltraBoss || mins >= 18) {
          // 5-way spread barrage for Ultra Boss & deep endgame
          [-0.38, -0.19, 0, 0.19, 0.38].forEach(offset => {
            game.enemyProjectiles.push(new EnemyPlasmaOrb(this.x, this.y, baseAngle + offset, orbDamage, this.isUltraBoss ? '#ff007f' : this.color, 220));
          });
        } else if (mins >= 10) {
          // 3-way spread barrage in late game
          [-0.24, 0, 0.24].forEach(offset => {
            game.enemyProjectiles.push(new EnemyPlasmaOrb(this.x, this.y, baseAngle + offset, orbDamage, this.color, 195));
          });
        } else {
          // Focused heavy plasma shot
          game.enemyProjectiles.push(new EnemyPlasmaOrb(this.x, this.y, baseAngle, orbDamage, this.color, 180));
        }
      }
    }

    // Special behavior: Normal wave Void Colossus dark artillery (Minute 20+)
    if (this.type === 'colossus' && !this.isBoss) {
      if (this.shootTimer === undefined) this.shootTimer = 2.0;
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 3.2;
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        game.enemyProjectiles.push(new EnemyPlasmaOrb(this.x, this.y, angleToPlayer, Math.round(this.damage * 0.7), '#b5179e', 185));
      }
    }

    // Special behavior: Warp Phantom phase blink
    if (this.type === 'phantom') {
      this.warpTimer -= dt;
      if (this.warpTimer <= 0) {
        this.warpTimer = this.warpCooldown;
        spawnExplosion(this.x, this.y, '#ffd700', 6);
        const a = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(a) * 85;
        this.y += Math.sin(a) * 85;
        spawnExplosion(this.x, this.y, '#ffd700', 6);
      }
    }

    this.x += Math.cos(this.angle) * effectiveSpeed * dt;
    this.y += Math.sin(this.angle) * effectiveSpeed * dt;

    // Check collision with player
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < this.radius + player.radius) {
      player.takeDamage(this.damage);
    }
  }

  takeDamage(amount) {
    const safeAmount = Math.max(1, Number(amount) || 1);
    this.health -= safeAmount;
    createDamageNumber(this.x, this.y - 12, Math.round(safeAmount), '#ffffff');

    if (this.health <= 0) {
      this.markedForDeletion = true;
      sounds.playExplosion();
      // Only actual scheduled encounter bosses drop boss artifacts, health cores, and mega XP clusters
      const isBossType = (this.type === 'boss' || this.isUltraBoss) && this.isBoss;
      spawnExplosion(this.x, this.y, this.color, isBossType ? (this.isUltraBoss ? 75 : 50) : (this.type === 'colossus' ? 35 : (this.type === 'devourer' ? 24 : 12)));
      game.kills += 1;
      game.score += isBossType ? (this.isUltraBoss ? 10000 : 3500) : (this.xpValue * 25);

      // Hydra splits into two spores upon death
      if (this.splitsOnDeath) {
        game.enemies.push(new Enemy('hydra_spore', this.x - 12, this.y - 12, this.difficultyMultiplier));
        game.enemies.push(new Enemy('hydra_spore', this.x + 12, this.y + 12, this.difficultyMultiplier));
      }

      // Vampiric health leech
      if (game.player && game.player.vampiricChance > 0 && Math.random() < game.player.vampiricChance) {
        game.player.health = Math.min(game.player.maxHealth, game.player.health + 2);
        createDamageNumber(game.player.x, game.player.y - 20, '+2 HP', '#00ff88');
      }

      // ONLY ACTUAL SCHEDULED ENCOUNTER BOSSES DROP LEGENDARY ARTIFACT + HEALTH CORE + XP CLUSTER
      if (isBossType) {
        game.bossesDefeated = (game.bossesDefeated || 0) + 1;
        const bossNum = this.bossMinute || game.bossesDefeated;
        const isPostTen = (this.bossMinute ? this.bossMinute > 10 : (game.bossesDefeated > 10)) || (game.bossesDefeated > 10);
        game.artifacts.push(new BossArtifact(this.x, this.y, isPostTen));

        // Health drops: guaranteed for first 10 bosses; after first 10, only every 10th boss drops healing (20, 30, 40...)
        const shouldDropHealth = (bossNum <= 10) || (bossNum % 10 === 0);
        if (shouldDropHealth && game.healthDrops) {
          const healAmount = bossNum >= 20 ? 50 : 40;
          game.healthDrops.push(new HealthDrop(this.x, this.y, healAmount));
          if (bossNum >= 20) {
            createDamageNumber(this.x, this.y - 52, `💚 MILESTONE RECOVERY CORE (+${healAmount} HP)`, '#00ff88');
          }
        }

        for (let i = 0; i < 16; i++) {
          const offsetX = (Math.random() - 0.5) * 80;
          const offsetY = (Math.random() - 0.5) * 80;
          game.gems.push(new XpGem(this.x + offsetX, this.y + offsetY, 8));
        }
        if (isPostTen) {
          createDamageNumber(this.x, this.y - 32, '⚡ STAT OVERCLOCK CORE DROPPED! ⚡', '#00f0ff');
        } else {
          createDamageNumber(this.x, this.y - 32, '★ BOSS CORE ARTIFACT DROPPED! ★', '#ffd700');
        }
        sounds.playBossAlert();
      } else {
        // Normal enemy drops: standard mobs drop an XP gem, but normal spawning devourers and normal colossus drop NOTHING!
        if (this.type !== 'devourer' && this.type !== 'colossus') {
          game.gems.push(new XpGem(this.x, this.y, this.xpValue));
        }
      }
      updateHUD();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.slowTimer > 0) {
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#00f0ff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.isBoss) {
      if (this.isUltraBoss) {
        // Grand Ultra Boss rendering: Triple rotating dark-energy rings & void singularity
        ctx.shadowBlur = 32;
        ctx.shadowColor = '#b5179e';

        // Outer counter-rotating runic spikes
        ctx.save();
        ctx.rotate(-Date.now() / 420);
        ctx.strokeStyle = '#b5179e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        const outerSpikes = 12;
        for (let i = 0; i < outerSpikes * 2; i++) {
          const r = (i % 2 === 0) ? this.radius * 1.4 : this.radius * 1.05;
          const a = (i * Math.PI) / outerSpikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Middle energy vortex
        ctx.save();
        ctx.rotate(Date.now() / 260);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-this.radius * 0.85, -this.radius * 0.85, this.radius * 1.7, this.radius * 1.7);
        ctx.restore();

        // Dark matter core
        ctx.fillStyle = '#06010a';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Pulsating magenta singularity
        const pulse = 1 + Math.sin(Date.now() / 90) * 0.25;
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.45 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Ultra Boss Name Banner
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText('👑 ' + this.bossName + ' 👑', 0, -this.radius - 18);
      } else {
        ctx.shadowBlur = 24;
        ctx.shadowColor = this.color;

        ctx.save();
        ctx.rotate(Date.now() / 350);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const spikes = 8;
        for (let i = 0; i < spikes * 2; i++) {
          const r = (i % 2 === 0) ? this.radius * 1.35 : this.radius * 0.95;
          const a = (i * Math.PI) / spikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#180e29';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const px = Math.cos(a) * this.radius;
          const py = Math.sin(a) * this.radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const pulse = 1 + Math.sin(Date.now() / 120) * 0.2;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.45 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.bossName, 0, -this.radius - 16);
      }

    } else if (this.type === 'swarmer') {
      ctx.rotate(this.angle);
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.moveTo(this.radius * 1.3, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.85);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.lineTo(-this.radius, this.radius * 0.85);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.5, 0, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'striker') {
      ctx.rotate(this.angle + (Date.now() / 180));
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      const r1 = this.radius * 1.25;
      const r2 = this.radius * 0.42;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        const a2 = a + Math.PI / 4;
        ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'dreadnought') {
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * this.radius;
        const py = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.rotate(Date.now() / 450);
      ctx.fillStyle = '#121926';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.lineTo(Math.cos(a) * (this.radius * 0.6), Math.sin(a) * (this.radius * 0.6));
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'viper') {
      // Chevron Stealth Dart
      ctx.rotate(this.angle);
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.moveTo(this.radius * 1.4, 0);
      ctx.lineTo(-this.radius, -this.radius);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.lineTo(-this.radius, this.radius);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'bombard') {
      // Heavy Green Pentagon Artillery Drone
      ctx.shadowBlur = 14;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(a) * this.radius;
        const py = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0a230a';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'hydra') {
      // 8-Pointed Deep Violet Star
      ctx.rotate(Date.now() / 400);
      ctx.shadowBlur = 14;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 === 0 ? this.radius * 1.25 : this.radius * 0.55;
        const a = (i * Math.PI) / 8;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'hydra_spore') {
      ctx.rotate(this.angle);
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.moveTo(this.radius * 1.3, 0);
      ctx.lineTo(0, this.radius * 0.6);
      ctx.lineTo(-this.radius, 0);
      ctx.lineTo(0, -this.radius * 0.6);
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'phantom') {
      // Gold & Silver Phasing Rhombus
      ctx.rotate(Date.now() / 250);
      ctx.shadowBlur = 16;
      ctx.shadowColor = this.color;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-this.radius * 0.7, -this.radius * 0.7, this.radius * 1.4, this.radius * 1.4);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.7, this.radius * 0.7);

    } else if (this.type === 'devourer') {
      // Crimson Vortex Glyph with Black Hole Center
      ctx.shadowBlur = 22;
      ctx.shadowColor = this.color;
      ctx.save();
      ctx.rotate(Date.now() / 300);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        const r = i % 2 === 0 ? this.radius * 1.3 : this.radius * 0.75;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#050208';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

    } else if (this.type === 'colossus') {
      // Normal wave Void Colossus (Minute 20+): Rotating hex barrier with pulsating singularity
      ctx.shadowBlur = 24;
      ctx.shadowColor = this.color;
      ctx.save();
      ctx.rotate(Date.now() / 320);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * this.radius * 1.15;
        const py = Math.sin(a) * this.radius * 1.15;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.rotate(-Date.now() / 200);
      ctx.fillStyle = '#10002b';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + Math.PI / 6;
        const px = Math.cos(a) * this.radius * 0.85;
        const py = Math.sin(a) * this.radius * 0.85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar above enemy
    if (this.health < this.maxHealth) {
      const barW = this.radius * 2;
      const barH = 3.5;
      const hpPct = Math.max(0, this.health / this.maxHealth);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-barW / 2, -this.radius - 8, barW, barH);

      ctx.fillStyle = this.color;
      ctx.fillRect(-barW / 2, -this.radius - 8, barW * hpPct, barH);
    }

    ctx.restore();
  }
}

class BossArtifact {
  constructor(x, y, isAutoUpgrade = false) {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.isAutoUpgrade = isAutoUpgrade;
    this.collected = false;
    this.rotation = 0;
    this.floatTimer = 0;
    this.age = 0;
  }

  update(dt, player) {
    this.rotation += dt * 2.5;
    this.floatTimer += dt * 4;
    this.age += dt;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    // Magnet pull: active within magnet radius, and gently glides towards player after 4s so drops are never lost
    const effectiveMagnetDist = Math.max(player.magnetRadius * 2.0, this.age > 4.0 ? 9999 : 0);
    if (dist <= effectiveMagnetDist) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const magnetSpeed = this.age > 4.0 ? 320 : 440;
      this.x += Math.cos(angle) * magnetSpeed * dt;
      this.y += Math.sin(angle) * magnetSpeed * dt;
    }

    if (dist < player.radius + this.radius) {
      this.collected = true;
      if (this.isAutoUpgrade) {
        grantRandomBossStatUpgrade(player);
      } else {
        sounds.playLevelUp();
        triggerBossReward();
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(this.floatTimer) * 4);

    const beamColor = this.isAutoUpgrade ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 215, 0, 0.35)';
    const ringColor = this.isAutoUpgrade ? '#00f0ff' : '#ffd700';
    const innerColor = this.isAutoUpgrade ? '#ff0077' : '#ff9100';

    // High-altitude beacon beam shooting upward into the sky
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(0, 120);
    ctx.stroke();

    // Outer rotating diamond ring
    ctx.rotate(this.rotation);
    ctx.shadowBlur = 22;
    ctx.shadowColor = ringColor;
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-14, -14, 28, 28);

    // Inner counter-rotating diamond
    ctx.rotate(-this.rotation * 2);
    ctx.fillStyle = innerColor;
    ctx.fillRect(-8, -8, 16, 16);

    // Core pearl
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class HealthDrop {
  constructor(x, y, healAmount = 40) {
    this.x = x;
    this.y = y;
    this.healAmount = healAmount;
    this.radius = 14;
    this.collected = false;
    this.floatTimer = Math.random() * Math.PI;
    this.age = 0;
  }

  update(dt, player) {
    this.floatTimer += dt * 4;
    this.age += dt;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    const effectiveMagnetDist = Math.max(player.magnetRadius * 1.8, this.age > 4.0 ? 9999 : 0);
    if (dist <= effectiveMagnetDist) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const magnetSpeed = this.age > 4.0 ? 300 : 400;
      this.x += Math.cos(angle) * magnetSpeed * dt;
      this.y += Math.sin(angle) * magnetSpeed * dt;
    }

    if (dist < player.radius + this.radius) {
      this.collected = true;
      player.health = Math.min(player.maxHealth, player.health + this.healAmount);
      sounds.playHealthPickup();
      createDamageNumber(player.x, player.y - 20, `+${this.healAmount} HP`, '#00ff88');
      updateHUD();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(this.floatTimer) * 3);

    // Glowing green aura
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00ff88';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
    ctx.fill();

    // Container circle
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Medical Cross (+)
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(-3, -8, 6, 16);
    ctx.fillRect(-8, -3, 16, 6);

    ctx.restore();
  }
}

class XpGem {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.radius = Math.min(8, 3.5 + value * 0.8);
    this.markedForDeletion = false;
    this.color = value >= 8 ? '#00f0ff' : (value >= 3 ? '#9d4edd' : '#00ff88');
  }

  update(dt, player) {
    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    if (dist <= player.magnetRadius) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const magnetSpeed = 340 + (player.magnetRadius - dist) * 1.5;
      this.x += Math.cos(angle) * magnetSpeed * dt;
      this.y += Math.sin(angle) * magnetSpeed * dt;
    }

    if (dist < player.radius + this.radius) {
      this.markedForDeletion = true;
      player.addXP(this.value);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// --- Visual Effects & Particles ---
const particles = [];
const damageNumbers = [];

function spawnExplosion(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 150;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      radius: 2 + Math.random() * 2.5,
      lifespan: 0.35 + Math.random() * 0.3,
      alpha: 1
    });
  }
}

function createDamageNumber(x, y, text, color) {
  let safeText = String(text);
  if (safeText === 'NaN' || safeText.includes('NaN')) safeText = '25';
  damageNumbers.push({
    x: x + (Math.random() * 14 - 7),
    y,
    text: safeText,
    color,
    lifespan: 0.6,
    vy: -40
  });
}

// --- Game State Manager ---
const game = {
  player: null,
  projectiles: [],
  enemyProjectiles: [],
  enemies: [],
  gems: [],
  artifacts: [],
  healthDrops: [],
  lightningBolts: [],
  novaRings: [],
  spawnTimer: 0,
  spawnInterval: 1.2,
  spawnPauseTimer: 0,
  survivalTime: 0,
  score: 0,
  kills: 0,
  bossSpawnedAt: {},
  bossesDefeated: 0,
  state: 'PLAYING',
  lastTimestamp: 0
};

function initGame() {
  game.player = new Player(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  camera.x = WORLD_WIDTH / 2 - camera.width / 2;
  camera.y = WORLD_HEIGHT / 2 - camera.height / 2;

  game.projectiles = [];
  game.enemyProjectiles = [];
  game.enemies = [];
  game.gems = [];
  game.artifacts = [];
  game.healthDrops = [];
  game.lightningBolts = [];
  game.novaRings = [];
  particles.length = 0;
  damageNumbers.length = 0;
  
  game.spawnTimer = 0;
  game.spawnInterval = 1.2;
  game.spawnPauseTimer = 0;
  game.survivalTime = 0;
  game.score = 0;
  game.kills = 0;
  game.bossSpawnedAt = {};
  game.bossesDefeated = 0;
  game.state = 'PLAYING';
  game.lastTimestamp = performance.now();

  eventBanner.classList.add('hidden');
  levelUpModal.classList.add('hidden');
  if (bossRewardModal) bossRewardModal.classList.add('hidden');
  if (pauseModal) pauseModal.classList.add('hidden');
  if (pauseBtn) {
    pauseBtn.textContent = '⏸️';
    pauseBtn.classList.remove('active');
    pauseBtn.setAttribute('title', 'Pause Game [P / ESC]');
  }
  gameOverModal.classList.add('hidden');

  lastSpawnPanelUpdateSec = -1;
  updateEnemySpawnPanel(true);
  updateHUD();
}

function spawnEnemyWave() {
  // Spawn in a perimeter around the current camera viewport
  const pad = 60;
  const left = Math.max(0, camera.x - pad);
  const right = Math.min(WORLD_WIDTH, camera.x + camera.width + pad);
  const top = Math.max(0, camera.y - pad);
  const bottom = Math.min(WORLD_HEIGHT, camera.y + camera.height + pad);

  const minutes = game.survivalTime / 60;
  // Dynamic health scaling: scaled back by 15% before 10 min mark, aggressive surge in late/end-game
  let difficultyMult = 1.0;
  if (minutes <= 10) {
    // 15% reduced scaling rates before 10 min mark (0.8 -> 0.68, 0.6 -> 0.51, 1.6 -> 1.36)
    difficultyMult += minutes * 0.68;
    if (minutes > 3) difficultyMult += (minutes - 3) * 0.51;
    if (minutes > 8) difficultyMult += (minutes - 8) * 1.36;
  } else {
    // Exactly continuous at 10m (13.09 accumulated), then escalates into late/apex stages
    difficultyMult += 13.09 + (minutes - 10) * 3.0;
    if (minutes > 14) difficultyMult += (minutes - 14) * 3.6;
    if (minutes > 20) difficultyMult += (minutes - 20) * 8.0;
  }

  // Progressive enemy roster based on minute / boss progression:
  // Progressive enemy roster based on minute / boss progression:
  let eligible = ['swarmer', 'swarmer', 'striker'];
  if (minutes > 0.4) eligible.push('dreadnought');

  // Progressive unlocks after each boss:
  if (minutes >= 1.0) eligible.push('viper', 'viper'); // Unlocked after Boss 1
  if (minutes >= 2.0) eligible.push('bombard');        // Unlocked after Boss 2
  if (minutes >= 3.0) eligible.push('hydra');          // Unlocked after Boss 3
  if (minutes >= 4.0) eligible.push('phantom');        // Unlocked after Boss 4
  if (minutes >= 5.0) eligible.push('devourer');       // Unlocked after Boss 5
  // Ultra Boss only unlocks as a normal wave mob starting at the 20 min mark:
  if (minutes >= 20.0) eligible.push('colossus');      // Unlocked at Minute 20+

  // End-game horde density: spawn clusters of foes to pressure high-powered player builds
  let spawnCount = 1;
  if (minutes >= 3) spawnCount = Math.random() < 0.45 ? 2 : 1;
  if (minutes >= 7) spawnCount = Math.floor(2 + Math.random() * 2);      // 2 - 3 enemies
  if (minutes >= 11) spawnCount = Math.floor(3 + Math.random() * 2);     // 3 - 4 enemies
  if (minutes >= 15) spawnCount = Math.floor(4 + Math.random() * 3);     // 4 - 6 enemies
  if (minutes >= 20) spawnCount = Math.floor(6 + Math.random() * 4);     // 6 - 9 enemies!

  for (let s = 0; s < spawnCount; s++) {
    let x, y;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) { x = left + Math.random() * (right - left); y = top; }
    else if (edge === 1) { x = right; y = top + Math.random() * (bottom - top); }
    else if (edge === 2) { x = left + Math.random() * (right - left); y = bottom; }
    else { x = left; y = top + Math.random() * (bottom - top); }

    const jitterX = (Math.random() - 0.5) * 45;
    const jitterY = (Math.random() - 0.5) * 45;
    const finalX = Math.max(12, Math.min(WORLD_WIDTH - 12, x + jitterX));
    const finalY = Math.max(12, Math.min(WORLD_HEIGHT - 12, y + jitterY));

    const type = eligible[Math.floor(Math.random() * eligible.length)];
    game.enemies.push(new Enemy(type, finalX, finalY, difficultyMult));
  }
}

// Trigger dynamic AI Boss Encounter
async function triggerBossEncounter(minuteMark) {
  sounds.playBossAlert();

  const isUltraBossMark = (minuteMark === 10);
  let bossConfig = null;

  if (isUltraBossMark) {
    // Minute 10 Special Ultra Boss: Halts all other enemy spawns for 10 seconds
    bossConfig = {
      boss_name: "VOID COLOSSUS OMEGA",
      title: "Category V Ultra Boss",
      transmission: "DIMENSIONAL COLLAPSE DETECTED. ALL AUXILIARY UNITS RETREATING. FACE EXTINCTION.",
      color: "#b5179e",
      stats: { health_mult: 8.5, speed_mult: 0.95, damage_mult: 2.2 }
    };
    // Freeze all other spawns for 10 seconds
    game.spawnPauseTimer = 10.0;
  } else {
    try {
      const res = await fetch('/api/generate-boss-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survival_time: game.survivalTime,
          level: game.player.level
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data && data.event) {
        bossConfig = data.event;
      } else {
        throw new Error('No event object in response');
      }
    } catch (err) {
      const extraHpMult = minuteMark > 20 ? (minuteMark - 20) * 1.5 : 0;
      bossConfig = {
        boss_name: minuteMark > 20 ? `APEX TITAN MK-${minuteMark}` : `TITAN MARK-${minuteMark}`,
        title: minuteMark > 20 ? "Apex Dreadnought Anomaly" : "Core Anomaly",
        transmission: minuteMark > 20 ? "CRITICAL ALERT: APEX DREADNOUGHT ANOMALY ENGAGED." : "HOSTILE VECTOR DETECTED. INITIATING TARGET ELIMINATION.",
        color: minuteMark > 20 ? "#ff0077" : "#ff0055",
        stats: { health_mult: 4.0 + (minuteMark <= 10 ? minuteMark * 0.68 : (6.8 + (minuteMark - 10) * 0.8)) + extraHpMult, speed_mult: 0.9, damage_mult: 1.8 }
      };
    }
  }

  // Display Event Banner
  if (eventTagTitle) {
    eventTagTitle.textContent = isUltraBossMark
      ? "⚠️ ULTRA BOSS IMMINENT (MINUTE 10)"
      : `${(bossConfig.title || (minuteMark > 20 ? 'APEX DREADNOUGHT' : 'CRITICAL ANOMALY')).toUpperCase()} (BOSS ${minuteMark})`;
  }
  if (eventBossName) eventBossName.textContent = bossConfig.boss_name;
  if (eventTransmission) {
    eventTransmission.textContent = isUltraBossMark
      ? `"${bossConfig.transmission} [REINFORCEMENTS HALTED: 10s]"`
      : `"${bossConfig.transmission || 'PURGING INTRUDER ANOMALY.'}"`;
  }
  if (eventBanner) {
    eventBanner.classList.remove('hidden');
    setTimeout(() => {
      eventBanner.classList.add('hidden');
    }, isUltraBossMark ? 6000 : 4500);
  }

  // Spawn Boss Enemy descending from above current camera
  const spawnX = Math.max(80, Math.min(WORLD_WIDTH - 80, camera.x + camera.width / 2));
  const spawnY = Math.max(40, camera.y - 50);

  // Scaled boss difficulty progression: scaled back by 15% before 10 min mark (0.8 -> 0.68), with massive end-game scaling post-10
  let bossDifficulty = 1.0;
  if (minuteMark <= 10) {
    bossDifficulty += (minuteMark - 1) * 0.68;
  } else {
    bossDifficulty += 6.12 + (minuteMark - 10) * 1.5;
  }
  if (minuteMark > 15) {
    bossDifficulty += (minuteMark - 15) * 3.0;
  }
  if (minuteMark > 20) {
    bossDifficulty += (minuteMark - 20) * 6.5;
  }

  const spawnType = isUltraBossMark ? 'colossus' : 'boss';
  const bossEnemy = new Enemy(spawnType, spawnX, spawnY, bossDifficulty, bossConfig);
  bossEnemy.bossMinute = minuteMark;
  game.enemies.push(bossEnemy);

  // In mid & late game, bosses arrive with an elite strike wing escort (EXCEPT Minute 10 Ultra Boss which stops all other spawns for 10s)
  if (minuteMark >= 5 && !isUltraBossMark) {
    const escortCount = Math.min(8, Math.floor((minuteMark - 3) * 0.8));
    for (let i = 0; i < escortCount; i++) {
      const escortType = minuteMark >= 15 ? (Math.random() < 0.5 ? 'phantom' : 'bombard') : (Math.random() < 0.5 ? 'viper' : 'striker');
      const offsetAngle = (i / escortCount) * Math.PI * 2;
      const ex = Math.max(20, Math.min(WORLD_WIDTH - 20, spawnX + Math.cos(offsetAngle) * 65));
      const ey = Math.max(20, Math.min(WORLD_HEIGHT - 20, spawnY + Math.sin(offsetAngle) * 65));
      game.enemies.push(new Enemy(escortType, ex, ey, bossDifficulty * 0.65));
    }
  }
}

// --- HUD & UI Updates ---
function updateHUD() {
  if (!game.player) return;

  const hpPct = Math.max(0, (game.player.health / game.player.maxHealth) * 100);
  healthFill.style.width = `${hpPct}%`;
  healthText.textContent = `${Math.ceil(game.player.health)} / ${game.player.maxHealth}`;

  const xpPct = Math.min(100, (game.player.xp / game.player.xpToNext) * 100);
  xpFill.style.width = `${xpPct}%`;
  playerLevelDisplay.textContent = game.player.level;

  const mins = Math.floor(game.survivalTime / 60);
  const secs = Math.floor(game.survivalTime % 60);
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Top Score real-time check & persistence
  if (game.score > playerTopScore) {
    playerTopScore = game.score;
    try {
      localStorage.setItem(TOP_SCORE_KEY, playerTopScore.toString());
    } catch (e) {}
  }
  if (topScoreDisplay) topScoreDisplay.textContent = playerTopScore;
  scoreDisplay.textContent = game.score;
  killsDisplay.textContent = game.kills;

  // Real-time update for Left-Side Hostile Intel Panel
  updateEnemySpawnPanel();
}

// Render & update Left-Side Hostile Intel Panel (Ultra Boss strictly excluded)
function updateEnemySpawnPanel(force = false) {
  if (!enemySpawnList) return;
  const currentSec = Math.floor(game.survivalTime);
  if (!force && currentSec === lastSpawnPanelUpdateSec) return;
  lastSpawnPanelUpdateSec = currentSec;

  let activeCount = 0;
  const items = [];

  for (const enemy of ENEMY_SPAWN_ROSTER) {
    const isUnlocked = currentSec >= enemy.unlockSec;
    if (isUnlocked) activeCount++;

    if (currentSpawnTab === 'active' && !isUnlocked) {
      continue;
    }

    const formatUnlockTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `@ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const statusBadge = isUnlocked
      ? `<span class="badge-status active">CAN SPAWN</span>`
      : `<span class="badge-status locked">${formatUnlockTime(enemy.unlockSec)}</span>`;

    const cardClass = isUnlocked ? 'enemy-spawn-card active' : 'enemy-spawn-card locked';
    const borderStyle = isUnlocked ? `border-left-color: ${enemy.color};` : '';

    items.push(`
      <div class="${cardClass}" style="${borderStyle}">
        <div class="enemy-card-icon-wrap">${enemy.svg}</div>
        <div class="enemy-card-info">
          <div class="enemy-card-name" style="color: ${enemy.color};">${enemy.name}</div>
          <div class="enemy-card-role">${enemy.role}</div>
        </div>
        <div class="enemy-card-status">${statusBadge}</div>
      </div>
    `);
  }

  enemySpawnList.innerHTML = items.join('');
  if (spawnActiveCount) spawnActiveCount.textContent = activeCount;
  if (spawnTotalCount) spawnTotalCount.textContent = ENEMY_SPAWN_ROSTER.length;
  if (pillActiveCount) pillActiveCount.textContent = activeCount;
}

// --- Upgrade System & AI API Integration ---
async function triggerLevelUp() {
  game.state = 'LEVEL_UP';
  levelUpModal.classList.remove('hidden');
  upgradeCardsContainer.innerHTML = '<div style="grid-column: 1 / -1; padding: 25px; font-family: Orbitron; font-size: 14px; letter-spacing: 2px; color: var(--accent-cyan);">🤖 NEURAL SYNTHESIS IN PROGRESS...</div>';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const payload = {
      level: game.player.level,
      stats: {
        damage: `${Math.round(game.player.damageMult * 100)}%`,
        attack_speed: `${Math.round(game.player.attackSpeedMult * 100)}%`,
        projectiles: game.player.projectileCount,
        speed: `${Math.round(game.player.moveSpeedMult * 100)}%`,
        health: `${Math.round(game.player.health)}/${game.player.maxHealth}`
      }
    };

    const response = await fetch('/api/generate-upgrades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.source === 'gemini') {
      aiBadge.textContent = `🤖 GEMINI AI (${(data.model || 'gemini-3.5-flash-lite').toUpperCase()})`;
    } else if (data.source === 'openai') {
      aiBadge.textContent = `🤖 OPENAI (${(data.model || 'gpt-4o-mini').toUpperCase()})`;
    } else {
      aiBadge.textContent = '⚡ TACTICAL FALLBACK PROTOCOL';
    }
    renderUpgradeChoices(data.upgrades);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Backend API request failed or timed out, using emergency local upgrades:', err);
    aiBadge.textContent = '⚡ OFFLINE BACKUP PROTOCOL';
    renderUpgradeChoices(getLocalFallbackUpgrades());
  }
}

function getLocalFallbackUpgrades() {
  const localPool = [
    { id: 'rapid_fire', name: 'Overclocked Capacitors', description: 'Increases weapon attack speed by 25%.', icon: '⚡', stats: { attack_speed: 0.25 } },
    { id: 'plasma_multishot', name: 'Twin Spark Spread', description: 'Fires +1 additional projectile per volley.', icon: '💥', stats: { projectile_count: 1 } },
    { id: 'dense_rounds', name: 'Depleted Uranium Slugs', description: 'Increases projectile damage by 30%.', icon: '🎯', stats: { damage: 0.30 } },
    { id: 'nanite_repair', name: 'Nanite Regeneration', description: 'Restores 25% max health and grants +1 HP/sec regen.', icon: '💚', stats: { heal: 25, hp_regen: 1.0 } },
    { id: 'thruster_boost', name: 'Ion Micro-Thrusters', description: 'Increases movement speed by 20%.', icon: '🚀', stats: { move_speed: 0.20 } },
    { id: 'magnetic_field', name: 'Quantum Collector Coil', description: 'Expands XP gem collection radius by 50%.', icon: '🧲', stats: { magnet_radius: 0.50 } }
  ];
  return localPool.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function renderUpgradeChoices(upgrades) {
  upgradeCardsContainer.innerHTML = '';

  upgrades.forEach(upg => {
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    
    const stats = upg.stats || {};
    const pills = Object.entries(stats).map(([k, v]) => {
      let label = k.replace('_', ' ').toUpperCase();
      let numVal = parseStatNumber(v);
      let valStr = numVal < 1 ? `+${Math.round(numVal * 100)}%` : `+${numVal}`;
      return `<span style="display:inline-block; font-size:10px; font-weight:700; background:rgba(0,240,255,0.15); color:#00f0ff; padding:2px 8px; border-radius:10px; margin:2px;">${label} ${valStr}</span>`;
    }).join(' ');

    card.innerHTML = `
      <div class="upgrade-icon">${upg.icon || '⚡'}</div>
      <div class="upgrade-name">${upg.name}</div>
      <div class="upgrade-desc">${upg.description}</div>
      <div style="margin-bottom:12px;">${pills}</div>
      <div class="upgrade-btn">INSTALL UPGRADE</div>
    `;

    card.addEventListener('click', () => {
      applyUpgrade(upg);
    });

    upgradeCardsContainer.appendChild(card);
  });
}

// --- Legendary Boss Reward System ---
async function triggerBossReward() {
  game.state = 'LEVEL_UP';
  if (bossRewardModal) {
    bossRewardModal.classList.remove('hidden');
    bossRewardCardsContainer.innerHTML = '<div style="grid-column: 1 / -1; padding: 25px; font-family: Orbitron; font-size: 14px; letter-spacing: 2px; color: #ffd700;">👑 HARVESTING BOSS ARTIFACT DATA...</div>';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch('/api/generate-boss-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: game.player.level }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (bossAiBadge) {
      if (data.source === 'gemini') {
        bossAiBadge.textContent = `👑 GEMINI LEGENDARY EVOLUTION (${(data.model || 'gemini-3.5-flash-lite').toUpperCase()})`;
      } else {
        bossAiBadge.textContent = '👑 LEGENDARY CORE ARTIFACT';
      }
    }
    renderBossRewardChoices(data.rewards);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Boss rewards request failed or timed out, using emergency pool:', err);
    if (bossAiBadge) bossAiBadge.textContent = '👑 LEGENDARY BACKUP PROTOCOL';
    renderBossRewardChoices(getLocalBossFallbackRewards());
  }
}

function getLocalBossFallbackRewards() {
  const pool = [
    { id: 'orbital_plasma_shield', name: 'Orbital Plasma Guard', tier: 'LEGENDARY', description: 'Deploys 2 high-velocity energy spheres orbiting your drone, dealing continuous contact damage to all hostiles.', icon: '🪐', stats: { orbitals: 2, damage: 0.25 } },
    { id: 'chain_lightning', name: 'Tesla Discharge Coil', tier: 'LEGENDARY', description: 'Periodically discharges high-voltage electric arcs chaining across up to 4 nearby hostiles.', icon: '⚡', stats: { chain_lightning: 1, attack_speed: 0.20 } },
    { id: 'frost_nova', name: 'Cryo Zero Emitter', tier: 'LEGENDARY', description: 'Emits periodic sub-zero shockwaves that slow all hostiles by 40% and shatter weak drones.', icon: '❄️', stats: { frost_nova: 1, magnet_radius: 0.35 } },
    { id: 'piercing_railgun', name: 'Hyper-Velocity Accelerator', tier: 'LEGENDARY', description: 'Main weapon plasma bolts pierce straight through up to 3 hostiles without disintegrating.', icon: '🔱', stats: { piercing: 2, damage: 0.35 } },
    { id: 'vampiric_syphon', name: 'Dark Matter Syphon', tier: 'LEGENDARY', description: 'Vaporized hostiles have a 25% chance to restore +2 HP to your mainframe.', icon: '🩸', stats: { vampiric: 0.25, move_speed: 0.20 } }
  ];
  return pool.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function renderBossRewardChoices(rewards) {
  if (!bossRewardCardsContainer) return;
  bossRewardCardsContainer.innerHTML = '';

  rewards.forEach(rew => {
    const card = document.createElement('div');
    card.className = 'upgrade-card';

    const stats = rew.stats || {};
    const pills = Object.entries(stats).map(([k, v]) => {
      let label = k.replace('_', ' ').toUpperCase();
      let numVal = parseStatNumber(v);
      let valStr = numVal < 1 ? `+${Math.round(numVal * 100)}%` : `+${numVal}`;
      return `<span style="display:inline-block; font-size:10px; font-weight:700; background:rgba(255,215,0,0.2); color:#ffd700; padding:2px 8px; border-radius:10px; margin:2px;">${label} ${valStr}</span>`;
    }).join(' ');

    card.innerHTML = `
      <div class="upgrade-icon" style="filter: drop-shadow(0 0 10px #ffd700);">${rew.icon || '👑'}</div>
      <div class="upgrade-name" style="color:#ffd700;">${rew.name}</div>
      <div class="upgrade-desc">${rew.description}</div>
      <div style="margin-bottom:12px;">${pills}</div>
      <div class="upgrade-btn" style="border-color:#ffd700; color:#ffd700;">INSTALL EVOLUTION</div>
    `;

    card.addEventListener('click', () => {
      applyUpgrade(rew);
    });

    bossRewardCardsContainer.appendChild(card);
  });
}

function applyUpgrade(upgrade) {
  const stats = upgrade.stats || {};
  
  // Safe numeric additions preventing any string or NaN poisoning
  if (stats.damage !== undefined) {
    const d = parseStatNumber(stats.damage);
    if (!isNaN(d) && d !== 0) game.player.damageMult = (Number(game.player.damageMult) || 1.0) + d;
  }
  if (stats.attack_speed !== undefined) {
    const s = parseStatNumber(stats.attack_speed);
    if (!isNaN(s) && s !== 0) game.player.attackSpeedMult = (Number(game.player.attackSpeedMult) || 1.0) + s;
  }
  if (stats.projectile_count !== undefined) {
    const p = Math.round(parseStatNumber(stats.projectile_count));
    if (!isNaN(p) && p > 0) game.player.projectileCount = Math.min(16, (Number(game.player.projectileCount) || 1) + p);
  }
  if (stats.move_speed !== undefined) {
    const m = parseStatNumber(stats.move_speed);
    if (!isNaN(m) && m !== 0) game.player.moveSpeedMult = (Number(game.player.moveSpeedMult) || 1.0) + m;
  }
  if (stats.magnet_radius !== undefined) {
    const mag = parseStatNumber(stats.magnet_radius);
    if (!isNaN(mag) && mag !== 0) game.player.magnetRadiusMult = (Number(game.player.magnetRadiusMult) || 1.0) + mag;
  }
  if (stats.heal !== undefined) {
    const h = parseStatNumber(stats.heal);
    if (!isNaN(h) && h > 0) game.player.health = Math.min(game.player.maxHealth, (Number(game.player.health) || 100) + h);
  }
  if (stats.hp_regen !== undefined) {
    const r = parseStatNumber(stats.hp_regen);
    if (!isNaN(r) && r > 0) game.player.hpRegen = (Number(game.player.hpRegen) || 0) + r;
  }

  // Legendary mechanic activations
  if (stats.orbitals) {
    const o = Math.round(parseStatNumber(stats.orbitals));
    if (!isNaN(o) && o > 0) game.player.orbitalCount = Math.min(6, (Number(game.player.orbitalCount) || 0) + o);
  }
  if (stats.chain_lightning) {
    game.player.hasChainLightning = true;
  }
  if (stats.frost_nova) {
    game.player.hasFrostNova = true;
  }
  if (stats.piercing) {
    const pr = Math.round(parseStatNumber(stats.piercing));
    if (!isNaN(pr) && pr > 0) game.player.pierceCount = Math.min(6, (Number(game.player.pierceCount) || 0) + pr);
  }
  if (stats.vampiric) {
    const v = parseStatNumber(stats.vampiric);
    if (!isNaN(v) && v > 0) game.player.vampiricChance = Math.min(0.5, (Number(game.player.vampiricChance) || 0) + v);
  }

  // Defensive sanity clamps
  game.player.damageMult = Math.max(0.2, Number(game.player.damageMult) || 1.0);
  game.player.attackSpeedMult = Math.max(0.2, Math.min(5.0, Number(game.player.attackSpeedMult) || 1.0));
  game.player.projectileCount = Math.max(1, Math.min(16, Math.round(Number(game.player.projectileCount)) || 1));
  game.player.moveSpeedMult = Math.max(0.2, Math.min(3.0, Number(game.player.moveSpeedMult) || 1.0));

  levelUpModal.classList.add('hidden');
  if (bossRewardModal) bossRewardModal.classList.add('hidden');
  game.state = 'PLAYING';
  game.lastTimestamp = performance.now();
  updateHUD();
}

// --- Automated Boss Stat Upgrades (For Bosses defeated after the first 10) ---
const RANDOM_BOSS_STAT_UPGRADES = [
  {
    name: 'Overclocked Capacitors',
    icon: '⚡',
    desc: '+25% Attack Speed',
    stats: { attack_speed: 0.25 }
  },
  {
    name: 'Heavy Plasma Core',
    icon: '💥',
    desc: '+30% Weapon Damage',
    stats: { damage: 0.30 }
  },
  {
    name: 'Multi-Vector Array',
    icon: '🎯',
    desc: '+1 Projectile Volley',
    stats: { projectile_count: 1 }
  },
  {
    name: 'Sub-Light Thrusters',
    icon: '🚀',
    desc: '+18% Movement Speed',
    stats: { move_speed: 0.18 }
  },
  {
    name: 'Quantum Attraction Coil',
    icon: '🧲',
    desc: '+45% Magnet Range',
    stats: { magnet_radius: 0.45 }
  },
  {
    name: 'Nanite Hull Reinforcement',
    icon: '💚',
    desc: '+35 Max HP & +1.5 HP/s Regen',
    stats: { heal: 35, hp_regen: 1.5 }
  },
  {
    name: 'Hyper-Kinetic Piercer',
    icon: '🔱',
    desc: '+1 Projectile Pierce',
    stats: { piercing: 1 }
  },
  {
    name: 'Dark Matter Leech',
    icon: '🩸',
    desc: '+6% Vampiric Drain Chance',
    stats: { vampiric: 0.06 }
  },
  {
    name: 'Orbital Defense Satellite',
    icon: '🪐',
    desc: '+1 Orbital Defense Guard',
    stats: { orbitals: 1 }
  },
  {
    name: 'Tesla Field Overdrive',
    icon: '🌩️',
    desc: '+15% Attack Speed & +15% Damage',
    stats: { attack_speed: 0.15, damage: 0.15 }
  }
];

let autoUpgradeToastTimer = null;
function showAutoUpgradeToast(upgrade) {
  const toast = document.getElementById('auto-upgrade-toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastName = document.getElementById('toast-name');
  const toastStats = document.getElementById('toast-stats');
  if (!toast) return;

  if (toastIcon) toastIcon.textContent = upgrade.icon || '⚡';
  if (toastName) toastName.textContent = upgrade.name;
  if (toastStats) toastStats.textContent = upgrade.desc;
  toast.classList.remove('hidden');

  if (autoUpgradeToastTimer) clearTimeout(autoUpgradeToastTimer);
  autoUpgradeToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

function grantRandomBossStatUpgrade(player) {
  const choice = RANDOM_BOSS_STAT_UPGRADES[Math.floor(Math.random() * RANDOM_BOSS_STAT_UPGRADES.length)];
  applyUpgrade(choice);
  sounds.playHealthPickup();

  // Floating combat notifications
  createDamageNumber(player.x, player.y - 18, `${choice.icon} ${choice.name.toUpperCase()}`, '#ffd700');
  createDamageNumber(player.x, player.y - 42, `[AUTO-INSTALLED: ${choice.desc}]`, '#00f0ff');

  // Top-corner HUD toast
  showAutoUpgradeToast(choice);
}

function triggerGameOver() {
  game.state = 'GAME_OVER';
  if (pauseModal) pauseModal.classList.add('hidden');
  if (pauseBtn) {
    pauseBtn.textContent = '⏸️';
    pauseBtn.classList.remove('active');
    pauseBtn.setAttribute('title', 'Game Over');
  }
  if (game.score > playerTopScore) {
    playerTopScore = game.score;
    try {
      localStorage.setItem(TOP_SCORE_KEY, playerTopScore.toString());
    } catch (e) {}
  }
  if (topScoreDisplay) topScoreDisplay.textContent = playerTopScore;
  finalTimeDisplay.textContent = timerDisplay.textContent;
  finalLevelDisplay.textContent = game.player ? game.player.level : 1;
  finalKillsDisplay.textContent = game.kills;
  finalScoreDisplay.textContent = game.score;
  if (finalTopScoreDisplay) finalTopScoreDisplay.textContent = playerTopScore;

  // Prepare Callsign / Pilot Name Submission
  const myName = getCurrentPilotName();
  if (callsignInput) {
    callsignInput.value = myName;
  }
  if (callsignSubmitBtn) {
    callsignSubmitBtn.disabled = false;
    callsignSubmitBtn.textContent = 'SUBMIT SCORE';
  }
  if (callsignStatus) {
    callsignStatus.style.color = 'var(--accent-green)';
    callsignStatus.textContent = '';
  }

  gameOverModal.classList.remove('hidden');

  // Automatically save and transmit high score to database
  if (game.score > 0) {
    submitPlayerScore();
  }
}

restartBtn.addEventListener('click', () => {
  initGame();
});

// --- Pilot Name & Global Leaderboard Logic ---
function getCurrentPilotName() {
  try {
    return localStorage.getItem(CALLSIGN_STORAGE_KEY) || 'Pilot';
  } catch (e) {
    return 'Pilot';
  }
}

function setPilotName(name) {
  const clean = (name || '').trim();
  const finalName = clean || 'Pilot';
  try {
    localStorage.setItem(CALLSIGN_STORAGE_KEY, finalName);
  } catch (e) {}

  if (hudPilotDisplay) hudPilotDisplay.textContent = finalName;
  if (callsignInput) callsignInput.value = finalName;
  if (leaderboardPilotInput) leaderboardPilotInput.value = finalName;
  return finalName;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function fetchAndRenderLeaderboard() {
  if (!leaderboardTableContainer) return;
  leaderboardTableContainer.innerHTML = '<div class="leaderboard-loading">📡 RETRIEVING ARCHIVED CALLSIGNS...</div>';

  try {
    const res = await fetch('/api/leaderboard?limit=20');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = data.leaderboard || [];

    if (list.length === 0) {
      leaderboardTableContainer.innerHTML = '<div class="leaderboard-empty">NO MISSION RECORDS FOUND. BE THE FIRST PILOT ON THE BOARD!</div>';
      return;
    }

    const currentPilot = getCurrentPilotName().toLowerCase();

    let html = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th class="pilot-col">PILOT</th>
            <th class="score-col">SCORE</th>
            <th>TIME</th>
            <th>LVL</th>
            <th>KILLS</th>
          </tr>
        </thead>
        <tbody>
    `;

    list.forEach((entry, idx) => {
      let rankBadge = `${idx + 1}`;
      if (idx === 0) rankBadge = '🥇 1';
      else if (idx === 1) rankBadge = '🥈 2';
      else if (idx === 2) rankBadge = '🥉 3';

      const mins = Math.floor(entry.survival_time / 60);
      const secs = Math.floor(entry.survival_time % 60);
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      const isMe = (entry.player_name || '').toLowerCase() === currentPilot;
      const rowClass = isMe ? ' class="my-rank-row"' : '';
      const youBadge = isMe ? '<span class="you-tag">YOU</span>' : '';

      html += `
        <tr${rowClass}>
          <td class="rank-col">${rankBadge}</td>
          <td class="pilot-col">${escapeHtml(entry.player_name)}${youBadge}</td>
          <td class="score-col">${Number(entry.score).toLocaleString()}</td>
          <td>${timeStr}</td>
          <td>${entry.level}</td>
          <td>${entry.kills}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    leaderboardTableContainer.innerHTML = html;
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    leaderboardTableContainer.innerHTML = '<div class="leaderboard-empty" style="color:var(--danger-red);">⚠️ UNABLE TO SYNC ARCHIVE. TRY AGAIN.</div>';
  }
}

let wasPlayingBeforeLeaderboard = false;

function togglePause(forcePause = null) {
  // Disallow pausing in game over or during level up modal
  if (game.state === 'GAME_OVER' || game.state === 'LEVEL_UP') return;

  const shouldPause = forcePause !== null ? forcePause : (game.state === 'PLAYING');

  if (shouldPause) {
    if (game.state !== 'PAUSED') {
      game.state = 'PAUSED';
      if (pauseTimeVal) pauseTimeVal.textContent = timerDisplay ? timerDisplay.textContent : '00:00';
      if (pauseScoreVal) pauseScoreVal.textContent = game.score;
      if (pauseKillsVal) pauseKillsVal.textContent = game.kills;
      if (pauseLevelVal && game.player) pauseLevelVal.textContent = game.player.level;
      if (pauseModal) pauseModal.classList.remove('hidden');
      if (pauseBtn) {
        pauseBtn.textContent = '▶️';
        pauseBtn.classList.add('active');
        pauseBtn.setAttribute('title', 'Resume Game [P / ESC]');
      }
      keys.w = keys.a = keys.s = keys.d = false;
      keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
    }
  } else {
    if (game.state === 'PAUSED') {
      if (pauseModal) pauseModal.classList.add('hidden');
      game.state = 'PLAYING';
      game.lastTimestamp = performance.now();
      if (pauseBtn) {
        pauseBtn.textContent = '⏸️';
        pauseBtn.classList.remove('active');
        pauseBtn.setAttribute('title', 'Pause Game [P / ESC]');
      }
    }
  }
}

function quitCurrentRun() {
  if (game.state === 'GAME_OVER') return;
  const wasPlaying = (game.state === 'PLAYING');
  if (wasPlaying) {
    togglePause(true);
  }
  const confirmed = confirm("Are you sure you want to abandon the simulation?\nYour current run stats and score will be finalized.");
  if (confirmed) {
    if (pauseModal) pauseModal.classList.add('hidden');
    if (game.score > playerTopScore) {
      playerTopScore = game.score;
      try {
        localStorage.setItem(TOP_SCORE_KEY, playerTopScore.toString());
      } catch (e) {}
    }
    if (topScoreDisplay) topScoreDisplay.textContent = playerTopScore;
    triggerGameOver();
  } else {
    if (wasPlaying) {
      togglePause(false);
    }
  }
}

function openLeaderboardModal() {
  if (leaderboardModal) {
    if (game.state === 'PLAYING') {
      wasPlayingBeforeLeaderboard = true;
      game.state = 'PAUSED';
      if (pauseBtn) {
        pauseBtn.textContent = '▶️';
        pauseBtn.classList.add('active');
        pauseBtn.setAttribute('title', 'Resume Game [P / ESC]');
      }
      keys.w = keys.a = keys.s = keys.d = false;
      keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
    }
    leaderboardModal.classList.remove('hidden');
    if (leaderboardPilotInput) leaderboardPilotInput.value = getCurrentPilotName();
    if (pilotSaveStatus) pilotSaveStatus.textContent = '';
    fetchAndRenderLeaderboard();
  }
}

function closeLeaderboardModal() {
  if (leaderboardModal) {
    leaderboardModal.classList.add('hidden');
    if (wasPlayingBeforeLeaderboard) {
      wasPlayingBeforeLeaderboard = false;
      game.state = 'PLAYING';
      game.lastTimestamp = performance.now();
      if (pauseBtn) {
        pauseBtn.textContent = '⏸️';
        pauseBtn.classList.remove('active');
        pauseBtn.setAttribute('title', 'Pause Game [P / ESC]');
      }
    }
  }
}

async function submitPlayerScore() {
  if (!callsignInput || !callsignSubmitBtn) return;

  const rawName = (callsignInput.value || '').trim();
  const pilotName = setPilotName(rawName);

  callsignSubmitBtn.disabled = true;
  callsignSubmitBtn.textContent = 'TRANSMITTING...';
  if (callsignStatus) {
    callsignStatus.style.color = 'var(--accent-cyan)';
    callsignStatus.textContent = 'TRANSMITTING RECORD TO CORE ARCHIVE...';
  }

  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_name: pilotName,
        score: game.score,
        survival_time: game.survivalTime,
        level: game.player ? game.player.level : 1,
        kills: game.kills
      })
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      if (callsignStatus) {
        callsignStatus.style.color = 'var(--accent-green)';
        const formattedScore = Number(data.best_score || game.score).toLocaleString();
        if (data.action === 'updated') {
          callsignStatus.textContent = `✅ RECORD UPDATED! SCORE: ${formattedScore} | RANK: #${data.rank}`;
        } else if (data.action === 'retained') {
          callsignStatus.textContent = `ℹ️ PERSONAL BEST (${formattedScore}) RETAINED! RANK: #${data.rank}`;
        } else {
          callsignStatus.textContent = `✅ TRANSMISSION CONFIRMED! SCORE: ${formattedScore} | RANK: #${data.rank}`;
        }
      }
      callsignSubmitBtn.textContent = 'TRANSMITTED';
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    console.error('Score submission error:', err);
    if (callsignStatus) {
      callsignStatus.style.color = 'var(--danger-red)';
      callsignStatus.textContent = '⚠️ FAILED TO TRANSMIT RECORD. CHECK NETWORK.';
    }
    callsignSubmitBtn.disabled = false;
    callsignSubmitBtn.textContent = 'RETRY';
  }
}

if (hudPilotPill) {
  hudPilotPill.addEventListener('click', () => {
    openLeaderboardModal();
    if (leaderboardPilotInput) {
      setTimeout(() => leaderboardPilotInput.focus(), 60);
    }
  });
}

if (leaderboardPilotSaveBtn) {
  leaderboardPilotSaveBtn.addEventListener('click', () => {
    const chosen = leaderboardPilotInput ? leaderboardPilotInput.value : '';
    const saved = setPilotName(chosen);
    if (pilotSaveStatus) {
      pilotSaveStatus.textContent = `✅ Saved as "${saved}"`;
      setTimeout(() => { if (pilotSaveStatus) pilotSaveStatus.textContent = ''; }, 3000);
    }
    fetchAndRenderLeaderboard();
  });
}

if (leaderboardPilotInput) {
  leaderboardPilotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && leaderboardPilotSaveBtn) {
      leaderboardPilotSaveBtn.click();
    }
  });
}

if (leaderboardBtn) leaderboardBtn.addEventListener('click', openLeaderboardModal);
if (viewLeaderboardFromGameOver) viewLeaderboardFromGameOver.addEventListener('click', openLeaderboardModal);
if (leaderboardCloseBtn) leaderboardCloseBtn.addEventListener('click', closeLeaderboardModal);
if (leaderboardDoneBtn) leaderboardDoneBtn.addEventListener('click', closeLeaderboardModal);
if (leaderboardRefreshBtn) leaderboardRefreshBtn.addEventListener('click', fetchAndRenderLeaderboard);
if (callsignSubmitBtn) callsignSubmitBtn.addEventListener('click', submitPlayerScore);
if (callsignInput) {
  callsignInput.addEventListener('input', () => {
    if (callsignSubmitBtn) {
      callsignSubmitBtn.disabled = false;
      callsignSubmitBtn.textContent = 'SUBMIT SCORE';
    }
  });
  callsignInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitPlayerScore();
  });
}

// Tactical Pause & Quit button click listeners
if (pauseBtn) pauseBtn.addEventListener('click', () => togglePause());
if (resumeBtn) resumeBtn.addEventListener('click', () => togglePause(false));
if (quitBtn) quitBtn.addEventListener('click', quitCurrentRun);
if (pauseQuitBtn) pauseQuitBtn.addEventListener('click', quitCurrentRun);

// Hostile Intel Spawn Panel event listeners
if (spawnPanelToggle && enemySpawnPanel && enemySpawnPill) {
  spawnPanelToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    enemySpawnPanel.classList.add('hidden');
    enemySpawnPill.classList.remove('hidden');
  });

  enemySpawnPill.addEventListener('click', (e) => {
    e.stopPropagation();
    enemySpawnPill.classList.add('hidden');
    enemySpawnPanel.classList.remove('hidden');
    updateEnemySpawnPanel(true);
  });
}

if (tabSpawnActive && tabSpawnAll) {
  tabSpawnActive.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSpawnTab = 'active';
    tabSpawnActive.classList.add('active');
    tabSpawnAll.classList.remove('active');
    updateEnemySpawnPanel(true);
  });

  tabSpawnAll.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSpawnTab = 'all';
    tabSpawnAll.classList.add('active');
    tabSpawnActive.classList.remove('active');
    updateEnemySpawnPanel(true);
  });
}

if (enemySpawnPanel) {
  enemySpawnPanel.addEventListener('pointerdown', (e) => e.stopPropagation());
  enemySpawnPanel.addEventListener('click', (e) => e.stopPropagation());
}
if (enemySpawnPill) {
  enemySpawnPill.addEventListener('pointerdown', (e) => e.stopPropagation());
}

// Initialize Pilot Name in HUD and input fields
setPilotName(getCurrentPilotName());

// --- Radar Minimap & World Boundary Rendering ---
function drawArenaBorders(ctx) {
  ctx.save();
  // Neon boundary laser field
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#00f0ff';
  ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Outer warning hazard perimeter
  ctx.strokeStyle = 'rgba(255, 0, 85, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-8, -8, WORLD_WIDTH + 16, WORLD_HEIGHT + 16);

  // Corner holographic defense towers
  const towers = [
    [0, 0], [WORLD_WIDTH, 0],
    [0, WORLD_HEIGHT], [WORLD_WIDTH, WORLD_HEIGHT]
  ];
  for (const [tx, ty] of towers) {
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(tx, ty, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMinimap(ctx) {
  const mapW = 140;
  const mapH = 93;
  const mapX = canvas.width - mapW - 12;
  const mapY = 12;

  ctx.save();
  // Semi-transparent radar background
  ctx.fillStyle = 'rgba(7, 9, 19, 0.85)';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(mapX, mapY, mapW, mapH);
  ctx.fill();
  ctx.stroke();

  // Radar bounds scale
  const scaleX = mapW / WORLD_WIDTH;
  const scaleY = mapH / WORLD_HEIGHT;

  // Viewport rectangle
  const camRectX = mapX + camera.x * scaleX;
  const camRectY = mapY + camera.y * scaleY;
  const camRectW = camera.width * scaleX;
  const camRectH = camera.height * scaleY;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(camRectX, camRectY, camRectW, camRectH);

  // Draw Artifacts on radar
  for (const art of game.artifacts) {
    ctx.fillStyle = art.isAutoUpgrade ? '#00f0ff' : '#ffd700';
    ctx.beginPath();
    ctx.arc(mapX + art.x * scaleX, mapY + art.y * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Health Drops on radar
  if (game.healthDrops) {
    for (const h of game.healthDrops) {
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(mapX + h.x * scaleX, mapY + h.y * scaleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Bosses on radar
  for (const e of game.enemies) {
    if (e.isBoss) {
      ctx.fillStyle = e.isUltraBoss ? '#ff00ff' : '#ff0055';
      ctx.shadowBlur = e.isUltraBoss ? 10 : 6;
      ctx.shadowColor = e.isUltraBoss ? '#ff00ff' : '#ff0055';
      ctx.beginPath();
      ctx.arc(mapX + e.x * scaleX, mapY + e.y * scaleY, e.isUltraBoss ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Player on radar
  if (game.player) {
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(mapX + game.player.x * scaleX, mapY + game.player.y * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
  ctx.font = '700 8px Orbitron, sans-serif';
  ctx.fillText('RADAR SCANNER', mapX + 6, mapY + 12);

  ctx.restore();
}

// --- Main Game Loop (60 FPS) ---
function gameLoop(timestamp) {
  if (!game.lastTimestamp) game.lastTimestamp = timestamp;
  const dt = Math.min((timestamp - game.lastTimestamp) / 1000, 0.1);
  game.lastTimestamp = timestamp;

  if (game.state === 'PLAYING') {
    game.survivalTime += dt;
    updateHUD();

    // Check boss encounter milestones (every minute: 1, 2, 3, 4, 5, 6, 7...)
    const currentMinute = Math.floor(game.survivalTime / 60);
    if (currentMinute >= 1 && !game.bossSpawnedAt[currentMinute]) {
      game.bossSpawnedAt[currentMinute] = true;
      triggerBossEncounter(currentMinute);
    }

    // Spawner tick: smoothly ramps down from 1.2s to 0.12s in deep end-game (paused during Ultra Boss 10s arrival)
    if (game.spawnPauseTimer > 0) {
      game.spawnPauseTimer -= dt;
    } else {
      game.spawnTimer += dt;
      const mins = game.survivalTime / 60;
      // Spawner interval reduction: scaled back by 15% before 10 min mark (0.08 -> 0.068)
      const rateScaling = mins <= 10 ? mins * 0.068 : (0.68 + (mins - 10) * 0.08);
      const currentSpawnRate = Math.max(0.12, game.spawnInterval - rateScaling - (mins > 10 ? (mins - 10) * 0.015 : 0));
      if (game.spawnTimer >= currentSpawnRate) {
        game.spawnTimer = 0;
        spawnEnemyWave();
      }
    }

    // Update Player & Camera
    game.player.update(dt, game.enemies, game.projectiles);
    camera.update(game.player);

    // Update Player Projectiles
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
      const p = game.projectiles[i];
      p.update(dt);
      
      // Projectile vs Enemy collision
      for (const e of game.enemies) {
        if (e.markedForDeletion || p.hitEnemies.has(e)) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius) {
          e.takeDamage(p.damage);
          p.hitEnemies.add(e);
          if (p.pierceLeft > 0) {
            p.pierceLeft--;
            spawnExplosion(p.x, p.y, '#00f0ff', 4);
          } else {
            p.markedForDeletion = true;
            break;
          }
        }
      }

      if (p.markedForDeletion) {
        game.projectiles.splice(i, 1);
      }
    }

    // Update Enemy Projectiles (Bombard Plasma Orbs)
    for (let i = game.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = game.enemyProjectiles[i];
      ep.update(dt, game.player);
      if (ep.markedForDeletion) {
        game.enemyProjectiles.splice(i, 1);
      }
    }

    // Update Enemies
    for (let i = game.enemies.length - 1; i >= 0; i--) {
      const e = game.enemies[i];
      e.update(dt, game.player);
      if (e.markedForDeletion) {
        game.enemies.splice(i, 1);
      }
    }

    // Update XP Gems
    for (let i = game.gems.length - 1; i >= 0; i--) {
      const g = game.gems[i];
      g.update(dt, game.player);
      if (g.markedForDeletion) {
        game.gems.splice(i, 1);
      }
    }

    // Update Boss Artifacts
    for (let i = game.artifacts.length - 1; i >= 0; i--) {
      const art = game.artifacts[i];
      art.update(dt, game.player);
      if (art.collected) {
        game.artifacts.splice(i, 1);
      }
    }

    // Update Health Drops
    if (game.healthDrops) {
      for (let i = game.healthDrops.length - 1; i >= 0; i--) {
        const h = game.healthDrops[i];
        h.update(dt, game.player);
        if (h.collected) {
          game.healthDrops.splice(i, 1);
        }
      }
    }

    // Update Lightning Visual Effects
    for (let i = game.lightningBolts.length - 1; i >= 0; i--) {
      const b = game.lightningBolts[i];
      b.lifespan -= dt;
      if (b.lifespan <= 0) game.lightningBolts.splice(i, 1);
    }

    // Update Nova Rings
    for (let i = game.novaRings.length - 1; i >= 0; i--) {
      const nr = game.novaRings[i];
      nr.r += (nr.maxR / nr.lifespan) * dt;
      nr.alpha -= dt / nr.lifespan;
      if (nr.alpha <= 0) game.novaRings.splice(i, 1);
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.lifespan -= dt;
      pt.alpha = pt.lifespan / 0.5;
      if (pt.lifespan <= 0) particles.splice(i, 1);
    }

    // Update Damage Numbers
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const dn = damageNumbers[i];
      dn.y += dn.vy * dt;
      dn.lifespan -= dt;
      if (dn.lifespan <= 0) damageNumbers.splice(i, 1);
    }
  }

  // --- Rendering with Camera Viewport ---
  ctx.fillStyle = '#070913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply Camera Zoom (+50% Visible Area) & Translation
  ctx.save();
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  // Starfield grid covering 1920x1280
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 48;
  for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
  }

  // Draw Arena Laser Perimeter
  drawArenaBorders(ctx);

  // Draw Gems
  for (const g of game.gems) g.draw(ctx);

  // Draw Health Drops
  if (game.healthDrops) {
    for (const h of game.healthDrops) h.draw(ctx);
  }

  // Draw Boss Artifacts
  for (const art of game.artifacts) art.draw(ctx);

  // Draw Enemy Projectiles
  for (const ep of game.enemyProjectiles) ep.draw(ctx);

  // Draw Enemies
  for (const e of game.enemies) e.draw(ctx);

  // Draw Player Projectiles
  for (const p of game.projectiles) p.draw(ctx);

  // Draw Nova Rings
  for (const nr of game.novaRings) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, nr.alpha);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(nr.x, nr.y, nr.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Lightning Bolts
  for (const b of game.lightningBolts) {
    ctx.save();
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = b.color;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    const midX = (b.x1 + b.x2) / 2 + (Math.random() - 0.5) * 20;
    const midY = (b.y1 + b.y2) / 2 + (Math.random() - 0.5) * 20;
    ctx.lineTo(midX, midY);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Player
  if (game.player) game.player.draw(ctx);

  // Draw Particles
  for (const pt of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.alpha);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Damage Numbers
  for (const dn of damageNumbers) {
    ctx.save();
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.fillStyle = dn.color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = dn.color;
    ctx.fillText(dn.text, dn.x, dn.y);
    ctx.restore();
  }

  // End Camera Translation
  ctx.restore();

  // Screen-Space HUD: Off-screen Boss Drop Pointer & Minimap Radar
  drawBossArtifactPointers(ctx);
  drawMinimap(ctx);

  requestAnimationFrame(gameLoop);
}

// Off-screen HUD Directional Pointer for Boss Artifacts
function drawBossArtifactPointers(ctx) {
  if (!game.artifacts || game.artifacts.length === 0 || !game.player) return;

  const margin = 45;
  for (const art of game.artifacts) {
    const screenX = (art.x - camera.x) * camera.zoom;
    const screenY = (art.y - camera.y) * camera.zoom;

    // Inside visible screen: skyward beam is visible, no pointer needed
    if (screenX >= 25 && screenX <= canvas.width - 25 && screenY >= 25 && screenY <= canvas.height - 25) {
      continue;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = screenX - centerX;
    const dy = screenY - centerY;
    const angle = Math.atan2(dy, dx);
    const worldDist = Math.round(Math.hypot(art.x - game.player.x, art.y - game.player.y));

    const edgeX = Math.max(margin, Math.min(canvas.width - margin, centerX + Math.cos(angle) * (canvas.width / 2 - margin)));
    const edgeY = Math.max(margin, Math.min(canvas.height - margin, centerY + Math.sin(angle) * (canvas.height / 2 - margin)));

    const color = art.isAutoUpgrade ? '#00f0ff' : '#ffd700';
    const label = art.isAutoUpgrade ? `⚡ STAT CORE ${worldDist}m` : `👑 BOSS DROP ${worldDist}m`;

    ctx.save();
    ctx.translate(edgeX, edgeY);

    ctx.shadowBlur = 16;
    ctx.shadowColor = color;

    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -14);

    ctx.restore();
  }
}

// Start game
initGame();
requestAnimationFrame(gameLoop);
