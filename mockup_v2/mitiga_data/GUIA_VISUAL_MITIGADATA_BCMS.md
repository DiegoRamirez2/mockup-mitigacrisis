# Guía Visual MitigaData → MitigaResilience BCMS

## 1. Objetivo y Alcance

**Objetivo:** adaptar la interfaz visual de `index_refactor.html` (BCMS MitigaResilience) al estilo definido en el referente `mockupv2.html` (MitigaData), logrando alta fidelidad al diseño sin modificar la lógica de negocio, el modelo de datos ni la estructura funcional del sistema.

**Alcance:**
- Archivo objetivo: `mockup_v2/index_refactor.html`
- Archivo CSS principal: `mockup_v2/css/styles.css`
- Componentes CSS: `mockup_v2/css/components/`
- Componentes JS: `mockup_v2/js/components/` (solo ajuste de clases/templates, no lógica)
- NO se modifica: `datastore.js`, esquemas SQL, funciones de negocio

---

## 2. Snapshot de Referencia

Elementos exactos a replicar de `mockupv2.html`:

| Elemento             | Ubicación referente            | Qué copiar                                         |
|---------------------|-------------------------------|-----------------------------------------------------|
| Fuente              | `<head>` L14                  | Inter 300-700 via Google Fonts                      |
| Gradiente principal | `.gradient-bg` L19            | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` |
| Fondo general       | `<body>` L72                  | `bg-gray-50` (#f9fafb)                              |
| Sidebar             | `<aside>` L99                 | Blanco, sombra suave, ancho 256px (w-64)            |
| Sidebar activo      | `<a>` L101                    | `text-purple-700 bg-purple-50 rounded-lg`           |
| Sidebar items       | `<a>` L103+                   | `text-gray-700 hover:bg-gray-50 rounded-lg`         |
| Top bar (nav)       | `<nav>` L73                   | `bg-white shadow-sm sticky top-0 z-50`              |
| Logo container      | `<div>` L79                   | 40x40 gradient-bg, rounded-lg, icono blanco SVG     |
| Cards               | `<div>` L128+                 | `bg-white rounded-xl shadow-sm p-6`                 |
| Card hover          | `.card-hover`                 | `translateY(-4px)` + sombra 12px                    |
| Status badges       | `.status-badge` L37           | Pill con colores semánticos                         |
| Tablas              | `<table>` L475+               | Cabecera `bg-gray-50`, filas `hover:bg-gray-50`     |
| Modales             | `<div>` L286+                 | Overlay negro 50%, card `rounded-xl shadow-xl`      |
| Formularios         | `<input>` L262+               | Borde `gray-300`, focus ring `purple-500`           |
| Animación entrada   | `.fade-in` L49                | `fadeIn 0.5s ease-in` con translateY(10px)          |

---

## 3. Sistema de Diseño

### Principios
1. **Claridad funcional:** cada componente tiene un propósito claro de la norma ISO 22301
2. **Consistencia visual:** mismos tokens en todas las vistas
3. **Jerarquía visual:** tamaños y pesos tipográficos definen importancia
4. **Superficies claras:** fondos blancos y grises claros, sin oscuridad salvo acentos

### Tokens CSS (variables :root)

```css
:root {
  /* Superficies */
  --bg-main: #f9fafb;          /* gray-50, fondo global */
  --bg-panel: #ffffff;          /* cards, sidebar, topbar */
  --bg-sidebar: #ffffff;        /* sidebar claro */
  --bg-tertiary: #f8fafc;       /* áreas sutiles */

  /* Marca / Acento */
  --gradient-brand: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --accent-primary: #7c3aed;    /* purple-600 (acciones principales) */
  --accent-primary-hover: #6d28d9; /* purple-700 */
  --accent-secondary: #10b981;  /* emerald-500 */
  --accent-violet: #7c3aed;

  /* Estado */
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
  --accent-info: #3b82f6;

  /* Texto */
  --text-main: #111827;         /* gray-900 */
  --text-secondary: #374151;    /* gray-700 */
  --text-muted: #6b7280;        /* gray-500 */

  /* Bordes */
  --border-soft: #e5e7eb;       /* gray-200 */
  --border: #d1d5db;            /* gray-300 */

  /* Sombras */
  --shadow-soft: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);

  /* Criticidad */
  --critical: #dc2626;
  --high: #f59e0b;
  --medium: #3b82f6;
  --low: #10b981;
}
```

---

## 4. Paleta Oficial

### Colores principales
| Nombre          | Hex       | Uso                                  |
|----------------|-----------|--------------------------------------|
| Brand gradient | #667eea → #764ba2 | Logo, acentos hero, estrategia cards |
| Purple 50      | #f5f3ff   | Fondo activo sidebar                 |
| Purple 600     | #7c3aed   | Botones primarios, links activos     |
| Purple 700     | #6d28d9   | Hover buttons                        |
| Gray 50        | #f9fafb   | Fondo general body                   |
| Gray 100       | #f3f4f6   | Fondos alternos de tablas            |
| Gray 200       | #e5e7eb   | Bordes suaves                        |
| Gray 300       | #d1d5db   | Bordes inputs                        |
| Gray 500       | #6b7280   | Texto muted                          |
| Gray 700       | #374151   | Texto secundario                     |
| Gray 900       | #111827   | Texto principal, headings            |
| White          | #ffffff   | Cards, sidebar, topbar               |

### Colores de estado
| Estado   | Background       | Texto/Badge  |
|----------|-----------------|--------------|
| Success  | bg-green-100 #dcfce7  | text-green-700 #15803d |
| Warning  | bg-yellow-100 #fef9c3 | text-yellow-700 #a16207 |
| Danger   | bg-red-100 #fee2e2    | text-red-700 #b91c1c |
| Info     | bg-blue-100 #dbeafe   | text-blue-700 #1d4ed8 |
| Neutral  | bg-gray-100 #f3f4f6   | text-gray-700 #374151 |

---

## 5. Tipografía Oficial

**Familia:** Inter (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

| Rol             | Weight | Size   | Color         |
|----------------|--------|--------|---------------|
| H1 (página)    | 700    | 24px   | --text-main   |
| H2 (sección)   | 700    | 20px   | --text-main   |
| H3 (card)      | 600    | 16px   | --text-main   |
| H4 (subsección)| 600    | 14px   | --text-main   |
| Body           | 400    | 14px   | --text-secondary |
| Small/caption  | 400    | 12px   | --text-muted  |
| Badge          | 600    | 11px   | contextual    |
| Micro          | 500    | 10px   | --text-muted  |

**Regla:** toda fuente en CSS debe referenciar `'Inter', sans-serif`. NO usar Poppins, Montserrat ni otras.

---

## 6. Layout Canónico

```
+------------------------------------------------------------------+
| TOP BAR (white, shadow-sm, sticky)                               |
| [Logo gradient] MitigaResilience    [Notif] [Avatar] [Usuario]   |
+------------------------------------------------------------------+
| SIDEBAR (white) |              MAIN CONTENT                      |
| 256px / w-64    |  bg-gray-50, padding 32px                      |
|                 |                                                 |
| [Nav sections]  |  [VIEW container]                               |
| INICIO          |    - KPI Grid                                  |
| PREPARACIÓN     |    - Cards (2-col, 3-col, 4-col)               |
| GOBIERNO        |    - Tables with toolbar                       |
| ANÁLISIS        |    - Tabs + panels                             |
| ...             |    - Modals (overlay)                           |
|                 |                                                 |
| [Footer]        |                                                 |
+-----------------+-------------------------------------------------+
```

- Sidebar fijo izquierdo, scroll interno
- Main content con scroll vertical
- Top bar sticky top

---

## 7. Patrones de Componentes

### 7.1 Cards
```css
.card {
  background: white;
  border-radius: 12px;  /* rounded-xl */
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-soft);
}
```
Hover (opcional): `transform: translateY(-4px); box-shadow: var(--shadow-lg);`

### 7.2 Badges (status)
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;     /* rounded-xl, no pill */
  font-size: 12px;
  font-weight: 600;
}
```
Variantes: `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-neutral`

