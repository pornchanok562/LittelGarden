// Total timer duration: 25 minutes = 1500 seconds
const TOTAL_SECONDS = 25 * 60;

// Growth stages per timeframe:
// - ระยะที่ 1 (25:00 - 20:00 = 1500 ถึง 1200 วินาที): tulips/2.png และ tulips/3.png
// - ระยะที่ 2 (19:59 - 15:00 = 1199 ถึง 900 วินาที): tulips/3.png และ tulips/4.png
// - ระยะที่ 3 (14:59 - 10:00 = 899 ถึง 600 วินาที): tulips/4.png และ tulips/5pink.png
// - ระยะที่ 4 (09:59 - 05:00 = 599 ถึง 300 วินาที): tulips/5pink.png และ tulips/6pink.png
// - ระยะที่ 5 (04:59 - 00:01 = 299 ถึง 1 วินาที): tulips/7pink.png และ tulips/pink.png
// - ระยะที่ 6 (00:00 = 0 วินาที): tulips/pinkdone1.png และ tulips/pinkdone2.png

function getStagePair(secondsLeft) {
  if (secondsLeft >= 1200) {
    return ['tulips/2.png', 'tulips/3.png'];
  } else if (secondsLeft >= 900) {
    return ['tulips/3.png', 'tulips/4.png'];
  } else if (secondsLeft >= 600) {
    return ['tulips/4.png', 'tulips/5pink.png'];
  } else if (secondsLeft >= 300) {
    return ['tulips/5pink.png', 'tulips/6pink.png'];
  } else if (secondsLeft >= 1) {
    return ['tulips/7pink.png', 'tulips/pink.png'];
  } else {
    return ['tulips/pinkdone1.png', 'tulips/pinkdone2.png'];
  }
}

// App State
let remainingSeconds = TOTAL_SECONDS;
let timerInterval = null;
let bgAnimationInterval = null;
let growthAnimInterval = null;
let finishSparkleInterval = null;

let currentBgIndex = 1;
let currentGrowthFrameIndex = 0;
let currentDoneFrameIndex = 0;

// DOM Elements
const views = {
  start: document.getElementById('view-start'),
  choose: document.getElementById('view-choose'),
  timer: document.getElementById('view-timer'),
  stopConfirm: document.getElementById('view-stop-confirm'),
  finish: document.getElementById('view-finish')
};

const startBgCanvas = document.getElementById('start-animated-bg');
const btnGotoChoose = document.getElementById('btn-goto-choose');

const btnPrevFlower = document.getElementById('btn-prev-flower');
const btnNextFlower = document.getElementById('btn-next-flower');
const chooseFlowerImg = document.getElementById('choose-flower-img');
const btnPlant = document.getElementById('btn-plant');

const growingFlowerImg = document.getElementById('growing-flower-img');
const timerDisplay = document.getElementById('timer-display');
const btnStopPrompt = document.getElementById('btn-stop-prompt');

const confirmFlowerImg = document.getElementById('confirm-flower-img');
const confirmTimerDisplay = document.getElementById('confirm-timer-display');
const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
const btnConfirmSure = document.getElementById('btn-confirm-sure');

const finishedFlowerImg = document.getElementById('finished-flower-img');
const btnDone = document.getElementById('btn-done');

const btnMinimize = document.getElementById('btn-minimize');
const btnClose = document.getElementById('btn-close');

// --- Window Controls ---
if (window.electronAPI) {
  btnMinimize?.addEventListener('click', () => window.electronAPI.minimizeWindow());
  btnClose?.addEventListener('click', () => window.electronAPI.closeWindow());
}

// --- View Router ---
function showView(viewKey) {
  Object.keys(views).forEach(key => {
    views[key].classList.toggle('active', key === viewKey);
  });

  if (viewKey === 'start') {
    startBgAnimation();
  } else {
    stopBgAnimation();
  }

  if (viewKey === 'timer') {
    startGrowthAnimation();
  } else {
    stopGrowthAnimation();
  }

  if (viewKey === 'finish') {
    startFinishSparkle();
  } else {
    stopFinishSparkle();
  }
}

// --- Start Screen BG (Using BG/BGmain1.png) ---
function startBgAnimation() {
  stopBgAnimation();
  startBgCanvas.style.backgroundImage = `url('BG/BGmain1.png')`;
}

