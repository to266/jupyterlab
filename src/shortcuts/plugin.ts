// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Application
} from 'phosphide/lib/core/application';


/**
 * The list of default application shortcuts.
 *
 * #### Notes
 * When setting shortcut selectors, there are two concepts to consider:
 * specificity and matchability. These two interact in sometimes
 * counterintuitive ways. Keyboard events are triggered from an element and
 * they propagate up the DOM until they reach the `documentElement` (`<body>`).
 *
 * When a registered shortcut sequence is fired, the shortcut manager checks
 * the node that fired the event and each of its ancestors until a node matches
 * one or more registered selectors. The *first* matching selector in the
 * chain of ancestors will invoke the shortcut handler and the traversal will
 * end at that point. If a node matches more than one selector, the handler for
 * whichever selector is more *specific* fires.
 * @see https://www.w3.org/TR/css3-selectors/#specificity
 *
 * The practical consequence of this is that a very broadly matching selector,
 * e.g. `'*'` or `'div'` may match and therefore invoke a handler *before* a
 * more specific selector. The most common pitfall is to use the universal
 * (`'*'`) selector. For almost any use case where a global keyboard shortcut is
 * required, using the `'body'` selector is more appropriate.
 */
const SHORTCUTS = [
  {
    command: 'command-palette:toggle',
    selector: 'body',
    sequence: ['Accel Shift P']
  },
  {
    command: 'file-browser:toggle',
    selector: 'body',
    sequence: ['Accel Shift F']
  },
  {
    command: 'file-operations:new-text-file',
    selector: 'body',
    sequence: ['Ctrl O']
  },
  {
    command: 'file-operations:new-notebook',
    selector: 'body',
    sequence: ['Ctrl Shift N']
  },
  {
    command: 'file-operations:save',
    selector: '.jp-Document',
    sequence: ['Accel S']
  },
  {
    command: 'file-operations:close',
    selector: '.jp-Document',
    sequence: ['Ctrl Q']
  },
  {
    command: 'file-operations:close-all',
    selector: '.jp-Document',
    sequence: ['Ctrl Shift Q']
  },
  {
    command: 'help-doc:toggle',
    selector: 'body',
    sequence: ['Accel Shift H']
  },
  {
    command: 'notebook-cells:run-and-advance',
    selector: '.jp-Notebook',
    sequence: ['Shift Enter']
  },
  {
    command: 'notebook-cells:run-and-insert',
    selector: '.jp-Notebook',
    sequence: ['Alt Enter']
  },
  {
    command: 'notebook-cells:run',
    selector: '.jp-Notebook',
    sequence: ['Ctrl Enter']
  },
  {
    command: 'notebook:interrupt-kernel',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['I', 'I']
  },
  {
    command: 'notebook:restart-kernel',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['0', '0']
  },
  {
    command: 'notebook-cells:to-code',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['E']
  },
  {
    command: 'notebook-cells:to-markdown',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['M']
  },
  {
    command: 'notebook-cells:to-raw',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['R']
  },
  {
    command: 'notebook-cells:delete',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['D', 'D'],
  },
  {
    command: 'notebook-cells:split',
    selector: '.jp-Notebook.jp-mod-editMode',
    sequence: ['Ctrl Shift -'],
  },
  {
    command: 'notebook-cells:merge',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Shift M'],
  },
  {
    command: 'notebook-cells:select-above',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['K'],
  },
  {
    command: 'notebook-cells:select-below',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['J'],
  },
  {
    command: 'notebook-cells:extend-above',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Shift K'],
  },
  {
    command: 'notebook-cells:extend-below',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Shift J'],
  },
  {
    command: 'notebook-cells:select-above',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['ArrowUp'],
  },
  {
    command: 'notebook-cells:select-below',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['ArrowDown'],
  },
  {
    command: 'notebook-cells:extend-above',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Shift ArrowUp'],
  },
  {
    command: 'notebook-cells:extend-below',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Shift ArrowDown'],
  },
  {
    command: 'notebook-cells:undo',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Z'],
  },
  {
    command: 'notebook-cells:redo',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Y'],
  },
  {
    command: 'notebook-cells:cut',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['X']
  },
  {
    command: 'notebook-cells:copy',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['C']
  },
  {
    command: 'notebook-cells:paste',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['V']
  },
  {
    command: 'notebook-cells:insert-above',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['A']
  },
  {
    command: 'notebook-cells:insert-below',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['B']
  },
  {
    command: 'notebook-cells:select-previous',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['ArrowUp']
  },
  {
    command: 'notebook-cells:select-next',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['ArrowDown']
  },
  {
    command: 'notebook-cells:toggle-line-numbers',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['L']
  },
  {
    command: 'notebook-cells:markdown-header1',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['1']
  },
  {
    command: 'notebook-cells:markdown-header2',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['2']
  },
  {
    command: 'notebook-cells:markdown-header3',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['3']
  },
  {
    command: 'notebook-cells:markdown-header4',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['4']
  },
  {
    command: 'notebook-cells:markdown-header5',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['5']
  },
  {
    command: 'notebook-cells:markdown-header6',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['6']
  },
  {
    command: 'notebook:edit-mode',
    selector: '.jp-Notebook.jp-mod-commandMode',
    sequence: ['Enter']
  },
  {
    command: 'notebook:command-mode',
    selector: '.jp-Notebook.jp-mod-editMode',
    sequence: ['Escape']
  },
  {
    command: 'console:execute',
    selector: '.jp-Console .jp-CellEditor',
    sequence: ['Shift Enter']
  },
  {
    command: 'console:dismiss-overlays',
    selector: '.jp-Console .jp-CellEditor',
    sequence: ['Escape']
  },
];


/**
 * The default shortcuts extension.
 */
export
const shortcutsExtension = {
  id: 'jupyter.extensions.shortcuts',
  activate: (app: Application): Promise<void> => {
    app.shortcuts.add(SHORTCUTS);
    return Promise.resolve(void 0);
  }
};
