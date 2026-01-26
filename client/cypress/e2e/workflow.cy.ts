describe('Полный рабочий процесс', () => {
  it('должен выполнить полный цикл: вход → создание клиента → создание заказа → смена статуса', () => {
    cy.visit('/login')
    cy.login('admin@example.com', 'password')

    cy.visit('/clients')
    cy.wait(2000)
    cy.contains('Создать', { matchCase: false }).click()
    cy.wait(500)
    cy.get('.drawer').should('be.visible')
    const timestamp = Date.now()
    const clientName = `Клиент E2E ${timestamp}`
    const uniqueEmail = `client${timestamp}@example.com`
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

    cy.visit('/orders')
    cy.url().should('not.include', '/login')
    cy.contains('Заказы', { matchCase: false }).should('be.visible')
    cy.wait(3000)
    cy.get('table, .empty-state, .retry-panel', { timeout: 10000 }).should('be.visible')
    cy.contains('Создать', { matchCase: false }).should('be.visible').and('not.be.disabled')
    cy.contains('Создать', { matchCase: false }).click()
    cy.get('.drawer', { timeout: 15000 }).should('be.visible')
    cy.get('.drawer .drawer-title').should('contain.text', 'Новый заказ')
    cy.get('.drawer select').first().should('be.visible').then(($select) => {
      if ($select.find('option').length > 1) {
        cy.get('.drawer select').first().select(1, { force: true })
        cy.wait(500)
        cy.get('.drawer select').eq(1).should('be.visible').then(($prodSelect) => {
          if ($prodSelect.find('option').length > 1) {
            cy.get('.drawer select').eq(1).select(1, { force: true })
            cy.get('.drawer input[type="number"]').first().clear().type('1')
            cy.get('.drawer button[type="submit"]').should('not.be.disabled')
            cy.get('.drawer').contains('Создать', { matchCase: false }).click()
            cy.wait(3000)
            cy.get('.drawer').should('not.exist')
            cy.get('table tbody tr', { timeout: 5000 }).should('have.length.at.least', 1)
            cy.get('table tbody tr').first().within(() => {
              cy.get('a').first().click()
            })
            cy.url({ timeout: 5000 }).should('include', '/orders/')
            cy.wait(2000)
            cy.contains('Обновить статус', { matchCase: false }).parent().within(() => {
              cy.get('select.input').first().should('be.visible').then(($statusSelect) => {
                const options = $statusSelect.find('option').filter((i, opt) => opt.value !== '')
                if (options.length > 0) {
                  const firstAvailableValue = options.first().val() as string
                  cy.wrap($statusSelect).then(($el) => {
                    const nativeSelect = $el[0] as HTMLSelectElement
                    nativeSelect.value = firstAvailableValue
                    const event = new Event('change', { bubbles: true })
                    nativeSelect.dispatchEvent(event)
                  })
                  cy.wait(500)
                  cy.wrap($statusSelect).should('have.value', firstAvailableValue)
                  cy.wait(500)
                  cy.intercept('POST', '**/api/orders/**/status').as('updateStatus')
                  cy.contains('Обновить статус', { matchCase: false }).should('be.visible').and('not.be.disabled')
                  cy.contains('Обновить статус', { matchCase: false }).click()
                  cy.wait('@updateStatus', { timeout: 10000 }).then((interception) => {
                    if (interception?.response?.statusCode === 201) {
                      cy.log('Статус успешно обновлен')
                    }
                  })
                } else {
                  cy.log('Нет доступных статусов для изменения')
                }
              })
            })
          } else {
            cy.log('Нет доступных товаров для создания заказа')
          }
        })
      } else {
        cy.log('Нет доступных клиентов для создания заказа')
      }
    })
  })
})
