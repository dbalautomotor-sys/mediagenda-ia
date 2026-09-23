/**
 * MediAgenda IA — Capa de datos (prototipo local)
 * ---------------------------------------------------------------
 * Responsabilidad única: leer/escribir el estado en localStorage.
 * No contiene lógica de interfaz. Nada aquí simula un envío real
 * de recordatorios ni una conexión a un backend: es persistencia
 * local para el prototipo de un solo consultorio.
 *
 * IMPORTANTE: los nombres de pacientes y motivos de consulta que
 * aparecen en el "seed" son datos ficticios de demostración, no
 * información médica real.
 * ---------------------------------------------------------------
 */

const STORAGE_KEYS = {
  citas: 'mediagenda.citas',
  pacientes: 'mediagenda.pacientes',
  config: 'mediagenda.config',
};

const DEFAULT_CONFIG = {
  nombreConsultorio: 'Consultorio Dra. Fernanda Ruiz',
  horaInicio: '09:00',
  horaFin: '18:00',
  duracionCita: 30,
  recordatoriosActivos: false,
};

/** Pacientes de ejemplo (datos ficticios) que respaldan las citas semilla. */
function buildSeedPacientes() {
  return [
    { id: cryptoId(), nombre: 'Ana López', telefono: '33 1234 5678', correo: 'ana.lopez@example.com', notas: '' },
    { id: cryptoId(), nombre: 'Jorge Medina', telefono: '33 2345 6789', correo: '', notas: '' },
    { id: cryptoId(), nombre: 'Sofía Ramírez', telefono: '33 3456 7890', correo: 'sofia.ramirez@example.com', notas: '' },
    { id: cryptoId(), nombre: 'Luis Herrera', telefono: '33 4567 8901', correo: '', notas: '' },
    { id: cryptoId(), nombre: 'Carla Domínguez', telefono: '33 5678 9012', correo: 'carla.dominguez@example.com', notas: '' },
    { id: cryptoId(), nombre: 'Miguel Torres', telefono: '33 6789 0123', correo: '', notas: '' },
  ];
}

/**
 * Citas de ejemplo para poblar el prototipo la primera vez que se abre.
 * Recibe la lista de pacientes semilla para enlazar cada cita a un
 * `pacienteId` real (además del nombre, que se conserva para no romper
 * las pantallas que ya muestran `cita.paciente` como texto).
 */
function buildSeedCitas(pacientes) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);

  const todayStr = iso(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = iso(tomorrow);

  const porNombre = (nombre) => {
    const p = (pacientes || []).find((p) => p.nombre === nombre);
    return p ? p.id : null;
  };

  return [
    { id: cryptoId(), pacienteId: porNombre('Ana López'), paciente: 'Ana López', motivo: 'Consulta general', fecha: todayStr, hora: '09:30', duracion: 30, estado: 'confirmada' },
    { id: cryptoId(), pacienteId: porNombre('Jorge Medina'), paciente: 'Jorge Medina', motivo: 'Revisión de resultados', fecha: todayStr, hora: '11:00', duracion: 30, estado: 'pendiente' },
    { id: cryptoId(), pacienteId: porNombre('Sofía Ramírez'), paciente: 'Sofía Ramírez', motivo: 'Consulta de seguimiento', fecha: todayStr, hora: '13:15', duracion: 30, estado: 'pendiente' },
    { id: cryptoId(), pacienteId: porNombre('Luis Herrera'), paciente: 'Luis Herrera', motivo: 'Chequeo anual', fecha: todayStr, hora: '16:00', duracion: 30, estado: 'atendida' },
    { id: cryptoId(), pacienteId: porNombre('Carla Domínguez'), paciente: 'Carla Domínguez', motivo: 'Primera consulta', fecha: tomorrowStr, hora: '10:00', duracion: 30, estado: 'confirmada' },
    { id: cryptoId(), pacienteId: porNombre('Miguel Torres'), paciente: 'Miguel Torres', motivo: 'Control de tratamiento', fecha: tomorrowStr, hora: '12:30', duracion: 30, estado: 'cancelada' },
  ];
}

