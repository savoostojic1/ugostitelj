import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Globe,
  Layers,
  MessageSquare,
  RefreshCw,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

export const marketingNav = [
  { href: "/funkcije", label: "Funkcije" },
  { href: "/kako-radi", label: "Kako radi" },
  { href: "/javni-sajt", label: "Javni sajt" },
  { href: "/cijene", label: "Cijene" },
  { href: "/faq", label: "FAQ" },
] as const;

export const marketingFooter = {
  product: [
    { href: "/funkcije", label: "Funkcije" },
    { href: "/kako-radi", label: "Kako radi" },
    { href: "/javni-sajt", label: "Javni sajt" },
    { href: "/cijene", label: "Cijene" },
  ],
  company: [
    { href: "/o-nama", label: "O nama" },
    { href: "/kontakt", label: "Kontakt" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/privatnost", label: "Privatnost" },
    { href: "/uslovi", label: "Uslovi korištenja" },
  ],
  contact: {
    email: "hello@ugostitelj.me",
  },
} as const;

export interface MarketingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const coreFeatures: MarketingFeature[] = [
  {
    icon: RefreshCw,
    title: "iCal sinhronizacija",
    description:
      "Povežite Airbnb i Booking.com kalendare jednim linkom. Sve rezervacije se automatski povlače u jedan pregled.",
  },
  {
    icon: Layers,
    title: "Više jedinica na jednom mjestu",
    description:
      "Upravljajte apartmanima, bungalovima i sobama iz jednog dashboarda — sa zasebnim kalendarima po jedinici.",
  },
  {
    icon: Globe,
    title: "Vaš javni sajt",
    description:
      "Objavite stranicu za goste sa pretragom datuma, galerijom, mapom i direktnim upitima za rezervaciju.",
  },
  {
    icon: Wallet,
    title: "Cijene po datumima",
    description:
      "Postavite osnovnu cijenu i posebne cijene za sezonu, praznike ili vikende — gosti vide tačan iznos boravka.",
  },
  {
    icon: Upload,
    title: "Ručne rezervacije i export",
    description:
      "Blokirajte datume, unesite direktne bookinge i izvezite kalendar natrag na platforme.",
  },
  {
    icon: MessageSquare,
    title: "Booking upiti",
    description:
      "Gosti šalju upit direktno vama — bez provizije platforme. Vi odlučujete da li prihvatate.",
  },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Napravite nalog",
    description:
      "Registracija traje manje od minute. Dodajte prvu jedinicu — apartman, sobu ili bungalov.",
  },
  {
    step: "02",
    title: "Povežite kalendare",
    description:
      "Zalijepite iCal link sa Airbnb-a ili Booking.com-a. Rezervacije se automatski sinhronizuju.",
  },
  {
    step: "03",
    title: "Objavite javni sajt",
    description:
      "Dodajte fotografije, opis, cijene i lokaciju. Podijelite link sa gostima i društvenim mrežama.",
  },
  {
    step: "04",
    title: "Primajte upite",
    description:
      "Gosti biraju datume, vide dostupnost i cijenu, pa vam šalju upit. Vi potvrdite i dogovorite detalje.",
  },
];

export const publicSiteFeatures: MarketingFeature[] = [
  {
    icon: CalendarDays,
    title: "Pretraga po datumu",
    description:
      "Gosti biraju dolazak, odlazak i broj osoba — vide samo slobodne jedinice sa tačnom cijenom boravka.",
  },
  {
    icon: Layers,
    title: "Pregled svih jedinica",
    description:
      "Kalendar dostupnosti po jedinici, galerija do 10 fotografija i jasne informacije o kapacitetu.",
  },
  {
    icon: Globe,
    title: "Profesionalan izgled",
    description:
      "Cover fotografija, brendirani profil, mapa lokacije i kontakt — sve bez programiranja.",
  },
  {
    icon: Users,
    title: "Direktni odnos sa gostom",
    description:
      "Upiti idu direktno vama. Nema posrednika, nema skrivenih provizija na direktne bookinge.",
  },
];

