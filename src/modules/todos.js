const todoItem = (title) => {
  const subTasks = [];

  const getSubTasks = () => subTasks;

  const addSubTask = (name) => {
    const subTaskID =
      subTasks.length > 0 ? subTasks[subTasks.length - 1].id + 1 : 1;
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
    priority: 'Low',
    note: '',
    isComplete: false,
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
  };
};

const todoApp = (() => {
  const defaultStore = todoStore('Tasks');
  defaultStore.id = 1;
  const state = {
    projects: [defaultStore],
    selected: 0,
  };

  const getProjects = () => state.projects;

  const getSelected = () => state.selected;

  /**
   * We use index of the array instead of the ID of the project, to easily switch selection
   * to the next project (above or below). Using ID isn't convenient in this case
   * @param {Number} index An index of "projects" array
   */
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

  const removeProject = (id) => {
    // We prevent removing the default project "Tasks"
    if (getProjects().length > 1 && id !== 1) {
      const index = getProjects().findIndex((project) => project.id === id);
      if (index !== -1) getProjects().splice(index, 1);
    }
  };

  const { getItemByID: getProjectByID } = todoStoreHelper(getProjects);

  const getSelectedProject = () => {
    const { id } = getProjects()[getSelected()];
    return getProjectByID(id);
  };

  // const addSubTask = (todoID, name) => {
  //   const todo = getSelectedProject().getItemByID(todoID);
  //   const subTaskID =
  //     todo.subTasks.length > 0
  //       ? todo.subTasks[todo.subTasks.length - 1].id + 1
  //       : 1;
  //   const subTask = {
  //     id: subTaskID,
  //     name,
  //     isComplete: false,
  //   };
  //   todo.subTasks.push(subTask);
  // };

  // const getSubTasks = (todoID) =>
  //   getSelectedProject().getItemByID(todoID).subTasks;

  // const removeSubTask = (todoID, id) => {
  //   const subTasks = getSubTasks(todoID);

  //   if (subTasks.length > 1) {
  //     const index = subTasks.findIndex((subTask) => subTask.id === id);

  //     if (index !== -1) subTasks.splice(index, 1);
  //   }
  // };

  // const editSubTaskName = (todoID, id, name) => {
  //   if (name) {
  //     getSelectedProject()
  //       .getItemByID(todoID)
  //       .subTasks.some((subTask) => {
  //         if (subTask.id === id) {
  //           subTask.name = name;
  //           return true;
  //         }

  //         return false;
  //       });
  //   }
  // };

  // const toggleSubTaskComplete = (todoID, id) => {
  //   getSelectedProject()
  //     .getItemByID(todoID)
  //     .subTasks.some((subTask) => {
  //       if (subTask.id === id) {
  //         subTask.isComplete = !subTask.isComplete;
  //         return true;
  //       }

  //       return false;
  //     });
  // };

  return {
    getProjects,
    addProject,
    removeProject,
    getSelected,
    setSelected,
    getProjectByID,
    getSelectedProject,
  };
})();

export default todoApp;
