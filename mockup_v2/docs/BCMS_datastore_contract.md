# BCMS datastore contract (demo)

This file documents BCMSDataStore.entities in `final_mockup/mockup_v2/js/datastore.js`.
Use it as the single place to know what to add when inserting new data.
For DB level constraints, cross-check `final_mockup/mockup_v2/docs/BCMS_PostgreSQL_schema_v10.sql`.

## Conventions
- IDs are numeric and auto-assigned by `BCMSDataStore.api.create()` except where noted.
- `createdAt` is set on create, `updatedAt` is set on update.
- Dates use ISO `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ` strings.
- Status and enum fields should use values from `BCMSDataStore.lookups` when a lookup exists.
- For any foreign key, the referenced record must exist in the target entity.
- For arrays that contain nested objects (like `scopeItems` or `affectedEntities`), keep the object shape stable.

## Lookup map (main enums)
- `businessCriticality`: CRITICAL, HIGH, MEDIUM, LOW.
- `riskStatus`, `riskDomain`, `treatmentType`, `riskAppetiteLevel`.
- `planType`, `planStatus`.
- `testType`.
- `incidentSeverity`, `incidentStatus`.
- `findingType`.
- `auditType`.
- `lessonSourceType`.
- `changeType`, `changeStatus`.
- `dependencyType`.
- `contextIssueStatus`.
- `stakeholderPriority`.
- `communicationChannel`, `communicationStatus`.
- `managementReviewStatus`.
- `raciResponsibility`.

## Entity rules

### organizations
Required: code, name, orgType, country, isActive.
Optional: legalName, taxId, parentOrgId, industry, timezone, mission, vision, description, level, path, createdAt, createdBy, updatedAt, updatedBy.
Validations: `orgType` in ROOT/COMPANY/DIVISION/DEPARTMENT/AREA/OTHER, `country` ISO-3, `timezone` IANA, `parentOrgId` references organizations.id.
Side effects: if `parentOrgId` changes, recompute `level` and `path` for this and child orgs; update org selects in `final_mockup/mockup_v2/index.html`.

### bcmsContextIssues
Required: issueType, title, status, organizationId, ownerUserId.
Optional: description, impactDescription, riskLevel, reviewedAt, nextReviewDate.
Validations: `issueType` in INTERNAL/EXTERNAL, `status` from `contextIssueStatus`, `riskLevel` from `businessCriticality`.
Side effects: none.

### bcmsStakeholders
Required: stakeholderType, name, priority, organizationId, isActive.
Optional: description, expectations, requirements, contactId, countryCode.
Validations: `priority` from `stakeholderPriority`, `countryCode` ISO-2 or ISO-3.
Side effects: if `contactId` is set, create a `contactLinks` row with `entityType = STAKEHOLDER` and `entityId = bcmsStakeholders.id`.

### bcmsScopes
Required: code, scopeStatement, organizationId, status.
Optional: inclusions, exclusions, approvedBy, approvalDate, nextReviewDate.
Validations: `status` string (use ACTIVE/IN_REVIEW/INACTIVE for consistency).
Side effects: none.

### bcmsPolicies
Required: code, title, version, ownerUserId, status, organizationId.
Optional: description, approvalDate, nextReviewDate.
Validations: `status` string (use ACTIVE/IN_REVIEW/ARCHIVED for consistency).
Side effects: none.

### bcmsObjectives
Required: code, title, targetValue, dueDate, status, ownerUserId, organizationId.
Optional: kpiName, currentValue, unit.
Validations: `status` string (ON_TRACK/IN_PROGRESS/AT_RISK/COMPLETED).
Side effects: none.

### bcmsStrategies
Required: code, title, periodStart, periodEnd, status, ownerUserId, organizationId.
Optional: description, budgetAmount, budgetCurrency, progressPct.
Validations: `status` string (ACTIVE/IN_REVIEW/ARCHIVED).
Side effects: none.

### users
Required: email, firstName, lastName, role, orgUnitId, isActive.
Optional: none.
Validations: email format, `orgUnitId` references organizationalUnits.id.
Side effects: if the user is an owner/chair in other entities, update displays after name changes.

