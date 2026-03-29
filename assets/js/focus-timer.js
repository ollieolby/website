const timerLabel = document.getElementById("timer-label");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");

const startingSeconds = 25 * 60;
let remainingSeconds = startingSeconds;
let timerId = null;

function renderTime() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerLabel.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
    startButton.textContent = "Start";
  }
}

function tick() {
  if (remainingSeconds === 0) {
    stopTimer();
    return;
  }

  remainingSeconds -= 1;
  renderTime();
}

startButton.addEventListener("click", () => {
  if (timerId !== null) {
    stopTimer();
    return;
  }

  startButton.textContent = "Pause";
  timerId = window.setInterval(tick, 1000);
});

resetButton.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = startingSeconds;
  renderTime();
});

renderTime();
