# 📋 Checklist de Pendientes - Mockup Final BCMS

> **Fecha de Generación:** 2026-01-16  
> **Última Revisión:** 2026-01-16 (Segunda Pasada Completa)  
> **Archivo Analizado:** `mockup_final.html` (20,189 líneas, ~1.1 MB)  
> **Propósito:** Lista exhaustiva de elementos pendientes de implementar/mejorar

---

## 📊 Resumen Ejecutivo

| Categoría | Pendientes | Prioridad |
|-----------|------------|-----------|
| Formularios CRUD | 42 | 🔴 Alta |
| DataStore Centralizado | 1 | 🔴 Alta |
| Modales/Diálogos | 35+ | 🟡 Media |
| Funcionalidades "En Desarrollo" | 75+ | 🟡 Media |
| Vistas sin Implementar | 2 | 🟡 Media |
| Datos Hardcodeados | 10 arrays + expansiones | 🔴 Alta |
| Gráficos Dinámicos | 12+ (Chart.js) | 🟢 Baja |
| Exportación/Importación | 6 | 🟡 Media |
| Funciones JS Parciales | 20+ | 🟡 Media |

---

## ✅ YA IMPLEMENTADO (SEGUNDA PASADA)

### Funciones JavaScript Operativas:
- [x] `calcularMetricasDashboard()` - Calcula métricas pero no actualiza UI del dashboard ejecutivo
- [x] `actualizarDashboard()` - Log en consola únicamente (no actualiza valores visuales)
- [x] `agregarIncidente()` / `cerrarIncidente()` - CRUD simulado funcional
- [x] `activarBCP()` - Simula activación con notificaciones
- [x] `agregarHallazgo()` / `programarPrueba()` - CRUD simulado
- [x] `buscarGlobal()` - Búsqueda en memoria funcional
- [x] `validarBIA()` - Validación de formulario BIA
- [x] `calcularNivelRiesgo()` - Calcula nivel por probabilidad × impacto
- [x] `generarAlertas()` - Genera alertas dinámicas en consola
- [x] `mostrarToast()` - Sistema de notificaciones toast funcional
- [x] `exportarReporte()` - 4 tipos (dashboard, ley21663, riesgos, bcp)
- [x] `exportarExcel()` - Simulado (solo toast)
- [x] `renderizarGraficos()` - Chart.js (6 gráficos en Dashboard tab)
- [x] `initCumplimientoChart()` - Tendencia cumplimiento global
- [x] `initRadarCharts()` - 4 radares (Ley21663, ISO27001, NIST, ISO22301)
- [x] `renderDomainBreakdown()` - Desglose dinámico por normativa
- [x] `showDomainConfig()` - Configuración de dominios por normativa
- [x] Funciones de tabs: `showDashTab`, `showGobiernoTab`, `showDMGroupTab`, `showDMTab`, `showNormativasTab`, `showControlesTab`, `showConfigTab`, `showIntegradaTab`, `showView`
- [x] Edición usuarios: `toggleEditarUsuario`, `guardarUsuario`, `cancelarEditarUsuario`
- [x] Navegación: `navegarConFiltro` (drill-down con contexto)
- [x] `showUnifiedTab()` - Tabs unificados tabla + radar
- [x] Tooltips scatter plot con event listeners
- [x] Botones principales: exportar, nuevo incidente, acciones rápidas (con modales)

### Datos Expandidos (Segunda Pasada - Líneas 14750+):
- [x] `procesos.push(...)` - +10 procesos adicionales (total 18)
- [x] `riesgos.push(...)` - +20 riesgos adicionales (total 25)
- [x] `incidentes.push(...)` - +8 incidentes adicionales (total 12)
- [x] `planesBCP.push(...)` - +5 planes BCP adicionales (total 8)
- [x] `planesDRP.push(...)` - +4 planes DRP adicionales (total 6)
- [x] `pruebas.push(...)` - +10 pruebas adicionales (total 15)

### Funciones CRUD Mejoradas (Líneas 15000+):
- [x] `calcularMetricasDashboard()` - Versión mejorada con cálculos completos
- [x] `renderizarDashboard()` - Actualiza elementos `[data-metric]` (requiere atributos en HTML)
- [x] `renderizarGraficosConDatos()` - 6 gráficos Chart.js con datos reales
- [x] Sistema de filtros con `localStorage` persistente
- [x] `navegarConContexto()` + `actualizarBreadcrumbs()`
- [x] `mostrarToast()` - Versión mejorada con container fijo
- [x] `generarAlertasDinamicas()` - 5 reglas de alerta
- [x] `renderizarPanelAlertas()` - Panel visual de alertas
- [x] `registrarHistorico()` - Trazabilidad con localStorage
- [x] `obtenerHistorico()` + `renderizarHistorico()` - Timeline
- [x] `activarBCP()` - Versión mejorada con tareas y timeline
- [x] `crearProceso()`, `editarProceso()`, `eliminarProceso()` - CRUD completo
- [x] `crearIncidente()`, `cerrarIncidente()` - CRUD completo
- [x] `crearRiesgo()` - CRUD básico
- [x] `actualizarEstadosConsistentes()` - Sincronización entre módulos
- [x] `exportarReporte()` - Descarga real con Blob
- [x] `asignarResponsable()` - Asignación dinámica
- [x] `API_DOCS` - Documentación de API simulada

### Funciones de Edición y Detalle (Líneas 18500+):
- [x] `toggleEditRow()` - Edición inline en tablas
- [x] `enableRowEdit()` / `saveRowEdits()` / `cancelRowEdit()` - Flujo edición
- [x] `getBadgeClass()` - Clases dinámicas para badges
- [x] `showBIASubtab()` - Navegación subtabs BIA
- [x] `aplicarFiltroRiesgos()` - Filtrado catálogo riesgos
- [x] `verDetalleRiesgo()` - Panel detalle completo (riesgosDetalle mock)
- [x] `seleccionarProcesoBIA()` - Detalle proceso BIA (procesosBIADetalle mock)

---

## 🔴 PRIORIDAD ALTA

### 1. DataStore Centralizado (REQUERIDO)

**Estado:** ❌ No implementado  
**Ubicación propuesta:** Final del archivo, antes de funciones  
**Descripción:** Centralizar todos los datos en un único DataStore con API unificada

#### Datos a migrar al DataStore:

- [ ] `procesos` (línea ~14224) - 8+10 registros (total 18 con expansión)
- [ ] `riesgos` (línea ~14234) - 5+20 registros (total 25 con expansión)
- [ ] `incidentes` (línea ~14243) - 4+8 registros (total 12 con expansión)
- [ ] `planesBCP` (línea ~14250) - 3+5 registros (total 8 con expansión)
- [ ] `planesDRP` (línea ~14258) - 2+4 registros (total 6 con expansión)
- [ ] `pruebas` (línea ~14265) - 5+10 registros (total 15 con expansión)
- [ ] `hallazgos` (línea ~14275) - 3 registros actuales
- [ ] `acciones` (línea ~14282) - 3 registros actuales
- [ ] `usuarios` (línea ~14288) - 5 registros actuales
- [ ] `domainStructures` (línea ~17200) - Estructura dominios por normativa (5 normativas)
- [ ] `riesgosDetalle` (línea ~18600) - Detalle expandido de riesgos (3 registros mock)
- [ ] `procesosBIADetalle` (línea ~19800) - Detalle expandido BIA (mock incompleto)
- [ ] **FALTAN:** organizaciones, macroprocesos, subprocesos, procedimientos, activos, ubicaciones, contactos, proveedores, controles, auditorías, frameworks, requisitos, lecciones aprendidas, cambios BCMS, tags, lookup_values

