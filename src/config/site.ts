import { CANONICAL_ORIGIN, normalizeSiteOrigin } from './canonical';

export const SITE = {
  name: 'Mindleap',
  title: 'Mindleap - Agenție de Marketing Digital',
  description: 'Agenție de marketing digital specializată în servicii complete de marketing: audit ecosystem marketing, social media management, reels/short form video, email marketing, copywriting, advertising, design graphic.',
  url: normalizeSiteOrigin(import.meta.env.PUBLIC_SITE_URL || CANONICAL_ORIGIN),
  lang: 'ro',
  ogImage: '/og-image.jpg',
  author: 'Mindleap',
  phone: import.meta.env.PUBLIC_PHONE || '+40756545054',
  whatsapp: import.meta.env.PUBLIC_WHATSAPP || '40756545054',
  email: import.meta.env.PUBLIC_EMAIL || 'hello@mindleap.ro',
  address: {
    street: 'Str. D. D. Roșca nr. 58',
    city: 'Sibiu',
    county: 'Sibiu',
    postalCode: '550043',
    country: 'România',
    placeName: 'Mindleap Strategies',
  },
  company: {
    legalName: 'MINDLEAP STRATEGIES SRL',
    cui: '46369414',
    tradeRegister: 'J2022001325326',
  },
  social: {
    instagram: import.meta.env.PUBLIC_INSTAGRAM || 'https://www.instagram.com/grow.with.mindleap',
    facebook: import.meta.env.PUBLIC_FACEBOOK || 'https://www.facebook.com/grow.with.mindleap',
    linkedin: import.meta.env.PUBLIC_LINKEDIN || 'https://www.linkedin.com/in/codobanioan/',
    tiktok: import.meta.env.PUBLIC_TIKTOK || 'https://www.tiktok.com/@codobanioan',
  },
} as const;

export const NAVIGATION = [
  { name: 'Acasă', href: '/' },
  { name: 'Servicii', href: '/servicii' },
  { name: 'Despre noi', href: '/despre-noi' },
  { name: 'Studii de caz', href: '/studii-de-caz' },
  { name: 'Contact', href: '/contact' },
  { name: 'Resurse', href: '/resurse' },
] as const;

// Categorii principale de servicii pentru navbar
export const MAIN_SERVICES = [
  {
    id: 'strategie-audit',
    name: 'Strategie și audit',
    href: '/servicii#strategie-audit',
  },
  {
    id: 'social-media',
    name: 'Social media',
    href: '/servicii#social-media',
  },
  {
    id: 'reels-video',
    name: 'Reels & video',
    href: '/servicii#reels-video',
  },
  {
    id: 'advertising',
    name: 'Advertising',
    href: '/servicii#advertising',
  },
] as const;

