/**
 * CYBER SURVIVOR: AI Bullet Heaven
 * Pure HTML5 Canvas + JavaScript Game Engine with Web Audio Synthesizer,
 * Geometric Enemy Ships, Legendary Boss Artifact Evolutions & Google Gemini AI.
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

const bossRewardModal = document.getElementById('boss-reward-modal');
const bossRewardCardsContainer = document.getElementById('boss-reward-cards');
const bossAiBadge = document.getElementById('boss-ai-badge');

const gameOverModal = document.getElementById('game-over-modal');
const finalTimeDisplay = document.getElementById('final-time');
const finalLevelDisplay = document.getElementById('final-level');
const finalKillsDisplay = document.getElementById('final-kills');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// --- Helper Functions ---
function parseStatNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const cleaned = val.replace('%', '').replace('+', '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return val.includes('%') ? num / 100 : num;
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
        // Collision check with enemies
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
    const validTargets = enemies.filter(e => !e.markedForDeletion && Math.hypot(e.x - this.x, e.y - this.y) <= 360);
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
      r: 0, maxR: 260,
      lifespan: 0.45,
      alpha: 1.0
    });

    for (const e of enemies) {
      if (e.markedForDeletion) continue;
      const dist = Math.hypot(e.x - this.x, e.y - this.y);
      if (dist <= 260) {
        e.slowTimer = 3.5;
        e.takeDamage(25 * Math.max(0.5, Number(this.damageMult) || 1.0));
        spawnExplosion(e.x, e.y, '#00f0ff', 4);
      }
    }
  }

  autoAttack(enemies, projectiles) {
    if (enemies.length === 0) return;

    // Find closest non-deleted enemy
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
      const count = Math.max(1, this.projectileCount);
      const safeDmg = Math.max(5, (Number(this.damageMult) || 1.0) * 25);

      if (count === 1) {
        projectiles.push(new Projectile(this.x, this.y, baseAngle, safeDmg, this.pierceCount));
      } else {
        const spreadArc = 0.26; // radians
        const startAngle = baseAngle - (spreadArc * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
          const angle = startAngle + i * spreadArc;
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
    
    // Invulnerability flashing
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Outer Neon Glow
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f0ff';

    // Ship Hull (Neon Cyan Triangle)
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
    ctx.shadowBlur = 10;
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
    this.angle = 0;
    this.slowTimer = 0;
    this.markedForDeletion = false;
    this.isBoss = false;

    if (bossConfig) {
      this.isBoss = true;
      this.bossName = bossConfig.boss_name || 'TITAN LEVIATHAN';
      this.radius = 36;
      const stats = bossConfig.stats || {};
      this.speed = 70 * (stats.speed_mult || 1.0);
      this.health = 450 * (stats.health_mult || 4.0);
      this.maxHealth = this.health;
      this.damage = 40 * (stats.damage_mult || 1.8);
      this.color = bossConfig.color || '#ff0055';
      this.xpValue = 35;
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
    // Calculate angle towards player
    this.angle = Math.atan2(player.y - this.y, player.x - this.x);

    let effectiveSpeed = this.speed;
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      effectiveSpeed *= 0.55;
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
      spawnExplosion(this.x, this.y, this.color, this.isBoss ? 45 : 12);
      game.kills += 1;
      game.score += this.xpValue * 25;

      // Vampiric health leech
      if (game.player && game.player.vampiricChance > 0 && Math.random() < game.player.vampiricChance) {
        game.player.health = Math.min(game.player.maxHealth, game.player.health + 2);
        createDamageNumber(game.player.x, game.player.y - 20, '+2 HP', '#00ff88');
      }

      // Boss Drops Legendary Core Artifact + Cluster of gems
      if (this.isBoss) {
        game.artifacts.push(new BossArtifact(this.x, this.y));
        for (let i = 0; i < 8; i++) {
          const offsetX = (Math.random() - 0.5) * 60;
          const offsetY = (Math.random() - 0.5) * 60;
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
    ctx.translate(this.x, this.y);

    // Frost effect if slowed
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
      // --- Boss Shape: Multi-Layered Octagonal Leviathan with Outer Spiked Shields ---
      ctx.shadowBlur = 22;
      ctx.shadowColor = this.color;

      // Outer rotating spiked shield
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

      // Main Armored Octagon Hull
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

      // Pulsing Core Reactor
      const pulse = 1 + Math.sin(Date.now() / 120) * 0.2;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Boss Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(this.bossName, 0, -this.radius - 16);

    } else if (this.type === 'swarmer') {
      // --- Swarmer Shape: Sleek Delta-Wing Triangle rotated in movement direction ---
      ctx.rotate(this.angle);
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.moveTo(this.radius * 1.3, 0); // nose pointing forward
      ctx.lineTo(-this.radius, -this.radius * 0.85); // left wing
      ctx.lineTo(-this.radius * 0.4, 0); // engine thruster indent
      ctx.lineTo(-this.radius, this.radius * 0.85); // right wing
      ctx.closePath();
      ctx.fill();

      // Thruster engine glow
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.5, 0, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'striker') {
      // --- Striker Shape: Fast 4-Pointed Diamond / Star Interceptor ---
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

      // Striker Inner Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // --- Dreadnought Shape: Heavy Armored 6-Sided Hexagon with Spinning Inner Plate ---
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      // Outer Hexagon
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

      // Inner Counter-Rotating Armored Plate
      ctx.rotate(Date.now() / 450);
      ctx.fillStyle = '#121926';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.lineTo(Math.cos(a) * (this.radius * 0.6), Math.sin(a) * (this.radius * 0.6));
      }
      ctx.closePath();
      ctx.fill();

      // Heavy Core Light
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.28, 0, Math.PI * 2);
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    this.collected = false;
    this.rotation = 0;
    this.floatTimer = 0;
  }

  update(dt, player) {
    this.rotation += dt * 2.5;
    this.floatTimer += dt * 4;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    // Magnet attraction
    if (dist <= player.magnetRadius * 1.5) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const magnetSpeed = 380;
      this.x += Math.cos(angle) * magnetSpeed * dt;
      this.y += Math.sin(angle) * magnetSpeed * dt;
    }

    if (dist < player.radius + this.radius) {
      this.collected = true;
      sounds.playLevelUp();
      triggerBossReward();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(this.floatTimer) * 4);

    // Glowing beacon beam
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(0, 60);
    ctx.stroke();

    // Outer rotating diamond ring
    ctx.rotate(this.rotation);
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffd700';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-12, -12, 24, 24);

    // Inner counter-rotating diamond
    ctx.rotate(-this.rotation * 2);
    ctx.fillStyle = '#ff9100';
    ctx.fillRect(-7, -7, 14, 14);

    // Core pearl
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

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

    // Magnet attraction
    if (dist <= player.magnetRadius) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const magnetSpeed = 340 + (player.magnetRadius - dist) * 1.5;
      this.x += Math.cos(angle) * magnetSpeed * dt;
      this.y += Math.sin(angle) * magnetSpeed * dt;
    }

    // Collection check
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
  artifacts: [],
  lightningBolts: [],
  novaRings: [],
  spawnTimer: 0,
  spawnInterval: 1.2,
  survivalTime: 0,
  score: 0,
  kills: 0,
  bossSpawnedAt: {},
  state: 'PLAYING',
  lastTimestamp: 0
};

function initGame() {
  game.player = new Player(canvas.width / 2, canvas.height / 2);
  game.projectiles = [];
  game.enemies = [];
  game.gems = [];
  game.artifacts = [];
  game.lightningBolts = [];
  game.novaRings = [];
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
  if (bossRewardModal) bossRewardModal.classList.add('hidden');
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

  // Weighted enemy spawn roll
  const roll = Math.random();
  let type = 'swarmer';
  if (minutes > 0.75 && roll > 0.75) {
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
      aiBadge.textContent = `🤖 GEMINI AI (${(data.model || 'gemini-3.5-flash-lite').toUpperCase()})`;
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

  try {
    const res = await fetch('/api/generate-boss-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: game.player.level })
    });
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
    console.warn('Boss rewards request failed, using emergency pool:', err);
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
  
  // Safe numeric additions preventing any string/NaN poisoning
  if (stats.damage) game.player.damageMult += parseStatNumber(stats.damage);
  if (stats.attack_speed) game.player.attackSpeedMult += parseStatNumber(stats.attack_speed);
  if (stats.projectile_count) game.player.projectileCount += Math.round(parseStatNumber(stats.projectile_count));
  if (stats.move_speed) game.player.moveSpeedMult += parseStatNumber(stats.move_speed);
  if (stats.magnet_radius) game.player.magnetRadiusMult += parseStatNumber(stats.magnet_radius);
  if (stats.heal) game.player.health = Math.min(game.player.maxHealth, game.player.health + parseStatNumber(stats.heal));
  if (stats.hp_regen) game.player.hpRegen += parseStatNumber(stats.hp_regen);

  // Legendary mechanic activations
  if (stats.orbitals) {
    game.player.orbitalCount = (game.player.orbitalCount || 0) + Math.round(parseStatNumber(stats.orbitals));
  }
  if (stats.chain_lightning) {
    game.player.hasChainLightning = true;
  }
  if (stats.frost_nova) {
    game.player.hasFrostNova = true;
  }
  if (stats.piercing) {
    game.player.pierceCount += Math.round(parseStatNumber(stats.piercing));
  }
  if (stats.vampiric) {
    game.player.vampiricChance = Math.min(0.5, (game.player.vampiricChance || 0) + parseStatNumber(stats.vampiric));
  }

  // Defensive sanity clamps
  if (isNaN(game.player.damageMult) || game.player.damageMult < 0.2) game.player.damageMult = 1.0;
  if (isNaN(game.player.attackSpeedMult) || game.player.attackSpeedMult < 0.2) game.player.attackSpeedMult = 1.0;
  if (isNaN(game.player.moveSpeedMult) || game.player.moveSpeedMult < 0.2) game.player.moveSpeedMult = 1.0;

  levelUpModal.classList.add('hidden');
  if (bossRewardModal) bossRewardModal.classList.add('hidden');
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

// --- Main Game Loop (60 FPS) ---
function gameLoop(timestamp) {
  if (!game.lastTimestamp) game.lastTimestamp = timestamp;
  const dt = Math.min((timestamp - game.lastTimestamp) / 1000, 0.1);
  game.lastTimestamp = timestamp;

  if (game.state === 'PLAYING') {
    game.survivalTime += dt;
    updateHUD();

    // Check boss encounter milestones (every 1 minute mark)
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

  // --- Rendering ---
  ctx.fillStyle = '#070913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Starfield grid
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

  // Draw Boss Artifacts
  for (const art of game.artifacts) art.draw(ctx);

  // Draw Enemies
  for (const e of game.enemies) e.draw(ctx);

  // Draw Projectiles
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
    // Draw slight zig-zag
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

  requestAnimationFrame(gameLoop);
}

// Start game
initGame();
requestAnimationFrame(gameLoop);
