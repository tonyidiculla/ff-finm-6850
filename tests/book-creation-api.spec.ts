import { test, expect } from '@playwright/test';

test.describe('Book Creation API', () => {
  test('should create a new book via API', async ({ request }) => {
    // Test data
    const bookData = {
      organizationPlatformId: 'C00000001',
      entityPlatformId: 'E019nC8m3',
      entityName: 'FURFIELD',
      entityType: 'hospital',
      name: 'Test Ledger E2E',
      type: 'general-ledger',
      countryCode: 'IN',
      currency: 'INR',
      fyStartMonth: 4,
      accountingStandard: 'IFRS',
      description: 'Test book created by E2E test'
    };

    // Make POST request to create book
    const response = await request.post('http://localhost:6850/api/books', {
      data: bookData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check response status
    expect(response.ok()).toBeTruthy();
    
    // Get response body
    const responseBody = await response.json();
    console.log('Response:', JSON.stringify(responseBody, null, 2));

    // Verify the response structure
    if (responseBody.error) {
      console.error('Error creating book:', responseBody.error);
      throw new Error(`Failed to create book: ${responseBody.error}`);
    }

    // Verify the book was created with correct data
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.name).toBe('Test Ledger E2E');
    expect(responseBody.organizationPlatformId).toBe('C00000001');
    expect(responseBody.entityPlatformId).toBe('E019nC8m3');
    expect(responseBody.countryCode).toBe('IN');
    expect(responseBody.accountingStandard).toBe('IFRS');
  });

  test('should validate required fields', async ({ request }) => {
    // Test data missing required fields
    const incompleteData = {
      name: 'Incomplete Book',
      type: 'general-ledger'
    };

    // Make POST request with incomplete data
    const response = await request.post('http://localhost:6850/api/books', {
      data: incompleteData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Should return an error
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    console.log('Validation error:', responseBody.error);
  });

  test('should fetch organizations', async ({ request }) => {
    const response = await request.get('http://localhost:6850/api/organizations');
    
    expect(response.ok()).toBeTruthy();
    const organizations = await response.json();
    
    expect(Array.isArray(organizations)).toBeTruthy();
    expect(organizations.length).toBeGreaterThan(0);
    console.log(`Found ${organizations.length} organizations`);
  });

  test('should fetch entities', async ({ request }) => {
    const response = await request.get('http://localhost:6850/api/entities');
    
    expect(response.ok()).toBeTruthy();
    const entities = await response.json();
    
    expect(Array.isArray(entities)).toBeTruthy();
    expect(entities.length).toBeGreaterThan(0);
    console.log(`Found ${entities.length} entities`);
  });
});
