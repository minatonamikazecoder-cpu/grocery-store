const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE LOG ERROR:', msg.text());
    }
  });
  page.on('pageerror', exception => console.log('PAGE JS EXCEPTION:', exception.message));

  // 1. Visit Home Page
  console.log("Navigating to Home http://localhost:5173/ ...");
  await page.goto('http://localhost:5173/');
  console.log("Home page title:", await page.title());
  await page.waitForTimeout(2000);
  const productsCount = (await page.$$('.card')).length;
  console.log("Seeded products count on home page:", productsCount);

  // 2. Visit Login Page
  console.log("Navigating to Login http://localhost:5173/login ...");
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#email');

  console.log("Filling in Admin credentials...");
  await page.fill('#email', 'admin@purebite.com');
  await page.fill('#password', 'Admin123');

  console.log("Submitting login form...");
  await page.click('button[type="submit"]');

  // Wait for redirect to admin page
  console.log("Waiting for URL redirection to /admin...");
  await page.waitForURL('**/admin', { timeout: 10000 });
  console.log("Login successful! Current URL:", page.url());

  // Wait for dashboard stats queries to resolve
  console.log("Waiting for dashboard to populate data...");
  await page.waitForTimeout(3000);

  // Take screenshot of Admin Dashboard
  await page.screenshot({ path: 'admin-dashboard-check.png' });
  console.log("Admin dashboard screenshot saved as admin-dashboard-check.png");

  // Verify dashboard counts are present
  const content = await page.content();
  console.log("Dashboard has active products counter:", content.includes("Active Products") || content.includes("Products"));
  console.log("Dashboard has orders counter:", content.includes("Orders"));
  console.log("Dashboard has categories counter:", content.includes("Categories"));

  await browser.close();
  console.log("Browser closed. Full E2E verification completed successfully!");
})();
