import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
};

type ResourceLead = {
  id: string;
  name: string;
  email: string;
  resource_id: string;
  resource_title: string;
  resource_type: string | null;
  resource_file: string | null;
  status: string;
  created_at: string;
};

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  read_time: string | null;
  date_label: string | null;
  date_published: string | null;
  author: string | null;
  icon: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type Tab = 'overview' | 'contacts' | 'leads' | 'blog';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  const colors: Record<string, string> = {
    new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    read: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    handled: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  };
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[status] || colors.new} transition-opacity hover:opacity-80`}
    >
      {status}
    </button>
  );
}

function PublishedBadge({ published, onClick }: { published: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-xs font-medium rounded border transition-opacity hover:opacity-80 ${
        published
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      }`}
    >
      {published ? 'publicat' : 'draft'}
    </button>
  );
}

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Email sau parola incorecta' : authError.message);
      return;
    }
    onAuth();
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">Admin Access</h2>
          <p className="text-sm text-white/50 mt-1">Autentifica-te pentru a accesa dashboard-ul</p>
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="Email"
            autoFocus
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="Parola"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Se autentifica...' : 'Acceseaza'}
        </button>
      </form>
    </div>
  );
}

const EMPTY_POST: Omit<BlogPost, 'created_at' | 'updated_at'> = {
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  read_time: '',
  date_label: '',
  date_published: '',
  author: 'Mindleap',
  icon: 'ti-article',
  cover_image: '',
  cover_image_alt: '',
  published: false,
};

