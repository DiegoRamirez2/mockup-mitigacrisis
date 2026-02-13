# BCMS v11 Datastore Mapping Contract

## 1. Alcance
Contrato de mapeo entre entidades runtime de `mockup_v2/js/datastore.js` y tablas de `mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql`.

## 2. Resumen
- Entidades runtime detectadas: **65**
- Tablas en schema v11: **101**
- Entidades con mapeo a tabla: **46**
- Entidades sin mapeo: **18**
- Tablas sin representación en datastore: **55**

Estados:
- `PARCIAL_ALTO`: mapeo mayormente compatible, brecha acotada.
- `PARCIAL`: requiere ajuste de campos/normalización.
- `REDISEÑAR`: misma entidad nominal, pero forma incompatible con v11.
- `SIN_MAPEO`: entidad sin tabla objetivo definida en v11.

## 3. Matriz Entity -> Tabla

| Entity | Registros | Tabla v11 | Línea SQL | Estado | Match cols | Faltantes | Auditoría JS | Notas |
|---|---:|---|---:|---|---:|---:|---:|---|
| `activationCriteria` | 5 | `activation_criteria` | 1332 | `PARCIAL` | 3/8 | 5 | 0/7 | id-> id_criterion | faltan: id_criterion, id_plan, criterion_code, severity_lu, created_at | extra: id, plan_id, code, severity |
| `activityParticipants` | 3 | `activity_participants` | 2936 | `PARCIAL` | 6/14 | 8 | 0/7 | id-> id_activity_participant | faltan: id_activity_participant, id_user, id_contact, external_name, external_email... | extra: id, user_id |
| `appServices` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `assets` | 3 | `assets` | 1111 | `PARCIAL` | 19/23 | 4 | 7/7 | id-> id_asset | faltan: id_asset, asset_code, id_location, id_organization | extra: id, code, asset_category, asset_type... |
| `audits` | 3 | `audits` | 1906 | `PARCIAL` | 10/22 | 12 | 0/7 | id-> id_audit | faltan: id_audit, audit_code, id_organization, id_framework, status_lu... | extra: id, code, organization_id, framework_id... |
| `bcmsChanges` | 3 | `bcms_changes` | 2291 | `PARCIAL` | 22/32 | 10 | 0/7 | id-> id_organization | faltan: rejection_reason, rollback_plan, id_organization, created_by, created_at... | extra: organization_id |
| `bcmsContext` | 1 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 4/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `bcmsContextIssues` | 2 | `bcms_context_issues` | 2545 | `PARCIAL` | 7/18 | 11 | 0/7 | id-> id_context_issue | faltan: id_context_issue, risk_level_lu, status_lu, id_organization, created_at... | extra: id, risk_level, status, organization_id |
| `bcmsObjectives` | 2 | `bcms_objectives` | 2654 | `PARCIAL` | 6/18 | 12 | 2/7 | id-> id_objective | faltan: id_objective, title, kpi_name, unit, due_date... | extra: id, objective_name, description, measure_unit... |
| `bcmsPolicies` | 1 | `bcms_policies` | 2628 | `PARCIAL` | 9/17 | 8 | 4/7 | id-> id_policy | faltan: id_policy, title, owner_user_id, status_lu, id_organization... | extra: id, policy_name, effective_date, policy_type... |
| `bcmsRaciMatrix` | 4 | `bcms_raci_matrix` | 2796 | `PARCIAL_ALTO` | 2/6 | 4 | 0/7 | id-> id_raci | faltan: id_raci, id_bcms_role, notes, created_at | extra: id, role_id |
| `bcmsRiskAppetites` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 7/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `bcmsRiskCriteria` | 1 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 7/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `bcmsRiskReviewCadences` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 7/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `bcmsRoleAssignments` | 4 | `bcms_role_assignments` | 2762 | `PARCIAL` | 3/16 | 13 | 0/7 | id-> id_assignment | faltan: id_assignment, id_bcms_role, id_user, id_organization, valid_from... | extra: id, role_id, user_id, organization_id |
| `bcmsRoles` | 4 | `bcms_roles` | 2743 | `PARCIAL` | 2/11 | 9 | 0/7 | id-> id_bcms_role | faltan: id_bcms_role, role_code, is_deleted, created_at, updated_at... | extra: id, code |
| `bcmsScopes` | 1 | `bcms_scopes` | 2602 | `PARCIAL` | 6/17 | 11 | 0/7 | id-> id_scope | faltan: id_scope, scope_code, id_organization, status_lu, created_at... | extra: id, code, organization_id, status |
| `bcmsStakeholders` | 3 | `bcms_stakeholders` | 2574 | `PARCIAL` | 6/17 | 11 | 0/7 | id-> id_stakeholder | faltan: id_stakeholder, priority_lu, id_contact, id_organization, is_deleted... | extra: id, priority, contact_id, organization_id... |
| `bcmsStrategies` | 1 | `bcms_strategies` | 2681 | `PARCIAL` | 8/19 | 11 | 0/7 | id-> id_strategy | faltan: id_strategy, strategy_code, status_lu, id_organization, created_at... | extra: id, code, status, organization_id |
| `biaDependencies` | 11 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 0/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `callTreeNodes` | 3 | `call_tree_nodes` | 1405 | `PARCIAL_ALTO` | 4/7 | 3 | 0/7 | id-> id_node | faltan: id_node, id_call_tree, id_contact | extra: id, call_tree_id, contact_id |
| `callTrees` | 1 | `call_trees` | 1389 | `PARCIAL_ALTO` | 3/6 | 3 | 1/7 | id-> id_call_tree | faltan: id_call_tree, id_plan, tree_name | extra: id, plan_id, name |
| `communicationLog` | 2 | `communication_log` | 2914 | `PARCIAL` | 2/9 | 7 | 0/7 | id-> id_comm_log | faltan: id_comm_log, id_comm_plan, channel_lu, status_lu, response_received_at... | extra: id, comm_plan_id, channel, status |
| `communicationLogs` | 2 | `communication_log` | 2914 | `PARCIAL` | 1/9 | 8 | 1/7 | id-> id_comm_log | faltan: id_comm_log, id_comm_plan, channel_lu, recipient, status_lu... | extra: id, log_date, template_id, channel... |
| `communicationMessages` | 2 | `communication_messages` | 2890 | `PARCIAL` | 3/14 | 11 | 0/7 | id-> id_comm_message | faltan: id_comm_message, id_comm_plan, language_code, channel_lu, is_deleted... | extra: id, comm_plan_id, language, channel... |
| `communicationPlanChannels` | 2 | `communication_plan_channels` | 2854 | `PARCIAL_ALTO` | 2/6 | 4 | 0/7 | id-> id_comm_channel | faltan: id_comm_channel, id_comm_plan, channel_lu, notes | extra: id, comm_plan_id, channel |
| `communicationPlanStakeholders` | 3 | `communication_plan_stakeholders` | 2869 | `PARCIAL` | 3/11 | 8 | 0/7 | id-> id_comm_stakeholder | faltan: id_comm_stakeholder, id_comm_plan, id_user, id_contact, id_supplier... | extra: id, comm_plan_id, user_id |
| `communicationPlans` | 1 | `communication_plans` | 2816 | `PARCIAL` | 7/20 | 13 | 0/7 | id-> id_comm_plan | faltan: id_comm_plan, plan_code, id_organization, id_activation_criteria, id_call_tree... | extra: id, code, organization_id, activation_criteria_id... |
| `communicationTemplates` | 3 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `contactLinks` | 3 | `contact_links` | 2714 | `PARCIAL_ALTO` | 4/7 | 3 | 0/7 | id-> id_contact_link | faltan: id_contact_link, id_contact, created_at | extra: id, contact_id |
| `contacts` | 3 | `contacts` | 1203 | `PARCIAL` | 17/23 | 6 | 7/7 | id-> id_contact | faltan: id_contact, contact_code, id_organization, id_user, id_supplier... | extra: id, code, organization_id, user_id... |
| `continuityPlans` | 16 | `continuity_plans` | 1270 | `PARCIAL` | 11/25 | 14 | 1/7 | id-> id_plan | faltan: id_plan, plan_code, version_label, id_organization, scope_description... | extra: id, code, status, rto_target... |
| `controls` | 19 | `applied_controls` | 535 | `REDISEÑAR` | 0/24 | 24 | 0/7 | id-> id_control | faltan: id_control, id_ref_control, control_code, control_name, description... | extra: id, code, name, type... |
| `executiveReports` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `findingActions` | 10 | `finding_actions` | 1997 | `PARCIAL_ALTO` | 6/10 | 4 | 0/7 | id-> id_action | faltan: id_action, id_finding, status_lu, created_at | extra: id, finding_id, status |
| `findings` | 8 | `findings` | 1959 | `PARCIAL` | 8/24 | 16 | 0/7 | id-> id_finding | faltan: id_finding, finding_code, id_audit, severity_lu, status_lu... | extra: id, code, audit_id, severity... |
| `frameworks` | 4 | `frameworks` | 1769 | `PARCIAL` | 2/15 | 13 | 0/7 | id-> id_framework | faltan: id_framework, framework_code, version_label, description, effective_date... | extra: id, code, version, is_active |
| `incidents` | 12 | `incidents` | 1505 | `PARCIAL` | 10/34 | 24 | 0/7 | id-> id_incident | faltan: id_incident, incident_code, incident_type_lu, severity_lu, status_lu... | extra: id, code, type, severity... |
| `lessonsLearned` | 5 | `lessons_learned` | 2227 | `PARCIAL` | 17/31 | 14 | 0/7 | id-> id_organization | faltan: investment_amount, investment_currency, implementation_date, validation_date, closed_date... | extra: organization_id |
| `locations` | 5 | `locations` | 1078 | `PARCIAL` | 20/23 | 3 | 7/7 | id-> id_location | faltan: id_location, location_code, id_organization | extra: id, code, location_type, type... |
| `macroprocesses` | 5 | `macroprocesses` | 236 | `PARCIAL` | 11/12 | 1 | 7/7 | id-> id_macroprocess | faltan: id_macroprocess | extra: id, code, strategic_importance, governance_owner_id... |
| `managementReviewInputs` | 4 | `management_review_inputs` | 2990 | `PARCIAL_ALTO` | 4/7 | 3 | 0/7 | id-> id_review_input | faltan: id_review_input, id_review, created_at | extra: id, review_id |
| `managementReviewOutputs` | 2 | `management_review_outputs` | 3007 | `PARCIAL_ALTO` | 4/8 | 4 | 0/7 | id-> id_review_output | faltan: id_review_output, id_review, status_lu, created_at | extra: id, review_id, status |
| `managementReviews` | 1 | `management_reviews` | 2966 | `PARCIAL` | 4/15 | 11 | 2/7 | id-> id_review | faltan: id_review, period_start, period_end, scope_description, chair_user_id... | extra: id, review_type, chairperson_user_id, chairperson_name... |
| `organizationalUnits` | 10 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 0/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `organizations` | 5 | `organizations` | 114 | `PARCIAL` | 17/22 | 5 | 4/7 | id-> id_organization | faltan: id_organization, id_parent_org, is_deleted, deleted_at, deleted_by | extra: id, parent_org_id, is_active |
| `planTests` | 6 | `plan_tests` | 1423 | `PARCIAL` | 10/16 | 6 | 0/7 | id-> id_test | faltan: id_test, id_plan, test_code, maturity_type_lu, result_lu... | extra: id, code, plan_id, title |
| `procedures` | 3 | `procedures` | 301 | `PARCIAL` | 10/12 | 2 | 7/7 | id-> id_procedure | faltan: id_procedure, id_subprocess | extra: id, code, subprocess_id, sequence_order... |
| `processes` | 8 | `processes` | 257 | `PARCIAL` | 10/12 | 2 | 7/7 | id-> id_process | faltan: id_process, id_macroprocess | extra: id, code, macroprocess_id, owner... |
| `recoveryProcedures` | 9 | `recovery_procedures` | 1370 | `PARCIAL` | 2/9 | 7 | 0/7 | id-> id_procedure_rec | faltan: id_procedure_rec, id_strategy, step_title, step_description, responsible_role_id... | extra: id, strategy_id, title, responsible_role |
| `recoveryStrategies` | 5 | `recovery_strategies` | 1350 | `PARCIAL_ALTO` | 6/10 | 4 | 0/7 | id-> id_strategy | faltan: id_strategy, id_plan, strategy_name, created_at | extra: id, plan_id, name |
| `resourceCapacities` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `resourceInventory` | 3 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `riskCategories` | 6 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 7/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `riskCauses` | 6 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 7/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `riskEffects` | 6 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 7/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `risks` | 27 | `risks` | 613 | `PARCIAL` | 10/21 | 11 | 1/7 | id-> id_risk | faltan: id_risk, risk_code, id_organization, target_process_type, status_lu... | extra: id, code, status, inherent_probability... |
| `roles` | 5 | `roles` | 408 | `PARCIAL` | 2/7 | 5 | 0/7 | id-> id_role | faltan: id_role, code, description, is_builtin, created_at | extra: id |
| `subprocesses` | 2 | `subprocesses` | 279 | `PARCIAL` | 10/12 | 2 | 7/7 | id-> id_subprocess | faltan: id_subprocess, id_process | extra: id, code, process_id, estimated_duration_minutes... |
| `supplierAssessments` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `supplierContracts` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 4/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `suppliers` | 3 | `suppliers` | 1168 | `PARCIAL` | 19/22 | 3 | 7/7 | id-> id_supplier | faltan: id_supplier, supplier_code, id_organization | extra: id, code, type, supplier_type... |
| `trainingPrograms` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `trainingRecords` | 2 | `(sin mapeo)` | - | `SIN_MAPEO` | 0/0 | - | 2/7 | Definir tabla objetivo en v11 o mover a view-model derivado. |
| `users` | 8 | `users` | 387 | `PARCIAL` | 2/10 | 8 | 0/7 | id-> id_user | faltan: id_user, password_hash, full_name, id_primary_org, status... | extra: id, first_name, last_name, role... |

