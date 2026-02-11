# Workflow BD BCMS Iterativo

## Objetivo
Estandarizar la forma de trabajo para cambios de esquema BD en iteraciones pequenas, con trazabilidad y sin repetir trabajo.

## Pasos
1. Analizar codigo y contexto.
   - Revisar `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql`.
   - Revisar documentos de diagnostico/plan vigentes en `docs/`.
   - Delimitar que entra y que no entra en la iteracion.

2. Crear lista de tareas segun analisis.
   - Convertir hallazgos en tareas concretas.
   - Separar tareas pequenas vs tareas grandes.
   - Priorizar por impacto y dependencia.

3. Registrar pendientes para avanzar sin repetir.
   - Actualizar `docs/PLAN_BD_BCMS_v11.md` con:
     - pendientes activos,
     - estado de cada pendiente,
     - orden sugerido.
   - Mantener `docs/DIAGNOSTICO_BD_V11_LEY21663_DS295.md` como foto de estado tecnico.

4. Aplicar cambios.
   - Editar solo los archivos objetivo de la iteracion.
   - Mantener coherencia de tipos, nombres y auditoria.
   - Si hay cambios de columnas compartidas (ej. catalogos), alinear seed/documentacion relacionada.

5. Actualizar lista de trabajo para continuar.
   - Marcar pendientes completados y dejar los siguientes.
   - Registrar decisiones tomadas.
   - Dejar referencias de lineas/archivos para la siguiente iteracion.

## Reglas operativas de esta fase
- Trabajar a nivel visual de BD (tablas/columnas) salvo instruccion contraria.
- No compilar/ejecutar validacion de esquema salvo que se pida explicitamente.
- No abrir tareas grandes nuevas sin cerrar el alcance acordado de la iteracion actual.
