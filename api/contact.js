import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/nodejs';

function sendJson(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !message) {
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
      const { error: dbError } = await supabase.from('contact_submissions').insert({
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        message: String(message).trim(),
      });
      if (dbError) {
        console.error('Supabase insert error:', dbError);
        return sendJson(res, 500, { error: 'Nu am putut salva mesajul. Te rugam sa incerci din nou.' });
      }
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        await emailjs.send(serviceId, templateId, {
          from_name: String(name).trim(),
          from_email: String(email).trim(),
          phone: phone ? String(phone).trim() : 'N/A',
          message: String(message).trim(),
        }, { publicKey });
      } catch (emailError) {
        console.error('EmailJS error:', emailError);
      }
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('contact error:', error);
    return sendJson(res, 500, { error: 'Eroare server' });
  }
}
