import apiClient from './client';
import { DEMO_MODE } from '../utils/constants';
import { MOCK_USER } from './mockData';

/**
 * POST /api/auth/login  (backend Spring Boot)
 * Corps : { email, password } — l'email ou le nom d'utilisateur sont acceptés.
 * Réponse : { token, user: { id, name, email, role } }
 */
export async function login(email, password) {
  if (DEMO_MODE) {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      token: 'demo-jwt-token-123',
      user: MOCK_USER,
    };
  }
  const isEmail = email.includes('@');
  const response = await apiClient.post(
    '/auth/login',
    isEmail ? { email, password } : { username: email, password }
  );
  return response.data;
}
