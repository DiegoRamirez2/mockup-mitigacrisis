# Plan: RIA con esquema BIA + Matriz de Continuidad (fidelidad alta)

## Resumen
Se implementara RIA con el mismo patron estructural de BIA: KPIs arriba, tabla de procesos al centro (todos los procesos), y detalle abajo.
Se agregara flujo completo de levantamiento RIA con modal y guardado (`borrador`/`completado`), y el detalle incluira:
- Matriz principal igual a la hoja **`2 Matriz Continuidad`** del Excel.
- Bloques complementarios: **Ficha de Discriminacion**, **V°B° (validacion)** y **Pruebas**.

Decisiones cerradas:
- Flujo: `Modal + guardado`.
- Lista: `Todos los procesos`.
- Fidelidad: `Alta`.
- Bloques detalle: `Si, incluirlos`.

---

## Cambios por archivo

## `mockup_v2/index_refactor.html`
- Ajustar la vista RIA (`view-ria`) para que quede explicitamente en patron BIA:
  - KPIs.
  - Card de tabla de procesos.
  - Card/panel de detalle inferior persistente.
- En el header de la tabla RIA:
  - Mantener filtro.
  - Agregar CTA principal `Hacer levantamiento RIA` (abre modal).
- Mantener accion por fila `Ver detalle` y agregar `Evaluar`/`Editar RIA` contextual segun estado.
- Agregar modal nuevo:
  - `<!-- INICIO MODAL: RIA Levantamiento -->` / `<!-- FIN MODAL: RIA Levantamiento -->`.
  - Secciones:
    - Objetivo RIA (proceso).
    - Ficha proceso.
    - Ficha de discriminacion.
    - Matriz de continuidad editable (24 columnas operativas).
    - Validacion V°B°.
    - Pruebas asociadas.
  - Footer con botones: `Guardar borrador` y `Guardar y cerrar`.
- Asegurar `table-wrapper` con scroll horizontal en tabla principal y matriz.

## `mockup_v2/js/functions.js`
- Extender estado `AppState` para RIA:
  - Seleccion de proceso RIA.
  - Busqueda/filtros de lista.
  - Estado temporal de edicion del modal (rows/items).
- Reemplazar el flujo RIA actual basado solo en `risks` por flujo hibrido:
  - Fuente principal de render: `riaAssessments + riaItems`.
  - Compatibilidad: si no hay `riaAssessment`, usar fallback derivado de `risks` (legacy) para no perder detalle existente.
- Implementar catalogo de procesos RIA (todos los procesos) y estado por proceso:
  - `Sin iniciar`, `En curso`, `Completado`, `No requerido`, `Completado (legacy)` cuando corresponda.
- Implementar modal RIA:
  - Abrir sin seleccion previa y con seleccion desde fila.
  - Prefill por proceso y ultimo assessment.
  - Guardar draft/completed con validaciones minimas.
- Implementar render de detalle RIA:
  - Metricas superiores.
  - Bloque Ficha Discriminacion.
  - Bloque V°B°.
  - Bloque Pruebas.
  - Matriz principal (estilo Excel BancoEstado) con sticky columns y scroll.
- Implementar calculos de matriz (por fila) con reglas cerradas:
  - `L = impacto (num)`, `M = probabilidad (num)`, `N = evaluacion control (num)`.
  - `O (RI) = L*M`, excepto `L=5 y M=1 => 10`.
  - `P (RR) = O/N`.
  - `Q` y `R` por banda: `<=2.99 Bajo`, `<=4.99 Medio Bajo`, `<=9.99 Medio`, `<=14.99 Medio Alto`, `>14.99 Alto`.
  - `S (Beta)` editable decimal `0.01..1`.
  - `T = min(O, P/S)` (comportamiento seguro consistente con formulas con tope observadas en planilla).
  - `U` banda de `T`.
  - `V` respuesta automatica segun `U`:
    - `Alto/Medio Alto`: crear/modificar plan o ejecutar prueba.
    - resto: mantener plan/pruebas.
- Eliminar hardcode de opciones RIA en funciones y leer desde `BCMSDataStore.lookups`.
- Mantener `evaluateBIAForRIA` como gatillo base, sin romper BIA.

