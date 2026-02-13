# Contexto Maestro BCMS v11 vs datastore.js + BancoEstado (BIA/RIA/Ficha/Anexo7/Seed)

## 1. Objetivo
Este documento consolida el contexto técnico y funcional para migrar el mockup desde una base `datastore.js` alineada a v10 hacia `BCMS_PostgreSQL_schema_v11.sql`, usando como fuente operativa los insumos de BancoEstado:
- `docs/BIA Operar Convenios de Pago.xlsx`
- `docs/RIA Operar Convenios de Pago.xlsx`
- `docs/Ficha Operar Convenios de Pago.xlsx`
- `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt`
- `docs/SEED_BCMS_v11_catalogos_bia_ria.sql`

Tambien deja lineamientos para el objetivo de producto actual:
- Migrar `mockup_v2/backup/mockup_final.html` hacia `mockup_v2/index_refactor.html` con mejor arquitectura de estados/objetos, sin perder cobertura funcional.

Artefactos de apoyo ya generados:
- Contrato de mapeo entidad-tabla: `mockup_v2/docs/BCMS_v11_datastore_mapping_contract.md`
- Seed JS v11 minimo para cadena 17896: `mockup_v2/js/datastore_v11.js`

## 2. Fuentes verificadas
- Esquema objetivo: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql`
  - Tabla `organizations`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:114`
  - BIA/RIA core: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:775`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:920`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:948`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1450`
  - Planes/pruebas: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1270`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1423`
  - BCMS gobierno: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2545`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2574`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2602`
- Datastore actual: `mockup_v2/js/datastore.js`
  - Declarado v10: `mockup_v2/js/datastore.js:3`, `mockup_v2/js/datastore.js:7`, `mockup_v2/js/datastore.js:28`
  - Entidades: `mockup_v2/js/datastore.js:313`
  - API CRUD mockup: `mockup_v2/js/datastore.js:4726`
- Seed v11 (catalogos BIA/RIA): `docs/SEED_BCMS_v11_catalogos_bia_ria.sql`
  - Regla `ria.trigger_rule`: `docs/SEED_BCMS_v11_catalogos_bia_ria.sql:26`
  - Lookup sets/values: `docs/SEED_BCMS_v11_catalogos_bia_ria.sql:48`, `docs/SEED_BCMS_v11_catalogos_bia_ria.sql:70`
  - Escenarios de disrupcion: `docs/SEED_BCMS_v11_catalogos_bia_ria.sql:282`
- Reglas operativas BancoEstado (Anexo 7):
  - Registro BIA/RIA: `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:915`
  - Disparo RIA por BIA: `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:979`
  - BCP y pruebas: `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1174`
  - Panel integrado Ficha+BIA+RIA+BCP: `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1262`
  - Responsividad/autenticacion/performance: `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1573`, `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1595`, `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1608`

## 3. Diagnostico de brecha: schema v11 vs datastore.js

### 3.1 Resumen cuantitativo
- Tablas en `schema_v11`: **101**
- Entidades efectivas en `datastore.js` (runtime): **65**
- Entidades con mapeo tecnico a tabla v11: **47**
- Tablas cubiertas por ese mapeo: **46**
- Entidades sin mapeo claro a v11: **18**
- Tablas v11 sin representacion en datastore: **55**

### 3.2 Hallazgos criticos
1. **Version desalineada**
- `datastore.js` se declara alineado a v10 (`schemaVersion: 'v10'`).
- Objetivo actual es v11.

2. **Colisiones por claves duplicadas en `entities`**
- En el archivo hay claves repetidas (`bcmsPolicies`, `bcmsObjectives`, `managementReviews`).
- En objeto JS literal, prevalece la ultima definicion y puede perderse informacion previa.
- Evidencia de duplicados: `mockup_v2/js/datastore.js:4616`, `mockup_v2/js/datastore.js:4643`, `mockup_v2/js/datastore.js:4681`.

3. **Brecha fuerte de entidades BIA/RIA v11**
- Existen en v11: `bia_assessments`, `bia_impact_matrix`, `ria_assessments`, `ria_items`, `disruption_scenarios`, `time_buckets`, `impact_types`.
- En datastore no existe representacion equivalente con esa granularidad (solo `biaDependencies` y riesgos generales).

4. **Brecha de auditoria en muchas entidades del datastore**
- Regla del proyecto: entidades no intermedias deben tener `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`, `is_deleted`.
- En datastore, varias entidades no incluyen set completo de auditoria.

### 3.3 Entidades del datastore sin mapeo claro v11 (18)
- `appServices`
- `bcmsContext`
- `bcmsRiskAppetites`
- `bcmsRiskCriteria`
- `bcmsRiskReviewCadences`
- `biaDependencies`
- `communicationTemplates`
- `executiveReports`
- `organizationalUnits`
- `resourceCapacities`
- `resourceInventory`
- `riskCategories`
- `riskCauses`
- `riskEffects`
- `supplierAssessments`
- `supplierContracts`
- `trainingPrograms`
- `trainingRecords`

### 3.4 Tablas v11 sin representacion en datastore (extracto de alto impacto)
- Config/catalogos: `application_settings`, `lookup_sets`, `lookup_values`, `time_buckets`, `impact_types`, `disruption_scenarios`
- BIA/RIA: `bia_assessments`, `bia_impact_matrix`, `bia_impacts`, `bia_objectives`, `ria_assessments`, `ria_discriminations`, `ria_discrimination_items`, `ria_items`
- Integracion proceso-organizacion: `organization_macroprocess`, `organization_process`, `organization_subprocess`
- Plan/ejecucion: `plan_sections`, `process_dependencies`, `bia_dependency_assessments`, `process_critical_personnel`
- Operacion/compliance: `incident_timeline`, `incident_impacts`, `incident_regulatory_reports`, `incident_regulatory_submissions`, `risk_assessments`, `risk_treatments`, `risk_control_mapping`
- Evidencias/aprobacion: `evidences`, `evidence_versions`, `entity_approvals`, `entity_approval_signatures`

## 4. Conexiones y forma de trabajo (BancoEstado)

## 4.1 Flujo operativo obligatorio (Anexo 7)
Flujo base:
1. Ficha del proceso (personas, infraestructura, sistemas, proveedores, datos operativos).
2. BIA por escenario + escalas de tiempo + impacto final.
3. Si escenario BIA es critico (impacto >24h y nivel Medio Alto/Alto), ejecutar RIA.
4. RIA define controles/respuesta/contingencia.
5. Segun respuesta, crear/actualizar BCP y programar pruebas.
6. Integrar en panel de continuidad (Ficha + BIA + RIA + BCP + pruebas + acciones).

Referencias:
- `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:915`
- `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:979`
- `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1174`
- `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1262`

## 4.2 BIA Operar Convenios (datos clave levantados)
Proceso:
- Nombre: `Operar Convenios de Pago`
- ID proceso: `17896`

Escenarios detectados en planilla BIA:
- Indisponibilidad parcial de personal
- Indisponibilidad masiva de personal (SSMM)
- Indisponibilidad de infraestructura
- Indisponibilidad de proveedores
- Indisponibilidad de sistemas
- Ataque de ciberseguridad

Campos relevantes que deben mapearse:
- Impacto maximo hasta 24h
- Tipo de impacto (ej.: Clientes)
- MTPD
- RTO

Escalas horarias BIA:
- `< 1 HORA`
- `ENTRE 1 Y 2 HORAS`
- `ENTRE 2 Y 6 HORAS`
- `ENTRE 6 Y 24 HORAS`
- `ENTRE 24 Y 36 HORAS`
- `> 36 HORAS`

## 4.3 RIA Operar Convenios (datos clave levantados)
Estructura matriz (hoja `2 Matriz Continuidad`):
- Etapas/actividades
- Riesgos de perdida
- Factor de riesgo / factor especifico
- Controles identificados
- Tipo de impacto / mayor impacto 24h
- Probabilidad
- Evaluacion del control
- RI / RR / riesgo inherente / residual
- Beta / residual con beta / residual final
- Respuesta al riesgo
- Observaciones / descripcion contingencia

Reglas de respuesta (hoja `6. Evaluac. Respuesta al Riesgo`):
- Si residual final es Alto o Medio Alto -> crear/actualizar BCP o ejecutar prueba pendiente.
- Si residual final es Medio, Medio Bajo o Bajo -> mantener plan (sin construir/actualizar).

## 4.4 Ficha Operar Convenios (datos clave levantados)
Contribucion al modelo:
- Datos de proceso: objetivo, alcance, volumenes, clientes, ubicaciones.
- Sistemas/plataformas criticas: MCO, CDS, SPM, Portal IPS, etc.
- Proveedores/contratos: CCA, Servibanca, Jordan.
- Ventanas/horarios criticos.
- Personal critico y contactos.

Esto alimenta directamente:
- `process_critical_personnel`
- `process_dependencies`
- `suppliers`
- `contacts`
- `locations`
- `assets` (si se decide registrar aplicativos/infraestructura critica como activos)

## 4.5 Seed_BCMS_v11: conexion con el flujo
`docs/SEED_BCMS_v11_catalogos_bia_ria.sql` ya define base canonical para BIA/RIA:
- Setting operativo:
  - `ria.trigger_rule`: impacto > 24h y nivel >= Medio Alto (`docs/SEED_BCMS_v11_catalogos_bia_ria.sql:26`)
- Catalogos:
  - `risk_impact_scale`, `risk_probability_scale`, `control_effectiveness_scale`, `qualitative_risk_level`, `continuity_risk_response`, `disruption_scenario_type`
- Escenarios canonicos (`SCN_*`) alineados a Anexo 7.
- `impact_types` base (Monetario, Procesos, Reputacional, Normativo, Clientes).
- `time_buckets` base de 6 escalas horarias.

## 5. Mapa de conexion de datos (inferencia tecnica desde fuentes)
Nota: este mapeo es inferencia tecnica basada en estructura v11 + instrumentos BancoEstado.

1. **Ficha de Proceso**
- `organizations` -> `organization_process` -> `processes`
- `locations`, `assets`, `suppliers`, `contacts`, `process_critical_personnel`, `process_dependencies`

2. **BIA**
- `bia_assessments`
- `bia_impact_matrix` (dimensiones: `disruption_scenarios` x `time_buckets` x `impact_types`)
- `bia_impacts` / `bia_objectives`
- `bia_dependency_assessments`

3. **RIA**
- `ria_assessments` (referencia a `id_bia`)
- `ria_discriminations` + `ria_discrimination_items` (si se usa ficha discriminacion)
- `ria_items` (detalle de riesgo, control, scores, respuesta)

4. **Planes y pruebas**
- `continuity_plans` (BCP/DRP)
- `plan_sections`, `activation_criteria`, `plan_tests`

5. **Operacion de incidente/crisis y mejora**
- `incidents`, `incident_timeline`, `incident_impacts`, `crisis_declarations`, `crisis_actions`
- `audits`, `findings`, `finding_actions`, `evidences`, `bcms_changes`
- `management_reviews` + inputs/outputs

## 6. Implicancias para `index_refactor` (objetivo de migracion UI)

## 6.1 Objetivo funcional
Continuar migracion de `mockup_v2/backup/mockup_final.html` hacia `mockup_v2/index_refactor.html` manteniendo comportamiento BCMS pero con metodologia refactor (estado central, objetos, render dinamico).

## 6.2 Buenas practicas obligatorias
1. **Tablas responsivas**
- Estandarizar wrapper con `overflow-x: auto`.
- Reusar patron existente de estilos (`.table-wrapper`) en `mockup_v2/css/styles.css:941`.
- Evitar desbordes y mantener legibilidad en mobile.

2. **Normalizacion de botones**
- Reusar clases `btn`, `btn-primary`, `btn-secondary`, `btn-outline`; evitar variantes inline por vista.

3. **Sin datos estaticos fuera del datastore**
- Toda vista debe consumir `BCMSDataStore.entities.*` y `lookups`.

4. **Consistencia de comentarios de vistas**
- Mantener `<!-- INICIO VISTA: ... -->` y `<!-- FIN VISTA: ... -->` para trazabilidad de refactor.

5. **Iconografia**
- Mantener Bootstrap Icons, sin Font Awesome ni emojis.

## 6.3 Estado observable actual de refactor
- `fa-` en `index_refactor.html`: 0 ocurrencias.
- `style=""` inline en `index_refactor.html`: 121 ocurrencias (aun reducible).

## 7. Plan recomendado para alimentar el esquema v11

## 7.1 Paso 1 (inmediato): congelar contrato de mapeo datastore->v11
Crear un contrato tecnico (tabla de mapeo) con:
- `entityName` (datastore)
- `targetTable` (v11)
- `fieldMap` camelCase->snake_case
- `status` (`OK`, `PARCIAL`, `SIN_MAPEO`)

Salida esperada:
- Resolver primero las 18 entidades sin mapeo.
- Separar las que deben transformarse en nuevas tablas v11 de las que son vistas/derivados UI.

## 7.2 Paso 2: cargar catalogos semilla BIA/RIA
Primero ejecutar/replicar logica de `SEED_BCMS_v11_catalogos_bia_ria.sql` en datastore:
- `application_settings.ria.trigger_rule`
- `lookup_sets` + `lookup_values`
- `impact_types`
- `time_buckets`
- `disruption_scenarios`

Sin esto, BIA/RIA queda con codigos ambiguos y sin reglas de disparo.

## 7.3 Paso 3: ingestar Ficha/BIA/RIA para proceso 17896
Orden:
1. Ficha -> maestros/dependencias/recursos/proveedores/contactos.
2. BIA -> assessment + matriz impacto-tiempo + objetivos.
3. RIA -> assessment + items + respuesta riesgo + enlace a BCP.

## 7.4 Paso 4: refactor datastore.js a v11 por capas
- Capa A: entidades ya mapeables (renombre + auditoria completa).
- Capa B: entidades nuevas v11 faltantes (BIA/RIA/lookup/timeline/evidence/approvals).
- Capa C: entidades legacy/mockup sin tabla v11 -> mover a “view model” o eliminar.

## 7.5 Paso 5: ajustar render en `index_refactor.html`
- Consumir nuevas entidades v11-like.
- Evitar hardcode y alias duplicados.
- Reforzar componentes de tabla responsive reutilizables.

## 8. Riesgos actuales a controlar
1. Duplicidad de keys en `entities` puede ocultar datos y generar inconsistencias de UI.
2. Falta de entidades v11 para BIA/RIA impide trazabilidad completa requerida por ISO 22301.
3. Falta de auditoria completa en varias entidades rompe criterio de evidencia/auditoria.
4. Si no se estandariza tabla responsive, seguiran desbordes por vista y deuda CSS.

## 9. Siguiente paso recomendado (accionable)
Siguiente paso concreto para alimentar el esquema:
1. Construir `mockup_v2/docs/BCMS_v11_datastore_mapping_contract.md` con el mapeo campo a campo de las 65 entidades actuales.
2. En paralelo, crear una version `datastore_v11.js` con las entidades semilla minimas para Ficha+BIA+RIA (`process_dependencies`, `bia_assessments`, `bia_impact_matrix`, `ria_assessments`, `ria_items`, `disruption_scenarios`, `time_buckets`, `impact_types`, `lookup_sets`, `lookup_values`).
3. Migrar una sola cadena end-to-end (Proceso 17896) y validar render en vistas BIA/RIA/BCP antes de ampliar cobertura.

---
Ultima actualizacion: 2026-02-13.
