# Hostvia.me — spisak postojećih funkcionalnosti

Ovaj dokument opisuje samo ono što aplikacija Hostvia.me danas stvarno nudi vlasniku smještaja, gostu i, gdje je to odvojeno, timu koji vodi platformu.

Status je procijenjen prema tome da li je funkcija ugrađena i povezana od početka do kraja:

- **Potpuno funkcionalna** — može se koristiti kako je opisano.
- **Djelimično funkcionalna** — postoji, ali ima jasno ograničenje ili zavisi od dodatnog podešavanja.
- **Nije potvrđeno da radi** — u ovom pregledu nije bilo takvih stavki. Ono što nije moglo da se potvrdi kao stvarna funkcija nije ušlo u spisak.

Jezik aplikacije je engleski. Cijene smještaja se unose i prikazuju u eurima. Hostvia ne naplaćuje boravak gosta: gost šalje upit, a dogovor i plaćanje ostaju između gosta i vlasnika.

---

## 1. Upravljanje smještajem

### Dodavanje smještaja
Vlasnik unosi naziv objekta (stan, soba, studio, vila i slično) i odmah dobija novi smještaj u svom nalogu. Nakon čuvanja aplikacija ga vodi na povezivanje kalendara. Na slobodnom paketu može imati do dva aktivna objekta; dalje dodavanje traži Pro paket.
**Status:** potpuno funkcionalna

### Spisak svih objekata
Stranica „All properties“ pokazuje svaki aktivan smještaj, broj rezervacija i brzi ulaz u podešavanja. Ako još nema objekata, vlasnik vidi kratko uputstvo: naziv, kalendar, objava.
**Status:** potpuno funkcionalna

### Promjena naziva
Naziv objekta može da se izmijeni direktno na stranici tog smještaja, bez ponovnog kreiranja.
**Status:** potpuno funkcionalna

### Brisanje objekta
Vlasnik može trajno ukloniti smještaj. Isto važi i za objekat koji je zaključan zbog limita besplatnog paketa.
**Status:** potpuno funkcionalna

### Objava ili sakrivanje pojedinačnog objekta
Svaki smještaj ima prekidač „Show on my booking site“. Dok nije objavljen, ostaje vidljiv samo u kontrolnoj tabli. Kad je objavljen, gost ga vidi na javnom sajtu i može poslati upit. Objava ima smisla tek kad je i sam sajt za rezervacije uključen.
**Status:** potpuno funkcionalna

### Osnovna cijena po noći
Vlasnik unosi osnovnu cijenu u eurima. Ta cijena važi za dane koji nemaju poseban period i ulazi u ukupan iznos koji gost vidi prije slanja upita.
**Status:** potpuno funkcionalna

### Cijene po periodima
Na kalendaru cijena vlasnik klikne jedan dan ili raspon dana, unese cijenu po noći i sačuva period. Uži period ima prednost nad širim. Period se može obrisati. Gost zbog toga vidi zbir stvarnih noći, a ne samo jednu fiksnu cijenu za cijelu godinu.
**Status:** potpuno funkcionalna

### Fotografije objekta
Za svaki smještaj može da se doda do 10 fotografija (JPG, PNG, WebP ili GIF, do 5 MB). Prva fotografija je naslovna. Redoslijed se mijenja, a fotografija se može ukloniti. Galerija se prikazuje gostu, uključujući pregled u punoj veličini.
**Status:** potpuno funkcionalna

### Opis, kapacitet i sadržaji
Vlasnik upisuje kratak opis, broj gostiju i sadržaje odvojene zarezom (na primjer WiFi, parking, klima, bazen). Kapacitet služi da pretraga na javnom sajtu ne nudi objekat koji je premali za traženi broj gostiju.
**Status:** potpuno funkcionalna

### Pregled javne stranice objekta
Sa podešavanja objavljenog smještaja vlasnik može otvoriti svoj sajt za rezervacije i vidjeti kako gost vidi ponudu.
**Status:** potpuno funkcionalna

