// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IServiceManager, ISession, ITerminalSession
} from 'jupyter-js-services';

import {
  hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';

import {
  hitTestNodes, findElement
} from '../utils';


/**
 * The class name added to a running widget.
 */
const RUNNING_CLASS = 'jp-RunningSessions';

/**
 * The class name added to a running widget header.
 */
const HEADER_CLASS = 'jp-RunningSessions-header';

/**
 * The class name added to a running widget header title.
 */
const TITLE_CLASS = 'jp-RunningSessions-headerTitle';

/**
 * The class name added to a running widget header refresh button.
 */
const REFRESH_CLASS = 'jp-RunningSessions-headerRefresh';

/**
 * The class name added to the running terminal sessions section.
 */
const SECTION_CLASS = 'jp-RunningSessions-section';

/**
 * The class name added to the running terminal sessions section.
 */
const TERMINALS_CLASS = 'jp-RunningSessions-terminalSection';

/**
 * The class name added to the running kernel sessions section.
 */
const SESSIONS_CLASS = 'jp-RunningSessions-sessionsSection';

/**
 * The class name added to the running sessions section header.
 */
const SECTION_HEADER_CLASS = 'jp-RunningSessions-sectionHeader';

/**
 * The class name added to a section container.
 */
const CONTAINER_CLASS = 'jp-RunningSessions-sectionContainer';

/**
 * The class name added to the running kernel sessions section list.
 */
const LIST_CLASS = 'jp-RunningSessions-sectionList';

/**
 * The class name added to the running sessions items.
 */
const ITEM_CLASS = 'jp-RunningSessions-item';

/**
 * The class name added to a running session item icon.
 */
const ITEM_ICON_CLASS = 'jp-RunningSessions-itemIcon';

/**
 * The class name added to a running session item label.
 */
const ITEM_LABEL_CLASS = 'jp-RunningSessions-itemLabel';

/**
 * The class name added to a running session item kernel name.
 */
const KERNEL_NAME_CLASS = 'jp-RunningSessions-itemKernelName';

/**
 * The class name added to a running session item shutdown button.
 */
const SHUTDOWN_BUTTON_CLASS = 'jp-RunningSessions-itemShutdown';

/**
 * The class name added to a notebook icon.
 */
const NOTEBOOK_ICON_CLASS = 'jp-mod-notebook';

/**
 * The class name added to a file icon.
 */
const FILE_ICON_CLASS = 'jp-mod-file';

/**
 * The class name added to a terminal icon.
 */
const TERMINAL_ICON_CLASS = 'jp-mod-terminal';

/**
 * The duration of auto-refresh in ms.
 */
const REFRESH_DURATION = 10000;


/**
 * A class that exposes the running terminal and kernel sessions.
 */
export
class RunningSessions extends Widget {
  /**
   * Create the node for the running widget.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let header = document.createElement('div');
    header.className = HEADER_CLASS;
    let terminals = document.createElement('div');
    terminals.className = `${SECTION_CLASS} ${TERMINALS_CLASS}`;
    let sessions = document.createElement('div');
    sessions.className = `${SECTION_CLASS} ${SESSIONS_CLASS}`;

    let title = document.createElement('span');
    title.textContent = 'Currently Running Jupyter Processes';
    title.className = TITLE_CLASS;
    header.appendChild(title);

    let refresh = document.createElement('span');
    refresh.className = REFRESH_CLASS;
    header.appendChild(refresh);

    node.appendChild(header);
    node.appendChild(terminals);
    node.appendChild(sessions);
    return node;
  }

  /**
   * Construct a new running widget.
   */
  constructor(options: RunningSessions.IOptions) {
    super();
    this._manager = options.manager;
    this._renderer = options.renderer || RunningSessions.defaultRenderer;
    this.addClass(RUNNING_CLASS);

    // Populate the terminals section.
    let termNode = findElement(this.node, TERMINALS_CLASS);
    let termHeader = this._renderer.createTerminalHeaderNode();
    termHeader.className = SECTION_HEADER_CLASS;
    termNode.appendChild(termHeader);
    let termContainer = document.createElement('div');
    termContainer.className = CONTAINER_CLASS;
    let termList = document.createElement('ul');
    termList.className = LIST_CLASS;
    termContainer.appendChild(termList);
    termNode.appendChild(termContainer);

    // Populate the sessions section.
    let sessionNode = findElement(this.node, SESSIONS_CLASS);
    let sessionHeader = this._renderer.createSessionHeaderNode();
    sessionHeader.className = SECTION_HEADER_CLASS;
    sessionNode.appendChild(sessionHeader);
    let sessionContainer = document.createElement('div');
    sessionContainer.className = CONTAINER_CLASS;
    let sessionList = document.createElement('ul');
    sessionList.className = LIST_CLASS;
    sessionContainer.appendChild(sessionList);
    sessionNode.appendChild(sessionContainer);

    this._manager.terminals.runningChanged.connect(this._onTerminalsChanged, this);
    this._manager.sessions.runningChanged.connect(this._onSessionsChanged, this);
  }

  /**
   * A signal emitted when a kernel session open is requested.
   */
  get sessionOpenRequested(): ISignal<RunningSessions, ISession.IModel> {
    return Private.sessionOpenRequestedSignal.bind(this);
  }

  /**
   * A signal emitted when a terminal session open is requested.
   */
  get terminalOpenRequested(): ISignal<RunningSessions, ITerminalSession.IModel> {
    return Private.terminalOpenRequestedSignal.bind(this);
  }

  /**
   * The renderer used by the running sessions widget.
   *
   * #### Notes
   * This is a read-only property.
   */
  get renderer(): RunningSessions.IRenderer {
    return this._renderer;
  }

  /**
   * Test whether the widget is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._manager === null;
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._manager = null;
    this._runningSessions = null;
    this._runningTerminals = null;
    this._renderer = null;
  }

  /**
   * Refresh the widget.
   */
  refresh(): Promise<void> {
    let terminals = this._manager.terminals;
    let sessions = this._manager.sessions;
    clearTimeout(this._refreshId);
    return terminals.listRunning().then(running => {
      this._onTerminalsChanged(terminals, running);
      return sessions.listRunning();
    }).then(running => {
      this._onSessionsChanged(sessions, running);
      this._refreshId = setTimeout(() => {
        this.refresh();
      }, REFRESH_DURATION);
    });
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the widget's DOM nodes. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    if (event.type === 'click') {
      this._evtClick(event as MouseEvent);
    }
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('click', this);
    this.refresh();
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Fetch common variables.
    let termSection = findElement(this.node, TERMINALS_CLASS);
    let termList = findElement(termSection, LIST_CLASS);
    let sessionSection = findElement(this.node, SESSIONS_CLASS);
    let sessionList = findElement(sessionSection, LIST_CLASS);
    let renderer = this._renderer;
    let kernelspecs = this._manager.kernelspecs.kernelspecs;

    // Remove any excess item nodes.
    while (termList.children.length > this._runningTerminals.length) {
      termList.removeChild(termList.firstChild);
    }
    while (sessionList.children.length > this._runningSessions.length) {
      sessionList.removeChild(sessionList.firstChild);
    }

    // Add any missing item nodes.
    while (termList.children.length < this._runningTerminals.length) {
      let node = renderer.createTerminalNode();
      node.classList.add(ITEM_CLASS);
      termList.appendChild(node);
    }
    while (sessionList.children.length < this._runningSessions.length) {
      let node = renderer.createSessionNode();
      node.classList.add(ITEM_CLASS);
      sessionList.appendChild(node);
    }

    // Populate the nodes.
    for (let i = 0; i < this._runningTerminals.length; i++) {
      let node = termList.children[i] as HTMLLIElement;
      renderer.updateTerminalNode(node, this._runningTerminals[i]);
    }
    for (let i = 0; i < this._runningSessions.length; i++) {
      let node = sessionList.children[i] as HTMLLIElement;
      let model = this._runningSessions[i];
      let kernelName = kernelspecs[model.kernel.name].spec.display_name;
      renderer.updateSessionNode(node, model, kernelName);
    }
  }

  /**
   * Handle the `'click'` event for the widget.
   *
   * #### Notes
   * This listener is attached to the document node.
   */
  private _evtClick(event: MouseEvent): void {
    // Fetch common variables.
    let termSection = findElement(this.node, TERMINALS_CLASS);
    let termList = findElement(termSection, LIST_CLASS);
    let sessionSection = findElement(this.node, SESSIONS_CLASS);
    let sessionList = findElement(sessionSection, LIST_CLASS);
    let refresh = findElement(this.node, REFRESH_CLASS);
    let renderer = this._renderer;
    let clientX = event.clientX;
    let clientY = event.clientY;

    // Check for a refresh.
    if (hitTest(refresh, clientX, clientY)) {
      this.refresh();
      return;
    }

    // Check for a terminal item click.
    let index = hitTestNodes(termList.children, clientX, clientY);
    if (index !== -1) {
      let node = termList.children[index] as HTMLLIElement;
      let shutdown = renderer.getTerminalShutdown(node);
      let model = this._runningTerminals[index];
      if (hitTest(shutdown, clientX, clientY)) {
        this._manager.terminals.shutdown(model.name).then(() => {
          this.refresh();
        });
        return;
      }
      this.terminalOpenRequested.emit(model);
    }

    // Check for a session item click.
    index = hitTestNodes(sessionList.children, clientX, clientY);
    if (index !== -1) {
      let node = sessionList.children[index] as HTMLLIElement;
      let shutdown = renderer.getSessionShutdown(node);
      let model = this._runningSessions[index];
      if (hitTest(shutdown, clientX, clientY)) {
        this._manager.sessions.shutdown(model.id).then(() => {
          this.refresh();
        });
        return;
      }
      this.sessionOpenRequested.emit(model);
    }
  }

  /**
   * Handle a change to the running sessions.
   */
  private _onSessionsChanged(sender: ISession.IManager, models: ISession.IModel[]): void {
    // Strip out non-file backed sessions.
    this._runningSessions = [];
    for (let session of models) {
      let name = session.notebook.path.split('/').pop();
      if (name.indexOf('.') !== -1) {
        this._runningSessions.push(session);
      }
    }
    this.update();
  }

  /**
   * Handle a change to the running terminals.
   */
  private _onTerminalsChanged(sender: ITerminalSession.IManager, models: ITerminalSession.IModel[]): void {
    this._runningTerminals = models;
    this.update();
  }

  private _manager: IServiceManager = null;
  private _renderer: RunningSessions.IRenderer = null;
  private _runningSessions: ISession.IModel[] = [];
  private _runningTerminals: ITerminalSession.IModel[] = [];
  private _refreshId = -1;
}


