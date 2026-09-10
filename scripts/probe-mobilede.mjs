/**
 * One-off probe: dumps the raw mobile.de Seller API shapes so the
 * mapping in lib/mobileDe.ts can be written against reality.
 *
 * Run:  node --env-file=.env.local scripts/probe-mobilede.mjs
 */

const USER = process.env.MOBILE_DE_USERNAME;
const PASS = process.env.MOBILE_DE_PASSWORD;
const SELLER = process.env.MOBILE_DE_SELLER_ID;
const BASE = "https://services.mobile.de";

if (!USER || !PASS || !SELLER) {
  console.error("Missing MOBILE_DE_USERNAME / MOBILE_DE_PASSWORD / MOBILE_DE_SELLER_ID");
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");
console.log(`user=${USER} seller=${SELLER} passLen=${PASS.length}`);

async function probe(label, path, accept) {
  const url = `${BASE}${path}`;
  const headers = { Authorization: auth };
  if (accept) headers.Accept = accept;
  let res;
  try {
    res = await fetch(url, { headers });
  } catch (e) {
    console.log(`\n[${label}] ${path}\n  FETCH ERROR ${e.message}`);
    return;
  }
  const text = await res.text();
  console.log(`\n[${label}] ${path}  (Accept: ${accept || "—"})`);
  console.log(`  status ${res.status} ${res.statusText}`);
  const interesting = [
    "www-authenticate",
    "content-type",
    "x-mobile-api-error",
    "warning",
  ];
  for (const h of interesting) {
    const v = res.headers.get(h);
    if (v) console.log(`  ${h}: ${v}`);
  }
  console.log(`  body[0..600]: ${text.slice(0, 600).replace(/\s+/g, " ").trim()}`);
  return { res, text };
}

await probe("seller-json", `/seller-api/sellers/${SELLER}/ads`, "application/vnd.de.mobile.api+json");
await probe("seller-plain", `/seller-api/sellers/${SELLER}/ads`, "application/json");
await probe("seller-noaccept", `/seller-api/sellers/${SELLER}/ads`, null);
await probe("seller-xml", `/seller-api/sellers/${SELLER}/ads`, "application/vnd.de.mobile.api+xml");
await probe("seller-root", `/seller-api/sellers/${SELLER}`, "application/vnd.de.mobile.api+json");
await probe("search-api", `/search-api/search?customerId=${SELLER}&page.size=1`, "application/vnd.de.mobile.api+json");
await probe("refdata", `/refdata/classes/Car/makes`, "application/vnd.de.mobile.api+json");
