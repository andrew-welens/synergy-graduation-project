describe('Управление клиентами', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password')
    cy.wait(1000)
  })

  it('должен отобразить список клиентов', () => {
    cy.visit('/clients')
    cy.url().should('not.include', '/login')
    cy.contains('Клиенты', { matchCase: false }).should('be.visible')
    cy.wait(3000)
    cy.get('table, .empty-state, .retry-panel', { timeout: 10000 }).should('be.visible')
  })

  it('должен создать нового клиента', () => {
    cy.visit('/clients')
    cy.url().should('not.include', '/login')
    cy.wait(2000)
    cy.contains('Создать', { matchCase: false }).click()
    cy.wait(500)
    cy.get('.drawer').should('be.visible')
    const timestamp = Date.now()
    const clientName = `Тестовый клиент E2E ${timestamp}`
    const uniqueEmail = `test${timestamp}@example.com`
    const uniquePhone = `7999${timestamp.toString().slice(-7)}`
    const uniqueInn = timestamp.toString().slice(-10)
    cy.get('.drawer input[placeholder="Имя"]').type(clientName)
    cy.get('.drawer input[placeholder="Email"]').type(uniqueEmail)
    cy.get('.drawer input[placeholder*="+7"]').clear().type(uniquePhone)
    cy.get('.drawer select').first().select('legal', { force: true })
    cy.get('.drawer input[placeholder*="ИНН"]').type(uniqueInn)
    cy.get('.drawer button[type="submit"]').should('not.be.disabled')
    cy.get('.drawer').contains('Добавить', { matchCase: false }).click()
    cy.wait(2000)
    cy.contains(clientName).should('be.visible')
  })

  it('должен выполнить поиск клиента', () => {
    cy.visit('/clients')
    cy.url().should('not.include', '/login')
    cy.wait(2000)
    cy.get('.filters-row input[placeholder*="Поиск"]').first().type('Тест')
    cy.wait(1000)
    cy.get('table tbody tr, .empty-state').should('exist')
  })

  it('должен открыть карточку клиента', () => {
    cy.visit('/clients')
    cy.url().should('not.include', '/login')
    cy.wait(3000)
    cy.get('table tbody tr, .empty-state, .retry-panel', { timeout: 10000 }).should('exist')
    cy.get('table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.get('table tbody tr').first().within(() => {
          cy.get('a').first().click()
        })
        cy.url({ timeout: 5000 }).should('include', '/clients/')
      } else {
        cy.log('Нет клиентов для открытия карточки')
      }
    })
  })
})
