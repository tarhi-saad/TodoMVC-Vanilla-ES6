const helpers = (getNumberFromString) => {
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

        if (itemB.id === draggedID && getIndex(itemA.id) >= belowIndex) return 1;
      } else {
        if (itemB.id === draggedID && getIndex(itemA.id) <= belowIndex) return -1;

        if (itemA.id === draggedID && getIndex(itemB.id) <= belowIndex) return 1;
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

  return {
    getUpdatedList,
    getItemsToTranslate,
    enterDroppable,
    scrollListDown,
    scrollListTop,
    reOrderDOMList,
  };
};

export default helpers;
