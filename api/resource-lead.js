import { createClient } from '@supabase/supabase-js';

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

function sendJson(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { name, email, resourceId, resourceTitle, resourceType, resourceFile } = req.body || {};

    if (!name || !email || !resourceId || !resourceTitle) {
      return sendJson(res, 400, { error: 'Date incomplete' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(email))) {
      return sendJson(res, 400, { error: 'Email invalid' });
    }

    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: dbError } = await supabase.from('resource_leads').insert({
        name: String(name).trim(),
        email: String(email).trim(),
        resource_id: String(resourceId),
        resource_title: String(resourceTitle),
        resource_type: resourceType ? String(resourceType) : null,
        resource_file: resourceFile ? String(resourceFile) : null,
      });
      if (dbError) {
        console.error('Supabase insert error:', dbError);
        return sendJson(res, 500, { error: 'Nu am putut salva cererea. Te rugam sa incerci din nou.' });
      }
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (accessKey) {
      const web3Response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name: String(name).trim(),
          email: String(email).trim(),
          subject: `Descărcare resursă Mindleap: ${resourceTitle}`,
          message: [
            `Tip resursă: ${resourceType || 'N/A'}`,
            `ID: ${resourceId}`,
            `Titlu: ${resourceTitle}`,
            `Fișier: ${resourceFile || 'N/A'}`,
            `Sursă: mindleap.ro/resurse`,
          ].join('\n'),
          from_name: 'Mindleap Resurse',
          botcheck: false,
        }),
      });

      const web3Data = await web3Response.json().catch(() => ({}));
      if (!web3Response.ok || web3Data.success === false) {
        console.error('Web3Forms error:', web3Data);
      }
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('resource-lead error:', error);
    return sendJson(res, 500, { error: 'Eroare server' });
  }
}
