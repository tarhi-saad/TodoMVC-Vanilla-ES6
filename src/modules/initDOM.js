import DOMHelpers from './DOMHelpers';
import assets from './assets';

const {
  createElement,
  on,
  off,
  getElement,
  addClass,
  removeClass,
  disableTransition,
} = DOMHelpers();

const {
  arrowSVG,
  emptyStateSVG,
  calendarSVG,
  noteSVG,
  checkMarkSVG,
  menuSVG,
  plusSVG,
  importantSVG,
  daySVG,
} = assets();

const initializeDOMElements = () => {
  // the root element
  const root = document.getElementById('root');
  // Header
  const header = createElement('header');
  const menuButton = createElement('button', '.menu-btn');
  menuButton.dataset.state = 'open';
  menuButton.insertAdjacentHTML('beforeEnd', menuSVG);
  header.append(menuButton);
  // The left block containing all projects
  const listsMenu = createElement('div', '.lists-menu');
  // UL element with our list of projects
  const lists = createElement('ul', '.lists');
  // The form with our input to add a project
  const newList = createElement('form');
  const newListInput = createElement('input', '#newList');
  const newListLabel = createElement('label');
  const newListSubmit = createElement('input', '.submit-btn');
  newListLabel.insertAdjacentHTML('beforeEnd', plusSVG);
  newListLabel.htmlFor = 'newList';
  newListInput.type = 'text';
  newListInput.placeholder = 'New list';
  newListInput.autocomplete = 'off';
  newListSubmit.type = 'submit';
  newListSubmit.value = '+ Add';
  addClass(newListSubmit, 'hide');

  // The center block which will display our todos/tasks
  const tasksView = createElement('div', '.tasks-view');
  // UL element with our list of tasks
  const todoList = createElement('ul', '.todo-list');
  // The form with the input to add a Todo
  const newTodo = createElement('form');
  const newTodoInput = createElement('input', '#newTodo');
  const newTodoSubmit = createElement('button', '.submit-btn');
  newTodoInput.type = 'text';
  newTodoInput.placeholder = '+ Add task';
  newTodoInput.autocomplete = 'off';
  newTodoSubmit.type = 'submit';
  newTodoSubmit.insertAdjacentHTML('beforeEnd', arrowSVG);
  // Empty state block
  const emptyState = createElement('div', '#empty-state');
  emptyState.insertAdjacentHTML('beforeEnd', emptyStateSVG);
  const emptyStateText = createElement('p');
  emptyStateText.textContent = 'What tasks are on your mind?';
  emptyState.append(emptyStateText);

  // Display selected list title in tasks view
  const tasksTitleWrapper = createElement('h1');
  const tasksTitle = createElement('span', '.tasks-title');
  const tasksTitleInput = createElement('input', '#tasksTitleInput');
  tasksTitleInput.autocomplete = 'off';
  tasksTitleWrapper.append(tasksTitle);

  // Details view for todo elements
  const detailsView = createElement('div', '.details-view');

  // Confirm Modal
  const modal = createElement('div', '#modal');
  addClass(modal, 'close');
  const modalTitle = createElement('h2');
  modalTitle.innerHTML = 'Are you sure?';
  const modalText = createElement('p');
  modalText.innerHTML = 'Are you sure to delete this item?';
  const modalOk = createElement('button', '.confirm-btn');
  modalOk.textContent = 'Ok';
  const modalCancel = createElement('button', '.cancel-btn');
  modalCancel.textContent = 'Cancel';
  const modalFooter = createElement('footer');
  modalFooter.append(modalOk, modalCancel);
  modal.append(modalTitle, modalText, modalFooter);
  // Modal backdrop & overlay
  const modalBackdrop = createElement('div', '.modal-backdrop');
  const overlay = createElement('div', '.overlay');
  document.body.append(modalBackdrop, overlay);

  // Indicators
  /* Note indicator */
  const noteIndicatorFn = () => {
    const noteIndicator = createElement('span', '.note-indicator');
    const noteIndicatorLabel = createElement('span', '.note-indicator-label');
    noteIndicatorLabel.innerHTML = 'Note';
    noteIndicator.insertAdjacentHTML('beforeEnd', noteSVG);
    noteIndicator.append(noteIndicatorLabel);

    return noteIndicator;
  };

  /* Date indicator */
  const dateIndicatorFn = () => {
    const dateIndicator = createElement('span', '.date-indicator');
    const dateIndicatorLabel = createElement('span', '.date-indicator-label');
    dateIndicator.insertAdjacentHTML('beforeEnd', calendarSVG);
    dateIndicator.append(dateIndicatorLabel);

    return dateIndicator;
  };

  /* Note indicator */
  const subtaskIndicatorFn = () => {
    const subtaskIndicator = createElement('span', '.subtask-indicator');
    const subtaskIndicatorLabel = createElement('span', '.subtask-indicator-label');
    subtaskIndicator.insertAdjacentHTML('beforeEnd', checkMarkSVG);
    subtaskIndicator.append(subtaskIndicatorLabel);

    return subtaskIndicator;
  };

  /* Important indicator */
  const importantIndicatorFn = () => {
    const importantIndicator = createElement('span', '.important-indicator');
    importantIndicator.insertAdjacentHTML('beforeEnd', importantSVG);

    return importantIndicator;
  };

  /* "My Day" indicator */
  const myDayIndicatorFn = () => {
    const myDayIndicator = createElement('span', '.my-day-indicator');
    myDayIndicator.insertAdjacentHTML('beforeEnd', daySVG);

    return myDayIndicator;
  };

  // Append elements
  newList.append(newListLabel, newListInput, newListSubmit);
  listsMenu.append(lists, newList);
  newTodo.append(newTodoInput, newTodoSubmit);
  tasksView.append(tasksTitleWrapper, todoList, emptyState, newTodo);

  root.append(header, listsMenu, tasksView, detailsView, modal);

  // Helper function - 'refreshTodoItemsPositions' helper
  const refreshTodoItemsPositionsHelper = (list) => {
    // Disable all transitions
    disableTransition(list);
    const { children } = list;
    let fullHeight = 0;

    Array.from(children).forEach((child, index) => {
      const height = child.offsetHeight;

      const { marginBottom } = getComputedStyle(child);

      if (index === 0) {
        child.style.transform = '';
      } else {
        child.style.transform = `translateY(${fullHeight}px)`;
      }

      fullHeight += height + parseInt(marginBottom, 10);
    });

    // The number 8 is added to give room to items to grow/shrink and not be hidden
    list.style.height = `${fullHeight + 8}px`;

    if (todoList.scrollHeight > todoList.offsetHeight) {
      addClass(todoList, 'grow-items');
    } else if (todoList.scrollHeight === todoList.offsetHeight) {
      removeClass(todoList, 'grow-items');
    }
  };
  // Helper function - refresh todos transition & list's height
  const refreshTodoItemsPositions = () => {
    const selectedProject = getElement('.list.selected');

    if (selectedProject.dataset.index === '4') {
      todoList.style.height = '';
      const listsTime = todoList.querySelectorAll('ul.todo-list-time');
      Array.from(listsTime).forEach((list) => {
        if (list.children.length > 0) {
          refreshTodoItemsPositionsHelper(list);
        }
      });
    } else {
      refreshTodoItemsPositionsHelper(todoList);
    }
  };

  // Events
  const handleOverlayClick = () => {
    menuButton.dataset.state = 'closed';
    addClass(listsMenu, 'mobile');
    removeClass(overlay, 'fade-in');
    off(overlay, 'click', handleOverlayClick);
  };

  // Helper function - reposition todos on menu toggle
  const repositionTodosOnMenuToggleHelper = (list) => {
    if (document.body.offsetWidth >= 770) {
      Array.from(list.children).forEach((child) => {
        child.style.height = `${child.offsetHeight}px`;

        const indicators = child.querySelector('.indicators');
        if (indicators && menuButton.dataset.state === 'open') {
          indicators.style.overflow = 'hidden';
          indicators.style.height = `${indicators.offsetHeight}px`;
        } else if (indicators) {
          indicators.style.width = `${indicators.offsetWidth + 1}px`;
        }
      });

      const handleTransition = () => {
        Array.from(list.children).forEach((child) => {
          child.style.height = '';

          const indicators = child.querySelector('.indicators');
          indicators.style.overflow = '';
          indicators.style.height = '';
          indicators.style.width = '';
        });
        refreshTodoItemsPositions();
        off(listsMenu, 'transitionend', handleTransition);
      };
      on(listsMenu, 'transitionend', handleTransition);
    }
  };

  // Helper function - reposition todos on menu toggle
  const repositionTodosOnMenuToggle = () => {
    const selectedProject = getElement('.list.selected');

    if (selectedProject.dataset.index === '4') {
      const listsTime = todoList.querySelectorAll('ul.todo-list-time');
      Array.from(listsTime).forEach((list) => {
        if (list.children.length > 0) {
          repositionTodosOnMenuToggleHelper(list);
        }
      });
    } else {
      repositionTodosOnMenuToggleHelper(todoList);
    }
  };

  const handleClick = () => {
    if (menuButton.dataset.state === 'open') {
      menuButton.dataset.state = 'closed';
      addClass(listsMenu, 'mobile');

      if (document.body.offsetWidth < 770) {
        removeClass(overlay, 'fade-in');
        on(overlay, 'click', handleOverlayClick);
      }
    } else {
      menuButton.dataset.state = 'open';
      removeClass(listsMenu, 'mobile');

      if (document.body.offsetWidth < 770) {
        addClass(overlay, 'fade-in');
        on(overlay, 'click', handleOverlayClick);
      }
    }

    // Reposition todos on 'menu' open/close && on desktop mode
    repositionTodosOnMenuToggle();
  };

  // Open lists sidebar if + icon is clicked to add a new list
  const handleNewListClick = () => {
    if (menuButton.dataset.state === 'closed') {
      menuButton.dataset.state = 'open';
      removeClass(listsMenu, 'mobile');

      if (document.body.offsetWidth < 770) {
        addClass(overlay, 'fade-in');
        on(overlay, 'click', handleOverlayClick);
      }

      // Reposition todos on 'newList' open && on desktop mode
      repositionTodosOnMenuToggle();
    }
  };

  // Close list sidebar menu on mobile flip if width screen size is smaller
  let screeSize = document.body.offsetWidth;
  const handleResize = () => {
    if (document.body.offsetWidth < 920 && document.body.offsetWidth < screeSize) {
      menuButton.dataset.state = 'closed';
      addClass(listsMenu, 'mobile');
      removeClass(overlay, 'fade-in');
    }

    if (document.body.offsetWidth >= 770) {
      removeClass(overlay, 'fade-in');
    }

    screeSize = document.body.offsetWidth;
  };

  on(menuButton, 'click', handleClick);
  on(newListLabel, 'click', handleNewListClick);
  on(window, 'resize', handleResize);

  return {
    root,
    tasksView,
    lists,
    todoList,
    newTodo,
    newTodoInput,
    newList,
    newListInput,
    tasksTitleWrapper,
    tasksTitle,
    tasksTitleInput,
    detailsView,
    newListSubmit,
    emptyState,
    modal,
    modalBackdrop,
    modalOk,
    modalCancel,
    modalText,
    noteIndicatorFn,
    dateIndicatorFn,
    subtaskIndicatorFn,
    importantIndicatorFn,
    myDayIndicatorFn,
    menuButton,
    overlay,
    refreshTodoItemsPositions,
  };
};

export default initializeDOMElements;
