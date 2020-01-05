import { todoView, DOMHelpers } from '../todo.view';

// Jest's JSDom doesn't support MutationObserver API. We create a mock to skip it.
global.MutationObserver = class {
  constructor(callback) {} // eslint-disable-line
  disconnect() {} // eslint-disable-line
  observe(element, initObject) {} // eslint-disable-line
};

// Mock audio. JSDom does not support HTML audio/video
window.HTMLMediaElement.prototype.play = () => {
  /* do nothing */
};
window.HTMLMediaElement.prototype.pause = () => {
  /* do nothing */
};

describe('\n => DOMHelpers', () => {
  const { createElement } = DOMHelpers();

  describe('\n   => createElement', () => {
    test('should create the element when tag is given', () => {
      const div = createElement('div');
      expect(div.tagName).toBe('DIV');
    });

    test('should create the element with an ID when tag and id are given', () => {
      const div = createElement('div', '#myID');
      expect(div.tagName).toBe('DIV');
      expect(div.id).toBe('myID');
    });

    test('should create the element with a Class when tag and class are given', () => {
      const div = createElement('div', '.myClass');
      expect(div.tagName).toBe('DIV');
      expect(div.classList.contains('myClass')).toBe(true);
    });
  });
});

describe('\n => todoView', () => {
  let view = null;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    view = todoView();
  });

  describe('\n   => displayList', () => {
    test('should add project to "ul" element', () => {
      view.displayList(1, 'My awesome project', []);

      expect(document.querySelector('.lists').childElementCount).toBe(1);
    });

    test('should display all projects when called', () => {
      view.displayList(1, 'project 1', []);
      view.displayList(2, 'project 2', []);
      view.displayList(3, 'project 3', []);

      expect(document.querySelector('.lists').childElementCount).toBe(3);
    });

    test('should display project data (name/todoCount) correctly when called', () => {
      view.displayList(1, 'Proj 1', []);

      expect(document.querySelector('.lists .project-name').innerHTML).toBe('Proj 1');
      expect(document.querySelector('.lists span.todo-count').innerHTML).toBe('0');
      expect(document.querySelector('.lists .list').dataset.index).toBe('1');
    });

    test('should add "selected" class to list when argument is true', () => {
      view.displayList(1, 'My awesome project', [], true);

      expect(document.querySelector('.lists .list').classList.contains('selected')).toBe(true);
    });
  });

  describe('\n   => displayTodos', () => {
    beforeEach(() => {
      view.displayList(1, 'default project', [], true);
    });

    test('should display nothing when there is no todo item', () => {
      view.displayTodos([]);

      expect(document.querySelector('.todo-list').childElementCount).toBe(0);
    });

    test('should add todo to list', () => {
      view.displayTodos([
        {
          id: 1,
          projectID: 1,
          title: 'awesome todo title',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
      ]);

      expect(document.querySelector('.todo-list').childElementCount).toBe(1);
    });

    test('should display all todos in the list when called', () => {
      const todos = [
        {
          id: 1,
          projectID: 1,
          title: 'Todo 1',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
        {
          id: 2,
          projectID: 1,
          title: 'Todo 2',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
        {
          id: 3,
          projectID: 1,
          title: 'Todo 3',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
      ];

      view.displayTodos(todos);

      expect(document.querySelector('.todo-list').childElementCount).toBe(3);
    });

    test('should display task data (title/complete/id) correctly when called', () => {
      view.displayTodos([
        {
          id: 1,
          projectID: 1,
          title: 'My awesome todo',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
      ]);

      expect(document.querySelector('.todo-list .todo-title').innerHTML).toBe('My awesome todo');
      expect(document.querySelector('.todo-list #todo-checkbox11').checked).toBe(true);
      expect(document.querySelector('.todo-list .todo-item').dataset.index).toBe('1');
      expect(document.querySelector('.todo-list .todo-item').classList.contains('low')).toBe(true);
    });

    test('should display only one list when called multiple times', () => {
      view.displayTodos([]);
      view.displayTodos([]);

      expect(document.querySelectorAll('.todo-list').length).toBe(1);
    });

    test('should replace old list with the new one when called again', () => {
      view.displayTodos([
        {
          id: 1,
          projectID: 1,
          title: 'My awesome todo',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
      ]);

      view.displayTodos([
        {
          id: 1,
          projectID: 1,
          title: 'My awesome todo',
          isComplete: true,
          priority: 'Low',
          getSubTasks: () => [],
        },
        {
          id: 2,
          projectID: 1,
          title: 'My second awesome todo',
          isComplete: false,
          priority: 'Low',
          getSubTasks: () => [],
        },
      ]);

      expect(document.querySelector('.todo-list').childElementCount).toBe(2);
    });
  });

  describe('\n   => toggleEditMode', () => {
    let parent = null;
    let displayElem = null;
    let editElem = null;
    const callback = () => null;

    beforeEach(() => {
      parent = document.createElement('div');
      displayElem = document.createElement('div');
      editElem = document.createElement('input');
      editElem.type = 'text';
      parent.append(displayElem);
      document.body.append(parent);
    });

    test('should switch the two elements when called', () => {
      view.toggleEditMode(displayElem, editElem, callback);

      expect(parent.contains(editElem)).toBe(true);
      expect(parent.contains(displayElem)).toBe(false);
    });
  });
});
