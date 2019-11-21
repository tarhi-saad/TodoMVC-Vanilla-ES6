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
  };

  const handleDeleteTodo = (e) => {
    const { target } = e;

    if (!target.classList.contains('delete-btn')) return;

    const todoID = Number(target.closest('.todo-item').dataset.index);
    const selectedProject = todoApp.getSelectedProject();
    selectedProject.removeTodo(todoID);
    view.removeTodo(todoID);
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
  };

  const handleSwitchList = (e) => {
    const { target } = e;
    const list = target.closest('.list');
    const lists = target.closest('.lists').querySelectorAll('.list');
    const selectedList = lists[todoApp.getSelected()];

    if (
      list === selectedList ||
      (target.tagName !== 'LI' && !target.classList.contains('project-name'))
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
    todoApp.removeProject(listID);

    if (target.closest('.selected')) {
      Array.from(lists).some((list, index) => {
        if (list === target.closest('.selected')) {
          index > 0 ? todoApp.setSelected(index - 1) : todoApp.setSelected(0);
          return true;
        }

        return false;
      });
    }
    displayLists(view);
  };

  const handleEditTasksTitle = (e) => {
    const { target } = e;

    const updateProject = (value) => {
      todoApp.getSelectedProject().setName(value);
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
      (target.tagName !== 'LI' && !target.classList.contains('todo-title'))
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
