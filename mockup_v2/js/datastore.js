/**
 * ============================================================================
 * BCMS DataStore v2.1 - Centralizado y Alineado con v10.sql + ISO 22301
 * ============================================================================
 * 
 * Este archivo contiene TODOS los datos del sistema en un único lugar.
 * Alineado con: BCMS_PostgreSQL_schema_v10.sql
 * Cumple con: ISO 22301:2019
 * 
 * Estructura:
 *   BCMSDataStore.entities     → Arrays de datos por entidad
 *   BCMSDataStore.lookups      → Catálogos de valores (lookup_values)
 *   BCMSDataStore.config       → Configuración del sistema
 *   BCMSDataStore.api          → Métodos CRUD
 * 
 * @version 2.1.0
 * @date 2026-01-21
 */

const BCMSDataStore = {
  
  // ============================================================================
  // METADATOS DEL SISTEMA
  // ============================================================================
  meta: {
    version: '2.1.0',
    lastUpdated: new Date().toISOString(),
    schemaVersion: 'v10',
    isoCompliance: 'ISO 22301:2019'
  },

  // ============================================================================
  // LOOKUP VALUES (Catálogos de referencia - tabla lookup_sets/lookup_values)
  // ============================================================================
  lookups: {
    
    // Criticidad de procesos (process_bcms_data.business_criticality)
    businessCriticality: [
      { id: 1, code: 'CRITICAL', label: 'Crítico', color: '#dc3545', order: 1 },
      { id: 2, code: 'HIGH', label: 'Alto', color: '#fd7e14', order: 2 },
      { id: 3, code: 'MEDIUM', label: 'Medio', color: '#ffc107', order: 3 },
      { id: 4, code: 'LOW', label: 'Bajo', color: '#28a745', order: 4 }
    ],
    
    // Estados de riesgos
    riskStatus: [
      { id: 1, code: 'IDENTIFIED', label: 'Identificado', color: '#6c757d' },
      { id: 2, code: 'ANALYZING', label: 'En Análisis', color: '#17a2b8' },
      { id: 3, code: 'TREATING', label: 'En Tratamiento', color: '#ffc107' },
      { id: 4, code: 'MONITORED', label: 'Monitoreado', color: '#28a745' },
      { id: 5, code: 'ACCEPTED', label: 'Aceptado', color: '#6f42c1' },
      { id: 6, code: 'CLOSED', label: 'Cerrado', color: '#343a40' }
    ],
    
    // Dominios de riesgo (risks.risk_domain)
    riskDomain: [
      { id: 1, code: 'CONTINUITY', label: 'Continuidad', icon: 'bi-shield-check' },
      { id: 2, code: 'CYBER', label: 'Ciberseguridad', icon: 'bi-cpu' },
      { id: 3, code: 'OPERATIONAL', label: 'Operacional', icon: 'bi-gear' },
      { id: 4, code: 'INTEGRATED', label: 'Integrado', icon: 'bi-diagram-3' }
    ],

    // Apetito de riesgo (no existe en esquema, requerido por ISO 22301)
    riskAppetiteLevel: [
      { id: 1, code: 'LOW', label: 'Bajo', color: '#28a745' },
      { id: 2, code: 'MEDIUM', label: 'Medio', color: '#ffc107' },
      { id: 3, code: 'HIGH', label: 'Alto', color: '#fd7e14' },
      { id: 4, code: 'CRITICAL', label: 'Critico', color: '#dc3545' }
    ],
    
    // Tipo de tratamiento de riesgo (risk_treatments.treatment_type)
    treatmentType: [
      { id: 1, code: 'MITIGATE', label: 'Mitigar' },
      { id: 2, code: 'TRANSFER', label: 'Transferir' },
      { id: 3, code: 'ACCEPT', label: 'Aceptar' },
      { id: 4, code: 'AVOID', label: 'Evitar' }
    ],
    
    // Tipos de plan (continuity_plans.plan_type)
    planType: [
      { id: 1, code: 'BCP', label: 'Plan de Continuidad de Negocio' },
      { id: 2, code: 'DRP', label: 'Plan de Recuperación de Desastres' },
      { id: 3, code: 'CMP', label: 'Plan de Gestión de Crisis' },
      { id: 4, code: 'ERP', label: 'Plan de Respuesta a Emergencias' },
      { id: 5, code: 'IRP', label: 'Plan de Respuesta a Incidentes' }
    ],
    
    // Estados de planes
    planStatus: [
      { id: 1, code: 'DRAFT', label: 'Borrador', color: '#6c757d' },
      { id: 2, code: 'IN_REVIEW', label: 'En Revisión', color: '#17a2b8' },
      { id: 3, code: 'APPROVED', label: 'Aprobado', color: '#28a745' },
      { id: 4, code: 'ACTIVE', label: 'Activo', color: '#007bff' },
      { id: 5, code: 'EXPIRED', label: 'Expirado', color: '#dc3545' },
      { id: 6, code: 'RETIRED', label: 'Retirado', color: '#343a40' }
    ],
    
    // Tipos de prueba/ejercicio (plan_tests.test_type)
    testType: [
      { id: 1, code: 'TABLETOP', label: 'Ejercicio de Mesa' },
      { id: 2, code: 'WALKTHROUGH', label: 'Recorrido Guiado' },
      { id: 3, code: 'SIMULATION', label: 'Simulación' },
      { id: 4, code: 'FULL_EXERCISE', label: 'Ejercicio Completo' },
      { id: 5, code: 'TECHNICAL_TEST', label: 'Prueba Técnica' }
    ],
    
    // Severidad de incidentes (incidents.severity_lu)
    incidentSeverity: [
      { id: 1, code: 'CRITICAL', label: 'Crítico', color: '#dc3545' },
      { id: 2, code: 'HIGH', label: 'Alto', color: '#fd7e14' },
      { id: 3, code: 'MEDIUM', label: 'Medio', color: '#ffc107' },
      { id: 4, code: 'LOW', label: 'Bajo', color: '#28a745' },
      { id: 5, code: 'INFO', label: 'Informativo', color: '#17a2b8' }
    ],
    
    // Estados de incidentes
    incidentStatus: [
      { id: 1, code: 'REPORTED', label: 'Reportado', color: '#6c757d' },
      { id: 2, code: 'ACKNOWLEDGED', label: 'Reconocido', color: '#17a2b8' },
      { id: 3, code: 'IN_PROGRESS', label: 'En Progreso', color: '#ffc107' },
      { id: 4, code: 'ESCALATED', label: 'Escalado', color: '#fd7e14' },
      { id: 5, code: 'RESOLVED', label: 'Resuelto', color: '#28a745' },
      { id: 6, code: 'CLOSED', label: 'Cerrado', color: '#343a40' }
    ],
    
    // Tipos de hallazgo (findings.finding_type)
    findingType: [
      { id: 1, code: 'NC_MAJOR', label: 'No Conformidad Mayor', color: '#dc3545' },
      { id: 2, code: 'NC_MINOR', label: 'No Conformidad Menor', color: '#fd7e14' },
      { id: 3, code: 'OBSERVATION', label: 'Observación', color: '#ffc107' },
      { id: 4, code: 'OPPORTUNITY', label: 'Oportunidad de Mejora', color: '#17a2b8' },
      { id: 5, code: 'POSITIVE', label: 'Hallazgo Positivo', color: '#28a745' }
    ],
    
    // Tipos de auditoría (audits.audit_type)
    auditType: [
      { id: 1, code: 'INTERNAL', label: 'Interna' },
      { id: 2, code: 'EXTERNAL', label: 'Externa' },
      { id: 3, code: 'CERTIFICATION', label: 'Certificación' },
      { id: 4, code: 'SURVEILLANCE', label: 'Vigilancia' },
      { id: 5, code: 'SPECIAL', label: 'Especial' }
    ],
    
    // Origen de lección aprendida (lessons_learned.source_type)
    lessonSourceType: [
      { id: 1, code: 'INCIDENT', label: 'Incidente' },
      { id: 2, code: 'CRISIS', label: 'Crisis' },
      { id: 3, code: 'EXERCISE', label: 'Ejercicio' },
      { id: 4, code: 'AUDIT', label: 'Auditoría' },
      { id: 5, code: 'EXTERNAL_EVENT', label: 'Evento Externo' },
      { id: 6, code: 'BEST_PRACTICE', label: 'Buena Práctica' }
    ],
    
    // Tipos de cambio BCMS (bcms_changes.change_type)
    changeType: [
      { id: 1, code: 'PROCESS_CHANGE', label: 'Cambio de Proceso' },
      { id: 2, code: 'SCOPE_CHANGE', label: 'Cambio de Alcance' },
      { id: 3, code: 'POLICY_CHANGE', label: 'Cambio de Política' },
      { id: 4, code: 'STRUCTURE_CHANGE', label: 'Cambio Estructural' },
      { id: 5, code: 'PLAN_CHANGE', label: 'Cambio de Plan' },
      { id: 6, code: 'STRATEGY_CHANGE', label: 'Cambio de Estrategia' }
    ],
    
    // Estados de cambio BCMS
    changeStatus: [
      { id: 1, code: 'PENDING', label: 'Pendiente', color: '#6c757d' },
      { id: 2, code: 'APPROVED', label: 'Aprobado', color: '#28a745' },
      { id: 3, code: 'IN_PROGRESS', label: 'En Implementación', color: '#17a2b8' },
      { id: 4, code: 'IMPLEMENTED', label: 'Implementado', color: '#007bff' },
      { id: 5, code: 'REJECTED', label: 'Rechazado', color: '#dc3545' },
      { id: 6, code: 'CANCELLED', label: 'Cancelado', color: '#343a40' }
    ],
    
    // Tipo de dependencia BIA (bia_dependencies.dependency_type)
    dependencyType: [
      { id: 1, code: 'UPSTREAM_PROCESS', label: 'Proceso Proveedor' },
      { id: 2, code: 'DOWNSTREAM_PROCESS', label: 'Proceso Cliente' },
      { id: 3, code: 'SUPPLIER', label: 'Proveedor Externo' },
      { id: 4, code: 'ASSET', label: 'Activo' },
      { id: 5, code: 'APPLICATION', label: 'Aplicación' },
      { id: 6, code: 'PERSONNEL', label: 'Personal' }
    ],

    // Catalogos BIA para matriz de levantamiento
    biaTimeBuckets: [
      { id: 1, code: 'LT_1H', label: '< 1 HORA', order: 1 },
      { id: 2, code: 'H1_2', label: 'ENTRE 1 Y 2 HORAS', order: 2 },
      { id: 3, code: 'H2_6', label: 'ENTRE 2 Y 6 HORAS', order: 3 },
      { id: 4, code: 'H6_24', label: 'ENTRE 6 Y 24 HORAS', order: 4 },
      { id: 5, code: 'H24_36', label: 'ENTRE 24 Y 36 HORAS', order: 5 },
      { id: 6, code: 'GT_36H', label: '> 36 HORAS', order: 6 }
    ],
    biaImpactCategories: [
      { id: 1, code: 'MONETARIO', label: 'Monetario', order: 1 },
      { id: 2, code: 'PROCESOS', label: 'Procesos', order: 2 },
      { id: 3, code: 'REPUTACIONAL', label: 'Reputacional', order: 3 },
      { id: 4, code: 'NORMATIVO', label: 'Normativo', order: 4 },
      { id: 5, code: 'CLIENTES', label: 'Clientes', order: 5 }
    ],
    biaImpactLevels: [
      { id: 1, code: 'LOW', label: 'Bajo', order: 1 },
      { id: 2, code: 'MEDIUM_LOW', label: 'Medio Bajo', order: 2 },
      { id: 3, code: 'MEDIUM', label: 'Medio', order: 3 },
      { id: 4, code: 'MEDIUM_HIGH', label: 'Medio Alto', order: 4 },
      { id: 5, code: 'HIGH', label: 'Alto', order: 5 }
    ],
    biaInterviewPeople: [
      { id: 1, code: 'BIA-PER-001', name: 'Claudio Saavedra Araya', role: 'Responsable de Proceso', source: 'BIA Operar Convenios de Pago.xlsx' },
      { id: 2, code: 'BIA-PER-002', name: 'Karen Beltrán Henríquez', role: 'Jefe de Continuidad de Negocio', source: 'BIA Operar Convenios de Pago.xlsx' },
      { id: 3, code: 'BIA-PER-003', name: 'Patricia Morales', role: 'Jefa Continuidad', source: 'Mockup' },
      { id: 4, code: 'BIA-PER-004', name: 'María González', role: 'Jefa de Ventas', source: 'Mockup' },
      { id: 5, code: 'BIA-PER-005', name: 'Luis Soto', role: 'Jefe Operaciones Hospitalarias', source: 'Mockup' }
    ],

    // Estados de contexto BCMS
    contextIssueStatus: [
      { id: 1, code: 'OPEN', label: 'Abierto', color: '#ffc107' },
      { id: 2, code: 'REVIEWED', label: 'En revision', color: '#17a2b8' },
      { id: 3, code: 'CLOSED', label: 'Cerrado', color: '#28a745' }
    ],

    // Prioridad de partes interesadas
    stakeholderPriority: [
      { id: 1, code: 'HIGH', label: 'Alta', color: '#dc3545' },
      { id: 2, code: 'MEDIUM', label: 'Media', color: '#ffc107' },
      { id: 3, code: 'LOW', label: 'Baja', color: '#28a745' }
    ],

    // Canales de comunicacion
    communicationChannel: [
      { id: 1, code: 'EMAIL', label: 'Email' },
      { id: 2, code: 'SMS', label: 'SMS' },
      { id: 3, code: 'VOICE', label: 'Telefonia' },
      { id: 4, code: 'APP', label: 'App' },
      { id: 5, code: 'WEB', label: 'Web' },
      { id: 6, code: 'MEDIA', label: 'Medios' },
      { id: 7, code: 'REGULATOR', label: 'Regulador' }
    ],

    // Estado de comunicacion
    communicationStatus: [
      { id: 1, code: 'PENDING', label: 'Pendiente', color: '#6c757d' },
      { id: 2, code: 'SENT', label: 'Enviado', color: '#17a2b8' },
      { id: 3, code: 'DELIVERED', label: 'Entregado', color: '#28a745' },
      { id: 4, code: 'FAILED', label: 'Fallido', color: '#dc3545' },
      { id: 5, code: 'ACK', label: 'Confirmado', color: '#007bff' }
    ],

    // Estado revision por la direccion
    managementReviewStatus: [
      { id: 1, code: 'PLANNED', label: 'Planificada', color: '#6c757d' },
      { id: 2, code: 'IN_PROGRESS', label: 'En curso', color: '#17a2b8' },
      { id: 3, code: 'COMPLETED', label: 'Completada', color: '#28a745' },
      { id: 4, code: 'CANCELLED', label: 'Cancelada', color: '#dc3545' }
    ],

    // Roles RACI
    raciResponsibility: [
      { id: 1, code: 'R', label: 'Responsible' },
      { id: 2, code: 'A', label: 'Accountable' },
      { id: 3, code: 'C', label: 'Consulted' },
      { id: 4, code: 'I', label: 'Informed' }
    ],

    // Criticidad de proveedores (supplier criticality)
    supplierCriticality: [
      { id: 1, code: 'CRITICAL', label: 'Crítico', color: '#dc3545' },
      { id: 2, code: 'HIGH', label: 'Alto', color: '#fd7e14' },
      { id: 3, code: 'MEDIUM', label: 'Medio', color: '#ffc107' },
      { id: 4, code: 'LOW', label: 'Bajo', color: '#28a745' }
    ],

    // Tipos de recursos (resource types)
    resourceTypes: [
      { id: 1, code: 'PERSONNEL', label: 'Personal', icon: 'bi-persons' },
      { id: 2, code: 'FACILITY', label: 'Instalaciones', icon: 'bi-building' },
      { id: 3, code: 'TECHNOLOGY', label: 'Tecnología', icon: 'bi-laptop' },
      { id: 4, code: 'EQUIPMENT', label: 'Equipamiento', icon: 'bi-toolbox' },
      { id: 5, code: 'INVENTORY', label: 'Inventario', icon: 'bi-boxes' },
      { id: 6, code: 'SUPPLIER', label: 'Proveedor', icon: 'bi-people' }
    ],

    // Tipos de capacitación (training types)
    trainingTypes: [
      { id: 1, code: 'INDUCTION', label: 'Inducción' },
      { id: 2, code: 'AWARENESS', label: 'Concienciación' },
      { id: 3, code: 'TECHNICAL', label: 'Técnico' },
      { id: 4, code: 'DRILL', label: 'Simulacro' },
      { id: 5, code: 'EXERCISE', label: 'Ejercicio' },
      { id: 6, code: 'CERTIFICATION', label: 'Certificación' }
    ],

    // Tipos de reporte (report types)
    reportTypes: [
      { id: 1, code: 'MONTHLY', label: 'Mensual' },
      { id: 2, code: 'QUARTERLY', label: 'Trimestral' },
      { id: 3, code: 'SEMI_ANNUAL', label: 'Semestral' },
      { id: 4, code: 'ANNUAL', label: 'Anual' },
      { id: 5, code: 'AD_HOC', label: 'Ad-hoc' },
      { id: 6, code: 'REGULATORY', label: 'Regulatorio' }
    ],

    // Estados de recursos
    resourceStatus: [
      { id: 1, code: 'AVAILABLE', label: 'Disponible', color: '#28a745' },
      { id: 2, code: 'IN_USE', label: 'En Uso', color: '#17a2b8' },
      { id: 3, code: 'MAINTENANCE', label: 'Mantenimiento', color: '#ffc107' },
      { id: 4, code: 'UNAVAILABLE', label: 'No Disponible', color: '#dc3545' },
      { id: 5, code: 'RETIRED', label: 'Retirado', color: '#6c757d' }
    ],

    // Estados de capacitación
    trainingStatus: [
      { id: 1, code: 'SCHEDULED', label: 'Programado', color: '#6c757d' },
      { id: 2, code: 'IN_PROGRESS', label: 'En Curso', color: '#17a2b8' },
      { id: 3, code: 'COMPLETED', label: 'Completado', color: '#28a745' },
      { id: 4, code: 'CANCELLED', label: 'Cancelado', color: '#dc3545' },
      { id: 5, code: 'EXPIRED', label: 'Expirado', color: '#fd7e14' }
    ],

    // Tipos de contrato de proveedor
    contractTypes: [
      { id: 1, code: 'SERVICE', label: 'Servicio' },
      { id: 2, code: 'CLOUD', label: 'Cloud/SaaS' },
      { id: 3, code: 'LICENSE', label: 'Licencia' },
      { id: 4, code: 'MAINTENANCE', label: 'Mantenimiento' },
      { id: 5, code: 'CONSULTING', label: 'Consultoría' }
    ],

    // Frecuencia de capacitación
    trainingFrequency: [
      { id: 1, code: 'ONBOARDING', label: 'Al ingreso' },
      { id: 2, code: 'MONTHLY', label: 'Mensual' },
      { id: 3, code: 'QUARTERLY', label: 'Trimestral' },
      { id: 4, code: 'SEMI_ANNUAL', label: 'Semestral' },
      { id: 5, code: 'ANNUAL', label: 'Anual' },
      { id: 6, code: 'BIENNIAL', label: 'Bienal' }
    ]
  },

  // ============================================================================
  // ENTIDADES PRINCIPALES (Alineadas con v10.sql)
  // ============================================================================
  entities: {
    
    // -------------------------------------------------------------------------
    // ORGANIZACIÓN (organizations) - ISO 22301 Cláusula 4.1
    // -------------------------------------------------------------------------
    organizations: [
      {
        id: 1,
        code: 'ORG-001',
        name: 'Grupo Mitiga',
        legalName: 'Mitiga Resilience SpA',
        taxId: '76.123.456-7',
        orgType: 'ROOT',
        parentOrgId: null,
        industry: 'Tecnologia / Consultoria',
        country: 'CHL',
        timezone: 'America/Santiago',
        isActive: true,
        mission: 'Impulsar resiliencia organizacional con soluciones BCMS.',
        vision: 'Ser referente regional en continuidad y resiliencia.',
        description: 'Holding principal de servicios de continuidad y resiliencia.',
        level: 0,
        path: '1',
        createdAt: '2024-01-10T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-10T12:00:00Z',
        updatedBy: 'system'
      },
      {
        id: 2,
        code: 'ORG-002',
        name: 'Mitiga Chile',
        legalName: 'Mitiga Chile Ltda',
        taxId: '76.234.567-8',
        orgType: 'COMPANY',
        parentOrgId: 1,
        industry: 'Tecnologia',
        country: 'CHL',
        timezone: 'America/Santiago',
        isActive: true,
        mission: 'Gestionar la operacion local y clientes clave.',
        vision: 'Consolidar liderazgo en continuidad operativa.',
        description: 'Entidad operativa en Chile.',
        level: 1,
        path: '1/2',
        createdAt: '2024-01-12T09:30:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-12T12:00:00Z',
        updatedBy: 'system'
      },
      {
        id: 3,
        code: 'ORG-003',
        name: 'Gerencia TI',
        legalName: '',
        taxId: '76.111.222-3',
        orgType: 'DEPARTMENT',
        parentOrgId: 2,
        industry: 'Tecnologia',
        country: 'CHL',
        timezone: 'America/Santiago',
        isActive: true,
        mission: 'Asegurar plataformas y continuidad tecnologica.',
        vision: 'TI resiliente y escalable.',
        description: 'Area responsable de tecnologia y soporte.',
        level: 2,
        path: '1/2/3',
        createdAt: '2024-01-20T10:15:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-15T12:00:00Z',
        updatedBy: 'system'
      },
      {
        id: 4,
        code: 'ORG-004',
        name: 'Area Desarrollo',
        legalName: '',
        taxId: '76.111.222-3',
        orgType: 'AREA',
        parentOrgId: 3,
        industry: 'Tecnologia',
        country: 'CHL',
        timezone: 'America/Santiago',
        isActive: true,
        mission: 'Desarrollar soluciones y mejoras continuas.',
        vision: 'Entregas agiles y robustas.',
        description: 'Equipo de desarrollo y mantenimiento.',
        level: 3,
        path: '1/2/3/4',
        createdAt: '2024-02-01T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-18T12:00:00Z',
        updatedBy: 'system'
      },
      {
        id: 5,
        code: 'ORG-005',
        name: 'Gerencia Comercial',
        legalName: '',
        taxId: '',
        orgType: 'DEPARTMENT',
        parentOrgId: 2,
        industry: 'Comercial',
        country: 'CHL',
        timezone: 'America/Santiago',
        isActive: true,
        mission: 'Gestionar ventas y relacion con clientes.',
        vision: 'Crecimiento sostenible del portafolio.',
        description: 'Area de ventas y relacion con clientes.',
        level: 2,
        path: '1/2/5',
        createdAt: '2024-02-10T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-20T12:00:00Z',
        updatedBy: 'system'
      }
    ],

    // -------------------------------------------------------------------------
    // CONTEXTO BCMS (bcms_context_issues) - ISO 22301 Clausula 4.1
    // -------------------------------------------------------------------------
    bcmsContextIssues: [
      {
        id: 1,
        issueType: 'EXTERNAL',
        title: 'Regulatory change',
        description: 'Nueva exigencia de reporte de incidentes en 72h',
        impactDescription: 'Requiere actualizar procedimientos de notificacion',
        riskLevel: 'HIGH',
        status: 'OPEN',
        ownerUserId: 6,
        organizationId: 1,
        reviewedAt: '2024-10-01',
        nextReviewDate: '2025-04-01'
      },
      {
        id: 2,
        issueType: 'INTERNAL',
        title: 'Cloud migration',
        description: 'Migracion de servicios core a nube',
        impactDescription: 'Ajustes en DRP y pruebas tecnicas',
        riskLevel: 'MEDIUM',
        status: 'REVIEWED',
        ownerUserId: 1,
        organizationId: 1,
        reviewedAt: '2024-11-15',
        nextReviewDate: '2025-05-15'
      }
    ],

    // -------------------------------------------------------------------------
    // PARTES INTERESADAS (bcms_stakeholders) - ISO 22301 Clausula 4.2
    // -------------------------------------------------------------------------
    bcmsStakeholders: [
      {
        id: 1,
        stakeholderType: 'REGULATOR',
        name: 'CMF',
        description: 'Regulador financiero',
        expectations: 'Continuidad de servicios criticos',
        requirements: 'Reporte de incidentes en 72h',
        priority: 'HIGH',
        contactId: 1,
        organizationId: 1,
        countryCode: 'CL',
        isActive: true
      },
      {
        id: 2,
        stakeholderType: 'CUSTOMER',
        name: 'Afiliados',
        description: 'Clientes finales',
        expectations: 'Canales digitales disponibles',
        requirements: 'Comunicacion oportuna ante interrupciones',
        priority: 'HIGH',
        organizationId: 1,
        countryCode: 'CL',
        isActive: true
      },
      {
        id: 3,
        stakeholderType: 'SUPPLIER',
        name: 'Proveedor cloud',
        description: 'Servicios de infraestructura',
        expectations: 'Cumplimiento de SLA',
        requirements: 'Notificacion de fallas criticas',
        priority: 'MEDIUM',
        contactId: 2,
        organizationId: 1,
        countryCode: 'US',
        isActive: true
      }
    ],

    // -------------------------------------------------------------------------
    // ALCANCE BCMS (bcms_scopes) - ISO 22301 Clausula 4.3
    // -------------------------------------------------------------------------
    bcmsScopes: [
      {
        id: 1,
        code: 'SCOPE-BCMS-001',
        scopeStatement: 'SGCN para procesos criticos de atencion, licencias y TI',
        inclusions: 'Procesos criticos, infraestructura TI, sitios principales',
        exclusions: 'Operaciones no criticas y sedes no esenciales',
        organizationId: 1,
        approvedBy: 6,
        approvalDate: '2024-03-01',
        nextReviewDate: '2025-03-01',
        status: 'ACTIVE'
      }
    ],

    // -------------------------------------------------------------------------
    // POLITICAS BCMS (bcms_policies) - ISO 22301 Clausula 5.2
    // -------------------------------------------------------------------------
    bcmsPolicies: [
      {
        id: 1,
        code: 'POL-BCMS-001',
        title: 'Business Continuity Policy',
        version: 'v4.0',
        description: 'Politica general de continuidad',
        approvalDate: '2024-03-15',
        nextReviewDate: '2025-03-15',
        ownerUserId: 6,
        status: 'ACTIVE',
        organizationId: 1
      }
    ],

    // -------------------------------------------------------------------------
    // OBJETIVOS BCMS (bcms_objectives) - ISO 22301 Clausula 6.2
    // -------------------------------------------------------------------------
    bcmsObjectives: [
      {
        id: 1,
        code: 'OBJ-001',
        title: 'RTO promedio menor a 4h en procesos criticos',
        kpiName: 'RTO promedio',
        targetValue: '4h',
        currentValue: '3.8h',
        unit: 'hours',
        dueDate: '2025-12-31',
        status: 'ON_TRACK',
        ownerUserId: 6,
        organizationId: 1
      },
      {
        id: 2,
        code: 'OBJ-002',
        title: '100% procesos criticos con BCP actualizado',
        kpiName: 'Cobertura BCP',
        targetValue: '100%',
        currentValue: '89%',
        unit: 'percent',
        dueDate: '2025-12-31',
        status: 'IN_PROGRESS',
        ownerUserId: 2,
        organizationId: 1
      }
    ],

    // -------------------------------------------------------------------------
    // ESTRATEGIAS BCMS (bcms_strategies) - ISO 22301 Clausula 8.3
    // -------------------------------------------------------------------------
    bcmsStrategies: [
      {
        id: 1,
        code: 'STR-BCMS-2025',
        title: 'Operational resilience 2025-2027',
        description: 'Mejorar resiliencia operativa y pruebas regulares',
        periodStart: '2025-01-01',
        periodEnd: '2027-12-31',
        status: 'ACTIVE',
        ownerUserId: 6,
        budgetAmount: 1200000,
        budgetCurrency: 'USD',
        progressPct: 60,
        organizationId: 1
      }
    ],

    // -------------------------------------------------------------------------
    // USUARIOS (users) - ISO 22301 Clausula 5.3
    // -------------------------------------------------------------------------
    users: [
      { id: 1, email: 'admin@achs.cl', firstName: 'Carlos', lastName: 'Mendoza', role: 'Administrador BCMS', profile: 'Administrador', orgUnitId: 5, isActive: true, mfaEnabled: true, lastAccess: '2025-12-11T09:15:00Z' },
      { id: 2, email: 'jperez@achs.cl', firstName: 'Juan', lastName: 'Perez', role: 'Coordinador BIA', profile: 'BCM Manager', orgUnitId: 2, isActive: true, mfaEnabled: true, lastAccess: '2025-12-11T08:45:00Z' },
      { id: 3, email: 'mgarcia@achs.cl', firstName: 'Maria', lastName: 'Garcia', role: 'Analista de Riesgos', profile: 'Analista BCMS', orgUnitId: 4, isActive: true, mfaEnabled: true, lastAccess: '2025-12-10T17:30:00Z' },
      { id: 4, email: 'alopez@achs.cl', firstName: 'Ana', lastName: 'Lopez', role: 'Coordinadora de Crisis', profile: 'BCM Manager', orgUnitId: 6, isActive: true, mfaEnabled: true, lastAccess: '2025-12-11T07:20:00Z' },
      { id: 5, email: 'rrodriguez@achs.cl', firstName: 'Roberto', lastName: 'Rodriguez', role: 'Auditor Interno', profile: 'Auditor', orgUnitId: 7, isActive: true, mfaEnabled: true, lastAccess: '2025-12-09T16:45:00Z' },
      { id: 6, email: 'lsoto@achs.cl', firstName: 'Luis', lastName: 'Soto', role: 'Gerente de Continuidad', profile: 'Administrador', orgUnitId: 1, isActive: true, mfaEnabled: true, lastAccess: '2025-12-11T10:00:00Z' },
      { id: 7, email: 'pmorales@achs.cl', firstName: 'Patricia', lastName: 'Morales', role: 'Especialista DRP', profile: 'Analista BCMS', orgUnitId: 5, isActive: true, mfaEnabled: true, lastAccess: '2025-12-10T14:20:00Z' },
      { id: 8, email: 'rsilva@achs.cl', firstName: 'Ricardo', lastName: 'Silva', role: 'Viewer', profile: 'Viewer', orgUnitId: 3, isActive: true, mfaEnabled: true, lastAccess: '2025-12-08T11:30:00Z' }
    ],

    // Roles y Permisos RBAC
    roles: [
      { 
        id: 1, 
        name: 'Administrador', 
        permissions: { dashboard: 'Full', riesgos: 'Full', bcpdrp: 'Full', incidentes: 'Full', crisis: 'Full', pruebas: 'Full', auditoria: 'Full', config: 'Full', reportes: 'Full', usuarios: 'Full' }
      },
      { 
        id: 2, 
        name: 'BCM Manager', 
        permissions: { dashboard: 'RW', riesgos: 'RW', bcpdrp: 'RW', incidentes: 'RW', crisis: 'RW', pruebas: 'RW', auditoria: 'R', config: 'None', reportes: 'RW', usuarios: 'None' }
      },
      { 
        id: 3, 
        name: 'Auditor', 
        permissions: { dashboard: 'R', riesgos: 'R', bcpdrp: 'R', incidentes: 'R', crisis: 'R', pruebas: 'R', auditoria: 'RW', config: 'None', reportes: 'RW', usuarios: 'None' }
      },
      { 
        id: 4, 
        name: 'Analista BCMS', 
        permissions: { dashboard: 'R', riesgos: 'RW', bcpdrp: 'RW', incidentes: 'RW', crisis: 'R', pruebas: 'RW', auditoria: 'R', config: 'None', reportes: 'R', usuarios: 'None' }
      },
      { 
        id: 5, 
        name: 'Viewer', 
        permissions: { dashboard: 'R', riesgos: 'R', bcpdrp: 'R', incidentes: 'R', crisis: 'R', pruebas: 'R', auditoria: 'R', config: 'None', reportes: 'R', usuarios: 'None' }
      }
    ],

    // -------------------------------------------------------------------------
    // UNIDADES ORGANIZACIONALES (organizational_units) - Segun v10.sql
    // -------------------------------------------------------------------------
    organizationalUnits: [
      { id: 1, code: 'UO-001', name: 'Gerencia General', abbreviation: 'G. General', unitType: 'GERENCIA', parentUnitId: null, managerUserId: 6, isActive: true },
      { id: 2, code: 'UO-002', name: 'Operaciones', abbreviation: 'Operaciones', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: 2, isActive: true },
      { id: 3, code: 'UO-003', name: 'Atencion al Cliente', abbreviation: 'At. Cliente', unitType: 'SUBGERENCIA', parentUnitId: 2, managerUserId: null, isActive: true },
      { id: 4, code: 'UO-004', name: 'Gestion de Riesgos', abbreviation: 'Riesgos', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: 3, isActive: true },
      { id: 5, code: 'UO-005', name: 'Tecnologias de la Informacion', abbreviation: 'TI', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: 1, isActive: true },
      { id: 6, code: 'UO-006', name: 'Seguridad', abbreviation: 'Seguridad', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: 4, isActive: true },
      { id: 7, code: 'UO-007', name: 'Auditoria Interna', abbreviation: 'Auditoria', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: 5, isActive: true },
      { id: 8, code: 'UO-008', name: 'Finanzas', abbreviation: 'Finanzas', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: null, isActive: true },
      { id: 9, code: 'UO-009', name: 'Recursos Humanos', abbreviation: 'RRHH', unitType: 'GERENCIA', parentUnitId: 1, managerUserId: null, isActive: true },
      { id: 10, code: 'UO-010', name: 'Infraestructura TI', abbreviation: 'Infra TI', unitType: 'SUBGERENCIA', parentUnitId: 5, managerUserId: 7, isActive: true }
    ],

    // -------------------------------------------------------------------------
    // ROLES BCMS (bcms_roles)
    // -------------------------------------------------------------------------
    bcmsRoles: [
      { id: 1, code: 'BCMS_MANAGER', name: 'Gerente BCMS', description: 'Responsable del BCMS' },
      { id: 2, code: 'PROCESS_OWNER', name: 'Responsable de proceso', description: 'Responsable de la continuidad del proceso' },
      { id: 3, code: 'CRISIS_LEAD', name: 'Lider de crisis', description: 'Lidera la respuesta a crisis' },
      { id: 4, code: 'COMMUNICATIONS', name: 'Lider de comunicaciones', description: 'Gestiona el plan de comunicaciones' }
    ],

    // -------------------------------------------------------------------------
    // ASIGNACIONES BCMS (bcms_role_assignments)
    // -------------------------------------------------------------------------
    bcmsRoleAssignments: [
      { id: 1, roleId: 1, userId: 6, scopeType: 'ORGANIZATION', scopeId: 1, organizationId: 1, isPrimary: true },
      { id: 2, roleId: 2, userId: 2, scopeType: 'PROCESS', scopeId: 1, organizationId: 1, isPrimary: true },
      { id: 3, roleId: 3, userId: 4, scopeType: 'PLAN', scopeId: 6, organizationId: 1, isPrimary: true },
      { id: 4, roleId: 4, userId: 4, scopeType: 'PLAN', scopeId: 1, organizationId: 1, isPrimary: true }
    ],

    // -------------------------------------------------------------------------
    // MATRIZ RACI (bcms_raci_matrix)
    // -------------------------------------------------------------------------
    bcmsRaciMatrix: [
      { id: 1, activityCode: 'BIA', roleId: 2, responsibility: 'R' },
      { id: 2, activityCode: 'BIA', roleId: 1, responsibility: 'A' },
      { id: 3, activityCode: 'PLAN_TEST', roleId: 4, responsibility: 'C' },
      { id: 4, activityCode: 'INCIDENT_RESPONSE', roleId: 3, responsibility: 'R' }
    ],

    // -------------------------------------------------------------------------
    // MACROPROCESOS (macroprocesses)
    // -------------------------------------------------------------------------
    macroprocesses: [
      {
        id: 1,
        code: 'MP-001',
        name: 'Procesos Estrategicos',
        category: 'Estrategico',
        description: 'Procesos de direccion y gobierno',
        strategicImportance: 'CRITICAL',
        governanceOwnerId: 1,
        reviewFrequency: 'QUARTERLY',
        lastReviewDate: '2024-09-15',
        nextReviewDate: '2024-12-15',
        expirationDate: '2025-12-31',
        notes: 'Seguimiento trimestral por alta direccion.',
        isActive: true,
        order: 1,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-15T09:30:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'MP-002',
        name: 'Procesos Operativos',
        category: 'Operativo',
        description: 'Procesos core de operacion',
        strategicImportance: 'HIGH',
        governanceOwnerId: 2,
        reviewFrequency: 'QUARTERLY',
        lastReviewDate: '2024-08-01',
        nextReviewDate: '2024-11-01',
        expirationDate: '2025-12-31',
        notes: 'Seguimiento trimestral.',
        isActive: true,
        order: 2,
        createdAt: '2024-01-15T10:30:00Z',
        createdBy: 'Roberto Rodriguez',
        updatedAt: '2024-08-01T09:00:00Z',
        updatedBy: 'Roberto Rodriguez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'MP-003',
        name: 'Procesos de Soporte',
        category: 'Soporte',
        description: 'Procesos de soporte corporativo',
        strategicImportance: 'MEDIUM',
        governanceOwnerId: 3,
        reviewFrequency: 'ANNUAL',
        lastReviewDate: '2024-07-20',
        nextReviewDate: '2025-01-20',
        expirationDate: '2025-12-31',
        notes: 'Revisiones semestrales.',
        isActive: true,
        order: 3,
        createdAt: '2024-01-15T11:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedAt: '2024-07-20T09:00:00Z',
        updatedBy: 'Carlos Mendoza',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 4,
        code: 'MP-004',
        name: 'Tecnologia de Informacion',
        category: 'Soporte TI',
        description: 'Gobierno y soporte TI',
        strategicImportance: 'CRITICAL',
        governanceOwnerId: 4,
        reviewFrequency: 'QUARTERLY',
        lastReviewDate: '2024-10-01',
        nextReviewDate: '2025-01-01',
        expirationDate: '2025-06-30',
        notes: 'Revision trimestral de capacidades TI.',
        isActive: true,
        order: 4,
        createdAt: '2024-02-01T10:00:00Z',
        createdBy: 'Patricia Morales',
        updatedAt: '2024-10-01T09:00:00Z',
        updatedBy: 'Patricia Morales',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 5,
        code: 'MP-005',
        name: 'Gestion de Soporte',
        category: 'Soporte',
        description: 'Procesos de apoyo operativo',
        strategicImportance: 'MEDIUM',
        governanceOwnerId: 3,
        reviewFrequency: 'ANNUAL',
        lastReviewDate: '2024-06-15',
        nextReviewDate: '2025-06-15',
        expirationDate: '2025-12-31',
        notes: 'Macroproceso heredado para continuidad de datos.',
        isActive: true,
        order: 5,
        createdAt: '2024-01-20T10:00:00Z',
        createdBy: 'Juan Perez',
        updatedAt: '2024-06-15T09:00:00Z',
        updatedBy: 'Juan Perez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // PROCESOS (processes + process_bcms_data) - ISO 22301 Cláusula 8.2.2
    // -------------------------------------------------------------------------
    processes: [
      {
        id: 1,
        code: 'PROC-001',
        name: 'Gestion de Ventas',
        macroprocessId: 2,
        platform: 'Salesforce',
        description: 'Gestion comercial de ventas y relacion con clientes.',
        owner: 'Maria Gonzalez',
        ownerName: 'Maria Gonzalez',
        ownerUserId: 2,
        responsibleUnitId: 1,
        businessCriticality: 'CRITICAL',
        processCategory: 'Comercial',
        targetRtoMinutes: 240,
        targetRpoMinutes: 60,
        maximumTolerableDowntimeMinutes: 480,
        mtpdMinutes: 480,
        minimumBusinessContinuityObjective: 'Mantener ventas en 60% durante contingencias.',
        minimumStaffRequired: 4,
        operatingFrequency: 'DAILY',
        automationLevel: 'SEMI_AUTOMATED',
        peakOperationPeriods: 'Fin de mes',
        regulatoryDrivers: 'Ley 19.628',
        processInputs: '["Prospectos", "Oportunidades"]',
        processOutputs: '["Contratos", "Ingresos"]',
        applicableFrameworks: '["ISO 22301"]',
        rto: 4,
        rpo: 1,
        criticidad: 'Critico',
        estado: 'Activo',
        ultimaRevision: '2024-11-10',
        createdAt: '2024-01-05T09:00:00Z',
        createdBy: 'Juan Perez',
        updatedAt: '2024-11-10T10:00:00Z',
        updatedBy: 'Roberto Rodriguez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'PROC-002',
        name: 'Gestion de Cobranzas',
        macroprocessId: 2,
        platform: 'SAP',
        description: 'Cobranza y gestion de cuentas por cobrar.',
        owner: 'Ana Munoz',
        ownerName: 'Ana Munoz',
        ownerUserId: 5,
        responsibleUnitId: 2,
        businessCriticality: 'HIGH',
        processCategory: 'Finanzas',
        targetRtoMinutes: 480,
        targetRpoMinutes: 240,
        maximumTolerableDowntimeMinutes: 1440,
        mtpdMinutes: 1440,
        minimumBusinessContinuityObjective: 'Mantener cobranzas en 50%.',
        minimumStaffRequired: 3,
        operatingFrequency: 'DAILY',
        automationLevel: 'SEMI_AUTOMATED',
        peakOperationPeriods: 'Cierre mensual',
        regulatoryDrivers: 'Normativa tributaria',
        processInputs: '["Facturas", "Pagos"]',
        processOutputs: '["Recaudacion", "Estados de cuenta"]',
        applicableFrameworks: '["ISO 22301"]',
        rto: 8,
        rpo: 4,
        criticidad: 'Alto',
        estado: 'Activo',
        ultimaRevision: '2024-10-20',
        createdAt: '2024-01-12T09:00:00Z',
        createdBy: 'Maria Garcia',
        updatedAt: '2024-10-20T10:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'PROC-003',
        name: 'Desarrollo de Software',
        macroprocessId: 4,
        platform: 'Azure DevOps',
        description: 'Desarrollo y mantenimiento de aplicaciones.',
        owner: 'Pedro Soto',
        ownerName: 'Pedro Soto',
        ownerUserId: 4,
        responsibleUnitId: 3,
        businessCriticality: 'CRITICAL',
        processCategory: 'TI',
        targetRtoMinutes: 120,
        targetRpoMinutes: 30,
        maximumTolerableDowntimeMinutes: 240,
        mtpdMinutes: 240,
        minimumBusinessContinuityObjective: 'Mantener CI/CD y soporte minimo.',
        minimumStaffRequired: 5,
        operatingFrequency: 'DAILY',
        automationLevel: 'AUTOMATED',
        peakOperationPeriods: 'Lanzamientos',
        regulatoryDrivers: 'ISO 27001',
        processInputs: '["Backlog", "Requerimientos"]',
        processOutputs: '["Releases", "Codigo"]',
        applicableFrameworks: '["ISO 22301", "ISO 27001"]',
        rto: 2,
        rpo: 0.5,
        criticidad: 'Critico',
        estado: 'Activo',
        ultimaRevision: '2024-11-05',
        createdAt: '2024-02-05T09:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedAt: '2024-11-05T10:00:00Z',
        updatedBy: 'Ana Lopez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 4,
        code: 'PROC-004',
        name: 'Gestion de RRHH',
        macroprocessId: 3,
        platform: 'Workday',
        description: 'Administracion del ciclo de vida del personal.',
        owner: 'Laura Torres',
        ownerName: 'Laura Torres',
        ownerUserId: 6,
        responsibleUnitId: 4,
        businessCriticality: 'MEDIUM',
        processCategory: 'RRHH',
        targetRtoMinutes: 1440,
        targetRpoMinutes: 480,
        maximumTolerableDowntimeMinutes: 4320,
        mtpdMinutes: 4320,
        minimumBusinessContinuityObjective: 'Operar con equipo minimo.',
        minimumStaffRequired: 2,
        operatingFrequency: 'DAILY',
        automationLevel: 'SEMI_AUTOMATED',
        peakOperationPeriods: 'Fin de mes',
        regulatoryDrivers: 'Codigo del Trabajo',
        processInputs: '["Contratos", "Solicitudes"]',
        processOutputs: '["Nomina", "Reportes"]',
        applicableFrameworks: '["ISO 22301"]',
        rto: 24,
        rpo: 8,
        criticidad: 'Medio',
        estado: 'Activo',
        ultimaRevision: '2024-09-30',
        createdAt: '2024-02-20T09:00:00Z',
        createdBy: 'Patricia Morales',
        updatedAt: '2024-09-30T10:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 5,
        code: 'PRO-005',
        name: 'Gestion de TI',
        macroprocessId: 5,
        description: 'Administracion de infraestructura tecnologica',
        owner: 'Carlos Mendoza',
        ownerName: 'Carlos Mendoza',
        ownerUserId: 1,
        responsibleUnitId: 5, // Tecnologias de la Informacion
        businessCriticality: 'CRITICAL',
        targetRtoMinutes: 60,
        targetRpoMinutes: 15,
        mtpdMinutes: 120,
        mbcoPercent: 90,
        rto: 1,
        rpo: 0.25,
        criticidad: 'Critico',
        estado: 'Activo',
        ultimaRevision: '2024-12-20',
        createdAt: '2024-03-01T09:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedAt: '2024-12-20T10:00:00Z',
        updatedBy: 'Carlos Mendoza',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 6,
        code: 'PRO-006',
        name: 'Prevencion de Riesgos',
        macroprocessId: 4,
        description: 'Asesoria en prevencion de riesgos laborales',
        owner: 'Patricia Morales',
        ownerName: 'Patricia Morales',
        ownerUserId: 7,
        responsibleUnitId: 6, // Seguridad
        businessCriticality: 'MEDIUM',
        targetRtoMinutes: 1440,
        targetRpoMinutes: 480,
        mtpdMinutes: 4320,
        mbcoPercent: 40,
        rto: 24,
        rpo: 8,
        criticidad: 'Medio',
        estado: 'Activo',
        ultimaRevision: '2024-11-15',
        createdAt: '2024-03-10T09:00:00Z',
        createdBy: 'Patricia Morales',
        updatedAt: '2024-11-15T10:00:00Z',
        updatedBy: 'Roberto Rodriguez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 7,
        code: 'PRO-007',
        name: 'Gestion de Hospitales',
        macroprocessId: 3,
        description: 'Operacion de centros hospitalarios',
        owner: 'Luis Soto',
        ownerName: 'Luis Soto',
        ownerUserId: 6,
        responsibleUnitId: 2, // Operaciones
        businessCriticality: 'CRITICAL',
        targetRtoMinutes: 30,
        targetRpoMinutes: 15,
        mtpdMinutes: 60,
        mbcoPercent: 95,
        rto: 0.5,
        rpo: 0.25,
        criticidad: 'Critico',
        estado: 'Activo',
        ultimaRevision: '2024-12-22',
        createdAt: '2024-04-01T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-12-22T10:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 8,
        code: 'PRO-008',
        name: 'Gestion de Recursos Humanos',
        macroprocessId: 5,
        description: 'Administracion del personal',
        owner: 'Maria Garcia',
        ownerName: 'Maria Garcia',
        ownerUserId: 3,
        responsibleUnitId: 9, // Recursos Humanos
        businessCriticality: 'MEDIUM',
        targetRtoMinutes: 1440,
        targetRpoMinutes: 240,
        mtpdMinutes: 2880,
        mbcoPercent: 50,
        rto: 24,
        rpo: 4,
        criticidad: 'Medio',
        estado: 'Activo',
        ultimaRevision: '2024-10-30',
        createdAt: '2024-04-15T09:00:00Z',
        createdBy: 'Maria Garcia',
        updatedAt: '2024-10-30T10:00:00Z',
        updatedBy: 'Juan Perez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // SUBPROCESOS (subprocesses)
    // -------------------------------------------------------------------------
    subprocesses: [
      {
        id: 1,
        code: 'SP-001',
        name: 'Captacion de prospectos',
        processId: 1,
        platform: 'HubSpot',
        description: 'Captacion y registro de prospectos.',
        estimatedDurationMinutes: 120,
        criticalityInherited: true,
        overrideCriticality: '',
        automationLevel: 'SEMI_AUTOMATED',
        ownerName: 'Pedro Soto',
        ownerUserId: 3,
        verificationRequired: true,
        notes: 'Seguimiento diario.',
        createdAt: '2024-03-05T09:00:00Z',
        createdBy: 'Juan Perez',
        updatedAt: '2024-09-10T09:00:00Z',
        updatedBy: 'Maria Garcia',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'SP-002',
        name: 'Calificacion de Oportunidades',
        processId: 1,
        platform: 'Salesforce',
        description: 'Calificacion y priorizacion de oportunidades.',
        estimatedDurationMinutes: 60,
        criticalityInherited: false,
        overrideCriticality: 'HIGH',
        automationLevel: 'MANUAL',
        ownerName: 'Maria Gonzalez',
        ownerUserId: 2,
        verificationRequired: false,
        notes: '',
        createdAt: '2024-03-12T09:00:00Z',
        createdBy: 'Maria Garcia',
        updatedAt: '2024-09-12T09:00:00Z',
        updatedBy: 'Juan Perez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // PROCEDIMIENTOS (procedures)
    // -------------------------------------------------------------------------
    procedures: [
      {
        id: 1,
        code: 'PRC-001',
        name: 'Registrar prospecto en CRM',
        subprocessId: 1,
        platform: 'HubSpot',
        description: 'Registro de prospecto en CRM.',
        sequenceOrder: 1,
        estimatedDurationMin: 15,
        automationTool: 'HubSpot Workflows',
        ownerName: 'Pedro Soto',
        ownerUserId: 3,
        executionSteps: '[{"step":1,"action":"Registrar prospecto"}]',
        requiredSkills: '["CRM","Ventas"]',
        requiredTools: '["HubSpot"]',
        verificationMethod: 'Revisar registro en CRM.',
        fallbackProcedure: 'Registro manual en planilla.',
        createdAt: '2024-03-20T09:00:00Z',
        createdBy: 'Juan Perez',
        updatedAt: '2024-09-15T09:00:00Z',
        updatedBy: 'Maria Garcia',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'PRC-002',
        name: 'Calificar prospecto',
        subprocessId: 1,
        platform: 'HubSpot',
        description: 'Evaluacion inicial de prospecto.',
        sequenceOrder: 2,
        estimatedDurationMin: 20,
        automationTool: '',
        ownerName: 'Maria Gonzalez',
        ownerUserId: 2,
        executionSteps: '[{"step":1,"action":"Evaluar criterios"}]',
        requiredSkills: '["Ventas"]',
        requiredTools: '["HubSpot"]',
        verificationMethod: 'Checklist en CRM.',
        fallbackProcedure: '',
        createdAt: '2024-03-22T09:00:00Z',
        createdBy: 'Maria Garcia',
        updatedAt: '2024-09-16T09:00:00Z',
        updatedBy: 'Juan Perez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'PRC-003',
        name: 'Enviar Email de Bienvenida',
        subprocessId: 1,
        platform: 'HubSpot',
        description: 'Envio de email automatico.',
        sequenceOrder: 3,
        estimatedDurationMin: 5,
        automationTool: 'Automatizado',
        ownerName: 'Sistema',
        ownerUserId: 0,
        executionSteps: '[{"step":1,"action":"Disparar workflow"}]',
        requiredSkills: '["Marketing"]',
        requiredTools: '["HubSpot"]',
        verificationMethod: 'Confirmar email enviado.',
        fallbackProcedure: 'Enviar manualmente.',
        createdAt: '2024-03-25T09:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedAt: '2024-09-20T09:00:00Z',
        updatedBy: 'Carlos Mendoza',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],


    // -------------------------------------------------------------------------
    // APETITO DE RIESGO (bcms_risk_appetites) - ISO 22301 6.1 / 8.2.3.d
    // -------------------------------------------------------------------------
    bcmsRiskAppetites: [
      {
        id: 1,
        code: 'APP-001',
        organizationId: 1,
        scopeType: 'ORGANIZATION',
        scopeId: 1,
        appetiteLevel: 'MEDIUM',
        appetiteLevelLu: 2,
        statement: 'Se acepta riesgo residual medio para continuidad, con controles y planes vigentes.',
        toleranceNotes: 'Riesgos criticos requieren plan de tratamiento y aprobacion de direccion.',
        reviewedAt: '2024-09-15',
        nextReviewDate: '2025-09-15',
        ownerUserId: 6,
        status: 'ACTIVE',
        createdAt: '2024-01-15T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-15T10:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'APP-002',
        organizationId: 2,
        scopeType: 'ORGANIZATION',
        scopeId: 2,
        appetiteLevel: 'LOW',
        appetiteLevelLu: 1,
        statement: 'Se acepta riesgo residual bajo para procesos clinicos criticos.',
        toleranceNotes: 'No se acepta riesgo alto sin mitigaciones y respaldo.',
        reviewedAt: '2024-08-01',
        nextReviewDate: '2025-08-01',
        ownerUserId: 6,
        status: 'ACTIVE',
        createdAt: '2024-02-01T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-08-01T10:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // CRITERIOS DE EVALUACION DE RIESGO (bcms_risk_criteria) - ISO 22301 8.2.1
    // -------------------------------------------------------------------------
    bcmsRiskCriteria: [
      {
        id: 1,
        code: 'RC-001',
        name: 'Matriz 5x5 continuidad',
        organizationId: 1,
        scopeType: 'ORGANIZATION',
        scopeId: 1,
        scoringMethod: 'LIKELIHOOD_X_IMPACT',
        likelihoodScale: [
          { level: 1, label: 'Muy baja', description: 'Evento raro (1 vez en 10+ anos)', score: 1 },
          { level: 2, label: 'Baja', description: 'Evento poco probable', score: 2 },
          { level: 3, label: 'Media', description: 'Evento posible', score: 3 },
          { level: 4, label: 'Alta', description: 'Evento probable', score: 4 },
          { level: 5, label: 'Muy alta', description: 'Evento frecuente', score: 5 }
        ],
        impactScale: [
          { level: 1, label: 'Bajo', description: 'Impacto menor y reversible', score: 1 },
          { level: 2, label: 'Medio', description: 'Impacto moderado con recuperacion rapida', score: 2 },
          { level: 3, label: 'Alto', description: 'Impacto significativo en servicios clave', score: 3 },
          { level: 4, label: 'Critico', description: 'Interrupcion severa con efectos prolongados', score: 4 },
          { level: 5, label: 'Catastrofico', description: 'Interrupcion mayor o perdida prolongada', score: 5 }
        ],
        ratingBands: [
          { code: 'LOW', label: 'Bajo', minScore: 1, maxScore: 4, color: '#28a745' },
          { code: 'MEDIUM', label: 'Medio', minScore: 5, maxScore: 9, color: '#ffc107' },
          { code: 'HIGH', label: 'Alto', minScore: 10, maxScore: 16, color: '#fd7e14' },
          { code: 'CRITICAL', label: 'Critico', minScore: 17, maxScore: 25, color: '#dc3545' }
        ],
        matrix: [
          ['LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'HIGH'],
          ['LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'HIGH'],
          ['MEDIUM', 'MEDIUM', 'HIGH', 'HIGH', 'CRITICAL'],
          ['MEDIUM', 'HIGH', 'HIGH', 'CRITICAL', 'CRITICAL'],
          ['HIGH', 'HIGH', 'CRITICAL', 'CRITICAL', 'CRITICAL']
        ],
        notes: 'Se usa para riesgos de continuidad y ciberseguridad.',
        reviewedAt: '2024-09-15',
        nextReviewDate: '2025-03-15',
        ownerUserId: 6,
        status: 'ACTIVE',
        createdAt: '2024-01-15T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-15T10:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // CALENDARIO DE REVISION DE RIESGOS (bcms_risk_review_cadences)
    // -------------------------------------------------------------------------
    bcmsRiskReviewCadences: [
      {
        id: 1,
        organizationId: 1,
        scopeType: 'ORGANIZATION',
        scopeId: 1,
        frequency: 'QUARTERLY',
        lastReviewDate: '2024-09-30',
        nextReviewDate: '2024-12-31',
        ownerUserId: 6,
        status: 'ACTIVE',
        criteriaId: 1,
        appetiteId: 1,
        notes: 'Revisiones trimestrales de riesgos BCMS.',
        createdAt: '2024-01-20T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-30T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        organizationId: 2,
        scopeType: 'PROCESS',
        scopeId: 1,
        frequency: 'SEMI_ANNUAL',
        lastReviewDate: '2024-08-15',
        nextReviewDate: '2025-02-15',
        ownerUserId: 2,
        status: 'ACTIVE',
        criteriaId: 1,
        appetiteId: 2,
        notes: 'Proceso clinico revisado semestralmente.',
        createdAt: '2024-02-15T09:00:00Z',
        createdBy: 'Juan Perez',
        updatedAt: '2024-08-15T12:00:00Z',
        updatedBy: 'Juan Perez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // CATALOGOS DE RIESGO (taxonomia para identificacion y analisis)
    // -------------------------------------------------------------------------
    riskCategories: [
      {
        id: 1,
        code: 'RISK-OPE-001',
        name: 'Interrupcion de Servicios',
        riskType: 'Operacional',
        severity: 'HIGH',
        description: 'Caida o indisponibilidad de servicios criticos',
        examples: 'Apagon, falla infraestructura, desastre natural',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-10T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-10T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'RISK-CYB-001',
        name: 'Ciberataque / Ransomware',
        riskType: 'Ciberseguridad',
        severity: 'CRITICAL',
        description: 'Ataque malicioso que compromete disponibilidad e integridad',
        examples: 'Ransomware, DDoS, malware, phishing',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-12T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-12T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'RISK-TEC-001',
        name: 'Falla Tecnologica',
        riskType: 'Tecnologico',
        severity: 'HIGH',
        description: 'Falla de hardware, software o infraestructura TI',
        examples: 'Servidor caido, error critico, corrupcion de datos',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-15T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-15T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 4,
        code: 'RISK-REG-001',
        name: 'Incumplimiento Normativo',
        riskType: 'Regulatorio',
        severity: 'HIGH',
        description: 'Violacion de leyes, regulaciones o estandares aplicables',
        examples: 'Ley 21.663, GDPR, ISO 27001, CMF',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-18T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-18T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 5,
        code: 'RISK-HUM-001',
        name: 'Error Humano / Falta de Personal',
        riskType: 'Operacional',
        severity: 'MEDIUM',
        description: 'Error no intencional o perdida de personal clave',
        examples: 'Configuracion erronea, renuncia masiva, enfermedad',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-20T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-20T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 6,
        code: 'RISK-PRV-001',
        name: 'Falla de Proveedor Critico',
        riskType: 'Operacional',
        severity: 'HIGH',
        description: 'Incumplimiento o cese de servicios por proveedor',
        examples: 'AWS caido, ISP sin servicio, proveedor quiebra',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-22T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-22T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    riskCauses: [
      {
        id: 1,
        code: 'CAUSA-TEC-001',
        name: 'Falla de hardware',
        category: 'Tecnologica',
        description: 'Componente fisico dejo de funcionar',
        examples: 'Disco duro, servidor, switch de red',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-10T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-10T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'CAUSA-TEC-002',
        name: 'Bug en software',
        category: 'Tecnologica',
        description: 'Error de codigo que causa comportamiento anomalo',
        examples: 'Excepcion no controlada, fuga de memoria, logica erronea',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-12T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-12T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'CAUSA-HUM-001',
        name: 'Error humano no intencional',
        category: 'Humana',
        description: 'Accion incorrecta sin intencion maliciosa',
        examples: 'Configuracion incorrecta, eliminacion accidental',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-15T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-15T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 4,
        code: 'CAUSA-PRO-001',
        name: 'Procedimiento inadecuado',
        category: 'Proceso',
        description: 'Proceso documentado es insuficiente o desactualizado',
        examples: 'Falta de pasos, proceso obsoleto, sin validacion',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-18T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-18T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 5,
        code: 'CAUSA-EXT-001',
        name: 'Evento externo (natural/social)',
        category: 'Externa',
        description: 'Causa fuera del control de la organizacion',
        examples: 'Terremoto, apagon general, huelga, pandemia',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-20T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-20T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 6,
        code: 'CAUSA-SEC-001',
        name: 'Ataque cibernetico',
        category: 'Tecnologica',
        description: 'Accion maliciosa intencional contra sistemas',
        examples: 'Ransomware, DDoS, phishing, exfiltracion',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-22T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-22T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    riskEffects: [
      {
        id: 1,
        code: 'EFEC-FIN-001',
        name: 'Perdida financiera directa',
        effectType: 'Financiero',
        severity: 'HIGH',
        description: 'Costos monetarios inmediatos o perdida de ingresos',
        examples: 'Multas, compensacion clientes, ingresos no percibidos',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-10T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-10T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'EFEC-OPE-001',
        name: 'Interrupcion de servicio',
        effectType: 'Operacional',
        severity: 'CRITICAL',
        description: 'Servicios no disponibles para usuarios/clientes',
        examples: 'Caida de aplicacion, procesos detenidos',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-12T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-12T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'EFEC-REP-001',
        name: 'Danio reputacional',
        effectType: 'Reputacional',
        severity: 'HIGH',
        description: 'Perdida de confianza de clientes/mercado',
        examples: 'Mala prensa, redes sociales, perdida de contratos',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-15T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-15T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 4,
        code: 'EFEC-REG-001',
        name: 'Incumplimiento normativo',
        effectType: 'Regulatorio',
        severity: 'HIGH',
        description: 'Violacion de leyes o regulaciones',
        examples: 'Sancion regulador, revocacion licencias, auditoria',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-18T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-18T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 5,
        code: 'EFEC-CLI-001',
        name: 'Afectacion a clientes',
        effectType: 'Cliente',
        severity: 'HIGH',
        description: 'Clientes no pueden acceder o usar servicios',
        examples: 'Quejas formales, SLA incumplido, cancelaciones',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-20T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-20T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 6,
        code: 'EFEC-DAT-001',
        name: 'Perdida/compromiso de datos',
        effectType: 'Operacional',
        severity: 'CRITICAL',
        description: 'Datos borrados, alterados o expuestos',
        examples: 'Brecha de datos, corrupcion BD, robo informacion',
        organizationId: 1,
        isActive: true,
        createdAt: '2024-05-22T09:00:00Z',
        createdBy: 'Luis Soto',
        updatedAt: '2024-09-22T12:00:00Z',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // RIESGOS (risks + risk_assessments) - ISO 22301 Cláusula 8.2.3
    // -------------------------------------------------------------------------
    risks: [
      {
        id: 1,
        code: 'RSK-001',
        title: 'Caída de sistemas críticos',
        description: 'Falla generalizada de infraestructura TI que afecta operaciones',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 5,
        scenario: 'Falla del datacenter principal por corte eléctrico prolongado',
        cause: 'Falla en UPS o generadores, mantenimiento inadecuado',
        effect: 'Interrupción total de servicios digitales, afectación a afiliados',
        status: 'MONITORED',
        ownerUserId: 1,
        // Evaluaciones
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-001', 'CTRL-002', 'CTRL-003'],
        createdAt: '2024-06-15'
      },
      {
        id: 2,
        code: 'RSK-002',
        title: 'Ciberataque ransomware',
        description: 'Ataque de ransomware que cifra datos críticos',
        riskDomain: 'CYBER',
        riskScope: 'GLOBAL',
        scenario: 'Infección por phishing que propaga ransomware en la red',
        cause: 'Falta de conciencia de usuarios, vulnerabilidades no parchadas',
        effect: 'Pérdida de acceso a datos, extorsión, daño reputacional',
        status: 'TREATING',
        ownerUserId: 1,
        inherentProbability: 4,
        inherentImpact: 5,
        inherentScore: 20,
        residualProbability: 4,
        residualImpact: 5,
        residualScore: 20, // CRITICO - aún sin controles efectivos
        treatmentType: 'MITIGATE',
        controls: ['CTRL-004', 'CTRL-005', 'CTRL-006'],
        createdAt: '2024-07-01'
      },
      {
        id: 3,
        code: 'RSK-003',
        title: 'Terremoto de alta intensidad',
        description: 'Evento sísmico que afecta instalaciones físicas',
        riskDomain: 'CONTINUITY',
        riskScope: 'GLOBAL',
        scenario: 'Terremoto grado 8+ en la Región Metropolitana',
        cause: 'Evento natural, ubicación geográfica de Chile',
        effect: 'Daños estructurales, evacuación, interrupción prolongada',
        status: 'MONITORED',
        ownerUserId: 4,
        inherentProbability: 2,
        inherentImpact: 5,
        inherentScore: 10,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-007', 'CTRL-008'],
        createdAt: '2024-03-10'
      },
      {
        id: 4,
        code: 'RSK-004',
        title: 'Fuga de datos de afiliados',
        description: 'Exposición no autorizada de información personal de afiliados',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 1,
        scenario: 'Acceso no autorizado a base de datos de afiliados',
        cause: 'Credenciales comprometidas, configuración insegura',
        effect: 'Sanciones regulatorias, demandas, daño reputacional',
        status: 'TREATING',
        ownerUserId: 3,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 3,
        residualImpact: 4,
        residualScore: 12, // ALTO - controles aún insuficientes
        treatmentType: 'MITIGATE',
        controls: ['CTRL-009', 'CTRL-010'],
        createdAt: '2024-08-05'
      },
      {
        id: 5,
        code: 'RSK-005',
        title: 'Indisponibilidad de personal clave',
        description: 'Ausencia masiva de personal crítico',
        riskDomain: 'OPERATIONAL',
        riskScope: 'GLOBAL',
        scenario: 'Pandemia o huelga que impide asistencia del personal',
        cause: 'Emergencia sanitaria, conflicto laboral',
        effect: 'Reducción de capacidad operativa, atrasos en servicios',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 2,
        inherentImpact: 4,
        inherentScore: 8,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-011', 'CTRL-012'],
        createdAt: '2024-05-20'
      },
      {
        id: 6,
        code: 'RSK-006',
        title: 'Fraude en recaudacion',
        description: 'Posibles fraudes en el proceso de cobranza',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 4, // Finanzas
        scenario: 'Manipulacion de registros de pago',
        cause: 'Falta de segregacion de funciones, controles debiles',
        effect: 'Perdidas financieras, dano reputacional',
        status: 'TREATING',
        ownerUserId: 5,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-013'],
        createdAt: '2024-07-10'
      },
      {
        id: 7,
        code: 'RSK-007',
        title: 'Falla en equipos hospitalarios',
        description: 'Desperfecto de equipos medicos criticos',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 7, // Operaciones - Hospitales
        scenario: 'Falla de equipo de imagenologia o laboratorio',
        cause: 'Mantenimiento inadecuado, obsolescencia',
        effect: 'Interrupcion de servicios medicos, demora en diagnosticos',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 3,
        residualImpact: 5,
        residualScore: 15, // ALTO - equipo crítico sin redundancia
        treatmentType: 'MITIGATE',
        controls: ['CTRL-014'],
        createdAt: '2024-06-22'
      },
      {
        id: 8,
        code: 'RSK-008',
        title: 'Incumplimiento normativo RRHH',
        description: 'Incumplimiento de normativas laborales',
        riskDomain: 'COMPLIANCE',
        riskScope: 'PROCESS',
        targetProcessId: 8, // RRHH
        scenario: 'Incumplimiento en pago de remuneraciones o beneficios',
        cause: 'Errores en calculos, desconocimiento de normativa',
        effect: 'Sanciones legales, demandas laborales',
        status: 'MONITORED',
        ownerUserId: 3,
        inherentProbability: 2,
        inherentImpact: 3,
        inherentScore: 6,
        residualProbability: 1,
        residualImpact: 3,
        residualScore: 3,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-015'],
        createdAt: '2024-04-15'
      },
      {
        id: 9,
        code: 'RSK-009',
        title: 'Accidente laboral en instalaciones',
        description: 'Accidente grave de personal en instalaciones',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 6, // Seguridad
        scenario: 'Accidente con lesiones graves en area operativa',
        cause: 'Falta de EPP, condiciones inseguras',
        effect: 'Lesiones, demandas, multas',
        status: 'TREATING',
        ownerUserId: 4,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-016'],
        createdAt: '2024-08-01'
      },
      {
        id: 10,
        code: 'RSK-010',
        title: 'Demora en procesamiento de licencias',
        description: 'Atraso sistemico en tramitacion de licencias medicas',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 2, // Gestion de Riesgos
        scenario: 'Acumulacion de solicitudes por falla de sistema',
        cause: 'Sistemas lentos, falta de personal',
        effect: 'Reclamos de afiliados, dano reputacional',
        status: 'TREATING',
        ownerUserId: 3,
        inherentProbability: 4,
        inherentImpact: 3,
        inherentScore: 12,
        residualProbability: 3,
        residualImpact: 2,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-017'],
        createdAt: '2024-09-12'
      },
      {
        id: 11,
        code: 'RSK-011',
        title: 'Obsolescencia de software contable',
        description: 'Sistema ERP sin actualizaciones de seguridad',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 4, // Finanzas
        scenario: 'Vulnerabilidad explotada en sistema contable antiguo',
        cause: 'Falta de presupuesto para upgrade',
        effect: 'Brecha de seguridad, perdida de integridad de datos',
        status: 'IDENTIFIED',
        ownerUserId: 5,
        inherentProbability: 3,
        inherentImpact: 3,
        inherentScore: 9,
        residualProbability: 2,
        residualImpact: 2,
        residualScore: 4,
        treatmentType: 'ACCEPT',
        controls: [],
        createdAt: '2024-10-01'
      },
      {
        id: 12,
        code: 'RSK-012',
        title: 'Falla en aire acondicionado datacenter',
        description: 'Sistema de climatizacion sin redundancia',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 5, // TI
        scenario: 'Sobrecalentamiento de servidores por falla HVAC',
        cause: 'Mantenimiento insuficiente, equipo obsoleto',
        effect: 'Apagado automatico de servidores',
        status: 'MONITORED',
        ownerUserId: 1,
        inherentProbability: 2,
        inherentImpact: 4,
        inherentScore: 8,
        residualProbability: 1,
        residualImpact: 3,
        residualScore: 3,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-018'],
        createdAt: '2024-08-20'
      },
      {
        id: 13,
        code: 'RSK-013',
        title: 'Perdida de conectividad proveedor principal',
        description: 'Corte de enlace de comunicaciones principal',
        riskDomain: 'CONTINUITY',
        riskScope: 'GLOBAL',
        scenario: 'Corte de fibra optica por obras viales',
        cause: 'Dependencia de un solo proveedor',
        effect: 'Sin acceso a internet ni servicios cloud',
        status: 'MONITORED',
        ownerUserId: 1,
        inherentProbability: 2,
        inherentImpact: 3,
        inherentScore: 6,
        residualProbability: 1,
        residualImpact: 2,
        residualScore: 2,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-019'],
        createdAt: '2024-07-15'
      },
      {
        id: 14,
        code: 'RSK-014',
        title: 'Error en calculo de cotizaciones',
        description: 'Falla en algoritmo de calculo previsional',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 3, // Operaciones
        scenario: 'Calculo erroneo de montos a cobrar',
        cause: 'Error de programacion, cambio de normativa',
        effect: 'Cobros incorrectos, reclamos masivos',
        status: 'TREATING',
        ownerUserId: 2,
        inherentProbability: 2,
        inherentImpact: 4,
        inherentScore: 8,
        residualProbability: 1,
        residualImpact: 3,
        residualScore: 3,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-020'],
        createdAt: '2024-06-05'
      },
      {
        id: 15,
        code: 'RSK-015',
        title: 'Ataque DDoS a servicios web',
        description: 'Ataque de denegación de servicio a portales críticos',
        riskDomain: 'CYBER',
        riskScope: 'GLOBAL',
        scenario: 'Ataque masivo que satura infraestructura web',
        cause: 'Atacantes externos, falta de protección anti-DDoS',
        effect: 'Indisponibilidad de servicios en línea',
        status: 'TREATING',
        ownerUserId: 1,
        inherentProbability: 4,
        inherentImpact: 4,
        inherentScore: 16,
        residualProbability: 3,
        residualImpact: 4,
        residualScore: 12, // ALTO - protección parcial
        treatmentType: 'MITIGATE',
        controls: ['CTRL-021'],
        createdAt: '2024-09-01'
      },
      {
        id: 16,
        code: 'RSK-016',
        title: 'Pérdida de licencias de software crítico',
        description: 'Expiración de licencias de sistemas core',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 5, // TI
        scenario: 'Bloqueo de sistema por licencias vencidas',
        cause: 'Falta de control de renovaciones',
        effect: 'Paralización de sistemas críticos',
        status: 'IDENTIFIED',
        ownerUserId: 1,
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        treatmentType: 'MITIGATE',
        controls: [],
        createdAt: '2024-10-15'
      },
      {
        id: 17,
        code: 'RSK-017',
        title: 'Fuga de información financiera',
        description: 'Filtración de datos financieros confidenciales',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 4, // Finanzas
        scenario: 'Empleado malicioso extrae información financiera',
        cause: 'Controles de acceso débiles, falta de DLP',
        effect: 'Pérdidas financieras, sanciones regulatorias',
        status: 'TREATING',
        ownerUserId: 5,
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-010'],
        createdAt: '2024-08-22'
      },
      {
        id: 18,
        code: 'RSK-018',
        title: 'Pandemia o emergencia sanitaria',
        description: 'Nueva crisis sanitaria que afecta operaciones',
        riskDomain: 'CONTINUITY',
        riskScope: 'GLOBAL',
        scenario: 'Brote de enfermedad que requiere cuarentenas',
        cause: 'Evento natural/epidemiológico',
        effect: 'Cierre de instalaciones, trabajo remoto forzado',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 2,
        inherentImpact: 5,
        inherentScore: 10,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-012'],
        createdAt: '2024-03-15'
      },
      {
        id: 19,
        code: 'RSK-019',
        title: 'Interrupción cadena de suministros',
        description: 'Falla de proveedores críticos',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 3, // Operaciones
        scenario: 'Proveedor clave quiebra o incumple',
        cause: 'Dependencia de un solo proveedor',
        effect: 'Interrupción de servicios dependientes',
        status: 'IDENTIFIED',
        ownerUserId: 2,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: [],
        createdAt: '2024-11-01'
      },
      {
        id: 20,
        code: 'RSK-020',
        title: 'Corrupción de base de datos',
        description: 'Pérdida de integridad en datos maestros',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 5, // TI
        scenario: 'Error de software corrompe tablas críticas',
        cause: 'Bug en actualización, falla de disco',
        effect: 'Datos inconsistentes, recuperación compleja',
        status: 'TREATING',
        ownerUserId: 1,
        inherentProbability: 2,
        inherentImpact: 5,
        inherentScore: 10,
        residualProbability: 1,
        residualImpact: 4,
        residualScore: 4,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-005'],
        createdAt: '2024-07-20'
      },
      {
        id: 21,
        code: 'SGCN-001',
        title: 'Dependencia de una sola persona BCMS',
        description: 'Riesgo SGCN (ISO 22301 6.1). Ausencia del responsable BCMS compromete el programa.',
        riskDomain: 'INTEGRATED',
        riskScope: 'GLOBAL',
        scenario: 'Ausencia prolongada del responsable BCMS',
        cause: 'Falta de plan de sucesion y respaldo de funciones',
        effect: 'Demoras en decisiones y continuidad del SGCN afectada',
        status: 'TREATING',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: [],
        createdAt: '2024-03-01'
      },
      {
        id: 22,
        code: 'SGCN-002',
        title: 'Baja cobertura de capacitacion en continuidad',
        description: 'Riesgo SGCN (ISO 22301 7.2). Competencias insuficientes para operar el BCMS.',
        riskDomain: 'INTEGRATED',
        riskScope: 'GLOBAL',
        scenario: 'Personal clave sin capacitacion BCMS',
        cause: 'Programa de entrenamiento incompleto o discontinuo',
        effect: 'Ejecucion ineficaz de planes y respuesta tardia',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 2,
        inherentImpact: 3,
        inherentScore: 6,
        residualProbability: 2,
        residualImpact: 2,
        residualScore: 4,
        treatmentType: 'MITIGATE',
        controls: [],
        createdAt: '2024-04-10'
      },
      // Riesgos Ciber específicos
      {
        id: 21,
        code: 'RCIBER-001',
        title: 'Ataque DDoS a Sistema de Pagos Online',
        description: 'Ataque distribuido de denegación de servicio que afecta disponibilidad del sistema de pagos',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 1,
        targetAsset: 'Sistema Pagos Online',
        scenario: 'Ataque DDoS coordinado desde múltiples orígenes',
        cause: 'Falta de WAF avanzado, capacidad limitada de mitigación DDoS',
        effect: 'Indisponibilidad del sistema de pagos, pérdida de ingresos, afectación a clientes',
        threat: 'Ataque DDoS',
        vulnerability: 'Falta WAF avanzado',
        status: 'TREATING',
        ownerUserId: 1,
        ownerName: 'J. Silva (TI)',
        inherentProbability: 4,
        inherentImpact: 5,
        inherentScore: 20,
        residualProbability: 3,
        residualImpact: 4,
        residualScore: 12,
        cvssScore: 9.1,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-013'],
        createdAt: '2024-09-15',
        updatedAt: '2025-01-10'
      },
      {
        id: 22,
        code: 'RCIBER-002',
        title: 'Inyección SQL en Portal Clientes',
        description: 'Vulnerabilidad de inyección SQL que permite acceso no autorizado a base de datos',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 1,
        targetAsset: 'Portal Clientes',
        scenario: 'Inyección SQL a través de formularios web sin sanitización',
        cause: 'Input sin sanitización adecuada, falta de validación',
        effect: 'Acceso no autorizado a datos, potencial exfiltración de información',
        threat: 'Inyección SQL',
        vulnerability: 'Input sin sanitización',
        status: 'MONITORED',
        ownerUserId: 3,
        ownerName: 'M. Torres (Dev)',
        inherentProbability: 4,
        inherentImpact: 5,
        inherentScore: 20,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        cvssScore: 8.7,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-014', 'CTRL-015'],
        createdAt: '2024-08-20',
        updatedAt: '2024-12-15'
      },
      {
        id: 23,
        code: 'RCIBER-003',
        title: 'Acceso no autorizado a Base de Datos Clientes',
        description: 'Riesgo de acceso no autorizado por credenciales débiles',
        riskDomain: 'CYBER',
        riskScope: 'GLOBAL',
        targetAsset: 'Base Datos Clientes',
        scenario: 'Ataque de fuerza bruta o credenciales comprometidas',
        cause: 'Credenciales débiles, falta de MFA',
        effect: 'Acceso no autorizado, potencial fuga de datos',
        threat: 'Acceso no autorizado',
        vulnerability: 'Credenciales débiles',
        status: 'TREATING',
        ownerUserId: 4,
        ownerName: 'C. Rojas (Seguridad)',
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        cvssScore: 7.5,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-016', 'CTRL-017'],
        createdAt: '2024-10-05',
        updatedAt: '2025-01-08'
      },
      {
        id: 24,
        code: 'RCIBER-004',
        title: 'Phishing avanzado a Email Corporativo',
        description: 'Campaña de phishing dirigida a empleados',
        riskDomain: 'CYBER',
        riskScope: 'GLOBAL',
        targetAsset: 'Email Corporativo',
        scenario: 'Phishing dirigido con suplantación de identidad',
        cause: 'Falta de capacitación continua de usuarios',
        effect: 'Compromiso de credenciales, acceso no autorizado a sistemas',
        threat: 'Phishing avanzado',
        vulnerability: 'Falta capacitación usuarios',
        status: 'TREATING',
        ownerUserId: 5,
        ownerName: 'L. Vargas (RRHH)',
        inherentProbability: 4,
        inherentImpact: 4,
        inherentScore: 16,
        residualProbability: 3,
        residualImpact: 3,
        residualScore: 9,
        cvssScore: 6.8,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-006', 'CTRL-018'],
        createdAt: '2024-11-10',
        updatedAt: '2025-01-12'
      },
      {
        id: 25,
        code: 'RCIBER-005',
        title: 'Exposición de datos sensibles en API REST',
        description: 'Logs de API sin cifrar exponen datos sensibles',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 1,
        targetAsset: 'API REST Principal',
        scenario: 'Logs de aplicación almacenados sin cifrado',
        cause: 'Logs sin cifrar, configuración de logging inadecuada',
        effect: 'Exposición de datos sensibles, incumplimiento regulatorio',
        threat: 'Exposición datos sensibles',
        vulnerability: 'Logs sin cifrar',
        status: 'TREATING',
        ownerUserId: 1,
        ownerName: 'J. Silva (TI)',
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        cvssScore: 8.2,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-019'],
        createdAt: '2024-12-01',
        updatedAt: '2025-01-15'
      },
      {
        id: 301,
        code: 'RSK-HOSP-001',
        title: 'Falla en red de gases clínicos',
        description: 'Interrupción de suministro de oxígeno y gases medicinales',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Corte no planificado del sistema de gases clínicos',
        cause: 'Falla de compresores o válvulas principales',
        effect: 'Suspensión de procedimientos clínicos críticos',
        status: 'TREATING',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-014'],
        createdAt: '2025-01-03',
        isDeleted: false
      },
      {
        id: 302,
        code: 'RSK-HOSP-002',
        title: 'Caída del HIS clínico',
        description: 'Indisponibilidad del sistema de información hospitalaria',
        riskDomain: 'CYBER',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Interrupción total de plataforma HIS',
        cause: 'Falla de base de datos o ataque informático',
        effect: 'Atención clínica manual y retrasos operativos',
        status: 'TREATING',
        ownerUserId: 6,
        inherentProbability: 4,
        inherentImpact: 5,
        inherentScore: 20,
        residualProbability: 3,
        residualImpact: 4,
        residualScore: 12,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-015'],
        createdAt: '2025-01-03',
        isDeleted: false
      },
      {
        id: 303,
        code: 'RSK-HOSP-003',
        title: 'Demora de laboratorio crítico',
        description: 'Retraso en entrega de exámenes de alta prioridad',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Acumulación de muestras sin procesamiento oportuno',
        cause: 'Capacidad insuficiente y sobrecarga operativa',
        effect: 'Retraso diagnóstico y extensión de permanencia hospitalaria',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-014'],
        createdAt: '2025-01-04',
        isDeleted: false
      },
      {
        id: 304,
        code: 'RSK-HOSP-004',
        title: 'Quiebre de stock farmacéutico',
        description: 'No disponibilidad de medicamentos críticos',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Ruptura de stock de fármacos de alta rotación',
        cause: 'Demora en abastecimiento y proyección inexacta',
        effect: 'Afectación de tratamientos y reprogramación de terapias',
        status: 'TREATING',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 5,
        inherentScore: 15,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-019'],
        createdAt: '2025-01-04',
        isDeleted: false
      },
      {
        id: 305,
        code: 'RSK-HOSP-005',
        title: 'Corte eléctrico en pabellones',
        description: 'Pérdida de energía en áreas quirúrgicas',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Falla de respaldo energético durante cirugía',
        cause: 'Mantenimiento insuficiente de UPS y generadores',
        effect: 'Suspensión de procedimientos y riesgo clínico',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 2,
        inherentImpact: 5,
        inherentScore: 10,
        residualProbability: 2,
        residualImpact: 4,
        residualScore: 8,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-001'],
        createdAt: '2025-01-05',
        isDeleted: false
      },
      {
        id: 306,
        code: 'RSK-HOSP-006',
        title: 'Indisponibilidad de camas críticas',
        description: 'Saturación de UCI e intermedio',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Demanda supera la capacidad instalada',
        cause: 'Eventos masivos o picos epidemiológicos',
        effect: 'Derivaciones urgentes y tiempos de espera prolongados',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 4,
        inherentImpact: 4,
        inherentScore: 16,
        residualProbability: 3,
        residualImpact: 3,
        residualScore: 9,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-012'],
        createdAt: '2025-01-05',
        isDeleted: false
      },
      {
        id: 307,
        code: 'RSK-HOSP-007',
        title: 'Falla en cadena de frío',
        description: 'Ruptura de conservación para insumos clínicos',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Temperatura fuera de rango en farmacia y banco de sangre',
        cause: 'Falla de refrigeración y monitoreo discontinuo',
        effect: 'Pérdida de insumos, riesgo de atención',
        status: 'IDENTIFIED',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-011'],
        createdAt: '2025-01-06',
        isDeleted: false
      },
      {
        id: 308,
        code: 'RSK-HOSP-008',
        title: 'Ausencia de personal especializado',
        description: 'Falta de dotación crítica en turnos',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Inasistencia simultánea de especialistas',
        cause: 'Contingencias sanitarias y baja cobertura de reemplazos',
        effect: 'Disminución de capacidad clínica y tiempos de respuesta',
        status: 'MONITORED',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-012'],
        createdAt: '2025-01-06',
        isDeleted: false
      },
      {
        id: 309,
        code: 'RSK-HOSP-009',
        title: 'Interrupción de comunicaciones internas',
        description: 'Caída de telefonía y mensajería clínica interna',
        riskDomain: 'CONTINUITY',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Falla de central telefónica en sede principal',
        cause: 'Hardware sin redundancia y obsolescencia',
        effect: 'Coordinación deficiente entre unidades asistenciales',
        status: 'IDENTIFIED',
        ownerUserId: 6,
        inherentProbability: 2,
        inherentImpact: 4,
        inherentScore: 8,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-002'],
        createdAt: '2025-01-07',
        isDeleted: false
      },
      {
        id: 310,
        code: 'RSK-HOSP-010',
        title: 'Pérdida de trazabilidad de pacientes',
        description: 'Error en seguimiento de flujo asistencial',
        riskDomain: 'OPERATIONAL',
        riskScope: 'PROCESS',
        targetProcessId: 7,
        scenario: 'Registro incompleto en traslados y alta clínica',
        cause: 'Proceso manual y controles incompletos',
        effect: 'Riesgo de continuidad asistencial y reprocesos',
        status: 'TREATING',
        ownerUserId: 6,
        inherentProbability: 3,
        inherentImpact: 4,
        inherentScore: 12,
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        treatmentType: 'MITIGATE',
        controls: ['CTRL-020'],
        createdAt: '2025-01-07',
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // CONTROLES APLICADOS (applied_controls) - ISO 22301 Cláusula 8.2.3
    // -------------------------------------------------------------------------
    controls: [
      { id: 1, code: 'CTRL-001', name: 'Redundancia de datacenter', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 2, code: 'CTRL-002', name: 'Generadores de respaldo', type: 'CORRECTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 3, code: 'CTRL-003', name: 'UPS con autonomía 4h', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'ADEQUATE' },
      { id: 4, code: 'CTRL-004', name: 'EDR/XDR empresarial', type: 'DETECTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 5, code: 'CTRL-005', name: 'Backup inmutable offline', type: 'CORRECTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 6, code: 'CTRL-006', name: 'Capacitación anti-phishing', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'ADEQUATE' },
      { id: 7, code: 'CTRL-007', name: 'Edificios antisísmicos', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 8, code: 'CTRL-008', name: 'Plan de evacuación', type: 'CORRECTIVE', status: 'IMPLEMENTED', effectiveness: 'ADEQUATE' },
      { id: 9, code: 'CTRL-009', name: 'Cifrado de datos en reposo', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 10, code: 'CTRL-010', name: 'DLP (Data Loss Prevention)', type: 'DETECTIVE', status: 'PARTIAL', effectiveness: 'WEAK' },
      { id: 11, code: 'CTRL-011', name: 'Cross-training de personal', type: 'PREVENTIVE', status: 'PARTIAL', effectiveness: 'ADEQUATE' },
      { id: 12, code: 'CTRL-012', name: 'Trabajo remoto habilitado', type: 'CORRECTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      // Controles Ciber adicionales
      { id: 13, code: 'CTRL-013', name: 'WAF + Anti-DDoS CloudFlare', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 14, code: 'CTRL-014', name: 'Sanitización de inputs', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 15, code: 'CTRL-015', name: 'Parametrized queries / ORM', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 16, code: 'CTRL-016', name: 'MFA obligatorio', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'STRONG' },
      { id: 17, code: 'CTRL-017', name: 'Política de contraseñas robustas', type: 'PREVENTIVE', status: 'IMPLEMENTED', effectiveness: 'ADEQUATE' },
      { id: 18, code: 'CTRL-018', name: 'Simulaciones phishing mensuales', type: 'DETECTIVE', status: 'IMPLEMENTED', effectiveness: 'ADEQUATE' },
      { id: 19, code: 'CTRL-019', name: 'Cifrado de logs sensibles', type: 'PREVENTIVE', status: 'PARTIAL', effectiveness: 'WEAK' }
    ],

    // -------------------------------------------------------------------------
    // INCIDENTES (incidents) - ISO 22301 Cláusula 8.4.3
    // -------------------------------------------------------------------------
    incidents: [
      {
        id: 1,
        code: 'INC-2024-001',
        title: 'Falla en servidor de base de datos',
        description: 'Caída del servidor principal de BD que afectó sistema de licencias',
        type: 'INFRASTRUCTURE',
        severity: 'HIGH',
        status: 'CLOSED',
        reportedAt: '2024-11-15T09:30:00Z',
        reportedBy: 1,
        resolvedAt: '2024-11-15T14:45:00Z',
        closedAt: '2024-11-16T10:00:00Z',
        affectedProcessId: 2,
        impactDescription: 'Imposibilidad de procesar licencias por 5 horas',
        rootCause: 'Falla de disco en arreglo RAID',
        resolutionSummary: 'Reemplazo de disco y restauración desde backup',
        lessonsLearned: 'Implementar monitoreo predictivo de discos',
        downtimeMinutes: 315,
        affectedUsersCount: 1200,
        financialLoss: 15000000
      },
      {
        id: 2,
        code: 'INC-2024-002',
        title: 'Intento de phishing masivo',
        description: 'Campaña de phishing dirigida a empleados de ACHS',
        type: 'SECURITY',
        severity: 'MEDIUM',
        status: 'CLOSED',
        reportedAt: '2024-10-20T11:00:00Z',
        reportedBy: 3,
        resolvedAt: '2024-10-20T16:30:00Z',
        closedAt: '2024-10-21T09:00:00Z',
        impactDescription: '3 usuarios comprometieron credenciales',
        rootCause: 'Correos con apariencia legítima, falta de verificación',
        resolutionSummary: 'Reset de credenciales, bloqueo de dominios maliciosos',
        lessonsLearned: 'Reforzar capacitación y simular phishing periódico'
      },
      {
        id: 3,
        code: 'INC-2024-003',
        title: 'Corte de energía en sede central',
        description: 'Corte de suministro eléctrico por 2 horas',
        type: 'INFRASTRUCTURE',
        severity: 'MEDIUM',
        status: 'CLOSED',
        reportedAt: '2024-09-05T14:20:00Z',
        resolvedAt: '2024-09-05T16:25:00Z',
        closedAt: '2024-09-06T08:00:00Z',
        affectedProcessId: 1,
        impactDescription: 'Generadores funcionaron correctamente, sin afectación',
        rootCause: 'Trabajos en la red eléctrica del sector',
        resolutionSummary: 'Ninguna acción requerida, sistemas funcionaron según diseño'
      },
      {
        id: 4,
        code: 'INC-2025-001',
        title: 'Lentitud en portal web de afiliados',
        description: 'Degradación de rendimiento en portal público',
        type: 'APPLICATION',
        severity: 'LOW',
        status: 'IN_PROGRESS',
        reportedAt: '2025-01-10T08:45:00Z',
        reportedBy: 2,
        affectedProcessId: 1,
        impactDescription: 'Tiempos de carga superiores a 10 segundos'
      },
      {
        id: 5,
        code: 'INC-2024-004',
        title: 'Impresora compartida fuera de servicio',
        description: 'Impresora de piso 3 no responde a trabajos de impresión',
        type: 'INFRASTRUCTURE',
        severity: 'LOW',
        status: 'CLOSED',
        reportedAt: '2024-12-02T10:15:00Z',
        reportedBy: 4,
        resolvedAt: '2024-12-02T11:30:00Z',
        closedAt: '2024-12-02T12:00:00Z',
        impactDescription: 'Usuarios redirigidos a impresora alternativa',
        rootCause: 'Atasco de papel y toner agotado',
        resolutionSummary: 'Mantenimiento preventivo realizado'
      },
      {
        id: 6,
        code: 'INC-2024-005',
        title: 'Actualización de antivirus fallida',
        description: 'Fallo en despliegue de firmas en 15 equipos',
        type: 'SECURITY',
        severity: 'LOW',
        status: 'CLOSED',
        reportedAt: '2024-11-28T09:00:00Z',
        reportedBy: 5,
        resolvedAt: '2024-11-28T10:45:00Z',
        closedAt: '2024-11-28T11:00:00Z',
        impactDescription: 'Equipos sin protección actualizada por 2 horas',
        rootCause: 'Problema de conectividad con servidor de actualizaciones',
        resolutionSummary: 'Reinicio de servicio y actualización manual'
      },
      {
        id: 7,
        code: 'INC-2024-006',
        title: 'Error en reporte mensual automatizado',
        description: 'Reporte de gestión no se generó automáticamente',
        type: 'APPLICATION',
        severity: 'LOW',
        status: 'CLOSED',
        reportedAt: '2024-11-01T07:30:00Z',
        reportedBy: 2,
        resolvedAt: '2024-11-01T08:15:00Z',
        closedAt: '2024-11-01T09:00:00Z',
        impactDescription: 'Reporte generado manualmente, sin afectación a usuarios',
        rootCause: 'Cambio de horario de verano afectó scheduler',
        resolutionSummary: 'Ajuste de zona horaria en tarea programada'
      },
      {
        id: 8,
        code: 'INC-2024-007',
        title: 'VPN corporativa con desconexiones intermitentes',
        description: 'Usuarios remotos reportan caídas de VPN cada 30 minutos',
        type: 'NETWORK',
        severity: 'MEDIUM',
        status: 'CLOSED',
        reportedAt: '2024-10-15T14:00:00Z',
        reportedBy: 3,
        resolvedAt: '2024-10-16T10:00:00Z',
        closedAt: '2024-10-16T11:30:00Z',
        impactDescription: '45 usuarios afectados en teletrabajo',
        rootCause: 'Configuración incorrecta de timeout en concentrador VPN',
        resolutionSummary: 'Ajuste de parámetros de keep-alive'
      },
      {
        id: 9,
        code: 'INC-2025-009',
        title: 'Fallo en sistema de pagos internacionales',
        description: 'Sistema SWIFT presentó errores intermitentes durante procesamiento batch de transferencias',
        type: 'APPLICATION',
        severity: 'HIGH',
        status: 'OPEN',
        reportedAt: '2025-01-20T09:15:00Z',
        reportedBy: 2,
        affectedProcessId: 1,
        impactDescription: 'Transacciones internacionales represadas por 4 horas'
      },
      {
        id: 10,
        code: 'INC-2025-010',
        title: 'Intento de phishing dirigido a alta gerencia',
        description: 'Campaña de spear phishing detectada con emails suplantando al CEO, 3 usuarios reportaron el correo',
        type: 'SECURITY',
        severity: 'HIGH',
        status: 'ESCALATED',
        reportedAt: '2025-01-25T11:30:00Z',
        reportedBy: 4,
        impactDescription: 'Sin impacto confirmado, investigación en curso por CISO'
      },
      {
        id: 11,
        code: 'INC-2025-011',
        title: 'Degradación de rendimiento en portal clientes',
        description: 'Tiempos de respuesta del portal web incrementados en 300%, afectando consultas de saldo',
        type: 'APPLICATION',
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        reportedAt: '2025-02-01T08:45:00Z',
        reportedBy: 1,
        affectedProcessId: 3,
        impactDescription: 'Experiencia de usuario degradada, sin pérdida de datos'
      },
      {
        id: 12,
        code: 'INC-2025-012',
        title: 'Corte eléctrico en datacenter secundario',
        description: 'Falla del suministro eléctrico comercial y retraso de 8 minutos en activación de generador de respaldo',
        type: 'INFRASTRUCTURE',
        severity: 'LOW',
        status: 'RESOLVED',
        reportedAt: '2025-02-05T03:20:00Z',
        reportedBy: 3,
        resolvedAt: '2025-02-05T03:28:00Z',
        impactDescription: 'Interrupción breve de servicios no críticos, UPS mantuvo sistemas core'
      }
    ],

    // -------------------------------------------------------------------------
    // PLANES DE CONTINUIDAD (continuity_plans) - ISO 22301 Cláusula 8.4.4
    // -------------------------------------------------------------------------
    continuityPlans: [
      {
        id: 1,
        code: 'BCP-001',
        planType: 'BCP',
        title: 'Plan de Continuidad - Atención al Afiliado',
        description: 'Plan para mantener operaciones de atención ante interrupciones',
        version: '2.1',
        status: 'ACTIVE',
        ownerUserId: 2,
        targetProcessId: 1,
        effectiveDate: '2024-07-01',
        nextReviewDate: '2025-07-01',
        approvedBy: 6,
        approvedAt: '2024-06-28',
        rtoTarget: 4,
        rpoTarget: 1,
        activationCriteria: [1, 2],
        strategies: [1, 2],
        createdAt: '2024-05-15'
      },
      {
        id: 2,
        code: 'BCP-002',
        planType: 'BCP',
        title: 'Plan de Continuidad - Licencias Médicas',
        description: 'Plan para garantizar procesamiento de licencias',
        version: '1.5',
        status: 'ACTIVE',
        ownerUserId: 3,
        targetProcessId: 2,
        effectiveDate: '2024-08-01',
        nextReviewDate: '2025-08-01',
        approvedBy: 6,
        approvedAt: '2024-07-25',
        rtoTarget: 2,
        rpoTarget: 0.5,
        activationCriteria: [3],
        strategies: [3],
        createdAt: '2024-06-20'
      },
      {
        id: 3,
        code: 'BCP-003',
        planType: 'BCP',
        title: 'Plan de Continuidad - Hospitales',
        description: 'Plan para operación continua de centros hospitalarios',
        version: '3.0',
        status: 'ACTIVE',
        ownerUserId: 6,
        targetProcessId: 7,
        effectiveDate: '2024-06-01',
        nextReviewDate: '2025-06-01',
        approvedBy: 6,
        rtoTarget: 0.5,
        rpoTarget: 0.25,
        activationCriteria: [4, 5],
        strategies: [4, 5],
        createdAt: '2024-04-10'
      },
      {
        id: 4,
        code: 'DRP-001',
        planType: 'DRP',
        title: 'Plan de Recuperación - Datacenter Principal',
        description: 'DRP para infraestructura crítica de TI',
        version: '2.0',
        status: 'ACTIVE',
        ownerUserId: 1,
        targetProcessId: 5,
        effectiveDate: '2024-09-01',
        nextReviewDate: '2025-09-01',
        approvedBy: 6,
        rtoTarget: 1,
        rpoTarget: 0.25,
        createdAt: '2024-07-01'
      },
      {
        id: 5,
        code: 'DRP-002',
        planType: 'DRP',
        title: 'Plan de Recuperación - Sistemas Core',
        description: 'DRP para aplicaciones críticas de negocio',
        version: '1.8',
        status: 'ACTIVE',
        ownerUserId: 7,
        effectiveDate: '2024-10-01',
        nextReviewDate: '2025-10-01',
        rtoTarget: 2,
        rpoTarget: 0.5,
        createdAt: '2024-08-15'
      },
      // Planes DRP específicos por aplicación
      {
        id: 11,
        code: 'DRP-APP-001',
        planType: 'DRP',
        title: 'Core Banking · Plataforma Transaccional',
        description: 'DRP para sistema bancario core',
        application: 'Core Banking',
        criticality: 'CRITICAL',
        version: '2.1',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-09-01',
        nextReviewDate: '2025-09-01',
        rtoTarget: 1,
        rpoTarget: 0.25,
        alternateSite: 'Site Secundario',
        replicationType: 'SYNCHRONOUS',
        lastTest: '2025-09-22',
        testResult: 'SUCCESS',
        createdAt: '2024-07-01'
      },
      {
        id: 12,
        code: 'DRP-APP-002',
        planType: 'DRP',
        title: 'CRM Comercial · Gestión Clientes',
        description: 'DRP para sistema CRM',
        application: 'CRM Comercial',
        criticality: 'HIGH',
        version: '1.5',
        status: 'ACTIVE',
        ownerUserId: 3,
        effectiveDate: '2024-08-01',
        nextReviewDate: '2025-08-01',
        rtoTarget: 2,
        rpoTarget: 1,
        alternateSite: 'Site Secundario',
        replicationType: 'ASYNCHRONOUS',
        lastTest: null,
        testResult: 'PENDING',
        createdAt: '2024-06-15'
      },
      {
        id: 13,
        code: 'DRP-APP-003',
        planType: 'DRP',
        title: 'Infraestructura Red · Firewall & Switches',
        description: 'DRP para infraestructura de red',
        application: 'Infraestructura Red',
        criticality: 'CRITICAL',
        version: '3.0',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-10-01',
        nextReviewDate: '2025-10-01',
        rtoTarget: 0.5,
        rpoTarget: 0,
        alternateSite: 'HA Activo-Activo',
        replicationType: 'REALTIME',
        lastTest: '2025-10-05',
        testResult: 'SUCCESS',
        createdAt: '2024-08-01'
      },
      {
        id: 14,
        code: 'DRP-APP-004',
        planType: 'DRP',
        title: 'Bases de Datos Productivas · SQL Cluster',
        description: 'DRP para bases de datos SQL',
        application: 'Bases de Datos SQL',
        criticality: 'CRITICAL',
        version: '2.3',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-08-01',
        nextReviewDate: '2025-08-01',
        rtoTarget: 1,
        rpoTarget: 0.083,
        alternateSite: 'Site Secundario',
        replicationType: 'SYNCHRONOUS',
        lastTest: '2025-08-18',
        testResult: 'SUCCESS',
        createdAt: '2024-06-01'
      },
      {
        id: 15,
        code: 'DRP-APP-005',
        planType: 'DRP',
        title: 'Plataforma Canales Digitales · Web/Móvil',
        description: 'DRP para canales digitales',
        application: 'Canales Digitales',
        criticality: 'CRITICAL',
        version: '1.9',
        status: 'ACTIVE',
        ownerUserId: 3,
        effectiveDate: '2024-11-01',
        nextReviewDate: '2025-11-01',
        rtoTarget: 2,
        rpoTarget: 0.5,
        alternateSite: 'AWS DR Multi-AZ',
        replicationType: 'SYNCHRONOUS',
        lastTest: '2025-11-10',
        testResult: 'SUCCESS',
        createdAt: '2024-09-15'
      },
      {
        id: 16,
        code: 'DRP-APP-006',
        planType: 'DRP',
        title: 'Sistema Clearing · Liquidación Interbancaria',
        description: 'DRP para sistema de clearing',
        application: 'Sistema Clearing',
        criticality: 'CRITICAL',
        version: '2.0',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-09-01',
        nextReviewDate: '2025-09-01',
        rtoTarget: 1,
        rpoTarget: 0,
        alternateSite: 'Site Secundario',
        replicationType: 'SYNCHRONOUS',
        lastTest: '2025-09-25',
        testResult: 'SUCCESS',
        createdAt: '2024-07-10'
      },
      {
        id: 17,
        code: 'DRP-APP-007',
        planType: 'DRP',
        title: 'Plataforma Autorizaciones · Pagos Tarjetas',
        description: 'DRP para autorizaciones de pagos',
        application: 'Autorizaciones Pagos',
        criticality: 'CRITICAL',
        version: '2.5',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-10-01',
        nextReviewDate: '2025-10-01',
        rtoTarget: 0.5,
        rpoTarget: 0,
        alternateSite: 'HA Activo-Activo',
        replicationType: 'REALTIME',
        lastTest: '2025-10-30',
        testResult: 'SUCCESS',
        createdAt: '2024-08-20'
      },
      {
        id: 18,
        code: 'DRP-APP-008',
        planType: 'DRP',
        title: 'ERP Corporativo · SAP',
        description: 'DRP para sistema ERP SAP',
        application: 'ERP SAP',
        criticality: 'HIGH',
        version: '1.7',
        status: 'ACTIVE',
        ownerUserId: 7,
        effectiveDate: '2024-07-01',
        nextReviewDate: '2025-07-01',
        rtoTarget: 4,
        rpoTarget: 1,
        alternateSite: 'Site Secundario',
        replicationType: 'ASYNCHRONOUS',
        lastTest: '2025-07-12',
        testResult: 'SUCCESS',
        createdAt: '2024-05-01'
      },
      {
        id: 19,
        code: 'DRP-APP-009',
        planType: 'DRP',
        title: 'Active Directory · Infraestructura IAM',
        description: 'DRP para Active Directory',
        application: 'Active Directory',
        criticality: 'CRITICAL',
        version: '3.2',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-01-01',
        nextReviewDate: '2025-01-01',
        rtoTarget: 0.5,
        rpoTarget: 0,
        alternateSite: 'Multi-DC Replicado',
        replicationType: 'REALTIME',
        lastTest: 'Continuo',
        testResult: 'SUCCESS',
        createdAt: '2023-11-01'
      },
      {
        id: 20,
        code: 'DRP-APP-010',
        planType: 'DRP',
        title: 'Email Corporativo · Exchange Online',
        description: 'DRP para email corporativo',
        application: 'Email Exchange',
        criticality: 'HIGH',
        version: '1.0',
        status: 'ACTIVE',
        ownerUserId: 1,
        effectiveDate: '2024-01-01',
        nextReviewDate: '2025-01-01',
        rtoTarget: 1,
        rpoTarget: 0.083,
        alternateSite: 'Microsoft Cloud',
        replicationType: 'CLOUD_NATIVE',
        lastTest: 'SLA Proveedor',
        testResult: 'SUCCESS',
        createdAt: '2023-12-01'
      },
      {
        id: 6,
        code: 'CMP-001',
        planType: 'CMP',
        title: 'Plan de Gestión de Crisis',
        description: 'Plan maestro de gestión de crisis organizacional',
        version: '1.0',
        status: 'ACTIVE',
        ownerUserId: 4,
        effectiveDate: '2024-05-01',
        nextReviewDate: '2025-05-01',
        approvedBy: 6,
        createdAt: '2024-03-01'
      }
    ],

    // -------------------------------------------------------------------------
    // ARBOLES DE LLAMADAS (call_trees)
    // -------------------------------------------------------------------------
    callTrees: [
      {
        id: 1,
        planId: 6,
        name: 'Call tree crisis',
        rootContactId: 3,
        description: 'Arbol de llamadas para crisis',
        createdAt: '2024-05-01'
      }
    ],

    // -------------------------------------------------------------------------
    // NODOS DE ARBOL DE LLAMADAS (call_tree_nodes)
    // -------------------------------------------------------------------------
    callTreeNodes: [
      { id: 1, callTreeId: 1, contactId: 3, parentNodeId: null, nodeOrder: 1, escalationWaitMin: 10, notes: 'Primary contact' },
      { id: 2, callTreeId: 1, contactId: 1, parentNodeId: 1, nodeOrder: 2, escalationWaitMin: 15, notes: 'Regulator contact' },
      { id: 3, callTreeId: 1, contactId: 2, parentNodeId: 1, nodeOrder: 3, escalationWaitMin: 15, notes: 'Supplier contact' }
    ],

    // -------------------------------------------------------------------------
    // PLANES DE COMUNICACION (communication_plans)
    // -------------------------------------------------------------------------
    communicationPlans: [
      {
        id: 1,
        code: 'COMM-BCP-001',
        name: 'Comms plan - BCP Atencion',
        description: 'Plan de comunicacion para continuidad de atencion',
        scopeType: 'PLAN',
        scopeId: 1,
        organizationId: 1,
        activationCriteriaId: 1,
        callTreeId: 1,
        ownerUserId: 4,
        status: 'ACTIVE',
        lastReviewDate: '2024-09-01',
        nextReviewDate: '2025-09-01'
      }
    ],

    // -------------------------------------------------------------------------
    // CANALES DE COMUNICACION (communication_plan_channels)
    // -------------------------------------------------------------------------
    communicationPlanChannels: [
      { id: 1, commPlanId: 1, channel: 'EMAIL', priorityOrder: 1, isPrimary: true },
      { id: 2, commPlanId: 1, channel: 'SMS', priorityOrder: 2, isPrimary: false }
    ],

    // -------------------------------------------------------------------------
    // STAKEHOLDERS DE COMUNICACION (communication_plan_stakeholders)
    // -------------------------------------------------------------------------
    communicationPlanStakeholders: [
      { id: 1, commPlanId: 1, stakeholderType: 'USER', userId: 4, roleInPlan: 'Spokesperson', requiredAck: true },
      { id: 2, commPlanId: 1, stakeholderType: 'CONTACT', contactId: 1, roleInPlan: 'Regulator Liaison', requiredAck: true },
      { id: 3, commPlanId: 1, stakeholderType: 'EXTERNAL', externalName: 'Media Desk', externalEmail: 'media@example.com', roleInPlan: 'Media', requiredAck: false }
    ],

    // -------------------------------------------------------------------------
    // MENSAJES DE COMUNICACION (communication_messages)
    // -------------------------------------------------------------------------
    communicationMessages: [
      { id: 1, commPlanId: 1, messageType: 'INITIAL', templateTitle: 'Initial notice', templateBody: 'Se activo el plan de continuidad. Seguiremos informando.', language: 'es', channel: 'EMAIL', isActive: true },
      { id: 2, commPlanId: 1, messageType: 'UPDATE', templateTitle: 'Status update', templateBody: 'Servicios en recuperacion controlada.', language: 'es', channel: 'SMS', isActive: true }
    ],

    // -------------------------------------------------------------------------
    // LOG DE COMUNICACIONES (communication_log)
    // -------------------------------------------------------------------------
    communicationLog: [
      { id: 1, commPlanId: 1, channel: 'EMAIL', recipient: 'pdiaz@achs.cl', status: 'SENT', sentAt: '2024-11-01T10:00:00Z' },
      { id: 2, commPlanId: 1, channel: 'SMS', recipient: '+56 9 5555 1111', status: 'DELIVERED', sentAt: '2024-11-01T10:05:00Z' }
    ],

    // -------------------------------------------------------------------------
    // CRITERIOS DE ACTIVACIÓN (activation_criteria) - ISO 22301 Cláusula 8.4.2
    // -------------------------------------------------------------------------
    activationCriteria: [
      {
        id: 1,
        planId: 1,
        code: 'ACT-001',
        description: 'Interrupción de servicio de atención > 2 horas',
        thresholdValue: '2 horas',
        severity: 'HIGH',
        isAutoActivate: false
      },
      {
        id: 2,
        planId: 1,
        code: 'ACT-002',
        description: 'Afectación de más del 50% de puntos de atención',
        thresholdValue: '50%',
        severity: 'CRITICAL',
        isAutoActivate: true
      },
      {
        id: 3,
        planId: 2,
        code: 'ACT-003',
        description: 'Sistema de licencias inoperativo > 4 horas',
        thresholdValue: '4 horas',
        severity: 'HIGH',
        isAutoActivate: false
      },
      {
        id: 4,
        planId: 3,
        code: 'ACT-004',
        description: 'Emergencia médica masiva (> 50 pacientes simultáneos)',
        thresholdValue: '50 pacientes',
        severity: 'CRITICAL',
        isAutoActivate: true
      },
      {
        id: 5,
        planId: 3,
        code: 'ACT-005',
        description: 'Evacuación de instalación hospitalaria',
        thresholdValue: 'Evacuación total',
        severity: 'CRITICAL',
        isAutoActivate: true
      }
    ],

    // -------------------------------------------------------------------------
    // ESTRATEGIAS DE RECUPERACIÓN (recovery_strategies) - ISO 22301 Cláusula 8.3
    // -------------------------------------------------------------------------
    recoveryStrategies: [
      {
        id: 1,
        planId: 1,
        name: 'Habilitación de sitio alterno',
        description: 'Activar punto de atención alternativo en otra ubicación',
        rtoHours: 4,
        rpoHours: 1,
        estimatedCost: 5000000,
        resourceRequirements: 'Personal capacitado, equipos portátiles, conectividad',
        dependencies: 'Sitio alterno disponible, transporte de personal'
      },
      {
        id: 2,
        planId: 1,
        name: 'Atención remota/telefónica',
        description: 'Derivar atención a canal telefónico y digital',
        rtoHours: 1,
        rpoHours: 0.5,
        estimatedCost: 500000,
        resourceRequirements: 'Personal con VPN, sistema telefónico cloud',
        dependencies: 'Conectividad internet, sistema CRM operativo'
      },
      {
        id: 3,
        planId: 2,
        name: 'Procesamiento manual de licencias',
        description: 'Proceso manual de recepción y validación de licencias',
        rtoHours: 2,
        rpoHours: 0.5,
        estimatedCost: 1000000,
        resourceRequirements: 'Formularios físicos, personal adicional',
        dependencies: 'Ninguna tecnológica'
      },
      {
        id: 4,
        planId: 3,
        name: 'Derivación a hospitales de la red',
        description: 'Trasladar pacientes a otros centros de la red ACHS',
        rtoHours: 0.5,
        rpoHours: 0,
        estimatedCost: 10000000,
        resourceRequirements: 'Ambulancias, coordinación con otros centros',
        dependencies: 'Disponibilidad de camas en red, transporte'
      },
      {
        id: 5,
        planId: 3,
        name: 'Instalación de hospital de campaña',
        description: 'Desplegar capacidad temporal en estacionamiento',
        rtoHours: 4,
        rpoHours: 0,
        estimatedCost: 50000000,
        resourceRequirements: 'Carpas médicas, equipamiento, personal',
        dependencies: 'Insumos médicos, personal disponible'
      }
    ],

    // -------------------------------------------------------------------------
    // PROCEDIMIENTOS DE RECUPERACIÓN (recovery_procedures) - ISO 22301 Cláusula 8.4.4
    // -------------------------------------------------------------------------
    recoveryProcedures: [
      // Procedimientos de estrategia 1 (Sitio alterno)
      { id: 1, strategyId: 1, stepOrder: 1, title: 'Notificar a equipo de crisis', responsibleRole: 'Coordinador Crisis', estimatedDurationMin: 15 },
      { id: 2, strategyId: 1, stepOrder: 2, title: 'Activar sitio alterno', responsibleRole: 'Jefe Operaciones', estimatedDurationMin: 30 },
      { id: 3, strategyId: 1, stepOrder: 3, title: 'Transportar personal al sitio', responsibleRole: 'Logística', estimatedDurationMin: 60 },
      { id: 4, strategyId: 1, stepOrder: 4, title: 'Verificar conectividad y sistemas', responsibleRole: 'TI', estimatedDurationMin: 30 },
      { id: 5, strategyId: 1, stepOrder: 5, title: 'Iniciar atención en sitio alterno', responsibleRole: 'Jefe Operaciones', estimatedDurationMin: 15 },
      // Procedimientos de estrategia 2 (Atención remota)
      { id: 6, strategyId: 2, stepOrder: 1, title: 'Activar VPN para personal de atención', responsibleRole: 'TI', estimatedDurationMin: 10 },
      { id: 7, strategyId: 2, stepOrder: 2, title: 'Redirigir llamadas al contact center', responsibleRole: 'Telecomunicaciones', estimatedDurationMin: 5 },
      { id: 8, strategyId: 2, stepOrder: 3, title: 'Notificar a afiliados vía web/SMS', responsibleRole: 'Comunicaciones', estimatedDurationMin: 15 },
      { id: 9, strategyId: 2, stepOrder: 4, title: 'Iniciar atención telefónica', responsibleRole: 'Contact Center', estimatedDurationMin: 5 }
    ],

    // -------------------------------------------------------------------------
    // PRUEBAS Y EJERCICIOS (plan_tests) - ISO 22301 Cláusula 8.5
    // -------------------------------------------------------------------------
    planTests: [
      {
        id: 1,
        code: 'TEST-2024-001',
        planId: 1,
        testType: 'TABLETOP',
        title: 'Ejercicio de mesa - Falla datacenter',
        testDate: '2024-09-15',
        scopeDescription: 'Simular respuesta ante caída total del datacenter principal',
        participants: 'Equipo de crisis, TI, Operaciones (12 personas)',
        objectives: 'Validar tiempos de respuesta y comunicación',
        resultsSummary: 'Se cumplieron tiempos objetivo. Mejoras identificadas en comunicación',
        successRatePct: 85,
        issuesFound: 'Demora en notificación a gerencia (15 min vs 5 min objetivo)',
        recommendations: 'Implementar sistema de notificación automática',
        conductedBy: 4
      },
      {
        id: 2,
        code: 'TEST-2024-002',
        planId: 4,
        testType: 'TECHNICAL_TEST',
        title: 'Prueba de failover - Base de datos',
        testDate: '2024-10-20',
        scopeDescription: 'Prueba técnica de failover automático a réplica de BD',
        participants: 'Equipo DBA, Infraestructura (5 personas)',
        objectives: 'Verificar RPO y RTO de base de datos crítica',
        resultsSummary: 'Failover exitoso en 3 minutos, sin pérdida de datos',
        successRatePct: 100,
        issuesFound: 'Ninguno',
        recommendations: 'Programar prueba trimestral',
        conductedBy: 1
      },
      {
        id: 3,
        code: 'TEST-2024-003',
        planId: 3,
        testType: 'SIMULATION',
        title: 'Simulacro de evacuación - Hospital Central',
        testDate: '2024-11-10',
        scopeDescription: 'Simulacro completo de evacuación por sismo',
        participants: 'Todo el personal del hospital (320 personas)',
        objectives: 'Validar tiempos de evacuación y puntos de encuentro',
        resultsSummary: 'Evacuación completada en 8 minutos (objetivo: 10 min)',
        successRatePct: 95,
        issuesFound: 'Congestión en escalera norte',
        recommendations: 'Redistribuir rutas de evacuación',
        conductedBy: 4
      },
      {
        id: 4,
        code: 'TEST-2025-001',
        planId: 2,
        testType: 'WALKTHROUGH',
        title: 'Recorrido guiado - Plan licencias medicas',
        testDate: '2025-02-15',
        scopeDescription: 'Revision paso a paso del procedimiento de contingencia',
        participants: 'Equipo de licencias, TI (8 personas)',
        objectives: 'Familiarizar al equipo con procedimientos actualizados',
        status: 'SCHEDULED'
      },
      {
        id: 5,
        code: 'TEST-2024-004',
        planId: 5, // DRP-002
        testType: 'TECHNICAL_TEST',
        title: 'Prueba de DR - Sistemas Core',
        testDate: '2024-11-25',
        scopeDescription: 'Validacion de recuperacion de sistemas core en sitio alterno',
        participants: 'Equipo de Infraestructura, DBA, Desarrollo (10 personas)',
        objectives: 'Verificar recuperacion de aplicaciones criticas en sitio DR',
        resultsSummary: 'Recuperacion exitosa de 4 de 5 sistemas. ERP requiere ajuste manual.',
        successRatePct: 80,
        issuesFound: 'ERP requiere configuracion manual post-recuperacion',
        recommendations: 'Automatizar scripts de configuracion ERP',
        conductedBy: 7
      },
      {
        id: 6,
        code: 'TEST-2024-005',
        planId: 4, // DRP-001
        testType: 'FULL_EXERCISE',
        title: 'Ejercicio completo DR - Datacenter',
        testDate: '2024-08-30',
        scopeDescription: 'Ejercicio de recuperacion total en sitio alterno',
        participants: 'Infraestructura, Redes, DBA, Seguridad (15 personas)',
        objectives: 'Validar capacidad de operacion desde sitio DR por 24h',
        resultsSummary: 'Operacion estable durante 26 horas desde sitio alterno',
        successRatePct: 92,
        issuesFound: 'Latencia en VPN afecto rendimiento de aplicaciones web',
        recommendations: 'Aumentar ancho de banda del enlace DR',
        conductedBy: 1
      }
    ],

    // -------------------------------------------------------------------------
    // PARTICIPANTES DE ACTIVIDADES (activity_participants)
    // -------------------------------------------------------------------------
    activityParticipants: [
      { id: 1, activityType: 'PLAN_TEST', activityId: 1, participantType: 'USER', userId: 2, role: 'Observer', attendanceStatus: 'ATTENDED', score: 85 },
      { id: 2, activityType: 'PLAN_TEST', activityId: 1, participantType: 'USER', userId: 4, role: 'Lider', attendanceStatus: 'ATTENDED', score: 92 },
      { id: 3, activityType: 'PLAN_TEST', activityId: 2, participantType: 'EXTERNAL', externalName: 'External consultant', externalEmail: 'consultant@example.com', role: 'Evaluator', attendanceStatus: 'ATTENDED' }
    ],

    // -------------------------------------------------------------------------
    // AUDITORÍAS (audits) - ISO 22301 Cláusula 9.2
    // -------------------------------------------------------------------------
    audits: [
      {
        id: 1,
        code: 'AUD-2024-001',
        auditType: 'INTERNAL',
        title: 'Auditoría interna SGCN Q3 2024',
        objective: 'Verificar cumplimiento de procedimientos BCP y DRP',
        organizationId: 1,
        frameworkId: 1, // ISO 22301
        scopeDescription: 'Procesos críticos: Atención, Licencias, TI',
        leadAuditorId: 5,
        plannedStart: '2024-08-01',
        plannedEnd: '2024-08-15',
        actualStart: '2024-08-01',
        actualEnd: '2024-08-12',
        status: 'COMPLETED',
        conclusion: 'Sistema conforme con 2 observaciones menores',
        scopeItems: [
          { type: 'PROCESS', entityId: 1, name: 'Atención al Afiliado' },
          { type: 'PROCESS', entityId: 2, name: 'Licencias Médicas' },
          { type: 'PROCESS', entityId: 5, name: 'Gestión de TI' }
        ]
      },
      {
        id: 2,
        code: 'AUD-2024-002',
        auditType: 'EXTERNAL',
        title: 'Auditoría de vigilancia ISO 22301',
        objective: 'Verificar mantenimiento de certificación',
        organizationId: 1,
        frameworkId: 1,
        scopeDescription: 'Alcance completo del SGCN',
        plannedStart: '2024-11-15',
        plannedEnd: '2024-11-20',
        actualStart: '2024-11-15',
        actualEnd: '2024-11-18',
        status: 'COMPLETED',
        conclusion: 'Certificación mantenida sin no conformidades',
        externalAuditor: 'Bureau Veritas Chile'
      },
      {
        id: 3,
        code: 'AUD-2025-001',
        auditType: 'INTERNAL',
        title: 'Auditoría interna SGCN Q1 2025',
        objective: 'Evaluar implementación de mejoras post-incidentes',
        organizationId: 1,
        frameworkId: 1,
        scopeDescription: 'Seguimiento a hallazgos y lecciones aprendidas',
        leadAuditorId: 5,
        plannedStart: '2025-02-01',
        plannedEnd: '2025-02-10',
        status: 'SCHEDULED'
      }
    ],

    // -------------------------------------------------------------------------
    // HALLAZGOS (findings) - ISO 22301 Cláusula 10.1
    // -------------------------------------------------------------------------
    findings: [
      {
        id: 1,
        code: 'FND-2024-001',
        auditId: 1,
        findingType: 'OBSERVATION',
        title: 'Actualización pendiente de árbol de llamadas',
        description: 'El árbol de llamadas del BCP-001 no refleja cambios organizacionales recientes',
        severity: 'LOW',
        status: 'CLOSED',
        relatedRequirementCode: 'ISO 22301:8.4.4.d',
        rootCause: 'Falta de proceso de actualización periódica',
        recommendation: 'Establecer revisión trimestral de listas de contactos',
        responsibleUserId: 2,
        dueDate: '2024-09-15',
        closedAt: '2024-09-10'
      },
      {
        id: 2,
        code: 'FND-2024-002',
        auditId: 1,
        findingType: 'OBSERVATION',
        title: 'Falta de evidencia de capacitación en DRP',
        description: 'No se encontró registro de capacitación del equipo TI en procedimientos DRP',
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        relatedRequirementCode: 'ISO 22301:7.2',
        rootCause: 'Capacitaciones realizadas pero no documentadas',
        recommendation: 'Implementar registro formal de capacitaciones',
        responsibleUserId: 1,
        dueDate: '2025-01-31'
      },
      {
        id: 3,
        code: 'FND-2024-003',
        auditId: 2,
        findingType: 'POSITIVE',
        title: 'Excelente gestión de incidente reciente',
        description: 'La respuesta al incidente INC-2024-001 demostró madurez del SGCN',
        severity: 'INFO',
        status: 'CLOSED',
        relatedRequirementCode: 'ISO 22301:8.4',
        responsibleUserId: 3,
        dueDate: null,
        closedAt: '2024-11-20'
      },
      {
        id: 4,
        code: 'FND-2025-001',
        auditId: 2,
        findingType: 'NC_MAJOR',
        title: 'BIA no actualizado para procesos críticos',
        description: 'El análisis de impacto en el negocio (BIA) de 3 procesos críticos no ha sido actualizado en más de 18 meses, incumpliendo la política de revisión anual',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        relatedRequirementCode: 'ISO 22301:8.2.2',
        rootCause: 'Falta de asignación de responsable y seguimiento periódico',
        recommendation: 'Asignar responsables por proceso y establecer calendario de actualización',
        responsibleUserId: 2,
        dueDate: '2025-03-15'
      },
      {
        id: 5,
        code: 'FND-2025-002',
        auditId: 2,
        findingType: 'NC_MINOR',
        title: 'Documentación de pruebas incompleta',
        description: 'Los registros de 2 pruebas de simulacro no incluyen métricas de RTO/RPO alcanzado ni evaluación de efectividad',
        severity: 'MEDIUM',
        status: 'OPEN',
        relatedRequirementCode: 'ISO 22301:8.5',
        rootCause: 'Formato de informe de prueba incompleto',
        recommendation: 'Actualizar plantilla de informe post-ejercicio incluyendo campos obligatorios',
        responsibleUserId: 4,
        dueDate: '2025-02-28'
      },
      {
        id: 6,
        code: 'FND-2025-003',
        auditId: 3,
        findingType: 'NC_MINOR',
        title: 'Control de accesos sin revisión periódica',
        description: 'No existe evidencia de revisión semestral de permisos de acceso a sistemas críticos del BCMS',
        severity: 'MEDIUM',
        status: 'OPEN',
        relatedRequirementCode: 'ISO 27001:A.9.2.5',
        rootCause: 'Proceso de recertificación no implementado',
        recommendation: 'Implementar proceso de recertificación semestral de accesos',
        responsibleUserId: 1,
        dueDate: '2025-04-30'
      },
      {
        id: 7,
        code: 'FND-2025-004',
        auditId: 3,
        findingType: 'NC_MAJOR',
        title: 'Proveedores críticos sin plan de contingencia',
        description: '2 de 5 proveedores clasificados como críticos no cuentan con plan de contingencia evaluado ni alternativa documentada',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        relatedRequirementCode: 'ISO 22301:8.3.5',
        rootCause: 'Proceso de evaluación de proveedores no incluye requisitos de contingencia',
        recommendation: 'Incluir evaluación de planes de contingencia en proceso de onboarding de proveedores críticos',
        responsibleUserId: 5,
        dueDate: '2025-03-31'
      },
      {
        id: 8,
        code: 'FND-2025-005',
        auditId: 3,
        findingType: 'OBSERVATION',
        title: 'Oportunidad de mejora en comunicaciones de crisis',
        description: 'Las plantillas de comunicación no incluyen canales alternativos ante falla del email corporativo',
        severity: 'LOW',
        status: 'OPEN',
        relatedRequirementCode: 'ISO 22301:8.4.3',
        rootCause: 'Diseño original no contempló escenario de falla del canal principal',
        recommendation: 'Agregar canales SMS y WhatsApp como alternativa en plantillas de crisis',
        responsibleUserId: 3,
        dueDate: '2025-05-15'
      }
    ],

    // -------------------------------------------------------------------------
    // ACCIONES (finding_actions) - ISO 22301 Cláusula 10.1
    // -------------------------------------------------------------------------
    findingActions: [
      {
        id: 1,
        findingId: 1,
        actionType: 'CORRECTIVE',
        description: 'Actualizar árbol de llamadas con estructura organizacional vigente',
        ownerUserId: 2,
        dueDate: '2024-09-10',
        status: 'COMPLETED',
        completedAt: '2024-09-08',
        verificationNotes: 'Verificado por auditor, documentación actualizada'
      },
      {
        id: 2,
        findingId: 1,
        actionType: 'PREVENTIVE',
        description: 'Establecer proceso de revisión trimestral de contactos',
        ownerUserId: 2,
        dueDate: '2024-09-15',
        status: 'COMPLETED',
        completedAt: '2024-09-12',
        verificationNotes: 'Procedimiento documentado y comunicado'
      },
      {
        id: 3,
        findingId: 2,
        actionType: 'CORRECTIVE',
        description: 'Registrar capacitaciones DRP realizadas en 2024',
        ownerUserId: 1,
        dueDate: '2025-01-15',
        status: 'IN_PROGRESS'
      },
      {
        id: 4,
        findingId: 2,
        actionType: 'IMPROVEMENT',
        description: 'Implementar plataforma de gestión de capacitaciones',
        ownerUserId: 1,
        dueDate: '2025-03-31',
        status: 'NOT_STARTED'
      },
      {
        id: 5,
        findingId: 4,
        actionType: 'CORRECTIVE',
        description: 'Actualizar BIA de los 3 procesos críticos identificados',
        ownerUserId: 2,
        dueDate: '2025-02-28',
        status: 'IN_PROGRESS'
      },
      {
        id: 6,
        findingId: 4,
        actionType: 'PREVENTIVE',
        description: 'Implementar alerta automática de vencimiento de BIA por proceso',
        ownerUserId: 1,
        dueDate: '2025-03-15',
        status: 'NOT_STARTED'
      },
      {
        id: 7,
        findingId: 5,
        actionType: 'CORRECTIVE',
        description: 'Completar registros de pruebas con métricas RTO/RPO alcanzado',
        ownerUserId: 4,
        dueDate: '2025-02-15',
        status: 'IN_PROGRESS'
      },
      {
        id: 8,
        findingId: 6,
        actionType: 'CORRECTIVE',
        description: 'Ejecutar revisión de permisos de acceso a sistemas BCMS',
        ownerUserId: 1,
        dueDate: '2025-03-31',
        status: 'NOT_STARTED'
      },
      {
        id: 9,
        findingId: 7,
        actionType: 'CORRECTIVE',
        description: 'Evaluar planes de contingencia de proveedores críticos faltantes',
        ownerUserId: 5,
        dueDate: '2025-03-15',
        status: 'IN_PROGRESS'
      },
      {
        id: 10,
        findingId: 7,
        actionType: 'PREVENTIVE',
        description: 'Actualizar checklist de onboarding de proveedores con requisitos de contingencia',
        ownerUserId: 5,
        dueDate: '2025-03-31',
        status: 'NOT_STARTED'
      }
    ],

    // -------------------------------------------------------------------------
    // REVISION POR LA DIRECCION (management_reviews) - ISO 22301 Clausula 9.3
    // -------------------------------------------------------------------------
    managementReviews: [
      {
        id: 1,
        code: 'MR-2024-Q4',
        reviewDate: '2024-12-15',
        periodStart: '2024-10-01',
        periodEnd: '2024-12-31',
        scopeDescription: 'Revision de desempeno BCMS Q4',
        chairUserId: 6,
        status: 'COMPLETED'
      }
    ],

    // -------------------------------------------------------------------------
    // ENTRADAS DE REVISION (management_review_inputs)
    // -------------------------------------------------------------------------
    managementReviewInputs: [
      { id: 1, reviewId: 1, inputType: 'AUDIT', entityType: 'AUDIT', entityId: 1, summary: 'Auditoria interna Q3' },
      { id: 2, reviewId: 1, inputType: 'EXERCISE', entityType: 'PLAN_TEST', entityId: 1, summary: 'Ejercicio de mesa datacenter' },
      { id: 3, reviewId: 1, inputType: 'INCIDENT', entityType: 'INCIDENT', entityId: 1, summary: 'Incidente de base de datos' },
      { id: 4, reviewId: 1, inputType: 'CHANGE', entityType: 'BCMS_CHANGE', entityId: 'CHG-2024-001', summary: 'Cambio de RTO en proceso licencias' }
    ],

    // -------------------------------------------------------------------------
    // SALIDAS DE REVISION (management_review_outputs)
    // -------------------------------------------------------------------------
    managementReviewOutputs: [
      { id: 1, reviewId: 1, decisionType: 'ACTION', description: 'Actualizar plan de comunicaciones', ownerUserId: 4, dueDate: '2025-02-01', status: 'OPEN' },
      { id: 2, reviewId: 1, decisionType: 'RESOURCE', description: 'Aumentar presupuesto de pruebas', ownerUserId: 6, dueDate: '2025-03-01', status: 'OPEN' }
    ],

    // -------------------------------------------------------------------------
    // LECCIONES APRENDIDAS (lessons_learned) - ISO 22301 Cláusula 10.2 ⭐ NUEVO
    // -------------------------------------------------------------------------
    lessonsLearned: [
      {
        id: 'LL-2024-001',
        code: 'LL-2024-001',
        title: 'Importancia del monitoreo predictivo de discos',
        sourceType: 'INCIDENT',
        sourceId: 1, // INC-2024-001
        lessonDate: '2024-11-20',
        description: 'El incidente de falla de disco pudo haberse prevenido con monitoreo predictivo',
        rootCause: 'Ausencia de herramientas de monitoreo de salud de discos',
        impactAssessment: 'Interrupción de 5 horas, afectación a 1200 usuarios',
        recommendations: 'Implementar SMART monitoring y alertas preventivas',
        improvementActions: 'Adquisición e implementación de herramienta de monitoreo',
        actionsTaken: 'Se adquirió licencia de monitoreo, en proceso de implementación',
        status: 'in_progress',
        priority: 'high',
        effectivenessMetrics: {
          before: { mtbf_days: 180, unplanned_downtime_hours: 12 },
          after: { mtbf_days: 'TBD', unplanned_downtime_hours: 'TBD' },
          improvement_percentage: null
        },
        responsibleId: 1,
        dueDate: '2025-02-28',
        organizationId: 1
      },
      {
        id: 'LL-2024-002',
        code: 'LL-2024-002',
        title: 'Efectividad de simulacros de phishing',
        sourceType: 'INCIDENT',
        sourceId: 2, // INC-2024-002
        lessonDate: '2024-10-25',
        description: 'Los usuarios que participaron en simulacros previos no cayeron en el phishing real',
        rootCause: 'Capacitación efectiva pero no universal',
        impactAssessment: '3 usuarios comprometidos de 8500 (0.035%)',
        recommendations: 'Extender simulacros a toda la organización trimestralmente',
        improvementActions: 'Programa trimestral de simulacros de phishing',
        actionsTaken: 'Primera campaña universal realizada en diciembre',
        status: 'implemented',
        priority: 'medium',
        effectivenessMetrics: {
          before: { phishing_success_rate: 0.035 },
          after: { phishing_success_rate: 0.008 },
          improvement_percentage: 77
        },
        responsibleId: 3,
        implementationDate: '2024-12-15',
        organizationId: 1
      },
      {
        id: 'LL-2024-003',
        code: 'LL-2024-003',
        title: 'Valor de redundancia de energía',
        sourceType: 'INCIDENT',
        sourceId: 3, // INC-2024-003
        lessonDate: '2024-09-10',
        description: 'La inversión en UPS y generadores demostró su valor durante el corte',
        rootCause: 'N/A - Buena práctica confirmada',
        impactAssessment: 'Cero afectación operativa durante corte de 2 horas',
        recommendations: 'Mantener programa de mantenimiento y pruebas de generadores',
        status: 'validated',
        priority: 'low',
        effectivenessMetrics: {
          investment_usd: 150000,
          incidents_prevented: 1,
          estimated_savings_usd: 500000
        },
        organizationId: 1
      },
      {
        id: 'LL-2024-004',
        code: 'LL-2024-004',
        title: 'Mejora en tiempos de notificación durante ejercicios',
        sourceType: 'EXERCISE',
        sourceId: 1, // TEST-2024-001
        lessonDate: '2024-09-20',
        description: 'Se identificó demora en notificación a gerencia durante ejercicio de mesa',
        rootCause: 'Proceso manual de notificación telefónica',
        impactAssessment: 'Demora de 15 minutos vs objetivo de 5 minutos',
        recommendations: 'Implementar sistema de notificación automatizada',
        improvementActions: 'Adquisición de plataforma de notificación masiva',
        actionsTaken: 'Plataforma implementada y probada',
        status: 'validated',
        priority: 'high',
        effectivenessMetrics: {
          before: { notification_time_minutes: 15 },
          after: { notification_time_minutes: 2 },
          improvement_percentage: 87
        },
        responsibleId: 4,
        implementationDate: '2024-11-30',
        validationDate: '2024-12-15',
        organizationId: 1
      },
      {
        id: 'LL-2024-005',
        code: 'LL-2024-005',
        title: 'Redistribución de rutas de evacuación',
        sourceType: 'EXERCISE',
        sourceId: 3, // TEST-2024-003
        lessonDate: '2024-11-15',
        description: 'Congestión detectada en escalera norte durante simulacro',
        rootCause: 'Distribución desigual de personal por pisos',
        impactAssessment: 'Riesgo de demora en evacuación en emergencia real',
        recommendations: 'Modificar plan de evacuación asignando rutas alternativas',
        improvementActions: 'Actualizar plan y señalética de evacuación',
        status: 'in_progress',
        priority: 'high',
        responsibleId: 4,
        dueDate: '2025-01-31',
        organizationId: 1
      }
    ],

    // -------------------------------------------------------------------------
    // CAMBIOS BCMS (bcms_changes) - ISO 22301 Cláusula 6.3 ⭐ NUEVO
    // -------------------------------------------------------------------------
    bcmsChanges: [
      {
        id: 'CHG-2024-001',
        changeCode: 'CHG-2024-001',
        title: 'Actualización de RTO proceso Licencias Médicas',
        description: 'Reducción del RTO de 4 horas a 2 horas basado en nueva infraestructura',
        changeType: 'PROCESS_CHANGE',
        changeCategory: 'major',
        affectedEntities: [
          { entityType: 'process', entityId: 2, description: 'Cambio de RTO de 4h a 2h' },
          { entityType: 'plan', entityId: 2, description: 'Actualización de BCP-002' }
        ],
        impactAssessment: 'Requiere ajustes en procedimientos de recuperación y recursos adicionales',
        riskLevel: 'medium',
        reason: 'Nueva infraestructura cloud permite recuperación más rápida',
        expectedBenefits: 'Menor tiempo de afectación a afiliados, mejor SLA',
        requestedBy: 1,
        requestDate: '2024-07-10',
        approvedBy: 6,
        approvalDate: '2024-07-15',
        status: 'implemented',
        scheduledDate: '2024-08-01',
        implementationDate: '2024-08-01',
        implementationNotes: 'Cambio implementado sin incidentes',
        verifiedBy: 5,
        verificationDate: '2024-08-05',
        verificationNotes: 'Verificado mediante prueba técnica exitosa',
        organizationId: 1
      },
      {
        id: 'CHG-2024-002',
        changeCode: 'CHG-2024-002',
        title: 'Incorporación de proceso Telemedicina al SGCN',
        description: 'Inclusión del nuevo proceso de telemedicina en el alcance del SGCN',
        changeType: 'SCOPE_CHANGE',
        changeCategory: 'major',
        affectedEntities: [
          { entityType: 'scope', entityId: null, description: 'Ampliación del alcance del SGCN' }
        ],
        impactAssessment: 'Requiere BIA, evaluación de riesgos y plan BCP para nuevo proceso',
        riskLevel: 'high',
        reason: 'Proceso estratégico post-pandemia que requiere continuidad garantizada',
        expectedBenefits: 'Cobertura completa de servicios críticos al afiliado',
        requestedBy: 6,
        requestDate: '2024-09-01',
        approvedBy: 6,
        approvalDate: '2024-09-05',
        status: 'in_progress',
        scheduledDate: '2025-01-15',
        rollbackPlan: 'Mantener proceso fuera de alcance si recursos insuficientes',
        organizationId: 1
      },
      {
        id: 'CHG-2025-001',
        changeCode: 'CHG-2025-001',
        title: 'Actualización de política de continuidad',
        description: 'Revisión anual de la política de continuidad del negocio',
        changeType: 'POLICY_CHANGE',
        changeCategory: 'minor',
        affectedEntities: [
          { entityType: 'policy', entityId: 1, description: 'Política de Continuidad v2.0' }
        ],
        impactAssessment: 'Cambios menores en redacción, sin impacto operativo',
        riskLevel: 'low',
        reason: 'Revisión anual obligatoria según ISO 22301',
        requestedBy: 4,
        requestDate: '2025-01-05',
        status: 'pending',
        organizationId: 1
      }
    ],

    // -------------------------------------------------------------------------
    // DEPENDENCIAS BIA (bia_dependencies) - ISO 22301 Cláusula 8.2.2.d
    // -------------------------------------------------------------------------
    biaDependencies: [
      { id: 1, processId: 1, dependencyType: 'APPLICATION', referenceId: 'APP-001', referenceName: 'Sistema CRM', criticality: 'CRITICAL' },
      { id: 2, processId: 1, dependencyType: 'APPLICATION', referenceId: 'APP-002', referenceName: 'Portal Web Afiliados', criticality: 'HIGH' },
      { id: 3, processId: 1, dependencyType: 'PERSONNEL', referenceId: 'ROL-001', referenceName: 'Ejecutivos de Atención (mín. 10)', criticality: 'CRITICAL' },
      { id: 4, processId: 2, dependencyType: 'APPLICATION', referenceId: 'APP-003', referenceName: 'Sistema de Licencias', criticality: 'CRITICAL' },
      { id: 5, processId: 2, dependencyType: 'UPSTREAM_PROCESS', referenceId: 1, referenceName: 'Atención al Afiliado', criticality: 'HIGH' },
      { id: 6, processId: 2, dependencyType: 'SUPPLIER', referenceId: 'SUP-001', referenceName: 'FONASA', criticality: 'HIGH' },
      { id: 7, processId: 5, dependencyType: 'ASSET', referenceId: 'AST-001', referenceName: 'Datacenter Principal', criticality: 'CRITICAL' },
      { id: 8, processId: 5, dependencyType: 'SUPPLIER', referenceId: 'SUP-002', referenceName: 'Proveedor Cloud (AWS)', criticality: 'CRITICAL' },
      { id: 9, processId: 7, dependencyType: 'ASSET', referenceId: 'AST-002', referenceName: 'Equipamiento Médico', criticality: 'CRITICAL' },
      { id: 10, processId: 7, dependencyType: 'PERSONNEL', referenceId: 'ROL-002', referenceName: 'Personal Médico (mín. 20)', criticality: 'CRITICAL' },
      { id: 11, processId: 7, dependencyType: 'SUPPLIER', referenceId: 'SUP-003', referenceName: 'Proveedor Insumos Médicos', criticality: 'HIGH' }
    ],
    // -------------------------------------------------------------------------
    // UBICACIONES (locations)
    // -------------------------------------------------------------------------
    locations: [
      {
        id: 1,
        code: 'LOC-001',
        name: 'Sede Central - Providencia',
        locationTypeLu: 1,
        locationType: 'Casa Matriz',
        type: 'HEADQUARTERS',
        addressLine1: 'Ramon Carnicer 163',
        addressLine2: '',
        city: 'Santiago',
        regionState: 'RM',
        postalCode: '7500000',
        countryCode: 'CL',
        gpsLat: -33.4378,
        gpsLon: -70.6504,
        capacityPersons: 450,
        isPrimary: true,
        organizationId: 1,
        parentLocationId: null,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-09-12T12:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        address: 'Ramon Carnicer 163'
      },
      {
        id: 2,
        code: 'LOC-002',
        name: 'Hospital ACHS',
        locationTypeLu: 2,
        locationType: 'Hospital',
        type: 'HOSPITAL',
        addressLine1: 'Av. Vicuna Mackenna 200',
        addressLine2: '',
        city: 'Santiago',
        regionState: 'RM',
        postalCode: '7501000',
        countryCode: 'CL',
        gpsLat: -33.4702,
        gpsLon: -70.6515,
        capacityPersons: 900,
        isPrimary: false,
        organizationId: 2,
        parentLocationId: 1,
        createdAt: '2024-02-05T09:00:00Z',
        updatedAt: '2024-10-01T12:00:00Z',
        createdBy: 'Luis Soto',
        updatedBy: 'Roberto Rodriguez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        address: 'Av. Vicuna Mackenna 200'
      },
      {
        id: 3,
        code: 'LOC-003',
        name: 'Centro de Atencion Maipu',
        locationTypeLu: 3,
        locationType: 'Sucursal',
        type: 'BRANCH',
        addressLine1: 'Av. Pajaritos 1500',
        addressLine2: '',
        city: 'Maipu',
        regionState: 'RM',
        postalCode: '9250000',
        countryCode: 'CL',
        gpsLat: -33.5167,
        gpsLon: -70.7599,
        capacityPersons: 120,
        isPrimary: false,
        organizationId: 2,
        parentLocationId: 1,
        createdAt: '2024-03-01T09:00:00Z',
        updatedAt: '2024-08-15T12:00:00Z',
        createdBy: 'Maria Garcia',
        updatedBy: 'Juan Perez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        address: 'Av. Pajaritos 1500'
      },
      {
        id: 4,
        code: 'LOC-004',
        name: 'Datacenter Principal',
        locationTypeLu: 4,
        locationType: 'Centro de Datos',
        type: 'DATACENTER',
        addressLine1: 'Confidencial',
        addressLine2: '',
        city: 'Santiago',
        regionState: 'RM',
        postalCode: '7502000',
        countryCode: 'CL',
        gpsLat: -33.45,
        gpsLon: -70.65,
        capacityPersons: 40,
        isPrimary: true,
        organizationId: 1,
        parentLocationId: null,
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-07-20T12:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedBy: 'Carlos Mendoza',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        address: 'Confidencial'
      },
      {
        id: 5,
        code: 'LOC-005',
        name: 'Sitio Alterno DR',
        locationTypeLu: 5,
        locationType: 'Sitio DR',
        type: 'DR_SITE',
        addressLine1: 'Confidencial',
        addressLine2: '',
        city: 'Valparaiso',
        regionState: 'Valparaiso',
        postalCode: '2340000',
        countryCode: 'CL',
        gpsLat: -33.0472,
        gpsLon: -71.6127,
        capacityPersons: 30,
        isPrimary: false,
        organizationId: 1,
        parentLocationId: 4,
        createdAt: '2024-02-10T09:00:00Z',
        updatedAt: '2024-09-01T12:00:00Z',
        createdBy: 'Patricia Morales',
        updatedBy: 'Luis Soto',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        address: 'Confidencial'
      }
    ],

    // -------------------------------------------------------------------------
    // ACTIVOS (assets)
    // -------------------------------------------------------------------------
    assets: [
      {
        id: 1,
        code: 'AST-001',
        name: 'Datacenter Principal',
        assetCategoryLu: 1,
        assetCategory: 'Infraestructura',
        assetTypeLu: 4,
        assetType: 'Centro de Datos',
        description: 'Infraestructura principal de servicios.',
        ownerUserId: 1,
        ownerName: 'Carlos Mendoza',
        locationId: 4,
        criticalityLu: 1,
        criticality: 'CRITICAL',
        valueAmount: 1500000,
        currencyCode: 'USD',
        acquisitionDate: '2022-05-10',
        vendorName: 'Equinix',
        serialNumber: 'DC-PRD-001',
        metadata: '{"tier":"IV"}',
        organizationId: 1,
        createdAt: '2024-01-05T09:00:00Z',
        updatedAt: '2024-08-20T12:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedBy: 'Roberto Rodriguez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'AST-002',
        name: 'Equipamiento Medico',
        assetCategoryLu: 3,
        assetCategory: 'Equipos',
        assetTypeLu: 5,
        assetType: 'Equipamiento Medico',
        description: 'Equipos criticos de apoyo clinico.',
        ownerUserId: 6,
        ownerName: 'Luis Soto',
        locationId: 2,
        criticalityLu: 1,
        criticality: 'CRITICAL',
        valueAmount: 250000000,
        currencyCode: 'CLP',
        acquisitionDate: '2021-11-30',
        vendorName: 'GE Healthcare',
        serialNumber: 'MED-ACHS-778',
        metadata: '{"mantencion":"2025-12-31"}',
        organizationId: 2,
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-09-05T12:00:00Z',
        createdBy: 'Luis Soto',
        updatedBy: 'Roberto Rodriguez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'AST-003',
        name: 'Plataforma CRM',
        assetCategoryLu: 2,
        assetCategory: 'Aplicacion',
        assetTypeLu: 6,
        assetType: 'Software como Servicio',
        description: 'Plataforma CRM para gestion comercial.',
        ownerUserId: 2,
        ownerName: 'Juan Perez',
        locationId: 1,
        criticalityLu: 2,
        criticality: 'HIGH',
        valueAmount: 50000,
        currencyCode: 'USD',
        acquisitionDate: '2023-03-15',
        vendorName: 'Salesforce',
        serialNumber: 'CRM-SF-2023',
        metadata: '{"licencias":120}',
        organizationId: 2,
        createdAt: '2024-02-20T09:00:00Z',
        updatedAt: '2024-10-10T12:00:00Z',
        createdBy: 'Juan Perez',
        updatedBy: 'Ana Lopez',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // PROVEEDORES (suppliers)
    // -------------------------------------------------------------------------
    suppliers: [
      {
        id: 1,
        code: 'SUP-001',
        name: 'Microsoft Azure',
        type: 'Cloud Provider',
        supplierType: 'Cloud Provider',
        supplierTypeLu: 1,
        taxId: '76.111.222-3',
        website: 'https://azure.microsoft.com',
        city: 'Santiago',
        countryCode: 'US',
        riskTier: 'Tier 1',
        riskTierLu: 1,
        criticality: 'CRITICAL',
        criticalityLu: 1,
        contractStart: '2023-01-01',
        contractEnd: '2025-12-31',
        organizationId: 1,
        isActive: true,
        address: 'Av. Apoquindo 3000',
        slaSummary: 'Disponibilidad 99.9%',
        createdAt: '2023-01-05T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-01T12:00:00Z',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'SUP-002',
        name: 'Salesforce',
        type: 'SaaS CRM',
        supplierType: 'SaaS CRM',
        supplierTypeLu: 2,
        taxId: '76.222.333-4',
        website: 'https://www.salesforce.com',
        city: 'Las Condes',
        countryCode: 'US',
        riskTier: 'Tier 2',
        riskTierLu: 2,
        criticality: 'HIGH',
        criticalityLu: 2,
        contractStart: '2022-07-01',
        contractEnd: '2025-06-30',
        organizationId: 1,
        isActive: true,
        address: 'Av. Las Condes 1234',
        slaSummary: 'Disponibilidad 99.5%',
        createdAt: '2022-07-05T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-02T12:00:00Z',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'SUP-003',
        name: 'Datacenter Sonda',
        type: 'Datacenter',
        supplierType: 'Datacenter',
        supplierTypeLu: 3,
        taxId: '96.789.123-4',
        website: 'https://www.sonda.com',
        city: 'Santiago',
        countryCode: 'CL',
        riskTier: 'Tier 1',
        riskTierLu: 1,
        criticality: 'CRITICAL',
        criticalityLu: 1,
        contractStart: '2021-01-01',
        contractEnd: '2026-03-31',
        organizationId: 2,
        isActive: true,
        address: 'Camino a Melipilla 9000',
        slaSummary: 'SLA 99.95%',
        createdAt: '2021-01-05T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-10-03T12:00:00Z',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // CONTACTOS (contacts)
    // -------------------------------------------------------------------------
    contacts: [
      {
        id: 1,
        code: 'CON-001',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'jperez@mitiga.cl',
        phonePrimary: '',
        phoneSecondary: '',
        mobile: '+56 9 1234 5678',
        jobTitle: 'CEO',
        department: 'Direccion',
        organizationId: 1,
        userId: 1,
        supplierId: null,
        contactRoleId: 3,
        isEmergencyContact: true,
        isActive: true,
        notes: '',
        createdAt: '2024-02-01T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-09-10T12:00:00Z',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        code: 'CON-002',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        email: 'mgonzalez@mitiga.cl',
        phonePrimary: '',
        phoneSecondary: '',
        mobile: '+56 9 8765 4321',
        jobTitle: 'COO',
        department: 'Operaciones',
        organizationId: 2,
        userId: null,
        supplierId: null,
        contactRoleId: 2,
        isEmergencyContact: true,
        isActive: true,
        notes: '',
        createdAt: '2024-02-05T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-09-12T12:00:00Z',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        code: 'CON-003',
        firstName: 'Pedro',
        lastName: 'Soto',
        email: 'psoto@mitiga.cl',
        phonePrimary: '',
        phoneSecondary: '',
        mobile: '+56 9 5555 1234',
        jobTitle: 'CTO',
        department: 'Tecnologia',
        organizationId: 3,
        userId: null,
        supplierId: null,
        contactRoleId: 1,
        isEmergencyContact: false,
        isActive: true,
        notes: '',
        createdAt: '2024-02-10T09:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-09-15T12:00:00Z',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // VINCULOS DE CONTACTOS (contact_links)
    // -------------------------------------------------------------------------
    contactLinks: [
      { id: 1, contactId: 1, entityType: 'ORGANIZATION', entityId: 1, relationshipType: 'REGULATOR_CONTACT', isPrimary: true },
      { id: 2, contactId: 2, entityType: 'SUPPLIER', entityId: 2, relationshipType: 'ACCOUNT_MANAGER', isPrimary: true },
      { id: 3, contactId: 3, entityType: 'PLAN', entityId: 6, relationshipType: 'PLAN_CONTACT', isPrimary: false }
    ],

    // -------------------------------------------------------------------------
    // FRAMEWORKS NORMATIVOS (frameworks)
    // -------------------------------------------------------------------------
    frameworks: [
      { id: 1, code: 'ISO22301', name: 'ISO 22301:2019', version: '2019', issuingBody: 'ISO', isActive: true },
      { id: 2, code: 'ISO27001', name: 'ISO 27001:2022', version: '2022', issuingBody: 'ISO', isActive: true },
      { id: 3, code: 'LEY21663', name: 'Ley 21.663', version: '2024', issuingBody: 'Gobierno de Chile', isActive: true },
      { id: 4, code: 'NIST-CSF', name: 'NIST Cybersecurity Framework', version: '2.0', issuingBody: 'NIST', isActive: true }
    ],

    // -------------------------------------------------------------------------
    // CONTRATOS DE PROVEEDORES (supplier_contracts)
    // -------------------------------------------------------------------------
    supplierContracts: [
      {
        id: 1,
        contractCode: 'CONT-001',
        supplierId: 1,
        supplierName: 'FONASA',
        contractType: 'SERVICE',
        description: 'Contrato de validación de licencias médicas',
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        value: 50000000,
        currency: 'CLP',
        status: 'ACTIVE',
        renewalTerms: 'Renovación automática anual',
        terminationClause: '90 días de preaviso',
        slaTerms: 'Disponibilidad 99.5%, tiempo de respuesta < 5seg',
        organizationId: 1,
        createdAt: '2023-01-01T09:00:00Z',
        createdBy: 'Juan Perez',
        updatedAt: '2024-06-15T10:00:00Z',
        updatedBy: 'Maria Garcia'
      },
      {
        id: 2,
        contractCode: 'CONT-002',
        supplierId: 2,
        supplierName: 'AWS',
        contractType: 'CLOUD',
        description: 'Infraestructura cloud AWS',
        startDate: '2022-06-01',
        endDate: '2026-05-31',
        value: 120000000,
        currency: 'USD',
        status: 'ACTIVE',
        renewalTerms: 'Revisión anual de tarifas',
        terminationClause: '180 días de preaviso',
        slaTerms: 'Uptime 99.99%, SLA creditado por incumplimiento',
        organizationId: 1,
        createdAt: '2022-06-01T09:00:00Z',
        createdBy: 'Carlos Mendoza',
        updatedAt: '2024-11-20T14:00:00Z',
        updatedBy: 'Luis Soto'
      }
    ],

    // -------------------------------------------------------------------------
    // EVALUACIONES DE PROVEEDORES (supplier_assessments)
    // -------------------------------------------------------------------------
    supplierAssessments: [
      {
        id: 1,
        supplierId: 1,
        assessmentCode: 'TPRM-2024-001',
        assessmentDate: '2024-06-15',
        assessmentType: 'ANNUAL_REVIEW',
        assessorUserId: 5,
        assessorName: 'Luis Soto',
        criticalityScore: 95,
        performanceScore: 88,
        complianceScore: 92,
        overallScore: 91,
        riskLevel: 'LOW',
        findings: 'Proveedor cumple con todos los requisitos de continuidad',
        recommendations: 'Mantener seguimiento trimestral',
        status: 'APPROVED',
        nextReviewDate: '2025-06-15',
        organizationId: 1,
        createdAt: '2024-06-15T09:00:00Z',
        createdBy: 'Luis Soto'
      },
      {
        id: 2,
        supplierId: 2,
        assessmentCode: 'TPRM-2024-002',
        assessmentDate: '2024-08-20',
        assessmentType: 'SECURITY_AUDIT',
        assessorUserId: 3,
        assessorName: 'Patricia Morales',
        criticalityScore: 98,
        performanceScore: 94,
        complianceScore: 96,
        overallScore: 96,
        riskLevel: 'LOW',
        findings: 'Certificación ISO 27001 vigente, DRP robusto',
        recommendations: 'Verificar plan de DR semestralmente',
        status: 'APPROVED',
        nextReviewDate: '2025-02-20',
        organizationId: 1,
        createdAt: '2024-08-20T10:00:00Z',
        createdBy: 'Patricia Morales'
      }
    ],

    // -------------------------------------------------------------------------
    // INVENTARIO DE RECURSOS (resource_inventory)
    // -------------------------------------------------------------------------
    resourceInventory: [
      {
        id: 1,
        resourceCode: 'RES-001',
        resourceType: 'PERSONNEL',
        resourceName: 'Ejecutivos de Atención',
        description: 'Personal de atención al afiliado',
        quantity: 25,
        quantityUnit: 'personas',
        locationId: 1,
        availability: 'AVAILABLE',
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-01-15T09:00:00Z',
        createdBy: 'Maria Garcia'
      },
      {
        id: 2,
        resourceCode: 'RES-002',
        resourceType: 'FACILITY',
        resourceName: 'Sala de Crisis',
        description: 'Sala equipada para comité de crisis',
        quantity: 1,
        quantityUnit: 'unidad',
        locationId: 1,
        availability: 'AVAILABLE',
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-01-15T09:00:00Z',
        createdBy: 'Juan Perez'
      },
      {
        id: 3,
        resourceCode: 'RES-003',
        resourceType: 'TECHNOLOGY',
        resourceName: 'Equipos de respaldo (laptops)',
        description: 'Laptops de respaldo para trabajo remoto',
        quantity: 50,
        quantityUnit: 'unidades',
        locationId: 2,
        availability: 'AVAILABLE',
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-02-10T09:00:00Z',
        createdBy: 'Carlos Mendoza'
      }
    ],

    // -------------------------------------------------------------------------
    // CAPACIDADES DE RECURSOS (resource_capacities)
    // -------------------------------------------------------------------------
    resourceCapacities: [
      {
        id: 1,
        resourceId: 1,
        processId: 1,
        requiredQuantity: 10,
        availableQuantity: 25,
        minQuantity: 8,
        gap: 0,
        gapSeverity: 'NO_GAP',
        notes: 'Capacidad suficiente para continuidad',
        organizationId: 1,
        createdAt: '2024-03-01T09:00:00Z',
        createdBy: 'Maria Garcia'
      },
      {
        id: 2,
        resourceId: 3,
        processId: 2,
        requiredQuantity: 20,
        availableQuantity: 50,
        minQuantity: 15,
        gap: 0,
        gapSeverity: 'NO_GAP',
        notes: 'Inventario adecuado',
        organizationId: 1,
        createdAt: '2024-03-01T09:00:00Z',
        createdBy: 'Carlos Mendoza'
      }
    ],

    // -------------------------------------------------------------------------
    // PLANTILLAS DE COMUNICACIÓN (communication_templates)
    // -------------------------------------------------------------------------
    communicationTemplates: [
      {
        id: 1,
        templateCode: 'COM-TPL-001',
        templateName: 'Declaración de Crisis - Interna',
        templateType: 'CRISIS_DECLARATION',
        channel: 'EMAIL',
        subject: 'ALERTA: Declaración de Crisis - {{crisis_level}}',
        body: 'Se ha declarado una situación de crisis nivel {{crisis_level}}. Comité de crisis activado. Detalles: {{crisis_description}}',
        recipientType: 'INTERNAL',
        isActive: true,
        organizationId: 1,
        createdAt: '2024-01-10T09:00:00Z',
        createdBy: 'Juan Perez'
      },
      {
        id: 2,
        templateCode: 'COM-TPL-002',
        templateName: 'Notificación de Incidente - Clientes',
        templateType: 'INCIDENT_NOTIFICATION',
        channel: 'SMS',
        subject: null,
        body: 'Estimado afiliado: Estamos trabajando en resolver un incidente técnico. Disculpe las molestias. Mitiga.',
        recipientType: 'EXTERNAL',
        isActive: true,
        organizationId: 1,
        createdAt: '2024-01-10T09:00:00Z',
        createdBy: 'Maria Garcia'
      },
      {
        id: 3,
        templateCode: 'COM-TPL-003',
        templateName: 'Activación Plan BCP',
        templateType: 'PLAN_ACTIVATION',
        channel: 'EMAIL',
        subject: 'ACTIVACIÓN: Plan {{plan_name}}',
        body: 'Se ha activado el plan {{plan_name}}. Roles asignados: {{assigned_roles}}. Instrucciones: {{instructions}}',
        recipientType: 'INTERNAL',
        isActive: true,
        organizationId: 1,
        createdAt: '2024-01-10T09:00:00Z',
        createdBy: 'Luis Soto'
      }
    ],

    // -------------------------------------------------------------------------
    // LOGS DE COMUNICACIONES (communication_logs)
    // -------------------------------------------------------------------------
    communicationLogs: [
      {
        id: 1,
        logDate: '2024-11-15T14:30:00Z',
        templateId: 1,
        channel: 'EMAIL',
        subject: 'ALERTA: Declaración de Crisis - AMARILLO',
        recipients: ['jperez@mitiga.cl', 'mgonzalez@mitiga.cl', 'lsoto@mitiga.cl'],
        recipientCount: 3,
        status: 'SENT',
        sentBy: 1,
        sentByName: 'Juan Perez',
        relatedEntityType: 'CRISIS',
        relatedEntityId: 'CRI-2024-001',
        organizationId: 1,
        createdAt: '2024-11-15T14:30:00Z'
      },
      {
        id: 2,
        logDate: '2024-10-05T09:15:00Z',
        templateId: 2,
        channel: 'SMS',
        subject: null,
        recipients: ['+56912345678', '+56987654321'],
        recipientCount: 2,
        status: 'SENT',
        sentBy: 2,
        sentByName: 'Maria Garcia',
        relatedEntityType: 'INCIDENT',
        relatedEntityId: 'INC-2024-001',
        organizationId: 1,
        createdAt: '2024-10-05T09:15:00Z'
      }
    ],

    // -------------------------------------------------------------------------
    // PROGRAMAS DE CAPACITACIÓN (training_programs)
    // -------------------------------------------------------------------------
    trainingPrograms: [
      {
        id: 1,
        programCode: 'TRN-001',
        programName: 'Inducción BCMS',
        description: 'Capacitación básica en continuidad del negocio',
        programType: 'INDUCTION',
        duration: 120,
        durationUnit: 'minutes',
        frequency: 'ONBOARDING',
        targetAudience: 'ALL_STAFF',
        isRequired: true,
        validityMonths: 12,
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-01-05T09:00:00Z',
        createdBy: 'Patricia Morales'
      },
      {
        id: 2,
        programCode: 'TRN-002',
        programName: 'Simulacro de Evacuación',
        description: 'Entrenamiento en procedimientos de evacuación',
        programType: 'DRILL',
        duration: 60,
        durationUnit: 'minutes',
        frequency: 'SEMI_ANNUAL',
        targetAudience: 'ALL_STAFF',
        isRequired: true,
        validityMonths: 6,
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-01-05T09:00:00Z',
        createdBy: 'Luis Soto'
      }
    ],

    // -------------------------------------------------------------------------
    // REGISTROS DE CAPACITACIÓN (training_records)
    // -------------------------------------------------------------------------
    trainingRecords: [
      {
        id: 1,
        programId: 1,
        userId: 1,
        userName: 'Juan Perez',
        trainingDate: '2024-02-15',
        completionStatus: 'COMPLETED',
        score: 95,
        passScore: 70,
        passed: true,
        certificateIssued: true,
        certificateNumber: 'CERT-2024-001',
        validUntil: '2025-02-15',
        instructorName: 'Patricia Morales',
        organizationId: 1,
        createdAt: '2024-02-15T10:00:00Z',
        createdBy: 'Patricia Morales'
      },
      {
        id: 2,
        programId: 1,
        userId: 2,
        userName: 'Maria Garcia',
        trainingDate: '2024-03-10',
        completionStatus: 'COMPLETED',
        score: 88,
        passScore: 70,
        passed: true,
        certificateIssued: true,
        certificateNumber: 'CERT-2024-002',
        validUntil: '2025-03-10',
        instructorName: 'Patricia Morales',
        organizationId: 1,
        createdAt: '2024-03-10T11:00:00Z',
        createdBy: 'Patricia Morales'
      }
    ],

    // -------------------------------------------------------------------------
    // REPORTES EJECUTIVOS (executive_reports)
    // -------------------------------------------------------------------------
    executiveReports: [
      {
        id: 1,
        reportCode: 'REP-2024-Q4',
        reportName: 'Reporte Trimestral BCMS Q4 2024',
        reportType: 'QUARTERLY',
        periodStart: '2024-10-01',
        periodEnd: '2024-12-31',
        generatedDate: '2025-01-05',
        generatedBy: 1,
        generatedByName: 'Juan Perez',
        status: 'PUBLISHED',
        summary: 'Cumplimiento ISO 22301 al 95%, todos los planes probados',
        fileUrl: '/reports/bcms-q4-2024.pdf',
        organizationId: 1,
        createdAt: '2025-01-05T09:00:00Z',
        createdBy: 'Juan Perez'
      },
      {
        id: 2,
        reportCode: 'REP-2024-ANN',
        reportName: 'Reporte Anual BCMS 2024',
        reportType: 'ANNUAL',
        periodStart: '2024-01-01',
        periodEnd: '2024-12-31',
        generatedDate: '2025-01-15',
        generatedBy: 1,
        generatedByName: 'Juan Perez',
        status: 'DRAFT',
        summary: 'Consolidado anual con logros y áreas de mejora',
        fileUrl: null,
        organizationId: 1,
        createdAt: '2025-01-15T09:00:00Z',
        createdBy: 'Juan Perez'
      }
    ],

    // -------------------------------------------------------------------------
    // SERVICIOS DE APLICACIÓN (app_services) - para DRP
    // -------------------------------------------------------------------------
    appServices: [
      {
        id: 1,
        serviceCode: 'SVC-001',
        serviceName: 'Sistema CRM',
        description: 'Gestión de relaciones con afiliados',
        serviceType: 'APPLICATION',
        criticality: 'CRITICAL',
        rto: 4,
        rpo: 1,
        dependentProcesses: [1, 2],
        technologyStack: 'Java, PostgreSQL, AWS',
        ownerUserId: 3,
        ownerName: 'Carlos Mendoza',
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-01-10T09:00:00Z',
        createdBy: 'Carlos Mendoza'
      },
      {
        id: 2,
        serviceCode: 'SVC-002',
        serviceName: 'Portal Web Afiliados',
        description: 'Portal de autogestión para afiliados',
        serviceType: 'WEB_APPLICATION',
        criticality: 'HIGH',
        rto: 8,
        rpo: 4,
        dependentProcesses: [1],
        technologyStack: 'React, Node.js, MongoDB',
        ownerUserId: 3,
        ownerName: 'Carlos Mendoza',
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2024-01-10T09:00:00Z',
        createdBy: 'Carlos Mendoza'
      }
    ],

    // -------------------------------------------------------------------------
    // CONTEXTO Y ALCANCE BCMS (bcms_context)
    // -------------------------------------------------------------------------
    bcmsContext: [
      {
        id: 1,
        contextCode: 'CTX-2024-v1',
        version: '1.0',
        effectiveDate: '2024-01-01',
        scopeDescription: 'El SGCN cubre procesos críticos de atención al afiliado, operaciones clínicas e infraestructura TI',
        scopeBoundaries: 'Aplica a sede central, sucursales y datacenter principal. Excluye servicios de cafetería y transporte.',
        internalIssues: 'Crecimiento de afiliados, transformación digital, nuevos servicios de telemedicina',
        externalIssues: 'Regulación CMF, competencia en el mercado, expectativas de disponibilidad 24/7',
        interestedParties: 'Afiliados, CMF, SIS, accionistas, empleados, proveedores críticos',
        legalRequirements: 'Ley 21.663 Ley Fintech Chile, normas CMF, ISO 22301',
        status: 'APPROVED',
        approvedBy: 1,
        approvedByName: 'Juan Perez',
        approvalDate: '2024-01-15',
        organizationId: 1,
        createdAt: '2024-01-01T09:00:00Z',
        createdBy: 'Patricia Morales',
        updatedAt: '2024-01-15T10:00:00Z',
        updatedBy: 'Juan Perez'
      }
    ],

    // -------------------------------------------------------------------------
    // POLÍTICAS BCMS (bcms_policies)
    // -------------------------------------------------------------------------
    bcmsPolicies: [
      {
        id: 1,
        policyCode: 'POL-BCMS-001',
        policyName: 'Política de Continuidad del Negocio',
        version: '2.0',
        effectiveDate: '2024-01-01',
        policyType: 'CONTINUITY',
        description: 'Define los principios y compromisos para garantizar la continuidad de servicios críticos',
        content: 'Contenido completo de la política...',
        approvedBy: 1,
        approvedByName: 'Juan Perez',
        approvalDate: '2023-12-20',
        reviewFrequency: 'ANNUAL',
        nextReviewDate: '2025-01-01',
        status: 'ACTIVE',
        organizationId: 1,
        createdAt: '2023-12-01T09:00:00Z',
        createdBy: 'Patricia Morales',
        updatedAt: '2023-12-20T10:00:00Z',
        updatedBy: 'Juan Perez'
      }
    ],

    // -------------------------------------------------------------------------
    // OBJETIVOS BCMS (bcms_objectives)
    // -------------------------------------------------------------------------
    bcmsObjectives: [
      {
        id: 1,
        objectiveCode: 'OBJ-001',
        objectiveName: 'RTO promedio < 6 horas',
        description: 'Mantener el tiempo de recuperación promedio de procesos críticos bajo 6 horas',
        targetValue: 6,
        currentValue: 4,
        measureUnit: 'horas',
        targetDate: '2024-12-31',
        status: 'ACHIEVED',
        ownerUserId: 4,
        ownerName: 'Luis Soto',
        organizationId: 1,
        createdAt: '2024-01-01T09:00:00Z',
        createdBy: 'Juan Perez'
      },
      {
        id: 2,
        objectiveCode: 'OBJ-002',
        objectiveName: '100% planes probados anualmente',
        description: 'Ejecutar pruebas de todos los planes BCP/DRP al menos una vez al año',
        targetValue: 100,
        currentValue: 83,
        measureUnit: 'porcentaje',
        targetDate: '2024-12-31',
        status: 'IN_PROGRESS',
        ownerUserId: 5,
        ownerName: 'Luis Soto',
        organizationId: 1,
        createdAt: '2024-01-01T09:00:00Z',
        createdBy: 'Juan Perez'
      }
    ],

    // -------------------------------------------------------------------------
    // REVISIONES POR LA DIRECCIÓN (management_reviews)
    // -------------------------------------------------------------------------
    managementReviews: [
      {
        id: 1,
        reviewCode: 'MR-2024-Q2',
        reviewDate: '2024-07-15',
        reviewType: 'QUARTERLY',
        chairpersonUserId: 1,
        chairpersonName: 'Juan Perez',
        attendees: ['Juan Perez', 'Maria Garcia', 'Carlos Mendoza', 'Patricia Morales', 'Luis Soto'],
        agendaItems: ['Revisión de objetivos', 'Estado de hallazgos', 'Nuevos riesgos', 'Cambios propuestos'],
        decisions: ['Aprobar ampliación de alcance', 'Incrementar presupuesto capacitación', 'Renovar certificación ISO'],
        actionItems: ['Iniciar BIA proceso Telemedicina', 'Contratar consultor externo auditoría'],
        nextReviewDate: '2024-10-15',
        status: 'COMPLETED',
        minutesFileUrl: '/reviews/mr-2024-q2-minutes.pdf',
        organizationId: 1,
        createdAt: '2024-07-15T09:00:00Z',
        createdBy: 'Patricia Morales'
      }
    ],

    // -------------------------------------------------------------------------
    // LEVANTAMIENTOS BIA (bia_assessments - runtime mockup)
    // -------------------------------------------------------------------------
    biaAssessments: [
      {
        id: 1,
        processId: 1,
        targetProcessType: 'PROCESS',
        targetProcessId: 1,
        interviewDate: '2025-01-10',
        intervieweeName: 'Maria Gonzalez',
        intervieweeRole: 'Jefa de Ventas',
        surveyorName: 'Patricia Morales',
        surveyorRole: 'Jefa Continuidad',
        interviewParticipants: [
          { name: 'María González', role: 'Jefa de Ventas' },
          { name: 'Claudio Saavedra Araya', role: 'Responsable de Proceso' }
        ],
        status: 'COMPLETADO',
        matrixTemplate: {
          Monetario: [4, 4, 4, 4, 5, 5],
          Procesos: [4, 4, 4, 4, 4, 5],
          Reputacional: [3, 3, 3, 4, 4, 4],
          Normativo: [3, 3, 3, 3, 4, 4],
          Clientes: [4, 4, 4, 4, 5, 5]
        },
        matrixSummary: {
          monetarioLevel: 4,
          monetarioNotes: 'Impacto relevante en ingresos diarios.',
          procesosLevel: 4,
          procesosNotes: 'Alta dependencia de CRM y conectividad.',
          reputacionalLevel: 3,
          reputacionalNotes: 'Riesgo moderado de reclamos.',
          normativoLevel: 3,
          normativoNotes: 'Exposición regulatoria acotada.',
          clientesLevel: 4,
          clientesNotes: 'Demora directa en atencion de clientes.'
        },
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T12:30:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        processId: 7,
        targetProcessType: 'PROCESS',
        targetProcessId: 7,
        interviewDate: '2025-01-15',
        intervieweeName: 'Luis Soto',
        intervieweeRole: 'Jefe Operaciones Hospitalarias',
        surveyorName: 'Patricia Morales',
        surveyorRole: 'Jefa Continuidad',
        interviewParticipants: [
          { name: 'Luis Soto', role: 'Jefe Operaciones Hospitalarias' },
          { name: 'Karen Beltrán Henríquez', role: 'Jefe de Continuidad de Negocio' }
        ],
        status: 'BORRADOR',
        matrixTemplate: {
          Monetario: [4, 4, 5, 5, 5, 5],
          Procesos: [5, 5, 5, 5, 5, 5],
          Reputacional: [4, 4, 4, 5, 5, 5],
          Normativo: [4, 4, 4, 4, 5, 5],
          Clientes: [5, 5, 5, 5, 5, 5]
        },
        matrixSummary: {
          monetarioLevel: 4,
          monetarioNotes: 'Costos altos por contingencias clínicas.',
          procesosLevel: 5,
          procesosNotes: 'Afectación operativa inmediata en servicios críticos.',
          reputacionalLevel: 4,
          reputacionalNotes: 'Alto riesgo por impacto en pacientes.',
          normativoLevel: 4,
          normativoNotes: 'Riesgo de incumplimientos regulatorios sanitarios.',
          clientesLevel: 5,
          clientesNotes: 'Impacto severo en continuidad de atención.'
        },
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-15T11:20:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      }
    ],

    // -------------------------------------------------------------------------
    // VALIDACIONES LEVANTAMIENTO BIA (bia_assessment_approvals - runtime mockup)
    // -------------------------------------------------------------------------
    biaAssessmentApprovals: [
      {
        id: 1,
        assessmentId: 1,
        role: 'Responsable de Proceso',
        name: 'Maria Gonzalez',
        date: '2025-01-10',
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 2,
        assessmentId: 1,
        role: 'Jefe de Continuidad de Negocio',
        name: 'Patricia Morales',
        date: '2025-01-10',
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 3,
        assessmentId: 1,
        role: 'Jefe de Departamento de Riesgo Operacional',
        name: 'Luis Soto',
        date: '2025-01-10',
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 4,
        assessmentId: 2,
        role: 'Responsable de Proceso',
        name: 'Luis Soto',
        date: '2025-01-15',
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-15T09:00:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 5,
        assessmentId: 2,
        role: 'Jefe de Continuidad de Negocio',
        name: 'Patricia Morales',
        date: '2025-01-15',
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-15T09:00:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      },
      {
        id: 6,
        assessmentId: 2,
        role: 'Jefe de Departamento de Riesgo Operacional',
        name: 'Luis Soto',
        date: '2025-01-15',
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-15T09:00:00Z',
        deletedAt: null,
        createdBy: 'Patricia Morales',
        updatedBy: 'Patricia Morales',
        deletedBy: null,
        isDeleted: false
      }
    ]
  },

  // ============================================================================
  // CONFIGURACIÓN DEL SISTEMA
  // ============================================================================
  config: {
    defaultRtoHours: 24,
    defaultRpoHours: 4,
    defaultMtpdHours: 72,
    defaultMbcoPercent: 50,
    riskMatrix: {
      rows: 5, // Probabilidad
      cols: 5, // Impacto
      thresholds: { low: 4, medium: 9, high: 15, critical: 25 }
    },
    alertThresholds: {
      overdueActions: 7, // días
      planReviewDue: 30, // días
      testOverdue: 90 // días
    }
  },

  // ============================================================================
  // API DE ACCESO A DATOS
  // ============================================================================
  api: {
    
    // Obtener entidad por ID
    getById: function(entityName, id) {
      const entities = BCMSDataStore.entities[entityName];
      if (!entities) return null;
      return entities.find(e => e.id === id || e.code === id);
    },
    
    // Obtener todos los registros de una entidad
    getAll: function(entityName) {
      return BCMSDataStore.entities[entityName] || [];
    },
    
    // Filtrar entidades
    filter: function(entityName, predicate) {
      const entities = BCMSDataStore.entities[entityName];
      if (!entities) return [];
      return entities.filter(predicate);
    },
    
    // Contar registros
    count: function(entityName, predicate) {
      const entities = BCMSDataStore.entities[entityName];
      if (!entities) return 0;
      return predicate ? entities.filter(predicate).length : entities.length;
    },
    
    // Obtener lookup por código
    getLookup: function(lookupName, code) {
      const lookup = BCMSDataStore.lookups[lookupName];
      if (!lookup) return null;
      return lookup.find(l => l.code === code);
    },
    
    // Obtener label de lookup
    getLookupLabel: function(lookupName, code) {
      const item = this.getLookup(lookupName, code);
      return item ? item.label : code;
    },
    
    // Crear nuevo registro
    create: function(entityName, data) {
      const entities = BCMSDataStore.entities[entityName];
      if (!entities) return null;
      
      const maxId = Math.max(0, ...entities.map(e => typeof e.id === 'number' ? e.id : 0));
      const newEntity = {
        ...data,
        id: maxId + 1,
        createdAt: new Date().toISOString()
      };
      entities.push(newEntity);
      BCMSDataStore.meta.lastUpdated = new Date().toISOString();
      return newEntity;
    },
    
    // Actualizar registro
    update: function(entityName, id, data) {
      const entities = BCMSDataStore.entities[entityName];
      if (!entities) return null;
      
      const index = entities.findIndex(e => e.id === id);
      if (index === -1) return null;
      
      entities[index] = {
        ...entities[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      BCMSDataStore.meta.lastUpdated = new Date().toISOString();
      return entities[index];
    },
    
    // Eliminar registro (soft delete)
    delete: function(entityName, id) {
      const entities = BCMSDataStore.entities[entityName];
      if (!entities) return false;
      
      const entity = entities.find(e => e.id === id);
      if (!entity) return false;
      
      entity.isDeleted = true;
      entity.deletedAt = new Date().toISOString();
      BCMSDataStore.meta.lastUpdated = new Date().toISOString();
      return true;
    },
    
    // Métricas del dashboard
    getDashboardMetrics: function() {
      const processes = this.getAll('processes');
      const risks = this.getAll('risks');
      const incidents = this.getAll('incidents');
      const plans = this.getAll('continuityPlans');
      const tests = this.getAll('planTests');
      const findings = this.getAll('findings');
      const lessons = this.getAll('lessonsLearned');
      
      return {
        totalProcesses: processes.length,
        criticalProcesses: processes.filter(p => p.businessCriticality === 'CRITICAL').length,
        totalRisks: risks.length,
        highRisks: risks.filter(r => r.inherentScore >= 15).length,
        openIncidents: incidents.filter(i => !['CLOSED', 'RESOLVED'].includes(i.status)).length,
        activePlans: plans.filter(p => p.status === 'ACTIVE').length,
        testsThisYear: tests.filter(t => t.testDate && t.testDate.startsWith('2024')).length,
        openFindings: findings.filter(f => f.status !== 'CLOSED').length,
        lessonsImplemented: lessons.filter(l => l.status === 'implemented' || l.status === 'validated').length
      };
    }
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.BCMSDataStore = BCMSDataStore;
}

// Mensaje de inicialización
console.log('BCMSDataStore v2.1 cargado correctamente');
console.log(`   - Entidades: ${Object.keys(BCMSDataStore.entities).length}`);
console.log(`   - Lookups: ${Object.keys(BCMSDataStore.lookups).length}`);
console.log('   - Cumple ISO 22301:2019 [OK]');

