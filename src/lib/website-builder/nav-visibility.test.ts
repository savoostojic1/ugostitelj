import { test } from "node:test";
import assert from "node:assert/strict";
import { initialNavState, nextNavState } from "./nav-visibility";

const run = (tops: number[], start = 0) => {
  let state = initialNavState(start);
  return tops.map((top) => (state = nextNavState(state, top)).hidden);
};

test("hides after a run down past the hero and shows after a run up", () => {
  assert.deepEqual(run([200, 300, 400, 500]), [false, true, true, true]);
  let state = initialNavState(0);
  for (const top of [300, 600, 900]) state = nextNavState(state, top);
  assert.equal(state.hidden, true);
  state = nextNavState(state, 880);
  assert.equal(state.hidden, true); // 20px up: stays hidden
  state = nextNavState(state, 850);
  assert.equal(state.hidden, false); // 50px up from 900: shows
});

test("small reversals while scrolling do not flip the nav", () => {
  // Scrolling down with momentum jitter: a few pixels back now and then.
  let state = initialNavState(400);
  const hidden: boolean[] = [];
  for (const top of [460, 520, 515, 580, 574, 640, 700, 696, 760]) {
    state = nextNavState(state, top);
    hidden.push(state.hidden);
  }
  assert.deepEqual(hidden.slice(1), Array(8).fill(true));
});

test("near the top the nav is always shown", () => {
  let state = initialNavState(1000);
  for (const top of [1100, 1200]) state = nextNavState(state, top);
  assert.equal(state.hidden, true);
  state = nextNavState(state, 100);
  assert.equal(state.hidden, false);
});