### 7.3 Tablas
- Wrapper con `border-radius: 12px; overflow: hidden;`
- Cabecera: `background: #f9fafb; border-bottom: 1px solid #e5e7eb;`
- Celdas th: `text-xs font-semibold uppercase tracking-wider text-gray-700`
- Filas: `hover:bg-gray-50`
- Separador: `divide-y divide-gray-200`

### 7.4 Tabs
```css
.tab-btn {
  padding: 10px 20px;
  border-bottom: 3px solid transparent;
  font-weight: 500;
  font-size: 13px;
}
.tab-btn.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
  background: rgba(124, 58, 237, 0.08);
}
```

### 7.5 Formularios
- Inputs: `border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500`
- Labels: `text-sm font-medium text-gray-700`
- Secciones coloreadas (referente): backgrounds pastel con título + icono + grid de campos

### 7.6 Modales
- Overlay: `background: rgba(0,0,0,0.5); z-index 1000`
- Contenido: `bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto`
- Header sticky: `bg-white border-bottom`
- Footer: botones de acción alineados a la derecha

### 7.7 KPI Cards
```css
.kpi-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--accent-primary);
  display: flex;
  align-items: center;
  gap: 16px;
}
```
- Icono: caja 48x48 con fondo de acento + icono blanco
- Valor: 32px bold
- Subtítulo: 11px muted

