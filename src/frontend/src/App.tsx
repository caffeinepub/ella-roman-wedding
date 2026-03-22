import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, LogIn, LogOut, Pencil, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "./backend";

// ColorSettings - defined locally as backend bindings may not include it yet
interface ColorSettings {
  bgColor: string;
  titleColor: string;
  subtitleColor: string;
  heartColor: string;
  accentColor: string;
  navTextColor: string;
  countdownBgColor: string;
}
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

const WEDDING_DATE = new Date("2026-08-07T13:00:00");

const DEFAULT_COLORS: ColorSettings = {
  bgColor: "#84b8ad",
  titleColor: "#ffffff",
  subtitleColor: "#ffffff",
  heartColor: "#7d2235",
  accentColor: "#ffffff",
  navTextColor: "#ffffff",
  countdownBgColor: "rgba(45,90,60,0.75)",
};

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

function FloatingHearts({ color }: { color: string }) {
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
            color: color,
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
  | "title"
  | "subtitle"
  | "date_label"
  | "countdown_label"
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

// --- Admin Panel (Side Drawer) ---
const SECTION_LABELS: {
  key: SectionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "title",
    label: "Titel",
    description: "Haupttitel der Seite (z.B. Ella & Roman)",
  },
  {
    key: "subtitle",
    label: "Untertitel",
    description: "Untertitel unter dem Haupttitel",
  },
  { key: "date_label", label: "Datum", description: "Datum im Hero-Bereich" },
  {
    key: "countdown_label",
    label: "Countdown-Text",
    description: "Beschriftung über dem Countdown",
  },
  {
    key: "willkommen",
    label: "Willkommen",
    description: "Willkommenstext für die Gäste",
  },
  {
    key: "location",
    label: "Location",
    description: "Beschreibung der Hochzeitslocation",
  },
  {
    key: "anreise",
    label: "Anreise",
    description: "Anreise-Informationen und Shuttle",
  },
  {
    key: "programm_intro",
    label: "Programm-Intro",
    description: "Einleitungstext zum Programm",
  },
  {
    key: "workshops",
    label: "Workshops",
    description: "Workshop-Beschreibung",
  },
  {
    key: "uebernachtung",
    label: "Übernachtung",
    description: "Übernachtungs-Informationen",
  },
  {
    key: "kleidung",
    label: "Kleidung & Outfit",
    description: "Kleidungsempfehlungen",
  },
  {
    key: "beitraege",
    label: "Beiträge",
    description: "Info zu Beiträgen und Darbietungen",
  },
  {
    key: "anmeldung",
    label: "Anmeldung",
    description: "Anmeldungstext und Fristen",
  },
];

const COLOR_LABELS: { key: keyof ColorSettings; label: string }[] = [
  { key: "bgColor", label: "Hintergrundfarbe" },
  { key: "titleColor", label: "Titelfarbe" },
  { key: "subtitleColor", label: "Untertitelfarbe" },
  { key: "heartColor", label: "Herzchen-Farbe" },
  { key: "accentColor", label: "Akzentfarbe" },
  { key: "navTextColor", label: "Navigation Textfarbe" },
  { key: "countdownBgColor", label: "Countdown Hintergrund" },
];

function toHex(color: string): string {
  if (color.startsWith("#")) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = Number.parseInt(match[1]);
    const g = Number.parseInt(match[2]);
    const b = Number.parseInt(match[3]);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  return "#000000";
}

