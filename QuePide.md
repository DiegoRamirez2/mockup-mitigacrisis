# BancoEstado — Módulos (orden de levantamiento solicitado) + Guía de revisión en B-GRC

## Convenciones
- **No inventar**: cuando el Anexo no define un dato/umbral/regla, se marca **No especificado** y se agrega **Pregunta GAP**.
- **Tipos** sugeridos para modelado (PostgreSQL-friendly): `varchar`, `text`, `date`, `timestamp`, `numeric`, `boolean`, `enum`, `json`.
- **Fuentes**: páginas según tu referencia. (Pendiente validar sección exacta contra PDF si lo re-subes).

---

## 1) Continuidad (BIA/RIA + relación con ficha) (pág 34-36, 54-55)

### 1.1 Fuente
- Anexo 7: Continuidad — Registro BIA/RIA (pág 34–36 según tu nota).
- Anexo 7: Panel/gestión continuidad (pág 54–55 según tu nota).
- Artefactos BancoEstado: `Ficha Operar Convenios de Pago.xlsx`, `BIA Operar Convenios de Pago.xlsx`, `RIA Operar Convenios de Pago.xlsx`.

### 1.2 Qué pide (requisitos)
**BIA**
- Registrar BIA por proceso: actividades críticas, impacto en el tiempo, dependencias/recursos (incluye proveedores).
- Cargar BIA en el **formato/instrumento definido por el Banco** (no “cualquier planilla”).
- Identificar recursos críticos y dependencias para sostener trazabilidad operacional.

**RIA**
- Registrar RIA con detalle por etapa/actividad: factores de riesgo, controles, impacto (idealmente derivado del BIA), probabilidad, evaluación del control y respuesta.
- **Conectar** Ficha ↔ BIA ↔ RIA para navegación y consistencia (no documentos aislados).

**Conexión BIA→RIA**
- Gatillo cuando el BIA resulte crítico (ej.: criticidad “Medio Alto/Alto” e impacto > 24h).  
  **No especificado**: regla exacta/umbrales y si existe contradicción en el Anexo (se valida con PDF).

### 1.3 Datos mínimos + tipos (modelo mínimo para cumplir y evidenciar)
**Proceso**
- `proceso_id` (varchar/uuid) — clave única
- `nombre` (varchar)
- `dueno_proceso_user_id` (varchar/FK)
- `unidad_org_id` (varchar/FK)

**FichaProceso** (metadata operativa)
- `ficha_id` (uuid)
- `proceso_id` (FK)
- `volumenes` (json) — **No especificado** estructura exacta
- `sistemas_dependientes` (json / tabla hija)
- `proveedores` (json / tabla hija)
- `personal_critico` (json / tabla hija)
- `contactos` (json / tabla hija)
- `fecha_actualizacion` (date)

**BIA**
- `bia_id` (uuid)
- `proceso_id` (FK)
- `instrumento_version` (varchar) — para “formato banco”
- `estado` (enum: BORRADOR/EN_REVISION/APROBADO) — **No especificado**, pero necesario
- `fecha_evaluacion` (date)
- `criticidad_final` (enum/varchar) — **No especificado** catálogo exacto

**BIA_ActividadCritica**
- `id` (uuid)
- `bia_id` (FK)
- `actividad` (text)
- `descripcion` (text) — **No especificado**
- `responsable` (varchar/FK) — **No especificado**

**BIA_ImpactoTemporal**
- `id` (uuid)
- `bia_id` (FK)
- `banda_tiempo` (enum/varchar) — **No especificado** (6 bandas)
- `tipo_impacto` (enum/varchar) — **No especificado**
- `severidad` (smallint/enum) — **No especificado** escala exacta
- `observaciones` (text)

**BIA_DependenciaRecurso**
- `id` (uuid)
- `bia_id` (FK)
- `tipo` (enum: PERSONA/SISTEMA/PROVEEDOR/INFRA/COMUNICACIONES/OTRO)
- `nombre` (varchar)
- `criticidad` (enum/varchar) — **No especificado**
- `detalle` (text)

**RIA**
- `ria_id` (uuid)
- `proceso_id` (FK)
- `bia_id` (FK)
- `estado` (enum: BORRADOR/EN_REVISION/APROBADO) — **No especificado**, pero necesario
- `impacto_base_24h` (numeric/enum) — **No especificado** definición exacta (“impacto > 24h”)
- `respuesta_global` (enum/varchar) — **No especificado**