/**
 * The namespace for the `RunningSessions` class statics.
 */
export
namespace RunningSessions {
  /**
   * An options object for creating a running sessions widget.
   */
  export
  interface IOptions {
    /**
     * A service manager instance.
     */
    manager: IServiceManager;

    /**
     * The renderer for the running sessions widget.
     *
     * The default is a shared renderer instance.
     */
    renderer?: IRenderer;
  }

  /**
   * A renderer for use with a menu.
   */
  export
  interface IRenderer {
    /**
     * Create a fully populated header node for the terminals section.
     *
     * @returns A new node for a running terminal session header.
     */
    createTerminalHeaderNode(): HTMLElement;

    /**
     * Create a fully populated header node for the sessions section.
     *
     * @returns A new node for a running kernel session header.
     */
    createSessionHeaderNode(): HTMLElement;

    /**
     * Create a node for a running terminal session item.
     *
     * @returns A new node for a running terminal session item.
     *
     * #### Notes
     * The data in the node should be uninitialized.
     *
     * The `updateTerminalNode` method will be called for initialization.
     */
    createTerminalNode(): HTMLLIElement;

    /**
     * Create a node for a running kernel session item.
     *
     * @returns A new node for a running kernel session item.
     *
     * #### Notes
     * The data in the node should be uninitialized.
     *
     * The `updateSessionNode` method will be called for initialization.
     */
    createSessionNode(): HTMLLIElement;

