import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CANONICAL_ORIGIN = "https://mindleap.ro";

const STATIC_PAGES: {
  path: string;
  changefreq: string;
  priority: string;
}[] = [
  { path: "/", changefreq: "weekly", priority: "1.00" },
  { path: "/servicii", changefreq: "weekly", priority: "0.90" },
  { path: "/contact", changefreq: "weekly", priority: "0.90" },
  { path: "/despre-noi", changefreq: "monthly", priority: "0.80" },
  { path: "/studii-de-caz", changefreq: "weekly", priority: "0.80" },
  {
    path: "/studii-de-caz/coldea-expert-construct",
    changefreq: "monthly",
    priority: "0.75",
  },
  {
    path: "/studii-de-caz/stereographic",
    changefreq: "monthly",
    priority: "0.75",
  },
  {
    path: "/studii-de-caz/bubble-kids",
    changefreq: "monthly",
    priority: "0.75",
  },
  { path: "/resurse", changefreq: "weekly", priority: "0.70" },
  {
    path: "/legal/termeni-si-conditii",
    changefreq: "yearly",
    priority: "0.30",
  },
  {
    path: "/legal/politica-confidentialitate",
    changefreq: "yearly",
    priority: "0.30",
  },
  { path: "/legal/cookies", changefreq: "yearly", priority: "0.30" },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildUrlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, date_published, updated_at")
      .eq("published", true)
      .order("date_published", { ascending: false });

    const today = new Date().toISOString().split("T")[0];

    const entries: string[] = [];

    for (const page of STATIC_PAGES) {
      const loc =
        page.path === "/"
          ? `${CANONICAL_ORIGIN}/`
          : `${CANONICAL_ORIGIN}${page.path}`;
      entries.push(buildUrlEntry(loc, today, page.changefreq, page.priority));
    }

    if (posts) {
      for (const post of posts) {
        const loc = `${CANONICAL_ORIGIN}/resurse/blog/${post.slug}`;
        const lastmod =
          post.date_published ||
          (post.updated_at
            ? post.updated_at.split("T")[0]
            : today);
        entries.push(buildUrlEntry(loc, lastmod, "monthly", "0.65"));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${CANONICAL_ORIGIN}/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${entries.join("\n\n")}

</urlset>
`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