function cryptoId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now();
}

/* ---------- Utilidades de tiempo (usadas por data.js y app.js) ---------- */

/** "09:30" -> 570 */
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** 570 -> "09:30" */
function minutesToTime(mins) {
  const total = ((mins % 1440) + 1440) % 1440; // por si acaso se pasa de medianoche
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Hora de fin calculada a partir de la hora de inicio + duración en minutos. */
function calcularHoraFin(horaInicio, duracionMin) {
  return minutesToTime(timeToMinutes(horaInicio) + Number(duracionMin || 30));
}

/**
 * Fecha de HOY en formato "YYYY-MM-DD" según la hora LOCAL del navegador
 * (no UTC). `new Date().toISOString()` usa UTC y puede devolver el día
 * equivocado por la noche en husos horarios como México (UTC-6): esta
 * función usa los getters locales de Date (getFullYear/getMonth/getDate)
 * para evitar ese corrimiento.
 */
function todayISOLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Prepara los datos iniciales la primera vez que se abre el prototipo, migra
 * instalaciones de una fase anterior (citas sin pacientes), y en cualquier
 * otro caso revisa que las citas existentes sigan enlazadas correctamente:
 * enlaza por nombre exacto las que no tengan pacienteId (sin sobrescribir
 * las que ya lo tienen) y limpia referencias a pacientes que ya no existen.
 * No pisa ni borra datos reales existentes.
 */
function ensureSeedData() {
  try {
    const citasRaw = localStorage.getItem(STORAGE_KEYS.citas);
    const pacientesRaw = localStorage.getItem(STORAGE_KEYS.pacientes);

    if (!citasRaw && !pacientesRaw) {
      const pacientes = buildSeedPacientes();
      const citas = buildSeedCitas(pacientes);
      localStorage.setItem(STORAGE_KEYS.pacientes, JSON.stringify(pacientes));
      localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(citas));
      return;
    }

    if (citasRaw && !pacientesRaw) {
      const citas = JSON.parse(citasRaw);
      const nombres = [...new Set(citas.map((c) => c.paciente).filter(Boolean))];
      const pacientes = nombres.map((nombre) => ({ id: cryptoId(), nombre, telefono: '', correo: '', notas: '' }));
      const citasEnlazadas = citas.map((c) => {
        if (c.pacienteId) return c;
        const p = pacientes.find((p) => p.nombre === c.paciente);
        return p ? { ...c, pacienteId: p.id } : c;
      });
      localStorage.setItem(STORAGE_KEYS.pacientes, JSON.stringify(pacientes));
      localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(citasEnlazadas));
      return; // ya quedaron enlazadas en este mismo paso
    }

    // Pasada de compatibilidad (corre siempre que ya existan ambas colecciones):
    // 1) enlaza por coincidencia exacta de nombre las citas que aún no tengan pacienteId
    //    (nunca sobrescribe un pacienteId ya presente);
    // 2) limpia únicamente el pacienteId de citas que apunten a un paciente que ya no existe,
    //    sin tocar el nombre de texto ni el resto de la cita.
    const citasRawActual = localStorage.getItem(STORAGE_KEYS.citas);
    const pacientesRawActual = localStorage.getItem(STORAGE_KEYS.pacientes);
    if (citasRawActual && pacientesRawActual) {
      const citas = JSON.parse(citasRawActual);
      const pacientes = JSON.parse(pacientesRawActual);
      let cambio = false;

      const citasCorregidas = citas.map((c) => {
        if (c.pacienteId) {
          const existe = pacientes.some((p) => p.id === c.pacienteId);
          if (existe) return c; // enlace válido, no se toca
          cambio = true;
          return { ...c, pacienteId: null }; // enlace huérfano: se limpia, el nombre de texto se conserva
        }
        const coincidencia = pacientes.find((p) => p.nombre === c.paciente);
        if (coincidencia) {
          cambio = true;
          return { ...c, pacienteId: coincidencia.id };
        }
        return c;
      });

      if (cambio) localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(citasCorregidas));
    }
  } catch (e) {
    console.warn('No se pudo preparar/migrar los datos de pacientes.', e);
  }
}
ensureSeedData();

