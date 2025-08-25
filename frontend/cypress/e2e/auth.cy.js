// /frontend/cypress/e2e/auth.cy.js

describe('Authentication Flow', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173/');
  });

  it('should allow a user to log in and log out', () => {
    // 1. Navigate to the login page
    cy.contains('Login').click();
    cy.url().should('include', '/login');

    // 2. Fill out the login form
    // Replace with a real user's email and password from your test database
    cy.get('#email').type('buyer.review@example.com');
    cy.get('#password').type('password123');

    // 3. Submit the form
    // FIX: Use the data-cy attribute to specifically target the login form
    cy.get('[data-cy=login-form]').submit();

    // 4. Assert that the user is logged in
    cy.url().should('eq', 'http://localhost:5173/');
    cy.contains('Hello,').should('be.visible');

    // 5. Log out
    cy.get('.account-trigger').click();
    cy.get('.dropdown-menu').contains('Logout').click();

    // 6. Assert that the user is logged out
    cy.contains('Login').should('be.visible');
  });

});