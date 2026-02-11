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
-- █                    CHANGELOG DETALLADO V7 → V8                           █
-- ████████████████████████████████████████████████████████████████████████████
--
-- ============================================================================
-- TABLAS NUEVAS EN V8 (+27 tablas)
-- ============================================================================
-- 
-- [V7→V8] NUEVA: activation_criteria      - Criterios de activación de planes
-- [V7→V8] NUEVA: asset_vulnerabilities    - N:M activos ↔ vulnerabilidades
-- [V7→V8] NUEVA: audit_logs               - Log de auditoría (renombrada de audit_log)
-- [V7→V8] NUEVA: audit_scope_items        - Alcance de auditorías
-- [V7→V8] NUEVA: bcms_changes             - Gestión de cambios al SGCN (ISO 22301 cláusula 6.3)
-- [V7→V8] NUEVA: call_tree_nodes          - Nodos de árbol de llamadas
-- [V7→V8] NUEVA: call_trees               - Árboles de llamadas de emergencia
-- [V7→V8] NUEVA: compliance_assessments   - Evaluaciones de cumplimiento
-- [V7→V8] NUEVA: control_compliance_mapping - Mapeo controles ↔ requisitos
-- [V7→V8] NUEVA: crisis_actions           - Acciones durante crisis
-- [V7→V8] NUEVA: crisis_declarations      - Declaraciones de crisis (renombrada de crises)
-- [V7→V8] NUEVA: entity_tags              - Asignación polimórfica de tags
-- [V7→V8] NUEVA: evidence_versions        - Versionado de evidencias
-- [V7→V8] NUEVA: finding_actions          - Acciones correctivas de hallazgos
-- [V7→V8] NUEVA: incident_impacts         - Impactos de incidentes
-- [V7→V8] NUEVA: lessons_learned          - Lecciones aprendidas (mejora continua ISO 22301 cláusula 10.2)
-- [V7→V8] NUEVA: notifications            - Sistema de notificaciones
-- [V7→V8] NUEVA: plan_sections            - Secciones de planes de continuidad
-- [V7→V8] NUEVA: plan_tests               - Pruebas de planes (renombrada de exercises)
-- [V7→V8] NUEVA: recovery_procedures      - Procedimientos de recuperación
-- [V7→V8] NUEVA: recovery_strategies      - Estrategias de recuperación
-- [V7→V8] NUEVA: reference_control_requirement_mapping - N:M ref_controls ↔ requirements
-- [V7→V8] NUEVA: requirement_evaluations  - Evaluaciones de requisitos
-- [V7→V8] NUEVA: risk_threat_mapping      - N:M riesgos ↔ amenazas
-- [V7→V8] NUEVA: tags                     - Catálogo de etiquetas
-- [V7→V8] NUEVA: threats                  - Catálogo de amenazas
-- [V7→V8] NUEVA: vulnerabilities          - Registro de vulnerabilidades
--
-- ============================================================================
-- TABLAS ELIMINADAS DE V7 (-24 tablas) - CONSOLIDADAS O REFACTORIZADAS
-- ============================================================================
--
-- [V7→V8] ELIMINADA: action_item_links    → Absorbida por entity_tags
-- [V7→V8] ELIMINADA: action_items         → Absorbida por finding_actions/crisis_actions
-- [V7→V8] ELIMINADA: attachments          → Unificada en evidences
-- [V7→V8] ELIMINADA: audit_log            → Renombrada a audit_logs
-- [V7→V8] ELIMINADA: comments             → Usar campo notes en cada entidad
-- [V7→V8] ELIMINADA: control_requirement_mapping → Renombrada a control_compliance_mapping
-- [V7→V8] ELIMINADA: crises               → Renombrada a crisis_declarations
-- [V7→V8] ELIMINADA: crisis_decisions     → Absorbida por crisis_actions
-- [V7→V8] ELIMINADA: crisis_team          → Usar call_trees + contacts
-- [V7→V8] ELIMINADA: document_versions    → Reemplazada por evidence_versions
-- [V7→V8] ELIMINADA: documents            → Unificada en evidences
-- [V7→V8] ELIMINADA: evidence_links       → Usar entity_type/entity_id en evidences
-- [V7→V8] ELIMINADA: exercise_participants → Absorbida en plan_tests.participants
-- [V7→V8] ELIMINADA: exercises            → Renombrada a plan_tests
-- [V7→V8] ELIMINADA: incident_affected_assets → Usar evidences con entity_type=INCIDENT
-- [V7→V8] ELIMINADA: incident_affected_processes → Usar incident.target_process_type + target_process_id
-- [V7→V8] ELIMINADA: incident_plan_activations → Usar crisis_declarations.activated_plan_id
-- [V7→V8] ELIMINADA: plan_covered_processes → Usar target_process_id en continuity_plans
-- [V7→V8] ELIMINADA: plan_procedures      → Absorbida por recovery_procedures
-- [V7→V8] ELIMINADA: plan_resources       → Campo en recovery_strategies
-- [V7→V8] ELIMINADA: process_assets       → Usar assets.id_organization + proceso
-- [V7→V8] ELIMINADA: process_suppliers    → Usar process_dependencies con dependency_entity_type='SUPPLIER'
-- [V7→V8] ELIMINADA: supplier_contacts    → Usar contacts.id_supplier
-- [V7→V8] ELIMINADA: training_campaigns   → Fuera de alcance BCMS core
-- [V7→V8] ELIMINADA: training_records     → Fuera de alcance BCMS core
--
-- ============================================================================
-- TABLAS MODIFICADAS (3 tablas)
-- ============================================================================
--
-- [V7→V8] MODIFICADA: contacts
--         + id_organization FK (nuevo campo para vincular a organización)
--
-- [V7→V8] MODIFICADA: evidences (EXPANSIÓN MAYOR)
--         + evidence_code     (código único)
--         + title             (título descriptivo)
--         + description       (descripción extendida)
--         + status_lu         (estado del ciclo de vida)
--         + valid_from        (fecha inicio validez)
--         + valid_until       (fecha fin validez)
--
-- [V7→V8] MODIFICADA: findings
--         + id_ref_control FK (referencia a control de catálogo)
--
-- ============================================================================
-- VISTAS NUEVAS (+2)
-- ============================================================================
--
-- [V7→V8] NUEVA VISTA: v_evidences_status  - Estado de evidencias por entidad
-- [V7→V8] NUEVA VISTA: v_threats_with_risks - Amenazas con riesgos asociados
--
-- ============================================================================
-- RESUMEN ESTADÍSTICO
-- ============================================================================
--
-- V7: 70 tablas + 4 vistas
-- V8: 69 tablas + 6 vistas
--     (+25 nuevas, -26 eliminadas, 3 modificadas)
--
-- ████████████████████████████████████████████████████████████████████████████

BEGIN;

-- ############################################################################
-- FASE 1: ORGANIZATIONS JERÁRQUICA (SINGLE-TENANT)
-- ############################################################################
-- Sin cambios respecto a v7

