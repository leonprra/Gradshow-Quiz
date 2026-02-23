/*
Mobile-friendly 6-question quiz (p5.js)
Optimized for Telegram, iOS, Android
Screens: Start > Quiz > Calculating > Result
*/

let bg;
var time;
var wait = 6000;
var preparingWait = 5000;

let calc = ["Aligning grids.", "Brewing coffee.","Re-exporting again.","Trusting the process.","Reducing visual noise.","Asking for quick feedback."];
let preparing = ["Sharpening pencils...","Going to Artfriend...", "Searching Pinterest...", "Setting the mood...", "Preparing your journey..."];
let idx = 0;
let lastSwap = 0;
let swapMs = 1200;

const MAX_CONTENT_W = 600;

// Layout
let pad = 18;
let btnH = 56;
let btnGap = 14;

// App state
let appState = "start"; // "start" | "preparing" | "quiz" | "calculating" | "result"

// Data
let QUESTIONS = [];
let QIMG = {};
let RESULT_IMAGES = {};

let currentIdx = 0;
let scoringBits = [];
let locked = false;
let selectedChoice = null; // Track which choice is selected (0 or 1)

function preload() {
  QIMG.start = loadImage("start.png");

  // --- Question media placeholders ---
  QIMG.q1 = loadImage("q1.png");
  QIMG.q2 = loadImage("q2.png");
  QIMG.q3 = loadImage("q3.png");
  QIMG.q4 = loadImage("q4.png");
  QIMG.q5 = loadImage("q5.png");
  QIMG.q6 = loadImage("q6.png");
  //  QIMG.q7 = loadImage("q7.png");


  // --- Result images placeholders (16 variations) ---
  // RESULT_IMAGES["AAAA"] = loadImage("results/AAAA.png");
  // ... etc
}

function setup() {
  time = millis();

  // IMPORTANT: keep a reference to the p5 canvas element
  const c = createCanvas(windowWidth, windowHeight);

  // Force fullscreen for Telegram and other webviews
  // Telegram's WebView sometimes reports wrong window dimensions
  setTimeout(() => {
    resizeCanvas(window.innerWidth, window.innerHeight);
  }, 100);

  // -----------------------------
  // iOS Safari + Telegram touch fixes
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
      prompt: "You wake up in the morning and there's still an hour left till your alarm rings, what do you do?",
      imgId: "q1",
      choices: ["Sleep in lah, rest is best", "Rise and grind, lets get this bread!"]
    },
    {
      id: "q2",
      type: "padding",
      prompt: "Time to get dressed, what do you wear!",
      imgId: "q2",
      choices: ["Take it chill, I'll wear whats on the chair", "I'm dressing to impress, looking my best!"]
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
      prompt: "You finally arrived at your workspace. Your desk situation is… questionable.",
      imgId: "q4",
      choices: ["Carve out a small area in the mess.", "Reset the whole table before anything else"]
    },
    {
      id: "q5",
      type: "scoring",
      prompt: "Your deskmate has been staring at their screen for the past 10 minutes… same tab, same sigh, zero progress.",
      imgId: "q5",
      choices: ["Roll my chair over, “What’s not working?”", "Roll my chair over, “Coffee break!!”"]
    },
    {
      id: "q6",
      type: "scoring",
      prompt: "The deadline is coming up! You're done, but it's not perfect.",
      imgId: "q6",
      choices: ["Send it. Version two can be better", "Keep tweaking till the last minute"]
    },
    {
      id: "q7",
      type: "padding",
      prompt: "You have a 15-minute break after an intense session.",
      imgId: "q7",
      choices: ["Let's all go for a walk and a snack!", "Lemme reset my brain in a calm space"]
    }
  ];
}

