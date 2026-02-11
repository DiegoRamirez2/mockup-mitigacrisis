# Módulo de Datos Maestros - Documentación Completa

**Versión:** 1.0  
**Fecha:** 2025-01-13  
**Archivo:** `final_mockup/mockup_v2/index.html`  
**Schema:** `BCMS_PostgreSQL_schema_v8.sql` (68 tablas)

---

## 1. Resumen Ejecutivo

El módulo de **Datos Maestros** es el componente central de configuración del sistema BCMS. Permite gestionar todas las entidades base que son referenciadas por los demás módulos (BIA, Riesgos, Planes, Incidentes, Cumplimiento, etc.).

### Estado Actual de Implementación

| Grupo | Estado | Subtabs Implementados |
|-------|--------|----------------------|
| Organización & Procesos | **IMPLEMENTADO** | 7 subtabs completos |
| Ubicaciones | **PLACEHOLDER** | Pendiente |
| Personas & Roles | **PLACEHOLDER** | Pendiente |
| Activos & Recursos | **PLACEHOLDER** | Pendiente |

---

## 2. Estructura del Módulo

### 2.1 Navegación Principal

El módulo se divide en 4 grupos de pestañas principales:

```
[Organización & Procesos] [Ubicaciones] [Personas & Roles] [Activos & Recursos]
```

### 2.2 Patrón de Diseño UI

Cada entidad sigue el mismo patrón:

1. **Tabla de datos** con columnas visibles del schema
2. **Paginación** debajo de la tabla
3. **Botón "+ Nuevo"** para agregar registros
4. **Formulario de edición** que aparece debajo de la tabla (no inline)
5. **Botón "Archivar"** en el formulario (soft delete)
6. **Badge indicador** para campos Legacy vs BCMS

---

## 3. Grupo: Organización & Procesos (IMPLEMENTADO)

Este grupo contiene 7 subtabs:

### 3.1 Organizaciones

**Tabla:** `organizations`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_organization | INT | PK, auto-generado |
| id_parent_org | INT | FK a organizations (recursivo) |
| code | VARCHAR(50) | Código único |
| name | VARCHAR(255) | Nombre de la organización |
| legal_name | VARCHAR(255) | Razón social |
| tax_id | VARCHAR(100) | RUT/NIF |
| org_type | VARCHAR(50) | ROOT, COMPANY, DIVISION, DEPARTMENT, AREA, OTHER |
| industry | VARCHAR(200) | Industria |
| country | VARCHAR(3) | Código país |
| timezone | VARCHAR(80) | Zona horaria |
| mission | TEXT | Misión |
| vision | TEXT | Visión |
| description | TEXT | Descripción |
| level | INT | Nivel en jerarquía (0-10) |
| path | VARCHAR(500) | Path jerárquico (/1/2/3/) |
| is_active | BOOLEAN | Activo |
| created_at | TIMESTAMPTZ | Fecha creación |
| updated_at | TIMESTAMPTZ | Fecha actualización |
| created_by | VARCHAR(255) | Usuario creador |
| updated_by | VARCHAR(255) | Usuario modificador |
| is_deleted | BOOLEAN | Soft delete |

**Columnas visibles en tabla:**
- Código, Nombre, Nombre Legal, Tipo, Nivel, Padre, País, Industria, Estado

---

### 3.2 Macroprocesos

**Tabla Principal:** `macroprocesses`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_macroprocess | INT | PK, auto-generado |
| code | VARCHAR(50) | Código único |
| name | VARCHAR(255) | Nombre |
| description | TEXT | Descripción |
| category | VARCHAR(100) | Categoría |
| color_hex | CHAR(7) | Color para visualización |
| is_active | BOOLEAN | Activo |
| created_at/updated_at | TIMESTAMPTZ | Auditoría |
| created_by/updated_by | VARCHAR(255) | Auditoría |
| is_deleted | BOOLEAN | Soft delete |

**Tabla Extensión BCMS:** `macroprocess_bcms_data`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_macroprocess | INT | FK a macroprocesses |
| strategic_importance | VARCHAR(20) | CRITICAL, HIGH, MEDIUM, LOW |
| governance_owner_id | BIGINT | FK a users |
| review_frequency | VARCHAR(50) | Frecuencia de revisión |
| last_review_date | DATE | Última revisión |
| next_review_date | DATE | Próxima revisión |
| notes | TEXT | Notas |

**Columnas visibles en tabla:**
- Código, Nombre, Categoría, Importancia, Propietario, Estado

---

### 3.3 Procesos

