/*
Mobile-friendly 10-question quiz (p5.js)
Optimized for Telegram, iOS, Android
Screens: Start > Quiz > Calculating > Result
WITH SIMPLE FADE
11 Character Results
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
let answers = []; // Changed from scoringBits to answers
let locked = false;
let selectedChoice = null;

// Gallery modal state
let showGallery = false;
let galleryViewChar = null; // Which character is being viewed in gallery

// Simple fade animation with scaling
let questionAlpha = 0;
let questionScale = 1.0;
let isTransitioning = false;

// Character names mapping
const CHARACTERS = {
  hammer: "Hammer",
  calipers: "Calipers",
  vr: "VR Headset",
  mouse: "Mouse",
  mat: "Cutting Mat",
  glue: "Glue Stick",
  sewing: "Sewing Kit",
  tape: "Duct Tape",
  notepad: "Notepad",
  coffee: "Coffee",
  ruler: "Ruler",
  thumb: "USB Drive"
};

function preload() {
  QIMG.start = loadImage("start.png");

  // Question images
  QIMG.q1 = loadImage("q1.png");
  QIMG.q2 = loadImage("q2.png");
  QIMG.q3 = loadImage("q3.png");
  QIMG.q4 = loadImage("q4.png");
  QIMG.q5 = loadImage("q5.png");
  QIMG.q6 = loadImage("q6.png");
  QIMG.q7 = loadImage("q7.png");
  QIMG.q8 = loadImage("q8.png");
  QIMG.q9 = loadImage("q9.png");
  QIMG.q10 = loadImage("q10.png");

  // Result images - 11 characters
  RESULT_IMAGES["hammer"] = loadImage("Hammer.png");
  RESULT_IMAGES["calipers"] = loadImage("Calipers.png");
  RESULT_IMAGES["vr"] = loadImage("VR.png");
  RESULT_IMAGES["mouse"] = loadImage("Mouse.png");
  RESULT_IMAGES["mat"] = loadImage("CuttingMat.png");
  RESULT_IMAGES["glue"] = loadImage("GlueStick.png");
  RESULT_IMAGES["sewing"] = loadImage("Sewing.png");
  RESULT_IMAGES["tape"] = loadImage("Tape.png");
  RESULT_IMAGES["notepad"] = loadImage("Notepad.png");
  RESULT_IMAGES["coffee"] = loadImage("Coffee.png");
  RESULT_IMAGES["ruler"] = loadImage("Ruler.png");
  RESULT_IMAGES["thumb"] = loadImage("Thumb.png");
  
  // Thumbnail images for gallery
  RESULT_IMAGES["hammer_thumb"] = loadImage("hammer_thumbnail.png");
  RESULT_IMAGES["calipers_thumb"] = loadImage("calipers_thumbnail.png");
  RESULT_IMAGES["vr_thumb"] = loadImage("vr_thumbnail.png");
  RESULT_IMAGES["mouse_thumb"] = loadImage("mouse_thumbnail.png");
  RESULT_IMAGES["mat_thumb"] = loadImage("mat_thumbnail.png");
  RESULT_IMAGES["glue_thumb"] = loadImage("glue_thumbnail.png");
  RESULT_IMAGES["sewing_thumb"] = loadImage("sewing_thumbnail.png");
  RESULT_IMAGES["tape_thumb"] = loadImage("tape_thumbnail.png");
  RESULT_IMAGES["notepad_thumb"] = loadImage("notepad_thumbnail.png");
  RESULT_IMAGES["coffee_thumb"] = loadImage("coffee_thumbnail.png");
  RESULT_IMAGES["ruler_thumb"] = loadImage("ruler_thumbnail.png");
  RESULT_IMAGES["thumb_thumb"] = loadImage("thumb_thumbnail.png");
}

function setup() {
  
  textFont("Inter Tight");
  textAlign(CENTER, CENTER);
  
  time = millis();

  const c = createCanvas(windowWidth, windowHeight);

  setTimeout(() => {
    resizeCanvas(window.innerWidth, window.innerHeight);
  }, 100);

  // iOS Safari + Telegram touch fixes
  c.elt.style.touchAction = "none";
  c.elt.style.webkitUserSelect = "none";
  c.elt.style.webkitTouchCallout = "none";

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
      choices: ["Roll my chair over, What's not working?", "Roll my chair over, Coffee break!!"]
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
      choices: ["Let's all go for a walk and get a snack!", "Lemme reset my brain in a calm space"]
    },
    {
      id: "q8",
      type: "scoring",
      prompt: "You come across a once-in-a-lifetime moment of beauty, but your hands are full! Do you...",
      imgId: "q8",
      choices: ["Struggle to take out your phone to capture it", "Just enjoy it with your eyes"]
    },
    {
      id: "q9",
      type: "scoring",
      prompt: "Something's not working and you don't know why. Do you...",
      imgId: "q9",
      choices: ["Google it immediately", "Sit and think it through first"]
    },
    {
      id: "q10",
      type: "scoring",
      prompt: "New project brief just dropped. Do you...",
      imgId: "q10",
      choices: ["Start sketching ideas right away", "Read the brief 3 times and make a timeline first"]
    }
  ];
}

function draw() {
  // Update layout constants dynamically based on current screen size
  pad = max(12, min(22, height * 0.028));
  btnH = max(44, min(60, height * 0.082));
  btnGap = max(8, min(14, height * 0.02));

  background(255);

  const dotSpacing = 24;
  noStroke();
  for (let row = 0; row * dotSpacing <= height + dotSpacing; row++) {
    for (let col = 0; col * dotSpacing <= width + dotSpacing; col++) {
      fill("lightgrey");
      circle(col * dotSpacing, row * dotSpacing, 2);
    }
  }

  // Animation logic
  if (isTransitioning) {
    if (questionAlpha > 0) {
      questionAlpha -= 25;
      questionScale -= 0.012;
      if (questionAlpha < 0) questionAlpha = 0;
      if (questionScale < 0.9) questionScale = 0.9;
    }
  } else {
    if (questionAlpha < 255) {
      questionAlpha += 25;
      questionScale += 0.012;
      if (questionAlpha > 255) questionAlpha = 255;
      if (questionScale > 1.0) questionScale = 1.0;
    }
  }

  // Show rotation prompt for phones held in landscape
  if (width > height && height < 600) {
    drawLandscapeWarning();
    return;
  }

  if (appState === "start") drawStartScreen();
  else if (appState === "preparing") drawPreparingScreen();
  else if (appState === "quiz") drawQuiz();
  else if (appState === "calculating") drawCalculatingScreen();
  else if (appState === "result") drawResultScreen();
}

function drawLandscapeWarning() {
  fill(255);
  noStroke();
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(74, 0, 162);
  textSize(22);
  textStyle(BOLD);
  text("Please rotate your device", width / 2, height / 2 - 18);

  textStyle(NORMAL);
  textSize(15);
  fill(120);
  text("This quiz works best in portrait mode", width / 2, height / 2 + 16);
}

/* ---------------- SCREENS ---------------- */

