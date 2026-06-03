export interface PropertyCalendarColor {
  solid: string;
  gradient: string;
}

/** CSS varijable iz globals.css — usklađena paleta za kalendar. */
const PROPERTY_COLOR_VARS = [
  "--calendar-property-1",
  "--calendar-property-2",
  "--calendar-property-3",
  "--calendar-property-4",
  "--calendar-property-5",
  "--calendar-property-6",
  "--calendar-property-7",
  "--calendar-property-8",
  "--calendar-property-9",
  "--calendar-property-10",
] as const;

export function getPropertyCalendarColor(index: number): PropertyCalendarColor {
  const cssVar = PROPERTY_COLOR_VARS[index % PROPERTY_COLOR_VARS.length];
  const solid = `var(${cssVar})`;
  return {
    solid,
    gradient: `linear-gradient(145deg, color-mix(in srgb, ${solid} 88%, white) 0%, ${solid} 100%)`,
  };
}

/** @deprecated Koristi getPropertyCalendarColor */
export function getPropertySquareColor(index: number): string {
  return getPropertyCalendarColor(index).solid;
}
