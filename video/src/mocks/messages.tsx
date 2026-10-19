import React from "react";
import { Copy, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { C } from "../theme";
import { AppShell, GradientButton, PageHeader, glow, prog } from "../ui/kit";

export const MESSAGES = [
  {
    name: "Welcome message",
    body: "Hi and welcome! We're happy to host you. Let us know if you need anything during your stay.",
  },
  {
    name: "Arrival instructions",
    body: "Check-in is from 2 PM. The key box is next to the front door. We'll send you the code on the day of arrival.",
  },
  {
    name: "House rules",
    body: "No smoking inside, quiet hours after 11 PM, and please close the terrace door when the AC is on.",
  },
  {
    name: "Checkout reminder",
    body: "Checkout is by 10 AM. Please leave the keys on the kitchen table. Thank you and safe travels!",
  },
];

export const SELECTED = 1;

/** Geometry in the window's content space (below the browser chrome), shared with the scene's cursor. */
export const MSG_GEOM = {
  messagesButton: { x: 1375, y: 32 },
  dropdown: { right: 146, top: 60, width: 360 },
  itemY: (i: number) => 60 + 8 + 42 + i * 54 + 27,
  itemX: 1250,
};

export const MessagesPage: React.FC<{ t: number; open: number; hover: number; selected: number; cardGlow: number }> = ({
  t,
  open,
  hover,
  selected,
  cardGlow,
}) => {
  const enter = (i: number) => {
    const p = prog(t, 4 + i * 5, 18);
    return { opacity: p, transform: `translateY(${(1 - p) * 16}px)` };
  };

  return (
    <>
      <AppShell
        active="Messages"
        messagesStyle={open > 0.5 ? { background: "rgba(139,92,246,0.16)", border: "1px solid rgba(167,139,250,0.4)", color: "white" } : undefined}
      >
        <div style={enter(0)}>
          <PageHeader
            eyebrow="Tools"
            title="Messages"
            description="Save messages for quick copy from the dashboard"
            actions={
              <GradientButton>
                <Plus size={17} /> New message
              </GradientButton>
            }
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {MESSAGES.map((m, i) => (
            <div
              key={m.name}
              style={{
                ...enter(1 + i),
                borderRadius: 18,
                padding: "20px 22px",
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${i === SELECTED && cardGlow > 0.3 ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.08)"}`,
                ...(i === SELECTED ? glow(cardGlow, C.violet, 2) : {}),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MessageSquare size={19} color={C.violet300} />
                <span style={{ fontSize: 20, fontWeight: 600 }}>{m.name}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 14, color: C.zinc500 }}>
                  <Copy size={18} />
                  <Pencil size={18} />
                  <Trash2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: 17, lineHeight: 1.5, color: C.zinc400, marginTop: 12, minHeight: 76 }}>{m.body}</div>
            </div>
          ))}
        </div>
      </AppShell>
      {open > 0 ? (
        <div
          style={{
            position: "absolute",
            right: MSG_GEOM.dropdown.right,
            top: MSG_GEOM.dropdown.top,
            width: MSG_GEOM.dropdown.width,
            borderRadius: 16,
            background: C.popover,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 30px 70px -10px rgba(0,0,0,0.85)",
            padding: 8,
            opacity: open,
            transform: `translateY(${(1 - open) * -10}px) scale(${0.97 + 0.03 * open})`,
            transformOrigin: "top right",
            zIndex: 40,
            color: C.text,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.zinc500, padding: "10px 12px 12px", height: 42 }}>
            Messages
          </div>
          {MESSAGES.map((m, i) => {
            const isHover = i === SELECTED ? hover : 0;
            const isSel = i === SELECTED ? selected : 0;
            return (
              <div
                key={m.name}
                style={{
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 12px",
                  borderRadius: 10,
                  fontSize: 17,
                  fontWeight: 500,
                  background: `rgba(139,92,246,${0.22 * Math.max(isHover, isSel)})`,
                }}
              >
                <Copy size={17} color={isHover > 0.5 ? C.violet300 : C.zinc500} />
                {m.name}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};
