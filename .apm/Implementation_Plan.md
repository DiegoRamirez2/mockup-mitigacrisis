# MitigaResilience BCMS Mockup Migration – APM Implementation Plan
**Memory Strategy:** Dynamic-MD
**Last Modification:** Plan creation by the Setup Agent.
**Project Overview:** Migration of MitigaResilience BCMS demo from legacy `mockup_final.html` to refactored `index_refactor.html` using mockup-first methodology with centralized state management (datastore.js), dynamic rendering, reusable components, and responsive UI patterns. Priority focus on Gate 1 (BIA + RIA) with full functional coverage maintaining ISO 22301 compliance and BancoEstado-specific requirements (Anexo 7).

---

## Phase 1: Foundation Setup & Datastore Base

### Task 1.1 – Expand datastore with BIA/RIA lookup catalogs - Agent_DataLogic
**Objective:** Expand `mockup_v2/js/datastore.js` with critical lookup catalogs for BIA/RIA operations.
**Output:** Datastore with lookup_values, impact_types, time_buckets, and disruption_scenarios arrays populated.
**Guidance:** Use `BCMS_PostgreSQL_schema_v11.sql` and `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt` as reference for BancoEstado-specific structures. Follow existing datastore.js array format patterns.

1. Ad-Hoc Delegation – Analyze v11 schema and Anexo 7 to identify exact structures for lookup_values, impact_types, time_buckets, disruption_scenarios
2. Add lookup_values arrays for risk levels (Bajo, Medio, Medio-Alto, Alto, Crítico), impact levels, probability scales (Muy Baja, Baja, Media, Alta, Muy Alta) to datastore.js
3. Add impact_types array with 5 BancoEstado tipos: Monetario, Procesos, Reputacional, Normativo, Clientes (each with id, name, description, weight)
4. Add time_buckets array with 6 rangos: <1h, 1-2h, 2-6h, 6-24h, 24-36h, >36h (each with id, label, hours_min, hours_max)
5. Add disruption_scenarios catalog with basic scenarios for BIA/RIA: Falla tecnológica, Desastre natural, Pandemia, Ciberataque, Falla proveedor crítico

### Task 1.2 – Create helper functions for data retrieval and validation - Agent_DataLogic
**Objective:** Implement reusable helper functions in `mockup_v2/js/functions.js` for consistent datastore access.
**Output:** Helper functions: getById, getByField, validateCascade, resolveLookup implemented and tested.
**Guidance:** **Depends on: Task 1.1 output**. Follow existing function patterns in functions.js. Ensure functions handle null/undefined gracefully.

- Implement `getById(entity, id)` function for entity retrieval from datastore arrays, returning null if not found
- Implement `getByField(entity, fieldName, value)` for filtered queries, returning array of matches
- Implement `validateCascade(processId)` to verify proceso→BIA→RIA relationships exist, returning validation object {valid: boolean, missing: []}
- Implement `resolveLookup(lookupSet, value)` for lookup_values label resolution, handling both ID and value inputs

### Task 1.3 – Document datastore structure and API contracts - Agent_DataLogic
**Objective:** Update documentation with new datastore structures and helper functions.
**Output:** Updated `BCMS_v11_datastore_mapping_contract.md` and inline JSDoc comments in code files.
**Guidance:** **Depends on: Task 1.1 output** and **Task 1.2 output**. Keep documentation concise and focused on API contracts, not implementation details.

- Update `mockup_v2/docs/BCMS_v11_datastore_mapping_contract.md` with new catalog structures (lookup_values, impact_types, time_buckets, disruption_scenarios) and helper functions signature documentation
- Add inline JSDoc comments to new datastore structures in datastore.js explaining purpose, field definitions, and expected data types
- Add inline JSDoc comments to helper functions in functions.js with @param, @returns, @example tags showing usage patterns

---

## Phase 2: BIA Migration (Gate 1 - Part 1)

### Task 2.1 – Migrate BIA master view structure to dynamic render - Agent_Frontend_BIA_RIA
**Objective:** Convert BIA view from static HTML to dynamic rendering using datastore.
**Output:** BIA view with `renderBIAView()` function, tab navigation (Evaluaciones, Impactos, Objetivos, Dependencias), and INICIO/FIN VISTA comments maintained.
**Guidance:** **Depends on: Task 1.1 output by Agent_DataLogic** (cross-agent). Reference vista Incidentes in `index_refactor.html` as pattern for render function structure and tab navigation. Maintain existing INICIO/FIN VISTA comment format.

1. Analyze current BIA HTML structure in `index_refactor.html` between `<!-- INICIO VISTA: BIA -->` and `<!-- FIN VISTA: BIA -->` comments, identify static elements to migrate
2. Create `renderBIAView()` function in `mockup_v2/js/functions.js` following Incidentes pattern, consuming datastore.biaAssessments
3. Implement tab navigation system for 4 tabs: Evaluaciones, Impactos, Objetivos, Dependencias with dynamic content switching using data-tab attributes
4. Replace static HTML containers with render function calls, preserving INICIO/FIN VISTA and component-level comments format
5. Test navigation with `showView('bia')` and verify all tab switches work correctly without console errors

### Task 2.2 – Implement BIA assessment form with impact types and time buckets - Agent_Frontend_BIA_RIA
**Objective:** Create CRUD modal for BIA assessments integrating BancoEstado impact types and time buckets.
**Output:** Functional BIA assessment modal with create/edit modes, validation, and datastore persistence.
**Guidance:** **Depends on: Task 2.1 output**. Use existing modal patterns from index_refactor.html. Integrate impact_types (5) and time_buckets (6) from datastore.

