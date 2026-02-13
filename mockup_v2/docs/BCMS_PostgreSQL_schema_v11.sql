-- ============================================================================
-- BCMS + Cumplimiento (Ley 21.663 / Multinorma) - PostgreSQL Schema v10
-- CORE HIERARCHY: Macroprocesses > Processes > Subprocesses > Procedures
-- SINGLE-TENANT con Jerarquía de Organizaciones recursiva
-- Compatible con: PostgreSQL 18
--
-- ARQUITECTURA v9:
-- - 1 Instancia por Cliente (1 BD PostgreSQL dedicada)
-- - Jerarquía 4 niveles de procesos como CORE (INT IDs)
-- - *** TABLAS LEGACY (macroprocesses, processes, subprocesses, procedures) ***
-- - *** AJUSTADAS A ESTRUCTURA IDÉNTICA AL SISTEMA B-GRC LEGACY ***
-- - Extensiones BCMS separadas (pattern modular)
-- - Controles aplicables a TODOS los niveles de proceso
-- - Riesgos y BIA vinculados a cualquier nivel
-- - MODELO UNIFICADO DE EVIDENCIAS (sin documents/attachments separados)
-- - Tablas nuevas: threats, vulnerabilities, tags, evidence_versions
-- - Mapeo reference_controls <-> requirement_nodes (N:M)
--
-- GENERADO: 2026-01-20
-- ============================================================================
-- 
-- ████████████████████████████████████████████████████████████████████████████
-- █                    CHANGELOG DETALLADO V8 → V9                           █
-- ████████████████████████████████████████████████████████████████████████████
--
-- ============================================================================
-- CAMBIOS V8 → V9: ALINEACIÓN CON SISTEMA LEGACY B-GRC
-- ============================================================================
--
-- OBJETIVO: Las 4 tablas de la jerarquía de procesos deben ser IDÉNTICAS
--           al sistema legacy B-GRC para garantizar compatibilidad.
--
-- TABLA: macroprocesses
--   ELIMINADO: code (VARCHAR) - No existe en legacy
--   ELIMINADO: color_hex (CHAR) - No existe en legacy  
--   ELIMINADO: is_active (BOOLEAN) - No existe en legacy
--   AGREGADO:  expiration_date (DATE) - Existe en legacy
--   AGREGADO:  deleted_at (TIMESTAMPTZ) - Existe en legacy
--   AGREGADO:  deleted_by (VARCHAR) - Existe en legacy
--
-- TABLA: processes
--   ELIMINADO: code (VARCHAR) - No existe en legacy
--   ELIMINADO: is_active (BOOLEAN) - No existe en legacy
--   AGREGADO:  deleted_at (TIMESTAMPTZ) - Existe en legacy
--   AGREGADO:  deleted_by (VARCHAR) - Existe en legacy
--
-- TABLA: subprocesses
--   ELIMINADO: code (VARCHAR) - No existe en legacy
--   ELIMINADO: sequence_order (INT) - No existe en legacy
--   ELIMINADO: is_active (BOOLEAN) - No existe en legacy
--   AGREGADO:  deleted_at (TIMESTAMPTZ) - Existe en legacy
--   AGREGADO:  deleted_by (VARCHAR) - Existe en legacy
--
-- TABLA: procedures
--   ELIMINADO: code (VARCHAR) - No existe en legacy
--   ELIMINADO: sequence_order (INT) - No existe en legacy
--   ELIMINADO: is_active (BOOLEAN) - No existe en legacy
--   AGREGADO:  deleted_at (TIMESTAMPTZ) - Existe en legacy
--   AGREGADO:  deleted_by (VARCHAR) - Existe en legacy
--
-- FUENTE DE VERDAD LEGACY: final_mockup/docs/MitigaResilience - MitigaData.csv
--
-- ████████████████████████████████████████████████████████████████████████████
-- ████████████████████████████████████████████████████████████████████████████
--
-- ============================================================================
-- TABLAS NUEVAS EN V8 (+27 tablas)
-- ============================================================================
-- 
--
-- ============================================================================
-- ============================================================================
--
--
-- ============================================================================
-- TABLAS MODIFICADAS (3 tablas)
-- ============================================================================
--
--         + id_organization FK (nuevo campo para vincular a organización)
--
--         + evidence_code     (código único)
--         + title             (título descriptivo)
--         + description       (descripción extendida)
--         + status_lu         (estado del ciclo de vida)
--         + valid_from        (fecha inicio validez)
--         + valid_until       (fecha fin validez)
--
--         + id_ref_control FK (referencia a control de catálogo)
--
-- ============================================================================
-- VISTAS NUEVAS (+2)
-- ============================================================================
--
--
-- ============================================================================
-- RESUMEN ESTADÍSTICO
-- ============================================================================
--
-- V8: 69 tablas + 6 vistas
--     (+25 nuevas, -26 eliminadas, 3 modificadas)
--
-- ████████████████████████████████████████████████████████████████████████████

BEGIN;

-- ############################################################################
-- FASE 1: ORGANIZATIONS JERÁRQUICA (SINGLE-TENANT)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: organizations
-- Catalogo jerarquico de organizaciones dentro de la instancia del cliente.
-- ============================================================================
CREATE TABLE organizations (
  id_organization          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de organizations.
  id_parent_org            INT NULL REFERENCES organizations(id_organization) ON DELETE RESTRICT, -- FK a organizations.id_organization.
  code                     VARCHAR(50) UNIQUE NOT NULL, -- Atributo textual de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  legal_name               VARCHAR(255), -- Atributo textual de negocio.
  tax_id                   VARCHAR(100) UNIQUE, -- Atributo textual de negocio.
  org_type                 VARCHAR(50) NOT NULL DEFAULT 'COMPANY', -- Atributo textual de negocio.
  industry                 VARCHAR(200), -- Atributo textual de negocio.
  country                  VARCHAR(3), -- Atributo textual de negocio.
  timezone                 VARCHAR(80) DEFAULT 'America/Santiago', -- Atributo textual de negocio.
  mission                  TEXT, -- Atributo textual de negocio.
  vision                   TEXT, -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  level                    INT DEFAULT 0, -- Atributo numerico entero de negocio.
  path                     VARCHAR(500), -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  CONSTRAINT ck_org_type CHECK (org_type IN ('ROOT', 'COMPANY', 'DIVISION', 'DEPARTMENT', 'AREA', 'OTHER')),
  CONSTRAINT ck_level_range CHECK (level >= 0 AND level <= 10)
);

CREATE INDEX idx_org_parent ON organizations(id_parent_org) WHERE id_parent_org IS NOT NULL;
CREATE INDEX idx_org_path ON organizations(path) WHERE path IS NOT NULL;
CREATE INDEX idx_org_active ON organizations(is_deleted) WHERE is_deleted = FALSE;

CREATE OR REPLACE FUNCTION update_org_hierarchy() RETURNS TRIGGER AS $$
DECLARE
  parent_rec RECORD;
BEGIN
  IF NEW.id_parent_org IS NULL THEN
    NEW.level := 0;
    NEW.path := '/' || NEW.id_organization || '/';
  ELSE
    SELECT level, path INTO parent_rec FROM organizations WHERE id_organization = NEW.id_parent_org;
    IF NOT FOUND THEN RAISE EXCEPTION 'Parent organization % not found', NEW.id_parent_org; END IF;
    NEW.level := parent_rec.level + 1;
    NEW.path := parent_rec.path || NEW.id_organization || '/';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_org_hierarchy_insert BEFORE INSERT ON organizations FOR EACH ROW EXECUTE FUNCTION update_org_hierarchy();
CREATE TRIGGER trg_org_hierarchy_update BEFORE UPDATE OF id_parent_org ON organizations FOR EACH ROW WHEN (OLD.id_parent_org IS DISTINCT FROM NEW.id_parent_org) EXECUTE FUNCTION update_org_hierarchy();

