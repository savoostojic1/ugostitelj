"use client";

import { useEffect, type RefObject } from "react";

/**
 * Website motion engine.
 *
 * Markup declares intent with data attributes; this hook wires them up:
 *   data-reveal="up|fade|mask|clip|scale|lines|draw"  → data-in="1" once in view (CSS animates)
 *   data-parallax="0.15"                              → --py (px), relative to the parent box
 *   data-progress="view|pin"                          → --p (0..1) while the element crosses the viewport
 *   data-pin-x (+ child [data-track])                 → pinned horizontal scroll on wide screens
 *   data-steps (+ children [data-step])               → data-current on the container, data-active on a step
 *
 * One IntersectionObserver handles reveals. A second keeps a set of scroll-linked
 * elements near the viewport, and a single rAF pass reads all their boxes first,
 * then writes CSS variables, so layout is never thrashed. Nothing runs while the
 * page is still. prefers-reduced-motion and the "off" setting skip all of it.
 */

type Scroller = HTMLElement | Window;

const SCROLL_LINKED = "[data-parallax],[data-progress],[data-pin-x],[data-steps]";

function findScroller(node: HTMLElement): Scroller {
  let current: HTMLElement | null = node.parentElement;
  while (current && current !== document.body) {
    const style = getComputedStyle(current);
    if (/(auto|scroll|overlay)/.test(style.overflowY)) return current;
    current = current.parentElement;
  }
  return window;
}

const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

