'use client';

import { useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon, BedDouble, Users, MapPin, CheckCircle2, Languages } from "lucide-react";

// --- Helpers ---
const currency = (n: number, lang: Lang) => new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-GB", { style: "currency", currency: "EUR" }).format(n);

// --- Types ---
type Lang = "es" | "en";

type DateRange = {
  from?: Date;
  to?: Date;
};

type Apartment = {
  id: string;
  title: string;
  title_en: string;
  nightly: number; // € per night
  cleaningFee: number; // € per stay
  capacity: number;
  bedrooms: number;
  sofaBed: boolean;
  terrace: boolean;
  images: string[];
  disabledDates?: string[]; // ISO dates blocked (demo)
};

const APTS: Apartment[] = [
  {
    id: "gracia-401",
    title: "Passeig de Gràcia — Terraza Privada",
    title_en: "Passeig de Gràcia — Private Terrace",
    nightly: 210,
    cleaningFee: 55,
    capacity: 4,
    bedrooms: 1,
    sofaBed: true,
    terrace: true,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    ],
    disabledDates: ["2025-10-05", "2025-10-06", "2025-11-21"],
  },
  {
    id: "gracia-402",
    title: "Passeig de Gràcia — Ático con Terraza",
    title_en: "Passeig de Gràcia — Penthouse Terrace",
    nightly: 180,
    cleaningFee: 55,
    capacity: 4,
    bedrooms: 1,
    sofaBed: true,
    terrace: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop",
    ],
    disabledDates: ["2025-09-30", "2025-10-01"],
  },
];

const STRINGS = {
  es: {
    headline: "Reserva directa — Apartamentos turísticos en Barcelona",
    sub: "1 dormitorio + sofá cama • Gran terraza privada • Passeig de Gràcia",
    dates: "Fechas",
    guests: "Huéspedes",
    adults: "Adultos",
    children: "Niños",
    apt: "Apartamento",
    selectDates: "Selecciona fechas",
    nights: (n: number) => `${n} noche${n === 1 ? "" : "s"}`,
    priceBreakdown: "Desglose de precio",
    cityTaxLabel: "Tasa turística (por persona y noche)",
    total: "Total",
    bookNow: "Reservar ahora",
    name: "Nombre y apellidos",
    email: "Email",
    phone: "Teléfono",
    notes: "Petición opcional (hora llegada, etc.)",
    rules: "Acepto las normas de la casa y la política de cancelación",
    confirm: "Confirmar reserva",
    pickApartment: "Elige un apartamento",
    availability: "Disponibilidad",
    successTitle: "¡Reserva confirmada!",
    successText: (code: string) => `Tu localizador es ${code}. Te hemos enviado un email con los detalles.`,
    perNight: "/noche",
    max: (n: number) => `Máx. ${n} huéspedes`,
    lang: "Idioma",
    location: "Passeig de Gràcia, Barcelona",
    fromTo: (from?: Date, to?: Date) => from && to ? `${format(from, "dd MMM y", { locale: es })} → ${format(to, "dd MMM y", { locale: es })}` : "Selecciona fechas",
  },
  en: {
    headline: "Direct booking — Barcelona serviced apartments",
    sub: "1 bedroom + sofa bed • Large private terrace • Passeig de Gràcia",
    dates: "Dates",
    guests: "Guests",
    adults: "Adults",
    children: "Children",
    apt: "Apartment",
    selectDates: "Select dates",
    nights: (n: number) => `${n} night${n === 1 ? "" : "s"}`,
    priceBreakdown: "Price breakdown",
    cityTaxLabel: "City tax (per person per night)",
    total: "Total",
    bookNow: "Book now",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    notes: "Optional note (arrival time, etc.)",
    rules: "I accept the house rules and cancellation policy",
    confirm: "Confirm booking",
    pickApartment: "Choose an apartment",
    availability: "Availability",
    successTitle: "Booking confirmed!",
    successText: (code: string) => `Your reference is ${code}. We've emailed your details.`,
    perNight: "/night",
    max: (n: number) => `Max ${n} guests`,
    lang: "Language",
    location: "Passeig de Gràcia, Barcelona",
    fromTo: (from?: Date, to?: Date) => from && to ? `${format(from, "dd MMM y", { locale: enUS })} → ${format(to, "dd MMM y", { locale: enUS })}` : "Select dates",
  },
} as const;

