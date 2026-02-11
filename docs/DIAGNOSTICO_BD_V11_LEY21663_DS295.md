# Diagnostico BD v11 + Checklist Ley 21.663 / DS 295

## 1) Objetivo
Consolidar en un solo documento:
- Hallazgos del esquema `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql` con evidencia por linea.
- Riesgos de diseno (duplicaciones, solapes, llaves, polimorfismo).
- Requerimientos normativos de Ley 21.663 y DS 295 (reglamento de reporte), para mapear cumplimiento.

## 2) Fuentes y fecha de corte
- Esquema evaluado: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql` (lineas citadas abajo).
- Requerimientos cliente BancoEstado:
  - `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:915`
  - `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:977`
  - `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1027`
  - `docs/Anexo_7_Especificaciones_Tecnicas.extract.txt:1262`
- Ley 21.663 (Ley Marco de Ciberseguridad): https://www.bcn.cl/leychile/navegar?idNorma=1202434
- DS 295 (Reglamento de reporte de incidentes): https://www.bcn.cl/leychile/navegar?idNorma=1211466
- Fecha de corte documental: 2026-02-11.

## 3) Hallazgos tecnicos del schema v11 (con lineas)

### 3.1 Criticos
1. Error de sintaxis SQL en `lessons_learned`.
- Evidencia: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1960` (coma suelta antes de `updated_by`).
- Impacto: el script completo puede fallar al ejecutar DDL.

2. Error de sintaxis SQL en `bcms_changes`.
- Evidencia: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2023` (coma suelta antes de `updated_by`).
- Impacto: bloquea despliegue/migracion.

3. Uso de `gen_random_uuid()` sin extension explicita.
- Evidencia: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1919`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1979`.
- Falta detectada: no existe `CREATE EXTENSION IF NOT EXISTS pgcrypto;` en el archivo.
- Impacto: falla en ambientes donde `pgcrypto` no este habilitado por defecto.

### 3.2 Altos
4. Riesgo de mezclar datos multi-organizacion en entidades de riesgo/perfil.
- Evidencia:
  - `risks` no tiene `id_organization`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:579`.
  - `process_continuity_profiles` no tiene `id_organization`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:450`.
  - Asociaciones proceso-org existen por tabla puente: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:358`.
- Impacto: potencial leakage entre tenants/clientes y dificultad para segmentar cumplimiento por organizacion.

5. Trazabilidad regulatoria modelada como "estado agregado" y no como bitacora de envios.
- Evidencia:
  - `incident_regulatory_reports`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1387`.
  - Campos de hitos en una sola fila (early/second/action/final): `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1402` a `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1409`.
- Impacto: auditoria y prueba legal debiles para DS 295 cuando existan reenvios, parciales y correcciones.

### 3.3 Medios
6. Polimorfismo no uniforme entre modulos (listas distintas de `entity_type` / `scope_type`).
- Evidencia:
  - `evidences`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1762`
  - `entity_tags`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1856`
  - `contact_links`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2384`
  - `bcms_role_assignments`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2427`
  - `communication_plans`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2471`
- Impacto: entidad soportada en un modulo puede no ser soportada en otro.

7. Frontera de dependencias BIA/proceso (ajustada).
- Evidencia:
  - `bia_dependency_assessments`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:955`
  - `process_dependencies`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:930`
- Impacto actual: se reduce duplicacion semantica; se mantiene solo riesgo operativo si no se aplica la regla baseline/evaluacion en backend.

8. Solape de relacion persona-entidad en tres modelos.
- Evidencia:
  - `contact_links`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2376`
  - `process_critical_personnel`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1117`
  - `communication_plan_stakeholders`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2489`
- Impacto: misma realidad de negocio en distintas tablas sin contrato unico.

9. Inconsistencia de tipos de ID entre modulos.
- Evidencia:
  - Mayoria de modelo usa BIGINT.
  - `lessons_learned.id` y `bcms_changes.id` usan UUID: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1919`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1979`.
  - `lessons_learned.source_id` definido UUID aunque muchas entidades origen son BIGINT: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1925`.
- Impacto: joins indirectos complejos y trazabilidad polimorfica menos robusta.

