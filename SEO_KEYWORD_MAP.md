# Hostvia keyword and page map

Date: 20 October 2026

Search volumes, keyword difficulty, traffic estimates, and current rankings are **not** included. They were not available from a keyword data provider, and they are not invented here.

Evidence is the live result set for the queries below, reviewed on 20 October 2026, plus the product behavior in this repository and `HOSTVIA_FEATURES.md`.

## What Hostvia can honestly rank for

Hostvia is a fit when the searcher wants all of the following:

- A small number of vacation rentals or holiday lets.
- Airbnb and Booking.com kept together with iCal, not a certified channel-manager API.
- Manual reservations and an export link back to those platforms.
- A public page that collects an inquiry. The guest is not charged inside Hostvia.
- Arrivals, departures, and a cleaning overview. The overview does not assign cleaners.

Hostvia is a poor fit, and should not be targeted, for:

- Instant guest payment, channel-manager APIs, or “double bookings are impossible”.
- Cleaner dispatch, SMS jobs, photo proof, or cleaner payroll.
- Agency tools for dozens of owners, Sykes, cottages.com, or Hoseasons connections.
- Montenegro, Serbia, Bosnia and Herzegovina, Croatia, or other Balkan markets as the primary audience.

## Evidence from current results

These are the kinds of pages already ranking. They show intent. They are not a volume study.

| Query investigated | What the results were about | Fit for Hostvia |
| --- | --- | --- |
| Vacation rental management software, iCal, small owners | iCal sync tools (iCalSync, RentalCal, RentTools), booking pages, and fuller PMS products (AirCalendar, URManager). Several pages tell hosts that iCal is delayed and is not an API. | Strong, if the page states the delay. |
| Holiday let management software, direct booking website | UK pages from Lodgify, Lettiva, TIOO, Daylet, and comparison articles. “Holiday let” is the UK term for the same job. Many competitors take card payments. | Strong for the operating problem. Weak if the page implies checkout or payment. |
| Vacation rental cleaning schedule | Dedicated turnover apps (Staymaker, GleamSync, TurnCal, hostcare, CleanClac) that assign cleaners and notify them. | Partial. Hostvia shows departures. It does not dispatch cleaners. A page that pretends otherwise will not match the intent. |

Competitors in those results often promise “no double bookings”. Hostvia must not copy that promise. The accurate claim is that import plus export lowers the risk and leaves a delay.

## Keyword-to-page map

One page per intent. Near-duplicate keyword variants stay on the same URL.

| Primary topic | Supporting topics on the same page | Intent | Reader | Page | Business objective | Priority | Evidence and limits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vacation rental management for small hosts | short-term rental software, small property manager, free for two properties | Commercial investigation | Owner of one or a few rentals comparing tools | `/` | Create an account | Highest | Homepage must say who it is for and what Free includes. No volume data. |
| Vacation rental management features | multi-property calendar, manual reservations, saved messages, arrivals | Commercial investigation | Same reader, checking whether the tool covers daily work | `/features` | Move to sign-up or pricing | High | Do not split “software”, “system”, and “app” into separate URLs. |
| How to get started | connect Airbnb calendar, connect Booking.com calendar, publish a site | Transactional / setup | Person ready to try | `/how-it-works` | Create an account | High | Steps must match the product, including Booking.com “booked dates only”. |
| Direct booking website for vacation rentals | holiday let website, guest inquiry page, direct inquiry | Commercial investigation | Owner who wants guests to write to them, not only to an OTA | `/booking-site` | Create an account | High | Do not claim the page guarantees bookings or takes payment. UK readers can use this page. No separate `/uk` URL. |
| Pricing | free vacation rental software, two properties, Pro plan | Transactional | Person comparing cost | `/pricing` | Start Free, or understand when Pro is required | High | Prices must stay tied to `FREE_PROPERTY_LIMIT` and `PRO_MONTHLY_PRICE_USD`. |
| Product questions | iCal limits, payments, cleaning overview | Informational, late stage | Skeptical owner | `/faq` | Remove a blocker, then sign up | Medium | FAQ schema uses only the visible answers. |
| Company and origin | five bungalows, rental season | Trust | Owner deciding whether the product is real | `/about` | Support sign-up | Medium | Founder story only. No customer counts. |
| Contact | setup help | Navigational | Existing or prospective user | `/contact` | Answer a question | Low for acquisition | Inbox is `hello@hostvia.me`. |
| Vacation rental calendar management | Airbnb Booking.com calendar sync, iCal delay, export | Informational | Owner trying to stop calendar chaos | `/guides/vacation-rental-calendar` | Explain the limit, then link to features and pricing | High | Written because the product can teach this accurately. |
| Vacation rental cleaning schedule | arrivals and departures, turnover list | Informational | Owner or small operator planning cleans | `/guides/vacation-rental-cleaning-schedule` | Explain the overview, then link to the product | Medium | Competing pages assume cleaner dispatch. This page must say Hostvia does not do that. |
| Guest accommodation site | property name, location the host entered | Navigational / guest booking | A guest, not a property owner | `/host/[username]` or `username.hostvia.me` | Inquiry to that host | Separate from SaaS SEO | Do not put these URLs in the marketing sitemap. Do not build country landing pages for them. |

## Topics deliberately left without a new page

| Topic | Why there is no dedicated URL |
| --- | --- |
| “Vacation rental management software”, “short-term rental management software”, “property management software for small vacation rental owners” | Same intent as the homepage and `/features`. |
| “Holiday let management software” | Same intent as the homepage and `/booking-site`. The calendar guide mentions the UK term once. A `/uk` page would be a near-duplicate. |
| “Airbnb and Booking.com calendar synchronization” as its own marketing URL | Covered by `/features`, `/how-it-works`, the FAQ, and the calendar guide. |
| Cleaner assignment, turnover apps, SMS to cleaners | The product does not do this. A page aimed at that intent would be misleading. |
| United States, United Kingdom, Australia, Canada as separate country pages | No pricing, legal, tax, or feature difference by country was found. Pro is 20 USD. Stay prices inside a host account are entered in euros. That is a product fact, not a reason for four country landers. |
| Balkan destinations | Out of scope for this SEO project. |

## How to use this map

1. Keep the primary topic in the title and the first paragraph.
2. Add supporting phrases only where they describe a real feature.
3. When Search Console later shows a query with impressions and a poor click rate, adjust the existing page. Do not create a second page for a synonym.
4. Revisit this file after 60 days of Search Console data. That is the first time real queries, not estimated volumes, will exist for this domain.
