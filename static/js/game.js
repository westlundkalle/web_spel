/**
 * CYBER SURVIVOR: AI Bullet Heaven
 * Pure HTML5 Canvas + JavaScript Game Engine with Web Audio Synthesizer & AI Integration
 */

// Canvas & Rendering Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI DOM Elements
const healthFill = document.getElementById('health-bar-fill');
const healthText = document.getElementById('health-text');
const xpFill = document.getElementById('xp-bar-fill');
const playerLevelDisplay = document.getElementById('player-level');
const timerDisplay = document.getElementById('timer-display');
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

const gameOverModal = document.getElementById('game-over-modal');
const finalTimeDisplay = document.getElementById('final-time');
const finalLevelDisplay = document.getElementById('final-level');
const finalKillsDisplay = document.getElementById('final-kills');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// --- Procedural Web Audio Synthesizer (Zero External Dependencies) ---
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

      gain.gain.setValueAtTime(0.08, t);
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
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.linearRampToValueAtTime(40, t + 0.06);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
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
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.09);

      gain.gain.setValueAtTime(0.07, t);
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
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.28);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    } catch (e) {}
  }

  playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch (e) {}
  }

  playBossAlert() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(260, t + 0.4);
      osc.frequency.linearRampToValueAtTime(120, t + 0.8);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.8);
    } catch (e) {}
  }

  playGameOver() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.9);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.9);
    } catch (e) {}
  }
}

const sounds = new SoundController();

// Init Audio on first user interaction
window.addEventListener('click', () => sounds.init(), { once: true });
window.addEventListener('keydown', () => sounds.init(), { once: true });
audioToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sounds.init();
  sounds.toggle();
});

