export type CaseStudyListing = {
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  summary: string;
  logoHeight?: string;
  logoBox?: string;
};

export const CASE_STUDIES: CaseStudyListing[] = [
  {
    slug: 'bubble-kids',
    name: 'Bubble Kids',
    logo: '/parteneri/logo-bubble-kids.webp',
    tagline: 'Lansare martie 2026 — peste 15 evenimente în prima lună',
    summary: 'De la zero rezervări la calendar plin: grafică, ads, Google Business Profile, reels, customer experience și eveniment de lansare.',
    logoHeight: 'h-16 md:h-20',
    logoBox: 'h-24 md:h-28 w-44 md:w-48',
  },
  {
    slug: 'stereographic',
    name: 'Stereographic',
    logo: '/parteneri/logo-stereographic.webp',
    tagline: 'Peste 100.000 € din SEO + ecosistem complet 2026',
    summary: 'SEO, graphic design, email marketing, business development, social media (Facebook, Instagram, LinkedIn) și vânzări.',
    logoHeight: 'h-10 md:h-12',
  },
  {
    slug: 'coldea-expert-construct',
    name: 'Coldea Expert Construct',
    logo: '/parteneri/logo-coldea.webp',
    tagline: 'Creștere scalabilă prin marketing strategic',
    summary: 'Echipă de la 5 la 12 angajați, 30.000+ urmăritori pe social media, proiecte de top.',
    logoHeight: 'h-12 md:h-14',
  },
];
