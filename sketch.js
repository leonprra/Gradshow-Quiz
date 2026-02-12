/*
Mobile-friendly 6-question quiz (p5.js)
Screens:
- Start
- Quiz
- Calculating
- Result
*/

let bg;
var time;
var wait = 6000;

let calc = ["Aligning grids.", "Brewing coffee.","Re-exporting again.","Trusting the process.","Reducing visual noise.","Asking for quick feedback."];
let idx = 0;
let lastSwap = 0;
let swapMs = 1200;

const MAX_CONTENT_W = 600;

// Layout
let pad = 18;
let btnH = 56;
let btnGap = 14;

// App state
let appState = "start"; // "start" | "quiz" | "calculating" | "result"

// Data
let QUESTIONS = [];
let QIMG = {};
let RESULT_IMAGES = {};

let currentIdx = 0;
let scoringBits = [];
let locked = false;

// Optional images
let startImage; // hero image on start screen

function preload() {
  QIMG.start = loadImage("start.png");

  // --- Question media placeholders ---
  QIMG.q1 = loadImage("q1.png");
  // QIMG["q2"] = loadImage("q2.png");
  // QIMG["q3"] = loadImage("q3.png");
  // QIMG["q4"] = loadImage("q4.png");
  // QIMG["q5"] = loadImage("q5.png");
  // QIMG["q6"] = loadImage("q6.png");

  // --- Result images placeholders (16 variations) ---
  // RESULT_IMAGES["AAAA"] = loadImage("results/AAAA.png");
  // RESULT_IMAGES["AAAB"] = loadImage("results/AAAB.png");
  // RESULT_IMAGES["AABA"] = loadImage("results/AABA.png");
  // RESULT_IMAGES["AABB"] = loadImage("results/AABB.png");
  // RESULT_IMAGES["ABAA"] = loadImage("results/ABAA.png");
  // RESULT_IMAGES["ABAB"] = loadImage("results/ABAB.png");
  // RESULT_IMAGES["ABBA"] = loadImage("results/ABBA.png");
  // RESULT_IMAGES["ABBB"] = loadImage("results/ABBB.png");
  // RESULT_IMAGES["BAAA"] = loadImage("results/BAAA.png");
  // RESULT_IMAGES["BAAB"] = loadImage("results/BAAB.png");
  // RESULT_IMAGES["BABA"] = loadImage("results/BABA.png");
  // RESULT_IMAGES["BABB"] = loadImage("results/BABB.png");
  // RESULT_IMAGES["BBAA"] = loadImage("results/BBAA.png");
  // RESULT_IMAGES["BBAB"] = loadImage("results/BBAB.png");
  // RESULT_IMAGES["BBBA"] = loadImage("results/BBBA.png");
  // RESULT_IMAGES["BBBB"] = loadImage("results/BBBB.png");
}

function setup() {
  time = millis();

  // IMPORTANT: keep a reference to the p5 canvas element
  const c = createCanvas(windowWidth, windowHeight);

  // -----------------------------
  // iOS Safari touch fixes
  // -----------------------------
  // 1) Disable browser touch gestures (scroll/zoom) on the canvas
  c.elt.style.touchAction = "none";
  c.elt.style.webkitUserSelect = "none";
  c.elt.style.webkitTouchCallout = "none";

  // 2) Add non-passive listeners so preventDefault works on iOS
  //    This prevents the page from "stealing" taps as scroll.
  c.elt.addEventListener(
    "touchstart",
    (e) => e.preventDefault(),
    { passive: false }
  );
  c.elt.addEventListener(
    "touchmove",
    (e) => e.preventDefault(),
    { passive: false }
  );
  c.elt.addEventListener(
    "touchend",
    (e) => e.preventDefault(),
    { passive: false }
  );

  textFont("Helvetica");
  textAlign(CENTER, CENTER);

  QUESTIONS = [
    {
      id: "q1",
      type: "padding",
      prompt: "You wake up in the morning and there’s still an hour left till your alarm rings, what do you do?",
      imgId: "q1",
      choices: ["Sleep in lah, rest is best", "Rise and grind, lets get this bread!"]
    },
    {
      id: "q2",
      type: "padding",
      prompt: "Time to get dressed, what do you wear!",
      imgId: "q2",
      choices: ["Today ima take it chill, baggy fit with slippers", "I’m dressing to impress, looking my best!"]
    },
    {
      id: "q3",
      type: "scoring",
      prompt: "Oh no! The bus is delayed and you are late, what do you do?",
      imgId: "q3",
      choices: ["I take another route and update the group.", "Buy snacks and share with everyone"]
    },
    {
      id: "q4",
      type: "scoring",
      prompt: "A junior is struggling to make a poster with a certain effect.",
      imgId: "q4",
      choices: ["Sit with them and guide step by step", "Rally designers and brainstorm"]
    },
    {
      id: "q5",
      type: "scoring",
      prompt: "You finally reach your workspace. The table setup is… questionable.",
      imgId: "q5",
      choices: ["Carve out a small work area", "Reset the whole table"]
    },
    {
      id: "q6",
      type: "scoring",
      prompt: "The deadline is near. It works, but it’s not perfect.",
      imgId: "q6",
      choices: ["Send it. Version two can be better", "Keep tweaking till the last minute"]
    },
    {
      id: "q7",
      type: "padding",
      prompt: "You have a 15-minute break after an intense session.",
      imgId: "q7",
      choices: ["Go for a walk with friends", "Reset alone in a calm space"]
    }
  ];
}