10. Regla de auditoria/estado no homogena en catalogos.
- Evidencia:
  - `lookup_values` usa `is_active`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:258`.
  - En el resto del modelo predomina `is_deleted`.
- Impacto: logica de filtrado y lifecycle heterogenea.

11. Fecha de actualizacion con granularidad baja en tabla legacy.
- Evidencia: `macroprocesses.updated_at` como `DATE`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:282`.
- Impacto: se pierde precision temporal respecto al resto del esquema.

### 3.4 Cobertura ya bien encaminada
1. Encadenamiento BIA -> RIA:
- `bia_assessments`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:717`
- `ria_assessments` con `id_bia`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:876`

2. Matriz BIA por escenario-tiempo-impacto (alineada a BancoEstado):
- `disruption_scenarios`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:783`
- `time_buckets`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:804`
- `impact_types`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:826`
- `bia_impact_matrix`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:846`

3. Estructura RIA detallada:
- `ria_items`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1286`

4. Base inicial de cumplimiento regulatorio de incidentes:
- `incidents` campos regulatorios: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1361`
- `incident_regulatory_reports`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1387`

### 3.5 Estado tras ajustes pequeños (2026-02-11)
Resueltos en esta iteracion (sin compilacion):
1. Sintaxis corregida en `lessons_learned` y `bcms_changes`.
2. Estandarizacion BIGINT aplicada en:
  - `lessons_learned.id`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1919`
  - `lessons_learned.source_id`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1925`
  - `lessons_learned.folder_id`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1954`
  - `bcms_changes.id`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1978`
3. Normalizacion de estado en catalogos:
  - `lookup_values.is_deleted`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:258`
  - Seed alineado: `docs/SEED_BCMS_v11_catalogos_bia_ria.sql:70`
4. Precision temporal legacy ajustada:
  - `macroprocesses.updated_at TIMESTAMP`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:282`
5. Ownership organizacional agregado en tablas núcleo del pendiente 3:
  - `process_continuity_profiles.id_organization`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:452`
  - `risks.id_organization`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:583`
6. Diccionario polimorfico normalizado (pendiente 5):
  - `evidences`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1736`
  - `entity_tags`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1853`
  - `contact_links`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2382`
  - `bcms_role_assignments`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2420`
  - `communication_plans`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2464`
7. Frontera de dependencias (pendiente 7):
  - Eliminada `bia_dependencies`.
  - Nueva `bia_dependency_assessments` con FK a `bia_assessments` y `process_dependencies`.
  - `bia_assessments` queda con `version` (sin `version_label`).
