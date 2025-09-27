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
                  <label className="text-xs text-slate-600">{t.from}
                    <input type="date" className="mt-1 w-full border rounded-md px-2 py-1" value={from} onChange={e=>setFrom(e.target.value)}/>
                  </label>
                  <label className="text-xs text-slate-600">{t.to}
                    <input type="date" className="mt-1 w-full border rounded-md px-2 py-1" value={to} onChange={e=>setTo(e.target.value)}/>
                  </label>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-white/80">
                <div className="text-[11px] uppercase text-slate-500">{t.guests}</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-600">{t.adults}
                    <select className="mt-1 w-full border rounded-md px-2 py-1" value={adults} onChange={e=>setAdults(parseInt(e.target.value))}>
                      {[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-slate-600">{t.children}
                    <select className="mt-1 w-full border rounded-md px-2 py-1" value={children} onChange={e=>setChildren(parseInt(e.target.value))}>
                      {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-white/80">
                <div className="text-[11px] uppercase text-slate-500">{t.pickApartment}</div>
                <select className="mt-2 w-full border rounded-md px-2 py-2" value={aptId} onChange={e=>setAptId(e.target.value)}>
                  {filtered.map(a=><option key={a.id} value={a.id}>{lang==='es'?a.title:a.title_en}</option>)}
                </select>
                <div className="text-xs text-slate-500 mt-2">{nights>0?`${nights} ${t.nights(nights)}`:''}</div>
              </div>
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-white">
            <div className="p-4 font-semibold">📍 {t.location}</div>
            <div className="aspect-[16/12] w-full">
              <iframe title="map" className="w-full h-full border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${apt.coords.lon-0.01}%2C${apt.coords.lat-0.01}%2C${apt.coords.lon+0.01}%2C${apt.coords.lat+0.01}&layer=mapnik&marker=${apt.coords.lat}%2C${apt.coords.lon}`}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="p-3 text-xs text-slate-600 flex items-center justify-between">
              <span>{t.location}</span>
              <a className="underline" href={`https://www.openstreetmap.org/?mlat=${apt.coords.lat}&mlon=${apt.coords.lon}#map=16/${apt.coords.lat}/${apt.coords.lon}`} target="_blank" rel="noreferrer">
                {t.seeOnOSM}
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(a=>(
            <div key={a.id} className={`rounded-2xl border overflow-hidden ${aptId===a.id?'ring-2 ring-slate-900':''}`}>
              <div className="aspect-[16/9] w-full bg-cover bg-center" style={{backgroundImage:`url(${a.images[0]})`}}/>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{lang==='es'?a.title:a.title_en}</div>
                  <div className="text-sm bg-slate-100 rounded px-2 py-1">{fmt.format(a.nightly)} {t.perNight}</div>
                </div>
                <div className="mt-2 text-sm text-slate-600">{a.bedrooms} BR · {t.max(a.capacity)}</div>
                <div className="mt-3 flex gap-2">
                  <button className={`px-3 py-2 rounded-md border ${aptId===a.id?'bg-black text-white':'bg-white hover:bg-slate-50'}`} onClick={()=>setAptId(a.id)}>
                    {lang==='es'?'Elegir':'Choose'}
                  </button>
                  <a className="text-sm underline" href={`https://www.openstreetmap.org/?mlat=${a.coords.lat}&mlon=${a.coords.lon}#map=16/${a.coords.lat}/${a.coords.lon}`} target="_blank" rel="noreferrer">
                    {t.seeOnOSM}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 border rounded-2xl p-5 bg-white">
          <div className="font-semibold mb-2">{lang==='es'?'Desglose de precio':'Price breakdown'}</div>
          <div className="text-sm flex justify-between"><span>{fmt.format(apt.nightly)} × {t.nights(nights)}</span><span>{fmt.format(nights*apt.nightly)}</span></div>
          <div className="text-sm flex justify-between"><span>{lang==='es'?'Limpieza':'Cleaning'}</span><span>{fmt.format(apt.cleaningFee)}</span></div>
          <div className="mt-2 border-t pt-2 font-semibold flex justify-between"><span>Total</span><span>{fmt.format(totalBase)}</span></div>
          <div className="mt-3"><button className="px-4 py-2 rounded-md bg-black text-white">{t.book}</button></div>
        </section>

        <footer className="mt-12 border-t pt-6 pb-10 text-xs text-slate-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>© {new Date().getFullYear()} letsgobarcelona.com</div>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">{lang==='es'?'Aviso legal':'Legal'}</a>
              <a href="#" className="hover:underline">{lang==='es'?'Privacidad':'Privacy'}</a>
              <a href="#" className="hover:underline">Cookies</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