// Check AI Backend Status on load
async function checkBackendAIStatus() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.ai_ready) {
      aiStatusPill.className = 'ai-status-pill online';
      aiStatusText.textContent = `AI: ${data.model.toUpperCase()}`;
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
    this.baseSpeed = 220; // pixels per second
    
    this.maxHealth = 100;
    this.health = 100;
    this.hpRegen = 0; // HP per second
    
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 10;
    
    // Stats & Modifiers
    this.damageMult = 1.0;
    this.attackSpeedMult = 1.0;
    this.projectileCount = 1;
    this.moveSpeedMult = 1.0;
    this.baseMagnetRadius = 80;
    this.magnetRadiusMult = 1.0;

    // Combat timers
    this.baseCooldown = 0.45; // seconds per volley
    this.attackTimer = 0;
    this.targetingRange = 460;
    
    // Invulnerability frames
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 0.5;
  }

  get speed() {
    return this.baseSpeed * this.moveSpeedMult;
  }

  get magnetRadius() {
    return this.baseMagnetRadius * this.magnetRadiusMult;
  }

  update(dt, enemies, projectiles) {
    // Movement
    let dx = 0;
    let dy = 0;
    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;

    // Normalize diagonal velocity
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // Keep within canvas bounds
    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

    // Passive regeneration
    if (this.hpRegen > 0 && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + this.hpRegen * dt);
      updateHUD();
    }

    // Invulnerability tick
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Auto-attack targeting
    const attackInterval = this.baseCooldown / this.attackSpeedMult;
    this.attackTimer += dt;
    if (this.attackTimer >= attackInterval) {
      this.attackTimer = 0;
      this.autoAttack(enemies, projectiles);
    }
  }

  autoAttack(enemies, projectiles) {
    if (enemies.length === 0) return;

    // Find closest enemy
    let closestEnemy = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < closestDist && dist <= this.targetingRange) {
        closestDist = dist;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      sounds.playShoot();
      const baseAngle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
      const count = this.projectileCount;
      const baseDamage = 25 * this.damageMult;

      if (count === 1) {
        projectiles.push(new Projectile(this.x, this.y, baseAngle, baseDamage));
      } else {
        const spreadArc = 0.26; // radians
        const startAngle = baseAngle - (spreadArc * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
          const angle = startAngle + i * spreadArc;
          projectiles.push(new Projectile(this.x, this.y, angle, baseDamage));
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
      this.xpToNext = Math.round(this.xpToNext * 1.45 + 5);
      sounds.playLevelUp();
      triggerLevelUp();
    }
    updateHUD();
  }

  draw(ctx) {
    ctx.save();
    
    // I-frame blinking effect
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Magnet ring aura (subtle)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.magnetRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Player Core (Neon Cyber Drone)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, angle, damage) {
    this.x = x;
    this.y = y;
    this.speed = 520;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.radius = 4;
    this.damage = damage;
    this.lifespan = 1.6; // seconds
    this.markedForDeletion = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifespan -= dt;

    if (this.lifespan <= 0 ||
        this.x < -20 || this.x > canvas.width + 20 ||
        this.y < -20 || this.y > canvas.height + 20) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffe600';
    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Enemy {
  constructor(type, x, y, difficultyMultiplier, bossConfig = null) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.markedForDeletion = false;
    this.isBoss = false;

    if (bossConfig) {
      this.isBoss = true;
      this.bossName = bossConfig.boss_name || 'TITAN BOSS';
      this.radius = 34;
      const stats = bossConfig.stats || {};
      this.speed = 70 * (stats.speed_mult || 1.0);
      this.health = 450 * (stats.health_mult || 4.0);
      this.maxHealth = this.health;
      this.damage = 40 * (stats.damage_mult || 1.8);
      this.color = bossConfig.color || '#ff0055';
      this.xpValue = 30;
    } else if (type === 'swarmer') {
      this.radius = 12;
      this.speed = 140 * (1 + difficultyMultiplier * 0.05);
      this.health = 20 * difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = 12;
      this.color = '#ff3366';
      this.xpValue = 1;
    } else if (type === 'striker') {
      this.radius = 16;
      this.speed = 105 * (1 + difficultyMultiplier * 0.04);
      this.health = 50 * difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = 22;
      this.color = '#9d4edd';
      this.xpValue = 3;
    } else { // dreadnought
      this.radius = 26;
      this.speed = 65 * (1 + difficultyMultiplier * 0.03);
      this.health = 160 * difficultyMultiplier;
      this.maxHealth = this.health;
      this.damage = 38;
      this.color = '#ff9100';
      this.xpValue = 8;
    }
  }

  update(dt, player) {
    // Chase player
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;

    // Check collision with player
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < this.radius + player.radius) {
      player.takeDamage(this.damage);
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    createDamageNumber(this.x, this.y - 12, Math.round(amount), '#ffffff');
    if (this.health <= 0) {
      this.markedForDeletion = true;
      sounds.playExplosion();
      spawnExplosion(this.x, this.y, this.color, this.isBoss ? 35 : 12);
      game.kills += 1;
      game.score += this.xpValue * 25;
      
      // Boss drops cluster of gems
      if (this.isBoss) {
        for (let i = 0; i < 6; i++) {
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 40;
          game.gems.push(new XpGem(this.x + offsetX, this.y + offsetY, 5));
        }
      } else {
        game.gems.push(new XpGem(this.x, this.y, this.xpValue));
      }
      updateHUD();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = this.isBoss ? 16 : 6;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    
    // Render shape
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Boss Aura ring
    if (this.isBoss) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 6 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Boss Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.bossName, this.x, this.y - this.radius - 14);
    }

    // Health Bar above enemy
    if (this.health < this.maxHealth || this.isBoss) {
      const barW = this.radius * 2.2;
      const barH = this.isBoss ? 5 : 3;
      const pct = Math.max(0, this.health / this.maxHealth);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 8, barW, barH);
      ctx.fillStyle = this.isBoss ? '#ff0055' : '#00ff88';
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 8, barW * pct, barH);
    }

    ctx.restore();
  }
}