    /**
     * Get the shutdown node for a terminal node.
     *
     * @param node - A node created by a call to `createTerminalNode`.
     *
     * @returns The node representing the shutdown option.
     *
     * #### Notes
     * A click on this node is considered a shutdown request.
     * A click anywhere else on the node is considered an open request.
     */
    getTerminalShutdown(node: HTMLLIElement): HTMLElement;

    /**
     * Get the shutdown node for a session node.
     *
     * @param node - A node created by a call to `createSessionNode`.
     *
     * @returns The node representing the shutdown option.
     *
     * #### Notes
     * A click on this node is considered a shutdown request.
     * A click anywhere else on the node is considered an open request.
     */
    getSessionShutdown(node: HTMLLIElement): HTMLElement;

    /**
     * Populate a node with running terminal session data.
     *
     * @param node - A node created by a call to `createTerminalNode`.
     *
     * @param models - The list of terminal session models.
     *
     * #### Notes
     * This method should completely reset the state of the node to
     * reflect the data for the session models.
     */
    updateTerminalNode(node: HTMLLIElement, model: ITerminalSession.IModel): void;

    /**
     * Populate a node with running kernel session data.
     *
     * @param node - A node created by a call to `createSessionNode`.
     *
     * @param models - The list of kernel session models.
     *
     * @param kernelName - The kernel display name.
     *
     * #### Notes
     * This method should completely reset the state of the node to
     * reflect the data for the session models.
     */
    updateSessionNode(node: HTMLLIElement, model: ISession.IModel, kernelName: string): void;
  }


  /**
   * The default implementation of `IRenderer`.
   */
  export
  class Renderer implements IRenderer {
    /**
     * Create a fully populated header node for the terminals section.
     *
     * @returns A new node for a running terminal session header.
     */
    createTerminalHeaderNode(): HTMLElement {
      let node = document.createElement('div');
      node.textContent = 'Terminal Sessions';
      return node;
    }

    /**
     * Create a fully populated header node for the sessions section.
     *
     * @returns A new node for a running kernel session header.
     */
    createSessionHeaderNode(): HTMLElement {
      let node = document.createElement('div');
      node.textContent = 'Kernel Sessions';
      return node;
    }

