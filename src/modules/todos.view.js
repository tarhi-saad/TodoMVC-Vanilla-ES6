import deleteSVG from '../images/delete.svg';
import listSVG from '../images/list.svg';
import arrowSVG from '../images/arrow.svg';
import checkSVG from '../images/check.svg';
import emptyStateSVG from '../images/empty-state.svg';
import removeDateSVG from '../images/remove-date.svg';
import prioritySVG from '../images/priority.svg';
import calendarSVG from '../images/calendar.svg';
import noteSVG from '../images/note.svg';
import checkMarkSVG from '../images/check-mark.svg';
import menuSVG from '../images/menu.svg';
import plusSVG from '../images/plus.svg';

const DOMHelpers = () => {
  const createElement = (tag, idClass) => {
    let elem = null;
    elem = document.createElement(tag);

    if (idClass) {
      switch (idClass.charAt(0)) {
        case '#':
          elem.id = idClass.slice(1);
          break;
        case '.':
          elem.classList.add(idClass.slice(1));
          break;
        default:
      }
    }

    return elem;
  };

  const on = (target, type, callback) =>
    target.addEventListener(type, callback);

  const off = (target, type, callback) =>
    target.removeEventListener(type, callback);

  const empty = (parentNode) => {
    while (parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }
  };

  const getElement = (elem) => document.querySelector(elem);

  const wrap = (elem, className, parentElem = 'div') => {
    const wrapper = document.createElement(parentElem);
    wrapper.append(elem);

    if (className) wrapper.classList.add(className);

    return wrapper;
  };

  const unselect = (ul) => {
    Array.from(ul.children).some((li) => {
      if (li.classList.contains('selected')) {
        li.classList.remove('selected');
        return true;
      }

      return false;
    });
  };

  const addClass = (elem, className) => elem.classList.add(className);

  const removeClass = (elem, className) => elem.classList.remove(className);

  const hideElement = (elem) => {
    addClass(elem, 'hide');
  };

  const showElement = (elem) => {
    removeClass(elem, 'hide');
  };

  // Helper function to change priority class (low, medium & high)
  const resetClassList = (elem, classList) => {
    Array.from(elem.classList).forEach((className) => {
      if (classList.includes(className)) removeClass(elem, className);
    });
  };

  // Pixel to Number
  const pxToNum = (value) => Number(value.match(/[0-9]/g).join(''));

  return {
    createElement,
    on,
    off,
    empty,
    getElement,
    wrap,
    unselect,
    addClass,
    removeClass,
    hideElement,
    showElement,
    resetClassList,
    pxToNum,
  };
};

const {
  createElement,
  on,
  off,
  empty,
  getElement,
  wrap,
  unselect,
  addClass,
  removeClass,
  hideElement,
  showElement,
  resetClassList,
  pxToNum,
} = DOMHelpers();

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
    const subtaskIndicatorLabel = createElement(
      'span',
      '.subtask-indicator-label',
    );
    subtaskIndicator.insertAdjacentHTML('beforeEnd', checkMarkSVG);
    subtaskIndicator.append(subtaskIndicatorLabel);

    return subtaskIndicator;
  };

  // Append elements
  newList.append(newListLabel, newListInput, newListSubmit);
  listsMenu.append(lists, newList);
  newTodo.append(newTodoInput, newTodoSubmit);
  tasksView.append(tasksTitleWrapper, todoList, emptyState, newTodo);

  root.append(header, listsMenu, tasksView, detailsView, modal);

  // Events
  const handleOverlayClick = () => {
    menuButton.dataset.state = 'closed';
    addClass(listsMenu, 'mobile');
    removeClass(overlay, 'fade-in');
    off(overlay, 'click', handleOverlayClick);
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
    }
  };

  // Close list sidebar menu on mobile flip if width screen size is smaller
  let screeSize = document.body.offsetWidth;
  const handleResize = () => {
    if (
      document.body.offsetWidth < 920 &&
      document.body.offsetWidth < screeSize
    ) {
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
    menuButton,
    overlay,
  };
};