function draw() {
  background(255);

  for (let row = 0; row < 40; row++) {
    for (let col = 0; col < 80; col++) {
      const px = col * 24;
      const py = row * 24;
      fill("lightgrey");
      circle(px, py, 2);
    }
  }

  if (appState === "start") drawStartScreen();
  else if (appState === "preparing") drawPreparingScreen();
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
  textFont("Courier New");
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

function drawPreparingScreen() {
  const cw = contentWidth();
  const cx = contentX();

  textSize(22);
  fill(20);
  if (millis() - time >= preparingWait) {
    text("Let's go!", width / 2, height / 2 - 40);
  } else {
    text("Preparing your quiz...", width / 2, height / 2 - 40);
  }

  textSize(14);
  fill(120);
  if (millis() - lastSwap > swapMs) {
    idx = (idx + 1) % preparing.length;
    lastSwap = millis();
  }

  if (millis() - time <= preparingWait) {
    text(preparing[idx], width / 2, height / 2);
  }

  // Auto-advance to quiz after wait time
  if (millis() - time >= preparingWait) {
    appState = "quiz";
    time = millis(); // Reset time for quiz
  }
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
  return false;
}

// iOS + Telegram fix: use touches[0] when available
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
    if (hit(px, py, cx, btnY, cw, btnH)) {
      appState = "preparing";
      time = millis(); // Start preparing timer
      idx = 0; // Reset animation index
    }
    return;
  }

  if (appState === "calculating") {
    const btnY = height - pad - btnH;
    if (millis() - time >= wait && hit(px, py, cx, btnY, cw, btnH)) {
      appState = "result";
    }
    return;
  }

  if (appState === "result") {
    const btnY = height - pad - btnH;
    const half = (cw - btnGap) / 2;

    if (hit(px, py, cx, btnY, half, btnH)) restartQuiz();
    else if (hit(px, py, cx + half + btnGap, btnY, half, btnH)) shareResult();
    return;
  }

  // Quiz screen - handle choice selection and confirmation
  if (appState === "quiz") {
    const btnY1 = height - pad - btnH * 3 - btnGap * 2;
    const btnY2 = height - pad - btnH * 2 - btnGap;
    const confirmY = height - pad - btnH;
    
    // Confirm button dimensions (must match drawConfirmButton)
    const confirmBtnWidth = 140;
    const confirmX = cx + (cw - confirmBtnWidth) / 2;

    // Check if tapping choice 1
    if (hit(px, py, cx, btnY1, cw, btnH)) {
      selectedChoice = 0;
      return;
    }
    
    // Check if tapping choice 2
    if (hit(px, py, cx, btnY2, cw, btnH)) {
      selectedChoice = 1;
      return;
    }
    
    // Check if tapping confirm button (using centered narrower dimensions)
    if (hit(px, py, confirmX, confirmY, confirmBtnWidth, btnH)) {
      if (selectedChoice !== null) {
        answerQuestion(selectedChoice);
      }
      return;
    }
  }
}

function answerQuestion(choice) {
  locked = true;
  const q = QUESTIONS[currentIdx];
  if (q.type === "scoring") scoringBits.push(choice);
  setTimeout(() => {
    currentIdx++;
    selectedChoice = null; // Reset selection for next question
    locked = false;
  }, 120);
}

function restartQuiz() {
  currentIdx = 0;
  scoringBits = [];
  selectedChoice = null;
  appState = "start";
}

/* ---------------- SHARE ---------------- */

