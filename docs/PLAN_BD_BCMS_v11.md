# Plan de Trabajo BD BCMS v11
cd D:\Documents\D\GRUPO_MITIGA\MOCKUP\final_mockup
conda activate .\.conda\envs\bcms-tools
Fecha de inicio: 2026-02-11  
Alcance de este plan: **solo base de datos a nivel visual** (tablas y columnas).  
Regla activa: **ignorar vistas por ahora**.
Regla de ejecución actual: **no tocar por ahora índices, triggers, constraints avanzadas, validaciones técnicas ni optimización**.
Regla operativa adicional (2026-02-11): **no compilar ni ejecutar validación de esquema por ahora; solo diseño visual de tablas/columnas**.
Regla de tipos (2026-02-11): **estandarizar en BIGINT; no usar UUID en esta iteración**.

## 1) Objetivo

Consolidar un modelo de datos BCMS que:

1. soporte operación de continuidad (ISO 22301),
2. soporte necesidades de ciber/cumplimiento asociadas a Ley 21.663 (toque ISO 27001),
3. sea flexible para distintos clientes sin sobredimensionar el MVP.

## 2) Diagnóstico Actual (v11)

### 2.1 Lo que funciona hoy y por qué funciona

1. **Núcleo maestro y jerárquico**
   - Organizaciones, jerarquía de procesos, activos, ubicaciones, proveedores y contactos.
   - Permite trazabilidad de negocio y contexto operativo base.

2. **Ciclo de riesgo y tratamiento**
   - `risks`, `risk_assessments`, `risk_treatments`.
   - Permite registrar riesgo, evaluar niveles y definir tratamiento con responsable/fecha.

3. **BIA y RIA**
   - BIA: `bia_assessments`, `disruption_scenarios`, `time_buckets`, `impact_types`, `bia_impact_matrix`, `bia_objectives`, `bia_dependency_assessments`.
   - RIA: `ria_assessments`, `ria_items`.
   - Soporta estructura de matrices tipo cliente (escenario, impacto, probabilidad, control, riesgo residual, respuesta).

4. **Planes, pruebas e incidentes**
   - `continuity_plans`, `plan_tests`, `incidents`, `crisis_*`.
   - Soporta operación de continuidad y seguimiento básico de respuesta.

5. **Cumplimiento y auditoría**
   - `frameworks`, `requirement_nodes`, `control_compliance_mapping`, `audits`, `findings`, `evidences`.
   - Base válida para multi-norma y evidencia de cumplimiento.

6. **Capa ciber útil para 21.663**
   - `threats`, `risk_threat_mapping`, `vulnerabilities`, `asset_vulnerabilities`.
   - Permite extender continuidad hacia gestión de riesgo ciber.

### 2.2 Brechas y puntos débiles

1. **Integridad polimórfica incompleta**
   - `target_process_type + target_process_id` no tiene FK real por tipo.
   - Se deja en backlog técnico (apartado **Modificaciones a futuro**).

2. **Ficha de discriminación RIA (hoja oculta Excel)**
   - No existe entidad explícita para almacenar evaluación de discriminación.

3. **Personal crítico titular/reemplazo por etapa**
   - `contacts`/`contact_links` no modelan bien titular + reemplazo + etapa + vigencia.

4. **Aprobaciones/V°B° multi-firma**
   - No hay workflow genérico de firmas por entidad/version.

5. **Ley 21.663: trazabilidad regulatoria explícita**
   - Falta modelo dedicado para reporte regulatorio de incidentes (si aplica por cliente).

6. **`*_bcms` con campos discutibles para MVP**
   - Resuelto parcialmente: se consolidaron en una tabla común `process_continuity_profiles`.

7. **`organizational_units`**
   - Resuelto: se eliminó y se migraron relaciones de unidad responsable a `organizations`.

## 3) Estrategia Acordada (actual)

1. Enfoque **reuse-first**:
   - Reutilizar al máximo estructuras existentes.
   - Crear tablas nuevas solo cuando la necesidad no pueda resolverse con ajuste claro.

2. No recortar por ahora capacidades ciber por completo:
   - Mantener base útil para continuidad + cumplimiento 21.663.

