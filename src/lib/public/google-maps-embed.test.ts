import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { googleMapsUrlToEmbed } from "@/lib/public/google-maps-embed";

describe("googleMapsUrlToEmbed", () => {
  it("prefers !8m2 place pin over earlier !3d!4d pairs", () => {
    const url =
      "https://www.google.com/maps/place/Test/@42.29,18.84,17z/data=!3m1!4b1!4m14!1m7!3m6!1s0x0:0x0!2zNDI!3b1!8m2!3d42.28!4d18.83!3m5!1s0x0:0x1!8m2!3d42.291111!4d18.849999!16s%2Fg%2F11";

    assert.equal(
      googleMapsUrlToEmbed(url),
      "https://www.google.com/maps?q=42.291111%2C18.849999&ll=42.291111,18.849999&z=17&hl=en&output=embed"
    );
  });

  it("uses last !3d!4d when !8m2 is absent", () => {
    const url =
      "https://www.google.com/maps/place/Test/@42.29,18.84,17z/data=!3d42.28!4d18.83!3d42.291111!4d18.849999";

    assert.equal(
      googleMapsUrlToEmbed(url),
      "https://www.google.com/maps?q=42.291111%2C18.849999&ll=42.291111,18.849999&z=17&hl=en&output=embed"
    );
  });

  it("does not put place names into q (avoids re-geocode drift)", () => {
    const url =
      "https://www.google.com/maps/place/Bungalows+Fairy+tale/@43.157134,19.0948597,17z/data=!8m2!3d43.157134!4d19.09744";

    const embed = googleMapsUrlToEmbed(url);
    assert.ok(embed);
    assert.match(embed!, /q=43\.157134%2C19\.09744/);
    assert.doesNotMatch(embed!, /Fairy/);
  });

  it("parses /maps/search/lat,lng links", () => {
    assert.equal(
      googleMapsUrlToEmbed("https://www.google.com/maps/search/42.4412,+19.2621"),
      "https://www.google.com/maps?q=42.4412%2C19.2621&ll=42.4412,19.2621&z=17&hl=en&output=embed"
    );
  });

  it("keeps camera @ coords when no pin data exists", () => {
    assert.equal(
      googleMapsUrlToEmbed("https://www.google.com/maps/@42.4412,19.2621,17z"),
      "https://www.google.com/maps?q=42.4412%2C19.2621&ll=42.4412,19.2621&z=17&hl=en&output=embed"
    );
  });
});