### organizationalUnits
Required: code, name, unitType, isActive.
Optional: abbreviation, parentUnitId, managerUserId.
Validations: `parentUnitId` references organizationalUnits.id, `managerUserId` references users.id.
Side effects: if parent changes, update hierarchy; update unit selects in `final_mockup/mockup_v2/index.html`.

### bcmsRoles
Required: code, name.
Optional: description.
Validations: code unique.
Side effects: if a new role is added, consider updating `bcmsRaciMatrix`.

### bcmsRoleAssignments
Required: roleId, userId, scopeType, scopeId, organizationId.
Optional: isPrimary.
Validations: `roleId` references bcmsRoles.id, `userId` references users.id, `scopeType` in ORGANIZATION/PROCESS/PLAN/SCOPE.
Side effects: keep `isPrimary` unique per (roleId, scopeType, scopeId).

### bcmsRaciMatrix
Required: activityCode, roleId, responsibility.
Optional: none.
Validations: `responsibility` from `raciResponsibility`, `roleId` references bcmsRoles.id.
Side effects: when a new activityCode is introduced, add all required R/A/C/I rows.

### macroprocesses
Required: code, name, category, strategicImportance, governanceOwnerId, status (use isActive), order.
Optional: description, reviewFrequency, lastReviewDate, nextReviewDate, expirationDate, notes, createdAt, createdBy, updatedAt, updatedBy.
Validations: `strategicImportance` from `businessCriticality`, `governanceOwnerId` references users.id.
Side effects: update process macroprocess select in `final_mockup/mockup_v2/index.html`.

### processes
Required: code, name, macroprocessId, businessCriticality, targetRtoMinutes, targetRpoMinutes.
Optional: platform, description, owner, ownerName, ownerUserId, responsibleUnitId, processCategory, maximumTolerableDowntimeMinutes, mtpdMinutes, minimumBusinessContinuityObjective, minimumStaffRequired, operatingFrequency, automationLevel, peakOperationPeriods, regulatoryDrivers, processInputs, processOutputs, applicableFrameworks, rto, rpo, criticidad, estado, ultimaRevision.
Validations: `macroprocessId` references macroprocesses.id, `ownerUserId` references users.id, `responsibleUnitId` references organizationalUnits.id, `businessCriticality` from lookup, numeric fields >= 0.
Side effects: keep `maximumTolerableDowntimeMinutes` and `mtpdMinutes` in sync; update subprocess and BIA references if code changes.

### subprocesses
Required: code, name, processId.
Optional: platform, description, estimatedDurationMinutes, criticalityInherited, overrideCriticality, automationLevel, ownerName, ownerUserId, verificationRequired, notes.
Validations: `processId` references processes.id, `overrideCriticality` from lookup, `automationLevel` in MANUAL/SEMI_AUTOMATED/AUTOMATED.
Side effects: if `criticalityInherited` is true, use parent process criticality when rendering.

### procedures
Required: code, name, subprocessId, sequenceOrder.
Optional: platform, description, estimatedDurationMin, automationTool, ownerName, ownerUserId, executionSteps, requiredSkills, requiredTools, verificationMethod, fallbackProcedure.
Validations: `subprocessId` references subprocesses.id, `sequenceOrder` >= 1.
Side effects: keep sequenceOrder contiguous per subprocess when possible.

### bcmsRiskAppetites
Required: code, organizationId, scopeType, appetiteLevel, status, ownerUserId.
Optional: scopeId, appetiteLevelLu, statement, toleranceNotes, reviewedAt, nextReviewDate.
Validations: `scopeType` in ORGANIZATION/PROCESS/MACROPROCESS/SUBPROCESS/PROCEDURE/GLOBAL; if `scopeType` != GLOBAL then `scopeId` required; `appetiteLevel` from `riskAppetiteLevel`.
Relations: `organizationId` references organizations.id; `ownerUserId` references users.id; `scopeId` must match entity by `scopeType`.
Side effects: when appetite changes, review risk treatments and thresholds for affected scope.

