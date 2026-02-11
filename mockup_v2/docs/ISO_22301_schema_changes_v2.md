# ISO 22301 - respuestas y comparacion (cambios minimos vs modelo limpio)

Este documento responde las dudas y compara cambios minimos vs un modelo limpio,
con foco en: capacitacion, plan de comunicaciones, revision por la direccion y RACI.

## Respuestas directas

### 1) Participantes polimorficos y personas fuera de la plataforma
Si el participante no existe como usuario, el modelo debe soportar un tipo externo.
Recomendacion:
- Crear una tabla `activity_participants` polimorfica con:
  - activity_type (PLAN_TEST, EXERCISE, INCIDENT, CRISIS, TRAINING)
  - activity_id
  - participant_type (USER, CONTACT, EXTERNAL)
  - id_user (nullable)
  - id_contact (nullable)
  - external_name, external_email, external_phone (nullable)
  - role, attendance_status, score, notes

Esto permite registrar personas no registradas sin depender de id_user.

### 2) Contacts polimorfico
Si reemplazas `contacts.id_user` y `contacts.id_supplier` por `entity_type + entity_id`
se gana flexibilidad pero se pierde integridad referencial (FK) y filtros faciles.

Alternativa recomendada (mas segura):
- Mantener `contacts` como entidad de persona.
- Agregar `contact_links`:
  - id_contact
  - entity_type (ORGANIZATION, SUPPLIER, PROCESS, PLAN, CRISIS, etc.)
  - entity_id
  - relationship_type (PRIMARY, EMERGENCY, OWNER, SPOKESPERSON)

Esto evita romper `contacts` y permite multiples asociaciones sin mas columnas.

### 3) Revision por la direccion (ISO 9.3)
`audits`, `findings`, `finding_actions`, `audit_logs`, `audit_scope_items` no cubren 9.3
porque faltan:
- entradas obligatorias (auditorias, kpi, incidentes, ejercicios, cambios, feedback)
- decisiones/salidas (acciones, recursos, cambios al SGCN)
- acta formal (evidencia)

No es obligatorio reformular tablas existentes; se puede agregar un modulo separado:
- `management_reviews` (cabecera)
- `management_review_inputs` (entradas)
- `management_review_outputs` (decisiones)
- evidencia vinculada por `evidences`.

### 4) RBAC y RACI
RBAC controla acceso, no responsabilidad. Para RACI necesitas:
- asignacion por alcance (proceso/plan/incidente)
- tipo de responsabilidad (R, A, C, I)

Sin cambios, RBAC no evidencia RACI. Debe extenderse con:
- scope_type / scope_id
- raci_role (R/A/C/I)
- activity_code (BIA, RISK, PLAN_TEST, INCIDENT_RESPONSE, MANAGEMENT_REVIEW)

Puedes agregar columnas a `user_role_assignments` y/o usar JSON en `roles.permissions`,
pero es menos claro que un modelo dedicado.

## Comparacion: cambios minimos vs modelo limpio

### Cambios minimos (menos tablas, mas JSON/columnas)
Objetivo: tocar lo menos posible el esquema.

1) Capacitacion
- Agregar `activity_participants` (polimorfica) y usar `plan_tests` como entrenamiento.

2) Plan de comunicaciones
- Agregar `communication_plans` con JSON:
  - channels_json (lista de canales)
  - stakeholders_json (lista de usuarios/contactos)
  - messages_json (plantillas)
- Conectar a:
  - `activation_criteria` (trigger)
  - `call_trees` (contactabilidad)
  - `incidents` / `crisis_declarations` (activacion)

3) Revision por la direccion
- Agregar `management_reviews` con:
  - inputs_json
  - outputs_json
  - participants_json
- Evidencias en `evidences`.

4) RACI
- Extender `user_role_assignments` con:
  - scope_type, scope_id
  - activity_code
  - raci_role (R/A/C/I)

Pros:
- Pocas tablas nuevas.
- Rapido de implementar.
Contras:
- Menos consultable y auditable.
- Mayor carga en logica de aplicacion.

### Modelo limpio (mas tablas, mas claridad)
Objetivo: trazabilidad y consultas claras.

1) Capacitacion
- `activity_participants` (polimorfica) con `participant_type`.

2) Plan de comunicaciones
- `communication_plans`
- `communication_plan_channels`
- `communication_plan_stakeholders`
- `communication_messages`
- `communication_log` (opcional, ejecucion)

3) Revision por la direccion
- `management_reviews`
- `management_review_inputs`
- `management_review_outputs`

4) RACI
- `bcms_roles`
- `bcms_role_assignments` (scope_type/scope_id)
- `bcms_raci_matrix` (activity_code + R/A/C/I)

Pros:
- Evidencia y auditoria mas robusta.
- Consultas directas para ISO.
Contras:
- Mas tablas y un poco mas de desarrollo.

## Ejemplos rapidos

- activity_participants:
  - activity_type=PLAN_TEST, activity_id=7, participant_type=EXTERNAL,
    external_name="Consultor externo", attendance_status="Attended"

- communication_plans:
  - plan_name="BCP Core Banking"
  - activation_criteria_id=3
  - call_tree_id=5
  - owner_user_id=12

- management_reviews:
  - review_code="MR-2025-Q4"
  - inputs: audit_id=12, plan_test_id=7, incident_id=33
  - outputs: action "Actualizar politica BCP" due_date=2026-01-31

- bcms_role_assignments:
  - role=PROCESS_OWNER, user=Juan Perez, scope_type=PROCESS, scope_id=15