3. Trabajar por fases pequeñas y decisiones explícitas.

## 4) Plan por Fases

## Fase 0 - Higiene de alcance (actual)

1. Ignorar vistas temporalmente.
2. Concentrar decisiones en modelo relacional base.
3. Mantener este documento como bitácora viva.

Estado: **En progreso**

## Fase 1 - Ajuste visual de núcleo (sin tablas nuevas)

Objetivo: simplificar y ordenar estructura de tablas/columnas existente.

1. Homologar columnas polimórficas a nivel visual (`target_process_type` / `target_process_id`) donde aplique.
2. Revisar y simplificar campos `*_bcms` para MVP (deprecación o ajuste). **(Completado: consolidación en tabla común)**
3. `organizational_units` -> `organizations` y ejecutar migración de FKs. **(Completado)**

Estado: **Completada**

## Fase 2 - Cobertura funcional mínima faltante

Objetivo: cubrir brechas reales detectadas por hojas ocultas y operación.

1. Soporte de Ficha de discriminacion RIA:
   - Ejecutado con tablas `ria_discriminations` + `ria_discrimination_items`.
2. Modelar personal critico por etapa (titular/reemplazo):
   - Ejecutado con tabla `process_critical_personnel` reutilizando `contacts`.
3. Modelar V°B°/firmas multirol por entidad/version.
   - Ejecutado con `entity_approvals` + `entity_approval_signatures`.

Estado: **Completada**

## Fase 3 - Cumplimiento 21.663 (si cliente lo requiere)

1. Definir trazabilidad de notificación regulatoria de incidentes.
   - Ejecutado: tabla dedicada `incident_regulatory_reports` + campos resumen en `incidents`.
2. Decidir ajuste en `incidents` vs tabla nueva específica de reportes.
   - Ejecutado: enfoque híbrido (flags en `incidents` + tabla dedicada para hitos regulatorios).

Estado: **Completada**

## 5) Backlog de Cambios (candidatos)

### 5.1 Ajustes sobre tablas existentes (preferido primero)

1. `risks`, `applied_controls`, `bia_assessments`, `continuity_plans`, `ria_assessments`, `process_dependencies`:
   - Homologación visual de columnas de objetivo (`target_process_type` / `target_process_id`). **(Completado en núcleo, incluyendo `incidents`)**
2. `process_continuity_profiles`:
   - Revisar ajuste fino de columnas para el MVP y confirmar cobertura por nivel de proceso.

### 5.2 Tablas nuevas (solo si ajuste no basta)
Sin pendientes en este bloque por ahora.

## 5.3 Modificaciones a futuro (no visual / técnica)

1. Constraints de consistencia para relaciones polimórficas (`type + id`).
2. Triggers o funciones de validación referencial por tipo de entidad.
3. Índices adicionales y tuning de performance.
4. Hardening de integridad avanzada y reglas de datos.

## 6) Registro de Decisiones

## 2026-02-11

1. Se acordó priorizar base de datos y dejar vistas fuera temporalmente.
2. Se acordó enfoque `reuse-first`.
3. Se confirmó que había hojas ocultas en Excel relevantes para diseño (no ignorarlas).
4. Se detectó que el bloque de riesgos no debe recortarse agresivamente por contexto 21.663 + continuidad.
5. Se abrió decisión pendiente: eliminar `organizational_units` y mover relaciones a `organizations`.
6. Se ejecutó la eliminación de `organizational_units` en `schema_v11`.
7. Se migraron referencias:
   - `process_bcms_data.responsible_unit_id` -> `responsible_organization_id INT REFERENCES organizations(id_organization)`.
   - `applied_controls.responsible_unit_id` -> `responsible_organization_id INT REFERENCES organizations(id_organization)`.
