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
};