### Zaključani objekti iznad limita
Ako nalog padne na besplatni paket, a ima više od dva smještaja, aktivna ostaju dva najstarija. Ostali su zaključani: ne uređuju se, ne ulaze u kalendare i operativne preglede i ne prikazuju se gostima. Mogu da se obrišu ili otključaju nadogradnjom na Pro.
**Status:** potpuno funkcionalna

### Vodič za prvo podešavanje
Dok početni koraci nisu završeni, vlasnik na kontrolnoj tabli vidi četiri koraka: dodati smještaj, povezati Airbnb ili Booking kalendar, napraviti sajt za rezervacije i objaviti taj smještaj. Svaki korak vodi na pravo mjesto. Kad je sve gotovo, vodič se sklanja.
**Status:** potpuno funkcionalna

---

## 2. Dashboard

### Početni pregled poslovanja
Glavna stranica, kad već postoji bar jedan smještaj, pokazuje popunjenost portfolija za narednih 28 dana, dolaske danas, odlaske danas, broj rezervacija u ovoj sedmici i broj aktivnih objekata.
**Status:** potpuno funkcionalna

**Korist:** vlasnik u jednom pogledu vidi koliko je zauzet i šta se dešava danas, bez otvaranja svakog kalendara posebno.

### Dolasci i odlasci na kontrolnoj tabli
Tri liste: dolasci danas, odlasci danas i naredni dolasci (do pet, sa datumom i nazivom objekta). Iz narednih dolazaka vodi link ka punom pregledu dolazaka.
**Status:** potpuno funkcionalna

### Prečice ka objektima
Na kontrolnoj tabli je do šest smještaja, sa bojom i brojem rezervacija. Klik otvara taj objekat.
**Status:** potpuno funkcionalna

### Brze akcije
Sa vrha kontrolne table vlasnik otvara sajt za rezervacije ili dodaje novi smještaj. Isto dugme za novi smještaj stoji i na dnu bočnog menija.
**Status:** potpuno funkcionalna

### Ručno osvježavanje svih kalendara
Dugme Sync (na telefonu „Reload data“) povlači sve povezane kalendare odjednom i javlja rezultat. Koristi se kad vlasnik želi svježe podatke odmah, a ne da čeka automatsko osvježavanje.
**Status:** potpuno funkcionalna

### Brzo kopiranje sačuvanih poruka
Ako postoje sačuvane poruke, u zaglavlju je padajući meni koji kopira tekst poruke. Vlasnik je lijepi u Viber, WhatsApp ili mejl bez vraćanja na stranicu poruka.
**Status:** potpuno funkcionalna

### Bočni meni
Meni je podijeljen na pregled, smještaj, direktne rezervacije, nalog i tim. Na telefonu se otvara kao preklopni meni. Član tima vidi samo odjeljke koje mu je vlasnik dozvolio. Odjava je na dnu menija.
**Status:** potpuno funkcionalna

---

## 3. Kalendar i dostupnost

### Uvoz kalendara sa Airbnb-a, Booking.com-a i drugih iCal izvora
Za svaki objekat vlasnik dodaje link kalendara, bira platformu (Airbnb, Booking.com ili drugi iCal izvor) i daje mu naziv. Rezervacije se uvlače u Hostvia. Link se kasnije može izmijeniti ili obrisati.
**Status:** potpuno funkcionalna

**Korist:** nije potrebna posebna tehnička veza sa platformama. Dovoljan je kalendarski link koji Airbnb i Booking već daju.

### Sinhronizacija jednog ili svih kalendara objekta
Svaki povezani kalendar ima „Sync now“. „Sync all“ osvježava sve linkove tog objekta. Vidi se kada je zadnji put sinhronizovan i da li je došlo do greške.
**Status:** potpuno funkcionalna

### Automatsko osvježavanje
Dok je kontrolna tabla otvorena, kalendari se sami osvježavaju otprilike jednom na sat. Postoji i pozadinsko osvježavanje, tako da vlasnik ne mora ručno da vuče linkove svaki dan.
**Status:** potpuno funkcionalna

