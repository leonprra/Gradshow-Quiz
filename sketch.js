/*
Mobile-friendly 10-question quiz (p5.js)
Optimized for Telegram, iOS, Android
Screens: Start > Quiz > Calculating > Result
WITH SIMPLE FADE
12 Character Results
Responsive result screen: Landscape (side-by-side) vs Portrait (stacked)
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
let answers = [];
let locked = false;
let selectedChoice = null;

// Gallery modal state
let showGallery = false;
let galleryViewChar = null;

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

  // Result images - 12 characters
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

  background("#FAF6F0"); // Cream background

  const dotSpacing = 24;
  noStroke();
  for (let row = 0; row * dotSpacing <= height + dotSpacing; row++) {
    for (let col = 0; col * dotSpacing <= width + dotSpacing; col++) {
      fill("#DDD4E0"); // Ink-200 dots
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
  fill("#FAF6F0"); // Cream background
  noStroke();
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill("#7A00DB"); // Purple-600
  textSize(22);
  textStyle(BOLD);
  text("Please rotate your device", width / 2, height / 2 - 18);

  textStyle(NORMAL);
  textSize(15);
  fill("#6B5A73"); // Text muted
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
  fill("#7A00DB"); // Purple-600
  let txt1 = "Every design gradshow is more than just final pieces on display.";
  text(txt1, cx, currentY, cw);
  let lines1 = calculateLines(txt1, cw, 18);
  currentY += (18 * lineHeight * lines1) + 15;

  textSize(16);
  textStyle(NORMAL);
  fill("#1A0F22"); // Ink-900 dark text
  let txt2 = "It's different people, different strengths, different ways of working.";
  text(txt2, cx, currentY, cw);
  let lines2 = calculateLines(txt2, cw, 16);
  currentY += (16 * lineHeight * lines2) + 30;

  let txt3 = "Some people plan. Some people improvise. Some perfect. Some bring the vibes. Before you head down to the DID Graduation Show, let's find out… ";
  text(txt3, cx, currentY, cw);
  let lines3 = calculateLines(txt3, cw, 16);
  currentY += (16 * lineHeight * lines3) + 15;

  let txt4 = "What's your tool type?";
  textStyle(BOLD);
  fill("#7A00DB");
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

  textSize(22); // Heading size from design
  fill("#1A0F22"); // Ink-900
  textStyle(BOLD);
  if (millis() - time >= preparingWait) {
    text("Let's go!", width / 2, height / 2 - 40);
  } else {
    text("Preparing your quiz...", width / 2, height / 2 - 40);
  }
  textStyle(NORMAL);

  textSize(15); // Small text from design
  fill("#6B5A73"); // Text muted
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

  textSize(22); // Heading size
  fill("#1A0F22");
  textStyle(BOLD);
  if (millis() - time >= wait) {
    text("Done!", width / 2, height / 2 - 40);
  } else {
    text("Calculating your results…", width / 2, height / 2 - 40);
  }
  textStyle(NORMAL);

  textSize(15);
  fill("#6B5A73");
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
  const character = getCharacter();
  const res = RESULT_IMAGES[character];
  
  // Determine layout based on aspect ratio
  const isLandscape = width > height;
  
  if (isLandscape) {
    // DESKTOP/LANDSCAPE: Side-by-side layout
    drawResultScreenLandscape(character, res);
  } else {
    // MOBILE/PORTRAIT: Stacked layout (current)
    drawResultScreenPortrait(character, res);
  }
  
  // Draw gallery modal on top if open
  if (showGallery) {
    drawGalleryModal();
  }
}

function drawResultScreenLandscape(character, res) {
  // Left side: Result image (65% width)
  const leftW = width * 0.65;
  const leftX = pad;
  const leftY = pad + 20;
  const leftH = height - pad * 2 - 40;
  
  // Right side: Buttons (35% width)
  const rightW = width * 0.35 - pad * 3;
  const rightX = leftW + pad * 2;
  const rightY = pad + 20;
  
  // Draw result image on left
  if (res) {
    const fitted = fitRect(res.width, res.height, leftW, leftH);
    imageMode(CORNER);
    image(res, leftX + fitted.x, leftY + fitted.y, fitted.w, fitted.h);
  } else {
    noStroke();
    fill(245);
    rect(leftX, leftY, leftW, leftH, 16);
    fill(140);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Result image here", leftX + leftW/2, leftY + leftH/2);
  }
  
  // Buttons stacked vertically on right
  const btnW = rightW;
  const btnHL = max(50, min(60, height * 0.08));
  const btnGapVert = max(12, min(18, height * 0.025));
  
  const btn1Y = rightY + (height - pad * 2 - 40 - btnHL * 3 - btnGapVert * 2) / 2;
  const btn2Y = btn1Y + btnHL + btnGapVert;
  const btn3Y = btn2Y + btnHL + btnGapVert;
  
  // Button 1: Primary - Visit gradshow site
  drawButton(rightX, btn1Y, btnW, btnHL, "Visit gradshow site  ↗", 
    isTouching(rightX, btn1Y, btnW, btnHL));
  
  // Button 2: Secondary - See all 12 tools
  drawSecondaryButton(rightX, btn2Y, btnW, btnHL, "See all 12 tools", 
    isTouching(rightX, btn2Y, btnW, btnHL));
  
  // Button 3: Secondary - Share my result
  drawSecondaryButton(rightX, btn3Y, btnW, btnHL, "Share my result  ↗", 
    isTouching(rightX, btn3Y, btnW, btnHL));
}

function drawResultScreenPortrait(character, res) {
  const cw = contentWidth();
  const cx = contentX();
  
  // 3 stacked vertical buttons
  const btnGapVert = max(10, min(14, height * 0.018));
  const btn3Y = height - pad - btnH;
  const btn2Y = btn3Y - btnH - btnGapVert;
  const btn1Y = btn2Y - btnH - btnGapVert;
  
  // Calculate image area (from top to first button with padding)
  const imgPadding = 24;
  const imgTop = pad + 20;
  const imgBottom = btn1Y - imgPadding;
  const availableHeight = imgBottom - imgTop;
  
  // Result image
  if (res) {
    const fitted = fitRect(res.width, res.height, cw, availableHeight);
    imageMode(CORNER);
    image(res, cx + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
  } else {
    noStroke();
    fill(245);
    rect(cx, imgTop, cw, availableHeight, 16);
    fill(140);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Result image here", width / 2, imgTop + availableHeight / 2);
  }

  // Button 1: Primary - Visit gradshow site
  drawButton(cx, btn1Y, cw, btnH, "Visit gradshow site  ↗", 
    isTouching(cx, btn1Y, cw, btnH));
  
  // Button 2: Secondary - See all 12 tools
  drawSecondaryButton(cx, btn2Y, cw, btnH, "See all 12 tools", 
    isTouching(cx, btn2Y, cw, btnH));
  
  // Button 3: Secondary - Share my result
  drawSecondaryButton(cx, btn3Y, cw, btnH, "Share my result  ↗", 
    isTouching(cx, btn3Y, cw, btnH));
}

/* ---------------- GALLERY MODAL ---------------- */