function shareResult() {
  const key = getResultKey();
  const text = `I am a ${key}, from this Gradshow 2026 Quiz!`;

  // Telegram has its own share mechanism
  if (window.Telegram && window.Telegram.WebApp) {
    // Use Telegram's native share if available
    window.Telegram.WebApp.shareLink(window.location.href, text);
  } else if (navigator.share) {
    navigator.share({
      title: "What Tool Are You!",
      text: text,
      url: window.location.href
    }).catch(() => {
      // Fallback if cancelled
      copyToClipboard(text);
    });
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  const fullText = text + " " + window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText)
      .then(() => alert("Result copied to clipboard!"))
      .catch(() => alert(fullText));
  } else {
    alert(fullText);
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

  // Draw prompt FIRST (above image)
  fill("#4a00a2");
  textSize(18);
  textWrap(WORD);
  text(q.prompt, cx, pad + 50, cw);

// Draw image SECOND (below prompt)
  const imgTop = pad + 150;
  const imgH = height * 0.35;
  drawMediaFrame(q.imgId, cx, imgTop, cw, imgH);

  // Two choice buttons
  const btnY1 = height - pad - btnH * 3 - btnGap * 2;
  const btnY2 = height - pad - btnH * 2 - btnGap;
  
  // Draw choice buttons with selected state
  const isSelected0 = selectedChoice === 0;
  const isSelected1 = selectedChoice === 1;
  
  drawChoiceButton(cx, btnY1, cw, btnH, q.choices[0], 
    isTouching(cx, btnY1, cw, btnH), isSelected0);
  drawChoiceButton(cx, btnY2, cw, btnH, q.choices[1], 
    isTouching(cx, btnY2, cw, btnH), isSelected1);
  
  // Confirm button at the bottom (different style)
  const confirmY = height - pad - btnH;
  const canConfirm = selectedChoice !== null;
  
  // Confirm button dimensions (must match drawConfirmButton)
  const confirmBtnWidth = 200;
  const confirmX = cx + (cw - confirmBtnWidth) / 2;
  
  drawConfirmButton(confirmX, confirmY, confirmBtnWidth, btnH, "Confirm", 
    isTouching(confirmX, confirmY, confirmBtnWidth, btnH), canConfirm);
}

function drawMediaFrame(imgId, x, y, w, h) {
  noFill();
  noStroke();

  const media = QIMG[imgId];
  if (!media) {
    noStroke();
    fill(245);
    rect(x, y, w, h, 8);
    fill(140);
    textSize(14);
    text("Image placeholder", x + w / 2, y + h / 2);
    return;
  }

  const f = fitRect(media.width, media.height, w, h);
  image(media, x + f.x, y + f.y, f.w, f.h);
}

function drawButton(x, y, w, h, label, hot) {
  fill(hot ? "#DABBFF" : "#EEE0FF");
  noStroke();
  rect(x+44, y, w-88, h, 18);
  
  fill(hot ? 250 : 20);
  textSize(hot ? 17 : 16);
  text(label, x + w / 2, y + h / 2);
}

function drawChoiceButton(x, y, w, h, label, hot, isSelected) {
  // Selected state: darker purple fill, white text
  // Unselected state: light purple fill, dark text
  if (isSelected) {
    fill("#AE87E7"); // Selected: bold purple
    noStroke();
    rect(x+22, y, w-44, h, 10);
  } else {
    fill(hot ? "#DABBFF" : "#EEE0FF"); // Hover or normal state
    stroke("#AE87E7");
    strokeWeight(2); 
    rect(x+20, y, w-40, h, 10);
  }
  
  
  
  // Text color based on selection
  noStroke();
  fill(isSelected ? 255 : (hot ? 250 : 20));
  textSize(isSelected ? 15 : (hot ? 16 : 15));
  text(label, x + w / 2, y + h / 2);
}

function drawConfirmButton(x, y, w, h, label, hot, enabled) {
  // Make button narrower - hug the text more
  const confirmBtnWidth = 150; // Fixed narrower width
  const confirmX = width/2; // Center it
  
  // Different shape and color for confirm button
  if (enabled) {
    fill(hot ? "#FFC107" : "#7a00db"); // Purple when enabled
  } else {
    fill("#EAEAEA"); // Gray when disabled
  }
  
  noStroke();
  ellipse(confirmX, y+h/2, confirmBtnWidth, h); 
  
  fill(enabled ? 255 : 150);
  textSize(17);
  textStyle(BOLD);
  text(label, confirmX, y + h / 2);
  textStyle(NORMAL);
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
  return { 
    w: sw * s, 
    h: sh * s, 
    x: (dw - sw * s) / 2, 
    y: (dh - sh * s) / 2 
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Force scroll to top after resize (helps with Telegram)
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
}
