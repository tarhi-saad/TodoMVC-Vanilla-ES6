import deleteSVG from '../images/delete.svg';
import listSVG from '../images/list.svg';
import arrowSVG from '../images/arrow.svg';
import checkSVG from '../images/check.svg';
import emptyStateSVG from '../images/empty-state.svg';

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
} = DOMHelpers();

const initializeDOMElements = () => {
  // the root element
  const root = document.getElementById('root');
  // The left block containing all projects
  const listsMenu = createElement('div', '.lists-menu');
  // UL element with our list of projects
  const lists = createElement('ul', '.lists');
  // The form with our input to add a project
  const newList = createElement('form');
  const newListInput = createElement('input', '#newList');
  const newListSubmit = createElement('input', '.submit-btn');
  newListInput.type = 'text';
  newListInput.placeholder = '+ New list';
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

  // Append elements
  newList.append(newListInput, newListSubmit);
  listsMenu.append(lists, newList);
  newTodo.append(newTodoInput, newTodoSubmit);
  tasksView.append(tasksTitleWrapper, todoList, emptyState, newTodo);

  root.append(listsMenu, tasksView, detailsView);

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
  };
};

const todoView = () => {
  const elements = initializeDOMElements();

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
    todoCount.textContent = items.length;
    addClass(todoCount, 'hide');
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

  const resetDetails = () => {
    empty(elements.detailsView);
    unselect(elements.todoList);
  };

  const addTodo = (todo) => {
    // Setup the 'li' element container of the "todo item"
    const li = createElement('li', '.todo-item');
    li.dataset.index = todo.id;
    todo.isComplete
      ? li.classList.add('completed')
      : li.classList.remove('completed');
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
    // Appended elements
    li.append(label, checkbox, title, deleteBtn);
    elements.todoList.append(li);

    // Update todoCount in current list
    const todoCount = elements.lists.querySelector('.selected .todo-count');
    todoCount.textContent = Number(todoCount.textContent) + 1;

    // Show todo count if it's todo list is not empty & hide "Empty state" block
    if (todoCount.textContent === '1') {
      showElement(todoCount);
      addClass(elements.emptyState, 'hide-empty-state');
    }
  };

  const removeTodo = (index) => {
    const todoItem = elements.todoList.querySelector(
      `.todo-item[data-index="${index}"]`,
    );
    todoItem.remove();

    // Update todoCount in current list
    const todoCount = elements.lists.querySelector('.selected .todo-count');
    todoCount.textContent = Number(todoCount.textContent) - 1;

    // Hide todo count if it's todo list is empty & show the "Empty state" block
    if (todoCount.textContent === '0') {
      hideElement(todoCount);
      removeClass(elements.emptyState, 'hide-empty-state');
    }

    // Reset todo details if selected
    if (todoItem.classList.contains('selected')) resetDetails();
  };

  const toggleTodo = (isComplete, id) => {
    const toggleComplete = document.getElementById(id);
    const todoItem = toggleComplete.closest('.todo-item');
    toggleComplete.checked = isComplete;
    isComplete
      ? todoItem.classList.add('completed')
      : todoItem.classList.remove('completed');
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

    // Update todoCount in current list
    elements.lists.querySelector('.selected .todo-count').innerHTML =
      todos.length;
    // Check if list is empty or not to Show/Hide "Empty State"
    todos.length === 0
      ? removeClass(elements.emptyState, 'hide-empty-state')
      : addClass(elements.emptyState, 'hide-empty-state');
    // Reset todo details
    resetDetails();
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
        getElement('.selected .project-name').textContent = editElem.value;
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
    // Name block of todo
    const name = createElement('textarea', '.name-details');
    name.maxLength = 255;
    name.style.height =
      name.scrollHeight <= 30 ? '30px' : `${name.scrollHeight}px`;
    name.value = todo.title;
    // Append to details block
    elements.detailsView.append(wrap(name, 'name-block'));
    // Add class for CSS styling
    getElement(`.todo-item[data-index="${todo.id}"]`).classList.add('selected');

    // Set handlers on synthetic event
    const handleChange = (e) => {
      const { target } = e;
      todo.title = target.value;
      elements.todoList.querySelector('.selected .todo-title').textContent =
        todo.title;
      // Change the height of textarea
      name.style.height = '30px'; // Reset height to make it responsive also when deleting
      name.style.height =
        name.scrollHeight <= 30 ? '30px' : `${name.scrollHeight}px`;
    };

    // Set event listeners
    on(name, 'input', handleChange);
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
  };
};

export { todoView, DOMHelpers };