export function useWebsiteMotion(
  rootRef: RefObject<HTMLElement | null>,
  options: { mode: "elegant" | "subtle" | "none"; refreshKey?: string }
) {
  const { mode, refreshKey } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    document.documentElement.classList.add("wb-js");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = !reduce && mode !== "none";
    root.dataset.engine = "on";

    const scroller = findScroller(root);
    const isWindow = scroller === window;
    const scrollEl = isWindow ? null : (scroller as HTMLElement);

    let scale = 1;
    let vpTop = 0;
    let vpHeight = window.innerHeight;
    const measureViewport = () => {
      scale = root.offsetWidth ? root.getBoundingClientRect().width / root.offsetWidth || 1 : 1;
      if (scrollEl) {
        const rect = scrollEl.getBoundingClientRect();
        vpTop = rect.top;
        vpHeight = scrollEl.clientHeight;
        root.style.setProperty("--wb-vh", `${Math.round(vpHeight / scale)}px`);
      } else {
        vpTop = 0;
        vpHeight = window.innerHeight;
      }
    };
    measureViewport();

    const scrollTop = () => (scrollEl ? scrollEl.scrollTop : window.scrollY);

    // --- Reveals -----------------------------------------------------------
    const revealed = new WeakSet<Element>();
    const reveal = (el: Element) => {
      if (revealed.has(el)) return;
      revealed.add(el);
      (el as HTMLElement).dataset.in = "1";
    };
    const revealObserver = motion
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              reveal(entry.target);
              revealObserver?.unobserve(entry.target);
            }
          },
          { root: scrollEl, rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
        )
      : null;

    // --- Scroll-linked set ---------------------------------------------------
    const active = new Set<HTMLElement>();
    const linkedObserver = motion
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const el = entry.target as HTMLElement;
              if (entry.isIntersecting) active.add(el);
              else active.delete(el);
            }
            schedule();
          },
          { root: scrollEl, rootMargin: "30% 0px 30% 0px" }
        )
      : null;

    const known = new WeakSet<Element>();
    const scan = () => {
      root.querySelectorAll("[data-reveal]").forEach((el) => {
        if (known.has(el)) return;
        known.add(el);
        if (revealObserver) revealObserver.observe(el);
        else reveal(el);
      });
      if (!linkedObserver) return;
      root.querySelectorAll(SCROLL_LINKED).forEach((el) => {
        if (known.has(el)) return;
        known.add(el);
        linkedObserver.observe(el);
      });
    };

    // --- Pinned horizontal galleries ---------------------------------------
    const layoutPins = () => {
      root.querySelectorAll<HTMLElement>("[data-pin-x]").forEach((el) => {
        const track = el.querySelector<HTMLElement>("[data-track]");
        const wide = el.offsetWidth >= 760;
        if (!track || !motion || !wide) {
          el.style.height = "";
          delete el.dataset.pinned;
          if (track) track.style.transform = "";
          return;
        }
        el.dataset.pinned = "1";
        const distance = Math.max(0, track.scrollWidth - el.clientWidth);
        el.dataset.distance = String(distance);
        el.style.height = `${Math.round(distance + vpHeight / scale)}px`;
      });
    };

    // --- Frame -------------------------------------------------------------
    const amplitude = (mode === "subtle" ? 0.45 : 1) * (root.offsetWidth < 700 ? 0.6 : 1);
    let lastTop = scrollTop();
    let frame = 0;

    const update = () => {
      frame = 0;
      const top = scrollTop();
      root.dataset.scrolled = top > 24 ? "1" : "0";
      if (top > lastTop + 6 && top > 280) root.dataset.navHidden = "1";
      else if (top < lastTop - 6 || top < 120) root.dataset.navHidden = "0";
      lastTop = top;
      if (!motion || active.size === 0) return;

      const center = vpTop + vpHeight / 2;
      // Read phase.
      const reads: { el: HTMLElement; rect: DOMRect; parent?: DOMRect; steps?: DOMRect[] }[] = [];
      for (const el of active) {
        const rect = el.getBoundingClientRect();
        const parent = el.dataset.parallax ? el.parentElement?.getBoundingClientRect() : undefined;
        const steps = el.hasAttribute("data-steps")
          ? Array.from(el.querySelectorAll<HTMLElement>("[data-step]")).map((step) => step.getBoundingClientRect())
          : undefined;
        reads.push({ el, rect, parent, steps });
      }
      // Write phase.
      for (const { el, rect, parent, steps } of reads) {
        if (el.dataset.parallax && parent) {
          const speed = Number(el.dataset.parallax) || 0;
          const offset = parent.top + parent.height / 2 - center;
          el.style.setProperty("--py", `${(-offset * speed * amplitude / scale).toFixed(1)}px`);
        }
        const progressMode = el.dataset.progress ?? (el.hasAttribute("data-pin-x") ? "pin" : undefined);
        if (progressMode) {
          const p =
            progressMode === "pin"
              ? clamp((vpTop - rect.top) / Math.max(1, rect.height - vpHeight))
              : clamp((vpTop + vpHeight - rect.top) / (vpHeight + rect.height));
          el.style.setProperty("--p", p.toFixed(4));
          if (el.dataset.pinned === "1") {
            const track = el.querySelector<HTMLElement>("[data-track]");
            const distance = Number(el.dataset.distance) || 0;
            if (track) track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px,0,0)`;
          }
        }
        if (steps && steps.length) {
          let best = 0;
          let bestDistance = Infinity;
          steps.forEach((box, index) => {
            const distance = Math.abs(box.top + box.height / 2 - center);
            if (distance < bestDistance) {
              bestDistance = distance;
              best = index;
            }
          });
          if (el.dataset.current !== String(best)) {
            el.dataset.current = String(best);
            el.querySelectorAll<HTMLElement>("[data-step]").forEach((step, index) => {
              step.dataset.active = index === best ? "1" : "0";
            });
          }
        }
      }
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    scan();
    layoutPins();
    update();

    const target: Scroller = scroller;
    target.addEventListener("scroll", schedule, { passive: true });

    const onResize = () => {
      measureViewport();
      layoutPins();
      schedule();
    };
    window.addEventListener("resize", onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(root);
    if (scrollEl) resizeObserver.observe(scrollEl);

    let rescan = 0;
    const mutationObserver = new MutationObserver(() => {
      window.clearTimeout(rescan);
      rescan = window.setTimeout(() => {
        scan();
        layoutPins();
        schedule();
      }, 80);
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      revealObserver?.disconnect();
      linkedObserver?.disconnect();
      window.clearTimeout(rescan);
      if (frame) cancelAnimationFrame(frame);
      root.querySelectorAll<HTMLElement>("[data-pin-x]").forEach((el) => {
        el.style.height = "";
        delete el.dataset.pinned;
      });
      delete root.dataset.engine;
    };
  }, [rootRef, mode, refreshKey]);
}
