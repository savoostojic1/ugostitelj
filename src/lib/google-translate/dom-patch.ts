/**
 * Google Translate (and similar page translators) wrap text nodes in <font>
 * elements. React then fails with removeChild / insertBefore NotFoundError
 * when it tries to update those relocated text nodes.
 *
 * This patch is the industry-standard safety net used alongside wrapping
 * dynamic text in element nodes so React owns a stable parent.
 */

type PatchedNodePrototype = typeof Node.prototype & {
  __hostviaGoogleTranslatePatched?: boolean;
};

export function installGoogleTranslateDomPatch(): void {
  if (typeof Node === "undefined") return;

  const proto = Node.prototype as PatchedNodePrototype;
  if (proto.__hostviaGoogleTranslatePatched) return;
  proto.__hostviaGoogleTranslatePatched = true;

  const originalRemoveChild = proto.removeChild;
  proto.removeChild = function removeChildPatched<T extends Node>(
    child: T
  ): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = proto.insertBefore;
  proto.insertBefore = function insertBeforePatched<T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export function isGoogleTranslateDomPatchInstalled(): boolean {
  if (typeof Node === "undefined") return false;
  return Boolean(
    (Node.prototype as PatchedNodePrototype).__hostviaGoogleTranslatePatched
  );
}