---

### 2. Formularios CRUD Pendientes

Todos los botones "+ Agregar" actualmente muestran `showBanner('...en desarrollo', 'info')`:

#### Módulo: Datos Maestros
- [ ] Formulario nueva organización (línea 2279)
- [ ] Formulario nuevo macroproceso (línea 2446)
- [ ] Formulario nuevo proceso (línea 2562)
- [ ] Formulario nuevo subproceso (línea 2750)
- [ ] Formulario nuevo procedimiento (línea 2882)
- [ ] Formulario nueva categoría riesgo (línea 3028)
- [ ] Formulario nueva causa (línea 3232)
- [ ] Formulario nuevo efecto (línea 3384)
- [ ] Formulario nuevo activo (línea 3600)
- [ ] Formulario nueva ubicación (línea 3654)
- [ ] Formulario nuevo contacto (línea 3674)
- [ ] Formulario nuevo nivel escalamiento (línea 3748)
- [ ] Formulario nuevo canal comunicación (línea 3795)
- [ ] Formulario nuevo tipo incidente (línea 3847)
- [ ] Formulario nuevo tipo prueba (línea 3881)
- [ ] Formulario nuevo tipo control (línea 3912)

#### Módulo: Normativas & Plantillas
- [ ] Formulario añadir normativa (línea 4031)
- [ ] Formulario añadir categoría (línea 4121)

#### Módulo: Cambios BCMS
- [ ] Edición de cambio (línea 5120)
- [ ] Aprobación/Rechazo de cambio (línea 5121)

#### Módulo: BIA
- [ ] Formulario nuevo proceso BIA (línea 5322)

#### Módulo: RIA
- [ ] Configuración parámetros RIA (línea 5705)
- [ ] Formulario nuevo riesgo (línea 5706)
- [ ] Formulario nuevo control (línea 5837)

#### Módulo: Riesgos Ciber
- [ ] Registrar nuevo riesgo ciber (línea 5987)

#### Módulo: DRP
- [ ] Edición DRP (línea 6994)
- [ ] Simulación de activación (línea 6995)

#### Módulo: Aprendizajes
- [ ] Vista por proceso BIA (línea 9843)
- [ ] Vista por activo crítico (línea 9844)
- [ ] Vista por control (línea 9845)
- [ ] Carga de evidencias (línea 9887)
- [ ] Exportación matriz (línea 9988)

#### Módulo: Biblioteca Normativa
- [ ] Administrador jurisdicciones (línea 10081)
- [ ] Configurador mapeos (línea 10082)
- [ ] Importador paquetes (línea 10083)
- [ ] Agregar normativa personalizada (línea 10084)

#### Módulo: Auditoría
- [ ] Exportar reporte auditoría (línea 10344)

#### Módulo: Hallazgos
- [ ] Edición hallazgo (línea 10644)

#### Módulo: Usuarios
- [ ] Eliminación de usuario (línea 10986)

#### Módulo: Proveedores
- [ ] Nueva evaluación TPRM (línea 11205)

---

### 3. Modales Faltantes

Actualmente solo existen 3 modales implementados:
- `modal-reporte-regulador` (línea 7871)
- `modal-nuevo-incidente` (línea 19365)
- `modal-acciones-rapidas` (línea 19443)

#### Modales a implementar:
- [ ] Modal crear/editar organización
- [ ] Modal crear/editar proceso
- [ ] Modal crear/editar riesgo
- [ ] Modal crear/editar control
- [ ] Modal crear/editar plan BCP
- [ ] Modal crear/editar plan DRP
- [ ] Modal crear/editar prueba
- [ ] Modal crear/editar hallazgo
- [ ] Modal crear/editar usuario
- [ ] Modal crear/editar proveedor
- [ ] Modal crear/editar auditoría
- [ ] Modal detalle riesgo ciber
- [ ] Modal configuración RIA
- [ ] Modal exportación reportes
- [ ] Modal wizard activación BCP (función existe pero no el modal)

---

## 🟡 PRIORIDAD MEDIA

### 4. Vistas con Funcionalidad Limitada

#### Vista: Dashboard (view-dashboard, línea 1010)
- [x] KPIs principales ✓
- [x] Gráficos Chart.js ✓
- [ ] Filtros dinámicos funcionales
- [ ] Actualización en tiempo real al cambiar datos
- [ ] Alertas dinámicas basadas en datos reales

#### Vista: Datos Maestros (view-datos-maestros, línea 2204)
- [x] Tablas con datos ✓
- [x] Botón editar inline `toggleEditRow()` ✓
- [ ] Persistencia de ediciones
- [ ] Validación de formularios
- [ ] Importador de plataforma existente (línea 2215)
- [ ] Exportador de maestros (línea 2218)
- [ ] Validador de consistencia (línea 2221)

#### Vista: Normativas & Plantillas (view-normativas-plantillas, línea 4012)
- [x] Catálogo de frameworks ✓
- [x] Tabs de navegación ✓
- [ ] Editor de normativas funcional
- [ ] Mapeo de requisitos a controles
- [ ] Importación YAML/JSON de bibliotecas

#### Vista: Catálogos (view-catalogos, línea 4719)
- [x] Matriz de riesgos visual ✓
- [ ] Edición de matriz de riesgos
- [ ] Configuración de escalas

#### Vista: Cambios BCMS (view-cambios-bcms, línea 4995)
- [x] Lista de cambios ✓
- [x] Timeline visual ✓
- [ ] Workflow de aprobación funcional
- [ ] Notificaciones a stakeholders
- [ ] Historial de versiones

#### Vista: BIA (view-bia, línea 5244)
- [x] Lista procesos con criticidad ✓
- [x] Formulario impactos ✓
- [ ] Cálculo automático de criticidad
- [ ] Generación de gráficos de impacto
- [ ] Exportación de resultados BIA

#### Vista: RIA (view-ria, línea 5576)
- [x] Lista de riesgos ✓
- [x] Matriz de riesgos gráfica ✓
- [ ] Cálculo automático inherente/residual
- [ ] Vinculación con controles
- [ ] Plan de tratamiento

#### Vista: Riesgos Ciber (view-riesgos-ciber, línea 5907)
- [x] Tabla de riesgos ciber ✓
- [ ] Integración con catálogo de amenazas
- [ ] Vinculación con vulnerabilidades
- [ ] Scoring de riesgo ciber

#### Vista: Vista Integrada (view-vista-integrada, línea 6118)
- [x] Resumen consolidado ✓
- [ ] Drill-down interactivo
- [ ] Filtros cruzados
- [ ] Exportación consolidada

#### Vista: BCP (view-bcp, línea 6222)
- [x] Lista de planes ✓
- [x] Detalle de plan seleccionado ✓
- [ ] Editor de estrategias
- [ ] Editor de procedimientos
- [ ] Vinculación con recursos
- [ ] Generación de runbooks

#### Vista: DRP (view-drp, línea 6702)
- [x] Lista de planes DRP ✓
- [x] Detalle técnico ✓
- [ ] Secuencia de pasos de recuperación
- [ ] Vinculación con sistemas
- [ ] Automatización de pruebas

#### Vista: Incidentes (view-incidentes, línea 7123)
- [x] Lista de incidentes ✓
- [x] Modal nuevo incidente ✓
- [ ] Timeline del incidente
- [ ] Escalamiento automático
- [ ] Vinculación con BCP/DRP

