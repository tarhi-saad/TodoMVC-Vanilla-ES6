import todoApp from '../todos';

describe('\n => The todoApp instance', () => {
  let list = null;

  beforeEach(() => {
    todoApp.getProjects().splice(0);
  });

  describe('\n   => The todoStore instance', () => {
    beforeEach(() => {
      todoApp.addProject('list 1');
      [list] = todoApp.getProjects();
    });

    describe('\n     => addTodo', () => {
      test('should add a todo object with the given title when called', () => {
        list.addTodo('saad');
        expect(list.getItems()[0].title).toBe('saad');
      });

      test('should add a todo object with the given title and all the default values when called', () => {
        list.addTodo('test');
        const [
          {
            description,
            date,
            note,
            priority,
            getSubTasks,
            addSubTask,
            editSubTaskName,
            removeSubTask,
            toggleSubTask,
          },
        ] = list.getItems();
        expect(list.getItems()).toEqual([
          {
            description,
            date,
            id: 1,
            isComplete: false,
            note,
            priority,
            title: 'test',
            getSubTasks,
            addSubTask,
            editSubTaskName,
            removeSubTask,
            toggleSubTask,
          },
        ]);
      });

      test('should not add a todo when no title is given', () => {
        list.addTodo();
        expect(list.getItems().length).toBe(0);
      });
    });

    describe('\n     => removeTodo', () => {
      test('should remove a todo object from the store when an existing id is given', () => {
        list.addTodo('saad');
        list.addTodo('brahim');
        list.addTodo('ahmed');
        list.removeTodo(2);
        const item = list.getItems().find((todo) => todo.id === 2);
        expect(item).toBeUndefined();
      });

      test('should not alter the todoStore when a non-existing id is given', () => {
        list.addTodo('saad');
        const [
          {
            description,
            date,
            note,
            id,
            isComplete,
            title,
            priority,
            getSubTasks,
            addSubTask,
            editSubTaskName,
            removeSubTask,
            toggleSubTask,
          },
        ] = list.getItems();
        list.removeTodo(0);
        expect(list.getItems()).toEqual([
          {
            description,
            date,
            note,
            id,
            isComplete,
            title,
            priority,
            getSubTasks,
            addSubTask,
            editSubTaskName,
            removeSubTask,
            toggleSubTask,
          },
        ]);
      });
    });

    describe('\n     => toggleTodo', () => {
      test('should set complete to true to the item when its id is given', () => {
        list.addTodo('saad');
        const { isComplete } = list.getItems()[0];
        list.toggleTodo(1);
        expect(list.getItems()[0].isComplete).toBe(!isComplete);
      });

      test('should note change other values of the item when called', () => {
        list.addTodo('some other todo');
        const {
          description,
          date,
          note,
          id,
          isComplete,
          title,
          priority,
          getSubTasks,
          addSubTask,
          editSubTaskName,
          removeSubTask,
          toggleSubTask,
        } = list.getItems()[0];
        list.toggleTodo(1);
        expect(list.getItems()[0]).toEqual({
          description,
          date,
          note,
          id,
          isComplete: !isComplete,
          title,
          priority,
          getSubTasks,
          addSubTask,
          editSubTaskName,
          removeSubTask,
          toggleSubTask,
        });
      });

      test('should note change other items values when called', () => {
        list.addTodo('task 1');
        list.addTodo('task 2');
        list.addTodo('task 3');
        const [
          {
            description: description1,
            date: date1,
            id: id1,
            isComplete: isComplete1,
            note: note1,
            priority: priority1,
            title: title1,
            getSubTasks: getSubTasks1,
            addSubTask: addSubTask1,
            editSubTaskName: editSubTaskName1,
            removeSubTask: removeSubTask1,
            toggleSubTask: toggleSubTask1,
          },
          {
            description: description2,
            date: date2,
            id: id2,
            isComplete: isComplete2,
            note: note2,
            priority: priority2,
            title: title2,
            getSubTasks: getSubTasks2,
            addSubTask: addSubTask2,
            editSubTaskName: editSubTaskName2,
            removeSubTask: removeSubTask2,
            toggleSubTask: toggleSubTask2,
          },
          {
            description: description3,
            date: date3,
            id: id3,
            isComplete: isComplete3,
            note: note3,
            priority: priority3,
            title: title3,
            getSubTasks: getSubTasks3,
            addSubTask: addSubTask3,
            editSubTaskName: editSubTaskName3,
            removeSubTask: removeSubTask3,
            toggleSubTask: toggleSubTask3,
          },
        ] = list.getItems();
        list.toggleTodo(2);

        expect(list.getItems()).toEqual([
          {
            description: description1,
            date: date1,
            id: id1,
            isComplete: isComplete1,
            note: note1,
            priority: priority1,
            title: title1,
            getSubTasks: getSubTasks1,
            addSubTask: addSubTask1,
            editSubTaskName: editSubTaskName1,
            removeSubTask: removeSubTask1,
            toggleSubTask: toggleSubTask1,
          },
          {
            description: description2,
            date: date2,
            id: id2,
            isComplete: !isComplete2,
            note: note2,
            priority: priority2,
            title: title2,
            getSubTasks: getSubTasks2,
            addSubTask: addSubTask2,
            editSubTaskName: editSubTaskName2,
            removeSubTask: removeSubTask2,
            toggleSubTask: toggleSubTask2,
          },
          {
            description: description3,
            date: date3,
            id: id3,
            isComplete: isComplete3,
            note: note3,
            priority: priority3,
            title: title3,
            getSubTasks: getSubTasks3,
            addSubTask: addSubTask3,
            editSubTaskName: editSubTaskName3,
            removeSubTask: removeSubTask3,
            toggleSubTask: toggleSubTask3,
          },
        ]);
      });
    });

    describe('\n     => updateTodoTitle', () => {
      test('should change the title of the todo item to the new one when called', () => {
        list.addTodo('My awesome title');
        list.updateTodoTitle(1, "It's not that awesome");

        expect(list.getItems()[0].title).toBe("It's not that awesome");
      });

      test('should not change the title when the given new title is null/empty', () => {
        list.addTodo('My awesome title');
        list.updateTodoTitle(1, '');

        expect(list.getItems()[0].title).toBe('My awesome title');
      });

      test("should change the title of only the chosen one when it's id is given", () => {
        list.addTodo('title 1');
        list.addTodo('title 2');
        list.addTodo('title 3');
        list.updateTodoTitle(2, 'title 2 is updated');

        expect(
          `${list.getItems()[0].title}, ${list.getItems()[1].title}, ${
            list.getItems()[2].title
          }`,
        ).toBe('title 1, title 2 is updated, title 3');
      });
    });
  });

  describe('\n   => addProject', () => {
    test('should add a project when a name is given', () => {
      todoApp.addProject('project 1');

      expect(todoApp.getProjects()[0].getName()).toBe('project 1');
    });

    test("should add projects with distinct ID's when a name is given", () => {
      todoApp.addProject('project 1');
      todoApp.addProject('project 2');
      todoApp.addProject('project 3');

      expect(todoApp.getProjects()[0].id).toBe(1);
      expect(todoApp.getProjects()[1].id).toBe(2);
      expect(todoApp.getProjects()[2].id).toBe(3);
    });
  });

  describe('\n   => removeProject', () => {
    test('should remove project when its id is given', () => {
      todoApp.addProject('project 1');
      todoApp.addProject('project 2');
      todoApp.removeProject(2);

      expect(todoApp.getProjects().length).toBe(1);
    });

    test('should not remove project when id is not given or wrong', () => {
      todoApp.addProject('project 1');
      todoApp.removeProject();
      todoApp.removeProject(4);

      expect(todoApp.getProjects()[0]).toBeDefined();
    });

    test('should remove only one project when its id is given', () => {
      todoApp.addProject('project 1');
      todoApp.addProject('project 2');
      todoApp.addProject('project 3');
      todoApp.removeProject(2);

      expect(todoApp.getProjects().length).toBe(2);
      expect(todoApp.getProjects()[0].id).toBe(1);
      expect(todoApp.getProjects()[1].id).toBe(3);
    });

    test('should not remove the last list when called', () => {
      todoApp.addProject('project 1');
      todoApp.removeProject(1);

      expect(todoApp.getProjects()[0].id).toBe(1);
    });
  });
});