## `mockup_v2/js/datastore.js`
- Agregar lookups RIA (source of truth, sin estaticos en funciones):
  - Tipos de impacto RIA.
  - Escala impacto 24h (1..5).
  - Escala probabilidad (1..5).
  - Escala evaluacion control (1..5).
  - Bandas de riesgo.
  - Reglas de respuesta al riesgo.
- Agregar entidades RIA con auditoria:
  - `riaAssessments`.
  - `riaDiscriminations`.
  - `riaDiscriminationItems`.
  - `riaItems`.
  - `riaAssessmentApprovals` (para V°B° del demo).
- Seed inicial para procesos ya “levantados” y mantener visibilidad inmediata en detalle.
- Compatibilidad con estructura legacy de `risks`:
  - No eliminar ni romper el uso actual.
  - Fallback de lectura cuando no exista assessment RIA nuevo.

## `mockup_v2/css/styles.css`
- Mantener consistencia visual con BIA (`dm-form-section`, `dm-form-grid`, `dm-entity-table`, `table-wrapper`).
- Agregar estilos `ria-lev-*` para modal RIA (sin rehacer sistema de clases base).
- Ajustar matriz RIA alta fidelidad:
  - Anchura, sticky columns, encabezados agrupados.
  - Colores de severidad al estilo planilla.
- Paleta de niveles (alineada a Excel):
  - `Bajo #00B050`
  - `Medio Bajo #92D050`
  - `Medio #FFFF00`
  - `Medio Alto #FFC000`
  - `Alto #FF0000`
- Responsive:
  - scroll horizontal obligatorio en tablas grandes.
  - ajuste de grillas en mobile.

---

## Cambios de interfaces/tipos (JS interno)

- `BCMSDataStore.entities.riaAssessments[]`:
  - `id`, `riaCode`, `targetProcessType`, `targetProcessId`, `idBia`, `assessmentDate`, `status`, `notes`, `globalResidualNote`, auditoria completa.
- `BCMSDataStore.entities.riaItems[]`:
  - `id`, `riaAssessmentId`, `itemNo`, `activityText`, `lossRiskText`, `riskFactorText`, `riskFactorSpecificText`, `controlsText`, `impactType`, `maxImpact24h`, `probability`, `controlEvaluation`, `impactNum`, `probabilityNum`, `controlNum`, `ri`, `rr`, `inherentBand`, `residualBand`, `beta`, `residualWithBeta`, `residualFinalBand`, `responseText`, `observations`, `contingencyDesc`, `linkedRiskId`, auditoria.
- `BCMSDataStore.entities.riaDiscriminations[]` + `riaDiscriminationItems[]`:
  - cabecera/discriminacion con items SI/NO + antecedentes.
- `BCMSDataStore.entities.riaAssessmentApprovals[]`:
  - rol, nombre, fecha, assessmentId, auditoria.
- `AppState`:
  - seleccion RIA (`selectedRIAProcessId`), filtros/busqueda RIA, estado draft del modal.

---

## Casos de prueba y escenarios

- Ver que RIA mantiene layout tipo BIA: KPIs, lista, detalle.
- Ver tabla RIA con **todos** los procesos y filtros por estado.
- Abrir modal desde CTA superior sin seleccion previa.
- Abrir modal desde un proceso especifico y validar prefill.
- Guardar `borrador` y validar estado `En curso` en la lista.
- Guardar `completado` y validar estado `Completado`.
- Completar matriz (columnas H-K), verificar calculo automatico L-U y respuesta V.
- Verificar colores por nivel iguales al esquema Excel.
- Verificar bloques de detalle: discriminacion, V°B°, pruebas.
- Verificar fallback legacy: proceso sin `riaAssessment` pero con `risks` sigue mostrando detalle.
- Verificar scroll horizontal en desktop y mobile para tabla RIA y matriz.
- Verificar que no se rompen vistas BIA/Riesgos Ciber/Vista Integrada.

---

## Supuestos y defaults aplicados

- Objetivo RIA en esta iteracion: `PROCESS` (lista de procesos).
- Hoja objetivo de referencia: **`2 Matriz Continuidad`** (no “Matriz de Continuidad” literal).
- Se replica estructura y logica operativa principal de la planilla; no se replica 1:1 el formato de celdas combinadas de Excel.
- Para listas de seleccion que en Excel dependen de nombres rotos (`#REF!`), se usan lookups en `datastore.js`.
- Se mantiene gatillo RIA desde BIA actual y se complementa con estado de levantamiento persistido.