#### Vista: Crisis (view-crisis, línea 7504)
- [x] Formulario declaración crisis ✓
- [ ] War room virtual
- [ ] Gestión de stakeholders
- [ ] Log de decisiones

#### Vista: Comunicaciones Crisis (view-comunicaciones-crisis, línea 8030)
- [x] Plantillas de comunicación ✓
- [ ] Envío simulado de comunicados
- [ ] Trazabilidad de envíos
- [ ] Confirmación de recepción

#### Vista: Controles & Cumplimiento (view-controles-ley, línea 8231)
- [x] Matriz de cumplimiento ✓
- [ ] Vinculación control-requisito dinámica
- [ ] Score de cumplimiento calculado
- [ ] Evidencias por control

#### Vista: Pruebas (view-pruebas, línea 8726)
- [x] Lista de pruebas ✓
- [x] Calendario visual ✓
- [ ] Programación de pruebas
- [ ] Registro de resultados
- [ ] Generación de hallazgos automática

#### Vista: Gobierno (view-gobierno, línea 8984)
- [x] Políticas documentadas ✓
- [ ] Versionado de políticas
- [ ] Workflow de aprobación
- [ ] Difusión y acknowledgment

#### Vista: Aprendizajes (view-aprendizajes, línea 9650)
- [x] Lista lecciones aprendidas ✓
- [ ] Categorización por origen
- [ ] Vinculación con acciones
- [ ] Búsqueda y filtros

#### Vista: Biblioteca (view-biblioteca, línea 10052)
- [x] Catálogo de normativas ✓
- [ ] Detalle de requisitos
- [ ] Mapeo entre frameworks
- [ ] Importación de bibliotecas

#### Vista: Auditoría (view-auditoria, línea 10193)
- [x] Lista de auditorías ✓
- [ ] Creación de auditoría
- [ ] Definición de alcance (scope_items)
- [ ] Asignación de auditores
- [ ] Generación de hallazgos

#### Vista: Hallazgos (view-hallazgos, línea 10505)
- [x] Lista de hallazgos ✓
- [ ] Flujo de remediación
- [ ] Carga de evidencias
- [ ] Cierre con validación

#### Vista: Usuarios (view-usuarios, línea 10769)
- [x] Lista de usuarios ✓
- [x] Formulario de edición básico ✓
- [ ] Asignación de roles por organización
- [ ] Gestión de permisos
- [ ] Activación/desactivación

#### Vista: Proveedores (view-proveedores, línea 11064)
- [x] Lista de proveedores ✓
- [x] Evaluación TPRM visual ✓
- [ ] Cuestionario de evaluación
- [ ] Scoring de riesgo terceros
- [ ] Planes de contingencia

#### Vista: Recursos & Capacidades (view-recursos-capacidades, línea 11694)
- [x] Catálogo de recursos ✓
- [ ] Vinculación con procesos
- [ ] Disponibilidad en crisis

#### Vista: Capacitación (view-capacitacion, línea 12008)
- [x] Programas de capacitación ✓
- [ ] Registro de asistencia
- [ ] Evaluaciones
- [ ] Certificaciones

#### Vista: Configuración (view-configuracion, línea 12333)
- [x] Opciones de configuración ✓
- [ ] Persistencia de configuración
- [ ] Configuración de notificaciones
- [ ] Personalización de UI

#### Vista: Reportes (view-reportes, línea 13129)
- [x] Templates de reportes ✓
- [ ] Generación dinámica
- [ ] Exportación PDF/Excel
- [ ] Programación de envío

#### Vista: Flujo Temporal (view-flujo-temporal, línea 13591)
- [x] Diagrama de flujos ✓ (referencia interna)
- [ ] Interactividad mejorada

---

### 5. Funciones JavaScript Incompletas/Parciales

| Función | Estado | Notas |
|---------|--------|-------|
| `toggleEditRow()` | ✅ Completa | Edición inline con save/cancel |
| `enableRowEdit()` | ✅ Completa | Transforma celdas a inputs/selects |
| `saveRowEdits()` | ✅ Completa | Guarda y aplica badges |
| `cancelRowEdit()` | ✅ Completa | Restaura valores originales |
| `showBanner()` | ✓ Completa | Funciona correctamente |
| `showView()` | ✓ Completa | Funciona correctamente |
| `calcularMetricasDashboard()` | ⚠️ Duplicada | Versión básica (14348) y mejorada (15487) |
| `renderizarGraficos()` | ⚠️ Duplicada | Versión básica (15214) y mejorada (16648) |
| `renderizarGraficosConDatos()` | ✅ Completa | 6 gráficos Chart.js con datos reales |
| `filtrarProcesos()` | ⚠️ Duplicada | Múltiples versiones en diferentes líneas |
| `exportarReporte()` | ⚠️ Parcial | Versión toast (15780) y versión Blob (16978) |
| `exportarExcel()` | ⚠️ Parcial | Solo muestra toast, no genera archivo |
| `crearProceso()` | ✅ Existe | Con validación y registro histórico |
| `editarProceso()` | ✅ Existe | Con registro histórico y actualización |
| `eliminarProceso()` | ✅ Existe | Con verificación de dependencias |
| `crearIncidente()` | ✅ Existe | Con alerta si es crítico |
| `cerrarIncidente()` | ✅ Existe | Con cálculo MTTR |
| `crearRiesgo()` | ✅ Existe | Con cálculo automático de nivel |
| `activarBCP()` | ✅ Mejorada | Versión completa con tareas y timeline |
| `mostrarWizardActivacionBCP()` | ⚠️ Parcial | Lógica existe con confirm(), sin modal UI |
| `generarAlertas()` | ⚠️ Básica | 5 tipos de alertas estáticas |
| `generarAlertasDinamicas()` | ✅ Completa | Reglas dinámicas basadas en datos |
| `renderizarPanelAlertas()` | ✅ Completa | Renderiza panel visual |
| `validarFormulario()` | ✅ Existe | Validación genérica de campos |
| `validarBIA()` | ✅ Existe | Validación específica para BIA |
| `registrarHistorico()` | ✅ Completa | Con persistencia localStorage |
| `obtenerHistorico()` | ✅ Completa | Filtrado por tipo/entidad |
| `renderizarHistorico()` | ✅ Completa | Renderiza timeline visual |
| `actualizarEstadosConsistentes()` | ✅ Completa | Sincronización entre módulos |
| `asignarResponsable()` | ✅ Completa | Con notificación simulada |
| `aplicarFiltroRiesgos()` | ✅ Completa | Filtrado catálogo riesgos |
| `verDetalleRiesgo()` | ✅ Completa | Panel detalle expandido |
| `seleccionarProcesoBIA()` | ⚠️ Parcial | Solo 1 proceso mock completo |
| `showBIASubtab()` | ✅ Completa | Navegación subtabs |
| `initCumplimientoChart()` | ✅ Completa | Tendencia multi-normativa |
| `initRadarCharts()` | ✅ Completa | 4 radares por normativa |
| `renderDomainBreakdown()` | ✅ Completa | Desglose dinámico |
| `showDomainConfig()` | ✅ Completa | Configuración por normativa |
| `debounce()` | ✅ Completa | Utilidad para búsqueda |
| `mostrarAyudaAPI()` | ✅ Completa | Documentación en consola |

---

### 6. Exportación/Importación

