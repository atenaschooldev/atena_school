/**
 * Lightweight in-place DOM morphing utility for flicker-free iframe live previews.
 * Updates target DOM node to match source DOM node with surgical granularity:
 * - Mutates only changed text nodes (preserves input focus, layout, and scroll stability)
 * - Updates only changed attributes (preserves image rendering state without re-fetching/blinking)
 * - Reorders / appends / removes only changed elements
 */
export function morphDom(target: Node, source: Node): void {
  // 1. If nodes are of different types or tag names, replace target
  if (target.nodeType !== source.nodeType || (target as Element).tagName !== (source as Element).tagName) {
    target.parentNode?.replaceChild(source.cloneNode(true), target);
    return;
  }

  // 2. Text or Comment nodes: update text directly without touching parent DOM
  if (target.nodeType === Node.TEXT_NODE || target.nodeType === Node.COMMENT_NODE) {
    if (target.nodeValue !== source.nodeValue) {
      target.nodeValue = source.nodeValue;
    }
    return;
  }

  // 3. Element nodes
  if (target.nodeType === Node.ELEMENT_NODE) {
    const targetEl = target as HTMLElement;
    const sourceEl = source as HTMLElement;

    // Synchronize attributes
    const targetAttrs = targetEl.attributes;
    const sourceAttrs = sourceEl.attributes;

    // Remove attributes from target that do not exist in source
    for (let i = targetAttrs.length - 1; i >= 0; i--) {
      const attrName = targetAttrs[i].name;
      if (!sourceEl.hasAttribute(attrName)) {
        targetEl.removeAttribute(attrName);
      }
    }

    // Set / update attributes from source
    for (let i = 0; i < sourceAttrs.length; i++) {
      const attrName = sourceAttrs[i].name;
      const attrValue = sourceAttrs[i].value;
      if (targetEl.getAttribute(attrName) !== attrValue) {
        targetEl.setAttribute(attrName, attrValue);
      }
    }

    // Synchronize children
    const targetChildren = Array.from(targetEl.childNodes);
    const sourceChildren = Array.from(sourceEl.childNodes);

    const maxLen = Math.max(targetChildren.length, sourceChildren.length);

    for (let i = 0; i < maxLen; i++) {
      const targetChild = targetChildren[i];
      const sourceChild = sourceChildren[i];

      if (!targetChild && sourceChild) {
        // Append new child
        targetEl.appendChild(sourceChild.cloneNode(true));
      } else if (targetChild && !sourceChild) {
        // Remove surplus child
        targetEl.removeChild(targetChild);
      } else if (targetChild && sourceChild) {
        // Morph matching child
        morphDom(targetChild, sourceChild);
      }
    }
  }
}
