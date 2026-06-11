type ScrollBelowOptions = {
  offset?: number;
  behavior?: ScrollBehavior;
  maxAttempts?: number;
  /** Wait until this element exists and has layout before scrolling. */
  readySelector?: string;
  minReadyHeight?: number;
};

function flushLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** Scroll so the viewport top sits just below the target element. */
export async function scrollBelowElement(
  element: Element,
  { offset = 12, behavior = "smooth" }: ScrollBelowOptions = {}
) {
  await flushLayout();
  const top = element.getBoundingClientRect().bottom + window.scrollY + offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function isReady(
  readySelector: string | undefined,
  minReadyHeight: number
): boolean {
  if (!readySelector) return true;

  const ready = document.querySelector(readySelector);
  if (!ready) return false;

  return ready.getBoundingClientRect().height >= minReadyHeight;
}

export function scrollBelowSelector(
  selector: string,
  options: ScrollBelowOptions = {}
) {
  const {
    maxAttempts = 48,
    readySelector,
    minReadyHeight = 1,
    ...scrollOptions
  } = options;

  let attempts = 0;

  function tryScroll() {
    const element = document.querySelector(selector);
    if (!element || !isReady(readySelector, minReadyHeight)) {
      if (++attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      }
      return;
    }

    void scrollBelowElement(element, scrollOptions);
  }

  requestAnimationFrame(tryScroll);
}

export function scrollBelowPublicSearch(
  options?: Omit<ScrollBelowOptions, "maxAttempts">
) {
  scrollBelowSelector(".public-hero-search", {
    offset: 16,
    readySelector: ".public-section--sheet-inner [data-booking-panel]",
    ...options,
  });
}

export function scrollBelowUnitsActions(
  options?: Omit<ScrollBelowOptions, "maxAttempts">
) {
  scrollBelowSelector(".public-units-actions", {
    offset: 12,
    readySelector: "#units-expanded",
    minReadyHeight: 48,
    ...options,
  });
}

/** Scroll below a unit card's availability toggle once the calendar is open. */
export function scrollBelowUnitCalendarToggle(
  propertyId: string,
  options?: Omit<ScrollBelowOptions, "maxAttempts">
) {
  scrollBelowSelector(`[data-unit-calendar-toggle="${propertyId}"]`, {
    offset: 12,
    readySelector: `[data-unit-calendar="${propertyId}"]`,
    minReadyHeight: 120,
    ...options,
  });
}

/** Keep the search date popover inside the viewport on small screens. */
export function scrollIntoViewIfNeeded(
  element: Element,
  options: ScrollIntoViewOptions = { block: "nearest", behavior: "smooth" }
) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.scrollIntoView(options);
    });
  });
}
