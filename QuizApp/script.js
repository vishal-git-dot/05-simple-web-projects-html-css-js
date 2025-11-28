/* ========================= script.js ========================= */
/* Paste into script.js */

// ======= QUESTIONS ARRAY (feel free to expand) =======
const QUESTIONS = [
  {
    q: 'Which planet is known as the Red Planet?',
    choices: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1
  },
  {
    q: 'What is the chemical symbol for water?',
    choices: ['H2O', 'O2', 'CO2', 'HO2'],
    correct: 0
  },
  {
    q: 'Which language runs in a web browser?',
    choices: ['Python', 'C++', 'JavaScript', 'Swift'],
    correct: 2
  },
  {
    q: 'Who wrote the play "Romeo and Juliet"?',
    choices: ['Shakespeare', 'Tolstoy', 'Homer', 'Dante'],
    correct: 0
  },
  {
    q: 'What is 9 × 8?',
    choices: ['72', '81', '63', '69'],
    correct: 0
  },
  {
    q: 'Which organ pumps blood throughout the body?',
    choices: ['Liver', 'Lungs', 'Heart', 'Kidney'],
    correct: 2
  },
  {
    q: 'Which gas do plants primarily absorb?',
    choices: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correct: 2
  },
  {
    q: 'Which continent is Egypt part of?',
    choices: ['Asia', 'Africa', 'Europe', 'Australia'],
    correct: 1
  },
  {
    q: 'What is the boiling point of water at sea level?',
    choices: ['100°C', '90°C', '80°C', '120°C'],
    correct: 0
  },
  {
    q: 'Which of these is a JavaScript framework?',
    choices: ['React', 'Django', 'Flask', 'Laravel'],
    correct: 0
  }
];

// ======= DOM ELEMENTS =======
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const endScreen = document.getElementById('end-screen');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const progressEl = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const nextBtn = document.getElementById('next-btn');
const quitBtn = document.getElementById('quit-btn');
const retryBtn = document.getElementById('retry-btn');
const reviewBtn = document.getElementById('review-btn');
const feedbackEl = document.getElementById('feedback');
const finalScoreEl = document.getElementById('final-score');
const finalTotalEl = document.getElementById('final-total');
const qcountSelect = document.getElementById('qcount');

// ======= STATE =======
let shuffled = [];
let currentIndex = 0;
let score = 0;
let perQuestionTime = 30; // seconds
let timerId = null;
let remainingTime = perQuestionTime;
let chosenCount = 10; // default
let reviewAnswers = [];

// ======= HELPERS =======
function formatTime(s){
  const mm = Math.floor(s / 60).toString().padStart(2,'0');
  const ss = (s % 60).toString().padStart(2,'0');
  return `${mm}:${ss}`;
}

