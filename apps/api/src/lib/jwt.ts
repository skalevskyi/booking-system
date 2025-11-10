import { getEnv } from '../config/env.js';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function getJWTConfig() {
  const env = getEnv();
  return {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  };
}

