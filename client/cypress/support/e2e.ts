import './commands'

before(() => {
  cy.task('checkServer').then((isRunning) => {
    if (!isRunning) {
      throw new Error(
        '❌ Сервер не запущен в тестовом режиме или недоступен!\n\n' +
        'ОБЯЗАТЕЛЬНО запустите сервер командой:\n' +
        '  cd server\n' +
        '  npm run dev:test\n\n' +
        'Должно появиться сообщение: "✓ Running in TEST mode - rate limiting DISABLED"\n' +
        'Если этого сообщения нет - сервер запущен неправильно!'
      )
    }
  })
})

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('429') || err.message.includes('Too Many Requests') || err.message.includes('Ошибка запроса')) {
    return false
  }
  return true
})

Cypress.on('request:failed', (request) => {
  if (request.response?.statusCode === 429) {
    cy.log(`⚠️ 429 ошибка на ${request.url}, повторяем запрос...`)
    return false
  }
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}
