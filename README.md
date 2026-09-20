# MediAgenda IA

Prototipo funcional de un sistema de gestión de citas para un consultorio médico. Permite administrar el Dashboard, la Agenda (día/semana), el catálogo de Pacientes y el estado de aviso de citas (Recordatorios), todo con datos guardados localmente en el navegador.

**Estado del proyecto:** prototipo de un solo consultorio, sin backend ni envío real de mensajes. Fases 1 a 4 completas (Dashboard, Agenda, Pacientes, Recordatorios).

## Objetivo del proyecto
Ofrecer una interfaz clara y responsive para que el personal de un consultorio pueda:
- Ver de un vistazo las citas del día y la próxima cita.
- Agendar, editar, cambiar de estado y cancelar citas sin traslapes de horario.
- Mantener un catálogo de pacientes enlazado a sus citas (no solo texto suelto).
- Llevar registro manual de qué citas ya recibieron aviso, cuáles siguen pendientes de avisar y cuáles se descartaron — como base para, más adelante, conectar un envío real.

## Galería del proyecto

### Dashboard
![Dashboard de MediAgenda IA](capturas/01-dashboard.png)

Vista general al iniciar sesión: citas de hoy, pendientes, confirmadas y la próxima cita, junto con un resumen de actividad reciente — todo el estado del consultorio de un vistazo.

### Agenda semanal
![Vista semanal de la Agenda](capturas/02-agenda-semanal.png)

La agenda organizada por semana, con las citas de cada día agrupadas y el día actual resaltado — útil para planear la carga de trabajo sin revisar día por día.

### Pacientes
![Módulo de Pacientes](capturas/03-pacientes.png)

Catálogo de pacientes con búsqueda instantánea, alta y edición rápidas, y acceso directo al historial completo de citas de cada uno.

### Recordatorios
![Módulo de Recordatorios](capturas/04-recordatorios.png)

Seguimiento manual de qué citas próximas ya recibieron aviso, cuáles siguen pendientes y cuáles se descartaron, con filtros por estado — base preparada para una futura integración de envío real.

### Configuración
![Módulo de Configuración](capturas/05-configuracion.png)

Ajustes del consultorio: nombre, horario de atención y duración predeterminada de cada cita.

## Funcionalidades actuales

### Dashboard
- Tarjetas de resumen: citas de hoy, pendientes, confirmadas y la próxima cita.
- Lista de próximas citas y resumen de actividad reciente.

### Agenda
- **Vista Día**: franjas horarias según el horario de atención y la duración de cita configurados; cada franja muestra la cita que la ocupa o "Disponible".
- **Vista Semana**: cuadrícula de lunes a domingo con las citas del día en miniatura (3 columnas en tableta, 2 en celular, 7 en escritorio); el nombre truncado muestra el nombre completo al pasar el cursor.
- Crear, editar, cambiar de estado (pendiente/confirmada/atendida/cancelada) y eliminar citas (con confirmación).
- Buscador por nombre de paciente y filtros por estado, combinables.
- **Validación de traslapes por duración real** (en minutos, no por texto): dos citas se rechazan si sus horarios se cruzan; una cita cancelada nunca bloquea el horario ni se dibuja como "ocupando" una franja.
- El paciente de cada cita se elige de un `<select>` con los pacientes ya dados de alta (no es texto libre) — la cita queda enlazada por `pacienteId` además de guardar el nombre.

### Pacientes
- Alta, edición, búsqueda por nombre y contador de pacientes visibles.
- Historial de citas administrativas por paciente (reutiliza la misma lista de la Agenda).
- Si editas el nombre de un paciente, sus citas ya guardadas reflejan el cambio automáticamente.
- **Eliminar paciente está bloqueado si tiene citas relacionadas** — tanto desde la interfaz como directamente en la capa de datos (`Store.deletePaciente`), para que nunca quede una cita apuntando a un paciente que ya no existe.
- Migración automática y segura: instalaciones de fases anteriores (citas sin pacientes, o citas y pacientes ya enlazados pero con algún enlace faltante) se completan solas al cargar, sin borrar ni pisar datos existentes.

### Recordatorios
- Muestra las citas **pendientes o confirmadas, desde hoy en adelante** (las atendidas, canceladas o pasadas no aparecen).
- Cada tarjeta indica fecha, hora, paciente, motivo, el estado de la cita y el estado del recordatorio.
- El estado del recordatorio se cambia manualmente entre **Pendiente / Enviado / Descartado**; una cita sin este dato aún se trata como "Pendiente".
- Filtros por estado de recordatorio (Todos/Pendientes/Enviados/Descartados) y contador.
- **No envía nada real** — ni por WhatsApp, ni por correo, ni por SMS. Es solo un registro manual de seguimiento, preparado en su modelo de datos para conectarse a un proveedor autorizado más adelante (esa integración todavía no existe).

