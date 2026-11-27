// Render: every pixel is procedural Canvas 2D — farm, farmer, turkey, oven,
// knife, HUD side panel, annotations, title and end screens.
import { WORLD, HUD, ZONES, GADGET_DEFS, clamp, dist, mulberry } from './state.js';

const C = {
  panel: '#241608', panelEdge: '#b3541e', cream: '#f5d9a8', gold: '#f2c14e',
  red: '#d94f30', green: '#7fae4e', white: '#fff7e6', dim: '#c9a06a',
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, bold, font) {
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + size + 'px ' + (font || 'Georgia, serif');
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function shadow(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

export function drawBackground(ctx, s) {
  const z = s.zone;
  ctx.fillStyle = z.floor;
  ctx.fillRect(WORLD.x, WORLD.y, WORLD.w, WORLD.h);
  // Floor texture: planks or tiles per zone.
  const rnd = mulberry(42 + s.zoneIndex * 31);
  ctx.strokeStyle = 'rgba(0,0,0,0.14)';
  ctx.lineWidth = 1;
  if (z.name === 'Kitchen') {
    for (let x = WORLD.x; x < WORLD.x + WORLD.w; x += 46) {
      ctx.beginPath(); ctx.moveTo(x, WORLD.y); ctx.lineTo(x, WORLD.y + WORLD.h); ctx.stroke();
    }
    for (let y = WORLD.y; y < WORLD.y + WORLD.h; y += 46) {
      ctx.beginPath(); ctx.moveTo(WORLD.x, y); ctx.lineTo(WORLD.x + WORLD.w, y); ctx.stroke();
    }
  } else {
    for (let y = WORLD.y + 18; y < WORLD.y + WORLD.h; y += 34) {
      ctx.beginPath(); ctx.moveTo(WORLD.x, y); ctx.lineTo(WORLD.x + WORLD.w, y); ctx.stroke();
    }
  }
  // Scattered straw, leaves and pebbles for texture density.
  for (let i = 0; i < 90; i++) {
    const x = WORLD.x + rnd() * WORLD.w;
    const y = WORLD.y + rnd() * WORLD.h;
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,220,120,0.25)' : 'rgba(60,30,5,0.18)';
    ctx.fillRect(x, y, 5 + rnd() * 6, 2);
  }
  // Zone dressing.
  if (z.name === 'Coop') drawCoopProps(ctx, s);
  if (z.name === 'Kitchen') drawKitchenProps(ctx, s);
  if (z.name === 'Yard') drawYardProps(ctx, s);
  if (z.name === 'Cornfield') drawCornfieldProps(ctx, s);
  if (z.name === 'Barn') drawBarnProps(ctx, s);
  // Fence border around the world.
  ctx.strokeStyle = z.wall; ctx.lineWidth = 6;
  ctx.strokeRect(WORLD.x + 2, WORLD.y + 2, WORLD.w - 4, WORLD.h - 4);
  ctx.fillStyle = 'rgba(255,240,180,0.10)';
  ctx.fillRect(WORLD.x, WORLD.y, WORLD.w, 60);
}

function drawCoopProps(ctx, s) {
  // Straw nests, feed sacks, eggs.
  for (let i = 0; i < 3; i++) {
    const x = WORLD.x + 120 + i * 260, y = WORLD.y + 70 + (i % 2) * 300;
    ctx.fillStyle = '#e8c96a';
    ctx.beginPath(); ctx.ellipse(x, y, 46, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x - 10, y - 6, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 12, y - 4, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  text(ctx, 'COOP', WORLD.x + 40, WORLD.y + 26, 15, 'rgba(60,30,5,0.55)', 'left', true);
}

function drawKitchenProps(ctx, s) {
  // Table, pots, window light, hanging pans.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(WORLD.x + 60, WORLD.y + 60, 170, 54);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(WORLD.x + 60, WORLD.y + 54, 170, 10);
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath(); ctx.arc(WORLD.x + 110, WORLD.y + 52, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(WORLD.x + 170, WORLD.y + 52, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(WORLD.x + 300, WORLD.y + 20, 90, 70);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(WORLD.x + 306, WORLD.y + 26, 78, 58);
  ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 4;
  ctx.strokeRect(WORLD.x + 300, WORLD.y + 20, 90, 70);
  text(ctx, 'KITCHEN', WORLD.x + 40, WORLD.y + 26, 15, 'rgba(60,30,5,0.55)', 'left', true);
  // Warm lamp pools.
  const g = ctx.createRadialGradient(WORLD.x + 450, WORLD.y + 120, 10, WORLD.x + 450, WORLD.y + 120, 150);
  g.addColorStop(0, 'rgba(255,220,130,0.35)'); g.addColorStop(1, 'rgba(255,220,130,0)');
  ctx.fillStyle = g; ctx.fillRect(WORLD.x + 280, WORLD.y, 340, 260);
}

function drawYardProps(ctx, s) {
  // Pumpkins, fence posts, wheelbarrow, sun patch.
  const rnd = mulberry(7);
  for (let i = 0; i < 4; i++) {
    const x = WORLD.x + 90 + rnd() * 700, y = WORLD.y + 60 + rnd() * 340;
    ctx.fillStyle = '#e8702a';
    ctx.beginPath(); ctx.ellipse(x, y, 20, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f7a2a'; ctx.fillRect(x - 2, y - 20, 4, 8);
  }
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(WORLD.x + 60, WORLD.y + 300, 120, 40);
  ctx.beginPath(); ctx.arc(WORLD.x + 80, WORLD.y + 344, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(WORLD.x + 160, WORLD.y + 344, 14, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(WORLD.x + 700, WORLD.y + 80, 10, WORLD.x + 700, WORLD.y + 80, 190);
  g.addColorStop(0, 'rgba(255,245,180,0.4)'); g.addColorStop(1, 'rgba(255,245,180,0)');
  ctx.fillStyle = g; ctx.fillRect(WORLD.x + 480, WORLD.y, 430, 300);
  text(ctx, 'YARD', WORLD.x + 40, WORLD.y + 26, 15, 'rgba(30,50,5,0.55)', 'left', true);
}

function drawCornfieldProps(ctx, s) {
  // Tall corn stalk rows.
  for (let x = WORLD.x + 40; x < WORLD.x + WORLD.w; x += 52) {
    for (const y of [WORLD.y + 30, WORLD.y + WORLD.h - 34]) {
      ctx.strokeStyle = '#3f7a2a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 26); ctx.stroke();
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath(); ctx.ellipse(x + 6, y - 18, 7, 12, 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  text(ctx, 'CORNFIELD', WORLD.x + 40, WORLD.y + 26, 15, 'rgba(60,45,5,0.6)', 'left', true);
}

function drawBarnProps(ctx, s) {
  // Barrels, crates, lantern light.
  for (let i = 0; i < 3; i++) {
    const x = WORLD.x + 110 + i * 300, y = WORLD.y + 70;
    ctx.fillStyle = '#7a4a22';
    ctx.beginPath(); ctx.ellipse(x, y, 26, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x - 26, y - 8, 52, 5); ctx.fillRect(x - 26, y + 8, 52, 5);
  }
  ctx.fillStyle = '#a87a3a';
  ctx.fillRect(WORLD.x + 500, WORLD.y + 320, 90, 60);
  ctx.strokeStyle = '#6b4a1a'; ctx.lineWidth = 3;
  ctx.strokeRect(WORLD.x + 500, WORLD.y + 320, 90, 60);
  const g = ctx.createRadialGradient(WORLD.x + 545, WORLD.y + 300, 8, WORLD.x + 545, WORLD.y + 300, 130);
  g.addColorStop(0, 'rgba(255,190,90,0.45)'); g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g; ctx.fillRect(WORLD.x + 400, WORLD.y + 160, 300, 280);
  text(ctx, 'BARN', WORLD.x + 40, WORLD.y + 26, 15, 'rgba(40,20,5,0.6)', 'left', true);
}

export function drawHay(ctx, s) {
  for (const h of s.hay) {
    shadow(ctx, h.x, h.y + 8, h.r, h.r * 0.4);
    ctx.fillStyle = '#d9a83c';
    ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8c96a';
    ctx.beginPath(); ctx.arc(h.x - 6, h.y - 6, h.r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,10,0.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(h.x - h.r + 6, h.y - 10 + i * 6); ctx.lineTo(h.x + h.r - 6, h.y - 12 + i * 6); ctx.stroke();
    }
    text(ctx, 'HAY — hide here', h.x, h.y - h.r - 8, 10, 'rgba(40,25,5,0.75)', 'center', true);
  }
}

export function drawOven(ctx, s) {
  const o = s.oven;
  const pulse = 1 + Math.sin(s.time * 5) * 0.06;
  const g = ctx.createRadialGradient(o.x, o.y, 8, o.x, o.y, o.r * 2.1 * pulse);
  g.addColorStop(0, 'rgba(255,120,30,0.55)'); g.addColorStop(0.5, 'rgba(255,80,20,0.22)'); g.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = g;
  ctx.fillRect(o.x - o.r * 2.2, o.y - o.r * 2.2, o.r * 4.4, o.r * 4.4);
  ctx.strokeStyle = 'rgba(255,90,20,0.8)'; ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  shadow(ctx, o.x, o.y + 34, 52, 12);
  ctx.fillStyle = '#2e2e2e';
  rr(ctx, o.x - 46, o.y - 40, 92, 84, 8); ctx.fill();
  ctx.fillStyle = '#ff7a1e';
  rr(ctx, o.x - 34, o.y - 26, 68, 34, 6); ctx.fill();
  ctx.fillStyle = '#ffd94d';
  rr(ctx, o.x - 24, o.y - 18, 48, 18, 5); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(o.x - 34, o.y + 18, 68, 6);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(o.x - 20, o.y + 30, 40, 5);
  text(ctx, 'OLD BESSIE OVEN', o.x, o.y - 56, 12, '#fff', 'center', true);
  text(ctx, 'HEAT ZONE — stay out!', o.x, o.y + 58, 10, '#ffb08a', 'center', true);
}

export function drawKnife(ctx, s) {
  for (const k of s.knives) {
    // Swing arc trail.
    ctx.strokeStyle = 'rgba(220,230,255,0.35)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(k.cx, k.cy, k.r, k.ang - 0.7, k.ang + 0.1); ctx.stroke();
    const kx = k.cx + Math.cos(k.ang) * k.r;
    const ky = k.cy + Math.sin(k.ang) * k.r * 0.55;
    shadow(ctx, kx, ky + 14, 16, 5);
    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(k.ang + Math.PI / 2);
    ctx.fillStyle = '#e8ecf2';
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(9, 6); ctx.lineTo(-9, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5d3a1a'; ctx.fillRect(-4, 6, 8, 12);
    ctx.restore();
    text(ctx, 'CARVER\u2019S KNIFE', kx, ky - 30, 11, '#fff', 'center', true);
  }
}

export function drawFarmer(ctx, s) {
  const f = s.farmer;
  // Vision cone.
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.dir);
  const cone = ctx.createRadialGradient(0, 0, 10, 0, 0, 210);
  const col = f.mode === 'chase' ? 'rgba(255,60,30,0.34)' : 'rgba(255,220,90,0.26)';
  cone.addColorStop(0, col); cone.addColorStop(1, 'rgba(255,220,90,0)');
  ctx.fillStyle = cone;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 210, -0.62, 0.62); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = f.mode === 'chase' ? 'rgba(255,60,30,0.7)' : 'rgba(255,220,90,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 210, -0.62, 0.62); ctx.closePath(); ctx.stroke();
  ctx.restore();
  shadow(ctx, f.x, f.y + 22, 24, 7);
  // Body: overalls, red shirt, straw hat.
  ctx.fillStyle = '#2f6db3';
  rr(ctx, f.x - 15, f.y - 8, 30, 34, 8); ctx.fill();
  ctx.fillStyle = '#c0392b';
  rr(ctx, f.x - 15, f.y - 20, 30, 16, 6); ctx.fill();
  ctx.fillStyle = '#f2c48d';
  ctx.beginPath(); ctx.arc(f.x, f.y - 28, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c96a';
  ctx.beginPath(); ctx.ellipse(f.x, f.y - 36, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(f.x - 12, f.y - 48, 24, 12);
  // Angry eyes + moustache.
  ctx.fillStyle = '#222';
  ctx.fillRect(f.x - 8, f.y - 32, 5, 3); ctx.fillRect(f.x + 3, f.y - 32, 5, 3);
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(f.x - 7, f.y - 22, 14, 3);
  // Pitchfork.
  ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(f.x + 18, f.y + 22); ctx.lineTo(f.x + 26, f.y - 26); ctx.stroke();
  ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(f.x + 22, f.y - 30); ctx.lineTo(f.x + 30, f.y - 30); ctx.stroke();
  text(ctx, 'FARMER BRAM', f.x, f.y - 60, 12, '#fff', 'center', true);
  const modeLabel = f.mode === 'chase' ? 'CHASING!' : f.mode === 'search' ? 'SEARCHING...' : f.mode === 'decoy' ? 'FOOLED!' : 'PATROLLING';
  text(ctx, modeLabel, f.x, f.y + 38, 10, f.mode === 'chase' ? '#ff6b4a' : '#ffe9a8', 'center', true);
  if (s.spotted) {
    text(ctx, '!', f.x, f.y - 78, 26, '#ff3b30', 'center', true);
  }
  // Patrol path dotted line.
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  f.waypoints.forEach((w, i) => { if (i === 0) ctx.moveTo(w.x, w.y); else ctx.lineTo(w.x, w.y); });
  ctx.closePath(); ctx.stroke();
  ctx.setLineDash([]);
}

export function drawTurkey(ctx, s) {
  const t = s.turkey;
  const blink = t.invulnT > 0 && Math.floor(s.time * 12) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.35;
  shadow(ctx, t.x, t.y + 16, 18, 5);
  const bob = t.moving ? Math.sin(s.time * 14) * 2 : Math.sin(s.time * 3) * 1;
  ctx.save();
  ctx.translate(t.x, t.y + bob);
  // Tail fan.
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(-t.face + Math.PI + i * 0.35);
    ctx.fillStyle = i % 2 ? '#8a5a2b' : '#a86a35';
    ctx.beginPath(); ctx.ellipse(-20, 0, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#7a4a22';
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9c6a35';
  ctx.beginPath(); ctx.ellipse(2, -3, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Wing.
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath(); ctx.ellipse(-2, 2, 11, 7, 0.3, 0, Math.PI * 2); ctx.fill();
  // Head + beak + wattle.
  const hx = Math.cos(t.face) * 20, hy = Math.sin(t.face) * 20;
  ctx.fillStyle = '#f2c48d';
  ctx.beginPath(); ctx.arc(hx, hy - 6, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8702a';
  ctx.beginPath(); ctx.moveTo(hx + Math.cos(t.face) * 8, hy - 6); ctx.lineTo(hx + Math.cos(t.face) * 16, hy - 4); ctx.lineTo(hx + Math.cos(t.face) * 8, hy - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d94f30';
  ctx.beginPath(); ctx.ellipse(hx + Math.cos(t.face) * 6, hy + 2, 3, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(hx + 2, hy - 8, 2, 0, Math.PI * 2); ctx.fill();
  // Legs.
  ctx.strokeStyle = '#e8702a'; ctx.lineWidth = 3;
  const lp = t.moving ? Math.sin(s.time * 14) * 5 : 0;
  ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(-6 + lp, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(6 - lp, 18); ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  text(ctx, 'YOU — the turkey', t.x, t.y - 30, 11, '#fff', 'center', true);
  if (t.smokeT > 0) {
    ctx.fillStyle = 'rgba(220,220,220,0.5)';
    ctx.beginPath(); ctx.arc(t.x, t.y, 30, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawCorn(ctx, s) {
  for (const c of s.corn) {
    if (c.taken) continue;
    const bobY = Math.sin(s.time * 3 + c.bob) * 3;
    shadow(ctx, c.x, c.y + 12, 10, 3);
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.ellipse(c.x, c.y + bobY, 9, 13, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f7a2a';
    ctx.beginPath(); ctx.ellipse(c.x, c.y + bobY - 12, 5, 7, -0.3, 0, Math.PI * 2); ctx.fill();
    text(ctx, '+10', c.x, c.y + bobY - 22, 10, '#ffe066', 'center', true);
  }
}

export function drawExit(ctx, s) {
  const ex = WORLD.x + WORLD.w - 34, ey = WORLD.y + 30;
  if (!s.exitOpen) {
    ctx.fillStyle = 'rgba(120,90,40,0.9)';
    rr(ctx, ex - 26, ey - 22, 52, 44, 4); ctx.fill();
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(ex - 2, ey - 22, 4, 44);
    text(ctx, 'BARN GATE — locked', ex - 8, ey + 42, 10, '#fff', 'right', true);
    return;
  }
  const g = ctx.createRadialGradient(ex, ey, 4, ex, ey, 60);
  g.addColorStop(0, 'rgba(120,255,140,0.6)'); g.addColorStop(1, 'rgba(120,255,140,0)');
  ctx.fillStyle = g; ctx.fillRect(ex - 60, ey - 60, 120, 120);
  ctx.fillStyle = '#2f9e44';
  rr(ctx, ex - 26, ey - 22, 52, 44, 4); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', ex, ey);
  text(ctx, 'ESCAPE ROUTE — go!', ex - 8, ey + 42, 11, '#b6ffb6', 'right', true);
}

export function drawParticles(ctx, s) {
  for (const p of s.particles) {
    ctx.globalAlpha = clamp(p.t, 0, 1);
    ctx.fillStyle = p.color || 'rgba(200,200,200,0.7)';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const sm of s.smokes) {
    ctx.fillStyle = 'rgba(220,220,220,0.35)';
    ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2); ctx.fill();
  }
  for (const d of s.decoys) {
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.ellipse(d.x, d.y, 12, 16, 0.3, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'CORN DECOY', d.x, d.y - 26, 10, '#ffe066', 'center', true);
  }
}

export function drawAnnotations(ctx, s) {
  // In-scene callouts: patrol path, knife arc, oven heat, escape route, corn value.
  const calls = [
    { x: s.farmer.x - 130, y: s.farmer.y + 70, tx: s.farmer.x - 40, ty: s.farmer.y + 30, label: 'BRAM\u2019S PATROL PATH' },
    { x: s.knives[0].cx - 150, y: s.knives[0].cy - 60, tx: s.knives[0].cx - 20, ty: s.knives[0].cy - 10, label: 'KNIFE SWING ARC' },
    { x: s.oven.x - 190, y: s.oven.y + 90, tx: s.oven.x - 50, ty: s.oven.y + 40, label: 'OVEN HEAT = -1 HEART' },
  ];
  for (const c of calls) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.tx, c.ty); ctx.stroke();
    ctx.fillStyle = 'rgba(20,10,4,0.82)';
    const w = ctx.measureText(c.label).width + 16;
    ctx.font = 'bold 11px Georgia, serif';
    const ww = ctx.measureText(c.label).width + 16;
    rr(ctx, c.x - ww / 2, c.y - 11, ww, 22, 5); ctx.fill();
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 1; ctx.stroke();
    text(ctx, c.label, c.x, c.y, 11, '#ffe9a8', 'center', true);
  }
  // Distance-to-exit ribbon.
  const d = Math.round(dist(s.turkey.x, s.turkey.y, WORLD.x + WORLD.w - 34, WORLD.y + 30) / 10);
  text(ctx, 'EXIT ' + d + 'm — follow the green gate', WORLD.x + 20, WORLD.y + WORLD.h - 16, 12, '#b6ffb6', 'left', true);
}

export function drawMinimap(ctx, s, x, y, w, h) {
  ctx.fillStyle = '#1a0e04';
  rr(ctx, x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = '#b3541e'; ctx.lineWidth = 1; ctx.stroke();
  const sx = w / WORLD.w, sy = h / WORLD.h;
  const px = (wx) => x + (wx - WORLD.x) * sx;
  const py = (wy) => y + (wy - WORLD.y) * sy;
  ctx.fillStyle = '#ff7a1e';
  ctx.fillRect(px(s.oven.x) - 3, py(s.oven.y) - 3, 6, 6);
  ctx.fillStyle = '#e8ecf2';
  for (const k of s.knives) ctx.fillRect(px(k.cx) - 2, py(k.cy) - 2, 4, 4);
  ctx.fillStyle = '#ffd94d';
  for (const c of s.corn) if (!c.taken) ctx.fillRect(px(c.x) - 1, py(c.y) - 1, 3, 3);
  ctx.fillStyle = '#ff3b30';
  ctx.beginPath(); ctx.arc(px(s.farmer.x), py(s.farmer.y), 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(px(s.turkey.x), py(s.turkey.y), 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7fae4e'; ctx.lineWidth = 2;
  ctx.strokeRect(px(WORLD.x + WORLD.w - 60), py(WORLD.y + 8), 26 * sx + 8, 22 * sy + 8);
}

export function drawHUD(ctx, s) {
  ctx.fillStyle = C.panel;
  ctx.fillRect(HUD.x, HUD.y, HUD.w, HUD.h);
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(HUD.x, HUD.y, HUD.w, 4);
  ctx.strokeStyle = C.panelEdge; ctx.lineWidth = 2;
  ctx.strokeRect(HUD.x + 1, HUD.y + 1, HUD.w - 2, HUD.h - 2);
  let y = 22;
  text(ctx, 'TURKEY RUN', HUD.x + 18, y, 22, C.gold, 'left', true);
  text(ctx, 'Thanksgiving Escape', HUD.x + HUD.w - 18, y, 11, C.cream, 'right', false);
  y = 44;
  ctx.fillStyle = '#b3541e'; ctx.fillRect(HUD.x + 18, y, HUD.w - 36, 2);
  y = 62;
  // Objective.
  text(ctx, 'OBJECTIVE', HUD.x + 18, y, 11, C.gold, 'left', true);
  const endRun = s.screen === 'end';
  const objectiveLine = endRun
    ? (s.endKind === 'escaped' ? 'Run complete — you escaped the farm!' : 'Run complete — caught by Farmer Bram')
    : 'Collect corn, reach the Barn Gate';
  const cornLine = endRun
    ? 'Corn ' + (s.totalCorn + s.cornGot) + ' total  ·  ' + (s.endKind === 'escaped' ? 'Gate OPEN — escaped!' : 'Gate locked')
    : 'Corn ' + s.cornGot + ' / ' + s.corn.length + '  ·  Gate ' + (s.exitOpen ? 'OPEN' : 'locked');
  text(ctx, objectiveLine, HUD.x + 18, y + 16, 12, C.white, 'left', false);
  text(ctx, cornLine, HUD.x + 18, y + 32, 11, (endRun && s.endKind === 'escaped') || s.exitOpen ? '#7dff8a' : C.dim, 'left', false);
  y = 112;
  // Score / distance / time row.
  const boxW = (HUD.w - 36 - 12) / 3;
  const stats = [
    ['SCORE', String(s.totalScore + s.score)],
    ['DISTANCE', Math.round(s.totalDistance + s.distance) + ' m'],
    ['TIME', Math.floor(s.time) + 's'],
  ];
  stats.forEach((st, i) => {
    const bx = HUD.x + 18 + i * (boxW + 6);
    ctx.fillStyle = '#3a2412'; rr(ctx, bx, y, boxW, 40, 6); ctx.fill();
    ctx.strokeStyle = '#6b4a1a'; ctx.lineWidth = 1; ctx.stroke();
    text(ctx, st[0], bx + boxW / 2, y + 11, 9, C.dim, 'center', true);
    text(ctx, st[1], bx + boxW / 2, y + 27, 15, C.white, 'center', true);
  });
  y = 168;
  // Lives.
  text(ctx, 'LIVES', HUD.x + 18, y, 11, C.gold, 'left', true);
  for (let i = 0; i < 3; i++) {
    const hx = HUD.x + 70 + i * 26;
    ctx.fillStyle = i < s.lives ? '#ff3b30' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(hx - 5, y - 2, 7, 0, Math.PI * 2); ctx.arc(hx + 5, y - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 11, y + 2); ctx.lineTo(hx, y + 12); ctx.lineTo(hx + 11, y + 2); ctx.fill();
  }
  text(ctx, s.lives + ' hearts left', HUD.x + 160, y, 11, C.cream, 'left', false);
  y = 192;
  // Alarm meter.
  text(ctx, 'ALARM — FARMER BRAM', HUD.x + 18, y, 11, C.gold, 'left', true);
  text(ctx, s.alarm >= 70 ? 'SPOTTED! RUN!' : s.alarm >= 30 ? 'Suspicious...' : 'Calm', HUD.x + HUD.w - 18, y, 11, s.alarm >= 70 ? '#ff6b4a' : C.cream, 'right', true);
  ctx.fillStyle = '#1a0e04'; rr(ctx, HUD.x + 18, y + 10, HUD.w - 36, 16, 8); ctx.fill();
  const aw = (HUD.w - 36) * clamp(s.alarm, 0, 100) / 100;
  const ag = ctx.createLinearGradient(HUD.x + 18, 0, HUD.x + HUD.w - 18, 0);
  ag.addColorStop(0, '#7fae4e'); ag.addColorStop(0.6, '#f2c14e'); ag.addColorStop(1, '#ff3b30');
  if (s.alarm > 0) {
    ctx.fillStyle = ag; rr(ctx, HUD.x + 18, y + 10, Math.max(aw, 4), 16, 8); ctx.fill();
  }
  text(ctx, Math.round(s.alarm) + '%', HUD.x + HUD.w - 24, y + 18, 10, '#fff', 'right', true);
  y = 238;
  // Gadgets.
  text(ctx, 'GADGETS — 7 total', HUD.x + 18, y, 11, C.gold, 'left', true);
  GADGET_DEFS.forEach((g, i) => {
    const gy = y + 14 + i * 28;
    const left = s.gadgets[g.key];
    ctx.fillStyle = '#3a2412'; rr(ctx, HUD.x + 18, gy, HUD.w - 36, 25, 6); ctx.fill();
    ctx.strokeStyle = left > 0 ? '#6b4a1a' : 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();
    text(ctx, g.icon, HUD.x + 28, gy + 12, 10, C.gold, 'left', true);
    text(ctx, g.name, HUD.x + 78, gy + 12, 12, left > 0 ? C.white : C.dim, 'left', true);
    text(ctx, g.desc, HUD.x + HUD.w - 52, gy + 12, 10, C.dim, 'right', true);
    text(ctx, '×' + left, HUD.x + HUD.w - 22, gy + 12, 12, left > 0 ? C.gold : C.dim, 'right', true);
  });
  y = 342;
  // Minimap.
  text(ctx, 'MINIMAP', HUD.x + 18, y, 11, C.gold, 'left', true);
  drawMinimap(ctx, s, HUD.x + 18, y + 8, HUD.w - 36, 48);
  y = 414;
  // Zone list.
  text(ctx, 'CAMPAIGN — 5 ZONES', HUD.x + 18, y - 8, 11, C.gold, 'left', true);
  const zoneY = 414;
  ZONES.forEach((z, i) => {
    const zx = HUD.x + 18 + i * 65;
    ctx.fillStyle = i === s.zoneIndex ? '#b3541e' : i < s.zoneIndex ? '#2f6b2f' : '#3a2412';
    rr(ctx, zx, zoneY, 60, 19, 5); ctx.fill();
    text(ctx, (i < s.zoneIndex ? '✓ ' : '') + z.name, zx + 30, zoneY + 10, 10, '#fff', 'center', true);
  });
  // Legend, with clear space to the panel's bottom edge.
  text(ctx, 'LEGEND:  Bram — farmer  ·  Bessie — oven  ·  Knife — blade', HUD.x + 18, 458, 9, C.dim, 'left', false);
}

export function drawMessage(ctx, s) {
  if (s.messageT <= 0) return;
  ctx.font = 'bold 13px Georgia, serif';
  const ww = ctx.measureText(s.message).width + 30;
  ctx.fillStyle = 'rgba(20,10,4,0.85)';
  rr(ctx, WORLD.x + WORLD.w / 2 - ww / 2, WORLD.y + 10, ww, 26, 8); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.stroke();
  text(ctx, s.message, WORLD.x + WORLD.w / 2, WORLD.y + 23, 13, C.cream, 'center', true);
}

export function drawTitle(ctx, s) {
  // Farm backdrop strip behind the title.
  drawBackground(ctx, s);
  drawHay(ctx, s);
  drawOven(ctx, s);
  drawKnife(ctx, s);
  drawFarmer(ctx, s);
  drawTurkey(ctx, s);
  ctx.fillStyle = 'rgba(20,10,4,0.72)';
  ctx.fillRect(WORLD.x, WORLD.y, WORLD.w, WORLD.h);
  text(ctx, 'TURKEY RUN', WORLD.x + WORLD.w / 2, WORLD.y + 96, 64, C.gold, 'center', true);
  text(ctx, '5 Farm Zones  ·  3 Deadly Threats  ·  7 Gadgets', WORLD.x + WORLD.w / 2, WORLD.y + 146, 20, C.white, 'center', true);
  text(ctx, 'Escape the Thanksgiving Table — outrun Farmer Bram, dodge Old Bessie Oven', WORLD.x + WORLD.w / 2, WORLD.y + 176, 15, C.cream, 'center', false);
  text(ctx, 'and the Carver\u2019s Knife, from the Coop to the Barn.', WORLD.x + WORLD.w / 2, WORLD.y + 198, 15, C.cream, 'center', false);
  ctx.fillStyle = '#b3541e';
  rr(ctx, WORLD.x + WORLD.w / 2 - 150, WORLD.y + 226, 300, 44, 10); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, '▶  PRESS ENTER OR CLICK TO RUN', WORLD.x + WORLD.w / 2, WORLD.y + 249, 15, '#fff', 'center', true);
  text(ctx, 'WASD / Arrows move  ·  SPACE Wing Sprint  ·  1 Corn Decoy  ·  2 Smoke Puff', WORLD.x + WORLD.w / 2, WORLD.y + 300, 13, C.cream, 'center', false);
  text(ctx, 'Coop → Kitchen → Yard → Cornfield → Barn', WORLD.x + WORLD.w / 2, WORLD.y + 330, 13, C.gold, 'center', true);
  text(ctx, 'Collect corn (+10) · Reach the Barn Gate · 3 hearts · Don\u2019t get carved', WORLD.x + WORLD.w / 2, WORLD.y + 356, 12, C.dim, 'center', false);
  text(ctx, 'A complete turkey escape game — title, run, HUD, end screen', WORLD.x + WORLD.w / 2, WORLD.y + 400, 11, 'rgba(255,255,255,0.55)', 'center', false);
  drawHUD(ctx, s);
}

export function drawEnd(ctx, s) {
  drawBackground(ctx, s);
  drawHay(ctx, s);
  drawCorn(ctx, s);
  drawOven(ctx, s);
  // The chase is over, but the farm is still alive behind the results.
  s.farmer.x = WORLD.x + 180; s.farmer.y = WORLD.y + 330; s.farmer.dir = 0.3;
  s.turkey.x = WORLD.x + 700; s.turkey.y = WORLD.y + 330; s.turkey.face = 0;
  drawKnife(ctx, s);
  drawFarmer(ctx, s);
  drawTurkey(ctx, s);
  ctx.fillStyle = 'rgba(20,10,4,0.66)';
  ctx.fillRect(WORLD.x, WORLD.y, WORLD.w, WORLD.h);
  const escaped = s.endKind === 'escaped';
  text(ctx, escaped ? 'ESCAPED!' : 'CAUGHT!', WORLD.x + WORLD.w / 2, WORLD.y + 84, 58, escaped ? '#7dff8a' : '#ff6b4a', 'center', true);
  text(ctx, escaped ? 'You beat Thanksgiving dinner — the turkey lives to gobble another day!' : 'Farmer Bram wins this time... the oven was already warm.', WORLD.x + WORLD.w / 2, WORLD.y + 128, 15, C.white, 'center', false);
  // Score card.
  ctx.fillStyle = '#3a2412';
  rr(ctx, WORLD.x + 180, WORLD.y + 158, WORLD.w - 360, 150, 12); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'FINAL SCORE', WORLD.x + WORLD.w / 2, WORLD.y + 182, 12, C.gold, 'center', true);
  text(ctx, String(s.endScore), WORLD.x + WORLD.w / 2, WORLD.y + 218, 44, '#fff', 'center', true);
  const dist = Math.round(s.totalDistance + s.distance);
  text(ctx, 'Distance ' + dist + ' m   ·   Corn ' + (s.totalCorn + s.cornGot) + '   ·   Zones cleared ' + (escaped ? 5 : s.zoneIndex) + ' / 5', WORLD.x + WORLD.w / 2, WORLD.y + 258, 13, C.cream, 'center', false);
  text(ctx, 'MEDAL: ' + s.medal + '    GHOST RATING: ' + s.ghost + (escaped ? '  (barely seen!)' : '  (spotted too often)'), WORLD.x + WORLD.w / 2, WORLD.y + 286, 14, C.gold, 'center', true);
  ctx.fillStyle = '#b3541e';
  rr(ctx, WORLD.x + WORLD.w / 2 - 130, WORLD.y + 330, 260, 42, 10); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, '↻  PRESS R TO RUN AGAIN', WORLD.x + WORLD.w / 2, WORLD.y + 352, 15, '#fff', 'center', true);
  text(ctx, '5 Zones · 3 Threats · 7 Gadgets — Turkey Run', WORLD.x + WORLD.w / 2, WORLD.y + 400, 11, 'rgba(255,255,255,0.55)', 'center', false);
  drawHUD(ctx, s);
}

export function render(ctx, s) {
  ctx.clearRect(0, 0, 1280, 480);
  if (s.screen === 'title') { drawTitle(ctx, s); return; }
  if (s.screen === 'end') { drawEnd(ctx, s); return; }
  drawBackground(ctx, s);
  drawHay(ctx, s);
  drawExit(ctx, s);
  drawCorn(ctx, s);
  drawOven(ctx, s);
  drawKnife(ctx, s);
  drawFarmer(ctx, s);
  drawTurkey(ctx, s);
  drawParticles(ctx, s);
  drawAnnotations(ctx, s);
  drawHUD(ctx, s);
  drawMessage(ctx, s);
  if (s.caughtFlash > 0) {
    ctx.fillStyle = 'rgba(255,40,20,' + clamp(s.caughtFlash, 0, 0.4) + ')';
    ctx.fillRect(WORLD.x, WORLD.y, WORLD.w, WORLD.h);
  }
  if (s.heatFlash > 0) {
    ctx.fillStyle = 'rgba(255,120,20,0.18)';
    ctx.fillRect(WORLD.x, WORLD.y, WORLD.w, WORLD.h);
  }
}
