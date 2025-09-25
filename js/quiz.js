document.addEventListener('DOMContentLoaded', () => {
    const quizContainer = document.getElementById('quiz-container');

    // Function to display an error message
    const showError = (message) => {
        if (quizContainer) {
            quizContainer.innerHTML = `<div class="quiz-title-section"><h1>Error</h1><p style="text-align: center;">${message}</p></div>`;
        }
        console.error(message);
    };

    // 1. Check if the main data object exists
    if (typeof quizDatabase === 'undefined') {
        showError('The quiz data could not be loaded. Please ensure quiz-data.js is included correctly before quiz.js.');
        return;
    }

    // 2. Get site ID from URL
    const params = new URLSearchParams(window.location.search);
    const siteId = params.get('site');

    if (!siteId) {
        showError('No heritage site was specified. Please go back to the gallery and select a site.');
        return;
    }

    // 3. Find the specific quiz data for this site
    const quizData = quizDatabase[siteId];

    if (!quizData) {
        showError(`Quiz data for the site "${siteId}" could not be found. Please check the site ID in the URL and the keys in the quiz-data.js file.`);
        return;
    }

    // --- If all checks pass, build the quiz ---

    quizContainer.innerHTML = ''; // Clear container

    // Build and append title
    const titleSection = document.createElement('div');
    titleSection.className = 'quiz-title-section';
    titleSection.innerHTML = `<h1>${quizData.title} Quiz</h1>`;
    quizContainer.appendChild(titleSection);

    // Build main layout
    const mainArea = document.createElement('div');
    mainArea.className = 'quiz-main-area';
    quizContainer.appendChild(mainArea);

    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'questions-container';
    mainArea.appendChild(questionsContainer);

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.innerHTML = '<h3>Available Answers</h3>';
    mainArea.appendChild(answersContainer);
    
    const answerPool = document.createElement('div');
    answerPool.className = 'answer-pool';
    answersContainer.appendChild(answerPool);

    // Populate questions and drop zones
    quizData.questions.forEach(q => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `<p>${q.text}</p>`;
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.questionId = q.id;
        questionItem.appendChild(dropZone);
        questionsContainer.appendChild(questionItem);
    });

    // Shuffle and populate answers
    [...quizData.answers].sort(() => Math.random() - 0.5).forEach(ans => {
        const answerItem = document.createElement('div');
        answerItem.id = ans.id;
        answerItem.className = 'answer-item';
        answerItem.draggable = true;
        answerItem.textContent = ans.content;
        answerPool.appendChild(answerItem);
    });

    // Build controls
    const controls = document.createElement('div');
    controls.className = 'quiz-controls';
    const checkButton = document.createElement('button');
    checkButton.className = 'cta-button';
    checkButton.textContent = 'Check Answers';
    controls.appendChild(checkButton);
    quizContainer.appendChild(controls);

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.style.display = 'none';
    quizContainer.appendChild(feedback);

    // --- Drag and Drop Logic ---
    let draggedItem = null;
    document.querySelectorAll('.answer-item').forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        draggable.addEventListener('dragend', (e) => e.target.classList.remove('dragging'));
    });

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (draggedItem) {
                if (zone.children.length > 0) {
                    answerPool.appendChild(zone.firstElementChild);
                }
                zone.appendChild(draggedItem);
            }
        });
    });

    // --- Answer Checking Logic ---
    checkButton.addEventListener('click', () => {
        let correctCount = 0;
        const totalQuestions = quizData.questions.length;

        document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('correct', 'incorrect'));

        quizData.questions.forEach(question => {
            const dropZone = document.querySelector(`.drop-zone[data-question-id="${question.id}"]`);
            const droppedAnswer = dropZone.querySelector('.answer-item');

            if (droppedAnswer && droppedAnswer.id === quizData.correctAnswers[question.id]) {
                dropZone.classList.add('correct');
                correctCount++;
            } else {
                dropZone.classList.add('incorrect');
            }
        });

        feedback.style.display = 'block';
        if (correctCount === totalQuestions) {
            feedback.className = 'feedback success';
            feedback.textContent = `Excellent! You got ${correctCount}/${totalQuestions} correct!`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `You got ${correctCount}/${totalQuestions} correct. Try again!`;
        }
    });
});

