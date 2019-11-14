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

  return {
    createElement,
  };
};

const { createElement } = DOMHelpers();

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
  const newListLabel = createElement('label');
  newListInput.type = 'text';
  newListLabel.htmlFor = 'newList';
  newListLabel.innerHtml = 'New list';

  // The center block which will display our todos/tasks
  const tasksView = createElement('div', '.tasks-view');
  // UL element with our list of projects
  // The form with the input to add a Todo
  const newTodo = createElement('form');
  const newTodoInput = createElement('input', '#newTodo');
  const newTodoLabel = createElement('label');
  newTodoInput.type = 'text';
  newTodoLabel.htmlFor = 'newTodo';
  newTodoLabel.innerHtml = 'New list';

  // Append elements
  newList.append(newListLabel, newListInput);
  listsMenu.append(lists, newList);
  newTodo.append(newTodoLabel, newTodoInput);
  tasksView.append(newTodo);

  root.append(listsMenu, tasksView);

  return {
    root,
    tasksView,
    lists,
  };
};

const todoView = () => {
  const { tasksView, lists } = initializeDOMElements();

  /**
   *  Display the project by name in an HTML list element
   * @param {number} id id of the project
   * @param {string} name The name of the project
   * @param {Object[]} items List of todos of the project
   */
  const displayList = (id, name, items) => {
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
    lists.append(li);
  };

  /**
   * Display all todos in the project list
   * @param {Object[]} todos List of todo objects
   */
  const displayTodos = (todos) => {
    const ul = createElement('ul', '.todo-list');
    tasksView.append(ul);

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
      // Appended elements
      li.append(label, checkbox, title);
      ul.append(li);
    });
  };

  return {
    displayList,
    displayTodos,
  };
};

export { todoView, DOMHelpers };