**RIA_DetalleEtapa**
- `id` (uuid)
- `ria_id` (FK)
- `etapa_actividad` (varchar)
- `factor_riesgo` (varchar/FK catálogo) — **No especificado** catálogo banco
- `factor_especifico` (varchar)
- `control_existente` (text / FK control)
- `probabilidad` (smallint/enum) — **No especificado** escala exacta
- `evaluacion_control` (smallint/enum) — **No especificado** escala exacta
- `impacto_derivado_bia` (boolean)
- `impacto_valor` (numeric/enum) — si no derivado
- `respuesta_riesgo` (enum/varchar) — **No especificado**

### 1.4 Conexiones con otros módulos
- Con **2 BCP**: BIA/RIA definen criticidad, escenarios y dependencias para diseñar/actualizar planes.
- Con **3 Riesgo Operacional**: factores/controles pueden reutilizarse o cruzarse.
- Con **5 Planes de Acción**: hallazgos y brechas en continuidad pueden gatillar acciones.
- Con **7 Reportería**: panel continuidad por proceso y trazabilidad de evidencias.

### 1.5 Qué revisar en B-GRC (GAP checklist)
- ¿Existe **entidad Proceso** y **Ficha** con dependencias/proveedores/contactos?
- ¿Existe **BIA** estructurado (actividades + impacto en el tiempo + dependencias) o solo adjunto?
- ¿Se puede “cargar instrumento banco” (formato parametrizable/versionado)?
- ¿Existe **RIA** con detalle por etapa/actividad y vínculo directo a BIA?
- ¿Navegación y consistencia: desde Proceso → Ficha → BIA → RIA (y vuelta)?

### 1.6 Preguntas GAP (prioridad alta)
- Definición exacta de **gatillo BIA→RIA** y umbrales (¿>24h?, ¿otra regla?).
- Definición de **6 bandas de tiempo** y su catálogo.
- Escalas de probabilidad / evaluación control / impacto (catálogos del banco).

---

## 2) BCP / Planes de contingencia (pág 49-50, 35 y 55)

### 2.1 Fuente
- Anexo 7: Planes BCP/contingencia (pág 49–50 según tu nota) + continuidad (pág 35 y 55 según tu nota).
- Artefacto ejemplo: `BCP0355_Operar Convenios de Pago.docx` (para escalamiento/comunicaciones/operación real).

### 2.2 Qué pide (requisitos)
- Gestionar BCP asociados a procesos críticos y escenarios (personas/edificio/ciber/infra/sistemas/terceros, etc.).
- Plan “accionable”: pasos, responsables, condiciones de activación, vigencia/versionado.
- Inventariar sistemas críticos y definir estrategias por sistema/escenario.
- Reflejar escalamiento y comunicación: quién alerta, quién coordina, a quién se comunica y en qué orden.
- Operación real: workflows, notificaciones, bitácora y evidencia de activación/seguimiento.

### 2.3 Datos mínimos + tipos
**PlanBCP**
- `bcp_id` (uuid)
- `proceso_id` (FK)
- `escenario` (enum/varchar) — **No especificado** catálogo exacto
- `codigo_plan` (varchar) — **No especificado** regla exacta de codificación
- `version` (varchar/int)
- `vigente_desde` (date)
- `vigente_hasta` (date) — **No especificado**
- `estado` (enum: BORRADOR/VIGENTE/OBSOLETO) — **No especificado**, recomendado
- `objetivo` (text)
- `alcance` (text)
- `criterios_activacion` (text/json) — **No especificado**
- `responsable_plan_user_id` (varchar/FK)

**BCP_PasoOperativo**
- `id` (uuid)
- `bcp_id` (FK)
- `orden` (int)
- `accion` (text)
- `responsable` (varchar/FK)
- `condicion` (text) — **No especificado**
- `tiempo_objetivo` (interval) — **No especificado**

**SistemaCritico**
- `sistema_id` (uuid/varchar)
- `nombre` (varchar)
- `dueno` (varchar/FK)
- `criticidad` (enum/varchar) — **No especificado**

**BCP_EstrategiaPorSistema**
- `id` (uuid)
- `bcp_id` (FK)
- `sistema_id` (FK)
- `estrategia` (text)
- `dependencias` (json)

