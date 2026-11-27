// GameState: zones, farmer AI, detection, gadgets, scoring. Pure logic, no drawing.
export const WORLD = { x: 8, y: 8, w: 904, h: 464 };
export const HUD = { x: 920, y: 0, w: 360, h: 480 };

export const ZONES = [
  {
    name: 'Coop', sub: 'Zone 1 of 5 — the straw pen',
    floor: '#c98f4e', floorDark: '#b57a3e', wall: '#7a4a22',
    accent: '#e8b64c', farmerSpeed: 62, knifeCount: 1, cornCount: 6,
    blurb: 'Dawn in the Coop. Bram is feeding the hens — slip past him.',
  },
  {
    name: 'Kitchen', sub: 'Zone 2 of 5 — Old Bessie is hot',
    floor: '#b8a88f', floorDark: '#a08b6d', wall: '#5d4030',
    accent: '#d95f2b', farmerSpeed: 72, knifeCount: 2, cornCount: 7,
    blurb: 'The Kitchen smells of roast. Dodge the oven heat and the blade.',
  },
  {
    name: 'Yard', sub: 'Zone 3 of 5 — open ground, no cover',
    floor: '#7fae4e', floorDark: '#6b9a3e', wall: '#4a6b2a',
    accent: '#f2c14e', farmerSpeed: 82, knifeCount: 2, cornCount: 8,
    blurb: 'The Yard is wide open. Bram can see for yards — use the hay.',
  },
  {
    name: 'Cornfield', sub: 'Zone 4 of 5 — tall stalks, tall fear',
    floor: '#c9a13b', floorDark: '#b08a2e', wall: '#6b5316',
    accent: '#ffe066', farmerSpeed: 92, knifeCount: 3, cornCount: 9,
    blurb: 'The Cornfield hides you — and hides Bram. Listen for boots.',
  },
  {
    name: 'Barn', sub: 'Zone 5 of 5 — the last door out',
    floor: '#8a5a34', floorDark: '#74482a', wall: '#4a2c14',
    accent: '#ff8c42', farmerSpeed: 102, knifeCount: 3, cornCount: 10,
    blurb: 'The Barn door is freedom. One last sprint past the farmer.',
  },
];

export const GADGET_DEFS = [
  { key: 'sprint', name: 'Wing Sprint', icon: 'WING', count: 3, desc: 'SPACE' },
  { key: 'decoy', name: 'Corn Decoy', icon: 'CORN', count: 2, desc: 'KEY 1' },
  { key: 'smoke', name: 'Smoke Puff', icon: 'PUFF', count: 2, desc: 'KEY 2' },
];

export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

