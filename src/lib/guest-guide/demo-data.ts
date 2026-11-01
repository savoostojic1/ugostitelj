import type { GuestGuideDocument } from "@/lib/guest-guide/types";
import { defaultSectionVisibility } from "@/lib/guest-guide/defaults";

/** Royalty-free Unsplash photography for the interactive demo only. */
const IMG = {
  cover:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
  host:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  entry:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  pool:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  kitchen:
    "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1200&q=80",
  terrace:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  cafe:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  market:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",
};

export const DEMO_GUIDE: GuestGuideDocument = {
  theme: "signature-beige",
  sectionOrder: [
    "welcome",
    "checkin",
    "wifi",
    "property",
    "rules",
    "checkout",
    "local",
    "emergency",
    "contact",
  ],
  sectionVisibility: defaultSectionVisibility(),
  content: {
    welcome: {
      propertyName: "Villa Oliva",
      location: "Lustica Peninsula, Montenegro",
      subtitle: "A quiet Mediterranean retreat above the Adriatic",
      message:
        "Welcome to Villa Oliva. We are so glad you chose to stay with us. This guide gathers everything you need for a smooth arrival, a comfortable stay and a few of our favourite local places. Settle in, pour a glass of wine on the terrace, and enjoy the stillness of the bay.",
      hostName: "Ana & Marko",
      hostPhotoUrl: IMG.host,
      coverPhotoUrl: IMG.cover,
      contactNote: "Message us anytime — we are nearby and happy to help.",
    },
    checkin: {
      checkInTime: "15:00",
      address: "Put Obala 12, Radovići, Lustica Peninsula, Montenegro",
      arrivalInstructions:
        "Drive along the coastal road toward Radovići. Turn left at the olive grove stone gate marked Villa Oliva. The villa is the second driveway on the right.",
      parkingInstructions:
        "Two covered parking spaces are reserved for guests directly beside the entrance. Please leave the shared access lane clear for neighbours.",
      keyCollection:
        "A lockbox is mounted to the right of the front door. We will send the code privately before arrival — it is never published in this guide.",
      entryInstructions:
        "Enter through the main wooden door into the foyer. Light switches for the hallway and terrace are on the left wall. The welcome folder and pool towels are on the kitchen island.",
      mapLink: "https://maps.google.com/?q=Lustica+Peninsula+Montenegro",
      photos: [
        {
          id: "demo-entry",
          url: IMG.entry,
          alt: "Stone entrance path to Villa Oliva",
        },
      ],
    },
    checkout: {
      checkOutTime: "11:00",
      departureInstructions:
        "Please leave beds unmade and used towels in the bathroom. Stack dishes in the dishwasher if you used it. Close all windows and terrace doors.",
      keyReturn:
        "Return the keys to the lockbox and scramble the dial. Confirm checkout with a short message so we can welcome the next guests smoothly.",
      cleaningExpectations:
        "No deep cleaning is expected — just leave the villa tidy. Extra cleaning fees apply only if the home is left in an unreasonable condition.",
      wasteDisposal:
        "Sort recycling into the labelled bins in the utility closet. General waste goes in the grey bin by the parking area. Collection is every Tuesday and Friday morning.",
      otherInfo:
        "If you have an early flight, let us know — early checkout bags can be left securely in the foyer.",
    },
    wifi: {
      networkName: "VillaOliva-Guest",
      password: "olivebay2024",
      instructions:
        "The strongest signal is in the living room and master suite. If the connection drops after a storm, restart the white router in the utility closet (unplug 20 seconds, then plug back in).",
    },
    property: [
      {
        id: "demo-ac",
        title: "Air conditioning",
        description:
          "Each bedroom has a wall unit. Use the remote marked with the room name. Please turn units off when you leave for the day.",
        icon: "snowflake",
      },
      {
        id: "demo-kitchen",
        title: "Kitchen",
        description:
          "Fully equipped for cooking: induction hob, oven, dishwasher, Nespresso machine and a filtered water tap. Starter coffee pods and olive oil are provided.",
        icon: "utensils",
        imageUrl: IMG.kitchen,
      },
      {
        id: "demo-pool",
        title: "Swimming pool",
        description:
          "The pool is open from 08:00–22:00. Shower before swimming. No glassware on the pool deck — acrylic glasses are in the outdoor cabinet.",
        icon: "waves",
        imageUrl: IMG.pool,
      },
      {
        id: "demo-terrace",
        title: "Terrace & garden",
        description:
          "Outdoor dining for six, a gas barbecue and shaded loungers. The olive trees are ornamental — please do not climb them.",
        icon: "sun",
        imageUrl: IMG.terrace,
      },
      {
        id: "demo-washer",
        title: "Washing machine",
        description:
          "Located in the utility closet. Detergent is under the sink. A short outdoor drying line is behind the garage.",
        icon: "washing-machine",
      },
      {
        id: "demo-tv",
        title: "Television",
        description:
          "Smart TV in the living room with Netflix and YouTube. Sign in with your own accounts — please sign out before departure.",
        icon: "tv",
      },
    ],
    rules: [
      {
        id: "demo-smoke",
        title: "Smoking",
        description:
          "No smoking indoors. Outdoor smoking is allowed on the far terrace away from soft furnishings. Please use the ashtray provided.",
      },
      {
        id: "demo-pets",
        title: "Pets",
        description:
          "Pets are welcome with prior approval. Keep pets off the sofas and out of the pool. A pet towel is in the utility closet.",
      },
      {
        id: "demo-parties",
        title: "Parties & events",
        description:
          "Quiet residential stays only. No parties, events or additional overnight guests without written confirmation.",
      },
      {
        id: "demo-quiet",
        title: "Quiet hours",
        description:
          "Please keep noise low between 23:00 and 08:00 out of respect for neighbouring homes.",
      },
      {
        id: "demo-occupancy",
        title: "Maximum occupancy",
        description: "The villa sleeps 6 guests comfortably. Do not exceed this number.",
      },
    ],
    local: [
      {
        id: "demo-rest",
        category: "restaurants",
        name: "Konoba Ribar",
        description:
          "Family-run seafood tavern on the water. Ask for the catch of the day and the grilled squid.",
        photoUrl: IMG.restaurant,
        address: "Žanjice Bay",
        mapsLink: "https://maps.google.com/?q=Konoba+Ribar+Zanjice",
        website: "",
      },
      {
        id: "demo-cafe",
        category: "cafes",
        name: "Olive Press Café",
        description:
          "Slow mornings, excellent espresso and homemade focaccia under the olive trees.",
        photoUrl: IMG.cafe,
        address: "Radovići centre",
        mapsLink: "https://maps.google.com/?q=Radovici+Montenegro",
        website: "",
      },
      {
        id: "demo-beach",
        category: "beaches",
        name: "Žanjice Beach",
        description:
          "Pebble beach with clear water and kayak rentals. Best light is early morning or late afternoon.",
        photoUrl: IMG.beach,
        address: "Žanjice",
        mapsLink: "https://maps.google.com/?q=Zanjice+Beach",
        website: "",
      },
      {
        id: "demo-market",
        category: "supermarkets",
        name: "Voli Market Tivat",
        description:
          "Largest supermarket nearby — ideal for a full grocery run on arrival day.",
        photoUrl: IMG.market,
        address: "Tivat",
        mapsLink: "https://maps.google.com/?q=Voli+Tivat",
        website: "",
      },
    ],
    emergency: {
      numbers: [
        { id: "demo-eu", label: "Emergency (EU)", value: "112" },
        { id: "demo-police", label: "Police", value: "122" },
        { id: "demo-ambulance", label: "Ambulance", value: "124" },
        { id: "demo-fire", label: "Fire", value: "123" },
      ],
      nearestHospital: "General Hospital Tivat — about 20 minutes by car.",
      nearestPharmacy: "Pharmacy in Radovići centre (closed Sundays).",
      localContacts: "Villa caretaker Marko is available for urgent property issues.",
      instructions:
        "In a medical emergency call 112 first. Then message us so we can help with directions or translation.",
    },
    contact: {
      hostName: "Ana & Marko",
      phone: "+382 67 000 000",
      whatsapp: "+38267000000",
      email: "hosts@villaoliva.example",
      website: "https://hostvia.me",
    },
  },
};
