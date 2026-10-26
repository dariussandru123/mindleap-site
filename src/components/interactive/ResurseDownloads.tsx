import React, { useCallback, useEffect, useId, useState } from 'react';
import ResourceDownloadModal from '@/components/interactive/ResourceDownloadModal';
import { RESOURCE_CHECKLISTS, RESOURCE_TEMPLATES, type GatedResource } from '@/data/resources';

const STORAGE_KEY = 'mindleap_resource_lead_v1';

type StoredLead = {
  name: string;
  email: string;
};

type GridProps = {
  items: GatedResource[];
  actionLabel: string;
  onSelect: (item: GatedResource) => void;
  loading: boolean;
};

function readStoredLead(): StoredLead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLead;
    if (parsed?.name && parsed?.email) return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function saveLead(lead: StoredLead) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
}

async function fileExists(fileUrl: string): Promise<boolean> {
  try {
    const response = await fetch(fileUrl, { method: 'GET', cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

function triggerDownload(fileUrl: string, title: string) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = '';
  link.rel = 'noopener';
  link.setAttribute('aria-label', `Descarcă ${title}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function submitLead(lead: StoredLead, resource: GatedResource): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch('/api/resource-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceType: resource.category,
      resourceFile: resource.downloadFile,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { ok: false, error: (data as { error?: string }).error || 'Eroare la trimitere' };
  }

  return { ok: true };
}

const ResourceGrid: React.FC<GridProps> = ({ items, actionLabel, onSelect, loading }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
    {items.map((item) => (
      <article
        key={item.id}
        className={`resurse-card resurse-card-interactive group h-full flex flex-col${loading ? ' resurse-card-disabled' : ''}`}
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-label={`${actionLabel}: ${item.title}`}
        aria-disabled={loading}
        onClick={() => {
          if (!loading) onSelect(item);
        }}
        onKeyDown={(event) => {
          if (loading) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(item);
          }
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="resurse-badge">{item.category}</span>
          {item.type && <span className="text-xs text-white/45">{item.type}</span>}
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(64,255,170,0.18), rgba(255,255,255,0.04))',
            border: '0.5px solid rgba(64,255,170,0.35)',
          }}
        >
          <i className={`ti ${item.icon} text-lg`} style={{ color: '#40ffaa' }} aria-hidden="true" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug group-hover:text-primary-mint transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-white/65 leading-relaxed mb-5 flex-grow">{item.description}</p>
        <span className="resurse-link">
          {actionLabel}
          <i className="ti ti-download text-base" aria-hidden="true" />
        </span>
      </article>
    ))}
  </div>
);

const ResurseDownloads: React.FC = () => {
  const formId = useId();
  const [selected, setSelected] = useState<GatedResource | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const stored = readStoredLead();
    if (stored) {
      setName(stored.name);
      setEmail(stored.email);
      setConsent(true);
    }
  }, []);

  const completeDownload = useCallback(async (lead: StoredLead, resource: GatedResource) => {
    setStatus('loading');
    setErrorMessage('');

    const result = await submitLead(lead, resource);
    if (!result.ok) {
      setStatus('error');
      setErrorMessage(result.error || 'Nu am putut înregistra cererea. Încearcă din nou.');
      return false;
    }

    const exists = await fileExists(resource.downloadFile);
    if (!exists) {
      setStatus('error');
      setErrorMessage('Datele au fost înregistrate. Fișierul va fi disponibil în curând — îți trimitem resursa pe email.');
      saveLead(lead);
      return false;
    }

    saveLead(lead);
    triggerDownload(resource.downloadFile, resource.title);
    setSelected(null);
    setStatus('idle');
    return true;
  }, []);

  const handleSelect = (resource: GatedResource) => {
    setSelected(resource);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !consent) return;
    const lead = { name: name.trim(), email: email.trim() };
    if (!lead.name || !lead.email) {
      setStatus('error');
      setErrorMessage('Completează numele și emailul.');
      return;
    }
    await completeDownload(lead, selected);
  };

  const handleClose = () => {
    if (status === 'loading') return;
    setSelected(null);
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <>
      <section id="templates" className="resurse-section resurse-section-alt relative py-16 md:py-24 w-full text-white overflow-hidden scroll-mt-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle at 70% 30%, rgba(64,255,170,0.08), transparent 55%)' }}
        />
        <div className="relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mb-8 md:mb-10">
            <span className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider">
              Template-uri — ca să economisești timp
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3 text-white leading-tight">
              Template-uri profesionale
            </h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              Fișiere gata de folosit, ca să nu reinventezi roata de fiecare dată când ai nevoie de un plan, un brief sau un audit.
            </p>
          </div>
          <ResourceGrid
            items={RESOURCE_TEMPLATES}
            actionLabel="Ia template-ul"
            onSelect={handleSelect}
            loading={status === 'loading'}
          />
        </div>
      </section>

      <section id="checklists" className="resurse-section relative py-16 md:py-24 w-full text-white overflow-hidden scroll-mt-24">
        <div
          className="pointer-events-none absolute top-0 right-0 w-full md:w-1/2 h-full"
          style={{ background: 'radial-gradient(circle at 70% 30%, rgba(64,255,170,0.08), transparent 55%)' }}
        />
        <div className="relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mb-8 md:mb-10">
            <span className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider">
              Checklist-uri — ca să nu uiți nimic
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3 text-white leading-tight">
              Checklist-uri practice
            </h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              Pașii în ordinea corectă, ca să nu descoperi greșeala abia după ce ai cheltuit bugetul sau ai pierdut momentul.
            </p>
          </div>
          <ResourceGrid
            items={RESOURCE_CHECKLISTS}
            actionLabel="Descarcă checklist-ul"
            onSelect={handleSelect}
            loading={status === 'loading'}
          />
        </div>
      </section>

      <ResourceDownloadModal
        resource={selected}
        formId={formId}
        name={name}
        email={email}
        consent={consent}
        status={status}
        errorMessage={errorMessage}
        onClose={handleClose}
        onNameChange={setName}
        onEmailChange={setEmail}
        onConsentChange={setConsent}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ResurseDownloads;