export function mulberry(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createState(zoneIndex) {
  const zone = ZONES[zoneIndex];
  const rnd = mulberry(1000 + zoneIndex * 777);
  const corn = [];
  for (let i = 0; i < zone.cornCount; i++) {
    corn.push({
      x: WORLD.x + 60 + rnd() * (WORLD.w - 140),
      y: WORLD.y + 50 + rnd() * (WORLD.h - 110),
      taken: false, bob: rnd() * 6.28, value: 10,
    });
  }
  const knives = [];
  for (let i = 0; i < zone.knifeCount; i++) {
    knives.push({
      cx: WORLD.x + 220 + i * 240 + rnd() * 60,
      cy: WORLD.y + 110 + (i % 2) * 220,
      r: 74 + i * 8, ang: rnd() * 6.28, speed: (0.9 + zoneIndex * 0.12) * (i % 2 ? -1 : 1),
    });
  }
  const hay = [];
  for (let i = 0; i < 5; i++) {
    hay.push({ x: WORLD.x + 90 + rnd() * (WORLD.w - 180), y: WORLD.y + 60 + rnd() * (WORLD.h - 120), r: 26 + rnd() * 14 });
  }
  return {
    screen: 'play',
    zoneIndex,
    zone,
    time: 0,
    turkey: { x: WORLD.x + 46, y: WORLD.y + WORLD.h / 2, vx: 0, vy: 0, face: 0, sprintT: 0, invulnT: 0, smokeT: 0, moving: false },
    farmer: {
      x: WORLD.x + WORLD.w - 160, y: WORLD.y + 90, dir: Math.PI, speed: zone.farmerSpeed,
      mode: 'patrol', wp: 0, searchT: 0, chaseT: 0,
      waypoints: [
        { x: WORLD.x + WORLD.w - 140, y: WORLD.y + 80 },
        { x: WORLD.x + WORLD.w - 140, y: WORLD.y + WORLD.h - 80 },
        { x: WORLD.x + 420, y: WORLD.y + WORLD.h - 90 },
        { x: WORLD.x + 420, y: WORLD.y + 90 },
      ],
    },
    oven: { x: WORLD.x + WORLD.w - 92, y: WORLD.y + WORLD.h / 2, r: 62, heatT: 0 },
    knives,
    corn,
    hay,
    decoys: [],
    smokes: [],
    particles: [],
    score: 0,
    distance: 0,
    totalScore: 0,
    totalDistance: 0,
    totalCorn: 0,
    lives: 3,
    alarm: 0,
    spotted: false,
    gadgets: { sprint: 3, decoy: 2, smoke: 2 },
    cornGot: 0,
    exitOpen: false,
    message: zone.blurb,
    messageT: 4,
    endKind: null,
    endScore: 0,
    medal: null,
    ghost: null,
    caughtFlash: 0,
    heatFlash: 0,
  };
}

export function newRun() {
  const s = createState(0);
  s.totalScore = 0;
  s.totalDistance = 0;
  s.totalCorn = 0;
  return s;
}

function farmerSeesTurkey(s) {
  const f = s.farmer, t = s.turkey;
  if (t.smokeT > 0) return false;
  const d = dist(f.x, f.y, t.x, t.y);
  if (d > 210) return false;
  let a = angleTo(f.x, f.y, t.x, t.y) - f.dir;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  if (Math.abs(a) > 0.62) return false;
  for (const h of s.hay) {
    if (dist(h.x, h.y, (f.x + t.x) / 2, (f.y + t.y) / 2) < h.r * 0.7 && d > 90) return false;
  }
  return true;
}

export function useGadget(s, key, sound) {
  if (s.screen !== 'play') return;
  if (key === 'sprint') {
    if (s.gadgets.sprint <= 0 || s.turkey.sprintT > 0) return;
    s.gadgets.sprint--;
    s.turkey.sprintT = 1.2;
    if (sound) sound.sprint();
    s.message = 'WING SPRINT! Run, turkey, run!';
    s.messageT = 1.6;
  } else if (key === 'decoy') {
    if (s.gadgets.decoy <= 0) return;
    s.gadgets.decoy--;
    s.decoys.push({ x: s.turkey.x + 70, y: s.turkey.y - 20, t: 4 });
    s.farmer.mode = 'decoy';
    if (sound) sound.decoy();
    s.message = 'CORN DECOY out! Bram smells dinner over there...';
    s.messageT = 1.8;
  } else if (key === 'smoke') {
    if (s.gadgets.smoke <= 0) return;
    s.gadgets.smoke--;
    s.turkey.smokeT = 2.2;
    s.smokes.push({ x: s.turkey.x, y: s.turkey.y, t: 2.2, r: 10 });
    if (sound) sound.smoke();
    s.message = 'SMOKE PUFF! You vanish in the haze.';
    s.messageT = 1.8;
  }
}

export function hurtTurkey(s, reason, sound) {
  if (s.turkey.invulnT > 0 || s.screen !== 'play') return;
  s.lives--;
  s.turkey.invulnT = 1.6;
  s.caughtFlash = 0.5;
  s.alarm = Math.min(100, s.alarm + 25);
  if (sound) sound.hurt();
  s.message = reason === 'oven'
    ? 'OLD BESSIE OVEN scorched your tail feathers!'
    : reason === 'knife'
      ? 'CARVER\u2019S KNIFE nicked you! Ouch!'
      : 'FARMER BRAM grabbed your wing!';
  s.messageT = 2;
  if (s.lives <= 0) {
    s.screen = 'end';
    s.endKind = 'caught';
    s.endScore = s.totalScore + s.score;
    s.medal = 'NONE';
    s.ghost = 'F';
    if (sound) sound.caught();
  }
}

export function updateGame(s, input, dt, sound) {
  if (s.screen !== 'play') return;
  s.time += dt;
  const t = s.turkey;
  const speed = 165 * (t.sprintT > 0 ? 2 : 1);
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const len = Math.hypot(mx, my) || 1;
  mx /= len; my /= len;
  t.moving = mx !== 0 || my !== 0;
  if (t.moving) {
    t.face = Math.atan2(my, mx);
    const step = speed * dt;
    t.x = clamp(t.x + mx * step, WORLD.x + 16, WORLD.x + WORLD.w - 16);
    t.y = clamp(t.y + my * step, WORLD.y + 16, WORLD.y + WORLD.h - 16);
    s.distance += step;
    s.totalDistance += step;
    if (sound && Math.random() < dt * 3) sound.step();
  }
  if (t.sprintT > 0) t.sprintT -= dt;
  if (t.invulnT > 0) t.invulnT -= dt;
  if (t.smokeT > 0) t.smokeT -= dt;
  if (s.caughtFlash > 0) s.caughtFlash -= dt;
  if (s.heatFlash > 0) s.heatFlash -= dt;
  if (s.messageT > 0) s.messageT -= dt;

  // Exit gate: top-right corner of the world, opens after 60% corn collected.
  const exit = { x: WORLD.x + WORLD.w - 34, y: WORLD.y + 30 };
  if (!s.exitOpen && s.cornGot >= Math.ceil(s.corn.length * 0.6)) {
    s.exitOpen = true;
    s.message = 'The BARN GATE is open! Run for it!';
    s.messageT = 2.5;
    if (sound) sound.zoneClear();
  }
  if (s.exitOpen && dist(t.x, t.y, exit.x, exit.y) < 34) {
    s.totalScore += s.score;
    s.totalCorn += s.cornGot;
    if (s.zoneIndex >= ZONES.length - 1) {
      s.screen = 'end';
      s.endKind = 'escaped';
      s.endScore = s.totalScore;
      s.medal = s.totalScore >= 700 ? 'GOLD' : s.totalScore >= 450 ? 'SILVER' : 'BRONZE';
      s.ghost = s.alarm < 30 ? 'S+' : s.alarm < 60 ? 'A' : 'B';
      if (sound) sound.escaped();
    } else {
      const keep = { score: 0, lives: s.lives, gadgets: s.gadgets, totalScore: s.totalScore, totalDistance: s.totalDistance, totalCorn: s.totalCorn };
      const next = createState(s.zoneIndex + 1);
      next.lives = keep.lives;
      next.gadgets = keep.gadgets;
      next.totalScore = keep.totalScore;
      next.totalDistance = keep.totalDistance;
      next.totalCorn = keep.totalCorn;
      next.screen = 'play';
      Object.assign(s, next);
      s.message = 'Zone ' + (s.zoneIndex + 1) + ': ' + s.zone.name + ' — ' + s.zone.blurb;
      s.messageT = 3;
    }
    return;
  }

  // Corn pickups.
  for (const c of s.corn) {
    if (!c.taken && dist(t.x, t.y, c.x, c.y) < 26) {
      c.taken = true;
      s.cornGot++;
      s.score += c.value;
      if (sound) sound.pickup();
      spawnFeathers(s, c.x, c.y, 4, '#ffd94d');
    }
  }

  // Old Bessie Oven heat zone.
  const od = dist(t.x, t.y, s.oven.x, s.oven.y);
  if (od < s.oven.r) {
    s.oven.heatT += dt;
    s.heatFlash = 0.2;
    if (s.oven.heatT > 0.9) {
      s.oven.heatT = 0;
      hurtTurkey(s, 'oven', sound);
    }
  } else {
    s.oven.heatT = Math.max(0, s.oven.heatT - dt * 2);
  }

  // Carver's Knife patrol arcs.
  for (const k of s.knives) {
    k.ang += k.speed * dt;
    const kx = k.cx + Math.cos(k.ang) * k.r;
    const ky = k.cy + Math.sin(k.ang) * k.r * 0.55;
    if (dist(t.x, t.y, kx, ky) < 24) hurtTurkey(s, 'knife', sound);
  }

  // Farmer Bram: patrol, chase, search, decoy.
  const f = s.farmer;
  const sees = farmerSeesTurkey(s);
  s.spotted = sees;
  if (sees) {
    s.alarm = clamp(s.alarm + 55 * dt, 0, 100);
    if (f.mode !== 'chase') { f.mode = 'chase'; f.chaseT = 3; if (sound) sound.alarmTick(); }
  } else {
    s.alarm = clamp(s.alarm - 14 * dt, 0, 100);
  }
  let target = null;
  let spd = f.speed;
  if (f.mode === 'chase') {
    target = { x: t.x, y: t.y };
    spd = f.speed * 1.45;
    f.chaseT -= dt;
    if (!sees && f.chaseT <= 0) { f.mode = 'search'; f.searchT = 2.5; }
  } else if (f.mode === 'decoy' && s.decoys.length) {
    target = s.decoys[s.decoys.length - 1];
    spd = f.speed * 1.3;
    if (dist(f.x, f.y, target.x, target.y) < 26) { s.decoys.pop(); f.mode = 'search'; f.searchT = 2; }
  } else if (f.mode === 'search') {
    f.searchT -= dt;
    f.dir += dt * 1.8;
    if (f.searchT <= 0) f.mode = 'patrol';
  } else {
    const wp = f.waypoints[f.wp];
    target = wp;
    if (dist(f.x, f.y, wp.x, wp.y) < 18) f.wp = (f.wp + 1) % f.waypoints.length;
  }
  if (target) {
    const a = angleTo(f.x, f.y, target.x, target.y);
    f.dir = a;
    f.x += Math.cos(a) * spd * dt;
    f.y += Math.sin(a) * spd * dt;
    f.x = clamp(f.x, WORLD.x + 20, WORLD.x + WORLD.w - 20);
    f.y = clamp(f.y, WORLD.y + 20, WORLD.y + WORLD.h - 20);
  }
  if (dist(t.x, t.y, f.x, f.y) < 30) hurtTurkey(s, 'farmer', sound);

  // Decoys and smoke fade.
  for (const d of s.decoys) d.t -= dt;
  s.decoys = s.decoys.filter((d) => d.t > 0);
  for (const sm of s.smokes) { sm.t -= dt; sm.r += 40 * dt; }
  s.smokes = s.smokes.filter((sm) => sm.t > 0);

  // Oven smoke particles.
  if (Math.random() < dt * 8) {
    s.particles.push({ x: s.oven.x - 10 + Math.random() * 20, y: s.oven.y - 34, vx: (Math.random() - 0.5) * 8, vy: -22 - Math.random() * 14, t: 1.4, r: 4 + Math.random() * 5 });
  }
  for (const p of s.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; p.r += 6 * dt; }
  s.particles = s.particles.filter((p) => p.t > 0);
}

export function spawnFeathers(s, x, y, n, color) {
  for (let i = 0; i < n; i++) {
    s.particles.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 40, t: 0.7, r: 3, color });
  }
}
