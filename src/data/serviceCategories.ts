export type ServiceScreen = {
  section: string;
  rows: string[];
};

export type ServiceCategory = {
  id: string;
  icon: string;
  label: string;
  tag1: string;
  tag2: string;
  title: string;
  description: string;
  screen: ServiceScreen;
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'strategie',
    icon: 'ti-target-arrow',
    label: 'Strategie',
    tag1: 'Claritate înainte de execuție',
    tag2: 'Plan de creștere',
    title: 'Strategy core',
    description:
      'Înțelegem businessul, oferta și blocajele reale, ca fiecare canal să aibă un rol clar în creștere.',
    screen: {
      section: 'Strategie',
      rows: ['Audit de marketing', 'Poziționare și mesaje', 'Customer journey'],
    },
  },
  {
    id: 'social',
    icon: 'ti-message-circle-2',
    label: 'Social media',
    tag1: 'Prezență constantă',
    tag2: 'Conținut coerent',
    title: 'Content engine',
    description:
      'Transformăm ideile și expertiza brandului în conținut relevant, publicat constant pe canalele tale.',
    screen: {
      section: 'Social media',
      rows: ['Social media management', 'Calendar editorial', 'Copywriting'],
    },
  },
  {
    id: 'video',
    icon: 'ti-movie',
    label: 'Video',
    tag1: 'Atenție prin format vizual',
    tag2: 'Reels și short form',
    title: 'Creative layer',
    description:
      'Construim materiale video care fac mesajul tău ușor de înțeles și de reținut, gata pentru Reels și TikTok.',
    screen: {
      section: 'Video',
      rows: ['Reels și short form', 'Scripturi video', 'Editare video'],
    },
  },
  {
    id: 'ads',
    icon: 'ti-ad-2',
    label: 'Ads',
    tag1: 'Campanii pentru leaduri',
    tag2: 'Optimizare conversii',
    title: 'Growth engine',
    description:
      'Conectăm strategia și mesajele cu campanii Meta și Google gândite pentru conversie, nu doar afișări.',
    screen: {
      section: 'Ads',
      rows: ['Meta ads', 'Google ads', 'Landing pages'],
    },
  },
  {
    id: 'seo',
    icon: 'ti-search',
    label: 'SEO',
    tag1: 'Trafic organic',
    tag2: 'Prezență locală',
    title: 'Visibility layer',
    description:
      'Te ajutăm să fii găsit de oamenii care caută activ serviciile tale, local și pe Google.',
    screen: {
      section: 'SEO',
      rows: ['SEO local', 'SEO tehnic', 'Google Business Profile'],
    },
  },
  {
    id: 'automatizare',
    icon: 'ti-bolt',
    label: 'Automatizare',
    tag1: 'Follow-up automat',
    tag2: 'AI workflows',
    title: 'Automation layer',
    description:
      'Reducem pierderile dintre interes, lead și vânzare prin email, automatizări și AI aplicat practic.',
    screen: {
      section: 'Automatizare',
      rows: ['Email marketing', 'Newslettere', 'AI workflows'],
    },
  },
];
