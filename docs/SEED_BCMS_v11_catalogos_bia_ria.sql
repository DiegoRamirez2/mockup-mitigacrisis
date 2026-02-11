-- ============================================================================
-- SEED BCMS V11 - Catalogos BIA/RIA, Buckets y Escenarios base
-- Fuente:
--   - docs/Anexo 7 Especificaciones Tecnicas.pdf
--   - docs/BIA Operar Convenios de Pago.xlsx
--   - docs/RIA Operar Convenios de Pago.xlsx
--
-- Decision vigente:
--   - El gatillo para ejecutar RIA queda en "impacto mayor a 24 horas"
--     con nivel de impacto final MEDIO ALTO o ALTO.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1) Regla operativa RIA (configurable)
-- ============================================================================
INSERT INTO application_settings (
  setting_key,
  setting_value,
  setting_type,
  description,
  is_system
)
VALUES (
  'ria.trigger_rule',
  '{
    "rule_code": "BIA_IMPACT_GT_24H_AND_LEVEL_GE_MEDIO_ALTO",
    "trigger_time_minutes_gt": 1440,
    "allowed_impact_levels": ["MEDIO_ALTO", "ALTO"],
    "source": "Anexo 7 + decision interna 2026-02-11"
  }'::jsonb,
  'JSON',
  'Regla temporal para disparar RIA desde resultados BIA.',
  TRUE
)
ON CONFLICT (setting_key) DO UPDATE
SET
  setting_value = EXCLUDED.setting_value,
  setting_type  = EXCLUDED.setting_type,
  description   = EXCLUDED.description,
  is_system     = EXCLUDED.is_system,
  updated_at    = now();

-- ============================================================================
-- 2) Lookup sets base para riesgo/continuidad
-- ============================================================================
INSERT INTO lookup_sets (code, name, description, is_system) VALUES
('risk_impact_scale', 'Risk Impact Scale', 'Escala de impacto 1..5 para matrices de riesgo/BIA-RIA.', TRUE),
('risk_probability_scale', 'Risk Probability Scale', 'Escala de probabilidad 1..5 para matrices de riesgo/BIA-RIA.', TRUE),
('control_effectiveness_scale', 'Control Effectiveness Scale', 'Escala de evaluacion de control 1..5.', TRUE),
('qualitative_risk_level', 'Qualitative Risk Level', 'Escala cualitativa para riesgo inherente/residual.', TRUE),
('yes_no_flag', 'Yes/No Flag', 'Valores binarios SI/NO para banderas operativas.', TRUE),
('continuity_risk_response', 'Continuity Risk Response', 'Respuesta sugerida frente al riesgo residual final.', TRUE),
('disruption_scenario_type', 'Disruption Scenario Type', 'Tipologia de escenarios de disrupcion.', TRUE)
ON CONFLICT (code) DO UPDATE
SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system   = EXCLUDED.is_system;

-- ============================================================================
-- 3) Lookup values
-- ============================================================================