- [ ] Exportar PDF (reportes ejecutivos)
- [ ] Exportar Excel (datos maestros, BIA, RIA)
- [ ] Importar CSV (datos maestros)
- [ ] Importar YAML/JSON (bibliotecas normativas)
- [ ] Exportar planes BCP/DRP completos
- [ ] Backup/Restore de configuración

---

## 🟢 PRIORIDAD BAJA

### 7. Mejoras de UX/UI

- [ ] Indicador de carga (spinner) en operaciones
- [ ] Confirmación antes de eliminar
- [ ] Breadcrumbs funcionales en todas las vistas
- [ ] Responsive design para móviles
- [ ] Tema oscuro (opcional)
- [ ] Tooltips informativos
- [ ] Ayuda contextual

### 8. Gráficos y Visualizaciones

- [ ] Heatmap de riesgos interactivo
- [ ] Gráfico de Gantt para pruebas
- [ ] Diagrama de dependencias de procesos
- [ ] Timeline de incidentes
- [ ] Gráfico de cumplimiento por framework
- [ ] Dashboard de KPIs personalizables
- [ ] Mapa de calor de impacto BIA
- [ ] Gráfico sunburst de estructura organizacional

### 9. Integraciones (Futuro)

- [ ] Notificaciones email (simuladas)
- [ ] Integración calendario (iCal)
- [ ] SSO/LDAP (simulado)
- [ ] API REST (documentación)

---

## 📁 Datos Demo Sugeridos por Entidad

Para una demo convincente, se recomienda tener:

| Entidad | Registros Sugeridos | Estado Actual |
|---------|---------------------|---------------|
| organizations | 5-8 | ❌ No existe |
| macroprocesses | 4-6 | ❌ No existe |
| processes | 10-15 | ✅ 18 registros (8+10 expansión) |
| subprocesses | 15-20 | ❌ No existe |
| procedures | 20-30 | ❌ No existe |
| users | 10-15 | ✅ 5 registros |
| roles | 5 | ❌ No existe |
| risks | 8-12 | ✅ 25 registros (5+20 expansión) |
| controls | 10-15 | ❌ No existe (solo referenciados en riesgos) |
| incidents | 5-8 | ✅ 12 registros (4+8 expansión) |
| planesBCP | 5-8 | ✅ 8 registros (3+5 expansión) |
| planesDRP | 3-5 | ✅ 6 registros (2+4 expansión) |
| pruebas | 8-10 | ✅ 15 registros (5+10 expansión) |
| hallazgos | 5-8 | ✅ 3 registros |
| acciones | 5-8 | ✅ 3 registros |
| audits | 2-3 | ❌ No existe (solo referenciados en hallazgos) |
| suppliers | 5-8 | ❌ No existe (tablas HTML estáticas) |
| assets | 10-15 | ❌ No existe |
| locations | 3-5 | ❌ No existe |
| contacts | 10-15 | ❌ No existe |
| frameworks | 3-5 | ⚠️ Solo en `domainStructures` (5 normativas) |
| requirements | 20-50 | ❌ No existe |
| lessons_learned | 5-8 | ❌ No existe |
| bcms_changes | 3-5 | ❌ No existe |
| lookup_sets | 10-15 | ❌ No existe |
| lookup_values | 50-80 | ❌ No existe |
| tags | 10-20 | ❌ No existe |
| riesgosDetalle | 10-15 | ⚠️ Solo 3 registros mock completos |
| procesosBIADetalle | 10-15 | ⚠️ Solo 1 registro mock (incompleto) |

---

## ✅ Checklist de Implementación (Orden Sugerido)

### Fase 1: Fundamentos (DataStore)
- [ ] 1.1 Crear estructura BCMSDataStore
- [ ] 1.2 Migrar arrays existentes al DataStore
- [ ] 1.3 Agregar datos demo faltantes (organizaciones, controles, etc.)
- [ ] 1.4 Implementar métodos CRUD básicos
- [ ] 1.5 Agregar persistencia localStorage

### Fase 2: CRUD Básico
- [ ] 2.1 Modales reutilizables (crear, editar, eliminar)
- [ ] 2.2 Formularios de Datos Maestros
- [ ] 2.3 Validación de formularios
- [ ] 2.4 Notificaciones de éxito/error

### Fase 3: Interconexión de Módulos
- [ ] 3.1 Conectar BIA con procesos
- [ ] 3.2 Conectar RIA con procesos y controles
- [ ] 3.3 Conectar BCP con procesos críticos
- [ ] 3.4 Conectar Incidentes con BCP/DRP
- [ ] 3.5 Conectar Auditoría con Hallazgos
- [ ] 3.6 Conectar Hallazgos con Acciones

### Fase 4: Dashboard y Métricas
- [ ] 4.1 Dashboard dinámico basado en DataStore
- [ ] 4.2 Filtros funcionales
- [ ] 4.3 Alertas dinámicas
- [ ] 4.4 Actualización en tiempo real

### Fase 5: Exportación y Reportes
- [ ] 5.1 Exportación Excel
- [ ] 5.2 Exportación PDF (simulada)
- [ ] 5.3 Reportes ejecutivos dinámicos

### Fase 6: Pulido Final
- [ ] 6.1 Limpieza de código duplicado
- [ ] 6.2 Consistencia de estilos
- [ ] 6.3 Pruebas de navegación
- [ ] 6.4 Documentación de uso

---

## 📝 Notas Adicionales

1. **Código Duplicado:** Existen funciones duplicadas (ej: `calcularMetricasDashboard`, `renderizarGraficos`). Consolidar en una sola versión.

2. **Estilos CSS:** Los estilos están inline en muchos lugares. Considerar extraer a clases reutilizables.

3. **Accesibilidad:** Faltan atributos ARIA y navegación por teclado en algunos componentes.

4. **Consistencia:** Algunos botones usan `btn-primary`, otros `btn btn-primary`. Unificar nomenclatura.

5. **Validaciones:** Los formularios carecen de validación antes de envío.

---

*Documento generado automáticamente por análisis de mockup_final.html*

---

## 📑 APÉNDICE: Inventario Completo de las 28 Vistas

### Vistas Analizadas (Segunda Pasada Completa)

