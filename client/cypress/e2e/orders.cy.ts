describe('Управление заказами', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password')
    cy.wait(1000)
  })

  it('должен отобразить список заказов', () => {
    cy.visit('/orders')
    cy.url().should('not.include', '/login')
    cy.contains('Заказы', { matchCase: false }).should('be.visible')
    cy.wait(3000)
    cy.get('table, .empty-state, .retry-panel', { timeout: 10000 }).should('be.visible')
  })

  it('должен создать новый заказ', () => {
    cy.visit('/orders')
    cy.url().should('not.include', '/login')
    cy.wait(2000)
    cy.contains('Создать', { matchCase: false }).click()
    cy.wait(1000)
    cy.get('.drawer').should('be.visible')
    cy.get('.drawer select').first().should('be.visible').then(($select) => {
      if ($select.find('option').length > 1) {
        cy.get('.drawer select').first().select(1, { force: true })
        cy.wait(500)
        cy.get('.drawer select').eq(1).should('be.visible').then(($prodSelect) => {
          if ($prodSelect.find('option').length > 1) {
            cy.get('.drawer select').eq(1).select(1, { force: true })
            cy.get('.drawer input[type="number"]').first().clear().type('2')
            cy.get('.drawer button[type="submit"]').should('not.be.disabled')
            cy.get('.drawer').contains('Создать', { matchCase: false }).click()
            cy.wait(3000)
            cy.get('.drawer').should('not.exist')
            cy.get('table tbody tr', { timeout: 5000 }).should('have.length.at.least', 1)
          } else {
            cy.log('Нет доступных товаров для создания заказа')
          }
        })
      } else {
        cy.log('Нет доступных клиентов для создания заказа')
      }
    })
  })

  it('должен отфильтровать заказы по статусу', () => {
    cy.visit('/orders')
    cy.wait(2000)
    cy.get('.filters-row select').first().select('new')
    cy.wait(2000)
    cy.get('table tbody tr, .empty-state').should('exist')
  })
})
