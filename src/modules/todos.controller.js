import todoApp from './todos';
import { todoView } from './todos.view';

const todoController = (() => {
  /**
   * A helper function: Display all projects
   * @param {Object} view The object view created by todoView factory
   */
  const displayLists = (view) => {
    view.empty(view.elements.lists);
    todoApp.getProjects().forEach((project, index) => {
      const { id } = project;
      const name = project.getName();
      const items = project.getItems();

      view.displayList(id, name, items);

      if (index === todoApp.getSelected()) view.displayTodos(items);
    });
  };

  // Instantiate todoView factory
  let view = null;

  const handleAddTodo = (e) => {
    e.preventDefault();
    const todoTitle = view.elements.newTodoInput.value;

    if (!todoTitle) return;

    view.elements.newTodoInput.value = '';
    const selectedProject = todoApp.getProjects()[todoApp.getSelected()];
    selectedProject.addTodo(todoTitle);
    view.displayTodos(selectedProject.getItems());
  };

  const handleDeleteTodo = (e) => {
    const { target } = e;

    if (!target.closest('.delete-btn')) return;

    const todoID = target.closest('.todo-item').dataset.index;
    const selectedProject = todoApp.getProjects()[todoApp.getSelected()];
    selectedProject.removeTodo(todoID);
    view.displayTodos(selectedProject.getItems());
  };

  const handleToggleTodo = (e) => {
    const { target } = e;
    const todoID = Number(target.closest('.todo-item').dataset.index);

    if (!target.closest(`#todo-checkbox${todoID}`)) return;

    const selectedProject = todoApp.getProjects()[todoApp.getSelected()];
    selectedProject.toggleTodo(todoID);
    view.displayTodos(selectedProject.getItems());
  };

  const handleAddList = (e) => {
    e.preventDefault();
    const listTitle = view.elements.newListInput.value;

    if (!listTitle) return;

    view.elements.newListInput.value = '';
    todoApp.addProject(listTitle);
    const index = todoApp.getProjects().length - 1;
    todoApp.setSelected(index);
    displayLists(view);
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
  };

  return {
    init,
  };
})();

export default todoController;