### bcmsRiskCriteria
Required: code, name, organizationId, scoringMethod, likelihoodScale, impactScale, ratingBands, matrix, status.
Optional: scopeType, scopeId, notes, reviewedAt, nextReviewDate, ownerUserId.
Validations: `scoringMethod` in LIKELIHOOD_X_IMPACT; `matrix` size must match scale lengths; `ratingBands` ranges cannot overlap; `matrix` values must exist in `ratingBands.code`.
Relations: `organizationId` references organizations.id; `ownerUserId` references users.id; `scopeId` must match entity by `scopeType` when used.
Side effects: if criteria change, recalculate risk scores on next review.

### bcmsRiskReviewCadences
Required: organizationId, scopeType, frequency, nextReviewDate, ownerUserId, status.
Optional: scopeId, lastReviewDate, criteriaId, appetiteId, notes.
Validations: `scopeType` in ORGANIZATION/PROCESS/MACROPROCESS/SUBPROCESS/PROCEDURE/GLOBAL; if `scopeType` != GLOBAL then `scopeId` required; `frequency` in MONTHLY/QUARTERLY/SEMI_ANNUAL/ANNUAL; `criteriaId` references bcmsRiskCriteria.id; `appetiteId` references bcmsRiskAppetites.id.
Relations: `organizationId` references organizations.id; `ownerUserId` references users.id.
Side effects: when `lastReviewDate` changes, move `nextReviewDate` by `frequency`.

### risks
Required: code, title, riskDomain, riskScope, status, ownerUserId.
Optional: description, targetProcessId, scenario, cause, effect, inherentProbability, inherentImpact, inherentScore, residualProbability, residualImpact, residualScore, treatmentType, controls, createdAt.
Validations: `riskDomain`, `riskScope`, `status`, `treatmentType` from lookups; `targetProcessId` references processes.id.
Side effects: `controls` must reference existing control codes in `controls`; represent SGCN risks here using `riskScope` = GLOBAL, `riskDomain` = INTEGRATED, and a `SGCN-` code prefix.

### controls
Required: code, name, type, status, effectiveness.
Optional: none.
Validations: `type` in PREVENTIVE/DETECTIVE/CORRECTIVE, `status` in IMPLEMENTED/PARTIAL/PLANNED, `effectiveness` in STRONG/ADEQUATE/WEAK.
Side effects: if a control is removed, remove its code from any risk `controls` arrays.

### incidents
Required: code, title, type, severity, status, reportedAt.
Optional: description, reportedBy, resolvedAt, closedAt, affectedProcessId, impactDescription, rootCause, resolutionSummary, lessonsLearned, downtimeMinutes, affectedUsersCount, financialLoss.
Validations: `severity` from `incidentSeverity`, `status` from `incidentStatus`, `reportedBy` references users.id, `affectedProcessId` references processes.id.
Side effects: if incident is closed, consider adding a `lessonsLearned` entry.

### continuityPlans
Required: code, planType, title, status, ownerUserId.
Optional: description, version, targetProcessId, effectiveDate, nextReviewDate, approvedBy, approvedAt, rtoTarget, rpoTarget, activationCriteria, strategies, createdAt.
Validations: `planType` from `planType`, `status` from `planStatus`, `ownerUserId` references users.id, `targetProcessId` references processes.id.
Side effects: when adding a plan, add `activationCriteria`, `recoveryStrategies`, `callTrees`, and `communicationPlans` as needed.

### activationCriteria
Required: planId, code, description, severity.
Optional: thresholdValue, isAutoActivate.
Validations: `planId` references continuityPlans.id, `severity` from `businessCriticality`, `isAutoActivate` boolean.
Side effects: add `activationCriteria` id to `continuityPlans.activationCriteria` array.

### recoveryStrategies
Required: planId, name.
Optional: description, rtoHours, rpoHours, estimatedCost, resourceRequirements, dependencies.
Validations: `planId` references continuityPlans.id.
Side effects: add strategy id to `continuityPlans.strategies` array.

