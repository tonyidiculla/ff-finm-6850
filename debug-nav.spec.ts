import { test } from '@playwright/test';

test('navigation debug', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('response', res => {
    if (res.status() >= 300) {
      console.log(`HTTP ${res.status()}: ${res.url()}`);
    }
  });
  
  await page.goto('http://localhost:6850/dashboard');
  console.log('Current URL:', page.url());
  
  await page.waitForTimeout(2000);
  console.log('After wait:', page.url());
  
  // Try clicking Books
  await page.locator('a:has-text("Books")').click();
  await page.waitForTimeout(1000);
  console.log('After Books click:', page.url());
});

test.setTimeout(15000);