| # | ID Vista | Nombre | Estado Visual | JS Funcional | Datos |
|---|----------|--------|---------------|--------------|-------|
| 1 | `view-dashboard` | Dashboard Ejecutivo | ✅ Completo | ⚠️ KPIs hardcoded | ✅ Charts dinámicos |
| 2 | `view-datos-maestros` | Datos Maestros BCMS | ✅ Completo | ✅ Tabs + edición | ❌ Sin DataStore |
| 3 | `view-catalogos` | Catálogos de Referencia | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 4 | `view-bia` | BIA - Análisis Impacto | ✅ Completo | ✅ Subtabs + detalle | ⚠️ 1 mock |
| 5 | `view-ria` | RIA - Análisis Riesgos | ✅ Completo | ✅ Filtros + detalle | ⚠️ 3 mocks |
| 6 | `view-vista-integrada` | Vista Integrada | ✅ Completo | ✅ Tabs | ❌ Estático |
| 7 | `view-mapa-riesgos-ciber` | Mapa Riesgos Ciber | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 8 | `view-bcp` | Planes BCP | ✅ Completo | ✅ Detalle panel | ✅ 8 registros |
| 9 | `view-drp` | Planes DRP | ✅ Completo | ⚠️ Parcial | ✅ 6 registros |
| 10 | `view-incidentes` | Gestión Incidentes | ✅ Completo | ✅ Modal + CRUD | ✅ 12 registros |
| 11 | `view-crisis` | Gestión Crisis | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 12 | `view-comunicaciones-crisis` | Comunicaciones Crisis | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 13 | `view-controles-ley` | Controles & Cumplimiento | ✅ Completo | ✅ Tabs multi-norma | ⚠️ Estático |
| 14 | `view-pruebas` | Pruebas y Simulacros | ✅ Completo | ⚠️ Parcial | ✅ 15 registros |
| 15 | `view-gobierno` | Gobierno & Reportes | ✅ Completo | ✅ Tabs | ⚠️ Estático |
| 16 | `view-biblioteca` | Biblioteca Normativa | ✅ Completo | ✅ Tabs | ⚠️ Estático |
| 17 | `view-auditoria` | Gestión Auditorías | ✅ Completo | ⚠️ Parcial | ❌ Sin array |
| 18 | `view-hallazgos` | Hallazgos & Acciones | ✅ Completo | ⚠️ Parcial | ✅ 3 registros |
| 19 | `view-aprendizajes` | Mejora Continua | ✅ Completo | ⚠️ Parcial | ❌ Sin array |
| 20 | `view-usuarios` | Usuarios & Roles | ✅ Completo | ✅ Edición form | ✅ 5 registros |
| 21 | `view-proveedores` | Proveedores & TPRM | ✅ Completo | ✅ Tabs TPRM | ❌ Estático |
| 22 | `view-recursos-capacidades` | Recursos & Capacidades | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 23 | `view-capacitacion` | Capacitación | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 24 | `view-configuracion` | Configuración Sistema | ✅ Extenso | ⚠️ Parcial | ❌ Sin persist |
| 25 | `view-reportes` | Reportes & BI | ✅ Completo | ⚠️ Parcial | ❌ Estático |
| 26 | `view-flujo-temporal` | Flujo Temporal (Ref) | ✅ Completo | N/A | N/A |
| 27 | `view-normativas-plantillas` | Normativas (en DM) | ✅ Completo | ✅ Tabs | ⚠️ Estático |
| 28 | `view-cambios-bcms` | Cambios BCMS (en DM) | ✅ Completo | ⚠️ Parcial | ❌ Sin array |

### Leyenda de Estados:
- ✅ **Completo**: Funcionalidad implementada y operativa
- ⚠️ **Parcial**: Funcionalidad parcial o datos mock limitados
- ❌ **Pendiente**: No implementado o solo HTML estático
- N/A: No aplica (vista de referencia)

### Vistas con Mayor Funcionalidad:
1. **Dashboard** - 6 gráficos Chart.js, 4 radares, tabs, navegación
2. **BIA** - Subtabs, selección proceso, detalle expandido, edición inline
3. **RIA** - Filtros, detalle completo, panel lateral
4. **Incidentes** - Modal nuevo, CRUD, activación BCP
5. **Proveedores** - Tabs TPRM (4), Contingencia (4), detalle
6. **Configuración** - 8+ secciones, backup, logs, integraciones

### Vistas Pendientes de Datos Dinámicos:
1. Auditoría - Necesita array `auditorias`
2. Aprendizajes - Necesita array `lecciones_aprendidas`
3. Cambios BCMS - Necesita array `cambios_bcms`
4. Proveedores - Necesita array `proveedores`
5. Recursos - Necesita array `recursos_capacidades`
6. Capacitación - Necesita array `programas_capacitacion`
---

## 📜 MAPEO ISO 22301:2019 vs MOCKUP

> **Referencia:** [ISO_22301_2019_Guia_Completa_Accesible.md](ISO_22301_2019_Guia_Completa_Accesible.md)  
> **Propósito:** Asegurar que el mockup cubra TODOS los requisitos obligatorios (SHALL) de la ISO

### Cláusula 4: Contexto de la Organización

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| Cuestiones externas e internas | 4.1 | ❌ No existe | 🔴 | `organizations.context_analysis` o documento |
| Partes interesadas y requisitos | 4.2 | ❌ No existe | 🔴 | Tabla `stakeholders` con requisitos |
| Alcance del SGCN | 4.3 | ⚠️ Parcial (Datos Maestros) | 🟡 | Campo `scope_statement` en organización |
| Sistema de gestión documentado | 4.4 | ✅ Estructura general | 🟢 | Mockup como evidencia |

**Datos faltantes para Cláusula 4:**
- [ ] Entidad `stakeholders` (partes interesadas)
- [ ] Campo `requirements[]` en stakeholders
- [ ] Documento de análisis de contexto
- [ ] Declaración formal de alcance

---

### Cláusula 5: Liderazgo

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| Compromiso de alta dirección | 5.1 | ⚠️ Implícito en roles | 🟡 | Rol "Sponsor Ejecutivo" con evidencias |
| Política de continuidad | 5.2 | ✅ Vista Gobierno | 🟢 | `policies[]` con tipo "Continuidad" |
| Roles y responsabilidades | 5.3 | ✅ Vista Usuarios + RBAC | 🟢 | Matriz RACI por proceso |

**Datos faltantes para Cláusula 5:**
- [ ] Documento de política firmado (evidencia)
- [ ] Matriz RACI específica para BCMS
- [ ] Registro de revisiones por dirección

---

### Cláusula 6: Planificación

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| Riesgos del SGCN | 6.1 | ⚠️ RIA cubre riesgos negocio | 🟡 | Riesgos tipo "SGCN" vs "Negocio" |
| Objetivos de continuidad | 6.2 | ⚠️ Dashboard KPIs | 🟡 | Entidad `bcms_objectives` |
| Planificación de cambios | 6.3 | ✅ Vista Cambios BCMS | 🟢 | Array `cambios_bcms` |

**Datos faltantes para Cláusula 6:**
- [ ] Entidad `bcms_objectives` (objetivos medibles)
- [ ] Indicadores por objetivo (KPIs)
- [ ] Plan anual del SGCN

---

### Cláusula 7: Apoyo

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| Recursos | 7.1 | ✅ Vista Recursos & Capacidades | 🟢 | Array `recursos_capacidades` |
| Competencia | 7.2 | ✅ Vista Capacitación | 🟢 | Array `competencies[]` por usuario |
| Concienciación | 7.3 | ✅ Vista Capacitación | 🟢 | Campañas de awareness |
| Comunicación | 7.4 | ✅ Vista Comunicaciones Crisis | 🟢 | Canales + plantillas |
| Información documentada | 7.5 | ⚠️ Biblioteca Normativa | 🟡 | Control de versiones de documentos |

**Datos faltantes para Cláusula 7:**
- [ ] Entidad `competencies` vinculada a usuarios
- [ ] Control de versiones de documentos BCMS
- [ ] Registro de asistencia a capacitaciones
- [ ] Plan de comunicación documentado

---