### Configuración
- Nombre del consultorio, horario de atención, duración predeterminada de cita, y la *preferencia* de activar recordatorios (sin conexión real).

### General
- Diseño responsive (celular, tableta, escritorio) con menú lateral que se convierte en menú deslizable en pantallas pequeñas.
- Protección básica contra HTML no confiable: los textos de paciente/motivo siempre se insertan escapados o mediante propiedades del DOM, nunca como HTML crudo.

## Estructura de carpetas
```
mediagenda-ia/
├── index.html        Estructura semántica: sidebar, topbar, Dashboard, Agenda, Pacientes, Recordatorios, Configuración y modales
├── css/
│   └── styles.css    Estilos (paleta navy/turquesa/blanco/gris, responsive, todos los componentes)
├── js/
│   ├── data.js        Capa de datos: localStorage, seed y migración enlazada citas↔pacientes, CRUD, traslapes por duración, recordatorios
│   └── app.js          Interfaz: navegación y lógica de los 5 módulos (Dashboard, Agenda, Pacientes, Recordatorios, Configuración)
├── capturas/          Capturas de pantalla usadas en la Galería del proyecto (README.md y PORTFOLIO.md)
│   ├── 01-dashboard.png
│   ├── 02-agenda-semanal.png
│   ├── 03-pacientes.png
│   ├── 04-recordatorios.png
│   └── 05-configuracion.png
├── README.md
└── PORTFOLIO.md       Presentación del proyecto para portafolio y redes sociales
```

## Cómo ejecutar el proyecto localmente
No requiere instalación ni servidor.

1. **Más simple:** descarga/descomprime la carpeta completa (con sus subcarpetas `css/` y `js/` intactas) y haz doble clic en `index.html`.
2. **Recomendado para desarrollo** (evita restricciones del navegador con `localStorage` al abrir el archivo directamente):
   - VS Code: extensión "Live Server" → clic derecho en `index.html` → "Open with Live Server".
   - Terminal, dentro de la carpeta del proyecto: `npx serve .` o `python3 -m http.server 8000`, y abre `http://localhost:8000`.

> Importante: `index.html` carga `css/styles.css`, `js/data.js` y `js/app.js` con rutas relativas. Si separas `index.html` de sus subcarpetas `css/`/`js/`, la app se verá sin estilos y sin funcionar.

## Tecnologías utilizadas
- HTML5 semántico.
- CSS3 (variables/custom properties, Flexbox, Grid, media queries) — sin frameworks.
- JavaScript vanilla (ES6+) — sin frameworks ni librerías externas.
- `localStorage` del navegador como única persistencia (no hay backend, base de datos ni build tools).
- Cero dependencias de terceros — no hay `package.json` ni `node_modules` en el proyecto.

## Limitaciones actuales
- **Todo el almacenamiento es local** (`localStorage`): no hay backend ni base de datos real; si se limpia el caché del navegador, se pierden los datos.
- **No hay envío real de recordatorios** por ningún medio (WhatsApp, correo, SMS) — el estado se cambia manualmente y queda preparado para una integración futura, que aún no existe.
- El indicador de horarios ocupados en la vista Día de Agenda se calcula sobre las citas ya filtradas por el buscador/filtro activo (simplificación intencional); la validación real de traslapes al guardar siempre revisa todas las citas activas, sin importar el filtro.
- La vista Semana es de resumen; para editar, cambiar estado o eliminar una cita hay que abrir su detalle o ir a la vista Día.
- Si cambias la duración predeterminada en Configuración, las citas ya existentes conservan la duración con la que fueron creadas.
- Eliminar un paciente está bloqueado mientras tenga citas relacionadas; para eliminarlo hay que reasignar o eliminar esas citas primero.
- Para crear una cita hace falta al menos un paciente dado de alta.
- Los pacientes y citas de ejemplo (semilla) son datos ficticios, solo para mostrar la interfaz con contenido — no son información médica real.

## Próximas mejoras sugeridas
1. Definir y contratar un **proveedor autorizado** de mensajería (WhatsApp Business API o correo transaccional) para conectar el envío real de recordatorios — hoy el módulo solo lleva el registro manual del estado.
2. Migrar la persistencia de `localStorage` a un backend real (por ejemplo, **Supabase**: Auth + Postgres + Row Level Security), lo que permitiría multiusuario, respaldo de datos y acceso desde varios dispositivos.
3. Mover cualquier credencial o clave de proveedor a ese backend — nunca deben vivir en el frontend.
4. Revisar con uso real el flujo completo (paciente → cita → recordatorio) antes de invertir en la integración de mensajería.
5. Considerar un sistema de archivado en vez de bloqueo total para pacientes con historial extenso, si el bloqueo actual resulta poco práctico en el día a día.
