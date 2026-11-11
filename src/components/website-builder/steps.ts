import type { WizardPath } from "@/lib/website-builder/types";

/**
 * Guided builder steps. Each step has a fixed number (stored as `wizardStep`); the
 * chosen path decides which of them the host walks through:
 * - AI build: Design → Build with AI → Launch
 * - Step by step: Design → Your place → Photos → Stays → Pages → Look → Launch
 * Steps outside the path can still be opened (for example from the launch checklist).
 */
export const STEP = {
  design: 1,
  quickStart: 2,
  place: 3,
  photos: 4,
  stays: 5,
  pages: 6,
  look: 7,
  launch: 8,
} as const;

export type StepNumber = (typeof STEP)[keyof typeof STEP];

export const STEP_LABELS: Record<StepNumber, string> = {
  1: "Design",
  2: "Build with AI",
  3: "Your place",
  4: "Photos",
  5: "Stays",
  6: "Pages",
  7: "Look",
  8: "Launch",
};

const AI_PATH: StepNumber[] = [STEP.design, STEP.quickStart, STEP.launch];
const MANUAL_PATH: StepNumber[] = [STEP.design, STEP.place, STEP.photos, STEP.stays, STEP.pages, STEP.look, STEP.launch];

/** Before a choice is made, the short AI path is shown: its second step is the choice. */
export function stepsForPath(path: WizardPath): StepNumber[] {
  return path === "manual" ? MANUAL_PATH : AI_PATH;
}

/** The next or previous step on the path, also from a step that is off the path. */
export function neighbourStep(path: WizardPath, current: number, direction: 1 | -1): StepNumber | null {
  const steps = stepsForPath(path);
  const index = steps.indexOf(current as StepNumber);
  if (index >= 0) return steps[index + direction] ?? null;
  const candidates = direction === 1 ? steps.filter((step) => step > current) : steps.filter((step) => step < current).reverse();
  return candidates[0] ?? null;
}
