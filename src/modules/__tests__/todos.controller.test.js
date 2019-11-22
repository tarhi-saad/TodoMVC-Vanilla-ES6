import todoController from '../todos.controller';

const addList = (title) => {
  document.querySelector('#newList').value = title;
  document.querySelector('.lists-menu .submit-btn').click();
};

describe('\n => todoController', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    todoController.init();

    const empty = (parentNode) => {
      while (parentNode.children[1]) {
        parentNode.children[1].querySelector('.delete-btn').click();
      }
    };

    empty(document.querySelector('.lists'));
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
        document.querySelector('.tasks-view .delete-btn').click();
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
      describe('\n       => bindAddList', () => {
        test('should add a project when called', () => {
          document.querySelector('#newList').value = 'My project';
          document.querySelector('.lists-menu .submit-btn').click();
          expect(document.querySelector('.lists').childElementCount).toBe(2);
        });

        test('should not add a project when title is an empty string', () => {
          document.querySelector('#newList').value = '';
          document.querySelector('.lists-menu .submit-btn').click();
          expect(document.querySelector('.lists').childElementCount).toBe(1);
        });
      });

      describe('\n       => bindSwitchList', () => {
        test.skip('should switch list when clicked', () => {
          addList('My project 1');
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

      describe('\n       => bindDeleteList', () => {
        test('should remove project when remove button is clicked', () => {
          addList('My project 2');
          const listCount = document.querySelectorAll('.lists .list').length;
          document.querySelectorAll('.lists .delete-btn')[1].click();

          expect(document.querySelectorAll('.lists .list').length).toBe(
            listCount - 1,
          );
        });

        test('should transfer "selected" class to its upper sibling when deleted', () => {
          addList('My project 2');
          document.querySelectorAll('.lists .list')[1].click();
          document.querySelectorAll('.lists .delete-btn')[1].click();

          expect(
            document
              .querySelectorAll('.lists .list')[0]
              .classList.contains('selected'),
          ).toBe(true);
        });

        test('should transfer "selected" class to its lower sibling when deleted list is first', () => {
          addList('My project 2');
          addList('My project 3');
          addList('My project 4');
          document.querySelectorAll('.lists .list')[0].click();
          document.querySelectorAll('.lists .delete-btn')[0].click();

          expect(
            document
              .querySelectorAll('.lists .list')[0]
              .classList.contains('selected'),
          ).toBe(true);
        });
      });
    });
  });
});
