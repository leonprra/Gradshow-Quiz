/*
Mobile-friendly 7-question quiz (p5.js)
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

  // Calculate button positions
  const visitBtnY = height - pad - btnH * 2 - btnGap;
  const btnY = height - pad - btnH;
  
  // Calculate image area (from top to button with padding)
  const imgPadding = 24; // padding above button
  const imgTop = pad + 20;
  const imgBottom = visitBtnY - imgPadding;
  const availableHeight = imgBottom - imgTop;
  
  // Use full available height
  const res = RESULT_IMAGES[character];
  if (res) {
    // Fit image to available space (maintaining aspect ratio)
    const fitted = fitRect(res.width, res.height, cw, availableHeight);
    imageMode(CORNER);
    image(res, cx + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
  } else {
    noStroke();
    fill(245);
    rect(cx, imgTop, cw, availableHeight, 16);
    fill(140);
    textSize(14);
    text("Result image here", width / 2, imgTop + availableHeight / 2);
  }

  // Visit Website button
  drawButton(cx, visitBtnY, cw, btnH, "Visit the website!", isTouching(cx, visitBtnY, cw, btnH));
  
  // All Tools and Share buttons
  const half = (cw - btnGap) / 2;
  drawButton(cx, btnY, half, btnH, "All Tools", isTouching(cx, btnY, half, btnH));
  drawButton(cx + half + btnGap, btnY, half, btnH, "Share", isTouching(cx + half + btnGap, btnY, half, btnH));
  
  // Draw gallery modal on top if open
  if (showGallery) {
    drawGalleryModal();
  }
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
    if (hit(px,
