describe('Аутентификация', () => {
  it('должен успешно войти в систему', () => {
    cy.visit('/login')
    cy.wait(500)
    cy.get('input[type="email"]').should('be.visible').clear().should('have.value', '')
    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').should('be.visible').clear().should('have.value', '')
    cy.get('input[type="password"]').type('password')
    cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')
    cy.wait(1000)
  })

  it('должен показать ошибку при неверных credentials', () => {
    cy.visit('/login')
    cy.wait(500)
    cy.get('input[type="email"]').should('be.visible').clear().should('have.value', '')
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').should('be.visible').clear().should('have.value', '')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled').click()
    cy.wait(2000)
    cy.get('.form-error', { timeout: 5000 }).should('be.visible').and('contain.text', 'Неверный')
  })

  it('должен перенаправить на логин при отсутствии авторизации', () => {
    cy.visit('/clients')
    cy.url({ timeout: 5000 }).should('include', '/login')
  })
})
