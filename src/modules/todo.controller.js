import todoApp from './todo.model';
import { todoView } from './todo.view';
import todoLocalStorage from './localStorage';

const todoController = (() => {
  /**
   * A helper function: Display all projects
   * @param {Object} view The object view created by todoView factory
   */
  const displayLists = (view) => {
    // Init localStorage
    if (localStorage.getItem('todoApp')) todoLocalStorage.initApp(todoApp);

    const projects = todoApp.getProjects();
    const { lists } = view.elements;
    view.empty(lists);

    // Default project items
    const defaultItems = [];

    if (!todoApp.getSelected()) todoApp.setSelected(todoApp.getLastSelected());

    const selectedID = todoApp.getSelectedProject().id;

    // To check if it's a new day
    let newDay = false;

    projects.forEach((project, index) => {
      const { id } = project;
      const name = project.getName();
      const items = project.getItems();
      const isSelected = index === todoApp.getSelected();

      view.displayList(id, name, items, isSelected);

      // Clean slot for My Day project if it's a new day
      const currentDate = new Date(view.getConvertedCurrentDate());
      const MSDay = 1000 * 60 * 60 * 24;
      const myDayProject = todoApp.getProjectByID(2);

      if (currentDate.getTime() - myDayProject.date >= MSDay) {
        myDayProject.date = currentDate.getTime();
        newDay = true;
      }

      if (newDay) {
        items.forEach((item) => {
          if (item.isMyDay) item.isMyDay = false;
        });
      }

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
    });

    // Reset "My Day" todo count if it's a new day
    if (newDay) view.resetMyDayCount();

    // Sort todos by date if 'Planned' project is selected & Display them
    if (selectedID === 4) {
      defaultItems.sort((todoA, todoB) => new Date(todoA.date) - new Date(todoB.date));
      view.displayTodos(defaultItems);

      // remove sort button
      view.elements.toggleSort(true);

      // init tabs states
      view.initPlannedDateTabs(todoApp.getProjectByID(4));
    }

    // Display todos if a default project is selected (sorted version)
    if ([1, 2, 3].includes(selectedID)) {
      view.displayTodos(todoApp.getProjectByID(selectedID).getSortedItems(defaultItems));
    }

    // Setup sort indicator
    const currentProject = todoApp.getSelectedProject();
    const selectedSortType = currentProject.getSelectedSortType();
    view.elements.setSortIndicator(
      selectedSortType,
      currentProject.getSelectedDirection(selectedSortType),
    );
  };

  // Instantiate todoView factory
  let view = null;

  // Helper function - refresh list for sorting
  const refreshCurrentTodoList = (currentProject, selectedTodo = null) => {
    let projectID = null;

    if (currentProject) projectID = currentProject.id;
    // We don't use sort in Planned project
    if (projectID === 4) return;

    const items = [];

    switch (projectID) {
      // All tasks case
      case 1:
        todoApp.getProjects().forEach((project) => items.push(...project.getItems()));
        view.refreshTodos(currentProject.getSortedItems(items), selectedTodo);
        break;

      // My Day case
      case 2:
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isMyDay) items.push(item);
          });
        });
        view.refreshTodos(currentProject.getSortedItems(items), selectedTodo);
        break;

      // Important case
      case 3:
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isImportant) items.push(item);
          });
        });
        view.refreshTodos(currentProject.getSortedItems(items), selectedTodo);
        break;

      default:
        if (currentProject) view.refreshTodos(currentProject.getSortedItems(), selectedTodo);
        else view.refreshTodos([], selectedTodo);
        break;
    }
  };

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
      defaultProject.addTodo(todoTitle);
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
      selectedProject.addTodo(todoTitle);
      const todoItems = selectedProject.getItems();
      todo = todoItems[todoItems.length - 1];
    }

    // Inject sort state to the view
    const sortType = selectedProject.getSelectedSortType();
    const sort = {
      type: sortType,
      refreshSort: refreshCurrentTodoList,
      currentProject: selectedProject,
    };

    view.addTodo(todo, true, sort);

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
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

      // Update localStorage
      todoLocalStorage.populateStorage(todoApp);
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

    if (todo.isImportant) view.updateTodoCount(importantCount, !todo.isComplete);

    if (todo.isMyDay) view.updateTodoCount(myDayCount, !todo.isComplete);

    // refresh sorting if a project is selected (not in search mode)
    if (todoApp.getSelectedProject()) refreshCurrentTodoList(todoApp.getSelectedProject());

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
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

    // Reset input search - before displayTodos (setting the new projectIndex value)
    const wasSearchMode = !view.elements.tasksView.dataset.projectIndex;
    if (wasSearchMode) {
      view.elements.searchInput.value = '';
      view.hideElement(view.elements.searchReset);
      // Append add todo form
      view.elements.tasksView.append(view.elements.newTodo);
    }

    view.displayTodos(items);

    // Hide "Add" button After submit
    view.hideElement(view.elements.newListSubmit);

    // Add sort button
    view.elements.toggleSort();

    // Set indicator to none by default
    view.elements.setSortIndicator('none');

    // Scroll to bottom of the list of projects, only when adding a new list
    const { lists } = view.elements;
    lists.scrollTop = lists.scrollHeight;

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
  };

  const handleSwitchList = (e) => {
    let projectIndex = null;
    let list = null;

    if (e.type === 'click') {
      const { target } = e;
      list = target.closest('.list');
      const lists = target.closest('.lists').querySelectorAll('.list');
      const selectedList = lists[todoApp.getSelected()];

      if (list === selectedList || !list || target.closest('.delete-btn')) {
        return;
      }

      Array.from(lists).some((li, index) => {
        projectIndex = index;
        return li === list;
      });

      if (selectedList) selectedList.classList.remove('selected');

      // Reset input search
      const wasSearchMode = !view.elements.tasksView.dataset.projectIndex;
      if (wasSearchMode) {
        view.elements.searchInput.value = '';
        view.hideElement(view.elements.searchReset);
      }
    } else if (e.type === 'blur') {
      projectIndex = todoApp.getLastSelected();
      list = document.querySelector('.lists').children[projectIndex];
    }

    todoApp.setSelected(projectIndex);
    list.classList.add('selected');
    // Append add todo form
    view.elements.tasksView.append(view.elements.newTodo);

    // Clean slot for My Day project if it's a new day
    const currentDate = new Date(view.getConvertedCurrentDate());
    const MSDay = 1000 * 60 * 60 * 24;
    const myDayProject = todoApp.getProjectByID(2);
    let newDay = false;

    if (currentDate.getTime() - myDayProject.date >= MSDay) {
      myDayProject.date = currentDate.getTime();
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

    // Remove/add sort button
    if (list.dataset.index === '4') view.elements.toggleSort(true);
    else view.elements.toggleSort();

    // Setup sort indicator
    const currentProject = todoApp.getProjects()[projectIndex];
    const selectedSortType = currentProject.getSelectedSortType();
    view.elements.setSortIndicator(
      selectedSortType,
      currentProject.getSelectedDirection(selectedSortType),
    );

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
        view.initPlannedDateTabs(todoApp.getProjectByID(4));
        break;

      default:
        view.displayTodos(todoApp.getProjects()[projectIndex].getSortedItems());
        break;
    }

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
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
      } else if (listIndex === -1) {
        // Search mode
        const listToBeSelected = target.closest('.list').previousElementSibling;
        const NewListIndex = Array.from(lists).indexOf(listToBeSelected);
        todoApp.setSelected(NewListIndex);
        lists[NewListIndex].classList.add('selected');

        // Update todo view
        view.displayTodos(todoApp.getSelectedProject().getItems());

        // Reset input search
        view.elements.searchInput.value = '';
        view.hideElement(view.elements.searchReset);
        // Append add todo form
        view.elements.tasksView.append(view.elements.newTodo);
      }

      view.removeProject(listID);
      // Get the new selected list after deletion
      const listIndexUpdate = Array.from(lists).indexOf(
        view.elements.lists.querySelector('.selected'),
      );

      // If the value did change, let's update it in the model
      if (listIndex !== listIndexUpdate) todoApp.setSelected(listIndexUpdate);

      // Update localStorage
      todoLocalStorage.populateStorage(todoApp);
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

    if (
      (selectedProject && selectedProject.classList.contains('pinned')) ||
      view.elements.tasksView.classList.contains('pinned')
    ) {
      return;
    }

    const updateProject = (value) => {
      todoApp.getSelectedProject().setName(value);
      selectedProject.querySelector('.project-name').textContent = value;

      // Update localStorage
      todoLocalStorage.populateStorage(todoApp);
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

    // Update localStorage callback
    const saveData = () => todoLocalStorage.populateStorage(todoApp);

    // If mode search disable sort system, otherwise inject sort data
    const currentProject = todoApp.getSelectedProject();
    if (currentProject) {
      // Inject sort state to the view
      const sortType = currentProject.getSelectedSortType;
      const sort = {
        type: sortType,
        refreshSort: refreshCurrentTodoList,
      };
      view.displayDetails(todo, currentProject, sort, saveData);
    } else {
      const sortType = () => 'none';
      const sort = {
        type: sortType,
        refreshSort: refreshCurrentTodoList,
      };
      view.displayDetails(todo, currentProject, sort, saveData);
    }

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
      refreshCurrentTodoList(currentProject);
    }

    // Remove contextual sort menu
    sortMenu.classList.remove('open');

    // Setup sort indicator
    const selectedSortType = currentProject.getSelectedSortType();
    view.elements.setSortIndicator(
      selectedSortType,
      currentProject.getSelectedDirection(selectedSortType),
      true,
    );

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
  };

  const handleSortIndicator = (e) => {
    const { target } = e;
    const sortIndicatorToggle = target.closest('.sort-indicator-toggle');
    const sortIndicatorRemove = target.closest('.sort-indicator-remove');

    if (!sortIndicatorRemove && !sortIndicatorToggle) return;

    const projectIndex = todoApp.getSelected();
    const currentProject = todoApp.getProjects()[projectIndex];
    const items = [];

    if (sortIndicatorToggle) {
      const selectedSortType = currentProject.getSelectedSortType();
      currentProject.getSelectedDirection(selectedSortType) === 'asc'
        ? currentProject.setSelectedDirection('desc')
        : currentProject.setSelectedDirection('asc');

      refreshCurrentTodoList(currentProject);

      sortIndicatorToggle.classList.toggle('desc');
    } else {
      currentProject.setSelectedSortType('none');

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
          view.refreshTodos(currentProject.getItems());
          break;
      }

      view.elements.removeSortIndicator();
    }

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
  };

  // Listen to todoList in Planned project to close/open lists Events
  const handlePlannedClick = (e) => {
    const { target } = e;

    if (!target.closest('.list-header')) return;

    const listHeader = target.closest('.list-header');
    const button = listHeader.querySelector('button');
    const todoListTime = view.getElement(`.todo-list-time[data-time="${listHeader.id}"]`);

    // Enable all transitions in todo list
    view.enableTransition(todoListTime);

    const plannedProject = todoApp.getProjectByID(4);
    const headerIndex = Array.from(view.elements.todoList.querySelectorAll('.list-header')).indexOf(
      listHeader,
    );

    if (button.classList.contains('close')) {
      view.removeClass(button, 'close');
      todoListTime.style.height = `${todoListTime.scrollHeight + 2}px`;
      plannedProject.tabStates[headerIndex] = 'open';
    } else {
      view.addClass(button, 'close');
      todoListTime.style.height = 0;
      plannedProject.tabStates[headerIndex] = 'closed';
    }

    // Fix grow items issue
    const { todoList } = view.elements;
    todoList.querySelectorAll('.todo-item').forEach((item) => {
      item.style.width = `${item.offsetWidth}px`;
    });

    const handleTransition = () => {
      if (todoList.scrollHeight > todoList.offsetHeight) {
        view.addClass(todoList, 'grow-items');
      } else if (todoList.scrollHeight === todoList.offsetHeight) {
        view.removeClass(todoList, 'grow-items');
      }

      todoList.querySelectorAll('.todo-item').forEach((item) => {
        item.style.width = '';
      });
      view.off(todoListTime, 'transitionend', handleTransition);
    };
    view.on(todoListTime, 'transitionend', handleTransition);

    // Update localStorage
    todoLocalStorage.populateStorage(todoApp);
  };

  // Helper function - Sort items alphabetically
  const sortByName = (list) => {
    list.sort((itemA, itemB) => {
      const nameA = itemA.title.toUpperCase();
      const nameB = itemB.title.toUpperCase();

      if (nameA < nameB) return 1;

      if (nameA > nameB) return -1;

      return 0;
    });
  };

  // Search events
  const handleSearchInput = (e) => {
    const { target } = e;
    const { showElement, hideElement } = view;
    const { searchReset, tasksView, tasksTitle, toggleSort, setSortIndicator } = view.elements;
    const inputValue = target.value.toLowerCase();
    const items = [];
    // Set task view title
    tasksTitle.textContent = `Searching for "${inputValue}"`;

    // To execute first time in search mode
    if (tasksView.dataset.projectIndex) {
      todoApp.setSelected(null);
      toggleSort(true);
      setSortIndicator('none');
    }

    if (inputValue !== '') {
      showElement(searchReset);

      // Get items from all projects that match our query
      todoApp.getProjects().forEach((project) => {
        project.getItems().forEach((item) => {
          if (item.title.toLowerCase().includes(inputValue)) items.push(item);
        });
      });

      sortByName(items);
    } else {
      hideElement(searchReset);
    }

    view.displaySearchResults(items);
  };

  const handleSearchReset = () => {
    const { searchReset, searchInput, tasksTitle } = view.elements;
    const { hideElement, displaySearchResults } = view;
    hideElement(searchReset);
    searchInput.value = '';
    searchInput.focus();
    tasksTitle.textContent = 'Searching for ""';
    // Reset also the search view
    displaySearchResults([]);
  };

  const handleSearchBlur = (e) => {
    const { searchInput } = view.elements;
    const { projectIndex } = view.elements.tasksView.dataset;

    if (searchInput.value || projectIndex) return;

    handleSwitchList(e);
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
    view.bindSortIndicator(handleSortIndicator);
    view.bindPlannedClick(handlePlannedClick);
    view.bindSearchInput(handleSearchInput);
    view.bindSearchReset(handleSearchReset);
    view.bindSearchBlur(handleSearchBlur);
  };

  return {
    init,
  };
})();

export default todoController;