8. Base de Pérdida (pendiente 9):
  - Nueva tabla `loss_events` como extension `[EXT_BE]`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1469`
  - Alcance aplicado: sin `loss_event_impacts` en esta iteracion.

## 4) Mapa de solapes y posibles consolidaciones

### 4.1 Dependencias
- Solape principal:
  - `process_dependencies` (dependencias estructurales del proceso).
  - `bia_dependency_assessments` (evaluacion BIA sobre dependencias ya definidas en baseline).
- Criterio recomendado:
  - Mantener frontera clara:
    - `process_dependencies` = baseline maestro.
    - `bia_dependency_assessments` = evaluacion por assessment.

### 4.2 Contactos y comunicacion
- Solape principal:
  - `contact_links` (relacion generica contacto-entidad).
  - `process_critical_personnel` (rol critico por etapa).
  - `communication_plan_stakeholders` (audiencia por plan de comunicacion).
- Criterio recomendado:
  - Usar `contact_links` como capa transversal.
  - Mantener tablas especializadas solo con campos propios del contexto (ej. `required_ack`, `stage_code`, backup).

### 4.3 Polimorfismo
- Problema:
  - Cada tabla polimorfica declara su propio set de `entity_type`.
- Criterio recomendado:
  - Definir contrato unico de tipos permitidos y reutilizarlo en todas.

## 5) Requerimientos normativos: Ley 21.663

Nota: se listan requerimientos operativos/compliance relevantes para sujetos obligados y OIV, mas regimen sancionatorio clave.

1. Ambito de aplicacion y sujetos obligados (servicios esenciales y OIV).
- Fuente: Ley 21.663, art. 4-6 (BCN lineas `L80`-`L100` en idNorma 1202434).
- Requisito: determinar si la institucion es sujeto obligado y si califica como OIV.

2. Deber general permanente de prevenir, reportar y resolver incidentes.
- Fuente: art. 7 (`L107`-`L109`).
- Requisito: medidas tecnologicas, organizacionales, fisicas o informativas, alineadas a protocolos/estandares.

3. Implementar estandares/protocolos de la Agencia y sectoriales.
- Fuente: art. 7 (`L108`-`L111`).
- Requisito: cumplimiento de estandares generales y particulares.

4. Deberes especificos OIV - SGSI continuo con evaluacion probabilidad/impacto.
- Fuente: art. 8 letra a) (`L113`-`L116`).

5. Deberes especificos OIV - registro de acciones del SGSI.
- Fuente: art. 8 letra b) (`L117`).

6. Deberes especificos OIV - planes de continuidad operacional y ciberseguridad, con revision periodica (minimo cada 2 anios) y certificacion.
- Fuente: art. 8 letra c) (`L119`-`L120`) y art. 28 (`L373`).

7. Deberes especificos OIV - revision continua, ejercicios, simulacros y comunicacion al CSIRT Nacional.
- Fuente: art. 8 letra d) (`L121`).

8. Deberes especificos OIV - medidas oportunas para reducir impacto y propagacion del incidente.
- Fuente: art. 8 letra e) (`L122`).

9. Deberes especificos OIV - certificaciones exigidas por ley/reglamento.
- Fuente: art. 8 letra f) (`L124`) y art. 28 (`L373`).

10. Deberes especificos OIV - informar a potenciales afectados cuando corresponda.
- Fuente: art. 8 letra g) (`L125`).

11. Deberes especificos OIV - capacitacion continua y ciberhigiene.
- Fuente: art. 8 letra h) (`L126`).

12. Deberes especificos OIV - designar delegado de ciberseguridad.
- Fuente: art. 8 letra i) (`L128`).

13. Deber de reportar incidentes con efecto significativo.
- Fuente: art. 9 (`L129`).
- Requisito: reportar "tan pronto sea posible" bajo esquema legal.

14. Alerta temprana maximo 3 horas.
- Fuente: art. 9 letra a) (`L130`).

15. Segundo reporte maximo 72 horas (o 24 horas para OIV con servicio esencial afectado).
- Fuente: art. 9 letra b) (`L131`-`L132`).

16. Informe final maximo 15 dias desde alerta temprana; si sigue en curso, informe situacional y final cuando se gestione.
- Fuente: art. 9 letra c) y d) (`L133`-`L143`).

17. Ventanilla unica cuando exista deber de notificar a mas de una autoridad.
- Fuente: art. 9 inciso final (`L148`-`L149`).

18. Criterios de "efecto significativo".
- Fuente: art. 27 (`L363`-`L368`).
- Requisito: considerar numero de personas afectadas, duracion y extension geografica.

19. Reserva y circulacion restringida de informacion de ciberseguridad.
- Fuente: art. 33 (`L401`-`L402`) y art. 35 (`L414`-`L415`).

20. Regimen de infracciones por incumplimiento (leve/grave/gravisima).
- Fuente: art. 38 (`L423`-`L434`) y art. 39 (`L454`-`L479`).

21. Regimen de sanciones economicas.
- Fuente: art. 40 (`L483`-`L488`).
- Escala maxima:
  - Leve: hasta 5.000 UTM (10.000 UTM si OIV).
  - Grave: hasta 10.000 UTM (20.000 UTM si OIV).
  - Gravisima: hasta 20.000 UTM (40.000 UTM si OIV).

## 6) Requerimientos normativos: DS 295 (Reglamento de reporte)

1. Sujetos obligados al reporte.
- Fuente: art. 2 (`L49`-`L50` en idNorma 1211466).

2. Definicion operacional de incidente con efecto significativo.
- Fuente: art. 3 (`L54`-`L64`).
- Incluye continuidad de servicio esencial, integridad fisica/salud, integridad/confidencialidad/disponibilidad, acceso no autorizado y afectacion de datos personales.

3. Mantenciones planificadas no se consideran incidente, pero deben estar en planes de continuidad.
- Fuente: art. 4 (`L67`-`L68`).

4. Taxonomia minima del informe (datos minimos obligatorios).
- Fuente: art. 5 (`L72`-`L87`).
- Minimos: identificacion institucion (nombre/RUT/direccion/correo), delegado y contacto, fechas/horas, indicios, activos afectados, IoC, evidencia de delito, repercusion en terceros, otros datos utiles.

5. Omision de datos personales en reportes.
- Fuente: art. 6 (`L88`).

6. Si ANCI detecta no-reporte, puede requerirlo formalmente.
- Fuente: art. 7 (`L89`-`L91`).

7. Uso obligatorio de plataforma de reporte ANCI 24x7x365.
- Fuente: art. 8 (`L97`-`L98`).

8. Alerta temprana: maximo 3 horas desde conocimiento.
- Fuente: art. 9 (`L99`-`L102`).
- Contenido minimo: letras a), b), c), f), g) del art. 5.

9. Segundo reporte: maximo 72 horas (24 horas para OIV con servicio esencial afectado).
- Fuente: art. 10 (`L103`-`L105`).

10. Plan de accion OIV: maximo 7 dias corridos desde conocimiento.
- Fuente: art. 11 (`L106`-`L109`).
- Minimo: recuperacion de informacion, responsabilidades tecnicas/administrativas y tiempo estimado de recuperacion.

11. Informe final: maximo 15 dias corridos desde alerta temprana (si incidente gestionado).
- Fuente: art. 12 (`L110`-`L117`).
- Debe confirmar/actualizar datos previos.

12. Requisitos adicionales para OIV en informe final.
- Fuente: art. 12 adicional (`L119`-`L122`).
- Minimo: vulnerabilidades/exploits, controles que fallaron o ausentes, adopcion de alertas previas CSIRT y razones si no se adoptaron.

13. Informe parcial en incidentes prolongados y actualizacion cada 15 dias.
- Fuente: art. 13 (`L123`).

14. CSIRT Nacional puede pedir informacion adicional en cualquier momento.
- Fuente: art. 14 (`L124`).

15. Reportes recibidos por Agencia pueden quedar bajo reserva.
- Fuente: art. 14 inciso final (`L125`).

16. Exigencias contractuales para proveedores TI de organismos del Estado.
- Fuente: art. 15 (`L126`-`L128`).
- No permitir clausulas que restrinjan compartir info de vulnerabilidades/incidentes.

17. ANCI puede dictar instrucciones generales de reporte.
- Fuente: art. 16 (`L129`-`L131`).

18. Notificaciones voluntarias para no obligados; canales anonimos solo para voluntarios.
- Fuente: art. 18 (`L138`-`L139`).

## 7) Contraste rapido v11 vs norma (estado actual)

1. Reportabilidad y plazos 3h/24-72h/15d.
- Estado: Parcialmente cubierto.
- Evidencia:
  - `incidents`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1342`
  - `incident_regulatory_reports`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1392`
- Brecha: falta granularidad por envio (multi-registro) para auditoria fuerte.

2. Criterios de efecto significativo.
- Estado: Parcial.
- Evidencia: `significant_effect_criteria JSONB` en `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1400`.
- Brecha: falta estandarizar estructura de evaluacion por criterio legal.

3. Taxonomia minima (RUT, direccion, delegado, IoC, activos, etc.).
- Estado: Parcial.
- Evidencia:
  - `organizations.tax_id`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:177`
  - `contacts`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1081`
  - `taxonomy_payload`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1413`
