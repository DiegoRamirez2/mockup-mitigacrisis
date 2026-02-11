# BCMS v10 model and datastore mapping (internal notes)

Purpose
- This note is for future sessions: what was added in v10 and how it was landed in the datastore.
- Focus is on ISO 22301 gaps (context, stakeholders, scope, comms, management review, RACI).

Schema v10 additions (summary)
- Governance and context: bcms_context_issues, bcms_stakeholders, bcms_scopes, bcms_policies, bcms_objectives, bcms_strategies.
- Contact polymorphic links: contact_links (keeps contacts table intact, adds entity_type/entity_id linkage).
- RACI: bcms_roles, bcms_role_assignments, bcms_raci_matrix.
- Communications: communication_plans, communication_plan_channels, communication_plan_stakeholders, communication_messages, communication_log.
- Activity participants: activity_participants (polymorphic, supports EXTERNAL participants).
- Management review: management_reviews, management_review_inputs, management_review_outputs.

Datastore landing (final_mockup/mockup_v2/js/datastore.js)
- Meta updated to schemaVersion v10 and version 2.1.
- New lookups:
  - contextIssueStatus
  - stakeholderPriority
  - communicationChannel
  - communicationStatus
  - managementReviewStatus
  - raciResponsibility

Entities added (datastore keys)
- bcmsContextIssues
- bcmsStakeholders
- bcmsScopes
- bcmsPolicies
- bcmsObjectives
- bcmsStrategies
- bcmsRoles
- bcmsRoleAssignments
- bcmsRaciMatrix
- contacts
- contactLinks
- callTrees
- callTreeNodes
- communicationPlans
- communicationPlanChannels
- communicationPlanStakeholders
- communicationMessages
- communicationLog
- activityParticipants
- managementReviews
- managementReviewInputs
- managementReviewOutputs

Key modeling choices
- Context, stakeholders, scope, policies, objectives, strategies are separate arrays to map ISO clauses 4 to 6.
- Contacts remain a person entity; contactLinks provides polymorphic linking without breaking referential logic.
- Communications are modeled as plans + channels + stakeholders + messages + log. activationCriteriaId and callTreeId connect to existing plan data.
- Activity participants are polymorphic and support non-users via participantType=EXTERNAL and external_name/email/phone.
- Management review uses inputs/outputs arrays so ISO 9.3 can be shown explicitly.
- RACI is separated from RBAC: bcmsRoles + bcmsRoleAssignments + bcmsRaciMatrix.

Datastore field mapping (high level)
- bcms_context_issues -> bcmsContextIssues (issueType, riskLevel, status, ownerUserId, organizationId, dates)
- bcms_stakeholders -> bcmsStakeholders (stakeholderType, expectations, requirements, priority, contactId)
- bcms_scopes -> bcmsScopes (scopeStatement, inclusions, exclusions, approval info)
- bcms_policies -> bcmsPolicies (code, title, version, approval, ownerUserId)
- bcms_objectives -> bcmsObjectives (kpiName, target/current, ownerUserId)
- bcms_strategies -> bcmsStrategies (period, budget, progress)
- contact_links -> contactLinks (entityType/entityId with contactId)
- communication_* -> communicationPlans / Channels / Stakeholders / Messages / Log
- activity_participants -> activityParticipants (activityType, participantType, userId/contactId/external)
- management_review_* -> managementReviews / Inputs / Outputs
- RACI -> bcmsRoles / bcmsRoleAssignments / bcmsRaciMatrix

Caveats and follow-ups
- index.html is not yet wired to the new entities. Functions need to render Gobierno, Comunicaciones, RACI, and Revision por direccion.
- Some legacy fields remain in processes for mockup parity; v10 intent is to rely on *_bcms_data for BCMS attributes.
- Contacts are minimal; additional fields can be added if UI needs more detail.

Files touched
- final_mockup/mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql
- final_mockup/mockup_v2/js/datastore.js
- final_mockup/mockup_v2/docs/ISO_22301_schema_changes.md
- final_mockup/mockup_v2/docs/ISO_22301_schema_changes_v2.md