function drawGalleryModal() {
  // Semi-transparent backdrop (lighter, matches design)
  fill(0, 0, 0, 100);
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
  // Cream modal background with dark border
  fill("#FAF6F0"); // Cream
  stroke("#1A0F22"); // Ink-900 border
  strokeWeight(2);
  rect(x, y, w, h, 24);
  
  // Close button (X)
  noStroke();
  const closeSize = 40;
  const closeX = x + w - closeSize - 10;
  const closeY = y + 10;
  
  if (isTouching(closeX, closeY, closeSize, closeSize)) {
    fill("#F4ECFB"); // Purple-100
    circle(closeX + closeSize/2, closeY + closeSize/2, closeSize);
  }
  
  fill("#1A0F22"); // Ink-900
  textSize(28);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text("×", closeX + closeSize/2, closeY + closeSize/2);
  
  // Grid starts right after close button
  const gridStartY = y + 60;
  const gridPad = 12;
  const cols = width > 600 ? 4 : 3;
  
  // Calculate available space for grid
  const availableW = w - gridPad * (cols + 1);
  const availableH = h - (gridStartY - y) - gridPad * 2;
  
  // Calculate thumbnail size based on available space
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
      rect(thumbX, thumbY, thumbW, thumbH, 12);
      fill(150);
      textSize(12);
      text(tools[i], thumbX + thumbW/2, thumbY + thumbH/2);
    }
    
    // Hover effect - dark ink border
    if (isTouching(thumbX, thumbY, thumbW, thumbH)) {
      noFill();
      stroke("#1A0F22"); // Ink-900
      strokeWeight(3);
      rect(thumbX, thumbY, thumbW, thumbH, 12);
    }
  }
}

