import DOMHelpers from '../../DOMHelpers';
import mouse from './mouse';
import touch from './touch';

const draggable = (todoApp, todoLocalStorage) => {
  const helpers = DOMHelpers();

  // Non-touch devices
  const handleMouseDown = mouse(todoApp, helpers, todoLocalStorage);
  // Touch devices
  const handleTouchStart = touch(todoApp, helpers, todoLocalStorage);

  helpers.on(document.body, 'mousedown', handleMouseDown);
  helpers.on(document.body, 'touchstart', handleTouchStart);
};

export default draggable;