**BCP_EscalamientoComunicacion**
- `id` (uuid)
- `bcp_id` (FK)
- `orden` (int)
- `rol_contacto` (varchar) — **No especificado**
- `contacto` (varchar/json)
- `canal` (enum: EMAIL/TELEFONO/SMS/OTRO) — **No especificado**
- `mensaje_tipo` (varchar) — **No especificado**

**BCP_Activacion**
- `activacion_id` (uuid)
- `bcp_id` (FK)
- `inicio` (timestamp)
- `fin` (timestamp) — **No especificado**
- `motivo` (text)
- `estado` (enum: EN_CURSO/CERRADA)
- `bitacora` (text / tabla hija)
- `evidencias` (N..M adjuntos/urls)

### 2.4 Conexiones
- Con **1 BIA/RIA**: insumos de criticidad, escenarios y dependencias.
- Con **14 Pruebas**: pruebas de BCP generan evidencias y planes de acción.
- Con **5 Planes de Acción**: brechas/observaciones de ejecución/prueba.

### 2.5 Qué revisar en B-GRC (GAP checklist)
- ¿Hay entidad “Plan BCP” con versionado/vigencia o solo documentos?
- ¿Permite pasos operativos secuenciales y responsables?
- ¿Soporta escalamiento/communications como estructura (no solo texto)?
- ¿Existe bitácora de activación con evidencia adjunta?

### 2.6 Preguntas GAP
- Regla exacta de codificación y obligatoriedad de campos del plan.
- ¿El banco exige plantillas específicas por escenario?

---

## 3) Riesgo Operacional (matrices, riesgos, controles) (pág 25-27)

### 3.1 Fuente
- Anexo 7: Matriz riesgo operacional (pág 25–27 según tu nota).

### 3.2 Qué pide (requisitos)
- Gestionar matriz por proceso: riesgos, factores/causas, controles, escalas impacto/probabilidad, efectividad control.
- Cálculo automatizado de riesgo inherente y residual según escalas del banco.
- Estructura consistente por etapas/actividades.
- Flujo de revisión/aprobación con evidencia (quién/cuándo/criterio).
- Conectar con gestión posterior: planes de acción, auditoría y trazabilidad.

### 3.3 Datos mínimos + tipos
**MatrizRiesgo**
- `matriz_id` (uuid)
- `proceso_id` (FK)
- `estado` (enum: BORRADOR/EN_APROBACION/APROBADA/RECHAZADA)
- `creado_por` (varchar/FK)
- `fecha_creacion` (timestamp)
- `aprobado_por` (varchar/FK)
- `fecha_aprobacion` (timestamp)

**Riesgo**
- `riesgo_id` (uuid)
- `matriz_id` (FK)
- `etapa_actividad` (varchar)
- `descripcion` (text)
- `factor_riesgo` (varchar/FK catálogo) — **No especificado**
- `factor_especifico` (varchar)
- `impacto` (smallint) — escala banco
- `probabilidad` (smallint) — escala banco
- `efectividad_control` (smallint) — escala banco
- `inherente` (numeric) — calculado
- `residual` (numeric) — calculado
- `requiere_kri` (boolean)
- `requiere_plan_accion` (boolean)

**Control**
- `control_id` (uuid)
- `descripcion` (text)
- `tipo` (enum/varchar) — **No especificado**
- `evaluacion_diseno` (smallint/enum) — **No especificado**

**ConfigEscalas** (personalizable)
- `id` (uuid)
- `tipo_escala` (enum: IMPACTO/PROBABILIDAD/EFECTIVIDAD)
- `nivel` (smallint)
- `descripcion` (text)

### 3.4 Conexiones
- Con **4 KRI**: KRIs pueden nacer de riesgos/controles.
- Con **5 Planes de Acción**: gatillo por residual/inherente alto y controles deficientes.
- Con **6 Auditoría**: auditoría puede usar resultados para priorización.

### 3.5 Qué revisar en B-GRC
- ¿Cálculo inherente/residual es automático y auditable?
- ¿Escalas son configurables por el banco (no hardcode)?
- ¿Workflow aprobación y registro de auditoría de cambios existe?

---

## 4) KRI (Indicadores de Riesgo) (pág 27-28)

### 4.1 Fuente
- Anexo 7: KRI/indicadores (pág 27–28 según tu nota).

### 4.2 Qué pide
- Definir indicadores asociados a procesos y/o riesgos/controles.
- Periodicidad, responsables, registro de mediciones.
- Alertas/escalamiento por falta de medición o desviación.
- Reglas típicas: umbrales, “X meses fuera” (exacto **No especificado**).