class XpGem {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.radius = 5 + Math.min(4, value);
    this.markedForDeletion = false;
    this.speed = 0;
    this.maxSpeed = 640;
  }

  update(dt, player) {
    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    // Magnetic pull towards player
    if (dist <= player.magnetRadius) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.speed = Math.min(this.maxSpeed, this.speed + 850 * dt);
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;

      // Collect gem
      if (dist < player.radius + this.radius) {
        this.markedForDeletion = true;
        player.addXP(this.value);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
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
  damageNumbers.push({
    x: x + (Math.random() * 14 - 7),
    y,
    text,
    color,
    lifespan: 0.6,
    vy: -40
  });
}

// --- Game State Manager ---
const game = {
  player: null,
  projectiles: [],
  enemies: [],
  gems: [],
  spawnTimer: 0,
  spawnInterval: 1.2,
  survivalTime: 0,
  score: 0,
  kills: 0,
  bossSpawnedAt: {}, // tracking minute marks triggered
  state: 'PLAYING',
  lastTimestamp: 0
};

function initGame() {
  game.player = new Player(canvas.width / 2, canvas.height / 2);
  game.projectiles = [];
  game.enemies = [];
  game.gems = [];
  particles.length = 0;
  damageNumbers.length = 0;
  
  game.spawnTimer = 0;
  game.spawnInterval = 1.2;
  game.survivalTime = 0;
  game.score = 0;
  game.kills = 0;
  game.bossSpawnedAt = {};
  game.state = 'PLAYING';
  game.lastTimestamp = performance.now();

  eventBanner.classList.add('hidden');
  levelUpModal.classList.add('hidden');
  gameOverModal.classList.add('hidden');

  updateHUD();
}

function spawnEnemyWave() {
  let x, y;
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) { // Top
    x = Math.random() * canvas.width;
    y = -20;
  } else if (edge === 1) { // Right
    x = canvas.width + 20;
    y = Math.random() * canvas.height;
  } else if (edge === 2) { // Bottom
    x = Math.random() * canvas.width;
    y = canvas.height + 20;
  } else { // Left
    x = -20;
    y = Math.random() * canvas.height;
  }

  const minutes = game.survivalTime / 60;
  const difficultyMult = 1 + minutes * 0.45;

  let type = 'swarmer';
  const roll = Math.random();
  if (minutes > 1.2 && roll > 0.82) {
    type = 'dreadnought';
  } else if (minutes > 0.35 && roll > 0.6) {
    type = 'striker';
  }

  game.enemies.push(new Enemy(type, x, y, difficultyMult));
}

// Trigger dynamic AI Boss Encounter
async function triggerBossEncounter(minuteMark) {
  sounds.playBossAlert();

  let bossConfig = null;
  try {
    const res = await fetch('/api/generate-boss-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        survival_time: game.survivalTime,
        level: game.player.level
      })
    });
    const data = await res.json();
    bossConfig = data.event;
  } catch (err) {
    bossConfig = {
      boss_name: "TITAN VORTEX",
      title: "Core Anomaly",
      transmission: "SIGNAL CORRUPTED. PURGING THREAT.",
      color: "#ff0055",
      stats: { health_mult: 4.0, speed_mult: 0.9, damage_mult: 1.8 }
    };
  }

  // Display Event Banner
  eventTagTitle.textContent = `${bossConfig.title.toUpperCase()} (MINUTE ${minuteMark})`;
  eventBossName.textContent = bossConfig.boss_name;
  eventTransmission.textContent = `"${bossConfig.transmission}"`;
  eventBanner.classList.remove('hidden');

  // Hide banner after 5.5 seconds
  setTimeout(() => {
    eventBanner.classList.add('hidden');
  }, 5500);

  // Spawn Boss Enemy at top center
  game.enemies.push(new Enemy('boss', canvas.width / 2, -40, 1.0, bossConfig));
}

// --- HUD & UI Updates ---
function updateHUD() {
  if (!game.player) return;

  // HP Bar
  const hpPct = Math.max(0, (game.player.health / game.player.maxHealth) * 100);
  healthFill.style.width = `${hpPct}%`;
  healthText.textContent = `${Math.ceil(game.player.health)} / ${game.player.maxHealth}`;

  // XP Bar
  const xpPct = Math.min(100, (game.player.xp / game.player.xpToNext) * 100);
  xpFill.style.width = `${xpPct}%`;
  playerLevelDisplay.textContent = game.player.level;

  // Timer format (mm:ss)
  const mins = Math.floor(game.survivalTime / 60);
  const secs = Math.floor(game.survivalTime % 60);
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Score & Kills
  scoreDisplay.textContent = game.score;
  killsDisplay.textContent = game.kills;
}

