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
      const isSelected = index === todoApp.getSelected();

      view.displayList(id, name, items, isSelected);

      if (isSelected) view.displayTodos(items);
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

  const handleSwitchList = (e) => {
    const { target } = e;
    const list = target.closest('.list');
    const lists = target.closest('.lists').querySelectorAll('.list');
    const selectedList = lists[todoApp.getSelected()];

    if (!list || list === selectedList) return;

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

    if (!target.closest('.delete-btn')) return;

    const listID = Number(target.closest('.list').dataset.index);
    todoApp.removeProject(listID);

    if (target.closest('.selected')) {
      Array.from(view.elements.lists.querySelectorAll('.list')).some(
        (list, index) => {
          if (list === target.closest('.selected')) {
            index > 0 ? todoApp.setSelected(index - 1) : todoApp.setSelected(0);
            return true;
          }

          return false;
        },
      );
    }
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
    view.bindSwitchList(handleSwitchList);
    view.bindDeleteList(handleDeleteList);
  };

  return {
    init,
  };
})();

export default todoController;
