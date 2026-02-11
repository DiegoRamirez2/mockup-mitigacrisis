# Plan de Trabajo BD BCMS v11

Fecha de inicio: 2026-02-11  
Alcance de este plan: **solo base de datos a nivel visual** (tablas y columnas).  
Regla activa: **ignorar vistas por ahora**.
Regla de ejecución actual: **no tocar por ahora índices, triggers, constraints avanzadas, validaciones técnicas ni optimización**.

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
   - BIA: `bia_assessments`, `disruption_scenarios`, `time_buckets`, `impact_types`, `bia_impact_matrix`, `bia_objectives`, `bia_dependencies`.
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
   - Algunas columnas parecen demasiado amplias o poco estables para uso inmediato.

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
2. Revisar y simplificar campos `*_bcms` para MVP (deprecación o ajuste).
3. `organizational_units` -> `organizations` y ejecutar migración de FKs. **(Completado)**

Estado: **En progreso**

## Fase 2 - Cobertura funcional mínima faltante

Objetivo: cubrir brechas reales detectadas por hojas ocultas y operación.

1. Evaluar soporte de Ficha de discriminación RIA:
   - Opción A: ajuste tabla existente.
   - Opción B: nueva tabla dedicada.
2. Modelar personal crítico por etapa (titular/reemplazo).
3. Modelar V°B°/firmas multirol por entidad/version.

Estado: **Pendiente**

## Fase 3 - Cumplimiento 21.663 (si cliente lo requiere)

1. Definir trazabilidad de notificación regulatoria de incidentes.
2. Decidir ajuste en `incidents` vs tabla nueva específica de reportes.

Estado: **Pendiente**

## 5) Backlog de Cambios (candidatos)

### 5.1 Ajustes sobre tablas existentes (preferido primero)

1. `risks`, `applied_controls`, `bia_assessments`, `continuity_plans`, `ria_assessments`, `process_dependencies`:
   - Homologación visual de columnas de objetivo (`target_process_type` / `target_process_id`).
2. `process_bcms_data` y otras `*_bcms`:
   - Revisar columnas poco estables para el MVP.
3. `incidents`:
   - evaluar si basta agregar campos para trazabilidad regulatoria.

### 5.2 Tablas nuevas (solo si ajuste no basta)

1. `ria_discrimination` (o equivalente).
2. `process_critical_personnel` (titular/reemplazo por etapa).
3. `entity_approvals` + `entity_approval_signatures` (o equivalente).
4. `incident_regulatory_reports` (si se requiere bitácora regulatoria detallada).

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

## 7) Criterios para aceptar cada fase

1. Integridad: sin relaciones ambiguas críticas para datos operativos.
2. Trazabilidad: proceso -> BIA -> RIA -> tratamiento/plan -> evidencia/auditoría.
3. Flexibilidad: soporte multi-cliente sin romper estructuras legacy.
4. Claridad: cada dato crítico tiene ubicación única y auditable.

## 8) Próximo paso sugerido

Resolver y ejecutar **Fase 1** en este orden:

1. Ajuste mínimo de `*_bcms` para MVP (definir columnas a mantener/deprecar).
2. Evaluar y decidir estructura visual para `ria_discrimination` (si ajuste existente no basta).
3. Evaluar y decidir estructura visual para personal crítico por etapa (titular/reemplazo).