### Uputstvo za povezivanje
Na stranici sinhronizacije su koraci za kopiranje linka sa Airbnb-a i Booking.com-a, sa direktnim otvaranjem njihovih stranica kalendara. Za Booking je istaknuto da treba izvesti samo zauzete datume, jer zatvoreni dani inače mogu ući kao prave rezervacije.
**Status:** potpuno funkcionalna

### Prepoznavanje zatvorenih dana
Dani koje Airbnb označi kao nedostupne ili blokirane prikazuju se kao blokada, a ne kao gost. Tako vlasnik razlikuje pravu rezervaciju od dana koje je sam zatvorio na drugoj platformi. Kod Booking.com-a to zavisi od toga da li je izvoz podešen samo na zauzete datume.
**Status:** potpuno funkcionalna

### Izvoz kalendara nazad na druge platforme
Svaki objekat ima svoj izvozni link. Vlasnik ga kopira i nalijepi u Airbnb ili Booking. U izvoz ulaze aktuelni boravci. Blokade idu kao „nije dostupno“, a ručne i uvezene rezervacije kao zauzeti termini. Prošli boravci se ne šalju.
**Status:** potpuno funkcionalna

**Korist:** direktna rezervacija ili boravak sa jedne platforme može da zatvori isti termin na drugoj, pa se smanjuje rizik od duple rezervacije.

### Kalendar jednog objekta
Mjesečni prikaz rezervacija, sa razlikovanjem Airbnb-a, Booking.com-a, ručnog unosa i blokada. Ispod kalendara je lista boravaka sa datumima, a za ručne i sa izvorom, telefonom i cijenom. Može se preći na prethodni ili sljedeći objekat.
**Status:** potpuno funkcionalna

### Svi kalendari odjednom
Stranica „Calendars“ pokazuje kompaktan mjesečni kalendar za svaki aktivan objekat, sa zajedničkom promjenom mjeseca i dugmetom „Today“. Boja razlikuje objekte. Klik na objekat otvara njegov puni kalendar.
**Status:** potpuno funkcionalna

### Ručne rezervacije
Vlasnik unosi boravak koji nije došao sa Airbnb-a ili Booking.com-a: objekat, ime gosta, dolazak i odlazak, odakle je rezervacija, telefon i cijenu. Datum se bira tako da ne preklapa postojeći boravak. Rezervacija se može izmijeniti ili obrisati. Nadolazeći boravci su izdvojeni od prošlih.
**Status:** potpuno funkcionalna

**Korist:** direktan gost, porodični boravak ili dogovor van platformi ulazi u isti kalendar i u izvoz prema Airbnb-u i Bookingu.

### Čišćenja po danima
Stranica „Cleanings“ je mjesečni operativni kalendar. Za svaki dan i svaki objekat pokazuje dolazak, odlazak, boravak usred smještaja ili prazan dan. Broj čišćenja tog dana jednak je broju odlazaka. Dolazak nosi oznaku izvora: A (Airbnb), B (Booking) ili D (direktno). Na dnu je zbir slobodnih dana po objektu do kraja mjeseca.
**Status:** potpuno funkcionalna

**Korist:** vlasnik ili osoblje vidi kada treba spremiti objekat, bez posebnog spiska zadataka. Ovo nije sistem za dodjelu poslova čistačima niti za označavanje da je čišćenje završeno.

### Dolasci i odlasci
Stranica „Arrivals“ dijeli događaje na danas, sutra i ostatak ove sedmice, posebno dolaske i odlaske. Uz svaki događaj su objekat, gost ili naziv rezervacije, datumi i platforma.
**Status:** potpuno funkcionalna

---

## 4. Upiti gostiju i komunikacija