8. Se acuerda trabajar en modo **visual** (tablas/columnas) y mover cambios técnicos (índices/triggers/constraints avanzadas) a “Modificaciones a futuro”.
9. Se eliminaron `macroprocess_bcms_data`, `process_bcms_data`, `subprocess_bcms_data`, `procedure_bcms_data`.
10. Se creó tabla común `process_continuity_profiles` para consolidar perfil BCMS por nivel de proceso.
11. Se implementaron `ria_discriminations` y `ria_discrimination_items` para modelar la ficha de discriminacion previa al RIA.
12. Se implementó `process_critical_personnel` para modelar personal titular/reemplazo por etapa, reutilizando `contacts`.
13. Se implementaron `entity_approvals` y `entity_approval_signatures` para modelar V°B° y firmas multirol por entidad/version.
14. Se implementó trazabilidad 21.663 en incidentes con enfoque híbrido:
   - Ajustes en `incidents` para estado/plazo regulatorio resumido.
   - Nueva tabla `incident_regulatory_reports` para hitos y reportes regulatorios.
15. Se homologó `incidents` a objetivo polimórfico:
   - `affected_process_id` -> `target_process_type` + `target_process_id`.
16. Iteración de ajustes pequeños aplicada sin compilar:
   - Corrección de sintaxis en `lessons_learned` y `bcms_changes` (comas huérfanas removidas).
   - Estandarización de IDs a BIGINT en `lessons_learned` y `bcms_changes` (eliminando UUID).
   - Normalización de `lookup_values`: `is_active` -> `is_deleted`.
   - Ajuste de consistencia temporal en legacy: `macroprocesses.updated_at` -> `TIMESTAMP`.
   - Ajuste de seed de catálogos para usar `is_deleted` con valores vigentes (`FALSE`).
17. Pendiente 3 ejecutado:
   - `risks.id_organization` agregado como `NOT NULL`.
   - `process_continuity_profiles.id_organization` agregado como `NOT NULL`.
18. Pendiente 5 ejecutado:
   - Diccionario polimórfico normalizado en `evidences`, `entity_tags`, `contact_links`, `bcms_role_assignments` y `communication_plans`.
19. Pendiente 7 ejecutado:
   - Se eliminó `bia_dependencies`.
   - Se creó `bia_dependency_assessments` conectada a `bia_assessments` y `process_dependencies`.
   - Se simplificó versionado BIA dejando solo `bia_assessments.version` (sin `version_label`).
20. Pendiente 9 ejecutado:
   - Se creó `loss_events` como extensión `[EXT_BE]` para Base de Pérdida (BBPP).
   - Se conectó a `organizations`, `risks`, `incidents` y proceso objetivo polimórfico.
   - Se decidió no crear `loss_event_impacts` en esta iteración para evitar solape con `incident_impacts`.
21. Pendiente 4 ejecutado:
   - Se mantuvo `incident_regulatory_reports` como cabecera/resumen de caso regulatorio.
   - Se creó `incident_regulatory_submissions` como bitácora por envío regulatorio.
   - Se incorporaron etapas: `EARLY_ALERT`, `SECOND_REPORT`, `PARTIAL_UPDATE`, `ACTION_PLAN`, `FINAL_REPORT`, `ADDITIONAL_INFO`, `OTHER`.

## 7) Criterios para aceptar cada fase

1. Integridad: sin relaciones ambiguas críticas para datos operativos.
2. Trazabilidad: proceso -> BIA -> RIA -> tratamiento/plan -> evidencia/auditoría.
3. Flexibilidad: soporte multi-cliente sin romper estructuras legacy.
4. Claridad: cada dato crítico tiene ubicación única y auditable.

## 8) Próximo paso sugerido

Resolver y ejecutar **Fase 2/Fase 3** en este orden:

1. Definir si se requiere plan de migración de datos históricos hacia `process_continuity_profiles` y nuevas tablas RIA/personal critico/aprobaciones/regulatorio.
2. Revisar si se requiere tabla adicional para múltiples entidades afectadas por incidente (si un solo `target_process` no basta).

## 9) Plan de Pendientes Acordados (basado en diagnóstico)

Este bloque aterriza los pendientes detectados en `docs/DIAGNOSTICO_BD_V11_LEY21663_DS295.md` y fija cómo proceder.

### 9.1 Pendiente 1 - Errores de sintaxis SQL (**Completado**)
Objetivo:
- Corregir los errores de coma suelta en `lessons_learned` y `bcms_changes`.

Alcance:
- Solo corrección visual de columnas.
- Sin ejecutar compilación.

