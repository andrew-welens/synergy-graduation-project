import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 20000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    pageLoadTimeout: 30000,
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      on('task', {
        async checkServer() {
          try {
            const response = await fetch('http://localhost:3000/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: 'test' }),
              signal: AbortSignal.timeout(3000)
            })
            const status = response.status
            if (status === 429) {
              console.error('❌ Сервер запущен БЕЗ тестового режима! Rate limiting активен!')
              console.error('Запустите сервер командой: cd server && npm run dev:test')
              return false
            }
            return status === 401 || status === 400 || status === 200
          } catch (error) {
            console.error('❌ Сервер недоступен на http://localhost:3000')
            console.error('Запустите сервер командой: cd server && npm run dev:test')
            return false
          }
        }
      })
      return config
    }
  }
})