- Brecha: no hay plantilla formal/controlada por version de taxonomia.

4. Omitir datos personales en reportes.
- Estado: Cubierto base.
- Evidencia: `personal_data_omitted`: `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1414`.

5. Deberes OIV (SGSI, registro acciones, delegado, capacitacion, planes certificados).
- Estado: Parcial.
- Evidencia:
  - SGSI/continuidad en varias tablas (riesgo, planes, cambios, auditoria).
  - Falta traza explicita de certificaciones de art. 28.
- Brecha: no existe tabla dedicada para evidenciar certificaciones oficiales OIV.

6. Reserva de informacion.
- Estado: Parcial.
- Evidencia: estructura de evidencias y auditoria (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1731`, `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1892`).
- Brecha: falta clasificacion formal de confidencialidad y reglas de acceso por nivel legal.

## 8) Lista de tareas derivadas (solo a nivel tablas/columnas por ahora)
1. Crear detalle de envios regulatorios (tabla hija de `incident_regulatory_reports`) para auditoria de cada hito/reporte parcial.
2. Validar en reglas de backend que `bia_dependency_assessments` no se use para crear baseline paralelo.

## 9) Observaciones de uso
- Este documento es una foto de estado para no perder decisiones.
- Se recomienda actualizarlo cada vez que se cierre una iteracion de cambios de schema.
