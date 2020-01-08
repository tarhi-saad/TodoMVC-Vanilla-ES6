const todoSort = () => {
  const state = {
    selectedType: 'none',
    selectedDirection: 'asc',
  };

  let order = state.selectedDirection;

  const sortByName = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      const nameA = itemA.title.toUpperCase();
      const nameB = itemB.title.toUpperCase();

      if (nameA < nameB) return -order;

      if (nameA > nameB) return order;

      return 0;
    });
  };

  const sortByCompleted = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemB.isComplete && !itemA.isComplete) return order;

      if (itemA.isComplete && !itemB.isComplete) return -order;

      return 0;
    });
  };

  const sortByMyDay = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemB.isMyDay && !itemA.isMyDay) return order;

      if (itemA.isMyDay && !itemB.isMyDay) return -order;

      return 0;
    });
  };

  const sortByImportance = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemB.isImportant && !itemA.isImportant) return order;

      if (itemA.isImportant && !itemB.isImportant) return -order;

      return 0;
    });
  };

  const sortByDueDate = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      const dateA = new Date(itemA.date);
      const dateB = new Date(itemB.date);

      if (dateA && dateB) {
        if (dateA < dateB) return -order;

        if (dateA > dateB) return order;
      }

      if ((itemA.isComplete && !itemB.isComplete) || (!itemA.date && itemB.date)) return -1;

      if ((!itemA.isComplete && itemB.isComplete) || (itemA.date && !itemB.date)) return 1;

      return 0;
    });
  };

  const sortByCreationDate = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemA.creationDate < itemB.creationDate) return -order;

      if (itemA.creationDate > itemB.creationDate) return order;

      return 0;
    });
  };

  const sortByPriority = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      let a = null;
      let b = null;

      switch (itemA.priority) {
        case 'low':
          a = 1;
          break;

        case 'medium':
          a = 2;
          break;

        case 'high':
          a = 3;
          break;

        default:
          break;
      }

      switch (itemB.priority) {
        case 'low':
          b = 1;
          break;

        case 'medium':
          b = 2;
          break;

        case 'high':
          b = 3;
          break;

        default:
          break;
      }

      if (!itemA.isComplete && !itemB.isComplete) {
        if (a < b) return -order;

        if (a > b) return order;
      }

      if (itemA.isComplete && !itemB.isComplete) return -1;

      if (!itemA.isComplete && itemB.isComplete) return 1;

      return 0;
    });
  };

  const getSortedItems = (items) => {
    const sortedItems = [...items];
    order = state.selectedDirection === 'asc' ? -1 : 1;

    switch (state.selectedType) {
      case 'Alphabetically':
        sortByName(sortedItems);
        break;

      case 'Completed':
        sortByCompleted(sortedItems);
        break;

      case 'Added to My Day':
        sortByMyDay(sortedItems);
        break;

      case 'Bookmarked':
        sortByImportance(sortedItems);
        break;

      case 'Due date':
        sortByDueDate(sortedItems);
        break;

      case 'Creation date':
        sortByCreationDate(sortedItems);
        break;

      case 'Priority':
        sortByPriority(sortedItems);
        break;

      default:
        break;
    }

    return sortedItems;
  };

  const setSelectedSortType = (type) => {
    state.selectedType = type;
  };

  const setSelectedDirection = (direction) => {
    state.selectedDirection = direction;
  };

  return {
    getSortedItems,
    setSelectedSortType,
    setSelectedDirection,
  };
};

export default todoSort;
