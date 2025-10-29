// scripts/crawl-spa.mjs
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

// --- Configuration ---
const START_URL = process.env.START_URL || "http://localhost:4200";
const MAX_PAGES = Number(process.env.MAX_PAGES || 500);
const SAME_ORIGIN_ONLY = true;
// Target selector based on your HTML: the header of your side menu
const NAVIGATION_SELECTOR = '.app__side-menu-header'; 

// Utility function to normalize URLs (removes hash, trailing slash)
function normalize(u) {
  try {
    const url = new URL(u);
    url.hash = "";
    const s = url.toString().replace(/\/+$/, "");
    return s || url.origin;
  } catch {
    return null;
  }
}

async function crawl(startUrl) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const origin = new URL(startUrl).origin;

  const toVisit = [startUrl];
  const visited = new Set();
  const results = [];

  while (toVisit.length && visited.size < MAX_PAGES) {
    const url = toVisit.shift();
    const norm = normalize(url);
    if (!norm || visited.has(norm)) continue;
    visited.add(norm);

    console.log(`Crawling: ${norm} (${visited.size}/${MAX_PAGES}) - Queue: ${toVisit.length}`);

    try {
      // 1. ROBUST NAVIGATION: Wait until all network connections are finished
      //    Timeout increased to 45 seconds for slow SPAs.
      await page.goto(norm, { waitUntil: "networkidle0", timeout: 45000 });
      
      // 2. INCREASED TARGETED WAIT: Wait for the side menu header element
      try {
        // Timeout increased to 30 seconds for maximum reliability
        await page.waitForSelector(NAVIGATION_SELECTOR, { timeout: 30000 }); 
        console.log(`    Key navigation element found.`);
      } catch (e) {
        console.log(`    Warning: Navigation element ${NAVIGATION_SELECTOR} not found (30s timeout exceeded). Proceeding to scrape.`);
      }
      
      // 3. Extract data and links
      const { title, links } = await page.evaluate(() => {
        const title = document.title || "";
        
        // FIXED LINK DISCOVERY: Select links with 'href' OR 'routerlink'
        const anchors = Array.from(document.querySelectorAll("a[href], a[routerlink]")); 
        
        const links = anchors
          .map(a => a.getAttribute("href") || a.getAttribute("routerlink"))
          .filter(Boolean);
          
        return { title, links };
      });

      results.push({ url: norm, title });

      // 4. Process discovered links
      for (const href of links) {
        try {
          const abs = new URL(href, norm).toString();
          const clean = abs.replace(/#.*$/, "").replace(/\/+$/, "");
          
          if (SAME_ORIGIN_ONLY && new URL(clean).origin !== origin) continue;
          
          if (!visited.has(clean) && !toVisit.includes(clean)) {
            toVisit.push(clean);
          }
        } catch { /* ignore malformed URLs found in hrefs */ }
      }
    } catch (e) {
      results.push({ url: norm, title: "", error: e.message || "Navigation Timeout" });
      console.error(`    Error crawling ${norm}: ${e.message}`);
    }
  }

  await browser.close();
  return results;
}

async function main() {
  const start = normalize(START_URL);
  if (!start) throw new Error("Invalid START_URL");

  const results = await crawl(start);

  // Emit Markdown table
  const lines = [
    `# Site Map for ${start}`,
    "",
    `Scanned ${results.length} pages.`,
    "",
    "| URL | Title | Error |",
    "| --- | ----- | ----- |",
    ...results.map(r => 
        `| ${r.url} | ${(r.title || "").replace(/\|/g, "\\|")} | ${(r.error || "")} |`
    )
  ];

  const outPath = path.resolve("docs", "site-map.md");
  await fs.writeFile(outPath, lines.join("\n"), "utf8");
  console.log(`\nSuccessfully wrote site map for ${results.length} pages to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});