import helpers from './helpers';

const mouse = (todoApp, DOMHelpers, todoLocalStorage) => {
  const {
    getUpdatedList,
    getItemsToTranslate,
    enterDroppable,
    scrollListDown,
    scrollListTop,
    reOrderDOMList,
  } = helpers(DOMHelpers.getNumberFromString);

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
    DOMHelpers.enableTransition(container);

    // Get initial Y coords
    const initialPageX = e.pageX;
    const initialPageY = e.pageY;
    const initialItemTranslateY = todoItem.style.transform
      ? DOMHelpers.getNumberFromString(todoItem.style.transform)
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
    const fixHeight = DOMHelpers.createElement('div', '.fix-height');
    fixHeight.style.height = `${container.scrollHeight}px`;

    // Correct positioning: to get the exact spot on the element on 'mousedown'
    const shiftX = e.clientX - todoItem.getBoundingClientRect().left;
    const shiftY = e.clientY - todoItem.getBoundingClientRect().top;

    // Create an overlay over our Item
    const overlay = DOMHelpers.createElement('div', '.drag-overlay');
    document.body.append(overlay);

    // Get initial value on mousedown
    const initialTodoItemTop = todoItem.getBoundingClientRect().top;

    // container bottom/top
    const containerBottom = container.getBoundingClientRect().bottom;
    const containerTop = container.getBoundingClientRect().top;
    const todoItemHeight =
      todoItem.offsetHeight + parseInt(getComputedStyle(todoItem).marginBottom, 10);

    // Initial scroll top
    const initialScrollTop = container.scrollTop;

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
          DOMHelpers.addClass(todoItem, 'dragged');
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
      DOMHelpers.addClass(todoItem, 'hide');
      DOMHelpers.addClass(overlay, 'hide');
      // elemBelow is the element below the todoItem, may be droppable
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      DOMHelpers.removeClass(todoItem, 'hide');
      DOMHelpers.removeClass(overlay, 'hide');

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
            ? DOMHelpers.getNumberFromString(currentTodoItemBelow.style.transform)
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
        ? DOMHelpers.getNumberFromString(todoItem.style.transform)
        : 0;

      resetDraggableStyles();
      const containerIsScrolled = initialScrollTop !== container.scrollTop;
      timerIDs.forEach((timerID) => clearTimeout(timerID));

      if (initialTranslateY !== updatedTranslateY) {
        todoItem.style.transform = `translateY(${updatedTranslateY}px)`;

        // Disable border color transition
        todoItem.style.transition = 'box-shadow .25s ease-out, transform 0.15s ease';

        const handleTransition = () => {
          DOMHelpers.removeClass(todoItem, 'dragged');
          // Reset todo item transition
          todoItem.style.transition = '';
          DOMHelpers.off(todoItem, 'transitionend', handleTransition);

          // re-order todoList
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        };

        if (containerIsScrolled) {
          handleTransition();
        } else {
          DOMHelpers.on(todoItem, 'transitionend', handleTransition);
        }
      } else {
        DOMHelpers.removeClass(todoItem, 'dragged');

        if (initialItemTranslateY !== updatedTranslateY) {
          // re-order todoList
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        }
      }

      DOMHelpers.off(document, 'mousemove', onMouseMove);
      DOMHelpers.off(document, 'mouseup', onMouseUp);
      todoItem.onclick = null;

      // Update localStorage
      todoLocalStorage.populateStorage(todoApp);
    };

    DOMHelpers.on(document, 'mousemove', onMouseMove);
    DOMHelpers.on(document, 'mouseup', onMouseUp);

    todoItem.ondragstart = () => false;
  };

  return handleMouseDown;
};

export default mouse;
