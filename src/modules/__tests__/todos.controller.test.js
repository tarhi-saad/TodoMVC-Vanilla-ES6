import todoController from '../todos.controller';

describe('todoController', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    todoController.init();
  });

  describe('init', () => {
    test('should display one project', () => {
      expect(document.querySelector('.lists').childElementCount).toBe(1);
    });

    test('should display the default project', () => {
      expect(document.querySelector('.lists .project-name').innerHTML).toBe(
        'tasks',
      );
    });

    test('should display an empty todo list', () => {
      expect(document.querySelector('.todo-list').childElementCount).toBe(0);
    });
  });
});