### Javna pretraga slobodnog smještaja
Gost na sajtu vlasnika bira dolazak, odlazak i broj gostiju. Dobija samo objavljene objekte koji su slobodni u tom periodu i koji primaju taj broj gostiju. Ako ništa ne odgovara, to se jasno kaže.
**Status:** potpuno funkcionalna

### Pregled svih jedinica i njihovih kalendara
Gost može otvoriti sve objekte ili kalendare dostupnosti, bez pretrage. Na kalendaru jedinice bira slobodan raspon dana. Zauzeti dani se ne mogu izabrati kao dolazak.
**Status:** potpuno funkcionalna

### Izračunata cijena boravka
Prije slanja upita gost vidi ukupan iznos, broj noći i cijenu po noći. Ako postoje posebni periodi, ukupan iznos sabira cijenu svake noći. Ako cijena nije unesena, iznos se ne prikazuje.
**Status:** potpuno funkcionalna

### Slanje upita
Gost ostavlja ime, e-poštu, telefon i po želji poruku. Nakon slanja vidi potvrdu da će ga vlasnik kontaktirati. Hostvia ne naplaćuje boravak i ne potvrđuje rezervaciju umjesto vlasnika.
**Status:** potpuno funkcionalna

### Primljena pošta upita
Vlasnik vidi upite na čekanju: gost, objekat, datumi, broj gostiju, e-pošta, telefon, poruka i vrijeme prijema. E-pošta i telefon su klikabilni, pa može odmah pisati ili zvati. Može otvoriti kalendar tog objekta.
**Status:** potpuno funkcionalna

### Prihvatanje upita
Prihvatanje pretvara upit u ručnu rezervaciju i upisuje boravak u kalendar. Termin time postaje zauzet i za druge goste i za izvoz prema drugim platformama.
**Status:** potpuno funkcionalna

### Odbijanje upita
Odbijanje, uz potvrdu, sklanja upit iz prijemnog sandučeta. Ne pravi rezervaciju.
**Status:** potpuno funkcionalna

### Obavještenje na telefonu
Ako je Hostvia instalirana kao aplikacija i obavještenja su uključena, novi upit stiže kao obavještenje sa imenom gosta, objektom i datumima. Dodir otvara listu upita. Uključivanje i gašenje je na kontrolnoj tabli i na stranici upita, i važi za taj uređaj.
**Status:** potpuno funkcionalna

### E-pošta o novom upitu
Aplikacija može poslati vlasniku e-poštu sa podacima gosta, datumima, porukom i linkom ka upitima. Slanje radi samo kad je servis za e-poštu uključen na strani platforme. Zbog toga pristizanje mejla nije zagarantovano na svakom nalogu.
**Status:** djelimično funkcionalna

### Sačuvane poruke
Vlasnik pravi, mijenja, briše i kopira gotove tekstove (dobrodošlica, uputstvo za dolazak, kućni red). To nisu poruke unutar Hostvie i nema prepiske sa gostom u aplikaciji. Tekst se kopira i šalje kanalom koji vlasnik već koristi.
**Status:** potpuno funkcionalna

### Kontakt na javnom sajtu
Gost na dnu stranice vidi telefon i e-poštu ako ih je vlasnik unio, i može ih odmah pozvati ili im pisati. Tu su i linkovi ka Instagramu i Facebooku ako su uneseni.
**Status:** potpuno funkcionalna

---

## 5. Tim i korisnici

### Nalozi za osoblje
Vlasnik pravi pristup za osoblje: naziv pristupa, po želji prikazano ime i lozinku. Korisničko ime se slaže od tog naziva i adrese sajta vlasnika. Osoblje se prijavljuje tim imenom i lozinkom, na istoj stranici za prijavu kao vlasnik.
**Status:** potpuno funkcionalna

**Napomena:** ako serversko podešavanje za tim nije spremno, ekran to jasno kaže i ne dozvoljava kreiranje. U redovnom radu platforme funkcija je predviđena za upotrebu.

