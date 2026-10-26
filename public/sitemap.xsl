<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="ro">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mindleap Sitemap</title>
        <style>
          :root {
            color-scheme: dark;
            --bg: #0a0e1a;
            --card: rgba(255, 255, 255, 0.05);
            --border: rgba(255, 255, 255, 0.12);
            --mint: #40ffaa;
            --text: #f5f7fa;
            --muted: rgba(255, 255, 255, 0.55);
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Inter, system-ui, sans-serif;
            background: radial-gradient(circle at 50% 0%, #16332b 0%, var(--bg) 55%);
            color: var(--text);
            min-height: 100vh;
            padding: 32px 16px 48px;
          }
          .wrap { max-width: 1080px; margin: 0 auto; }
          .hero {
            text-align: center;
            margin-bottom: 28px;
          }
          .eyebrow {
            color: var(--mint);
            font-size: 12px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            margin: 0 0 10px;
          }
          h1 {
            margin: 0 0 8px;
            font-size: clamp(1.75rem, 4vw, 2.5rem);
          }
          .sub {
            color: var(--muted);
            margin: 0;
            font-size: 15px;
          }
          .stats {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin: 22px 0 0;
          }
          .stat {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 10px 16px;
            font-size: 13px;
            color: var(--muted);
          }
          .stat strong { color: var(--mint); }
          table {
            width: 100%;
            border-collapse: collapse;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            backdrop-filter: blur(12px);
          }
          thead { background: rgba(64, 255, 170, 0.08); }
          th, td {
            padding: 14px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
          }
          th {
            color: var(--mint);
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 600;
          }
          tr:last-child td { border-bottom: none; }
          a {
            color: var(--text);
            text-decoration: none;
          }
          a:hover { color: var(--mint); text-decoration: underline; }
          .priority {
            display: inline-block;
            min-width: 42px;
            padding: 4px 8px;
            border-radius: 999px;
            background: rgba(64, 255, 170, 0.12);
            color: var(--mint);
            font-size: 12px;
            text-align: center;
          }
          .freq { color: var(--muted); font-size: 13px; }
          .date { color: var(--muted); font-size: 13px; white-space: nowrap; }
          footer {
            margin-top: 20px;
            text-align: center;
            color: var(--muted);
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="hero">
            <p class="eyebrow">mindleap.ro</p>
            <h1>XML Sitemap</h1>
            <p class="sub">Harta paginilor indexabile pentru motoare de cautare si LLM-uri.</p>
            <div class="stats">
              <div class="stat"><strong><xsl:value-of select="count(s:urlset/s:url)" /></strong> URL-uri</div>
              <div class="stat">Canonical: <strong>https://mindleap.ro</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Prioritate</th>
                <th>Frecventa</th>
                <th>Ultima modificare</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <xsl:sort select="s:priority" order="descending" data-type="number" />
                <tr>
                  <td>
                    <a href="{s:loc}"><xsl:value-of select="s:loc" /></a>
                  </td>
                  <td>
                    <span class="priority"><xsl:value-of select="s:priority" /></span>
                  </td>
                  <td class="freq"><xsl:value-of select="s:changefreq" /></td>
                  <td class="date"><xsl:value-of select="s:lastmod" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            Generat automat la build. Fisier sursa pentru crawleri: sitemap.xml
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
