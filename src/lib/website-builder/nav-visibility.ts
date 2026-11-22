/**
 * Whether the site's nav is hidden while scrolling. The nav hides while the guest scrolls
 * down and returns when they scroll up. Phones produce small reversals (momentum, the
 * rubber band at either end, the address bar sliding), so the state only changes after a
 * run in one direction, measured from where that direction started; positions past
 * either end of the page are clamped away by the caller.
 */
export interface NavScrollState {
  lastTop: number;
  direction: -1 | 0 | 1;
  runStart: number;
  hidden: boolean;
}

export const NAV_HIDE_AFTER = 56;
export const NAV_SHOW_AFTER = 40;
const ALWAYS_SHOWN_ABOVE = 120;
const HIDE_ONLY_BELOW = 280;

export function initialNavState(top: number): NavScrollState {
  return { lastTop: top, direction: 0, runStart: top, hidden: false };
}

export function nextNavState(state: NavScrollState, top: number): NavScrollState {
  let { direction, runStart } = state;
  if (top !== state.lastTop) {
    const now = top > state.lastTop ? 1 : -1;
    if (now !== direction) {
      direction = now;
      runStart = state.lastTop;
    }
  }
  let hidden = state.hidden;
  if (top < ALWAYS_SHOWN_ABOVE) hidden = false;
  else if (direction > 0 && top > HIDE_ONLY_BELOW && top - runStart > NAV_HIDE_AFTER) hidden = true;
  else if (direction < 0 && runStart - top > NAV_SHOW_AFTER) hidden = false;
  return { lastTop: top, direction, runStart, hidden };
}
