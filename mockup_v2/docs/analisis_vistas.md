# Análisis de Vistas - mockup_final.html

## Estructura del Mockup Original

El mockup original tiene **20,189 líneas** y contiene **21 vistas** (más adicionales no listadas en sidebar).

## Mapa de Vistas por Línea

| # | Vista ID | Nombre UI | Línea Inicio | Líneas Aprox | Sección Sidebar |
|---|----------|-----------|-------------|--------------|-----------------|
| 1 | dashboard | Dashboard Integrado | 1010 | ~1194 | INICIO |
| 2 | datos-maestros | Datos Maestros | 2204 | ~1808 | PREPARACIÓN |
| 3 | normativas-plantillas | Normativas & Plantillas | 4012 | ~707 | PREPARACIÓN |
| 4 | catalogos | (interno/catálogos) | 4719 | ~276 | - |
| 5 | cambios-bcms | Gestión de Cambios BCMS | 4995 | ~249 | PREPARACIÓN |
| 6 | bia | BIA - Análisis de Impacto | 5244 | ~332 | ANÁLISIS |
| 7 | ria | RIA - Análisis de Riesgos | 5576 | ~331 | ANÁLISIS |
| 8 | riesgos-ciber | Riesgos Ciber | 5907 | ~211 | ANÁLISIS |
| 9 | vista-integrada | Vista Integrada (BIA+RIA+Ciber) | 6118 | ~104 | ANÁLISIS |
| 10 | bcp | Planes de Continuidad (BCP) | 6222 | ~480 | PLANES |
| 11 | drp | Planes de Recuperación TI (DRP) | 6702 | ~421 | PLANES |
| 12 | incidentes | Gestión de Incidentes | 7123 | ~381 | OPERACIÓN |
| 13 | crisis | Gestión de Crisis | 7504 | ~526 | OPERACIÓN |
| 14 | comunicaciones-crisis | Comunicaciones de Crisis | 8030 | ~201 | OPERACIÓN |
| 15 | controles-ley | Controles & Cumplimiento | 8231 | ~495 | CUMPLIMIENTO |
| 16 | pruebas | Pruebas y Simulacros | 8726 | ~258 | VERIFICACIÓN |
| 17 | gobierno | Políticas & Estrategias | 8984 | ~666 | GOBIERNO |
| 18 | aprendizajes | Lecciones Aprendidas | 9650 | ~402 | ASEGURAMIENTO |
| 19 | biblioteca | Biblioteca Normativa | 10052 | ~141 | CUMPLIMIENTO |
| 20 | auditoria | Auditoría | 10193 | ~312 | ASEGURAMIENTO |
| 21 | hallazgos | Hallazgos & Planes de Acción | 10505 | ~??? | ASEGURAMIENTO |

## Vistas Faltantes en el Mapa (en sidebar pero no encontradas como view)

- proveedores → Proveedores & Terceros Críticos
- configuracion → Configuración del Sistema  
- usuarios → Usuarios & Accesos
- recursos-capacidades → Recursos & Capacidades
- capacitacion → Capacitación & Concienciación
- reportes → Reportes Ejecutivos

---

## Análisis Detallado por Vista

### 1. DASHBOARD (líneas 1010-2203, ~1194 líneas)

**Componentes:**
- **Tabs navegación**: 4 pestañas (BCMS, Controles, Riesgos, Integrada)
- **KPI Grid**: 4 cards (Procesos Críticos, Planes BCP, RTO Promedio, Incidentes Mes)
- **Alertas Ejecutivas**: Tabla con tipo, descripción, unidad, severidad, vencimiento
- **Matriz de Riesgo 5x5**: Grid HTML con colores por cuadrante
- **Gráficos Chart.js** (6):
  1. `chartIndiceBCMS` - Índice BCMS
  2. `chartCobertura` - Cobertura BIA/BCP/DRP
  3. `chartIncidentes` - Incidentes por Severidad
  4. `chartRiesgos` - Riesgos por Nivel
  5. `chartPruebas` - Estado de Pruebas
  6. `chartMTTR` - MTTR vs RTO Objetivo
- **Scatter Plot SVG**: RTO vs Criticidad (con tooltips interactivos)
- **Donut Chart SVG**: Distribución por Criticidad
- **Tabla Filtrable**: Procesos críticos con filtros por criticidad y unidad

**Dependencias v8.sql:**
- `process` → Procesos críticos, RTO, RPO, MTPD, criticidad
- `risk` → Matriz de riesgos
- `incident` → Incidentes por severidad
- `continuity_plan` → Planes BCP/DRP
- `plan_test` → Estado de pruebas

---

### 2. DATOS MAESTROS (líneas 2204-4011, ~1808 líneas) ⭐ MÁS GRANDE

