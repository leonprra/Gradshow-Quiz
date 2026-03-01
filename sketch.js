// After line 36
let questionScale = 0;
const scaleDuration = 350; // Duration for scale animation

function drawQuiz() {
    // ...existing code...
    // Apply the scale and fade animation here
    if (questionScale < 1) {
        questionScale += (1 / scaleDuration) * deltaTime; // Increment the scale
        questionScale = constrain(questionScale, 0, 1); // Constrain between 0 and 1
    }
    // Drawing logic that uses questionScale to scale the questions
    // ...existing code...
}

function answerQuestion() {
    // ...existing code...
    questionScale = 0; // Reset the scale for the next question
    // ...existing code...
}