### Dozvole po odjeljcima
Za svaki nalog vlasnik bira šta smije da se vidi: kontrolna tabla, čišćenja, dolasci, kalendari, objekti, ručne rezervacije, sajt za rezervacije, upiti i poruke. Osoblje ne vidi plan pretplate ni upravljanje timom. Ako nema dozvolu za podešavanja objekta, i dalje može gledati kalendar ako ima dozvolu za kalendare.
**Status:** potpuno funkcionalna

**Korist:** čistač ili pomoćnik vidi dolaske i čišćenja, a ne cijene, naplatu i podešavanja sajta.

### Lozinka i uklanjanje pristupa
Vlasnik vidi lozinku pristupnog naloga, može je promijeniti i može ukloniti pristup. Mora imati najmanje 6 znakova.
**Status:** potpuno funkcionalna

---

## 6. Prezentacija objekata

Javna stranica je sajt vlasnika, ne oglas na tuđem portalu. Gost je vidi na adresi koju vlasnik odabere. Dok sajt nije objavljen, gosti ga ne vide.

### Adresa sajta
Vlasnik bira kratko ime sajta, vidi punu adresu, kopira je i otvara stranicu. Adresa mora biti u dozvoljenom obliku. Istu adresu dijeli na društvenim mrežama, u potpisu ili u poruci gostu.
**Status:** potpuno funkcionalna

### Objava cijelog sajta
Prekidač „Publish booking site“ pali ili gasi javnu stranicu. Objava traži osnovne podatke (ime, fotografija naslovnice i kontakt), inače korak podešavanja nije završen.
**Status:** potpuno funkcionalna

### Naslovnica i predstavljanje
Vlasnik postavlja naziv, naslovnu fotografiju i uvodni tekst. Prelomi redova ostaju na stranici. Naslovna fotografija je do 5 MB, u formatima JPG, PNG, WebP ili GIF.
**Status:** potpuno funkcionalna

### Podnožje, lokacija i mapa
Poseban tekst ide u podnožje. Lokacija je kratak naziv mjesta. Google mapa se dodaje linkom; prije čuvanja vidi se pregled, a gost na stranici može uvećati ili umanjiti mapu.
**Status:** potpuno funkcionalna

### Društvene mreže
Mogu da se unesu Instagram i Facebook. Prikazuju se gostu kao linkovi.
**Status:** potpuno funkcionalna

### Kartica objekta za gosta
Objavljeni smještaj pokazuje fotografije, naziv, kratak opis, kapacitet, sadržaje i cijenu boravka kad je poznata. Galerija ima listanje i uvećan pregled.
**Status:** potpuno funkcionalna

### Naslov stranice za dijeljenje
Javna stranica nosi naziv smještaja i opis, tako da link podijeljen u poruci ili na mreži ima prepoznatljiv naslov.
**Status:** potpuno funkcionalna

---

## 7. Nalog i podešavanja

### Registracija
Novi vlasnik otvara nalog imenom, e-poštom i lozinkom. Besplatni početak ne traži karticu.
**Status:** potpuno funkcionalna

### Prijava i odjava
Prijava je e-poštom i lozinkom. Osoblje se prijavljuje korisničkim imenom bez znaka @. Lozinka se može prikazati ili sakriti. Odjava vraća na stranicu prijave.
**Status:** potpuno funkcionalna

### Zaboravljena lozinka
Vlasnik traži link za novu lozinku na svoju e-poštu i zatim postavlja novu lozinku.
**Status:** potpuno funkcionalna

### Instalacija na telefon
Hostvia može da se doda na početni ekran telefona, kao aplikacija, bez prodavnice aplikacija. Android nudi instalaciju iz aplikacije. iPhone ima uputstvo korak po korak. Dugme za instalaciju je i u bočnom meniju. Kad je već instalirana, stranica za instalaciju se ne prikazuje.
**Status:** potpuno funkcionalna

**Korist:** kalendar, dolasci i upiti su dostupni sa početnog ekrana, a obavještenja o upitima rade tek nakon instalacije.

