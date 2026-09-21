/**
 * MediAgenda IA — Autenticación (Supabase Auth)
 * ---------------------------------------------------------------
 * Responsabilidad única: iniciar sesión, cerrar sesión, y saber
 * quién es el usuario actual. No toca pacientes, citas ni
 * configuración — eso sigue viviendo en localStorage (ver data.js)
 * hasta una etapa posterior de este proyecto.
 *
 * SEGURIDAD:
 * - No se guarda la contraseña en ningún lado del código ni en
 *   localStorage: Supabase la intercambia por un token de sesión
 *   que su propia librería administra internamente.
 * - La clave de abajo es la clave pública "anon" (publishable),
 *   no una clave secreta. Es segura para vivir en el frontend
 *   porque lo que realmente protege los datos es Row Level
 *   Security (RLS) en el servidor, no el secreto de esta clave.
 *   La clave "service_role" (esa sí secreta) NUNCA debe aparecer
 *   en este archivo ni en ningún otro del frontend.
 * ---------------------------------------------------------------
 */

const SUPABASE_URL = 'https://aryxeugvdzawqyiltoic.supabase.co';

// TODO: reemplaza esto por tu clave "anon" / "publishable" real.
// Se encuentra en el panel de Supabase: Project Settings → API →
// "Project API keys" → "anon public". NO es la "service_role".
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeXhldWd2ZHphd3F5aWx0b2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NzIyMDksImV4cCI6MjEwNTQ0ODIwOX0.xx1uVA0V8XqhEJKOivfpl_kz_qYc-SQJ88BLTGpFMZc';

// `supabase` es el global que expone el <script> del CDN cargado en index.html.
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Auth = {
  /** Intenta iniciar sesión con correo y contraseña. Nunca lanza una excepción hacia afuera. */
  async iniciarSesion(correo, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: correo, password });
      if (error) return { ok: false, mensaje: mensajeDeError(error) };
      return { ok: true, sesion: data.session };
    } catch (e) {
      console.warn('Auth.iniciarSesion: fallo inesperado.', e);
      return { ok: false, mensaje: 'No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.' };
    }
  },

  /** Cierra la sesión actual. */
  async cerrarSesion() {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Auth.cerrarSesion: fallo inesperado.', e);
    }
  },

  /** Sesión activa (si existe), o null. Se usa al cargar la página para saber qué pantalla mostrar. */
  async sesionActual() {
    try {
      const { data } = await supabaseClient.auth.getSession();
      return data.session || null;
    } catch (e) {
      console.warn('Auth.sesionActual: fallo inesperado.', e);
      return null;
    }
  },

  /** Avisa cada vez que la sesión cambia (inicio, cierre, o token renovado). */
  onCambioSesion(callback) {
    supabaseClient.auth.onAuthStateChange((_evento, sesion) => callback(sesion));
  },
};

/**
 * Traduce errores de Supabase a mensajes claros para el usuario, sin
 * exponer detalles internos (ni confirmar si el correo existe o no:
 * Supabase ya responde con el mismo mensaje genérico en ambos casos).
 */
function mensajeDeError(error) {
  const texto = (error.message || '').toLowerCase();
  if (texto.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (texto.includes('email not confirmed')) {
    return 'Tu correo todavía no está confirmado. Revisa tu bandeja de entrada.';
  }
  if (texto.includes('too many requests') || texto.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento antes de volver a intentar.';
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo en unos momentos.';
}