### 7.8 Alertas
```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
}
```
Variantes por fondo pastel: `.alert-warning` (bg-yellow-50), `.alert-info` (bg-blue-50), `.alert-success` (bg-green-50)

---

## 8. Motion y Estados Interactivos

| Componente    | Propiedad         | Valor                              |
|--------------|-------------------|------------------------------------|
| Cards hover  | transform         | translateY(-4px)                   |
| Cards hover  | box-shadow        | 0 12px 24px rgba(0,0,0,0.15)      |
| Buttons      | transform         | translateY(-1px)                   |
| Buttons      | box-shadow        | mayor intensidad                   |
| Fade-in      | animation         | fadeIn 0.5s ease-in                |
| Tabs         | transition        | all 0.2s ease                      |
| Nav items    | transition        | all 0.2s ease                      |
| Modals       | animation         | slideUp 0.3s ease                  |
| Selectable   | transform hover   | translateX(2px)                    |

**Duración estándar:** `0.2s` para micro-interacciones, `0.3s-0.5s` para entradas.

---

## 9. Política de Iconografía

**Librería:** Bootstrap Icons 1.11.3
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
```

**Reglas:**
- Todo icono usa clase `bi bi-{nombre}`
- Tamaño por defecto en línea con texto
- En KPI/cards: tamaño controlado por contenedor (20px+ para destacar)
- **PROHIBIDO:** Font Awesome (`fa-`), emojis, caracteres especiales
- **PROHIBIDO:** SVGs inline excepto para el logo de marca

**Equivalencias comunes:**

| Concepto         | Clase BI               |
|-----------------|------------------------|
| Dashboard       | `bi-speedometer2`      |
| Datos maestros  | `bi-database`          |
| Normativas      | `bi-journal-check`     |
| Proveedores     | `bi-building`          |
| Configuración   | `bi-gear`              |
| Usuarios        | `bi-people`            |
| Gobierno        | `bi-shield-check`      |
| BIA             | `bi-graph-up-arrow`    |
| RIA             | `bi-exclamation-triangle` |
| BCP             | `bi-clipboard-check`   |
| DRP             | `bi-arrow-repeat`      |
| Incidentes      | `bi-lightning`         |
| Crisis          | `bi-megaphone`         |
| Pruebas         | `bi-check2-circle`     |
| Auditoría       | `bi-search`            |
| Hallazgos       | `bi-flag`              |
| Reportes        | `bi-file-earmark-bar-graph` |
| Agregar         | `bi-plus-lg`           |
| Editar          | `bi-pencil`            |
| Eliminar        | `bi-trash`             |
| Guardar         | `bi-floppy`            |
| Cancelar        | `bi-x-lg`              |
| Expandir        | `bi-chevron-down`      |
| Info            | `bi-info-circle`       |
| Alerta          | `bi-exclamation-triangle-fill` |
| Check           | `bi-check-circle-fill` |

---

## 10. Anti-patrones Prohibidos

1. **NO** usar `style=""` inline salvo `display:none` dinámicos estrictamente necesarios
2. **NO** usar Font Awesome ni emojis
3. **NO** usar Poppins ni Montserrat
4. **NO** usar sidebar oscuro/navy
5. **NO** incluir Tailwind CDN (el proyecto usa CSS vanilla con variables)
6. **NO** hardcodear colores en HTML; usar variables CSS o clases
7. **NO** crear IDs duplicados
8. **NO** incluir texto de arquitectura/flujo interno en contenido de vistas
9. **NO** mezclar patrones de componentes (ej: un badge con estilo de botón)
10. **NO** usar `!important` salvo en overrides de Chart.js canvas sizes

---

## 11. Mapeo de Equivalencias (index_refactor -> estilo objetivo)

| Elemento actual (index_refactor) | Estado | Objetivo (mockupv2)          |
|----------------------------------|--------|-------------------------------|
| `--bg-sidebar: #0f172a`         | Cambiar | `--bg-sidebar: #ffffff`       |
| `font-family: Poppins`          | Cambiar | `font-family: Inter`          |
| `font-family: Montserrat`       | Cambiar | `font-family: Inter`          |
| `--accent-primary: #1f6feb`     | Cambiar | `--accent-primary: #7c3aed`   |
| Sidebar gradient oscuro          | Cambiar | Background blanco, shadow-sm  |
| Nav item active (azul)           | Cambiar | Purple-700 bg-purple-50       |
| Nav text blanco                  | Cambiar | Nav text gray-700             |
| Nav section title blanco         | Cambiar | Nav section title gray-500    |
| Logo blanco                      | Cambiar | Logo gray-900                 |
| `--shadow-soft` actual           | Ajustar | Alinear a Tailwind shadow-sm  |
| Tab active (azul)                | Cambiar | Tab active (purple)           |
| btn-primary azul                 | Cambiar | btn-primary purple-600        |
| Cards border-left colored        | Mantener | Compatible con diseño          |
| Badge system                     | Mantener | Compatible, ajustar colores   |

