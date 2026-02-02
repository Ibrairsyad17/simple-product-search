import dotenv from 'dotenv';

dotenv.config();

// Validate JWT secret at startup
function validateJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, fail fast if JWT_SECRET is missing or insecure
  if (isProduction && (!secret || secret === 'secret')) {
    console.error(
      '❌ FATAL ERROR: JWT_SECRET must be set to a secure value in production.'
    );
    console.error(
      '   Using default "secret" is not allowed for security reasons.'
    );
    console.error(
      '   Set JWT_SECRET environment variable and restart the server.'
    );
    process.exit(1);
  }

  // In development, warn but allow default for convenience
  if (!secret || secret === 'secret') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET="secret".');
    console.warn('   This is only acceptable in development.');
    console.warn('   Set JWT_SECRET environment variable for production.');
    return 'secret';
  }

  return secret;
}

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    secret: validateJWTSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },

  database: {
    url: process.env.DATABASE_URL || '',
  },
};