- Create modal structure for BIA assessment form with create/edit modes, following existing modal CSS patterns from styles.css
- Implement form fields: proceso selector dropdown (from datastore.processes with process_bcms_data filtering), escenario dropdown (from disruption_scenarios), fecha_evaluacion datepicker, revisor dropdown (from datastore.contacts)
- Add client-side validation: required fields (proceso, escenario, fecha), valid date ranges, proceso must have existing process_bcms_data entry (use validateCascade helper)
- Implement save/update functions that write to datastore.biaAssessments array with proper ID generation (max ID + 1), created_at/updated_at timestamps, and close modal on success

### Task 2.3 – Create BIA impacts table with responsive design - Agent_Frontend_BIA_RIA
**Objective:** Implement master impacts table using DynamicTable component with BancoEstado impact types.
**Output:** Responsive impacts table with columns, filters, and horizontal scroll pattern.
**Guidance:** **Depends on: Task 2.1 output**. Use DynamicTable component from `mockup_v2/js/components/DynamicTable.js`. Apply responsive wrapper with overflow-x: auto matching "Procesos Críticos - Vista Detallada" standard.

- Instantiate DynamicTable for BIA impacts with columns: proceso name (lookup), escenario name, tipo_impacto dropdown (5 BancoEstado tipos from impact_types), severidad selector (lookup_values), time_bucket selector (6 rangos), notas text area
- Configure multi-column filters: proceso dropdown (multi-select), tipo_impacto checkboxes (5 tipos), time_bucket range selector (slider or multi-select)
- Wrap table in responsive container div with CSS class `table-responsive` and style `overflow-x: auto; -webkit-overflow-scrolling: touch;` matching standard pattern from Dashboard

### Task 2.4 – Implement BIA objectives configuration (RTO/RPO/MTPD) - Agent_Frontend_BIA_RIA
**Objective:** Create recovery objectives configuration interface for critical processes.
**Output:** Objectives panel/modal with RTO, RPO, MTPD, MBCO fields and validation.
**Guidance:** **Depends on: Task 2.2 output**. Link objectives to BIA assessments. Reference ISO 22301 definitions for tooltips.

- Create objectives configuration panel/modal for BIA assessment with fields: RTO (recovery time objective, numeric), RPO (recovery point objective, numeric), MTPD (maximum tolerable period of disruption, numeric), MBCO (minimum business continuity objective, text description)
- Implement numeric input fields with unit dropdowns for time conversion (hours/days), validation rules: RTO < MTPD, RPO < RTO, all values > 0, realistic upper bounds
- Add guidance tooltips explaining each metric with ISO 22301 definitions: RTO (tiempo máximo aceptable para recuperar), RPO (pérdida máxima aceptable de datos), MTPD (tiempo más allá del cual la organización no sobreviviría), MBCO (nivel mínimo de servicios necesarios)
- Implement save function to datastore.biaObjectives array linked to assessment_id and process_id with validation on both local (client-side) and cascade level

### Task 2.5 – Create BIA dependencies mapping interface - Agent_Frontend_BIA_RIA
**Objective:** Implement dependencies mapping for critical process resources.
**Output:** Multi-select interface for proveedores, activos, ubicaciones, sistemas, personal with relationship persistence.
**Guidance:** **Depends on: Task 2.2 output**. Map dependencies to existing datastore entities (suppliers, assets, locations, contacts). Store relationships in datastore.biaDependencies.

- Create dependencies section with multi-select dropdowns for 5 dependency types: proveedores (from datastore.suppliers), activos (from datastore.assets), ubicaciones (from datastore.locations), sistemas (custom text list managed in datastore.systems), personal_clave (from datastore.contacts with role filtering)
- Implement relationship persistence in datastore.biaDependencies as array with structure: {id, assessment_id, dependency_type, target_entity_id, criticality_level, notas}
- Display mapped dependencies in editable table showing columns: dependency_type icon/label, entity_name (resolved via getById helper), criticality_level badge (Alta/Media/Baja), actions column (delete button)
- Add validation rules: at least one dependency required per critical process (severity check), prevent duplicate entries within same assessment + dependency_type + entity combination

---

## Phase 3: RIA Migration (Gate 1 - Part 2)

### Task 3.1 – Migrate RIA master view to dynamic render with BIA integration - Agent_Frontend_BIA_RIA
**Objective:** Convert RIA view to dynamic rendering with BancoEstado >24h filter from BIA.
**Output:** RIA view with `renderRIAView()`, BIA critical process filtering, tabs (Evaluaciones, Matriz, Tratamientos, Controles).
**Guidance:** **Depends on: Task 2.4 output by Agent_Frontend**. Implement BancoEstado business rule: only processes with BIA impacto >24h AND nivel MEDIO_ALTO/ALTO appear in RIA scope.

1. Analyze current RIA HTML structure in `index_refactor.html` and identify integration points with BIA data for filtering
2. Implement BIA critical process filter function `getCriticalProcessesForRIA()`: query datastore.biaImpacts where time_bucket IN ['24-36h', '>36h'] AND nivel_impacto IN ['MEDIO_ALTO', 'ALTO', 'CRÍTICO'], return unique process IDs (BancoEstado rule)
3. Create `renderRIAView()` function in functions.js consuming datastore.risks filtered by critical process IDs from step 2
4. Implement tab navigation system with 4 tabs: Evaluaciones, Matriz, Tratamientos, Controles with dynamic content switching and context preservation
5. Replace static HTML with render calls maintaining INICIO/FIN VISTA comments and component-level structure
6. Test BIA→RIA cascade: create test BIA with impacto <24h (should NOT appear in RIA), create BIA with >24h + ALTO (SHOULD appear), verify filter logic correctness