### 4.3 Datos mínimos + tipos
**Indicador (KRI/KCI)**
- `indicador_id` (uuid)
- `tipo` (enum: KRI/KCI) — KCI **No especificado** definición
- `proceso_id` (FK)
- `riesgo_id` (FK nullable)
- `nombre` (varchar)
- `descripcion` (text)
- `frecuencia` (enum/varchar) — **No especificado**
- `responsable_medicion_user_id` (varchar/FK)
- `metodo_calculo` (text) — **No especificado**
- `umbral_config` (json) — bandas/umbrales **No especificado**

**MedicionIndicador**
- `medicion_id` (uuid)
- `indicador_id` (FK)
- `periodo` (date/month)
- `valor` (numeric/text)
- `estado` (enum: EN_UMBRAL/FUERA_UMBRAL/SIN_DATO)
- `fecha_registro` (timestamp)
- `registrado_por` (varchar/FK)

**EscalamientoIndicador**
- `id` (uuid)
- `indicador_id` (FK)
- `tipo_evento` (enum: NO_REGISTRADO/FUERA_UMBRAL)
- `destinatario` (varchar/FK)
- `fecha_envio` (timestamp)
- `resultado` (enum: OK/ERROR)

### 4.4 Conexiones
- Con **3 Riesgo Operacional**: indicadores nacen de riesgos/controles.
- Con **5 Planes de Acción**: reglas de desviación pueden gatillar acciones.
- Con **7 Reportería**: tableros de tendencia/alertas.

### 4.5 Qué revisar en B-GRC
- ¿Catálogo de indicadores existe y se asocia a proceso/riesgo?
- ¿Periodicidad y “missing data” se controla?
- ¿Umbrales/bandas configurables y reglas de escalamiento?

---

## 5) Planes de Acción (riesgos y/o auditoría) (pág 28-29)

### 5.1 Fuente
- Anexo 7: Planes de acción (pág 28–29 según tu nota).

### 5.2 Qué pide
- Registrar acciones con responsables, fechas comprometidas, reprogramaciones, avance, evidencias.
- Alertas/reportes de atraso y acumulación.
- Uso obligatorio cuando hay riesgos relevantes/hallazgos.

### 5.3 Datos mínimos + tipos
**PlanAccion**
- `plan_id` (uuid/varchar)
- `origen` (enum: RIESGO/AUDITORIA/KRI/PRUEBA/OTRO) — **No especificado** lista exacta
- `proceso_id` (FK)
- `descripcion` (text)
- `responsable_ejecucion_user_id` (varchar/FK)
- `responsable_seguimiento_user_id` (varchar/FK)
- `fecha_comprometida` (date)
- `fecha_maxima` (date) — **No especificado** si aplica siempre
- `reprogramacion_1` (date) — **No especificado**
- `reprogramacion_2` (date) — **No especificado**
- `avance_pct` (numeric)
- `estado` (enum: ABIERTA/EN_CURSO/CERRADA/VENCIDA) — **No especificado**, recomendado
- `evidencias` (N..M adjuntos/urls)

### 5.4 Conexiones
- Con **3**, **4**, **6**, **14**: se gatillan desde riesgos/KRI/auditoría/pruebas.

### 5.5 Qué revisar en B-GRC
- ¿Reprogramaciones y avance están soportados?
- ¿Alertas por vencimiento y reportes de backlog?
- ¿Evidencia obligatoria para cierre?

---

## 6) Auditoría interna / seguimiento de observaciones (pág 56-61)

### 6.1 Fuente
- Anexo 7: Auditoría interna/contraloría (pág 56–61 según tu nota).

### 6.2 Qué pide
- Planificación por periodo, priorización por riesgo, mapa de aseguramiento.
- Gestión de recursos (personas/presupuesto) y avance.
- Ciclo de observación: registro → asignación → respuestas/evidencias → prórrogas → escalamiento → cierre.
- Conexión auditoría ↔ planes de acción ↔ evidencia.

### 6.3 Datos mínimos + tipos
**PlanAuditoria**
- `plan_id` (uuid)
- `periodo` (varchar/year)
- `criterios_priorizacion` (json) — **No especificado**
- `estado` (enum)

