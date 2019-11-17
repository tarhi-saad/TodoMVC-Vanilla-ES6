import todoController from '../todos.controller';

describe('\n => todoController', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    todoController.init();
  });

  describe('\n   => init', () => {
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

    describe('\n     => bindAddTodo', () => {
      test('should display an empty todo list when input is empty', () => {
        document.querySelector('.tasks-view .submit-btn').click();
        expect(document.querySelector('.todo-list').childElementCount).toBe(0);
      });
    });

    describe('\n     => bindDeleteTodo', () => {
      test('should delete todo when button is clicked', () => {
        document.querySelector('#newTodo').value = 'simple task';
        document.querySelector('.tasks-view .submit-btn').click();
        document.querySelector('.delete-btn').click();
        expect(document.querySelector('.todo-list').childElementCount).toBe(0);
      });

      test('should delete the right todo when its button is clicked', () => {
        document.querySelector('#newTodo').value = 'simple task 1';
        document.querySelector('.tasks-view .submit-btn').click();
        document.querySelector('#newTodo').value = 'simple task 2';
        document.querySelector('.tasks-view .submit-btn').click();
        document.querySelector('#newTodo').value = 'simple task 3';
        document.querySelector('.tasks-view .submit-btn').click();
        document.querySelector('ul li:nth-child(2) .delete-btn').click();
        expect(document.querySelector('.todo-item[data-index="2"]')).toBeNull();
      });
    });

    describe('\n     => bindToggleTodo', () => {
      test('should display an empty todo list when input is empty', () => {
        document.querySelector('#newTodo').value = 'simple task 1';
        document.querySelector('.tasks-view .submit-btn').click();
        document.querySelector('#todo-checkbox1').click();
        expect(document.querySelector('#todo-checkbox1').checked).toBe(true);
        document.querySelector('#todo-checkbox1').click();
        expect(document.querySelector('#todo-checkbox1').checked).toBe(false);
      });
    });
  });
});
