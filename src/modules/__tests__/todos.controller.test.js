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

    describe('\n      => Lists', () => {
      describe('\n       => bindAddleTodo', () => {
        test('should add a project when called', () => {
          document.querySelector('#newList').value = 'My project';
          document.querySelector('.lists-menu .submit-btn').click();
          expect(document.querySelector('.lists').childElementCount).toBe(2);
        });

        test('should not add a project when title is an empty string', () => {
          document.querySelector('#newList').value = '';
          document.querySelector('.lists-menu .submit-btn').click();
          expect(document.querySelector('.lists').childElementCount).toBe(2);
        });
      });

      describe('\n       => bindSwitchList', () => {
        test('should switch list when clicked', () => {
          document.querySelector('#newList').value = 'My project2';
          document.querySelector('.lists-menu .submit-btn').click();
          document.querySelector('.lists .list').click();

          expect(
            document
              .querySelector('.lists .list:last-child')
              .classList.contains('selected'),
          ).toBe(false);
          expect(
            document
              .querySelector('.lists .list')
              .classList.contains('selected'),
          ).toBe(true);
        });
      });
    });
  });
});