---

## 12. Backlog por Vista (ordenado por esfuerzo)

| # | Vista                           | Esfuerzo | Estado     | Notas                                |
|---|--------------------------------|----------|------------|--------------------------------------|
| 1 | Datos Maestros                 | Alto     | Pendiente  | Muchos inline, tabs complejos        |
| 2 | Normativas & Plantillas        | Alto     | Pendiente  | TreeView + formularios               |
| 3 | Gobierno                       | Alto     | Pendiente  | Tabs múltiples, estrategia cards     |
| 4 | Proveedores & Terceros Críticos| Alto     | Pendiente  | TPRM tabs, criterios, modales        |
| 5 | Configuración                  | Medio    | Pendiente  | Muchas secciones config              |
| 6 | Vista Integrada (completa)     | Alto     | Pendiente  | Dashboard + tablas + filtros         |
| 7 | Controles & Cumplimiento       | Medio    | Pendiente  | TreeView + tabla de controles        |
| 8 | Reportes                       | Medio    | Pendiente  | Cards + gráficos                     |
| 9 | Crisis                         | Alto     | Pendiente  | Formulario activación + timeline     |
| 10| Dashboard                      | Medio    | Pendiente  | KPIs + charts + grids               |
| 11| BIA                            | Medio    | Pendiente  | Tablas + subtabs                     |
| 12| RIA                            | Medio    | Pendiente  | Matriz + filtros                     |
| 13| BCP                            | Medio    | Pendiente  | Tabs + planes                        |
| 14| DRP                            | Medio    | Pendiente  | Site cards + tier table              |
| 15| Incidentes                     | Bajo     | Pendiente  | Tabla + formulario                   |
| 16| Pruebas                        | Bajo     | Pendiente  | Tabla + calendario                   |
| 17| Auditoría                      | Bajo     | Pendiente  | Tabla + badge status                 |
| 18| Hallazgos                      | Bajo     | Pendiente  | Tabla + acciones                     |
| 19| Aprendizajes                   | Bajo     | Pendiente  | Tabla + formulario                   |
| 20| Cambios BCMS                   | Bajo     | Pendiente  | Timeline + workflow                  |
| 21| Usuarios & Accesos             | Bajo     | Pendiente  | Tabla + roles                        |
| 22| Recursos & Capacidades         | Bajo     | Pendiente  | Grid + tabla                         |
| 23| Comunicaciones Crisis          | Bajo     | Pendiente  | Tabla + plantillas                   |
| 24| Capacitación                   | Bajo     | Pendiente  | Tabla + progreso                     |
| 25| Riesgos Ciber                  | Bajo     | Pendiente  | Matriz + filtros                     |
| 26| Biblioteca Normativa           | Bajo     | Pendiente  | TreeView                             |
| 27| Flujo temporal                 | Bajo     | Pendiente  | Solo referencia interna              |

---

## 13. Checklist de QA Visual y Funcional