### Cláusula 8: Operación (CORAZÓN DEL BCMS) 🔴

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| **BIA - Análisis de Impacto** | 8.2.2 | ✅ Vista BIA completa | 🟢 | Entidad `bia_assessments` |
| - Identificar actividades críticas | 8.2.2.a | ✅ Procesos con criticidad | 🟢 | Campo `criticidad` en procesos |
| - Evaluar impactos en tiempo | 8.2.2.b | ✅ Matriz impacto temporal | 🟢 | Campos `impacto_1h, 4h, 24h, 72h` |
| - Establecer RTO, RPO, MTPD | 8.2.2.c | ✅ Campos RTO/RPO/MTPD | 🟢 | `rto_hours`, `rpo_hours`, `mtpd_hours` |
| - Identificar MBCO | 8.2.2.c | ⚠️ Campo OMCN | 🟡 | Campo `mbco_level` (%) |
| - Identificar dependencias | 8.2.2.d | ✅ Subtab dependencias BIA | 🟢 | Relaciones `process_dependencies` |
| **Evaluación de Riesgos** | 8.2.3 | ✅ Vista RIA + Ciber | 🟢 | Entidad `risks` con tratamiento |
| - Identificar riesgos | 8.2.3.a | ✅ Catálogo de riesgos | 🟢 | Array `riesgos` (25 registros) |
| - Analizar riesgos | 8.2.3.b | ✅ Probabilidad × Impacto | 🟢 | Campos `inherente`, `residual` |
| - Evaluar tratamiento | 8.2.3.c | ✅ Estados de tratamiento | 🟢 | Campo `estadoTratamiento` |
| **Estrategias de continuidad** | 8.3 | ⚠️ Implícito en BCP | 🟡 | Entidad `strategies` separada |
| - Estrategias por recurso | 8.3.2 | ⚠️ No explícito | 🔴 | Estrategias: Personal, TI, Instalaciones |
| - Requisitos de recursos | 8.3.3 | ✅ Vista Recursos | 🟢 | Vinculación recurso → proceso |
| **Planes de Continuidad** | 8.4.4 | ✅ Vista BCP | 🟢 | Array `planesBCP` (8 registros) |
| - Propósito y alcance | 8.4.4.a | ⚠️ Campo descripción | 🟡 | Campos `purpose`, `scope` |
| - Roles y autoridades | 8.4.4.b | ⚠️ Solo responsable | 🟡 | Equipo completo + suplentes |
| - Acciones de respuesta | 8.4.4.c | ⚠️ No detallado | 🔴 | Procedimientos paso a paso |
| - Comunicación | 8.4.4.d | ✅ Vista Comunicaciones | 🟢 | Plantillas por escenario |
| - Interdependencias | 8.4.4.e | ⚠️ Implícito | 🟡 | Relaciones entre planes |
| - Stand-down (desactivación) | 8.4.4.h | ❌ No existe | 🔴 | Procedimiento de retorno |
| **Estructura de respuesta** | 8.4.2 | ✅ Vista Crisis | 🟢 | Niveles de escalamiento |
| - Umbrales de activación | 8.4.2.a | ⚠️ Implícito | 🟡 | Criterios documentados |
| **DRP - Recuperación TI** | 8.4.5 | ✅ Vista DRP | 🟢 | Array `planesDRP` (6 registros) |
| **Programa de Ejercicios** | 8.5 | ✅ Vista Pruebas | 🟢 | Array `pruebas` (15 registros) |
| - Escenarios variados | 8.5.b | ⚠️ Solo tipo | 🟡 | Campo `scenario` detallado |
| - Informes post-ejercicio | 8.5.e | ⚠️ Solo resultado | 🔴 | Entidad `exercise_reports` |

**Datos CRÍTICOS faltantes para Cláusula 8:**
- [ ] Entidad `strategies` (estrategias de continuidad por tipo de recurso)
- [ ] Procedimientos paso a paso en BCP (`bcp_procedures[]`)
- [ ] Procedimiento de stand-down/retorno
- [ ] Criterios de activación documentados por nivel
- [ ] Informes de ejercicios (`exercise_reports`)
- [ ] Escenarios de ejercicio detallados

---

### Cláusula 9: Evaluación del Desempeño

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| Monitoreo y medición | 9.1 | ✅ Dashboard KPIs | 🟢 | Métricas calculadas |
| Evaluación de procedimientos | 9.1.2 | ⚠️ Resultado pruebas | 🟡 | Evaluación post-incidente |
| Auditoría interna | 9.2 | ✅ Vista Auditoría | 🟢 | Array `auditorias` |
| - Programa de auditoría | 9.2.a | ⚠️ Lista de auditorías | 🟡 | Programa anual documentado |
| - Alcance por auditoría | 9.2.b | ✅ audit_scope_items | 🟢 | Vinculación auditoría → ítems |
| Revisión por la dirección | 9.3 | ⚠️ Implícito en Gobierno | 🔴 | Entidad `management_reviews` |
| - Actas de revisión | 9.3 output | ❌ No existe | 🔴 | Documentos de actas |

**Datos faltantes para Cláusula 9:**
- [ ] Array `auditorias` con programa anual
- [ ] Entidad `management_reviews` (revisiones por dirección)
- [ ] Actas de revisión documentadas
- [ ] Evaluaciones post-incidente

---

### Cláusula 10: Mejora

| Requisito ISO | Cláusula | Mockup Actual | Estado | Entidad/Vista Requerida |
|--------------|----------|---------------|--------|------------------------|
| No conformidades | 10.1 | ✅ Vista Hallazgos | 🟢 | Array `hallazgos` (3 registros) |
| - Análisis causa raíz | 10.1.b | ⚠️ No explícito | 🟡 | Campo `root_cause` |
| Acciones correctivas | 10.1.c | ✅ Vista Hallazgos | 🟢 | Array `acciones` (3 registros) |
| - Verificación efectividad | 10.1.d | ⚠️ Solo estado | 🟡 | Campo `effectiveness_verified` |
| Mejora continua | 10.2 | ✅ Vista Aprendizajes | 🟢 | Array `lecciones_aprendidas` |

**Datos faltantes para Cláusula 10:**
- [ ] Campo `root_cause` en hallazgos
- [ ] Campo `effectiveness_verified` en acciones
- [ ] Array `lecciones_aprendidas`
- [ ] Vinculación lección → acción → hallazgo

---

## 🎯 ANÁLISIS GAP: ISO 22301 vs v8.sql vs MOCKUP

> **Fecha verificación v8.sql:** 2026-01-16  
> **Archivo analizado:** `Diseño/SQL/BCMS_PostgreSQL_schema_v8.sql` (1,778 líneas, ~68 tablas)  
> **Decisión clave:** Mockup se adapta a v8.sql (NO modificar v8.sql)

---

### 📊 RESUMEN EJECUTIVO DEL GAP

| Categoría | ISO Requiere | v8.sql Tiene | Mockup Tiene | Acción Requerida |
|-----------|--------------|--------------|--------------|------------------|
| Stakeholders | ✅ 4.2 | ❌ NO EXISTE | ❌ No | ⚠️ Evaluar si agregar |
| Objetivos BCMS | ✅ 6.2 | ❌ NO EXISTE | ❌ No | ⚠️ Evaluar si agregar |
| Estrategias recuperación | ✅ 8.3 | ✅ `recovery_strategies` | ❌ No | 🔴 Agregar al mockup |
| Procedimientos recuperación | ✅ 8.4.4 | ✅ `recovery_procedures` | ❌ No | 🔴 Agregar al mockup |
| Criterios activación | ✅ 8.4.2 | ✅ `activation_criteria` | ❌ No | 🔴 Agregar al mockup |
| Pruebas/Ejercicios | ✅ 8.5 | ✅ `plan_tests` | ✅ Array `pruebas` | ✅ Ya existe |
| Auditorías | ✅ 9.2 | ✅ `audits` + `audit_scope_items` | ⚠️ Sin array | 🟡 Agregar array |
| Hallazgos | ✅ 10.1 | ✅ `findings` + `finding_actions` | ✅ Array básico | ✅ Ya existe |
| Lecciones aprendidas | ✅ 10.2 | ✅ `lessons_learned` | ❌ No | 🔴 Agregar al mockup |
| Cambios BCMS | ✅ 6.3 | ✅ `bcms_changes` | ⚠️ Sin array | 🟡 Agregar array |
| Revisión dirección | ✅ 9.3 | ❌ NO EXISTE | ❌ No | ⚠️ Evaluar si agregar |

