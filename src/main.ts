import './style.css';
import { GameApplication } from './game/GameApplication';

async function boot(): Promise<void> {
  const host = document.getElementById('canvas-host');
  if (!host) {
    throw new Error('Canvas host not found');
  }

  const hudCount = document.getElementById('shape-count')!;
  const hudArea = document.getElementById('shape-area')!;
  const spawnRateLabel = document.getElementById('spawn-rate')!;
  const gravLabel = document.getElementById('grav-value')!;
  const spawnInc = document.getElementById('spawn-inc')!;
  const spawnDec = document.getElementById('spawn-dec')!;
  const gravInc = document.getElementById('grav-inc')!;
  const gravDec = document.getElementById('grav-dec')!;
  
  // Mobile controls (may not exist on desktop)
  const spawnIncMobile = document.getElementById('spawn-inc-mobile');
  const spawnDecMobile = document.getElementById('spawn-dec-mobile');
  const gravIncMobile = document.getElementById('grav-inc-mobile');
  const gravDecMobile = document.getElementById('grav-dec-mobile');

  const game = new GameApplication();
  await game.initialize(host);
  game.setupHUD(hudCount, hudArea);
  game.setupControls(
    spawnRateLabel,
    gravLabel,
    spawnInc,
    spawnDec,
    gravInc,
    gravDec,
  );
  game.setupResize(host);
}

boot().catch((err) => {
  console.error(err);
});