Acciones:
1. Quitar coma huérfana en `lessons_learned`.
2. Quitar coma huérfana en `bcms_changes`.
3. Revisar visualmente bloque de auditoría en ambas tablas.

### 9.2 Pendientes 2 y 6 - Política de IDs en BIGINT (sin UUID) (**Completado en tablas afectadas**)
Objetivo:
- Eliminar mezcla de tipos en el modelo y dejar todo en BIGINT.

Estado actual:
- `lessons_learned.id` y `bcms_changes.id` usan UUID.
- El resto del modelo usa mayormente BIGINT.

Decisión:
- Migrar ambas tablas a PK `BIGINT GENERATED ALWAYS AS IDENTITY`.
- Reemplazar campos polimórficos UUID asociados por BIGINT (cuando aplique).

Acciones:
1. `lessons_learned.id`: UUID -> BIGINT identity.
2. `bcms_changes.id`: UUID -> BIGINT identity.
3. Ajustar columnas relacionadas que hoy asumen UUID.
4. Dejar nota de compatibilidad para migración de datos históricos (si existieran UUID previos).

### 9.3 Pendiente 3 - Plan de `id_organization` donde falta (modelo por cliente) (**Completado en alcance mínimo acordado**)
Contexto de arquitectura acordado:
- No es multi-tenant en línea entre clientes.
- Cada cliente tiene su propia DB.
- Dentro de esa DB sí puede existir jerarquía recursiva de organizaciones (`organizations.id_parent_org`).

Objetivo real:
- Asegurar separación y trazabilidad por unidad organizacional interna del cliente.

Criterio:
- Agregar `id_organization` solo en tablas transaccionales o de gestión donde el dato pueda pertenecer a distintas áreas de una misma instancia cliente.
- No agregarlo por defecto en catálogos globales puramente técnicos (si no aporta).

Decisión aplicada:
1. `risks.id_organization`: agregado como `INT NOT NULL REFERENCES organizations(id_organization)`.
2. `process_continuity_profiles.id_organization`: agregado como `INT NOT NULL REFERENCES organizations(id_organization)`.
3. La revisión puntual de tablas polimórficas quedó resuelta en el pendiente 5.

Resultado:
1. Ownership organizacional explícito en el núcleo de perfil BCMS y riesgos.
2. Sin cambios en catálogos técnicos/globales.

### 9.4 Pendiente 4 - Trazabilidad regulatoria de reportes (Ley 21.663/DS 295) (**Completado**)
Objetivo:
- Mejorar trazabilidad de envíos regulatorios sin tocar aún constraints avanzadas.

Problema resuelto:
- `incident_regulatory_reports` concentra hitos, pero ahora se complementa con detalle por envío.
- Se cubre traza de envío/reenvío/parcial por registro individual.

Modelo aplicado:
1. Mantener `incident_regulatory_reports` como cabecera del caso regulatorio.
2. Agregar tabla hija tipo `incident_regulatory_submissions` para cada envío.

