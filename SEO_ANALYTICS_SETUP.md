# Hostvia analytics setup

Google Analytics 4 is already loaded from `src/lib/analytics/ga-measurement-id.ts` (`G-MFQ4P5DKXX`) through `@next/third-parties/google`. Vercel Analytics is loaded from `@vercel/analytics/next`. Neither of those facts was changed.

This work adds custom events in the existing browser tag. It does not add a new analytics vendor. Events were not marked as conversions in the GA4 interface, and they were not watched in DebugView, because that requires the GA4 property admin and a live browser session.

## Events that are sent

| Event name | When it fires | Parameters | What it does not mean |
| --- | --- | --- | --- |
| `sign_up` | Supabase `signUp` returns without an error | `method=email` | The person may still need to confirm email before they can use the account. There is no separate “account activated” event. The auth callback does not tell the client that this visit is the first confirmation. |
| `property_created` | `POST /api/properties` returns 200 | none | The property name is not sent. |
| `calendar_connection_initiated` | A new calendar feed is submitted after the iCal URL passes validation | `platform` (`airbnb`, `booking`, or `custom`) | Editing an existing feed does not fire this. The iCal URL is not sent. |
| `calendar_connected` | The new feed row is saved | `platform`, `first_sync` (`ok`, `failed`, or `not_run`) | “Connected” means the feed was stored. `first_sync=failed` means the first import did not succeed. |
| `view_pricing` | The pricing page mounts, once per browser session | `page=pricing` | This is in addition to the automatic GA4 `page_view`. It is not a second page view. |
| `upgrade_initiated` | The app calls `POST /api/billing/checkout` | `plan=pro` | The person may abandon Stripe. No Stripe id is sent. |
| `subscription_started` | The billing success page sees `isPro` after confirmation | `plan=pro` | Once per browser session. A refresh does not send it again. Complimentary Pro that never hits this page is not counted. |

Every event also sends `traffic_scope` as `internal` or `external`.

No event includes a name, email, phone, guest, reservation, property name, iCal URL, or payment identifier.

## Internal traffic

Team members can mark a browser without giving analytics an email address:

1. Open `https://hostvia.me/?hv_internal=1` once in that browser.
2. The flag is stored in `localStorage` under `hostvia_traffic_scope`.
3. Later events from that browser send `traffic_scope=internal`.
4. Open `https://hostvia.me/?hv_internal=0` to clear it.

This does not stop GA4 from recording the hit. It lets you filter. Also add the office IP as internal traffic in GA4 (**Admin → Data streams → Configure tag settings → Define internal traffic**, then **Data filters**). IP filtering is the reliable method for people who forget the query parameter. Do not upload a customer list to do this.

## GA4 configuration still required

In the GA4 property that owns `G-MFQ4P5DKXX`:

1. **Admin → Events**. Confirm the seven names above appear after a test session. Custom events can take a day to show in standard reports. DebugView shows them immediately if you use the [GA Debugger](https://chrome.google.com) extension or `debug_mode`.
2. Mark these as key events (conversions) only if you want them in the advertising reports:
   - `sign_up`
   - `property_created`
   - `subscription_started`
   Leave `view_pricing` and `upgrade_initiated` as events unless you need them as key events. Marking all of them makes the conversion count noisy.
3. **Admin → Data display → Events**. Do not create a custom dimension that stores email or the Stripe session id.
4. Add a custom dimension for event-scoped parameter `traffic_scope` if you want it in explorations. Name it `Traffic scope`. Scope: Event. Parameter: `traffic_scope`.
5. Add a custom dimension for `platform` and `first_sync` the same way if you want calendar reports.
6. Build an exploration filtered to `traffic_scope = external`.
7. Confirm **Enhanced measurement** page views stay on. Do not also send a manual `page_view` from this codebase. The helper does not send one. Vercel Analytics page views are a separate product, not a second GA4 page view.

## How to test after deploy

Use a browser where `hv_internal=1` is set, so the test is labeled.

1. Open `/pricing`. Expect one `view_pricing` for that session. Reload. Expect no second `view_pricing`.
2. Register with a test inbox. Expect `sign_up` with `method=email`. Confirm the event parameters do not contain the email.
3. After you can sign in, add a property. Expect `property_created` with no property name.
4. Add an iCal feed on a test property. Expect `calendar_connection_initiated`, then `calendar_connected`. Confirm the request payload in the network panel does not contain the iCal URL.
5. Start upgrade and cancel Stripe. Expect `upgrade_initiated` and no `subscription_started`.
6. Complete a Stripe test payment only in test mode. On `/dashboard/billing/success`, after Pro shows as active, expect one `subscription_started`.

If `gtag` is missing, the helper returns without throwing. An ad blocker will look like a missing event. Check DebugView from a browser with the blocker off before treating that as a code failure.

## What was not automated

- GA4 key events, custom dimensions, and the internal-IP data filter. Those are property settings.
- A server-side event for “email confirmed” or “first dashboard session”. Adding one would need a durable flag on the user row so it cannot fire on every login. That was left out so this change does not touch auth data.
- Vercel Analytics custom events. The GA4 events above are the conversion record. Vercel Analytics continues to collect its own page views.