### Task 3.2 – Implement risk assessment form with inherent/residual calculations - Agent_DataLogic
**Objective:** Create risk assessment form with automatic risk level calculations.
**Output:** Risk assessment modal with inherent/residual calculation logic, control effectiveness integration, and validation.
**Guidance:** **Depends on: Task 3.1 output by Agent_Frontend**. Implement risk matrix formula: nivel = probabilidad × impacto (1-5 scale). Reference RiskMatrix component for calculation patterns.

1. Create risk assessment modal structure with proceso selector (from BIA critical processes only), escenario dropdown (linked to BIA assessment scenarios)
2. Implement inherent risk section with fields: probabilidad dropdown (5 levels from lookup_values: Muy Baja=1 to Muy Alta=5), impacto dropdown (5 levels), auto-calculate nivel_inherente using formula: probabilidad_value × impacto_value (result 1-25), display nivel with color coding
3. Add controls mitigation section: existing_controls multi-select (from datastore.controls), efectividad_control dropdown per selected control (No Efectivo=0%, Bajo=25%, Medio=50%, Alto=75%, Muy Alto=90%)
4. Implement residual risk calculation: adjusted_prob = probabilidad × (1 - max(efectividad_controls)), adjusted_impact = impacto × (1 - max(efectividad_controls)/2), nivel_residual = adjusted_prob × adjusted_impact, display with color coding
5. Add risk response section: respuesta_riesgo dropdown (Evitar, Mitigar, Transferir, Aceptar from lookup_values), justificacion_respuesta text area (required)
6. Implement save function to datastore.riskAssessments with validation: nivel_inherente > nivel_residual (unless Aceptar response), respuesta_riesgo required if nivel_residual > tolerance threshold (15), all calculations stored for audit trail

### Task 3.3 – Create risk matrix 5x5 visualization using RiskMatrix component - Agent_Visualization
**Objective:** Implement interactive 5×5 risk matrix with inherent/residual toggle.
**Output:** Functional RiskMatrix component displaying risks, click filtering, color-coded cells.
**Guidance:** **Depends on: Task 3.2 output by Agent_DataLogic** (cross-agent). Use RiskMatrix component from `mockup_v2/js/components/RiskMatrix.js`. Apply standard color scheme: verde (1-4), amarillo (5-9), naranja (10-14), rojo (15-25).

