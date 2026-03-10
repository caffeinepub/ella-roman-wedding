import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-08-08T16:30:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  // biome-ignore lint/correctness/useExhaustiveDependencies: calc is stable
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const NAV_LINKS = [
  { href: "#willkommen", label: "Willkommen" },
  { href: "#location", label: "Location" },
  { href: "#programm", label: "Programm" },
  { href: "#workshops", label: "Workshops" },
  { href: "#uebernachtung", label: "Übernachtung" },
  { href: "#details", label: "Details" },
  { href: "#anmeldung", label: "Anmeldung" },
];

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "nav-blur shadow-xs border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a
              href="#top"
              className="font-display text-lg font-semibold tracking-wide text-foreground hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Ella & Roman
            </a>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
            </div>
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menü öffnen"
              data-ocid="nav.toggle"
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {menuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden nav-blur border-b border-border px-4 pb-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        id="top"
        className="hero-bg min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16"
      >
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4 opacity-80">
            8. August 2026
          </p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-semibold text-foreground leading-none mb-3">
            Ella & Roman
          </h1>
          <p className="font-display text-2xl sm:text-3xl text-muted-foreground italic font-light mb-12">
            Liebe, Berge & Geschichten
          </p>
        </div>

        {/* Countdown */}
        <div
          className="animate-fade-up w-full max-w-lg"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="countdown-card rounded-2xl px-6 py-6 shadow-romantic">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4 font-body">
              Noch bis zur Hochzeit
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { val: days, label: "Tage" },
                { val: hours, label: "Stunden" },
                { val: minutes, label: "Minuten" },
                { val: seconds, label: "Sekunden" },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="font-display text-4xl sm:text-5xl font-semibold text-foreground tabular-nums leading-none">
                    {pad(val)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 font-body tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="animate-fade-in mt-16"
          style={{ animationDelay: "0.6s" }}
        >
          <a
            href="#willkommen"
            className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            aria-label="Nach unten scrollen"
          >
            <span className="text-xs tracking-widest uppercase font-body">
              Entdecken
            </span>
            <svg
              aria-hidden="true"
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {/* Willkommen */}
        <section id="willkommen" data-ocid="willkommen.section">
          <SectionHeading>Herzlich willkommen liebe Gäste!</SectionHeading>
          <div className="prose-content">
            <p>
              Wir freuen uns riesig, unsere Hochzeit mit Dir zu feiern! Unser
              grösster Wunsch ist es, etwas mehr Zeit mit Dir verbringen zu
              dürfen. Unser Fest findet deshalb an 2.5 Tagen statt und soll
              gemütlich – spannend – legendär werden. Nach unserem Motto «Liebe,
              Berge und Geschichten» wollen wir Dir die Gelegenheit geben, mit
              uns in den Bergen zu sein, Dich kreativ auszuleben, zu tanzen,
              schwatzen, lachen und dabei auch kulinarisch und musikalisch
              verwöhnt zu werden.
            </p>
            <p>
              Konkret werden wir am Freitag in einen entspannten Nachmittag
              starten, der am Abend mit Grillieren und Live-Musik am offenen
              Feuer ausklingt. Von Freitag bis Sonntag wird vor Ort übernachtet.
              Wer erst am Samstag für den Hauptanlass kommen kann, wird am
              Samstag Vormittag zu uns stossen. Ab dem Mittag darf man optional
              und je nach Vorliebe an einem unserer Workshops teilnehmen, sich
              danach in Feststimmung bringen und am Abend bis spät in die Nacht
              mit uns feiern.
            </p>
            <p>
              Zur Vorbereitung eines entspannten Festes bitten wir Dich, bereits
              im Voraus zu entscheiden, ob Du bereits am Freitag oder erst am
              Samstag kommen kannst und ob und an welchem Workshop Du teilnehmen
              willst. Unsere Programmgestaltung lädt dazu ein, sich ganz auf das
              Fest einlassen zu können. Deshalb wünschen wir uns, das Fest ohne
              Kinder und Hunde zu feiern.
            </p>
          </div>
        </section>

        <Divider />

        {/* Location & Anreise */}
        <section id="location" data-ocid="location.section">
          <SectionHeading>Location & Anreise</SectionHeading>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
            Wir haben uns für eine naturnahe Hochzeit in den Glarner Bergen am
            Fuss vom Fronalpstock entschieden. Das Fest findet im Stockhus und
            im Naturfreundehaus Fronalp, mit einer traumhaften Aussicht auf den
            Zigerschlitz und unsere Heimat am Zürichsee statt.
          </p>

          <SubHeading>Location</SubHeading>
          <div className="prose-content mb-8">
            <p>
              Für das Fest befinden wir uns hauptsächlich im Stockhus. Das 400 m
              / 60 hm und rund 10 Gehminuten entfernte Naturfreundehaus wird
              primär zum Übernachten genutzt. Weitere Schlafplätze stehen in der
              Skihütte vom SC Mollis direkt oberhalb vom Stockhus zur Verfügung.
              Die Häuser sind über eine unbeleuchtete, asphaltierte Strasse
              verbunden, ein Wanderweg dient als Abkürzung.
            </p>
          </div>

          {/* Location Image */}
          <div className="my-10 rounded-2xl overflow-hidden shadow-romantic-lg">
            <img
              src="/assets/uploads/Bild-10.03.26-um-09.18-1.jpeg"
              alt="Blick auf die Fronalp – Hochzeitslocation in den Glarner Bergen"
              className="w-full h-auto object-cover"
            />
          </div>

          <SubHeading>Anreise</SubHeading>
          <div className="prose-content">
            <p>
              Die Strasse zur Fronalp ist sehr kurvig, steil und eng und bei den
              Locations stehen nur eine sehr beschränkte Anzahl Parkplätze zur
              Verfügung. Aus diesem Grund stellen wir ein Shuttle-Taxi ab dem
              Bahnhof Ziegelbrücke zur Verfügung. Private Fahrten zur Fronalp
              sind nur in Ausnahmefällen und in Absprache mit uns erlaubt. Wir
              empfehlen die Anreise mit dem ÖV. Beim Bahnhof Ziegelbrücke sind
              gebührenpflichtige P+R-Parkplätze vorhanden.
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-2">
            <p className="font-display text-base font-semibold text-foreground">
              Treffpunkt Bahnhof Ziegelbrücke
            </p>
            <div className="flex gap-4 flex-wrap">
              <TimeTag>Freitag, 13:00 Uhr</TimeTag>
              <TimeTag>Samstag, 10:00 Uhr</TimeTag>
            </div>
          </div>
          <div className="prose-content mt-6">
            <p>
              Am Sonntag fährt der Shuttle ab 11:30 Uhr vom Naturfreundehaus
              zurück zum Bahnhof Ziegelbrücke. Früheste Ankunft am Bahnhof
              Ziegelbrücke um 12:00 Uhr.
            </p>
            <p>
              Direkt unter dem Naturfreundehaus befindet sich der
              Gleitschirm-Startplatz Fronalp. Wer möchte, kann am Sonntag auf
              eigene Kosten einen Tandemflug nach Mollis machen – wir übernehmen
              gerne die Organisation.
            </p>
          </div>
        </section>

        <Divider />

        {/* Programmübersicht */}
        <section id="programm" data-ocid="programm.section">
          <SectionHeading>Programmübersicht</SectionHeading>
          <p className="text-sm text-muted-foreground mb-8 font-body italic">
            Die wichtigsten Programmpunkte — Details folgen zu einem späteren
            Zeitpunkt.
          </p>

          <div className="space-y-10">
            {/* Freitag */}
            <DayCard day="Freitag, 7. August 2026" badge="optional">
              <ScheduleItem time="13.00 Uhr">
                Taxi-Treffpunkt Bahnhof Ziegelbrücke, Shuttlefahrt Richtung
                Fronalp
              </ScheduleItem>
              <ScheduleItem time="13.45 Uhr">
                Ankunft Taxi & Zimmerbezug
              </ScheduleItem>
              <ScheduleItem time="14.15 Uhr">
                Treffpunkt Naturfreundehaus, Begrüssung und Schnitzeljagd
              </ScheduleItem>
              <ScheduleItem time="danach">
                Zeit um anzukommen und zum Verweilen
              </ScheduleItem>
              <ScheduleItem time="17.00 Uhr">
                Treffpunkt Stockhus, Apéro & Live-Musik
              </ScheduleItem>
              <ScheduleItem time="ab 18.00 Uhr">
                Grillieren, Musik, gemütliches Beisammensein
              </ScheduleItem>
            </DayCard>

            {/* Samstag */}
            <DayCard day="Samstag, 8. August 2026" badge="Hauptfest">
              <p className="text-xs uppercase tracking-widest text-primary font-body mb-2 mt-1">
                Für alle, die bereits da sind
              </p>
              <ScheduleItem time="">Optionales Morgen-Yoga</ScheduleItem>
              <ScheduleItem time="09.00–11.00 Uhr">
                Frühstücksbuffet im Naturfreundehaus oder Stockhus
              </ScheduleItem>
              <ScheduleItem time="10.15–11.15 Uhr">Workshop</ScheduleItem>
              <p className="text-xs uppercase tracking-widest text-primary font-body mb-2 mt-4">
                Für alle, die am Samstag anreisen
              </p>
              <ScheduleItem time="10.00 Uhr">
                Taxi-Treffpunkt Bahnhof Ziegelbrücke, Shuttlefahrt Richtung
                Fronalp
              </ScheduleItem>
              <ScheduleItem time="10.45 Uhr">
                Ankunft Shuttle & Zimmerbezug
              </ScheduleItem>
              <p className="text-xs uppercase tracking-widest text-primary font-body mb-2 mt-4">
                Für alle
              </p>
              <ScheduleItem time="11.30 Uhr">
                Treffpunkt Stockhus, Begrüssung und Informationen
              </ScheduleItem>
              <ScheduleItem time="ab 12.00 Uhr">
                Fingerfood Buffet zur Selbstbedienung
              </ScheduleItem>
              <ScheduleItem time="12.00–14.30 Uhr">
                Workshops (auf Voranmeldung)
              </ScheduleItem>
              <ScheduleItem time="danach">
                Zeit zum Umziehen, Frischmachen, Chillen
              </ScheduleItem>
              <ScheduleItem time="16.30 Uhr">
                Treffpunkt Stockhus, offizieller Feststart 🎉
              </ScheduleItem>
            </DayCard>

            {/* Sonntag */}
            <DayCard day="Sonntag, 9. August 2026" badge="">
              <ScheduleItem time="09.00–11.00 Uhr">
                Frühstücksbuffet im Naturfreundehaus
              </ScheduleItem>
              <ScheduleItem time="11.00 Uhr">
                Treffpunkt Naturfreundehaus, Verabschiedung
              </ScheduleItem>
              <ScheduleItem time="ab 11.30 Uhr">
                Shuttles zum Bahnhof Ziegelbrücke
              </ScheduleItem>
            </DayCard>
          </div>
        </section>

        <Divider />

        {/* Workshops */}
        <section id="workshops" data-ocid="workshops.section">
          <SectionHeading>Workshops</SectionHeading>
          <div className="prose-content">
            <p>
              Unsere Workshops laden Dich ein, auszuprobieren, was wir in der
              Freizeit gerne machen und gemeinsam etwas zu gestalten. Geleitet
              werden sie von Gästen, die ihre Leidenschaft mit euch teilen und
              euch vor Ort anleiten.
            </p>
            <p>
              Die Teilnahme ist freiwillig. Wer es lieber unverbindlich hat,
              geniesst einfach den schönen Ort oder kann an den spontanen
              Veranstaltungen teilnehmen.
            </p>
            <p>
              Damit wir wissen, ob die Workshops stattfinden können, bitten wir
              um eine verbindliche Zusage. Die detaillierten Infos können dem
              Anmeldeformular entnommen werden.
            </p>
          </div>
        </section>

        <Divider />

        {/* Übernachtung */}
        <section id="uebernachtung" data-ocid="uebernachtung.section">
          <SectionHeading>Übernachtung</SectionHeading>
          <div className="prose-content">
            <p>
              Unser grosser Wunsch ist es, möglichst viel Zeit mit Dir an diesem
              traumhaften Ort zu verbringen. Deshalb sind für beide Nächte
              genügend Schlafmöglichkeiten vorhanden. Im Naturfreundehaus gibt
              es eine beschränkte Anzahl Doppel- bis Fünferzimmer mit Badezimmer
              auf dem Gang, im Stockhus und in der Skihütte jeweils ein
              Massenlager. Beim Stockhus stehen zudem ca. 4 Stellplätze für
              Camper/Wohnmobile zur Verfügung (ohne Strom & Wasser). Bitte wähle
              Deine bevorzugte Zimmerkategorie im Anmeldeformular aus.
            </p>
          </div>
          <div className="mt-6 rounded-xl bg-secondary/30 border border-border px-6 py-4">
            <p className="font-display text-base font-semibold text-foreground">
              Check-Out für alle: Sonntag, 11:00 Uhr
            </p>
          </div>
        </section>

        <Divider />

        {/* Details */}
        <section id="details" data-ocid="details.section">
          {/* Kleidung */}
          <SectionHeading>Kleidung & Outfit</SectionHeading>
          <div className="prose-content mb-12">
            <p>
              <strong>Hauptfest am Samstagnachmittag ab 16:30 Uhr:</strong>
              <br />
              Festlich – elegant, aber nicht zu extravagant, wir sind in den
              Bergen. Wir empfehlen auf das Tragen von Stögelischuhen zu
              verzichten. Es wird genügend Zeit zum Frischmachen und Umziehen
              geben.
            </p>
            <p>
              <strong>Rest des Wochenendes:</strong>
              <br />
              So, wie Du Dich auf dem Berg und bei einer Grillparty wohl fühlst
              und dem Wetter entsprechend. Einige Aktivitäten finden bei jeder
              Witterung draussen statt.
            </p>
          </div>

          {/* Beiträge */}
          <SubHeading>Beiträge & Darbietungen</SubHeading>
          <div className="prose-content mb-12">
            <p>
              Wir wünschen uns ein gemütliches Wochenende mit einer
              ungezwungenen Atmosphäre und genügend Raum für gute Gespräche. Für
              Beiträge stehen deshalb nur wenige Zeitslots von je max. 10
              Minuten zur Verfügung. Bitte melde Dich vorgängig, bis spätestens
              am xx.xx.2026, bei Dominik an – er hat den Programmüberblick und
              entscheidet, was zum Anlass passt. Spontane Überraschungen sind
              nicht vorgesehen, und für PowerPoint oder Diashows fehlt die
              Infrastruktur.
            </p>
          </div>

          {/* Geschenke */}
          <SubHeading>Geschenke & Kostenbeteiligung</SubHeading>
          <div className="prose-content mb-6">
            <p>
              Das grösste Geschenk für uns ist, dieses besondere Wochenende mit
              Dir zu verbringen! Wenn Du uns darüber hinaus etwas schenken
              möchtest, freuen wir uns über einen Beitrag an unser Fest, damit
              wir dieses Wochenende genau so gestalten können, wie wir es uns
              wünschen. Materielle Dinge haben wir bereits mehr als genug –
              dafür aber noch viel Platz für gute Erinnerungen.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-6 py-5 space-y-1">
            <p className="font-display font-semibold text-foreground">
              Waller R. o. Novotny E.
            </p>
            <p className="font-body text-muted-foreground">
              IBAN: CH05 0070 0114 8070 7462 6
            </p>
            <p className="font-body text-muted-foreground">
              Sonnenhalde 8, 8716 Schmerikon
            </p>
          </div>
        </section>

        <Divider />

        {/* Anmeldung */}
        <section id="anmeldung" data-ocid="anmeldung.section">
          <SectionHeading>Anmeldung & Fristen</SectionHeading>
          <div className="prose-content">
            <p>
              Bitte melde Dich bis am xx.xx.2026 über folgenden Link / QR-Code
              an. Damit wir den Überblick behalten ist die Anmeldung nur über
              das Formular möglich. Wir bitten Paare, das Formular pro Person
              individuell auszufüllen.
            </p>
          </div>
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-romantic">
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: "oklch(88 0.06 340 / 0.4)" }}
            >
              <svg
                aria-hidden="true"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-foreground"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="font-display text-2xl font-semibold text-foreground mb-3">
              Wir freuen uns auf Dich!
            </p>
            <p className="font-body text-muted-foreground text-base max-w-lg mx-auto">
              Wir freuen uns schon jetzt riesig auf die neuen Geschichten, die
              wir mit Dir an diesem Wochenende in den Glarner Bergen schreiben
              dürfen — auf die schönen Begegnungen, guten Gespräche, die Musik,
              das schwingende Tanzbein und die sicherlich legendären Momente.
              Schön, dass Du dabei bist!
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-10 text-center">
        <p className="font-display text-2xl font-semibold text-foreground mb-2">
          Ella & Roman
        </p>
        <p className="font-body text-sm text-muted-foreground italic mb-6">
          Liebe, Berge & Geschichten · 8. August 2026
        </p>
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// --- Utility Components ---

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6 leading-tight">
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-4 mt-8">
      {children}
    </h3>
  );
}

function Divider() {
  return <hr className="section-divider" />;
}

function TimeTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-4 py-1 text-sm font-body"
      style={{
        background: "oklch(88 0.06 240 / 0.3)",
        color: "oklch(32 0.07 240)",
      }}
    >
      {children}
    </span>
  );
}

function DayCard({
  day,
  badge,
  children,
}: { day: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {day}
        </h3>
        {badge && (
          <span
            className="text-xs uppercase tracking-widest px-3 py-1 rounded-full font-body"
            style={
              badge === "Hauptfest"
                ? {
                    background: "oklch(85 0.08 10 / 0.35)",
                    color: "oklch(32 0.1 10)",
                  }
                : {
                    background: "oklch(88 0.05 240 / 0.3)",
                    color: "oklch(32 0.07 240)",
                  }
            }
          >
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ScheduleItem({
  time,
  children,
}: { time: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      {time && (
        <span className="font-body text-sm text-primary font-semibold whitespace-nowrap min-w-[110px]">
          {time}
        </span>
      )}
      {!time && <span className="min-w-[110px]" />}
      <span className="font-body text-sm text-foreground leading-relaxed">
        {children}
      </span>
    </div>
  );
}