### Javne stranice Hostvie
Van kontrolne table postoje početna stranica, stranice o funkcijama, načinu rada, sajtu za rezervacije, cijenama, čestim pitanjima, o nama i kontaktu (hello@hostvia.me), plus uslovi korišćenja, privatnost i pravila povrata i otkazivanja. Služe da se neko informiše i otvori nalog. Nisu alat za vođenje smještaja.
**Status:** potpuno funkcionalna

---

## 8. Paketi i pretplate

Jedina razlika koju aplikacija stvarno sprovodi između Free i Pro jeste broj smještaja. Kalendar, sajt, upiti, tim i kontrolna tabla rade na oba paketa. Na kartici Pro paketa pišu i „Portfolio management“ i „Priority support“, ali to nisu odvojeni alati: nema posebnog portfolija izvan postojeće table, niti posebnog kanala prioritetne podrške u aplikaciji.

### Free
Do 2 aktivna smještaja. Uključeni su sajt za direktne upite, sinhronizacija kalendara, rezervacije i kontrolna tabla, uključujući uvoz sa Airbnb-a i Booking.com-a. Kartica nije potrebna. Najstarija dva objekta ostaju aktivna ako ih ima više.
**Status:** potpuno funkcionalna

### Pro
20 američkih dolara mjesečno, za cijeli nalog, ne po objektu. Skida limit od dva smještaja. Naplata ide preko Stripe-a. Na stranici plana vidi se trenutni paket, broj objekata i datum kraja tekućeg perioda.
**Status:** potpuno funkcionalna

### Nadogradnja
Dugme „Upgrade to Pro“ vodi na Stripe naplatu. Isti poziv se pojavljuje kad je limit dostignut ili kad je objekat zaključan. Poslije uspješne uplate nalog dobija neograničen broj smještaja. Ako se odustane na naplati, ostaje Free.
**Status:** potpuno funkcionalna

### Upravljanje pretplatom i otkazivanje
Vlasnik otvara Stripe portal: način plaćanja, računi i otkazivanje. Ako otkaže, Pro ostaje do kraja već plaćenog perioda, a zatim se nalog vraća na Free i višak objekata se zaključava. Pravila povrata su na javnoj stranici o povratu i otkazivanju. Samo vlasnik naloga upravlja planom; osoblje tu stranicu ne vidi.
**Status:** potpuno funkcionalna

### Besplatni Pro koji dodijeli Hostvia
Nalog može dobiti Pro bez plaćanja, ako ga tako označi tim Hostvie. Tada nema Stripe pretplate i vlasnik je ne otkazuje sam. U tabeli plana piše da je pristup dodijeljen.
**Status:** potpuno funkcionalna

---

## 9. Dodatne funkcije

### Boje objekata
Objekti dobijaju različite boje na kontrolnoj tabli i na zajedničkim kalendarima, da se brže razlikuju kad ih ima više.
**Status:** potpuno funkcionalna

### Prazna stanja i upozorenja
Kad nema objekata, rezervacija, upita ili poruka, ekran kaže šta dalje. Greška sinhronizacije, dostignut limit i zaključan objekat imaju vlastito objašnjenje, a ne prazan ekran.
**Status:** potpuno funkcionalna

### Prilagođen prikaz na telefonu
Kontrolna tabla, meni, kalendari i javni sajt rade i na uskom ekranu. Javni sajt je svijetao i čitljiv za gosta; kontrolna tabla je tamna, namijenjena svakodnevnom radu.
**Status:** potpuno funkcionalna

### Interna administracija Hostvie
Odvojena prijava za tim koji vodi platformu. Tu se vide nalozi vlasnika, pretraga, broj objekata, plan (Free, plaćeni Pro ili dodijeljeni Pro), statistika i dodjela ili oduzimanje besplatnog Pro paketa. Tu je i podešavanje naplate. Ovo nije funkcija za vlasnika smještaja.
**Status:** potpuno funkcionalna

---

## A) Deset najvažnijih funkcionalnosti

