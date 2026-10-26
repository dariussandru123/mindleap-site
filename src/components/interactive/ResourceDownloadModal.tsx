import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GatedResource } from '@/data/resources';

type ResourceDownloadModalProps = {
  resource: GatedResource | null;
  formId: string;
  name: string;
  email: string;
  consent: boolean;
  status: 'idle' | 'loading' | 'error';
  errorMessage: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const ResourceDownloadModal: React.FC<ResourceDownloadModalProps> = ({
  resource,
  formId,
  name,
  email,
  consent,
  status,
  errorMessage,
  onClose,
  onNameChange,
  onEmailChange,
  onConsentChange,
  onSubmit,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const main = document.getElementById('main-content');
    if (!dialog) return;

    if (resource) {
      document.body.classList.add('resource-download-open');
      main?.setAttribute('inert', '');
      if (!dialog.open) dialog.showModal();
    } else {
      document.body.classList.remove('resource-download-open');
      main?.removeAttribute('inert');
      if (dialog.open) dialog.close();
    }

    return () => {
      document.body.classList.remove('resource-download-open');
      main?.removeAttribute('inert');
    };
  }, [resource]);

  const handleClose = () => {
    if (status === 'loading') return;
    document.body.classList.remove('resource-download-open');
    document.getElementById('main-content')?.removeAttribute('inert');
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="resource-download-dialog"
      aria-labelledby={resource ? `${formId}-title` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && status !== 'loading') {
          handleClose();
        }
      }}
    >
      {resource && (
        <div className="resource-download-panel" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="resource-download-close"
            onClick={handleClose}
            aria-label="Închide"
          >
            ✕
          </button>

          <p className="resource-download-eyebrow">Descărcare gratuită</p>
          <h3 id={`${formId}-title`} className="resource-download-title">
            {resource.title}
          </h3>
          <p className="resource-download-lead">
            Lasă-ne numele și emailul ca să-ți trimitem resursa și să știm ce te interesează.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor={`${formId}-name`} className="resource-download-label">
                Nume complet *
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="resource-gate-input"
                placeholder="Numele tău"
                disabled={status === 'loading'}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-email`} className="resource-download-label">
                Email *
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                required
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="resource-gate-input"
                placeholder="email@exemplu.ro"
                disabled={status === 'loading'}
                autoComplete="email"
              />
            </div>
            <label className="resource-download-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => onConsentChange(e.target.checked)}
                required
                disabled={status === 'loading'}
              />
              <span>
                Sunt de acord să primesc resurse și comunicări utile de la Mindleap. Datele sunt prelucrate conform{' '}
                <a href="/legal/politica-confidentialitate" target="_blank" rel="noopener noreferrer">
                  politicii de confidențialitate
                </a>
                .
              </span>
            </label>

            {status === 'error' && errorMessage && (
              <p className="resource-download-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !consent}
              className="resource-download-submit"
            >
              {status === 'loading' ? 'Se pregătește descărcarea...' : 'Descarcă acum'}
            </button>
          </form>
        </div>
      )}
    </dialog>,
    document.body
  );
};

export default ResourceDownloadModal;
