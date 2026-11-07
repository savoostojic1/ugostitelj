import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertSupportedCurrency,
  currencyFractionDigits,
  defaultPropertyCurrency,
  filterCurrencies,
  isSupportedCurrency,
  SUPPORTED_CURRENCIES,
} from "@/lib/currency/currencies";
import {
  currencyForReservationDisplay,
  formatPropertyPrice,
  priceSnapshotFromStay,
  publicBookingPriceLines,
  reservationMoneyLabels,
} from "@/lib/currency/format";
import {
  guestEmail,
  ownerEmail,
  type ReservationEmailData,
} from "@/lib/notifications/email-templates";
import { buildGuestReservationView } from "@/lib/reservations/guest-access";

const REQUIRED = [
  "EUR",
  "USD",
  "CAD",
  "GBP",
  "AUD",
  "NZD",
  "CHF",
  "JPY",
  "CNY",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "TRY",
  "MXN",
  "BRL",
  "INR",
  "ZAR",
] as const;

test("supported currencies include the required ISO codes and reject anything else", () => {
  for (const code of REQUIRED) {
    assert.equal(isSupportedCurrency(code), true);
    assert.equal(isSupportedCurrency(code.toLowerCase()), true);
  }
  assert.equal(assertSupportedCurrency(" usd "), "USD");
  assert.equal(isSupportedCurrency("US$"), false);
  assert.equal(isSupportedCurrency("EURO"), false);
  assert.equal(isSupportedCurrency("BTC"), false);
  assert.throws(() => assertSupportedCurrency("BTC"), /supported currency/);
});

test("EUR, CAD, USD and GBP use Intl currency formatting", () => {
  assert.equal(formatPropertyPrice(10, "EUR"), "€10");
  assert.equal(formatPropertyPrice(10.5, "EUR"), "€10.50");
  assert.equal(formatPropertyPrice(10.5, "USD"), "$10.50");
  assert.equal(formatPropertyPrice(10.5, "CAD"), "CA$10.50");
  assert.equal(formatPropertyPrice(10.5, "GBP"), "£10.50");
  assert.equal(formatPropertyPrice(10.5, "not-a-currency"), "€10.50");
});

test("zero-decimal and three-decimal currencies keep their minor units", () => {
  assert.equal(currencyFractionDigits("JPY"), 0);
  assert.equal(formatPropertyPrice(1200, "JPY"), "¥1,200");
  assert.equal(formatPropertyPrice(1200.6, "JPY"), "¥1,201");
  assert.doesNotMatch(formatPropertyPrice(1200, "JPY"), /\./);

  assert.equal(currencyFractionDigits("KWD"), 3);
  assert.equal(currencyFractionDigits("BHD"), 3);
  assert.match(formatPropertyPrice(1.234, "KWD").replace(/\u00a0|\u202f/g, " "), /1\.234/);
  assert.match(formatPropertyPrice(1.2, "BHD").replace(/\u00a0|\u202f/g, " "), /1\.200/);
});

test("one account can price properties in different currencies", () => {
  const properties = [
    { id: "montenegro", currencyCode: "EUR" },
    { id: "canada", currencyCode: "CAD" },
    { id: "united-states", currencyCode: "USD" },
    { id: "united-kingdom", currencyCode: "GBP" },
  ];
  const labels = properties.map((property) =>
    formatPropertyPrice(100, property.currencyCode)
  );
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(labels[0], "€100");
  assert.equal(labels[1], "CA$100");
  assert.equal(labels[2], "$100");
  assert.equal(labels[3], "£100");
});

test("a reservation keeps its original currency after the property currency changes", () => {
  const booked = priceSnapshotFromStay({
    currencyCode: "CAD",
    totalAmount: 240,
    nights: 2,
  });
  const propertyCurrencyAfterChange = "EUR";

  assert.equal(booked.currency_code, "CAD");
  assert.equal(booked.total_amount, 240);
  assert.equal(booked.nightly_rate, 120);
  assert.equal(
    currencyForReservationDisplay({
      reservationCurrency: booked.currency_code,
      propertyCurrency: propertyCurrencyAfterChange,
    }),
    "CAD"
  );
  assert.equal(
    reservationMoneyLabels({
      currencyCode: booked.currency_code,
      totalAmount: booked.total_amount,
      nightlyRate: booked.nightly_rate,
    }).totalLabel,
    "CA$240"
  );
});

test("new properties default to EUR unless a country code is already known", () => {
  assert.equal(defaultPropertyCurrency(null), "EUR");
  assert.equal(defaultPropertyCurrency("Montenegro"), "EUR");
  assert.equal(defaultPropertyCurrency("ME"), "EUR");
  assert.equal(defaultPropertyCurrency("CA"), "CAD");
  assert.equal(defaultPropertyCurrency("US"), "USD");
  assert.equal(defaultPropertyCurrency("GB"), "GBP");
  assert.equal(defaultPropertyCurrency("ZZ"), "EUR");
});

