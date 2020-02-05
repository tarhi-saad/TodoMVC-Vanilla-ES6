import DOMHelpers from './DOMHelpers';

const draggable = (todoApp, todoLocalStorage) => {
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
    toggleClass,
    hideElement,
    showElement,
    resetClassList,
    getNumberFromString,
    disableTransition,
    enableTransition,
    toggleTransition,
    swapElements,
  } = DOMHelpers();

  const getUpdatedList = (items, draggedItem, belowItem) => {
    const arrayHolder = [...items];
    const getIndex = (id) => arrayHolder.findIndex((item) => item.id === id);

    const draggedID = Number(draggedItem.dataset.index);
    const belowID = Number(belowItem.dataset.index);
    const belowIndex = getIndex(belowID);
    const draggedIndex = getIndex(draggedID);

    items.sort((itemA, itemB) => {
      if (draggedIndex > belowIndex) {
        if (itemA.id === draggedID && getIndex(itemB.id) >= belowIndex) return -1;

        if (itemB.id === draggedID && getIndex(itemA.id) <= belowIndex) return 1;
      } else {
        if (itemB.id === draggedID && getIndex(itemA.id) <= belowIndex) return -1;

        if (itemA.id === draggedID && getIndex(itemB.id) >= belowIndex) return 1;
      }

      return 0;
    });

    return items;
  };

  const getItemsToTranslate = (items, container, draggedItem, belowItem) => {
    const getTaskFromID = (id) => container.querySelector(`.todo-item[data-index="${id}"]`);
    const getIndex = (id) => items.findIndex((item) => item.id === id);

    const draggedID = Number(draggedItem.dataset.index);
    const belowID = Number(belowItem.dataset.index);
    const draggedIndex = getIndex(draggedID);
    const belowIndex = getIndex(belowID);
    const list = [];

    items.forEach((item, index) => {
      if (draggedIndex > belowIndex) {
        if (index < draggedIndex && index >= belowIndex) list.push(getTaskFromID(item.id));
      } else if (index > draggedIndex && index <= belowIndex) {
        list.push(getTaskFromID(item.id));
      }
    });

    return list;
  };

  const enterDroppable = (items, list, draggedItem, belowItem) => {
    const getIndex = (id) => items.findIndex((item) => item.id === id);

    const draggedID = Number(draggedItem.dataset.index);
    const belowID = Number(belowItem.dataset.index);
    const draggedIndex = getIndex(draggedID);
    const belowIndex = getIndex(belowID);
    const todoItemHeight =
      draggedItem.offsetHeight + parseInt(getComputedStyle(draggedItem).marginBottom, 10);
    const belowTranslateY = belowItem.style.transform
      ? getNumberFromString(belowItem.style.transform)
      : 0;

    if (draggedIndex > belowIndex) {
      list.forEach((item) => {
        if (item === draggedItem) {
          item.style.transform = `translateY(${belowTranslateY -
            (draggedItem.offsetHeight - belowItem.offsetHeight)})px`;

          return;
        }

        const translateY = item.style.transform ? getNumberFromString(item.style.transform) : 0;
        item.style.transform = `translateY(${translateY - todoItemHeight}px)`;
      });
    } else {
      list.forEach((item) => {
        if (item === draggedItem) {
          item.style.transform = `translateY(${belowTranslateY})px`;

          return;
        }

        const translateY = item.style.transform ? getNumberFromString(item.style.transform) : 0;
        item.style.transform = `translateY(${translateY + todoItemHeight}px)`;
      });
    }
  };

  const scrollListDown = (container) => {
    const scrollDiff = container.scrollHeight - container.offsetHeight;
    let scrolledDistance = container.scrollTop;
    const timerIDs = [];

    let multiplier = 0;

    while (scrolledDistance < scrollDiff) {
      const timerID = setTimeout(() => {
        container.scrollBy(0, 1);
      }, 5 * multiplier);

      multiplier += 1;
      scrolledDistance += 1;
      timerIDs.push(timerID);
    }

    return timerIDs;
  };

  const scrollListTop = (container) => {
    let scrolledDistance = container.scrollTop;
    const timerIDs = [];

    let multiplier = 0;

    while (scrolledDistance >= 0) {
      const timerID = setTimeout(() => {
        container.scrollBy(0, -1);
      }, 5 * multiplier);

      multiplier += 1;
      scrolledDistance -= 1;
      timerIDs.push(timerID);
    }

    return timerIDs;
  };

  // Reorder a list of DOM elements without removing them from a given array
  const reOrderDOMList = (list, items) => {
    const orderedIDs = [];
    items.forEach((item) => orderedIDs.push(item.id));

    orderedIDs.forEach((id) => {
      const item = list.querySelector(`.todo-item[data-index="${id}"]`);
      list.prepend(item);
    });
  };

  const handleMouseDown = (e) => {
    if (
      todoApp.getSelected() < 4 ||
      todoApp.getSelectedProject().getSelectedSortType() !== 'none'
    ) {
      return;
    }

    const { target } = e;
    const todoItem = target.closest('.todo-item');
    if (document.querySelector('.fix-height')) document.querySelector('.fix-height').remove();

    if (!todoItem) return;

    // The container where we want to keep our draggable element
    const container = todoItem.closest('.todo-list');

    // Enable transitions
    enableTransition(container);

    // Get initial Y coords
    const initialPageX = e.pageX;
    const initialPageY = e.pageY;
    const initialItemTranslateY = todoItem.style.transform
      ? getNumberFromString(todoItem.style.transform)
      : 0;

    // currentTodoItemBelow
    let currentTodoItemBelow = null;

    // current page Y
    let currentPageY = null;

    // New translateY from below todoItems
    let updatedTranslateY = initialItemTranslateY;

    // Get left value of dragged item to fix it horizontally
    const todoItemLeft = todoItem.getBoundingClientRect().left;

    // Timer IDs array
    const timerIDs = [];

    // Create an element inside todoList to fix its height
    const fixHeight = createElement('div', '.fix-height');
    fixHeight.style.height = `${container.scrollHeight}px`;

    // Correct positioning: to get the exact spot on the element on 'mousedown'
    const shiftX = e.clientX - todoItem.getBoundingClientRect().left;
    const shiftY = e.clientY - todoItem.getBoundingClientRect().top;

    // Create an overlay over our Item
    const overlay = createElement('div', '.drag-overlay');
    document.body.append(overlay);

    // Get initial value on mousedown
    const initialTodoItemTop = todoItem.getBoundingClientRect().top;

    // container bottom/top
    const containerBottom = container.getBoundingClientRect().bottom;
    const containerTop = container.getBoundingClientRect().top;
    const todoItemHeight =
      todoItem.offsetHeight + parseInt(getComputedStyle(todoItem).marginBottom, 10);

    // min/max translateY
    const maxTranslateY =
      containerBottom - todoItemHeight - 1 - initialTodoItemTop + initialItemTranslateY;

    const minTranslateY = containerTop + 1 - initialTodoItemTop + initialItemTranslateY;

    /**
     * A helper function to get the new coords of the draggable element
     * @param {Number} pageY Top coords of element on the document
     * @param {Number} translateY translateY value of the element
     */
    function moveAt(translateY) {
      if (translateY > maxTranslateY) {
        todoItem.style.transform = `translateY(${maxTranslateY}px)`;
      } else if (translateY < minTranslateY) {
        todoItem.style.transform = `translateY(${minTranslateY}px)`;
      } else todoItem.style.transform = `translateY(${translateY}px)`;
    }

    const setDraggableStyles = () => {
      todoItem.style.width = `${todoItem.offsetWidth}px`;
      todoItem.style.position = 'fixed';
      todoItem.style.left = `${todoItemLeft}px`;
      todoItem.style.top = `${initialTodoItemTop - initialItemTranslateY}px`;
    };

    const resetDraggableStyles = () => {
      todoItem.style.left = '';
      todoItem.style.top = '';
      todoItem.style.width = '';
      todoItem.style.position = '';
    };

    /**
     * We get the coords of the cursor on the document and get the element under it
     * @param {Event} event event parameter of 'mousemove' Event
     */
    const onMouseMove = (event) => {
      // Activate movement after 5px
      if (Math.abs(initialPageX - event.pageX) > 5 || Math.abs(initialPageY - event.pageY) > 5) {
        const translateY = initialItemTranslateY - initialPageY + event.pageY;
        moveAt(translateY);

        if (!todoItem.classList.contains('dragged')) {
          setDraggableStyles();
          addClass(todoItem, 'dragged');
        }

        // Scroll List if dragged item is on bottom/top edges
        if (
          event.pageY > containerBottom - 40 &&
          (currentPageY === null || currentPageY <= containerBottom - 40)
        ) {
          // Scroll move
          // const speed = Math.floor(event.pageY - containerBottom + 40);
          timerIDs.push(...scrollListDown(container));

          currentPageY = event.pageY;
        } else if (event.pageY <= containerBottom - 40 && currentPageY > containerBottom - 40) {
          currentPageY = event.pageY;

          timerIDs.forEach((timerID) => clearTimeout(timerID));
          timerIDs.length = 0;
        }

        if (
          event.pageY < containerTop + 40 &&
          (currentPageY === null || currentPageY >= containerTop + 40)
        ) {
          // Scroll move
          timerIDs.push(...scrollListTop(container, event));

          currentPageY = event.pageY;
        } else if (event.pageY >= containerTop + 40 && currentPageY < containerTop + 40) {
          currentPageY = event.pageY;

          timerIDs.forEach((timerID) => clearTimeout(timerID));
          timerIDs.length = 0;
        }
      }

      if (!todoItem.classList.contains('dragged')) {
        container.append(fixHeight);
      }

      if (!overlay.style.left) {
        overlay.style.left = `${event.pageX - shiftX}px`;
        overlay.style.width = `${todoItem.offsetWidth}px`;
        overlay.style.height = `${todoItem.offsetHeight}px`;
      }

      overlay.style.top = `${event.pageY - shiftY}px`;

      // Hide the element that we drag
      addClass(todoItem, 'hide');
      addClass(overlay, 'hide');
      // elemBelow is the element below the todoItem, may be droppable
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      removeClass(todoItem, 'hide');
      removeClass(overlay, 'hide');

      if (!elemBelow) return;

      // Other todoItems are labeled with the class "todo-item" (can be other logic)
      const todoItemBelow = elemBelow.closest('.todo-item');

      if (currentTodoItemBelow !== todoItemBelow) {
        // we're flying in or out...
        // note: both values can be null
        // currentDroppable=null if we were not over a droppable before this event
        // (e.g over an empty space)
        // droppableBelow=null if we're not over a droppable now, during this event

        currentTodoItemBelow = todoItemBelow;

        if (currentTodoItemBelow) {
          // the logic to process "flying in" of the droppable
          const belowTranslateY = currentTodoItemBelow.style.transform
            ? getNumberFromString(currentTodoItemBelow.style.transform)
            : 0;
          updatedTranslateY =
            updatedTranslateY > belowTranslateY
              ? belowTranslateY
              : belowTranslateY - (todoItem.offsetHeight - currentTodoItemBelow.offsetHeight);
          const items = todoApp.getSelectedProject().getItems();
          const itemsToTranslate = getItemsToTranslate(
            items,
            container,
            todoItem,
            currentTodoItemBelow,
          );
          enterDroppable(items, itemsToTranslate, todoItem, currentTodoItemBelow);
          getUpdatedList(items, todoItem, currentTodoItemBelow);
        }
      }
    };

    const onMouseUp = () => {
      overlay.remove();

      // Place item in its new position
      const initialTranslateY = todoItem.style.transform
        ? getNumberFromString(todoItem.style.transform)
        : 0;

      resetDraggableStyles();
      timerIDs.forEach((timerID) => clearTimeout(timerID));

      if (initialTranslateY !== updatedTranslateY) {
        todoItem.style.transform = `translateY(${updatedTranslateY}px)`;

        // Disable border color transition
        todoItem.style.transition = 'box-shadow .25s ease-out, transform 0.15s ease';

        const handleTransition = () => {
          removeClass(todoItem, 'dragged');
          // fixHeight.remove();
          // Reset todo item transition
          todoItem.style.transition = '';
          off(todoItem, 'transitionend', handleTransition);

          // re-order todoList
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        };
        on(todoItem, 'transitionend', handleTransition);
      } else {
        removeClass(todoItem, 'dragged');
      }

      off(document, 'mousemove', onMouseMove);
      off(document, 'mouseup', onMouseUp);
      todoItem.onclick = null;

      // Update localStorage
      todoLocalStorage.populateStorage(todoApp);
    };

    on(document, 'mousemove', onMouseMove);
    on(document, 'mouseup', onMouseUp);

    todoItem.ondragstart = () => false;
  };

  on(document.body, 'mousedown', handleMouseDown);
};

export default draggable;
