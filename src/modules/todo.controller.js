import todoApp from './todo.model';
import { todoView } from './todo.view';

const todoController = (() => {
  /**
   * A helper function: Display all projects
   * @param {Object} view The object view created by todoView factory
   */
  const displayLists = (view) => {
    const projects = todoApp.getProjects();
    const { lists } = view.elements;
    view.empty(lists);

    // Default project items
    const defaultItems = [];
    const selectedID = todoApp.getSelectedProject().id;

    // To check if it's a new day
    let newDay = false;

    projects.forEach((project, index) => {
      const { id } = project;
      const name = project.getName();
      const items = project.getItems();
      const isSelected = index === todoApp.getSelected();

      view.displayList(id, name, items, isSelected);

      switch (selectedID) {
        // All tasks case
        case 1:
          defaultItems.push(...items);
          break;

        // My Day case
        case 2:
          items.forEach((item) => {
            if (item.isMyDay) defaultItems.push(item);
          });
          break;

        // Important case
        case 3:
          items.forEach((item) => {
            if (item.isImportant) defaultItems.push(item);
          });
          break;

        // Planned case
        case 4:
          items.forEach((item) => {
            if (item.date) defaultItems.push(item);
          });
          break;

        default:
          if (isSelected) {
            view.displayTodos(project.getSortedItems());
          }
          break;
      }

      // Clean slot for My Day project if it's a new day
      const currentDate = new Date(view.getConvertedCurrentDate());
      const MSDay = 1000 * 60 * 60 * 24;
      const myDayProject = todoApp.getProjectByID(2);

      if (currentDate - myDayProject.date >= MSDay) {
        myDayProject.date = currentDate;
        newDay = true;
      }

      if (newDay) {
        items.forEach((item) => {
          if (item.isMyDay) item.isMyDay = false;
        });
      }
    });

    // Reset "My Day" todo count if it's a new day
    if (newDay) view.resetMyDayCount();

    // Sort todos by date if 'Planned' project is selected & Display them
    if (selectedID === 4) {
      defaultItems.sort((todoA, todoB) => new Date(todoA.date) - new Date(todoB.date));
      view.displayTodos(defaultItems);
    }

    // Display todos if a default project is selected (sorted version)
    if ([1, 2, 3].includes(selectedID)) {
      view.displayTodos(todoApp.getProjectByID(selectedID).getSortedItems(defaultItems));
    }
  };

  // Instantiate todoView factory
  let view = null;

  const handleAddTodo = (e) => {
    e.preventDefault();
    const todoTitle = view.elements.newTodoInput.value;

    if (!todoTitle) return;

    view.elements.newTodoInput.value = '';
    const selectedProject = todoApp.getSelectedProject();
    let todo = null;

    // If default project then add to "Tasks" list
    if ([1, 2, 3, 4].includes(selectedProject.id)) {
      const defaultProject = todoApp.getProjectByID(5);
      defaultProject.addTodo(todoTitle, 5);
      const todoItems = defaultProject.getItems();
      todo = todoItems[todoItems.length - 1];

      switch (selectedProject.id) {
        case 2:
          {
            todo.isMyDay = true;
            // Update todoCount of "myDay" project
            const myDayCount = document.querySelector('.list[data-index="2"] .todo-count');
            view.updateTodoCount(myDayCount, true);
          }
          break;

        case 3:
          {
            todo.isImportant = true;
            // Update todoCount of "Important" project
            const importantCount = document.querySelector('.list[data-index="3"] .todo-count');
            view.updateTodoCount(importantCount, true);
          }
          break;

        case 4:
          {
            todo.date = view.getConvertedCurrentDate();
            // Update todoCount of "Planned" project
            const plannedCount = document.querySelector('.list[data-index="4"] .todo-count');
            view.updateTodoCount(plannedCount, true);
          }
          break;

        default:
          break;
      }
    } else {
      selectedProject.addTodo(todoTitle, selectedProject.id);
      const todoItems = selectedProject.getItems();
      todo = todoItems[todoItems.length - 1];
    }

    view.addTodo(todo, true);
  };

  const handleDeleteTodo = (e) => {
    const { target } = e;

    if (!target.closest('.delete-btn')) return;

    const removeTodo = () => {
      const todoID = Number(target.closest('.todo-item').dataset.index);
      const projectID = Number(target.closest('.todo-item').dataset.projectIndex);
      const project = todoApp.getProjectByID(projectID);

      // Update "Planned/Important/MyDay" todoCounts if date/important/myDay is set
      const todo = project.getItemByID(todoID);
      const plannedCount = document.querySelector('.list[data-index="4"] .todo-count');
      const importantCount = document.querySelector('.list[data-index="3"] .todo-count');
      const myDayCount = document.querySelector('.list[data-index="2"] .todo-count');

      if (todo.date && !todo.isComplete) {
        view.updateTodoCount(plannedCount, false);
      }

      if (todo.isImportant && !todo.isComplete) {
        view.updateTodoCount(importantCount, false);
      }

      if (todo.isMyDay && !todo.isComplete) {
        view.updateTodoCount(myDayCount, false);
      }

      // Remove todo
      project.removeTodo(todoID);
      view.removeTodo(todoID, projectID);
    };

    // Confirm deletion of incomplete task
    if (!target.closest('.completed')) {
      const name = target.closest('.todo-item').querySelector('.todo-title').textContent;
      const msg = `
        You didn't complete this task!<br>
        Delete <span class="name">"${name}"</span> anyway?
      `;
      view.confirmRemoval(removeTodo, msg);
      return;
    }

    removeTodo();
  };

  const handleToggleTodo = (e) => {
    const { target } = e;
    const todoID = Number(target.closest('.todo-item').dataset.index);
    const projectID = Number(target.closest('.todo-item').dataset.projectIndex);

    if (target.id !== `todo-checkbox${todoID}${projectID}`) return;

    const project = todoApp.getProjectByID(projectID);
    project.toggleTodo(todoID);
    view.toggleTodo(project.getItemByID(todoID).isComplete, target.id, projectID);

    // Update "Planned/Important/MyDay" todoCounts if date/important/myDay is set
    const todo = project.getItemByID(todoID);
    const plannedCount = document.querySelector('.list[data-index="4"] .todo-count');
    const importantCount = document.querySelector('.list[data-index="3"] .todo-count');
    const myDayCount = document.querySelector('.list[data-index="2"] .todo-count');

    if (todo.date) view.updateTodoCount(plannedCount, !todo.isComplete);

    if (todo.isImportant) {
      view.updateTodoCount(importantCount, !todo.isComplete);
    }

    if (todo.isMyDay) {
      view.updateTodoCount(myDayCount, !todo.isComplete);
    }
  };

  const handleAddList = (e) => {
    e.preventDefault();
    const listTitle = view.elements.newListInput.value;

    if (!listTitle) return;

    view.elements.newListInput.value = '';
    todoApp.addProject(listTitle);
    const index = todoApp.getProjects().length - 1;
    todoApp.setSelected(index);
    const project = todoApp.getProjects()[index];
    const { id } = project;
    const name = project.getName();
    const items = project.getItems();
    view.displayList(id, name, items, true);
    view.displayTodos(items);

    // Hide "Add" button After submit
    view.hideElement(view.elements.newListSubmit);

    // Scroll to bottom of the list of projects, only when adding a new list
    const { lists } = view.elements;
    lists.scrollTop = lists.scrollHeight;
  };

  const handleSwitchList = (e) => {
    const { target } = e;
    const list = target.closest('.list');
    const lists = target.closest('.lists').querySelectorAll('.list');
    const selectedList = lists[todoApp.getSelected()];

    if (list === selectedList || !list || target.closest('.delete-btn')) {
      return;
    }

    let projectIndex = null;
    Array.from(lists).some((li, index) => {
      projectIndex = index;
      return li === list;
    });
    selectedList.classList.remove('selected');
    todoApp.setSelected(projectIndex);
    list.classList.add('selected');

    // Clean slot for My Day project if it's a new day
    const currentDate = new Date(view.getConvertedCurrentDate());
    const MSDay = 1000 * 60 * 60 * 24;
    const myDayProject = todoApp.getProjectByID(2);
    let newDay = false;

    if (currentDate - myDayProject.date >= MSDay) {
      myDayProject.date = currentDate;
      newDay = true;
    }

    if (newDay) {
      todoApp.getProjects().forEach((project) => {
        project.getItems().forEach((item) => {
          if (item.isMyDay) item.isMyDay = false;
        });
      });

      view.resetMyDayCount();
    }

    const items = [];

    switch (list.dataset.index) {
      // All tasks case
      case '1':
        todoApp.getProjects().forEach((project) => items.push(...project.getItems()));
        view.displayTodos(todoApp.getProjectByID(1).getSortedItems(items));
        break;

      // My Day case
      case '2':
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isMyDay) items.push(item);
          });
        });
        view.displayTodos(todoApp.getProjectByID(2).getSortedItems(items));
        break;

      // Important case
      case '3':
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isImportant) items.push(item);
          });
        });
        view.displayTodos(todoApp.getProjectByID(3).getSortedItems(items));
        break;

      // Planned case
      case '4':
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.date) items.push(item);
          });
        });
        items.sort((todoA, todoB) => new Date(todoA.date) - new Date(todoB.date));
        view.displayTodos(items);
        break;

      default:
        view.displayTodos(todoApp.getProjects()[projectIndex].getSortedItems());
        break;
    }
  };

  const handleDeleteList = (e) => {
    const { target } = e;

    if (!target.closest('.list')) return;

    const lists = view.elements.lists.children;
    const listID = Number(target.closest('.list').dataset.index);
    // Prevent deletion for default projects
    const defaultIDs = [1, 2, 3, 4, 5];

    if (!target.closest('.delete-btn') || defaultIDs.includes(defaultIDs)) {
      return;
    }

    const removeList = () => {
      todoApp.removeProject(listID);
      // Get the index of the selected list
      const listIndex = Array.from(lists).indexOf(view.elements.lists.querySelector('.selected'));

      // transfer selected class and selected project when deleting list
      if (target.closest('.selected')) {
        if (listIndex !== -1) {
          if (listIndex > 0) {
            todoApp.setSelected(listIndex - 1);
            lists[listIndex - 1].classList.add('selected');
          } else if (listIndex === 0) {
            todoApp.setSelected(0);
            lists[1].classList.add('selected');
          }

          // Update todo view
          view.displayTodos(todoApp.getSelectedProject().getItems());
        }
      }

      view.removeProject(listID);
      // Get the new selected list after deletion
      const listIndexUpdate = Array.from(lists).indexOf(
        view.elements.lists.querySelector('.selected'),
      );

      // If the value did change, let's update it in the model
      if (listIndex !== listIndexUpdate) todoApp.setSelected(listIndexUpdate);
    };

    // Confirm removal if list is not empty
    const todoCount = Number(target.closest('.list').querySelector('.todo-count').textContent);
    const isAllTasksComplete = !todoApp
      .getProjectByID(listID)
      .getItems()
      .some((todo) => !todo.isComplete);

    if (todoCount > 0 && !isAllTasksComplete) {
      const name = target.closest('.list').querySelector('.project-name').textContent;
      const msg = `
        This list still contains some tasks to do!<br>
        Delete <span class="name">"${name}"</span> anyway?
      `;
      view.confirmRemoval(removeList, msg);
      return;
    }

    removeList();
  };

  const handleEditTasksTitle = (e) => {
    const { target } = e;
    const selectedProject = view.elements.lists.querySelector('li.selected');

    if (selectedProject.classList.contains('pinned')) return;

    const updateProject = (value) => {
      todoApp.getSelectedProject().setName(value);
      selectedProject.querySelector('.project-name').textContent = value;
    };

    const args = [target, view.elements.tasksTitleInput, updateProject];
    view.toggleEditMode(...args);
  };

  const handleSwitchTodo = (e) => {
    const { target } = e;
    const selectedTodo = document.querySelector('.todo-list .selected');
    const todoItem = target.closest('.todo-item');

    if (
      (target.tagName !== 'LI' && !target.closest('.title-block')) ||
      target.classList.contains('list-header')
    ) {
      return;
    }

    if (todoItem === selectedTodo) {
      view.resetDetails();
      todoItem.classList.remove('selected');
      view.elements.detailsView.classList.remove('show');

      // Reposition todo items on hide details view
      view.refreshTodoItemsPositions();

      return;
    }

    const id = Number(target.closest('.todo-item').dataset.index);
    const projectID = Number(target.closest('.todo-item').dataset.projectIndex);
    const todo = todoApp.getProjectByID(projectID).getItemByID(id);
    view.displayDetails(todo);

    // Reposition todo items on show details view
    view.refreshTodoItemsPositions();
  };

  const handleSortList = (e) => {
    const { target } = e;
    const sortType = target.closest('.sort-type');

    if (!sortType) return;

    const sortMenu = target.closest('.sort-menu');
    const projectIndex = todoApp.getSelected();
    const currentProject = todoApp.getProjects()[projectIndex];
    const selectedSort = currentProject.getSelectedSortType();
    let isSelected = false;

    switch (sortType.id) {
      case 'sortByName':
        if (selectedSort === 'Alphabetically') isSelected = true;
        else currentProject.setSelectedSortType('Alphabetically');
        break;

      case 'sortByCompleted':
        if (selectedSort === 'Completed') isSelected = true;
        else currentProject.setSelectedSortType('Completed');
        break;

      case 'sortByMyDay':
        if (selectedSort === 'Added to My Day') isSelected = true;
        else currentProject.setSelectedSortType('Added to My Day');
        break;

      case 'sortByBookmarked':
        if (selectedSort === 'Bookmarked') isSelected = true;
        else currentProject.setSelectedSortType('Bookmarked');
        break;

      case 'sortByDueDate':
        if (selectedSort === 'Due date') isSelected = true;
        else currentProject.setSelectedSortType('Due date');
        break;

      case 'sortByCreationDate':
        if (selectedSort === 'Creation date') isSelected = true;
        else currentProject.setSelectedSortType('Creation date');
        break;

      case 'sortByPriority':
        if (selectedSort === 'Priority') isSelected = true;
        else currentProject.setSelectedSortType('Priority');
        break;

      default:
        break;
    }

    if (!isSelected) {
      const items = [];

      switch (currentProject.id) {
        // All tasks case
        case 1:
          todoApp.getProjects().forEach((project) => items.push(...project.getItems()));
          view.refreshTodos(currentProject.getSortedItems(items));
          break;

        // My Day case
        case 2:
          todoApp.getProjects().forEach((project) => {
            project.getItems().forEach((item) => {
              if (item.isMyDay) items.push(item);
            });
          });
          view.refreshTodos(currentProject.getSortedItems(items));
          break;

        // Important case
        case 3:
          todoApp.getProjects().forEach((project) => {
            project.getItems().forEach((item) => {
              if (item.isImportant) items.push(item);
            });
          });
          view.refreshTodos(currentProject.getSortedItems(items));
          break;

        default:
          view.refreshTodos(currentProject.getSortedItems());
          break;
      }
    }

    // Remove contextual sort menu
    sortMenu.classList.remove('open');
  };

  /**
   * Initialize the todo app (display default data to the user)
   */
  const init = () => {
    view = todoView();
    displayLists(view);
    view.bindAddTodo(handleAddTodo);
    view.bindDeleteTodo(handleDeleteTodo);
    view.bindToggleTodo(handleToggleTodo);
    view.bindAddList(handleAddList);
    view.bindSwitchList(handleSwitchList);
    view.bindDeleteList(handleDeleteList);
    view.bindEditTasksTitle(handleEditTasksTitle);
    view.bindSwitchTodo(handleSwitchTodo);
    view.bindSortList(handleSortList);
  };

  return {
    init,
  };
})();

export default todoController;
