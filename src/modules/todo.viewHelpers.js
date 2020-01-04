import assets from './assets';
import DOMHelpers from './DOMHelpers';

const viewHelpers = (elements) => {
  const {
    createElement,
    on,
    off,
    empty,
    getElement,
    unselect,
    addClass,
    removeClass,
    hideElement,
    showElement,
    getNumberFromString,
    enableTransition,
  } = DOMHelpers();

  const { chevronSVG } = assets();

  const { refreshTodoItemsPositions } = elements;

  // Toggle modal helpers
  const showModal = () => {
    removeClass(elements.modal, 'close');
    addClass(elements.modalBackdrop, 'fade-in');
  };

  const hideModal = () => {
    addClass(elements.modal, 'close');
    removeClass(elements.modalBackdrop, 'fade-in');
  };
  // Toggle modal
  const toggleModal = () => {
    if (elements.modal.classList.contains('close')) showModal();
    else hideModal();
  };

  // Helper function - Reset "My Day" todo count
  const resetMyDayCount = () => {
    const myDayCount = getElement('.list[data-index="2"] .todo-count');
    myDayCount.textContent = 0;
    hideElement(myDayCount);
  };

  // Helper todo count function
  const updateTodoCount = (element, isIncreased) => {
    if (isIncreased) {
      element.textContent = Number(element.textContent) + 1;
      showElement(element);
      return;
    }

    element.textContent = Number(element.textContent) - 1;

    if (element.textContent === '0') hideElement(element);
  };

  // Helper reorder indicators
  const appendIndicator = (indicator, todo) => {
    let indicators = null;

    if (todo) indicators = todo.querySelector('.indicators');
    else indicators = getElement('.todo-item.selected .indicators');

    const classes = [
      'project-name-indicator',
      'my-day-indicator',
      'subtask-indicator',
      'date-indicator',
      'note-indicator',
      'important-indicator',
    ];
    const listName = indicators.querySelector(`.${classes[0]}`);
    const day = indicators.querySelector(`.${classes[1]}`);
    const note = indicators.querySelector(`.${classes[4]}`);
    const bookmark = indicators.querySelector(`.${classes[5]}`);

    switch (indicator.className) {
      case classes[0]:
        indicators.prepend(indicator);
        break;

      case classes[1]:
        listName ? listName.after(indicator) : indicators.prepend(indicator);
        break;

      case classes[2]:
        if (day) day.after(indicator);
        else if (listName) listName.after(indicator);
        else indicators.prepend(indicator);
        break;

      case classes[3]:
        if (note) note.before(indicator);
        else if (bookmark) bookmark.before(indicator);
        else indicators.append(indicator);
        break;

      case classes[4]:
        bookmark ? bookmark.before(indicator) : indicators.append(indicator);
        break;

      case classes[5]:
        indicators.append(indicator);
        break;

      default:
        break;
    }
  };

  const resetDetails = () => {
    const selectedProject = getElement('.list.selected');
    empty(elements.detailsView);

    // Unselect todos in Planned Project
    if (selectedProject.dataset.index === '4') {
      const lists = elements.todoList.querySelectorAll('ul.todo-list-time');
      Array.from(lists).forEach((list) => {
        if (list.children) unselect(list);
      });
    } else {
      // Unselect todos in the other projects
      unselect(elements.todoList);
    }
  };

  // Helper function - convert current date to "YYYY-MM-DD"
  const getConvertedCurrentDate = () => {
    const date = new Date();
    const month =
      `${date.getMonth() + 1}`.length === 1 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const day = `${date.getDate()}`.length === 1 ? `0${date.getDate()}` : `${date.getDate()}`;

    return `${date.getFullYear()}-${month}-${day}`;
  };

  // Helper function - Date converter
  const getFriendlyDate = (stringDate, dateLabel) => {
    const currentDate = new Date();
    const dateObj = new Date(stringDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = days[dateObj.getDay()];
    const month = months[dateObj.getMonth()];
    const dayNumber = dateObj.getDate();
    const year = dateObj.getFullYear();

    // Today, Tomorrow
    let initialMonth = currentDate.getMonth() + 1;
    let initialDay = currentDate.getDate();
    initialMonth = `${initialMonth}`.length > 1 ? initialMonth : `0${initialMonth}`;
    initialDay = `${initialDay}`.length > 1 ? initialDay : `0${initialDay}`;
    const initialDate = new Date(`${currentDate.getFullYear()}-${initialMonth}-${initialDay}`);
    const coefficientMSDay = 1000 * 60 * 60 * 24;
    const numberOfDays = (dateObj - initialDate) / coefficientMSDay;
    let timeMSG = 'Due';
    removeClass(dateLabel, 'overdue');
    removeClass(dateLabel, 'today');

    if (numberOfDays < 0) {
      timeMSG = 'Overdue,';
      addClass(dateLabel, 'overdue');
    } else if (numberOfDays === 0) addClass(dateLabel, 'today');

    switch (numberOfDays) {
      case 0:
        return 'Due Today';
      case 1:
        return 'Due Tomorrow';
      case -1:
        return 'Overdue Yesterday';
      default:
        if (year !== currentDate.getFullYear()) {
          return `${timeMSG} ${day}, ${month} ${dayNumber}, ${year}`;
        }

        return `${timeMSG} ${day}, ${month} ${dayNumber}`;
    }
  };

  // Helper function - Date converter
  const getFriendlyCreationDate = (stringDate) => {
    const currentDate = new Date(getConvertedCurrentDate());
    const dateObj = new Date(stringDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = days[dateObj.getDay()];
    const month = months[dateObj.getMonth()];
    const dayNumber = dateObj.getDate();
    const year = dateObj.getFullYear();

    // Today, Yesterday
    const coefficientMSDay = 1000 * 60 * 60 * 24;
    const numberOfDays = (currentDate - dateObj) / coefficientMSDay;
    const timeMSG = 'Created';

    switch (numberOfDays) {
      case 0:
        return 'Created Today';
      case 1:
        return 'Created Yesterday';
      default:
        if (year !== currentDate.getFullYear()) {
          return `${timeMSG} ${day}, ${month} ${dayNumber}, ${year}`;
        }

        return `${timeMSG} ${day}, ${month} ${dayNumber}`;
    }
  };

  // Disable addTodo input
  const toggleReadOnly = (input) => {
    input.readOnly = !input.readOnly;
  };

  // Helper function - Animating todo list
  const animateAddTodoList = (addedTodo) => {
    const selectedProject = getElement('.list.selected');
    let todoList = null;

    if (selectedProject.dataset.index === '4') {
      todoList = addedTodo.closest('.todo-list-time');
      elements.todoList.style.height = '';
    } else todoList = elements.todoList;

    const { children } = todoList;
    let fullHeight = 0;
    let lastChildFullHeight = 0;

    // Enable all transitions
    enableTransition(todoList);

    Array.from(children).forEach((child, index) => {
      const height = child.offsetHeight;
      const { marginBottom } = getComputedStyle(child);
      fullHeight += height + parseInt(marginBottom, 10);

      if (index === 0) {
        lastChildFullHeight = fullHeight;
        // Add a nice effect for the added item
        addClass(child, 'selected');

        return;
      }

      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${lastChildFullHeight + oldTranslateY}px)`;
    });

    /**
     * Fix scrollbar display on transition, hide it in between
     * must execute before calculating the new list height
     */
    if (todoList.scrollHeight === todoList.offsetHeight) {
      todoList.style.overflow = 'hidden';
      const handleTransition = () => {
        todoList.style.overflow = '';
        off(todoList, 'transitionend', handleTransition);
      };
      on(todoList, 'transitionend', handleTransition);
    }

    // Do not animate list when there is only one item
    if (children.length === 1) {
      todoList.style.transition = 'none';
      const todoItem = children[0];
      const handleTransition = () => {
        todoList.style.transition = '';
        off(todoItem, 'transitionend', handleTransition);
      };
      on(todoItem, 'transitionend', handleTransition);
    }

    // Disable addTodo input during animation
    toggleReadOnly(elements.newTodoInput);
    // Remove the effect of the added item after the end of the animation
    const lastItem = children[children.length - 1];

    const handleItemTransition = () => {
      removeClass(children[0], 'selected');
      off(lastItem, 'transitionend', handleItemTransition);

      // Enable addTodo input after end of animation
      toggleReadOnly(elements.newTodoInput);
    };
    on(lastItem, 'transitionend', handleItemTransition);

    // The number 8 is added to give room to items to grow/shrink and not be hidden
    todoList.style.height = `${fullHeight + 8}px`;
  };

  // Mutation observer
  const observerCallbackHelper = (todoList, mutation) => {
    const { target, addedNodes, removedNodes } = mutation;
    const selectedProject = getElement('.list.selected');
    const indicators = target.closest('.indicators');
    const isDateIndicator = target.classList.contains('date-indicator-label');
    const isPlannedProject = selectedProject.dataset.index === '4';
    const isTransitionDisabled = todoList.style.transitionProperty === 'none';
    let skip = false;

    /**
     * Checking if we are in 'Planned' project and removing/adding date
     * So we skip to not trigger 'refresh position' function and disable animation add/remove todo
     */
    if (
      isPlannedProject &&
      indicators &&
      ((addedNodes[0] &&
        addedNodes[0].nodeType === 1 &&
        addedNodes[0].classList.contains('date-indicator')) ||
        (removedNodes[0] &&
          removedNodes[0].nodeType === 1 &&
          removedNodes[0].classList.contains('date-indicator')) ||
        (isDateIndicator && (!addedNodes[0] || !removedNodes[0])))
    ) {
      skip = true;
    }

    if (indicators && !skip) {
      refreshTodoItemsPositions();
    } else if (
      !isTransitionDisabled &&
      addedNodes[0] &&
      addedNodes[0].nodeType === 1 &&
      addedNodes[0].classList.contains('todo-item')
    ) {
      // If there is scrollbar, grow items to keep the same width
      const { tasksView, newTodo, tasksTitleWrapper } = elements;
      const maxTodoListHeight =
        tasksView.offsetHeight - (newTodo.offsetHeight + tasksTitleWrapper.offsetHeight);
      let fullHeight = null;

      if (isPlannedProject) {
        const fullHeightAddedNode =
          addedNodes[0].offsetHeight + parseInt(getComputedStyle(addedNodes[0]).marginBottom, 10);
        fullHeight = elements.todoList.scrollHeight + fullHeightAddedNode;
      } else {
        fullHeight = parseInt(todoList.style.height, 10);
      }

      Array.from(todoList.children).forEach((child) => {
        child.style.width = `${child.offsetWidth}px`;
      });

      const handleTransition = () => {
        if (maxTodoListHeight < fullHeight) {
          addClass(elements.todoList, 'grow-items');
        }

        Array.from(todoList.children).forEach((child) => {
          child.style.width = '';
        });
        off(todoList, 'transitionend', handleTransition);
      };
      on(todoList, 'transitionend', handleTransition);
    } else if (
      !isTransitionDisabled &&
      removedNodes[0] &&
      removedNodes[0].nodeType === 1 &&
      removedNodes[0].classList.contains('todo-item')
    ) {
      // If there is scrollbar, grow items to keep the same width
      const { tasksView, newTodo, tasksTitleWrapper } = elements;
      const maxTodoListHeight =
        tasksView.offsetHeight - (newTodo.offsetHeight + tasksTitleWrapper.offsetHeight);
      let fullHeight = null;

      if (isPlannedProject) {
        const todoListInitialHeight = todoList.offsetHeight;
        const todoListNewHeight = parseInt(todoList.style.height, 10);
        const fullHeightRemovedNode = todoListInitialHeight - todoListNewHeight;
        fullHeight = elements.todoList.scrollHeight - fullHeightRemovedNode;
      } else {
        fullHeight = parseInt(todoList.style.height, 10);
      }

      Array.from(todoList.children).forEach((child) => {
        child.style.width = `${child.offsetWidth}px`;
      });

      const handleTransition = () => {
        if (maxTodoListHeight >= fullHeight) {
          removeClass(elements.todoList, 'grow-items');
        }

        Array.from(todoList.children).forEach((child) => {
          child.style.width = '';
        });
        off(todoList, 'transitionend', handleTransition);
      };
      on(todoList, 'transitionend', handleTransition);
    }
  };

  const observerCallback = (mutations) => {
    mutations.forEach((mutation) => {
      const { todoList } = elements;
      const isPlannedProject = elements.tasksView.dataset.projectIndex === '4';

      if (isPlannedProject) {
        const listsTime = todoList.querySelectorAll('ul.todo-list-time');
        Array.from(listsTime).forEach((list) => {
          if (list.children.length > 0) {
            observerCallbackHelper(list, mutation);
          }
        });
      } else {
        observerCallbackHelper(todoList, mutation);
      }
    });
  };

  const animateRemoveTodoList = (removedChild) => {
    const selectedProject = getElement('.list.selected');
    let todoList = null;

    if (selectedProject.dataset.index === '4') {
      todoList = removedChild.closest('.todo-list-time');
      elements.todoList.style.height = '';
    } else todoList = elements.todoList;

    const { children } = todoList;
    const indexOfRemoved = Array.from(children).indexOf(removedChild);

    const fullHeight =
      todoList.scrollHeight > todoList.offsetHeight ? todoList.scrollHeight : todoList.offsetHeight;

    let removeChildFullHeight = 0;
    // Enable all transitions
    enableTransition(todoList);

    Array.from(children).forEach((child, index) => {
      if (index < indexOfRemoved) return;

      if (index === indexOfRemoved) {
        const height = child.offsetHeight;
        const { marginBottom } = getComputedStyle(child);
        removeChildFullHeight = height + parseInt(marginBottom, 10);

        return;
      }

      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${oldTranslateY - removeChildFullHeight}px)`;
    });

    // Fix scrollbar display on transition, hide it in between
    const nextChild = children[indexOfRemoved + 1];
    if (todoList.scrollHeight === todoList.offsetHeight && nextChild) {
      todoList.style.overflow = 'hidden';
      const handleTransition = () => {
        todoList.style.overflow = '';
        // Update todoList height
        todoList.style.height = `${fullHeight - removeChildFullHeight}px`;
        off(nextChild, 'transitionend', handleTransition);
      };
      on(nextChild, 'transitionend', handleTransition);
    } else {
      // Update todoList height
      todoList.style.height = `${fullHeight - removeChildFullHeight}px`;
    }
  };

  // Helper function - planned list DOM elements
  const plannedListDOM = () => {
    const earlierListHeader = createElement('li', '#earlier-list-header');
    const earlierList = createElement('ul', '#earlier-todo-list');
    const todayListHeader = createElement('li', '#today-list-header');
    const todayList = createElement('ul', '#today-todo-list');
    const tomorrowListHeader = createElement('li', '#tomorrow-list-header');
    const tomorrowList = createElement('ul', '#tomorrow-todo-list');
    const laterThisWeekListHeader = createElement('li', '#laterThisWeek-list-header');
    const laterThisWeekList = createElement('ul', '#laterThisWeek-todo-list');
    const nextWeekListHeader = createElement('li', '#nextWeek-list-header');
    const nextWeekList = createElement('ul', '#nextWeek-todo-list');
    const laterListHeader = createElement('li', '#later-list-header');
    const laterList = createElement('ul', '#later-todo-list');
    earlierListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Earlier</h3><button class="open-close">${chevronSVG}</button>`,
    );
    todayListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Today</h3><button class="open-close">${chevronSVG}</button>`,
    );
    tomorrowListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Tomorrow</h3><button class="open-close">${chevronSVG}</button>`,
    );
    laterThisWeekListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Later this week</h3><button class="open-close">${chevronSVG}</button>`,
    );
    nextWeekListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Next week</h3><button class="open-close">${chevronSVG}</button>`,
    );
    laterListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Later</h3><button class="open-close">${chevronSVG}</button>`,
    );

    addClass(earlierListHeader, 'list-header', 'hide');
    addClass(todayListHeader, 'list-header', 'hide');
    addClass(tomorrowListHeader, 'list-header', 'hide');
    addClass(laterThisWeekListHeader, 'list-header', 'hide');
    addClass(nextWeekListHeader, 'list-header', 'hide');
    addClass(laterListHeader, 'list-header', 'hide');

    addClass(earlierList, 'todo-list-time');
    addClass(todayList, 'todo-list-time');
    addClass(tomorrowList, 'todo-list-time');
    addClass(laterThisWeekList, 'todo-list-time');
    addClass(nextWeekList, 'todo-list-time');
    addClass(laterList, 'todo-list-time');

    earlierList.dataset.time = earlierListHeader.id;
    todayList.dataset.time = todayListHeader.id;
    tomorrowList.dataset.time = tomorrowListHeader.id;
    laterThisWeekList.dataset.time = laterThisWeekListHeader.id;
    nextWeekList.dataset.time = nextWeekListHeader.id;
    laterList.dataset.time = laterListHeader.id;

    elements.todoList.append(
      earlierListHeader,
      earlierList,
      todayListHeader,
      todayList,
      tomorrowListHeader,
      tomorrowList,
      laterThisWeekListHeader,
      laterThisWeekList,
      nextWeekListHeader,
      nextWeekList,
      laterListHeader,
      laterList,
    );
  };

  // Helper function - Planned list system
  const plannedListView = (todoList, dateString) => {
    const date = new Date(dateString);
    const currentDate = new Date(getConvertedCurrentDate());
    const coefficientMSDay = 1000 * 60 * 60 * 24;
    const days = (date - currentDate) / coefficientMSDay;
    const currentDay = currentDate.getDay();

    if (days === 0) {
      const todayList = getElement('#today-todo-list');
      const todayListHeader = getElement('#today-list-header');

      if (!todayList.contains(todoList)) {
        todayList.prepend(todoList);
      }

      showElement(todayListHeader);
    } else if (days === 1) {
      const tomorrowList = getElement('#tomorrow-todo-list');
      const tomorrowListHeader = getElement('#tomorrow-list-header');

      if (!tomorrowList.contains(todoList)) {
        tomorrowList.prepend(todoList);
      }

      showElement(tomorrowListHeader);
    } else if (days < 0) {
      const earlierList = getElement('#earlier-todo-list');
      const earlierListHeader = getElement('#earlier-list-header');

      if (!earlierList.contains(todoList)) {
        earlierList.prepend(todoList);
      }

      showElement(earlierListHeader);
    } else if (currentDay !== 0 && currentDay !== 6 && days > 1 && days <= 7 - currentDay) {
      const laterThisWeekList = getElement('#laterThisWeek-todo-list');
      const laterThisWeekListHeader = getElement('#laterThisWeek-list-header');

      if (!laterThisWeekList.contains(todoList)) {
        laterThisWeekList.prepend(todoList);
      }

      showElement(laterThisWeekListHeader);
    } else if (
      (days > 7 - currentDay && days <= 14 - currentDay) ||
      (currentDay === 0 && days > 1 && days <= 7)
    ) {
      const nextWeekList = getElement('#nextWeek-todo-list');
      const nextWeekListHeader = getElement('#nextWeek-list-header');

      if (!nextWeekList.contains(todoList)) {
        nextWeekList.append(todoList);
      }

      showElement(nextWeekListHeader);
    } else {
      const laterList = getElement('#later-todo-list');
      const laterListHeader = getElement('#later-list-header');

      if (!laterList.contains(todoList)) {
        laterList.append(todoList);
      }

      showElement(laterListHeader);
    }
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

  // Listen to modal
  const confirmRemoval = (callback, msg) => {
    const { modalOk, modalCancel, modalBackdrop, modalText } = elements;
    modalText.innerHTML = msg;
    toggleModal();
    modalCancel.focus();

    const handleClick = (e) => {
      const { target } = e;
      toggleModal();
      off(modalOk, 'click', handleClick);
      off(modalCancel, 'click', handleClick);
      off(modalBackdrop, 'click', handleClick);

      if (target === modalOk) {
        callback();
      }
    };

    on(modalOk, 'click', handleClick);
    on(modalCancel, 'click', handleClick);
    // Hide modal on modalBackdrop click
    on(modalBackdrop, 'click', handleClick);
  };

  return {
    toggleModal,
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
  };
};

export default viewHelpers;
