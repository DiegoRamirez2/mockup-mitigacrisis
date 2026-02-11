# 📊 Comparativa Detallada: Mockup vs Schema V8

**Fecha:** 2025-01-13  
**Objetivo:** Mapeo campo a campo entre el mockup actual y el schema V8

---

## 1. ORGANIZATIONS

### Mockup (mockup_final.html - Tabla Organizaciones)
```
| Código unidad | Nombre | País | Tipo unidad | Unidad padre | Responsable | Estado |
```

### Schema V8 (`organizations`)
```sql
CREATE TABLE organizations (
  id_organization        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_parent_org          INT NULL REFERENCES organizations(id_organization),
  code                   VARCHAR(50) UNIQUE NOT NULL,       -- ✅ Código unidad
  name                   VARCHAR(255) NOT NULL,             -- ✅ Nombre
  legal_name             VARCHAR(255),                      -- Mockup no lo tiene
  tax_id                 VARCHAR(100) UNIQUE,               -- Mockup no lo tiene
  org_type               VARCHAR(50) NOT NULL DEFAULT 'COMPANY', -- ✅ Tipo unidad
  industry               VARCHAR(200),                      -- Mockup no lo tiene
  country                VARCHAR(3),                        -- ✅ País (ISO code)
  timezone               VARCHAR(80) DEFAULT 'America/Santiago',
  mission                TEXT,                              -- Mockup no lo tiene
  vision                 TEXT,                              -- Mockup no lo tiene
  description            TEXT,                              -- Mockup no lo tiene
  level                  INT DEFAULT 0,                     -- Auto-calculado
  path                   VARCHAR(500),                      -- Auto-calculado
  is_active              BOOLEAN DEFAULT TRUE,              -- ✅ Estado
  ...auditoría...
);
```

### Mapeo

| Mockup | V8 Field | Match |
|--------|----------|-------|
| Código unidad | `code` | ✅ |
| Nombre | `name` | ✅ |
| País | `country` | ⚠️ (mockup usa nombre, V8 usa código ISO) |
| Tipo unidad | `org_type` | ✅ |
| Unidad padre | `id_parent_org` | ✅ |
| Responsable | ❌ | **NO EXISTE** |
| Estado | `is_active` | ✅ |

---

## 2. MACROPROCESSES

### Mockup (mockup_final.html - Tabla Macroprocesos)
```
| Código | Nombre macroproceso | Categoría | Descripción | Vigencia | Responsable | Estado |
```

### Schema V8 (`macroprocesses`)
```sql
CREATE TABLE macroprocesses (
  id_macroprocess        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code                   VARCHAR(50) NOT NULL UNIQUE,       -- ✅ Código
  name                   VARCHAR(255) NOT NULL,             -- ✅ Nombre
  description            TEXT,                              -- ✅ Descripción
  category               VARCHAR(100),                      -- ✅ Categoría
  color_hex              CHAR(7),                           -- Mockup no lo tiene
  is_active              BOOLEAN DEFAULT TRUE,              -- ✅ Estado
  ...auditoría...
);
```

### Mapeo

| Mockup | V8 Field | Match |
|--------|----------|-------|
| Código | `code` | ✅ |
| Nombre macroproceso | `name` | ✅ |
| Categoría | `category` | ✅ |
| Descripción | `description` | ✅ |
| Vigencia | ❌ | **NO EXISTE** |
| Responsable | ❌ | **NO EXISTE** |
| Estado | `is_active` | ✅ |

---

## 3. PROCESSES

### Mockup (mockup_final.html - Tabla Procesos)
```
| Código | Nombre proceso | Macroproceso | Unidad | Dueño | Criticidad | Plataforma | BIA | BCP | Estado |
```

### Schema V8 (`processes`)
```sql
CREATE TABLE processes (
  id_process             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_macroprocess        INT NOT NULL REFERENCES macroprocesses(id_macroprocess), -- ✅ Macroproceso
  code                   VARCHAR(50) NOT NULL UNIQUE,       -- ✅ Código
  name                   VARCHAR(255) NOT NULL,             -- ✅ Nombre
  description            TEXT,                              -- Mockup no lo tiene
  platform               VARCHAR(255),                      -- ✅ Plataforma
  is_active              BOOLEAN DEFAULT TRUE,              -- ✅ Estado
  ...auditoría...
);
```

### Mapeo

