import todoSort from './features/todo.sort';

const todoItem = (title) => {
  const subTasks = [];

  const getSubTasks = () => subTasks;

  const addSubTask = (name) => {
    const subTaskID = subTasks.length > 0 ? subTasks[subTasks.length - 1].id + 1 : 1;
    const subTask = {
      id: subTaskID,
      name,
      isComplete: false,
    };
    subTasks.push(subTask);
  };

  const removeSubTask = (id) => {
    const index = subTasks.findIndex((subTask) => subTask.id === id);

    if (index !== -1) subTasks.splice(index, 1);
  };

  const editSubTaskName = (id, name) => {
    if (name) {
      subTasks.some((subTask) => {
        if (subTask.id === id) {
          subTask.name = name;
          return true;
        }

        return false;
      });
    }
  };

  const toggleSubTask = (id) => {
    subTasks.some((subTask) => {
      if (subTask.id === id) {
        subTask.isComplete = !subTask.isComplete;
        return true;
      }

      return false;
    });
  };

  return {
    title,
    description: '',
    date: '',
    priority: 'low',
    note: '',
    isComplete: false,
    isImportant: false,
    isMyDay: false,
    creationDate: null,
    getSubTasks,
    addSubTask,
    removeSubTask,
    editSubTaskName,
    toggleSubTask,
  };
};

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

  const sort = todoSort();

  const {
    setSelectedSortType,
    setSelectedDirection,
    getSelectedSortType,
    getSelectedDirection,
    getSortDirections,
    setSortDirections,
  } = sort;

  const getName = () => state.name;

  const setName = (newName) => {
    state.name = newName;
  };

  const getItems = () => state.items;

  function getSortedItems(items = state.items) {
    const isGeneratedProject = [1, 2, 3].includes(this.id);

    return sort.getSortedItems(items, isGeneratedProject);
  }

  const { getItemByID } = todoStoreHelper(getItems);

  function addTodo(title) {
    if (!title) return;

    const item = todoItem(title);
    const maxID = Math.max(...state.items.map((todo) => todo.id));
    item.id = state.items.length > 0 ? maxID + 1 : 1;
    // item.id = state.items.length > 0 ? state.items[state.items.length - 1].id + 1 : 1;
    item.projectID = this.id;

    state.items.push(item);
  }

  const removeTodo = (id) => {
    const items = getItems();
    const index = items.findIndex((item) => item.id === id);
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
    getItemByID,
    getSortedItems,
    setSelectedSortType,
    getSelectedSortType,
    setSelectedDirection,
    getSelectedDirection,
    getSortDirections,
    setSortDirections,
  };
};

const todoApp = (() => {
  // Create default projects
  const defaultStores = [
    todoStore('All Tasks'),
    todoStore('My Day'),
    todoStore('Bookmarked'),
    todoStore('Planned'),
    todoStore('Tasks'),
  ];
  defaultStores[0].id = 1;
  defaultStores[1].id = 2;
  defaultStores[1].date = 0;
  defaultStores[2].id = 3;
  defaultStores[3].id = 4;
  defaultStores[4].id = 5;
  // Planned project's tabs states (open/closed)
  defaultStores[3].tabStates = ['open', 'open', 'open', 'open', 'open', 'open'];
  const state = {
    projects: [...defaultStores],
    selected: 4,
    lastSelected: 4,
  };

  const getProjects = () => state.projects;

  const getSelected = () => state.selected;

  const getLastSelected = () => state.lastSelected;

  /**
   * We use index of the array instead of the ID of the project, to easily switch selection
   * to the next project (above or below). Using ID isn't convenient in this case
   * @param {Number} index An index of "projects" array
   */
  const setSelected = (index) => {
    state.selected = index;

    if (index || index === 0) state.lastSelected = index;
  };

  const addProject = (name) => {
    const project = todoStore(name);
    project.id = state.projects.length > 0 ? state.projects[state.projects.length - 1].id + 1 : 1;

    state.projects.push(project);
  };

  const removeProject = (id) => {
    // We prevent removing the default projects
    const defaultIDs = [1, 2, 3, 4, 5];

    if (getProjects().length > 1 && !defaultIDs.includes(id)) {
      const index = getProjects().findIndex((project) => project.id === id);
      if (index !== -1) getProjects().splice(index, 1);
    }
  };

  const { getItemByID: getProjectByID } = todoStoreHelper(getProjects);

  const getSelectedProject = () => {
    if (!getSelected() && getSelected() !== 0) return null;

    const { id } = getProjects()[getSelected()];
    return getProjectByID(id);
  };

  return {
    getProjects,
    addProject,
    removeProject,
    getSelected,
    setSelected,
    getLastSelected,
    getProjectByID,
    getSelectedProject,
  };
})();

export default todoApp;
