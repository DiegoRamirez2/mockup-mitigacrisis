# ISO 22301 - cambios propuestos (capacitacion, plan comunicaciones, revision direccion, RACI)

Este documento resume cambios minimos recomendados para cubrir ISO 22301 en el esquema actual (v9), usando ejemplos y conectando con tablas existentes.

## 1) Capacitacion usando solo ejercicios + participantes

Idea: usar `plan_tests` (v9) o `exercises` (v7) como registro de capacitacion, sin tabla de training.

Recomendacion:
- Definir tipos de ejercicio con un lookup (ej: TRAINING, TABLETOP, SIMULATION, FULL).
- Usar `plan_tests.participants` o una tabla de participantes para registrar asistencia y resultado.
- Adjuntar evidencia con `evidences` (certificados, listas de asistencia, materiales).

Ejemplo de uso:
- plan_tests:
  - test_code: TRN-BCMS-2025-01
  - test_type_lu: TRAINING
  - objectives: "Capacitacion roles BCMS"
  - results: "85% asistencia"
- evidencia:
  - type: TRAINING_RECORD
  - entity_type: PLAN_TEST
  - entity_id: <id_plan_test>

Limitacion:
- No hay historico individual por persona (nota/score) si no existe tabla de participantes. Si se quiere mas detalle, agregar `plan_test_participants` (id_test, id_user, attendance, score, status, notes).

## 2) Plan de comunicaciones: como insertarlo en el esquema actual

Objetivo ISO 7.4 y 8.4.3: definir canales, mensajes, responsables y stakeholders para crisis/continuidad.

Tablas nuevas minimas sugeridas:

### communication_plans
- id_comm_plan (PK)
- plan_name
- scope_type: GLOBAL | ORGANIZATION | PROCESS | PLAN | INCIDENT | CRISIS
- scope_id (nullable)
- activation_criteria_id (FK a activation_criteria)
- call_tree_id (FK a call_trees)
- owner_user_id (FK a users)
- status_lu (lookup)
- created_at, updated_at

### communication_plan_channels
- id_comm_channel (PK)
- id_comm_plan (FK)
- channel_lu (lookup: EMAIL, SMS, VOICE, APP, MEDIA, REGULATOR)
- priority_order
- notes

### communication_plan_stakeholders
- id_comm_stakeholder (PK)
- id_comm_plan (FK)
- stakeholder_type: USER | CONTACT | SUPPLIER | REGULATOR | PUBLIC
- stakeholder_id (id_user, id_contact o texto externo)
- role_in_plan (Owner, Approver, Spokesperson)
- required_ack (bool)

### communication_messages
- id_comm_message (PK)
- id_comm_plan (FK)
- message_type: INITIAL | UPDATE | STATUS | CLOSURE
- template_title
- template_body
- language_code

### communication_log (opcional, para ejecucion)
- id_comm_log (PK)
- id_comm_plan (FK)
- triggered_by (user)
- triggered_at
- channel_lu
- recipient
- status_lu
- response_received_at

Conexiones con esquema actual:
- activation_criteria (disparadores)
- call_trees / call_tree_nodes (contactabilidad)
- incidents / crisis_declarations (cuando se activa)
- continuity_plans (planes asociados)
- evidences (mensajes emitidos como evidencia)

Ejemplo:
- communication_plans (BCP Core Banking) -> activation_criteria (CRIT-INC-01) -> call_tree (CT-CORE-01)
- communication_messages: "Aviso inicial a regulador" y "Update a clientes".

## 3) Revision por la direccion (ISO 9.3)

No existe en v9. Se requiere al menos:

### management_reviews
- id_review (PK)
- review_code
- review_date
- period_start, period_end
- scope_description
- chair_user_id (user)
- status_lu
- created_at

### management_review_inputs
- id_input (PK)
- id_review (FK)
- input_type: AUDIT | KPI | INCIDENT | EXERCISE | RISK | CHANGE | FEEDBACK
- entity_type, entity_id (polimorfico)
- summary

### management_review_outputs
- id_output (PK)
- id_review (FK)
- decision_type: ACTION | CHANGE | RESOURCE | POLICY
- description
- owner_user_id
- due_date
- status_lu

Conexiones:
- audits, findings, plan_tests, incidents, risks, bcms_changes, lessons_learned
- evidences para actas de revision

Ejemplo:
- management_reviews: MR-2025-Q4
- inputs: AUDIT (audit_id=12), EXERCISE (plan_test_id=7), INCIDENT (id=33)
- outputs: ACTION "Actualizar politica BCP" responsable BCMS Manager.

## 4) RACI BCMS: que agregar sobre usuarios/roles

RBAC actual no cubre responsabilidades BCMS por proceso o plan. Se sugiere agregar:

### bcms_roles
- id_bcms_role (PK)
- role_code (BCMS_OWNER, PROCESS_OWNER, CRISIS_LEAD, COMMUNICATIONS)
- role_name
- description

### bcms_role_assignments
- id_assignment (PK)
- id_bcms_role (FK)
- id_user (FK)
- scope_type: ORGANIZATION | PROCESS | SUBPROCESS | PROCEDURE | PLAN | INCIDENT | CRISIS
- scope_id
- is_primary
- valid_from, valid_until

### bcms_raci_matrix
- id_raci (PK)
- activity_code (BIA, RISK_ASSESSMENT, PLAN_TEST, INCIDENT_RESPONSE, MANAGEMENT_REVIEW)
- id_bcms_role (FK)
- responsibility (R, A, C, I)

Ejemplo:
- bcms_raci_matrix:
  - activity_code=BIA, role=PROCESS_OWNER -> R
  - activity_code=BIA, role=BCMS_MANAGER -> A
  - activity_code=BIA, role=RISK_MANAGER -> C
- bcms_role_assignments:
  - role=PROCESS_OWNER, user=Juan Perez, scope_type=PROCESS, scope_id=15

Conexiones:
- users
- processes / continuity_plans / incidents
- organizational_units (si se requiere asignacion por unidad)

## Resumen rapido
- Capacitacion: se puede cubrir con ejercicios + participantes + evidencia.
- Comunicaciones: agregar 3-5 tablas pequenas y vincularlas a activation_criteria, call_trees e incidents/crisis.
- Revision por direccion: tabla de revisiones + inputs/outputs y evidencia.
- RACI: catalogo de roles BCMS + asignaciones por alcance + matriz RACI por actividad.