### recoveryProcedures
Required: strategyId, stepOrder, title.
Optional: responsibleRole, estimatedDurationMin.
Validations: `strategyId` references recoveryStrategies.id, `stepOrder` >= 1.
Side effects: keep steps ordered by `stepOrder`.

### callTrees
Required: planId, name, rootContactId.
Optional: description, createdAt.
Validations: `planId` references continuityPlans.id, `rootContactId` references contacts.id.
Side effects: create at least one `callTreeNodes` row with `parentNodeId = null` and `contactId = rootContactId`.

### callTreeNodes
Required: callTreeId, contactId, nodeOrder.
Optional: parentNodeId, escalationWaitMin, notes.
Validations: `callTreeId` references callTrees.id, `contactId` references contacts.id, `parentNodeId` references callTreeNodes.id.
Side effects: keep `nodeOrder` unique within each `callTreeId`.

### communicationPlans
Required: code, name, scopeType, scopeId, organizationId, ownerUserId, status.
Optional: description, activationCriteriaId, callTreeId, lastReviewDate, nextReviewDate.
Validations: `scopeType` in PLAN/PROCESS/ORGANIZATION, `scopeId` points to that entity, `ownerUserId` references users.id.
Side effects: add channels (`communicationPlanChannels`) and stakeholders (`communicationPlanStakeholders`); if `callTreeId` is set it must exist.

### communicationPlanChannels
Required: commPlanId, channel, priorityOrder.
Optional: isPrimary.
Validations: `commPlanId` references communicationPlans.id, `channel` from `communicationChannel`.
Side effects: keep one `isPrimary = true` per `commPlanId`.

### communicationPlanStakeholders
Required: commPlanId, stakeholderType, roleInPlan.
Optional: userId, contactId, externalName, externalEmail, requiredAck.
Validations: `commPlanId` references communicationPlans.id; if stakeholderType=USER then `userId` required; if CONTACT then `contactId` required; if EXTERNAL then `externalName` and `externalEmail` required.
Side effects: none.

### communicationMessages
Required: commPlanId, messageType, templateTitle, templateBody, channel.
Optional: language, isActive.
Validations: `commPlanId` references communicationPlans.id, `channel` from `communicationChannel`.
Side effects: none.

### communicationLog
Required: commPlanId, channel, recipient, status, sentAt.
Optional: none.
Validations: `commPlanId` references communicationPlans.id, `channel` from `communicationChannel`, `status` from `communicationStatus`.
Side effects: none.

### planTests
Required: code, planId, testType, title, testDate.
Optional: scopeDescription, participants, objectives, resultsSummary, successRatePct, issuesFound, recommendations, conductedBy.
Validations: `planId` references continuityPlans.id, `testType` from `testType`, `successRatePct` 0-100.
Side effects: if detailed participants are needed, add `activityParticipants` rows with `activityType = PLAN_TEST`.

### activityParticipants
Required: activityType, activityId, participantType, role.
Optional: userId, contactId, externalName, externalEmail, attendanceStatus, score.
Validations: if participantType=USER then `userId` required; if CONTACT then `contactId` required; if EXTERNAL then `externalName` and `externalEmail` required.
Side effects: none.

### audits
Required: code, auditType, title, organizationId, frameworkId, status.
Optional: objective, scopeDescription, leadAuditorId, plannedStart, plannedEnd, actualStart, actualEnd, conclusion, scopeItems.
Validations: `auditType` from `auditType`, `organizationId` references organizations.id, `frameworkId` references frameworks.id, `leadAuditorId` references users.id.
Side effects: if `scopeItems` is used, keep it aligned with `processes` or other entities listed.

### findings
Required: code, auditId, findingType, title, severity, status.
Optional: description, relatedRequirementCode, rootCause, recommendation, responsibleUserId, dueDate, closedAt.
Validations: `auditId` references audits.id, `findingType` from `findingType`, `responsibleUserId` references users.id.
Side effects: add `findingActions` for corrective/preventive tasks.