function draw() {
  background(255);

  for (let row = 0; row < 40; row++) {
    for (let col = 0; col < 80; col++) {
      const px = col * 40;
      const py = row * 40;
      fill("lightgrey");
      circle(px, py, 3);
    }
  }

  if (appState === "start") drawStartScreen();
  else if (appState === "quiz") drawQuiz();
  else if (appState === "calculating") drawCalculatingScreen();
  else if (appState === "result") drawResultScreen();
}

/* ---------------- SCREENS ---------------- */

function drawStartScreen() {
  const cw = contentWidth();
  const cx = contentX();

  textSize(28);
  push();
  textFont("Helvetica");
  textStyle(BOLD);
  fill("#7a00db");
  text("WHAT TOOL ARE YOU?", width / 2, pad + 60);
  pop();

  textSize(16);
  fill(50);
  text(
    "A day-in-the-life quiz for Design students.",
    cx,
    pad + 120,
    cw
  );

  // Image
  const imgTop = pad + 170;
  const imgH = height * 0.35;
  drawMediaFrame("start", cx, imgTop, cw, 1.5 * imgH);

  // Start button
  const btnY = height - pad - btnH;
  drawButton(cx, btnY, cw, btnH, "Start Quiz", isTouching(cx, btnY, cw, btnH));
}

function drawQuiz() {
  if (currentIdx >= QUESTIONS.length) {
    appState = "calculating";
    return;
  }
  drawQuestionScreen(QUESTIONS[currentIdx]);
  time = millis();
}

function drawCalculatingScreen() {
  const cw = contentWidth();
  const cx = contentX();

  textSize(22);
  fill(20);
  if (millis() - time >= wait) {
    text("Done!", width / 2, height / 2 - 40);
  } else {
    text("Calculating your results…", width / 2, height / 2 - 40);
  }

  textSize(14);
  fill(120);
  if (millis() - lastSwap > swapMs) {
    idx = (idx + 1) % calc.length;
    lastSwap = millis();
  }

  if (millis() - time <= wait) {
    text(calc[idx], width / 2, height / 2);
  } else if (millis() - time >= wait) {
    // no-op
  }

  const btnY = height - pad - btnH;
  if (millis() - time >= wait) {
    drawButton(cx, btnY, cw, btnH, "Reveal Result", isTouching(cx, btnY, cw, btnH));
  }
}