export default function BarcelonaAptsBooking() {
  const [lang, setLang] = useState<Lang>("es");
  const t = STRINGS[lang];
  const [selectedAptId, setSelectedAptId] = useState<string | null>(APTS[0].id);
  const apt = useMemo(() => APTS.find(a => a.id === selectedAptId)!, [selectedAptId]);

  const [range, setRange] = useState<DateRange>({ from: addDays(new Date(), 1), to: addDays(new Date(), 4) });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cityTax, setCityTax] = useState(0); // configurable € per person per night

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const nights = range.from && range.to ? Math.max(1, differenceInCalendarDays(range.to, range.from)) : 0;
  const guests = adults + children;

  const blocked = (date: Date) => {
    const iso = format(date, "yyyy-MM-dd");
    return apt.disabledDates?.includes(iso) ?? false;
  };

  const base = nights * apt.nightly;
  const taxes = nights * cityTax * guests;
  const total = base + apt.cleaningFee + taxes;

  function handleConfirm() {
    if (!range.from || !range.to || !name || !email || !agreed) return;
    const code = `${apt.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setSuccessCode(code);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble className="w-6 h-6" />
            <span className="font-semibold">letsgobarcelona.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Languages className="w-4 h-4" />
            <Select value={lang} onValueChange={(v: Lang) => setLang(v)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Idioma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.headline}</h1>
          <p className="text-slate-600 mt-1">{t.sub}</p>
        </motion.div>

        {/* Search bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <Label className="text-xs uppercase text-slate-500">{t.dates}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mt-2">
                    <div className="flex items-center gap-2 text-left">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="truncate">{t.fromTo(range.from, range.to)}</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={range as any}
                    onSelect={(r: any) => setRange(r || {})}
                    initialFocus
                    numberOfMonths={2}
                    locale={lang === "es" ? es : enUS}
                    disabled={blocked}
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <Label className="text-xs uppercase text-slate-500">{t.guests}</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-600 text-sm">{t.adults}</Label>
                  <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-600 text-sm">{t.children}</Label>
                  <Select value={String(children)} onValueChange={(v) => setChildren(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{t.max(apt.capacity)}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <Label className="text-xs uppercase text-slate-500">{t.apt}</Label>
              <Select value={selectedAptId!} onValueChange={(v) => setSelectedAptId(v)}>
                <SelectTrigger className="mt-2"><SelectValue placeholder={t.pickApartment} /></SelectTrigger>
                <SelectContent>
                  {APTS.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {lang === "es" ? a.title : a.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Apartments */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {APTS.map((a) => (
            <Card key={a.id} className={`overflow-hidden border ${selectedAptId === a.id ? "ring-2 ring-slate-900" : ""}`}>
              <div className="aspect-[16/9] w-full bg-cover bg-center" style={{ backgroundImage: `url(${a.images[0]})` }} />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{lang === "es" ? a.title : a.title_en}</span>
                  <Badge variant={selectedAptId === a.id ? "default" : "secondary"}>{currency(a.nightly, lang)} {t.perNight}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-1"><BedDouble className="w-4 h-4" />{a.bedrooms} BR + sofá cama</div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4" />{t.max(a.capacity)}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{t.location}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant={selectedAptId === a.id ? "default" : "outline"} onClick={() => setSelectedAptId(a.id)}>{selectedAptId === a.id ? (lang === "es" ? "Seleccionado" : "Selected") : (lang === "es" ? "Elegir" : "Choose")}</Button>
                  <span className="text-xs text-slate-500">{t.availability}: {(a.disabledDates?.length ?? 0) === 0 ? (lang === "es" ? "Alta" : "High") : (lang === "es" ? "Consulta fechas" : "Check dates")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price + form */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.priceBreakdown}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>{apt.nightly}€ × {t.nights(nights)}</span><span>{currency(base, lang)}</span></div>
                <div className="flex justify-between"><span>{lang === "es" ? "Limpieza" : "Cleaning"}</span><span>{currency(apt.cleaningFee, lang)}</span></div>
                <div className="flex justify-between items-center gap-2">
                  <span>{t.cityTaxLabel}</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="w-24" value={cityTax} min={0} step={0.1} onChange={(e) => setCityTax(parseFloat(e.target.value || "0"))} />
                    <span>€</span>
                  </div>
                  <span className="ml-auto">{currency(taxes, lang)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-base">
                  <span>{t.total}</span><span>{currency(total, lang)}</span>
                </div>
                <p className="text-xs text-slate-500">{lang === "es" ? "La tasa turística en Barcelona cambia periódicamente. Introduce la cifra vigente para que el cálculo sea correcto." : "Barcelona city tax changes periodically. Enter the current amount to calculate correctly."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === "es" ? "Datos de la reserva" : "Guest details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>{t.name}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="" />
                </div>
                <div>
                  <Label>{t.email}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="" />
                </div>
                <div>
                  <Label>{t.phone}</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="" />
                </div>
                <div>
                  <Label>{t.notes}</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="font-normal text-slate-700">{t.rules}</Label>
                  </div>
                  <Switch checked={agreed} onCheckedChange={setAgreed} />
                </div>
                <Button className="w-full" size="lg" onClick={handleConfirm} disabled={!range.from || !range.to || !name || !email || !agreed || guests > apt.capacity}>
                  {t.confirm}
                </Button>
                {!range.from || !range.to ? (
                  <p className="text-xs text-amber-600">{t.selectDates}</p>
                ) : null}
                {guests > apt.capacity ? (
                  <p className="text-xs text-red-600">{lang === "es" ? "Demasiados huéspedes para este apartamento." : "Too many guests for this apartment."}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success */}
        {successCode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="border-green-600">
              <CardHeader className="flex-row items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle>{t.successTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{t.successText(successCode)}</p>
                <p className="text-sm text-slate-500 mt-2">{lang === "es" ? "Esto es una demo sin pagos ni emails reales. Podemos conectarlo a Stripe, iCal/Airbnb y un CMS." : "This is a demo without real payments or emails. We can connect Stripe, iCal/Airbnb and a CMS."}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 pb-10 text-xs text-slate-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>© {new Date().getFullYear()} letsgobarcelona.com — {lang === "es" ? "Reserva directa con mejor precio." : "Best price direct booking."}</div>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">{lang === "es" ? "Aviso legal" : "Legal"}</a>
              <a href="#" className="hover:underline">{lang === "es" ? "Privacidad" : "Privacy"}</a>
              <a href="#" className="hover:underline">Cookies</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
