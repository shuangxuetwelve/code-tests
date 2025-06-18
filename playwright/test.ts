import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.youtube.com/@bling1761");

  const title = await page.title();
  console.log("Title:", title);

  await browser.close();
}

main();