function shuffleArray(arr){
  // Fisher-Yates
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// ======= QUIZ FLOW =======
function startQuiz(){
  chosenCount = parseInt(qcountSelect.value,10);
  shuffled = shuffleArray(QUESTIONS).slice(0, chosenCount).map(q=> ({...q}));
  currentIndex = 0; score = 0; reviewAnswers = [];
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  questionScreen.classList.remove('hidden');
  updateProgress();
  showQuestion();
}

function updateProgress(){
  progressEl.textContent = `${currentIndex+1} / ${shuffled.length}`;
}

function showQuestion(){
  clearInterval(timerId);
  remainingTime = perQuestionTime;
  timerEl.textContent = formatTime(remainingTime);
  const item = shuffled[currentIndex];
  questionEl.textContent = item.q;
  choicesEl.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.disabled = true;

  item.choices.forEach((c, idx)=>{
    const li = document.createElement('li');
    li.className = 'choice';
    li.tabIndex = 0;
    li.setAttribute('data-index', idx);
    li.textContent = c;
    li.addEventListener('click', onChoice);
    li.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') onChoice(e); });
    choicesEl.appendChild(li);
  });

  startTimer();
}

function startTimer(){
  timerId = setInterval(()=>{
    remainingTime -= 1;
    timerEl.textContent = formatTime(remainingTime);
    if(remainingTime <= 0){
      clearInterval(timerId);
      timesUp();
    }
  },1000);
}

function timesUp(){
  // mark as incorrect and reveal correct
  lockChoices();
  feedbackEl.textContent = `Time's up!`;
  revealCorrect();
  reviewAnswers.push({q: shuffled[currentIndex], chosen: null});
  nextBtn.disabled = false;
}

function onChoice(e){
  const el = e.currentTarget;
  if(el.classList.contains('disabled')) return;
  const chosen = parseInt(el.getAttribute('data-index'),10);
  evaluate(chosen, el);
}

function evaluate(chosen, el){
  clearInterval(timerId);
  const item = shuffled[currentIndex];
  lockChoices();
  const correct = item.correct;
  if(chosen === correct){
    score += 1;
    el.classList.add('good');
    feedbackEl.textContent = 'Correct!';
  } else {
    el.classList.add('bad');
    feedbackEl.textContent = `Wrong — correct answer shown.`;
    // highlight correct
    const correctNode = choicesEl.querySelector(`[data-index=\"${correct}\"]`);
    if(correctNode) correctNode.classList.add('good');
  }
  reviewAnswers.push({q: item, chosen});
  nextBtn.disabled = false;
}

function lockChoices(){
  const items = choicesEl.querySelectorAll('.choice');
  items.forEach(it=>{
    it.classList.add('disabled');
  });
}

nextBtn.addEventListener('click', ()=>{
  currentIndex += 1;
  if(currentIndex >= shuffled.length){
    endQuiz();
  } else {
    updateProgress();
    showQuestion();
  }
});

quitBtn.addEventListener('click', ()=>{
  clearInterval(timerId);
  endQuiz(true);
});

function endQuiz(skipped=false){
  clearInterval(timerId);
  questionScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');
  finalScoreEl.textContent = score;
  finalTotalEl.textContent = shuffled.length || 0;
  if(skipped) feedbackEl.textContent = 'You quit early.';
}

startBtn.addEventListener('click', startQuiz);
retryBtn.addEventListener('click', ()=>{
  startScreen.classList.remove('hidden');
  endScreen.classList.add('hidden');
});

reviewBtn.addEventListener('click', ()=>{
  // Simple in-place review: show each question and the chosen answer
  questionScreen.classList.remove('hidden');
  endScreen.classList.add('hidden');
  currentIndex = 0;
  // convert reviewAnswers into screenable format
  shuffled = reviewAnswers.map(r=>r.q);
  // attach chosen index as a temporary property to allow highlighting
  shuffled.forEach((s, i)=> s._chosen = reviewAnswers[i].chosen);
  showReview();
});

function showReview(){
  clearInterval(timerId);
  timerEl.textContent = '00:00';
  const item = shuffled[currentIndex];
  questionEl.textContent = item.q;
  choicesEl.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.disabled = true;

  item.choices.forEach((c, idx)=>{
    const li = document.createElement('li');
    li.className = 'choice disabled';
    li.textContent = c;
    if(idx === item.correct) li.classList.add('good');
    if(item._chosen === idx) {
      // add a subtle border to show user's choice
      li.style.outline = '2px dashed rgba(255,255,255,0.08)';
    }
    choicesEl.appendChild(li);
  });

  // allow navigating through reviews
  nextBtn.disabled = false;
  nextBtn.onclick = ()=>{
    currentIndex += 1;
    if(currentIndex >= shuffled.length){
      // restore next button behavior
      nextBtn.onclick = null;
      // go back to end screen
      endScreen.classList.remove('hidden');
      questionScreen.classList.add('hidden');
    } else {
      showReview();
    }
  };
}

// Accessibility: allow keyboard to start
qcountSelect.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') startQuiz(); });

// Initialize UI values
(function init(){
  progressEl.textContent = `0 / ${qcountSelect.value}`;
  timerEl.textContent = formatTime(perQuestionTime);
})();

// Clean up: when leaving the page stop timers
window.addEventListener('beforeunload', ()=> clearInterval(timerId));