- Instantiate RiskMatrix component in RIA view tab "Matriz" with datastore.riskAssessments data mapped to {x: probabilidad, y: impacto, nivel: nivel_inherente/residual, label: proceso_name + escenario}
- Configure click handlers on matrix cells: on cell click, filter risk list view below matrix to show only risks within selected cell coordinates (prob, impact), highlight selected cell with border
- Implement toggle button "Ver: Inherente | Residual" that switches matrix data source between nivel_inherente and nivel_residual values, updating all risk positions dynamically and preserving selected filters
- Apply color scheme to matrix cells based on nivel ranges: verde (#28a745) for 1-4, amarillo (#ffc107) for 5-9, naranja (#fd7e14) for 10-14, rojo (#dc3545) for 15-25, with cell labels showing risk count per cell

### Task 3.4 – Implement risk treatments and control mapping interface - Agent_Frontend_BIA_RIA
**Objective:** Create treatment management and control-risk mapping interfaces.
**Output:** Treatments CRUD modal, treatments table, control mapping interface with junction table persistence.
**Guidance:** **Depends on: Task 3.2 output by Agent_DataLogic** (cross-agent). Store treatments in datastore.riskTreatments, control mappings in datastore.riskControlMapping.

1. Create risk treatments modal with fields: tipo_tratamiento dropdown (lookup: Preventivo, Correctivo, Detectivo), descripcion text area, responsable dropdown (contacts), fecha_compromiso datepicker, estado dropdown (Planificado, En Progreso, Completado, Vencido)
2. Implement treatments table per risk showing columns: tipo icon, descripcion (truncated with expand), responsable name, fecha_compromiso with overdue highlighting, estado badge, actions (edit, delete, mark complete button)
3. Create control mapping section below treatments: multi-select control picker from datastore.controls with search, "Crear Nuevo Control" button opening quick-add modal (nombre, descripcion, tipo, frecuencia)
4. Implement risk-control relationship persistence in datastore.riskControlMapping as junction array: {id, risk_id, control_id, efectividad_rating, fecha_mapeo, notas}, with efectividad affecting residual calculation in Task 3.2
5. Display integrated risk detail view: risk card header → treatments list (expandable) → mapped controls list with efectividad badges → actions footer (add treatment, map control)

### Task 3.5 – Create RIA reporting with BIA traceability - Agent_Frontend_BIA_RIA
**Objective:** Generate consolidated RIA report with end-to-end traceability.
**Output:** Master-detail report table with filters, traceability badges, and CSV/print export.
**Guidance:** **Depends on: Task 2.5 output and Task 3.4 output by Agent_Frontend**. Aggregate data: proceso → BIA assessment → risk assessment → treatments → controls. Use helper functions for data joining.

1. Create data aggregation function `generateRIAReport()` joining: datastore.processes → biaAssessments (via process_id) → riskAssessments (via assessment_id) → riskTreatments (via risk_id) → riskControlMapping + controls (via risk_id), using getById and getByField helpers
2. Implement master-detail table structure: master row shows proceso name, risk count, tratamientos activos count, controles mapeados count, nivel_riesgo_maximo badge; expandable detail row shows full risk breakdown (assessments table, treatments nested list, controls nested list)
3. Add filter panel above table: proceso multi-select dropdown, nivel_riesgo range slider (1-25 with color indicators), tipo_tratamiento checkboxes, estado_tratamiento dropdown, fecha_evaluacion date range picker
4. Create traceability badges for each master row: "BIA Vinculado" (green check if linked, red X if missing), "Riesgos Identificados" (count badge), "Tratamientos Activos" (count with % completado), "Controles Mapeados" (count with avg efectividad %)
5. Implement export functionality: CSV download button generates flattened data structure (one row per risk with all related data as columns), Print button opens print-friendly view with expanded all details and clean formatting

---

## Phase 4: BCP/DRP Migration (Gate 2)

### Task 4.1 – Migrate BCP master view with plan catalog and activation criteria - Agent_Frontend_Plans
**Objective:** Convert BCP view to dynamic rendering with BancoEstado plan codification and activation criteria editor.
**Output:** BCP view with `renderBCPView()`, plan catalog with codes (BCP02xx-09xx), activation criteria interface, tabs.
**Guidance:** **Depends on: Task 2.4 output by Agent_Frontend_BIA_RIA** and **Task 3.4 output by Agent_Frontend_BIA_RIA** (cross-agent). BCP plans link to critical processes (from BIA RTO/RPO) and risk scenarios (from RIA). BancoEstado codification: BCP02xx (crítico), BCP03xx (importante), BCP05xx (estándar), BCP07xx (soporte), BCP08xx (TI), BCP09xx (instalaciones).

1. Analyze current BCP HTML structure in `index_refactor.html` and identify plan catalog and forms to migrate
2. Create `renderBCPView()` function in functions.js consuming datastore.continuityPlans filtered by plan_type='BCP'
3. Implement plan catalog table with BancoEstado codification logic: on plan creation, auto-assign codigo based on plan classification dropdown (Crítico→BCP02xx, Importante→BCP03xx, etc.), increment xx within category (get max code in category + 1)
4. Create plan master form modal: codigo (readonly, auto-generated), nombre text input, plan_type (readonly='BCP'), classification dropdown (Crítico/Importante/Estándar/Soporte/TI/Instalaciones), target_process dropdown (from BIA critical processes), owner (contacts), version (auto v1.0, increment on updates), estado dropdown (Borrador/Activo/Archivado)
5. Implement activation_criteria editor as expandable panel within plan form: trigger_conditions multi-select (from disruption_scenarios used in BIA/RIA), umbrales_activacion (time threshold hours, impact threshold level), escalation_matrix table (severidad → responsable activation decision tree)
6. Setup tab navigation (Catálogo, Estrategias, Procedimientos, Call Tree, Pruebas) with plan context ID passing to child tabs via data-plan-id attribute

### Task 4.2 – Implement BCP plan editor with recovery strategies and procedures - Agent_Frontend_Plans
**Objective:** Create nested editors for recovery strategies and sequential procedures.
**Output:** Recovery strategies CRUD, procedures CRUD with sequencing, hierarchy display, validation.
**Guidance:** **Depends on: Task 4.1 output**. Strategies define "what" (alternatives, resources), procedures define "how" (steps, timing). Store in datastore.recoveryStrategies and datastore.recoveryProcedures with parent-child relationships.

1. Create recovery strategies modal for selected plan: nombre text, descripcion textarea, RTO_target numeric (hours), recursos_necesarios multi-select (activos, ubicaciones, proveedores from datastore), alternativa_primaria boolean checkbox, prioridad numeric (1=highest)
2. Implement strategies table per plan with columns: prioridad order, nombre (bold if primaria), RTO_target badge, recursos count, actions (edit, delete, set as primary button), drag-and-drop reordering for prioridad
3. Create recovery procedures modal: parent_strategy_id dropdown (strategies for current plan), sequence_number numeric, título text, descripcion_detallada rich textarea, responsable_rol dropdown (roles catalog), tiempo_estimado numeric (minutes), dependencias_procedure multi-select (other procedures in same strategy, prevents circular)
4. Implement procedures table with nested structure under each strategy: sequence column, título (collapsible to show/hide descripcion), responsable badge, tiempo cumulative display, drag-and-drop reordering for sequence within strategy
5. Display hierarchy view in "Estrategias" tab: plan header → strategies list (cards) → each strategy card expands to show nested procedures list with visual indentation (border-left colored line)
6. Add validation logic: at least one strategy required per active plan, at least one procedure required per strategy, no circular dependencies in procedure.dependencias (recursive check), cumulative strategy tiempo must be ≤ RTO_target with warning if exceeded

### Task 4.3 – Create call tree builder for BCP activation - Agent_Frontend_Plans
**Objective:** Implement hierarchical call tree builder with drag-and-drop and export.
**Output:** Interactive call tree using HierarchyTree component, contact assignment, templates, PDF export.
**Guidance:** **Depends on: Task 4.1 output**. Use HierarchyTree component from `mockup_v2/js/components/HierarchyTree.js`. Store in datastore.callTrees with node structure.

1. Create call tree data structure in datastore.callTrees: {id, plan_id, nodes: [{id, parent_id, role_name, contact_id, phone_primary, phone_alternate, email, sequence, notas}]}, root nodes have parent_id=null
2. Implement visual tree builder in "Call Tree" tab using HierarchyTree component with drag-and-drop capabilities: nodes can be dragged to reorder sequence at same level or reparented to different branch, visual feedback on hover/drop
3. Add contact assignment interface: click node opens modal to search/select from datastore.contacts, assign primary phone (required), alternate phone (optional), email (optional), role_name can be overridden from contact's default role
4. Create call tree templates system: "Crisis Standard" template pre-creates structure (Líder Crisis → Comité Crisis → 4 Equipos Recuperación), "Simple" template (Líder → Equipos directos), "Custom" starts empty, templates insertable via dropdown on new tree creation
5. Implement export functionality: "Exportar PDF" button generates print-friendly document with tree visualization (indented hierarchy with lines), full contact details per node (name, role, phones, email), sequence numbers, plan metadata header, footer with "Documento Confidencial - Plan de Continuidad"

### Task 4.4 – Migrate DRP view with technical recovery procedures - Agent_Frontend_Plans
**Objective:** Convert DRP view to dynamic rendering with technical focus and IT asset integration.
**Output:** DRP view with `renderDRPView()`, technical plan catalog, asset linkage, backup/restoration procedures.
**Guidance:** **Depends on: Task 4.1 output**. DRP follows same plan structure as BCP but with technical domain focus: sistemas, aplicaciones, infraestructura. Link to datastore.assets (IT assets).

1. Analyze DRP HTML structure in `index_refactor.html` and identify technical recovery components to migrate
2. Create `renderDRPView()` function in functions.js consuming datastore.continuityPlans filtered by plan_type='DRP'
3. Implement DRP plan catalog with technical classification dropdown: DRP_Aplicaciones, DRP_Infraestructura, DRP_Datos, DRP_Redes (appears in plan form as classification field, no auto-code like BCP)
4. Create DRP plan form: similar structure to BCP form (Task 4.1) but with additional technical fields: target_asset dropdown (from datastore.assets filtered by tipo='TI'), RTO_tecnico numeric (hours), RPO_tecnico numeric (hours/data loss tolerance), backup_strategy dropdown (Completo/Incremental/Diferencial), recovery_site text (Primario/Secundario/Cloud/Híbrido)
5. Implement technical procedures editor (similar to Task 4.2 procedures but technical focus): backup_procedures array (schedule cron, media tipo, retention días, validation steps), restoration_procedures array (sequence steps, validation checkpoints, rollback steps), failover_procedures array (trigger conditions, switchover steps, verification tests)
6. Add asset integration panel: link DRP plan to datastore.assets, display asset dependencies tree (using HierarchyTree component) showing upstream/downstream dependencies from asset relationships, highlight critical path for recovery priority

### Task 4.5 – Implement plan testing and evidence tracking - Agent_Frontend_Plans
**Objective:** Create testing tracking system for BCP/DRP plans with evidence management.
**Output:** Test scheduler, execution form, evidence tracker, results analysis, hallazgos integration.
**Guidance:** **Depends on: Task 4.2 output** and **Task 4.4 output**. Store in datastore.planTests. Link to datastore.hallazgos for findings. Tests validate plan effectiveness per ISO 22301 cl. 8.5.

1. Create plan test scheduler interface in "Pruebas" tab: calendar view (using Timeline component or custom calendar) showing planned tests color-coded by plan and test tipo, "Crear Prueba" button opens test planning modal (tipo dropdown: Tabletop/Walkthrough/Simulacro/Completo, plan_id, fecha_programada, alcance text, participantes_planificados multi-select contacts)
2. Implement test execution form (opens when user clicks "Ejecutar" on planned test): fecha_ejecucion (auto today, editable), tipo_prueba_real (can differ from planned), participantes_reales multi-select, duracion_minutos numeric, resultado dropdown (Exitoso/Parcial con Observaciones/Fallido), observaciones_generales textarea
3. Add evidence tracking section within test form: simulated file upload interface (no actual file storage, just metadata), evidence metadata fields (filename text, tipo_evidencia dropdown: Acta/Registro/Comunicaciones/Checklist/Fotos, descripcion textarea), store as evidencias array in datastore.planTests
4. Create test results analysis section showing post-execution: comparacion_RTO table (RTO_objetivo vs RTO_logrado per procedure, variance calculation %), identificacion_GAPs textarea listing issues found, rating_efectividad_plan dropdown (Excelente/Bueno/Aceptable/Deficiente/Inaceptable), recomendaciones textarea
5. Implement hallazgos integration: "Crear Hallazgo desde Prueba" button in test results view that opens hallazgo modal pre-populated with test data (descripcion=GAPs, origen='Prueba Plan', fecha=test fecha, severidad=based on resultado), saves to datastore.hallazgos with test_id link, bidirectional navigation (test→hallazgos, hallazgo→test)
6. Display test calendar and compliance tracking: upcoming tests count, overdue tests alert badge, test frequency compliance per plan (annual requirement per ISO 22301, show last test date and next due date), historical test results trend chart (pass/fail rate over time per plan)

---

## Phase 5: Supporting Modules (Proveedores, Gobierno, Configuración)

### Task 5.1 – Migrate Proveedores & Terceros Críticos view with TPRM evaluation - Agent_Frontend_Operations
**Objective:** Convert Proveedores view to dynamic rendering with TPRM (Third-Party Risk Management) evaluation and BIA dependency integration.
**Output:** Proveedores view with supplier catalog, criticality assessment, TPRM evaluation, SLA tracking, BIA linkage.
**Guidance:** **Depends on: Task 2.5 output by Agent_Frontend_BIA_RIA** (cross-agent). Suppliers linked from BIA dependencies become critical suppliers requiring TPRM. Store evaluations in datastore.supplierEvaluations.

1. Create `renderProveedoresView()` function consuming datastore.suppliers with criticality flag (calculate from biaDependencies: if supplier appears in dependencies for critical process, mark as crítico)
2. Implement supplier catalog table with columns: nombre, tipo_servicio, criticality badge (Crítico/Alto/Medio/Bajo based on process dependencies count), estado (Activo/Inactivo/En Evaluación), última_evaluación date, actions (view detail, evaluate, edit)
3. Create TPRM evaluation modal for critical suppliers: criterios_evaluacion (Financiero/Operacional/Seguridad/Cumplimiento/Continuidad), scoring system (1-5 per criterio), puntaje_total auto-sum, nivel_riesgo_proveedor calculated (similar to RIA matrix), controles_requeridos multi-select, plan_contingencia_proveedor textarea
4. Add SLA tracking panel per supplier: SLA agreements table (servicio, metrica, objetivo, real, cumplimiento %), SLA compliance chart over time, breaches log with dates and impact
5. Display BIA linkage section: show which processes depend on this supplier (from biaDependencies via dependency_type='proveedor'), highlight if supplier has open issues (hallazgos, SLA breaches), alert if critical supplier without TPRM evaluation

### Task 5.2 – Migrate Gobierno (Políticas & Estrategias) view - Agent_Frontend_Operations
**Objective:** Convert Gobierno view to dynamic rendering with BCMS policy management and strategic objectives.
**Output:** Gobierno view with policy catalog, roles & responsibilities matrix, strategic objectives tracking.
**Guidance:** Straightforward catalog view. Store policies in datastore.policies, strategic objectives in datastore.strategicObjectives.

- Create `renderGobiernoView()` function with tabs: Políticas, Roles & Responsabilidades, Objetivos Estratégicos, consuming respective datastore arrays
- Implement policies catalog table: nombre_politica, version, fecha_aprobacion, owner, estado (Vigente/Revisión/Archivado), documento_ref (simulated link), actions (view, edit, new version)
- Create roles & responsibilities matrix editor: RACI matrix (Responsible/Accountable/Consulted/Informed) for BCMS activities, rows=activities (BIA execution, RIA execution, Plan testing, etc.), columns=roles (Owner BCMS, Manager Continuidad, etc.), cells=RACI assignment dropdowns
- Add strategic objectives tracker: objective text, KPI asociado, target value, current value, progress bar, owner, due date, status badge (On Track/At Risk/Delayed), quarterly review notes

### Task 5.3 – Migrate Configuración del Sistema view - Agent_Frontend_Operations
**Objective:** Convert Configuración view to dynamic rendering with system parameters and lookup management.
**Output:** Configuración view with system parameters editor, lookup sets manager, audit logs viewer.
**Guidance:** Technical configuration view. Store configs in datastore.systemConfig, allow lookup_values editing.

- Create `renderConfiguracionView()` function with sections: Parámetros Generales, Catálogos (Lookup Sets), Logs de Auditoría
- Implement system parameters editor: key-value pairs table showing config like (RTO_default_hours, email_notifications_enabled, max_file_size_mb, session_timeout_minutes), inline editing, validation per parameter type
- Create lookup sets manager: list all lookup_sets from datastore (risk_levels, impact_levels, etc.), expandable to show lookup_values, add/edit/delete values with validation (no delete if value in use), reorder values for display order
- Add audit logs viewer: read-only table from datastore.auditLog showing timestamp, user, action (Created/Updated/Deleted), entity_type, entity_id, changes_summary JSON display, filterable by date range and entity type

---

## Phase 6: Operational Modules (Crisis, Comunicaciones, Incidentes refinement)

### Task 6.1 – Migrate Crisis Management view with plan activation - Agent_Frontend_Operations
**Objective:** Convert Crisis view to dynamic rendering with crisis declaration, plan activation, timeline, and decisions tracking.
**Output:** Crisis view with crisis catalog, activation interface, timeline visualization, decisiones log.
**Guidance:** **Depends on: Task 4.1 output by Agent_Frontend_Plans** and **Task 4.4 output by Agent_Frontend_Plans** (cross-agent). Crisis activates BCP/DRP plans. Store in datastore.crisisDeclarations. Use Timeline component for event chronology.

1. Create `renderCrisisView()` function with tabs: Declaraciones, Línea de Tiempo, Comité de Crisis, Decisiones, consuming datastore.crisisDeclarations
2. Implement crisis declaration form: nombre_crisis, tipo_crisis (from disruption_scenarios), fecha_inicio datetime, severidad (Menor/Moderado/Mayor/Catastrófico), alcance text, estado (Abierta/En Resolución/Cerrada), declarante (contact), activated_plans multi-select (from BCP/DRP plans)
3. Create plan activation interface within crisis detail: button "Activar Plan" opens modal to select BCP or DRP plan, on activation, create activation record (plan_id, crisis_id, fecha_hora_activacion, responsable_activacion), update plan estado to 'Activado', send simulated notifications to call tree contacts
4. Implement timeline visualization using Timeline component: display chronological events (crisis inicio, plan activations, key decisions, resolution actions, crisis cierre), interactive timeline with zoom/pan, click event to see details, add event button for manual entries
5. Add decisiones log table: fecha_hora, decision text, tomada_por (contact from comité crisis), impacto text, acciones_derivadas array, estado_decision (Pendiente/Implementada/Rechazada), link to related plans or procedures activated by decision

### Task 6.2 – Migrate Comunicaciones de Crisis view with message templates - Agent_Frontend_Operations
**Objective:** Convert Comunicaciones view to dynamic rendering with message templates, simulated sending, and message log.
**Output:** Comunicaciones view with template library, message composer, simulated send, bitácora.
**Guidance:** **Depends on: Task 6.1 output** (same agent). Communications linked to active crisis. Store templates in datastore.communicationTemplates, sent messages in datastore.communicationLog.

1. Create `renderComunicacionesView()` function with sections: Plantillas, Nuevo Mensaje, Bitácora de Envíos, consuming datastore.communicationTemplates and communicationLog
2. Implement communication templates library: table showing template name, category (Interna/Externa/Medios/Regulador), subject, body preview, actions (use template, edit, delete), "Crear Plantilla" button
3. Create message composer interface: crisis selector dropdown (active crises only), template selector (optional, pre-fills fields), destinatarios type checkboxes (Empleados/Clientes/Proveedores/Medios/Regulador/Otro), subject text, body rich textarea with variables {{crisis_name}}, {{fecha}}, {{contacto}}, prioridad dropdown (Normal/Alta/Urgente)
4. Implement simulated send functionality: "Enviar" button writes to datastore.communicationLog with timestamp, destinatarios, message content, estado='Enviado', shows success toast notification, no real email/SMS sending
5. Display bitácora table: chronological log showing fecha_hora, crisis name, destinatarios summary, subject, estado badge (Enviado/En Cola/Fallido simulated), actions (view full message, reenviar)

### Task 6.3 – Refine Incidentes view integration with BCP/DRP - Agent_Frontend_Operations
**Objective:** Enhance existing Incidentes view with BCP/DRP plan linkage and escalation to crisis.
**Output:** Updated Incidentes view with plan activation option and crisis escalation button.
**Guidance:** **Depends on: Task 4.1 output by Agent_Frontend_Plans** (cross-agent). Incidentes view already exists and is refactored. Add integration points: link incident to plan, escalate to crisis.

- Add campo "plan_relacionado_id" to incident form as optional dropdown (select from BCP/DRP plans if incident affects critical process)
- Implement "Activar Plan" button in incident detail view (visible when plan linked): on click, creates crisis declaration pre-populated with incident data, activates linked plan, redirects to Crisis view with new crisis ID
- Add escalation logic: "Escalar a Crisis" button appears when incident severidad='Alta' or duration > threshold, opens crisis declaration modal with incident context (tipo, descripcion, fecha_inicio pre-filled), on save creates crisis and links incident_id
- Display linkage badges in incident list: badge "Plan Vinculado" if plan_relacionado_id exists, badge "Escalado a Crisis" if crisis exists, click badge navigates to plan/crisis detail

---

## Phase 7: Dashboard & Reportes (Visual Integration)

### Task 7.1 – Migrate Dashboard with KPI cards and process criticality chart - Agent_Visualization
**Objective:** Convert Dashboard to dynamic rendering with KPI cards and Charts.js visualizations.
**Output:** Dashboard view with 6 KPI cards, process criticality chart, risk distribution chart, plan status chart.
**Guidance:** **Depends on: Phase 2-4 outputs by Agent_Frontend_BIA_RIA, Agent_DataLogic, Agent_Frontend_Plans** (cross-agent). Use KPICard component and Chart.js from `mockup_v2/js/charts.js`. Aggregate data from multiple modules.

1. Create `renderDashboardView()` function aggregating data: count critical processes (from BIA >24h), count active risks (from RIA), count active plans (BCP+DRP), count pending hallazgos, calculate avg plan test frequency, calculate overall BCMS maturity score (simple formula: completeness of modules)
2. Implement 6 KPI cards using KPICard component: "Procesos Críticos" (count + trend), "Riesgos Activos" (count colored by level), "Planes Vigentes" (count BCP+DRP), "Pruebas Pendientes" (count overdue), "Hallazgos Abiertos" (count by severidad), "Madurez BCMS" (percentage score with progress bar)
3. Create process criticality chart using Chart.js bar chart: X-axis=processes, Y-axis=criticality score (calculated from BIA impacto + time bucket + dependencies count), color-coded bars (red=crítico, orange=alto, yellow=medio), click bar to navigate to process BIA detail
4. Add risk distribution chart using Chart.js doughnut chart: segments=nivel_riesgo categories (Bajo/Medio/Alto/Crítico), show count per segment, click segment filters to RIA view with that level
5. Create plan status chart using Chart.js horizontal bar: categories=plan types (BCP/DRP), stacked bars showing estado (Borrador/Activo/En Prueba/Archivado), click bar opens plan catalog filtered by type and estado

### Task 7.2 – Migrate Reportes view with consolidated traceability - Agent_Frontend_Reports_QA
**Objetivo:** Convert Reportes view to dynamic rendering with report templates and consolidated exports.
**Output:** Reportes view with report templates (BIA/RIA/BCP/Cumplimiento ISO 22301), filters, PDF/CSV export.
**Guidance:** **Depends on: Phase 2-7 outputs by multiple agents** (cross-agent). Consolidate data from all modules. Reports demonstrate ISO 22301 compliance and BancoEstado requirements.

1. Create `renderReportesView()` function with report template selector: BIA Consolidado, RIA Consolidado, Planes BCP/DRP, Cumplimiento ISO 22301, Trazabilidad Ficha→BIA→RIA→BCP, report selector dropdown with descriptions
2. Implement BIA Consolidado report: aggregates all BIA assessments with impact analysis, shows per process: impactos by tipo (5 tipos), time buckets distribution, RTO/RPO/MTPD, dependencies count, filterable by proceso/time_bucket/impact_level, exportable to CSV with all detail fields
3. Implement RIA Consolidado report: aggregates all risk assessments, risk matrix visualization, treatments summary, controls effectiveness, filterable by proceso/nivel_riesgo/estado_tratamiento, exportable with risk detail + treatment status
4. Implement Planes BCP/DRP report: catalog with metadata, test history per plan, gaps identified, próximas pruebas, compliance status (annual test requirement), filterable by plan_type/estado/classification, exportable with full plan structure
5. Implement Cumplimiento ISO 22301 report: checklist of ISO clauses (4.1-10.2), mapping to BCMS modules (evidence), completeness %, gaps identified, recommendations, exportable as PDF formatted for audit presentation
6. Create Trazabilidad Ficha→BIA→RIA→BCP report (BancoEstado specific): select proceso, show full cascade: Ficha proceso data → BIA assessment → critical scenarios → RIA risks → treatments → BCP/DRP plans → test results → evidences, visualize as flowchart or indented hierarchy, exportable as PDF with all detail drill-down

### Task 7.3 – Create Vista Integrada enhancement with BancoEstado flow - Agent_Frontend_Reports_QA
**Objective:** Enhance existing Vista Integrada with BancoEstado-specific workflow visualization.
**Output:** Updated Vista Integrada showing Ficha→BIA→RIA→BCP flow with status indicators.
**Guidance:** Vista Integrada already exists. Add BancoEstado cascade visualization with proceso selector, status badges showing completion per stage.

- Add proceso selector dropdown at top of Vista Integrada, on selection load full cascade data for that proceso using aggregation function (similar to Task 7.2 Trazabilidad report)
- Implement visual flow diagram: 5 stages displayed as horizontal progress steps (Ficha Proceso → BIA → RIA → BCP/DRP → Pruebas/Evidencias), each stage shows completion badge (Completo/Incompleto/No Aplica) and summary count
- Add expandable detail panel per stage: click stage opens drawer with stage-specific data (BIA impactos table, RIA risks table, BCP procedures list, test history), inline actions (go to module, add missing data)
- Display overall process health score: calculated from completeness of stages (100% if all stages complete for critical process), color-coded badge, alert if critical process has incomplete stages

---

## Phase 8: QA Transversal & Normalización Final

### Task 8.1 – Cross-module validation and data integrity check - Agent_DataLogic
**Objective:** Validate data integrity and relationships across all modules.
**Output:** Validation report showing broken relationships, orphaned records, and integrity issues.
**Guidance:** Use validateCascade helper and custom validation rules. Generate report of issues to fix.

- Implement comprehensive data integrity validation script: check proceso→BIA→RIA→BCP cascade (no orphaned risks, all critical processes have BIA), validate foreign keys (all references to contacts/assets/suppliers exist), check required fields completeness (critical plans have strategies, strategies have procedures)
- Run validation checks: broken relationships (risk without BIA, BCP without critical process), orphaned records (biaDependencies referencing deleted suppliers), missing required data (active plans without tests, critical suppliers without TPRM), duplicate records (same entity with different IDs)
- Generate validation report as console output or exportable table: issue_type, entity_type, entity_id, description, severity (Critical/High/Medium/Low), recommended_action
- Fix critical issues identified: remove orphaned records, restore missing relationships where data exists, flag unresolvable issues for user review

### Task 8.2 – UI/UX normalization (buttons, badges, tables responsive) - Agent_Frontend_Reports_QA
**Objective:** Standardize UI components across all views for visual consistency.
**Output:** All views using consistent button styles, badge colors, table responsive patterns.
**Guidance:** Apply patterns from `mockup_v2/css/styles.css` and `mockup_v2/css/components/dynamic-table.css`. Remove inline styles.

- Audit all views in `index_refactor.html` for inline styles (style attribute), extract to CSS classes in styles.css or component-specific CSS files, remove inline style attributes
- Standardize button classes: all primary actions use `.btn-primary`, secondary use `.btn-secondary`, danger use `.btn-danger`, ensure consistent sizing (`.btn-sm` for inline actions, default for modals), apply to all views
- Normalize badge usage: use consistent badge classes for estados (`.badge-success` for Activo/Completado, `.badge-warning` for En Progreso, `.badge-danger` for Vencido/Crítico, `.badge-secondary` for Borrador/Inactivo), apply consistently to all status displays
- Ensure all tables use responsive wrapper pattern: every table wrapped in `<div class="table-responsive" style="overflow-x: auto;">`, test on narrow viewport (< 768px) to verify horizontal scroll without page-level overflow, fix any remaining table overflow issues

### Task 8.3 – Performance optimization and final testing - Agent_Frontend_Reports_QA
**Objective:** Optimize rendering performance and conduct final functional testing.
**Output:** Performance improvements applied, final test checklist completed, no console errors.
**Guidance:** Target <3000ms for view rendering (BancoEstado requirement). Test all navigation, forms, filters.

- Profile view rendering performance: measure time for each renderView function execution, identify slow operations (large data iterations, DOM manipulations), optimize with batch DOM updates, lazy loading for large tables (DynamicTable pagination), debounce filter inputs
- Minimize datastore query complexity: cache frequently accessed data (processes list, lookups), add indexes to datastore helper functions (getByField with memoization), reduce nested loops in aggregation functions
- Conduct functional testing checklist: test all view navigation (showView for all 24 views), test all forms (create/edit/delete operations), test all filters and search functions, test Chart.js charts (data updates correctly), test component interactions (modals, tabs, accordions), verify no console errors or warnings
- Fix any bugs identified during testing, verify BIA→RIA→BCP cascade works end-to-end with test data, confirm responsive design on mobile viewport

### Task 8.4 – Update documentation and checklist - Agent_DataLogic
**Objective:** Update project documentation with completed state.
**Output:** Updated `checklist_pendientes.md` and final datastore contract documentation.
**Guidance:** Mark completed views, document any pending items, update datastore API documentation.

- Update `mockup_v2/docs/checklist_pendientes.md`: mark all migrated views as COMPLETADO with completion date, note any pending items or known issues with severity, add summary section showing overall project completion percentage
- Update `mockup_v2/docs/BCMS_v11_datastore_mapping_contract.md`: ensure all datastore entities used in implementation are documented, add any new helper functions created during phases, include data flow diagrams if helpful
- Create brief migration summary document: list which views were migrated, key functional changes from mockup_final.html, known deviations or pending features, recommendations for next phase (if moving to React/SpringBoot)
- Final commit: commit all changes with message "feat(mockup): Complete BCMS mockup migration - 8 phases, BIA/RIA/BCP/DRP/Dashboard/QA", tag as `v1.0-mockup-complete`

---