**Auditoria**
- `auditoria_id` (uuid)
- `plan_id` (FK)
- `proceso_id` (FK nullable si aplica a “entidad”)
- `objetivo` (text)
- `fecha_inicio` (date)
- `fecha_fin` (date)
- `equipo` (json/N..M)
- `presupuesto` (numeric) — **No especificado**
- `estado` (enum)

**Observacion**
- `obs_id` (uuid)
- `auditoria_id` (FK)
- `descripcion` (text)
- `responsable_respuesta_user_id` (varchar/FK)
- `fecha_compromiso` (date)
- `prorroga` (boolean)
- `estado` (enum)
- `evidencias` (N..M adjuntos/urls)
- `plan_accion_id` (FK nullable)

### 6.4 Conexiones
- Con **3 Riesgo**: insumo para planificación/priorización.
- Con **5 Planes de acción**: acciones como respuesta a hallazgos.
- Con **7 Reportería**: tableros de avance y cierre.

### 6.5 Qué revisar en B-GRC
- ¿Existe planificación por periodo y mapa de aseguramiento?
- ¿Seguimiento con prórrogas/escalamiento y evidencias?
- ¿Vinculación observación→plan de acción?

---

## 7) Reportería / BI / Analítica (pág 62)

### 7.1 Fuente
- Anexo 7: reportes/tableros (pág 62 según tu nota).

### 7.2 Qué pide
- Tableros y reportes por proceso/riesgo/controles/continuidad/auditoría.
- Exportables (Excel/PDF/Word) y visualizaciones (heatmaps, indicadores).
- Interoperar con Power BI y perfilar por rol.

### 7.3 Datos mínimos + tipos
**Reporte**
- `reporte_id` (uuid)
- `nombre` (varchar)
- `ambito` (json) — filtros por unidad/rol
- `formato_export` (enum: XLS/PDF/DOC/PPT) — **No especificado** exacto
- `fuente_datos` (json) — **No especificado**
- `ultima_generacion` (timestamp)

**Dashboard**
- `dashboard_id` (uuid)
- `widgets` (json)
- `roles_permitidos` (json)

### 7.4 Conexiones
- Consume datos de **1–6**, **14–15**, y se controla por **8 IAM**.

### 7.5 Qué revisar en B-GRC
- ¿Dashboards configurables sin desarrollo?
- ¿Exportables válidos como evidencia?
- ¿Conector real a Power BI (no solo export manual)?

---

## 8) IAM (SSO / Directorio Activo / roles) (pág 65-66)

### 8.1 Fuente
- Anexo 7: IAM/SSO/roles (pág 65–66 según tu nota).

### 8.2 Qué pide
- Integración con Azure AD (ideal SAML).
- RBAC: roles/permisos por ver/editar/aprobar/administrar.
- Administración de roles bajo control del banco.
- Trazabilidad de acciones (quién hizo qué).

### 8.3 Datos mínimos + tipos
**Usuario**
- `user_id` (varchar) — corporativo/único
- `nombre` (varchar)
- `email` (varchar)
- `estado` (enum: ACTIVO/INACTIVO)

**Rol**
- `rol_id` (varchar/enum)
- `descripcion` (text)

**UsuarioRol**
- `user_id` (FK)
- `rol_id` (FK)
- `ambito` (json) — **No especificado**

**AuditLog**
- `log_id` (uuid)
- `timestamp` (timestamp)
- `actor_user_id` (varchar)
- `accion` (varchar)
- `entidad` (varchar)
- `entidad_id` (varchar)
- `resultado` (enum)

### 8.4 Conexiones
- Transversal a todos los módulos (acceso, aprobación, evidencia).

### 8.5 Qué revisar en B-GRC
- ¿SSO real (SAML/OIDC) + mapeo grupos a roles?
- ¿Roles por ámbito (empresa/unidad) y segregación?
- ¿Bitácora completa de acciones?

---

## 9) Operación + monitoreo (pág 70-71)

### 9.1 Fuente
- Anexo 7: operación/monitoreo (pág 70–71 según tu nota).

### 9.2 Qué pide (según tu resumen)
- Monitoreo proactivo del servicio con tableros y alertas (disponibilidad/continuidad).
- Respuesta 24x7 dentro del alcance.
- Evidencia operacional: métricas, coordinación con el banco, auditoría operativa.

