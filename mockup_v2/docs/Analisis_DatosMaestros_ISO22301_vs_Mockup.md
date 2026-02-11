# 📋 Análisis Datos Maestros: ISO 22301 vs Mockup vs Schema V8

**Fecha:** 2025-01-13  
**Objetivo:** Determinar qué campos del mockup son requeridos por ISO 22301 y cuáles descartar.

---

## ⚖️ REGLA FUNDAMENTAL

1. **Las tablas legacy del CORE (organizations, macroprocesses, processes, subprocesses, procedures) NO SE DEBEN MODIFICAR**
2. **Lo que haga falta para ISO 22301 va en extensiones BCMS**
3. **Lo que no es requerido por ISO 22301 se descarta del mockup**

---

## 📊 ANÁLISIS POR ENTIDAD

### 1. ORGANIZATIONS (Tabla Core - NO MODIFICAR)

| Campo Mockup | ¿Requerido por ISO 22301? | Existe en V8? | Decisión |
|--------------|---------------------------|---------------|----------|
| Código unidad | ✅ SÍ (identificación) | ✅ `code` | **MANTENER** |
| Nombre | ✅ SÍ | ✅ `name` | **MANTENER** |
| País | ✅ SÍ (cláusula 4.1 contexto) | ✅ `country` | **MANTENER** |
| Tipo unidad | ✅ SÍ (jerarquía) | ✅ `org_type` | **MANTENER** |
| Unidad padre | ✅ SÍ (jerarquía) | ✅ `id_parent_org` | **MANTENER** |
| **Responsable** | ⚠️ ISO 5.3 requiere "roles asignados" | ❌ | **NO AGREGAR A CORE** - Usar `contacts` o `user_role_assignments` |
| Estado | ✅ SÍ | ✅ `is_active` | **MANTENER** |

**Veredicto:** ✅ CORE COMPLETO - El campo "Responsable" del mockup debe eliminarse o vincularse a `contacts` sin modificar la tabla core.

---

### 2. MACROPROCESSES (Tabla Core - NO MODIFICAR)

| Campo Mockup | ¿Requerido por ISO 22301? | Existe en V8? | Decisión |
|--------------|---------------------------|---------------|----------|
| Código | ✅ SÍ | ✅ `code` | **MANTENER** |
| Nombre | ✅ SÍ | ✅ `name` | **MANTENER** |
| Categoría | ❌ NO (nice-to-have) | ✅ `category` | **MANTENER** (ya existe) |
| Descripción | ✅ SÍ (documentación) | ✅ `description` | **MANTENER** |
| **Vigencia** | ❌ NO ISO no requiere | ❌ | **🗑️ DESCARTAR del mockup** |
| **Responsable** | ⚠️ ISO 5.3 requiere roles | ❌ | **NO AGREGAR A CORE** |
| Estado | ✅ SÍ | ✅ `is_active` | **MANTENER** |

**Veredicto:** ✅ CORE COMPLETO - Eliminar "Vigencia" y "Responsable" del mockup.

---

### 3. PROCESSES (Tabla Core - NO MODIFICAR)

| Campo Mockup | ¿Requerido por ISO 22301? | Existe en V8? | Decisión |
|--------------|---------------------------|---------------|----------|
| Código | ✅ SÍ | ✅ `code` | **MANTENER** |
| Nombre | ✅ SÍ | ✅ `name` | **MANTENER** |
| Macroproceso | ✅ SÍ (jerarquía) | ✅ `id_macroprocess` | **MANTENER** |
| Plataforma | ❌ NO (nice-to-have) | ✅ `platform` | **MANTENER** (ya existe) |
| **Unidad** | ⚠️ ISO 8.2.2 requiere "quién ejecuta" | ✅ Tabla N:M | **NO AGREGAR A CORE** - Usar `organization_process` |
| **Dueño** | ⚠️ ISO 5.3 requiere roles | ❌ | **NO AGREGAR A CORE** - Extensión BCMS |
| **Criticidad** | ✅ ISO 8.2.2 BIA la requiere | ❌ en core | **📦 YA EXISTE EN** `bia_records.criticality_level` |
| **BIA flag** | ✅ ISO 8.2.2 | ❌ | **CALCULADO** desde `bia_assessments` - No campo directo |
| **BCP flag** | ✅ ISO 8.4 | ❌ | **CALCULADO** desde `continuity_plans` - No campo directo |
| Estado | ✅ SÍ | ✅ `is_active` | **MANTENER** |

**Veredicto:** 
- ✅ CORE COMPLETO
- 🗑️ Eliminar columnas BIA/BCP del mockup (son calculadas)
- ⚠️ "Dueño" debe vincularse a `contacts` sin modificar core
- ⚠️ "Unidad" ya está en `organization_process` (tabla N:M)

---

### 4. SUBPROCESSES (Tabla Core - NO MODIFICAR)

