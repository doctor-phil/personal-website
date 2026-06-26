import type { Context } from "@netlify/edge-functions";

// Server-side access logger.
//
// Runs at the Netlify edge and reads only the request metadata the browser
// already sends on every HTTP request (IP, user-agent, referrer, language,
// path). It injects nothing into the page: no cookies, no client-side
// JavaScript, no response changes — so it is invisible to the browser and
// cannot trigger any browser security warning.
//
// One structured JSON line is emitted per page/document request to the
// Netlify function logs (Site -> Logs -> Edge Functions). Static assets are
// skipped to keep the log readable.
//
// Durable storage: if the LOG_SINK_URL environment variable is set, each
// entry is also POSTed (as a one-element JSON array) to that endpoint in the
// background, so history survives Netlify's short dashboard retention. Set an
// optional LOG_SINK_TOKEN to send it as a Bearer token. Configure both in the
// Netlify UI (Site configuration -> Environment variables, scope incl. Edge
// Functions) — never commit them. The array payload + Bearer header match
// Axiom's ingest API (https://api.axiom.co/v1/datasets/<name>/ingest); a
// custom endpoint or other log service works the same way.
//
// Note: Netlify's geo data does not include the network ASN. Use the logged
// IP for an offline ASN/WHOIS lookup (ipinfo.io, bgp.he.net, AbuseIPDB), or
// read the ASN directly from Cloudflare's Security Events if the site is
// proxied through Cloudflare.

const BOT_UA =
  /(bot|crawl|spider|slurp|headless|python-requests|go-http-client|curl|wget|axios|scrapy|httpclient|libwww|java\/|okhttp|phantomjs|puppeteer|playwright|monitor|uptime|preview|fetch)/i;

// Static assets we don't need an access-log line for (the page that embeds
// them is logged instead). PDFs are intentionally NOT excluded so CV
// downloads are captured.
const ASSET =
  /\.(css|js|mjs|map|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|eot|xml|json|txt|webmanifest)$/i;

// Forward one entry to the durable sink (if configured), in the background so
// it never adds latency to the response and never breaks page delivery.
function forward(context: Context, entry: Record<string, unknown>) {
  const url = Deno.env.get("LOG_SINK_URL");
  if (!url) return;
  const headers: Record<string, string> = { "content-type": "application/json" };
  const token = Deno.env.get("LOG_SINK_TOKEN");
  if (token) headers["authorization"] = `Bearer ${token}`;
  const p = fetch(url, { method: "POST", headers, body: JSON.stringify([entry]) })
    .then((res) => {
      if (!res.ok) console.error(`sink HTTP ${res.status}`);
    })
    .catch((err) =>
      console.error("sink error:", err instanceof Error ? err.message : err)
    );
  if (typeof context.waitUntil === "function") context.waitUntil(p);
}

export default async function handler(request: Request, context: Context) {
  try {
    const url = new URL(request.url);
    if (!ASSET.test(url.pathname)) {
      const ua = request.headers.get("user-agent") ?? "";

      // Behind a Cloudflare proxy, Netlify sees Cloudflare's edge IP as the
      // client. Prefer Cloudflare's forwarded headers so we keep logging the
      // real visitor IP/country; otherwise use Netlify's own values.
      const cfIp = request.headers.get("cf-connecting-ip");
      const xff = request.headers.get("x-forwarded-for");
      const behindCf = cfIp !== null;
      const geo = context.geo ?? {};
      const entry = {
        t: new Date().toISOString(),
        src: behindCf ? "cf" : "netlify",
        ip: cfIp ?? (xff ? xff.split(",")[0].trim() : context.ip),
        method: request.method,
        path: url.pathname + url.search,
        ref: request.headers.get("referer") ?? "",
        ua,
        lang: request.headers.get("accept-language") ?? "",
        country: behindCf
          ? (request.headers.get("cf-ipcountry") ?? "")
          : (geo.country?.code ?? ""),
        city: behindCf ? "" : (geo.city ?? ""),
        region: behindCf ? "" : (geo.subdivision?.code ?? ""),
        bot: ua === "" || BOT_UA.test(ua),
      };
      console.log(`ACCESS ${JSON.stringify(entry)}`);
      forward(context, entry);
    }
  } catch (err) {
    // Logging must never affect page delivery.
    console.error("access-log error:", err instanceof Error ? err.message : err);
  }
  return context.next();
}

export const config = {
  path: "/*",
  // Trim the bulk of asset traffic up front; the in-handler ASSET check
  // catches per-page images (e.g. featured thumbnails) that share a page dir.
  excludedPath: ["/css/*", "/js/*"],
};