### 9.3 Datos mínimos + tipos (derivado para poder evidenciar)
**ComponenteMonitoreado**
- `componente_id` (uuid)
- `nombre` (varchar)
- `tipo` (enum: APP/DB/INTEGRACION/RED/OTRO)
- `criticidad` (enum/varchar) — **No especificado**
- `estado` (enum)

**EventoMonitoreo**
- `evento_id` (uuid)
- `componente_id` (FK)
- `tipo_evento` (enum: DISPONIBILIDAD/LATENCIA/ERROR/OTRO)
- `timestamp` (timestamp)
- `severidad` (enum: BAJA/MEDIA/ALTA) — **No especificado** catálogo exacto
- `detalle` (text)
- `alerta_emitida` (boolean)

**IndicadorOperacional (SLA/SLO)**
- `id` (uuid)
- `periodo` (month/year)
- `disponibilidad_pct` (numeric)
- `incidentes_total` (int)
- `mttr` (interval) — **No especificado** si requerido, pero típico

### 9.4 Conexiones
- Con **10 Soporte** (tickets/incidentes), **11 DR** (eventos mayores), **12 Seguridad** (eventos SIEM/logs).

### 9.5 Qué revisar en B-GRC
- ¿B-GRC expone tableros de operación (estado servicio, incidentes, alertas) o es externo?
- ¿Existe registro auditable de alertas e incidentes (quién/qué/cuándo)?
- ¿Se pueden exportar métricas operacionales como evidencia?

### 9.6 Preguntas GAP
- Catálogo de severidades y SLAs exactos exigidos: **No especificado**.

---

## 10) Soporte (operación del servicio) (pág 70)

### 10.1 Fuente
- Anexo 7: soporte (pág 70 según tu nota).

### 10.2 Qué pide (según tu resumen + mínimo operable)
- Canales diferenciados (correo/teléfono/chat) y tiempos medibles.
- Circuito claro: trazabilidad, responsabilidades, escalamiento por severidad.
- Evidencia de atenciones (tiempos, cierre, backlog).

### 10.3 Datos mínimos + tipos
**TicketSoporte**
- `ticket_id` (uuid)
- `tipo` (enum: REQUERIMIENTO/SOPORTE/INCIDENTE)
- `severidad` (enum: BAJA/MEDIA/ALTA/CRITICA) — **No especificado** catálogo
- `canal` (enum: CORREO/TELEFONO/CHAT)
- `usuario_reporta` (varchar/FK)
- `fecha_creacion` (timestamp)
- `fecha_primera_respuesta` (timestamp)
- `fecha_cierre` (timestamp)
- `estado` (enum)
- `descripcion` (text)
- `responsable_atencion` (varchar/FK)
- `sla_objetivo` (interval) — **No especificado**
- `sla_cumplido` (boolean)

### 10.4 Conexiones
- Con **9 Operación** (incidentes), **8 IAM** (accesos), **12 Seguridad** (incidentes seguridad).

### 10.5 Qué revisar en B-GRC
- ¿Hay módulo tickets o integración con herramienta ITSM?
- ¿Reporte SLA y tiempos de respuesta/cierre?
- ¿Escalamiento por severidad existe y es auditable?

---

## 11) Recuperación de desastres del servicio (continuidad del servicio SaaS) (pág 69, 100-101)

### 11.1 Fuente
- Anexo 7: continuidad del servicio (pág 69, 100–101 según tu nota).

### 11.2 Qué pide (según tu resumen)
- Estrategia de resiliencia, respaldos y recuperación para la plataforma (no BCP del banco).
- Requisitos de ubicación (componentes/backups en el país) y umbrales RTO/RPO.
- Evidencias: pruebas de restauración, reportes de backup, procedimientos.

### 11.3 Datos mínimos + tipos (derivado)
**DR_Plan**
- `dr_plan_id` (uuid)
- `descripcion` (text)
- `alcance` (text)
- `rto_objetivo` (interval) — **No especificado** valor
- `rpo_objetivo` (interval) — **No especificado** valor
- `data_residency` (enum/varchar) — “en el país” **No especificado** detalle
- `procedimiento_url` (text)

**BackupPolitica**
- `backup_id` (uuid)
- `frecuencia` (varchar/enum) — **No especificado**
- `cifrado` (boolean)
- `retencion_dias` (int) — **No especificado**
- `ubicacion` (varchar) — **No especificado**
- `ultimo_backup_ok` (timestamp)