1. **Jedan kalendar za sve kanale** — Airbnb, Booking.com, ručni unos i direktni upiti na istom mjestu, po svakom objektu.
2. **Uvoz i izvoz kalendara** — rezervacije ulaze u Hostviu, a zauzeti termini iz Hostvie mogu da se vrate na platforme.
3. **Vlastiti sajt za upite** — gost bira datume, vidi slobodne objekte i cijenu i šalje zahtjev, bez provizije platforme na tom upitu.
4. **Cijena po danima** — osnovna cijena i sezonski periodi, sa ukupnim iznosom boravka za gosta.
5. **Kontrolna tabla dolazaka i popunjenosti** — šta se dešava danas i koliko je portfolio zauzet u naredne četiri sedmice.
6. **Operativa čišćenja i dolazaka** — po danu se vidi ko dolazi, ko odlazi i koliko ima čišćenja.
7. **Ručne rezervacije** — direktan dogovor ulazi u kalendar i štiti termin od novog upita.
8. **Prihvat ili odbijanje upita** — prihvat odmah pravi rezervaciju; odbijanje sklanja zahtjev.
9. **Pristup za tim** — osoblje vidi samo odjeljke koje vlasnik odabere.
10. **Aplikacija na telefonu** — početni ekran i obavještenje kad stigne novi upit.

## B) Najzanimljivije za reklamiranje

Ovo su funkcije koje gost ili vlasnik odmah razumije i koje aplikacija stvarno radi:

- Svi apartmani i sobe u jednoj tabli, umjesto posebnog kalendara za svaki oglas.
- Airbnb i Booking u istom pregledu, preko običnog kalendarskog linka.
- Povrat zauzetih datuma na te platforme, da se isti dan ne proda dvaput.
- Sajt sa imenom vlasnika: fotografije, mapa, kontakt i pretraga slobodnih termina.
- Gost vidi cijenu boravka prije nego što pošalje upit.
- Upit stiže vlasniku, a ne posredniku; nema provizije na taj direktni zahtjev.
- Dolasci, odlasci i čišćenja za današnji dan, na telefonu.
- Osoblje ulazi samo u ono što mu treba, na primjer čišćenje, bez pristupa naplati.
- Besplatno do dva objekta, Pro kad portfolio preraste taj broj.

Ne treba reklamirati naplatu boravka kroz Hostviu, ćaskanje sa gostom unutar aplikacije, niti automatsko potvrđivanje rezervacije. To aplikacija ne radi.

## C) Prednosti u odnosu na običan oglas smještaja

Ove razlike postoje u aplikaciji, ne kao najava:

- **Operativni kalendar, ne samo oglas.** Oglas pokazuje smještaj. Hostvia drži dolaske, odlaske, čišćenja i popunjenost za sve objekte zajedno.
- **Više kanala u jednom pogledu.** Airbnb, Booking i direktni boravci stoje na istom kalendaru objekta, sa oznakom odakle je rezervacija.
- **Zaštita termina u oba smjera.** Uvezeni boravak se vidi u Hostvii, a boravak nastao u Hostvii može da zatvori datum na drugoj platformi preko izvoznog linka.
- **Vlastita stranica za direktan upit.** Gost pretražuje slobodne jedinice, bira datume na kalendaru i ostavlja kontakt. Vlasnik prihvata ili odbija, pa prihvaćeni termin postaje rezervacija.
- **Cijena vezana za dane, ne za jedan fiksni tekst oglasa.** Sezonski periodi ulaze u iznos koji gost vidi.
- **Rad na telefonu za vlasnika i osoblje.** Instalirana aplikacija i ograničen pristup timu pokrivaju svakodnevni rad, što statičan oglas ne radi.
- **Jedan sajt za više jedinica.** Gost bira među objavljenim stanovima i sobama istog vlasnika, umjesto da svaki oglas živi zasebno.

Hostvia time ne zamjenjuje Airbnb ili Booking. Ona spaja njihove kalendare sa direktnim upitima i dnevnom operativom smještaja.
