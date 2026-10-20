import { FREE_PROPERTY_LIMIT, PRO_MONTHLY_PRICE_USD } from "@/lib/subscriptions/plans";

const rows = [
  { label: "Price", free: "$0", pro: `$${PRO_MONTHLY_PRICE_USD} per month for the account` },
  {
    label: "Properties",
    free: `Up to ${FREE_PROPERTY_LIMIT} active`,
    pro: "Removes that limit",
  },
  {
    label: "Tools",
    free: "Calendars, inquiries, arrivals, cleaning view, saved messages, public site",
    pro: "The same tools",
  },
  { label: "Payment", free: "No card", pro: "Stripe. Cancel in the billing portal." },
] as const;

export function PlanComparison() {
  const plans = [
    { name: "Free", key: "free" as const },
    { name: "Pro", key: "pro" as const },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => (
        <section key={plan.name} className="rounded-2xl border border-white/10 p-5">
          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
          <dl className="mt-4 space-y-3">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-300">
                  {row[plan.key]}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
