import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";

const WEDDING_DATE = new Date("2026-08-07T13:00:00");

// --- Floating Hearts ---
const HEART_CONFIG = [
  { left: "5%", size: 22, duration: 10, delay: 0 },
  { left: "12%", size: 16, duration: 13, delay: 2.5 },
  { left: "20%", size: 28, duration: 9, delay: 5 },
  { left: "28%", size: 18, duration: 12, delay: 1 },
  { left: "36%", size: 24, duration: 11, delay: 7 },
  { left: "44%", size: 14, duration: 14, delay: 3 },
  { left: "52%", size: 20, duration: 10, delay: 9 },
  { left: "60%", size: 26, duration: 13, delay: 1.5 },
  { left: "68%", size: 16, duration: 11, delay: 6 },
  { left: "75%", size: 22, duration: 9, delay: 4 },
  { left: "82%", size: 18, duration: 12, delay: 8 },
  { left: "89%", size: 24, duration: 10, delay: 2 },
  { left: "94%", size: 14, duration: 14, delay: 10 },
];

function FloatingHearts() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 9,
      }}
    >
      {HEART_CONFIG.map((h, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative
          key={i}
          style={{
            position: "absolute",
            left: h.left,
            bottom: "-60px",
            fontSize: `${h.size}px`,
            color: "#e8609a",
            animation: `heartFloat ${h.duration}s ease-in-out ${h.delay}s infinite both`,
            userSelect: "none",
          }}
        >
          ♥
        </div>
      ))}
      <style>{`
        @keyframes heartFloat {
          0%   { transform: translateY(0);        opacity: 0; }
          5%   { opacity: 0.85; }
          50%  { transform: translateY(-50vh);    opacity: 0.7; }
          95%  { opacity: 0.4; }
          100% { transform: translateY(-110vh);   opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// --- Countdown ---
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

// Section keys
type SectionKey =
  | "willkommen"
  | "location"
  | "anreise"
  | "programm_intro"
  | "workshops"
  | "uebernachtung"
  | "kleidung"
  | "beitraege"
  | "anmeldung";

// --- Edit Dialog ---
function EditDialog({
  open,
  onClose,
  sectionKey,
  initialContent,
  onSave,
  actor,
}: {
  open: boolean;
  onClose: () => void;
  sectionKey: string;
  initialContent: string;
  onSave: (key: string, content: string) => void;
  actor: import("./backend").backendInterface | null;
}) {
  const [value, setValue] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) setValue(initialContent);
    prevOpen.current = open;
  }, [open, initialContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actor?.updateSection(sectionKey, value);
      onSave(sectionKey, value);
      toast.success("Gespeichert!");
      onClose();
    } catch {
      toast.error("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="edit.dialog"
        className="max-w-lg"
        style={{ zIndex: 100 }}
      >
        <DialogHeader>
          <DialogTitle>Abschnitt bearbeiten</DialogTitle>
        </DialogHeader>
        <Textarea
          data-ocid="edit.textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[220px] font-body text-sm"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="edit.cancel_button"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            data-ocid="edit.save_button"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const { actor, isFetching } = useActor();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!actor || isFetching) return;
    const init = async () => {
      try {
        await actor.initializeDefaultSections();
        const [allSections, adminStatus] = await Promise.all([
          actor.getAllSections(),
          actor.isCallerAdmin(),
        ]);
        const map: Record<string, string> = {};
        for (const s of allSections) map[s.key] = s.content;
        setSections(map);
        setIsAdmin(adminStatus);
      } catch {
        // silently fall back to hardcoded content
      }
    };
    init();
  }, [actor, isFetching]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const sec = (key: SectionKey, fallback: string) => sections[key] ?? fallback;
  const handleSave = (key: string, content: string) => {
    setSections((prev) => ({ ...prev, [key]: content }));
  };

  const EditBtn = ({ sectionKey }: { sectionKey: string }) =>
    isAdmin ? (
      <button
        type="button"
        onClick={() => setEditKey(sectionKey)}
        data-ocid="edit.open_modal_button"
        className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/20 transition-colors text-foreground/70 hover:text-foreground"
        aria-label="Bearbeiten"
      >
        <Pencil size={14} />
      </button>
    ) : null;

  return (
    <div
      className="min-h-screen font-body relative"
      style={{ backgroundColor: "#4a7c59" }}
    >
      <FloatingHearts />
      <Toaster />

      {editKey && (
        <EditDialog
          open={!!editKey}
          onClose={() => setEditKey(null)}
          sectionKey={editKey}
          initialContent={sections[editKey] ?? ""}
          onSave={handleSave}
          actor={actor}
        />
      )}

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
              className="font-display text-lg font-semibold tracking-wide hover:opacity-80 transition-opacity"
              style={{ color: "#f5e6f0" }}
              data-ocid="nav.link"
            >
              Ella & Roman
            </a>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body hover:opacity-100 opacity-80 transition-opacity"
                  style={{ color: "#f5e6f0" }}
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-md"
              style={{ color: "#f5e6f0" }}
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
        {menuOpen && (
          <div className="md:hidden nav-blur border-b border-border px-4 pb-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-body opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: "#f5e6f0" }}
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
        className="hero-bg min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 relative"
        style={{ zIndex: 2 }}
      >
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <p
            className="text-sm uppercase tracking-[0.3em] font-body mb-4"
            style={{ color: "#e8609a" }}
          >
            7. – 9. August 2026
          </p>
          <h1
            className="font-display text-6xl sm:text-7xl md:text-8xl font-semibold leading-none mb-3"
            style={{ color: "#f5e6f0" }}
          >
            Ella & Roman
          </h1>
          <p
            className="font-display text-2xl sm:text-3xl italic font-light mb-12"
            style={{ color: "rgba(245,230,240,0.8)" }}
          >
            Liebe, Berge & Geschichten
          </p>
        </div>

        {/* Countdown */}
        <div
          className="animate-fade-up w-full max-w-lg"
          style={{ animationDelay: "0.35s" }}
        >
          <div
            className="rounded-2xl px-6 py-6"
            style={{
              background: "rgba(45,90,60,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(232,96,154,0.4)",
              boxShadow: "0 8px 40px -8px rgba(232,96,154,0.25)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.25em] mb-4 font-body"
              style={{ color: "rgba(245,230,240,0.6)" }}
            >
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
                  <span
                    className="font-display text-4xl sm:text-5xl font-semibold tabular-nums leading-none"
                    style={{ color: "#f5e6f0" }}
                  >
                    {pad(val)}
                  </span>
                  <span
                    className="text-xs mt-1 font-body tracking-wide"
                    style={{ color: "rgba(245,230,240,0.6)" }}
                  >
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
            className="inline-flex flex-col items-center gap-2 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: "#f5e6f0" }}
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
      <main
        className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-20 relative"
        style={{ zIndex: 2 }}
      >
        {/* Willkommen */}
        <section id="willkommen" data-ocid="willkommen.section">
          <SectionHeading editBtn={<EditBtn sectionKey="willkommen" />}>
            Herzlich willkommen liebe Gäste!
          </SectionHeading>
          <div className="prose-content">
            <p>
              {sec(
                "willkommen",
                "Wir freuen uns riesig, unsere Hochzeit mit Dir zu feiern! Unser grösster Wunsch ist es, etwas mehr Zeit mit Dir verbringen zu dürfen. Unser Fest findet deshalb an 2.5 Tagen statt und soll gemütlich – spannend – legendär werden. Nach unserem Motto «Liebe, Berge und Geschichten» wollen wir Dir die Gelegenheit geben, mit uns in den Bergen zu sein, Dich kreativ auszuleben, zu tanzen, schwatzen, lachen und dabei auch kulinarisch und musikalisch verwöhnt zu werden.",
              )}
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
          <SectionHeading editBtn={<EditBtn sectionKey="location" />}>
            Location & Anreise
          </SectionHeading>
          <p
            className="text-base sm:text-lg leading-relaxed mb-10"
            style={{ color: "rgba(20,60,30,0.85)" }}
          >
            {sec(
              "location",
              "Wir haben uns für eine naturnahe Hochzeit in den Glarner Bergen am Fuss vom Fronalpstock entschieden. Das Fest findet im Stockhus und im Naturfreundehaus Fronalp, mit einer traumhaften Aussicht auf den Zigerschlitz und unsere Heimat am Zürichsee statt.",
            )}
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
          <div
            className="my-10 rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 20px 60px -12px rgba(0,0,0,0.3)" }}
          >
            <img
              src="/assets/uploads/Bild-10.03.26-um-09.18-1-1.jpeg"
              alt="Blick auf die Fronalp – Hochzeitslocation in den Glarner Bergen"
              className="w-full h-auto object-cover"
            />
          </div>

          <SubHeading editBtn={<EditBtn sectionKey="anreise" />}>
            Anreise
          </SubHeading>
          <div className="prose-content">
            <p>
              {sec(
                "anreise",
                "Die Strasse zur Fronalp ist sehr kurvig, steil und eng und bei den Locations stehen nur eine sehr beschränkte Anzahl Parkplätze zur Verfügung. Aus diesem Grund stellen wir ein Shuttle-Taxi ab dem Bahnhof Ziegelbrücke zur Verfügung. Private Fahrten zur Fronalp sind nur in Ausnahmefällen und in Absprache mit uns erlaubt. Wir empfehlen die Anreise mit dem ÖV.",
              )}
            </p>
          </div>
          <div
            className="mt-6 rounded-xl p-6 space-y-2"
            style={{
              border: "1px solid rgba(74,124,89,0.4)",
              background: "rgba(255,255,255,0.15)",
            }}
          >
            <p
              className="font-display text-base font-semibold"
              style={{ color: "#1a3d25" }}
            >
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
          <SectionHeading editBtn={<EditBtn sectionKey="programm_intro" />}>
            Programmübersicht
          </SectionHeading>
          <p
            className="text-sm mb-8 font-body italic"
            style={{ color: "rgba(20,60,30,0.6)" }}
          >
            {sec(
              "programm_intro",
              "Die wichtigsten Programmpunkte — Details folgen zu einem späteren Zeitpunkt.",
            )}
          </p>

          <div className="space-y-10">
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

            <DayCard day="Samstag, 8. August 2026" badge="Hauptfest">
              <p
                className="text-xs uppercase tracking-widest font-body mb-2 mt-1"
                style={{ color: "#e8609a" }}
              >
                Für alle, die bereits da sind
              </p>
              <ScheduleItem time="">Optionales Morgen-Yoga</ScheduleItem>
              <ScheduleItem time="09.00–11.00 Uhr">
                Frühstücksbuffet im Naturfreundehaus oder Stockhus
              </ScheduleItem>
              <ScheduleItem time="10.15–11.15 Uhr">Workshop</ScheduleItem>
              <p
                className="text-xs uppercase tracking-widest font-body mb-2 mt-4"
                style={{ color: "#e8609a" }}
              >
                Für alle, die am Samstag anreisen
              </p>
              <ScheduleItem time="10.00 Uhr">
                Taxi-Treffpunkt Bahnhof Ziegelbrücke, Shuttlefahrt Richtung
                Fronalp
              </ScheduleItem>
              <ScheduleItem time="10.45 Uhr">
                Ankunft Shuttle & Zimmerbezug
              </ScheduleItem>
              <p
                className="text-xs uppercase tracking-widest font-body mb-2 mt-4"
                style={{ color: "#e8609a" }}
              >
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
          <SectionHeading editBtn={<EditBtn sectionKey="workshops" />}>
            Workshops
          </SectionHeading>
          <div className="prose-content">
            <p>
              {sec(
                "workshops",
                "Unsere Workshops laden Dich ein, auszuprobieren, was wir in der Freizeit gerne machen und gemeinsam etwas zu gestalten. Geleitet werden sie von Gästen, die ihre Leidenschaft mit euch teilen und euch vor Ort anleiten.",
              )}
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
          <SectionHeading editBtn={<EditBtn sectionKey="uebernachtung" />}>
            Übernachtung
          </SectionHeading>
          <div className="prose-content">
            <p>
              {sec(
                "uebernachtung",
                "Unser grosser Wunsch ist es, möglichst viel Zeit mit Dir an diesem traumhaften Ort zu verbringen. Deshalb sind für beide Nächte genügend Schlafmöglichkeiten vorhanden. Im Naturfreundehaus gibt es eine beschränkte Anzahl Doppel- bis Fünferzimmer mit Badezimmer auf dem Gang, im Stockhus und in der Skihütte jeweils ein Massenlager.",
              )}
            </p>
          </div>
          <div
            className="mt-6 rounded-xl px-6 py-4"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(74,124,89,0.4)",
            }}
          >
            <p
              className="font-display text-base font-semibold"
              style={{ color: "#1a3d25" }}
            >
              Check-Out für alle: Sonntag, 11:00 Uhr
            </p>
          </div>
        </section>

        <Divider />

        {/* Details */}
        <section id="details" data-ocid="details.section">
          <SectionHeading editBtn={<EditBtn sectionKey="kleidung" />}>
            Kleidung & Outfit
          </SectionHeading>
          <div className="prose-content mb-12">
            <p>
              {sec(
                "kleidung",
                "Hauptfest am Samstagnachmittag ab 16:30 Uhr: Festlich – elegant, aber nicht zu extravagant, wir sind in den Bergen. Wir empfehlen auf das Tragen von Stögelischuhen zu verzichten. Es wird genügend Zeit zum Frischmachen und Umziehen geben. Rest des Wochenendes: So, wie Du Dich auf dem Berg und bei einer Grillparty wohl fühlst und dem Wetter entsprechend.",
              )}
            </p>
          </div>

          <SubHeading editBtn={<EditBtn sectionKey="beitraege" />}>
            Beiträge & Darbietungen
          </SubHeading>
          <div className="prose-content mb-12">
            <p>
              {sec(
                "beitraege",
                "Wir wünschen uns ein gemütliches Wochenende mit einer ungezwungenen Atmosphäre und genügend Raum für gute Gespräche. Für Beiträge stehen deshalb nur wenige Zeitslots von je max. 10 Minuten zur Verfügung. Bitte melde Dich vorgängig, bis spätestens am xx.xx.2026, bei Dominik an – er hat den Programmüberblick.",
              )}
            </p>
          </div>

          <SubHeading>Geschenke & Kostenbeteiligung</SubHeading>
          <div className="prose-content mb-6">
            <p>
              Das grösste Geschenk für uns ist, dieses besondere Wochenende mit
              Dir zu verbringen! Wenn Du uns darüber hinaus etwas schenken
              möchtest, freuen wir uns über einen Beitrag an unser Fest.
              Materielle Dinge haben wir bereits mehr als genug – dafür aber
              noch viel Platz für gute Erinnerungen.
            </p>
          </div>
          <div
            className="rounded-xl px-6 py-5 space-y-1"
            style={{
              border: "1px solid rgba(74,124,89,0.4)",
              background: "rgba(255,255,255,0.15)",
            }}
          >
            <p
              className="font-display font-semibold"
              style={{ color: "#1a3d25" }}
            >
              Waller R. o. Novotny E.
            </p>
            <p className="font-body" style={{ color: "rgba(20,60,30,0.75)" }}>
              IBAN: CH05 0070 0114 8070 7462 6
            </p>
            <p className="font-body" style={{ color: "rgba(20,60,30,0.75)" }}>
              Sonnenhalde 8, 8716 Schmerikon
            </p>
          </div>
        </section>

        <Divider />

        {/* Anmeldung */}
        <section id="anmeldung" data-ocid="anmeldung.section">
          <SectionHeading editBtn={<EditBtn sectionKey="anmeldung" />}>
            Anmeldung & Fristen
          </SectionHeading>
          <div className="prose-content">
            <p>
              {sec(
                "anmeldung",
                "Bitte melde Dich bis am xx.xx.2026 über folgenden Link / QR-Code an. Damit wir den Überblick behalten ist die Anmeldung nur über das Formular möglich. Wir bitten Paare, das Formular pro Person individuell auszufüllen.",
              )}
            </p>
          </div>
          <div
            className="mt-10 rounded-2xl p-8 text-center"
            style={{
              border: "1px solid rgba(74,124,89,0.4)",
              background: "rgba(255,255,255,0.15)",
              boxShadow: "0 8px 40px -8px rgba(232,96,154,0.2)",
            }}
          >
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: "rgba(232,96,154,0.2)" }}
            >
              <svg
                aria-hidden="true"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e8609a"
                strokeWidth="1.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p
              className="font-display text-2xl font-semibold mb-3"
              style={{ color: "#1a3d25" }}
            >
              Wir freuen uns auf Dich!
            </p>
            <p
              className="font-body text-base max-w-lg mx-auto"
              style={{ color: "rgba(20,60,30,0.8)" }}
            >
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
      <footer
        className="mt-20 py-10 text-center relative"
        style={{ zIndex: 2, borderTop: "1px solid rgba(74,124,89,0.4)" }}
      >
        <p
          className="font-display text-2xl font-semibold mb-2"
          style={{ color: "#f5e6f0" }}
        >
          Ella & Roman
        </p>
        <p
          className="font-body text-sm italic mb-6"
          style={{ color: "rgba(245,230,240,0.6)" }}
        >
          Liebe, Berge & Geschichten · 7. – 9. August 2026
        </p>
        <p
          className="text-xs font-body"
          style={{ color: "rgba(245,230,240,0.5)" }}
        >
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline underline-offset-2 hover:opacity-100 opacity-70 transition-opacity"
            style={{ color: "rgba(245,230,240,0.6)" }}
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

function SectionHeading({
  children,
  editBtn,
}: { children: React.ReactNode; editBtn?: React.ReactNode }) {
  return (
    <h2
      className="font-display text-3xl sm:text-4xl font-semibold mb-6 leading-tight flex items-center gap-1"
      style={{ color: "#1a3d25" }}
    >
      {children}
      {editBtn}
    </h2>
  );
}

function SubHeading({
  children,
  editBtn,
}: { children: React.ReactNode; editBtn?: React.ReactNode }) {
  return (
    <h3
      className="font-display text-xl sm:text-2xl font-semibold mb-4 mt-8 flex items-center gap-1"
      style={{ color: "#1a3d25" }}
    >
      {children}
      {editBtn}
    </h3>
  );
}

function Divider() {
  return (
    <hr
      style={{
        background:
          "linear-gradient(90deg, transparent, #e8609a, #4a7c59, transparent)",
        height: "1px",
        border: "none",
      }}
    />
  );
}

function TimeTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-4 py-1 text-sm font-body"
      style={{ background: "rgba(232,96,154,0.2)", color: "#c04878" }}
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
    <div
      className="rounded-2xl p-6"
      style={{
        border: "1px solid rgba(74,124,89,0.4)",
        background: "rgba(255,255,255,0.18)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3
          className="font-display text-xl font-semibold"
          style={{ color: "#1a3d25" }}
        >
          {day}
        </h3>
        {badge && (
          <span
            className="text-xs uppercase tracking-widest px-3 py-1 rounded-full font-body"
            style={
              badge === "Hauptfest"
                ? { background: "rgba(232,96,154,0.25)", color: "#c04878" }
                : { background: "rgba(74,124,89,0.3)", color: "#1a5c30" }
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
      {time ? (
        <span
          className="font-body text-sm font-semibold whitespace-nowrap min-w-[110px]"
          style={{ color: "#e8609a" }}
        >
          {time}
        </span>
      ) : (
        <span className="min-w-[110px]" />
      )}
      <span
        className="font-body text-sm leading-relaxed"
        style={{ color: "rgba(20,60,30,0.9)" }}
      >
        {children}
      </span>
    </div>
  );
}
