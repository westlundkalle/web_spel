/**
 * CYBER SURVIVOR: AI Bullet Heaven
 * Pure HTML5 Canvas + JavaScript Game Engine
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

const levelUpModal = document.getElementById('level-up-modal');
const upgradeCardsContainer = document.getElementById('upgrade-cards');
const aiBadge = document.getElementById('ai-badge');

const gameOverModal = document.getElementById('game-over-modal');
const finalTimeDisplay = document.getElementById('final-time');
const finalLevelDisplay = document.getElementById('final-level');
const finalKillsDisplay = document.getElementById('final-kills');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

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

    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = this.invulnerableDuration;
    createDamageNumber(this.x, this.y - 20, Math.round(amount), '#ff2a4b');
    updateHUD();

    if (this.health <= 0) {
      triggerGameOver();
    }
    return true;
  }

  addXP(amount) {
    this.xp += amount;
    game.score += amount * 10;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.round(this.xpToNext * 1.45 + 5);
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
    
    // Triangle ship pointer facing velocity or nearest
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
  constructor(type, x, y, difficultyMultiplier) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.markedForDeletion = false;

    if (type === 'swarmer') {
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
      spawnExplosion(this.x, this.y, this.color);
      game.kills += 1;
      game.score += this.xpValue * 25;
      game.gems.push(new XpGem(this.x, this.y, this.xpValue));
      updateHUD();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    
    // Render shape
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Mini Health Bar above enemy
    if (this.health < this.maxHealth) {
      const barW = this.radius * 2;
      const barH = 3;
      const pct = Math.max(0, this.health / this.maxHealth);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, barW, barH);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, barW * pct, barH);
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
    this.maxSpeed = 600;
  }

  update(dt, player) {
    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    // Magnetic pull towards player
    if (dist <= player.magnetRadius) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.speed = Math.min(this.maxSpeed, this.speed + 800 * dt);
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

function spawnExplosion(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      radius: 2 + Math.random() * 2,
      lifespan: 0.35 + Math.random() * 0.25,
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
  spawnInterval: 1.2, // seconds between spawns (decreases over time)
  survivalTime: 0,
  score: 0,
  kills: 0,
  state: 'PLAYING', // 'PLAYING', 'LEVEL_UP', 'GAME_OVER'
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
  game.state = 'PLAYING';
  game.lastTimestamp = performance.now();

  levelUpModal.classList.add('hidden');
  gameOverModal.classList.add('hidden');

  updateHUD();
}

function spawnEnemyWave() {
  // Determine spawn coordinates just beyond canvas edge
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

  // Difficulty scaling based on survival time
  const minutes = game.survivalTime / 60;
  const difficultyMult = 1 + minutes * 0.45;

  // Choose enemy type based on elapsed time
  let type = 'swarmer';
  const roll = Math.random();
  if (minutes > 1.5 && roll > 0.82) {
    type = 'dreadnought';
  } else if (minutes > 0.4 && roll > 0.6) {
    type = 'striker';
  }

  game.enemies.push(new Enemy(type, x, y, difficultyMult));
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
  upgradeCardsContainer.innerHTML = '<div style="grid-column: 1 / -1; padding: 20px; font-size: 16px;">Synthesizing tactical upgrade data...</div>';

  try {
    const payload = {
      level: game.player.level,
      stats: {
        damage: game.player.damageMult,
        attack_speed: game.player.attackSpeedMult,
        projectiles: game.player.projectileCount,
        speed: game.player.moveSpeedMult,
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

    aiBadge.textContent = data.source === 'openai' ? '🤖 AI SYNTHESIZED UPGRADES' : '⚡ TACTICAL FALLBACK PROTOCOL';
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
    card.innerHTML = `
      <div class="upgrade-icon">${upg.icon || '⚡'}</div>
      <div class="upgrade-name">${upg.name}</div>
      <div class="upgrade-desc">${upg.description}</div>
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
  const dt = Math.min((timestamp - game.lastTimestamp) / 1000, 0.1); // Cap delta time to prevent large jumps
  game.lastTimestamp = timestamp;

  if (game.state === 'PLAYING') {
    game.survivalTime += dt;
    updateHUD();

    // Spawner tick (scaling rate)
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