const Store = {
  getConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.config);
      if (!raw) return { ...DEFAULT_CONFIG };
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('No se pudo leer la configuración, usando valores por defecto.', e);
      return { ...DEFAULT_CONFIG };
    }
  },

  saveConfig(config) {
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  },

  getCitas() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.citas);
      if (!raw) {
        const seed = buildSeedCitas();
        localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('No se pudo leer las citas guardadas, se reinicia el prototipo.', e);
      const seed = buildSeedCitas();
      localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(seed));
      return seed;
    }
  },

  saveCitas(citas) {
    localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(citas));
  },

  addCita(cita) {
    const citas = this.getCitas();
    citas.push(cita);
    this.saveCitas(citas);
    return citas;
  },

  /** Actualiza los campos indicados de una cita existente (edición o cambio de estado). */
  updateCita(id, changes) {
    const citas = this.getCitas();
    const idx = citas.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    citas[idx] = { ...citas[idx], ...changes };
    this.saveCitas(citas);
    return citas[idx];
  },

  /** Elimina una cita de forma permanente. Debe llamarse solo tras confirmación en la interfaz. */
  deleteCita(id) {
    const citas = this.getCitas().filter((c) => c.id !== id);
    this.saveCitas(citas);
    return citas;
  },

  getCitaById(id) {
    return this.getCitas().find((c) => c.id === id) || null;
  },

  /**
   * Revisa si el rango [hora, hora + duracionMin) se traslapa con alguna otra
   * cita activa (no cancelada) del mismo día, usando la duración propia de
   * cada cita (o 30 min por compatibilidad con datos antiguos sin duración).
   * Dos citas se traslapan si inicioA < finB Y inicioB < finA.
   */
  hasConflict(fecha, hora, duracionMin = 30, ignoreId = null) {
    const inicioA = timeToMinutes(hora);
    const finA = inicioA + Number(duracionMin || 30);
    const citas = this.getCitas();
    return citas.some((c) => {
      if (c.id === ignoreId) return false;
      if (c.fecha !== fecha) return false;
      if (c.estado === 'cancelada') return false;
      const inicioB = timeToMinutes(c.hora);
      const finB = inicioB + Number(c.duracion || 30);
      return inicioA < finB && inicioB < finA;
    });
  },

  /**
   * Citas que necesitan recordatorio: estado `pendiente` o `confirmada`,
   * desde hoy en adelante (excluye `atendida` y `cancelada`), ordenadas por
   * fecha y hora ascendente. Solo lectura — no escribe nada en localStorage.
   * Las citas sin `recordatorioEstado` se devuelven tal cual (ese campo se
   * interpreta como "pendiente" por defecto en la capa de interfaz).
   */
  getCitasParaRecordatorio() {
    const hoy = todayISOLocal();
    return this.getCitas()
      .filter((c) => (c.estado === 'pendiente' || c.estado === 'confirmada') && c.fecha >= hoy)
      .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`));
  },

  // ---------- Pacientes ----------
  getPacientes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.pacientes);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('No se pudo leer la lista de pacientes.', e);
      return [];
    }
  },

  savePacientes(pacientes) {
    localStorage.setItem(STORAGE_KEYS.pacientes, JSON.stringify(pacientes));
  },

  addPaciente(paciente) {
    const pacientes = this.getPacientes();
    pacientes.push(paciente);
    this.savePacientes(pacientes);
    return pacientes;
  },

  updatePaciente(id, changes) {
    const pacientes = this.getPacientes();
    const idx = pacientes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    pacientes[idx] = { ...pacientes[idx], ...changes };
    this.savePacientes(pacientes);
    return pacientes[idx];
  },

  /**
   * Elimina un paciente, pero solo si no tiene citas relacionadas (ver
   * Store.getCitasByPacienteId). Esta es la validación de seguridad
   * definitiva: cualquier código que llame a deletePaciente, aunque no
   * pase por la interfaz, queda protegido contra dejar citas con un
   * pacienteId inválido.
   * Devuelve la lista de pacientes actualizada si se eliminó, o `null`
   * si se bloqueó por tener citas vinculadas. Nunca toca las citas.
   */
  deletePaciente(id) {
    if (this.getCitasByPacienteId(id).length > 0) {
      console.warn('deletePaciente bloqueado: el paciente tiene citas relacionadas.');
      return null;
    }
    const pacientes = this.getPacientes().filter((p) => p.id !== id);
    this.savePacientes(pacientes);
    return pacientes;
  },

  getPacienteById(id) {
    return this.getPacientes().find((p) => p.id === id) || null;
  },

  /** Historial de citas administrativas de un paciente, más recientes primero. */
  getCitasByPacienteId(id) {
    return this.getCitas()
      .filter((c) => c.pacienteId === id)
      .sort((a, b) => `${b.fecha}T${b.hora}`.localeCompare(`${a.fecha}T${a.hora}`));
  },

  /**
   * Genera un objeto de respaldo con todo lo guardado en localStorage
   * (citas, pacientes y configuración), listo para convertirse en un
   * archivo JSON descargable. Es solo lectura: no borra ni modifica nada.
   *
   * La configuración se lee directo de localStorage (no vía getConfig())
   * para no incluir valores por defecto que en realidad nunca se guardaron.
   * Si ese dato estuviera dañado (JSON inválido), el respaldo continúa con
   * `config: null` y una advertencia, en vez de fallar por completo.
   */
  exportarRespaldo() {
    let config = null;
    let configDañada = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.config);
      config = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('exportarRespaldo: la configuración guardada está dañada, se exporta como null.', e);
      configDañada = true;
    }

    return {
      exportadoEn: new Date().toISOString(),
      version: 1,
      datos: {
        citas: this.getCitas(),
        pacientes: this.getPacientes(),
        config,
      },
      advertencias: configDañada ? ['La configuración guardada no era JSON válido y se omitió.'] : [],
    };
  },
};

/**
 * MediAgenda IA — Conexión de prueba con Supabase (etapa 1, solo lectura)
 * ---------------------------------------------------------------
 * Estas tres funciones SOLO leen datos de Supabase para verificar que
 * la conexión funciona. No guardan, editan ni eliminan nada, y no
 * sustituyen a `Store`/`localStorage` de arriba, que sigue siendo la
 * fuente real de datos de la app en esta etapa.
 *
 * Usan `supabaseClient`, el mismo cliente ya creado en js/auth.js
 * (se referencia en tiempo de ejecución, no aquí arriba, por eso no
 * importa que este archivo se cargue antes que auth.js en index.html).
 *
 * IMPORTANTE — supuesto de nombres de tabla: como no se ejecutó SQL
 * ni se revisó el esquema real de tu proyecto, estas funciones asumen
 * que las tablas se llaman 'pacientes', 'citas' y 'configuracion'. Si
 * en tu Supabase se llaman distinto, solo ajusta las tres constantes
 * de abajo.
 * ---------------------------------------------------------------
 */

const SUPABASE_TABLA_PACIENTES = 'pacientes';
const SUPABASE_TABLA_CITAS = 'citas';
const SUPABASE_TABLA_CONFIGURACION = 'configuracion';

/** Traduce un error de Supabase/PostgREST a un mensaje claro para mostrar en pantalla. */
function mensajeDeErrorSupabase(error) {
  const texto = ((error && error.message) || '').toLowerCase();
  if (texto.includes('does not exist') || texto.includes('could not find the table')) {
    return 'La tabla no existe todavía en Supabase (revisa el nombre).';
  }
  if (texto.includes('jwt') || texto.includes('permission') || texto.includes('policy') || texto.includes('rls')) {
    return 'No autorizado para leer esta tabla (revisa las políticas de RLS en Supabase).';
  }
  if (texto.includes('failed to fetch') || texto.includes('network')) {
    return 'No se pudo conectar con Supabase. Revisa tu conexión a internet.';
  }
  return (error && error.message) || 'No se pudo leer los datos desde Supabase.';
}

/** Lee solo el número de pacientes en Supabase (no descarga las filas completas). */
async function supabaseGetPacientes() {
  try {
    if (typeof supabaseClient === 'undefined') {
      return { ok: false, mensaje: 'El cliente de Supabase no está disponible (revisa js/auth.js).' };
    }
    const { count, error } = await supabaseClient
      .from(SUPABASE_TABLA_PACIENTES)
      .select('*', { count: 'exact', head: true });
    if (error) return { ok: false, mensaje: mensajeDeErrorSupabase(error) };
    return { ok: true, total: count || 0 };
  } catch (e) {
    console.warn('supabaseGetPacientes: fallo inesperado.', e);
    return { ok: false, mensaje: 'No se pudo conectar con Supabase. Intenta de nuevo.' };
  }
}

/** Lee solo el número de citas en Supabase (no descarga las filas completas). */
async function supabaseGetCitas() {
  try {
    if (typeof supabaseClient === 'undefined') {
      return { ok: false, mensaje: 'El cliente de Supabase no está disponible (revisa js/auth.js).' };
    }
    const { count, error } = await supabaseClient
      .from(SUPABASE_TABLA_CITAS)
      .select('*', { count: 'exact', head: true });
    if (error) return { ok: false, mensaje: mensajeDeErrorSupabase(error) };
    return { ok: true, total: count || 0 };
  } catch (e) {
    console.warn('supabaseGetCitas: fallo inesperado.', e);
    return { ok: false, mensaje: 'No se pudo conectar con Supabase. Intenta de nuevo.' };
  }
}

/** Revisa si hay al menos un registro de configuración en Supabase, sin descargar más de una fila. */
async function supabaseGetConfiguracion() {
  try {
    if (typeof supabaseClient === 'undefined') {
      return { ok: false, mensaje: 'El cliente de Supabase no está disponible (revisa js/auth.js).' };
    }
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLA_CONFIGURACION)
      .select('*')
      .limit(1);
    if (error) return { ok: false, mensaje: mensajeDeErrorSupabase(error) };
    const fila = (data && data[0]) || null;
    return { ok: true, existe: !!fila, datos: fila };
  } catch (e) {
    console.warn('supabaseGetConfiguracion: fallo inesperado.', e);
    return { ok: false, mensaje: 'No se pudo conectar con Supabase. Intenta de nuevo.' };
  }
}

/**
 * MediAgenda IA — Migración de localStorage a Supabase (Fase 2)
 * ---------------------------------------------------------------
 * Copia lo que ya existe en este navegador (pacientes, citas y
 * configuración, leídos vía `Store`) hacia las tablas de Supabase,
 * incluyendo `owner_id` del usuario con sesión activa para que las
 * políticas RLS (`owner_id = auth.uid()`) dejen pasar la escritura.
 *
 * NO toca localStorage salvo por una llave NUEVA y separada
 * ('mediagenda.migracion') donde se guarda qué registro local ya se
 * migró a qué UUID de Supabase, para poder volver a ejecutar la
 * migración sin duplicar nada. Las llaves originales de la app
 * (mediagenda.pacientes / .citas / .config) no se leen dos veces ni
 * se modifican aquí.
 *
 * LÍMITE HONESTO: como este entorno no tiene una conexión directa a
 * tu proyecto de Supabase para inspeccionar el esquema real, no pude
 * verificar los nombres exactos de columna ni ejecutar ningún SQL.
 * Lo de abajo son SUPUESTOS basados en los campos que ya usa `Store`
 * en este mismo archivo, ajustados con lo que confirmaste en tus
 * últimas dos revisiones:
 *   - CONFIRMADO por un error real de Supabase: la tabla `citas` NO
 *     tiene columna de texto `paciente` ('Could not find the
 *     'paciente' column of 'citas' in the schema cache'). Por eso ya
 *     no se envía ese campo — la relación con el paciente viaja
 *     únicamente por `paciente_id`.
 *   - `pacientes` y `citas` tienen una columna `id` (uuid, primary
 *     key) y una columna `owner_id` (uuid). Esto AÚN es un supuesto:
 *     si `citas` también rechaza `id` o `owner_id`, el mensaje de
 *     error te dirá cuál columna revisar.
 *   - `configuracion` NO tiene columna `id` propia: su clave
 *     primaria es `owner_id` (una fila por usuario). Por eso su
 *     migración usa `upsert` con `onConflict: 'owner_id'` en vez de
 *     generar un `id` nuevo — ver `migrarConfiguracionASupabase`.
 *   - `citas.paciente_id` es NOT NULL (obligatoria): una cita nunca
 *     se inserta con ese campo en null. Si el paciente de esa cita no
 *     se pudo migrar, la cita se cuenta como fallida y no se envía a
 *     Supabase — ver `migrarCitasASupabase`.
 *   - Los demás nombres de columna (`motivo`, `fecha`, `hora`,
 *     `duracion`, `estado`, `recordatorio_estado`) están en
 *     `SUPABASE_COLUMNAS` aquí abajo — es el ÚNICO lugar que
 *     necesitas editar si alguno de esos se llama distinto (el
 *     mensaje de error de Supabase, como el de `paciente` arriba, te
 *     dirá exactamente cuál).
 * La detección de duplicados en `configuracion` queda a cargo del
 * propio `upsert` de Supabase (por `owner_id`), así que funciona
 * incluso entre navegadores distintos. Para `pacientes` y `citas` la
 * detección de duplicados solo cubre este mismo navegador (mapa en
 * `mediagenda.migracion`) — si corres la migración desde otro
 * navegador, o después de borrar los datos de este, no hay forma de
 * detectar duplicados sin agregar una columna a esas tablas (y no se
 * ejecutó ningún SQL para hacerlo).
 * ---------------------------------------------------------------
 */

const MIGRACION_STORAGE_KEY = 'mediagenda.migracion';

const SUPABASE_COLUMNAS = {
  pacientes: { nombre: 'nombre', telefono: 'telefono', correo: 'correo', notas: 'notas' },
  citas: {
    pacienteId: 'paciente_id',
    motivo: 'motivo',
    fecha: 'fecha',
    hora: 'hora',
    duracion: 'duracion',
    estado: 'estado',
    recordatorioEstado: 'recordatorio_estado',
  },
  configuracion: {
    nombreConsultorio: 'nombre_consultorio',
    horaInicio: 'hora_inicio',
    horaFin: 'hora_fin',
    duracionCita: 'duracion_cita',
    recordatoriosActivos: 'recordatorios_activos',
  },
};

/** Genera un UUID v4 válido para usarlo como `id` nuevo al migrar un registro. */
function generarUUID() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  // Alternativa RFC4122 v4 para navegadores sin crypto.randomUUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Lee el mapa local-id → Supabase-UUID guardado por una corrida previa de la migración. */
function leerEstadoMigracion() {
  try {
    const raw = localStorage.getItem(MIGRACION_STORAGE_KEY);
    if (!raw) return { pacientes: {}, citas: {}, configuracion: null };
    const estado = JSON.parse(raw);
    return {
      pacientes: estado.pacientes || {},
      citas: estado.citas || {},
      configuracion: estado.configuracion || null,
    };
  } catch (e) {
    console.warn('No se pudo leer el estado de migración guardado; se asume que no hay nada migrado.', e);
    return { pacientes: {}, citas: {}, configuracion: null };
  }
}

/** Guarda el progreso de la migración (se llama tras cada registro migrado, no solo al final). */
function guardarEstadoMigracion(estado) {
  try {
    localStorage.setItem(
      MIGRACION_STORAGE_KEY,
      JSON.stringify({ ...estado, ultimaCorrida: new Date().toISOString() })
    );
  } catch (e) {
    console.warn('No se pudo guardar el progreso de la migración.', e);
  }
}

/** owner_id (uuid) del usuario con sesión activa, o null si no hay sesión. */
async function supabaseObtenerOwnerId() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session || !data.session.user) return null;
    return data.session.user.id;
  } catch (e) {
    console.warn('supabaseObtenerOwnerId: fallo inesperado.', e);
    return null;
  }
}

/** Migra los pacientes que aún no estén en el mapa `estado.pacientes`. */
async function migrarPacientesASupabase(ownerId, estado) {
  const resultado = { migrados: 0, omitidos: 0, fallidos: 0, errores: [] };
  const pacientes = Store.getPacientes();
  const col = SUPABASE_COLUMNAS.pacientes;

  for (const p of pacientes) {
    if (estado.pacientes[p.id]) {
      resultado.omitidos++;
      continue;
    }
    const nuevoId = generarUUID();
    try {
      const payload = {
        id: nuevoId,
        owner_id: ownerId,
        [col.nombre]: p.nombre || '',
        [col.telefono]: p.telefono || '',
        [col.correo]: p.correo || '',
        [col.notas]: p.notas || '',
      };
      const { error } = await supabaseClient.from(SUPABASE_TABLA_PACIENTES).insert(payload);
      if (error) throw error;
      estado.pacientes[p.id] = nuevoId; // mapa id local -> UUID nuevo en Supabase
      guardarEstadoMigracion(estado);
      resultado.migrados++;
    } catch (e) {
      resultado.fallidos++;
      resultado.errores.push(`Paciente "${p.nombre || p.id}": ${mensajeDeErrorSupabase(e)}`);
      console.warn('migrarPacientesASupabase: fallo con un paciente.', p, e);
    }
  }
  return resultado;
}

/** Migra las citas que aún no estén en el mapa `estado.citas`, conservando el vínculo con su paciente ya migrado. */
async function migrarCitasASupabase(ownerId, estado) {
  const resultado = { migrados: 0, omitidos: 0, fallidos: 0, errores: [] };
  const citas = Store.getCitas();
  const col = SUPABASE_COLUMNAS.citas;

  for (const c of citas) {
    if (estado.citas[c.id]) {
      resultado.omitidos++;
      continue;
    }

    // `paciente_id` es obligatoria (NOT NULL) en Supabase: si el paciente de esta
    // cita no existe localmente o no se pudo migrar, la cita queda como error y
    // NUNCA se inserta con paciente_id en null.
    const pacienteIdSupabase = c.pacienteId ? estado.pacientes[c.pacienteId] : null;
    if (!pacienteIdSupabase) {
      resultado.fallidos++;
      resultado.errores.push(
        `Cita de "${c.paciente || c.id}" no se migró: no tiene un paciente vinculado y migrado con éxito en Supabase (paciente_id es obligatoria).`
      );
      continue;
    }

    const nuevoId = generarUUID();
    try {
      const payload = {
        id: nuevoId,
        owner_id: ownerId,
        [col.pacienteId]: pacienteIdSupabase,
        [col.motivo]: c.motivo || '',
        [col.fecha]: c.fecha,
        [col.hora]: c.hora,
        [col.duracion]: Number(c.duracion || 30),
        [col.estado]: c.estado || 'pendiente',
        [col.recordatorioEstado]: c.recordatorioEstado || 'pendiente',
      };
      const { error } = await supabaseClient.from(SUPABASE_TABLA_CITAS).insert(payload);
      if (error) throw error;
      estado.citas[c.id] = nuevoId;
      guardarEstadoMigracion(estado);
      resultado.migrados++;
    } catch (e) {
      resultado.fallidos++;
      resultado.errores.push(`Cita de "${c.paciente || c.id}": ${mensajeDeErrorSupabase(e)}`);
      console.warn('migrarCitasASupabase: fallo con una cita.', c, e);
    }
  }
  return resultado;
}

/**
 * Migra la configuración. `configuracion` no tiene columna `id` propia: su
 * clave primaria es `owner_id` (una fila por usuario), así que se usa
 * `upsert` con `onConflict: 'owner_id'` — inserta si no existe, y si ya
 * existe una fila para este owner (de esta corrida o de otro navegador)
 * la actualiza en vez de duplicarla.
 */
async function migrarConfiguracionASupabase(ownerId, estado) {
  const col = SUPABASE_COLUMNAS.configuracion;
  if (estado.configuracion) {
    return { migrada: false, omitida: true, error: null };
  }
  try {
    const config = Store.getConfig();
    const payload = {
      owner_id: ownerId, // clave primaria de `configuracion`; no existe columna `id` separada
      [col.nombreConsultorio]: config.nombreConsultorio,
      [col.horaInicio]: config.horaInicio,
      [col.horaFin]: config.horaFin,
      [col.duracionCita]: Number(config.duracionCita),
      [col.recordatoriosActivos]: !!config.recordatoriosActivos,
    };
    const { error } = await supabaseClient
      .from(SUPABASE_TABLA_CONFIGURACION)
      .upsert(payload, { onConflict: 'owner_id' });
    if (error) throw error;
    estado.configuracion = true;
    guardarEstadoMigracion(estado);
    return { migrada: true, omitida: false, error: null };
  } catch (e) {
    console.warn('migrarConfiguracionASupabase: fallo.', e);
    return { migrada: false, omitida: false, error: mensajeDeErrorSupabase(e) };
  }
}

/**
 * Orquesta la migración completa: pacientes → citas (conservando el
 * vínculo con su paciente) → configuración. Es seguro volver a
 * llamarla: lo que ya se migró se omite (ver `leerEstadoMigracion`).
 * No modifica ni borra nada en localStorage salvo la llave de
 * progreso `mediagenda.migracion`.
 */
async function supabaseMigrarDatos() {
  if (typeof supabaseClient === 'undefined') {
    return { ok: false, mensaje: 'El cliente de Supabase no está disponible (revisa js/auth.js).' };
  }

  const ownerId = await supabaseObtenerOwnerId();
  if (!ownerId) {
    return { ok: false, mensaje: 'No hay una sesión activa. Inicia sesión antes de migrar tus datos.' };
  }

  const estado = leerEstadoMigracion();

  const resultadoPacientes = await migrarPacientesASupabase(ownerId, estado);
  const resultadoCitas = await migrarCitasASupabase(ownerId, estado);
  const resultadoConfiguracion = await migrarConfiguracionASupabase(ownerId, estado);

  const huboFallos =
    resultadoPacientes.fallidos > 0 || resultadoCitas.fallidos > 0 || !!resultadoConfiguracion.error;

  return {
    ok: !huboFallos,
    mensaje: huboFallos
      ? 'La migración terminó con algunos errores. Revisa el detalle abajo.'
      : 'Migración completada correctamente.',
    pacientes: resultadoPacientes,
    citas: resultadoCitas,
    configuracion: resultadoConfiguracion,
  };
}
