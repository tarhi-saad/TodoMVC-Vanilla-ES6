const DOMHelpers = () => {
  const createElement = (tag, idClass) => {
    let elem = null;
    elem = document.createElement(tag);

    if (idClass) {
      switch (idClass.charAt(0)) {
        case '#':
          elem.id = idClass.slice(1);
          break;
        case '.':
          elem.classList.add(idClass.slice(1));
          break;
        default:
      }
    }

    return elem;
  };

  const on = (target, type, callback, options) => target.addEventListener(type, callback, options);

  const off = (target, type, callback) => target.removeEventListener(type, callback);

  const empty = (parentNode) => {
    while (parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }
  };

  const getElement = (selector) => document.querySelector(selector);

  const getElements = (selector) => document.querySelectorAll(selector);

  const wrap = (elem, className, parentElem = 'div') => {
    const wrapper = document.createElement(parentElem);
    wrapper.append(elem);

    if (className) wrapper.classList.add(className);

    return wrapper;
  };

  const unselect = (ul) => {
    Array.from(ul.children).some((li) => {
      if (li.classList.contains('selected')) {
        li.classList.remove('selected');
        return true;
      }

      return false;
    });
  };

  const addClass = (elem, ...className) => elem.classList.add(...className);

  const removeClass = (elem, ...className) => elem.classList.remove(...className);

  const toggleClass = (elem, className) => elem.classList.toggle(className);

  const hideElement = (elem) => {
    addClass(elem, 'hide');
  };

  const showElement = (elem) => {
    removeClass(elem, 'hide');
  };

  // Helper function to change priority class (low, medium & high)
  const resetClassList = (elem, classList) => {
    Array.from(elem.classList).forEach((className) => {
      if (classList.includes(className)) removeClass(elem, className);
    });
  };

  // CSS values to Number
  const getNumberFromString = (value) => Number(value.match(/[0-9]/g).join(''));

  // Disable transition of list and its children
  const disableTransition = (list) => {
    list.style.transition = 'none';

    Array.from(list.children).forEach((item) => {
      item.style.transition = 'box-shadow .25s ease-out, border-color .15s linear';
    });
  };
  // Enable transition of list and its children
  const enableTransition = (list) => {
    list.style.transition = '';

    Array.from(list.children).forEach((item) => {
      item.style.transition = '';
    });
  };
  // Toggle transition of list and its children
  const toggleTransition = (list) => {
    list.style.transition ? enableTransition(list) : disableTransition(list);
  };

  // Swap two siblings without removing one of them (why isn't this built-in yet?!)
  const swapElements = (elem1, elem2) => {
    const { parentElement } = elem1;
    const { children } = parentElement;
    const indexElem1 = Array.from(children).indexOf(elem1);
    const indexElem2 = Array.from(children).indexOf(elem2);

    if (indexElem1 < indexElem2) {
      indexElem1 ? elem1.before(elem2) : elem1.after(elem2);

      indexElem2 ? children[indexElem2].after(elem1) : children[indexElem2].before(elem1);
    } else if (indexElem1 > indexElem2) {
      indexElem2 ? elem2.before(elem1) : elem2.after(elem1);

      indexElem1 ? children[indexElem1].after(elem2) : children[indexElem1].before(elem2);
    }
  };

  return {
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
  };
};

export default DOMHelpers;
