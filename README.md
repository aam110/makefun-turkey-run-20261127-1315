# Turkey Run: 5 Zones, 3 Threats, 7 Gadgets — Escape the Thanksgiving Table

[![turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/aam110/makefun-turkey-run-20261127-1315/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/aam110/makefun-turkey-run-20261127-1315/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

A complete turkey escape game for the [turkey-run-game-01 bounty](https://make.fun/bounty/turkey-run-game-01). You are the turkey. Thanksgiving dinner is coming, and Farmer Bram is not bluffing.

## The game

Escape across **5 named farm zones** — Coop, Kitchen, Yard, Cornfield, Barn — outrunning **Farmer Bram** (vision cone + alarm meter + patrol, chase, search and decoy-fooled states), dodging **Old Bessie Oven** (a glowing heat zone that costs a heart) and the **Carver's Knife** (swinging blade arcs on patrol). Collect corn (+10 each) to unlock the Barn Gate, then sprint for the exit.

**3 threats, 7 gadgets:** Wing Sprint ×3 (SPACE, 2× speed), Corn Decoy ×2 (press 1, Bram chases the fake corn), Smoke Puff ×2 (press 2, vanish from the vision cone). 3 hearts, alarm meter, score, distance, timer, farm minimap, zone campaign list and a named-threat legend — all in a full side-panel HUD.

Win all five zones and you get the escaped end screen with your score, a medal (Bronze / Silver / Gold) and a GHOST rating. Get caught three times and Farmer Bram serves dinner.

## Controls

- Move: WASD or Arrow keys
- Wing Sprint: SPACE
- Corn Decoy: 1
- Smoke Puff: 2
- Mute: M · Restart: R · Click the title or end screen to run again
- Gadget rows in the HUD are clickable too

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome. No network requests, no images, no audio files — all art is procedural Canvas 2D and all sound is WebAudio oscillators.

## Structure

- `game/index.html` — page + canvas
- `game/style.css` — page frame
- `game/src/main.js` — boot, input, loop, `?shot=` staging
- `game/src/state.js` — zones, farmer AI, detection, gadgets, scoring
- `game/src/render.js` — farm, entities, HUD, annotations, title and end screens
- `game/src/audio.js` — WebAudio sound engine (gobble, alarm, pickup, win)
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes `dossier.json`)
- `screenshots/` — 4 real renders of the game: cover chase, oven chase, title, escaped end

MIT licensed. Built fresh for make.fun.
