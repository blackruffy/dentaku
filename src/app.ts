import { evaluate } from './parser';
import { Component, Update } from './state';
import { tag } from './tag';

type State = Readonly<{
  command: string;
  isCleared: boolean;
  resultAnimation: string;
  dialogBody: string;
  dialogLeft: string;
  dialogAnimation: string;
}>;

function updateCommand(x: string, state_: State): State {
  const state = {
    ...state_,
    resultAnimation: 'emph-font 300ms ease 0ms',
  };
  switch (x) {
    case '=':
      try {
        return {
          ...state,
          command: state.command === '' ? '' : `${evaluate(state.command)}`,
        };
      } catch (err) {
        console.error(err);
        return {
          ...state,
          dialogBody: `${
            typeof err === 'string'
              ? err
              : err instanceof Error
              ? err.message
              : JSON.stringify(err)
          }`,
          dialogLeft: '0px',
          dialogAnimation: 'dialog-show 300ms ease 0ms',
        };
      }
    case '*':
    case '/':
    case '-':
    case '+':
      return {
        ...state,
        command: state.command + ` ${x} `,
      };
    default:
      return {
        ...state,
        command: state.command + `${x}`,
      };
  }
}

export const App: Component<State> = (state: State, update: Update<State>) =>
  tag(
    'div',
    { class: 'main' },
    tag('div', { class: 'line-gap' }),

    tag(
      'div',
      { class: 'result' },
      tag(
        'div',
        {
          class: 'result-box',
        },
        tag('div', {
          class: 'result-text',
          text: state.command,
          style: {
            animation: state.resultAnimation,
          },
          animationend: () =>
            update({
              ...state,
              command: state.isCleared ? '' : state.command,
              isCleared: false,
              resultAnimation: '',
            }),
        }),
      ),
      tag('div', {
        class: 'clear-button',
        text: 'AC',
        click: () =>
          update({
            ...state,
            isCleared: true,
            resultAnimation: 'delete-result 300ms ease 0ms',
          }),
      }),
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
          ...row.map(x =>
            tag('div', {
              class: 'cell',
              text: x,
              click: () => update(updateCommand(x, state)),
            }),
          ),
        ),
      ),
    ),

    tag(
      'div',
      {
        class: 'dialog-container',
        style: { left: state.dialogLeft },
      },
      tag(
        'div',
        { class: 'dialog-main' },
        tag('div', { class: 'dialog-title', text: 'ERROR' }),
        tag('div', {
          class: 'dialog-body',
          text: state.dialogBody,
        }),
        tag('div', {
          class: 'dialog-button',
          text: 'OK',
          click: () =>
            update({
              ...state,
              dialogBody: '',
              dialogLeft: '100vw',
              dialogAnimation: '',
            }),
        }),
      ),
    ),
  );
