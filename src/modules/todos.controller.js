import todoApp from './todos';
import { todoView } from './todos.view';

const todoController = (() => {
  /**
   * A helper function: Display all projects
   * @param {Object} view The object view created by todoView factory
   */
  const displayLists = (view) => {
    const projects = todoApp.getProjects();
    const { lists } = view.elements;
    view.empty(lists);
    projects.forEach((project, index) => {
      const { id } = project;
      const name = project.getName();
      const items = project.getItems();
      const isSelected = index === todoApp.getSelected();

      view.displayList(id, name, items, isSelected);

      if (isSelected) view.displayTodos(items);
    });

    // Add "pinned" class when we get one list to style it in CSS and trigger a visual disable mode
    projects.length === 1
      ? lists.firstChild.classList.add('pinned')
      : lists.firstChild.classList.remove('pinned');
  };

  // Instantiate todoView factory
  let view = null;

  const handleAddTodo = (e) => {
    e.preventDefault();
    const todoTitle = view.elements.newTodoInput.value;

    if (!todoTitle) return;

    view.elements.newTodoInput.value = '';
    const selectedProject = todoApp.getSelectedProject();
    selectedProject.addTodo(todoTitle);
    const todoItems = selectedProject.getItems();
    view.addTodo(todoItems[todoItems.length - 1]);

    // Scroll to bottom of the todo list, only when adding a new item
    const { todoList } = view.elements;
    todoList.scrollTop = todoList.scrollHeight;
  };

  const handleDeleteTodo = (e) => {
    const { target } = e;

    if (!target.closest('.delete-btn')) return;

    const removeTodo = () => {
      const todoID = Number(target.closest('.todo-item').dataset.index);
      const selectedProject = todoApp.getSelectedProject();
      selectedProject.removeTodo(todoID);
      view.removeTodo(todoID);
    };

    // Confirm deletion of incomplete task
    if (!target.closest('.completed')) {
      const name = target.closest('.todo-item').querySelector('.todo-title')
        .textContent;
      const msg = `
        You didn't complete this task!<br>
        Delete <span class="name">"${name}"</span> anyway?
      `;
      view.confirmRemoval(removeTodo, msg);
      return;
    }

    removeTodo();
  };

  const handleToggleTodo = (e) => {
    const { target } = e;
    const todoID = Number(target.closest('.todo-item').dataset.index);

    if (target.id !== `todo-checkbox${todoID}`) return;

    const selectedProject = todoApp.getSelectedProject();
    selectedProject.toggleTodo(todoID);
    view.toggleTodo(selectedProject.getItemByID(todoID).isComplete, target.id);
  };

  const handleAddList = (e) => {
    e.preventDefault();
    const listTitle = view.elements.newListInput.value;

    if (!listTitle) return;

    view.elements.newListInput.value = '';
    todoApp.addProject(listTitle);
    const index = todoApp.getProjects().length - 1;
    todoApp.setSelected(index);
    const project = todoApp.getProjects()[index];
    const { id } = project;
    const name = project.getName();
    const items = project.getItems();
    view.displayList(id, name, items, true);
    view.displayTodos(items);

    // Hide "Add" button After submit
    view.hideElement(view.elements.newListSubmit);

    // Scroll to bottom of the list of projects, only when adding a new list
    const { lists } = view.elements;
    lists.scrollTop = lists.scrollHeight;
  };

  const handleSwitchList = (e) => {
    const { target } = e;
    const list = target.closest('.list');
    const lists = target.closest('.lists').querySelectorAll('.list');
    const selectedList = lists[todoApp.getSelected()];

    if (
      list === selectedList ||
      !list ||
      target.classList.contains('delete-btn')
    ) {
      return;
    }

    let projectIndex = null;
    Array.from(lists).some((li, index) => {
      projectIndex = index;
      return li === list;
    });
    selectedList.classList.remove('selected');
    todoApp.setSelected(projectIndex);
    list.classList.add('selected');
    view.displayTodos(todoApp.getProjects()[projectIndex].getItems());
  };

  const handleDeleteList = (e) => {
    const { target } = e;
    const lists = view.elements.lists.children;

    if (!target.closest('.delete-btn') || lists.length === 1) return;

    const listID = Number(target.closest('.list').dataset.index);

    const removeList = () => {
      todoApp.removeProject(listID);
      // Get the index of the selected list
      const listIndex = Array.from(lists).indexOf(
        view.elements.lists.querySelector('.selected'),
      );

      // transfer selected class and selected project when deleting list
      if (target.closest('.selected')) {
        if (listIndex !== -1) {
          if (listIndex > 0) {
            todoApp.setSelected(listIndex - 1);
            lists[listIndex - 1].classList.add('selected');
          } else if (listIndex === 0) {
            todoApp.setSelected(0);
            lists[1].classList.add('selected');
          }

          // Update todo view
          view.displayTodos(todoApp.getSelectedProject().getItems());
        }
      }

      view.removeProject(listID);
      // Get the new selected list after deletion
      const listIndexUpdate = Array.from(lists).indexOf(
        view.elements.lists.querySelector('.selected'),
      );

      // If the value did change, let's update it in the model
      if (listIndex !== listIndexUpdate) todoApp.setSelected(listIndexUpdate);
    };

    // Confirm removal if list is not empty
    const todoCount = Number(
      target.closest('.list').querySelector('.todo-count').textContent,
    );
    const isAllTasksComplete = !todoApp
      .getProjectByID(listID)
      .getItems()
      .some((todo) => !todo.isComplete);

    if (todoCount > 0 && !isAllTasksComplete) {
      const name = target.closest('.list').querySelector('.project-name')
        .textContent;
      const msg = `
        This list still contains some tasks to do!<br>
        Delete <span class="name">"${name}"</span> anyway?
      `;
      view.confirmRemoval(removeList, msg);
      return;
    }

    removeList();
  };

  const handleEditTasksTitle = (e) => {
    const { target } = e;

    const updateProject = (value) => {
      todoApp.getSelectedProject().setName(value);
      view.elements.lists.querySelector(
        'li.selected .project-name',
      ).textContent = value;
    };

    const args = [target, view.elements.tasksTitleInput, updateProject];
    view.toggleEditMode(...args);
  };

  const handleSwitchTodo = (e) => {
    const { target } = e;
    const selectedTodo = document.querySelector('.todo-list .selected');
    const todoItem = target.closest('.todo-item');

    if (
      todoItem === selectedTodo ||
      (target.tagName !== 'LI' && !target.closest('.title-block'))
    ) {
      return;
    }

    const id = Number(target.closest('.todo-item').dataset.index);
    const todo = todoApp.getSelectedProject().getItemByID(id);
    view.displayDetails(todo);
  };

  /**
   * Initialize the todo app (display default data to the user)
   */
  const init = () => {
    view = todoView();
    displayLists(view);
    view.bindAddTodo(handleAddTodo);
    view.bindDeleteTodo(handleDeleteTodo);
    view.bindToggleTodo(handleToggleTodo);
    view.bindAddList(handleAddList);
    view.bindSwitchList(handleSwitchList);
    view.bindDeleteList(handleDeleteList);
    view.bindEditTasksTitle(handleEditTasksTitle);
    view.bindSwitchTodo(handleSwitchTodo);
  };

  return {
    init,
  };
})();

export default todoController;
