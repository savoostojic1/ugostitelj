import assert from "node:assert/strict";
import test from "node:test";

test("installGoogleTranslateDomPatch is idempotent and guards mismatched parents", async () => {
  class FakeNode {
    parentNode: FakeNode | null = null;
    children: FakeNode[] = [];

    appendChild(child: FakeNode) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    }

    removeChild(child: FakeNode) {
      const index = this.children.indexOf(child);
      if (index === -1 || child.parentNode !== this) {
        throw new Error("NotFoundError: node to be removed is not a child");
      }
      this.children.splice(index, 1);
      child.parentNode = null;
      return child;
    }

    insertBefore(newNode: FakeNode, referenceNode: FakeNode | null) {
      if (referenceNode && referenceNode.parentNode !== this) {
        throw new Error(
          "NotFoundError: node before which the new node is to be inserted is not a child"
        );
      }
      newNode.parentNode = this;
      if (!referenceNode) {
        this.children.push(newNode);
        return newNode;
      }
      const index = this.children.indexOf(referenceNode);
      this.children.splice(index, 0, newNode);
      return newNode;
    }
  }

  const globalAny = globalThis as Record<string, unknown>;
  const previousNode = globalAny.Node;
  globalAny.Node = { prototype: FakeNode.prototype };

  try {
    const {
      installGoogleTranslateDomPatch,
      isGoogleTranslateDomPatchInstalled,
    } = await import("@/lib/google-translate/dom-patch");

    installGoogleTranslateDomPatch();
    installGoogleTranslateDomPatch();
    assert.equal(isGoogleTranslateDomPatchInstalled(), true);

    const parent = new FakeNode();
    const icon = new FakeNode();
    const text = new FakeNode();
    parent.appendChild(icon);
    parent.appendChild(text);

    // Simulate Google Translate relocating the text node under <font>.
    const font = new FakeNode();
    parent.removeChild(text);
    parent.appendChild(font);
    font.appendChild(text);

    assert.equal(text.parentNode, font);
    assert.doesNotThrow(() => {
      parent.removeChild(text);
    });
    assert.equal(text.parentNode, font);

    const next = new FakeNode();
    assert.doesNotThrow(() => {
      parent.insertBefore(next, text);
    });
    assert.equal(next.parentNode, null);
  } finally {
    if (previousNode === undefined) {
      Reflect.deleteProperty(globalAny, "Node");
    } else {
      globalAny.Node = previousNode;
    }
  }
});