### findingActions
Required: findingId, actionType, description, ownerUserId, status.
Optional: dueDate, completedAt, verificationNotes.
Validations: `findingId` references findings.id, `ownerUserId` references users.id.
Side effects: if status = COMPLETED, set `completedAt`.

### managementReviews
Required: code, reviewDate, periodStart, periodEnd, chairUserId, status.
Optional: scopeDescription.
Validations: `chairUserId` references users.id, `status` from `managementReviewStatus`.
Side effects: add inputs and outputs via `managementReviewInputs` and `managementReviewOutputs`.

### managementReviewInputs
Required: reviewId, inputType, entityType, entityId, summary.
Optional: none.
Validations: `reviewId` references managementReviews.id, `entityId` matches `entityType` record.
Side effects: none.

### managementReviewOutputs
Required: reviewId, decisionType, description, ownerUserId, status.
Optional: dueDate.
Validations: `reviewId` references managementReviews.id, `ownerUserId` references users.id.
Side effects: if status = COMPLETED, log outcome in related entity if needed.

### lessonsLearned
Required: id, code, title, sourceType, sourceId, lessonDate, description, status, priority, responsibleId, organizationId.
Optional: rootCause, impactAssessment, recommendations, improvementActions, actionsTaken, effectivenessMetrics, dueDate.
Validations: `sourceType` from `lessonSourceType`, `responsibleId` references users.id.
Side effects: ids are string based (ex: LL-2024-001). Do not use `api.create()` unless its ID generation is changed.

### bcmsChanges
Required: id, changeCode, title, changeType, status, requestedBy, organizationId.
Optional: description, changeCategory, affectedEntities, impactAssessment, riskLevel, reason, expectedBenefits, requestDate, approvedBy, approvalDate, scheduledDate, implementationDate, implementationNotes, verifiedBy, verificationDate, verificationNotes.
Validations: `changeType` from `changeType`, `status` from `changeStatus`, user references must exist.
Side effects: ids are string based (ex: CHG-2024-001). If change is implemented, update the target entity fields and log evidence.

### biaDependencies
Required: processId, dependencyType, referenceId, referenceName, criticality.
Optional: none.
Validations: `processId` references processes.id, `dependencyType` from `dependencyType`, `criticality` from `businessCriticality`.
Side effects: keep `referenceId` consistent with its entity (process, supplier, asset, etc).

### locations
Required: code, name, type.
Optional: address, city, isPrimary.
Validations: `type` in HEADQUARTERS/HOSPITAL/BRANCH/DATACENTER/DR_SITE.
Side effects: if `isPrimary` true, ensure only one primary per location type.

### suppliers
Required: code, name, supplierTypeLu, countryCode, riskTierLu, criticalityLu, isActive.
Optional: supplierType, type, taxId, website, city, contractStart, contractEnd, organizationId, address, slaSummary.
Validations: `countryCode` ISO-2, `supplierTypeLu` and `riskTierLu` should map to UI select values, `criticalityLu` maps to `businessCriticality`.
Side effects: if `supplierTypeLu`/`riskTierLu`/`criticalityLu` change, keep `supplierType`, `riskTier`, `criticality` strings aligned.

### contacts
Required: code, firstName, lastName, email, isActive.
Optional: phonePrimary, phoneSecondary, mobile, jobTitle, department, organizationId, userId, supplierId, contactRoleId, isEmergencyContact, notes.
Validations: `organizationId` references organizations.id, `userId` references users.id, `supplierId` references suppliers.id.
Side effects: when inserting a contact, create `contactLinks` to each related entity (organization, supplier, plan, stakeholder).

### contactLinks
Required: contactId, entityType, entityId.
Optional: relationshipType, isPrimary.
Validations: `contactId` references contacts.id, `entityType` in ORGANIZATION/SUPPLIER/PLAN/STAKEHOLDER/PROCESS.
Side effects: keep one `isPrimary = true` per (contactId, entityType, entityId).

### frameworks
Required: code, name, version, issuingBody, isActive.
Optional: none.
Validations: code unique.
Side effects: if a new framework is added, update `audits.frameworkId` references and any UI lists.
