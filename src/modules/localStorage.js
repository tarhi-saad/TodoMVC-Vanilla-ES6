const todoLocalStorage = (() => {
  /**
   * Testing for availability of "local storage"
   * @param {string} type Property on the window object named localStorage
   */
  const storageAvailable = (type) => {
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  };

  const populateStorage = (todoApp) => {
    const obj = {};
    obj.selected = todoApp.getSelected();
    obj.lastSelected = todoApp.getLastSelected();
    obj.projects = [];

    todoApp.getProjects().forEach((project, index) => {
      const objProject = {};

      // Save tabs states (open/closed) of Planned project
      if (index === 3) objProject.tabStates = [...project.tabStates];

      // Save date prop for My Day project to reset tasks of the day if it's a new day
      if (index === 1) objProject.date = project.date;

      if (index > 4) {
        objProject.name = project.getName();
        objProject.id = project.id;
      }

      // Skip sort data for Planned project
      if (index !== 3) {
        objProject.selectedSortType = project.getSelectedSortType();
        objProject.directions = project.getSortDirections();
      }

      // Save tasks for 'Tasks' project and other custom projects
      if (index > 3) {
        objProject.tasks = [];

        project.getItems().forEach((task) => {
          const objTask = {};
          objTask.id = task.id;
          objTask.title = task.title;
          objTask.date = task.date;
          objTask.priority = task.priority;
          objTask.note = task.note;
          objTask.isComplete = task.isComplete;
          objTask.isImportant = task.isImportant;
          objTask.isMyDay = task.isMyDay;
          objTask.creationDate = task.creationDate;
          objTask.subTasks = task.getSubTasks();

          objProject.tasks.push(objTask);
        });
      }

      obj.projects.push(objProject);
    });

    localStorage.setItem('todoApp', JSON.stringify(obj));
  };

  const initApp = (todoApp) => {
    const obj = JSON.parse(localStorage.getItem('todoApp'));
    todoApp.setSelected(obj.lastSelected);

    obj.projects.forEach((project, index) => {
      if (index > 4) todoApp.addProject(project.name);

      const currentProject = todoApp.getProjects()[index];

      if (index > 4) currentProject.id = project.id;

      // Get tabs states (open/closed) of Planned project
      if (index === 3) currentProject.tabStates = [...project.tabStates];

      // Get date prop for My Day project to reset tasks of the day if it's a new day
      if (index === 1) currentProject.date = project.date;

      // Skip sort data for Planned project
      if (index !== 3) {
        currentProject.setSelectedSortType(project.selectedSortType);
        currentProject.setSortDirections(project.directions);
      }

      // Get tasks for 'Tasks' project and other custom projects
      if (index > 3) {
        project.tasks.forEach((task) => {
          currentProject.addTodo(task.title, currentProject.id);
          const currentTask = currentProject.getItems()[currentProject.getItems().length - 1];
          currentTask.id = task.id;
          currentTask.date = task.date;
          currentTask.priority = task.priority;
          currentTask.note = task.note;
          currentTask.isComplete = task.isComplete;
          currentTask.isImportant = task.isImportant;
          currentTask.isMyDay = task.isMyDay;
          currentTask.creationDate = task.creationDate;

          task.subTasks.forEach((subtask, i) => {
            currentTask.addSubTask(subtask.name);
            const currentSubTask = currentTask.getSubTasks()[i];
            currentSubTask.id = subtask.id;
            currentSubTask.isComplete = subtask.isComplete;
          });
        });
      }
    });
  };

  return {
    storageAvailable,
    populateStorage,
    initApp,
  };
})();

export default todoLocalStorage;