function drawResultScreen() {
  const cw = contentWidth();
  const cx = contentX();
  const key = getResultKey();

  textSize(22);
  fill(20);
  text("Your Result", width / 2, pad + 22);

  const imgTop = pad + 70;
  const imgH = height * 0.45;

  const res = RESULT_IMAGES[key];
  if (res) {
    const fitted = fitRect(res.width, res.height, cw, imgH);
    image(res, cx + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
  } else {
    noStroke();
    fill(245);
    rect(cx, imgTop, cw, imgH, 16);
    fill(140);
    text("Result image here", width / 2, imgTop + imgH / 2);
  }

  // Buttons
  const btnY = height - pad - btnH;
  const half = (cw - btnGap) / 2;

  drawButton(cx, btnY, half, btnH, "Restart", isTouching(cx, btnY, half, btnH));
  drawButton(cx + half + btnGap, btnY, half, btnH, "Share", isTouching(cx + half + btnGap, btnY, half, btnH));
}

/* ---------------- INTERACTION ---------------- */

function mousePressed() {
  handleTap(mouseX, mouseY);
}

// iOS fix: use touches[0] when available (more reliable than touchX/touchY)
function touchStarted() {
  const t = (touches && touches.length) ? touches[0] : null;
  const px = t ? t.x : mouseX;
  const py = t ? t.y : mouseY;

  handleTap(px, py);
  return false; // stop default page scroll
}

function handleTap(px, py) {
  if (locked) return;

  const cw = contentWidth();
  const cx = contentX();

  if (appState === "start") {
    const btnY = height - pad - btnH;
    if (hit(px, py, cx, btnY, cw, btnH)) appState = "quiz";
    return;
  }

  if (appState === "calculating") {
    const btnY = height - pad - btnH;
    if (hit(px, py, cx, btnY, cw, btnH)) appState = "result";
    return;
  }

  if (appState === "result") {
    const btnY = height - pad - btnH;
    const half = (cw - btnGap) / 2;

    if (hit(px, py, cx, btnY, half, btnH)) restartQuiz();
    else if (hit(px, py, cx + half + btnGap, btnY, half, btnH)) shareResult();
    return;
  }

  // Quiz answers
  const btnY1 = height - pad - btnH * 2 - btnGap;
  const btnY2 = height - pad - btnH;

  if (hit(px, py, cx, btnY1, cw, btnH)) answerQuestion(0);
  else if (hit(px, py, cx, btnY2, cw, btnH)) answerQuestion(1);
}

function answerQuestion(choice) {
  locked = true;
  const q = QUESTIONS[currentIdx];
  if (q.type === "scoring") scoringBits.push(choice);
  setTimeout(() => {
    currentIdx++;
    locked = false;
  }, 120);
}

function restartQuiz() {
  currentIdx = 0;
  scoringBits = [];
  appState = "start";
}

/* ---------------- SHARE ---------------- */

function shareResult() {
  const key = getResultKey();
  const text = `I got ${key} on the Designer Quiz!`;

  if (navigator.share) {
    navigator.share({
      title: "Designer Quiz",
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text + " " + window.location.href);
    alert("Result copied to clipboard!");
  }
}

/* ---------------- HELPERS ---------------- */

function getResultKey() {
  const letters = scoringBits.map(b => (b === 0 ? "A" : "B"));
  while (letters.length < 4) letters.push("A");
  return letters.slice(0, 4).join("");
}

function drawQuestionScreen(q) {
  const cw = contentWidth();
  const cx = contentX();

  textSize(15);
  fill(20);
  text(`Q ${currentIdx + 1} / ${QUESTIONS.length}`, width / 2, pad + 12);

  const imgTop = pad + 42;
  const imgH = height * 0.45;
  drawMediaFrame(q.imgId, cx, imgTop, cw, imgH);

  fill("#7a00db");
  textSize(18);
  textWrap(WORD);
  text(q.prompt, cx, imgTop + imgH + 30, cw);

  const btnY1 = height - pad - btnH * 2 - btnGap;
  const btnY2 = height - pad - btnH;

  drawButton(cx, btnY1, cw, btnH, q.choices[0], isTouching(cx, btnY1, cw, btnH));
  drawButton(cx, btnY2, cw, btnH, q.choices[1], isTouching(cx, btnY2, cw, btnH));
}

function drawMediaFrame(imgId, x, y, w, h) {
  noFill();
  noStroke();
  rect(x, y, w, h);

  const media = QIMG[imgId];
  if (!media) {
    noStroke();
    fill(245);
    rect(x, y, w, h);
    fill(140);
    text("Image placeholder", x + w / 2, y + h / 2);
    return;
  }

  const f = fitRect(media.width, media.height, w, h);
  image(media, x + f.x, y + f.y, f.w, f.h);
}

function drawButton(x, y, w, h, label, hot) {
  fill(hot ? "#DABBFF" : "#EEE0FF");
  noStroke();
  rect(x, y, w, h, 18);
  fill(hot ? 250 : 20);
  textSize(hot ? 17 : 16);
  text(label, x + w / 2, y + h / 2);
}

function contentWidth() {
  return min(width - pad * 2, MAX_CONTENT_W);
}

function contentX() {
  return (width - contentWidth()) / 2;
}

function hit(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function isTouching(x, y, w, h) {
  return hit(mouseX, mouseY, x, y, w, h);
}

function fitRect(sw, sh, dw, dh) {
  const s = min(dw / sw, dh / sh);
  return { w: sw * s, h: sh * s, x: (dw - sw * s) / 2, y: (dh - sh * s) / 2 };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
