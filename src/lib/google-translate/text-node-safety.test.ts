import assert from "node:assert/strict";
import test from "node:test";

/**
 * Documents the React + Google Translate contract used across Hostvia.
 *
 * Safe: a single text child inside an element React owns.
 * Unsafe: bare text sibling next to an element, or adjacent text fibers
 * that React may add/remove while a translator has wrapped them in <font>.
 */

type FiberChild =
  | { kind: "text"; value: string }
  | { kind: "element"; tag: string; children: FiberChild[] };

function isTranslateSafe(children: FiberChild[]): boolean {
  if (children.length <= 1) return true;
  return children.every((child) => child.kind === "element");
}

test("icon + bare text is unsafe under Google Translate", () => {
  const unsafe: FiberChild[] = [
    { kind: "element", tag: "svg", children: [] },
    { kind: "text", value: "Search" },
  ];
  assert.equal(isTranslateSafe(unsafe), false);
});

test("icon element + text wrapped in span is safe", () => {
  const safe: FiberChild[] = [
    { kind: "element", tag: "svg", children: [] },
    {
      kind: "element",
      tag: "span",
      children: [{ kind: "text", value: "Search" }],
    },
  ];
  assert.equal(isTranslateSafe(safe), true);
});

test("single template-string text child is safe", () => {
  const safe: FiberChild[] = [
    { kind: "text", value: "3 nights · €240 total" },
  ];
  assert.equal(isTranslateSafe(safe), true);
});

test("adjacent text fibers are unsafe when React removes one", () => {
  const unsafe: FiberChild[] = [
    { kind: "text", value: "3" },
    { kind: "text", value: " nights · " },
    { kind: "text", value: "€240" },
  ];
  assert.equal(isTranslateSafe(unsafe), false);
});
