/**
 * MediAgenda IA — Interfaz (prototipo fase 1)
 * ---------------------------------------------------------------
 * Responsabilidad: renderizar el estado (proveído por data.js) y
 * reaccionar a la interacción del usuario. No guarda datos por su
 * cuenta: todo lo persistente pasa por el objeto `Store`.
 * ---------------------------------------------------------------
 */

(function () {
  'use strict';

  const ESTADOS = {
    pendiente: { label: 'Pendiente', badge: 'badge--pendiente' },
    confirmada: { label: 'Confirmada', badge: 'badge--confirmada' },
    atendida: { label: 'Atendida', badge: 'badge--atendida' },
    cancelada: { label: 'Cancelada', badge: 'badge--cancelada' },
  };

  // ---------- Referencias DOM ----------
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const menuToggle = document.getElementById('menuToggle');
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const viewLinks = document.querySelectorAll('[data-view-link]');
  const viewPanels = document.querySelectorAll('[data-view-panel]');

  const clinicNameHeading = document.getElementById('clinicNameHeading');
  const sidebarClinicName = document.getElementById('sidebarClinicName');
  const clinicInitial = document.getElementById('clinicInitial');
  const todayLabel = document.getElementById('todayLabel');

  const statHoy = document.getElementById('statHoy');
  const statPendientes = document.getElementById('statPendientes');
  const statConfirmadas = document.getElementById('statConfirmadas');
  const statProxima = document.getElementById('statProxima');
  const statProximaSub = document.getElementById('statProximaSub');

  const upcomingList = document.getElementById('upcomingList');
  const activityList = document.getElementById('activityList');
  const miniPend = document.getElementById('miniPend');
  const miniConf = document.getElementById('miniConf');
  const miniDone = document.getElementById('miniDone');
  const miniCanc = document.getElementById('miniCanc');

  const btnNuevaCitaTop = document.getElementById('btnNuevaCitaTop');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const btnCancelarCita = document.getElementById('btnCancelarCita');
  const formCita = document.getElementById('formCita');
  const citaError = document.getElementById('citaError');
  const citaIdInput = document.getElementById('citaId');
  const citaPacienteSelect = document.getElementById('citaPacienteId');
  const citaPacienteHint = document.getElementById('citaPacienteHint');
  const citaHoraInput = document.getElementById('citaHora');
  const citaDuracionHint = document.getElementById('citaDuracionHint');
  const modalTitle = document.getElementById('modalTitle');
  const btnGuardarCita = document.getElementById('btnGuardarCita');
  const btnEliminarCita = document.getElementById('btnEliminarCita');

  const formConfig = document.getElementById('formConfig');
  const configSavedNote = document.getElementById('configSavedNote');

  const toast = document.getElementById('toast');

  // ---------- Agenda: referencias DOM ----------
  const agendaPrev = document.getElementById('agendaPrev');
  const agendaNext = document.getElementById('agendaNext');
  const agendaHoyBtn = document.getElementById('agendaHoy');
  const agendaDatePicker = document.getElementById('agendaDatePicker');
  const agendaViewToggleBtns = document.querySelectorAll('[data-agenda-view]');
  const btnNuevaCitaAgenda = document.getElementById('btnNuevaCitaAgenda');
  const agendaSearchInput = document.getElementById('agendaSearch');
  const agendaFilterChips = document.querySelectorAll('#agendaFilterChips .chip');
  const agendaCount = document.getElementById('agendaCount');
  const agendaHeading = document.getElementById('agendaHeading');
  const agendaContent = document.getElementById('agendaContent');

  // ---------- Modal detalle (ver) ----------
  const modalDetalleBackdrop = document.getElementById('modalDetalleBackdrop');
  const detalleClose = document.getElementById('detalleClose');
  const detalleBody = document.getElementById('detalleBody');
  const btnDetalleCerrar = document.getElementById('btnDetalleCerrar');
  const btnDetalleEditar = document.getElementById('btnDetalleEditar');

  // ---------- Modal confirmar eliminación (genérico: citas y pacientes) ----------
  const modalConfirmBackdrop = document.getElementById('modalConfirmBackdrop');
  const confirmClose = document.getElementById('confirmClose');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  // ---------- Pacientes: referencias DOM ----------
  const pacienteSearchInput = document.getElementById('pacienteSearch');
  const pacienteCount = document.getElementById('pacienteCount');
  const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
  const pacienteList = document.getElementById('pacienteList');

  const modalPacienteBackdrop = document.getElementById('modalPacienteBackdrop');
  const pacienteModalClose = document.getElementById('pacienteModalClose');
  const pacienteModalTitle = document.getElementById('pacienteModalTitle');
  const btnCancelarPaciente = document.getElementById('btnCancelarPaciente');
  const formPaciente = document.getElementById('formPaciente');
  const pacienteError = document.getElementById('pacienteError');
  const pacienteIdInput = document.getElementById('pacienteId');
  const btnGuardarPaciente = document.getElementById('btnGuardarPaciente');
  const btnEliminarPaciente = document.getElementById('btnEliminarPaciente');

  const modalPacienteDetalleBackdrop = document.getElementById('modalPacienteDetalleBackdrop');
  const pacienteDetalleClose = document.getElementById('pacienteDetalleClose');
  const pacienteDetalleBody = document.getElementById('pacienteDetalleBody');
  const pacienteHistorialList = document.getElementById('pacienteHistorialList');
  const btnPacienteDetalleCerrar = document.getElementById('btnPacienteDetalleCerrar');
  const btnPacienteDetalleEditar = document.getElementById('btnPacienteDetalleEditar');

  // ---------- Recordatorios: referencias DOM ----------
  const recordatorioFilterChips = document.querySelectorAll('#recordatorioFilterChips .chip');
  const recordatorioCount = document.getElementById('recordatorioCount');
  const recordatorioList = document.getElementById('recordatorioList');

  // Estado interno del módulo Agenda (no persiste; se reconstruye en cada carga)
  const agendaState = {
    view: 'dia',        // 'dia' | 'semana'
    date: null,          // fecha ancla (ISO), se fija en init()
    filter: 'todas',     // 'todas' | 'pendiente' | 'confirmada' | 'atendida' | 'cancelada'
    search: '',
  };
  let pendingDeleteId = null;
  let pendingDeleteType = 'cita'; // 'cita' | 'paciente' — decide qué borra el modal de confirmación genérico

  // Estado interno del módulo Pacientes
  const pacienteState = { search: '' };

  // Estado interno del módulo Recordatorios
  const recordatorioState = { filter: 'todos' }; // 'todos' | 'pendiente' | 'enviado' | 'descartado'

  // Catálogo de estados de RECORDATORIO (distinto del catálogo ESTADOS de arriba, que es de la CITA).
  const RECORDATORIO_ESTADOS = {
    pendiente: { label: 'Pendiente', badge: 'badge--pendiente' },
    enviado: { label: 'Enviado', badge: 'badge--enviado' },
    descartado: { label: 'Descartado', badge: 'badge--descartado' },
  };

  // ---------- Utilidades ----------
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatTodayLabel() {
    const d = new Date();
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function formatFechaCorta(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const hoy = todayISO();
    if (fechaISO === hoy) return 'Hoy';
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    if (fechaISO === manana.toISOString().slice(0, 10)) return 'Mañana';
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

  function formatHora12(hora24) {
    const [h, m] = hora24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function initials(name) {
    return name.trim().charAt(0).toUpperCase() || 'C';
  }

  /** Suma (o resta) días a una fecha ISO "YYYY-MM-DD" y regresa otra fecha ISO. */
  function addDays(fechaISO, delta) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /** Lunes de la semana que contiene fechaISO. */
  function getWeekStart(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dow = date.getDay(); // 0=domingo..6=sábado
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    return addDays(fechaISO, diffToMonday);
  }

  function formatFechaLarga(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function formatDiaSemanaCorto(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');
  }

  // ---------- Navegación entre módulos ----------
  function setActiveView(view) {
    navItems.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.view === view));
    viewPanels.forEach((panel) => {
      panel.hidden = panel.dataset.viewPanel !== view;
    });
    if (view === 'dashboard') renderDashboard();
    if (view === 'agenda') renderAgenda();
    if (view === 'pacientes') renderPacientes();
    if (view === 'recordatorios') renderRecordatorios();
    closeMobileSidebar();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /** Refresca todas las vistas que dependen de las citas/pacientes guardados. */
  function refreshAll() {
    renderDashboard();
    renderAgenda();
    renderPacientes();
    renderRecordatorios();
  }

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => setActiveView(btn.dataset.view));
  });
  viewLinks.forEach((btn) => {
    btn.addEventListener('click', () => setActiveView(btn.dataset.viewLink));
  });

  function openMobileSidebar() {
    sidebar.classList.add('is-open');
    sidebarBackdrop.classList.add('is-visible');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileSidebar() {
    sidebar.classList.remove('is-open');
    sidebarBackdrop.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? closeMobileSidebar() : openMobileSidebar();
  });
  sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // ---------- Render: encabezado / config ----------
  function renderClinicHeader() {
    const cfg = Store.getConfig();
    clinicNameHeading.textContent = cfg.nombreConsultorio;
    sidebarClinicName.textContent = cfg.nombreConsultorio;
    clinicInitial.textContent = initials(cfg.nombreConsultorio);
    todayLabel.textContent = formatTodayLabel();

    document.getElementById('cfgNombre').value = cfg.nombreConsultorio;
    document.getElementById('cfgInicio').value = cfg.horaInicio;
    document.getElementById('cfgFin').value = cfg.horaFin;
    document.getElementById('cfgDuracion').value = String(cfg.duracionCita);
    document.getElementById('cfgRecordatorios').checked = !!cfg.recordatoriosActivos;
  }

  // ---------- Render: Dashboard ----------
  function renderDashboard() {
    const citas = Store.getCitas();
    const hoy = todayISO();

    const citasHoy = citas.filter((c) => c.fecha === hoy);
    const pendientes = citas.filter((c) => c.estado === 'pendiente');
    const confirmadas = citas.filter((c) => c.estado === 'confirmada');

    statHoy.textContent = citasHoy.length;
    statPendientes.textContent = pendientes.length;
    statConfirmadas.textContent = confirmadas.length;

    // Próxima cita: primera cita futura (hoy en adelante) que no esté cancelada,
    // ordenada por fecha y hora.
    const proxima = citas
      .filter((c) => c.estado !== 'cancelada' && c.estado !== 'atendida')
      .filter((c) => `${c.fecha}T${c.hora}` >= `${hoy}T00:00`)
      .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`))[0];

    if (proxima) {
      statProxima.textContent = proxima.paciente;
      statProximaSub.textContent = `${formatFechaCorta(proxima.fecha)} · ${formatHora12(proxima.hora)}`;
    } else {
      statProxima.textContent = 'Sin citas próximas';
      statProximaSub.textContent = '';
    }

    // Lista de próximas citas (hasta 6), ordenadas cronológicamente.
    const upcoming = citas
      .filter((c) => `${c.fecha}T${c.hora}` >= `${hoy}T00:00`)
      .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`))
      .slice(0, 6);

    renderAppointmentList(upcomingList, upcoming, true);

    // Resumen de actividad (mini contadores)
    miniPend.textContent = citas.filter((c) => c.estado === 'pendiente').length;
    miniConf.textContent = citas.filter((c) => c.estado === 'confirmada').length;
    miniDone.textContent = citas.filter((c) => c.estado === 'atendida').length;
    miniCanc.textContent = citas.filter((c) => c.estado === 'cancelada').length;

    renderActivity(citas);
  }

  function renderAppointmentList(container, citas, showDate) {
    container.innerHTML = '';
    if (!citas.length) {
      const empty = document.createElement('p');
      empty.className = 'appt-empty';
      empty.textContent = 'No hay citas para mostrar todavía.';
      container.appendChild(empty);
      return;
    }
    citas.forEach((c) => {
      const row = document.createElement('div');
      row.className = 'appt-row';
      const est = ESTADOS[c.estado] || ESTADOS.pendiente;
      row.innerHTML = `
        <div class="appt-time">
          ${showDate ? `<small>${formatFechaCorta(c.fecha)}</small>` : ''}
          ${formatHora12(c.hora)}
        </div>
        <div class="appt-divider"></div>
        <div class="appt-info">
          <div class="appt-name">${escapeHtml(c.paciente)}</div>
          <div class="appt-reason">${escapeHtml(c.motivo || 'Consulta general')}</div>
        </div>
        <span class="appt-badge ${est.badge}">${est.label}</span>
      `;
      container.appendChild(row);
    });
  }

  function renderActivity(citas) {
    activityList.innerHTML = '';
    const sorted = citas.slice().sort((a, b) => `${b.fecha}T${b.hora}`.localeCompare(`${a.fecha}T${a.hora}`)).slice(0, 5);

    if (!sorted.length) {
      activityList.innerHTML = '<li>Aún no hay actividad registrada.</li>';
      return;
    }

    const dotClass = { pendiente: 'dot--pending', confirmada: 'dot--confirmed', atendida: 'dot--done', cancelada: 'dot--cancelled' };
    const verbo = { pendiente: 'se registró como pendiente', confirmada: 'fue confirmada', atendida: 'fue atendida', cancelada: 'fue cancelada' };

    sorted.forEach((c) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="dot ${dotClass[c.estado]}"></span>
        <span>La cita de <strong>${escapeHtml(c.paciente)}</strong> ${verbo[c.estado]} — ${formatFechaCorta(c.fecha)}, ${formatHora12(c.hora)}.</span>
      `;
      activityList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Modal: nueva cita / editar cita ----------
  /**
   * Abre el modal de cita. Sin argumento: modo "Nueva cita".
   * Con una cita existente: modo "Editar cita" (precarga los campos).
   */
  function openCitaModal(cita, defaultDate) {
    formCita.reset();
    citaError.textContent = '';
    populatePacienteSelect();

    if (cita) {
      modalTitle.textContent = 'Editar cita';
      btnGuardarCita.textContent = 'Guardar cambios';
      btnEliminarCita.hidden = false;
      citaIdInput.value = cita.id;
      document.getElementById('citaFecha').removeAttribute('min'); // permitir conservar la fecha original al editar
      citaPacienteSelect.value = cita.pacienteId || '';
      document.getElementById('citaFecha').value = cita.fecha;
      document.getElementById('citaHora').value = cita.hora;
      document.getElementById('citaMotivo').value = cita.motivo || '';
      document.getElementById('citaEstado').value = cita.estado;
    } else {
      modalTitle.textContent = 'Nueva cita';
      btnGuardarCita.textContent = 'Guardar cita';
      btnEliminarCita.hidden = true;
      citaIdInput.value = '';
      document.getElementById('citaFecha').min = todayISO();
      document.getElementById('citaFecha').value = defaultDate || todayISO();
      document.getElementById('citaEstado').value = 'pendiente';
    }

    updateDuracionHint();
    modalBackdrop.hidden = false;
    citaPacienteSelect.focus();
  }
  function closeModal() {
    modalBackdrop.hidden = true;
  }

  /** Llena el <select> de pacientes con los ya dados de alta, ordenados por nombre. */
  function populatePacienteSelect() {
    const pacientes = Store.getPacientes().slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
    citaPacienteSelect.innerHTML = '';
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = 'Selecciona un paciente…';
    citaPacienteSelect.appendChild(optDefault);
    pacientes.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nombre;
      citaPacienteSelect.appendChild(opt);
    });
    citaPacienteHint.textContent = pacientes.length
      ? ''
      : 'No hay pacientes dados de alta todavía — créalos primero desde el módulo Pacientes.';
  }

  function updateDuracionHint() {
    const cfg = Store.getConfig();
    const hora = citaHoraInput.value;
    if (hora) {
      citaDuracionHint.textContent = `Duración: ${cfg.duracionCita} min · hora de fin estimada ${formatHora12(calcularHoraFin(hora, cfg.duracionCita))}.`;
    } else {
      citaDuracionHint.textContent = `Duración predeterminada del consultorio: ${cfg.duracionCita} min.`;
    }
  }
  citaHoraInput.addEventListener('input', updateDuracionHint);

  btnNuevaCitaTop.addEventListener('click', () => openCitaModal(null));
  modalClose.addEventListener('click', closeModal);
  btnCancelarCita.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modalBackdrop.hidden) closeModal();
    if (!modalDetalleBackdrop.hidden) closeDetalleModal();
    if (!modalConfirmBackdrop.hidden) closeConfirmModal();
    if (!modalPacienteBackdrop.hidden) closePacienteModal();
    if (!modalPacienteDetalleBackdrop.hidden) closePacienteDetalleModal();
  });

  formCita.addEventListener('submit', (e) => {
    e.preventDefault();
    citaError.textContent = '';

    const editingId = citaIdInput.value || null;
    const pacienteId = citaPacienteSelect.value;
    const fecha = document.getElementById('citaFecha').value;
    const hora = document.getElementById('citaHora').value;
    const motivo = document.getElementById('citaMotivo').value.trim();
    const estado = document.getElementById('citaEstado').value;

    if (!pacienteId || !fecha || !hora) {
      citaError.textContent = 'Selecciona un paciente, fecha y hora para continuar.';
      return;
    }
    const pacienteSeleccionado = Store.getPacienteById(pacienteId);
    if (!pacienteSeleccionado) {
      citaError.textContent = 'El paciente seleccionado ya no existe. Elige otro.';
      return;
    }
    const paciente = pacienteSeleccionado.nombre;

    const cfg = Store.getConfig();
    if (hora < cfg.horaInicio || timeToMinutes(hora) + Number(cfg.duracionCita) > timeToMinutes(cfg.horaFin)) {
      citaError.textContent = `Con la duración configurada (${cfg.duracionCita} min), la cita debe caber entre ${cfg.horaInicio} y ${cfg.horaFin}.`;
      return;
    }

    if (Store.hasConflict(fecha, hora, cfg.duracionCita, editingId)) {
      citaError.textContent = 'Ese horario se traslapa con otra cita activa. Elige otra hora.';
      return;
    }

    if (editingId) {
      Store.updateCita(editingId, { pacienteId, paciente, motivo, fecha, hora, estado, duracion: cfg.duracionCita });
      showToast('Cita actualizada correctamente.');
    } else {
      Store.addCita({
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now(),
        pacienteId,
        paciente,
        motivo,
        fecha,
        hora,
        estado,
        duracion: cfg.duracionCita,
      });
      showToast('Cita guardada correctamente.');
    }

    closeModal();
    refreshAll();
  });

  btnEliminarCita.addEventListener('click', () => {
    const id = citaIdInput.value;
    if (!id) return;
    closeModal();
    openConfirmDelete(id);
  });

  // ---------- Modal: ver detalle (solo lectura) ----------
  function openDetalleModal(cita) {
    const est = ESTADOS[cita.estado] || ESTADOS.pendiente;
    const finCalculado = calcularHoraFin(cita.hora, cita.duracion || 30);
    detalleBody.innerHTML = `
      <dt>Paciente</dt><dd>${escapeHtml(cita.paciente)}</dd>
      <dt>Fecha</dt><dd>${formatFechaLarga(cita.fecha)}</dd>
      <dt>Horario</dt><dd>${formatHora12(cita.hora)} – ${formatHora12(finCalculado)}</dd>
      <dt>Motivo</dt><dd>${escapeHtml(cita.motivo || 'Consulta general')}</dd>
      <dt>Estado</dt><dd><span class="appt-badge ${est.badge}">${est.label}</span></dd>
    `;
    btnDetalleEditar.dataset.id = cita.id;
    modalDetalleBackdrop.hidden = false;
  }
  function closeDetalleModal() {
    modalDetalleBackdrop.hidden = true;
  }
  detalleClose.addEventListener('click', closeDetalleModal);
  btnDetalleCerrar.addEventListener('click', closeDetalleModal);
  modalDetalleBackdrop.addEventListener('click', (e) => {
    if (e.target === modalDetalleBackdrop) closeDetalleModal();
  });
  btnDetalleEditar.addEventListener('click', () => {
    const cita = Store.getCitaById(btnDetalleEditar.dataset.id);
    closeDetalleModal();
    if (cita) openCitaModal(cita);
  });

  // ---------- Modal: confirmar eliminación (genérico) ----------
  /** type: 'cita' | 'paciente' */
  function openConfirmDelete(id, type) {
    type = type || 'cita';
    pendingDeleteId = id;
    pendingDeleteType = type;
    if (type === 'paciente') {
      const paciente = Store.getPacienteById(id);
      document.getElementById('confirmTitle').textContent = 'Eliminar paciente';
      document.getElementById('confirmText').textContent = paciente
        ? `¿Seguro que deseas eliminar a ${paciente.nombre}? Esta acción no se puede deshacer. (Un paciente con citas registradas no se puede eliminar.)`
        : '¿Seguro que deseas eliminar este paciente? Esta acción no se puede deshacer.';
      btnConfirmDelete.textContent = 'Eliminar paciente';
    } else {
      const cita = Store.getCitaById(id);
      document.getElementById('confirmTitle').textContent = 'Eliminar cita';
      document.getElementById('confirmText').textContent = cita
        ? `¿Seguro que deseas eliminar la cita de ${cita.paciente}? Esta acción no se puede deshacer.`
        : '¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer.';
      btnConfirmDelete.textContent = 'Eliminar cita';
    }
    modalConfirmBackdrop.hidden = false;
  }
  function closeConfirmModal() {
    modalConfirmBackdrop.hidden = true;
    pendingDeleteId = null;
  }
  confirmClose.addEventListener('click', closeConfirmModal);
  btnConfirmCancel.addEventListener('click', closeConfirmModal);
  modalConfirmBackdrop.addEventListener('click', (e) => {
    if (e.target === modalConfirmBackdrop) closeConfirmModal();
  });
  btnConfirmDelete.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    if (pendingDeleteType === 'paciente') {
      const resultado = Store.deletePaciente(pendingDeleteId); // null si tiene citas relacionadas (validado dentro del Store)
      closeConfirmModal();
      if (resultado === null) {
        showToast('No se puede eliminar: el paciente tiene citas relacionadas.');
      } else {
        refreshAll();
        showToast('Paciente eliminado.');
      }
    } else {
      Store.deleteCita(pendingDeleteId);
      closeConfirmModal();
      refreshAll();
      showToast('Cita eliminada.');
    }
  });

  // =================================================================
  // ---------- Módulo AGENDA ----------
  // =================================================================

  function getFilteredCitas(citas) {
    const term = agendaState.search.trim().toLowerCase();
    return citas.filter((c) => {
      if (agendaState.filter !== 'todas' && c.estado !== agendaState.filter) return false;
      if (term && !c.paciente.toLowerCase().includes(term)) return false;
      return true;
    });
  }

  /** Genera las franjas horarias del día según el horario y duración configurados. */
  function generateSlots(cfg) {
    const slots = [];
    const inicioMin = timeToMinutes(cfg.horaInicio);
    const finMin = timeToMinutes(cfg.horaFin);
    const paso = Math.max(Number(cfg.duracionCita) || 30, 5);
    for (let t = inicioMin; t < finMin; t += paso) {
      slots.push(minutesToTime(t));
    }
    return slots;
  }

  function buildCitaCard(cita) {
    const est = ESTADOS[cita.estado] || ESTADOS.pendiente;
    const finCalculado = calcularHoraFin(cita.hora, cita.duracion || 30);
    const card = document.createElement('div');
    card.className = 'cita-card';
    card.dataset.estado = cita.estado;
    card.innerHTML = `
      <div class="cita-card-top">
        <div class="cita-card-time">${formatHora12(cita.hora)}–${formatHora12(finCalculado)}</div>
        <div class="cita-card-main">
          <div class="cita-card-name">${escapeHtml(cita.paciente)}</div>
          <div class="cita-card-reason">${escapeHtml(cita.motivo || 'Consulta general')}</div>
        </div>
      </div>
      <div class="cita-card-actions">
        <button type="button" class="cita-action-btn" data-action="ver" data-id="${cita.id}">Ver</button>
        <button type="button" class="cita-action-btn" data-action="editar" data-id="${cita.id}">Editar</button>
        <button type="button" class="cita-action-btn cita-action-btn--danger" data-action="eliminar" data-id="${cita.id}">Eliminar</button>
        <select class="cita-status-select" data-action="estado" data-id="${cita.id}">
          <option value="pendiente" ${cita.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="confirmada" ${cita.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
          <option value="atendida" ${cita.estado === 'atendida' ? 'selected' : ''}>Atendida</option>
          <option value="cancelada" ${cita.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
        </select>
      </div>
    `;
    // aria-label se asigna vía DOM (no interpolado en el HTML) para que un nombre
    // de paciente con comillas no pueda romper el atributo ni inyectar marcado.
    card.querySelector('.cita-status-select').setAttribute('aria-label', `Cambiar estado de ${cita.paciente}`);
    return card;
  }

  function renderAgendaDia() {
    const cfg = Store.getConfig();
    const todas = Store.getCitas().filter((c) => c.fecha === agendaState.date);
    const visibles = getFilteredCitas(todas).sort((a, b) => a.hora.localeCompare(b.hora));
    const slots = generateSlots(cfg);

    agendaContent.innerHTML = '';
    agendaContent.className = 'agenda-content';

    if (!slots.length) {
      agendaContent.innerHTML = '<p class="appt-empty">El horario de atención configurado no genera franjas válidas. Revisa Configuración.</p>';
      agendaCount.textContent = '0 citas';
      return;
    }

    slots.forEach((slotStart) => {
      const slotEnd = slotStart === slots[slots.length - 1]
        ? timeToMinutes(cfg.horaFin)
        : timeToMinutes(slotStart) + (Math.max(Number(cfg.duracionCita) || 30, 5));

      // Las citas canceladas no bloquean horario, así que no cuentan como "ocupante" de la franja.
      const ocupante = visibles.find((c) => {
        if (c.estado === 'cancelada') return false;
        const inicio = timeToMinutes(c.hora);
        const fin = inicio + (c.duracion || 30);
        return timeToMinutes(slotStart) < fin && inicio < slotEnd;
      });

      const row = document.createElement('div');
      row.className = 'slot-row';

      const timeLabel = document.createElement('div');
      timeLabel.className = 'slot-time';
      timeLabel.textContent = formatHora12(slotStart);
      row.appendChild(timeLabel);

      const body = document.createElement('div');
      body.className = 'slot-body';

      if (!ocupante) {
        body.innerHTML = '<div class="slot-free">Disponible</div>';
      } else if (ocupante.hora === slotStart) {
        body.appendChild(buildCitaCard(ocupante));
      } else {
        body.innerHTML = `<div class="slot-continuation">Ocupado — continúa cita de ${escapeHtml(ocupante.paciente)}</div>`;
      }

      row.appendChild(body);
      agendaContent.appendChild(row);
    });

    agendaCount.textContent = `${visibles.length} ${visibles.length === 1 ? 'cita' : 'citas'}`;
  }

  function renderAgendaSemana() {
    const weekStart = getWeekStart(agendaState.date);
    const hoy = todayISO();
    const dias = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    agendaContent.innerHTML = '';
    agendaContent.className = 'agenda-content';

    const grid = document.createElement('div');
    grid.className = 'week-grid';

    let totalVisible = 0;

    dias.forEach((fecha) => {
      const citasDia = getFilteredCitas(Store.getCitas().filter((c) => c.fecha === fecha)).sort((a, b) => a.hora.localeCompare(b.hora));
      totalVisible += citasDia.length;

      const col = document.createElement('div');
      col.className = 'week-day' + (fecha === hoy ? ' is-today' : '');

      const [, , d] = fecha.split('-');
      col.innerHTML = `
        <div class="week-day-head">
          <span class="week-day-name">${formatDiaSemanaCorto(fecha)}</span>
          <span class="week-day-num">${Number(d)}</span>
        </div>
      `;

      if (!citasDia.length) {
        const empty = document.createElement('p');
        empty.className = 'week-empty';
        empty.textContent = 'Sin citas';
        col.appendChild(empty);
      } else {
        citasDia.forEach((c) => {
          const mini = document.createElement('button');
          mini.type = 'button';
          mini.className = 'week-mini';
          mini.dataset.estado = c.estado;
          mini.dataset.action = 'ver';
          mini.dataset.id = c.id;
          mini.innerHTML = `
            <span class="week-mini-time">${formatHora12(c.hora)}</span>
            <span class="week-mini-name">${escapeHtml(c.paciente)}</span>
          `;
          // El nombre puede truncarse visualmente (ellipsis); el title muestra el nombre completo al pasar el cursor.
          // Se asigna vía DOM (no interpolado en el HTML) para que un nombre con comillas no rompa el atributo.
          mini.querySelector('.week-mini-name').setAttribute('title', c.paciente);
          col.appendChild(mini);
        });
      }

      grid.appendChild(col);
    });

    agendaContent.appendChild(grid);
    agendaCount.textContent = `${totalVisible} ${totalVisible === 1 ? 'cita' : 'citas'}`;
  }

  function renderAgenda() {
    agendaDatePicker.value = agendaState.date;

    if (agendaState.view === 'dia') {
      agendaHeading.textContent = formatFechaLarga(agendaState.date);
      renderAgendaDia();
    } else {
      const weekStart = getWeekStart(agendaState.date);
      const weekEnd = addDays(weekStart, 6);
      const [ys, ms, ds] = weekStart.split('-').map(Number);
      const [ye, me, de] = weekEnd.split('-').map(Number);
      const inicioLbl = new Date(ys, ms - 1, ds).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      const finLbl = new Date(ye, me - 1, de).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      agendaHeading.textContent = `Semana del ${inicioLbl} al ${finLbl}`;
      renderAgendaSemana();
    }
  }

  // ---------- Agenda: eventos de la barra de herramientas ----------
  agendaPrev.addEventListener('click', () => {
    agendaState.date = addDays(agendaState.date, agendaState.view === 'dia' ? -1 : -7);
    renderAgenda();
  });
  agendaNext.addEventListener('click', () => {
    agendaState.date = addDays(agendaState.date, agendaState.view === 'dia' ? 1 : 7);
    renderAgenda();
  });
  agendaHoyBtn.addEventListener('click', () => {
    agendaState.date = todayISO();
    renderAgenda();
  });
  agendaDatePicker.addEventListener('change', () => {
    if (agendaDatePicker.value) {
      agendaState.date = agendaDatePicker.value;
      renderAgenda();
    }
  });
  agendaViewToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      agendaState.view = btn.dataset.agendaView;
      agendaViewToggleBtns.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      renderAgenda();
    });
  });
  btnNuevaCitaAgenda.addEventListener('click', () => openCitaModal(null, agendaState.date));
  agendaSearchInput.addEventListener('input', () => {
    agendaState.search = agendaSearchInput.value;
    renderAgenda();
  });
  agendaFilterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      agendaState.filter = chip.dataset.filter;
      agendaFilterChips.forEach((c) => c.classList.toggle('is-active', c === chip));
      renderAgenda();
    });
  });

  // Delegación de eventos para las acciones dentro de las tarjetas de cita
  agendaContent.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const { action, id } = target.dataset;
    if (!id) return;
    const cita = Store.getCitaById(id);
    if (!cita) return;

    if (action === 'ver') openDetalleModal(cita);
    if (action === 'editar') openCitaModal(cita);
    if (action === 'eliminar') openConfirmDelete(id);
  });

  agendaContent.addEventListener('change', (e) => {
    const target = e.target.closest('[data-action="estado"]');
    if (!target) return;
    const nuevoEstado = target.value;
    const cita = Store.getCitaById(target.dataset.id);
    if (!cita) return;

    if (cita.estado === 'cancelada' && nuevoEstado !== 'cancelada') {
      if (Store.hasConflict(cita.fecha, cita.hora, cita.duracion, cita.id)) {
        target.value = cita.estado; // revertir el <select> visualmente
        showToast('No se puede reactivar: ese horario ya está ocupado por otra cita.');
        return;
      }
    }

    Store.updateCita(target.dataset.id, { estado: nuevoEstado });
    refreshAll();
    showToast(`Estado actualizado a "${ESTADOS[nuevoEstado].label}".`);
  });

  // =================================================================
  // ---------- Módulo PACIENTES ----------
  // =================================================================

  function renderPacientes() {
    const term = pacienteState.search.trim().toLowerCase();
    const todos = Store.getPacientes();
    const visibles = todos
      .filter((p) => !term || p.nombre.toLowerCase().includes(term))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    pacienteCount.textContent = `${visibles.length} ${visibles.length === 1 ? 'paciente' : 'pacientes'}`;
    pacienteList.innerHTML = '';

    if (!visibles.length) {
      const empty = document.createElement('p');
      empty.className = 'appt-empty';
      empty.textContent = todos.length ? 'No hay pacientes que coincidan con la búsqueda.' : 'Aún no has dado de alta ningún paciente.';
      pacienteList.appendChild(empty);
      return;
    }

    visibles.forEach((p) => {
      const totalCitas = Store.getCitasByPacienteId(p.id).length;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'paciente-card';
      card.dataset.id = p.id;
      const contacto = [p.telefono, p.correo].filter(Boolean).join(' · ') || 'Sin datos de contacto';
      card.innerHTML = `
        <span class="paciente-card-name">${escapeHtml(p.nombre)}</span>
        <span class="paciente-card-contact">${escapeHtml(contacto)}</span>
        <span class="paciente-card-count">${totalCitas} ${totalCitas === 1 ? 'cita' : 'citas'} registradas</span>
      `;
      pacienteList.appendChild(card);
    });
  }

  pacienteSearchInput.addEventListener('input', () => {
    pacienteState.search = pacienteSearchInput.value;
    renderPacientes();
  });

  pacienteList.addEventListener('click', (e) => {
    const card = e.target.closest('.paciente-card');
    if (!card) return;
    const paciente = Store.getPacienteById(card.dataset.id);
    if (paciente) openPacienteDetalleModal(paciente);
  });

  // ---------- Modal: nuevo paciente / editar paciente ----------
  function openPacienteModal(paciente) {
    formPaciente.reset();
    pacienteError.textContent = '';

    if (paciente) {
      pacienteModalTitle.textContent = 'Editar paciente';
      btnGuardarPaciente.textContent = 'Guardar cambios';
      btnEliminarPaciente.hidden = false;
      pacienteIdInput.value = paciente.id;
      document.getElementById('pacienteNombre').value = paciente.nombre;
      document.getElementById('pacienteTelefono').value = paciente.telefono || '';
      document.getElementById('pacienteCorreo').value = paciente.correo || '';
      document.getElementById('pacienteNotas').value = paciente.notas || '';
    } else {
      pacienteModalTitle.textContent = 'Nuevo paciente';
      btnGuardarPaciente.textContent = 'Guardar paciente';
      btnEliminarPaciente.hidden = true;
      pacienteIdInput.value = '';
    }

    modalPacienteBackdrop.hidden = false;
    document.getElementById('pacienteNombre').focus();
  }
  function closePacienteModal() {
    modalPacienteBackdrop.hidden = true;
  }

  btnNuevoPaciente.addEventListener('click', () => openPacienteModal(null));
  pacienteModalClose.addEventListener('click', closePacienteModal);
  btnCancelarPaciente.addEventListener('click', closePacienteModal);
  modalPacienteBackdrop.addEventListener('click', (e) => {
    if (e.target === modalPacienteBackdrop) closePacienteModal();
  });

  formPaciente.addEventListener('submit', (e) => {
    e.preventDefault();
    pacienteError.textContent = '';

    const editingId = pacienteIdInput.value || null;
    const nombre = document.getElementById('pacienteNombre').value.trim();
    const telefono = document.getElementById('pacienteTelefono').value.trim();
    const correo = document.getElementById('pacienteCorreo').value.trim();
    const notas = document.getElementById('pacienteNotas').value.trim();

    if (!nombre) {
      pacienteError.textContent = 'El nombre del paciente es obligatorio.';
      return;
    }

    if (editingId) {
      const actualizado = Store.updatePaciente(editingId, { nombre, telefono, correo, notas });
      // Si el nombre cambió, sincronizar el texto denormalizado en sus citas ya guardadas.
      if (actualizado) {
        const citas = Store.getCitas().map((c) => (c.pacienteId === editingId ? { ...c, paciente: nombre } : c));
        Store.saveCitas(citas);
      }
      showToast('Paciente actualizado correctamente.');
    } else {
      Store.addPaciente({
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now(),
        nombre,
        telefono,
        correo,
        notas,
      });
      showToast('Paciente guardado correctamente.');
    }

    closePacienteModal();
    refreshAll();
  });

  btnEliminarPaciente.addEventListener('click', () => {
    const id = pacienteIdInput.value;
    if (!id) return;
    const citasRelacionadas = Store.getCitasByPacienteId(id);
    if (citasRelacionadas.length > 0) {
      pacienteError.textContent = `No se puede eliminar: este paciente tiene ${citasRelacionadas.length} ${citasRelacionadas.length === 1 ? 'cita registrada' : 'citas registradas'}. Elimina o reasigna esas citas primero.`;
      return;
    }
    closePacienteModal();
    openConfirmDelete(id, 'paciente');
  });

  // ---------- Modal: detalle de paciente + historial ----------
  function openPacienteDetalleModal(paciente) {
    pacienteDetalleBody.innerHTML = `
      <dt>Nombre</dt><dd>${escapeHtml(paciente.nombre)}</dd>
      <dt>Teléfono</dt><dd>${escapeHtml(paciente.telefono || '—')}</dd>
      <dt>Correo</dt><dd>${escapeHtml(paciente.correo || '—')}</dd>
      <dt>Notas</dt><dd>${escapeHtml(paciente.notas || '—')}</dd>
    `;
    btnPacienteDetalleEditar.dataset.id = paciente.id;
    const historial = Store.getCitasByPacienteId(paciente.id);
    renderAppointmentList(pacienteHistorialList, historial, true);
    modalPacienteDetalleBackdrop.hidden = false;
  }
  function closePacienteDetalleModal() {
    modalPacienteDetalleBackdrop.hidden = true;
  }
  pacienteDetalleClose.addEventListener('click', closePacienteDetalleModal);
  btnPacienteDetalleCerrar.addEventListener('click', closePacienteDetalleModal);
  modalPacienteDetalleBackdrop.addEventListener('click', (e) => {
    if (e.target === modalPacienteDetalleBackdrop) closePacienteDetalleModal();
  });
  btnPacienteDetalleEditar.addEventListener('click', () => {
    const paciente = Store.getPacienteById(btnPacienteDetalleEditar.dataset.id);
    closePacienteDetalleModal();
    if (paciente) openPacienteModal(paciente);
  });

  // =================================================================
  // ---------- Módulo RECORDATORIOS ----------
  // =================================================================
  // No envía nada real (WhatsApp/correo/SMS): solo permite marcar y
  // filtrar el estado de aviso de cada cita, como preparación para una
  // futura integración con un proveedor autorizado.

  function buildRecordatorioCard(cita) {
    const estadoCita = ESTADOS[cita.estado] || ESTADOS.pendiente;
    const estadoRecordatorio = RECORDATORIO_ESTADOS[cita.recordatorioEstado] || RECORDATORIO_ESTADOS.pendiente;

    const card = document.createElement('div');
    card.className = 'cita-card';
    card.dataset.estado = cita.estado; // reutiliza el color del borde izquierdo ya definido para pendiente/confirmada
    card.innerHTML = `
      <div class="cita-card-top">
        <div class="cita-card-time">${formatFechaCorta(cita.fecha)} · ${formatHora12(cita.hora)}</div>
        <div class="cita-card-main">
          <div class="cita-card-name">${escapeHtml(cita.paciente)}</div>
          <div class="cita-card-reason">${escapeHtml(cita.motivo || 'Consulta general')}</div>
        </div>
      </div>
      <div class="cita-card-actions">
        <span class="appt-badge ${estadoCita.badge}">${estadoCita.label}</span>
        <span class="appt-badge ${estadoRecordatorio.badge}">Recordatorio: ${estadoRecordatorio.label}</span>
        <select class="cita-status-select" data-action="recordatorio-estado" data-id="${cita.id}">
          <option value="pendiente" ${cita.recordatorioEstado === 'pendiente' || !cita.recordatorioEstado ? 'selected' : ''}>Pendiente</option>
          <option value="enviado" ${cita.recordatorioEstado === 'enviado' ? 'selected' : ''}>Enviado</option>
          <option value="descartado" ${cita.recordatorioEstado === 'descartado' ? 'selected' : ''}>Descartado</option>
        </select>
      </div>
    `;
    return card;
  }

  function renderRecordatorios() {
    // Store.getCitasParaRecordatorio() ya filtra pendiente/confirmada desde hoy
    // en adelante, y ordena por fecha y hora ascendente — no se repite ese trabajo aquí.
    const candidatas = Store.getCitasParaRecordatorio();

    const visibles = candidatas.filter((c) => {
      if (recordatorioState.filter === 'todos') return true;
      const estado = c.recordatorioEstado || 'pendiente'; // sin recordatorioEstado se trata como "pendiente"
      return estado === recordatorioState.filter;
    });

    recordatorioList.innerHTML = '';
    if (!visibles.length) {
      const empty = document.createElement('p');
      empty.className = 'appt-empty';
      empty.textContent = 'No hay recordatorios que mostrar con este filtro.';
      recordatorioList.appendChild(empty);
    } else {
      visibles.forEach((c) => recordatorioList.appendChild(buildRecordatorioCard(c)));
    }

    recordatorioCount.textContent = `${visibles.length} ${visibles.length === 1 ? 'recordatorio' : 'recordatorios'}`;
  }

  recordatorioFilterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      recordatorioState.filter = chip.dataset.filter;
      recordatorioFilterChips.forEach((c) => c.classList.toggle('is-active', c === chip));
      renderRecordatorios();
    });
  });

  recordatorioList.addEventListener('change', (e) => {
    const target = e.target.closest('[data-action="recordatorio-estado"]');
    if (!target) return;
    const nuevoEstado = target.value;
    // Actualiza solo recordatorioEstado — updateCita fusiona el cambio sin tocar
    // el campo `estado` (estado de la cita), que queda intacto.
    Store.updateCita(target.dataset.id, { recordatorioEstado: nuevoEstado });
    refreshAll();
    showToast(`Recordatorio marcado como "${RECORDATORIO_ESTADOS[nuevoEstado].label}".`);
  });

  // ---------- Configuración ----------
  formConfig.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('cfgNombre').value.trim();
    const inicio = document.getElementById('cfgInicio').value;
    const fin = document.getElementById('cfgFin').value;

    if (!nombre || !inicio || !fin) return;
    if (inicio >= fin) {
      configSavedNote.style.color = 'var(--red-500)';
      configSavedNote.textContent = 'La hora de inicio debe ser anterior a la hora de fin.';
      return;
    }

    Store.saveConfig({
      nombreConsultorio: nombre,
      horaInicio: inicio,
      horaFin: fin,
      duracionCita: Number(document.getElementById('cfgDuracion').value),
      recordatoriosActivos: document.getElementById('cfgRecordatorios').checked,
    });

    configSavedNote.style.color = 'var(--teal-600)';
    configSavedNote.textContent = 'Cambios guardados.';
    renderClinicHeader();
    setTimeout(() => (configSavedNote.textContent = ''), 2500);
  });

  // ---------- Inicio ----------
  function init() {
    agendaState.date = todayISO();
    renderClinicHeader();
    renderDashboard();
    renderAgenda();
    renderPacientes();
    renderRecordatorios();
    setActiveView('dashboard');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
