"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  FieldInput,
  FieldArea,
  OptionalToggle,
} from "@/components/guest-guide/builder/field";
import { ImageField } from "@/components/guest-guide/builder/image-field";
import {
  createId,
  LOCAL_CATEGORY_LABELS,
  PROPERTY_ITEM_PRESETS,
  RULE_PRESETS,
} from "@/lib/guest-guide/defaults";
import type {
  GuestGuideContent,
  GuestGuideSectionId,
  LocalCategory,
  LocalRecommendation,
  PropertyItem,
  RuleItem,
} from "@/lib/guest-guide/types";

export function SectionEditor({
  sectionId,
  content,
  onChange,
}: {
  sectionId: GuestGuideSectionId;
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  switch (sectionId) {
    case "welcome":
      return <WelcomeEditor content={content} onChange={onChange} />;
    case "checkin":
      return <CheckInEditor content={content} onChange={onChange} />;
    case "wifi":
      return <WifiEditor content={content} onChange={onChange} />;
    case "property":
      return <PropertyEditor content={content} onChange={onChange} />;
    case "rules":
      return <RulesEditor content={content} onChange={onChange} />;
    case "checkout":
      return <CheckOutEditor content={content} onChange={onChange} />;
    case "local":
      return <LocalEditor content={content} onChange={onChange} />;
    case "emergency":
      return <EmergencyEditor content={content} onChange={onChange} />;
    case "contact":
      return <ContactEditor content={content} onChange={onChange} />;
    default:
      return null;
  }
}

function WelcomeEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const [optional, setOptional] = useState(false);
  const w = content.welcome;
  const set = (patch: Partial<typeof w>) =>
    onChange({ ...content, welcome: { ...w, ...patch } });

  return (
    <div className="space-y-5">
      <FieldInput
        id="propertyName"
        label="Property name"
        hint="Shown as the main title on your guest guide cover."
        value={w.propertyName}
        onChange={(propertyName) => set({ propertyName })}
        placeholder="Villa Oliva"
      />
      <FieldInput
        id="location"
        label="Location"
        hint="City, region or neighbourhood guests will recognise."
        value={w.location}
        onChange={(location) => set({ location })}
        placeholder="Lustica Peninsula, Montenegro"
      />
      <ImageField
        label="Cover photo"
        hint="Use a wide, bright photo of the property or view."
        value={w.coverPhotoUrl}
        onChange={(coverPhotoUrl) => set({ coverPhotoUrl })}
      />
      <FieldInput
        id="subtitle"
        label="Short subtitle"
        value={w.subtitle}
        onChange={(subtitle) => set({ subtitle })}
        placeholder="A quiet Mediterranean retreat above the Adriatic"
      />
      <FieldArea
        id="message"
        label="Welcome message"
        hint="A warm note guests read first. Write in your own voice."
        value={w.message}
        onChange={(message) => set({ message })}
        rows={5}
      />
      <FieldInput
        id="hostName"
        label="Host name"
        value={w.hostName}
        onChange={(hostName) => set({ hostName })}
        placeholder="Ana & Marko"
      />
      <OptionalToggle open={optional} onToggle={() => setOptional((v) => !v)} />
      {optional ? (
        <div className="space-y-5">
          <ImageField
            label="Host photo"
            value={w.hostPhotoUrl}
            onChange={(hostPhotoUrl) => set({ hostPhotoUrl })}
          />
          <FieldInput
            id="contactNote"
            label="Contact note"
            value={w.contactNote}
            onChange={(contactNote) => set({ contactNote })}
            placeholder="Message us anytime — we are nearby and happy to help."
          />
        </div>
      ) : null}
    </div>
  );
}

function CheckInEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const [optional, setOptional] = useState(false);
  const c = content.checkin;
  const set = (patch: Partial<typeof c>) =>
    onChange({ ...content, checkin: { ...c, ...patch } });

  return (
    <div className="space-y-5">
      <FieldInput
        id="checkInTime"
        label="Check-in time"
        value={c.checkInTime}
        onChange={(checkInTime) => set({ checkInTime })}
        placeholder="15:00"
      />
      <FieldArea
        id="address"
        label="Property address"
        value={c.address}
        onChange={(address) => set({ address })}
        rows={2}
      />
      <FieldArea
        id="arrival"
        label="Arrival instructions"
        hint="How to find the property and approach the entrance."
        value={c.arrivalInstructions}
        onChange={(arrivalInstructions) => set({ arrivalInstructions })}
      />
      <FieldArea
        id="parking"
        label="Parking instructions"
        value={c.parkingInstructions}
        onChange={(parkingInstructions) => set({ parkingInstructions })}
      />
      <FieldArea
        id="keys"
        label="Key collection"
        hint="Describe the process. Do not publish lockbox codes or door PINs here — send those privately."
        value={c.keyCollection}
        onChange={(keyCollection) => set({ keyCollection })}
      />
      <OptionalToggle open={optional} onToggle={() => setOptional((v) => !v)} />
      {optional ? (
        <div className="space-y-5">
          <FieldArea
            id="entry"
            label="Entry instructions"
            value={c.entryInstructions}
            onChange={(entryInstructions) => set({ entryInstructions })}
          />
          <FieldInput
            id="map"
            label="Google Maps link"
            value={c.mapLink}
            onChange={(mapLink) => set({ mapLink })}
            placeholder="https://maps.google.com/?q=..."
          />
          <ImageField
            label="Check-in photo"
            value={c.photos[0]?.url ?? ""}
            onChange={(url) =>
              set({
                photos: url
                  ? [{ id: c.photos[0]?.id ?? createId(), url, alt: "Check-in" }]
                  : [],
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function WifiEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const w = content.wifi;
  const set = (patch: Partial<typeof w>) =>
    onChange({ ...content, wifi: { ...w, ...patch } });

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3.5 py-3 text-xs leading-relaxed text-amber-100">
        Wi-Fi details in a published guide are visible to anyone with the link.
        Share the link only with confirmed guests.
      </p>
      <FieldInput
        id="network"
        label="Network name"
        value={w.networkName}
        onChange={(networkName) => set({ networkName })}
      />
      <FieldInput
        id="password"
        label="Password"
        value={w.password}
        onChange={(password) => set({ password })}
      />
      <FieldArea
        id="wifi-extra"
        label="Additional instructions"
        value={w.instructions}
        onChange={(instructions) => set({ instructions })}
      />
    </div>
  );
}

function CheckOutEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const [optional, setOptional] = useState(false);
  const c = content.checkout;
  const set = (patch: Partial<typeof c>) =>
    onChange({ ...content, checkout: { ...c, ...patch } });

  return (
    <div className="space-y-5">
      <FieldInput
        id="checkOutTime"
        label="Check-out time"
        value={c.checkOutTime}
        onChange={(checkOutTime) => set({ checkOutTime })}
        placeholder="11:00"
      />
      <FieldArea
        id="departure"
        label="Departure instructions"
        value={c.departureInstructions}
        onChange={(departureInstructions) => set({ departureInstructions })}
      />
      <FieldArea
        id="keyReturn"
        label="Key return"
        value={c.keyReturn}
        onChange={(keyReturn) => set({ keyReturn })}
      />
      <OptionalToggle open={optional} onToggle={() => setOptional((v) => !v)} />
      {optional ? (
        <div className="space-y-5">
          <FieldArea
            id="cleaning"
            label="Cleaning expectations"
            value={c.cleaningExpectations}
            onChange={(cleaningExpectations) => set({ cleaningExpectations })}
          />
          <FieldArea
            id="waste"
            label="Waste disposal"
            value={c.wasteDisposal}
            onChange={(wasteDisposal) => set({ wasteDisposal })}
          />
          <FieldArea
            id="other"
            label="Other information"
            value={c.otherInfo}
            onChange={(otherInfo) => set({ otherInfo })}
          />
        </div>
      ) : null}
    </div>
  );
}

function PropertyEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const items = content.property;

  function update(next: PropertyItem[]) {
    onChange({ ...content, property: next });
  }

  function addPreset(title: string, icon?: string) {
    update([
      ...items,
      { id: createId(), title, description: "", icon, imageUrl: "" },
    ]);
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500">
        Add facilities guests need to know about. Skip anything that does not apply.
      </p>
      <div className="flex flex-wrap gap-2">
        {PROPERTY_ITEM_PRESETS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => addPreset(preset.title, preset.icon)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-400/40"
          >
            + {preset.title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => addPreset("Custom facility")}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/15 px-3 py-1.5 text-xs text-zinc-400"
        >
          <Plus className="h-3 w-3" /> Custom
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Item {index + 1}
            </p>
            <button
              type="button"
              onClick={() => update(items.filter((x) => x.id !== item.id))}
              className="text-zinc-500 hover:text-rose-300"
              aria-label="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <FieldInput
            id={`${item.id}-title`}
            label="Title"
            value={item.title}
            onChange={(title) =>
              update(items.map((x) => (x.id === item.id ? { ...x, title } : x)))
            }
          />
          <FieldArea
            id={`${item.id}-desc`}
            label="Description"
            value={item.description}
            onChange={(description) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, description } : x))
              )
            }
          />
          <ImageField
            label="Optional photo"
            value={item.imageUrl ?? ""}
            onChange={(imageUrl) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, imageUrl } : x))
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function RulesEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const items = content.rules;

  function update(next: RuleItem[]) {
    onChange({ ...content, rules: next });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {RULE_PRESETS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() =>
              update([
                ...items,
                { id: createId(), title: preset.title, description: "" },
              ])
            }
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-400/40"
          >
            + {preset.title}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Rule {index + 1}
            </p>
            <button
              type="button"
              onClick={() => update(items.filter((x) => x.id !== item.id))}
              className="text-zinc-500 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <FieldInput
            id={`${item.id}-title`}
            label="Title"
            value={item.title}
            onChange={(title) =>
              update(items.map((x) => (x.id === item.id ? { ...x, title } : x)))
            }
          />
          <FieldArea
            id={`${item.id}-desc`}
            label="Description"
            value={item.description}
            onChange={(description) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, description } : x))
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function LocalEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const items = content.local;

  function update(next: LocalRecommendation[]) {
    onChange({ ...content, local: next });
  }

  function add(category: LocalCategory = "other") {
    update([
      ...items,
      {
        id: createId(),
        category,
        name: "",
        description: "",
        photoUrl: "",
        address: "",
        mapsLink: "",
        website: "",
      },
    ]);
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => add("restaurants")}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Add recommendation
      </button>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Place {index + 1}
            </p>
            <button
              type="button"
              onClick={() => update(items.filter((x) => x.id !== item.id))}
              className="text-zinc-500 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-200" htmlFor={`${item.id}-cat`}>
              Category
            </label>
            <select
              id={`${item.id}-cat`}
              value={item.category}
              onChange={(e) =>
                update(
                  items.map((x) =>
                    x.id === item.id
                      ? { ...x, category: e.target.value as LocalCategory }
                      : x
                  )
                )
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-100"
            >
              {Object.entries(LOCAL_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <FieldInput
            id={`${item.id}-name`}
            label="Name"
            value={item.name}
            onChange={(name) =>
              update(items.map((x) => (x.id === item.id ? { ...x, name } : x)))
            }
          />
          <FieldArea
            id={`${item.id}-desc`}
            label="Short description"
            value={item.description}
            onChange={(description) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, description } : x))
              )
            }
          />
          <ImageField
            label="Photo"
            value={item.photoUrl}
            onChange={(photoUrl) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, photoUrl } : x))
              )
            }
          />
          <FieldInput
            id={`${item.id}-address`}
            label="Address"
            value={item.address}
            onChange={(address) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, address } : x))
              )
            }
          />
          <FieldInput
            id={`${item.id}-maps`}
            label="Google Maps link"
            value={item.mapsLink}
            onChange={(mapsLink) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, mapsLink } : x))
              )
            }
          />
          <FieldInput
            id={`${item.id}-web`}
            label="Website (optional)"
            value={item.website}
            onChange={(website) =>
              update(
                items.map((x) => (x.id === item.id ? { ...x, website } : x))
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function EmergencyEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const e = content.emergency;
  const set = (patch: Partial<typeof e>) =>
    onChange({ ...content, emergency: { ...e, ...patch } });

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() =>
          set({
            numbers: [
              ...e.numbers,
              { id: createId(), label: "Emergency", value: "" },
            ],
          })
        }
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Add phone number
      </button>
      {e.numbers.map((item) => (
        <div key={item.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <FieldInput
            id={`${item.id}-label`}
            label="Label"
            value={item.label}
            onChange={(label) =>
              set({
                numbers: e.numbers.map((x) =>
                  x.id === item.id ? { ...x, label } : x
                ),
              })
            }
          />
          <FieldInput
            id={`${item.id}-value`}
            label="Number"
            value={item.value}
            onChange={(value) =>
              set({
                numbers: e.numbers.map((x) =>
                  x.id === item.id ? { ...x, value } : x
                ),
              })
            }
          />
          <button
            type="button"
            className="mt-7 text-zinc-500 hover:text-rose-300"
            onClick={() =>
              set({ numbers: e.numbers.filter((x) => x.id !== item.id) })
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <FieldArea
        id="hospital"
        label="Nearest hospital"
        value={e.nearestHospital}
        onChange={(nearestHospital) => set({ nearestHospital })}
      />
      <FieldArea
        id="pharmacy"
        label="Nearest pharmacy"
        value={e.nearestPharmacy}
        onChange={(nearestPharmacy) => set({ nearestPharmacy })}
      />
      <FieldArea
        id="localContacts"
        label="Important local contacts"
        value={e.localContacts}
        onChange={(localContacts) => set({ localContacts })}
      />
      <FieldArea
        id="emergencyInstructions"
        label="Additional instructions"
        value={e.instructions}
        onChange={(instructions) => set({ instructions })}
      />
    </div>
  );
}

function ContactEditor({
  content,
  onChange,
}: {
  content: GuestGuideContent;
  onChange: (content: GuestGuideContent) => void;
}) {
  const c = content.contact;
  const set = (patch: Partial<typeof c>) =>
    onChange({ ...content, contact: { ...c, ...patch } });

  return (
    <div className="space-y-5">
      <FieldInput
        id="contactHost"
        label="Host name"
        value={c.hostName}
        onChange={(hostName) => set({ hostName })}
      />
      <FieldInput
        id="contactPhone"
        label="Phone"
        value={c.phone}
        onChange={(phone) => set({ phone })}
      />
      <FieldInput
        id="contactWa"
        label="WhatsApp"
        hint="Include country code, e.g. +38267000000"
        value={c.whatsapp}
        onChange={(whatsapp) => set({ whatsapp })}
      />
      <FieldInput
        id="contactEmail"
        label="Email"
        type="email"
        value={c.email}
        onChange={(email) => set({ email })}
      />
      <FieldInput
        id="contactWeb"
        label="Website (optional)"
        value={c.website}
        onChange={(website) => set({ website })}
      />
    </div>
  );
}