## 4. Entidades Sin Mapeo (acción requerida)

- `appServices`: definir tabla v11 objetivo o convertir a view-model derivado.
- `bcmsContext`: definir tabla v11 objetivo o convertir a view-model derivado.
- `bcmsRiskAppetites`: definir tabla v11 objetivo o convertir a view-model derivado.
- `bcmsRiskCriteria`: definir tabla v11 objetivo o convertir a view-model derivado.
- `bcmsRiskReviewCadences`: definir tabla v11 objetivo o convertir a view-model derivado.
- `biaDependencies`: definir tabla v11 objetivo o convertir a view-model derivado.
- `communicationTemplates`: definir tabla v11 objetivo o convertir a view-model derivado.
- `executiveReports`: definir tabla v11 objetivo o convertir a view-model derivado.
- `organizationalUnits`: definir tabla v11 objetivo o convertir a view-model derivado.
- `resourceCapacities`: definir tabla v11 objetivo o convertir a view-model derivado.
- `resourceInventory`: definir tabla v11 objetivo o convertir a view-model derivado.
- `riskCategories`: definir tabla v11 objetivo o convertir a view-model derivado.
- `riskCauses`: definir tabla v11 objetivo o convertir a view-model derivado.
- `riskEffects`: definir tabla v11 objetivo o convertir a view-model derivado.
- `supplierAssessments`: definir tabla v11 objetivo o convertir a view-model derivado.
- `supplierContracts`: definir tabla v11 objetivo o convertir a view-model derivado.
- `trainingPrograms`: definir tabla v11 objetivo o convertir a view-model derivado.
- `trainingRecords`: definir tabla v11 objetivo o convertir a view-model derivado.

