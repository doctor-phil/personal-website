import type { Context } from "@netlify/edge-functions";

// Server-side access logger.
//
// Runs at the Netlify edge and reads only the request metadata the browser
// already sends on every HTTP request (IP, user-agent, referrer, language,
// path). It injects nothing into the page: no cookies, no client-side
// JavaScript, no response changes — so it is invisible to the browser and
// cannot trigger any browser security warning.
//
// Two kinds of line are emitted:
//   * kind:"page"  — one per HTML/document (or PDF) request. Full metadata.
//   * kind:"asset" — a lightweight "render beacon" when a client fetches the
//     stylesheet or script. Real browsers fetch these; cheap HTTP bots that
//     just GET the HTML and leave do not. The dashboard uses "did this IP load
//     a render asset?" to tell an actual browser from a clean-UA bot (which no
//     amount of UA/geo inspection can do reliably). Images/fonts are ignored to
//     keep volume down — CSS/JS is enough of a render signal.
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

// Render-confirming assets: a real browser fetches the stylesheet/script after
// the HTML. Logged as a lightweight beacon.
const RENDER = /\.(css|js|mjs)$/i;

// Other static assets we ignore entirely (the page that embeds them is logged,
// and they add no signal beyond the CSS/JS beacon). PDFs are intentionally NOT
// listed here, so CV downloads are still logged as pages.
const IGNORE =
  /\.(map|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|eot|xml|json|txt|webmanifest)$/i;

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
    const path = url.pathname;

    // Behind a Cloudflare proxy, Netlify sees Cloudflare's edge IP as the
    // client. Prefer Cloudflare's forwarded headers so we keep logging the
    // real visitor IP/country; otherwise use Netlify's own values.
    const cfIp = request.headers.get("cf-connecting-ip");
    const xff = request.headers.get("x-forwarded-for");
    const behindCf = cfIp !== null;
    const ip = cfIp ?? (xff ? xff.split(",")[0].trim() : context.ip);
    const src = behindCf ? "cf" : "netlify";

    if (RENDER.test(path)) {
      // Lightweight render beacon — proves this IP is a real rendering browser.
      const beacon = {
        t: new Date().toISOString(),
        kind: "asset",
        src,
        ip,
        path,
      };
      console.log(`ASSET ${JSON.stringify(beacon)}`);
      forward(context, beacon);
    } else if (!IGNORE.test(path)) {
      const ua = request.headers.get("user-agent") ?? "";
      const geo = context.geo ?? {};
      const entry = {
        t: new Date().toISOString(),
        kind: "page",
        src,
        ip,
        method: request.method,
        path: path + url.search,
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
    // else: ignored asset (image/font/etc) — no log line.
  } catch (err) {
    // Logging must never affect page delivery.
    console.error("access-log error:", err instanceof Error ? err.message : err);
  }
  return context.next();
}

export const config = {
  path: "/*",
  // CSS/JS are intentionally NOT excluded now — they are the render beacon.
  // Other assets still cost one (cheap) invocation that returns early via the
  // IGNORE check; our assets live under page dirs (e.g. featured images), so we
  // filter in-handler rather than by path here.
};