| Campo Mockup | ¿Requerido por ISO 22301? | Existe en V8? | Decisión |
|--------------|---------------------------|---------------|----------|
| Código | ✅ SÍ | ✅ `code` | **MANTENER** |
| Nombre | ✅ SÍ | ✅ `name` | **MANTENER** |
| Proceso padre | ✅ SÍ | ✅ `id_process` | **MANTENER** |
| Descripción | ✅ SÍ | ✅ `description` | **MANTENER** |
| Plataforma | ❌ NO (nice-to-have) | ✅ `platform` | **MANTENER** (ya existe) |
| **Responsable** | ⚠️ ISO 5.3 | ❌ | **NO AGREGAR A CORE** |
| Estado | ✅ SÍ | ✅ `is_active` | **MANTENER** |

**Veredicto:** ✅ CORE COMPLETO - Eliminar "Responsable" del mockup o vincularlo externamente.

---

### 5. PROCEDURES (Tabla Core - NO MODIFICAR)

| Campo Mockup | ¿Requerido por ISO 22301? | Existe en V8? | Decisión |
|--------------|---------------------------|---------------|----------|
| Código | ✅ SÍ | ✅ `code` | **MANTENER** |
| Nombre | ✅ SÍ | ✅ `name` | **MANTENER** |
| Subproceso padre | ✅ SÍ | ✅ `id_subprocess` | **MANTENER** |
| Descripción | ✅ SÍ | ✅ `description` | **MANTENER** |
| **Documento** | ⚠️ ISO 7.5 info documentada | ❌ | **USAR `evidences`** - Polimórfico con entity_type='PROCEDURE' |
| **Responsable** | ⚠️ ISO 5.3 | ❌ | **NO AGREGAR A CORE** |
| Estado | ✅ SÍ | ✅ `is_active` | **MANTENER** |

**Veredicto:** ✅ CORE COMPLETO - El "Documento" se vincula via `evidences`, no campo directo.

---

## 🎯 RESUMEN EJECUTIVO

### ✅ CORE V8 - NO MODIFICAR (Las 5 tablas legacy están completas)

| Tabla | Estado | Campos Core |
|-------|--------|-------------|
| `organizations` | ✅ Completa | code, name, country, org_type, id_parent_org, is_active |
| `macroprocesses` | ✅ Completa | code, name, category, description, is_active |
| `processes` | ✅ Completa | code, name, id_macroprocess, platform, is_active |
| `subprocesses` | ✅ Completa | code, name, id_process, description, platform, is_active |
| `procedures` | ✅ Completa | code, name, id_subprocess, description, is_active |

---

### 🗑️ DESCARTAR DEL MOCKUP (No requerido por ISO 22301)

| Campo | Tabla Mockup | Razón |
|-------|--------------|-------|
| Vigencia | Macroprocesos | ISO no lo requiere |
| BIA ✓ / ⏳ | Procesos | Es campo calculado desde `bia_assessments`, no persistido |
| BCP ✓ / ⏳ | Procesos | Es campo calculado desde `continuity_plans`, no persistido |

---

### 📦 RESOLVER VÍA EXTENSIONES/RELACIONES (No agregar a core)

| Campo Mockup | Solución Correcta | Implementación |
|--------------|-------------------|----------------|
| **Responsable** (todas las tablas) | Usar `contacts` + tabla polimórfica | Ver propuesta abajo |
| **Unidad** (en Procesos) | Ya existe relación N:M | `organization_process` |
| **Criticidad** | Ya existe en extensión BIA | `bia_records.criticality_level` |
| **Documento** (Procedimientos) | Usar `evidences` polimórfico | `entity_type='PROCEDURE'` |

---

## 🔧 PROPUESTA: Extensión BCMS para "Responsables" (OPCIONAL)

Si se requiere mostrar "Responsable" en el mockup de manera consistente, se podría crear una **tabla polimórfica de ownership** como extensión BCMS:

```sql
-- EXTENSIÓN BCMS (NO modifica core)
CREATE TABLE entity_owners (
  id_entity_owner    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type        VARCHAR(50) NOT NULL,
  entity_id          INT NOT NULL,
  id_contact         INT REFERENCES contacts(id_contact),
  owner_type         VARCHAR(50) DEFAULT 'PRIMARY',
  created_at         TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_entity_type CHECK (entity_type IN (
    'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE'
  )),
  CONSTRAINT ck_owner_type CHECK (owner_type IN ('PRIMARY', 'BACKUP', 'DELEGATE'))
);

CREATE INDEX idx_entity_owner_lookup ON entity_owners(entity_type, entity_id);
```

**NOTA:** Esta extensión NO es requerida por ISO 22301, es solo nice-to-have para el mockup.

---

## 📋 ACCIONES PENDIENTES

1. [ ] Ajustar mockup eliminando columnas de "Vigencia" en Macroprocesos
2. [ ] Cambiar columnas BIA/BCP en Procesos a campos calculados (query JOIN)
3. [ ] Decidir si implementar `entity_owners` para el campo "Responsable"
4. [ ] Ajustar mockup de Procedimientos para vincular documentos via `evidences`

---

## 📊 REFERENCIAS CRUZADAS

- **ISO 22301:2019** - Cláusulas 4.1, 5.3, 7.5, 8.2.2, 8.4
- **Schema V8:** `Diseño/SQL/BCMS_PostgreSQL_schema_v8.sql`
- **Mockup:** `final_mockup/mockup_final.html` (sección Datos Maestros, líneas 2203-4008)
- **Doc ISO Requisitos:** `docs/Requisitos_Estrictos_ISO_22301_2019.md`
