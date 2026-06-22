#!/usr/bin/env node
/*
 * Generic responsive smoke screenshot for harness verification.
 * Usage: node scripts/smoke-screenshot.mjs <url> <outDir>
 * Captures the page at mobile (360) and desktop (1440) widths, checks key
 * landmarks, writes PNGs + a result JSON. Read-only against the running app.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import puppeteer from "puppeteer";

const url = process.argv[2] || "http://localhost:3000/en";
const outDir = process.argv[3] || "reports/growth/glo-001-smoke";
mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const browser = await puppeteer.launch({ headless: true });
const results = [];
try {
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    const resp = await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const status = resp ? resp.status() : 0;
    const checks = await page.evaluate(() => ({
      hero: document.querySelector("h1")?.innerText?.slice(0, 100) || "",
      shortlistCta: !!Array.from(document.querySelectorAll("a,button")).find((e) => /shortlist/i.test(e.textContent || "")),
      sampleForm: !!document.querySelector("#sample-reports"),
      pricing: !!document.querySelector("#pricing"),
      emailInput: !!document.querySelector('input[type="email"]'),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    }));
    await page.screenshot({ path: `${outDir}/${vp.name}.png`, fullPage: true });
    results.push({ viewport: vp.name, status, ...checks });
    await page.close();
  }
} finally {
  await browser.close();
}

writeFileSync(`${outDir}/result.json`, JSON.stringify({ url, capturedViewports: viewports.map((v) => v.name), results }, null, 2));
console.log(JSON.stringify(results, null, 2));
