// src/routes/(admin)/logout/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  // Eliminar cookies de sesión
  cookies.delete('auth_token', { path: '/' });
  cookies.delete('auth_user', { path: '/' });
  
  // Redirigir al login
  throw redirect(303, '/login');
}