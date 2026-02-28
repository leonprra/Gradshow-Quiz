// Updated slide transition animations between questions in sketch.js

function showQuestion(index) {
    let question = questions[index];
    // Add animation code here
    // Example: use CSS classes to create slide effect
    let questionContainer = document.getElementById('question-container');
    questionContainer.classList.add('slide-in');
    setTimeout(() => {
        questionContainer.classList.remove('slide-in');
    }, 500); // duration of the transition
    // Display question details
}

// Adding CSS for slide transition
const style = document.createElement('style');
style.innerHTML = `
.slide-in {
    animation: slideIn 0.5s forwards;
}
@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}`;
document.head.appendChild(style);