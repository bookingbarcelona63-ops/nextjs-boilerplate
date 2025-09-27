'use client';

import { useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

type Lang = 'es' | 'en';
type Category = 'turistico' | 'corta' | 'vacaciones' | 'mensual';

type Apt = {
  id: string; title: string; title_en: string;
  nightly: number; cleaningFee: number; capacity: number; bedrooms: number;
  images: string[]; coords: { lat: number; lon: number }; categories: Category[];
};

const APTS: Apt[] = [
  { id:'gracia-401', title:'Passeig de Gràcia — Terraza Privada', title_en:'Passeig de Gràcia — Private Terrace',
    nightly:210, cleaningFee:55, capacity:4, bedrooms:1,
    images:['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop'],
    coords:{lat:41.3917,lon:2.1649}, categories:['turistico','corta','vacaciones','mensual'] },
  { id:'gracia-402', title:'Passeig de Gràcia — Ático con Terraza', title_en:'Passeig de Gràcia — Penthouse Terrace',
    nightly:180, cleaningFee:55, capacity:4, bedrooms:1,
    images:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop'],
    coords:{lat:41.3929,lon:2.1662}, categories:['turistico','corta','vacaciones'] },
];

const STR = {
  es:{brand:'letsgobarcelona.com',headline:'Barcelona — Alojamientos con terraza en Passeig de Gràcia',sub:'Reserva directa con mejor precio garantizado',
      categories:{turistico:'Piso turístico',corta:'Estancia corta',vacaciones:'Vacaciones',mensual:'Piso por meses'},
      dates:'Fechas',from:'Entrada',to:'Salida',guests:'Huéspedes',adults:'Adultos',children:'Niños',
      pickApartment:'Elige un apartamento',perNight:'/noche',max:(n:number)=>`Máx. ${n} huéspedes`,
      nights:(n:number)=>`${n} noche${n===1?'':'s'}`,location:'Passeig de Gràcia, Barcelona',seeOnOSM:'Ver en OpenStreetMap',book:'Reservar'},
  en:{brand:'letsgobarcelona.com',headline:'Barcelona — Terrace apartments on Passeig de Gràcia',sub:'Best price direct booking',
      categories:{turistico:'Tourist apartment',corta:'Short stay',vacaciones:'Holiday',mensual:'Monthly stay'},
      dates:'Dates',from:'Check-in',to:'Check-out',guests:'Guests',adults:'Adults',children:'Children',
      pickApartment:'Choose an apartment',perNight:'/night',max:(n:number)=>`Max ${n} guests`,
      nights:(n:number)=>`${n} night${n===1?'':'s'}`,location:'Passeig de Gràcia, Barcelona',seeOnOSM:'See on OpenStreetMap',book:'Book now'},
} as const;

export default function Page() {
  const [lang,setLang]=useState<Lang>('es'); const t=STR[lang];
  const [category,setCategory]=useState<Category>('turistico');
  const filtered=useMemo(()=>APTS.filter(a=>a.categories.includes(category)),[category]);
  const [aptId,setAptId]=useState<string>(APTS[0].id);
  const apt=useMemo(()=>APTS.find(a=>a.id===aptId)!,[aptId]);

  const today=new Date();
  const [from,setFrom]=useState<string>(format(addDays(today,1),'yyyy-MM-dd'));
  const [to,setTo]=useState<string>(format(addDays(today,4),'yyyy-MM-dd'));
  const [adults,setAdults]=useState(2); const [children,setChildren]=useState(0);

  const nights=useMemo(()=>{try{const f=parseISO(from);const t2=parseISO(to);return Math.max(1,differenceInCalendarDays(t2,f));}catch{return 0;}},[from,to]);
  const fmt=new Intl.NumberFormat(lang==='es'?'es-ES':'en-GB',{style:'currency',currency:'EUR'});
  const totalBase=nights*apt.nightly+apt.cleaningFee;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">🏠 {t.brand}</div>
          <select className="border rounded-md px-2 py-1 text-sm" value={lang} onChange={e=>setLang(e.target.value as Lang)}>
            <option value="es">Español</option><option value="en">English</option>
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t.headline}</h1>
            <p className="text-slate-600 mt-2">{t.sub}</p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['turistico','corta','vacaciones','mensual'] as Category[]).map(c=>(
                <button key={c} onClick={()=>setCategory(c)}
                        className={`rounded-xl border p-3 text-left text-sm transition ${category===c?'ring-2 ring-slate-900 bg-white':'hover:shadow-sm'}`}>
                  {t.categories[c as keyof typeof t['categories']]}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded-xl p-4 bg-white/80">
                <div className="text-[11px] uppercase text-slate-500">{t.dates}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-600">{t.fr

}
