import { todoView, DOMHelpers } from '../todos.view';

describe('DOMHelpers', () => {
  const { createElement } = DOMHelpers();

  describe('createElement', () => {
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

describe('todoView', () => {
  let view = null;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    view = todoView();
  });

  describe('displayList', () => {
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

      expect(document.querySelector('.lists span').innerHTML).toBe('Proj 1');
      expect(document.querySelector('.lists span.todo-count').innerHTML).toBe(
        '0',
      );
      expect(document.querySelector('.lists .list').dataset.index).toBe('1');
    });
  });

  describe('displayTodos', () => {
    test('should display nothing when there is no todo item', () => {
      view.displayTodos([]);

      expect(document.querySelector('.todo-list').childElementCount).toBe(0);
    });

    test('should add todo to list', () => {
      view.displayTodos([
        { id: 1, title: 'awesome todo title', isComplete: true },
      ]);

      expect(document.querySelector('.todo-list').childElementCount).toBe(1);
    });

    test('should display all todos in the list when called', () => {
      const todos = [
        { id: 1, title: 'Todo 1', isComplete: true },
        { id: 2, title: 'Todo 2', isComplete: true },
        { id: 3, title: 'Todo 3', isComplete: true },
      ];
      view.displayTodos(todos);

      expect(document.querySelector('.todo-list').childElementCount).toBe(3);
    });

    test('should display task data (title/complete/id) correctly when called', () => {
      view.displayTodos([
        { id: 1, title: 'My awesome todo', isComplete: true },
      ]);

      expect(document.querySelector('.todo-list .todo-title').innerHTML).toBe(
        'My awesome todo',
      );
      expect(document.querySelector('.todo-list #todo-checkbox1').checked).toBe(
        true,
      );
      expect(
        document.querySelector('.todo-list .todo-item').dataset.index,
      ).toBe('1');
    });
  });
});