**Componentes:**
- **Tabs secundarias**: Organización, Procesos, Ubicaciones, Personas/Roles
- **Árbol jerárquico**: Organización → Macroprocesos → Procesos
- **Tablas CRUD**: Para cada tipo de entidad
- **Formularios**: Modales de creación/edición

**Dependencias v8.sql:**
- `organization`
- `macroprocess`
- `process`
- `location`
- `organizational_unit`
- `role` / `user_account`

---

### 3. NORMATIVAS & PLANTILLAS (líneas 4012-4718, ~707 líneas)

**Componentes:**
- Galería de normativas/frameworks
- Cards de plantillas descargables
- Filtros por jurisdicción

**Dependencias v8.sql:**
- `compliance_framework`
- `document_template` (si existe)

---

### 4. CAMBIOS BCMS (líneas 4995-5243, ~249 líneas)

**Componentes:**
- Tabla de cambios
- Formulario de solicitud de cambio
- Workflow de aprobación

**Dependencias v8.sql:**
- `bcms_changes` ⭐ ISO 22301 Cláusula 6.3

---

### 5. BIA (líneas 5244-5575, ~332 líneas)

**Componentes:**
- Lista de procesos con métricas BIA
- Panel de detalle con RTO/RPO/MTPD/MBCO
- Dependencias del proceso
- Timeline de impacto

**Dependencias v8.sql:**
- `process` (campos BIA)
- `bia_dependency`
- `process_dependency`
- `bia_impact_assessment`

---

### 6. RIA (líneas 5576-5906, ~331 líneas)

**Componentes:**
- Tabla de riesgos
- Matriz de calor
- Panel de tratamiento

**Dependencias v8.sql:**
- `risk`
- `risk_control`
- `control`
- `risk_scenario`

---

### 7. BCP (líneas 6222-6701, ~480 líneas)

**Componentes:**
- Lista de planes BCP
- Detalle con estrategias de recuperación
- Criterios de activación
- Procedimientos de recuperación

**Dependencias v8.sql:**
- `continuity_plan` (plan_type='BCP')
- `recovery_strategy` ⭐ ISO 8.3
- `recovery_procedure` ⭐ ISO 8.4.4
- `activation_criteria` ⭐ ISO 8.4.2

---

### 8. DRP (líneas 6702-7122, ~421 líneas)

**Componentes:**
- Similar a BCP pero enfocado en TI
- Servicios de aplicación
- Activos tecnológicos

**Dependencias v8.sql:**
- `continuity_plan` (plan_type='DRP')
- `app_service`
- `asset`

---

### 9. INCIDENTES (líneas 7123-7503, ~381 líneas)

**Componentes:**
- Tabla de incidentes
- Timeline de eventos
- Formulario de reporte
- Escalamiento

**Dependencias v8.sql:**
- `incident`
- `incident_event`
- `incident_plan_activation`

---

### 10. PRUEBAS (líneas 8726-8983, ~258 líneas)

**Componentes:**
- Calendario de pruebas
- Registro de ejercicios
- Resultados y observaciones

**Dependencias v8.sql:**
- `plan_test` ⭐ ISO 8.5
- `test_participant`
- `test_observation`

---

### 11. AUDITORÍA (líneas 10193-10504, ~312 líneas)

**Componentes:**
- Programa de auditorías
- Lista de auditorías
- Generación de hallazgos

**Dependencias v8.sql:**
- `audit` ⭐ ISO 9.2
- `audit_clause`
- `audit_evidence`

---

### 12. HALLAZGOS (líneas 10505+)

**Componentes:**
- Tabla de hallazgos
- Acciones correctivas
- Seguimiento

**Dependencias v8.sql:**
- `finding` ⭐ ISO 10.1
- `finding_action`

---

### 13. LECCIONES APRENDIDAS (líneas 9650-10051, ~402 líneas)

**Componentes:**
- Registro de lecciones
- Clasificación por origen
- Estado de implementación

**Dependencias v8.sql:**
- `lessons_learned` ⭐ ISO 10.1

---

## Estrategia de Replicación

### Orden recomendado (por dependencias):

1. **CSS Base** - Variables, layout, componentes (estilos originales)
2. **Sidebar** - Navegación completa
3. **Dashboard** - Vista principal con todos los gráficos
4. **Datos Maestros** - Fundamento de datos
5. **BIA** - Depende de procesos
6. **RIA** - Depende de procesos
7. **BCP/DRP** - Depende de BIA/RIA
8. **Incidentes** - Operacional
9. **Pruebas** - Verificación
10. **Auditoría + Hallazgos** - Aseguramiento
11. **Lecciones + Cambios** - Mejora continua

### Archivos a crear/actualizar:

- `css/styles.css` → Replicar CSS original (líneas 10-860)
- `js/datastore.js` → Ya creado, datos demo
- `js/functions.js` → Expandir para todas las vistas
- `js/charts.js` → Replicar 6+ gráficos del dashboard
- `index.html` → Replicar estructura HTML de cada vista