## 5. Tablas v11 Sin Representación en Datastore

- `application_settings` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:174`)
- `asset_vulnerabilities` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1149`)
- `audit_logs` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2198`)
- `audit_scope_items` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1940`)
- `bia_assessments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:775`)
- `bia_dependency_assessments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1053`)
- `bia_impact_matrix` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:920`)
- `bia_impacts` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:806`)
- `bia_objectives` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:823`)
- `compliance_assessments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1837`)
- `control_compliance_mapping` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1885`)
- `crisis_actions` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1745`)
- `crisis_declarations` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1715`)
- `disruption_scenarios` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:842`)
- `entity_approval_signatures` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:3062`)
- `entity_approvals` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:3029`)
- `entity_tags` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2142`)
- `evidence_versions` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2074`)
- `evidences` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2027`)
- `impact_types` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:895`)
- `incident_impacts` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1657`)
- `incident_regulatory_reports` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1559`)
- `incident_regulatory_submissions` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1608`)
- `incident_timeline` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1638`)
- `lookup_sets` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:196`)
- `lookup_values` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:209`)
- `loss_events` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1674`)
- `notifications` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2175`)
- `organization_macroprocess` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:327`)
- `organization_procedure` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:366`)
- `organization_process` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:340`)
- `organization_subprocess` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:353`)
- `permissions` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:423`)
- `plan_sections` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1315`)
- `process_continuity_profiles` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:470`)
- `process_critical_personnel` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1237`)
- `process_dependencies` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1024`)
- `reference_control_requirement_mapping` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1819`)
- `reference_controls` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:513`)
- `requirement_evaluations` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1864`)
- `requirement_nodes` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1792`)
- `ria_assessments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:948`)
- `ria_discrimination_items` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1003`)
- `ria_discriminations` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:976`)
- `ria_items` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:1450`)
- `risk_assessments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:711`)
- `risk_control_mapping` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:731`)
- `risk_threat_mapping` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:659`)
- `risk_treatments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:747`)
- `role_permissions` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:436`)
- `tags` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:2110`)
- `threats` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:585`)
- `time_buckets` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:868`)
- `user_role_assignments` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:448`)
- `vulnerabilities` (`mockup_v2/docs/BCMS_PostgreSQL_schema_v11.sql:680`)

## 6. Prioridad de Migración Recomendada

1. Catálogos y reglas base BIA/RIA: `application_settings`, `lookup_sets`, `lookup_values`, `time_buckets`, `impact_types`, `disruption_scenarios`.
2. Núcleo BIA/RIA: `bia_assessments`, `bia_impact_matrix`, `ria_assessments`, `ria_items`.
3. Planes y pruebas: `continuity_plans`, `plan_sections`, `plan_tests`, `activation_criteria`.
4. Trazabilidad proceso/dependencias: `organization_*`, `process_dependencies`, `bia_dependency_assessments`, `process_critical_personnel`.
5. Evidencia y aprobación: `evidences`, `evidence_versions`, `entity_approvals`, `entity_approval_signatures`.

## 7. Regla de Auditoría

Para entidades no intermedias en datastore objetivo, incluir y mantener:
- `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`, `isDeleted`
- En persistencia SQL equivalente: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`, `is_deleted`.

Última actualización: 2026-02-13.