Columnas aplicadas en la hija:
- `id_submission` BIGINT identity PK.
- `id_incident_reg_report` BIGINT FK a cabecera.
- `submission_stage` (EARLY_ALERT, SECOND_REPORT, PARTIAL_UPDATE, ACTION_PLAN, FINAL_REPORT, ADDITIONAL_INFO, OTHER).
- `submitted_at`.
- `due_at_snapshot`.
- `reporting_authority`.
- `authority_reference`.
- `payload_json`.
- `status_lu`.
- `response_received_at`.
- `response_reference`.
- `is_resubmission`.
- `notes`.
- Auditoría estándar (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`, `is_deleted`).

### 9.5 Pendiente 5 - Normalizar polimorfismo (`entity_type` / `scope_type`) (**Completado en tablas objetivo**)
Objetivo:
- Evitar listas divergentes de tipos por tabla.

Estrategia:
1. Definir diccionario maestro de tipos permitidos.
2. Homologar columnas polimórficas en:
   - `evidences`
   - `entity_tags`
   - `contact_links`
   - `bcms_role_assignments`
   - `communication_plans`
3. Mantener extensibilidad por versión (agregar nuevos tipos de forma controlada).

Decisión aplicada:
1. Se unificó un diccionario común de `entity_type` para:
   - `evidences`
   - `entity_tags`
   - `contact_links`
2. Se unificó un diccionario común de `scope_type` (mismo set + `GLOBAL`) para:
   - `bcms_role_assignments`
   - `communication_plans`
3. Se incorporaron tipos faltantes para consistencia (ej. `MACROPROCESS`, `RIA`, `COMPLIANCE`, `TEST`, `EVIDENCE`, `REFERENCE_CONTROL`).

Resultado:
1. Se elimina la divergencia principal entre tablas polimórficas núcleo.
2. Se mantiene pendiente menor de extender este criterio a otros campos polimórficos no priorizados en esta fase.

### 9.6 Pendiente 7 - Frontera `bia_dependency_assessments` vs `process_dependencies` (detallado)
Qué está pasando hoy:
1. `process_dependencies` guarda dependencias del proceso en un nivel estructural (baseline).
2. `bia_dependency_assessments` guarda la evaluación de esas dependencias dentro de un assessment BIA.
3. Se evita duplicar catálogos de dependencia dentro del BIA.

Riesgo:
- Doble mantenimiento.
- Inconsistencia entre “foto del assessment” y “baseline del proceso”.

Resolución recomendada:
1. Definir explícitamente dos capas:
   - Capa baseline: `process_dependencies` (catálogo vivo del proceso).
   - Capa de evaluación BIA: `bia_dependency_assessments` (resultado en contexto de `id_bia`).
2. Usar relación directa:
   - `bia_dependency_assessments.id_process_dependency` -> `process_dependencies.id_process_dependency`.
3. Mantener simple en esta iteración:
   - Sin `snapshot_payload`.
   - Sin `version_label` en `bia_assessments` (solo `version`).

Estado:
- **Completado** en `schema_v11`.

### 9.7 Pendiente 8 - Estandarización simple de estado lógico (**Completado para `lookup_values` + seed**)
Objetivo:
- Homologar semántica de lifecycle.

Ajuste simple:
1. En `lookup_values`, reemplazar uso operativo de `is_active` por `is_deleted` (o incorporar ambos con convención clara y evitar ambigüedad).
2. Dejar criterio único documentado para filtros por “vigente”.

### 9.8 Pendiente 9 - Modelado de Base de Pérdida (BancoEstado) (**Completado**)
Objetivo:
- Cubrir explícitamente “Base de Pérdida” y apetito de riesgo con entidad dedicada.

Modelo aplicado (visual):
1. Nueva tabla `loss_events`:
   - `id_loss_event` BIGINT identity PK.
   - `accounting_date`.
   - `basel_loss_type_lu`.
   - `business_line_lu`.
   - `loss_source_lu`.
   - `accounting_account_code`.
   - `source_reference`.
   - `target_process_type` + `target_process_id`.
   - `loss_code`.
   - `id_organization`.
   - `event_date`.
   - `discovery_date`.
   - `risk_domain`.
   - `loss_type_lu`.
   - `gross_amount`.
   - `recovered_amount`.
   - `net_amount`.
   - `currency_code`.
   - `related_risk_id` (nullable).
   - `related_incident_id` (nullable).
   - `root_cause`.
   - `notes`.
   - `description`.
   - Auditoría estándar completa.
2. Decisión de alcance:
   - No crear `loss_event_impacts` en esta iteración.
   - Si se requiere desglose multi-impacto futuro, se evalúa tabla hija sin romper `loss_events`.

Resultado esperado:
- Reportería clara de pérdidas históricas.
- Mejor puente entre riesgo operacional, incidentes y continuidad.

### 9.9 Pendiente 10 - Ajuste pequeño de precisión temporal legacy (**Completado**)
Objetivo:
- Alinear precisión temporal de actualización.

Ajuste:
1. Cambiar `macroprocesses.updated_at` de `DATE` a `TIMESTAMP` (o `TIMESTAMPTZ` según convención final del schema).
2. Mantener coherencia con el resto de tablas legacy de proceso.

## 10) Orden sugerido de ejecución (sin compilar)
1. Sin pendientes visuales priorizados en este ciclo.
