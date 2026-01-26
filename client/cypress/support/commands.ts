Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.wait(1000)
    cy.get('input[type="email"]').should('be.visible').clear().should('have.value', '')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').should('be.visible').clear().should('have.value', '')
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')
    cy.wait(2000)
  })
  cy.visit('/')
  cy.wait(2000)
  cy.url({ timeout: 10000 }).should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.visit('/')
  cy.contains('Выход').click()
  cy.url().should('include', '/login')
})
