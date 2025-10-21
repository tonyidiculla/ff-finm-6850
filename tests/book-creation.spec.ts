import { test, expect } from '@playwright/test';

// Set up authentication token before tests
test.beforeEach(async ({ page }) => {
  // Set the auth token cookie
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNzQ4NTYwZi1kMzg3LTRjNGUtODA4Zi03MmY0OTc5OGI4ODEiLCJlbWFpbCI6InRvbnlAZnVzaW9uZHVvdGVjaC5jb20iLCJyb2xlIjoidXNlciIsInBsYXRmb3JtSWQiOiJIMDAwMDAwMDEiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc2MDk4MDA0MiwiZXhwIjoxNzYxNTg0ODQyfQ.-jyUHoMwm4rUzLXXUAzkc8tIBWEGfe-t4C8e7eWjhsA';
  
  // Set cookies for authentication
  await page.context().addCookies([
    {
      name: 'auth_token',
      value: authToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }
  ]);
});

test.describe('Book Creation Flow', () => {
  test('should create a new book successfully', async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:6850/dashboard/books', { waitUntil: 'networkidle' });

    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Books');

    // Click the "New Book" button to show the form
    await page.click('button:has-text("New Book")');

    // Wait for the form to appear
    await expect(page.locator('h3:has-text("Create New Book")')).toBeVisible();

    // Fill in the organization field
    await page.selectOption('#organizationId', 'C00000001');

    // Wait for entities to load and select an entity
    await page.waitForTimeout(1000); // Wait for entities API call
    await page.selectOption('#entitySelect', 'E019nC8m3');

    // Wait for auto-population to occur
    await page.waitForTimeout(1000);

    // Fill in the book name
    await page.fill('#name', 'Playwright Test Book');

    // Verify the Create Book button is enabled
    const createButton = page.locator('button:has-text("Create Book")');
    await expect(createButton).toBeEnabled();

    // Click the Create Book button
    await createButton.click();

    // Wait for the form to disappear or success indication
    await page.waitForTimeout(2000);

    // Check if the form closed (indicating success) or if there's an error
    const formVisible = await page.locator('h3:has-text("Create New Book")').isVisible();
    
    if (formVisible) {
      // Form is still visible, likely an error occurred
      console.log('Form is still visible after submission - checking for errors');
      
      // Check browser console for errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Browser console error:', msg.text());
        }
      });
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'book-creation-error.png' });
      
      throw new Error('Book creation failed - form is still visible');
    } else {
      console.log('Book creation appears successful - form closed');
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:6850/dashboard/books', { waitUntil: 'networkidle' });

    // Click the "New Book" button to show the form
    await page.click('button:has-text("New Book")');

    // Verify the Create Book button is disabled initially
    const createButton = page.locator('button:has-text("Create Book")');
    await expect(createButton).toBeDisabled();

    // Fill only organization
    await page.selectOption('#organizationId', 'C00000001');
    await expect(createButton).toBeDisabled();

    // Fill entity
    await page.waitForTimeout(1000);
    await page.selectOption('#entitySelect', 'E019nC8m3');
    await expect(createButton).toBeDisabled();

    // Fill book name - now button should be enabled
    await page.fill('#name', 'Test Book Name');
    await expect(createButton).toBeEnabled();
  });

  test('should auto-populate currency and accounting standard', async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:6850/dashboard/books', { waitUntil: 'networkidle' });

    // Click the "New Book" button to show the form
    await page.click('button:has-text("New Book")');

    // Select organization
    await page.selectOption('#organizationId', 'C00000001');

    // Select entity and wait for auto-population
    await page.waitForTimeout(1000);
    await page.selectOption('#entitySelect', 'E019nC8m3');
    await page.waitForTimeout(1000);

    // Check if auto-population explanation is visible
    const autoPopulationMsg = page.locator('text=Fields marked with an asterisk were auto-populated');
    await expect(autoPopulationMsg).toBeVisible();

    // Verify currency field has INR
    const currencySelect = page.locator('#currency');
    await expect(currencySelect).toHaveValue('INR');

    // Verify accounting standard field has IFRS
    const accountingStandardSelect = page.locator('#accountingStandard');
    await expect(accountingStandardSelect).toHaveValue('IFRS');
  });
});