---

### ✅ TABLAS v8.sql QUE CUBREN ISO 22301 (YA EXISTEN)

#### Cláusula 8 - Operación (CORE)

| Tabla v8.sql | Líneas SQL | Campos Clave | ISO Cláusula |
|--------------|------------|--------------|--------------|
| `continuity_plans` | 864-902 | plan_type: BCP/DRP/CMP/ERP/IRP, scope, status | 8.4.4 |
| `plan_sections` | 905-916 | section_order, section_content, is_mandatory | 8.4.4 |
| `activation_criteria` | 918-929 | criterion_code, threshold_value, is_auto_activate | 8.4.2 |
| `recovery_strategies` | 931-945 | strategy_name, rto_hours, rpo_hours, estimated_cost | 8.3 |
| `recovery_procedures` | 947-960 | step_order, step_title, responsible_role_id, estimated_duration | 8.4.4 |
| `call_trees` | 962-971 | tree_name, root_contact_id | 8.4.4.d |
| `call_tree_nodes` | 973-984 | parent_node_id, node_order, escalation_wait_min | 8.4.4.d |
| `plan_tests` | 986-1003 | test_type: TABLETOP/WALKTHROUGH/SIMULATION/FULL/TECHNICAL | 8.5 |

#### Cláusula 8.2 - BIA y Riesgos

| Tabla v8.sql | Líneas SQL | Campos Clave | ISO Cláusula |
|--------------|------------|--------------|--------------|
| `bia_assessments` | 688-707 | scope, assessment_date, version_label | 8.2.2 |
| `bia_impacts` | 709-719 | impact_category, hours_to_impact, financial_estimate | 8.2.2.b |
| `bia_objectives` | 721-731 | objective_type: RTO/RPO/MTPD/MBCO | 8.2.2.c ✅ |
| `bia_dependencies` | 733-746 | dependency_type: UPSTREAM/DOWNSTREAM/SUPPLIER/ASSET | 8.2.2.d ✅ |
| `process_bcms_data` | 349-373 | target_rto_minutes, target_rpo_minutes, mtpd, mbco | 8.2.2.c ✅ |

#### Cláusula 8.2.3 - Riesgos

| Tabla v8.sql | Líneas SQL | Campos Clave | ISO Cláusula |
|--------------|------------|--------------|--------------|
| `risks` | 563-597 | risk_domain: CONTINUITY/CYBER/OPERATIONAL/INTEGRATED | 8.2.3 |
| `risk_assessments` | 629-645 | assessment_type: INHERENT/RESIDUAL/TARGET, risk_score | 8.2.3.b |
| `risk_treatments` | 661-671 | treatment_type: MITIGATE/TRANSFER/ACCEPT/AVOID | 8.2.3.c |
| `risk_control_mapping` | 647-659 | mitigation_effect, effectiveness_pct, is_key_control | 8.2.3.c |

#### Cláusula 9 - Evaluación

| Tabla v8.sql | Líneas SQL | Campos Clave | ISO Cláusula |
|--------------|------------|--------------|--------------|
| `audits` | 1155-1177 | audit_type: INTERNAL/EXTERNAL/CERTIFICATION/SURVEILLANCE | 9.2 |
| `audit_scope_items` | 1179-1192 | scope_type: PROCESS/LOCATION/REQUIREMENT/CONTROL | 9.2.b |
| `findings` | 1200-1234 | finding_type: NC_MAJOR/NC_MINOR/OBSERVATION/OPPORTUNITY | 10.1 |
| `finding_actions` | 1236-1251 | action_type: CORRECTIVE/PREVENTIVE/IMPROVEMENT | 10.1.c |

#### Cláusula 10 - Mejora (NUEVAS EN v8)

| Tabla v8.sql | Líneas SQL | Campos Clave | ISO Cláusula |
|--------------|------------|--------------|--------------|
| `lessons_learned` | 1484-1533 | source_type, root_cause, recommendations, effectiveness_metrics | 10.2 ✅ |
| `bcms_changes` | 1535-1594 | change_type, impact_assessment, rollback_plan, status workflow | 6.3 ✅ |

#### Cláusula 12 - Incidentes y Crisis

| Tabla v8.sql | Líneas SQL | Campos Clave | ISO Cláusula |
|--------------|------------|--------------|--------------|
| `incidents` | 1009-1042 | incident_type, severity, status, root_cause, lessons_learned | 8.4.3 |
| `incident_timeline` | 1044-1057 | event_type: DETECTION/NOTIFICATION/ESCALATION/ACTION | 8.4.3 |
| `incident_impacts` | 1059-1072 | financial_loss, downtime_minutes, affected_users_count | 8.4.3 |
| `crisis_declarations` | 1074-1093 | crisis_level, activated_plan_id, command_center_location | 8.4.2 |
| `crisis_actions` | 1095-1111 | action_order, assigned_to, priority, outcome | 8.4.2 |

---

### ❌ ENTIDADES ISO 22301 QUE NO EXISTEN EN v8.sql

| Entidad Sugerida | ISO Cláusula | Alternativa en v8.sql | Recomendación |
|------------------|--------------|----------------------|---------------|
| `stakeholders` | 4.2 | Usar `contacts` con `contact_role_lu` | ⚠️ Extender contacts o crear vista |
| `bcms_objectives` | 6.2 | Usar campos KPI en dashboard | ⚠️ Crear array en mockup para demo |
| `management_reviews` | 9.3 | Usar `evidences` tipo "Management Review" | ⚠️ Simular con documentos |

**Decisión:** Para estas 3 entidades faltantes, el mockup puede simularlas con:
1. **Stakeholders** → Usar array `contacts` con rol "Stakeholder"
2. **Objetivos BCMS** → Array simple en mockup con KPIs medibles
3. **Revisión Dirección** → Array de documentos con tipo "Acta Revisión"

---

### 🔴 ACCIONES REQUERIDAS EN MOCKUP (Basadas en v8.sql)

#### Acción 1: Agregar arrays que coincidan con v8.sql

```javascript
// NUEVOS ARRAYS REQUERIDOS (alineados con v8.sql)

const estrategiasRecuperacion = []; // → recovery_strategies
const procedimientosRecuperacion = []; // → recovery_procedures
const criteriosActivacion = []; // → activation_criteria
const arbolesLlamadas = []; // → call_trees + call_tree_nodes
const leccionesAprendidas = []; // → lessons_learned
const cambiosBCMS = []; // → bcms_changes
const auditorias = []; // → audits
const evaluacionesBIA = []; // → bia_assessments + bia_objectives
```

#### Acción 2: Expandir campos en arrays existentes

| Array Mockup | Campo a Agregar | Tabla v8.sql Origen |
|--------------|-----------------|---------------------|
| `procesos` | `mbco_level` (%) | `process_bcms_data.minimum_business_continuity_objective` |
| `procesos` | `criticidad_enum` | `process_bcms_data.business_criticality` (CRITICAL/HIGH/MEDIUM/LOW) |
| `planesBCP` | `activation_criteria[]` | FK a `activation_criteria` |
| `planesBCP` | `recovery_strategies[]` | FK a `recovery_strategies` |
| `planesBCP` | `sections[]` | FK a `plan_sections` |
| `pruebas` | `scenario_detail` | `plan_tests.scope_description` |
| `pruebas` | `issues_found` | `plan_tests.issues_found` |
| `pruebas` | `recommendations` | `plan_tests.recommendations` |
| `hallazgos` | `root_cause` | `findings.root_cause` |
| `hallazgos` | `related_requirement_id` | FK a requisito normativo |
| `incidentes` | `timeline[]` | FK a `incident_timeline` |
| `incidentes` | `impacts[]` | FK a `incident_impacts` |

