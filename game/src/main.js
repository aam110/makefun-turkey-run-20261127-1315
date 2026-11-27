// Main: boot, keyboard and mouse input, game loop, ?shot= staging.
// Shot modes are real renders of the game itself, frozen at a fixed moment:
//   ?shot=title  title screen   ?shot=play   strongest chase frame
//   ?shot=play2  close chase by the oven   ?shot=end   escaped end screen
import { newRun, createState, updateGame, useGadget, ZONES } from './state.js';
import { render } from './render.js';
import { SoundEngine } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sound = new SoundEngine();
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = parseInt(params.get('seed') || '1', 10) || 1;

let state = newRun();
state.screen = 'title';

const input = { up: false, down: false, left: false, right: false };

function keyDown(e) {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') input.up = true;
  if (k === 'arrowdown' || k === 's') input.down = true;
  if (k === 'arrowleft' || k === 'a') input.left = true;
  if (k === 'arrowright' || k === 'd') input.right = true;
  if (k === ' ') { e.preventDefault(); useGadget(state, 'sprint', sound); }
  if (k === '1') useGadget(state, 'decoy', sound);
  if (k === '2') useGadget(state, 'smoke', sound);
  if (k === 'm') sound.toggleMute();
  if (k === 'enter' && state.screen === 'title') startRun();
  if (k === 'r' && (state.screen === 'end' || state.screen === 'title')) startRun();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
}

function keyUp(e) {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') input.up = false;
  if (k === 'arrowdown' || k === 's') input.down = false;
  if (k === 'arrowleft' || k === 'a') input.left = false;
  if (k === 'arrowright' || k === 'd') input.right = false;
}

function startRun() {
  sound.ensure();
  sound.gobble();
  state = newRun();
  state.screen = 'play';
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
canvas.addEventListener('mousedown', (e) => {
  sound.ensure();
  if (state.screen === 'title' || state.screen === 'end') { startRun(); return; }
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (1280 / rect.width);
  const y = (e.clientY - rect.top) * (480 / rect.height);
  // HUD gadget buttons: click a gadget row to use it.
  if (x > 938 && x < 1262) {
    if (y > 252 && y < 278) useGadget(state, 'sprint', sound);
    else if (y > 282 && y < 308) useGadget(state, 'decoy', sound);
    else if (y > 312 && y < 338) useGadget(state, 'smoke', sound);
  }
});

// Stage a frozen, dense frame for screenshots. Positions are fixed so the
// render is identical every time the same shot is taken.
function stageShot(name) {
  if (name === 'title') {
    state = createState(1);
    state.screen = 'title';
    state.turkey.x = 300; state.turkey.y = 250; state.turkey.face = 0;
    state.farmer.x = 620; state.farmer.y = 210; state.farmer.dir = Math.PI;
    state.time = 1.5;
    return;
  }
  if (name === 'play2') {
    state = createState(1);
    state.screen = 'play';
    state.score = 120; state.distance = 640; state.totalDistance = 640;
    state.cornGot = 4; state.alarm = 82; state.lives = 2;
    state.turkey.x = 700; state.turkey.y = 260; state.turkey.face = 0.3;
    state.farmer.x = 560; state.farmer.y = 230; state.farmer.dir = 0.25; state.farmer.mode = 'chase';
    state.oven.x = 812; state.oven.y = 262;
    state.knives[0].ang = 0.6;
    state.corn[0].taken = true; state.corn[1].taken = true;
    state.message = 'SPOTTED! Bram is on your tail — sprint for the gate!';
    state.messageT = 99;
    state.time = 2.2;
    return;
  }
  if (name === 'end') {
    state = createState(4);
    state.screen = 'end';
    state.endKind = 'escaped';
    state.endScore = 760;
    state.medal = 'GOLD';
    state.ghost = 'S+';
    state.totalScore = 760; state.totalDistance = 2140; state.totalCorn = 32;
    state.time = 96;
    return;
  }
  // Default cover: ?shot=play — the strongest chase frame.
  state = createState(1);
  state.screen = 'play';
  state.score = 90; state.distance = 480; state.totalDistance = 480;
  state.cornGot = 3; state.alarm = 64; state.lives = 3;
  state.turkey.x = 480; state.turkey.y = 250; state.turkey.face = 0.15;
  state.farmer.x = 330; state.farmer.y = 220; state.farmer.dir = 0.1; state.farmer.mode = 'chase';
  state.oven.x = 812; state.oven.y = 262;
  state.knives[0].ang = 2.4; state.knives[1].ang = 4.1;
  state.corn[0].taken = true;
  state.exitOpen = true;
  state.message = 'The BARN GATE is open! Run for it!';
  state.messageT = 99;
  state.time = 1.8;
}

if (shot) {
  stageShot(shot);
  render(ctx, state);
  // Frozen frame: no loop, so the screenshot is deterministic.
  window.__game = { state, input, startRun, shot: true };
} else {
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    updateGame(state, input, dt, sound);
    render(ctx, state);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__game = { get state() { return state; }, set state(v) { state = v; }, input, startRun, shot: false };
}
