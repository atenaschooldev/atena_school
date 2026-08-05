// Utility to prevent React crashes caused by browser translation extensions (e.g. Google Translate)
// Google Translate replaces DOM text nodes with <font> tags, breaking React's internal DOM references.

export function applyGoogleTranslateDomPatch() {
  if (typeof window === 'undefined' || typeof Node === 'undefined' || !Node.prototype) {
    return;
  }

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (process.env.NODE_ENV !== 'production' && console && console.warn) {
        console.warn('Translation extension patch: prevented removeChild parent mismatch crash.');
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (process.env.NODE_ENV !== 'production' && console && console.warn) {
        console.warn('Translation extension patch: prevented insertBefore parent mismatch crash.');
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