#### Acción 3: Agregar vistas/tabs para entidades v8.sql

| Tab/Vista Nueva | Ubicación Sugerida | Tablas v8.sql |
|-----------------|-------------------|---------------|
| "Estrategias" | Dentro de BCP | `recovery_strategies` + `recovery_procedures` |
| "Criterios Activación" | Dentro de BCP | `activation_criteria` |
| "Árboles de Llamadas" | Dentro de Crisis | `call_trees` + `call_tree_nodes` |
| "Lecciones Aprendidas" | Vista Aprendizajes | `lessons_learned` (ya existe vista, falta array) |
| "Cambios BCMS" | Vista Cambios | `bcms_changes` (ya existe vista, falta array) |
| "Dependencias BIA" | Dentro de BIA | `bia_dependencies` |

---

### 📋 CHECKLIST FINAL DE MODIFICACIONES AL MOCKUP

#### Fase A: Arrays Mínimos para Demo ISO 22301

- [ ] A.1 Crear `estrategiasRecuperacion[]` con 3-5 registros
- [ ] A.2 Crear `procedimientosRecuperacion[]` con 8-12 pasos por estrategia
- [ ] A.3 Crear `criteriosActivacion[]` con 3-4 niveles (Verde/Amarillo/Naranja/Rojo)
- [ ] A.4 Crear `leccionesAprendidas[]` con 5-8 registros históricos
- [ ] A.5 Crear `cambiosBCMS[]` con 3-5 cambios de ejemplo
- [ ] A.6 Crear `auditorias[]` con 2-3 auditorías (interna, externa, certificación)
- [ ] A.7 Crear `dependenciasBIA[]` con 10-15 dependencias entre procesos

#### Fase B: Expandir Arrays Existentes

- [ ] B.1 Agregar `mbco_level`, `business_criticality` a procesos
- [ ] B.2 Agregar `activation_criteria_id`, `strategies[]`, `sections[]` a planesBCP
- [ ] B.3 Agregar `timeline[]`, `impacts[]` a incidentes
- [ ] B.4 Agregar `root_cause`, `related_requirement_id` a hallazgos
- [ ] B.5 Agregar `issues_found`, `recommendations` a pruebas

#### Fase C: Interfaces UI para Nuevas Entidades

- [ ] C.1 Tab "Estrategias" en vista BCP con lista + detalle
- [ ] C.2 Sección "Criterios de Activación" en detalle de plan BCP
- [ ] C.3 Panel "Lecciones Aprendidas" funcional en vista Aprendizajes
- [ ] C.4 Panel "Cambios BCMS" funcional en vista Cambios
- [ ] C.5 Lista "Auditorías" con estados y scope en vista Auditoría

#### Fase D: Relaciones y Drill-down

- [ ] D.1 Vincular incidente → lección aprendida → acción correctiva
- [ ] D.2 Vincular BCP → estrategia → procedimientos → responsables
- [ ] D.3 Vincular hallazgo → requisito normativo → control
- [ ] D.4 Vincular auditoría → scope_items → hallazgos

---

### 🔗 MAPEO DEFINITIVO: Mockup Arrays → v8.sql Tables

| Array Mockup (actual/nuevo) | Tabla v8.sql | ISO 22301 | Estado |
|-----------------------------|--------------|-----------|--------|
| `organizaciones` (NUEVO) | `organizations` | 4.1 | ❌ Por crear |
| `usuarios` | `users` | 7.2 | ✅ Existe (5 reg) |
| `procesos` | `processes` + `process_bcms_data` | 8.2.2 | ✅ Existe (18 reg) |
| `riesgos` | `risks` + `risk_assessments` | 8.2.3 | ✅ Existe (25 reg) |
| `controles` (NUEVO) | `applied_controls` | 8.2.3.c | ❌ Por crear |
| `planesBCP` | `continuity_plans` (type=BCP) | 8.4.4 | ✅ Existe (8 reg) |
| `planesDRP` | `continuity_plans` (type=DRP) | 8.4.5 | ✅ Existe (6 reg) |
| `estrategiasRecuperacion` (NUEVO) | `recovery_strategies` | 8.3 | ❌ Por crear |
| `procedimientosRecuperacion` (NUEVO) | `recovery_procedures` | 8.4.4.c | ❌ Por crear |
| `criteriosActivacion` (NUEVO) | `activation_criteria` | 8.4.2.a | ❌ Por crear |
| `incidentes` | `incidents` | 8.4.3 | ✅ Existe (12 reg) |
| `timelineIncidente` (NUEVO) | `incident_timeline` | 8.4.3 | ❌ Por crear |
| `declaracionesCrisis` (NUEVO) | `crisis_declarations` | 8.4.2 | ❌ Por crear |
| `pruebas` | `plan_tests` | 8.5 | ✅ Existe (15 reg) |
| `auditorias` (NUEVO) | `audits` | 9.2 | ❌ Por crear |
| `hallazgos` | `findings` | 10.1 | ✅ Existe (3 reg) |
| `acciones` | `finding_actions` | 10.1.c | ✅ Existe (3 reg) |
| `leccionesAprendidas` (NUEVO) | `lessons_learned` | 10.2 | ❌ Por crear |
| `cambiosBCMS` (NUEVO) | `bcms_changes` | 6.3 | ❌ Por crear |
| `evidencias` (NUEVO) | `evidences` | 7.5 | ❌ Por crear |
| `ubicaciones` (NUEVO) | `locations` | 8.3.2.d | ❌ Por crear |
| `activos` (NUEVO) | `assets` | 8.3.2.c | ❌ Por crear |
| `proveedores` (NUEVO) | `suppliers` | 8.2.2.d | ❌ Por crear |
| `contactos` (NUEVO) | `contacts` | 7.4 | ❌ Por crear |

---

### 📈 PRIORIZACIÓN PARA DEMO ACHS (20 usuarios)

Dado que es un cliente pequeño (~20 usuarios), la recomendación es:

#### MVP Demo (Mínimo Viable):
1. ✅ Lo que ya existe: procesos, riesgos, incidentes, BCP, DRP, pruebas, hallazgos
2. 🔴 **AGREGAR**: `leccionesAprendidas` (5 registros) - ISO 10.2
3. 🔴 **AGREGAR**: `cambiosBCMS` (3 registros) - ISO 6.3  
4. 🟡 **AGREGAR**: `auditorias` (2 registros) - ISO 9.2
5. 🟡 **AGREGAR**: `estrategiasRecuperacion` (3 registros) - ISO 8.3

#### Diferido para Fase 2:
- `procedimientosRecuperacion` (detalle de pasos)
- `criteriosActivacion` (umbrales de activación)
- `arbolesLlamadas` (cadenas de comunicación)
- `incident_timeline` (timeline detallado)
- `evidencias` (gestión documental)

---

*Análisis GAP completado el 2026-01-16*  
*Fuentes: ISO 22301:2019, BCMS_PostgreSQL_schema_v8.sql, mockup_final.html*