### Visual
- [ ] Tipografía Inter uniforme en todo el mockup
- [ ] Sidebar blanco con items en gray-700 y activo en purple-50/purple-700
- [ ] Top bar blanca con sombra suave
- [ ] Cards con border-radius 12px y shadow-sm
- [ ] Badges con paleta de estado consistente
- [ ] Tablas con cabecera gray-50 y hover gray-50
- [ ] Tabs con indicador purple en activo
- [ ] Botones primarios en purple-600
- [ ] Gradiente brand (#667eea → #764ba2) solo en logo y elementos hero
- [ ] Fondos pastel en secciones de formularios (blue-50, green-50, purple-50, etc.)
- [ ] 0 ocurrencias de Font Awesome (`fa-`)
- [ ] Reducción significativa de `style=""` inline

### Funcional
- [ ] `showView()` navega correctamente a todas las vistas
- [ ] Cada `data-view` mapea a un único `id="view-*"`
- [ ] Tabs internos de cada vista alternan paneles correctamente
- [ ] Modales abren/cierran sin errores
- [ ] Render dinámico desde datastore intacto
- [ ] Gráficos Chart.js se renderizan correctamente
- [ ] Sin errores en consola JS
- [ ] Responsive: usable en desktop (1200px+) y mobile (768px)
- [ ] Contraste WCAG AA en texto sobre fondos

---

## 14. Bitácora de Cambios de Estilo

| Fecha      | Fase | Cambio                                                | Archivos afectados                |
|-----------|------|-------------------------------------------------------|-----------------------------------|
| 2025-02-13 | 0    | IDs duplicados saneados (view-vista-integrada, tbody) | index_refactor.html               |
| 2025-02-13 | 2    | Migración completa de Font Awesome a Bootstrap Icons  | index_refactor.html               |
| 2025-02-13 | 1    | Actualización variables CSS a paleta mockupv2         | css/styles.css                    |
| 2025-02-13 | 1    | Migración tipográfica a Inter                         | css/styles.css                    |
| 2025-02-13 | 1    | Sidebar claro con acento purple                       | css/styles.css                    |
| 2025-02-13 | 1    | Top bar y cards alineados a referente                 | css/styles.css                    |
| 2025-02-14 | 3    | Migración masiva de inline styles: 749 → 132 (82% reducción). 86 `background:#f3f4f6` → `.input-readonly`, 29 `grid-column:1/-1` → `.grid-col-full`, 33 `display:none` → `.d-none`, 21 `font-size:12px` → `.fs-12`, 20 `flex:1` → `.flex-1`, 18 `color:#f59e0b` → `.color-amber`, +60 patrones adicionales | css/styles.css, index_refactor.html |
| 2025-02-14 | 3    | Creación Section 18 "CLASES UTILITARIAS" con ~70+ clases: display, flex, spacing, tipografía, colores, bordes, backgrounds, compounds (section-header-flex, heading-reset, panel-reset, sidebar-stat, stat-label, kpi-value-lg, etc.) | css/styles.css |
| 2025-02-14 | 3    | Fusión de 113 atributos `class=""` duplicados generados por reemplazos batch (`class="A" class="B"` → `class="A B"`) | index_refactor.html |
| 2025-02-14 | 3    | Limpieza de definiciones CSS duplicadas entre Section 18 y adiciones posteriores | css/styles.css |
| 2025-02-14 | 4    | P0: Corrección de 21+ atributos `class` duplicados en mismo elemento (tabs DM, tabs Proveedores, cards BCP/Normativas) | index_refactor.html |
| 2025-02-14 | 4    | P1: Reemplazo de todos los colores azules hardcodeados → púrpura brand: `rgba(59,130,246)` → `rgba(124,58,237)`, `#3b82f6/#2563eb/#1e40af/#dbeafe` → `var(--accent-primary)/#6d28d9/#5b21b6/#ede9fe` en DM, Config, Vista Integrada, Controles, Reportes | index_refactor.html, css/styles.css |
| 2025-02-14 | 4    | P2: Bloque `<style>` embebido (~195 líneas) de Datos Maestros movido a `styles.css` Section 19 "DATOS MAESTROS" | css/styles.css, index_refactor.html |
| 2025-02-14 | 4    | P4: Gradientes no-brand en Gobierno reemplazados: rosa `#f093fb→#f5576c` → `#8b5cf6→#a855f7`, cyan `#4facfe→#00f2fe` → `#6366f1→#818cf8` | index_refactor.html |
| 2025-02-14 | 5    | QA final aprobado: 132 inlines restantes, 0 `<style>` blocks, 0 FA icons, 0 Poppins, 0 class duplicados, 0 colores azules, 28 vistas, 7475 líneas | — |
