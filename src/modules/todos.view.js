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

  const empty = (parentNode) => {
    while (parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }
  };

  return {
    createElement,
    on,
    empty,
  };
};

const { createElement, on, empty } = DOMHelpers();

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
  const newListLabel = createElement('label');
  newListInput.type = 'text';
  newListSubmit.type = 'submit';
  newListLabel.htmlFor = 'newList';
  newListLabel.innerHTML = 'New list';
  newListSubmit.value = 'Add';

  // The center block which will display our todos/tasks
  const tasksView = createElement('div', '.tasks-view');
  // UL element with our list of tasks
  const todoList = createElement('ul', '.todo-list');
  // The form with the input to add a Todo
  const newTodo = createElement('form');
  const newTodoInput = createElement('input', '#newTodo');
  const newTodoLabel = createElement('label');
  const newTodoSubmit = createElement('input', '.submit-btn');
  newTodoInput.type = 'text';
  newTodoSubmit.type = 'submit';
  newTodoSubmit.value = 'Add';
  newTodoLabel.htmlFor = 'newTodo';
  newTodoLabel.innerHTML = 'New todo';

  // Append elements
  newList.append(newListLabel, newListInput, newListSubmit);
  listsMenu.append(lists, newList);
  newTodo.append(newTodoLabel, newTodoInput, newTodoSubmit);
  tasksView.append(newTodo, todoList);

  root.append(listsMenu, tasksView);

  return {
    root,
    tasksView,
    lists,
    todoList,
    newTodo,
    newTodoInput,
    newList,
    newListInput,
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
    // Append elements
    li.append(projectName, todoCount);
    elements.lists.append(li);

    if (isSelected) li.classList.add('selected');
    // else li.classList.remove('selected');
  };

  /**
   * Display all todos in the project list
   * @param {Object[]} todos List of todo objects
   */
  const displayTodos = (todos) => {
    empty(elements.todoList);
    todos.forEach((todo) => {
      // Setup the 'li' element container of the "todo item"
      const li = createElement('li', '.todo-item');
      li.dataset.index = todo.id;
      // Setting up the checkbox to toggle "completed" state
      const checkbox = createElement('input', `#todo-checkbox${todo.id}`);
      const label = createElement('label');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.isComplete;
      label.htmlFor = `#todo-checkbox${todo.id}`;
      // Setting up "todo" title
      const title = createElement('span', '.todo-title');
      title.textContent = todo.title;
      // Delete Elements
      const deleteBtn = createElement('button', '.delete-btn');
      deleteBtn.innerHTML = 'Remove';
      // Appended elements
      li.append(label, checkbox, title, deleteBtn);
      elements.todoList.append(li);
    });

    // Update todoCount in current list
    elements.lists.querySelector('.selected .todo-count').innerHTML =
      todos.length;
  };

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

  return {
    displayList,
    displayTodos,
    elements,
    bindAddTodo,
    bindDeleteTodo,
    bindToggleTodo,
    bindAddList,
    bindSwitchList,
    empty,
  };
};

export { todoView, DOMHelpers };
