# CONTEXT PACK - final_mockup

Fecha de levantamiento: 2026-02-10
Base analizada: `AGENTS.MD`, `mockup_v2/index.html`, `mockup_v2/js/*`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql`, `.codex/*`.

## 1) Context pack (overview del repo)

### Stack identificado
- Frontend: HTML + CSS + JavaScript vanilla.
- UI libs/CDN:
  - Chart.js UMD (`mockup_v2/index.html:10` + `mockup_v2/js/charts.js:46`).
  - Font Awesome (`mockup_v2/index.html:9`).
  - Google Fonts (`mockup_v2/index.html:7`).
- Estado/datos en runtime: `BCMSDataStore` en memoria (`mockup_v2/js/datastore.js`).
- Persistencia/DB real en repo:
  - No hay backend ejecutable ni conexión DB en este repo.
  - Sí existe diseño objetivo PostgreSQL en `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql`.
- Tooling:
  - No `package.json`, no bundler, no framework SPA.
  - Sin scripts de test/lint.

### Como correr local (comandos exactos)
Desde la raiz del repo (`final_mockup`):

```powershell
cd mockup_v2
python -m http.server 5500
```

Abrir: `http://localhost:5500`

Alternativa Windows (si `python` no esta en PATH):

```powershell
cd mockup_v2
py -m http.server 5500
```

### Como correr tests/lint
No hay infraestructura de tests/lint en el repo:
- No se detecta `package.json`.
- No se detectan archivos de test (`*.test.*`, `*.spec.*`).
- No se detecta configuracion ESLint/Prettier/Jest/Vitest.

### Mapa de carpetas importantes (max 2 niveles)

```text
final_mockup/
├─ AGENTS.MD
├─ .codex/
│  ├─ config.toml
│  └─ rules/
├─ mockup_v2/
│  ├─ index.html
│  ├─ js/
│  ├─ css/
│  ├─ docs/
│  └─ backup/
├─ BancoEstado.md
└─ QuePide.md
```

### Flujo principal del negocio (3-8 bullets)
- Datos Maestros carga organizaciones, procesos, activos, ubicaciones y proveedores como base transversal.
- BIA toma procesos/dependencias para criticidad, RTO/RPO y objetivos de continuidad.
- RIA prioriza riesgos de disrupcion y tratamientos.
- Estrategias/planes (BCP/DRP) se construyen con BIA+RIA y se prueban en `plan_tests`.
- Operacion (incidentes/crisis/comunicaciones) ejecuta respuesta y genera evidencia.
- Auditoria/hallazgos/acciones y lecciones aprendidas alimentan mejoras y cambios BCMS.
- Revision por direccion y reportes consolidan el ciclo de mejora continua ISO 22301.

### Puntos de entrada (rutas/controllers/handlers)
No hay rutas backend ni controllers HTTP en este repo. Entry points frontend:
- Bootstrap app: `DOMContentLoaded -> initializeApp() -> setupNavigation()` en `mockup_v2/index.html:6556`.
- Navegacion principal: click en `.nav-item[data-view]` llama `showView(viewName)` (`mockup_v2/index.html:6563`, `mockup_v2/js/functions.js:101`).
- Dispatcher de vistas: `onViewChange(viewName)` (`mockup_v2/js/functions.js:178`).
- Inicializacion de datos/tablas: `initializeApp()` + `renderAllTables()` (`mockup_v2/js/functions.js:36`, `mockup_v2/js/functions.js:873`).
- Inicializacion de graficos: `initCharts()` (`mockup_v2/js/charts.js:46`).

## 2) Arquitectura + donde conectar cosas

### Capas/modulos y comunicacion
- Capa UI: `mockup_v2/index.html` (vistas, contenedores, handlers inline y sidebar).
- Capa presentacion/logica: `mockup_v2/js/functions.js` (render, navegacion, CRUD mock, tablas, KPIs).
- Capa visualizacion: `mockup_v2/js/charts.js` + `mockup_v2/js/components/*`.
- Capa datos (in-memory): `mockup_v2/js/datastore.js` (`BCMSDataStore.entities/lookups/api`).
- Capa diseno de datos objetivo: `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql` (PostgreSQL, FKs, vistas, triggers).

Comunicacion actual:
- `index.html` dispara eventos -> `functions.js`.
- `functions.js` consulta `BCMSDataStore.api` y pinta HTML.
- `functions.js` llama `charts.js` para graficos.
- No hay llamadas reales a API HTTP en runtime.

### Puntos de extension recomendados
- Nueva vista/modulo:
  - Agregar bloque `<!-- INICIO VISTA: ... -->` en `mockup_v2/index.html`.
  - Agregar `nav-item data-view="..."` en sidebar.
  - Agregar caso en `onViewChange` (`mockup_v2/js/functions.js:178`).
- Nueva entidad de datos:
  - Definir en `BCMSDataStore.entities` + lookup en `lookups` si aplica (`mockup_v2/js/datastore.js`).
  - Reusar `BCMSDataStore.api` para CRUD basico.
- Nueva tabla reusable:
  - Implementar config en `DynamicTable` (`mockup_v2/js/components/DynamicTable.js`).
- Nuevo grafico:
  - Crear init/update en `mockup_v2/js/charts.js` y registrarlo en `initCharts()/updateCharts()`.
- Nuevo estilo reusable:
  - `mockup_v2/css/components/*` y tokens en `mockup_v2/css/styles.css`.

### Diagrama ASCII simple

```text
[Sidebar + Views in index.html]
            |
            v
[functions.js: showView/onViewChange/render*]
      |                    |
      |                    +--> [charts.js + Chart.js]
      v
[BCMSDataStore.api (datastore.js)]
      |
      v
[Entities/Lookups in-memory]

(Referencia de arquitectura objetivo)
[PostgreSQL v10 schema SQL]
```

## 3) Auth / SSO

### Como inicia sesion hoy
No hay flujo de login real implementado en runtime del mockup.
- No se detectan handlers de login ni validacion de token/sesion en JS.
- Hay datos mock de usuarios/roles/MFA en datastore (`mockup_v2/js/datastore.js:598`, `mockup_v2/js/datastore.js:610`).
- En SQL existe modelo de usuarios (`password_hash`, `mfa_enabled`, `last_login_at`) en `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:385`.

### Donde se validan permisos/roles
No existe enforcement real de autorizacion (guardas/middleware).
- Hay visualizacion RBAC en UI (`renderUsuariosRBAC`) pero no bloqueo de acciones por rol (`mockup_v2/js/functions.js:4820`).
- Los permisos estan modelados como metadata en `roles.permissions` (`mockup_v2/js/datastore.js:610`).

### Referencias SAML / Azure AD / SSO / OIDC / OAuth / JWT / session
Hallazgos relevantes:
- `mockup_v2/index.html:5015-5016`: fila de integracion "Active Directory" con "LDAP/SAML 2.0" (solo visual).
- `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:385`: tabla `users` (campos auth base).
- `mockup_v2/js/datastore.js:598`: usuarios mock con `mfaEnabled`.
- `mockup_v2/js/datastore.js:610`: roles/permisos mock.

No encontrados en runtime:
- `JWT`, `OIDC`, `OAuth`, `session`, `cookie`, `passport`, `saml` (implementacion tecnica).

### Mejor punto para integrar SAML sin romper modulos
Punto recomendado: antes de `initializeApp()` en bootstrap frontend.
- Actual: `DOMContentLoaded` llama directo `initializeApp()` en `mockup_v2/index.html:6556`.
- Propuesta de integracion:
  1. Crear `authService` (adaptador SAML/OIDC) que resuelva usuario y claims.
  2. Mapear claims -> `AppState.currentUser` + permisos efectivos.
  3. Ejecutar `initializeApp()` solo si autenticado.
  4. Mantener `functions.js` consumiendo un `can(action, view)` central para no tocar todos los render.

Si se incorpora backend, el ACS/callback SAML debe vivir fuera de este repo (API/BFF), y este frontend consumir solo sesion ya emitida.

## 4) Modelo de datos (tablas + relaciones) desde el repo

Fuente principal usada: `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql`.
Apoyo runtime: `mockup_v2/js/datastore.js`.

### Tablas principales (SQL v10)
Formato: `Tabla -> columnas clave -> relaciones -> donde se define`

- `organizations` -> `id_organization, id_parent_org, code, name, org_type, country` -> `id_parent_org -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:171`
- `users` -> `id_user, email, password_hash, id_primary_org, status, mfa_enabled` -> `id_primary_org -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:385`
- `organizational_units` -> `id_unit, id_organization, id_parent_unit, manager_user_id` -> `id_organization -> organizations; id_parent_unit -> organizational_units; manager_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:439`
- `macroprocesses` -> `id_macroprocess, name, category` -> sin FK directa -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:269`
- `processes` -> `id_process, id_macroprocess, name` -> `id_macroprocess -> macroprocesses` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:286`
- `subprocesses` -> `id_subprocess, id_process, name` -> `id_process -> processes` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:304`
- `procedures` -> `id_procedure, id_subprocess, name` -> `id_subprocess -> subprocesses` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:322`
- `locations` -> `id_location, location_code, location_type_lu, id_organization, parent_location_id` -> `id_organization -> organizations; parent_location_id -> locations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:802`
- `assets` -> `id_asset, asset_code, owner_user_id, id_location, id_organization` -> `owner_user_id -> users; id_location -> locations; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:826`
- `suppliers` -> `id_supplier, supplier_code, supplier_type_lu, risk_tier_lu, id_organization` -> `id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:870`
- `contacts` -> `id_contact, id_organization, id_user, id_supplier` -> `id_organization -> organizations; id_user -> users; id_supplier -> suppliers` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:897`
- `risks` -> `id_risk, risk_code, risk_domain, target_process_id, owner_user_id` -> `target_* -> macroprocesses/processes/subprocesses/procedures; owner_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:619`
- `risk_treatments` -> `id_risk_treatment, id_risk, owner_user_id, status_lu` -> `id_risk -> risks; owner_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:722`
- `bia_assessments` -> `id_bia, id_organization, target_process_id, reviewed_by, status_lu` -> `id_organization -> organizations; target_* -> procesos; reviewed_by -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:740`
- `bia_impacts` -> `id_bia_impact, id_bia, impact_category_lu, severity_lu` -> `id_bia -> bia_assessments` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:761`
- `bia_objectives` -> `id_bia_objective, id_bia, objective_type, value_hours` -> `id_bia -> bia_assessments` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:773`
- `bia_dependencies` -> `id_bia_dependency, id_bia, dependency_type, reference_entity` -> `id_bia -> bia_assessments` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:784`
- `continuity_plans` -> `id_plan, plan_code, plan_type, id_organization, target_process_id, owner_user_id` -> `id_organization -> organizations; target_process_id -> processes; owner_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:931`
- `plan_tests` -> `id_test, id_plan, test_code, test_type, test_date, conducted_by` -> `id_plan -> continuity_plans; conducted_by -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1035`
- `incidents` -> `id_incident, incident_code, severity_lu, status_lu, id_organization, affected_process_id` -> `id_organization -> organizations; affected_process_id -> processes; reported_by/assigned_to -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1061`
- `crisis_declarations` -> `id_crisis, id_incident, declared_by, activated_plan_id` -> `id_incident -> incidents; declared_by -> users; activated_plan_id -> continuity_plans` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1121`
- `frameworks` -> `id_framework, framework_code, name, version_label` -> sin FK -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1162`
- `requirement_nodes` -> `id_requirement, id_framework, parent_requirement_id` -> `id_framework -> frameworks; parent_requirement_id -> requirement_nodes` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1177`
- `compliance_assessments` -> `id_assessment, id_framework, id_organization, lead_assessor_id` -> `id_framework -> frameworks; id_organization -> organizations; lead_assessor_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1214`
- `audits` -> `id_audit, id_organization, id_framework, lead_auditor_id, status_lu` -> `id_organization -> organizations; id_framework -> frameworks; lead_auditor_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1267`
- `findings` -> `id_finding, id_audit, severity_lu, status_lu, responsible_user_id` -> `id_audit -> audits; related_requirement_id -> requirement_nodes; responsible_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1307`
- `finding_actions` -> `id_action, id_finding, owner_user_id, due_date, status_lu` -> `id_finding -> findings; owner_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1338`
- `evidences` -> `id_evidence, entity_type, entity_id, uploaded_by, status_lu` -> `uploaded_by -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1367`
- `lessons_learned` -> `id, code, source_type, source_id, responsible_id, id_organization` -> `responsible_id -> users; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1544`
- `bcms_changes` -> `id, change_code, change_type, requested_by, approved_by, id_organization` -> `requested_by/approved_by/verified_by -> users; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1600`
- `bcms_context_issues` -> `id_context_issue, issue_type, risk_level_lu, owner_user_id, id_organization` -> `owner_user_id -> users; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1855`
- `bcms_stakeholders` -> `id_stakeholder, stakeholder_type, id_contact, id_organization` -> `id_contact -> contacts; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1874`
- `bcms_scopes` -> `id_scope, scope_code, id_organization, approved_by, status_lu` -> `id_organization -> organizations; approved_by -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1893`
- `bcms_policies` -> `id_policy, policy_code, owner_user_id, status_lu, id_organization` -> `owner_user_id -> users; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1909`
- `bcms_objectives` -> `id_objective, objective_code, owner_user_id, status_lu, id_organization` -> `owner_user_id -> users; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1925`
- `bcms_strategies` -> `id_strategy, strategy_code, owner_user_id, status_lu, id_organization` -> `owner_user_id -> users; id_organization -> organizations` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:1942`
- `communication_plans` -> `id_comm_plan, scope_type, id_organization, id_activation_criteria, id_call_tree` -> `id_organization -> organizations; id_activation_criteria -> activation_criteria; id_call_tree -> call_trees` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:2030`
- `communication_messages` -> `id_comm_message, id_comm_plan, channel_lu` -> `id_comm_plan -> communication_plans` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:2080`
- `communication_log` -> `id_comm_log, id_comm_plan, channel_lu, status_lu` -> `id_comm_plan -> communication_plans` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:2095`
- `management_reviews` -> `id_review, review_code, review_date, chair_user_id, status_lu` -> `chair_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:2137`
- `management_review_inputs` -> `id_review_input, id_review, input_type, entity_type` -> `id_review -> management_reviews` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:2151`
- `management_review_outputs` -> `id_review_output, id_review, owner_user_id, status_lu` -> `id_review -> management_reviews; owner_user_id -> users` -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:2163`

### Entidades organizacionales (tenancy/org/unidades)
- `organizations` (jerarquia por `id_parent_org`, trigger `update_org_hierarchy`) -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:171`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:201`.
- `organizational_units` (unidades internas por organizacion) -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:439`.
- `users.id_primary_org` para afiliacion primaria -> `mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql:385`.
- Multiples tablas BCMS usan `id_organization` (scope por org).

Nota de consistencia repo:
- En SQL v10 no aparecen tablas `supplier_assessments`/`supplier_contracts`; en runtime si existen como arrays del mock (`mockup_v2/js/datastore.js:3974`, `mockup_v2/js/datastore.js:4022`).

## 5) Integraciones / APIs internas (conectar con B-GRC)

### APIs expuestas (endpoints) y consumidores
- No hay API backend expuesta en este repo (sin servidor HTTP propio).
- No hay consumidores HTTP reales (`fetch/axios`) en runtime.
- Los "endpoints" visibles son datos mock en UI de Configuracion:
  - ServiceNow: `https://mitiga.service-now.com/api`
  - Splunk HEC: `https://splunk.mitiga.cl:8088`
  - Archer: `https://archer.mitiga.cl/ws`
  - AD LDAP/SAML: `ldaps://ad.mitiga.cl:636`
  - Ubicacion: `mockup_v2/index.html:4990-5016`

### Jobs / cron / webhooks / colas
- No hay implementacion real de cron/jobs/colas/webhooks en JS del mockup.
- Solo existen textos/mock y `setTimeout` de UI para render diferido.

### Clientes externos o SDKs
- Chart.js por CDN (`mockup_v2/index.html:10`).
- Font Awesome por CDN (`mockup_v2/index.html:9`).
- Google Fonts (`mockup_v2/index.html:7`).

### Patron actual para integraciones
- Patron vigente: mock de configuracion visual + datos en `datastore`.
- No existe service layer de integraciones real.
- Punto natural para integrar B-GRC sin romper vistas:
  - Crear capa `js/services/integrations/` con adaptadores (`BGRCAdapter`, `ServiceNowAdapter`, etc.).
  - Reemplazar lecturas directas de datastore por `IntegrationFacade` en funciones de carga.

## 6) Auditoria de .codex/ + recomendaciones (MCP/rules/workflows)

### Estado actual
- `.codex/config.toml` vacio (0 bytes).
- Reglas en `.codex/rules/` son minimas y genericas:
  - `vanilla-js-best-practices.md`
  - `css-best-practices.md`
  - `chartjs-best-practices.md`
- No hay reglas de seguridad operacional (comandos riesgosos) ni workflows definidos.

### Recomendaciones AGENTS.md (snippet sugerido)

```diff
+# Safe Commands Policy
+- Nunca ejecutar `git push` sin confirmacion explicita del usuario.
+- Nunca ejecutar comandos destructivos (`rm -rf`, `del /s /q`, `git reset --hard`, `git checkout --`) salvo instruccion explicita.
+- No tocar ramas `main/master/release` sin aprobacion explicita.
+
+# Runtime/Quality Policy
+- Antes de entregar: validar carga local del mockup (`python -m http.server 5500` + smoke manual de vistas).
+- Si no hay tests automatizados, registrar claramente "sin tests" y riesgo residual.
+
+# Data Contract Policy
+- Todo cambio de entidad debe mantenerse alineado entre `datastore.js` y `BCMS_PostgreSQL_schema_v10.sql` (sin editar SQL salvo solicitud explicita).
+- Si una entidad existe solo en datastore, marcarla como "mock-only" en la documentacion tecnica.
```

### Reglas sugeridas para comandos riesgosos (.codex/rules)

```md
# risky-commands.md
- Bloquear por defecto: git push, git reset --hard, git checkout --, rm -rf, del /s /q, format, drop database.
- Requerir frase explicita del usuario: "autorizo <comando>" antes de ejecutar.
- Para deploy: exigir entorno no productivo y confirmacion de target.
```

### MCP recomendado para este repo
- `github`: issues/PRs/commit context.
- `jira` (o Azure DevOps Boards): trazabilidad de requerimientos BCMS.
- `postgres` (read-only): validacion rapida de esquema real vs mock.
- `confluence` o `sharepoint` docs: normas, minutas, ISO evidence packs.
- `sso/idp docs connector` (si existe): para specs SAML/OIDC corporativas.

### 2-3 workflows de rutina (sugeridos)

```md
Workflow: Bugfix
1) Reproducir en vista especifica.
2) Revisar `functions.js` + `datastore.js` de entidad afectada.
3) Corregir minimo cambio + smoke de navegacion y render.
4) Documentar impacto en `docs/CONTEXT.md` o changelog tecnico.

Workflow: Feature
1) Agregar vista/componente en `index.html` con comentarios INICIO/FIN VISTA.
2) Crear/ajustar entidad en `datastore.js` (sin datos estaticos fuera datastore).
3) Conectar render en `onViewChange`.
4) Verificar trazabilidad BCMS (Datos Maestros -> BIA/RIA -> Planes -> Evidencia).

Workflow: Refactor
1) Detectar duplicados (render helpers/tablas).
2) Extraer componente reusable en `js/components`.
3) Mantener API publica de funciones para no romper handlers inline.
4) Smoke completo por modulo.
```

## 7) Preguntas que faltan (alineacion de requisitos)

### Auth / SSO
1. El IdP corporativo objetivo es Azure AD/Entra, ADFS u otro?
2. Se requiere SAML 2.0 puro, OIDC o soporte dual?
3. Donde vivira el ACS/callback SSO: backend propio, BFF o gateway corporativo?
4. Se exigira MFA en IdP, en app, o ambos?

### Tenancy / permisos
5. El alcance de datos es por tenant/organizacion/pais/unidad?
6. Un usuario puede pertenecer a multiples organizaciones activas a la vez?
7. El modelo final de permisos sera RBAC, ABAC o mixto?
8. Que acciones deben estar estrictamente bloqueadas por rol (no solo ocultas en UI)?

### Datos sensibles / auditoria
9. Que campos se consideran sensibles (PII, incidentes regulatorios, evidencias)?
10. Se requiere cifrado en reposo y/o mascaramiento en UI para ciertos roles?
11. Cual es la politica de retencion para logs, incidentes y evidencias?
12. Se exige traza inmutable (WORM) para evidencias/auditoria?

### Reporting / cumplimiento
13. Que reportes son regulatorios obligatorios y con que periodicidad?
14. Que KPIs deben quedar formalmente versionados para ISO 22301 cl. 9.1?
15. Se necesita firma/aprobacion electronica de politicas, alcance y management review?

### Despliegue / dependencias
16. La demo evolucionara a producto con backend real? Si si, stack objetivo?
17. B-GRC sera fuente maestra, sistema satelite, o coexistencia bidireccional?
18. Para integraciones (ServiceNow/Splunk/Archer), se requiere polling, eventos o ambos?

## Observaciones finales
- Este repo es un mockup frontend rico en vistas y datos simulados, con arquitectura de datos SQL bien definida como referencia.
- La brecha principal para BancoEstado/entorno corporativo esta en auth real, autorizacion efectiva, y adaptadores de integracion (hoy solo visual/mock).
