import flatpickr from 'flatpickr';
import assets from './assets';
import DOMHelpers from './DOMHelpers';
import initializeDOMElements from './initDOM';
import viewHelpers from './todo.viewHelpers';
import 'flatpickr/dist/themes/light.css';

const todoView = () => {
  const {
    createElement,
    on,
    off,
    empty,
    getElement,
    getElements,
    wrap,
    unselect,
    addClass,
    removeClass,
    hideElement,
    showElement,
    resetClassList,
    getNumberFromString,
    enableTransition,
    disableTransition,
    swapElements,
  } = DOMHelpers();

  const {
    deleteSVG,
    listSVG,
    checkSVG,
    removeSVG,
    prioritySVG,
    calendarSVG,
    homeSVG,
    tasksSVG,
    importantSVG,
    daySVG,
    notFoundSVG,
  } = assets();

  const elements = initializeDOMElements();
  const { refreshTodoItemsPositions } = elements;

  const {
    resetMyDayCount,
    updateTodoCount,
    appendIndicator,
    resetDetails,
    getConvertedCurrentDate,
    getFriendlyDate,
    getFriendlyCreationDate,
    animateAddTodoList,
    observerCallback,
    animateRemoveTodoList,
    plannedListDOM,
    plannedListView,
    toggleEditMode,
    confirmRemoval,
    switchEmptyState,
    playCompleteSound,
    initPlannedDateTabs,
    animateAddSubTaskList,
    repositionSubTaskList,
    animateRemoveSubTask,
  } = viewHelpers(elements);

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

    // Get todo count elements for default project on init()
    let myDayCount = null;
    let ImportantCount = null;
    let PlannedCount = null;

    if (id > 4) {
      myDayCount = getElement('.list[data-index="2"] .todo-count');
      ImportantCount = getElement('.list[data-index="3"] .todo-count');
      PlannedCount = getElement('.list[data-index="4"] .todo-count');
    }

    items.forEach((todo) => {
      if (todo.isComplete) return;

      count += 1;

      if (todo.isMyDay) myDayCount.textContent = Number(myDayCount.textContent) + 1;

      if (todo.isImportant) ImportantCount.textContent = Number(ImportantCount.textContent) + 1;

      if (todo.date) PlannedCount.textContent = Number(PlannedCount.textContent) + 1;
    });

    if (id > 4) {
      if (myDayCount.classList.contains('hide') && Number(myDayCount.textContent) > 0) {
        showElement(myDayCount);
      }

      if (ImportantCount.classList.contains('hide') && Number(ImportantCount.textContent) > 0) {
        showElement(ImportantCount);
      }

      if (PlannedCount.classList.contains('hide') && Number(PlannedCount.textContent) > 0) {
        showElement(PlannedCount);
      }
    }

    todoCount.textContent = count;

    if (count === 0) hideElement(todoCount);

    // List icon
    const listIcon = createElement('span', '.list-icon');
    // Append elements
    li.append(listIcon, projectName, todoCount);

    switch (id) {
      case 1:
        listIcon.insertAdjacentHTML('beforeEnd', tasksSVG);
        addClass(li, 'all-tasks-list');
        addClass(li, 'pinned');
        break;
      case 2:
        listIcon.insertAdjacentHTML('beforeEnd', daySVG);
        addClass(li, 'my-day-list');
        addClass(li, 'pinned');
        break;
      case 3:
        listIcon.insertAdjacentHTML('beforeEnd', importantSVG);
        addClass(li, 'important-list');
        addClass(li, 'pinned');
        break;
      case 4:
        listIcon.insertAdjacentHTML('beforeEnd', calendarSVG);
        addClass(li, 'planned-list');
        addClass(li, 'pinned');
        break;
      case 5:
        listIcon.insertAdjacentHTML('beforeEnd', homeSVG);
        addClass(li, 'home-list');
        addClass(li, 'pinned');
        break;
      default: {
        listIcon.insertAdjacentHTML('beforeEnd', listSVG);
        // Delete button not needed for default task
        const deleteBtn = createElement('button', '.delete-btn');
        deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
        li.append(deleteBtn);
        break;
      }
    }

    elements.lists.append(li);

    if (isSelected) {
      // Reset selected list
      const { lists } = elements;
      unselect(lists);
      li.classList.add('selected');
    }
  };

  const observer = new MutationObserver(observerCallback);
  observer.observe(elements.todoList, {
    childList: true,
    subtree: true,
  });

  const addTodo = (todo, isNew = false, sort) => {
    // Setup the 'li' element container of the "todo item"
    const li = createElement('li', '.todo-item');
    li.dataset.index = todo.id;
    li.dataset.projectIndex = todo.projectID;
    todo.isComplete ? addClass(li, 'completed') : removeClass(li, 'completed');
    const priorityClass = `${todo.priority.toLowerCase()}`;
    resetClassList(li, ['low', 'medium', 'high']);
    addClass(li, priorityClass);
    // Setting up the checkbox to toggle "completed" state
    const checkbox = createElement('input', `#todo-checkbox${todo.id}${todo.projectID}`);
    const label = createElement('label');
    const span = createElement('span');
    span.insertAdjacentHTML('beforeEnd', checkSVG);
    checkbox.type = 'checkbox';
    checkbox.checked = todo.isComplete;
    label.htmlFor = `todo-checkbox${todo.id}${todo.projectID}`;
    label.append(span);

    // Setting creation date
    if (!todo.creationDate) todo.creationDate = Date.now();

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

    // List name indicator for default projects
    const selectedProject = getElement('.list.selected');

    if (!selectedProject || ['1', '2', '3', '4'].includes(selectedProject.dataset.index)) {
      const projectName = getElement(`.list[data-index="${todo.projectID}"] .project-name`)
        .textContent;
      const projectNameIndicator = createElement('span', '.project-name-indicator');
      projectNameIndicator.textContent = projectName;
      indicators.append(projectNameIndicator);
    }

    if (todo.isMyDay) indicators.append(elements.myDayIndicatorFn());

    const totalSubtasks = todo.getSubTasks().length;

    if (totalSubtasks) {
      const subtaskIndicator = elements.subtaskIndicatorFn();
      const subtaskIndicatorLabel = subtaskIndicator.querySelector('.subtask-indicator-label');
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      subtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      indicators.append(subtaskIndicator);

      if (totalSubtasks === completedSubtasks) {
        addClass(subtaskIndicator, 'completed');
      }

      // Setup & update subtasks tooltip
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        subtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
        subtaskIndicator.dataset.tooltip = '';
      } else if (remainingSubTasks === 0) {
        subtaskIndicator.dataset.tooltip = 'All subtasks are completed';
      } else {
        subtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
        subtaskIndicator.dataset.tooltip = '';
      }
    }

    if (todo.date !== '') {
      const dateIndicator = elements.dateIndicatorFn();
      const dateIndicatorLabel = dateIndicator.querySelector('.date-indicator-label');
      indicators.append(dateIndicator);
      dateIndicatorLabel.innerHTML = getFriendlyDate(todo.date, dateIndicator);
    }

    if (todo.note !== '') indicators.append(elements.noteIndicatorFn());

    if (todo.isImportant) indicators.append(elements.importantIndicatorFn());

    if (indicators.children.length > 0) addClass(titleBlock, 'indicator-on');

    titleBlock.append(title, indicators);
    // Appended elements
    li.append(label, checkbox, titleBlock, deleteBtn);

    if (selectedProject && selectedProject.dataset.index === '4') plannedListView(li, todo.date);
    else elements.todoList.prepend(li);

    // Animate list addition
    isNew ? animateAddTodoList(li, sort) : refreshTodoItemsPositions();

    if (isNew) {
      // Update todoCount in current list
      const todoCount = elements.lists.querySelector(
        `.list[data-index="${todo.projectID}"] .todo-count`,
      );
      todoCount.textContent = Number(todoCount.textContent) + 1;

      // Show todo count if it's todo list is not empty
      if (todoCount.textContent === '1') showElement(todoCount);
    }

    // hide "Empty state" block if todo list is not empty anymore
    if (
      elements.todoList.children.length === 1 ||
      getElements('.todo-list-time .todo-item').length === 1
    ) {
      addClass(elements.emptyState, 'hide-empty-state');
    }
  };

  const removeTodo = (index, projectIndex) => {
    const todoItem = elements.todoList.querySelector(
      `.todo-item[data-index="${index}"].todo-item[data-project-index="${projectIndex}"]`,
    );
    const selectedProject = getElement('.list.selected');
    const isPlannedProject = selectedProject && selectedProject.dataset.index === '4';

    // Update todoCount in current list if todo is not completed
    if (!todoItem.classList.contains('completed')) {
      const todoCount = elements.lists.querySelector(
        `.list[data-index="${projectIndex}"] .todo-count`,
      );
      todoCount.textContent = Number(todoCount.textContent) - 1;

      // Hide todo count if it's todo list is empty
      if (todoCount.textContent === '0') hideElement(todoCount);
    }

    // Animate removing list
    animateRemoveTodoList(todoItem);

    // Reset todo details if selected
    if (todoItem.classList.contains('selected')) {
      resetDetails();
      // Hide view details on delete selected todo
      removeClass(elements.detailsView, 'show');
    }

    // Handle removeTodo in Planned project
    if (isPlannedProject) {
      const todoListTime = todoItem.closest('ul.todo-list-time');
      const todoListHeader = getElement(`#${todoListTime.dataset.time}`);

      if (todoListTime.children.length === 1) {
        hideElement(todoListHeader);
        todoListTime.style.height = 0;
      }
    }

    // Remove Item at the end to get to its ancestors
    todoItem.remove();

    // Show the "Empty state" block if list is empty
    if (
      elements.todoList.children.length === 0 ||
      (isPlannedProject && !getElement('.todo-list-time .todo-item'))
    ) {
      removeClass(elements.emptyState, 'hide-empty-state');
    }
  };

  const toggleTodo = (isComplete, id, projectID) => {
    const toggleComplete = document.getElementById(id);
    const todoItem = toggleComplete.closest('.todo-item');
    const todoCount = elements.lists.querySelector(`.list[data-index="${projectID}"] .todo-count`);
    const prevTodoCount = Number(todoCount.textContent);
    toggleComplete.checked = isComplete;

    if (isComplete) {
      addClass(todoItem, 'completed');
      todoCount.textContent = Number(todoCount.textContent) - 1;

      if (prevTodoCount === 1) hideElement(todoCount);

      if (todoItem.classList.contains('selected')) {
        addClass(elements.detailsView, 'disabled');
      }

      // Play complete sound
      playCompleteSound();
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
    // Remove all of its tasks if the selected project is a default one
    const selectedProject = getElement('.list.selected');
    let index = null;

    if (selectedProject) index = Number(selectedProject.dataset.index);

    const defaultIndexes = [1, 2, 3, 4];

    if (defaultIndexes.includes(index)) {
      const tasks = elements.todoList.querySelectorAll('.todo-item');
      const todoCount = selectedProject.querySelector('.todo-count');
      Array.from(tasks).forEach((todo) => {
        const projectIndex = Number(todo.dataset.projectIndex);
        if (projectIndex === id) {
          todo.remove();

          if (todo.classList.contains('completed')) {
            updateTodoCount(todoCount, false);
          }
        }
      });
    }

    getElement(`.list[data-index="${id}"]`).remove();
  };

  /**
   * Reorder all DOM tasks with the new order of the given list
   * @param {Object[]} todos List of todo objects
   * @param {Object} selectedTodo The selected todo edited
   */
  const refreshTodos = (todos, selectedTodo = null) => {
    enableTransition(elements.todoList);
    const { children } = elements.todoList;

    // Sort DOM elements from model data
    todos.forEach((todo, i) => {
      Array.from(children).some((list, j) => {
        if (
          todo.id === Number(list.dataset.index) &&
          todo.projectID === Number(list.dataset.projectIndex) &&
          i !== children.length - 1 - j
        ) {
          swapElements(list, children[children.length - 1 - i]);

          return true;
        }

        return false;
      });
    });

    let increasedHeight = 0;
    // Refresh todo list on sort change - animated
    Array.from(children).forEach((list) => {
      // Refresh on todo details option change
      if (selectedTodo) {
        const isNotTranslating = list.style.transform
          ? getNumberFromString(list.style.transform) === increasedHeight
          : increasedHeight === 0;

        // Disable transition if edited todo isn't switching position
        if (list === selectedTodo && isNotTranslating) {
          disableTransition(elements.todoList);
        }
      }

      const listHeight = list.offsetHeight + parseInt(getComputedStyle(list).marginBottom, 10);
      list.style.transform = `translateY(${increasedHeight}px)`;
      increasedHeight += listHeight;
    });

    if (elements.todoList.offsetHeight > increasedHeight) {
      elements.todoList.style.transitionDuration = '0.6s';
    }

    elements.todoList.style.height = `${increasedHeight + 8}px`;
  };

  /**
   * Display all todos in the project list
   * @param {Object[]} todos List of todo objects
   */
  const displayTodos = (todos) => {
    const selectedProject = getElement('.list.selected');

    // Reset todo details - we remove details view before appending todos
    resetDetails();
    // Hide view details on list switch & on add list
    removeClass(elements.detailsView, 'show');

    // Set task view index
    elements.tasksView.dataset.projectIndex = selectedProject.dataset.index;
    // Set task view title
    elements.tasksTitle.textContent = getElement('.list.selected .project-name').textContent;
    empty(elements.todoList);

    // Add DOM elements for Planned todo list
    if (selectedProject.dataset.index === '4') plannedListDOM();

    // Animate list - reset todoList Height
    elements.todoList.style.height = 0;

    todos.forEach((todo) => {
      addTodo(todo);
    });

    // Check if list is empty or not to Show/Hide "Empty State"
    todos.length === 0
      ? removeClass(elements.emptyState, 'hide-empty-state')
      : addClass(elements.emptyState, 'hide-empty-state');

    // Link todo view with selected project
    if (selectedProject.classList.contains('pinned')) {
      addClass(elements.tasksView, 'pinned');
    } else {
      removeClass(elements.tasksView, 'pinned');
    }

    // Choose the right empty state to show for the chosen project
    switchEmptyState(selectedProject);
  };

  /**
   * Display all todos in the project list
   * @param {Object[]} todos List of todo objects
   */
  const displaySearchResults = (todos) => {
    // Reset todo details & hide view
    resetDetails();
    removeClass(elements.detailsView, 'show');

    // To execute first time in search mode
    if (elements.tasksView.dataset.projectIndex) {
      // Set task view index
      elements.tasksView.dataset.projectIndex = '';
      // Unselect project
      const selectedList = getElement('.lists .list.selected');
      removeClass(selectedList, 'selected');
      // Remove add todo form
      elements.newTodo.remove();
      // Choose the right empty state to show for the chosen project
      const emptyState = document.getElementById('empty-state');
      const emptyStateText = emptyState.querySelector('p');
      const currentSVG = emptyState.querySelector('svg');

      if (currentSVG) currentSVG.remove();

      emptyState.insertAdjacentHTML('afterBegin', notFoundSVG);
      emptyStateText.textContent = "Sorry, we couldn't find what you're looking for.";
      // Link todo view with selected project: prevent editing title
      addClass(elements.tasksView, 'pinned');
    }

    empty(elements.todoList);

    // Animate list - reset todoList Height
    elements.todoList.style.height = 0;

    todos.forEach((todo) => {
      addTodo(todo);
    });

    // Check if list is empty or not to Show/Hide "Empty State"
    todos.length === 0
      ? removeClass(elements.emptyState, 'hide-empty-state')
      : addClass(elements.emptyState, 'hide-empty-state');
  };

  const isMobile = ((a) => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        a.substr(0, 4),
      )
    ) {
      return true;
    }

    return false;
  })(navigator.userAgent || navigator.vendor || window.opera);

  let flatCalendar = null;
  /**
   * Display details of the selected todo object
   * @param {Object} todo The selected todo object
   */
  const displayDetails = (todo, currentProject, sort, saveData) => {
    // Do some DOM selections
    const selectedTodo = getElement(
      `.todo-item[data-index="${todo.id}"].todo-item[data-project-index="${todo.projectID}"]`,
    );
    const selectedProject = getElement('.list.selected');
    // Reset flatpickr
    if (flatCalendar) flatCalendar.destroy();
    // Reset display
    resetDetails();
    // Add class for CSS styling
    selectedTodo.classList.add('selected');
    // Add class to show component
    addClass(elements.detailsView, 'show');
    // If todo is completed, let's disable its details
    if (todo.isComplete) addClass(elements.detailsView, 'disabled');
    else removeClass(elements.detailsView, 'disabled');
    // Name block of todo
    const name = createElement('textarea', '.name-details');
    const nameBlock = wrap(name, 'name-block');
    name.maxLength = 255;
    name.value = todo.title;
    // Important checkbox
    const importantBlock = createElement('span', '.important-block');
    const importantInput = createElement('input', '#important-check');
    const importantLabel = createElement('label');
    importantInput.type = 'checkbox';
    importantLabel.htmlFor = 'important-check';
    importantLabel.insertAdjacentHTML('beforeEnd', importantSVG);
    if (!todo.isImportant) importantLabel.dataset.tooltip = `Bookmark <em>${todo.title}</em>`;
    else importantLabel.dataset.tooltip = `<em>${todo.title}</em> is bookmarked`;
    importantBlock.append(importantLabel, importantInput);
    nameBlock.append(importantBlock);

    if (todo.isImportant) {
      addClass(importantBlock, 'important');
      importantInput.checked = true;
    }

    // Sub Tasks block
    const subTasksForm = createElement('form');
    const subTasksInput = createElement('input', '#newSubTask');
    subTasksInput.type = 'text';
    subTasksInput.placeholder = '+ Add new subtask';
    subTasksInput.autocomplete = 'off';
    const subTasksSubmit = createElement('input', '.submit-btn');
    subTasksSubmit.type = 'submit';
    subTasksSubmit.value = '+ Add';
    addClass(subTasksSubmit, 'hide', 'text-button');
    subTasksForm.append(subTasksInput, subTasksSubmit);
    const subTasksBlock = wrap(subTasksForm, 'subtask-block');
    const subtasksList = createElement('ul', '.subtasks-list');
    subTasksBlock.prepend(subtasksList);
    const subtaskNameInput = createElement('input', '#subtaskNameInput');
    subtaskNameInput.autocomplete = 'off';
    // Note block of todo
    const note = createElement('textarea', '.note-details');
    note.value = todo.note;
    note.placeholder = 'Add note';
    // Date block of todo
    const date = createElement('input', '#date');

    if (!isMobile) {
      flatCalendar = flatpickr(date, {
        defaultDate: todo.date,
      });
    }

    date.type = 'date';
    date.value = todo.date;
    const dateLabel = createElement('label');
    dateLabel.htmlFor = 'date';
    const dateMessage = createElement('span', '.date-message');
    const removeDate = createElement('span', '.remove-date');
    removeDate.insertAdjacentHTML('beforeEnd', removeSVG);
    const indicators = selectedTodo.querySelector('.indicators');

    if (todo.date) {
      dateMessage.innerHTML = getFriendlyDate(todo.date, dateLabel);
      addClass(dateLabel, 'is-set');
      // Set date indicator text
      const dateIndicator = indicators.querySelector('.date-indicator');
      const dateIndicatorLabel = indicators.querySelector('.date-indicator-label');
      dateIndicatorLabel.innerHTML = dateMessage.innerHTML;

      if (dateMessage.classList.contains('overdue')) {
        addClass(dateIndicator, 'overdue');
      }
    } else {
      dateMessage.innerHTML = 'Add due date';
    }

    dateLabel.append(date, dateMessage);
    const dateBlock = wrap(dateLabel, 'date-block');
    dateBlock.insertAdjacentHTML('beforeEnd', calendarSVG);

    if (dateLabel.classList.contains('is-set') && !isMobile) dateBlock.append(removeDate);

    // My Day block of todo
    const myDay = createElement('div', '.my-day');
    const myDayText = createElement('span', '.my-day-text');
    const removeMyDay = createElement('span', '.remove-my-day');
    removeMyDay.insertAdjacentHTML('beforeEnd', removeSVG);
    myDay.append(myDayText, removeMyDay);
    myDay.insertAdjacentHTML('afterBegin', daySVG);

    if (todo.isMyDay) {
      addClass(myDay, 'added');
      myDayText.textContent = 'Added to My Day';
    } else {
      removeClass(myDay, 'added');
      myDayText.textContent = 'Add to My Day';
    }

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
    // Add tooltip to priorities
    priorityLow.dataset.tooltip = 'Low';
    priorityMedium.dataset.tooltip = 'Medium';
    priorityHigh.dataset.tooltip = 'High';
    priorityList.append(priorityLow, priorityMedium, priorityHigh);
    addClass(priorityList.querySelector(`.${todo.priority.toLowerCase()}`), 'selected');
    priorityBlock.append(priorityTitle, priorityList);
    // Creation date block
    const creationDate = createElement('div', '.creation-date');
    const creationDateText = createElement('span', '.creation-date-text');
    const convertedCreationDate = getConvertedCurrentDate(todo.creationDate);
    creationDateText.textContent = getFriendlyCreationDate(convertedCreationDate);
    creationDate.append(creationDateText);
    // Append to details block
    elements.detailsView.append(
      nameBlock,
      subTasksBlock,
      myDay,
      dateBlock,
      priorityBlock,
      wrap(note, 'note-block'),
      creationDate,
    );

    // Add subtasks to list
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
      subtasksList.prepend(li);

      // reposition subtasks
      repositionSubTaskList();
    });

    // Show overlay on mobile
    if (document.body.offsetWidth < 770) {
      addClass(elements.overlay, 'fade-in');
    }

    // Helper functions for handlers
    const toggleIndicatorClass = () => {
      const titleBlock = selectedTodo.querySelector('.title-block');
      indicators.children.length > 0
        ? addClass(titleBlock, 'indicator-on')
        : removeClass(titleBlock, 'indicator-on');
    };

    // Set handlers on synthetic event
    const nameHeight = getComputedStyle(name).height;
    name.style.height =
      name.scrollHeight <= getNumberFromString(nameHeight) ? nameHeight : `${name.scrollHeight}px`;

    const handleNameChange = (e) => {
      const { target } = e;
      todo.title = target.value;
      selectedTodo.querySelector('.todo-title').textContent = todo.title;
      // Change the height of textarea
      name.style.height = nameHeight; // Reset height to make it responsive also when deleting
      name.style.height =
        name.scrollHeight <= getNumberFromString(nameHeight)
          ? nameHeight
          : `${name.scrollHeight}px`;

      // sort tasks on name change
      sort.refreshSort(currentProject, selectedTodo);

      // Update Bookmark tooltip
      importantLabel.dataset.tooltip = `Bookmark <em>${todo.title}</em>`;

      // Update localStorage
      saveData();
    };

    const noteHeight = getComputedStyle(note).height;
    note.style.height =
      note.scrollHeight <= getNumberFromString(noteHeight) ? noteHeight : `${note.scrollHeight}px`;

    const handleNoteChange = (e) => {
      const { target } = e;
      todo.note = target.value;
      note.style.height = noteHeight; // Reset height to make it responsive also when deleting
      note.style.height =
        note.scrollHeight <= getNumberFromString(noteHeight)
          ? noteHeight
          : `${note.scrollHeight}px`;

      const liveNoteIndicator = selectedTodo.querySelector('.note-indicator');

      if (target.value !== '' && !liveNoteIndicator) {
        appendIndicator(elements.noteIndicatorFn(), selectedTodo);
        toggleIndicatorClass();
      } else if (target.value === '' && liveNoteIndicator) {
        liveNoteIndicator.remove();
        toggleIndicatorClass();
      }

      // Refresh todo list on note change for a responsive behavior
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
    };

    const handleRemoveDateClick = () => {
      if (flatCalendar) flatCalendar.clear();
      else date.value = '';

      todo.date = date.value;
      dateMessage.innerHTML = 'Add due date';
      removeClass(dateLabel, 'is-set');
      removeClass(dateLabel, 'overdue');
      removeClass(dateLabel, 'today');
      removeDate.remove();

      // Set date indicator
      const liveDateIndicator = selectedTodo.querySelector('.date-indicator');
      liveDateIndicator.remove();
      toggleIndicatorClass();

      // Remove todo if it's in "Planned" project
      const isPlannedProject = selectedProject && selectedProject.dataset.index === '4';
      if (isPlannedProject) {
        const todoListTime = selectedTodo.closest('ul.todo-list-time');
        const todoListHeader = getElement(`#${todoListTime.dataset.time}`);

        if (todoListTime.children.length === 1) {
          hideElement(todoListHeader);
          todoListTime.style.height = 0;
        }

        // Animate removing list
        animateRemoveTodoList(selectedTodo);

        selectedTodo.remove();

        // Show the "Empty state" block if all lists are empty
        if (!getElement('.todo-list-time .todo-item')) {
          removeClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // Update todoCount of "Planned" project
      const plannedCount = getElement('.list[data-index="4"] .todo-count');
      updateTodoCount(plannedCount, false);

      // Sort tasks on date remove
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
    };

    const handleDateChange = (e) => {
      const { target } = e;
      const isPlannedProject = selectedProject && selectedProject.dataset.index === '4';

      // If removeDate button is clicked don't run this function
      if (!target.value) {
        if (isMobile) handleRemoveDateClick();

        return;
      }

      todo.date = target.value;
      dateMessage.innerHTML = getFriendlyDate(todo.date, dateLabel);

      // Check if "date" wasn't set before
      if (!dateLabel.classList.contains('is-set')) {
        addClass(dateLabel, 'is-set');

        // Update todoCount of "Planned" project
        const plannedCount = getElement('.list[data-index="4"] .todo-count');
        updateTodoCount(plannedCount, true);

        // Set back removed list if we are editing in "Planned" project
        if (isPlannedProject) {
          selectedTodo.style = '';
          plannedListView(selectedTodo, todo.date);
          // Animate list addition
          animateAddTodoList(selectedTodo);

          // hide "Empty state" block if todo list is not empty anymore
          if (getElements('.todo-list-time .todo-item').length === 1) {
            addClass(elements.emptyState, 'hide-empty-state');
          }
        }
      } else if (isPlannedProject) {
        const todoListTime = selectedTodo.closest('.todo-list-time');
        const todoListHeader = getElement(`#${todoListTime.dataset.time}`);

        plannedListView(selectedTodo, todo.date);

        // Hide header time group if empty
        if (todoListTime.children.length === 0) {
          hideElement(todoListHeader);
          todoListTime.style.height = 0;
        }

        // If new date is in another group date, run animation
        if (todoListTime !== selectedTodo.closest('.todo-list-time')) {
          selectedTodo.style = '';
          refreshTodoItemsPositions();
        }

        // hide "Empty state" block if todo list is not empty anymore
        if (getElements('.todo-list-time .todo-item').length === 1) {
          addClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // Set date indicator
      const liveDateIndicator = selectedTodo.querySelector('.date-indicator');

      if (todo.date && !liveDateIndicator) {
        const dateIndicator = elements.dateIndicatorFn();
        appendIndicator(dateIndicator, selectedTodo);
        dateIndicator.querySelector('.date-indicator-label').innerHTML = getFriendlyDate(
          todo.date,
          dateIndicator,
        );
        toggleIndicatorClass();

        dateLabel.classList.contains('overdue')
          ? addClass(dateIndicator, 'overdue')
          : removeClass(dateIndicator, 'overdue');
      } else if (todo.date) {
        liveDateIndicator.querySelector('.date-indicator-label').innerHTML = getFriendlyDate(
          todo.date,
          liveDateIndicator,
        );
      }

      if (!dateBlock.contains(removeDate) && !isMobile) dateBlock.append(removeDate);

      // Sort tasks on date change
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
    };

    const handlePriorityClick = (e) => {
      const { target } = e;
      const flag = target.closest('li');

      if (!flag) return;

      const list = target.closest('ul');
      unselect(list);
      [todo.priority] = flag.classList;
      addClass(flag, 'selected');
      const priorityClass = `${todo.priority.toLowerCase()}`;
      resetClassList(selectedTodo, ['low', 'medium', 'high']);
      addClass(selectedTodo, priorityClass);

      // Sort tasks on priority change
      if (sort && sort.type() === 'Priority') {
        sort.refreshSort(currentProject);
      }

      // Update localStorage
      saveData();
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
      subtasksList.prepend(li);

      // Hide "Add" button After submit
      hideElement(subTasksSubmit);

      // Animate add subtask
      animateAddSubTaskList();

      // Indicator
      const liveSubtaskIndicator = selectedTodo.querySelector('.subtask-indicator');
      let liveSubtaskIndicatorLabel = selectedTodo.querySelector('.subtask-indicator-label');
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      if (totalSubtasks && !liveSubtaskIndicatorLabel) {
        const subtaskIndicator = elements.subtaskIndicatorFn();
        const subtaskIndicatorLabel = subtaskIndicator.querySelector('.subtask-indicator-label');
        subtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
        appendIndicator(subtaskIndicator, selectedTodo);
        toggleIndicatorClass();
      } else if (totalSubtasks) {
        removeClass(liveSubtaskIndicator, 'completed');
        liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      }

      // Setup & update subtasks tooltip
      liveSubtaskIndicatorLabel = selectedTodo.querySelector('.subtask-indicator-label');
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        liveSubtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
      } else {
        liveSubtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
      }

      // Refresh tasks positions on add subTask
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
    };

    const handleDeleteSubtask = (e) => {
      const { target } = e;
      const deleteButton = target.closest('.delete-btn');

      if (!deleteButton) return;

      const li = target.closest('.subtask');
      const id = Number(li.dataset.index);
      todo.removeSubTask(id);

      // Animate remove subtask
      animateRemoveSubTask(li);

      li.remove();

      // Indicator
      const subtaskIndicator = selectedTodo.querySelector('.subtask-indicator');
      const liveSubtaskIndicatorLabel = selectedTodo.querySelector('.subtask-indicator-label');
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      if (totalSubtasks) {
        liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;

        if (totalSubtasks === completedSubtasks) {
          addClass(subtaskIndicator, 'completed');
        }
      } else if (!totalSubtasks) {
        subtaskIndicator.remove();
        toggleIndicatorClass();
      }

      // Setup & update subtasks tooltip
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        liveSubtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
      } else if (remainingSubTasks === 0) {
        subtaskIndicator.dataset.tooltip = 'All subtasks are completed';
      } else {
        liveSubtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
      }

      // Refresh tasks positions on remove subTask
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
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

      if (isComplete) {
        addClass(li, 'completed');
        // Play complete sound
        playCompleteSound();
      } else {
        removeClass(li, 'completed');
      }

      // Indicator
      const subtaskIndicator = selectedTodo.querySelector('.subtask-indicator');
      const liveSubtaskIndicatorLabel = subtaskIndicator.querySelector('.subtask-indicator-label');
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

      // Setup & update subtasks tooltip
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        liveSubtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
        subtaskIndicator.dataset.tooltip = '';
      } else if (remainingSubTasks === 0) {
        subtaskIndicator.dataset.tooltip = 'All subtasks are completed';
      } else {
        liveSubtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
        subtaskIndicator.dataset.tooltip = '';
      }

      // Refresh tasks positions on toggle subTask
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
    };

    const handleSwitchSubtask = (e) => {
      const { target } = e;
      const selectedSubtask = target.closest('.subtask');

      if (!selectedSubtask || (target !== selectedSubtask && !target.closest('.subtask-name'))) {
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

        // Update localStorage
        saveData();
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

    const handleImportantClick = () => {
      const importantCount = getElement('.list[data-index="3"] .todo-count');
      todo.isImportant = !importantInput.checked;
      importantInput.checked
        ? removeClass(importantBlock, 'important')
        : addClass(importantBlock, 'important');

      if (importantInput.checked) {
        removeClass(importantBlock, 'important');
        selectedTodo.querySelector('.important-indicator').remove();
        toggleIndicatorClass();

        // Update todoCount of "Important" project
        updateTodoCount(importantCount, false);

        // If we are editing in "Important" project then remove todo
        if (selectedProject && selectedProject.dataset.index === '3') {
          selectedTodo.remove();

          // Show "empty state" block in "Bookmarked" project if it's empty
          if (elements.todoList.children.length === 0) {
            removeClass(elements.emptyState, 'hide-empty-state');
          }
        }

        // Update Bookmark tooltip
        importantLabel.dataset.tooltip = `Bookmark <em>${todo.title}</em>`;
      } else {
        addClass(importantBlock, 'important');
        indicators.append(elements.importantIndicatorFn());
        toggleIndicatorClass();

        // Update todoCount of "Important" project
        updateTodoCount(importantCount, true);

        // If we are still editing in "Important" project then append todo
        if (selectedProject && selectedProject.dataset.index === '3') {
          elements.todoList.append(selectedTodo);

          // Hide "empty state" block in "Bookmarked" project if it's not empty
          if (elements.todoList.children.length === 1) {
            addClass(elements.emptyState, 'hide-empty-state');
          }
        }

        // Update Bookmark tooltip
        importantLabel.dataset.tooltip = `<em>${todo.title}</em> is bookmarked`;
      }

      // Sort tasks on Importance change
      sort.refreshSort(currentProject, selectedTodo);

      // Live update of tooltip span
      getElement('.tooltip').innerHTML = importantLabel.dataset.tooltip;

      // Update localStorage
      saveData();
    };

    const handleMyDayClick = (e) => {
      const { target } = e;
      const myDayCount = getElement('.list[data-index="2"] .todo-count');

      if (target.closest('.remove-my-day') || todo.isMyDay) return;

      todo.isMyDay = true;
      addClass(myDay, 'added');
      myDayText.textContent = 'Added to My Day';

      // Add indicator
      appendIndicator(elements.myDayIndicatorFn(), selectedTodo);
      toggleIndicatorClass();

      // Update todoCount of "Important" project
      updateTodoCount(myDayCount, true);

      // If we are still editing in "Important" project then append todo
      if (selectedProject && selectedProject.dataset.index === '2') {
        elements.todoList.append(selectedTodo);

        // Hide "empty state" block in "My Day" project if it was empty
        if (elements.todoList.children.length === 1) {
          addClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // Sort tasks on add My Day
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
    };

    const handleRemoveMyDayClick = () => {
      const myDayCount = getElement('.list[data-index="2"] .todo-count');
      todo.isMyDay = false;
      removeClass(myDay, 'added');
      myDayText.textContent = 'Add to My Day';

      // Remove indicator
      selectedTodo.querySelector('.my-day-indicator').remove();
      toggleIndicatorClass();

      // Update todoCount of "Important" project
      updateTodoCount(myDayCount, false);

      // If we are editing in "Important" project then remove todo
      if (selectedProject && selectedProject.dataset.index === '2') {
        selectedTodo.remove();

        // Show "empty state" block in "My Day" project if it's empty
        if (elements.todoList.children.length === 0) {
          removeClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // Sort tasks on remove My Day
      sort.refreshSort(currentProject, selectedTodo);

      // Update localStorage
      saveData();
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
    on(elements.menuButton, 'click', handleMenuClick);
    on(importantLabel, 'click', handleImportantClick);
    on(myDay, 'click', handleMyDayClick);
    on(removeMyDay, 'click', handleRemoveMyDayClick);
  };

  // Listen to add list Input/Submit events to hide/show "Add" button
  const handleInput = (e) => {
    const { target } = e;
    const addButton = elements.newListSubmit;

    target.value ? showElement(addButton) : hideElement(addButton);
  };

  on(elements.newListInput, 'input', handleInput);

  // Listen to window resize
  const handleResize = () => {
    // Reposition todos on resize
    refreshTodoItemsPositions();
    // Handle event on window to check width screen and show/hide overlay
    const { detailsView } = elements;
    if (detailsView.classList.contains('show')) {
      if (document.body.offsetWidth < 770) {
        addClass(elements.overlay, 'fade-in');
      } else {
        removeClass(elements.overlay, 'fade-in');
      }
    }
  };
  on(window, 'resize', handleResize);

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

  /**
   * Call handleSortList function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSortList = (handler) => {
    on(elements.sortList, 'click', handler);
  };

  /**
   * Call handleSortIndicator function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSortIndicator = (handler) => {
    on(elements.sortIndicator, 'click', handler);
  };

  /**
   * Call handlePlannedClick function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindPlannedClick = (handler) => {
    on(elements.todoList, 'click', handler);
  };

  /**
   * Call handleSearchInput function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSearchInput = (handler) => {
    on(elements.searchInput, 'input', handler);
  };

  /**
   * Call handleSearchReset function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSearchReset = (handler) => {
    on(elements.searchReset, 'click', handler);
  };

  /**
   * Call handleSearchBlur function on synthetic event
   * @param {Function} handler Function called on synthetic event.
   */
  const bindSearchBlur = (handler) => {
    on(elements.searchInput, 'blur', handler);
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
    bindSortList,
    bindSortIndicator,
    bindPlannedClick,
    bindSearchInput,
    bindSearchReset,
    empty,
    toggleEditMode,
    displayDetails,
    bindSwitchTodo,
    hideElement,
    showElement,
    confirmRemoval,
    updateTodoCount,
    resetDetails,
    getConvertedCurrentDate,
    resetMyDayCount,
    refreshTodoItemsPositions,
    refreshTodos,
    initPlannedDateTabs,
    removeClass,
    addClass,
    getElement,
    enableTransition,
    displaySearchResults,
    bindSearchBlur,
    on,
    off,
  };
};

export { todoView, DOMHelpers };