function AdminPanel({
  open,
  onClose,
  colors,
  onColorSave,
  actor,
  sections,
  onEditSection,
  sectionImages,
  onImageSave,
}: {
  open: boolean;
  onClose: () => void;
  colors: ColorSettings;
  onColorSave: (c: ColorSettings) => void;
  actor: import("./backend").backendInterface | null;
  sections: Record<string, string>;
  onEditSection: (key: string) => void;
  sectionImages: Record<string, string>;
  onImageSave: (key: string, url: string) => void;
}) {
  const [draft, setDraft] = useState<ColorSettings>(colors);
  const [savingColors, setSavingColors] = useState(false);

  useEffect(() => {
    if (open) setDraft(colors);
  }, [open, colors]);

  const handleSaveColors = async () => {
    setSavingColors(true);
    try {
      await (actor as any)?.updateColorSettings(draft);
      onColorSave(draft);
      toast.success("Farben gespeichert!");
    } catch (err) {
      console.error("Color save error:", err);
      toast.error("Fehler beim Speichern der Farben.");
    } finally {
      setSavingColors(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex flex-col !bg-white !text-gray-900"
        style={{ zIndex: 200 }}
        data-ocid="admin.sheet"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
          <SheetTitle className="flex items-center gap-2 font-display text-lg">
            <Settings size={18} className="text-primary" />
            Admin-Panel
          </SheetTitle>
          <p className="text-xs text-gray-500 font-body">
            Verwalte Farben, Texte und Bilder deiner Hochzeitswebsite
          </p>
        </SheetHeader>

        <Tabs
          defaultValue="farben"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-4 grid w-[calc(100%-3rem)] grid-cols-3">
            <TabsTrigger value="farben" data-ocid="admin.tab">
              Farben
            </TabsTrigger>
            <TabsTrigger value="texte" data-ocid="admin.tab">
              Texte
            </TabsTrigger>
            <TabsTrigger value="bilder" data-ocid="admin.tab">
              Bilder
            </TabsTrigger>
          </TabsList>

          {/* Farben Tab */}
          <TabsContent
            value="farben"
            className="flex-1 overflow-hidden flex flex-col mt-0"
          >
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-5">
                {COLOR_LABELS.map(({ key, label }) => (
                  <div key={String(key)} className="space-y-1.5">
                    <label
                      className="text-sm font-medium font-body"
                      htmlFor={`ap-color-${String(key)}`}
                    >
                      {label}
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer overflow-hidden relative"
                        style={{ background: draft[key] }}
                      >
                        <input
                          id={`ap-color-${String(key)}`}
                          type="color"
                          value={toHex(draft[key])}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          data-ocid="color.input"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={draft[key]}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-full text-sm font-mono rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                          data-ocid="color.input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="px-6 py-4 border-t border-border">
              <Button
                className="w-full"
                onClick={handleSaveColors}
                disabled={savingColors}
                data-ocid="color.save_button"
              >
                {savingColors ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {savingColors ? "Speichern…" : "Farben speichern"}
              </Button>
            </div>
          </TabsContent>

          {/* Texte Tab */}
          <TabsContent value="texte" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-6 py-4">
              <p className="text-xs text-gray-500 mb-4 font-body">
                Klicke auf einen Abschnitt, um den Text zu bearbeiten.
              </p>
              <div className="space-y-2">
                {SECTION_LABELS.map(({ key, label, description }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onEditSection(key);
                      onClose();
                    }}
                    data-ocid="edit.open_modal_button"
                    className="w-full text-left rounded-xl px-4 py-3 border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm font-body">
                        {label}
                      </span>
                      <Pencil
                        size={13}
                        className="text-muted-foreground group-hover:text-foreground transition-colors"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-body">
                      {description}
                    </p>
                    {sections[key] && (
                      <p className="text-xs mt-1.5 text-foreground/70 font-body truncate">
                        "{sections[key]}"
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Bilder Tab */}
          <TabsContent value="bilder" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-6 py-4">
              <p className="text-xs text-gray-500 mb-4 font-body">
                Lade neue Bilder für die verschiedenen Bereiche hoch.
              </p>
              <div className="space-y-6">
                <ImageUploadSlot
                  label="Location-Bild / Karte"
                  description="Bild zwischen Location und Anreise-Abschnitt"
                  sectionKey="location_image"
                  currentUrl={sectionImages.location_image}
                  actor={actor}
                  onSave={onImageSave}
                />
                <ImageUploadSlot
                  label="Anmeldung / QR-Code"
                  description="QR-Code oder Bild unter Anmeldung & Fristen"
                  sectionKey="anmeldung_image"
                  currentUrl={sectionImages.anmeldung_image}
                  actor={actor}
                  onSave={onImageSave}
                />
                <ImageUploadSlot
                  label="Hero Hintergrundbild"
                  description="Hintergrundbild für den oberen Bereich der Website (optional)"
                  sectionKey="hero_image"
                  currentUrl={sectionImages.hero_image}
                  actor={actor}
                  onSave={onImageSave}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function ImageUploadSlot({
  label,
  description,
  sectionKey,
  currentUrl,
  actor,
  onSave,
}: {
  label: string;
  description: string;
  sectionKey: string;
  currentUrl?: string;
  actor: import("./backend").backendInterface | null;
  onSave: (key: string, url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.updateSectionImage(sectionKey, blob);
      onSave(sectionKey, blob.getDirectURL());
      toast.success("Bild gespeichert!");
    } catch {
      toast.error("Fehler beim Hochladen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium font-body">{label}</p>
        <p className="text-xs text-muted-foreground font-body">{description}</p>
      </div>
      {currentUrl && (
        <img
          src={currentUrl}
          alt={label}
          className="w-full h-32 object-cover rounded-lg border border-border"
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        data-ocid="image.upload_button"
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || !actor}
        data-ocid="image.edit_button"
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Camera className="mr-2 h-4 w-4" />
        )}
        {uploading
          ? "Hochladen…"
          : currentUrl
            ? "Bild ersetzen"
            : "Bild hochladen"}
      </Button>
    </div>
  );
}

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [sectionImages, setSectionImages] = useState<Record<string, string>>(
    {},
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [colors, setColors] = useState<ColorSettings>(DEFAULT_COLORS);
  const { actor, isFetching } = useActor();
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const isLoggedIn = !!identity;

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
        const [allSections, _adminStatus, allImages, colorSettings] =
          await Promise.all([
            actor.getAllSections(),
            actor.isCallerAdmin(),
            actor.getAllSectionImages(),
            (actor as any).getColorSettings(),
          ]);
        const map: Record<string, string> = {};
        for (const s of allSections) map[s.key] = s.content;
        setSections(map);
        setColors(colorSettings);

        const imgMap: Record<string, string> = {};
        for (const [key, blob] of allImages) {
          imgMap[key] = blob.getDirectURL();
        }
        setSectionImages(imgMap);
      } catch {
        // silently fall back to hardcoded content and default colors
      }
    };
    init();
  }, [actor, isFetching]);

  // Update admin status whenever login state changes
  useEffect(() => {
    if (identity) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [identity]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const sec = (key: SectionKey, fallback: string) => sections[key] ?? fallback;
  const handleSave = (key: string, content: string) => {
    setSections((prev) => ({ ...prev, [key]: content }));
  };

  const handleImageSave = (key: string, url: string) => {
    setSectionImages((prev) => ({ ...prev, [key]: url }));
  };

  const handleColorSave = (newColors: ColorSettings) => {
    setColors(newColors);
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

  const ImageEditBtn = ({ sectionKey }: { sectionKey: string }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isAdmin) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !actor) return;
      setUploading(true);
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        await actor.updateSectionImage(sectionKey, blob);
        const url = blob.getDirectURL();
        handleImageSave(sectionKey, url);
        toast.success("Bild gespeichert!");
      } catch {
        toast.error("Fehler beim Hochladen.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-ocid="image.upload_button"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          data-ocid="image.edit_button"
          className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/20 transition-colors text-foreground/70 hover:text-foreground disabled:opacity-50"
          aria-label="Bild hochladen"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Camera size={14} />
          )}
        </button>
      </>
    );
  };

  return (
    <div
      className="min-h-screen font-body relative"
      style={{ backgroundColor: colors.bgColor }}
    >
      <FloatingHearts color={colors.heartColor} />
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
              style={{ color: colors.navTextColor }}
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
                  style={{ color: colors.navTextColor }}
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
              {/* Login/Logout button */}
              {!isInitializing &&
                (isLoggedIn ? (
                  <button
                    type="button"
                    onClick={clear}
                    data-ocid="nav.primary_button"
                    className="flex items-center gap-1.5 text-sm font-body px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                    style={{
                      background: "rgba(232,96,154,0.18)",
                      color: colors.navTextColor,
                      border: "1px solid rgba(232,96,154,0.4)",
                    }}
                  >
                    <LogOut size={14} />
                    {isAdmin ? "Admin · Abmelden" : "Abmelden"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={login}
                    disabled={isLoggingIn}
                    data-ocid="nav.secondary_button"
                    className="flex items-center gap-1.5 text-sm font-body px-3 py-1.5 rounded-full transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: "rgba(74,124,89,0.18)",
                      color: colors.navTextColor,
                      border: "1px solid rgba(74,124,89,0.4)",
                    }}
                  >
                    {isLoggingIn ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LogIn size={14} />
                    )}
                    {isLoggingIn ? "Einloggen…" : "Login"}
                  </button>
                ))}
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-md"
              style={{ color: colors.navTextColor }}
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
                style={{ color: colors.navTextColor }}
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
            {/* Mobile Login/Logout */}
            {!isInitializing && (
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid rgba(74,124,89,0.3)" }}
              >
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      clear();
                      setMenuOpen(false);
                    }}
                    data-ocid="nav.primary_button"
                    className="flex items-center gap-2 py-2 text-sm font-body opacity-80 hover:opacity-100 transition-opacity"
                    style={{ color: colors.navTextColor }}
                  >
                    <LogOut size={14} />
                    {isAdmin ? "Admin · Abmelden" : "Abmelden"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      login();
                      setMenuOpen(false);
                    }}
                    disabled={isLoggingIn}
                    data-ocid="nav.secondary_button"
                    className="flex items-center gap-2 py-2 text-sm font-body opacity-80 hover:opacity-100 transition-opacity disabled:opacity-50"
                    style={{ color: colors.navTextColor }}
                  >
                    {isLoggingIn ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LogIn size={14} />
                    )}
                    {isLoggingIn ? "Einloggen…" : "Login"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Admin Toolbar */}
      {isAdmin && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 40,
            background: "rgba(20,20,20,0.85)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-400 flex-1">
              ✦ Admin-Modus aktiv
            </span>
            <button
              type="button"
              onClick={() => setAdminPanelOpen(true)}
              data-ocid="admin.open_modal_button"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-all bg-white/10 hover:bg-white/20"
              style={{ color: "#fff" }}
            >
              <Settings size={15} />
              Admin-Panel öffnen
            </button>
          </div>
        </div>
      )}

      {/* Admin Side Panel */}
      <AdminPanel
        open={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        colors={colors}
        onColorSave={handleColorSave}
        actor={actor}
        sections={sections}
        onEditSection={(key) => setEditKey(key)}
        sectionImages={sectionImages}
        onImageSave={handleImageSave}
      />

      {/* Hero */}
      <section
        id="top"
        className={`${sectionImages.hero_image ? "" : "hero-bg"} min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 relative`}
        style={{
          zIndex: 2,
          ...(sectionImages.hero_image
            ? {
                backgroundImage: `url(${sectionImages.hero_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-center gap-1">
            <p
              className="text-xl font-bold uppercase tracking-[0.3em] font-body mb-4"
              style={{ color: colors.titleColor }}
            >
              {sec("date_label", "7. – 9. August 2026")}
            </p>
            {isAdmin && (
              <span className="mb-4">
                <EditBtn sectionKey="date_label" />
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1">
            <h1
              className="font-display text-6xl sm:text-7xl md:text-8xl font-semibold leading-none mb-3"
              style={{ color: colors.titleColor }}
            >
              {sec("title", "Ella & Roman")}
            </h1>
            {isAdmin && (
              <span className="mb-3">
                <EditBtn sectionKey="title" />
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1">
            <p
              className="font-display text-2xl sm:text-3xl italic font-light mb-12"
              style={{ color: colors.subtitleColor }}
            >
              {sec("subtitle", "Liebe, Berge & Geschichten")}
            </p>
            {isAdmin && (
              <span className="mb-12">
                <EditBtn sectionKey="subtitle" />
              </span>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div
          className="animate-fade-up w-full max-w-lg"
          style={{ animationDelay: "0.35s" }}
        >
          <div
            className="rounded-2xl px-6 py-6"
            style={{
              background: colors.countdownBgColor,
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(232,96,154,0.4)",
              boxShadow: "0 8px 40px -8px rgba(232,96,154,0.25)",
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              <p
                className="text-xs uppercase tracking-[0.25em] font-body"
                style={{ color: "rgba(245,230,240,0.6)" }}
              >
                {sec("countdown_label", "Noch bis zur Hochzeit")}
              </p>
              {isAdmin && <EditBtn sectionKey="countdown_label" />}
            </div>
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
                    style={{ color: colors.accentColor }}
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
            style={{ color: colors.accentColor }}
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
            className="my-10 rounded-2xl overflow-hidden relative"
            style={{ boxShadow: "0 20px 60px -12px rgba(0,0,0,0.3)" }}
          >
            <img
              src={
                sectionImages.location_image ??
                "/assets/uploads/Bild-10.03.26-um-09.18-1-1.jpeg"
              }
              alt="Blick auf die Fronalp – Hochzeitslocation in den Glarner Bergen"
              className="w-full h-auto object-cover"
            />
            {isAdmin && (
              <div
                className="absolute top-3 right-3"
                style={{
                  background: "rgba(0,0,0,0.45)",
                  borderRadius: "999px",
                  padding: "2px",
                }}
              >
                <ImageEditBtn sectionKey="location_image" />
              </div>
            )}
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
              style={{ color: colors.accentColor }}
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
                style={{ color: colors.titleColor }}
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
                style={{ color: colors.titleColor }}
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
                style={{ color: colors.titleColor }}
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
              style={{ color: colors.accentColor }}
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
              style={{ color: colors.accentColor }}
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
          <SectionHeading
            editBtn={
              <>
                <EditBtn sectionKey="anmeldung" />
                <ImageEditBtn sectionKey="anmeldung_image" />
              </>
            }
          >
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

          {/* Anmeldung Image / QR Code slot */}
          {sectionImages.anmeldung_image ? (
            <div className="mt-8 flex flex-col items-center">
              <img
                src={sectionImages.anmeldung_image}
                alt="QR-Code / Anmeldelink"
                className="max-w-xs w-full rounded-xl"
                style={{
                  boxShadow: "0 8px 32px -8px rgba(232,96,154,0.3)",
                  border: "1px solid rgba(232,96,154,0.3)",
                }}
              />
            </div>
          ) : isAdmin ? (
            <AnmeldungImageUploadTrigger
              actor={actor}
              onSave={(url) => handleImageSave("anmeldung_image", url)}
            />
          ) : null}

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
              style={{ color: colors.accentColor }}
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
          style={{ color: colors.accentColor }}
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

// --- Anmeldung Image Upload Trigger (inline placeholder for admin) ---
function AnmeldungImageUploadTrigger({
  actor,
  onSave,
}: {
  actor: import("./backend").backendInterface | null;
  onSave: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.updateSectionImage("anmeldung_image", blob);
      onSave(blob.getDirectURL());
      toast.success("Bild gespeichert!");
    } catch {
      toast.error("Fehler beim Hochladen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        data-ocid="anmeldung-image-trigger"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        className="mt-8 flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors hover:bg-white/10"
        style={{ borderColor: "rgba(232,96,154,0.4)" }}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: "#e8609a" }}
          />
        ) : (
          <Camera size={32} style={{ color: "rgba(232,96,154,0.6)" }} />
        )}
        <span
          className="font-body text-sm"
          style={{ color: "rgba(20,60,30,0.6)" }}
        >
          {uploading ? "Hochladen…" : "QR-Code / Bild hochladen"}
        </span>
      </button>
    </>
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