test("currency search matches name, code and symbol", () => {
  assert.equal(
    filterCurrencies("canada").some((currency) => currency.code === "CAD"),
    true
  );
  assert.equal(
    filterCurrencies("gbp").some((currency) => currency.code === "GBP"),
    true
  );
  assert.equal(
    filterCurrencies("¥").some((currency) => currency.code === "JPY"),
    true
  );
  assert.equal(filterCurrencies("not-a-currency").length, 0);
});

test("public booking price lines use the property currency", () => {
  const cad = publicBookingPriceLines({
    total: 360,
    nightlyRate: 90,
    nights: 4,
    currencyCode: "CAD",
  });
  const eur = publicBookingPriceLines({
    total: 360,
    nightlyRate: 90,
    nights: 4,
    currencyCode: "EUR",
  });

  assert.equal(cad.total, "CA$360");
  assert.equal(cad.perNight, "CA$90 per night");
  assert.equal(cad.stayLine, "4 nights · CA$360 total");
  assert.equal(eur.total, "€360");
  assert.notEqual(cad.total, eur.total);
  assert.doesNotMatch(`${cad.total} ${cad.perNight} ${cad.stayLine}`, /€/);
});

test("guest page and emails show the snapshotted currency", () => {
  const money = reservationMoneyLabels({
    currencyCode: "GBP",
    totalAmount: 360,
    nightlyRate: 90,
  });
  const view = buildGuestReservationView(
    {
      status: "accepted",
      expiresAt: "2027-06-01T00:00:00.000Z",
      reference: "HV-AB23CD45",
      propertyName: "Stone House",
      propertyAddress: "London",
      checkIn: "2026-12-01",
      checkOut: "2026-12-05",
      guestCount: 2,
      guestName: "Ada Guest",
      currencyCode: "GBP",
      totalAmount: 360,
      nightlyRate: 90,
    },
    new Date("2026-11-01T00:00:00.000Z")
  );
  assert.equal(view.state, "active");
  if (view.state !== "active") return;
  assert.equal(view.totalLabel, "£360");
  assert.equal(view.nightlyLabel, "£90");
  assert.equal(view.totalLabel, money.totalLabel);

  const data: ReservationEmailData = {
    locale: "en",
    propertyName: "Stone House",
    propertyAddress: "London",
    houseRules: null,
    checkInLabel: "1 Dec 2026",
    checkOutLabel: "5 Dec 2026",
    guestCountLabel: "2 guests",
    guestName: "Ada Guest",
    guestEmail: "ada@example.com",
    guestPhone: "+447700900000",
    reference: "HV-AB23CD45",
    manageUrl: "https://www.hostvia.me/reservation/manage/example-token",
    dashboardUrl: "https://www.hostvia.me/dashboard/booking-requests",
    hostName: "Petra",
    hostEmail: "petra@example.com",
    hostPhone: null,
    cancelledAtLabel: "2 Nov 2026, 15:04",
    cancelledBy: "guest",
    message: null,
    currencyCode: "GBP",
    totalAmount: 360,
    nightlyRate: 90,
  };

  const messages = [
    guestEmail("request_received", data),
    guestEmail("confirmed", data),
    guestEmail("cancelled_by_guest", data),
    guestEmail("cancelled_by_owner", data),
    ownerEmail("request_received", data),
    ownerEmail("confirmed", data),
    ownerEmail("cancelled_by_guest", data),
    ownerEmail("cancelled_by_owner", data),
  ];

  for (const message of messages) {
    assert.match(message.text, /Total: £360/);
    assert.match(message.text, /Nightly rate: £90/);
    assert.match(message.html, /£360/);
    assert.match(message.html, /£90/);
    assert.doesNotMatch(message.text, /€/);
    assert.doesNotMatch(message.html, /€/);
  }
});

test("migration stores ISO codes, defaults existing rows to EUR, and does not rewrite prices", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/040_property_currency.sql"),
    "utf8"
  );

  for (const currency of SUPPORTED_CURRENCIES) {
    assert.match(sql, new RegExp(`'${currency.code}'`));
    const digits = currencyFractionDigits(currency.code);
    if (digits === 2) {
      assert.doesNotMatch(sql, new RegExp(`when '${currency.code}' then`));
    } else {
      assert.match(sql, new RegExp(`when '${currency.code}' then ${digits}`));
    }
  }

  assert.match(sql, /currency_code text/);
  assert.match(sql, /set default 'EUR'/);
  assert.match(sql, /set currency_code = 'EUR'/);
  assert.match(sql, /set total_amount = price/);
  assert.match(sql, /currency_code,/);
  assert.match(sql, /nightly_rate,/);
  assert.match(sql, /total_amount/);
  assert.doesNotMatch(sql, /set\s+starting_price/i);
  assert.doesNotMatch(sql, /set\s+price_per_night/i);
  assert.doesNotMatch(sql, /set\s+price\s*=/i);
  assert.match(sql, /v_request\.total_amount/);
  assert.match(sql, /v_request\.currency_code/);
});
