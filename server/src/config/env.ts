const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'] as const

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    const missing: string[] = []
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar)
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
    
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production')
    }
    
    const databaseUrl = process.env.DATABASE_URL
    if (databaseUrl && !databaseUrl.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection string')
    }
  }
}

export { validateEnv }