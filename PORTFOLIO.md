# MediAgenda IA — Presentación del proyecto

*Sistema de gestión de citas para consultorios médicos — prototipo funcional desarrollado desde cero con HTML, CSS y JavaScript puro.*

---

## Resumen ejecutivo

Muchos consultorios pequeños siguen administrando su agenda en cuadernos, hojas de cálculo o grupos de WhatsApp — sin una forma clara de ver el día completo, evitar citas encimadas, o saber a quién ya se le avisó de su próxima consulta.

**MediAgenda IA** es un prototipo funcional que resuelve eso con una interfaz simple y profesional: agenda por día y por semana, control de pacientes, validación automática de horarios encimados, y un módulo de seguimiento de recordatorios — todo funcionando 100% en el navegador, sin necesidad de instalar nada.

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

## El problema que resuelve

- Evitar que se agenden dos citas en el mismo horario.
- Tener el historial de citas de cada paciente a la mano.
- Saber de un vistazo qué citas de hoy y de los próximos días ya recibieron aviso y cuáles no.
- Todo con una interfaz que se ve bien tanto en la computadora del consultorio como en el celular de quien atiende el mostrador.

## Funcionalidades destacadas

| Módulo | Qué hace |
|---|---|
| **Dashboard** | Resumen del día: citas de hoy, pendientes, confirmadas y la próxima cita. |
| **Agenda** | Vista día (con franjas horarias) y vista semana; crear, editar, cambiar de estado y cancelar citas sin traslapes de horario. |
| **Pacientes** | Alta, edición, búsqueda e historial de citas por paciente — con protección para no eliminar un paciente que aún tiene citas activas. |
| **Recordatorios** | Lista de citas próximas que necesitan aviso, con estado manual (pendiente / enviado / descartado) — preparado como base para conectar un envío real más adelante. |
| **Configuración** | Nombre del consultorio, horario de atención y duración de cita, ajustables por el usuario. |

## Decisiones técnicas que vale la pena mostrar

- **Validación de traslapes por duración real**, no solo por hora exacta: dos citas se consideran en conflicto si sus horarios se cruzan, calculado en minutos — no comparando texto, lo cual evita errores sutiles como cruces de medianoche.
- **Migración de datos automática y segura**: si el modelo de datos cambia entre versiones (por ejemplo, al enlazar citas con pacientes por ID en vez de solo por nombre), el sistema repara los datos existentes al cargar, sin borrar ni duplicar información.
- **Protección contra HTML no confiable**: cualquier texto que escriba el usuario (nombre de paciente, motivo de consulta) se inserta de forma segura, nunca como HTML ejecutable.
- **Responsive real**: menú lateral en escritorio que se convierte en menú deslizable en celular, y vistas que se reacomodan (no solo se encogen) en tableta.

## Stack tecnológico

- **HTML5 semántico** — sin frameworks.
- **CSS3** (variables, Flexbox, Grid, media queries) — diseño propio, sin librerías de UI.
- **JavaScript vanilla (ES6+)** — sin frameworks ni dependencias externas.
- **`localStorage`** como capa de persistencia del prototipo.

*Cero dependencias de terceros: todo el código es legible y auditable línea por línea.*

## Estado actual

Prototipo funcional de un solo consultorio, con las 4 fases principales completas (Dashboard, Agenda, Pacientes, Recordatorios). Aún no tiene backend ni envío real de mensajes — eso es la siguiente fase natural del proyecto (migración a una base de datos real y conexión con un proveedor de WhatsApp Business API autorizado).

---

## Texto corto para redes sociales

> 🩺 Terminé un prototipo de **MediAgenda IA** — un sistema de agenda para consultorios médicos hecho desde cero con HTML, CSS y JavaScript puro (sin frameworks).
>
> Agenda por día y semana sin citas encimadas, control de pacientes, y seguimiento de recordatorios — todo responsive, desde celular hasta escritorio.
>
> #WebDevelopment #JavaScript #DesarrolloWeb #Guadalajara

---

*Documento generado como material de portafolio. Los datos de pacientes y citas mostrados en el prototipo son ficticios.*