export const pricingPlans = [
  {
    name: "Besplatno",
    price: "0 €",
    period: "trenutno",
    description: "Sve funkcije dostupne dok traje raniji pristup.",
    highlighted: true,
    features: [
      "Neograničen broj jedinica",
      "iCal sync (Airbnb, Booking.com)",
      "Javni sajt sa booking upitima",
      "Cijene po datumima",
      "Galerija i mapa lokacije",
      "Ručne rezervacije i iCal export",
      "PWA — instalacija na telefon",
    ],
    cta: "Kreni besplatno",
    href: "/register",
  },
  {
    name: "Pro",
    price: "Uskoro",
    period: "",
    description: "Napredne funkcije za veće portfolije i timove.",
    highlighted: false,
    features: [
      "Sve iz Besplatnog plana",
      "Više korisnika po nalogu",
      "Prioritetna podrška",
      "Napredna analitika",
      "Prilagođeni domen",
    ],
    cta: "Kontaktiraj nas",
    href: "/kontakt",
  },
];

export const faqItems = [
  {
    question: "Šta je Ugostitelj?",
    answer:
      "Ugostitelj je platforma za domaćine kratkoročnog smještaja. Kombinuje kalendar za Airbnb i Booking.com sa vašim vlastitim javnim sajtom za direktne upite gostiju — sve na jednom mjestu.",
  },
  {
    question: "Da li trebam Airbnb ili Booking API?",
    answer:
      "Ne. Ugostitelj koristi iCal (ICS) kalendare koje platforme već nude. Zalijepite link, rezervacije se automatski uvezu — bez tehničke integracije.",
  },
  {
    question: "Kako funkcionišu booking upiti?",
    answer:
      "Gost na vašem javnom sajtu bira datume, vidi cijenu i šalje upit sa kontakt podacima. Vi dobijate obavještenje u dashboardu, pregledate detalje i kontaktirate gosta direktno.",
  },
  {
    question: "Da li gosti mogu platiti preko Ugostitelja?",
    answer:
      "Trenutno Ugostitelj nije payment procesor. Upiti su zahtjev za rezervaciju — plaćanje i potvrda dogovaraju se direktno između vas i gosta.",
  },
  {
    question: "Mogu li koristiti Ugostitelj samo kao kalendar?",
    answer:
      "Da. Javni sajt je opcionalan. Možete koristiti dashboard isključivo za sinhronizaciju kalendara, ručne rezervacije i pregled dolazaka i odlazaka.",
  },
  {
    question: "Kako se sinhronizuju promjene?",
    answer:
      "Kalendari se automatski osvježavaju u pozadini. Možete i ručno pokrenuti sync iz dashboarda kad god želite.",
  },
  {
    question: "Da li mogu izvesti kalendar natrag na Airbnb/Booking?",
    answer:
      "Da. Svaka jedinica ima iCal export link koji možete dodati u Airbnb ili Booking.com da bi platforme vidjele vaše ručne blokade i direktne rezervacije.",
  },
  {
    question: "Za koga je Ugostitelj namijenjen?",
    answer:
      "Za nezavisne domaćine, mala apartmanska naselja i ugostitelje u regionu koji žele jednostavniji rad sa više kanala prodaje i direktnim kontaktom sa gostima.",
  },
];

export const dashboardFeatures = [
  {
    title: "Pregled kalendara",
    description:
      "Mjesečni pregled svih rezervacija — check-in, check-out i boravak u jednom pogledu, sa oznakama platforme.",
  },
  {
    title: "Kalendari po jedinicama",
    description:
      "Kompaktan prikaz dostupnosti za svaku jedinicu odjednom — idealno za brzu provjeru slobodnih termina.",
  },
  {
    title: "Dolasci i odlasci",
    description:
      "Operativni pregled ko dolazi i odlazi danas — olakšava planiranje čišćenja i dočeka gostiju.",
  },
  {
    title: "Porouka",
    description:
      "Sačuvajte gotove poruke za goste — brže odgovaranje na upite i manje ponavljanja istog teksta.",
  },
  {
    title: "PWA aplikacija",
    description:
      "Instalirajte Ugostitelj na telefon kao aplikaciju — brz pristup kalendaru bez otvaranja browsera.",
  },
];

export const homepageStats = [
  { value: "2+", label: "platforme u sync-u" },
  { value: "1", label: "dashboard za sve" },
  { value: "0%", label: "provizije na direktne upite" },
];