function drawStartScreen() {
  const cw = contentWidth();
  const cx = contentX();

  const imgTop = pad + 20;
  const imgH = height * 0.15;
  drawMediaFrame("start", cx, imgTop, cw, 0.5 * imgH);

  let currentY = imgTop + (1.5 * imgH) + 20;
  const lineHeight = 1.5;

  push();
  textAlign(LEFT);

  textSize(18);
  textStyle(BOLD);
  fill("#7a00db");
  let txt1 = "Every design gradshow is more than just final pieces on display.";
  text(txt1, cx, currentY, cw);
  let lines1 = calculateLines(txt1, cw, 18);
  currentY += (18 * lineHeight * lines1) + 15;

  textSize(16);
  textStyle(NORMAL);
  fill(50);
  let txt2 = "It's different people, different strengths, different ways of working.";
  text(txt2, cx, currentY, cw);
  let lines2 = calculateLines(txt2, cw, 16);
  currentY += (16 * lineHeight * lines2) + 30;

  let txt3 = "Some people plan. Some people improvise. Some perfect. Some bring the vibes. Before you head down to the DID Graduation Show, let's find out… ";
  text(txt3, cx, currentY, cw);
  let lines3 = calculateLines(txt3, cw, 16);
  currentY += (16 * lineHeight * lines3) + 15;

  let txt4 = "What's your tool type?";
  text(txt4, cx, currentY, cw);

  pop();

  function calculateLines(txt, maxWidth, fontSize) {
    textSize(fontSize);
    let words = txt.split(' ');
    let line = '';
    let lineCount = 1;
    
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let testWidth = textWidth(testLine);
      
      if (testWidth > maxWidth && i > 0) {
        line = words[i] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    return lineCount;
  }

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

  if (millis() - time >= preparingWait) {
    questionAlpha = 0;
    questionScale = 0.9;
    appState = "quiz";
    time = millis();
  }
}

function drawQuiz() {
  if (currentIdx >= QUESTIONS.length) {
    appState = "calculating";
    time = millis();
    return;
  }
  drawQuestionScreen(QUESTIONS[currentIdx]);
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
  const character = getCharacter();
  const isLandscape = width > height;

  if (isLandscape) {
    // ── Desktop layout: image left, buttons stacked right ──
    const rightColW = min(240, width * 0.28);
    const rightColX = width - rightColW - pad;
    const imgAreaX = pad;
    const imgAreaY = pad;
    const imgAreaW = rightColX - pad * 2;
    const imgAreaH = height - pad * 2;

    // Result image — full left-side height
    const res = RESULT_IMAGES[character];
    if (res) {
      const fitted = fitRect(res.width, res.height, imgAreaW, imgAreaH);
      imageMode(CORNER);
      image(res, imgAreaX + fitted.x, imgAreaY + fitted.y, fitted.w, fitted.h);
    } else {
      noStroke();
      fill(245);
      rect(imgAreaX, imgAreaY, imgAreaW, imgAreaH, 16);
      fill(140);
      textSize(14);
      text("Result image here", imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH / 2);
    }

    // Three buttons vertically centred in right column
    const totalBtnH = btnH * 3 + btnGap * 2;
    const btnStartY = (height - totalBtnH) / 2;

    const visitBtnY   = btnStartY;
    const allToolsBtnY = btnStartY + btnH + btnGap;
    const shareBtnY   = btnStartY + (btnH + btnGap) * 2;

    drawButton(rightColX, visitBtnY,    rightColW, btnH, "Visit the website!", isTouching(rightColX, visitBtnY,    rightColW, btnH));
    drawButton(rightColX, allToolsBtnY, rightColW, btnH, "All Tools",          isTouching(rightColX, allToolsBtnY, rightColW, btnH));
    drawButton(rightColX, shareBtnY,    rightColW, btnH, "Share",              isTouching(rightColX, shareBtnY,    rightColW, btnH));

  } else {
    // ── Portrait layout (unchanged) ──
    const visitBtnY = height - pad - btnH * 2 - btnGap;
    const btnY      = height - pad - btnH;

    const imgPadding = 24;
    const imgTop     = pad + 20;
    const imgBottom  = visitBtnY - imgPadding;
    const availH     = imgBottom - imgTop;

    const res = RESULT_IMAGES[character];
    if (res) {
      const fitted = fitRect(res.width, res.height, cw, availH);
      imageMode(CORNER);
      image(res, cx + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
    } else {
      noStroke();
      fill(245);
      rect(cx, imgTop, cw, availH, 16);
      fill(140);
      textSize(14);
      text("Result image here", width / 2, imgTop + availH / 2);
    }

    drawButton(cx, visitBtnY, cw, btnH, "Visit the website!", isTouching(cx, visitBtnY, cw, btnH));

    const half = (cw - btnGap) / 2;
    drawButton(cx,              btnY, half, btnH, "All Tools", isTouching(cx,              btnY, half, btnH));
    drawButton(cx + half + btnGap, btnY, half, btnH, "Share",     isTouching(cx + half + btnGap, btnY, half, btnH));
  }

  if (showGallery) drawGalleryModal();
}

/* ---------------- GALLERY MODAL ---------------- */

function drawGalleryModal() {
  // Semi-transparent backdrop
  fill(0, 0, 0, 200);
  noStroke();
  rect(0, 0, width, height);
  
  const modalW = min(width - 40, 600);
  const modalH = height - 80;
  const modalX = (width - modalW) / 2;
  const modalY = 40;
  
  // If viewing a specific character
  if (galleryViewChar) {
    drawGalleryCharacterView(modalX, modalY, modalW, modalH);
  } else {
    drawGalleryGrid(modalX, modalY, modalW, modalH);
  }
}

function drawGalleryGrid(x, y, w, h) {
  // White modal background
  fill(255);
  noStroke();
  rect(x, y, w, h, 16);
  
  // Close button (X)
  const closeSize = 40;
  const closeX = x + w - closeSize - 10;
  const closeY = y + 10;
  
  if (isTouching(closeX, closeY, closeSize, closeSize)) {
    fill(240);
    circle(closeX + closeSize/2, closeY + closeSize/2, closeSize);
  }
  
  fill(100);
  textSize(28);
  textStyle(NORMAL);
  text("×", closeX + closeSize/2, closeY + closeSize/2);
  
  // Grid starts right after close button (removed title)
  const gridStartY = y + 60; // Less space at top
  const gridPad = 12;
  const cols = width > 600 ? 4 : 3;
  
  // Calculate available space for grid
  const availableW = w - gridPad * (cols + 1);
  const availableH = h - (gridStartY - y) - gridPad * 2;
  
  // Calculate thumbnail size based on available space
  const thumbWFromWidth = availableW / cols;
  const rows = width > 600 ? 3 : 4;
  const thumbHFromHeight = availableH / rows;
  
  // Use the smaller dimension to ensure everything fits
  let thumbW = thumbWFromWidth;
  let thumbH = thumbW * 1.33; // Maintain aspect ratio
  
  // If height doesn't fit, recalculate based on height
  if (thumbH * rows + gridPad * (rows - 1) > availableH) {
    thumbH = thumbHFromHeight;
    thumbW = thumbH / 1.33;
  }
  
  const tools = ["hammer", "calipers", "vr", "mouse", "mat", "glue", "sewing", "tape", "notepad", "coffee", "ruler", "thumb"];
  
  for (let i = 0; i < tools.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const thumbX = x + gridPad + col * (thumbW + gridPad);
    const thumbY = gridStartY + row * (thumbH + gridPad);
    
    // Thumbnail image
    const thumb = RESULT_IMAGES[tools[i] + "_thumb"];
    if (thumb) {
      imageMode(CORNER);
      image(thumb, thumbX, thumbY, thumbW, thumbH);
    } else {
      // Placeholder
      fill(240);
      noStroke();
      rect(thumbX, thumbY, thumbW, thumbH, 8);
      fill(150);
      textSize(12);
      text(tools[i], thumbX + thumbW/2, thumbY + thumbH/2);
    }
    
    // Hover effect
    if (isTouching(thumbX, thumbY, thumbW, thumbH)) {
      noFill();
      stroke(122, 0, 219); // Purple
      strokeWeight(3);
      rect(thumbX, thumbY, thumbW, thumbH, 8);
    }
  }
}

function drawGalleryCharacterView(x, y, w, h) {
  // White modal background
  fill(255);
  noStroke();
  rect(x, y, w, h, 16);
  
  // Back button
  const backSize = 40;
  const backX = x + 10;
  const backY = y + 10;
  
  if (isTouching(backX, backY, backSize + 40, backSize)) {
    fill(240);
    rect(backX, backY, backSize + 40, backSize, 20);
  }
  
  fill(100);
  textSize(20);
  textAlign(LEFT, CENTER);
  text("← Back", backX + 10, backY + backSize/2);
  
  // Character image (name removed, starts higher)
  const imgTop = y + 70; // Starts right after back button
  const imgH = h - 90; // More space for image
  const res = RESULT_IMAGES[galleryViewChar];
  
  if (res) {
    const fitted = fitRect(res.width, res.height, w - 40, imgH);
    imageMode(CORNER);
    image(res, x + 20 + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
  }
}

/* ---------------- INTERACTION ---------------- */

function handleGalleryTap(px, py) {
  const modalW = min(width - 40, 600);
  const modalH = height - 80;
  const modalX = (width - modalW) / 2;
  const modalY = 40;
  
  // Viewing specific character
  if (galleryViewChar) {
    // Back button
    const backSize = 40;
    const backX = modalX + 10;
    const backY = modalY + 10;
    
    if (hit(px, py, backX, backY, backSize + 40, backSize)) {
      galleryViewChar = null; // Back to grid
      return;
    }
    return;
  }
  
  // In grid view
  // Close button (X)
  const closeSize = 40;
  const closeX = modalX + modalW - closeSize - 10;
  const closeY = modalY + 10;
  
  if (hit(px, py, closeX, closeY, closeSize, closeSize)) {
    showGallery = false;
    return;
  }
  
  // Check thumbnail grid
  const gridStartY = modalY + 60; // Match drawGalleryGrid
  const gridPad = 12;
  const cols = width > 600 ? 4 : 3;
  
  // Calculate same way as drawGalleryGrid
  const availableW = modalW - gridPad * (cols + 1);
  const availableH = modalH - 60 - gridPad * 2;
  
  const thumbWFromWidth = availableW / cols;
  const rows = width > 600 ? 3 : 4;
  const thumbHFromHeight = availableH / rows;
  
  let thumbW = thumbWFromWidth;
  let thumbH = thumbW * 1.33;
  
  if (thumbH * rows + gridPad * (rows - 1) > availableH) {
    thumbH = thumbHFromHeight;
    thumbW = thumbH / 1.33;
  }
  
  const tools = ["hammer", "calipers", "vr", "mouse", "mat", "glue", "sewing", "tape", "notepad", "coffee", "ruler", "thumb"];
  
  for (let i = 0; i < tools.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const thumbX = modalX + gridPad + col * (thumbW + gridPad);
    const thumbY = gridStartY + row * (thumbH + gridPad);
    
    if (hit(px, py, thumbX, thumbY, thumbW, thumbH)) {
      galleryViewChar = tools[i]; // Open this character
      return;
    }
  }
}

function mousePressed() {
  handleTap(mouseX, mouseY);
  return false;
}

function touchStarted() {
  const t = (touches && touches.length) ? touches[0] : null;
  const px = t ? t.x : mouseX;
  const py = t ? t.y : mouseY;

  handleTap(px, py);
  return false;
}

function handleTap(px, py) {
  if (locked) return;

  const cw = contentWidth();
  const cx = contentX();

  if (appState === "start") {
    const btnY = height - pad - btnH;
    if (hit(px, py, cx, btnY, cw, btnH)) {
      appState = "preparing";
      time = millis();
      idx = 0;
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
    if (showGallery) { handleGalleryTap(px, py); return; }

    const isLandscape = width > height;

    if (isLandscape) {
      const rightColW  = min(240, width * 0.28);
      const rightColX  = width - rightColW - pad;
      const totalBtnH  = btnH * 3 + btnGap * 2;
      const btnStartY  = (height - totalBtnH) / 2;

      const visitBtnY    = btnStartY;
      const allToolsBtnY = btnStartY + btnH + btnGap;
      const shareBtnY    = btnStartY + (btnH + btnGap) * 2;

      if (hit(px, py, rightColX, visitBtnY,    rightColW, btnH)) { window.location.href = "https://vina-setiawaty.github.io/Gradwebsite-2026/loading.html"; return; }
      if (hit(px, py, rightColX, allToolsBtnY, rightColW, btnH)) { showGallery = true; galleryViewChar = null; return; }
      if (hit(px, py, rightColX, shareBtnY,    rightColW, btnH)) { shareResult(); return; }

    } else {
      const btnY      = height - pad - btnH;
      const visitBtnY = height - pad - btnH * 2 - btnGap;
      const half      = (cw - btnGap) / 2;

      if (hit(px, py, cx, visitBtnY, cw, btnH))              { window.location.href = "https://vina-setiawaty.github.io/Gradwebsite-2026/loading.html"; return; }
      if (hit(px, py, cx, btnY, half, btnH))                 { showGallery = true; galleryViewChar = null; return; }
      if (hit(px, py, cx + half + btnGap, btnY, half, btnH)) { shareResult(); return; }
    }
    return;
  }

  if (appState === "quiz") {
    const btnY1 = height - pad - btnH * 3 - btnGap * 2;
    const btnY2 = height - pad - btnH * 2 - btnGap;
    const confirmY = height - pad - btnH;
    
    const confirmBtnWidth = 200;
    const confirmX = cx + (cw - confirmBtnWidth) / 2;

    if (hit(px, py, cx, btnY1, cw, btnH)) {
      selectedChoice = 0;
      return;
    }
    
    if (hit(px, py, cx, btnY2, cw, btnH)) {
      selectedChoice = 1;
      return;
    }
    
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
  answers.push(choice); // Store all answers
  
  isTransitioning = true;
  
  setTimeout(() => {
    currentIdx++;
    selectedChoice = null;
    isTransitioning = false;
    locked = false;
  }, 400);
}

function restartQuiz() {
  currentIdx = 0;
  answers = [];
  selectedChoice = null;
  appState = "start";
  questionAlpha = 255;
  questionScale = 1.0;
  isTransitioning = false;
}

/* ---------------- SHARE ---------------- */

function shareResult() {
  const character = getCharacter();
  const text = `I am ${CHARACTERS[character]} on the DID Grad Show 2026 Quiz!`;
  const shareUrl = window.location.href;

  // Use Web Share API - automatically detects the app/browser
  if (navigator.share) {
    navigator.share({
      title: "What Tool Are You?",
      text: text,
      url: shareUrl
    })
    .then(() => console.log('Shared successfully'))
    .catch((error) => {
      // User cancelled or error - fallback to copy
      if (error.name !== 'AbortError') {
        copyToClipboard(text);
      }
    });
  } else {
    // Fallback for browsers without Web Share API
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

/* ---------------- CHARACTER SCORING SYSTEM ---------------- */

function getCharacter() {
  let scores = {
    hammer: 0,
    calipers: 0,
    vr: 0,
    mouse: 0,
    mat: 0,
    glue: 0,
    sewing: 0,
    tape: 0,
    notepad: 0,
    coffee: 0,
    ruler: 0,
    thumb: 0
  };
  
  // Q1: Wake up (padding)
  if (answers[0] === 0) { // Sleep in
    scores.coffee += 1;
    scores.notepad += 1;
    scores.tape += 1;
  } else { // Rise and grind
    scores.ruler += 1;
    scores.calipers += 1;
    scores.mouse += 1;
    scores.vr += 2;
  }
  
  // Q2: Dressed (padding)
  if (answers[1] === 0) { // Casual
    scores.tape += 1;
    scores.hammer += 1;
    scores.coffee += 1;
  } else { // Dressed up
    scores.ruler += 1;
    scores.sewing += 1;
    scores.calipers += 1;
  }
  
  // Q3: Bus delayed (SCORING) - USB gets high score for "update the group"
  if (answers[2] === 0) { // Take route and UPDATE THE GROUP
    scores.ruler += 3;
    scores.thumb += 3; // USB Drive: connector, shares info
    scores.mouse += 2;
    scores.calipers += 2;
    scores.vr += 1;
  } else { // Buy snacks
    scores.coffee += 3;
    scores.glue += 2;
    scores.tape += 2;
    scores.mat += 1;
  }
  
  // Q4: Desk mess (SCORING)
  if (answers[3] === 0) { // Carve space
    scores.tape += 3;
    scores.hammer += 2;
    scores.glue += 2;
    scores.mouse += 1;
  } else { // Reset table
    scores.ruler += 3;
    scores.mat += 2;
    scores.sewing += 2;
    scores.calipers += 1;
    scores.thumb += 1; // Organized, systematic
  }
  
  // Q5: Deskmate stuck (SCORING)
  if (answers[4] === 0) { // What's not working?
    scores.notepad += 3;
    scores.mouse += 2;
    scores.calipers += 2;
    scores.sewing += 1;
  } else { // Coffee break!
    scores.coffee += 3;
    scores.vr += 2;
    scores.glue += 2;
    scores.hammer += 1;
  }
  
  // Q6: Deadline (SCORING)
  if (answers[5] === 0) { // Send it
    scores.hammer += 3;
    scores.tape += 2;
    scores.mouse += 2;
    scores.glue += 1;
  } else { // Keep tweaking
    scores.sewing += 3;
    scores.calipers += 2;
    scores.ruler += 2;
    scores.notepad += 1;
  }
  
  // Q7: Break time (padding)
  if (answers[6] === 0) { // Walk/snack
    scores.coffee += 1;
    scores.glue += 1;
    scores.mat += 1;
  } else { // Calm space
    scores.notepad += 1;
    scores.vr += 2;
    scores.calipers += 1;
  }
  
  // Q8: Beauty moment (SCORING)
  if (answers[7] === 0) { // Capture it - USB: saves/stores moments
    scores.notepad += 3;
    scores.thumb += 2; // USB: backs up, preserves
    scores.mouse += 2;
    scores.calipers += 1;
    scores.mat += 1;
  } else { // Just enjoy
    scores.coffee += 3;
    scores.vr += 2;
    scores.sewing += 1;
    scores.hammer += 1;
  }
  
  // Q9: Something not working (SCORING)
  if (answers[8] === 0) { // Google it
    scores.mouse += 3;
    scores.vr += 2;
    scores.hammer += 2;
    scores.tape += 1;
  } else { // Think it through
    scores.notepad += 3;
    scores.calipers += 2;
    scores.ruler += 2;
    scores.sewing += 1;
  }
  
  // Q10: New project brief (SCORING)
  if (answers[9] === 0) { // Start sketching
    scores.hammer += 3;
    scores.tape += 2;
    scores.vr += 2;
    scores.glue += 1;
  } else { // Read & timeline - USB: systematic, shares plan
    scores.ruler += 3;
    scores.mat += 2;
    scores.thumb += 2; // USB: organizes, distributes info
    scores.calipers += 2;
    scores.notepad += 1;
  }
  
  // Find winner
  let maxScore = 0;
  let winner = 'hammer';
  
  for (let char in scores) {
    if (scores[char] > maxScore) {
      maxScore = scores[char];
      winner = char;
    }
  }
  
  return winner;
}

/* ---------------- DRAWING HELPERS ---------------- */

function drawQuestionScreen(q) {
  const cw = contentWidth();
  const cx = contentX();

  push();
  translate(width / 2, height / 2);
  scale(questionScale);
  translate(-width / 2, -height / 2);

  textSize(15);
  fill(20, questionAlpha);
  text(`Q ${currentIdx + 1} / ${QUESTIONS.length}`, width / 2, pad + 12);

  fill(74, 0, 162, questionAlpha);
  const promptSize = constrain(floor(contentWidth() / 19), 14, 18);
  textSize(promptSize);
  textWrap(WORD);
  text(q.prompt, cx, pad + 60, cw);

  push();
  tint(255, questionAlpha);
  const imgTop = pad + 155;

  const btnY1 = height - pad - btnH * 3 - btnGap * 2;
  const minGap = 24;
  const maxImgHeight = btnY1 - imgTop - minGap;
  const imgH = min(height * 0.50, maxImgHeight);

  drawMediaFrame(q.imgId, cx, imgTop, cw, imgH);
  pop();

  const btnY2 = height - pad - btnH * 2 - btnGap;
  
  const isSelected0 = selectedChoice === 0;
  const isSelected1 = selectedChoice === 1;
  
  drawChoiceButton(cx, btnY1, cw, btnH, q.choices[0], 
    isTouching(cx, btnY1, cw, btnH), isSelected0, questionAlpha);
  drawChoiceButton(cx, btnY2, cw, btnH, q.choices[1], 
    isTouching(cx, btnY2, cw, btnH), isSelected1, questionAlpha);
  
  pop();

  const confirmY = height - pad - btnH;
  const canConfirm = selectedChoice !== null;
  
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
    fill(245, questionAlpha);
    rect(x, y, w, h, 8);
    fill(140, questionAlpha);
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

function drawChoiceButton(x, y, w, h, label, hot, isSelected, alpha) {
  if (isSelected) {
    fill(218, 187, 255, alpha);
    stroke(174, 135, 231, alpha);
    strokeWeight(2); 
    rect(x+22, y, w-44, h, 10);
  } else {
    if (hot) {
      fill(218, 187, 255, alpha);
    } else {
      fill(174, 135, 231, alpha);
    }
    noStroke();
    rect(x+20, y, w-40, h, 10);
  }
  
  noStroke();
  if (isSelected) {
    fill(174, 135, 231, alpha);
  } else if (hot) {
    fill(247, 239, 255, alpha);
  } else {
    fill(250, alpha);
  }
  textSize(isSelected ? 15 : (hot ? 16 : 15));
  text(label, x + w / 2, y + h / 2);
}

function drawConfirmButton(x, y, w, h, label, hot, enabled) {
  const confirmBtnWidth = 150;
  const confirmX = width/2;
  
  if (enabled) {
    fill(hot ? "#FFC107" : "#7a00db");
  } else {
    fill("#EAEAEA");
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
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
}
