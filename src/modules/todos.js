const todoItem = (title) => ({
  title,
  description: '',
  dueDate: '',
  priority: '',
  note: '',
  isComplete: false,
});

const todoStoreHelper = (getItems) => {
  const getItemByID = (id) => {
    let item = null;
    getItems().some((todo) => {
      if (todo.id === id) {
        item = todo;
        return true;
      }

      return false;
    });

    return item;
  };

  return {
    getItemByID,
  };
};

const todoStore = (name = '') => {
  const state = {
    items: [],
    name,
  };

  const getName = () => state.name;

  const setName = (newName) => {
    state.name = newName;
  };

  const getItems = () => state.items;

  const { getItemByID } = todoStoreHelper(getItems);

  const addTodo = (title) => {
    if (!title) return;

    const item = todoItem(title);
    item.id =
      state.items.length > 0 ? state.items[state.items.length - 1].id + 1 : 1;

    state.items.push(item);
  };

  const removeTodo = (id) => {
    const items = getItems();
    const index = items.findIndex((item) => item.id === Number(id));
    if (index !== -1) items.splice(index, 1);
  };

  const toggleTodo = (id) => {
    getItemByID(id).isComplete = !getItemByID(id).isComplete;
  };

  const updateTodoTitle = (id, title) => {
    if (title) getItemByID(id).title = title;
  };

  return {
    getName,
    setName,
    getItems,
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodoTitle,
  };
};

const todoApp = (() => {
  const defaultStore = todoStore('tasks');
  defaultStore.id = 0;
  const state = {
    projects: [defaultStore],
    selected: 0,
  };

  const getProjects = () => state.projects;

  const getSelected = () => state.selected;

  const setSelected = (index) => {
    state.selected = index;
  };

  const addProject = (name) => {
    const project = todoStore(name);
    project.id =
      state.projects.length > 0
        ? state.projects[state.projects.length - 1].id + 1
        : 1;

    state.projects.push(project);
  };

  return {
    getProjects,
    addProject,
    getSelected,
    setSelected,
  };
})();

export default todoApp;
