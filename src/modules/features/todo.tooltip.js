import DOMHelpers from '../helpers/DOMHelpers';

/**
 * You can use this class to activate 'tooltip' option inside the whole page
 * or any other element of your choice.
 * You will need add the attribute 'data-tooltip' to the chosen elements to activate the tooltip.
 * @param {Node} elem The node element where the tooltip will be active
 * (most cases it's the whole document)
 */
const tooltip = (elem) => {
  const { createElement, on, getElement, addClass } = DOMHelpers();

  const handleMouseOver = (e) => {
    const { target, relatedTarget } = e;
    const parentTooltip = target.closest('[data-tooltip]');
    let parentRelatedTooltip = null;

    if (relatedTarget) parentRelatedTooltip = relatedTarget.closest('[data-tooltip]');

    let text = null;

    if (parentTooltip) text = parentTooltip.dataset.tooltip;

    if (!text || parentTooltip === parentRelatedTooltip) return;

    const span = createElement('span');
    span.innerHTML = text;
    addClass(span, 'tooltip');
    document.body.append(span);
    // the tooltip must follow the element in case of window scroll
    span.style.cssText = `
      top: ${parentTooltip.getBoundingClientRect().bottom + 5}px;
      left: ${parentTooltip.getBoundingClientRect().left -
        span.offsetWidth / 2 +
        parentTooltip.clientWidth / 2}px;
    `;

    // Show tooltip above element if there is no space at the bottom of the window
    if (span.getBoundingClientRect().top + span.offsetHeight > document.body.offsetHeight) {
      span.style.top = `${parentTooltip.getBoundingClientRect().top -
        parentTooltip.offsetHeight -
        5}px`;
      addClass(span, 'top');
    }

    // Show tooltip left side element if there is no space at the right of the window
    if (span.getBoundingClientRect().right > document.body.offsetWidth) {
      span.style.right = `${document.body.offsetWidth -
        parentTooltip.getBoundingClientRect().right -
        5}px`;
      span.style.left = '';
      addClass(span, 'bottom-left');
    }
  };

  const handleMouseOut = (e) => {
    const { target, relatedTarget } = e;
    const parentTooltip = target.closest('[data-tooltip]');
    let parentRelatedTooltip = null;

    if (relatedTarget) parentRelatedTooltip = relatedTarget.closest('[data-tooltip]');

    /**
     * Prevent tooltip remove when hovering a child element,
     * and remove when leaving child directly outside parent
     */
    if (parentTooltip === parentRelatedTooltip) return;

    if (getElement('.tooltip')) getElement('.tooltip').remove();
  };

  on(elem, 'mouseover', handleMouseOver);
  on(elem, 'mouseout', handleMouseOut);
};

export default tooltip;