// --- Upgrade System & AI API Integration ---
async function triggerLevelUp() {
  game.state = 'LEVEL_UP';
  levelUpModal.classList.remove('hidden');
  upgradeCardsContainer.innerHTML = '<div style="grid-column: 1 / -1; padding: 25px; font-family: Orbitron; font-size: 14px; letter-spacing: 2px; color: var(--accent-cyan);">🤖 NEURAL SYNTHESIS IN PROGRESS...</div>';

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
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.source === 'gemini') {
      aiBadge.textContent = `🤖 GEMINI AI (${(data.model || 'gemini-2.5-flash').toUpperCase()})`;
    } else if (data.source === 'openai') {
      aiBadge.textContent = `🤖 OPENAI (${(data.model || 'gpt-4o-mini').toUpperCase()})`;
    } else {
      aiBadge.textContent = '⚡ TACTICAL FALLBACK PROTOCOL';
    }
    renderUpgradeChoices(data.upgrades);
  } catch (err) {
    console.warn('Backend API request failed, using emergency local upgrades:', err);
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
    
    // Format stat pills
    const stats = upg.stats || {};
    const pills = Object.entries(stats).map(([k, v]) => {
      let label = k.replace('_', ' ').toUpperCase();
      let valStr = typeof v === 'number' && v < 1 ? `+${Math.round(v * 100)}%` : `+${v}`;
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

function applyUpgrade(upgrade) {
  const stats = upgrade.stats || {};
  
  if (stats.damage) game.player.damageMult += stats.damage;
  if (stats.attack_speed) game.player.attackSpeedMult += stats.attack_speed;
  if (stats.projectile_count) game.player.projectileCount += stats.projectile_count;
  if (stats.move_speed) game.player.moveSpeedMult += stats.move_speed;
  if (stats.magnet_radius) game.player.magnetRadiusMult += stats.magnet_radius;
  if (stats.heal) game.player.health = Math.min(game.player.maxHealth, game.player.health + stats.heal);
  if (stats.hp_regen) game.player.hpRegen += stats.hp_regen;

  levelUpModal.classList.add('hidden');
  game.state = 'PLAYING';
  game.lastTimestamp = performance.now();
  updateHUD();
}

function triggerGameOver() {
  game.state = 'GAME_OVER';
  finalTimeDisplay.textContent = timerDisplay.textContent;
  finalLevelDisplay.textContent = game.player.level;
  finalKillsDisplay.textContent = game.kills;
  finalScoreDisplay.textContent = game.score;
  gameOverModal.classList.remove('hidden');
}

restartBtn.addEventListener('click', () => {
  initGame();
});

// --- Main Game Loop ---
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - game.lastTimestamp) / 1000, 0.1);
  game.lastTimestamp = timestamp;

  if (game.state === 'PLAYING') {
    game.survivalTime += dt;
    updateHUD();

    // Check boss encounter milestones (e.g. minute 1, minute 2)
    const currentMinute = Math.floor(game.survivalTime / 60);
    if (currentMinute >= 1 && !game.bossSpawnedAt[currentMinute]) {
      game.bossSpawnedAt[currentMinute] = true;
      triggerBossEncounter(currentMinute);
    }

    // Spawner tick
    game.spawnTimer += dt;
    const currentSpawnRate = Math.max(0.28, game.spawnInterval - (game.survivalTime / 60) * 0.18);
    if (game.spawnTimer >= currentSpawnRate) {
      game.spawnTimer = 0;
      spawnEnemyWave();
    }

    // Update Player
    game.player.update(dt, game.enemies, game.projectiles);

    // Update Projectiles
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
      const p = game.projectiles[i];
      p.update(dt);
      
      // Projectile vs Enemy collision
      for (const e of game.enemies) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius) {
          e.takeDamage(p.damage);
          p.markedForDeletion = true;
          break;
        }
      }

      if (p.markedForDeletion) {
        game.projectiles.splice(i, 1);
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

  // --- Rendering ---
  ctx.fillStyle = '#070913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle starfield grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 48;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw Gems
  for (const g of game.gems) g.draw(ctx);

  // Draw Enemies
  for (const e of game.enemies) e.draw(ctx);

  // Draw Projectiles
  for (const p of game.projectiles) p.draw(ctx);

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

  requestAnimationFrame(gameLoop);
}

// Start game
initGame();
requestAnimationFrame(gameLoop);