-- ############################################################################
-- FASE 2: CONFIGURACIÓN GLOBAL Y CATÁLOGOS
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: application_settings
-- Tabla application_settings del modelo BCMS v11.
-- Descripcion: Parametros globales de configuracion de la plataforma.
-- ============================================================================
CREATE TABLE application_settings (
  id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de application_settings.
  setting_key              VARCHAR(100) UNIQUE NOT NULL, -- Atributo textual de negocio.
  setting_value            JSONB NOT NULL, -- Estructura JSON para datos flexibles.
  setting_type             VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  is_system                BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_setting_type CHECK (setting_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY', 'DATE'))
);

-- ============================================================================
-- [V11] NUEVA TABLA: lookup_sets
-- Tabla lookup_sets del modelo BCMS v11.
-- Descripcion: Catalogo maestro de conjuntos de valores (dominios).
-- ============================================================================
CREATE TABLE lookup_sets (
  id_lookup_set            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de lookup_sets.
  code                     VARCHAR(80) NOT NULL UNIQUE, -- Atributo textual de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  is_system                BOOLEAN DEFAULT FALSE -- Indicador booleano de negocio.
);

-- ============================================================================
-- [V11] NUEVA TABLA: lookup_values
-- Tabla lookup_values del modelo BCMS v11.
-- Descripcion: Valores de catalogo para clasificaciones y estados del sistema.
-- ============================================================================
CREATE TABLE lookup_values (
  id_lookup_value          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de lookup_values.
  id_lookup_set            BIGINT NOT NULL REFERENCES lookup_sets(id_lookup_set) ON DELETE CASCADE, -- FK a lookup_sets.id_lookup_set.
  code                     VARCHAR(80) NOT NULL, -- Atributo textual de negocio.
  label                    VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  sort_order               INT DEFAULT 0, -- Atributo numerico entero de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  color_hex                CHAR(7), -- Atributo textual de negocio.
  icon_name                VARCHAR(100), -- Atributo textual de negocio.
  parent_id                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  CONSTRAINT uq_lookup_code UNIQUE (id_lookup_set, code)
);

CREATE INDEX idx_lookup_values_set ON lookup_values(id_lookup_set);

-- ############################################################################
-- FASE 3: JERARQUÍA 4 NIVELES CORE (INT IDs) - TABLAS LEGACY B-GRC
-- ############################################################################
-- [V8→V9] MODIFICADO: Las 4 tablas de jerarquía de procesos ahora son
--         IDÉNTICAS a la estructura del sistema legacy B-GRC.
--         Ver changelog V8→V9 en el encabezado para detalles.

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
-- ============================================================================
-- [V11] NUEVA TABLA: macroprocesses
-- Nivel 1 de procesos legacy (macroprocesos).
-- ============================================================================
CREATE TABLE macroprocesses (
  id_macroprocess          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de macroprocesses.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  category                 VARCHAR(100), -- Atributo textual de negocio.
  expiration_date          DATE, -- Fecha de negocio.
  created_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMP, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_macro_not_deleted ON macroprocesses(is_deleted) WHERE is_deleted = FALSE;

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
-- ============================================================================
-- [V11] NUEVA TABLA: processes
-- Nivel 2 de procesos legacy (procesos).
-- ============================================================================
CREATE TABLE processes (
  id_process               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de processes.
  id_macroprocess          INT NOT NULL REFERENCES macroprocesses(id_macroprocess), -- FK a macroprocesses.id_macroprocess.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  platform                 VARCHAR(255), -- Atributo textual de negocio.
  created_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMP, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_proc_macro ON processes(id_macroprocess);
CREATE INDEX idx_proc_not_deleted ON processes(is_deleted) WHERE is_deleted = FALSE;

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
-- ============================================================================
-- [V11] NUEVA TABLA: subprocesses
-- Nivel 3 de procesos legacy (subprocesos).
-- ============================================================================
CREATE TABLE subprocesses (
  id_subprocess            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de subprocesses.
  id_process               INT NOT NULL REFERENCES processes(id_process), -- FK a processes.id_process.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  platform                 VARCHAR(255), -- Atributo textual de negocio.
  created_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMP, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_subproc_proc ON subprocesses(id_process);
CREATE INDEX idx_subproc_not_deleted ON subprocesses(is_deleted) WHERE is_deleted = FALSE;

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
-- ============================================================================
-- [V11] NUEVA TABLA: procedures
-- Nivel 4 de procesos legacy (procedimientos).
-- ============================================================================
CREATE TABLE procedures (
  id_procedure             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de procedures.
  id_subprocess            INT NOT NULL REFERENCES subprocesses(id_subprocess), -- FK a subprocesses.id_subprocess.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  platform                 VARCHAR(255), -- Atributo textual de negocio.
  created_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMP DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMP, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_procedure_subproc ON procedures(id_subprocess);
CREATE INDEX idx_procedure_not_deleted ON procedures(is_deleted) WHERE is_deleted = FALSE;

-- ############################################################################
-- FASE 4: TABLAS INTERMEDIAS ORGANIZATION-PROCESS
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: organization_macroprocess
-- Tabla organization_macroprocess del modelo BCMS v11.
-- Descripcion: Tabla puente de asignacion de organizaciones a entidades de proceso.
-- ============================================================================
CREATE TABLE organization_macroprocess (
  id_org_macro             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de organization_macroprocess.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_macroprocess          INT NOT NULL REFERENCES macroprocesses(id_macroprocess), -- FK a macroprocesses.id_macroprocess.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_org_macro UNIQUE (id_organization, id_macroprocess)
);

-- ============================================================================
-- [V11] NUEVA TABLA: organization_process
-- Tabla organization_process del modelo BCMS v11.
-- Descripcion: Tabla puente de asignacion de organizaciones a entidades de proceso.
-- ============================================================================
CREATE TABLE organization_process (
  id_org_process           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de organization_process.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_process               INT NOT NULL REFERENCES processes(id_process), -- FK a processes.id_process.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_org_process UNIQUE (id_organization, id_process)
);

-- ============================================================================
-- [V11] NUEVA TABLA: organization_subprocess
-- Tabla organization_subprocess del modelo BCMS v11.
-- Descripcion: Tabla puente de asignacion de organizaciones a entidades de proceso.
-- ============================================================================
CREATE TABLE organization_subprocess (
  id_org_subprocess        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de organization_subprocess.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_subprocess            INT NOT NULL REFERENCES subprocesses(id_subprocess), -- FK a subprocesses.id_subprocess.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_org_subprocess UNIQUE (id_organization, id_subprocess)
);

-- ============================================================================
-- [V11] NUEVA TABLA: organization_procedure
-- Tabla organization_procedure del modelo BCMS v11.
-- Descripcion: Tabla puente de asignacion de organizaciones a entidades de proceso.
-- ============================================================================
CREATE TABLE organization_procedure (
  id_org_procedure         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de organization_procedure.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_procedure             INT NOT NULL REFERENCES procedures(id_procedure), -- FK a procedures.id_procedure.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_org_procedure UNIQUE (id_organization, id_procedure)
);

CREATE INDEX idx_orgmacro_org ON organization_macroprocess(id_organization);
CREATE INDEX idx_orgproc_org ON organization_process(id_organization);
CREATE INDEX idx_orgproc_proc ON organization_process(id_process);

-- ############################################################################
-- FASE 5: USUARIOS Y RBAC
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: users
-- Tabla users del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo users.
-- ============================================================================
CREATE TABLE users (
  id_user                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de users.
  email                    VARCHAR(255) NOT NULL UNIQUE, -- Atributo textual de negocio.
  password_hash            VARCHAR(255), -- Atributo textual de negocio.
  full_name                VARCHAR(255), -- Atributo textual de negocio.
  id_primary_org           INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  status                   VARCHAR(30) DEFAULT 'ACTIVE', -- Atributo textual de negocio.
  mfa_enabled              BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  last_login_at            TIMESTAMPTZ, -- Marca temporal de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  CONSTRAINT ck_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED'))
);
CREATE INDEX idx_users_email ON users(email) WHERE status = 'ACTIVE';
CREATE INDEX idx_users_org ON users(id_primary_org);

-- ============================================================================
-- [V11] NUEVA TABLA: roles
-- Tabla roles del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo roles.
-- ============================================================================
CREATE TABLE roles (
  id_role                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de roles.
  code                     VARCHAR(80) NOT NULL UNIQUE, -- Atributo textual de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  permissions              JSONB NOT NULL DEFAULT '{}', -- Estructura JSON para datos flexibles.
  is_builtin               BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);

-- ============================================================================
-- [V11] NUEVA TABLA: permissions
-- Tabla permissions del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo permissions.
-- ============================================================================
CREATE TABLE permissions (
  id_permission            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de permissions.
  code                     VARCHAR(120) NOT NULL UNIQUE, -- Atributo textual de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  module                   VARCHAR(100) -- Atributo textual de negocio.
);

-- ============================================================================
-- [V11] NUEVA TABLA: role_permissions
-- Tabla role_permissions del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo role_permissions.
-- ============================================================================
CREATE TABLE role_permissions (
  id_role_permission       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de role_permissions.
  id_role                  BIGINT NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE, -- FK a roles.id_role.
  id_permission            BIGINT NOT NULL REFERENCES permissions(id_permission), -- FK a permissions.id_permission.
  CONSTRAINT uq_role_perm UNIQUE (id_role, id_permission)
);

-- ============================================================================
-- [V11] NUEVA TABLA: user_role_assignments
-- Tabla user_role_assignments del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo user_role_assignments.
-- ============================================================================
CREATE TABLE user_role_assignments (
  id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de user_role_assignments.
  id_user                  BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE, -- FK a users.id_user.
  id_role                  BIGINT NOT NULL REFERENCES roles(id_role), -- FK a roles.id_role.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  is_recursive             BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  permissions_override     JSONB, -- Estructura JSON para datos flexibles.
  valid_from               TIMESTAMPTZ DEFAULT now(), -- Atributo de negocio.
  valid_until              TIMESTAMPTZ, -- Atributo de negocio.
  created_by               BIGINT NULL REFERENCES users(id_user), -- Auditoria: usuario creador.
  CONSTRAINT uq_user_role UNIQUE (id_user, id_role, id_organization)
);

-- ############################################################################
-- FASE 6: PERFIL BCMS COMÚN POR NIVEL DE PROCESO
-- ############################################################################
-- Consolidación de tablas *_bcms en un único perfil de continuidad.

-- ============================================================================
-- [V11] NUEVA TABLA: process_continuity_profiles
-- Perfil BCMS unificado por entidad de proceso (macro/process/sub/procedure).
-- ============================================================================
CREATE TABLE process_continuity_profiles (
  id_profile                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del perfil BCMS.
  id_organization                  INT NOT NULL REFERENCES organizations(id_organization), -- Organizacion duena del perfil BCMS.
  target_process_type              VARCHAR(30) NOT NULL, -- Valores comunes: MACROPROCESS/PROCESS/SUBPROCESS/PROCEDURE.
  target_process_id                INT NOT NULL, -- ID de la entidad objetivo segun target_process_type.
  strategic_importance             VARCHAR(20), -- Valores comunes: CRITICAL/HIGH/MEDIUM/LOW; prioridad estrategica.
  business_criticality             VARCHAR(20), -- Valores comunes: CRITICAL/HIGH/MEDIUM/LOW; prioridad operativa BCMS.
  process_category                 VARCHAR(50), -- Categoria de negocio para segmentacion/reportes.
  target_rto_minutes               INT, -- RTO objetivo en minutos.
  target_rpo_minutes               INT, -- RPO objetivo en minutos.
  maximum_tolerable_downtime_minutes INT, -- MTPD en minutos.
  minimum_business_continuity_objective TEXT, -- MBCO: capacidad minima aceptable.
  minimum_staff_required           INT, -- Dotacion minima para operar en contingencia.
  operating_frequency              VARCHAR(50), -- Valores comunes: CONTINUOUS/DAILY/WEEKLY/MONTHLY.
  estimated_duration_minutes       INT, -- Duracion estimada de ejecucion del elemento.
  criticality_inherited            BOOLEAN, -- true: hereda criticidad del nivel padre.
  override_criticality             VARCHAR(20), -- Criticidad manual cuando no hereda.
  verification_required            BOOLEAN, -- true: requiere verificacion/aprobacion formal.
  governance_owner_id              BIGINT NULL REFERENCES users(id_user), -- Responsable de gobierno BCMS.
  owner_user_id                    BIGINT NULL REFERENCES users(id_user), -- Dueno operativo del proceso.
  responsible_organization_id      INT NULL REFERENCES organizations(id_organization), -- Area/organizacion responsable.
  review_frequency                 VARCHAR(50), -- Frecuencia de revision (ej: monthly/quarterly/annual).
  last_review_date                 DATE, -- Fecha de ultima revision.
  next_review_date                 DATE, -- Fecha objetivo de proxima revision.
  notes                            TEXT, -- Observaciones de contexto BCMS.
  created_at                       TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at                       TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by                       VARCHAR(255), -- Auditoria: usuario creador.
  updated_by                       VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at                       TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by                       VARCHAR(255), -- Auditoria: usuario que borra logicamente.
  is_deleted                       BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ############################################################################
-- FASE 7: CONTROLES POLIMÓRFICOS
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: reference_controls
-- Tabla reference_controls del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo reference_controls.
-- ============================================================================
CREATE TABLE reference_controls (
  id_ref_control           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de reference_controls.
  control_code             VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  control_type             VARCHAR(50), -- Atributo textual de negocio.
  implementation_guidance  TEXT, -- Atributo textual de negocio.
  is_system_control        BOOLEAN DEFAULT TRUE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ============================================================================
-- [V11] NUEVA TABLA: applied_controls
-- Tabla applied_controls del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo applied_controls.
-- ============================================================================
CREATE TABLE applied_controls (
  id_control               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de applied_controls.
  id_ref_control           BIGINT NULL REFERENCES reference_controls(id_ref_control), -- FK a reference_controls.id_ref_control.
  control_code             VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  control_name             VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  control_type             VARCHAR(50), -- Atributo textual de negocio.
  target_process_type      VARCHAR(30) NOT NULL, -- Referencia polimorfica al proceso objetivo.
  target_process_id        INT, -- Referencia polimorfica al proceso objetivo.
  implementation_status    VARCHAR(30), -- Atributo textual de negocio.
  effectiveness_rating     VARCHAR(20), -- Atributo textual de negocio.
  test_frequency           VARCHAR(50), -- Atributo textual de negocio.
  last_test_date           DATE, -- Fecha de negocio.
  next_test_date           DATE, -- Fecha de negocio.
  last_test_result         TEXT, -- Atributo textual de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  responsible_organization_id INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  linked_requirements      JSONB, -- Estructura JSON para datos flexibles.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_control_type CHECK (control_type IN ('PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE', 'COMPENSATING')),
  CONSTRAINT ck_impl_status CHECK (implementation_status IN ('NOT_IMPLEMENTED', 'PARTIAL', 'IMPLEMENTED', 'OPTIMIZED')),
  CONSTRAINT ck_effectiveness CHECK (effectiveness_rating IN ('INEFFECTIVE', 'WEAK', 'ADEQUATE', 'STRONG')),
  CONSTRAINT ck_control_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE', 'GLOBAL')),
  CONSTRAINT ck_control_target CHECK (
    (target_process_type = 'GLOBAL' AND target_process_id IS NULL) OR
    (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE') AND target_process_id IS NOT NULL)
  )
);

CREATE INDEX idx_control_target_type ON applied_controls(target_process_type);
CREATE INDEX idx_control_target_process ON applied_controls(target_process_id) WHERE target_process_id IS NOT NULL;

-- ############################################################################
-- FASE 8: RIESGOS + AMENAZAS + VULNERABILIDADES
-- ############################################################################

-- ============================================================================
-- Catálogo de amenazas (patrón CISO Assistant: Threat)
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: threats
-- Tabla threats del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo threats.
-- ============================================================================
CREATE TABLE threats (
  id_threat                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de threats.
  threat_code              VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  threat_category_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  threat_source_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  base_likelihood_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  base_impact_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  external_reference       VARCHAR(255), -- Atributo textual de negocio.
  reference_url            TEXT, -- Atributo textual de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  is_system_threat         BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               BIGINT NULL REFERENCES users(id_user), -- Auditoria: usuario creador.
  updated_by               BIGINT NULL REFERENCES users(id_user), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               BIGINT NULL REFERENCES users(id_user) -- Auditoria: usuario que elimina logicamente.
);
CREATE INDEX idx_threats_category ON threats(threat_category_lu);
CREATE INDEX idx_threats_active ON threats(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================================
-- [V11] NUEVA TABLA: risks
-- Tabla risks del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo risks.
-- ============================================================================
CREATE TABLE risks (
  id_risk                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de risks.
  risk_code                VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  risk_domain              VARCHAR(20) NOT NULL, -- Atributo textual de negocio.
  risk_scope               VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  target_process_type      VARCHAR(30) NOT NULL, -- Referencia polimorfica al proceso objetivo.
  target_process_id        INT, -- Referencia polimorfica al proceso objetivo.
  scenario                 TEXT, -- Atributo textual de negocio.
  cause                    TEXT, -- Atributo textual de negocio.
  effect                   TEXT, -- Atributo textual de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_risk_domain CHECK (risk_domain IN ('CONTINUITY', 'CYBER', 'OPERATIONAL', 'INTEGRATED')),
  CONSTRAINT ck_risk_scope CHECK (risk_scope IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE', 'GLOBAL')),
  CONSTRAINT ck_risk_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE', 'GLOBAL')),
  CONSTRAINT ck_risk_target CHECK (
    (target_process_type = 'GLOBAL' AND target_process_id IS NULL) OR
    (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE') AND target_process_id IS NOT NULL)
  ),
  CONSTRAINT ck_risk_scope_target_match CHECK (
    (risk_scope = 'GLOBAL' AND target_process_type = 'GLOBAL') OR
    (risk_scope IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE') AND target_process_type = risk_scope)
  )
);
CREATE INDEX idx_risk_domain ON risks(risk_domain);
CREATE INDEX idx_risk_scope ON risks(risk_scope);
CREATE INDEX idx_risk_target_process ON risks(target_process_id) WHERE target_process_id IS NOT NULL;

-- ============================================================================
-- Relación N:M entre risks y threats
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: risk_threat_mapping
-- Tabla risk_threat_mapping del modelo BCMS v11.
-- Descripcion: Tabla puente de mapeo entre dos entidades relacionadas.
-- ============================================================================
CREATE TABLE risk_threat_mapping (
  id_risk_threat           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de risk_threat_mapping.
  id_risk                  BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE, -- FK a risks.id_risk.
  id_threat                BIGINT NOT NULL REFERENCES threats(id_threat) ON DELETE CASCADE, -- FK a threats.id_threat.
  relevance_level          VARCHAR(20), -- Atributo textual de negocio.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_risk_threat UNIQUE (id_risk, id_threat),
  CONSTRAINT ck_relevance CHECK (relevance_level IN ('HIGH', 'MEDIUM', 'LOW'))
);
CREATE INDEX idx_risk_threat_risk ON risk_threat_mapping(id_risk);
CREATE INDEX idx_risk_threat_threat ON risk_threat_mapping(id_threat);

-- ============================================================================
-- Registro de vulnerabilidades técnicas (patrón CISO Assistant)
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: vulnerabilities
-- Tabla vulnerabilities del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo vulnerabilities.
-- ============================================================================
CREATE TABLE vulnerabilities (
  id_vulnerability         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de vulnerabilities.
  vulnerability_code       VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  severity_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  vulnerability_type_lu    BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  cve_id                   VARCHAR(50), -- Atributo textual de negocio.
  cvss_score               NUMERIC(3,1), -- Valor numerico de negocio.
  external_reference       TEXT, -- Atributo textual de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  discovered_at            TIMESTAMPTZ, -- Marca temporal de negocio.
  remediated_at            TIMESTAMPTZ, -- Marca temporal de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_vuln_severity ON vulnerabilities(severity_lu);
CREATE INDEX idx_vuln_status ON vulnerabilities(status_lu);
CREATE INDEX idx_vuln_cve ON vulnerabilities(cve_id) WHERE cve_id IS NOT NULL;

-- ============================================================================
-- [V11] NUEVA TABLA: risk_assessments
-- Tabla risk_assessments del modelo BCMS v11.
-- Descripcion: Cabecera de evaluaciones del modulo correspondiente.
-- ============================================================================
CREATE TABLE risk_assessments (
  id_risk_assessment       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de risk_assessments.
  id_risk                  BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE, -- FK a risks.id_risk.
  assessment_type          VARCHAR(20) NOT NULL, -- Atributo textual de negocio.
  assessed_at              TIMESTAMPTZ DEFAULT now(), -- Marca temporal de negocio.
  assessed_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  likelihood_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  impact_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  risk_score               NUMERIC(10,2), -- Valor numerico de negocio.
  financial_exposure       NUMERIC(15,2), -- Valor numerico de negocio.
  treatment_decision       VARCHAR(50), -- Atributo textual de negocio.
  comments                 TEXT, -- Atributo textual de negocio.
  CONSTRAINT ck_assessment_type CHECK (assessment_type IN ('INHERENT', 'RESIDUAL', 'TARGET'))
);

-- ============================================================================
-- [V11] NUEVA TABLA: risk_control_mapping
-- Tabla risk_control_mapping del modelo BCMS v11.
-- Descripcion: Tabla puente de mapeo entre dos entidades relacionadas.
-- ============================================================================
CREATE TABLE risk_control_mapping (
  id_risk_control          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de risk_control_mapping.
  id_risk                  BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE, -- FK a risks.id_risk.
  id_control               BIGINT NOT NULL REFERENCES applied_controls(id_control), -- FK a applied_controls.id_control.
  mitigation_effect        VARCHAR(50), -- Atributo textual de negocio.
  effectiveness_pct        INT, -- Atributo numerico entero de negocio.
  is_key_control           BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  CONSTRAINT uq_risk_control UNIQUE (id_risk, id_control),
  CONSTRAINT ck_effect_pct CHECK (effectiveness_pct >= 0 AND effectiveness_pct <= 100)
);

-- ============================================================================
-- [V11] NUEVA TABLA: risk_treatments
-- Tabla risk_treatments del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo risk_treatments.
-- ============================================================================
CREATE TABLE risk_treatments (
  id_risk_treatment        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de risk_treatments.
  id_risk                  BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE, -- FK a risks.id_risk.
  id_plan                  BIGINT, -- Identificador relacionado.
  treatment_type           VARCHAR(50), -- Atributo textual de negocio.
  description              TEXT NOT NULL, -- Descripcion u observaciones de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  due_date                 DATE, -- Fecha de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_treatment_type CHECK (treatment_type IN ('MITIGATE', 'TRANSFER', 'ACCEPT', 'AVOID'))
);

-- ############################################################################
-- FASE 9: BIA (Business Impact Analysis)
-- ############################################################################

-- bia_assessments
-- ============================================================================
-- [V11] NUEVA TABLA: bia_assessments
-- Cabecera de evaluaciones BIA por proceso objetivo.
-- ============================================================================
CREATE TABLE bia_assessments (
  id_bia                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bia_assessments.
  bia_code                 VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  scope                    VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  target_process_type      VARCHAR(30) NOT NULL, -- Referencia polimorfica al proceso objetivo.
  target_process_id        INT NOT NULL, -- Referencia polimorfica al proceso objetivo.
  assessment_date          DATE NOT NULL, -- Fecha de negocio.
  reviewed_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  version                  INT DEFAULT 1, -- Atributo numerico entero de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_bia_scope CHECK (scope IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE')),
  CONSTRAINT ck_bia_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE')),
  CONSTRAINT ck_bia_scope_target_match CHECK (target_process_type = scope)
);
CREATE INDEX idx_bia_org ON bia_assessments(id_organization);
CREATE INDEX idx_bia_target_process ON bia_assessments(target_process_id);

-- bia_impacts
-- ============================================================================
-- [V11] NUEVA TABLA: bia_impacts
-- Tabla bia_impacts del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bia_impacts.
-- ============================================================================
CREATE TABLE bia_impacts (
  id_bia_impact            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bia_impacts.
  id_bia                   BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE, -- FK a bia_assessments.id_bia.
  impact_category_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  hours_to_impact          INT, -- Atributo numerico entero de negocio.
  severity_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  financial_estimate       NUMERIC(15,2), -- Valor numerico de negocio.
  description              TEXT -- Descripcion u observaciones de negocio.
);
CREATE INDEX idx_bia_impact_bia ON bia_impacts(id_bia);

-- bia_objectives (RTO, RPO, MTPD, MBCO)
-- ============================================================================
-- [V11] NUEVA TABLA: bia_objectives
-- Tabla bia_objectives del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bia_objectives.
-- ============================================================================
CREATE TABLE bia_objectives (
  id_bia_objective         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bia_objectives.
  id_bia                   BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE, -- FK a bia_assessments.id_bia.
  objective_type           VARCHAR(10) NOT NULL, -- Atributo textual de negocio.
  value_hours              INT, -- Atributo numerico entero de negocio.
  justification            TEXT, -- Atributo textual de negocio.
  CONSTRAINT ck_obj_type CHECK (objective_type IN ('RTO', 'RPO', 'MTPD', 'MBCO'))
);
CREATE INDEX idx_bia_obj_bia ON bia_objectives(id_bia);

-- ############################################################################
-- FASE 9B: ESCENARIOS DE DISRUPCIÓN Y RIA
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: disruption_scenarios
-- Tabla disruption_scenarios del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo disruption_scenarios.
-- ============================================================================
CREATE TABLE disruption_scenarios (
  id_scenario              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de disruption_scenarios.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  scenario_code            VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  scenario_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  is_system_scenario       BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  sort_order               INT DEFAULT 0, -- Atributo numerico entero de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255) -- Auditoria: usuario que elimina logicamente.
);
CREATE INDEX idx_scenario_org ON disruption_scenarios(id_organization);
CREATE INDEX idx_scenario_type ON disruption_scenarios(scenario_type_lu);
CREATE INDEX idx_scenario_active ON disruption_scenarios(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================================
-- [V11] NUEVA TABLA: time_buckets
-- Tabla time_buckets del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo time_buckets.
-- ============================================================================
CREATE TABLE time_buckets (
  id_time_bucket           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de time_buckets.
  bucket_code              VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  start_minutes            INT NOT NULL, -- Atributo numerico entero de negocio.
  end_minutes              INT NOT NULL, -- Atributo numerico entero de negocio.
  sort_order               INT DEFAULT 0, -- Atributo numerico entero de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  is_system_bucket         BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  CONSTRAINT ck_time_bucket_range CHECK (end_minutes >= start_minutes)
);
CREATE INDEX idx_timebucket_org ON time_buckets(id_organization);
CREATE INDEX idx_timebucket_status ON time_buckets(status_lu);

-- ============================================================================
-- [V11] NUEVA TABLA: impact_types
-- Tabla impact_types del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo impact_types.
-- ============================================================================
CREATE TABLE impact_types (
  id_impact_type           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de impact_types.
  impact_code              VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  sort_order               INT DEFAULT 0, -- Atributo numerico entero de negocio.
  is_system_type           BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255) -- Auditoria: usuario que elimina logicamente.
);
CREATE INDEX idx_impacttype_org ON impact_types(id_organization);
CREATE INDEX idx_impacttype_status ON impact_types(status_lu);

-- ============================================================================
-- [V11] NUEVA TABLA: bia_impact_matrix
-- Tabla bia_impact_matrix del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bia_impact_matrix.
-- ============================================================================
CREATE TABLE bia_impact_matrix (
  id_bia_impact            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bia_impact_matrix.
  id_bia                   BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE, -- FK a bia_assessments.id_bia.
  id_scenario              BIGINT NOT NULL REFERENCES disruption_scenarios(id_scenario), -- FK a disruption_scenarios.id_scenario.
  id_time_bucket           BIGINT NOT NULL REFERENCES time_buckets(id_time_bucket), -- FK a time_buckets.id_time_bucket.
  id_impact_type           BIGINT NOT NULL REFERENCES impact_types(id_impact_type), -- FK a impact_types.id_impact_type.
  selected_level_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  is_system_bucket         BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  CONSTRAINT uq_bia_impact_matrix UNIQUE (id_bia, id_scenario, id_time_bucket, id_impact_type)
);
CREATE INDEX idx_bia_matrix_bia ON bia_impact_matrix(id_bia);
CREATE INDEX idx_bia_matrix_scenario ON bia_impact_matrix(id_scenario);
CREATE INDEX idx_bia_matrix_time_bucket ON bia_impact_matrix(id_time_bucket);
CREATE INDEX idx_bia_matrix_impact_type ON bia_impact_matrix(id_impact_type);

-- ============================================================================
-- [V11] NUEVA TABLA: ria_assessments
-- Cabecera de evaluaciones RIA por proceso objetivo.
-- ============================================================================
CREATE TABLE ria_assessments (
  id_ria                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de ria_assessments.
  ria_code                 VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  target_process_type      VARCHAR(30) NOT NULL, -- Referencia polimorfica al proceso objetivo.
  target_process_id        INT NOT NULL, -- Referencia polimorfica al proceso objetivo.
  id_bia                   BIGINT NULL REFERENCES bia_assessments(id_bia), -- FK a bia_assessments.id_bia.
  assessment_date          DATE NOT NULL, -- Fecha de negocio.
  version                  INT DEFAULT 1, -- Atributo numerico entero de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_ria_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE'))
);
CREATE INDEX idx_ria_org ON ria_assessments(id_organization);
CREATE INDEX idx_ria_target_process ON ria_assessments(target_process_type, target_process_id);
CREATE INDEX idx_ria_bia ON ria_assessments(id_bia) WHERE id_bia IS NOT NULL;

-- ============================================================================
-- [V11] NUEVA TABLA: ria_discriminations
-- Ficha de discriminacion previa a matriz RIA (decision de aplicar/no aplicar matriz).
-- ============================================================================
CREATE TABLE ria_discriminations (
  id_ria_discrimination  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de la ficha de discriminacion.
  discrimination_code    VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de ficha (ej: RDISC-2026-0001).
  id_organization        INT NOT NULL REFERENCES organizations(id_organization), -- Organizacion evaluada.
  target_process_type    VARCHAR(30) NOT NULL, -- Valores comunes: MACROPROCESS/PROCESS/SUBPROCESS/PROCEDURE.
  target_process_id      INT NOT NULL, -- ID del proceso objetivo segun target_process_type.
  id_ria                 BIGINT NULL REFERENCES ria_assessments(id_ria) ON DELETE SET NULL, -- Matriz RIA relacionada cuando exista.
  assessment_date        DATE NOT NULL, -- Fecha de evaluacion de discriminacion.
  has_existing_risk_matrix BOOLEAN, -- true: ya existe matriz de riesgo operacional para el proceso.
  requires_ria_matrix    BOOLEAN, -- true: se requiere ejecutar/levantar matriz RIA.
  responsible_user_id    BIGINT NULL REFERENCES users(id_user), -- Responsable de la definicion.
  summary                TEXT, -- Resumen ejecutivo de resultados.
  conclusion_text        TEXT, -- Texto formal de conclusion de la ficha.
  source_document        VARCHAR(255), -- Referencia de documento fuente (ej: plantilla/archivo).
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ============================================================================
-- [V11] NUEVA TABLA: ria_discrimination_items
-- Detalle de condiciones SI/NO y antecedentes de la ficha de discriminacion.
-- ============================================================================
CREATE TABLE ria_discrimination_items (
  id_ria_discrimination_item BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del detalle.
  id_ria_discrimination  BIGINT NOT NULL REFERENCES ria_discriminations(id_ria_discrimination) ON DELETE CASCADE, -- FK a cabecera de ficha.
  condition_code         VARCHAR(80), -- Codigo corto de condicion (ej: EXP_MONETARY, REPUTATIONAL).
  condition_text         VARCHAR(255) NOT NULL, -- Nombre visible de la condicion evaluada.
  analysis_result        BOOLEAN, -- Resultado tipico: true=SI / false=NO.
  antecedentes           TEXT, -- Evidencia o justificacion del resultado.
  sort_order             INT DEFAULT 0, -- Orden visual de la condicion en formulario/reporte.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ============================================================================
-- [V11] NUEVA TABLA: process_dependencies
-- Dependencias baseline de los procesos para continuidad.
-- ============================================================================
CREATE TABLE process_dependencies (
  id_process_dependency    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de process_dependencies.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  target_process_type      VARCHAR(30) NOT NULL, -- Referencia polimorfica al proceso objetivo.
  target_process_id        INT NOT NULL, -- Referencia polimorfica al proceso objetivo.
  dependency_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  dependency_entity_type   VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  dependency_entity_id     BIGINT NOT NULL, -- Atributo numerico entero de negocio.
  criticality_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_dep_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE')),
  CONSTRAINT ck_dep_entity_type CHECK (dependency_entity_type IN ('PROCESS', 'SUBPROCESS', 'PROCEDURE', 'SUPPLIER', 'ASSET', 'APPLICATION', 'PERSONNEL', 'LOCATION'))
);
CREATE INDEX idx_procdep_org ON process_dependencies(id_organization);
CREATE INDEX idx_procdep_target ON process_dependencies(target_process_type, target_process_id);
CREATE INDEX idx_procdep_entity ON process_dependencies(dependency_entity_type, dependency_entity_id);

-- bia_dependency_assessments
-- ============================================================================
-- [V11] NUEVA TABLA: bia_dependency_assessments
-- Evaluacion BIA de dependencias baseline por version de assessment.
-- ============================================================================
CREATE TABLE bia_dependency_assessments (
  id_bia_dependency_assessment BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de evaluacion BIA sobre una dependencia.
  id_bia                 BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE, -- Assessment BIA al que pertenece la evaluacion.
  id_process_dependency  BIGINT NOT NULL REFERENCES process_dependencies(id_process_dependency), -- Dependencia baseline del proceso evaluada.
  criticality_lu_at_assessment BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Criticidad en este assessment (ej: BAJA/MEDIA/ALTA/CRITICA).
  is_applicable          BOOLEAN DEFAULT TRUE, -- true: aplica en este BIA; false: no aplica en esta version.
  notes                  TEXT, -- Justificacion/evidencia de la evaluacion puntual.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ############################################################################
-- FASE 10: DATOS MAESTROS (locations, assets, suppliers, contacts)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: locations
-- Tabla locations del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo locations.
-- ============================================================================
CREATE TABLE locations (
  id_location              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de locations.
  location_code            VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  location_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  address_line1            VARCHAR(255), -- Atributo textual de negocio.
  address_line2            VARCHAR(255), -- Atributo textual de negocio.
  city                     VARCHAR(100), -- Atributo textual de negocio.
  region_state             VARCHAR(100), -- Atributo textual de negocio.
  postal_code              VARCHAR(30), -- Codigo unico de negocio.
  country_code             CHAR(2), -- Codigo unico de negocio.
  gps_lat                  NUMERIC(10,7), -- Valor numerico de negocio.
  gps_lon                  NUMERIC(10,7), -- Valor numerico de negocio.
  capacity_persons         INT, -- Atributo numerico entero de negocio.
  is_primary               BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  parent_location_id       BIGINT NULL REFERENCES locations(id_location), -- FK a locations.id_location.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_location_org ON locations(id_organization);
CREATE INDEX idx_location_parent ON locations(parent_location_id) WHERE parent_location_id IS NOT NULL;

-- ============================================================================
-- [V11] NUEVA TABLA: assets
-- Tabla assets del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo assets.
-- ============================================================================
CREATE TABLE assets (
  id_asset                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de assets.
  asset_code               VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  asset_category_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  asset_type_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  description              TEXT, -- Descripcion u observaciones de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  id_location              BIGINT NULL REFERENCES locations(id_location), -- FK a locations.id_location.
  criticality_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  value_amount             NUMERIC(15,2), -- Valor numerico de negocio.
  currency_code            CHAR(3), -- Codigo unico de negocio.
  acquisition_date         DATE, -- Fecha de negocio.
  vendor_name              VARCHAR(255), -- Atributo textual de negocio.
  serial_number            VARCHAR(255), -- Atributo textual de negocio.
  metadata                 JSONB, -- Estructura JSON para datos flexibles.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_asset_cat ON assets(asset_category_lu);
CREATE INDEX idx_asset_owner ON assets(owner_user_id);
CREATE INDEX idx_asset_loc ON assets(id_location);
CREATE INDEX idx_asset_org ON assets(id_organization);

-- ============================================================================
-- Relación N:M entre assets y vulnerabilities
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: asset_vulnerabilities
-- Tabla asset_vulnerabilities del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo asset_vulnerabilities.
-- ============================================================================
CREATE TABLE asset_vulnerabilities (
  id_asset_vulnerability   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de asset_vulnerabilities.
  id_asset                 BIGINT NOT NULL REFERENCES assets(id_asset) ON DELETE CASCADE, -- FK a assets.id_asset.
  id_vulnerability         BIGINT NOT NULL REFERENCES vulnerabilities(id_vulnerability) ON DELETE CASCADE, -- FK a vulnerabilities.id_vulnerability.
  detection_date           TIMESTAMPTZ DEFAULT now(), -- Fecha de negocio.
  remediation_due_date     DATE, -- Fecha de negocio.
  remediation_status_lu    BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_asset_vuln UNIQUE (id_asset, id_vulnerability)
);
CREATE INDEX idx_asset_vuln_asset ON asset_vulnerabilities(id_asset);
CREATE INDEX idx_asset_vuln_vuln ON asset_vulnerabilities(id_vulnerability);

-- ============================================================================
-- [V11] NUEVA TABLA: suppliers
-- Tabla suppliers del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo suppliers.
-- ============================================================================
CREATE TABLE suppliers (
  id_supplier              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de suppliers.
  supplier_code            VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  supplier_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  tax_id                   VARCHAR(50), -- Atributo textual de negocio.
  website                  VARCHAR(255), -- Atributo textual de negocio.
  address                  TEXT, -- Atributo textual de negocio.
  city                     VARCHAR(100), -- Atributo textual de negocio.
  country_code             CHAR(2), -- Codigo unico de negocio.
  risk_tier_lu             BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  criticality_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  contract_start           DATE, -- Atributo de negocio.
  contract_end             DATE, -- Atributo de negocio.
  sla_summary              TEXT, -- Atributo textual de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255) -- Auditoria: usuario que elimina logicamente.
);
CREATE INDEX idx_supplier_org ON suppliers(id_organization);
CREATE INDEX idx_supplier_active ON suppliers(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================================
-- SE AGREGA: id_organization FK (nullable, para independizar de user)
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: contacts
-- Tabla contacts del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo contacts.
-- ============================================================================
CREATE TABLE contacts (
  id_contact               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de contacts.
  contact_code             VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  first_name               VARCHAR(100) NOT NULL, -- Atributo textual de negocio.
  last_name                VARCHAR(100) NOT NULL, -- Atributo textual de negocio.
  email                    VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  phone_primary            VARCHAR(30), -- Atributo textual de negocio.
  phone_secondary          VARCHAR(30), -- Atributo textual de negocio.
  mobile                   VARCHAR(30), -- Atributo textual de negocio.
  job_title                VARCHAR(150), -- Atributo textual de negocio.
  department               VARCHAR(150), -- Atributo textual de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_user                  BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  id_supplier              BIGINT NULL REFERENCES suppliers(id_supplier), -- FK a suppliers.id_supplier.
  contact_role_lu          BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  is_emergency_contact     BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255) -- Auditoria: usuario que elimina logicamente.
);
CREATE INDEX idx_contact_org ON contacts(id_organization);
CREATE INDEX idx_contact_user ON contacts(id_user);
CREATE INDEX idx_contact_supplier ON contacts(id_supplier);
CREATE INDEX idx_contact_emergency ON contacts(is_emergency_contact) WHERE is_emergency_contact = TRUE;

-- ============================================================================
-- [V11] NUEVA TABLA: process_critical_personnel
-- Personal critico por etapa del proceso (titular y reemplazo), reutilizando contacts.
-- ============================================================================
CREATE TABLE process_critical_personnel (
  id_process_critical_personnel BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del registro.
  id_organization        INT NOT NULL REFERENCES organizations(id_organization), -- Organizacion propietaria del proceso.
  target_process_type    VARCHAR(30) NOT NULL, -- Valores comunes: MACROPROCESS/PROCESS/SUBPROCESS/PROCEDURE.
  target_process_id      INT NOT NULL, -- ID del proceso objetivo segun target_process_type.
  stage_code             VARCHAR(80), -- Codigo o ID de etapa del proceso.
  stage_name             VARCHAR(255), -- Nombre de etapa o actividad critica.
  primary_contact_id     BIGINT NOT NULL REFERENCES contacts(id_contact), -- Contacto titular de la etapa.
  backup_contact_id      BIGINT NULL REFERENCES contacts(id_contact), -- Contacto reemplazo (backup) de la etapa.
  role_in_stage          VARCHAR(150), -- Rol funcional en la etapa (ej: aprobador, ejecutor).
  location_notes         VARCHAR(255), -- Ubicacion de operacion del personal critico.
  notes                  TEXT, -- Observaciones operativas o de continuidad.
  valid_from             DATE, -- Vigencia desde.
  valid_until            DATE, -- Vigencia hasta.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ############################################################################
-- FASE 11: PLANES DE CONTINUIDAD
-- ############################################################################

-- continuity_plans
-- ============================================================================
-- [V11] NUEVA TABLA: continuity_plans
-- Tabla continuity_plans del modelo BCMS v11.
-- Descripcion: Cabecera de planes operativos del modulo.
-- ============================================================================
CREATE TABLE continuity_plans (
  id_plan                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de continuity_plans.
  plan_code                VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  plan_type                VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  version_label            VARCHAR(50), -- Atributo textual de negocio.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  scope_description        TEXT, -- Atributo textual de negocio.
  target_process_type      VARCHAR(30) NOT NULL, -- Referencia polimorfica al proceso objetivo.
  target_process_id        INT, -- Referencia polimorfica al proceso objetivo.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  effective_date           DATE, -- Fecha de negocio.
  next_review_date         DATE, -- Fecha de negocio.
  version                  INT DEFAULT 1, -- Atributo numerico entero de negocio.
  id_scenario              BIGINT NULL REFERENCES disruption_scenarios(id_scenario), -- FK a disruption_scenarios.id_scenario.
  approved_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  approved_at              TIMESTAMPTZ, -- Marca temporal de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_plan_type CHECK (plan_type IN ('BCP', 'DRP', 'CMP', 'ERP', 'IRP')),
  CONSTRAINT ck_plan_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE', 'GLOBAL')),
  CONSTRAINT ck_plan_target_pair CHECK (
    (target_process_type = 'GLOBAL' AND target_process_id IS NULL) OR
    (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE') AND target_process_id IS NOT NULL)
  )
);
CREATE INDEX idx_plan_org ON continuity_plans(id_organization);
CREATE INDEX idx_plan_type ON continuity_plans(plan_type);
CREATE INDEX idx_plan_owner ON continuity_plans(owner_user_id);
CREATE INDEX idx_plan_target_process ON continuity_plans(target_process_type, target_process_id);
CREATE INDEX idx_plan_scenario ON continuity_plans(id_scenario) WHERE id_scenario IS NOT NULL;

-- plan_sections
-- ============================================================================
-- [V11] NUEVA TABLA: plan_sections
-- Tabla plan_sections del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo plan_sections.
-- ============================================================================
CREATE TABLE plan_sections (
  id_section               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de plan_sections.
  id_plan                  BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE, -- FK a continuity_plans.id_plan.
  section_order            INT NOT NULL, -- Atributo numerico entero de negocio.
  section_title            VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  section_content          TEXT, -- Atributo textual de negocio.
  is_mandatory             BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_section_plan ON plan_sections(id_plan);

-- activation_criteria
-- ============================================================================
-- [V11] NUEVA TABLA: activation_criteria
-- Tabla activation_criteria del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo activation_criteria.
-- ============================================================================
CREATE TABLE activation_criteria (
  id_criterion             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de activation_criteria.
  id_plan                  BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE, -- FK a continuity_plans.id_plan.
  criterion_code           VARCHAR(80) NOT NULL, -- Codigo unico de negocio.
  description              TEXT NOT NULL, -- Descripcion u observaciones de negocio.
  threshold_value          VARCHAR(255), -- Atributo textual de negocio.
  severity_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  is_auto_activate         BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_actcrit_plan ON activation_criteria(id_plan);

-- recovery_strategies
-- ============================================================================
-- [V11] NUEVA TABLA: recovery_strategies
-- Tabla recovery_strategies del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo recovery_strategies.
-- ============================================================================
CREATE TABLE recovery_strategies (
  id_strategy              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de recovery_strategies.
  id_plan                  BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE, -- FK a continuity_plans.id_plan.
  strategy_name            VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  rto_hours                INT, -- Atributo numerico entero de negocio.
  rpo_hours                INT, -- Atributo numerico entero de negocio.
  estimated_cost           NUMERIC(15,2), -- Valor numerico de negocio.
  resource_requirements    TEXT, -- Atributo textual de negocio.
  dependencies             TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_recstrat_plan ON recovery_strategies(id_plan);

-- recovery_procedures
-- ============================================================================
-- [V11] NUEVA TABLA: recovery_procedures
-- Tabla recovery_procedures del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo recovery_procedures.
-- ============================================================================
CREATE TABLE recovery_procedures (
  id_procedure_rec         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de recovery_procedures.
  id_strategy              BIGINT NOT NULL REFERENCES recovery_strategies(id_strategy) ON DELETE CASCADE, -- FK a recovery_strategies.id_strategy.
  step_order               INT NOT NULL, -- Atributo numerico entero de negocio.
  step_title               VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  step_description         TEXT, -- Atributo textual de negocio.
  responsible_role_id      BIGINT NULL REFERENCES roles(id_role), -- FK a roles.id_role.
  estimated_duration_min   INT, -- Atributo numerico entero de negocio.
  dependencies             TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_recproc_strat ON recovery_procedures(id_strategy);

-- call_trees
-- ============================================================================
-- [V11] NUEVA TABLA: call_trees
-- Tabla call_trees del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo call_trees.
-- ============================================================================
CREATE TABLE call_trees (
  id_call_tree             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de call_trees.
  id_plan                  BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE, -- FK a continuity_plans.id_plan.
  tree_name                VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  root_contact_id          BIGINT NULL REFERENCES contacts(id_contact), -- FK a contacts.id_contact.
  description              TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_calltree_plan ON call_trees(id_plan);

-- call_tree_nodes
-- ============================================================================
-- [V11] NUEVA TABLA: call_tree_nodes
-- Tabla call_tree_nodes del modelo BCMS v11.
-- Descripcion: Nodos jerarquicos asociados a la estructura principal.
-- ============================================================================
CREATE TABLE call_tree_nodes (
  id_node                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de call_tree_nodes.
  id_call_tree             BIGINT NOT NULL REFERENCES call_trees(id_call_tree) ON DELETE CASCADE, -- FK a call_trees.id_call_tree.
  id_contact               BIGINT NOT NULL REFERENCES contacts(id_contact), -- FK a contacts.id_contact.
  parent_node_id           BIGINT NULL REFERENCES call_tree_nodes(id_node), -- FK a call_tree_nodes.id_node.
  node_order               INT NOT NULL, -- Atributo numerico entero de negocio.
  escalation_wait_min      INT DEFAULT 15, -- Atributo numerico entero de negocio.
  notes                    TEXT -- Descripcion u observaciones de negocio.
);
CREATE INDEX idx_ctnode_tree ON call_tree_nodes(id_call_tree);
CREATE INDEX idx_ctnode_parent ON call_tree_nodes(parent_node_id) WHERE parent_node_id IS NOT NULL;

-- plan_tests
-- ============================================================================
-- [V11] NUEVA TABLA: plan_tests
-- Tabla plan_tests del modelo BCMS v11.
-- Descripcion: Ejecuciones de pruebas/simulacros del modulo.
-- ============================================================================
CREATE TABLE plan_tests (
  id_test                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de plan_tests.
  id_plan                  BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE, -- FK a continuity_plans.id_plan.
  test_code                VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  test_type                VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  test_date                DATE NOT NULL, -- Fecha de negocio.
  maturity_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  result_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  scope_description        TEXT, -- Atributo textual de negocio.
  participants             TEXT, -- Atributo textual de negocio.
  objectives               TEXT, -- Atributo textual de negocio.
  results_summary          TEXT, -- Atributo textual de negocio.
  success_rate_pct         INT, -- Atributo numerico entero de negocio.
  issues_found             TEXT, -- Atributo textual de negocio.
  recommendations          TEXT, -- Atributo textual de negocio.
  conducted_by             BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_test_type CHECK (test_type IN ('TABLETOP', 'WALKTHROUGH', 'SIMULATION', 'FULL_EXERCISE', 'TECHNICAL_TEST'))
);
CREATE INDEX idx_plantest_plan ON plan_tests(id_plan);
CREATE INDEX idx_plantest_date ON plan_tests(test_date);

-- ============================================================================
-- [V11] NUEVA TABLA: ria_items
-- Tabla ria_items del modelo BCMS v11.
-- Descripcion: Detalle operativo asociado a la cabecera del modulo.
-- ============================================================================
CREATE TABLE ria_items (
  id_ria_item              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de ria_items.
  id_ria                   BIGINT NOT NULL REFERENCES ria_assessments(id_ria) ON DELETE CASCADE, -- FK a ria_assessments.id_ria.
  item_no                  INT NOT NULL, -- Atributo numerico entero de negocio.
  loss_risk_text           TEXT, -- Atributo textual de negocio.
  activity_text            TEXT, -- Atributo textual de negocio.
  basel_loss_type          TEXT, -- Atributo textual de negocio.
  risk_factor_text         TEXT, -- Atributo textual de negocio.
  risk_factor_specific_text TEXT, -- Atributo textual de negocio.
  id_plan                  BIGINT NULL REFERENCES continuity_plans(id_plan), -- FK a continuity_plans.id_plan.
  id_scenario              BIGINT NULL REFERENCES disruption_scenarios(id_scenario), -- FK a disruption_scenarios.id_scenario.
  impact_type              BIGINT NULL REFERENCES impact_types(id_impact_type), -- FK a impact_types.id_impact_type.
  id_risk                  BIGINT NULL REFERENCES risks(id_risk), -- FK a risks.id_risk.
  max_impact_24h_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  probability_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  control_effect_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  impact_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  inherent_risk_score      NUMERIC(10,2), -- Valor numerico de negocio.
  residual_risk_score      NUMERIC(10,2), -- Valor numerico de negocio.
  beta_factor              NUMERIC(10,4), -- Valor numerico de negocio.
  residual_with_beta       NUMERIC(10,2), -- Valor numerico de negocio.
  residual_final_score     NUMERIC(10,2), -- Valor numerico de negocio.
  response_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  response_notes           TEXT, -- Atributo textual de negocio.
  observations             TEXT, -- Atributo textual de negocio.
  contingency_desc         TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT uq_ria_item UNIQUE (id_ria, item_no)
);
CREATE INDEX idx_ria_item_ria ON ria_items(id_ria);
CREATE INDEX idx_ria_item_plan ON ria_items(id_plan) WHERE id_plan IS NOT NULL;
CREATE INDEX idx_ria_item_scenario ON ria_items(id_scenario) WHERE id_scenario IS NOT NULL;
CREATE INDEX idx_ria_item_risk ON ria_items(id_risk) WHERE id_risk IS NOT NULL;

ALTER TABLE risk_treatments
  ADD CONSTRAINT fk_risk_treatment_plan
  FOREIGN KEY (id_plan) REFERENCES continuity_plans(id_plan);
CREATE INDEX idx_risktreat_plan ON risk_treatments(id_plan) WHERE id_plan IS NOT NULL;

-- ############################################################################
-- FASE 12: GESTIÓN DE INCIDENTES Y CRISIS
-- ############################################################################

-- incidents
-- ============================================================================
-- [V11] NUEVA TABLA: incidents
-- Tabla incidents del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo incidents.
-- ============================================================================
CREATE TABLE incidents (
  id_incident              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de incidents.
  incident_code            VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  incident_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  severity_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  source_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  reported_at              TIMESTAMPTZ DEFAULT now(), -- Marca temporal de negocio.
  reported_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  detected_at              TIMESTAMPTZ, -- Marca temporal de negocio.
  acknowledged_at          TIMESTAMPTZ, -- Marca temporal de negocio.
  resolved_at              TIMESTAMPTZ, -- Marca temporal de negocio.
  closed_at                TIMESTAMPTZ, -- Marca temporal de negocio.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  target_process_type    VARCHAR(30), -- Valores comunes: MACROPROCESS/PROCESS/SUBPROCESS/PROCEDURE.
  target_process_id      INT, -- ID del proceso objetivo segun target_process_type.
  affected_location_id     BIGINT NULL REFERENCES locations(id_location), -- FK a locations.id_location.
  impact_description       TEXT, -- Descripcion u observaciones de negocio.
  root_cause               TEXT, -- Descripcion u observaciones de negocio.
  resolution_summary       TEXT, -- Descripcion u observaciones de negocio.
  lessons_learned          TEXT, -- Atributo textual de negocio.
  assigned_to              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  is_regulatory_reportable BOOLEAN DEFAULT FALSE, -- true: incidente sujeto a notificacion regulatoria (Ley 21.663).
  regulatory_status_lu   BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado regulatorio consolidado (PENDING/REPORTED/CLOSED).
  regulatory_due_at      TIMESTAMPTZ, -- Proximo vencimiento regulatorio relevante del incidente.
  first_regulatory_reported_at TIMESTAMPTZ, -- Fecha de primer reporte regulatorio enviado.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_incident_org ON incidents(id_organization);
CREATE INDEX idx_incident_status ON incidents(status_lu);
CREATE INDEX idx_incident_sev ON incidents(severity_lu);
CREATE INDEX idx_incident_date ON incidents(reported_at);
CREATE INDEX idx_incident_target_process ON incidents(target_process_type, target_process_id) WHERE target_process_id IS NOT NULL;
CREATE INDEX idx_incident_reg_status ON incidents(regulatory_status_lu) WHERE regulatory_status_lu IS NOT NULL;

-- incident_regulatory_reports
-- Trazabilidad regulatoria de incidentes (Ley 21.663 y reglamento DS 295/2025).
-- Registra hitos minimos:
--   - Alerta temprana: hasta 3 horas desde conocimiento.
--   - Segundo reporte: hasta 72 horas (o 24 horas para OIV con servicio esencial afectado).
--   - Plan de accion OIV: hasta 7 dias.
--   - Reporte final: hasta 15 dias desde alerta temprana.
-- ============================================================================
-- [V11] NUEVA TABLA: incident_regulatory_reports
-- Cabecera regulatoria de incidentes para Ley 21.663 y DS 295.
-- ============================================================================
CREATE TABLE incident_regulatory_reports (
  id_incident_reg_report BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del caso regulatorio.
  reg_report_code        VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico del caso (ej: REG-INC-2026-0001).
  id_incident            BIGINT NOT NULL REFERENCES incidents(id_incident) ON DELETE CASCADE, -- Incidente origen.
  id_organization        INT NOT NULL REFERENCES organizations(id_organization), -- Organizacion reportante.
  regulatory_framework   VARCHAR(80) DEFAULT 'LEY_21663', -- Marco regulatorio principal.
  reporting_authority    VARCHAR(100) NOT NULL, -- Autoridad destino (ej: ANCI/CSIRT_NACIONAL/CSIRT_SECTORIAL/CMF/OTRA).
  authority_reference    VARCHAR(255), -- Folio, ticket o referencia entregada por autoridad.
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado del caso regulatorio.
  current_stage          VARCHAR(30), -- Etapa actual: DRAFT/EARLY_ALERT/SECOND_REPORT/PARTIAL_UPDATE/ACTION_PLAN/FINAL_REPORT/ADDITIONAL_INFO/OTHER/CLOSED.
  is_oiv                 BOOLEAN DEFAULT FALSE, -- true: institucion clasificada como OIV.
  is_essential_service_affected BOOLEAN DEFAULT FALSE, -- true: servicio esencial afectado (impacta plazos).
  has_significant_effect BOOLEAN, -- true: califica como incidente con efecto significativo.
  significant_effect_criteria JSONB, -- Criterios aplicados (a-e) segun reglamento (estructura flexible).
  incident_known_at      TIMESTAMPTZ, -- Fecha/hora de conocimiento del incidente.
  early_alert_due_at     TIMESTAMPTZ, -- Vencimiento alerta temprana (3h).
  early_alert_sent_at    TIMESTAMPTZ, -- Envio de alerta temprana.
  second_report_due_at   TIMESTAMPTZ, -- Vencimiento segundo reporte (24h/72h).
  second_report_sent_at  TIMESTAMPTZ, -- Envio de segundo reporte.
  action_plan_due_at     TIMESTAMPTZ, -- Vencimiento plan de accion OIV (7 dias).
  action_plan_sent_at    TIMESTAMPTZ, -- Envio de plan de accion.
  final_report_due_at    TIMESTAMPTZ, -- Vencimiento reporte final (15 dias).
  final_report_sent_at   TIMESTAMPTZ, -- Envio de reporte final.
  partial_reports_count  INT DEFAULT 0, -- Cantidad de reportes parciales enviados.
  last_partial_report_at TIMESTAMPTZ, -- Fecha/hora ultimo reporte parcial.
  next_partial_due_at    TIMESTAMPTZ, -- Proximo parcial comprometido (si aplica).
  taxonomy_payload       JSONB, -- Campos taxonomicos de reporte exigidos por reglamento.
  personal_data_omitted  BOOLEAN DEFAULT TRUE, -- true: reporte enviado sin datos personales innecesarios.
  owner_user_id          BIGINT NULL REFERENCES users(id_user), -- Responsable interno del cumplimiento regulatorio.
  mitigation_summary     TEXT, -- Resumen ejecutivo de medidas de mitigacion implementadas.
  regulatory_observations TEXT, -- Observaciones internas/externas del proceso regulatorio.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_reg_current_stage CHECK (current_stage IN ('DRAFT', 'EARLY_ALERT', 'SECOND_REPORT', 'PARTIAL_UPDATE', 'ACTION_PLAN', 'FINAL_REPORT', 'ADDITIONAL_INFO', 'OTHER', 'CLOSED'))
);
CREATE INDEX idx_increg_incident ON incident_regulatory_reports(id_incident);
CREATE INDEX idx_increg_org ON incident_regulatory_reports(id_organization);
CREATE INDEX idx_increg_status ON incident_regulatory_reports(status_lu) WHERE status_lu IS NOT NULL;
CREATE INDEX idx_increg_authority ON incident_regulatory_reports(reporting_authority);

-- ============================================================================
-- [V11] NUEVA TABLA: incident_regulatory_submissions
-- Bitacora detallada de envios regulatorios por hito/etapa (Ley 21.663 + DS 295).
-- ============================================================================
CREATE TABLE incident_regulatory_submissions (
  id_submission          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del envio.
  id_incident_reg_report BIGINT NOT NULL REFERENCES incident_regulatory_reports(id_incident_reg_report) ON DELETE CASCADE, -- Caso regulatorio cabecera.
  submission_stage       VARCHAR(30) NOT NULL, -- EARLY_ALERT/SECOND_REPORT/PARTIAL_UPDATE/ACTION_PLAN/FINAL_REPORT/ADDITIONAL_INFO/OTHER.
  submitted_at           TIMESTAMPTZ, -- Fecha/hora real de envio.
  due_at_snapshot        TIMESTAMPTZ, -- Vencimiento vigente al momento del envio.
  reporting_authority    VARCHAR(100), -- Autoridad efectiva del envio (si difiere de la cabecera).
  authority_reference    VARCHAR(255), -- Folio/ticket devuelto para este envio.
  payload_json           JSONB, -- Cuerpo enviado a autoridad para trazabilidad legal.
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado del envio (ENVIADO/OBSERVADO/ACEPTADO/etc.).
  response_received_at   TIMESTAMPTZ, -- Fecha/hora de respuesta de autoridad.
  response_reference     VARCHAR(255), -- Referencia de acuse o respuesta.
  is_resubmission        BOOLEAN DEFAULT FALSE, -- true: reenvio/correccion del mismo hito.
  notes                  TEXT, -- Observaciones operativas del envio.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_reg_submission_stage CHECK (submission_stage IN ('EARLY_ALERT', 'SECOND_REPORT', 'PARTIAL_UPDATE', 'ACTION_PLAN', 'FINAL_REPORT', 'ADDITIONAL_INFO', 'OTHER'))
);

-- incident_timeline
-- ============================================================================
-- [V11] NUEVA TABLA: incident_timeline
-- Tabla incident_timeline del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo incident_timeline.
-- ============================================================================
CREATE TABLE incident_timeline (
  id_timeline              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de incident_timeline.
  id_incident              BIGINT NOT NULL REFERENCES incidents(id_incident) ON DELETE CASCADE, -- FK a incidents.id_incident.
  event_time               TIMESTAMPTZ NOT NULL, -- Atributo de negocio.
  event_type               VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  description              TEXT NOT NULL, -- Descripcion u observaciones de negocio.
  actor_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_event_type CHECK (event_type IN ('DETECTION', 'NOTIFICATION', 'ESCALATION', 'ACTION', 'COMMUNICATION', 'RESOLUTION', 'CLOSURE', 'OTHER'))
);
CREATE INDEX idx_timeline_inc ON incident_timeline(id_incident);
CREATE INDEX idx_timeline_time ON incident_timeline(event_time);

-- incident_impacts
-- ============================================================================
-- [V11] NUEVA TABLA: incident_impacts
-- Tabla incident_impacts del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo incident_impacts.
-- ============================================================================
CREATE TABLE incident_impacts (
  id_impact                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de incident_impacts.
  id_incident              BIGINT NOT NULL REFERENCES incidents(id_incident) ON DELETE CASCADE, -- FK a incidents.id_incident.
  impact_type_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  impact_area              VARCHAR(100), -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  financial_loss           NUMERIC(15,2), -- Valor numerico de negocio.
  downtime_minutes         INT, -- Atributo numerico entero de negocio.
  affected_users_count     INT, -- Atributo numerico entero de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_incimpact_inc ON incident_impacts(id_incident);

-- ============================================================================
-- [V11][EXT_BE] NUEVA TABLA: loss_events
-- Base de perdida (BBPP) para riesgo operacional y apetito de riesgo (BancoEstado).
-- ============================================================================
CREATE TABLE loss_events (
  id_loss_event          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del evento de perdida.
  loss_code              VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico del evento (ej: LOSS-2026-0001).
  id_organization        INT NOT NULL REFERENCES organizations(id_organization), -- Organizacion propietaria del registro.
  event_date             DATE NOT NULL, -- Fecha de ocurrencia del evento de perdida.
  discovery_date         DATE, -- Fecha de deteccion del evento.
  accounting_date        DATE, -- Fecha de reconocimiento contable.
  risk_domain            VARCHAR(20) NOT NULL, -- Dominio de riesgo (ej: OPERATIONAL/CYBER/CONTINUITY/INTEGRATED).
  loss_type_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Tipo de perdida operacional.
  basel_loss_type_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Tipo de perdida segun Basilea.
  business_line_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Linea de negocio asociada.
  loss_source_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Fuente de alimentacion (contabilidad/manual/incidente).
  accounting_account_code VARCHAR(50), -- Cuenta contable de perdida operacional.
  source_reference       VARCHAR(255), -- Folio o referencia externa de origen.
  target_process_type    VARCHAR(30), -- Proceso asociado (MACROPROCESS/PROCESS/SUBPROCESS/PROCEDURE).
  target_process_id      INT, -- ID del proceso segun target_process_type.
  related_risk_id        BIGINT NULL REFERENCES risks(id_risk), -- Riesgo relacionado cuando aplique.
  related_incident_id    BIGINT NULL REFERENCES incidents(id_incident), -- Incidente relacionado cuando aplique.
  gross_amount           NUMERIC(15,2) NOT NULL, -- Monto bruto de perdida.
  recovered_amount       NUMERIC(15,2) NOT NULL DEFAULT 0, -- Monto recuperado/compensado.
  net_amount             NUMERIC(15,2) NOT NULL, -- Monto neto final.
  currency_code          CHAR(3) NOT NULL, -- Moneda ISO 4217 (ej: CLP/USD/UFV segun catalogo).
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado del evento (OPEN/UNDER_REVIEW/CLOSED).
  root_cause             TEXT, -- Causa raiz del evento.
  description            TEXT, -- Descripcion ejecutiva del evento.
  notes                  TEXT, -- Observaciones adicionales para analisis y reporte.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- crisis_declarations
-- ============================================================================
-- [V11] NUEVA TABLA: crisis_declarations
-- Tabla crisis_declarations del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo crisis_declarations.
-- ============================================================================
CREATE TABLE crisis_declarations (
  id_crisis                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de crisis_declarations.
  crisis_code              VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_incident              BIGINT NULL REFERENCES incidents(id_incident), -- FK a incidents.id_incident.
  declared_at              TIMESTAMPTZ DEFAULT now(), -- Marca temporal de negocio.
  declared_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  crisis_level_lu          BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  activated_plan_id        BIGINT NULL REFERENCES continuity_plans(id_plan), -- FK a continuity_plans.id_plan.
  command_center_location  BIGINT NULL REFERENCES locations(id_location), -- FK a locations.id_location.
  ended_at                 TIMESTAMPTZ, -- Marca temporal de negocio.
  ended_by                 BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  post_crisis_review       TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_crisis_incident ON crisis_declarations(id_incident);
CREATE INDEX idx_crisis_status ON crisis_declarations(status_lu);

-- crisis_actions
-- ============================================================================
-- [V11] NUEVA TABLA: crisis_actions
-- Tabla crisis_actions del modelo BCMS v11.
-- Descripcion: Acciones operativas/seguimiento asociadas al modulo.
-- ============================================================================
CREATE TABLE crisis_actions (
  id_action                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de crisis_actions.
  id_crisis                BIGINT NOT NULL REFERENCES crisis_declarations(id_crisis) ON DELETE CASCADE, -- FK a crisis_declarations.id_crisis.
  action_order             INT NOT NULL, -- Atributo numerico entero de negocio.
  action_description       TEXT NOT NULL, -- Atributo textual de negocio.
  assigned_to              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  priority_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  due_at                   TIMESTAMPTZ, -- Marca temporal de negocio.
  completed_at             TIMESTAMPTZ, -- Marca temporal de negocio.
  outcome                  TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_crisisaction_crisis ON crisis_actions(id_crisis);

-- ############################################################################
-- FASE 13: COMPLIANCE / NORMATIVAS Y REQUISITOS
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: frameworks
-- Tabla frameworks del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo frameworks.
-- ============================================================================
CREATE TABLE frameworks (
  id_framework             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de frameworks.
  framework_code           VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  version_label            VARCHAR(50), -- Atributo textual de negocio.
  issuing_body             VARCHAR(255), -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  effective_date           DATE, -- Fecha de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  metadata                 JSONB, -- Estructura JSON para datos flexibles.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255) -- Auditoria: usuario que elimina logicamente.
);

-- ============================================================================
-- [V11] NUEVA TABLA: requirement_nodes
-- Tabla requirement_nodes del modelo BCMS v11.
-- Descripcion: Nodos jerarquicos asociados a la estructura principal.
-- ============================================================================
CREATE TABLE requirement_nodes (
  id_requirement           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de requirement_nodes.
  id_framework             BIGINT NOT NULL REFERENCES frameworks(id_framework) ON DELETE CASCADE, -- FK a frameworks.id_framework.
  parent_requirement_id    BIGINT NULL REFERENCES requirement_nodes(id_requirement), -- FK a requirement_nodes.id_requirement.
  requirement_code         VARCHAR(80) NOT NULL, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  node_depth               INT DEFAULT 0, -- Atributo numerico entero de negocio.
  order_index              INT, -- Atributo numerico entero de negocio.
  is_assessable            BOOLEAN DEFAULT TRUE, -- Indicador booleano de negocio.
  maturity_target_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  metadata                 JSONB, -- Estructura JSON para datos flexibles.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_fw_req UNIQUE (id_framework, requirement_code)
);
CREATE INDEX idx_reqnode_parent ON requirement_nodes(parent_requirement_id);
CREATE INDEX idx_reqnode_fw ON requirement_nodes(id_framework);

-- ============================================================================
-- Relación N:M entre reference_controls y requirement_nodes
-- (Patrón CISO Assistant: ReferenceControl ↔ RequirementNode many-to-many)
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: reference_control_requirement_mapping
-- Tabla reference_control_requirement_mapping del modelo BCMS v11.
-- Descripcion: Tabla puente de mapeo entre dos entidades relacionadas.
-- ============================================================================
CREATE TABLE reference_control_requirement_mapping (
  id_mapping               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de reference_control_requirement_mapping.
  id_ref_control           BIGINT NOT NULL REFERENCES reference_controls(id_ref_control) ON DELETE CASCADE, -- FK a reference_controls.id_ref_control.
  id_requirement           BIGINT NOT NULL REFERENCES requirement_nodes(id_requirement) ON DELETE CASCADE, -- FK a requirement_nodes.id_requirement.
  coverage_level           VARCHAR(20), -- Atributo textual de negocio.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_refctrl_req UNIQUE (id_ref_control, id_requirement),
  CONSTRAINT ck_coverage CHECK (coverage_level IN ('FULL', 'PARTIAL', 'MINIMAL'))
);
CREATE INDEX idx_refctrl_req_ctrl ON reference_control_requirement_mapping(id_ref_control);
CREATE INDEX idx_refctrl_req_req ON reference_control_requirement_mapping(id_requirement);

-- ============================================================================
-- [V11] NUEVA TABLA: compliance_assessments
-- Tabla compliance_assessments del modelo BCMS v11.
-- Descripcion: Cabecera de evaluaciones del modulo correspondiente.
-- ============================================================================
CREATE TABLE compliance_assessments (
  id_assessment            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de compliance_assessments.
  assessment_code          VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_framework             BIGINT NOT NULL REFERENCES frameworks(id_framework), -- FK a frameworks.id_framework.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  assessment_date          DATE NOT NULL, -- Fecha de negocio.
  scope_description        TEXT, -- Atributo textual de negocio.
  lead_assessor_id         BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  overall_score            NUMERIC(5,2), -- Valor numerico de negocio.
  summary                  TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_compl_fw ON compliance_assessments(id_framework);
CREATE INDEX idx_compl_org ON compliance_assessments(id_organization);

-- ============================================================================
-- [V11] NUEVA TABLA: requirement_evaluations
-- Tabla requirement_evaluations del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo requirement_evaluations.
-- ============================================================================
CREATE TABLE requirement_evaluations (
  id_evaluation            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de requirement_evaluations.
  id_assessment            BIGINT NOT NULL REFERENCES compliance_assessments(id_assessment) ON DELETE CASCADE, -- FK a compliance_assessments.id_assessment.
  id_requirement           BIGINT NOT NULL REFERENCES requirement_nodes(id_requirement), -- FK a requirement_nodes.id_requirement.
  compliance_status_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  maturity_level_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  score                    NUMERIC(5,2), -- Valor numerico de negocio.
  observations             TEXT, -- Atributo textual de negocio.
  improvement_actions      TEXT, -- Atributo textual de negocio.
  evaluated_by             BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  evaluated_at             TIMESTAMPTZ DEFAULT now(), -- Marca temporal de negocio.
  CONSTRAINT uq_assess_req UNIQUE (id_assessment, id_requirement)
);
CREATE INDEX idx_reqeval_assess ON requirement_evaluations(id_assessment);
CREATE INDEX idx_reqeval_req ON requirement_evaluations(id_requirement);

-- ============================================================================
-- [V11] NUEVA TABLA: control_compliance_mapping
-- Tabla control_compliance_mapping del modelo BCMS v11.
-- Descripcion: Tabla puente de mapeo entre dos entidades relacionadas.
-- ============================================================================
CREATE TABLE control_compliance_mapping (
  id_mapping_cc            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de control_compliance_mapping.
  id_control               BIGINT NOT NULL REFERENCES applied_controls(id_control) ON DELETE CASCADE, -- FK a applied_controls.id_control.
  id_requirement           BIGINT NOT NULL REFERENCES requirement_nodes(id_requirement) ON DELETE CASCADE, -- FK a requirement_nodes.id_requirement.
  coverage_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_ctrl_req UNIQUE (id_control, id_requirement)
);
CREATE INDEX idx_ctrlcompl_ctrl ON control_compliance_mapping(id_control);
CREATE INDEX idx_ctrlcompl_req ON control_compliance_mapping(id_requirement);

-- ############################################################################
-- FASE 14: AUDITORÍAS Y HALLAZGOS
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: audits
-- Tabla audits del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo audits.
-- ============================================================================
CREATE TABLE audits (
  id_audit                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de audits.
  audit_code               VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  audit_type               VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  objective                TEXT, -- Atributo textual de negocio.
  id_organization          INT NOT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_framework             BIGINT NULL REFERENCES frameworks(id_framework), -- FK a frameworks.id_framework.
  scope_description        TEXT, -- Atributo textual de negocio.
  lead_auditor_id          BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  planned_start            DATE, -- Atributo de negocio.
  planned_end              DATE, -- Atributo de negocio.
  actual_start             DATE, -- Atributo de negocio.
  actual_end               DATE, -- Atributo de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  conclusion               TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_audit_type CHECK (audit_type IN ('INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'SURVEILLANCE', 'SPECIAL'))
);
CREATE INDEX idx_audit_org ON audits(id_organization);
CREATE INDEX idx_audit_fw ON audits(id_framework);
CREATE INDEX idx_audit_status ON audits(status_lu);

-- ============================================================================
-- [V11] NUEVA TABLA: audit_scope_items
-- Tabla audit_scope_items del modelo BCMS v11.
-- Descripcion: Detalle operativo asociado a la cabecera del modulo.
-- ============================================================================
CREATE TABLE audit_scope_items (
  id_scope_item            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de audit_scope_items.
  id_audit                 BIGINT NOT NULL REFERENCES audits(id_audit) ON DELETE CASCADE, -- FK a audits.id_audit.
  scope_type               VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  reference_entity         VARCHAR(255), -- Atributo textual de negocio.
  reference_entity_id      BIGINT, -- Atributo numerico entero de negocio.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  CONSTRAINT ck_scope_type CHECK (scope_type IN ('PROCESS', 'LOCATION', 'REQUIREMENT', 'CONTROL', 'DEPARTMENT'))
);
CREATE INDEX idx_auditscope_audit ON audit_scope_items(id_audit);

-- ============================================================================
-- SE AGREGA: id_ref_control FK para vincular hallazgo a control de referencia
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: findings
-- Tabla findings del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo findings.
-- ============================================================================
CREATE TABLE findings (
  id_finding               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de findings.
  finding_code             VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  id_audit                 BIGINT NOT NULL REFERENCES audits(id_audit) ON DELETE CASCADE, -- FK a audits.id_audit.
  finding_type             VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT NOT NULL, -- Descripcion u observaciones de negocio.
  severity_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  related_requirement_id   BIGINT NULL REFERENCES requirement_nodes(id_requirement), -- FK a requirement_nodes.id_requirement.
  related_control_id       BIGINT NULL REFERENCES applied_controls(id_control), -- FK a applied_controls.id_control.
  id_ref_control           BIGINT NULL REFERENCES reference_controls(id_ref_control), -- FK a reference_controls.id_ref_control.
  root_cause               TEXT, -- Descripcion u observaciones de negocio.
  recommendation           TEXT, -- Atributo textual de negocio.
  management_response      TEXT, -- Atributo textual de negocio.
  responsible_user_id      BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  due_date                 DATE, -- Fecha de negocio.
  closed_at                TIMESTAMPTZ, -- Marca temporal de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_finding_type CHECK (finding_type IN ('NC_MAJOR', 'NC_MINOR', 'OBSERVATION', 'OPPORTUNITY', 'POSITIVE'))
);
CREATE INDEX idx_finding_audit ON findings(id_audit);
CREATE INDEX idx_finding_status ON findings(status_lu);
CREATE INDEX idx_finding_req ON findings(related_requirement_id);
CREATE INDEX idx_finding_ctrl ON findings(related_control_id);
CREATE INDEX idx_finding_refctrl ON findings(id_ref_control) WHERE id_ref_control IS NOT NULL;

-- ============================================================================
-- [V11] NUEVA TABLA: finding_actions
-- Tabla finding_actions del modelo BCMS v11.
-- Descripcion: Acciones operativas/seguimiento asociadas al modulo.
-- ============================================================================
CREATE TABLE finding_actions (
  id_action                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de finding_actions.
  id_finding               BIGINT NOT NULL REFERENCES findings(id_finding) ON DELETE CASCADE, -- FK a findings.id_finding.
  action_type              VARCHAR(50), -- Atributo textual de negocio.
  description              TEXT NOT NULL, -- Descripcion u observaciones de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  due_date                 DATE, -- Fecha de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  completed_at             TIMESTAMPTZ, -- Marca temporal de negocio.
  verification_notes       TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_action_type CHECK (action_type IN ('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT'))
);
CREATE INDEX idx_findact_finding ON finding_actions(id_finding);

-- ############################################################################
-- FASE 15: EVIDENCIAS UNIFICADAS + VERSIONADO
-- ############################################################################

-- ============================================================================
-- Antes: tabla simple de anexos
-- Ahora: tabla unificada que absorbe funcionalidad de documents
-- CAMPOS NUEVOS: evidence_code, title, description, status_lu, valid_from, valid_until
-- Patrón CISO Assistant: Evidence + Evidence versioning
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: evidences
-- Tabla evidences del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo evidences.
-- ============================================================================
CREATE TABLE evidences (
  id_evidence              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de evidences.
  evidence_code            VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  file_name                VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  file_path                TEXT NOT NULL, -- Atributo textual de negocio.
  mime_type                VARCHAR(100), -- Atributo textual de negocio.
  file_size_bytes          BIGINT, -- Atributo numerico entero de negocio.
  hash_sha256              CHAR(64), -- Atributo textual de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  valid_from               DATE, -- Atributo de negocio.
  valid_until              DATE, -- Atributo de negocio.
  entity_type              VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  entity_id                BIGINT NOT NULL, -- Atributo numerico entero de negocio.
  uploaded_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  uploaded_at              TIMESTAMPTZ DEFAULT now(), -- Marca temporal de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_evidence_entity CHECK (entity_type IN (
    'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE',
    'PLAN', 'BIA', 'RIA', 'RISK', 'CONTROL', 'REFERENCE_CONTROL',
    'THREAT', 'VULNERABILITY', 'ASSET', 'SUPPLIER', 'LOCATION',
    'CONTACT', 'USER', 'INCIDENT', 'INCIDENT_REG_REPORT', 'CRISIS',
    'AUDIT', 'FINDING', 'FRAMEWORK', 'REQUIREMENT', 'COMPLIANCE',
    'TEST', 'EVIDENCE'
  )),
  CONSTRAINT ck_evidence_dates CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);
CREATE INDEX idx_evidence_entity ON evidences(entity_type, entity_id);
CREATE INDEX idx_evidence_uploader ON evidences(uploaded_by);
CREATE INDEX idx_evidence_status ON evidences(status_lu);
CREATE INDEX idx_evidence_validity ON evidences(valid_from, valid_until);

-- ============================================================================
-- Historial de versiones de evidencias (patrón CISO Assistant: EvidenceRevision)
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: evidence_versions
-- Tabla evidence_versions del modelo BCMS v11.
-- Descripcion: Historial de versiones y cambios de la entidad.
-- ============================================================================
CREATE TABLE evidence_versions (
  id_evidence_version      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de evidence_versions.
  id_evidence              BIGINT NOT NULL REFERENCES evidences(id_evidence) ON DELETE CASCADE, -- FK a evidences.id_evidence.
  version_number           INT NOT NULL, -- Atributo numerico entero de negocio.
  file_name                VARCHAR(255) NOT NULL, -- Atributo textual de negocio.
  file_path                TEXT NOT NULL, -- Atributo textual de negocio.
  mime_type                VARCHAR(100), -- Atributo textual de negocio.
  file_size_bytes          BIGINT, -- Atributo numerico entero de negocio.
  hash_sha256              CHAR(64), -- Atributo textual de negocio.
  change_summary           TEXT, -- Atributo textual de negocio.
  created_by               BIGINT NULL REFERENCES users(id_user), -- Auditoria: usuario creador.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT uq_evidence_version UNIQUE (id_evidence, version_number)
);
CREATE INDEX idx_evver_evidence ON evidence_versions(id_evidence);
CREATE INDEX idx_evver_created ON evidence_versions(created_at);

-- ============================================================================
--   - documents (funcionalidad absorbida por evidences)
--   - document_versions (reemplazada por evidence_versions)
--   - attachments (redundante con evidences)
-- ============================================================================

-- ############################################################################
-- FASE 16: SISTEMA DE ETIQUETAS (TAGS)
-- ############################################################################
-- Patrón CISO Assistant: FilteringLabel (etiquetas dinámicas)

-- ============================================================================
-- Catálogo de etiquetas para clasificación flexible de entidades
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: tags
-- Tabla tags del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo tags.
-- ============================================================================
CREATE TABLE tags (
  id_tag                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de tags.
  tag_name                 VARCHAR(100) NOT NULL, -- Atributo textual de negocio.
  tag_category             VARCHAR(50), -- Atributo textual de negocio.
  color_hex                CHAR(7), -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  is_system_tag            BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  -- Unicidad: mismo nombre de tag puede existir en distintas organizaciones
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  CONSTRAINT uq_tag_org UNIQUE (tag_name, id_organization),
  -- Validación color hexadecimal
  CONSTRAINT ck_tag_color CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9A-Fa-f]{6}$')
);
CREATE INDEX idx_tag_org ON tags(id_organization);
CREATE INDEX idx_tag_category ON tags(tag_category);
CREATE INDEX idx_tag_active ON tags(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================================
-- Tabla polimórfica para asignar tags a cualquier entidad del sistema
-- ============================================================================
-- ============================================================================
-- [V11] NUEVA TABLA: entity_tags
-- Tabla entity_tags del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo entity_tags.
-- ============================================================================
CREATE TABLE entity_tags (
  id_entity_tag            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de entity_tags.
  id_tag                   BIGINT NOT NULL REFERENCES tags(id_tag) ON DELETE CASCADE, -- FK a tags.id_tag.
  entity_type              VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  entity_id                BIGINT NOT NULL, -- Atributo numerico entero de negocio.
  assigned_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  assigned_at              TIMESTAMPTZ DEFAULT now(), -- Marca temporal de negocio.
  -- Evitar duplicados: mismo tag no puede asignarse dos veces a la misma entidad
  CONSTRAINT uq_entity_tag UNIQUE (id_tag, entity_type, entity_id),
  -- Entidades soportadas (diccionario polimorfico comun v11)
  CONSTRAINT ck_entity_tag_type CHECK (entity_type IN (
    'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE',
    'PLAN', 'BIA', 'RIA', 'RISK', 'CONTROL', 'REFERENCE_CONTROL',
    'THREAT', 'VULNERABILITY', 'ASSET', 'SUPPLIER', 'LOCATION',
    'CONTACT', 'USER', 'INCIDENT', 'INCIDENT_REG_REPORT', 'CRISIS',
    'AUDIT', 'FINDING', 'FRAMEWORK', 'REQUIREMENT', 'COMPLIANCE',
    'TEST', 'EVIDENCE'
  ))
);
CREATE INDEX idx_entity_tag_tag ON entity_tags(id_tag);
CREATE INDEX idx_entity_tag_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX idx_entity_tag_assigned ON entity_tags(assigned_by);

-- ############################################################################
-- FASE 17: NOTIFICACIONES Y LOGS
-- ############################################################################

-- notifications
-- ============================================================================
-- [V11] NUEVA TABLA: notifications
-- Tabla notifications del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo notifications.
-- ============================================================================
CREATE TABLE notifications (
  id_notification          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de notifications.
  notification_type        VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  message                  TEXT, -- Atributo textual de negocio.
  target_user_id           BIGINT NOT NULL REFERENCES users(id_user), -- FK a users.id_user.
  is_read                  BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  read_at                  TIMESTAMPTZ, -- Marca temporal de negocio.
  reference_entity         VARCHAR(50), -- Atributo textual de negocio.
  reference_entity_id      BIGINT, -- Atributo numerico entero de negocio.
  link_url                 TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_notif_user ON notifications(target_user_id);
CREATE INDEX idx_notif_unread ON notifications(target_user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notif_created ON notifications(created_at);

-- audit_logs
-- ============================================================================
-- [V11] NUEVA TABLA: audit_logs
-- Tabla audit_logs del modelo BCMS v11.
-- Descripcion: Bitacora de eventos y trazabilidad operativa del modulo.
-- ============================================================================
CREATE TABLE audit_logs (
  id_log                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de audit_logs.
  log_timestamp            TIMESTAMPTZ DEFAULT now(), -- Atributo de negocio.
  action_type              VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  entity_type              VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  entity_id                BIGINT, -- Atributo numerico entero de negocio.
  user_id                  BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  ip_address               INET, -- Atributo de negocio.
  user_agent               TEXT, -- Atributo textual de negocio.
  old_values               JSONB, -- Estructura JSON para datos flexibles.
  new_values               JSONB, -- Estructura JSON para datos flexibles.
  description              TEXT, -- Descripcion u observaciones de negocio.
  CONSTRAINT ck_action_type CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'VIEW'))
);
CREATE INDEX idx_auditlog_time ON audit_logs(log_timestamp);
CREATE INDEX idx_auditlog_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_auditlog_user ON audit_logs(user_id);
CREATE INDEX idx_auditlog_action ON audit_logs(action_type);

-- ############################################################################
-- FASE 17B: LECCIONES APRENDIDAS Y GESTIÓN DE CAMBIOS
-- ############################################################################

-- lessons_learned
-- ============================================================================
-- [V11] NUEVA TABLA: lessons_learned
-- Tabla lessons_learned del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo lessons_learned.
-- ============================================================================
CREATE TABLE lessons_learned (
  id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de lessons_learned.
  code                     VARCHAR(50) UNIQUE NOT NULL, -- Atributo textual de negocio.
  title                    VARCHAR(200) NOT NULL, -- Titulo descriptivo.
  
  -- Origen de la lección
  source_type VARCHAR(50),  -- 'INCIDENT', 'CRISIS', 'EXERCISE', 'AUDIT', 'EXTERNAL_EVENT', 'BEST_PRACTICE'
  source_id BIGINT,  -- FK polimorfica al id del origen
  lesson_date              DATE NOT NULL, -- Fecha de negocio.
  
  -- Contenido
  description              TEXT, -- Descripcion u observaciones de negocio.
  root_cause               TEXT, -- Descripcion u observaciones de negocio.
  impact_assessment        TEXT, -- Atributo textual de negocio.
  recommendations          TEXT, -- Atributo textual de negocio.
  
  -- Mejora
  improvement_actions      TEXT, -- Atributo textual de negocio.
  actions_taken            TEXT, -- Atributo textual de negocio.
  status VARCHAR(30) DEFAULT 'identified',  -- identified, in_progress, implemented, validated, closed
  priority VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, critical
  
  -- Efectividad (métricas before/after)
  effectiveness_metrics JSONB,  -- {before: {metric: value}, after: {metric: value}, improvement_percentage: X}
  investment_amount        NUMERIC(15,2), -- Valor numerico de negocio.
  investment_currency      VARCHAR(3) DEFAULT 'USD', -- Atributo textual de negocio.
  
  -- Responsabilidad
  responsible_id           BIGINT REFERENCES users(id_user), -- FK a users.id_user.
  due_date                 DATE, -- Fecha de negocio.
  implementation_date      DATE, -- Fecha de negocio.
  validation_date          DATE, -- Fecha de negocio.
  closed_date              DATE, -- Fecha de negocio.
  
  -- Organización
  id_organization          INT REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  folder_id                BIGINT, -- Atributo numerico entero de negocio.
  
  -- Auditoría
  created_by               BIGINT REFERENCES users(id_user), -- Auditoria: usuario creador.
  created_at               TIMESTAMPTZ DEFAULT NOW(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT NOW(), -- Auditoria: fecha de actualizacion.
  updated_by               BIGINT REFERENCES users(id_user), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               BIGINT REFERENCES users(id_user), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_ll_status CHECK (status IN ('identified', 'in_progress', 'implemented', 'validated', 'closed')),
  CONSTRAINT ck_ll_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT ck_ll_source_type CHECK (source_type IN ('INCIDENT', 'CRISIS', 'EXERCISE', 'AUDIT', 'EXTERNAL_EVENT', 'BEST_PRACTICE'))
);

CREATE INDEX idx_ll_org ON lessons_learned(id_organization);
CREATE INDEX idx_ll_source ON lessons_learned(source_type, source_id);
CREATE INDEX idx_ll_status ON lessons_learned(status);
CREATE INDEX idx_ll_responsible ON lessons_learned(responsible_id);
CREATE INDEX idx_ll_date ON lessons_learned(lesson_date);
COMMENT ON TABLE lessons_learned IS '[V11] Lecciones aprendidas de incidentes, crisis, ejercicios, auditorías. Centraliza mejora continua del SGCN (ISO 22301 cláusula 10.2).';

-- bcms_changes
-- ============================================================================
-- [V11] NUEVA TABLA: bcms_changes
-- Tabla bcms_changes del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_changes.
-- ============================================================================
CREATE TABLE bcms_changes (
  id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_changes.
  change_code              VARCHAR(50) UNIQUE NOT NULL, -- Codigo unico de negocio.
  title                    VARCHAR(200) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  
  -- Tipo de cambio
  change_type VARCHAR(50) NOT NULL,  -- PROCESS_CHANGE, SCOPE_CHANGE, POLICY_CHANGE, STRUCTURE_CHANGE, PLAN_CHANGE, STRATEGY_CHANGE
  change_category VARCHAR(30),  -- minor, major, critical
  
  -- Entidades afectadas (polimórfico)
  affected_entities JSONB,  -- [{entity_type: 'process', entity_id: BIGINT, description: 'Cambio en RTO'}, ...]
  impact_assessment        TEXT, -- Atributo textual de negocio.
  risk_level VARCHAR(20),  -- low, medium, high, critical
  
  -- Justificación
  reason                   TEXT, -- Atributo textual de negocio.
  expected_benefits        TEXT, -- Atributo textual de negocio.
  
  -- Proceso de aprobación
  requested_by             BIGINT REFERENCES users(id_user), -- FK a users.id_user.
  request_date             DATE NOT NULL, -- Fecha de negocio.
  approved_by              BIGINT REFERENCES users(id_user), -- FK a users.id_user.
  approval_date            DATE, -- Fecha de negocio.
  rejection_reason         TEXT, -- Atributo textual de negocio.
  
  -- Implementación
  status VARCHAR(30) DEFAULT 'pending',  -- pending, approved, in_progress, implemented, rejected, cancelled
  scheduled_date           DATE, -- Fecha de negocio.
  implementation_date      DATE, -- Fecha de negocio.
  implementation_notes     TEXT, -- Atributo textual de negocio.
  rollback_plan            TEXT, -- Atributo textual de negocio.
  
  -- Verificación
  verified_by              BIGINT REFERENCES users(id_user), -- FK a users.id_user.
  verification_date        DATE, -- Fecha de negocio.
  verification_notes       TEXT, -- Atributo textual de negocio.
  
  -- Organización
  id_organization          INT REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  
  -- Auditoría
  created_by               BIGINT REFERENCES users(id_user), -- Auditoria: usuario creador.
  created_at               TIMESTAMPTZ DEFAULT NOW(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT NOW(), -- Auditoria: fecha de actualizacion.
  updated_by               BIGINT REFERENCES users(id_user), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               BIGINT REFERENCES users(id_user), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_bcms_change_status CHECK (status IN ('pending', 'approved', 'in_progress', 'implemented', 'rejected', 'cancelled')),
  CONSTRAINT ck_bcms_change_type CHECK (change_type IN ('PROCESS_CHANGE', 'SCOPE_CHANGE', 'POLICY_CHANGE', 'STRUCTURE_CHANGE', 'PLAN_CHANGE', 'STRATEGY_CHANGE')),
  CONSTRAINT ck_bcms_change_category CHECK (change_category IN ('minor', 'major', 'critical')),
  CONSTRAINT ck_bcms_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_bcms_change_org ON bcms_changes(id_organization);
CREATE INDEX idx_bcms_change_status ON bcms_changes(status);
CREATE INDEX idx_bcms_change_type ON bcms_changes(change_type);
CREATE INDEX idx_bcms_change_requested ON bcms_changes(requested_by);
CREATE INDEX idx_bcms_change_approved ON bcms_changes(approved_by);
CREATE INDEX idx_bcms_change_date ON bcms_changes(request_date);
COMMENT ON TABLE bcms_changes IS '[V11] Gestión de cambios al SGCN. Documenta cambios planificados al alcance, procesos, políticas, planes (ISO 22301 cláusula 6.3).';

-- ############################################################################
-- FASE 18: VISTAS MATERIALIZADAS Y REGULARES
-- ############################################################################

CREATE VIEW v_process_hierarchy AS
SELECT
  o.id_organization,
  o.name AS organization,
  m.id_macroprocess,
  m.name AS macroprocess,
  p.id_process,
  p.name AS process,
  s.id_subprocess,
  s.name AS subprocess,
  pr.id_procedure,
  pr.name AS procedure,
  pr.is_deleted
FROM organizations o
LEFT JOIN organization_macroprocess om ON o.id_organization = om.id_organization
LEFT JOIN macroprocesses m ON om.id_macroprocess = m.id_macroprocess
LEFT JOIN organization_process op ON o.id_organization = op.id_organization
LEFT JOIN processes p ON op.id_process = p.id_process AND p.id_macroprocess = m.id_macroprocess
LEFT JOIN organization_subprocess os ON o.id_organization = os.id_organization
LEFT JOIN subprocesses s ON os.id_subprocess = s.id_subprocess AND s.id_process = p.id_process
LEFT JOIN organization_procedure opr ON o.id_organization = opr.id_organization
LEFT JOIN procedures pr ON opr.id_procedure = pr.id_procedure AND pr.id_subprocess = s.id_subprocess;

CREATE VIEW v_risk_overview AS
SELECT
  r.id_risk,
  r.risk_code,
  r.title,
  r.risk_domain,
  r.risk_scope,
  r.status_lu,
  ra_inh.risk_score AS inherent_score,
  ra_res.risk_score AS residual_score,
  COUNT(DISTINCT rcm.id_control) AS control_count,
  r.owner_user_id
FROM risks r
LEFT JOIN LATERAL (
  SELECT risk_score FROM risk_assessments WHERE id_risk = r.id_risk AND assessment_type = 'INHERENT' ORDER BY assessed_at DESC LIMIT 1
) ra_inh ON TRUE
LEFT JOIN LATERAL (
  SELECT risk_score FROM risk_assessments WHERE id_risk = r.id_risk AND assessment_type = 'RESIDUAL' ORDER BY assessed_at DESC LIMIT 1
) ra_res ON TRUE
LEFT JOIN risk_control_mapping rcm ON r.id_risk = rcm.id_risk
GROUP BY r.id_risk, r.risk_code, r.title, r.risk_domain, r.risk_scope, r.status_lu, ra_inh.risk_score, ra_res.risk_score, r.owner_user_id;

CREATE VIEW v_compliance_status AS
SELECT
  ca.id_assessment,
  ca.assessment_code,
  f.name AS framework_name,
  o.name AS organization,
  ca.assessment_date,
  COUNT(re.id_evaluation) AS total_requirements,
  COUNT(re.id_evaluation) FILTER (WHERE lv.code = 'COMPLIANT') AS compliant_count,
  ROUND(100.0 * COUNT(re.id_evaluation) FILTER (WHERE lv.code = 'COMPLIANT') / NULLIF(COUNT(re.id_evaluation), 0), 2) AS compliance_pct
FROM compliance_assessments ca
JOIN frameworks f ON ca.id_framework = f.id_framework
JOIN organizations o ON ca.id_organization = o.id_organization
LEFT JOIN requirement_evaluations re ON ca.id_assessment = re.id_assessment
LEFT JOIN lookup_values lv ON re.compliance_status_lu = lv.id_lookup_value
GROUP BY ca.id_assessment, ca.assessment_code, f.name, o.name, ca.assessment_date;

CREATE VIEW v_incident_summary AS
SELECT
  i.id_incident,
  i.incident_code,
  i.title,
  o.name AS organization,
  lv_type.label AS incident_type,
  lv_sev.label AS severity,
  lv_stat.label AS status,
  i.reported_at,
  i.resolved_at,
  EXTRACT(EPOCH FROM (i.resolved_at - i.reported_at))/3600 AS resolution_hours,
  (SELECT SUM(financial_loss) FROM incident_impacts WHERE id_incident = i.id_incident) AS total_financial_loss
FROM incidents i
JOIN organizations o ON i.id_organization = o.id_organization
LEFT JOIN lookup_values lv_type ON i.incident_type_lu = lv_type.id_lookup_value
LEFT JOIN lookup_values lv_sev ON i.severity_lu = lv_sev.id_lookup_value
LEFT JOIN lookup_values lv_stat ON i.status_lu = lv_stat.id_lookup_value;

-- ============================================================================
-- Resumen del estado de evidencias por entidad
-- ============================================================================
CREATE VIEW v_evidences_status AS
SELECT
  e.entity_type,
  e.entity_id,
  COUNT(*) AS total_evidences,
  COUNT(*) FILTER (WHERE lv.code = 'VALID') AS valid_count,
  COUNT(*) FILTER (WHERE lv.code = 'EXPIRED') AS expired_count,
  COUNT(*) FILTER (WHERE lv.code = 'PENDING_REVIEW') AS pending_review_count,
  COUNT(*) FILTER (WHERE e.valid_until < CURRENT_DATE) AS overdue_count,
  MAX(e.uploaded_at) AS last_upload,
  MIN(e.valid_until) FILTER (WHERE e.valid_until >= CURRENT_DATE) AS next_expiry
FROM evidences e
LEFT JOIN lookup_values lv ON e.status_lu = lv.id_lookup_value
GROUP BY e.entity_type, e.entity_id;

-- ============================================================================
-- Amenazas con sus riesgos asociados y conteo
-- ============================================================================
CREATE VIEW v_threats_with_risks AS
SELECT
  t.id_threat,
  t.threat_code,
  t.name AS threat_name,
  lv_cat.label AS threat_category,
  lv_src.label AS threat_source,
  COUNT(DISTINCT rtm.id_risk) AS associated_risks,
  COUNT(DISTINCT rtm.id_risk) FILTER (WHERE lv_dom.code = 'CYBER') AS cyber_risks,
  COUNT(DISTINCT rtm.id_risk) FILTER (WHERE lv_dom.code = 'CONTINUITY') AS continuity_risks,
  t.is_deleted
FROM threats t
LEFT JOIN lookup_values lv_cat ON t.threat_category_lu = lv_cat.id_lookup_value
LEFT JOIN lookup_values lv_src ON t.threat_source_lu = lv_src.id_lookup_value
LEFT JOIN risk_threat_mapping rtm ON t.id_threat = rtm.id_threat
LEFT JOIN risks r ON rtm.id_risk = r.id_risk
LEFT JOIN lookup_values lv_dom ON TRUE -- Placeholder para dominio (simplificación)
GROUP BY t.id_threat, t.threat_code, t.name, lv_cat.label, lv_src.label, t.is_deleted;

-- ############################################################################
-- FIN DEL SCHEMA BCMS v9
-- ############################################################################
-- 
-- ============================================================================
-- RESUMEN DE CAMBIOS V8 → V9:
-- ============================================================================
-- 
-- OBJETIVO: Alinear tablas de jerarquía de procesos con sistema legacy B-GRC
-- FUENTE:   final_mockup/docs/MitigaResilience - MitigaData.csv
-- 
-- TABLAS LEGACY MODIFICADAS (4):
--   1. macroprocesses   - Eliminados: code, color_hex, is_active
--                       - Agregados: expiration_date, deleted_at, deleted_by
--   2. processes        - Eliminados: code, is_active
--                       - Agregados: deleted_at, deleted_by
--   3. subprocesses     - Eliminados: code, sequence_order, is_active
--                       - Agregados: deleted_at, deleted_by
--   4. procedures       - Eliminados: code, sequence_order, is_active
--                       - Agregados: deleted_at, deleted_by
-- 
-- NOTA: Estas 4 tablas ahora son IDÉNTICAS a la estructura del sistema B-GRC
--       legacy y NO DEBEN SER MODIFICADAS sin autorización explícita.
-- 
-- ============================================================================
-- ============================================================================
-- 
-- TABLAS NUEVAS (+8):
--   1. threats                           - Catálogo de amenazas
--   2. risk_threat_mapping               - N:M riesgos ↔ amenazas
--   3. vulnerabilities                   - Registro de vulnerabilidades
--   4. asset_vulnerabilities             - N:M activos ↔ vulnerabilidades
--   5. evidence_versions                 - Historial de versiones de evidencia
--   6. reference_control_requirement_mapping - N:M controles ref ↔ requisitos
--   7. tags                              - Catálogo de etiquetas
--   8. entity_tags                       - Asignación polimórfica de tags
-- 
-- TABLAS MODIFICADAS (3):
--   1. contacts         - +id_organization FK
--   2. evidences        - +evidence_code, +title, +description, +status_lu, +valid_from, +valid_until
--   3. findings         - +id_ref_control FK
-- 
-- TABLAS ELIMINADAS (-3):
--   1. documents        - Absorbida por evidences
--   2. document_versions - Reemplazada por evidence_versions
--   3. attachments      - Redundante con evidences
-- 
-- VISTAS NUEVAS (+2):
--   1. v_evidences_status    - Estado de evidencias por entidad
--   2. v_threats_with_risks  - Amenazas con riesgos asociados
-- 
-- TOTAL TABLAS: ~68
-- TOTAL VISTAS: 6
-- 
-- ============================================================================


-- ############################################################################
-- FASE 19: GOBIERNO BCMS (ISO 22301 CLAUSES 4-6)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_context_issues
-- Tabla bcms_context_issues del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_context_issues.
-- ============================================================================
CREATE TABLE bcms_context_issues (
  id_context_issue         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_context_issues.
  issue_type               VARCHAR(20) NOT NULL, -- Atributo textual de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  impact_description       TEXT, -- Descripcion u observaciones de negocio.
  risk_level_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  reviewed_at              DATE, -- Marca temporal de negocio.
  next_review_date         DATE, -- Fecha de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_context_issue_type CHECK (issue_type IN ('EXTERNAL', 'INTERNAL'))
);
CREATE INDEX idx_context_org ON bcms_context_issues(id_organization);
CREATE INDEX idx_context_type ON bcms_context_issues(issue_type);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_stakeholders
-- Tabla bcms_stakeholders del modelo BCMS v11.
-- Descripcion: Partes interesadas relacionadas con el modulo.
-- ============================================================================
CREATE TABLE bcms_stakeholders (
  id_stakeholder           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_stakeholders.
  stakeholder_type         VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  expectations             TEXT, -- Atributo textual de negocio.
  requirements             TEXT, -- Atributo textual de negocio.
  priority_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  id_contact               BIGINT NULL REFERENCES contacts(id_contact), -- FK a contacts.id_contact.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  country_code             CHAR(3), -- Codigo unico de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  CONSTRAINT ck_stakeholder_type CHECK (stakeholder_type IN ('CUSTOMER', 'REGULATOR', 'SUPPLIER', 'EMPLOYEE', 'SHAREHOLDER', 'COMMUNITY', 'GOVERNMENT', 'PARTNER', 'INTERNAL'))
);
CREATE INDEX idx_stakeholder_org ON bcms_stakeholders(id_organization);
CREATE INDEX idx_stakeholder_type ON bcms_stakeholders(stakeholder_type);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_scopes
-- Tabla bcms_scopes del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_scopes.
-- ============================================================================
CREATE TABLE bcms_scopes (
  id_scope                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_scopes.
  scope_code               VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  scope_statement          TEXT NOT NULL, -- Atributo textual de negocio.
  inclusions               TEXT, -- Atributo textual de negocio.
  exclusions               TEXT, -- Atributo textual de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  approved_by              BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  approval_date            DATE, -- Fecha de negocio.
  next_review_date         DATE, -- Fecha de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_scope_org ON bcms_scopes(id_organization);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_policies
-- Tabla bcms_policies del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_policies.
-- ============================================================================
CREATE TABLE bcms_policies (
  id_policy                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_policies.
  policy_code              VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  version                  VARCHAR(50), -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  approval_date            DATE, -- Fecha de negocio.
  next_review_date         DATE, -- Fecha de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_policy_org ON bcms_policies(id_organization);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_objectives
-- Tabla bcms_objectives del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_objectives.
-- ============================================================================
CREATE TABLE bcms_objectives (
  id_objective             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_objectives.
  objective_code           VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  kpi_name                 VARCHAR(255), -- Atributo textual de negocio.
  target_value             VARCHAR(100), -- Atributo textual de negocio.
  current_value            VARCHAR(100), -- Atributo textual de negocio.
  unit                     VARCHAR(30), -- Atributo textual de negocio.
  due_date                 DATE, -- Fecha de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_objective_org ON bcms_objectives(id_organization);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_strategies
-- Tabla bcms_strategies del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_strategies.
-- ============================================================================
CREATE TABLE bcms_strategies (
  id_strategy              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_strategies.
  strategy_code            VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  title                    VARCHAR(255) NOT NULL, -- Titulo descriptivo.
  description              TEXT, -- Descripcion u observaciones de negocio.
  period_start             DATE, -- Atributo de negocio.
  period_end               DATE, -- Atributo de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  budget_amount            NUMERIC(15,2), -- Valor numerico de negocio.
  budget_currency          VARCHAR(3) DEFAULT 'USD', -- Atributo textual de negocio.
  progress_pct             INT DEFAULT 0, -- Atributo numerico entero de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_strategy_progress CHECK (progress_pct >= 0 AND progress_pct <= 100)
);
CREATE INDEX idx_strategy_org ON bcms_strategies(id_organization);

-- ############################################################################
-- FASE 20: CONTACT LINKS (POLYMORPHIC RELATIONSHIPS)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: contact_links
-- Tabla contact_links del modelo BCMS v11.
-- Descripcion: Relacion polimorfica entre contactos y entidades del sistema.
-- ============================================================================
CREATE TABLE contact_links (
  id_contact_link          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de contact_links.
  id_contact               BIGINT NOT NULL REFERENCES contacts(id_contact) ON DELETE CASCADE, -- FK a contacts.id_contact.
  entity_type              VARCHAR(50) NOT NULL, -- Atributo textual de negocio.
  entity_id                BIGINT NOT NULL, -- Atributo numerico entero de negocio.
  relationship_type        VARCHAR(50), -- Atributo textual de negocio.
  is_primary               BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_contact_entity_type CHECK (entity_type IN (
    'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE',
    'PLAN', 'BIA', 'RIA', 'RISK', 'CONTROL', 'REFERENCE_CONTROL',
    'THREAT', 'VULNERABILITY', 'ASSET', 'SUPPLIER', 'LOCATION',
    'CONTACT', 'USER', 'INCIDENT', 'INCIDENT_REG_REPORT', 'CRISIS',
    'AUDIT', 'FINDING', 'FRAMEWORK', 'REQUIREMENT', 'COMPLIANCE',
    'TEST', 'EVIDENCE'
  ))
);
CREATE INDEX idx_contact_links_entity ON contact_links(entity_type, entity_id);
CREATE INDEX idx_contact_links_contact ON contact_links(id_contact);

-- ############################################################################
-- FASE 21: RACI BCMS
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_roles
-- Tabla bcms_roles del modelo BCMS v11.
-- Descripcion: Catalogo de roles funcionales del modulo.
-- ============================================================================
CREATE TABLE bcms_roles (
  id_bcms_role             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_roles.
  role_code                VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255) -- Auditoria: usuario que elimina logicamente.
);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_role_assignments
-- Tabla bcms_role_assignments del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_role_assignments.
-- ============================================================================
CREATE TABLE bcms_role_assignments (
  id_assignment            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_role_assignments.
  id_bcms_role             BIGINT NOT NULL REFERENCES bcms_roles(id_bcms_role) ON DELETE CASCADE, -- FK a bcms_roles.id_bcms_role.
  id_user                  BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE, -- FK a users.id_user.
  scope_type               VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  scope_id                 BIGINT, -- Atributo numerico entero de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  is_primary               BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  valid_from               TIMESTAMPTZ DEFAULT now(), -- Atributo de negocio.
  valid_until              TIMESTAMPTZ, -- Atributo de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_bcms_scope_type CHECK (scope_type IN (
    'GLOBAL', 'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE',
    'PLAN', 'BIA', 'RIA', 'RISK', 'CONTROL', 'REFERENCE_CONTROL',
    'THREAT', 'VULNERABILITY', 'ASSET', 'SUPPLIER', 'LOCATION',
    'CONTACT', 'USER', 'INCIDENT', 'INCIDENT_REG_REPORT', 'CRISIS',
    'AUDIT', 'FINDING', 'FRAMEWORK', 'REQUIREMENT', 'COMPLIANCE',
    'TEST', 'EVIDENCE'
  ))
);
CREATE INDEX idx_bcms_role_assign_user ON bcms_role_assignments(id_user);
CREATE INDEX idx_bcms_role_assign_scope ON bcms_role_assignments(scope_type, scope_id);

-- ============================================================================
-- [V11] NUEVA TABLA: bcms_raci_matrix
-- Tabla bcms_raci_matrix del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo bcms_raci_matrix.
-- ============================================================================
CREATE TABLE bcms_raci_matrix (
  id_raci                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de bcms_raci_matrix.
  activity_code            VARCHAR(50) NOT NULL, -- Codigo unico de negocio.
  id_bcms_role             BIGINT NOT NULL REFERENCES bcms_roles(id_bcms_role) ON DELETE CASCADE, -- FK a bcms_roles.id_bcms_role.
  responsibility           CHAR(1) NOT NULL, -- Atributo textual de negocio.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_raci_resp CHECK (responsibility IN ('R', 'A', 'C', 'I'))
);
CREATE INDEX idx_raci_activity ON bcms_raci_matrix(activity_code);

-- ############################################################################
-- FASE 22: PLANES DE COMUNICACION
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: communication_plans
-- Tabla communication_plans del modelo BCMS v11.
-- Descripcion: Plan de comunicaciones operativas para continuidad e incidentes.
-- ============================================================================
CREATE TABLE communication_plans (
  id_comm_plan             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de communication_plans.
  plan_code                VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  name                     VARCHAR(255) NOT NULL, -- Nombre visible.
  description              TEXT, -- Descripcion u observaciones de negocio.
  scope_type               VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  scope_id                 BIGINT, -- Atributo numerico entero de negocio.
  id_organization          INT NULL REFERENCES organizations(id_organization), -- FK a organizations.id_organization.
  id_activation_criteria   BIGINT NULL REFERENCES activation_criteria(id_criteria), -- FK a activation_criteria.id_criteria.
  id_call_tree             BIGINT NULL REFERENCES call_trees(id_call_tree), -- FK a call_trees.id_call_tree.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  last_review_date         DATE, -- Fecha de negocio.
  next_review_date         DATE, -- Fecha de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  CONSTRAINT ck_comm_scope_type CHECK (scope_type IN (
    'GLOBAL', 'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE',
    'PLAN', 'BIA', 'RIA', 'RISK', 'CONTROL', 'REFERENCE_CONTROL',
    'THREAT', 'VULNERABILITY', 'ASSET', 'SUPPLIER', 'LOCATION',
    'CONTACT', 'USER', 'INCIDENT', 'INCIDENT_REG_REPORT', 'CRISIS',
    'AUDIT', 'FINDING', 'FRAMEWORK', 'REQUIREMENT', 'COMPLIANCE',
    'TEST', 'EVIDENCE'
  ))
);
CREATE INDEX idx_comm_plan_org ON communication_plans(id_organization);
CREATE INDEX idx_comm_plan_scope ON communication_plans(scope_type, scope_id);

-- ============================================================================
-- [V11] NUEVA TABLA: communication_plan_channels
-- Tabla communication_plan_channels del modelo BCMS v11.
-- Descripcion: Canales de comunicacion o ejecucion asociados al plan.
-- ============================================================================
CREATE TABLE communication_plan_channels (
  id_comm_channel          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de communication_plan_channels.
  id_comm_plan             BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE, -- FK a communication_plans.id_comm_plan.
  channel_lu               BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  priority_order           INT DEFAULT 0, -- Atributo numerico entero de negocio.
  is_primary               BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  notes                    TEXT -- Descripcion u observaciones de negocio.
);
CREATE INDEX idx_comm_channel_plan ON communication_plan_channels(id_comm_plan);

-- ============================================================================
-- [V11] NUEVA TABLA: communication_plan_stakeholders
-- Tabla communication_plan_stakeholders del modelo BCMS v11.
-- Descripcion: Partes interesadas relacionadas con el modulo.
-- ============================================================================
CREATE TABLE communication_plan_stakeholders (
  id_comm_stakeholder      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de communication_plan_stakeholders.
  id_comm_plan             BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE, -- FK a communication_plans.id_comm_plan.
  stakeholder_type         VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  id_user                  BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  id_contact               BIGINT NULL REFERENCES contacts(id_contact), -- FK a contacts.id_contact.
  id_supplier              BIGINT NULL REFERENCES suppliers(id_supplier), -- FK a suppliers.id_supplier.
  external_name            VARCHAR(255), -- Atributo textual de negocio.
  external_email           VARCHAR(255), -- Atributo textual de negocio.
  external_phone           VARCHAR(30), -- Atributo textual de negocio.
  role_in_plan             VARCHAR(100), -- Atributo textual de negocio.
  required_ack             BOOLEAN DEFAULT FALSE, -- Indicador booleano de negocio.
  CONSTRAINT ck_comm_stakeholder_type CHECK (stakeholder_type IN ('USER', 'CONTACT', 'SUPPLIER', 'REGULATOR', 'PUBLIC', 'EXTERNAL'))
);
CREATE INDEX idx_comm_stakeholder_plan ON communication_plan_stakeholders(id_comm_plan);

-- ============================================================================
-- [V11] NUEVA TABLA: communication_messages
-- Tabla communication_messages del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo communication_messages.
-- ============================================================================
CREATE TABLE communication_messages (
  id_comm_message          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de communication_messages.
  id_comm_plan             BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE, -- FK a communication_plans.id_comm_plan.
  message_type             VARCHAR(20) NOT NULL, -- Atributo textual de negocio.
  template_title           VARCHAR(255), -- Atributo textual de negocio.
  template_body            TEXT, -- Atributo textual de negocio.
  language_code            VARCHAR(10) DEFAULT 'es', -- Codigo unico de negocio.
  channel_lu               BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  is_deleted               BOOLEAN DEFAULT FALSE, -- Soft delete.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  CONSTRAINT ck_comm_message_type CHECK (message_type IN ('INITIAL', 'UPDATE', 'STATUS', 'CLOSURE'))
);
CREATE INDEX idx_comm_message_plan ON communication_messages(id_comm_plan);

-- ============================================================================
-- [V11] NUEVA TABLA: communication_log
-- Tabla communication_log del modelo BCMS v11.
-- Descripcion: Bitacora de eventos y trazabilidad operativa del modulo.
-- ============================================================================
CREATE TABLE communication_log (
  id_comm_log              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de communication_log.
  id_comm_plan             BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE, -- FK a communication_plans.id_comm_plan.
  channel_lu               BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  recipient                VARCHAR(255), -- Atributo textual de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  sent_at                  TIMESTAMPTZ, -- Marca temporal de negocio.
  response_received_at     TIMESTAMPTZ, -- Marca temporal de negocio.
  notes                    TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now() -- Auditoria: fecha de creacion.
);
CREATE INDEX idx_comm_log_plan ON communication_log(id_comm_plan);

-- ############################################################################
-- FASE 23: PARTICIPANTES DE ACTIVIDADES (CAPACITACION/EJERCICIOS)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: activity_participants
-- Tabla activity_participants del modelo BCMS v11.
-- Descripcion: Tabla principal del modulo activity_participants.
-- ============================================================================
CREATE TABLE activity_participants (
  id_activity_participant  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de activity_participants.
  activity_type            VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  activity_id              BIGINT NOT NULL, -- Atributo numerico entero de negocio.
  participant_type         VARCHAR(20) NOT NULL, -- Atributo textual de negocio.
  id_user                  BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  id_contact               BIGINT NULL REFERENCES contacts(id_contact), -- FK a contacts.id_contact.
  external_name            VARCHAR(255), -- Atributo textual de negocio.
  external_email           VARCHAR(255), -- Atributo textual de negocio.
  external_phone           VARCHAR(30), -- Atributo textual de negocio.
  role                     VARCHAR(100), -- Atributo textual de negocio.
  attendance_status        VARCHAR(30), -- Atributo textual de negocio.
  score                    NUMERIC(5,2), -- Valor numerico de negocio.
  performance_notes        TEXT, -- Atributo textual de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_activity_type CHECK (activity_type IN ('PLAN_TEST', 'EXERCISE', 'INCIDENT', 'CRISIS', 'TRAINING')),
  CONSTRAINT ck_participant_type CHECK (participant_type IN ('USER', 'CONTACT', 'EXTERNAL'))
);
CREATE INDEX idx_activity_participant_activity ON activity_participants(activity_type, activity_id);
CREATE INDEX idx_activity_participant_user ON activity_participants(id_user);

-- ############################################################################
-- FASE 24: REVISION POR LA DIRECCION (ISO 9.3)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: management_reviews
-- Tabla management_reviews del modelo BCMS v11.
-- Descripcion: Revision por la direccion del desempeno BCMS (ISO 22301 9.3).
-- ============================================================================
CREATE TABLE management_reviews (
  id_review                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de management_reviews.
  review_code              VARCHAR(80) UNIQUE NOT NULL, -- Codigo unico de negocio.
  review_date              DATE NOT NULL, -- Fecha de negocio.
  period_start             DATE, -- Atributo de negocio.
  period_end               DATE, -- Atributo de negocio.
  scope_description        TEXT, -- Atributo textual de negocio.
  chair_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by               VARCHAR(255), -- Auditoria: usuario creador.
  updated_by               VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at               TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by               VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted               BOOLEAN DEFAULT FALSE -- Soft delete.
);
CREATE INDEX idx_review_date ON management_reviews(review_date);

-- ============================================================================
-- [V11] NUEVA TABLA: management_review_inputs
-- Tabla management_review_inputs del modelo BCMS v11.
-- Descripcion: Entradas/insumos del proceso del modulo.
-- ============================================================================
CREATE TABLE management_review_inputs (
  id_review_input          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de management_review_inputs.
  id_review                BIGINT NOT NULL REFERENCES management_reviews(id_review) ON DELETE CASCADE, -- FK a management_reviews.id_review.
  input_type               VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  entity_type              VARCHAR(50), -- Atributo textual de negocio.
  entity_id                BIGINT, -- Atributo numerico entero de negocio.
  summary                  TEXT, -- Descripcion u observaciones de negocio.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_review_input_type CHECK (input_type IN ('AUDIT', 'KPI', 'INCIDENT', 'EXERCISE', 'RISK', 'CHANGE', 'FEEDBACK', 'TEST', 'OTHER'))
);
CREATE INDEX idx_review_input_review ON management_review_inputs(id_review);

-- ============================================================================
-- [V11] NUEVA TABLA: management_review_outputs
-- Tabla management_review_outputs del modelo BCMS v11.
-- Descripcion: Resultados/salidas del proceso del modulo.
-- ============================================================================
CREATE TABLE management_review_outputs (
  id_review_output         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de management_review_outputs.
  id_review                BIGINT NOT NULL REFERENCES management_reviews(id_review) ON DELETE CASCADE, -- FK a management_reviews.id_review.
  decision_type            VARCHAR(30) NOT NULL, -- Atributo textual de negocio.
  description              TEXT, -- Descripcion u observaciones de negocio.
  owner_user_id            BIGINT NULL REFERENCES users(id_user), -- FK a users.id_user.
  due_date                 DATE, -- Fecha de negocio.
  status_lu                BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- FK a lookup_values.id_lookup_value.
  created_at               TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  CONSTRAINT ck_review_decision_type CHECK (decision_type IN ('ACTION', 'CHANGE', 'RESOURCE', 'POLICY', 'OTHER'))
);
CREATE INDEX idx_review_output_review ON management_review_outputs(id_review);

-- ############################################################################
-- FASE 25: APROBACIONES Y FIRMAS MULTIROL (V°B°)
-- ############################################################################

-- ============================================================================
-- [V11] NUEVA TABLA: entity_approvals
-- Tabla entity_approvals del modelo BCMS v11.
-- Descripcion: Flujo de aprobacion multirol para entidades versionadas.
-- ============================================================================
CREATE TABLE entity_approvals (
  id_entity_approval     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de la solicitud de aprobacion.
  approval_code          VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico de aprobacion (ej: APR-2026-0001).
  entity_type            VARCHAR(50) NOT NULL, -- Valores comunes: BIA/RIA/PLAN/POLICY/SCOPE/STRATEGY/CHANGE.
  entity_id              BIGINT NOT NULL, -- ID de la entidad objetivo segun entity_type.
  entity_version         INT, -- Version numerica de la entidad (cuando aplique).
  entity_version_label   VARCHAR(50), -- Etiqueta de version (ej: v1.0, 2026-Q1).
  id_organization        INT NULL REFERENCES organizations(id_organization), -- Organizacion duena del flujo de aprobacion.
  approval_scope         VARCHAR(50), -- Valores comunes: CREATION/UPDATE/REVIEW/PUBLICATION/CLOSURE.
  workflow_name          VARCHAR(100), -- Nombre de flujo (ej: STANDARD_2_STEP, COMITE_DIRECTIVO).
  current_step           INT DEFAULT 1, -- Paso actual del flujo.
  total_steps            INT DEFAULT 1, -- Total de pasos del flujo.
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado global de aprobacion (PENDING/APPROVED/REJECTED).
  requested_by           BIGINT NULL REFERENCES users(id_user), -- Usuario que inicia la solicitud de V°B°.
  requested_at           TIMESTAMPTZ DEFAULT now(), -- Fecha/hora de solicitud.
  due_at                 TIMESTAMPTZ, -- Fecha/hora objetivo de cierre.
  decided_at             TIMESTAMPTZ, -- Fecha/hora de resolucion final.
  final_decision_lu      BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Decision final consolidada.
  final_comment          TEXT, -- Comentario final de cierre de aprobacion.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ============================================================================
-- [V11] NUEVA TABLA: entity_approval_signatures
-- Tabla entity_approval_signatures del modelo BCMS v11.
-- Descripcion: Firmas/decisiones por paso dentro de un flujo de aprobacion.
-- ============================================================================
CREATE TABLE entity_approval_signatures (
  id_signature           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica de la firma/paso.
  id_entity_approval     BIGINT NOT NULL REFERENCES entity_approvals(id_entity_approval) ON DELETE CASCADE, -- FK a cabecera de aprobacion.
  step_order             INT NOT NULL, -- Orden del paso dentro del flujo.
  id_bcms_role           BIGINT NULL REFERENCES bcms_roles(id_bcms_role), -- Rol BCMS requerido para firmar (si aplica).
  required_user_id       BIGINT NULL REFERENCES users(id_user), -- Usuario esperado para firma nominal.
  signed_by              BIGINT NULL REFERENCES users(id_user), -- Usuario que firma efectivamente.
  signature_status_lu    BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado de firma (PENDING/SIGNED/REJECTED/SKIPPED).
  decision_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Decision del paso (APPROVE/REJECT/REQUEST_CHANGES).
  decision_comment       TEXT, -- Comentario de quien firma.
  signed_at              TIMESTAMPTZ, -- Fecha/hora de firma efectiva.
  is_required            BOOLEAN DEFAULT TRUE, -- true: paso obligatorio en el flujo.
  is_delegated           BOOLEAN DEFAULT FALSE, -- true: firma realizada por delegacion.
  delegated_from_user_id BIGINT NULL REFERENCES users(id_user), -- Usuario titular cuando hay delegacion.
  created_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de creacion.
  updated_at             TIMESTAMPTZ DEFAULT now(), -- Auditoria: fecha de actualizacion.
  created_by             VARCHAR(255), -- Auditoria: usuario creador.
  updated_by             VARCHAR(255), -- Auditoria: usuario actualizador.
  deleted_at             TIMESTAMPTZ, -- Auditoria: fecha de borrado logico.
  deleted_by             VARCHAR(255), -- Auditoria: usuario que elimina logicamente.
  is_deleted             BOOLEAN DEFAULT FALSE -- Soft delete.
);

-- ############################################################################
-- RESUMEN DE CAMBIOS V9 -> V10
-- ############################################################################
-- NUEVAS AREAS:
-- - Gobierno BCMS: contexto, stakeholders, alcance, politicas, objetivos, estrategias
-- - Contact links: asociaciones polimorficas de contactos
-- - RACI BCMS: roles, asignaciones y matriz RACI
-- - Planes de comunicacion: canales, stakeholders, mensajes y log
-- - Participantes de actividades: soporte a capacitacion y ejercicios
-- - Revision por la direccion: inputs y outputs formales
-- - Aprobaciones/Firmas multirol: entity_approvals + entity_approval_signatures
-- - Trazabilidad regulatoria de incidentes: incident_regulatory_reports (Ley 21.663)
COMMIT;


