export type GatedResource = {
  id: string;
  slug: string;
  title: string;
  category: 'Template' | 'Checklist';
  description: string;
  icon: string;
  type?: string;
  downloadFile: string;
};

export const RESOURCE_TEMPLATES: GatedResource[] = [
  {
    id: 'template-1',
    slug: 'planificare-continut-social-media',
    title: 'Template Planificare Conținut Social Media',
    category: 'Template',
    description: 'O lună de postări organizate, fără să stai trei ore în Excel ca să le pui cap la cap.',
    type: 'CSV',
    icon: 'ti-table',
    downloadFile: '/resurse/downloads/template-planificare-social-media.csv',
  },
  {
    id: 'template-2',
    slug: 'brief-creative',
    title: 'Template Brief Creative',
    category: 'Template',
    description: 'Dai brief-ul corect din prima, fără tur-retur cu graficianul sau videograful.',
    type: 'PDF',
    icon: 'ti-file-text',
    downloadFile: '/resurse/downloads/template-brief-creative.pdf',
  },
  {
    id: 'template-3',
    slug: 'audit-marketing-digital',
    title: 'Template Audit Marketing Digital',
    category: 'Template',
    description: 'Vezi exact unde se pierd bani și atenție în ecosistemul tău, în douăzeci de minute.',
    type: 'PDF',
    icon: 'ti-clipboard-check',
    downloadFile: '/resurse/downloads/template-audit-marketing-digital.pdf',
  },
];

export const RESOURCE_CHECKLISTS: GatedResource[] = [
  {
    id: 'checklist-1',
    slug: 'launch-facebook-ads',
    title: 'Checklist Launch Campanie Facebook Ads',
    category: 'Checklist',
    description: 'Toți pașii, în ordine, ca să nu arzi buget pe greșeli de setup din prima zi.',
    icon: 'ti-brand-facebook',
    downloadFile: '/resurse/downloads/checklist-launch-facebook-ads.pdf',
  },
  {
    id: 'checklist-2',
    slug: 'seo-on-page',
    title: 'Checklist Optimizare SEO On-Page',
    category: 'Checklist',
    description: 'Verifici ce contează cu adevărat pentru Google, nu zeci de detalii fără impact.',
    icon: 'ti-search',
    downloadFile: '/resurse/downloads/checklist-seo-on-page.pdf',
  },
  {
    id: 'checklist-3',
    slug: 'content-calendar',
    title: 'Checklist Content Calendar',
    category: 'Checklist',
    description: 'Construiești un calendar care ține, nu unul abandonat după două săptămâni.',
    icon: 'ti-calendar',
    downloadFile: '/resurse/downloads/checklist-content-calendar.pdf',
  },
];
