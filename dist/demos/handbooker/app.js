import { createQuestionSearch, escapeHtml as esc, renderAnswer } from './question-bank.js';

const $ = selector => document.querySelector(selector);
const categories = ['Dress Code', 'Attendance', 'Phones and Devices', 'Academic Integrity and AI'];
let bank, search;
const question = $('#question');
function rows(questions) {
  return questions.map(q => `<li><button type="button" class="question-option" data-id="${esc(q.id)}"><span><small>${esc(q.category)}</small><span>${esc(q.question)}</span></span><b aria-hidden="true">↗</b></button></li>`).join('');
}
function hideAnswer() { $('#results').hidden = true; $('#results').innerHTML = ''; }
function suggest(resolution) {
  hideAnswer();
  $('#question-list').hidden = true;
  const query = question.value.trim();
  $('#suggestions').hidden = !query;
  $('#browse').hidden = Boolean(query);
  $('.try').hidden = Boolean(query);
  if (!query) { $('#search-status').textContent = ''; return; }
  const matches = resolution ? resolution.suggestions : search(query);
  $('#suggestion-list').innerHTML = rows(matches);
  $('#suggestion-title').textContent = matches.length ? 'Are you asking about…' : 'No clear handbook match';
  $('#suggestion-hint').textContent = matches.length ? (resolution ? 'Choose the question closest to what you meant.' : 'Press Enter to find an answer, or choose a question below.') : 'Try different words, browse a topic, or send us your question.';
  $('#search-status').textContent = matches.length ? `${matches.length} suggested ${matches.length === 1 ? 'question' : 'questions'}. Select one to read its answer.` : 'No close matches. Browse topics or send a question.';
}
function browse(category) {
  hideAnswer();
  question.value = '';
  $('#suggestions').hidden = true;
  $('.try').hidden = true;
  $('#browse').hidden = Boolean(category);
  $('#question-list').hidden = !category;
  if (category) {
    const questions = bank.questions.filter(q => q.category === category);
    $('#category-heading').textContent = category;
    $('#category-count').textContent = `${questions.length} questions · Choose one to see the answer`;
    $('#category-questions').innerHTML = rows(questions);
    $('#category-heading').focus();
  } else { $('.try').hidden = false; $('#browse-heading').focus(); }
  $('#search-status').textContent = '';
}
function selectQuestion(id, keepInput = false) {
  const selected = bank.questions.find(q => q.id === id);
  if (!selected) return;
  if (!keepInput) question.value = selected.question;
  $('#suggestions').hidden = true;
  $('#question-list').hidden = true;
  $('#browse').hidden = true;
  $('.try').hidden = true;
  $('#results').innerHTML = renderAnswer(selected);
  $('#results').hidden = false;
  $('#search-status').textContent = '';
  $('#answer-heading').focus();
}
function answerQuestion() {
  if (!search || !question.value.trim()) return;
  const resolution = search.resolve(question.value);
  if (resolution.decision === 'answer') selectQuestion(resolution.question.id, true);
  else suggest(resolution);
}
function openSubmission() {
  $('#new-question').value = question.value;
  $('#submission-status').textContent = '';
  $('#submission-dialog').showModal();
  $('#new-question').focus();
}
export async function submitQuestion() {
  throw Error('Question submissions are disabled in this portfolio demo. Your question has not been sent.');
}
async function start() {
  try {
    const response = await fetch('assets/question-bank.json');
    if (!response.ok) throw Error('Unavailable');
    bank = await response.json();
    search = createQuestionSearch(bank.questions);
    $('#topics').innerHTML = categories.map(c => `<button type="button" data-category="${esc(c)}">${esc(c)}</button>`).join('');
    $('#bank-count').textContent = `${bank.questions.length} questions. Four topics.`;
    question.disabled = false;
    $('#submit').disabled = false;
    $('#search-status').textContent = '';
    document.querySelectorAll('[data-category], [data-query]').forEach(button => { button.disabled = false; });
  } catch {
    $('#search-status').className = 'load-error';
    $('#search-status').textContent = 'Questions could not load. Please refresh the page or open the handbook.';
  }
}
question.addEventListener('input', () => { if (search) suggest(); });
question.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' && !$('#suggestions').hidden) {
    const first = $('#suggestion-list button');
    if (first) { event.preventDefault(); first.focus(); }
  }
});
$('#question-form').addEventListener('submit', event => { event.preventDefault(); answerQuestion(); });
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.id) selectQuestion(button.dataset.id);
  if (button.dataset.category) browse(button.dataset.category);
  if (button.dataset.query) { question.value = button.dataset.query; question.focus(); answerQuestion(); }
  if (button.dataset.action === 'browse') browse();
  if (button.dataset.action === 'submit-question') openSubmission();
  if (button.dataset.action === 'back') { suggest(); question.focus(); }
});
document.addEventListener('keydown', event => {
  const option = event.target.closest('.question-option');
  if (!option || !['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Escape') { question.focus(); return; }
  const buttons = [...option.closest('ul').querySelectorAll('button')];
  buttons[(buttons.indexOf(option) + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length].focus();
});
$('#ask-nav').addEventListener('click', () => { question.focus(); question.scrollIntoView({block:'center'}); });
$('#close-submission').addEventListener('click', () => $('#submission-dialog').close());
$('#submission-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('#send-question');
  button.disabled = true;
  button.textContent = 'Sending…';
  $('#submission-status').textContent = '';
  try {
    await submitQuestion(event.currentTarget);
    $('#submission-form').reset();
    $('#submission-status').textContent = 'Thank you. Your question was sent for team review. It will not appear publicly unless the team adds a reviewed answer.';
  } catch (error) {
    $('#submission-status').textContent = error.name === 'TimeoutError' ? 'The request timed out. We could not confirm delivery. Please try again later.' : error.message || 'Your question was not sent. Please try again later.';
  } finally { button.disabled = false; button.textContent = 'Preview submission ↗'; }
});
export const ready = start();
