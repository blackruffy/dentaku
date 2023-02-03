import { evaluate } from './parser';
import { State } from './state';
import { tag } from './tag';

window.onload = () => {
  const state = new State({
    command: '' as string,
    resultAnimation: '' as string,
    dialogBody: '' as string,
    dialogLeft: '100vw' as string,
    dialogAnimation: '' as string,
  } as const);

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
          {
            class: 'result-box',
          },
          tag(
            'div',
            state.onUpdate(data => ({
              class: 'result-text',
              text: data.command,
              style: {
                animation: data.resultAnimation,
              },
              animationend: () =>
                state.update(cur => ({
                  ...cur,
                  resultAnimation: '',
                })),
            })),
          ),
        ),
        tag('div', {
          class: 'clear-button',
          text: 'AC',
          click: () =>
            state.update(cur => ({
              ...cur,
              command: '',
              resultAnimation: 'delete-result 300ms ease 0ms',
            })),
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
                click: () =>
                  state.update(cur => {
                    const res = {
                      ...cur,
                      resultAnimation: 'emph-font 300ms ease 0ms',
                    };
                    switch (x) {
                      case '=':
                        try {
                          return {
                            ...res,
                            command:
                              res.command === ''
                                ? ''
                                : `${evaluate(cur.command)}`,
                          };
                        } catch (err) {
                          console.error(err);
                          return {
                            ...res,
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
                          ...res,
                          command: res.command + ` ${x} `,
                        };
                      default:
                        return {
                          ...res,
                          command: res.command + `${x}`,
                        };
                    }
                  }),
              }),
            ),
          ),
        ),
      ),

      tag(
        'div',
        state.onUpdate(data => ({
          class: 'dialog-container',
          style: { left: data.dialogLeft },
        })),
        tag(
          'div',
          { class: 'dialog-main' },
          tag('div', { class: 'dialog-title', text: 'ERROR' }),
          tag(
            'div',
            state.onUpdate(data => ({
              class: 'dialog-body',
              text: data.dialogBody,
            })),
          ),
          tag('div', {
            class: 'dialog-button',
            text: 'OK',
            click: () =>
              state.update(cur => ({
                ...cur,
                dialogBody: '',
                dialogLeft: '100vw',
                dialogAnimation: '',
              })),
          }),
        ),
      ),
    ),
  );
};