function stopBgAnimation() {
  if (bgAnimationInterval) {
    clearInterval(bgAnimationInterval);
    bgAnimationInterval = null;
  }
}

// --- Growth Animation (Swaps pair every 2 seconds) ---
function startGrowthAnimation() {
  stopGrowthAnimation();
  currentGrowthFrameIndex = 0;
  updateGrowthVisual();

  growthAnimInterval = setInterval(() => {
    currentGrowthFrameIndex = currentGrowthFrameIndex === 0 ? 1 : 0;
    const pair = getStagePair(remainingSeconds);
    growingFlowerImg.src = pair[currentGrowthFrameIndex];
  }, 2000);
}

function stopGrowthAnimation() {
  if (growthAnimInterval) {
    clearInterval(growthAnimInterval);
    growthAnimInterval = null;
  }
}

// --- Timer Format Helper ---
function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// --- Update Visuals on Tick ---
function updateGrowthVisual() {
  const pair = getStagePair(remainingSeconds);
  growingFlowerImg.src = pair[currentGrowthFrameIndex];
  timerDisplay.textContent = formatTime(remainingSeconds);
}

// --- Start Timer Engine ---
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      timerDisplay.textContent = formatTime(remainingSeconds);
    } else {
      finishTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function finishTimer() {
  pauseTimer();
  showView('finish');
}

// --- Finish Animation (pinkdone1.png and pinkdone2.png every 2s) ---
function startFinishSparkle() {
  stopFinishSparkle();
  const doneFrames = ['tulips/pinkdone1.png', 'tulips/pinkdone2.png'];
  currentDoneFrameIndex = 0;
  finishedFlowerImg.src = doneFrames[0];

  finishSparkleInterval = setInterval(() => {
    currentDoneFrameIndex = currentDoneFrameIndex === 0 ? 1 : 0;
    finishedFlowerImg.src = doneFrames[currentDoneFrameIndex];
  }, 2000);
}

function stopFinishSparkle() {
  if (finishSparkleInterval) {
    clearInterval(finishSparkleInterval);
    finishSparkleInterval = null;
  }
}

// --- Button Event Handlers ---
btnGotoChoose.addEventListener('click', () => {
  showView('choose');
});

// Navigation in choose screen
const flowers = [
  { id: 'pink', img: 'tulips/pink.png', canPlant: true },
  { id: 'yellow', img: 'tulips/yellow.png', canPlant: false }
];
let currentFlowerIndex = 0;

function updateFlowerSelection() {
  const flower = flowers[currentFlowerIndex];
  chooseFlowerImg.src = flower.img;
  chooseFlowerImg.style.opacity = flower.id === 'yellow' ? '0.7' : '1';
  if (flower.canPlant) {
    btnPlant.disabled = false;
    btnPlant.classList.remove('btn-disabled');
  } else {
    btnPlant.disabled = true;
    btnPlant.classList.add('btn-disabled');
  }
}

btnPrevFlower.addEventListener('click', () => {
  currentFlowerIndex = (currentFlowerIndex - 1 + flowers.length) % flowers.length;
  updateFlowerSelection();
});

btnNextFlower.addEventListener('click', () => {
  currentFlowerIndex = (currentFlowerIndex + 1) % flowers.length;
  updateFlowerSelection();
});

btnPlant.addEventListener('click', () => {
  if (btnPlant.disabled) return;
  remainingSeconds = TOTAL_SECONDS;
  currentGrowthFrameIndex = 0;
  showView('timer');
  startTimer();
});

btnStopPrompt.addEventListener('click', () => {
  pauseTimer();
  stopGrowthAnimation();
  // Display current stage in confirmation dialog
  const pair = getStagePair(remainingSeconds);
  confirmFlowerImg.src = pair[currentGrowthFrameIndex];
  confirmTimerDisplay.textContent = formatTime(remainingSeconds);
  showView('stopConfirm');
});

btnConfirmCancel.addEventListener('click', () => {
  showView('timer');
  startTimer(); // Resume counting
});

btnConfirmSure.addEventListener('click', () => {
  pauseTimer();
  remainingSeconds = TOTAL_SECONDS;
  showView('choose');
});

btnDone.addEventListener('click', () => {
  remainingSeconds = TOTAL_SECONDS;
  showView('choose');
});

// Initial boot
showView('start');
