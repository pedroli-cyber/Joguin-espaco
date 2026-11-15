const $ = (id) => document.getElementById(id);
const player = $("player"), obstacle = $("obstacle"), item = $("item");
const scoreEl = $("score"), timeEl = $("time");
const startScreen = $("startScreen"), gameOver = $("gameOver");
const parallax = [$("stars"), $("planet"), $("planet2")];

const W = 800, GROUND = 60, GRAVITY = 2200, JUMP = 800, TOTAL_TIME = 60;
let running = false, score, time, y, vy, obsX, itemX, itemY, last;

function resetGame() {
  score = 0; time = TOTAL_TIME; y = 0; vy = 0;
  obsX = W + 200; spawnItem(W + 500);
  scoreEl.textContent = score; timeEl.textContent = time;
  draw();
}
function spawnItem(x) { itemX = x; itemY = 20 + Math.random() * 120; }

function jump() {
  if (!running) return;
  if (y === 0) vy = JUMP;
}

function overlap(a, b, pad = 6) {
  return a.left + pad < b.right - pad && a.right - pad > b.left + pad &&
         a.top + pad < b.bottom - pad && a.bottom - pad > b.top + pad;
}

function draw() {
  player.style.bottom = (GROUND + y) + "px";
  obstacle.style.left = obsX + "px";
  item.style.left = itemX + "px";
  item.style.bottom = (GROUND + itemY) + "px";
}

function loop(now) {
  if (!running) return;
  const dt = Math.min((now - last) / 1000, 0.05); last = now;

  // pulo (gravidade)
  vy -= GRAVITY * dt; y += vy * dt;
  if (y <= 0) { y = 0; vy = 0; }

  // velocidade aumenta com o tempo
  const speed = 300 + (TOTAL_TIME - time) * 3.5;
  obsX -= speed * dt; itemX -= speed * dt;
  if (obsX < -60) obsX = W + 50 + Math.random() * 350;
  if (itemX < -40) spawnItem(W + 100 + Math.random() * 400);

  // timer
  time -= dt;
  timeEl.textContent = Math.max(0, Math.ceil(time));
  draw();

  // colisoes
  const p = player.getBoundingClientRect();
  if (overlap(p, obstacle.getBoundingClientRect(), 8)) return endGame("Você bateu numa rocha lunar!");
  if (overlap(p, item.getBoundingClientRect(), 2)) {
    score++; scoreEl.textContent = score; spawnItem(W + 100 + Math.random() * 400);
  }
  if (time <= 0) return endGame("O tempo acabou!");

  requestAnimationFrame(loop);
}

function startGame() {
  resetGame();
  startScreen.classList.add("hidden"); gameOver.classList.add("hidden");
  parallax.forEach((e) => e.classList.remove("paused"));
  running = true; last = performance.now();
  requestAnimationFrame(loop);
}

function endGame(msg) {
  running = false;
  parallax.forEach((e) => e.classList.add("paused"));
  $("goMsg").textContent = msg + " Cristais coletados: " + score;
  gameOver.classList.remove("hidden");
}

$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", startGame);
document.addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp"].includes(e.code)) { e.preventDefault(); jump(); }
});
$("game").addEventListener("pointerdown", (e) => { if (e.target.tagName !== "BUTTON") jump(); });

resetGame();