-- 3.1 Impacto (1..5)
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'risk_impact_scale'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), '1_BAJO',       '1. Bajo',       1, FALSE, '#22C55E', 'bi-emoji-smile', NULL),
((SELECT id_lookup_set FROM s), '2_MEDIO_BAJO', '2. Medio Bajo', 2, FALSE, '#84CC16', 'bi-emoji-neutral', NULL),
((SELECT id_lookup_set FROM s), '3_MEDIO',      '3. Medio',      3, FALSE, '#F59E0B', 'bi-emoji-neutral', NULL),
((SELECT id_lookup_set FROM s), '4_MEDIO_ALTO', '4. Medio Alto', 4, FALSE, '#F97316', 'bi-emoji-frown', NULL),
((SELECT id_lookup_set FROM s), '5_ALTO',       '5. Alto',       5, FALSE, '#EF4444', 'bi-exclamation-triangle', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- 3.2 Probabilidad (1..5)
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'risk_probability_scale'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), '1_MUY_POCO_PROBABLE', '1. Muy poco probable', 1, FALSE, '#22C55E', 'bi-calendar-x', NULL),
((SELECT id_lookup_set FROM s), '2_POCO_PROBABLE',     '2. Poco probable',     2, FALSE, '#84CC16', 'bi-calendar2-week', NULL),
((SELECT id_lookup_set FROM s), '3_OCASIONAL',         '3. Ocasional',         3, FALSE, '#F59E0B', 'bi-calendar2', NULL),
((SELECT id_lookup_set FROM s), '4_FRECUENTE',         '4. Frecuente',         4, FALSE, '#F97316', 'bi-calendar2-check', NULL),
((SELECT id_lookup_set FROM s), '5_MUY_FRECUENTE',     '5. Muy frecuente',     5, FALSE, '#EF4444', 'bi-alarm', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- 3.3 Evaluacion del control (1..5)
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'control_effectiveness_scale'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), '1_DEFICIENTE', '1. Deficiente', 1, FALSE, '#EF4444', 'bi-shield-x', NULL),
((SELECT id_lookup_set FROM s), '2_REGULAR',    '2. Regular',    2, FALSE, '#F97316', 'bi-shield-exclamation', NULL),
((SELECT id_lookup_set FROM s), '3_SUFICIENTE', '3. Suficiente', 3, FALSE, '#F59E0B', 'bi-shield-check', NULL),
((SELECT id_lookup_set FROM s), '4_BUENO',      '4. Bueno',      4, FALSE, '#84CC16', 'bi-shield-check', NULL),
((SELECT id_lookup_set FROM s), '5_OPTIMO',     '5. Optimo',     5, FALSE, '#22C55E', 'bi-shield-fill-check', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- 3.4 Nivel cualitativo de riesgo
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'qualitative_risk_level'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), 'BAJO',       'Bajo',       1, FALSE, '#22C55E', 'bi-emoji-smile', NULL),
((SELECT id_lookup_set FROM s), 'MEDIO_BAJO', 'Medio Bajo', 2, FALSE, '#84CC16', 'bi-emoji-neutral', NULL),
((SELECT id_lookup_set FROM s), 'MEDIO',      'Medio',      3, FALSE, '#F59E0B', 'bi-emoji-neutral', NULL),
((SELECT id_lookup_set FROM s), 'MEDIO_ALTO', 'Medio Alto', 4, FALSE, '#F97316', 'bi-emoji-frown', NULL),
((SELECT id_lookup_set FROM s), 'ALTO',       'Alto',       5, FALSE, '#EF4444', 'bi-exclamation-triangle', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- 3.5 SI/NO
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'yes_no_flag'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), 'SI', 'Si', 1, FALSE, '#22C55E', 'bi-check-circle', NULL),
((SELECT id_lookup_set FROM s), 'NO', 'No', 2, FALSE, '#EF4444', 'bi-x-circle', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- 3.6 Respuesta al riesgo de continuidad
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'continuity_risk_response'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), 'UPDATE_OR_CREATE_BCP', 'Crear/actualizar BCP o ejecutar prueba pendiente', 1, FALSE, '#F97316', 'bi-tools', NULL),
((SELECT id_lookup_set FROM s), 'KEEP_CURRENT_BCP',     'No requiere construir/actualizar plan; mantener pruebas', 2, FALSE, '#22C55E', 'bi-shield-check', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- 3.7 Tipo de escenario de disrupcion
WITH s AS (
  SELECT id_lookup_set FROM lookup_sets WHERE code = 'disruption_scenario_type'
)
INSERT INTO lookup_values (id_lookup_set, code, label, sort_order, is_deleted, color_hex, icon_name, parent_id) VALUES
((SELECT id_lookup_set FROM s), 'PERSONNEL',      'Personal',                 1, FALSE, '#0EA5E9', 'bi-people', NULL),
((SELECT id_lookup_set FROM s), 'INFRASTRUCTURE', 'Infraestructura',          2, FALSE, '#A855F7', 'bi-building', NULL),
((SELECT id_lookup_set FROM s), 'SUPPLIER',       'Proveedor',                3, FALSE, '#14B8A6', 'bi-truck', NULL),
((SELECT id_lookup_set FROM s), 'SYSTEMS',        'Sistemas / Aplicaciones',  4, FALSE, '#3B82F6', 'bi-hdd-network', NULL),
((SELECT id_lookup_set FROM s), 'CYBER',          'Ciberseguridad',           5, FALSE, '#DC2626', 'bi-shield-lock', NULL),
((SELECT id_lookup_set FROM s), 'CASH',           'Suministro de efectivo',   6, FALSE, '#84CC16', 'bi-cash-coin', NULL),
((SELECT id_lookup_set FROM s), 'BASIC_SERVICES', 'Servicios basicos',        7, FALSE, '#F59E0B', 'bi-lightning-charge', NULL),
((SELECT id_lookup_set FROM s), 'BRANCH_NETWORK', 'Red de sucursales',        8, FALSE, '#6366F1', 'bi-diagram-3', NULL)
ON CONFLICT (id_lookup_set, code) DO UPDATE
SET
  label      = EXCLUDED.label,
  sort_order = EXCLUDED.sort_order,
  is_deleted = EXCLUDED.is_deleted,
  color_hex  = EXCLUDED.color_hex,
  icon_name  = EXCLUDED.icon_name,
  parent_id  = EXCLUDED.parent_id;

-- ============================================================================
-- 4) Impact types base (BIA)
-- ============================================================================
INSERT INTO impact_types (
  impact_code,
  id_organization,
  name,
  description,
  sort_order,
  is_system_type,
  status_lu,
  is_deleted,
  created_by,
  updated_by,
  deleted_at,
  deleted_by
) VALUES
('BIA_MONETARIO',    NULL, 'Monetario',    'Impacto financiero sobre ingresos/perdidas.', 1, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('BIA_PROCESOS',     NULL, 'Procesos',     'Impacto sobre continuidad y niveles de servicio de procesos.', 2, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('BIA_REPUTACIONAL', NULL, 'Reputacional', 'Impacto sobre imagen y percepcion de clientes/regulador.', 3, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('BIA_NORMATIVO',    NULL, 'Normativo',    'Impacto sobre cumplimiento regulatorio y posibles sanciones.', 4, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('BIA_CLIENTES',     NULL, 'Clientes',     'Impacto sobre volumen y criticidad de clientes afectados.', 5, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL)
ON CONFLICT (impact_code) DO UPDATE
SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  sort_order     = EXCLUDED.sort_order,
  is_system_type = EXCLUDED.is_system_type,
  status_lu      = EXCLUDED.status_lu,
  is_deleted     = EXCLUDED.is_deleted,
  updated_at     = now(),
  updated_by     = EXCLUDED.updated_by,
  deleted_at     = EXCLUDED.deleted_at,
  deleted_by     = EXCLUDED.deleted_by;

-- ============================================================================
-- 5) Time buckets base (6 escalas horarias BIA)
--    Escalas detectadas:
--      < 1 HORA, ENTRE 1 Y 2 HORAS, ENTRE 2 Y 6 HORAS, ENTRE 6 Y 24 HORAS,
--      ENTRE 24 Y 36 HORAS, > 36 HORAS
-- ============================================================================
INSERT INTO time_buckets (
  bucket_code,
  name,
  start_minutes,
  end_minutes,
  sort_order,
  id_organization,
  is_system_bucket,
  status_lu,
  is_deleted,
  created_by,
  updated_by,
  deleted_at,
  deleted_by
) VALUES
('TB_LT_1H',       '< 1 HORA',              0,    59,    1, NULL, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('TB_1H_TO_2H',    'ENTRE 1 Y 2 HORAS',     60,   120,   2, NULL, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('TB_2H_TO_6H',    'ENTRE 2 Y 6 HORAS',     121,  360,   3, NULL, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('TB_6H_TO_24H',   'ENTRE 6 Y 24 HORAS',    361,  1440,  4, NULL, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('TB_24H_TO_36H',  'ENTRE 24 Y 36 HORAS',   1441, 2160,  5, NULL, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL),
('TB_GT_36H',      '> 36 HORAS',            2161, 525600,6, NULL, TRUE, NULL, FALSE, NULL, NULL, NULL, NULL)
ON CONFLICT (bucket_code) DO UPDATE
SET
  name             = EXCLUDED.name,
  start_minutes    = EXCLUDED.start_minutes,
  end_minutes      = EXCLUDED.end_minutes,
  sort_order       = EXCLUDED.sort_order,
  id_organization  = EXCLUDED.id_organization,
  is_system_bucket = EXCLUDED.is_system_bucket,
  status_lu        = EXCLUDED.status_lu,
  is_deleted       = EXCLUDED.is_deleted,
  updated_at       = now(),
  updated_by       = EXCLUDED.updated_by,
  deleted_at       = EXCLUDED.deleted_at,
  deleted_by       = EXCLUDED.deleted_by;

-- ============================================================================
-- 6) Escenarios de disrupcion base (BIA/RIA)
-- ============================================================================
WITH st AS (
  SELECT lv.code, lv.id_lookup_value
  FROM lookup_values lv
  JOIN lookup_sets ls ON ls.id_lookup_set = lv.id_lookup_set
  WHERE ls.code = 'disruption_scenario_type'
)
INSERT INTO disruption_scenarios (
  id_organization,
  scenario_code,
  name,
  description,
  scenario_type_lu,
  is_system_scenario,
  sort_order,
  is_deleted,
  created_by,
  updated_by,
  deleted_at,
  deleted_by
) VALUES
(NULL, 'SCN_PARTIAL_KEY_PERSONNEL',      'Indisponibilidad parcial o perdida del personal clave', 'Escenario de ausencia parcial de personas clave del proceso.', (SELECT id_lookup_value FROM st WHERE code = 'PERSONNEL'),      TRUE,  1, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_MASSIVE_PERSONNEL',          'Ausencia masiva del personal',                           'Escenario de ausencia masiva de personal (ej: contingencia sanitaria/huelga).', (SELECT id_lookup_value FROM st WHERE code = 'PERSONNEL'),      TRUE,  2, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_BUILDING_UNAVAILABLE',       'Indisponibilidad de un edificio o conjunto de edificios', 'Escenario de infraestructura fisica no disponible.', (SELECT id_lookup_value FROM st WHERE code = 'INFRASTRUCTURE'), TRUE,  3, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_BRANCHES_DESTROYED',         'Indisponibilidad o destruccion de una sucursal o conjunto de sucursales', 'Escenario de caida/afectacion de red de sucursales.', (SELECT id_lookup_value FROM st WHERE code = 'BRANCH_NETWORK'), TRUE,  4, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_BASIC_SERVICES_UNAVAILABLE', 'Imposibilidad de restauracion inmediata de servicios basicos', 'Escenario por corte prolongado de energia/agua/comunicaciones basicas.', (SELECT id_lookup_value FROM st WHERE code = 'BASIC_SERVICES'), TRUE,  5, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_SUPPLIER_UNAVAILABLE',       'Indisponibilidad de servicios prestados por proveedores', 'Escenario de falla o indisponibilidad de terceros criticos.', (SELECT id_lookup_value FROM st WHERE code = 'SUPPLIER'),       TRUE,  6, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_CASH_SUPPLY_UNAVAILABLE',    'Indisponibilidad del suministro de efectivo',            'Escenario de interrupcion en cadena de suministro de efectivo.', (SELECT id_lookup_value FROM st WHERE code = 'CASH'),           TRUE,  7, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_CRITICAL_APP_UNAVAILABLE',   'Indisponibilidad de una aplicacion o servicio TI critico para la ejecucion del proceso', 'Escenario de indisponibilidad de aplicacion/sistema critico.', (SELECT id_lookup_value FROM st WHERE code = 'SYSTEMS'),       TRUE,  8, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_MASSIVE_IT_OUTAGE',          'Indisponibilidad masiva de aplicaciones, servicios TI o comunicaciones', 'Escenario de caida masiva tecnologica.', (SELECT id_lookup_value FROM st WHERE code = 'SYSTEMS'),       TRUE,  9, FALSE, NULL, NULL, NULL, NULL),
(NULL, 'SCN_CYBERATTACK',                'Ataque de ciberseguridad',                               'Escenario de incidente ciber con impacto en continuidad.', (SELECT id_lookup_value FROM st WHERE code = 'CYBER'),          TRUE, 10, FALSE, NULL, NULL, NULL, NULL)
ON CONFLICT (scenario_code) DO UPDATE
SET
  name               = EXCLUDED.name,
  description        = EXCLUDED.description,
  scenario_type_lu   = EXCLUDED.scenario_type_lu,
  is_system_scenario = EXCLUDED.is_system_scenario,
  sort_order         = EXCLUDED.sort_order,
  is_deleted         = EXCLUDED.is_deleted,
  updated_at         = now(),
  updated_by         = EXCLUDED.updated_by,
  deleted_at         = EXCLUDED.deleted_at,
  deleted_by         = EXCLUDED.deleted_by;

COMMIT;