**Tabla Principal:** `processes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_process | INT | PK, auto-generado |
| id_macroprocess | INT | FK a macroprocesses |
| code | VARCHAR(50) | Código único |
| name | VARCHAR(255) | Nombre |
| description | TEXT | Descripción |
| platform | VARCHAR(255) | Plataforma/Sistema |
| is_active | BOOLEAN | Activo |
| created_at/updated_at | TIMESTAMPTZ | Auditoría |
| created_by/updated_by | VARCHAR(255) | Auditoría |
| is_deleted | BOOLEAN | Soft delete |

**Tabla Extensión BCMS:** `process_bcms_data`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_process | INT | FK a processes |
| business_criticality | VARCHAR(20) | CRITICAL, HIGH, MEDIUM, LOW |
| process_category | VARCHAR(50) | Categoría del proceso |
| target_rto_minutes | INT | RTO objetivo (minutos) |
| target_rpo_minutes | INT | RPO objetivo (minutos) |
| maximum_tolerable_downtime_minutes | INT | MTPD (minutos) |
| minimum_business_continuity_objective | TEXT | MBCO |
| minimum_staff_required | INT | Personal mínimo |
| process_inputs | JSONB | Entradas del proceso |
| process_outputs | JSONB | Salidas del proceso |
| regulatory_drivers | TEXT | Drivers regulatorios |
| applicable_frameworks | JSONB | Frameworks aplicables |
| operating_frequency | VARCHAR(50) | CONTINUOUS, DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL, ON_DEMAND |
| peak_operation_periods | TEXT | Períodos pico |
| automation_level | VARCHAR(20) | MANUAL, SEMI_AUTOMATED, AUTOMATED |
| owner_user_id | BIGINT | FK a users |
| responsible_unit_id | BIGINT | FK a organizational_units |

**Columnas visibles en tabla:**
- Código, Nombre, Macroproceso, Criticidad, RTO, RPO, Automatización, Estado

---

### 3.4 Subprocesos

**Tabla Principal:** `subprocesses`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_subprocess | INT | PK, auto-generado |
| id_process | INT | FK a processes |
| code | VARCHAR(50) | Código único |
| name | VARCHAR(255) | Nombre |
| description | TEXT | Descripción |
| platform | VARCHAR(255) | Plataforma |
| sequence_order | INT | Orden de ejecución |
| is_active | BOOLEAN | Activo |
| created_at/updated_at | TIMESTAMPTZ | Auditoría |
| created_by/updated_by | VARCHAR(255) | Auditoría |
| is_deleted | BOOLEAN | Soft delete |

**Tabla Extensión BCMS:** `subprocess_bcms_data`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_subprocess | INT | FK a subprocesses |
| estimated_duration_minutes | INT | Duración estimada |
| criticality_inherited | BOOLEAN | Hereda criticidad del proceso |
| override_criticality | VARCHAR(20) | Sobrescribir criticidad |
| automation_level | VARCHAR(20) | Nivel de automatización |
| owner_user_id | BIGINT | FK a users |
| verification_required | BOOLEAN | Requiere verificación |
| notes | TEXT | Notas |

**Columnas visibles en tabla:**
- Código, Nombre, Proceso, Orden, Duración, Criticidad, Automatización, Estado

---

### 3.5 Procedimientos

**Tabla Principal:** `procedures`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_procedure | INT | PK, auto-generado |
| id_subprocess | INT | FK a subprocesses |
| code | VARCHAR(50) | Código único |
| name | VARCHAR(255) | Nombre |
| description | TEXT | Descripción |
| platform | VARCHAR(255) | Plataforma |
| sequence_order | INT | Orden de ejecución |
| is_active | BOOLEAN | Activo |
| created_at/updated_at | TIMESTAMPTZ | Auditoría |
| created_by/updated_by | VARCHAR(255) | Auditoría |
| is_deleted | BOOLEAN | Soft delete |

**Tabla Extensión BCMS:** `procedure_bcms_data`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_procedure | INT | FK a procedures |
| execution_steps | JSONB | Pasos de ejecución |
| required_skills | JSONB | Habilidades requeridas |
| required_tools | JSONB | Herramientas requeridas |
| automation_tool | VARCHAR(255) | Herramienta de automatización |
| estimated_duration_min | INT | Duración estimada |
| verification_method | TEXT | Método de verificación |
| fallback_procedure | TEXT | Procedimiento alternativo |
| owner_user_id | BIGINT | FK a users |

**Columnas visibles en tabla:**
- Código, Nombre, Subproceso, Orden, Duración, Herramienta, Estado

---

### 3.6 Contactos

**Tabla:** `contacts`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_contact | BIGINT | PK, auto-generado |
| contact_code | VARCHAR(80) | Código único |
| first_name | VARCHAR(100) | Nombre |
| last_name | VARCHAR(100) | Apellido |
| email | VARCHAR(255) | Email |
| phone_primary | VARCHAR(30) | Teléfono principal |
| phone_secondary | VARCHAR(30) | Teléfono secundario |
| mobile | VARCHAR(30) | Móvil |
| job_title | VARCHAR(150) | Cargo |
| department | VARCHAR(150) | Departamento |
| id_organization | INT | FK a organizations |
| id_user | BIGINT | FK a users |
| id_supplier | BIGINT | FK a suppliers |
| contact_role_lu | BIGINT | FK a lookup_values |
| is_emergency_contact | BOOLEAN | Contacto de emergencia |
| is_active | BOOLEAN | Activo |
| notes | TEXT | Notas |
| created_at/updated_at | TIMESTAMPTZ | Auditoría |

**Columnas visibles en tabla:**
- Código, Nombre, Apellido, Email, Teléfono, Cargo, Organización, Emergencia, Estado

---

### 3.7 Proveedores

**Tabla:** `suppliers`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_supplier | BIGINT | PK, auto-generado |
| supplier_code | VARCHAR(80) | Código único |
| name | VARCHAR(255) | Nombre |
| supplier_type_lu | BIGINT | FK a lookup_values |
| tax_id | VARCHAR(50) | RUT/NIF |
| website | VARCHAR(255) | Sitio web |
| address | TEXT | Dirección |
| city | VARCHAR(100) | Ciudad |
| country_code | CHAR(2) | Código país |
| risk_tier_lu | BIGINT | FK a lookup_values (nivel de riesgo) |
| criticality_lu | BIGINT | FK a lookup_values (criticidad) |
| contract_start | DATE | Inicio contrato |
| contract_end | DATE | Fin contrato |
| sla_summary | TEXT | Resumen SLA |
| is_active | BOOLEAN | Activo |
| id_organization | INT | FK a organizations |
| created_at/updated_at | TIMESTAMPTZ | Auditoría |

**Columnas visibles en tabla:**
- Código, Nombre, Tipo, Riesgo, Criticidad, Inicio, Fin, País, Estado

---

## 4. Grupo: Ubicaciones (PENDIENTE)

**Tablas a implementar:**

### 4.1 Ubicaciones (locations)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_location | BIGINT | PK |
| location_code | VARCHAR(80) | Código único |
| name | VARCHAR(255) | Nombre |
| location_type_lu | BIGINT | FK a lookup_values |
| address_line1 | VARCHAR(255) | Dirección línea 1 |
| address_line2 | VARCHAR(255) | Dirección línea 2 |
| city | VARCHAR(100) | Ciudad |
| region_state | VARCHAR(100) | Región/Estado |
| postal_code | VARCHAR(30) | Código postal |
| country_code | CHAR(2) | País |
| gps_lat | NUMERIC(10,7) | Latitud GPS |
| gps_lon | NUMERIC(10,7) | Longitud GPS |
| capacity_persons | INT | Capacidad personas |
| is_primary | BOOLEAN | Es ubicación principal |
| id_organization | INT | FK a organizations |
| parent_location_id | BIGINT | FK a locations (jerarquía) |

---

## 5. Grupo: Personas & Roles (PENDIENTE)

**Tablas a implementar:**

### 5.1 Usuarios (users)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_user | BIGINT | PK |
| email | VARCHAR(255) | Email único |
| password_hash | VARCHAR(255) | Hash contraseña |
| full_name | VARCHAR(255) | Nombre completo |
| id_primary_org | INT | FK a organizations |
| status | VARCHAR(30) | ACTIVE, INACTIVE, SUSPENDED, LOCKED |
| mfa_enabled | BOOLEAN | MFA habilitado |
| last_login_at | TIMESTAMPTZ | Último login |

### 5.2 Roles (roles)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_role | BIGINT | PK |
| code | VARCHAR(80) | Código único |
| name | VARCHAR(255) | Nombre |
| description | TEXT | Descripción |
| permissions | JSONB | Permisos JSON |
| is_builtin | BOOLEAN | Es rol predefinido |

### 5.3 Permisos (permissions)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_permission | BIGINT | PK |
| code | VARCHAR(120) | Código único |
| name | VARCHAR(255) | Nombre |
| description | TEXT | Descripción |
| module | VARCHAR(100) | Módulo |

### 5.4 Unidades Organizativas (organizational_units)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_unit | BIGINT | PK |
| id_organization | INT | FK a organizations |
| id_parent_unit | BIGINT | FK a organizational_units |
| code | VARCHAR(50) | Código |
| name | VARCHAR(200) | Nombre |
| unit_type | VARCHAR(50) | Tipo de unidad |
| manager_user_id | BIGINT | FK a users |

---

## 6. Grupo: Activos & Recursos (PENDIENTE)

**Tablas a implementar:**

### 6.1 Activos (assets)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_asset | BIGINT | PK |
| asset_code | VARCHAR(80) | Código único |
| name | VARCHAR(255) | Nombre |
| asset_category_lu | BIGINT | FK a lookup_values |
| asset_type_lu | BIGINT | FK a lookup_values |
| description | TEXT | Descripción |
| owner_user_id | BIGINT | FK a users |
| id_location | BIGINT | FK a locations |
| criticality_lu | BIGINT | FK a lookup_values |
| value_amount | NUMERIC(15,2) | Valor |
| currency_code | CHAR(3) | Moneda |
| acquisition_date | DATE | Fecha adquisición |
| vendor_name | VARCHAR(255) | Proveedor |
| serial_number | VARCHAR(255) | Número de serie |
| metadata | JSONB | Metadatos adicionales |
| id_organization | INT | FK a organizations |

---

## 7. Funciones JavaScript

### 7.1 Funciones de Navegación

```javascript
showDMGroup(groupName)      // Muestra un grupo de Datos Maestros
showDMSubtab(group, subtab) // Muestra un subtab dentro de un grupo
```

### 7.2 Funciones de Formulario

```javascript
toggleEditForm(entityType, rowId) // Abre/cierra formulario de edición
closeEditForm(entityType)         // Cierra formulario de edición
showNewForm(entityType)           // Muestra formulario para nuevo registro
saveDMEntity(entityType)          // Guarda cambios (nuevo o edición)
archiveDMEntity(entityType, id)   // Archiva registro (soft delete)
```

---

## 8. Estilos CSS

### 8.1 Clases Principales

| Clase | Descripción |
|-------|-------------|
| `.dm-group` | Contenedor de grupo de Datos Maestros |
| `.dm-subtab` | Contenedor de subtab |
| `.dm-entity-card` | Tarjeta de entidad |
| `.dm-entity-header` | Cabecera con título y botón nuevo |
| `.dm-subtabs-container` | Contenedor de botones de subtabs |
| `.dm-edit-form-container` | Contenedor del formulario (debajo de tabla) |
| `.badge-legacy` | Badge amarillo para campos legacy |
| `.badge-bcms` | Badge azul para campos BCMS |

---

## 9. Pendientes de Implementación

### 9.1 Alta Prioridad

1. **Grupo Ubicaciones**
   - Tabla locations con todos los campos
   - Formulario de edición con mapa (GPS lat/lon)
   - Jerarquía de ubicaciones (parent_location_id)

2. **Grupo Personas & Roles**
   - Tabla users
   - Tabla roles
   - Tabla permissions
   - Tabla organizational_units
   - Asignación de roles a usuarios

3. **Grupo Activos & Recursos**
   - Tabla assets
   - Relación con vulnerabilities (asset_vulnerabilities)
   - Categorías y tipos desde lookup_values

### 9.2 Media Prioridad

4. **Tablas de Lookup**
   - Gestión de lookup_sets y lookup_values
   - Catálogos configurables por el usuario

5. **Configuración de Aplicación**
   - Tabla application_settings
   - Panel de configuración global

### 9.3 Mejoras Futuras

6. **Exportación/Importación**
   - Export a Excel/CSV
   - Importación masiva desde B-GRC

7. **Auditoría**
   - Visualización de audit_logs por entidad
   - Historial de cambios

---

## 10. Anexo: Relaciones entre Tablas

```
organizations
    ├── organizational_units (id_organization)
    ├── users (id_primary_org)
    ├── contacts (id_organization)
    ├── suppliers (id_organization)
    ├── locations (id_organization)
    ├── assets (id_organization)
    └── organization_macroprocess (N:M)

macroprocesses
    ├── macroprocess_bcms_data (1:1)
    ├── processes (id_macroprocess)
    └── organization_macroprocess (N:M)

processes
    ├── process_bcms_data (1:1)
    ├── subprocesses (id_process)
    └── organization_process (N:M)

subprocesses
    ├── subprocess_bcms_data (1:1)
    ├── procedures (id_subprocess)
    └── organization_subprocess (N:M)

procedures
    ├── procedure_bcms_data (1:1)
    └── organization_procedure (N:M)

suppliers
    └── contacts (id_supplier)

locations
    ├── assets (id_location)
    └── locations (parent_location_id) -- recursivo
```

---

**Documento generado automáticamente**  
**Última actualización:** 2025-01-13