**DR_PruebaRestauracion**
- `test_id` (uuid)
- `fecha` (date)
- `resultado` (enum: OK/ERROR)
- `tiempo_restauracion` (interval)
- `evidencias` (N..M adjuntos/urls)

### 11.4 Conexiones
- Con **9 Operación** (eventos mayores), **12 Seguridad** (incidentes), **7 Reportería** (evidencias y auditoría).

### 11.5 Qué revisar en B-GRC
- ¿B-GRC (como SaaS) ya tiene documentación/evidencias DR listas?
- ¿Existen reportes de backups y pruebas de restauración entregables al banco?
- ¿Se cumple data residency (Chile) y cómo se demuestra?

### 11.6 Preguntas GAP (alta)
- RTO/RPO exigidos (valores), ventanas, frecuencia mínima pruebas.

---

## 12) Seguridad (logs, backups, borrado seguro, transferencias) (pág 93-99)

### 12.1 Fuente
- Anexo 7: seguridad (pág 93–99 según tu nota) + referencias a transferencias (pág 93–95 según tu nota).

### 12.2 Qué pide (según tu resumen)
- Logs con trazabilidad (quién/cuándo/dónde/qué/resultado), NTP, no registrar secretos.
- Backups robustos (cifrado, pruebas recuperación, documentación, retención).
- Borrado/destrucción segura con inventario mínimo (responsable, tipo medio, ubicación).
- Transferencias seguras: PGP, SFTP y autenticación robusta.

### 12.3 Datos mínimos + tipos
**LogEvento**
- `log_id` (uuid)
- `timestamp` (timestamp)
- `user_id` (varchar/FK) — si aplica
- `origen` (varchar) — IP/host **No especificado**
- `accion` (varchar)
- `entidad` (varchar)
- `entidad_id` (varchar)
- `resultado` (enum: OK/ERROR)
- `detalle` (text) — sin secretos

**ConfigNTP**
- `id` (uuid)
- `servidor_ntp` (varchar)
- `estado` (enum)

**BorradoSeguroRegistro**
- `id` (uuid)
- `fecha` (date)
- `responsable` (varchar/FK)
- `tipo_medio` (varchar)
- `ubicacion` (varchar)
- `metodo` (varchar) — **No especificado**
- `evidencia` (text/url)

**TransferenciaSegura**
- `id` (uuid)
- `tipo` (enum: SFTP/OTRO)
- `cifrado_pgp` (boolean)
- `autenticacion` (enum/varchar) — **No especificado**
- `registro_envio` (text/json) — trazabilidad

### 12.4 Conexiones
- Con **13 Integraciones** (canales de transferencia), **9 Operación** (incidentes), **8 IAM** (accesos), **7 Reportería** (evidencias).

### 12.5 Qué revisar en B-GRC
- ¿Bitácora de eventos exportable y con retención?
- ¿Política y evidencia de backups (cifrado + restore tests)?
- ¿Procedimientos e inventario de borrado seguro?
- ¿Transferencias SFTP/PGP soportadas y auditables?

---

## 13) Integraciones / intercambio de archivos (pág 66 y 69, 93-95)

### 13.1 Fuente
- Anexo 7: integraciones/intercambio (pág 66 y 69 según tu nota) + seguridad transferencias (pág 93–95 según tu nota).

### 13.2 Qué pide
- Integración con ecosistema banco/terceros.
- Flujos críticos de carga/descarga (ej. SFTP), con trazabilidad (qué/cuándo/resultado).
- Requisitos de seguridad asociados: cifrado, autenticación, evidencias operacionales.
- Registrar dependencias externas que impactan continuidad y permitir gestión/seguimiento.

### 13.3 Datos mínimos + tipos
**IntegracionArchivo**
- `integracion_id` (uuid)
- `mecanismo` (enum: SFTP/FTPS/OTRO)
- `origen` / `destino` (varchar)
- `frecuencia` (varchar/enum) — **No especificado**
- `ventana` (varchar) — **No especificado**
- `cifrado_pgp` (boolean)
- `auth_metodo` (varchar/enum) — **No especificado**
- `estado` (enum)

**RegistroTransferencia**
- `id` (uuid)
- `integracion_id` (FK)
- `timestamp` (timestamp)
- `archivo_nombre` (varchar)
- `hash` (varchar) — **No especificado**
- `resultado` (enum: OK/ERROR)
- `detalle_error` (text)

### 13.4 Conexiones
- Con **12 Seguridad** (políticas), **9 Operación** (monitoreo), **1–7** según el dato integrado.