| Mockup | V8 Field | Match |
|--------|----------|-------|
| Código | `code` | ✅ |
| Nombre proceso | `name` | ✅ |
| Macroproceso | `id_macroprocess` | ✅ |
| Unidad | ❌ core, ✅ `organization_process` | Tabla N:M |
| Dueño | ❌ | **NO EXISTE** |
| Criticidad | ❌ core, ✅ `bia_records.criticality_level` | Extensión BIA |
| Plataforma | `platform` | ✅ |
| BIA | ❌ | **CALCULADO** vía JOIN |
| BCP | ❌ | **CALCULADO** vía JOIN |
| Estado | `is_active` | ✅ |

---

## 4. SUBPROCESSES

### Mockup (mockup_final.html - Tabla Subprocesos)
```
| Código | Nombre subproceso | Proceso padre | Descripción | Plataforma | Responsable | Estado |
```

### Schema V8 (`subprocesses`)
```sql
CREATE TABLE subprocesses (
  id_subprocess          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_process             INT NOT NULL REFERENCES processes(id_process), -- ✅ Proceso padre
  code                   VARCHAR(50) NOT NULL UNIQUE,       -- ✅ Código
  name                   VARCHAR(255) NOT NULL,             -- ✅ Nombre
  description            TEXT,                              -- ✅ Descripción
  platform               VARCHAR(255),                      -- ✅ Plataforma
  sequence_order         INT,                               -- Mockup no lo tiene
  is_active              BOOLEAN DEFAULT TRUE,              -- ✅ Estado
  ...auditoría...
);
```

### Mapeo

| Mockup | V8 Field | Match |
|--------|----------|-------|
| Código | `code` | ✅ |
| Nombre subproceso | `name` | ✅ |
| Proceso padre | `id_process` | ✅ |
| Descripción | `description` | ✅ |
| Plataforma | `platform` | ✅ |
| Responsable | ❌ | **NO EXISTE** |
| Estado | `is_active` | ✅ |

---

## 5. PROCEDURES

### Mockup (mockup_final.html - Tabla Procedimientos)
```
| Código | Nombre procedimiento | Subproceso padre | Descripción | Documento | Responsable | Estado |
```

### Schema V8 (`procedures`)
```sql
CREATE TABLE procedures (
  id_procedure           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_subprocess          INT NOT NULL REFERENCES subprocesses(id_subprocess), -- ✅ Subproceso padre
  code                   VARCHAR(50) NOT NULL UNIQUE,       -- ✅ Código
  name                   VARCHAR(255) NOT NULL,             -- ✅ Nombre
  description            TEXT,                              -- ✅ Descripción
  platform               VARCHAR(255),                      -- Mockup no lo tiene (tiene Documento)
  sequence_order         INT,                               -- Mockup no lo tiene
  is_active              BOOLEAN DEFAULT TRUE,              -- ✅ Estado
  ...auditoría...
);
```

### Mapeo

| Mockup | V8 Field | Match |
|--------|----------|-------|
| Código | `code` | ✅ |
| Nombre procedimiento | `name` | ✅ |
| Subproceso padre | `id_subprocess` | ✅ |
| Descripción | `description` | ✅ |
| Documento | ❌ | **USAR `evidences`** |
| Responsable | ❌ | **NO EXISTE** |
| Estado | `is_active` | ✅ |

---

## 📊 RESUMEN DE GAPS

### Campos del Mockup que NO existen en V8 Core

| Campo | Tablas Afectadas | Solución |
|-------|------------------|----------|
| Responsable/Dueño | TODAS | Extensión polimórfica o `contacts` |
| Vigencia | macroprocesses | 🗑️ Descartar (no ISO) |
| Unidad | processes | Usar tabla N:M `organization_process` |
| Criticidad | processes | Usar `bia_records.criticality_level` |
| BIA flag | processes | Calcular con JOIN a `bia_assessments` |
| BCP flag | processes | Calcular con JOIN a `continuity_plans` |
| Documento | procedures | Usar `evidences` polimórfico |

### Campos de V8 que NO están en Mockup (opcionales para UI)

| Campo | Tabla V8 | Descripción |
|-------|----------|-------------|
| legal_name | organizations | Nombre legal |
| tax_id | organizations | RUT/NIF |
| industry | organizations | Sector industrial |
| color_hex | macroprocesses | Color para diagramas |
| sequence_order | subprocesses, procedures | Orden de ejecución |

---

## 🔗 TABLAS N:M EXISTENTES EN V8

Estas tablas ya resuelven la relación Organización-Proceso:

```sql
-- Ya existen en V8
organization_macroprocess   -- N:M org ↔ macroproceso
organization_process        -- N:M org ↔ proceso
organization_subprocess     -- N:M org ↔ subproceso
organization_procedure      -- N:M org ↔ procedimiento
```

El mockup muestra "Unidad" como campo directo, pero el modelo correcto es la relación N:M.