function drawGalleryCharacterView(x, y, w, h) {
  // Cream modal background with dark border
  fill("#FAF6F0"); // Cream
  stroke("#1A0F22"); // Ink-900
  strokeWeight(2);
  rect(x, y, w, h, 24);
  
  // Back button
  noStroke();
  const backSize = 40;
  const backX = x + 10;
  const backY = y + 10;
  
  if (isTouching(backX, backY, backSize + 60, backSize)) {
    fill("#F4ECFB"); // Purple-100
    rect(backX, backY, backSize + 60, backSize, 20);
  }
  
  fill("#1A0F22"); // Ink-900
  textSize(16);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("← Back", backX + 12, backY + backSize/2);
  textStyle(NORMAL);
  
  // Character image (name removed, starts higher)
  const imgTop = y + 70;
  const imgH = h - 90;
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
      galleryViewChar = null;
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
  const gridStartY = modalY + 60;
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
      galleryViewChar = tools[i];
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
    // If gallery is open, handle gallery interactions
    if (showGallery) {
      handleGalleryTap(px, py);
      return;
    }
    
    // Check based on layout
    const isLandscape = width > height;
    
    if (isLandscape) {
      // LANDSCAPE LAYOUT - 3 stacked buttons on right
      const rightW = width * 0.35 - pad * 3;
      const rightX = width * 0.65 + pad * 2;
      const rightY = pad + 20;
      
      const btnW = rightW;
      const btnHL = max(50, min(60, height * 0.08));
      const btnGapVert = max(12, min(18, height * 0.025));
      
      const btn1Y = rightY + (height - pad * 2 - 40 - btnHL * 3 - btnGapVert * 2) / 2;
      const btn2Y = btn1Y + btnHL + btnGapVert;
      const btn3Y = btn2Y + btnHL + btnGapVert;
      
      // Button 1: Visit gradshow site
      if (hit(px, py, rightX, btn1Y, btnW, btnHL)) {
        window.location.href = "https://vina-setiawaty.github.io/Gradwebsite-2026/loading.html";
        return;
      }
      
      // Button 2: See all 12 tools
      if (hit(px, py, rightX, btn2Y, btnW, btnHL)) {
        showGallery = true;
        galleryViewChar = null;
        return;
      }
      
      // Button 3: Share my result
      if (hit(px, py, rightX, btn3Y, btnW, btnHL)) {
        shareResult();
        return;
      }
    } else {
      // PORTRAIT LAYOUT - 3 stacked buttons at bottom
      const btnGapVert = max(10, min(14, height * 0.018));
      const btn3Y = height - pad - btnH;
      const btn2Y = btn3Y - btnH - btnGapVert;
      const btn1Y = btn2Y - btnH - btnGapVert;
    
      // Button 1: Visit gradshow site (top)
      if (hit(px, py, cx, btn1Y, cw, btnH)) {
        window.location.href = "https://vina-setiawaty.github.io/Gradwebsite-2026/loading.html";
        return;
      }
      
      // Button 2: See all 12 tools (middle)
      if (hit(px, py, cx, btn2Y, cw, btnH)) {
        showGallery = true;
        galleryViewChar = null;
        return;
      }
      
      // Button 3: Share my result (bottom)
      if (hit(px, py, cx, btn3Y, cw, btnH)) {
        shareResult();
        return;
      }
    }
    return;
  }

  if (appState === "quiz") {
    // Match the same layout as drawQuestionScreen
    const confirmGap = 20;
    const choiceGap = btnGap;
    
    const confirmY = height - pad - btnH;
    const btnY2 = confirmY - confirmGap - btnH;
    const btnY1 = btnY2 - choiceGap - btnH;

    if (hit(px, py, cx, btnY1, cw, btnH)) {
      selectedChoice = 0;
      return;
    }
    
    if (hit(px, py, cx, btnY2, cw, btnH)) {
      selectedChoice = 1;
      return;
    }
    
    // Confirm button now matches choice width (full content width)
    if (hit(px, py, cx, confirmY, cw, btnH)) {
      if (selectedChoice !== null) {
        answerQuestion(selectedChoice);
      }
      return;
    }
  }
}