    /**
     * Create a node for a running terminal session item.
     *
     * @returns A new node for a running terminal session item.
     *
     * #### Notes
     * The data in the node should be uninitialized.
     *
     * The `updateTerminalNode` method will be called for initialization.
     */
    createTerminalNode(): HTMLLIElement {
      let node = document.createElement('li');
      let icon = document.createElement('span');
      icon.className = `${ITEM_ICON_CLASS} ${TERMINAL_ICON_CLASS}`;
      let label = document.createElement('span');
      label.className = ITEM_LABEL_CLASS;
      let shutdown = document.createElement('span');
      shutdown.className = SHUTDOWN_BUTTON_CLASS;
      shutdown.textContent = 'SHUTDOWN';

      node.appendChild(icon);
      node.appendChild(label);
      node.appendChild(shutdown);
      return node;
    }

    /**
     * Create a node for a running kernel session item.
     *
     * @returns A new node for a running kernel session item.
     *
     * #### Notes
     * The data in the node should be uninitialized.
     *
     * The `updateSessionNode` method will be called for initialization.
     */
    createSessionNode(): HTMLLIElement {
      let node = document.createElement('li');
      let icon = document.createElement('span');
      icon.className = ITEM_ICON_CLASS;
      let label = document.createElement('span');
      label.className = ITEM_LABEL_CLASS;
      let kernel = document.createElement('span');
      kernel.className = KERNEL_NAME_CLASS;
      let shutdown = document.createElement('span');
      shutdown.className = SHUTDOWN_BUTTON_CLASS;
      shutdown.textContent = 'SHUTDOWN';

      node.appendChild(icon);
      node.appendChild(label);
      node.appendChild(kernel);
      node.appendChild(shutdown);
      return node;
    }

    /**
     * Get the shutdown node for a terminal node.
     *
     * @param node - A node created by a call to `createTerminalNode`.
     *
     * @returns The node representing the shutdown option.
     *
     * #### Notes
     * A click on this node is considered a shutdown request.
     * A click anywhere else on the node is considered an open request.
     */
    getTerminalShutdown(node: HTMLLIElement): HTMLElement {
      return findElement(node, SHUTDOWN_BUTTON_CLASS);
    }

    /**
     * Get the shutdown node for a session node.
     *
     * @param node - A node created by a call to `createSessionNode`.
     *
     * @returns The node representing the shutdown option.
     *
     * #### Notes
     * A click on this node is considered a shutdown request.
     * A click anywhere else on the node is considered an open request.
     */
    getSessionShutdown(node: HTMLLIElement): HTMLElement {
      return findElement(node, SHUTDOWN_BUTTON_CLASS);
    }

    /**
     * Populate a node with running terminal session data.
     *
     * @param node - A node created by a call to `createTerminalNode`.
     *
     * @param models - The list of terminal session models.
     *
     * #### Notes
     * This method should completely reset the state of the node to
     * reflect the data for the session models.
     */
    updateTerminalNode(node: HTMLLIElement, model: ITerminalSession.IModel): void {
      let label = findElement(node, ITEM_LABEL_CLASS);
      label.textContent = `terminals/${model.name}`;
    }

    /**
     * Populate a node with running kernel session data.
     *
     * @param node - A node created by a call to `createSessionNode`.
     *
     * @param models - The list of kernel session models.
     *
     * @param kernelName - The kernel display name.
     *
     * #### Notes
     * This method should completely reset the state of the node to
     * reflect the data for the session models.
     */
    updateSessionNode(node: HTMLLIElement, model: ISession.IModel, kernelName: string): void {
      let icon = findElement(node, ITEM_ICON_CLASS);
      if (model.notebook.path.indexOf('.ipynb') !== -1) {
        icon.className = `${ITEM_ICON_CLASS} ${NOTEBOOK_ICON_CLASS}`;
      } else {
        icon.className = `${ITEM_ICON_CLASS} ${FILE_ICON_CLASS}`;
      }
      let label = findElement(node, ITEM_LABEL_CLASS);
      label.textContent = model.notebook.path.split('/').pop();
      let kernel = findElement(node, KERNEL_NAME_CLASS);
      kernel.textContent = kernelName;
    }
  }

  /**
   * The default `Renderer` instance.
   */
  export
  const defaultRenderer = new Renderer();
}


/**
 * The namespace for the private module data.
 */
namespace Private {
  /**
   * A signal emitted when a kernel session open is requested.
   */
  export
  const sessionOpenRequestedSignal = new Signal<RunningSessions, ISession.IModel>();

  /**
   * A signal emitted when a terminal session open is requested.
   */
  export
  const terminalOpenRequestedSignal = new Signal<RunningSessions, ITerminalSession.IModel>();
}