CREATE TABLE organizations (
  id_organization        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_parent_org          INT NULL REFERENCES organizations(id_organization) ON DELETE RESTRICT,
  code                   VARCHAR(50) UNIQUE NOT NULL,
  name                   VARCHAR(255) NOT NULL,
  legal_name             VARCHAR(255),
  tax_id                 VARCHAR(100) UNIQUE,
  org_type               VARCHAR(50) NOT NULL DEFAULT 'COMPANY',
  industry               VARCHAR(200),
  country                VARCHAR(3),
  timezone               VARCHAR(80) DEFAULT 'America/Santiago',
  mission                TEXT,
  vision                 TEXT,
  description            TEXT,
  level                  INT DEFAULT 0,
  path                   VARCHAR(500),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
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
-- Sin cambios respecto a v7

CREATE TABLE application_settings (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  setting_key            VARCHAR(100) UNIQUE NOT NULL,
  setting_value          JSONB NOT NULL,
  setting_type           VARCHAR(50) NOT NULL,
  description            TEXT,
  is_system              BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_setting_type CHECK (setting_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY', 'DATE'))
);

CREATE TABLE lookup_sets (
  id_lookup_set          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code                   VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  is_system              BOOLEAN DEFAULT FALSE
);

CREATE TABLE lookup_values (
  id_lookup_value        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_lookup_set          BIGINT NOT NULL REFERENCES lookup_sets(id_lookup_set) ON DELETE CASCADE,
  code                   VARCHAR(80) NOT NULL,
  label                  VARCHAR(255) NOT NULL,
  sort_order             INT DEFAULT 0,
  is_deleted             BOOLEAN DEFAULT FALSE,
  color_hex              CHAR(7),
  icon_name              VARCHAR(100),
  parent_id              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
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
CREATE TABLE macroprocesses (
  id_macroprocess        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  category               VARCHAR(100),
  expiration_date        DATE,
  created_at             TIMESTAMP DEFAULT now(),
  updated_at             TIMESTAMP DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMP,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_macro_not_deleted ON macroprocesses(is_deleted) WHERE is_deleted = FALSE;

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
CREATE TABLE processes (
  id_process             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_macroprocess        INT NOT NULL REFERENCES macroprocesses(id_macroprocess),
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  platform               VARCHAR(255),
  created_at             TIMESTAMP DEFAULT now(),
  updated_at             TIMESTAMP DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMP,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_proc_macro ON processes(id_macroprocess);
CREATE INDEX idx_proc_not_deleted ON processes(is_deleted) WHERE is_deleted = FALSE;

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
CREATE TABLE subprocesses (
  id_subprocess          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_process             INT NOT NULL REFERENCES processes(id_process),
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  platform               VARCHAR(255),
  created_at             TIMESTAMP DEFAULT now(),
  updated_at             TIMESTAMP DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMP,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_subproc_proc ON subprocesses(id_process);
CREATE INDEX idx_subproc_not_deleted ON subprocesses(is_deleted) WHERE is_deleted = FALSE;

-- [V9 LEGACY] Estructura idéntica al sistema B-GRC legacy
CREATE TABLE procedures (
  id_procedure           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_subprocess          INT NOT NULL REFERENCES subprocesses(id_subprocess),
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  platform               VARCHAR(255),
  created_at             TIMESTAMP DEFAULT now(),
  updated_at             TIMESTAMP DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMP,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_procedure_subproc ON procedures(id_subprocess);
CREATE INDEX idx_procedure_not_deleted ON procedures(is_deleted) WHERE is_deleted = FALSE;

-- ############################################################################
-- FASE 4: TABLAS INTERMEDIAS ORGANIZATION-PROCESS
-- ############################################################################
-- Sin cambios respecto a v7

CREATE TABLE organization_macroprocess (
  id_org_macro           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  id_macroprocess        INT NOT NULL REFERENCES macroprocesses(id_macroprocess),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_org_macro UNIQUE (id_organization, id_macroprocess)
);

CREATE TABLE organization_process (
  id_org_process         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  id_process             INT NOT NULL REFERENCES processes(id_process),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_org_process UNIQUE (id_organization, id_process)
);

CREATE TABLE organization_subprocess (
  id_org_subprocess      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  id_subprocess          INT NOT NULL REFERENCES subprocesses(id_subprocess),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_org_subprocess UNIQUE (id_organization, id_subprocess)
);

CREATE TABLE organization_procedure (
  id_org_procedure       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  id_procedure           INT NOT NULL REFERENCES procedures(id_procedure),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_org_procedure UNIQUE (id_organization, id_procedure)
);

CREATE INDEX idx_orgmacro_org ON organization_macroprocess(id_organization);
CREATE INDEX idx_orgproc_org ON organization_process(id_organization);
CREATE INDEX idx_orgproc_proc ON organization_process(id_process);

-- ############################################################################
-- FASE 5: USUARIOS Y RBAC
-- ############################################################################
-- Sin cambios respecto a v7

CREATE TABLE users (
  id_user                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email                  VARCHAR(255) NOT NULL UNIQUE,
  password_hash          VARCHAR(255),
  full_name              VARCHAR(255),
  id_primary_org         INT NULL REFERENCES organizations(id_organization),
  status                 VARCHAR(30) DEFAULT 'ACTIVE',
  mfa_enabled            BOOLEAN DEFAULT FALSE,
  last_login_at          TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  CONSTRAINT ck_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED'))
);
CREATE INDEX idx_users_email ON users(email) WHERE status = 'ACTIVE';
CREATE INDEX idx_users_org ON users(id_primary_org);

CREATE TABLE roles (
  id_role                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code                   VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  permissions            JSONB NOT NULL DEFAULT '{}',
  is_builtin             BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE permissions (
  id_permission          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code                   VARCHAR(120) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  module                 VARCHAR(100)
);

CREATE TABLE role_permissions (
  id_role_permission     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_role                BIGINT NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE,
  id_permission          BIGINT NOT NULL REFERENCES permissions(id_permission),
  CONSTRAINT uq_role_perm UNIQUE (id_role, id_permission)
);

CREATE TABLE user_role_assignments (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_user                BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  id_role                BIGINT NOT NULL REFERENCES roles(id_role),
  id_organization        INT NULL REFERENCES organizations(id_organization),
  is_recursive           BOOLEAN DEFAULT FALSE,
  permissions_override   JSONB,
  valid_from             TIMESTAMPTZ DEFAULT now(),
  valid_until            TIMESTAMPTZ,
  created_by             BIGINT NULL REFERENCES users(id_user),
  CONSTRAINT uq_user_role UNIQUE (id_user, id_role, id_organization)
);

-- ############################################################################
-- FASE 6: PERFIL BCMS COMÚN POR NIVEL DE PROCESO
-- ############################################################################
-- Consolidación de tablas *_bcms en un único perfil de continuidad.

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
-- Sin cambios respecto a v7

CREATE TABLE reference_controls (
  id_ref_control         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  control_code           VARCHAR(80) UNIQUE NOT NULL,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  control_type           VARCHAR(50),
  implementation_guidance TEXT,
  is_system_control      BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);

CREATE TABLE applied_controls (
  id_control             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_ref_control         BIGINT NULL REFERENCES reference_controls(id_ref_control),
  control_code           VARCHAR(80) NOT NULL UNIQUE,
  control_name           VARCHAR(255) NOT NULL,
  description            TEXT,
  control_type           VARCHAR(50),
  target_process_type    VARCHAR(30) NOT NULL,
  target_process_id      INT,
  implementation_status  VARCHAR(30),
  effectiveness_rating   VARCHAR(20),
  test_frequency         VARCHAR(50),
  last_test_date         DATE,
  next_test_date         DATE,
  last_test_result       TEXT,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  responsible_organization_id INT NULL REFERENCES organizations(id_organization),
  linked_requirements    JSONB,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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
-- [V7→V8] NUEVA TABLA: threats
-- [V7→V8] NUEVA TABLA: risk_threat_mapping
-- [V7→V8] NUEVA TABLA: vulnerabilities
-- [V7→V8] NUEVA TABLA: asset_vulnerabilities

-- ============================================================================
-- [V7→V8] NUEVA TABLA: threats
-- Catálogo de amenazas (patrón CISO Assistant: Threat)
-- ============================================================================
CREATE TABLE threats (
  id_threat              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  threat_code            VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  threat_category_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  threat_source_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  base_likelihood_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  base_impact_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  external_reference     VARCHAR(255),
  reference_url          TEXT,
  is_deleted             BOOLEAN DEFAULT FALSE,
  is_system_threat       BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             BIGINT NULL REFERENCES users(id_user),
  updated_by             BIGINT NULL REFERENCES users(id_user),
  deleted_at             TIMESTAMPTZ,
  deleted_by             BIGINT NULL REFERENCES users(id_user)
);
CREATE INDEX idx_threats_category ON threats(threat_category_lu);
CREATE INDEX idx_threats_active ON threats(is_deleted) WHERE is_deleted = FALSE;

-- risks (sin cambios respecto a v7)
CREATE TABLE risks (
  id_risk                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  risk_code              VARCHAR(80) NOT NULL UNIQUE,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  risk_domain            VARCHAR(20) NOT NULL,
  risk_scope             VARCHAR(30) NOT NULL,
  target_process_type    VARCHAR(30) NOT NULL,
  target_process_id      INT,
  scenario               TEXT,
  cause                  TEXT,
  effect                 TEXT,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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
-- [V7→V8] NUEVA TABLA: risk_threat_mapping
-- Relación N:M entre risks y threats
-- ============================================================================
CREATE TABLE risk_threat_mapping (
  id_risk_threat         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_risk                BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE,
  id_threat              BIGINT NOT NULL REFERENCES threats(id_threat) ON DELETE CASCADE,
  relevance_level        VARCHAR(20),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_risk_threat UNIQUE (id_risk, id_threat),
  CONSTRAINT ck_relevance CHECK (relevance_level IN ('HIGH', 'MEDIUM', 'LOW'))
);
CREATE INDEX idx_risk_threat_risk ON risk_threat_mapping(id_risk);
CREATE INDEX idx_risk_threat_threat ON risk_threat_mapping(id_threat);

-- ============================================================================
-- [V7→V8] NUEVA TABLA: vulnerabilities
-- Registro de vulnerabilidades técnicas (patrón CISO Assistant)
-- ============================================================================
CREATE TABLE vulnerabilities (
  id_vulnerability       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vulnerability_code     VARCHAR(80) NOT NULL UNIQUE,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  severity_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  vulnerability_type_lu  BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  cve_id                 VARCHAR(50),
  cvss_score             NUMERIC(3,1),
  external_reference     TEXT,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  discovered_at          TIMESTAMPTZ,
  remediated_at          TIMESTAMPTZ,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_vuln_severity ON vulnerabilities(severity_lu);
CREATE INDEX idx_vuln_status ON vulnerabilities(status_lu);
CREATE INDEX idx_vuln_cve ON vulnerabilities(cve_id) WHERE cve_id IS NOT NULL;

-- risk_assessments (sin cambios respecto a v7)
CREATE TABLE risk_assessments (
  id_risk_assessment     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_risk                BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE,
  assessment_type        VARCHAR(20) NOT NULL,
  assessed_at            TIMESTAMPTZ DEFAULT now(),
  assessed_by            BIGINT NULL REFERENCES users(id_user),
  likelihood_lu          BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  impact_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  risk_score             NUMERIC(10,2),
  financial_exposure     NUMERIC(15,2),
  treatment_decision     VARCHAR(50),
  comments               TEXT,
  CONSTRAINT ck_assessment_type CHECK (assessment_type IN ('INHERENT', 'RESIDUAL', 'TARGET'))
);

-- risk_control_mapping (sin cambios respecto a v7)
CREATE TABLE risk_control_mapping (
  id_risk_control        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_risk                BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE,
  id_control             BIGINT NOT NULL REFERENCES applied_controls(id_control),
  mitigation_effect      VARCHAR(50),
  effectiveness_pct      INT,
  is_key_control         BOOLEAN DEFAULT FALSE,
  CONSTRAINT uq_risk_control UNIQUE (id_risk, id_control),
  CONSTRAINT ck_effect_pct CHECK (effectiveness_pct >= 0 AND effectiveness_pct <= 100)
);

-- risk_treatments (sin cambios respecto a v7)
CREATE TABLE risk_treatments (
  id_risk_treatment      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_risk                BIGINT NOT NULL REFERENCES risks(id_risk) ON DELETE CASCADE,
  id_plan                BIGINT,
  treatment_type         VARCHAR(50),
  description            TEXT NOT NULL,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  due_date               DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_treatment_type CHECK (treatment_type IN ('MITIGATE', 'TRANSFER', 'ACCEPT', 'AVOID'))
);

-- ############################################################################
-- FASE 9: BIA (Business Impact Analysis)
-- ############################################################################
-- Sin cambios respecto a v7

-- bia_assessments
CREATE TABLE bia_assessments (
  id_bia                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bia_code               VARCHAR(80) NOT NULL UNIQUE,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  scope                  VARCHAR(30) NOT NULL,
  target_process_type    VARCHAR(30) NOT NULL,
  target_process_id      INT NOT NULL,
  assessment_date        DATE NOT NULL,
  reviewed_by            BIGINT NULL REFERENCES users(id_user),
  version                INT DEFAULT 1,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_bia_scope CHECK (scope IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE')),
  CONSTRAINT ck_bia_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE')),
  CONSTRAINT ck_bia_scope_target_match CHECK (target_process_type = scope)
);
CREATE INDEX idx_bia_org ON bia_assessments(id_organization);
CREATE INDEX idx_bia_target_process ON bia_assessments(target_process_id);

-- bia_impacts
CREATE TABLE bia_impacts (
  id_bia_impact          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_bia                 BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE,
  impact_category_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  hours_to_impact        INT,
  severity_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  financial_estimate     NUMERIC(15,2),
  description            TEXT
);
CREATE INDEX idx_bia_impact_bia ON bia_impacts(id_bia);

-- bia_objectives (RTO, RPO, MTPD, MBCO)
CREATE TABLE bia_objectives (
  id_bia_objective       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_bia                 BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE,
  objective_type         VARCHAR(10) NOT NULL,
  value_hours            INT,
  justification          TEXT,
  CONSTRAINT ck_obj_type CHECK (objective_type IN ('RTO', 'RPO', 'MTPD', 'MBCO'))
);
CREATE INDEX idx_bia_obj_bia ON bia_objectives(id_bia);

-- ############################################################################
-- FASE 9B: ESCENARIOS DE DISRUPCIÓN Y RIA
-- ############################################################################

CREATE TABLE disruption_scenarios (
  id_scenario            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  scenario_code          VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  scenario_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  is_system_scenario     BOOLEAN DEFAULT FALSE,
  sort_order             INT DEFAULT 0,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255)
);
CREATE INDEX idx_scenario_org ON disruption_scenarios(id_organization);
CREATE INDEX idx_scenario_type ON disruption_scenarios(scenario_type_lu);
CREATE INDEX idx_scenario_active ON disruption_scenarios(is_deleted) WHERE is_deleted = FALSE;

CREATE TABLE time_buckets (
  id_time_bucket         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket_code            VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  start_minutes          INT NOT NULL,
  end_minutes            INT NOT NULL,
  sort_order             INT DEFAULT 0,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  is_system_bucket       BOOLEAN DEFAULT FALSE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  CONSTRAINT ck_time_bucket_range CHECK (end_minutes >= start_minutes)
);
CREATE INDEX idx_timebucket_org ON time_buckets(id_organization);
CREATE INDEX idx_timebucket_status ON time_buckets(status_lu);

CREATE TABLE impact_types (
  id_impact_type         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  impact_code            VARCHAR(80) NOT NULL UNIQUE,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  sort_order             INT DEFAULT 0,
  is_system_type         BOOLEAN DEFAULT FALSE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255)
);
CREATE INDEX idx_impacttype_org ON impact_types(id_organization);
CREATE INDEX idx_impacttype_status ON impact_types(status_lu);

CREATE TABLE bia_impact_matrix (
  id_bia_impact          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_bia                 BIGINT NOT NULL REFERENCES bia_assessments(id_bia) ON DELETE CASCADE,
  id_scenario            BIGINT NOT NULL REFERENCES disruption_scenarios(id_scenario),
  id_time_bucket         BIGINT NOT NULL REFERENCES time_buckets(id_time_bucket),
  id_impact_type         BIGINT NOT NULL REFERENCES impact_types(id_impact_type),
  selected_level_lu      BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  id_organization        INT NULL REFERENCES organizations(id_organization),
  is_system_bucket       BOOLEAN DEFAULT FALSE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  CONSTRAINT uq_bia_impact_matrix UNIQUE (id_bia, id_scenario, id_time_bucket, id_impact_type)
);
CREATE INDEX idx_bia_matrix_bia ON bia_impact_matrix(id_bia);
CREATE INDEX idx_bia_matrix_scenario ON bia_impact_matrix(id_scenario);
CREATE INDEX idx_bia_matrix_time_bucket ON bia_impact_matrix(id_time_bucket);
CREATE INDEX idx_bia_matrix_impact_type ON bia_impact_matrix(id_impact_type);

CREATE TABLE ria_assessments (
  id_ria                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ria_code               VARCHAR(80) NOT NULL UNIQUE,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  target_process_type    VARCHAR(30) NOT NULL,
  target_process_id      INT NOT NULL,
  id_bia                 BIGINT NULL REFERENCES bia_assessments(id_bia),
  assessment_date        DATE NOT NULL,
  version                INT DEFAULT 1,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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

CREATE TABLE process_dependencies (
  id_process_dependency  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  target_process_type    VARCHAR(30) NOT NULL,
  target_process_id      INT NOT NULL,
  dependency_type_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  dependency_entity_type VARCHAR(30) NOT NULL,
  dependency_entity_id   BIGINT NOT NULL,
  criticality_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_dep_target_process_type CHECK (target_process_type IN ('MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE')),
  CONSTRAINT ck_dep_entity_type CHECK (dependency_entity_type IN ('PROCESS', 'SUBPROCESS', 'PROCEDURE', 'SUPPLIER', 'ASSET', 'APPLICATION', 'PERSONNEL', 'LOCATION'))
);
CREATE INDEX idx_procdep_org ON process_dependencies(id_organization);
CREATE INDEX idx_procdep_target ON process_dependencies(target_process_type, target_process_id);
CREATE INDEX idx_procdep_entity ON process_dependencies(dependency_entity_type, dependency_entity_id);

-- bia_dependency_assessments
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
-- [V7→V8] MODIFICACIÓN: contacts - SE AGREGA id_organization FK

-- locations (sin cambios respecto a v7)
CREATE TABLE locations (
  id_location            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  location_code          VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  location_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  address_line1          VARCHAR(255),
  address_line2          VARCHAR(255),
  city                   VARCHAR(100),
  region_state           VARCHAR(100),
  postal_code            VARCHAR(30),
  country_code           CHAR(2),
  gps_lat                NUMERIC(10,7),
  gps_lon                NUMERIC(10,7),
  capacity_persons       INT,
  is_primary             BOOLEAN DEFAULT FALSE,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  parent_location_id     BIGINT NULL REFERENCES locations(id_location),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_location_org ON locations(id_organization);
CREATE INDEX idx_location_parent ON locations(parent_location_id) WHERE parent_location_id IS NOT NULL;

-- assets (sin cambios respecto a v7)
CREATE TABLE assets (
  id_asset               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_code             VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  asset_category_lu      BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  asset_type_lu          BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  description            TEXT,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  id_location            BIGINT NULL REFERENCES locations(id_location),
  criticality_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  value_amount           NUMERIC(15,2),
  currency_code          CHAR(3),
  acquisition_date       DATE,
  vendor_name            VARCHAR(255),
  serial_number          VARCHAR(255),
  metadata               JSONB,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_asset_cat ON assets(asset_category_lu);
CREATE INDEX idx_asset_owner ON assets(owner_user_id);
CREATE INDEX idx_asset_loc ON assets(id_location);
CREATE INDEX idx_asset_org ON assets(id_organization);

-- ============================================================================
-- [V7→V8] NUEVA TABLA: asset_vulnerabilities
-- Relación N:M entre assets y vulnerabilities
-- ============================================================================
CREATE TABLE asset_vulnerabilities (
  id_asset_vulnerability BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_asset               BIGINT NOT NULL REFERENCES assets(id_asset) ON DELETE CASCADE,
  id_vulnerability       BIGINT NOT NULL REFERENCES vulnerabilities(id_vulnerability) ON DELETE CASCADE,
  detection_date         TIMESTAMPTZ DEFAULT now(),
  remediation_due_date   DATE,
  remediation_status_lu  BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_asset_vuln UNIQUE (id_asset, id_vulnerability)
);
CREATE INDEX idx_asset_vuln_asset ON asset_vulnerabilities(id_asset);
CREATE INDEX idx_asset_vuln_vuln ON asset_vulnerabilities(id_vulnerability);

-- suppliers (sin cambios respecto a v7)
CREATE TABLE suppliers (
  id_supplier            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  supplier_code          VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  supplier_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  tax_id                 VARCHAR(50),
  website                VARCHAR(255),
  address                TEXT,
  city                   VARCHAR(100),
  country_code           CHAR(2),
  risk_tier_lu           BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  criticality_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  contract_start         DATE,
  contract_end           DATE,
  sla_summary            TEXT,
  is_deleted             BOOLEAN DEFAULT FALSE,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255)
);
CREATE INDEX idx_supplier_org ON suppliers(id_organization);
CREATE INDEX idx_supplier_active ON suppliers(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================================
-- [V7→V8] MODIFICACIÓN: contacts
-- SE AGREGA: id_organization FK (nullable, para independizar de user)
-- ============================================================================
CREATE TABLE contacts (
  id_contact             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contact_code           VARCHAR(80) NOT NULL UNIQUE,
  first_name             VARCHAR(100) NOT NULL,
  last_name              VARCHAR(100) NOT NULL,
  email                  VARCHAR(255) NOT NULL,
  phone_primary          VARCHAR(30),
  phone_secondary        VARCHAR(30),
  mobile                 VARCHAR(30),
  job_title              VARCHAR(150),
  department             VARCHAR(150),
  -- [V7→V8] NUEVO CAMPO: id_organization para vincular contacto a organización
  id_organization        INT NULL REFERENCES organizations(id_organization),
  id_user                BIGINT NULL REFERENCES users(id_user),
  id_supplier            BIGINT NULL REFERENCES suppliers(id_supplier),
  contact_role_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  is_emergency_contact   BOOLEAN DEFAULT FALSE,
  is_deleted             BOOLEAN DEFAULT FALSE,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255)
);
-- [V7→V8] NUEVO ÍNDICE por organización
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
-- Sin cambios respecto a v7

-- continuity_plans
CREATE TABLE continuity_plans (
  id_plan                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_code              VARCHAR(80) NOT NULL UNIQUE,
  plan_type              VARCHAR(30) NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  version_label          VARCHAR(50),
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  scope_description      TEXT,
  target_process_type    VARCHAR(30) NOT NULL,
  target_process_id      INT,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  effective_date         DATE,
  next_review_date       DATE,
  version                INT DEFAULT 1,
  id_scenario            BIGINT NULL REFERENCES disruption_scenarios(id_scenario),
  approved_by            BIGINT NULL REFERENCES users(id_user),
  approved_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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
CREATE TABLE plan_sections (
  id_section             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_plan                BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE,
  section_order          INT NOT NULL,
  section_title          VARCHAR(255) NOT NULL,
  section_content        TEXT,
  is_mandatory           BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_section_plan ON plan_sections(id_plan);

-- activation_criteria
CREATE TABLE activation_criteria (
  id_criterion           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_plan                BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE,
  criterion_code         VARCHAR(80) NOT NULL,
  description            TEXT NOT NULL,
  threshold_value        VARCHAR(255),
  severity_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  is_auto_activate       BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_actcrit_plan ON activation_criteria(id_plan);

-- recovery_strategies
CREATE TABLE recovery_strategies (
  id_strategy            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_plan                BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE,
  strategy_name          VARCHAR(255) NOT NULL,
  description            TEXT,
  rto_hours              INT,
  rpo_hours              INT,
  estimated_cost         NUMERIC(15,2),
  resource_requirements  TEXT,
  dependencies           TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_recstrat_plan ON recovery_strategies(id_plan);

-- recovery_procedures
CREATE TABLE recovery_procedures (
  id_procedure_rec       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_strategy            BIGINT NOT NULL REFERENCES recovery_strategies(id_strategy) ON DELETE CASCADE,
  step_order             INT NOT NULL,
  step_title             VARCHAR(255) NOT NULL,
  step_description       TEXT,
  responsible_role_id    BIGINT NULL REFERENCES roles(id_role),
  estimated_duration_min INT,
  dependencies           TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_recproc_strat ON recovery_procedures(id_strategy);

-- call_trees
CREATE TABLE call_trees (
  id_call_tree           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_plan                BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE,
  tree_name              VARCHAR(255) NOT NULL,
  root_contact_id        BIGINT NULL REFERENCES contacts(id_contact),
  description            TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_calltree_plan ON call_trees(id_plan);

-- call_tree_nodes
CREATE TABLE call_tree_nodes (
  id_node                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_call_tree           BIGINT NOT NULL REFERENCES call_trees(id_call_tree) ON DELETE CASCADE,
  id_contact             BIGINT NOT NULL REFERENCES contacts(id_contact),
  parent_node_id         BIGINT NULL REFERENCES call_tree_nodes(id_node),
  node_order             INT NOT NULL,
  escalation_wait_min    INT DEFAULT 15,
  notes                  TEXT
);
CREATE INDEX idx_ctnode_tree ON call_tree_nodes(id_call_tree);
CREATE INDEX idx_ctnode_parent ON call_tree_nodes(parent_node_id) WHERE parent_node_id IS NOT NULL;

-- plan_tests
CREATE TABLE plan_tests (
  id_test                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_plan                BIGINT NOT NULL REFERENCES continuity_plans(id_plan) ON DELETE CASCADE,
  test_code              VARCHAR(80) NOT NULL UNIQUE,
  test_type              VARCHAR(50) NOT NULL,
  test_date              DATE NOT NULL,
  maturity_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  result_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  scope_description      TEXT,
  participants           TEXT,
  objectives             TEXT,
  results_summary        TEXT,
  success_rate_pct       INT,
  issues_found           TEXT,
  recommendations        TEXT,
  conducted_by           BIGINT NULL REFERENCES users(id_user),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_test_type CHECK (test_type IN ('TABLETOP', 'WALKTHROUGH', 'SIMULATION', 'FULL_EXERCISE', 'TECHNICAL_TEST'))
);
CREATE INDEX idx_plantest_plan ON plan_tests(id_plan);
CREATE INDEX idx_plantest_date ON plan_tests(test_date);

CREATE TABLE ria_items (
  id_ria_item            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_ria                 BIGINT NOT NULL REFERENCES ria_assessments(id_ria) ON DELETE CASCADE,
  item_no                INT NOT NULL,
  loss_risk_text         TEXT,
  activity_text          TEXT,
  basel_loss_type        TEXT,
  risk_factor_text       TEXT,
  risk_factor_specific_text TEXT,
  id_plan                BIGINT NULL REFERENCES continuity_plans(id_plan),
  id_scenario            BIGINT NULL REFERENCES disruption_scenarios(id_scenario),
  impact_type            BIGINT NULL REFERENCES impact_types(id_impact_type),
  id_risk                BIGINT NULL REFERENCES risks(id_risk),
  max_impact_24h_lu      BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  probability_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  control_effect_lu      BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  impact_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  inherent_risk_score    NUMERIC(10,2),
  residual_risk_score    NUMERIC(10,2),
  beta_factor            NUMERIC(10,4),
  residual_with_beta     NUMERIC(10,2),
  residual_final_score   NUMERIC(10,2),
  response_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  response_notes         TEXT,
  observations           TEXT,
  contingency_desc       TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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
-- Sin cambios respecto a v7

-- incidents
CREATE TABLE incidents (
  id_incident            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  incident_code          VARCHAR(80) NOT NULL UNIQUE,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  incident_type_lu       BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  severity_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  source_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  reported_at            TIMESTAMPTZ DEFAULT now(),
  reported_by            BIGINT NULL REFERENCES users(id_user),
  detected_at            TIMESTAMPTZ,
  acknowledged_at        TIMESTAMPTZ,
  resolved_at            TIMESTAMPTZ,
  closed_at              TIMESTAMPTZ,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  target_process_type    VARCHAR(30), -- Valores comunes: MACROPROCESS/PROCESS/SUBPROCESS/PROCEDURE.
  target_process_id      INT, -- ID del proceso objetivo segun target_process_type.
  affected_location_id   BIGINT NULL REFERENCES locations(id_location),
  impact_description     TEXT,
  root_cause             TEXT,
  resolution_summary     TEXT,
  lessons_learned        TEXT,
  assigned_to            BIGINT NULL REFERENCES users(id_user),
  is_regulatory_reportable BOOLEAN DEFAULT FALSE, -- true: incidente sujeto a notificacion regulatoria (Ley 21.663).
  regulatory_status_lu   BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado regulatorio consolidado (PENDING/REPORTED/CLOSED).
  regulatory_due_at      TIMESTAMPTZ, -- Proximo vencimiento regulatorio relevante del incidente.
  first_regulatory_reported_at TIMESTAMPTZ, -- Fecha de primer reporte regulatorio enviado.
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
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
CREATE TABLE incident_regulatory_reports (
  id_incident_reg_report BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- PK tecnica del caso regulatorio.
  reg_report_code        VARCHAR(80) NOT NULL UNIQUE, -- Codigo unico del caso (ej: REG-INC-2026-0001).
  id_incident            BIGINT NOT NULL REFERENCES incidents(id_incident) ON DELETE CASCADE, -- Incidente origen.
  id_organization        INT NOT NULL REFERENCES organizations(id_organization), -- Organizacion reportante.
  regulatory_framework   VARCHAR(80) DEFAULT 'LEY_21663', -- Marco regulatorio principal.
  reporting_authority    VARCHAR(100) NOT NULL, -- Autoridad destino (ej: ANCI/CSIRT_NACIONAL/CSIRT_SECTORIAL/CMF/OTRA).
  authority_reference    VARCHAR(255), -- Folio, ticket o referencia entregada por autoridad.
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value), -- Estado del caso regulatorio.
  current_stage          VARCHAR(30), -- Etapa actual: DRAFT/EARLY_ALERT/SECOND_REPORT/ACTION_PLAN/FINAL_REPORT/CLOSED.
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
  CONSTRAINT ck_reg_current_stage CHECK (current_stage IN ('DRAFT', 'EARLY_ALERT', 'SECOND_REPORT', 'ACTION_PLAN', 'FINAL_REPORT', 'PARTIAL_UPDATE', 'CLOSED'))
);
CREATE INDEX idx_increg_incident ON incident_regulatory_reports(id_incident);
CREATE INDEX idx_increg_org ON incident_regulatory_reports(id_organization);
CREATE INDEX idx_increg_status ON incident_regulatory_reports(status_lu) WHERE status_lu IS NOT NULL;
CREATE INDEX idx_increg_authority ON incident_regulatory_reports(reporting_authority);

-- incident_timeline
CREATE TABLE incident_timeline (
  id_timeline            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_incident            BIGINT NOT NULL REFERENCES incidents(id_incident) ON DELETE CASCADE,
  event_time             TIMESTAMPTZ NOT NULL,
  event_type             VARCHAR(50) NOT NULL,
  description            TEXT NOT NULL,
  actor_user_id          BIGINT NULL REFERENCES users(id_user),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_event_type CHECK (event_type IN ('DETECTION', 'NOTIFICATION', 'ESCALATION', 'ACTION', 'COMMUNICATION', 'RESOLUTION', 'CLOSURE', 'OTHER'))
);
CREATE INDEX idx_timeline_inc ON incident_timeline(id_incident);
CREATE INDEX idx_timeline_time ON incident_timeline(event_time);

-- incident_impacts
CREATE TABLE incident_impacts (
  id_impact              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_incident            BIGINT NOT NULL REFERENCES incidents(id_incident) ON DELETE CASCADE,
  impact_type_lu         BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  impact_area            VARCHAR(100),
  description            TEXT,
  financial_loss         NUMERIC(15,2),
  downtime_minutes       INT,
  affected_users_count   INT,
  created_at             TIMESTAMPTZ DEFAULT now()
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
CREATE TABLE crisis_declarations (
  id_crisis              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  crisis_code            VARCHAR(80) NOT NULL UNIQUE,
  id_incident            BIGINT NULL REFERENCES incidents(id_incident),
  declared_at            TIMESTAMPTZ DEFAULT now(),
  declared_by            BIGINT NULL REFERENCES users(id_user),
  crisis_level_lu        BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  activated_plan_id      BIGINT NULL REFERENCES continuity_plans(id_plan),
  command_center_location BIGINT NULL REFERENCES locations(id_location),
  ended_at               TIMESTAMPTZ,
  ended_by               BIGINT NULL REFERENCES users(id_user),
  post_crisis_review     TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_crisis_incident ON crisis_declarations(id_incident);
CREATE INDEX idx_crisis_status ON crisis_declarations(status_lu);

-- crisis_actions
CREATE TABLE crisis_actions (
  id_action              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_crisis              BIGINT NOT NULL REFERENCES crisis_declarations(id_crisis) ON DELETE CASCADE,
  action_order           INT NOT NULL,
  action_description     TEXT NOT NULL,
  assigned_to            BIGINT NULL REFERENCES users(id_user),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  priority_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  due_at                 TIMESTAMPTZ,
  completed_at           TIMESTAMPTZ,
  outcome                TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_crisisaction_crisis ON crisis_actions(id_crisis);

-- ############################################################################
-- FASE 13: COMPLIANCE / NORMATIVAS Y REQUISITOS
-- ############################################################################
-- [V7→V8] NUEVA TABLA: reference_control_requirement_mapping

-- frameworks (sin cambios respecto a v7)
CREATE TABLE frameworks (
  id_framework           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  framework_code         VARCHAR(80) NOT NULL UNIQUE,
  name                   VARCHAR(255) NOT NULL,
  version_label          VARCHAR(50),
  issuing_body           VARCHAR(255),
  description            TEXT,
  effective_date         DATE,
  is_deleted             BOOLEAN DEFAULT FALSE,
  metadata               JSONB,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255)
);

-- requirement_nodes (sin cambios respecto a v7)
CREATE TABLE requirement_nodes (
  id_requirement         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_framework           BIGINT NOT NULL REFERENCES frameworks(id_framework) ON DELETE CASCADE,
  parent_requirement_id  BIGINT NULL REFERENCES requirement_nodes(id_requirement),
  requirement_code       VARCHAR(80) NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  node_depth             INT DEFAULT 0,
  order_index            INT,
  is_assessable          BOOLEAN DEFAULT TRUE,
  maturity_target_lu     BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  metadata               JSONB,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_fw_req UNIQUE (id_framework, requirement_code)
);
CREATE INDEX idx_reqnode_parent ON requirement_nodes(parent_requirement_id);
CREATE INDEX idx_reqnode_fw ON requirement_nodes(id_framework);

-- ============================================================================
-- [V7→V8] NUEVA TABLA: reference_control_requirement_mapping
-- Relación N:M entre reference_controls y requirement_nodes
-- (Patrón CISO Assistant: ReferenceControl ↔ RequirementNode many-to-many)
-- ============================================================================
CREATE TABLE reference_control_requirement_mapping (
  id_mapping             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_ref_control         BIGINT NOT NULL REFERENCES reference_controls(id_ref_control) ON DELETE CASCADE,
  id_requirement         BIGINT NOT NULL REFERENCES requirement_nodes(id_requirement) ON DELETE CASCADE,
  coverage_level         VARCHAR(20),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_refctrl_req UNIQUE (id_ref_control, id_requirement),
  CONSTRAINT ck_coverage CHECK (coverage_level IN ('FULL', 'PARTIAL', 'MINIMAL'))
);
CREATE INDEX idx_refctrl_req_ctrl ON reference_control_requirement_mapping(id_ref_control);
CREATE INDEX idx_refctrl_req_req ON reference_control_requirement_mapping(id_requirement);

-- compliance_assessments (sin cambios respecto a v7)
CREATE TABLE compliance_assessments (
  id_assessment          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assessment_code        VARCHAR(80) NOT NULL UNIQUE,
  id_framework           BIGINT NOT NULL REFERENCES frameworks(id_framework),
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  assessment_date        DATE NOT NULL,
  scope_description      TEXT,
  lead_assessor_id       BIGINT NULL REFERENCES users(id_user),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  overall_score          NUMERIC(5,2),
  summary                TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_compl_fw ON compliance_assessments(id_framework);
CREATE INDEX idx_compl_org ON compliance_assessments(id_organization);

-- requirement_evaluations (sin cambios respecto a v7)
CREATE TABLE requirement_evaluations (
  id_evaluation          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_assessment          BIGINT NOT NULL REFERENCES compliance_assessments(id_assessment) ON DELETE CASCADE,
  id_requirement         BIGINT NOT NULL REFERENCES requirement_nodes(id_requirement),
  compliance_status_lu   BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  maturity_level_lu      BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  score                  NUMERIC(5,2),
  observations           TEXT,
  improvement_actions    TEXT,
  evaluated_by           BIGINT NULL REFERENCES users(id_user),
  evaluated_at           TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_assess_req UNIQUE (id_assessment, id_requirement)
);
CREATE INDEX idx_reqeval_assess ON requirement_evaluations(id_assessment);
CREATE INDEX idx_reqeval_req ON requirement_evaluations(id_requirement);

-- control_compliance_mapping (sin cambios respecto a v7)
CREATE TABLE control_compliance_mapping (
  id_mapping_cc          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_control             BIGINT NOT NULL REFERENCES applied_controls(id_control) ON DELETE CASCADE,
  id_requirement         BIGINT NOT NULL REFERENCES requirement_nodes(id_requirement) ON DELETE CASCADE,
  coverage_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_ctrl_req UNIQUE (id_control, id_requirement)
);
CREATE INDEX idx_ctrlcompl_ctrl ON control_compliance_mapping(id_control);
CREATE INDEX idx_ctrlcompl_req ON control_compliance_mapping(id_requirement);

-- ############################################################################
-- FASE 14: AUDITORÍAS Y HALLAZGOS
-- ############################################################################
-- [V7→V8] MODIFICACIÓN: findings - SE AGREGA id_ref_control FK

-- audits (sin cambios respecto a v7)
CREATE TABLE audits (
  id_audit               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  audit_code             VARCHAR(80) NOT NULL UNIQUE,
  audit_type             VARCHAR(50) NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  objective              TEXT,
  id_organization        INT NOT NULL REFERENCES organizations(id_organization),
  id_framework           BIGINT NULL REFERENCES frameworks(id_framework),
  scope_description      TEXT,
  lead_auditor_id        BIGINT NULL REFERENCES users(id_user),
  planned_start          DATE,
  planned_end            DATE,
  actual_start           DATE,
  actual_end             DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  conclusion             TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_audit_type CHECK (audit_type IN ('INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'SURVEILLANCE', 'SPECIAL'))
);
CREATE INDEX idx_audit_org ON audits(id_organization);
CREATE INDEX idx_audit_fw ON audits(id_framework);
CREATE INDEX idx_audit_status ON audits(status_lu);

-- audit_scope_items (sin cambios respecto a v7)
CREATE TABLE audit_scope_items (
  id_scope_item          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_audit               BIGINT NOT NULL REFERENCES audits(id_audit) ON DELETE CASCADE,
  scope_type             VARCHAR(30) NOT NULL,
  reference_entity       VARCHAR(255),
  reference_entity_id    BIGINT,
  notes                  TEXT,
  CONSTRAINT ck_scope_type CHECK (scope_type IN ('PROCESS', 'LOCATION', 'REQUIREMENT', 'CONTROL', 'DEPARTMENT'))
);
CREATE INDEX idx_auditscope_audit ON audit_scope_items(id_audit);

-- ============================================================================
-- [V7→V8] MODIFICACIÓN: findings
-- SE AGREGA: id_ref_control FK para vincular hallazgo a control de referencia
-- ============================================================================
CREATE TABLE findings (
  id_finding             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  finding_code           VARCHAR(80) NOT NULL UNIQUE,
  id_audit               BIGINT NOT NULL REFERENCES audits(id_audit) ON DELETE CASCADE,
  finding_type           VARCHAR(30) NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT NOT NULL,
  severity_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  related_requirement_id BIGINT NULL REFERENCES requirement_nodes(id_requirement),
  related_control_id     BIGINT NULL REFERENCES applied_controls(id_control),
  -- [V7→V8] NUEVO CAMPO: id_ref_control para vincular a control de referencia (catálogo)
  id_ref_control         BIGINT NULL REFERENCES reference_controls(id_ref_control),
  root_cause             TEXT,
  recommendation         TEXT,
  management_response    TEXT,
  responsible_user_id    BIGINT NULL REFERENCES users(id_user),
  due_date               DATE,
  closed_at              TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_finding_type CHECK (finding_type IN ('NC_MAJOR', 'NC_MINOR', 'OBSERVATION', 'OPPORTUNITY', 'POSITIVE'))
);
CREATE INDEX idx_finding_audit ON findings(id_audit);
CREATE INDEX idx_finding_status ON findings(status_lu);
CREATE INDEX idx_finding_req ON findings(related_requirement_id);
CREATE INDEX idx_finding_ctrl ON findings(related_control_id);
-- [V7→V8] NUEVO ÍNDICE: por id_ref_control
CREATE INDEX idx_finding_refctrl ON findings(id_ref_control) WHERE id_ref_control IS NOT NULL;

-- finding_actions (sin cambios respecto a v7)
CREATE TABLE finding_actions (
  id_action              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_finding             BIGINT NOT NULL REFERENCES findings(id_finding) ON DELETE CASCADE,
  action_type            VARCHAR(50),
  description            TEXT NOT NULL,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  due_date               DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  completed_at           TIMESTAMPTZ,
  verification_notes     TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_action_type CHECK (action_type IN ('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT'))
);
CREATE INDEX idx_findact_finding ON finding_actions(id_finding);

-- ############################################################################
-- FASE 15: EVIDENCIAS UNIFICADAS + VERSIONADO
-- ############################################################################
-- [V7→V8] TABLA MODIFICADA: evidences (expandida, unifica documents)
-- [V7→V8] NUEVA TABLA: evidence_versions
-- [V7→V8] TABLAS ELIMINADAS: documents, document_versions, attachments

-- ============================================================================
-- [V7→V8] MODIFICACIÓN MAYOR: evidences
-- Antes: tabla simple de anexos
-- Ahora: tabla unificada que absorbe funcionalidad de documents
-- CAMPOS NUEVOS: evidence_code, title, description, status_lu, valid_from, valid_until
-- Patrón CISO Assistant: Evidence + Evidence versioning
-- ============================================================================
CREATE TABLE evidences (
  id_evidence            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- [V7→V8] NUEVO CAMPO: código único para referencia
  evidence_code          VARCHAR(80) NOT NULL UNIQUE,
  -- [V7→V8] NUEVO CAMPO: título descriptivo
  title                  VARCHAR(255) NOT NULL,
  -- [V7→V8] NUEVO CAMPO: descripción extendida
  description            TEXT,
  file_name              VARCHAR(255) NOT NULL,
  file_path              TEXT NOT NULL,
  mime_type              VARCHAR(100),
  file_size_bytes        BIGINT,
  hash_sha256            CHAR(64),
  -- [V7→V8] NUEVO CAMPO: estado del ciclo de vida
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  -- [V7→V8] NUEVO CAMPO: fecha desde la cual es válida
  valid_from             DATE,
  -- [V7→V8] NUEVO CAMPO: fecha hasta la cual es válida
  valid_until            DATE,
  entity_type            VARCHAR(50) NOT NULL,
  entity_id              BIGINT NOT NULL,
  uploaded_by            BIGINT NULL REFERENCES users(id_user),
  uploaded_at            TIMESTAMPTZ DEFAULT now(),
  -- Campos existentes en v7
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_evidence_entity CHECK (entity_type IN (
    'ORGANIZATION', 'MACROPROCESS', 'PROCESS', 'SUBPROCESS', 'PROCEDURE',
    'PLAN', 'BIA', 'RIA', 'RISK', 'CONTROL', 'REFERENCE_CONTROL',
    'THREAT', 'VULNERABILITY', 'ASSET', 'SUPPLIER', 'LOCATION',
    'CONTACT', 'USER', 'INCIDENT', 'INCIDENT_REG_REPORT', 'CRISIS',
    'AUDIT', 'FINDING', 'FRAMEWORK', 'REQUIREMENT', 'COMPLIANCE',
    'TEST', 'EVIDENCE'
  )),
  -- [V7→V8] NUEVA VALIDACIÓN: valid_until >= valid_from
  CONSTRAINT ck_evidence_dates CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);
CREATE INDEX idx_evidence_entity ON evidences(entity_type, entity_id);
CREATE INDEX idx_evidence_uploader ON evidences(uploaded_by);
-- [V7→V8] NUEVO ÍNDICE: por estado
CREATE INDEX idx_evidence_status ON evidences(status_lu);
-- [V7→V8] NUEVO ÍNDICE: por vigencia
CREATE INDEX idx_evidence_validity ON evidences(valid_from, valid_until);

-- ============================================================================
-- [V7→V8] NUEVA TABLA: evidence_versions
-- Historial de versiones de evidencias (patrón CISO Assistant: EvidenceRevision)
-- ============================================================================
CREATE TABLE evidence_versions (
  id_evidence_version    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_evidence            BIGINT NOT NULL REFERENCES evidences(id_evidence) ON DELETE CASCADE,
  version_number         INT NOT NULL,
  file_name              VARCHAR(255) NOT NULL,
  file_path              TEXT NOT NULL,
  mime_type              VARCHAR(100),
  file_size_bytes        BIGINT,
  hash_sha256            CHAR(64),
  change_summary         TEXT,
  created_by             BIGINT NULL REFERENCES users(id_user),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_evidence_version UNIQUE (id_evidence, version_number)
);
CREATE INDEX idx_evver_evidence ON evidence_versions(id_evidence);
CREATE INDEX idx_evver_created ON evidence_versions(created_at);

-- ============================================================================
-- NOTA [V7→V8]: TABLAS ELIMINADAS
-- Las siguientes tablas de v7 ya NO existen en v8:
--   - documents (funcionalidad absorbida por evidences)
--   - document_versions (reemplazada por evidence_versions)
--   - attachments (redundante con evidences)
-- ============================================================================

-- ############################################################################
-- FASE 16: SISTEMA DE ETIQUETAS (TAGS)
-- ############################################################################
-- [V7→V8] NUEVA TABLA: tags
-- [V7→V8] NUEVA TABLA: entity_tags
-- Patrón CISO Assistant: FilteringLabel (etiquetas dinámicas)

-- ============================================================================
-- [V7→V8] NUEVA TABLA: tags
-- Catálogo de etiquetas para clasificación flexible de entidades
-- ============================================================================
CREATE TABLE tags (
  id_tag                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tag_name               VARCHAR(100) NOT NULL,
  tag_category           VARCHAR(50),
  color_hex              CHAR(7),
  description            TEXT,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  is_system_tag          BOOLEAN DEFAULT FALSE,
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  -- Unicidad: mismo nombre de tag puede existir en distintas organizaciones
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  CONSTRAINT uq_tag_org UNIQUE (tag_name, id_organization),
  -- Validación color hexadecimal
  CONSTRAINT ck_tag_color CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9A-Fa-f]{6}$')
);
CREATE INDEX idx_tag_org ON tags(id_organization);
CREATE INDEX idx_tag_category ON tags(tag_category);
CREATE INDEX idx_tag_active ON tags(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================================
-- [V7→V8] NUEVA TABLA: entity_tags
-- Tabla polimórfica para asignar tags a cualquier entidad del sistema
-- ============================================================================
CREATE TABLE entity_tags (
  id_entity_tag          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tag                 BIGINT NOT NULL REFERENCES tags(id_tag) ON DELETE CASCADE,
  entity_type            VARCHAR(50) NOT NULL,
  entity_id              BIGINT NOT NULL,
  assigned_by            BIGINT NULL REFERENCES users(id_user),
  assigned_at            TIMESTAMPTZ DEFAULT now(),
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
-- Sin cambios respecto a v7

-- notifications
CREATE TABLE notifications (
  id_notification        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  notification_type      VARCHAR(50) NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  message                TEXT,
  target_user_id         BIGINT NOT NULL REFERENCES users(id_user),
  is_read                BOOLEAN DEFAULT FALSE,
  read_at                TIMESTAMPTZ,
  reference_entity       VARCHAR(50),
  reference_entity_id    BIGINT,
  link_url               TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notif_user ON notifications(target_user_id);
CREATE INDEX idx_notif_unread ON notifications(target_user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notif_created ON notifications(created_at);

-- audit_logs
CREATE TABLE audit_logs (
  id_log                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  log_timestamp          TIMESTAMPTZ DEFAULT now(),
  action_type            VARCHAR(30) NOT NULL,
  entity_type            VARCHAR(50) NOT NULL,
  entity_id              BIGINT,
  user_id                BIGINT NULL REFERENCES users(id_user),
  ip_address             INET,
  user_agent             TEXT,
  old_values             JSONB,
  new_values             JSONB,
  description            TEXT,
  CONSTRAINT ck_action_type CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'VIEW'))
);
CREATE INDEX idx_auditlog_time ON audit_logs(log_timestamp);
CREATE INDEX idx_auditlog_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_auditlog_user ON audit_logs(user_id);
CREATE INDEX idx_auditlog_action ON audit_logs(action_type);

-- ############################################################################
-- FASE 17B: LECCIONES APRENDIDAS Y GESTIÓN DE CAMBIOS
-- ############################################################################
-- [V7→V8] NUEVA: lessons_learned - Lecciones aprendidas de incidentes, crisis, ejercicios
-- [V7→V8] NUEVA: bcms_changes - Gestión de cambios al SGCN

-- lessons_learned
CREATE TABLE lessons_learned (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  
  -- Origen de la lección
  source_type VARCHAR(50),  -- 'INCIDENT', 'CRISIS', 'EXERCISE', 'AUDIT', 'EXTERNAL_EVENT', 'BEST_PRACTICE'
  source_id BIGINT,  -- FK polimorfica al id del origen
  lesson_date DATE NOT NULL,
  
  -- Contenido
  description TEXT,
  root_cause TEXT,
  impact_assessment TEXT,
  recommendations TEXT,
  
  -- Mejora
  improvement_actions TEXT,
  actions_taken TEXT,
  status VARCHAR(30) DEFAULT 'identified',  -- identified, in_progress, implemented, validated, closed
  priority VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, critical
  
  -- Efectividad (métricas before/after)
  effectiveness_metrics JSONB,  -- {before: {metric: value}, after: {metric: value}, improvement_percentage: X}
  investment_amount NUMERIC(15,2),
  investment_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Responsabilidad
  responsible_id BIGINT REFERENCES users(id_user),
  due_date DATE,
  implementation_date DATE,
  validation_date DATE,
  closed_date DATE,
  
  -- Organización
  id_organization INT REFERENCES organizations(id_organization),
  folder_id BIGINT,
  
  -- Auditoría
  created_by BIGINT REFERENCES users(id_user),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by             BIGINT REFERENCES users(id_user),
  deleted_at             TIMESTAMPTZ,
  deleted_by             BIGINT REFERENCES users(id_user),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_ll_status CHECK (status IN ('identified', 'in_progress', 'implemented', 'validated', 'closed')),
  CONSTRAINT ck_ll_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT ck_ll_source_type CHECK (source_type IN ('INCIDENT', 'CRISIS', 'EXERCISE', 'AUDIT', 'EXTERNAL_EVENT', 'BEST_PRACTICE'))
);

CREATE INDEX idx_ll_org ON lessons_learned(id_organization);
CREATE INDEX idx_ll_source ON lessons_learned(source_type, source_id);
CREATE INDEX idx_ll_status ON lessons_learned(status);
CREATE INDEX idx_ll_responsible ON lessons_learned(responsible_id);
CREATE INDEX idx_ll_date ON lessons_learned(lesson_date);
COMMENT ON TABLE lessons_learned IS '[V7→V8] NUEVA: Lecciones aprendidas de incidentes, crisis, ejercicios, auditorías. Centraliza mejora continua del SGCN (ISO 22301 cláusula 10.2).';

-- bcms_changes
CREATE TABLE bcms_changes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  change_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Tipo de cambio
  change_type VARCHAR(50) NOT NULL,  -- PROCESS_CHANGE, SCOPE_CHANGE, POLICY_CHANGE, STRUCTURE_CHANGE, PLAN_CHANGE, STRATEGY_CHANGE
  change_category VARCHAR(30),  -- minor, major, critical
  
  -- Entidades afectadas (polimórfico)
  affected_entities JSONB,  -- [{entity_type: 'process', entity_id: BIGINT, description: 'Cambio en RTO'}, ...]
  impact_assessment TEXT,
  risk_level VARCHAR(20),  -- low, medium, high, critical
  
  -- Justificación
  reason TEXT,
  expected_benefits TEXT,
  
  -- Proceso de aprobación
  requested_by BIGINT REFERENCES users(id_user),
  request_date DATE NOT NULL,
  approved_by BIGINT REFERENCES users(id_user),
  approval_date DATE,
  rejection_reason TEXT,
  
  -- Implementación
  status VARCHAR(30) DEFAULT 'pending',  -- pending, approved, in_progress, implemented, rejected, cancelled
  scheduled_date DATE,
  implementation_date DATE,
  implementation_notes TEXT,
  rollback_plan TEXT,
  
  -- Verificación
  verified_by BIGINT REFERENCES users(id_user),
  verification_date DATE,
  verification_notes TEXT,
  
  -- Organización
  id_organization INT REFERENCES organizations(id_organization),
  
  -- Auditoría
  created_by BIGINT REFERENCES users(id_user),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by             BIGINT REFERENCES users(id_user),
  deleted_at             TIMESTAMPTZ,
  deleted_by             BIGINT REFERENCES users(id_user),
  is_deleted             BOOLEAN DEFAULT FALSE,
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
COMMENT ON TABLE bcms_changes IS '[V7→V8] NUEVA: Gestión de cambios al SGCN. Documenta cambios planificados al alcance, procesos, políticas, planes (ISO 22301 cláusula 6.3).';

-- ############################################################################
-- FASE 18: VISTAS MATERIALIZADAS Y REGULARES
-- ############################################################################
-- [V7→V8] NUEVAS VISTAS: v_evidences_status, v_threats_with_risks
-- Vistas existentes v7: v_process_hierarchy, v_risk_overview, v_compliance_status, v_incident_summary

-- v_process_hierarchy (sin cambios respecto a v7)
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

-- v_risk_overview (sin cambios respecto a v7)
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

-- v_compliance_status (sin cambios respecto a v7)
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

-- v_incident_summary (sin cambios respecto a v7)
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
-- [V7→V8] NUEVA VISTA: v_evidences_status
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
-- [V7→V8] NUEVA VISTA: v_threats_with_risks
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
-- RESUMEN DE CAMBIOS V7 → V8 (heredados):
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

CREATE TABLE bcms_context_issues (
  id_context_issue       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  issue_type             VARCHAR(20) NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  impact_description     TEXT,
  risk_level_lu          BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  id_organization        INT NULL REFERENCES organizations(id_organization),
  reviewed_at            DATE,
  next_review_date       DATE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_context_issue_type CHECK (issue_type IN ('EXTERNAL', 'INTERNAL'))
);
CREATE INDEX idx_context_org ON bcms_context_issues(id_organization);
CREATE INDEX idx_context_type ON bcms_context_issues(issue_type);

CREATE TABLE bcms_stakeholders (
  id_stakeholder         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stakeholder_type       VARCHAR(30) NOT NULL,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  expectations           TEXT,
  requirements           TEXT,
  priority_lu            BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  id_contact             BIGINT NULL REFERENCES contacts(id_contact),
  id_organization        INT NULL REFERENCES organizations(id_organization),
  country_code           CHAR(3),
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  CONSTRAINT ck_stakeholder_type CHECK (stakeholder_type IN ('CUSTOMER', 'REGULATOR', 'SUPPLIER', 'EMPLOYEE', 'SHAREHOLDER', 'COMMUNITY', 'GOVERNMENT', 'PARTNER', 'INTERNAL'))
);
CREATE INDEX idx_stakeholder_org ON bcms_stakeholders(id_organization);
CREATE INDEX idx_stakeholder_type ON bcms_stakeholders(stakeholder_type);

CREATE TABLE bcms_scopes (
  id_scope               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope_code             VARCHAR(80) UNIQUE NOT NULL,
  scope_statement        TEXT NOT NULL,
  inclusions             TEXT,
  exclusions             TEXT,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  approved_by            BIGINT NULL REFERENCES users(id_user),
  approval_date          DATE,
  next_review_date       DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_scope_org ON bcms_scopes(id_organization);

CREATE TABLE bcms_policies (
  id_policy              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  policy_code            VARCHAR(80) UNIQUE NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  version                VARCHAR(50),
  description            TEXT,
  approval_date          DATE,
  next_review_date       DATE,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  id_organization        INT NULL REFERENCES organizations(id_organization),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_policy_org ON bcms_policies(id_organization);

CREATE TABLE bcms_objectives (
  id_objective           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  objective_code         VARCHAR(80) UNIQUE NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  kpi_name               VARCHAR(255),
  target_value           VARCHAR(100),
  current_value          VARCHAR(100),
  unit                   VARCHAR(30),
  due_date               DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  id_organization        INT NULL REFERENCES organizations(id_organization),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_objective_org ON bcms_objectives(id_organization);

CREATE TABLE bcms_strategies (
  id_strategy            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  strategy_code          VARCHAR(80) UNIQUE NOT NULL,
  title                  VARCHAR(255) NOT NULL,
  description            TEXT,
  period_start           DATE,
  period_end             DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  budget_amount          NUMERIC(15,2),
  budget_currency        VARCHAR(3) DEFAULT 'USD',
  progress_pct           INT DEFAULT 0,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_strategy_progress CHECK (progress_pct >= 0 AND progress_pct <= 100)
);
CREATE INDEX idx_strategy_org ON bcms_strategies(id_organization);

-- ############################################################################
-- FASE 20: CONTACT LINKS (POLYMORPHIC RELATIONSHIPS)
-- ############################################################################

CREATE TABLE contact_links (
  id_contact_link        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_contact             BIGINT NOT NULL REFERENCES contacts(id_contact) ON DELETE CASCADE,
  entity_type            VARCHAR(50) NOT NULL,
  entity_id              BIGINT NOT NULL,
  relationship_type      VARCHAR(50),
  is_primary             BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
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

CREATE TABLE bcms_roles (
  id_bcms_role           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_code              VARCHAR(80) UNIQUE NOT NULL,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255)
);

CREATE TABLE bcms_role_assignments (
  id_assignment           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_bcms_role            BIGINT NOT NULL REFERENCES bcms_roles(id_bcms_role) ON DELETE CASCADE,
  id_user                 BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  scope_type              VARCHAR(30) NOT NULL,
  scope_id                BIGINT,
  id_organization         INT NULL REFERENCES organizations(id_organization),
  is_primary              BOOLEAN DEFAULT FALSE,
  valid_from              TIMESTAMPTZ DEFAULT now(),
  valid_until             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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

CREATE TABLE bcms_raci_matrix (
  id_raci                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity_code          VARCHAR(50) NOT NULL,
  id_bcms_role           BIGINT NOT NULL REFERENCES bcms_roles(id_bcms_role) ON DELETE CASCADE,
  responsibility         CHAR(1) NOT NULL,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_raci_resp CHECK (responsibility IN ('R', 'A', 'C', 'I'))
);
CREATE INDEX idx_raci_activity ON bcms_raci_matrix(activity_code);

-- ############################################################################
-- FASE 22: PLANES DE COMUNICACION
-- ############################################################################

CREATE TABLE communication_plans (
  id_comm_plan           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_code              VARCHAR(80) UNIQUE NOT NULL,
  name                   VARCHAR(255) NOT NULL,
  description            TEXT,
  scope_type             VARCHAR(30) NOT NULL,
  scope_id               BIGINT,
  id_organization        INT NULL REFERENCES organizations(id_organization),
  id_activation_criteria BIGINT NULL REFERENCES activation_criteria(id_criteria),
  id_call_tree           BIGINT NULL REFERENCES call_trees(id_call_tree),
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  last_review_date       DATE,
  next_review_date       DATE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE,
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

CREATE TABLE communication_plan_channels (
  id_comm_channel        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_comm_plan           BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE,
  channel_lu             BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  priority_order         INT DEFAULT 0,
  is_primary             BOOLEAN DEFAULT FALSE,
  notes                  TEXT
);
CREATE INDEX idx_comm_channel_plan ON communication_plan_channels(id_comm_plan);

CREATE TABLE communication_plan_stakeholders (
  id_comm_stakeholder    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_comm_plan           BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE,
  stakeholder_type       VARCHAR(30) NOT NULL,
  id_user                BIGINT NULL REFERENCES users(id_user),
  id_contact             BIGINT NULL REFERENCES contacts(id_contact),
  id_supplier            BIGINT NULL REFERENCES suppliers(id_supplier),
  external_name          VARCHAR(255),
  external_email         VARCHAR(255),
  external_phone         VARCHAR(30),
  role_in_plan           VARCHAR(100),
  required_ack           BOOLEAN DEFAULT FALSE,
  CONSTRAINT ck_comm_stakeholder_type CHECK (stakeholder_type IN ('USER', 'CONTACT', 'SUPPLIER', 'REGULATOR', 'PUBLIC', 'EXTERNAL'))
);
CREATE INDEX idx_comm_stakeholder_plan ON communication_plan_stakeholders(id_comm_plan);

CREATE TABLE communication_messages (
  id_comm_message        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_comm_plan           BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE,
  message_type           VARCHAR(20) NOT NULL,
  template_title         VARCHAR(255),
  template_body          TEXT,
  language_code          VARCHAR(10) DEFAULT 'es',
  channel_lu             BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  is_deleted             BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  CONSTRAINT ck_comm_message_type CHECK (message_type IN ('INITIAL', 'UPDATE', 'STATUS', 'CLOSURE'))
);
CREATE INDEX idx_comm_message_plan ON communication_messages(id_comm_plan);

CREATE TABLE communication_log (
  id_comm_log            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_comm_plan           BIGINT NOT NULL REFERENCES communication_plans(id_comm_plan) ON DELETE CASCADE,
  channel_lu             BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  recipient              VARCHAR(255),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  sent_at                TIMESTAMPTZ,
  response_received_at   TIMESTAMPTZ,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_comm_log_plan ON communication_log(id_comm_plan);

-- ############################################################################
-- FASE 23: PARTICIPANTES DE ACTIVIDADES (CAPACITACION/EJERCICIOS)
-- ############################################################################

CREATE TABLE activity_participants (
  id_activity_participant BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity_type          VARCHAR(30) NOT NULL,
  activity_id            BIGINT NOT NULL,
  participant_type       VARCHAR(20) NOT NULL,
  id_user                BIGINT NULL REFERENCES users(id_user),
  id_contact             BIGINT NULL REFERENCES contacts(id_contact),
  external_name          VARCHAR(255),
  external_email         VARCHAR(255),
  external_phone         VARCHAR(30),
  role                   VARCHAR(100),
  attendance_status      VARCHAR(30),
  score                  NUMERIC(5,2),
  performance_notes      TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_activity_type CHECK (activity_type IN ('PLAN_TEST', 'EXERCISE', 'INCIDENT', 'CRISIS', 'TRAINING')),
  CONSTRAINT ck_participant_type CHECK (participant_type IN ('USER', 'CONTACT', 'EXTERNAL'))
);
CREATE INDEX idx_activity_participant_activity ON activity_participants(activity_type, activity_id);
CREATE INDEX idx_activity_participant_user ON activity_participants(id_user);

-- ############################################################################
-- FASE 24: REVISION POR LA DIRECCION (ISO 9.3)
-- ############################################################################

CREATE TABLE management_reviews (
  id_review              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_code            VARCHAR(80) UNIQUE NOT NULL,
  review_date            DATE NOT NULL,
  period_start           DATE,
  period_end             DATE,
  scope_description      TEXT,
  chair_user_id          BIGINT NULL REFERENCES users(id_user),
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             VARCHAR(255),
  updated_by             VARCHAR(255),
  deleted_at             TIMESTAMPTZ,
  deleted_by             VARCHAR(255),
  is_deleted             BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_review_date ON management_reviews(review_date);

CREATE TABLE management_review_inputs (
  id_review_input        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_review              BIGINT NOT NULL REFERENCES management_reviews(id_review) ON DELETE CASCADE,
  input_type             VARCHAR(30) NOT NULL,
  entity_type            VARCHAR(50),
  entity_id              BIGINT,
  summary                TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_review_input_type CHECK (input_type IN ('AUDIT', 'KPI', 'INCIDENT', 'EXERCISE', 'RISK', 'CHANGE', 'FEEDBACK', 'TEST', 'OTHER'))
);
CREATE INDEX idx_review_input_review ON management_review_inputs(id_review);

CREATE TABLE management_review_outputs (
  id_review_output       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_review              BIGINT NOT NULL REFERENCES management_reviews(id_review) ON DELETE CASCADE,
  decision_type          VARCHAR(30) NOT NULL,
  description            TEXT,
  owner_user_id          BIGINT NULL REFERENCES users(id_user),
  due_date               DATE,
  status_lu              BIGINT NULL REFERENCES lookup_values(id_lookup_value),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_review_decision_type CHECK (decision_type IN ('ACTION', 'CHANGE', 'RESOURCE', 'POLICY', 'OTHER'))
);
CREATE INDEX idx_review_output_review ON management_review_outputs(id_review);

-- ############################################################################
-- FASE 25: APROBACIONES Y FIRMAS MULTIROL (V°B°)
-- ############################################################################

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