function answerQuestion(choice) {
  locked = true;
  answers.push(choice);
  
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
  if (answers[0] === 0) {
    scores.coffee += 1;
    scores.notepad += 1;
    scores.tape += 1;
  } else {
    scores.ruler += 1;
    scores.calipers += 1;
    scores.mouse += 1;
    scores.vr += 2;
  }
  
  // Q2: Dressed (padding)
  if (answers[1] === 0) {
    scores.tape += 1;
    scores.hammer += 1;
    scores.coffee += 1;
  } else {
    scores.ruler += 1;
    scores.sewing += 1;
    scores.calipers += 1;
  }
  
  // Q3: Bus delayed (SCORING)
  if (answers[2] === 0) {
    scores.ruler += 3;
    scores.thumb += 3;
    scores.mouse += 2;
    scores.calipers += 2;
    scores.vr += 1;
  } else {
    scores.coffee += 3;
    scores.mat += 2;
    scores.glue += 2;
    scores.tape += 1;
  }
  
  // Q4: Desk mess (SCORING)
  if (answers[3] === 0) {
    scores.tape += 3;
    scores.hammer += 2;
    scores.glue += 2;
    scores.mouse += 1;
  } else {
    scores.ruler += 3;
    scores.mat += 2;
    scores.sewing += 2;
    scores.calipers += 1;
    scores.thumb += 1;
  }
  
  // Q5: Deskmate stuck (SCORING)
  if (answers[4] === 0) {
    scores.notepad += 3;
    scores.mouse += 2;
    scores.calipers += 2;
    scores.thumb += 1;
    scores.sewing += 1;
  } else {
    scores.coffee += 3;
    scores.vr += 2;
    scores.glue += 2;
    scores.hammer += 1;
  }
  
  // Q6: Deadline (SCORING)
  if (answers[5] === 0) {
    scores.hammer += 3;
    scores.tape += 2;
    scores.mouse += 2;
    scores.glue += 1;
  } else {
    scores.sewing += 3;
    scores.calipers += 2;
    scores.ruler += 2;
  }
  
  // Q7: Break time (padding)
  if (answers[6] === 0) {
    scores.coffee += 1;
    scores.glue += 1;
    scores.mat += 1;
  } else {
    scores.notepad += 1;
    scores.vr += 2;
    scores.calipers += 1;
  }
  
  // Q8: Beauty moment (SCORING)
  if (answers[7] === 0) {
    scores.notepad += 3;
    scores.thumb += 2;
    scores.mouse += 2;
    scores.calipers += 1;
    scores.mat += 1;
  } else {
    scores.coffee += 3;
    scores.vr += 2;
    scores.mat += 1;
    scores.sewing += 1;
    scores.hammer += 1;
  }
  
  // Q9: Something not working (SCORING)
  if (answers[8] === 0) {
    scores.mouse += 3;
    scores.vr += 2;
    scores.hammer += 2;
    scores.tape += 1;
  } else {
    scores.notepad += 3;
    scores.calipers += 2;
    scores.thumb += 1;
    scores.ruler += 1;
    scores.sewing += 1;
  }
  
  // Q10: New project brief (SCORING)
  if (answers[9] === 0) {
    scores.hammer += 3;
    scores.tape += 2;
    scores.vr += 2;
    scores.glue += 1;
  } else {
    scores.ruler += 3;
    scores.mat += 2;
    scores.thumb += 2;
    scores.calipers += 2;
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

  // Question counter: "Question 02 of 10"
  const qNum = String(currentIdx + 1).padStart(2, '0');
  const qTotal = String(QUESTIONS.length).padStart(2, '0');
  textSize(13);
  fill(107, 90, 115, questionAlpha); // Text muted (#6B5A73)
  textStyle(NORMAL);
  text(`Question ${qNum} of ${qTotal}`, width / 2, pad + 12);

  fill(26, 15, 34, questionAlpha); // Ink-900 dark text (not purple)
  textStyle(BOLD);
  const promptSize = constrain(floor(contentWidth() / 19), 14, 18);
  textSize(promptSize);
  textWrap(WORD);
  text(q.prompt, cx, pad + 60, cw);
  textStyle(NORMAL);

  // Calculate layout from bottom up:
  // - Confirm button at very bottom (with pad)
  // - Gap of ~20px between confirm and choices
  // - 2 choice buttons stacked
  // - Image fills remaining space ABOVE choices
  
  const confirmGap = 20; // Gap between choices and confirm
  const choiceGap = btnGap; // Gap between two choice buttons
  
  const confirmY = height - pad - btnH;
  const btnY2 = confirmY - confirmGap - btnH; // 2nd choice
  const btnY1 = btnY2 - choiceGap - btnH;     // 1st choice
  
  // Image area: from top (after prompt) to just above first choice button
  const imgTop = pad + 155;
  const imgGapAboveChoices = 16; // Small gap between image and choice buttons
  const imgBottom = btnY1 - imgGapAboveChoices;
  const imgH = imgBottom - imgTop;
  
  push();
  tint(255, questionAlpha);
  drawMediaFrame(q.imgId, cx, imgTop, cw, imgH);
  pop();
  
  const isSelected0 = selectedChoice === 0;
  const isSelected1 = selectedChoice === 1;
  
  drawChoiceButton(cx, btnY1, cw, btnH, q.choices[0], 
    isTouching(cx, btnY1, cw, btnH), isSelected0, questionAlpha);
  drawChoiceButton(cx, btnY2, cw, btnH, q.choices[1], 
    isTouching(cx, btnY2, cw, btnH), isSelected1, questionAlpha);
  
  pop();

  // Confirm button - matches choice button width (full content width)
  const canConfirm = selectedChoice !== null;
  drawConfirmButton(cx, confirmY, cw, btnH, "Confirm  →", 
    isTouching(cx, confirmY, cw, btnH), canConfirm);
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
  // PRIMARY BUTTON - Solid purple with sticker shadow
  fill("#1A0F22"); // Ink-900 (dark shadow)
  noStroke();
  rect(x + 4, y + 4, w, h, 999); // Sticker shadow
  
  // Main button on top of shadow
  fill(hot ? "#5A00A8" : "#7A00DB"); // Purple-700 when hot, Purple-600 default
  rect(x, y, w, h, 999);
  
  // White text
  fill(255);
  textSize(hot ? 17 : 16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function drawSecondaryButton(x, y, w, h, label, hot) {
  // SECONDARY BUTTON - White/cream with DARK ink border + sticker shadow
  fill("#1A0F22"); // Ink-900 shadow
  noStroke();
  rect(x + 4, y + 4, w, h, 999);
  
  // Main button: white with dark ink border
  fill(hot ? "#F4ECFB" : "#FFFFFF"); // Purple-100 when hot, white default
  stroke("#1A0F22"); // Ink-900 border (dark, not purple)
  strokeWeight(2);
  rect(x, y, w, h, 999);
  
  // Dark text
  noStroke();
  fill("#1A0F22"); // Ink-900 (dark text on white)
  textSize(hot ? 17 : 16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function drawChoiceButton(x, y, w, h, label, hot, isSelected, alpha) {
  const bx = x + 20;
  const bw = w - 40;
  
  // Sticker shadow - 3px offset for choice buttons (matches design)
  if (!isSelected) {
    fill(26, 15, 34, alpha * 0.9); // Ink-900 shadow
    noStroke();
    rect(bx + 3, y + 3, bw, h, h / 2); // pill shape
  }
  
  // Button background
  if (isSelected) {
    // Selected: light purple bg with dark ink border
    fill(244, 236, 251, alpha); // Purple-100 (#F4ECFB)
    stroke(26, 15, 34, alpha); // Ink-900 border (dark, not purple)
    strokeWeight(2);
    rect(bx, y, bw, h, h / 2);
  } else {
    // Default/hover: white with DARK ink border
    fill(255, alpha);
    stroke(26, 15, 34, alpha); // Ink-900 border (dark)
    strokeWeight(hot ? 2 : 1.5);
    rect(bx, y, bw, h, h / 2);
  }
  
  // Checkmark circle on the left
  const circleD = h * 0.45;
  const circleX = bx + h / 2;
  const circleY = y + h / 2;
  
  if (isSelected) {
    // Filled purple circle with white checkmark
    noStroke();
    fill(122, 0, 219, alpha); // Purple-600
    circle(circleX, circleY, circleD);
    
    // White checkmark
    stroke(255, alpha);
    strokeWeight(2.5);
    strokeCap(ROUND);
    noFill();
    const cs = circleD * 0.25;
    line(circleX - cs, circleY + 1, circleX - cs * 0.2, circleY + cs * 0.8);
    line(circleX - cs * 0.2, circleY + cs * 0.8, circleX + cs, circleY - cs * 0.6);
  } else {
    // Empty circle with dark border
    noFill();
    stroke(26, 15, 34, alpha); // Ink-900 border
    strokeWeight(1.5);
    circle(circleX, circleY, circleD);
  }
  
  // Text - dark ink, bold when selected
  noStroke();
  if (isSelected) {
    fill(26, 15, 34, alpha); // Ink-900 (stays dark, just bold)
    textStyle(BOLD);
  } else {
    fill(26, 15, 34, alpha); // Ink-900
    textStyle(NORMAL);
  }
  textSize(15);
  
  // Text positioned to make room for circle
  const textStartX = circleX + circleD / 2 + 8;
  const textEndX = bx + bw - 16;
  const textCenterX = (textStartX + textEndX) / 2;
  
  textAlign(CENTER, CENTER);
  text(label, textCenterX, y + h / 2);
  textStyle(NORMAL);
}

function drawConfirmButton(x, y, w, h, label, hot, enabled) {
  // Match choice button width (with 20px padding on each side)
  const bx = x + 20;
  const bw = w - 40;
  
  // Sticker shadow (only when enabled)
  if (enabled) {
    fill("#1A0F22"); // Ink-900 dark shadow
    noStroke();
    rect(bx + 4, y + 4, bw, h, h / 2);
  }
  
  // Main button
  noStroke();
  if (enabled) {
    fill(hot ? "#5A00A8" : "#7A00DB"); // Purple-700 when hot, Purple-600 default
  } else {
    fill("#ECE5EE"); // Ink-100 disabled
  }
  rect(bx, y, bw, h, h / 2); // pill shape
  
  // Text
  fill(enabled ? 255 : "#B5AAB8");
  textSize(17);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, bx + bw / 2, y + h / 2);
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
