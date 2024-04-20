import './style.scss';
import { create, all } from 'mathjs';

document.querySelector('#app').innerHTML = `
<div class="calculator">  
  <input class='visually-hidden' id='theme-input' type='checkbox'>
  <label class='theme-toggle' for='theme-input'>
    <svg class="theme-toggle__icon-light theme-toggle__icon-active" viewBox="0 0 30 30" width="30" height="30">
      <use href="./img/sprite.svg#icon-theme-light" xlink:href="./img/sprite.svg#icon-theme-light"></use>
    </svg>
    <svg class="theme-toggle__icon-dark" viewBox="0 0 25 25" width="25" height="25">
      <use href="./img/sprite.svg#icon-theme-dark" xlink:href="./img/sprite.svg#icon-theme-dark"></use>
    </svg>
  </label>
  <button class='history-button'>
    <svg class="history-button__icon" viewBox="0 0 26 26" width="26" height="26">
      <use href="./img/sprite.svg#icon-history" xlink:href="./img/sprite.svg#icon-history"></use>
    </svg>
  </button>
  <div class='history'>
    <div class='history__buttons-wrapper'>
      <button class='history__clear button'>
        <svg class="history__clear-icon" viewBox="0 0 32 32" width="32" height="32">
      <use href="./img/sprite.svg#icon-trash-bin" xlink:href="./img/sprite.svg#icon-trash-bin"></use>
        </svg>
      </button>
      <button class='history__close button'></button>      
    </div>
    <div class='history__list'></div>
  </div>  
  <div class="result">
    <div class='result__expression'></div>
    <div class='result__inner-wrapper'>
      <span class='result__equals'>=</span>
      <div class="result__value">0</div>
    </div>
  </div>
  <div class='keyboard'>
    <div class='keyboard__top'></div>
    <div class='keyboard__right'></div>
    <div class='keyboard__center'></div>
  </div>
</div>
`

const OPERATION_LIST_TOP = ['AC', '+/-', '%'];
const OPERATION_LIST_RIGHT = ['÷', '×', '-', '+', '='];
const OPERATION_LIST_CENTER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'];

const math = create(all);
let currValue = '';
let expression = [];
let expressionPreview = [];


const calculator = document.querySelector('.calculator');
const themeToggle = calculator.querySelector('.theme-toggle');
const themeInput = calculator.querySelector('#theme-input');
const keyboardTop = calculator.querySelector('.keyboard__top');
const keyboardRight = calculator.querySelector('.keyboard__right');
const keyboardCenter = calculator.querySelector('.keyboard__center');
const resultValue = calculator.querySelector('.result__value');
const resultExpression = calculator.querySelector('.result__expression');
const historyButton = calculator.querySelector('.history-button');
const history = calculator.querySelector('.history');
const historyClose = calculator.querySelector('.history__close');
const historyClear = calculator.querySelector('.history__clear');
const historyList = calculator.querySelector('.history__list');

themeInput.addEventListener('click', () => {
  themeToggle.classList.toggle('theme-toggle--active');
  document.body.toggleAttribute('dark');
});

historyButton.addEventListener('click', () => {
  history.classList.add('history--show')
});

historyClose.addEventListener('click', () => {
  history.classList.remove('history--show')
});

historyClear.addEventListener('click', () => {
  historyList.textContent = '';
});

OPERATION_LIST_TOP.map(el => {
  keyboardTop.insertAdjacentHTML('beforeend', `<button value="${el}" class="keyboard__button button">${el}</button>`)
});

OPERATION_LIST_RIGHT.map(el => {
  keyboardRight.insertAdjacentHTML('beforeend', `<button value="${el}" class="keyboard__button button">${el}</button>`)
});

OPERATION_LIST_CENTER.map(el => {
  keyboardCenter.insertAdjacentHTML('beforeend', `<button value="${el}" class="keyboard__button keyboard__button--center button">${el}</button>`);
});

if (!expression) {
  resultValue.textContent = '0';
} else {

}

const buttons = document.querySelectorAll('.keyboard__button');

buttons.forEach(btn => {
  btn.addEventListener('click', e => {
    let operation = e.target.value;

    if (operation === 'AC') {
      return clear();
    }

    if (operation === '+/-') {
      return negative();
    }

    if (operation === '=') {
      return result();
    }

    if (OPERATION_LIST_RIGHT.includes(operation)) {
      return calc(operation);
    }

    createNumber(operation);
  });
});

function checkCurrValue() {
  if (currValue) {
    expression.push(currValue);
    expressionPreview.push(currValue);
    currValue = '';
  }
}

function createNumber(operation) {
  if (operation === '%' && !currValue || operation === '%' && (expressionPreview[expressionPreview.length - 1] === operation || currValue[currValue.length - 1] === operation)) {
    return;
  }

  currValue += operation;

  expressionPreview.length
    ?
    resultValue.textContent = expressionPreview.join('') + currValue
    :
    resultValue.textContent = currValue;
}

function clear() {
  resultValue.textContent = '0';
  currValue = '';
  expression = [];
  expressionPreview = [];
  resultExpression.textContent = '';
}

function negative() {
  checkCurrValue();

  let lastIndex = expression.length - 1;
  let negative = Math.sign(expression[lastIndex]);

  if (isNaN(negative) || 0) {
    return;
  }

  if (negative === 1) {
    expression[lastIndex] = expressionPreview[lastIndex] = `-${expression[lastIndex]}`;
  } else {
    expression[lastIndex] = expressionPreview[lastIndex] = Math.abs(expression[lastIndex]);
  }

  resultValue.textContent = expressionPreview.join('');
}

function result() {
  checkCurrValue();

  if (!expression.length) {
    return;
  }

  if (OPERATION_LIST_RIGHT.includes(expressionPreview[expressionPreview.length - 1])) {
    expression.pop();
    expressionPreview.pop();
  }

  let res = expression.join('');
  let resExpression = expressionPreview.join(' ');

  resultValue.textContent = math.evaluate(res);
  resultExpression.textContent = resExpression;
  expression = [resultValue.textContent];
  expressionPreview = [resultValue.textContent];

  let operation = resExpression + ' = ' + resultValue.textContent;
  addHistoryList(operation);
}

function calc(operation) {
  checkCurrValue();

  if (!expression.length) {
    return;
  }

  if (OPERATION_LIST_RIGHT.includes(expressionPreview[expressionPreview.length - 1])) {
    expression.pop();
    expressionPreview.pop();
  }

  let operationExample = operation;

  if (operation === '÷') {
    operationExample = '/';
  }
  if (operation === '×') {
    operationExample = '*';
  }

  expression.push(operationExample);
  expressionPreview.push(operation);

  resultValue.textContent = expressionPreview.join('');
}

function addHistoryList(operation) {
  const div = document.createElement('div');
  div.textContent = operation;
  historyList.appendChild(div);
}