function CoverImageDrop({
  slug,
  currentUrl,
  onUploaded,
}: {
  slug: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  async function upload(file: File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Tip invalid: ${file.type}. Acceptate: JPG, PNG, WebP, GIF, SVG`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Fisierul depaseste 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const path = `${slug || 'unsorted'}/${Date.now()}-${safeName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError(`Upload esuat: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(data.path);

    onUploaded(urlData.publicUrl);
    setUploading(false);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }, [slug]);

  return (
    <div className="space-y-2">
      <label className="block text-xs text-white/50">Cover image</label>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${
          dragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : 'border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]'
        } ${currentUrl ? 'p-2' : 'p-6'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
          className="hidden"
        />
        {currentUrl ? (
          <div className="flex items-center gap-3">
            <img src={currentUrl} alt="Cover preview" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60 truncate font-mono">{currentUrl}</p>
              <p className="text-xs text-white/30 mt-0.5">
                {uploading ? 'Se incarca...' : 'Trage alta imagine pentru a inlocui'}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onUploaded(''); }}
              className="flex-shrink-0 px-2 py-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded border border-red-500/20 transition-colors"
            >
              Sterge
            </button>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <p className={`text-sm ${dragging ? 'text-emerald-300' : 'text-white/40'}`}>
              {uploading ? 'Se incarca...' : dragging ? 'Plaseaza aici' : 'Trage imaginea de cover aici sau click pentru a selecta'}
            </p>
            <p className="text-xs text-white/25">JPG, PNG, WebP, GIF, SVG - max 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function BlogEditor({
  post,
  onSave,
  onCancel,
  onDelete,
}: {
  post: Omit<BlogPost, 'created_at' | 'updated_at'> | null;
  onSave: (data: Omit<BlogPost, 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const isNew = !post || !post.id;
  const [form, setForm] = useState(post || EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  function update(field: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && isNew) {
        next.slug = slugify(value as string);
        next.id = next.slug;
      }
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Esti sigur ca vrei sa stergi acest articol?')) return;
    setDeleting(true);
    try {
      await onDelete?.();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">
          {isNew ? 'Articol nou' : 'Editeaza articol'}
        </h3>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white/70 text-sm">
          Inchide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Titlu" value={form.title} onChange={(v) => update('title', v)} required />
        <Field label="Slug" value={form.slug} onChange={(v) => { setForm((p) => ({ ...p, slug: v, id: isNew ? v : p.id })); }} disabled={!isNew} />
        <Field label="Autor" value={form.author || ''} onChange={(v) => update('author', v)} />
        <Field label="Timp citire" value={form.read_time || ''} onChange={(v) => update('read_time', v)} placeholder="12 min" />
        <Field label="Data (label)" value={form.date_label || ''} onChange={(v) => update('date_label', v)} placeholder="6 feb. 2026" />
        <Field label="Data publicare (ISO)" value={form.date_published || ''} onChange={(v) => update('date_published', v)} placeholder="2026-02-06" />
        <Field label="Icon (tabler)" value={form.icon || ''} onChange={(v) => update('icon', v)} placeholder="ti-article" />
        <Field label="Cover image alt" value={form.cover_image_alt || ''} onChange={(v) => update('cover_image_alt', v)} />
      </div>

      <CoverImageDrop
        slug={form.slug || 'draft'}
        currentUrl={form.cover_image || ''}
        onUploaded={(url) => update('cover_image', url)}
      />

      <Field label="Excerpt" value={form.excerpt || ''} onChange={(v) => update('excerpt', v)} multiline rows={2} />

      <div>
        <label className="block text-xs text-white/50 mb-1">Continut (HTML)</label>
        <textarea
          ref={contentRef}
          value={form.content || ''}
          onChange={(e) => update('content', e.target.value)}
          rows={16}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-white/30 resize-y"
          placeholder='<section id="intro" class="blog-section blog-glass">&#10;  <h2 id="intro">Introducere</h2>&#10;  <p>...</p>&#10;</section>'
        />
        <p className="text-xs text-white/30 mt-1">Foloseste sectiuni cu id-uri pentru Table of Contents. Headings h2 cu id genereaza TOC automat.</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update('published', e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5"
          />
          Publicat
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.title.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Se salveaza...' : isNew ? 'Creeaza' : 'Salveaza'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors">
          Anuleaza
        </button>
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto px-4 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Se sterge...' : 'Sterge'}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const cls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} rows={rows || 3} className={cls + ' resize-y'} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} className={cls} />
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [leads, setLeads] = useState<ResourceLead[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [contactsRes, leadsRes, blogRes] = await Promise.all([
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('resource_leads').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('date_published', { ascending: false }),
      ]);

      if (contactsRes.error) throw contactsRes.error;
      if (leadsRes.error) throw leadsRes.error;
      if (blogRes.error) throw blogRes.error;

      setContacts(contactsRes.data || []);
      setLeads(leadsRes.data || []);
      setBlogPosts(blogRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function updateContactStatus(id: string, status: string) {
    const next = status === 'new' ? 'read' : status === 'read' ? 'handled' : 'new';
    await supabase.from('contact_submissions').update({ status: next }).eq('id', id);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
  }

  async function updateLeadStatus(id: string, status: string) {
    const next = status === 'new' ? 'read' : status === 'read' ? 'handled' : 'new';
    await supabase.from('resource_leads').update({ status: next }).eq('id', id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)));
  }

  async function togglePostPublished(post: BlogPost) {
    const next = !post.published;
    await supabase.from('blog_posts').update({ published: next, updated_at: new Date().toISOString() }).eq('id', post.id);
    setBlogPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, published: next } : p)));
  }

  async function savePost(data: Omit<BlogPost, 'created_at' | 'updated_at'>) {
    const payload = {
      id: data.id || data.slug,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      content: data.content || null,
      read_time: data.read_time || null,
      date_label: data.date_label || null,
      date_published: data.date_published || null,
      author: data.author || null,
      icon: data.icon || null,
      cover_image: data.cover_image || null,
      cover_image_alt: data.cover_image_alt || null,
      published: data.published,
      updated_at: new Date().toISOString(),
    };

    if (creatingPost) {
      const { error } = await supabase.from('blog_posts').insert(payload);
      if (error) { alert('Eroare: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', data.id);
      if (error) { alert('Eroare: ' + error.message); return; }
    }

    setEditingPost(null);
    setCreatingPost(false);
    await loadData();
  }

  async function deletePost(id: string) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) { alert('Eroare: ' + error.message); return; }
    setEditingPost(null);
    await loadData();
  }

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60 text-lg">Se verifica sesiunea...</div>
      </div>
    );
  }

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  const newContacts = contacts.filter((c) => c.status === 'new').length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const publishedPosts = blogPosts.filter((p) => p.published).length;
  const draftPosts = blogPosts.length - publishedPosts;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60 text-lg">Se incarca...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400 text-lg">{error}</div>
        <button onClick={loadData} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors">
          Reincearca
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <nav className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit flex-wrap">
        {([
          ['overview', 'Prezentare generala'],
          ['contacts', `Contacte (${newContacts})`],
          ['leads', `Lead-uri resurse (${newLeads})`],
          ['blog', `Blog (${blogPosts.length})`],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setEditingPost(null); setCreatingPost(false); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === key ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {label}
          </button>
        ))}
        </nav>
        <button
          onClick={() => { supabase.auth.signOut(); setAuthed(false); }}
          className="px-4 py-2 text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
        >
          Deconecteaza-te
        </button>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total contacte" value={contacts.length} accent="emerald" />
          <StatCard label="Contacte noi" value={newContacts} accent="cyan" />
          <StatCard label="Total lead-uri" value={leads.length} accent="emerald" />
          <StatCard label="Lead-uri noi" value={newLeads} accent="cyan" />
          <StatCard label="Articole publicate" value={publishedPosts} accent="emerald" />
          <StatCard label="Articole draft" value={draftPosts} accent="cyan" />
        </div>
      )}

      {tab === 'contacts' && (
        <div className="overflow-x-auto">
          {contacts.length === 0 ? (
            <EmptyState text="Nicio cerere de contact inca." />
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Nume</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Telefon</th>
                  <th className="pb-3 pr-4 font-medium">Mesaj</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <StatusBadge status={c.status} onClick={() => updateContactStatus(c.id, c.status)} />
                    </td>
                    <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">{c.name}</td>
                    <td className="py-3 pr-4 text-white/70">
                      <a href={`mailto:${c.email}`} className="hover:text-cyan-400 transition-colors">{c.email}</a>
                    </td>
                    <td className="py-3 pr-4 text-white/60 whitespace-nowrap">{c.phone || '-'}</td>
                    <td className="py-3 pr-4 text-white/60 max-w-[300px] truncate">{c.message}</td>
                    <td className="py-3 text-white/40 whitespace-nowrap text-xs">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'leads' && (
        <div className="overflow-x-auto">
          {leads.length === 0 ? (
            <EmptyState text="Niciun lead de resurse inca." />
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Nume</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Resursa</th>
                  <th className="pb-3 pr-4 font-medium">Tip</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <StatusBadge status={l.status} onClick={() => updateLeadStatus(l.id, l.status)} />
                    </td>
                    <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">{l.name}</td>
                    <td className="py-3 pr-4 text-white/70">
                      <a href={`mailto:${l.email}`} className="hover:text-cyan-400 transition-colors">{l.email}</a>
                    </td>
                    <td className="py-3 pr-4 text-white/60 max-w-[200px] truncate">{l.resource_title}</td>
                    <td className="py-3 pr-4 text-white/50">{l.resource_type || '-'}</td>
                    <td className="py-3 text-white/40 whitespace-nowrap text-xs">{formatDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'blog' && (
        <div>
          {(editingPost || creatingPost) ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <BlogEditor
                post={creatingPost ? null : editingPost ? {
                  id: editingPost.id,
                  slug: editingPost.slug,
                  title: editingPost.title,
                  excerpt: editingPost.excerpt,
                  content: editingPost.content,
                  read_time: editingPost.read_time,
                  date_label: editingPost.date_label,
                  date_published: editingPost.date_published,
                  author: editingPost.author,
                  icon: editingPost.icon,
                  cover_image: editingPost.cover_image,
                  cover_image_alt: editingPost.cover_image_alt,
                  published: editingPost.published,
                } : null}
                onSave={savePost}
                onCancel={() => { setEditingPost(null); setCreatingPost(false); }}
                onDelete={editingPost ? () => deletePost(editingPost.id) : undefined}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/50 text-sm">{publishedPosts} publicate, {draftPosts} draft</p>
                <button
                  onClick={() => setCreatingPost(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + Articol nou
                </button>
              </div>
              {blogPosts.length === 0 ? (
                <EmptyState text="Niciun articol inca." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 font-medium">Titlu</th>
                        <th className="pb-3 pr-4 font-medium">Autor</th>
                        <th className="pb-3 pr-4 font-medium">Data</th>
                        <th className="pb-3 pr-4 font-medium">Timp</th>
                        <th className="pb-3 font-medium">Actiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogPosts.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pr-4">
                            <PublishedBadge published={p.published} onClick={() => togglePostPublished(p)} />
                          </td>
                          <td className="py-3 pr-4 text-white font-medium max-w-[300px]">
                            <div className="truncate">{p.title}</div>
                            <div className="text-xs text-white/30 mt-0.5">/{p.slug}</div>
                          </td>
                          <td className="py-3 pr-4 text-white/60 whitespace-nowrap">{p.author || '-'}</td>
                          <td className="py-3 pr-4 text-white/50 whitespace-nowrap text-xs">{p.date_label || '-'}</td>
                          <td className="py-3 pr-4 text-white/50 whitespace-nowrap">{p.read_time || '-'}</td>
                          <td className="py-3">
                            <button
                              onClick={() => setEditingPost(p)}
                              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/70 rounded border border-white/10 transition-colors"
                            >
                              Editeaza
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: 'emerald' | 'cyan' }) {
  const colors = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20',
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20',
  };
  const textColors = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
  };
  return (
    <div className={`p-5 rounded-xl bg-gradient-to-br ${colors[accent]} border backdrop-blur-sm`}>
      <div className="text-white/50 text-sm mb-1">{label}</div>
      <div className={`text-3xl font-bold ${textColors[accent]}`}>{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-white/40 text-sm">{text}</div>
  );
}
