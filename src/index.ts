import { evaluate } from './parser';
import { tag } from './tag';

window.onload = () => {
  const state = {
    command: '',
  };

  tag(
    document.body,
    {},

    tag(
      'div',
      { class: 'main' },
      tag('div', { class: 'line-gap' }),

      tag(
        'div',
        { class: 'result' },
        tag(
          'div',
          { class: 'result-box' },
          tag('div', { class: 'result-text' }),
        ),
        tag('div', { class: 'clear-button' }, 'AC'),
      ),

      tag('div', { class: 'line-gap' }),

      tag(
        'div',
        { class: 'container' },
        ...[
          ['1', '2', '3', '/'],
          ['4', '5', '6', '*'],
          ['7', '8', '9', '-'],
          ['0', '.', '=', '+'],
        ].map(row =>
          tag(
            'div',
            { class: 'row' },
            ...row.map(x => tag('div', { class: 'cell' }, x)),
          ),
        ),
      ),
      tag(
        'div',
        { class: 'dialog-container' },
        tag(
          'div',
          { class: 'dialog-main' },
          tag('div', { class: 'dialog-title' }, 'ERROR'),
          tag('div', { class: 'dialog-body' }),
          tag('div', { class: 'dialog-button' }, 'OK'),
        ),
      ),
    ),
  );

  const input = document.getElementsByClassName(
    'result-text',
  )[0] as HTMLElement;
  input.addEventListener('animationend', () => {
    input.style.animation = '';
    input.innerText = state.command;
  });

  const ac = document.getElementsByClassName('clear-button')[0];
  ac.addEventListener('click', _ => {
    state.command = '';
    input.style.animation = 'delete-result 300ms ease 0ms';
  });

  const dialog = document.getElementsByClassName(
    'dialog-container',
  )[0] as HTMLElement;
  const dialogMain = document.getElementsByClassName(
    'dialog-main',
  )[0] as HTMLElement;
  const dialogBody = document.getElementsByClassName(
    'dialog-body',
  )[0] as HTMLElement;
  const dialogButton = document.getElementsByClassName('dialog-button')[0];
  dialogButton.addEventListener('click', _ => {
    dialog.style.left = '100vw';
    dialogMain.style.animation = '';
  });

  const cells = Array.from(document.getElementsByClassName('cell'));
  for (const cell of cells) {
    cell.addEventListener('click', e => {
      const value = (e.target as HTMLElement).innerText;
      switch (value) {
        case '=':
          try {
            const result =
              state.command === '' ? '' : `${evaluate(state.command)}`;
            state.command = result;
          } catch (err) {
            dialogBody.innerText = `${
              typeof err === 'string'
                ? err
                : err instanceof Error
                ? err.message
                : JSON.stringify(err)
            }`;
            dialog.style.left = '0px';
            dialogMain.style.animation = 'dialog-show 300ms ease 0ms';
          }
          break;
        case '*':
        case '/':
        case '-':
        case '+':
          state.command += ` ${value} `;
          break;
        default:
          state.command += `${value}`;
          break;
      }
      input.style.animation = 'emph-font 300ms ease 0ms';
      input.innerText = state.command;
    });
  }
};