### 13.5 Qué revisar en B-GRC
- ¿B-GRC soporta integraciones por archivo (SFTP) nativamente?
- ¿Registra transferencias con auditoría completa y reintentos?
- ¿Permite evidenciar cumplimiento de cifrado/autenticación?

---

## 14) Pruebas (pág 36, 51-52 y 55)

### 14.1 Fuente
- Anexo 7: pruebas de continuidad (pág 36, 51–52 y 55 según tu nota).

### 14.2 Qué pide
- Registrar/controlar resultados de pruebas BCP/DRP y mantener evidencias.
- Planificar/ejecutar/evaluar pruebas; cada prueba con código, tipo, área.
- Adjuntar evidencias e informe ejecutivo.

### 14.3 Datos mínimos + tipos
**PruebaContinuidad**
- `prueba_id` (uuid)
- `plan_codigo` (varchar)
- `tipo_prueba` (enum: ESCRITORIO/SIMULACION/REAL) — **No especificado** catálogo exacto
- `area` (varchar/enum)
- `fecha_inicio` / `fecha_fin` (timestamp)
- `resultado` (enum: OK/PARCIAL/FAIL) — **No especificado**
- `observaciones` (text)
- `evidencias` (N..M adjuntos/urls)
- `informe_ejecutivo_url` (text)
- `plan_accion_id` (FK nullable)

### 14.4 Conexiones
- Con **2 BCP** y **11 DR** (pruebas), y con **5 Planes de acción**.

### 14.5 Qué revisar en B-GRC
- ¿Existe objeto prueba estructurado o solo adjuntos?
- ¿Permite asociar prueba a plan (BCP/DRP) y generar plan de acción?

---

## 15) Base de Pérdidas (pág 55-56)

### 15.1 Fuente
- Anexo 7: Base de pérdidas + apetito riesgo operacional (pág 55–56 según tu nota).

### 15.2 Qué pide
- Gestionar BBPP con datos formales y confiables; analizar tendencias, causas raíz, impacto y aprendizaje.
- Verificar si pérdidas están dentro del apetito aceptado por alta administración.
- Asignación: cuenta contable, proceso, causas y líneas Basilea, reportes, monitoreo evolución.

### 15.3 Datos mínimos + tipos
**EventoPerdidaOperacional**
- `evento_id` (uuid)
- `fecha_evento` (date)
- `monto` (numeric(18,2))
- `cuenta_contable` (varchar)
- `proceso_id` (FK)
- `causa_raiz` (varchar/text) — **No especificado** catálogo
- `linea_basilea` (varchar/enum) — **No especificado**
- `tipo_perdida_basilea` (varchar/enum) — **No especificado**
- `fuente` (enum: CONTABILIDAD/OTRA)
- `evidencia_url` (text) — **No especificado**

**ApetitoRO**
- `periodo` (month/year)
- `total_perdidas_operacionales` (numeric)
- `total_ingresos_operacionales` (numeric)
- `ratio` (numeric) — calculado
- `umbral` (numeric) — **No especificado**

### 15.4 Conexiones
- Con **13 Integraciones** (contabilidad), **7 Reportería**, **3 Riesgo Operacional**.

### 15.5 Qué revisar en B-GRC
- ¿Existe BBPP monetizada o solo “eventos” sin monto?
- ¿Asignación a procesos y cuentas contables?
- ¿Clasificación Basilea y reportes de evolución?

---

## Anexo A — Plantillas para tu levantamiento en B-GRC (rellenables)

### A.1 Ficha por módulo
| Ítem | Completar |
|---|---|
| Módulo |  |
| ¿Existe en B-GRC? (Sí/Parcial/No/No encontrado) |  |
| Menú/ruta/pantallas |  |
| Campos encontrados (nombre + tipo) |  |
| Estados/workflow (borrador/aprobación/etc.) |  |
| Roles (quién crea/aprueba/ve) |  |
| Evidencia (pantalla/export/log) |  |
| Alertas/notificaciones |  |
| Observaciones (limitaciones/workarounds) |  |
| GAP principal vs Anexo |  |

### A.2 Ficha por flujo
| Campo | Completar |
|---|---|
| Flujo |  |
| Disparador |  |
| Pasos |  |
| Datos entrada/salida |  |
| Roles |  |
| Notificaciones |  |
| Evidencia |  |
| GAPs |  |
