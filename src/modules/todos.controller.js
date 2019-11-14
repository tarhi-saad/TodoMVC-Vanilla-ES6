import todoApp from './todos';
import { todoView } from './todos.view';

const todoController = (() => {
  /**
   * A helper function: Display all projects
   * @param {Object} view The object view created by todoView factory
   */
  const displayLists = (view) => {
    todoApp.getProjects().forEach((project) => {
      const { id } = project;
      const name = project.getName();
      const items = project.getItems();

      view.displayList(id, name, items);
    });
  };

  // Instantiate todoView factory
  const view = todoView();

  /**
   * Initialize the todo app (display default data to the user)
   */
  const init = () => {
    const firstProject = todoApp.getProjects()[0];
    displayLists(view);
    view.displayTodos(firstProject.getItems());
  };

  return {
    init,
  };
})();

export default todoController;