// Servicii detaliate organizate pe categorii
export const SERVICES = {
  'crestere-organica': {
    id: 'crestere-organica',
    name: 'Creștere organică',
    description: 'Strategii de marketing organic pentru creștere sustenabilă și prezență online autentică',
    services: [
      {
        id: 'optimizare-cautare-ai',
        name: 'Optimizare căutări AI',
        description: 'Asigură-te că conținutul brandului tău apare în instrumentele de inteligență artificială conversațională și generativă.',
      },
      {
        id: 'optimizare-motoare-cautare',
        name: 'Optimizare motoare de căutare (SEO)',
        description: 'Crește-ți vizibilitatea online și domină clasamentele de căutare cu strategii SEO puternice.',
      },
      {
        id: 'marketing-conținut',
        name: 'Marketing de conținut',
        description: 'Captează și convertește audiența ta cu crearea și strategia de conținut convingătoare.',
      },
      {
        id: 'marketing-influenceri',
        name: 'Influenceri Marketing',
        description: 'Folosește puterea influențatorilor pentru a amplifica raza de acțiune și impactul brandului tău.',
      },
      {
        id: 'social-media-organic',
        name: 'Social Media management',
        description: 'Aprinde prezența ta pe social media și cultivă conexiuni semnificative cu strategii de Social Media Organic.',
      },
      {
        id: 'email-marketing',
        name: 'Email Marketing',
        description: 'Descoperă potențialul campaniilor de email personalizate și captivante cu soluții de Email Marketing axate pe rezultate.',
      },
    ],
  },
  'campanii-platite': {
    id: 'campanii-platite',
    name: 'Campanii plătite',
    description: 'Strategii de publicitate plătită pentru rezultate măsurabile și ROI optimizat',
    services: [
      {
        id: 'strategie-planificare-media',
        name: 'Strategie și planificare media',
        description: 'Navighează în lumea media plătită cu încredere. Expertiza noastră strategică transformă obiectivele tale într-un plan media cuprinzător, optimizând expunerea și rezonanța brandului.',
      },
      {
        id: 'cautare-platita',
        name: 'Căutare plătită',
        description: 'Descoperă și maximizează potențialul business-ului tău cu campanii de căutare plătită care generează trafic, amplifică conversiile și sporește ROI-ul.',
      },
      {
        id: 'social-platit',
        name: 'Social plătit',
        description: 'Ridică prezența și angajarea brandului tău online prin strategiile noastre de social plătit. Conectează-te cu audiența ta, declanșează conversații și obține rezultate remarcabile.',
      },
      {
        id: 'programmatic-display',
        name: 'Programmatic & Display',
        description: 'De la targeting precis la imagini atrăgătoare, soluțiile noastre programmatic și display generează impresii impactante care duc la conversii — livrând mesajul tău cu eficiență de neegalat.',
      },
      {
        id: 'marketplaces',
        name: 'Marketplaces',
        description: 'Descoperă noi căi de creștere a vânzărilor de produse prin marketplaces. Folosește expertiza noastră pentru a-ți optimiza prezența pe diverse platforme e-commerce, extinde baza de clienți și maximizează veniturile.',
      },
      {
        id: 'streaming',
        name: 'Streaming',
        description: 'Succesul streaming redefinit. Câștigă cu strategiile noastre de video și audio streaming, poți angaja audiențele țintă și cultiva un following loial.',
      },
      {
        id: 'operatiuni-publicitare',
        name: 'Operațiuni publicitare',
        description: 'Integrează platforme de marketing noi sau existente. Creează, implementează și testează tag-uri de site și integrări de date pentru a rămâne în fața schimbărilor din peisajul media.',
      },
    ],
  },
  'creative': {
    id: 'creative',
    name: 'Creare conținut',
    description: 'Soluții creative performante care transformă ideile în rezultate măsurabile',
    services: [
      {
        id: 'creative-performant',
        name: 'Creative performant',
        description: 'Creative-ul este o pârghie de performanță, una care combină date, insights despre audiență și storytelling de brand pentru a livra rezultate măsurabile. Nu facem doar reclame, construim sisteme creative care generează rezultate pentru business.',
      },
      {
        id: 'branding',
        name: 'Branding',
        description: 'Ajutăm business-urile să creeze, să dezvolte și să mențină o identitate de brand unică care rezonează cu audiența lor țintă. Creare nume, sistem de identitate, arhitectură de brand, platformă de mesagerie și multe altele.',
      },
      {
        id: 'productie-conținut',
        name: 'Producție conținut',
        description: 'Livrăm conținut vizual uimitor conceput pentru a îndeplini obiectivele partenerilor noștri. Proiectele noastre sunt susținute de regizorii, fotograții, cinematografii, scriitorii, stilistii și artiștii de top din industrie!',
      },
      {
        id: 'design-website',
        name: 'Design website',
        description: 'Servicii de design și dezvoltare website construite pentru performanță. Echipa noastră expertă creează site-uri vizual uimitoare, prietenoase cu utilizatorul, optimizate pentru viteză, responsivitate și conversie.',
      },
      {
        id: 'design-grafic-motion',
        name: 'Design grafic și motion',
        description: 'Echipa noastră de designeri grafici și motion extrem de talentați conduce dezvoltarea identităților de brand originale, diverse active grafice print și digitale și animații 2D și 3D.',
      },
      {
        id: 'productie-audio',
        name: 'Producție audio',
        description: 'Colaborăm cu vocaliști, compozitori, muzicieni, artiști voice-over și mulți alții, producătorii noștri livrează muzică de ultimă generație, podcast-uri, spoturi radio și alte proiecte audio.',
      },
    ],
  },
  'consultanta': {
    id: 'consultanta',
    name: 'Consultanță',
    description: 'Insights bazate pe date și strategii pentru decizii informate',
    services: [
      {
        id: 'analiza-date-insights',
        name: 'Analiză date și insights',
        description: 'Obține o înțelegere mai profundă a clienților și performanței marketing-ului prin prognoză, explorare full-funnel și analize de impact al campaniilor.',
      },
      {
        id: 'dezvoltare-dashboard',
        name: 'Dezvoltare dashboard',
        description: 'Dashboard-urile noastre oferă vizualizări ușor de citit ale performanței marketing-ului bazate pe ierarhia metricilor preferate de tine.',
      },
      {
        id: 'optimizare-rata-conversie',
        name: 'Optimizare rata conversie',
        description: 'Crește ratele de conversie și scade costurile de achiziție a clienților prin programe de testare îmbunătățite.',
      },
      {
        id: 'experienta-utilizator',
        name: 'Experiență utilizator (UX)',
        description: 'Îmbunătățește UX-ul pentru site-uri web și pagini de destinație folosind o combinație de best practices de design, date de angajare pe pagină, analiză competitivă și testare utilizator.',
      },
    ],
  },
} as const;

