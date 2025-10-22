import { test, expect } from '@playwright/test';

test('check navigation flow', async ({ page }) => {
  // Start at auth service
  await page.goto('http://localhost:6800/login');
  
  // Login
  await page.fill('input[type="email"]', 'tony@fusionduotech.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to FINM
  await page.waitForURL('http://localhost:6850/**', { timeout: 10000 });
  console.log('✓ Redirected to:', page.url());
  
  // Wait for dashboard to load
  await page.waitForSelector('text=MYCE', { timeout: 5000 });
  console.log('✓ Dashboard loaded');
  
  // Check if Sign Out button is visible
  const signOutButton = await page.locator('text=Sign Out').isVisible();
  console.log('✓ Sign Out button visible:', signOutButton);
  
  // Try clicking Books link
  await page.click('text=Books');
  await page.waitForTimeout(2000);
  console.log('✓ After clicking Books, URL:', page.url());
  
  // Try clicking Chart of Accounts
  await page.click('text=Chart of Accounts');
  await page.waitForTimeout(2000);
  console.log('✓ After clicking Accounts, URL:', page.url());
  
  // Try clicking Transactions
  await page.click('text=Transactions');
  await page.waitForTimeout(2000);
  console.log('✓ After clicking Transactions, URL:', page.url());
  
  // Check console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  console.log('✓ Console errors:', errors.length);
});