const todoView = () => {
  const elements = initializeDOMElements();

  // Toggle modal helpers
  const showModal = () => {
    removeClass(elements.modal, 'close');
    addClass(elements.modalBackdrop, 'fade-in');
  };

  const hideModal = () => {
    addClass(elements.modal, 'close');
    removeClass(elements.modalBackdrop, 'fade-in');
  };
  // Toggle modal
  const toggleModal = () => {
    if (elements.modal.classList.contains('close')) showModal();
    else hideModal();
  };

  /**
   *  Display the project by name in an HTML list element
   * @param {number} id id of the project
   * @param {string} name The name of the project
   * @param {Object[]} items List of todos of the project
   */
  const displayList = (id, name, items, isSelected) => {
    // Setup the "li" element ready for our project
    const li = createElement('li', '.list');
    li.dataset.index = id;
    // Setup the "span" element to display the name of the project
    const projectName = createElement('span', '.project-name');
    projectName.textContent = name;
    // Setup the "span" element to display todo-count per project
    const todoCount = createElement('span', '.todo-count');
    let count = 0;
    items.forEach((todo) => {
      if (!todo.isComplete) count += 1;
    });
    todoCount.textContent = count;
    if (count === 0) hideElement(todoCount);
    // Delete Elements
    const deleteBtn = createElement('button', '.delete-btn');
    deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
    // List icon
    const listIcon = createElement('span', '.list-icon');
    listIcon.insertAdjacentHTML('beforeEnd', listSVG);
    // Append elements
    li.append(listIcon, projectName, todoCount, deleteBtn);
    elements.lists.append(li);
    // Remove "pinned" class when adding a new list
    const { lists } = elements;
    lists.firstChild.classList.remove('pinned');
    // Reset selected list
    unselect(lists);

    if (isSelected) li.classList.add('selected');
  };

  // Handle event on window to check width screen and show/hide overlay
  const handleResize = () => {
    if (document.body.offsetWidth < 770) {
      addClass(elements.overlay, 'fade-in');
    } else {
      removeClass(elements.overlay, 'fade-in');
    }
  };

  const resetDetails = () => {
    empty(elements.detailsView);
    unselect(elements.todoList);
    off(window, 'resize', handleResize);
  };

  // Helper function - Date converter
  const getFriendlyDate = (stringDate, dateLabel) => {
    const currentDate = new Date();
    const dateObj = new Date(stringDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = days[dateObj.getDay()];
    const month = months[dateObj.getMonth()];
    const dayNumber = dateObj.getDate();
    const year = dateObj.getFullYear();

    // Today, Tomorrow
    const initialDate = new Date(
      `${currentDate.getFullYear()}-${currentDate.getMonth() +
        1}-0${currentDate.getDate()}`,
    );
    const coefficientMSDay = 1000 * 60 * 60 * 24;
    const numberOfDays = (dateObj - initialDate) / coefficientMSDay;
    let timeMSG = 'Due';
    removeClass(dateLabel, 'overdue');
    removeClass(dateLabel, 'today');

    if (numberOfDays < 0) {
      timeMSG = 'Overdue,';
      addClass(dateLabel, 'overdue');
    } else if (numberOfDays === 0) addClass(dateLabel, 'today');

    switch (numberOfDays) {
      case 0:
        return 'Due Today';
      case 1:
        return 'Due Tomorrow';
      default:
        if (year !== currentDate.getFullYear()) {
          return `${timeMSG} ${day}, ${month} ${dayNumber}, ${year}`;
        }

        return `${timeMSG} ${day}, ${month} ${dayNumber}`;
    }
  };

  const addTodo = (todo, isNew = false) => {
    // Setup the 'li' element container of the "todo item"
    const li = createElement('li', '.todo-item');
    li.dataset.index = todo.id;
    todo.isComplete ? addClass(li, 'completed') : removeClass(li, 'completed');
    const priorityClass = `${todo.priority.toLowerCase()}`;
    resetClassList(li, ['low', 'medium', 'high']);
    addClass(li, priorityClass);
    // Setting up the checkbox to toggle "completed" state
    const checkbox = createElement('input', `#todo-checkbox${todo.id}`);
    const label = createElement('label');
    const span = createElement('span');
    span.insertAdjacentHTML('beforeEnd', checkSVG);
    checkbox.type = 'checkbox';
    checkbox.checked = todo.isComplete;
    label.htmlFor = `todo-checkbox${todo.id}`;
    label.append(span);
    // Setting up "todo" title
    const title = createElement('span', '.todo-title');
    title.textContent = todo.title;
    // Delete Elements
    const deleteBtn = createElement('button', '.delete-btn');
    deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
    // title-block
    const titleBlock = createElement('span', '.title-block');
    // Indicators block
    const indicators = createElement('div', '.indicators');

    if (todo.note !== '') indicators.append(elements.noteIndicatorFn());

    if (todo.date !== '') {
      const dateIndicator = elements.dateIndicatorFn();
      const dateIndicatorLabel = dateIndicator.querySelector(
        '.date-indicator-label',
      );
      todo.note
        ? indicators.querySelector('.note-indicator').before(dateIndicator)
        : indicators.append(dateIndicator);
      dateIndicatorLabel.innerHTML = getFriendlyDate(todo.date, dateIndicator);
    }

    const totalSubtasks = todo.getSubTasks().length;

    if (totalSubtasks) {
      const subtaskIndicator = elements.subtaskIndicatorFn();
      const subtaskIndicatorLabel = subtaskIndicator.querySelector(
        '.subtask-indicator-label',
      );
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      subtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      indicators.prepend(subtaskIndicator);

      if (totalSubtasks === completedSubtasks) {
        addClass(subtaskIndicator, 'completed');
      }
    }

    if (indicators.children.length > 0) addClass(titleBlock, 'indicator-on');

    titleBlock.append(title, indicators);
    // Appended elements
    li.append(label, checkbox, titleBlock, deleteBtn);
    elements.todoList.append(li);

    if (isNew) {
      // Update todoCount in current list
      const todoCount = elements.lists.querySelector('.selected .todo-count');
      todoCount.textContent = Number(todoCount.textContent) + 1;

      // Show todo count if it's todo list is not empty
      if (todoCount.textContent === '1') showElement(todoCount);
    }

    // hide "Empty state" block if todo list is not empty anymore
    if (elements.todoList.children.length === 1) {
      addClass(elements.emptyState, 'hide-empty-state');
    }
  };

  const removeTodo = (index) => {
    const todoItem = elements.todoList.querySelector(
      `.todo-item[data-index="${index}"]`,
    );
    todoItem.remove();

    // Update todoCount in current list if todo is not completed
    if (!todoItem.classList.contains('completed')) {
      const todoCount = elements.lists.querySelector('.selected .todo-count');
      todoCount.textContent = Number(todoCount.textContent) - 1;

      // Hide todo count if it's todo list is empty
      if (todoCount.textContent === '0') hideElement(todoCount);
    }

    // Show the "Empty state" block if list is empty
    if (elements.todoList.children.length === 0) {
      removeClass(elements.emptyState, 'hide-empty-state');
    }

    // Reset todo details if selected
    if (todoItem.classList.contains('selected')) {
      resetDetails();
      // Hide view details on delete selected todo
      removeClass(elements.detailsView, 'show');
    }
  };

  const toggleTodo = (isComplete, id) => {
    const toggleComplete = document.getElementById(id);
    const todoItem = toggleComplete.closest('.todo-item');
    const todoCount = elements.lists.querySelector('li.selected .todo-count');
    const prevTodoCount = Number(todoCount.textContent);
    toggleComplete.checked = isComplete;

    if (isComplete) {
      addClass(todoItem, 'completed');
      todoCount.textContent = Number(todoCount.textContent) - 1;

      if (prevTodoCount === 1) hideElement(todoCount);

      if (todoItem.classList.contains('selected')) {
        addClass(elements.detailsView, 'disabled');
      }
    } else {
      removeClass(todoItem, 'completed');
      todoCount.textContent = Number(todoCount.textContent) + 1;

      if (prevTodoCount === 0) showElement(todoCount);

      if (todoItem.classList.contains('selected')) {
        removeClass(elements.detailsView, 'disabled');
      }
    }
  };

  const removeProject = (id) => {
    getElement(`.list[data-index="${id}"]`).remove();
    // Add "pinned" class when only one list remains
    const { lists } = elements;

    if (lists.children.length === 1) lists.firstChild.classList.add('pinned');
  };

  /**
   * Display all todos in the project list
   * @param {Object[]} todos List of todo objects
   */
  const displayTodos = (todos) => {
    elements.tasksTitle.textContent = getElement(
      '.selected .project-name',
    ).textContent;
    empty(elements.todoList);
    todos.forEach((todo) => {
      addTodo(todo);
    });

    // Check if list is empty or not to Show/Hide "Empty State"
    todos.length === 0
      ? removeClass(elements.emptyState, 'hide-empty-state')
      : addClass(elements.emptyState, 'hide-empty-state');
    // Reset todo details
    resetDetails();

    // Hide view details on list switch & on add list
    removeClass(elements.detailsView, 'show');
  };

  /**
   * A helper function to switch between display mode and edit mode for an element
   * @param {HTMLElement} displayElem Displayed element
   * @param {HTMLElement} editElem Input element
   * @param {Function} callback A callback function to update stuff with the new value
   */
  const toggleEditMode = (displayElem, editElem, callback) => {
    const handleEditEvents = (e) => {
      if (e.code !== undefined && e.code !== 'Enter') return;

      off(editElem, 'keydown', handleEditEvents);
      off(editElem, 'blur', handleEditEvents);
      editElem.parentNode.classList.remove('edit-mode');

      if (editElem.value) {
        displayElem.textContent = editElem.value;
        callback(displayElem.textContent);
      }

      editElem.replaceWith(displayElem);
    };

    displayElem.parentNode.classList.add('edit-mode');
    editElem.value = displayElem.textContent;
    displayElem.replaceWith(editElem);
    editElem.focus();
    on(editElem, 'blur', handleEditEvents);
    on(editElem, 'keydown', handleEditEvents);
  };

  /**
   * Display details of the selected todo object
   * @param {Object} todo The selected todo object
   */
  const displayDetails = (todo) => {
    // Reset display
    resetDetails();
    // Add class for CSS styling
    getElement(`.todo-item[data-index="${todo.id}"]`).classList.add('selected');
    // Add class to show component
    addClass(elements.detailsView, 'show');
    // If todo is completed, let's disable its details
    if (todo.isComplete) addClass(elements.detailsView, 'disabled');
    else removeClass(elements.detailsView, 'disabled');
    // Name block of todo
    const name = createElement('textarea', '.name-details');
    name.maxLength = 255;
    name.value = todo.title;
    // Sub Tasks block
    const subTasksForm = createElement('form');
    const subTasksInput = createElement('input', '#newSubTask');
    subTasksInput.type = 'text';
    subTasksInput.placeholder = '+ Add new subtask';
    const subTasksSubmit = createElement('input', '.submit-btn');
    subTasksSubmit.type = 'submit';
    subTasksSubmit.value = '+ Add';
    addClass(subTasksSubmit, 'hide');
    subTasksForm.append(subTasksInput, subTasksSubmit);
    const subTasksBlock = wrap(subTasksForm, 'subtask-block');
    const subtasksList = createElement('ul', '.subtasks-list');
    subTasksBlock.prepend(subtasksList);
    todo.getSubTasks().forEach((subTask) => {
      const li = createElement('li', '.subtask');
      li.dataset.index = subTask.id;

      if (subTask.isComplete) addClass(li, 'completed');

      // Setting up the checkbox to toggle "completed" state
      const checkbox = createElement('input', `#subtask-checkbox${subTask.id}`);
      const label = createElement('label');
      const span = createElement('span');
      span.insertAdjacentHTML('beforeEnd', checkSVG);
      checkbox.type = 'checkbox';
      checkbox.checked = subTask.isComplete;
      label.htmlFor = `subtask-checkbox${subTask.id}`;
      label.append(span);
      // Setting up "subTask" name
      const subTaskName = createElement('span', '.subtask-name');
      subTaskName.textContent = subTask.name;
      // Delete Elements
      const deleteBtn = createElement('button', '.delete-btn');
      deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
      // Appended elements
      li.append(label, checkbox, subTaskName, deleteBtn);
      subtasksList.append(li);
    });
    const subtaskNameInput = createElement('input', '#subtaskNameInput');
    subtaskNameInput.autocomplete = 'off';
    // Note block of todo
    const note = createElement('textarea', '.note-details');
    note.value = todo.note;
    note.placeholder = 'Add note';
    // Date block of todo
    const date = createElement('input', '#date');
    date.type = 'date';
    date.value = todo.date;
    const dateLabel = createElement('label');
    dateLabel.htmlFor = 'date';
    const dateMessage = createElement('span', '.date-message');
    const removeDate = createElement('span', '.remove-date');
    removeDate.insertAdjacentHTML('beforeEnd', removeDateSVG);
    const indicators = getElement('.todo-list .selected .indicators');

    if (todo.date) {
      dateMessage.innerHTML = getFriendlyDate(todo.date, dateLabel);
      addClass(dateLabel, 'is-set');
      dateLabel.append(removeDate);
      // Set date indicator text
      const dateIndicator = indicators.querySelector('.date-indicator');
      const dateIndicatorLabel = indicators.querySelector(
        '.date-indicator-label',
      );
      dateIndicatorLabel.innerHTML = dateMessage.innerHTML;

      if (dateMessage.classList.contains('overdue')) {
        addClass(dateIndicator, 'overdue');
      }
    } else {
      dateMessage.innerHTML = 'Add due date';
    }

    dateLabel.append(date, dateMessage);
    const dateBlock = wrap(dateLabel, 'date-block');
    dateBlock.append();
    dateBlock.insertAdjacentHTML('beforeEnd', calendarSVG);
    // Priority block of todo
    const priorityBlock = createElement('div', '.priority-block');
    const priorityTitle = createElement('h2');
    priorityTitle.innerHTML = 'Priority';
    const priorityList = createElement('ul');
    const priorityLow = createElement('li', '.low');
    const priorityMedium = createElement('li', '.medium');
    const priorityHigh = createElement('li', '.high');
    priorityLow.insertAdjacentHTML('beforeEnd', prioritySVG);
    priorityMedium.insertAdjacentHTML('beforeEnd', prioritySVG);
    priorityHigh.insertAdjacentHTML('beforeEnd', prioritySVG);
    priorityList.append(priorityLow, priorityMedium, priorityHigh);
    addClass(
      priorityList.querySelector(`.${todo.priority.toLowerCase()}`),
      'selected',
    );
    priorityBlock.append(priorityTitle, priorityList);
    // Append to details block
    elements.detailsView.append(
      wrap(name, 'name-block'),
      subTasksBlock,
      dateBlock,
      priorityBlock,
      wrap(note, 'note-block'),
    );

    // Show overlay on mobile
    if (document.body.offsetWidth < 770) {
      addClass(elements.overlay, 'fade-in');
    }

    // Helper functions for handlers
    const toggleIndicatorClass = () => {
      const titleBlock = getElement('.todo-list .selected .title-block');
      indicators.children.length > 0
        ? addClass(titleBlock, 'indicator-on')
        : removeClass(titleBlock, 'indicator-on');
    };

    // Set handlers on synthetic event
    const nameHeight = getComputedStyle(name).height;
    name.style.height =
      name.scrollHeight <= pxToNum(nameHeight)
        ? nameHeight
        : `${name.scrollHeight}px`;

    const handleNameChange = (e) => {
      const { target } = e;
      todo.title = target.value;
      elements.todoList.querySelector('.selected .todo-title').textContent =
        todo.title;
      // Change the height of textarea
      name.style.height = nameHeight; // Reset height to make it responsive also when deleting
      name.style.height =
        name.scrollHeight <= pxToNum(nameHeight)
          ? nameHeight
          : `${name.scrollHeight}px`;
    };

    const noteHeight = getComputedStyle(note).height;
    note.style.height =
      note.scrollHeight <= pxToNum(noteHeight)
        ? noteHeight
        : `${note.scrollHeight}px`;

    const handleNoteChange = (e) => {
      const { target } = e;
      todo.note = target.value;
      note.style.height = noteHeight; // Reset height to make it responsive also when deleting
      note.style.height =
        note.scrollHeight <= pxToNum(noteHeight)
          ? noteHeight
          : `${note.scrollHeight}px`;

      const liveNoteIndicator = getElement(
        '.todo-list .selected .note-indicator',
      );

      if (target.value !== '' && !liveNoteIndicator) {
        indicators.append(elements.noteIndicatorFn());
        toggleIndicatorClass();
      } else if (target.value === '' && liveNoteIndicator) {
        liveNoteIndicator.remove();
        toggleIndicatorClass();
      }
    };

    const handleDateChange = (e) => {
      const { target } = e;
      todo.date = target.value;
      dateMessage.innerHTML = getFriendlyDate(todo.date, dateLabel);
      addClass(dateLabel, 'is-set');

      // Set date indicator
      const liveDateIndicator = getElement(
        '.todo-list .selected .date-indicator',
      );

      if (todo.date && !liveDateIndicator) {
        const dateIndicator = elements.dateIndicatorFn();

        todo.note
          ? indicators.querySelector('.note-indicator').before(dateIndicator)
          : indicators.append(dateIndicator);

        dateIndicator.querySelector('.date-indicator-label').innerHTML =
          dateMessage.innerHTML;
        toggleIndicatorClass();

        dateLabel.classList.contains('overdue')
          ? addClass(dateIndicator, 'overdue')
          : removeClass(dateIndicator, 'overdue');
      } else if (todo.date) {
        liveDateIndicator.querySelector(
          '.date-indicator-label',
        ).innerHTML = getFriendlyDate(todo.date, liveDateIndicator);
      }

      if (!dateLabel.contains(removeDate)) dateLabel.append(removeDate);
    };

    const handleRemoveDateClick = () => {
      date.value = '';
      todo.date = date.value;
      dateMessage.innerHTML = 'Add due date';
      removeClass(dateLabel, 'is-set');
      removeClass(dateLabel, 'overdue');
      removeDate.remove();

      // Set date indicator
      const liveDateIndicator = getElement(
        '.todo-list .selected .date-indicator',
      );
      liveDateIndicator.remove();
      toggleIndicatorClass();
    };

    const handlePriorityClick = (e) => {
      const { target } = e;
      const flag = target.closest('li');

      if (!flag) return;

      const list = target.closest('ul');
      unselect(list);
      [todo.priority] = flag.classList;
      addClass(flag, 'selected');
      const selectedTodo = elements.todoList.querySelector('li.selected');
      const priorityClass = `${todo.priority.toLowerCase()}`;
      resetClassList(selectedTodo, ['low', 'medium', 'high']);
      addClass(selectedTodo, priorityClass);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const { target } = e;
      const input = target.elements.newSubTask;

      if (input.value === '') return;

      todo.addSubTask(input.value);
      input.value = '';
      const subTask = todo.getSubTasks()[todo.getSubTasks().length - 1];
      const li = createElement('li', '.subtask');
      li.dataset.index = subTask.id;
      // Setting up the checkbox to toggle "completed" state
      const checkbox = createElement('input', `#subtask-checkbox${subTask.id}`);
      const label = createElement('label');
      const span = createElement('span');
      span.insertAdjacentHTML('beforeEnd', checkSVG);
      checkbox.type = 'checkbox';
      checkbox.checked = subTask.isComplete;
      label.htmlFor = `subtask-checkbox${subTask.id}`;
      label.append(span);
      // Setting up "subTask" name
      const subTaskName = createElement('span', '.subtask-name');
      subTaskName.textContent = subTask.name;
      // Delete Elements
      const deleteBtn = createElement('button', '.delete-btn');
      deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
      // Appended elements
      li.append(label, checkbox, subTaskName, deleteBtn);
      subtasksList.append(li);

      // Hide "Add" button After submit
      hideElement(subTasksSubmit);

      // Indicator
      const liveSubtaskIndicatorLabel = getElement(
        '.todo-list .selected .subtask-indicator-label',
      );
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      if (totalSubtasks && !liveSubtaskIndicatorLabel) {
        const subtaskIndicator = elements.subtaskIndicatorFn();
        const subtaskIndicatorLabel = subtaskIndicator.querySelector(
          '.subtask-indicator-label',
        );
        subtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
        indicators.prepend(subtaskIndicator);
        toggleIndicatorClass();
      } else if (totalSubtasks) {
        liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      }
    };

    const handleDeleteSubtask = (e) => {
      const { target } = e;
      const deleteButton = target.closest('.delete-btn');

      if (!deleteButton) return;

      const li = target.closest('.subtask');
      const id = Number(li.dataset.index);
      todo.removeSubTask(id);
      li.remove();

      // Indicator
      const liveSubtaskIndicatorLabel = getElement(
        '.todo-list .selected .subtask-indicator-label',
      );
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      if (totalSubtasks) {
        liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      } else if (!totalSubtasks) {
        liveSubtaskIndicatorLabel.closest('.subtask-indicator').remove();
        toggleIndicatorClass();
      }
    };

    const handleToggleSubtask = (e) => {
      const { target } = e;
      const li = target.closest('.subtask');

      if (!li) return;

      const id = Number(li.dataset.index);

      if (target.id !== `subtask-checkbox${id}`) return;

      todo.toggleSubTask(id);
      const subTask = todo.getSubTasks().find((subtask) => subtask.id === id);
      const { isComplete } = subTask;
      target.checked = isComplete;
      isComplete ? addClass(li, 'completed') : removeClass(li, 'completed');

      // Indicator
      const subtaskIndicator = getElement(
        '.todo-list .selected .subtask-indicator',
      );
      const liveSubtaskIndicatorLabel = subtaskIndicator.querySelector(
        '.subtask-indicator-label',
      );
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;

      if (totalSubtasks === completedSubtasks) {
        addClass(subtaskIndicator, 'completed');
      } else {
        removeClass(subtaskIndicator, 'completed');
      }
    };

    const handleSwitchSubtask = (e) => {
      const { target } = e;
      const selectedSubtask = target.closest('.subtask');

      if (
        !selectedSubtask ||
        (target !== selectedSubtask && !target.closest('.subtask-name'))
      ) {
        return;
      }

      const subtaskName = selectedSubtask.querySelector('.subtask-name');

      if (!selectedSubtask.classList.contains('selected')) {
        unselect(subtasksList);
        addClass(selectedSubtask, 'selected');
      }

      if (selectedSubtask.classList.contains('completed')) return;

      const id = Number(selectedSubtask.dataset.index);

      const updateName = (value) => {
        todo.editSubTaskName(id, value);
      };

      const args = [subtaskName, subtaskNameInput, updateName];
      toggleEditMode(...args);
    };

    const handleInput = (e) => {
      const { target } = e;
      const addButton = subTasksSubmit;

      target.value ? showElement(addButton) : hideElement(addButton);
    };

    const handleOverlayClick = () => {
      // Reset todo details
      resetDetails();

      // Hide view details on overlay click
      removeClass(elements.detailsView, 'show');
      removeClass(elements.overlay, 'fade-in');

      off(elements.overlay, 'click', handleOverlayClick);
    };

    // close details view on menu click
    const handleMenuClick = () => {
      if (document.body.offsetWidth >= 770) return;
      // Reset todo details
      resetDetails();

      // Hide view details on overlay click
      removeClass(elements.detailsView, 'show');

      off(elements.menuButton, 'click', handleMenuClick);
      off(elements.overlay, 'click', handleOverlayClick);
    };

    // Set event listeners
    on(name, 'input', handleNameChange);
    on(note, 'input', handleNoteChange);
    on(date, 'change', handleDateChange);
    on(removeDate, 'click', handleRemoveDateClick);
    on(priorityList, 'click', handlePriorityClick);
    on(subTasksForm, 'submit', handleSubmit);
    on(subtasksList, 'click', handleDeleteSubtask);
    on(subtasksList, 'click', handleToggleSubtask);
    on(subtasksList, 'click', handleSwitchSubtask);
    on(subTasksInput, 'input', handleInput);
    on(elements.overlay, 'click', handleOverlayClick);
    on(window, 'resize', handleResize);
    on(elements.menuButton, 'click', handleMenuClick);
  };

  // Listen to modal
  const confirmRemoval = (callback, msg) => {
    const { modalOk, modalCancel, modalBackdrop, modalText } = elements;
    modalText.innerHTML = msg;
    toggleModal();

    const handleClick = (e) => {
      const { target } = e;
      toggleModal();
      off(modalOk, 'click', handleClick);
      off(modalCancel, 'click', handleClick);
      off(modalBackdrop, 'click', handleClick);

      if (target === modalOk) {
        callback();
      }
    };

    on(modalOk, 'click', handleClick);
    on(modalCancel, 'click', handleClick);
    // Hide modal on modalBackdrop click
    on(modalBackdrop, 'click', handleClick);
  };

  // Listen to add list Input/Submit events to hide/show "Add" button
  const handleInput = (e) => {
    const { target } = e;
    const addButton = elements.newListSubmit;

    target.value ? showElement(addButton) : hideElement(addButton);
  };

  on(elements.newListInput, 'input', handleInput);

  /**
   * Call handleAddTodo function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindAddTodo = (handler) => {
    on(elements.newTodo, 'submit', handler);
  };

  /**
   * Call handleDeleteTodo function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindDeleteTodo = (handler) => {
    on(elements.todoList, 'click', handler);
  };

  /**
   * Call handleToggleTodo function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindToggleTodo = (handler) => {
    on(elements.todoList, 'change', handler);
  };

  /**
   * Call handleAddList function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindAddList = (handler) => {
    on(elements.newList, 'submit', handler);
  };

  /**
   * Call handleSwitchList function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSwitchList = (handler) => {
    on(elements.lists, 'click', handler);
  };

  /**
   * Call handleDeleteList function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindDeleteList = (handler) => {
    on(elements.lists, 'click', handler);
  };

  /**
   * Call handleEditTasksTitle function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindEditTasksTitle = (handler) => {
    on(elements.tasksTitle, 'click', handler);
  };

  /**
   * Call handleSwitchTodo function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSwitchTodo = (handler) => {
    on(elements.todoList, 'click', handler);
  };

  return {
    displayList,
    removeProject,
    displayTodos,
    addTodo,
    removeTodo,
    toggleTodo,
    elements,
    bindAddTodo,
    bindDeleteTodo,
    bindToggleTodo,
    bindAddList,
    bindSwitchList,
    bindDeleteList,
    bindEditTasksTitle,
    empty,
    toggleEditMode,
    displayDetails,
    bindSwitchTodo,
    hideElement,
    confirmRemoval,
  };
};

export { todoView, DOMHelpers };
