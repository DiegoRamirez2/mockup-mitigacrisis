/**
 * BCMS DataStore v11 (seed minimo para migracion v10 -> v11)
 * Alcance inicial: cadena Ficha -> BIA -> RIA -> BCP/DRP para proceso legacy 17896.
 * Fuente operacional: BancoEstado (Ficha/BIA/RIA/Anexo7) + SEED_BCMS_v11_catalogos_bia_ria.sql.
 */

const BCMSDataStoreV11 = {
  meta: {
    version: '0.1.0',
    schemaVersion: 'v11',
    lastUpdated: new Date().toISOString(),
    scope: 'seed-minimo-bia-ria-17896'
  },

  config: {
    applicationSettings: [
      {
        id: 1,
        settingKey: 'ria.trigger_rule',
        settingType: 'JSON',
        settingValue: {
          ruleCode: 'BIA_IMPACT_GT_24H_AND_LEVEL_GE_MEDIO_ALTO',
          triggerTimeMinutesGt: 1440,
          allowedImpactLevels: ['MEDIO_ALTO', 'ALTO'],
          source: 'Anexo 7 + decision interna 2026-02-11'
        },
        description: 'Regla temporal para disparar RIA desde resultados BIA.',
        isSystem: true,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ]
  },

  lookups: {
    riskImpactScale: [
      { id: 1, code: '1_BAJO', label: '1. Bajo', sortOrder: 1, colorHex: '#22C55E' },
      { id: 2, code: '2_MEDIO_BAJO', label: '2. Medio Bajo', sortOrder: 2, colorHex: '#84CC16' },
      { id: 3, code: '3_MEDIO', label: '3. Medio', sortOrder: 3, colorHex: '#F59E0B' },
      { id: 4, code: '4_MEDIO_ALTO', label: '4. Medio Alto', sortOrder: 4, colorHex: '#F97316' },
      { id: 5, code: '5_ALTO', label: '5. Alto', sortOrder: 5, colorHex: '#EF4444' }
    ],
    riskProbabilityScale: [
      { id: 1, code: '1_MUY_POCO_PROBABLE', label: '1. Muy poco probable', sortOrder: 1 },
      { id: 2, code: '2_POCO_PROBABLE', label: '2. Poco probable', sortOrder: 2 },
      { id: 3, code: '3_OCASIONAL', label: '3. Ocasional', sortOrder: 3 },
      { id: 4, code: '4_FRECUENTE', label: '4. Frecuente', sortOrder: 4 },
      { id: 5, code: '5_MUY_FRECUENTE', label: '5. Muy frecuente', sortOrder: 5 }
    ],
    controlEffectivenessScale: [
      { id: 1, code: '1_DEFICIENTE', label: '1. Deficiente', sortOrder: 1 },
      { id: 2, code: '2_REGULAR', label: '2. Regular', sortOrder: 2 },
      { id: 3, code: '3_SUFICIENTE', label: '3. Suficiente', sortOrder: 3 },
      { id: 4, code: '4_BUENO', label: '4. Bueno', sortOrder: 4 },
      { id: 5, code: '5_OPTIMO', label: '5. Optimo', sortOrder: 5 }
    ],
    qualitativeRiskLevel: [
      { id: 1, code: 'BAJO', label: 'Bajo', sortOrder: 1 },
      { id: 2, code: 'MEDIO_BAJO', label: 'Medio Bajo', sortOrder: 2 },
      { id: 3, code: 'MEDIO', label: 'Medio', sortOrder: 3 },
      { id: 4, code: 'MEDIO_ALTO', label: 'Medio Alto', sortOrder: 4 },
      { id: 5, code: 'ALTO', label: 'Alto', sortOrder: 5 }
    ],
    continuityRiskResponse: [
      { id: 1, code: 'UPDATE_OR_CREATE_BCP', label: 'Crear/actualizar BCP o ejecutar prueba pendiente', sortOrder: 1 },
      { id: 2, code: 'KEEP_CURRENT_BCP', label: 'No requiere actualizar o construir BCP', sortOrder: 2 }
    ],
    disruptionScenarioType: [
      { id: 1, code: 'PERSONNEL', label: 'Personal', sortOrder: 1 },
      { id: 2, code: 'INFRASTRUCTURE', label: 'Infraestructura', sortOrder: 2 },
      { id: 3, code: 'SUPPLIER', label: 'Proveedor', sortOrder: 3 },
      { id: 4, code: 'SYSTEMS', label: 'Sistemas / Aplicaciones', sortOrder: 4 },
      { id: 5, code: 'CYBER', label: 'Ciberseguridad', sortOrder: 5 },
      { id: 6, code: 'CASH', label: 'Suministro de efectivo', sortOrder: 6 },
      { id: 7, code: 'BASIC_SERVICES', label: 'Servicios basicos', sortOrder: 7 },
      { id: 8, code: 'BRANCH_NETWORK', label: 'Red de sucursales', sortOrder: 8 }
    ]
  },

  entities: {
    organizations: [
      {
        idOrganization: 1,
        code: 'ORG-BE-001',
        name: 'BancoEstado',
        legalName: 'Banco del Estado de Chile',
        taxId: null,
        orgType: 'COMPANY',
        industry: 'Servicios Financieros',
        country: 'CHL',
        timezone: 'America/Santiago',
        description: 'Seed demo continuidad BancoEstado.',
        level: 0,
        path: '/1/',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    macroprocesses: [
      {
        idMacroprocess: 1,
        name: 'Negocios',
        description: 'Macroproceso comercial y operativo.',
        category: 'NEGOCIO',
        expirationDate: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    processes: [
      {
        idProcess: 1,
        idMacroprocess: 1,
        legacyProcessId: 17896,
        name: 'Operar Convenios de Pago',
        description: 'Desde recepcion de nominas hasta disponibilizacion y rendicion de pagos.',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    locations: [
      {
        idLocation: 1,
        locationCode: 'LOC-BAN-60-P3',
        name: 'Bandera 60 Piso 3',
        locationType: 'SITE',
        addressLine1: 'Bandera 60, Piso 3',
        city: 'Santiago',
        countryCode: 'CL',
        isPrimary: true,
        idOrganization: 1,
        parentLocationId: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idLocation: 2,
        locationCode: 'LOC-HUE-1175-P5',
        name: 'Huerfanos 1175 Piso 5',
        locationType: 'SITE',
        addressLine1: 'Huerfanos 1175, Piso 5',
        city: 'Santiago',
        countryCode: 'CL',
        isPrimary: false,
        idOrganization: 1,
        parentLocationId: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    suppliers: [
      {
        idSupplier: 1,
        supplierCode: 'SUP-CCA',
        name: 'Centro de Compensacion Automatizado SA (CCA)',
        contractRef: '1672',
        city: 'Santiago',
        countryCode: 'CL',
        idOrganization: 1,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idSupplier: 2,
        supplierCode: 'SUP-SERVIBANCA',
        name: 'ServiBanca S.A.',
        contractRef: '5436-1',
        city: 'Santiago',
        countryCode: 'CL',
        idOrganization: 1,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idSupplier: 3,
        supplierCode: 'SUP-JORDAN',
        name: 'Empresas Jordan SA',
        contractRef: '8218',
        city: 'Santiago',
        countryCode: 'CL',
        idOrganization: 1,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    contacts: [
      {
        idContact: 1,
        contactCode: 'CNT-CLAUDIO-SAAVEDRA',
        firstName: 'Claudio',
        lastName: 'Saavedra Araya',
        email: null,
        jobTitle: 'Gerente de Negocios Transaccionales',
        idOrganization: 1,
        idSupplier: null,
        isEmergencyContact: false,
        notes: 'Responsable de proceso Operar Convenios de Pago.',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idContact: 2,
        contactCode: 'CNT-INES-ESCOBAR',
        firstName: 'Ines',
        lastName: 'Escobar Vargas',
        email: null,
        jobTitle: 'Jefe de Area Operaciones de Convenio',
        idOrganization: 1,
        idSupplier: null,
        isEmergencyContact: true,
        notes: 'Personal critico para escenario de ausencia parcial.',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    processDependencies: [
      {
        idProcessDependency: 1,
        idOrganization: 1,
        targetProcessType: 'PROCESS',
        targetProcessId: 1,
        dependencyTypeCode: 'SUPPLIER',
        dependencyEntityType: 'SUPPLIER',
        dependencyEntityId: 2,
        criticalityCode: 'ALTO',
        notes: 'ServiBanca para envio y estandarizacion de nominas.',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idProcessDependency: 2,
        idOrganization: 1,
        targetProcessType: 'PROCESS',
        targetProcessId: 1,
        dependencyTypeCode: 'SUPPLIER',
        dependencyEntityType: 'SUPPLIER',
        dependencyEntityId: 1,
        criticalityCode: 'ALTO',
        notes: 'CCA para transferencias entre instituciones.',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    processCriticalPersonnel: [
      {
        idProcessCriticalPersonnel: 1,
        idOrganization: 1,
        targetProcessType: 'PROCESS',
        targetProcessId: 1,
        stageCode: 'OPERACION_CONVENIOS',
        stageName: 'Operacion Convenios de Pago',
        primaryContactId: 2,
        backupContactId: null,
        roleInStage: 'JEFATURA_OPERACIONES',
        locationNotes: 'Bandera 60 Piso 3',
        notes: 'Critico para escenario personal.',
        validFrom: '2026-02-13',
        validUntil: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    disruptionScenarios: [
      { idScenario: 1, scenarioCode: 'SCN_PARTIAL_KEY_PERSONNEL', name: 'Indisponibilidad parcial o perdida del personal clave', scenarioTypeCode: 'PERSONNEL', sortOrder: 1 },
      { idScenario: 2, scenarioCode: 'SCN_MASSIVE_PERSONNEL', name: 'Ausencia masiva del personal', scenarioTypeCode: 'PERSONNEL', sortOrder: 2 },
      { idScenario: 3, scenarioCode: 'SCN_BUILDING_UNAVAILABLE', name: 'Indisponibilidad de un edificio o conjunto de edificios', scenarioTypeCode: 'INFRASTRUCTURE', sortOrder: 3 },
      { idScenario: 4, scenarioCode: 'SCN_BRANCHES_DESTROYED', name: 'Indisponibilidad o destruccion de una sucursal o conjunto de sucursales', scenarioTypeCode: 'BRANCH_NETWORK', sortOrder: 4 },
      { idScenario: 5, scenarioCode: 'SCN_BASIC_SERVICES_UNAVAILABLE', name: 'Imposibilidad de restauracion inmediata de servicios basicos', scenarioTypeCode: 'BASIC_SERVICES', sortOrder: 5 },
      { idScenario: 6, scenarioCode: 'SCN_SUPPLIER_UNAVAILABLE', name: 'Indisponibilidad de servicios prestados por proveedores', scenarioTypeCode: 'SUPPLIER', sortOrder: 6 },
      { idScenario: 7, scenarioCode: 'SCN_CASH_SUPPLY_UNAVAILABLE', name: 'Indisponibilidad del suministro de efectivo', scenarioTypeCode: 'CASH', sortOrder: 7 },
      { idScenario: 8, scenarioCode: 'SCN_CRITICAL_APP_UNAVAILABLE', name: 'Indisponibilidad de aplicacion o servicio TI critico', scenarioTypeCode: 'SYSTEMS', sortOrder: 8 },
      { idScenario: 9, scenarioCode: 'SCN_MASSIVE_IT_OUTAGE', name: 'Indisponibilidad masiva de aplicaciones/servicios TI/comunicaciones', scenarioTypeCode: 'SYSTEMS', sortOrder: 9 },
      { idScenario: 10, scenarioCode: 'SCN_CYBERATTACK', name: 'Ataque de ciberseguridad', scenarioTypeCode: 'CYBER', sortOrder: 10 }
    ],

    impactTypes: [
      { idImpactType: 1, impactCode: 'BIA_MONETARIO', name: 'Monetario', sortOrder: 1 },
      { idImpactType: 2, impactCode: 'BIA_PROCESOS', name: 'Procesos', sortOrder: 2 },
      { idImpactType: 3, impactCode: 'BIA_REPUTACIONAL', name: 'Reputacional', sortOrder: 3 },
      { idImpactType: 4, impactCode: 'BIA_NORMATIVO', name: 'Normativo', sortOrder: 4 },
      { idImpactType: 5, impactCode: 'BIA_CLIENTES', name: 'Clientes', sortOrder: 5 }
    ],

    timeBuckets: [
      { idTimeBucket: 1, bucketCode: 'TB_LT_1H', name: '< 1 HORA', startMinutes: 0, endMinutes: 59, sortOrder: 1 },
      { idTimeBucket: 2, bucketCode: 'TB_1H_TO_2H', name: 'ENTRE 1 Y 2 HORAS', startMinutes: 60, endMinutes: 120, sortOrder: 2 },
      { idTimeBucket: 3, bucketCode: 'TB_2H_TO_6H', name: 'ENTRE 2 Y 6 HORAS', startMinutes: 121, endMinutes: 360, sortOrder: 3 },
      { idTimeBucket: 4, bucketCode: 'TB_6H_TO_24H', name: 'ENTRE 6 Y 24 HORAS', startMinutes: 361, endMinutes: 1440, sortOrder: 4 },
      { idTimeBucket: 5, bucketCode: 'TB_24H_TO_36H', name: 'ENTRE 24 Y 36 HORAS', startMinutes: 1441, endMinutes: 2160, sortOrder: 5 },
      { idTimeBucket: 6, bucketCode: 'TB_GT_36H', name: '> 36 HORAS', startMinutes: 2161, endMinutes: 525600, sortOrder: 6 }
    ],

    biaAssessments: [
      {
        idBia: 1,
        biaCode: 'BIA-17896-2026-001',
        idOrganization: 1,
        targetProcessType: 'PROCESS',
        targetProcessId: 1,
        assessmentDate: '2026-02-13',
        reviewedBy: 'analista_continuidad',
        version: '1.0',
        statusCode: 'ACTIVE',
        notes: 'Carga inicial BIA Operar Convenios de Pago (legacy 17896).',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    biaImpactMatrix: [
      { idBiaImpact: 1, idBia: 1, idScenario: 1, idTimeBucket: 1, idImpactType: 5, selectedLevelCode: '2_MEDIO_BAJO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 2, idBia: 1, idScenario: 1, idTimeBucket: 2, idImpactType: 5, selectedLevelCode: '3_MEDIO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 3, idBia: 1, idScenario: 1, idTimeBucket: 3, idImpactType: 5, selectedLevelCode: '4_MEDIO_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 4, idBia: 1, idScenario: 1, idTimeBucket: 4, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 5, idBia: 1, idScenario: 1, idTimeBucket: 5, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 6, idBia: 1, idScenario: 1, idTimeBucket: 6, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },

      { idBiaImpact: 7, idBia: 1, idScenario: 3, idTimeBucket: 1, idImpactType: 5, selectedLevelCode: '2_MEDIO_BAJO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 8, idBia: 1, idScenario: 3, idTimeBucket: 2, idImpactType: 5, selectedLevelCode: '3_MEDIO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 9, idBia: 1, idScenario: 3, idTimeBucket: 3, idImpactType: 5, selectedLevelCode: '4_MEDIO_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 10, idBia: 1, idScenario: 3, idTimeBucket: 4, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },

      { idBiaImpact: 11, idBia: 1, idScenario: 6, idTimeBucket: 1, idImpactType: 5, selectedLevelCode: '2_MEDIO_BAJO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 12, idBia: 1, idScenario: 6, idTimeBucket: 4, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },

      { idBiaImpact: 13, idBia: 1, idScenario: 8, idTimeBucket: 1, idImpactType: 5, selectedLevelCode: '2_MEDIO_BAJO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 14, idBia: 1, idScenario: 8, idTimeBucket: 4, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },

      { idBiaImpact: 15, idBia: 1, idScenario: 10, idTimeBucket: 1, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' },
      { idBiaImpact: 16, idBia: 1, idScenario: 10, idTimeBucket: 4, idImpactType: 5, selectedLevelCode: '5_ALTO', maxImpact24hCode: 'ALTO', mtpdText: '1 hora', rtoText: '30 minutos' }
    ],

    riaAssessments: [
      {
        idRia: 1,
        riaCode: 'RIA-17896-2026-001',
        idOrganization: 1,
        targetProcessType: 'PROCESS',
        targetProcessId: 1,
        idBia: 1,
        assessmentDate: '2026-02-13',
        version: '1.0',
        statusCode: 'ACTIVE',
        notes: 'Carga inicial desde matriz continuidad Operar Convenios de Pago.',
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    continuityPlans: [
      { idPlan: 1, planCode: 'BCP0910', planType: 'BCP', title: 'Ausencia parcial de personal', targetProcessType: 'PROCESS', targetProcessId: 1, idOrganization: 1, idScenario: 1, statusCode: 'ACTIVE', ownerUserCode: 'analista_continuidad', effectiveDate: '2024-01-01', nextReviewDate: '2026-12-31', versionLabel: 'v1.0' },
      { idPlan: 2, planCode: 'BCP0743', planType: 'BCP', title: 'Ausencia masiva de personal', targetProcessType: 'PROCESS', targetProcessId: 1, idOrganization: 1, idScenario: 2, statusCode: 'ACTIVE', ownerUserCode: 'analista_continuidad', effectiveDate: '2024-01-01', nextReviewDate: '2026-12-31', versionLabel: 'v1.0' },
      { idPlan: 3, planCode: 'BCP0230', planType: 'BCP', title: 'Indisponibilidad de infraestructura', targetProcessType: 'PROCESS', targetProcessId: 1, idOrganization: 1, idScenario: 3, statusCode: 'ACTIVE', ownerUserCode: 'analista_continuidad', effectiveDate: '2024-01-01', nextReviewDate: '2026-12-31', versionLabel: 'v1.0' },
      { idPlan: 4, planCode: 'BCP0866', planType: 'BCP', title: 'Indisponibilidad de proveedor convenios', targetProcessType: 'PROCESS', targetProcessId: 1, idOrganization: 1, idScenario: 6, statusCode: 'ACTIVE', ownerUserCode: 'analista_continuidad', effectiveDate: '2024-01-01', nextReviewDate: '2026-12-31', versionLabel: 'v1.0' },
      { idPlan: 5, planCode: 'BCP0865', planType: 'BCP', title: 'Indisponibilidad proveedor CCA', targetProcessType: 'PROCESS', targetProcessId: 1, idOrganization: 1, idScenario: 6, statusCode: 'ACTIVE', ownerUserCode: 'analista_continuidad', effectiveDate: '2024-01-01', nextReviewDate: '2026-12-31', versionLabel: 'v1.0' },
      { idPlan: 6, planCode: 'BCP0355', planType: 'BCP', title: 'Indisponibilidad de sistemas Operar Convenios', targetProcessType: 'PROCESS', targetProcessId: 1, idOrganization: 1, idScenario: 8, statusCode: 'ACTIVE', ownerUserCode: 'analista_continuidad', effectiveDate: '2024-01-01', nextReviewDate: '2026-12-31', versionLabel: 'v1.0' }
    ],

    riaItems: [
      {
        idRiaItem: 1,
        idRia: 1,
        itemNo: 1,
        lossRiskText: 'Costos adicionales del proceso',
        activityText: 'Recepcion de nomina, provision/distribucion de fondos, liquidacion y rendicion',
        riskFactorText: 'Escenario Personal: indisponibilidad personal clave',
        riskFactorSpecificText: 'Indisponibilidad personal clave en Departamento de Abonos',
        idPlan: 1,
        idScenario: 1,
        impactTypeId: 5,
        maxImpact24hCode: '5_ALTO',
        probabilityCode: '2_POCO_PROBABLE',
        controlEffectCode: '2_REGULAR',
        impactCode: '5_ALTO',
        inherentRiskScore: 10,
        residualRiskScore: 5,
        betaFactor: 0.01,
        residualWithBeta: 500,
        residualFinalCode: 'ALTO',
        responseTypeCode: 'UPDATE_OR_CREATE_BCP',
        responseNotes: 'Se debe crear o modificar plan de continuidad o ejecutar prueba pendiente.',
        observations: 'Plan BCP0910 actualizado durante revision RIA.',
        contingencyDesc: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idRiaItem: 2,
        idRia: 1,
        itemNo: 7,
        lossRiskText: 'Costos adicionales del proceso',
        activityText: 'Servicio por el cual clientes envian nominas de pago',
        riskFactorText: 'Escenario Proveedores: indisponibilidad servicios de terceros',
        riskFactorSpecificText: 'Indisponibilidad ServiBanca contrato 5436-1',
        idPlan: 4,
        idScenario: 6,
        impactTypeId: 5,
        maxImpact24hCode: '5_ALTO',
        probabilityCode: '2_POCO_PROBABLE',
        controlEffectCode: '1_DEFICIENTE',
        impactCode: '5_ALTO',
        inherentRiskScore: 10,
        residualRiskScore: 10,
        betaFactor: 0.01,
        residualWithBeta: 1000,
        residualFinalCode: 'ALTO',
        responseTypeCode: 'UPDATE_OR_CREATE_BCP',
        responseNotes: 'Actualizar BCP y concretar pruebas.',
        observations: 'Actualizar BCP0866; componentes de sistemas pasan a BCP0865/BCP0355.',
        contingencyDesc: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idRiaItem: 3,
        idRia: 1,
        itemNo: 10,
        lossRiskText: 'Costos adicionales del proceso',
        activityText: 'Ejecucion en Motor de Convenios (MCO)',
        riskFactorText: 'Escenario Sistemas/Aplicaciones: indisponibilidad app critica',
        riskFactorSpecificText: 'Indisponibilidad de MCO',
        idPlan: 6,
        idScenario: 8,
        impactTypeId: 5,
        maxImpact24hCode: '5_ALTO',
        probabilityCode: '2_POCO_PROBABLE',
        controlEffectCode: '1_DEFICIENTE',
        impactCode: '5_ALTO',
        inherentRiskScore: 10,
        residualRiskScore: 10,
        betaFactor: 0.01,
        residualWithBeta: 1000,
        residualFinalCode: 'ALTO',
        responseTypeCode: 'UPDATE_OR_CREATE_BCP',
        responseNotes: 'Crear/actualizar BCP y ejecutar prueba pendiente.',
        observations: 'Actualizar BCP0355 para incluir MCO/CDS/SPM.',
        contingencyDesc: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      },
      {
        idRiaItem: 4,
        idRia: 1,
        itemNo: 4,
        lossRiskText: 'Costos adicionales del proceso',
        activityText: 'Operacion con modalidad teletrabajo',
        riskFactorText: 'Escenario Personal: ausencia masiva por pandemia',
        riskFactorSpecificText: 'Pandemia que reduce dotacion presencial',
        idPlan: 2,
        idScenario: 2,
        impactTypeId: 5,
        maxImpact24hCode: '5_ALTO',
        probabilityCode: '3_OCASIONAL',
        controlEffectCode: '5_OPTIMO',
        impactCode: '5_ALTO',
        inherentRiskScore: 15,
        residualRiskScore: 3,
        betaFactor: 1,
        residualWithBeta: 3,
        residualFinalCode: 'MEDIO_BAJO',
        responseTypeCode: 'KEEP_CURRENT_BCP',
        responseNotes: 'No requiere construir/actualizar plan; mantener plan de pruebas.',
        observations: 'Sin observaciones.',
        contingencyDesc: null,
        createdAt: '2026-02-13T00:00:00Z',
        updatedAt: '2026-02-13T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system',
        deletedAt: null,
        deletedBy: null,
        isDeleted: false
      }
    ],

    planTests: [
      {
        idTest: 1,
        idPlan: 3,
        testCode: 'TEST-BCP0230-2020-03',
        testType: 'REAL',
        testDate: '2020-03-15',
        resultCode: 'SATISFACTORIO',
        scopeDescription: 'Prueba real de indisponibilidad de infraestructura.',
        participants: 'Equipo continuidad y operaciones convenios',
        objectives: 'Validar continuidad operativa y tiempos de recuperacion.',
        resultsSummary: 'Resultado satisfactorio.',
        successRatePct: 100,
        issuesFound: 0,
        recommendations: 'Mantener frecuencia anual.',
        conductedBy: 'continuidad_negocio',
        createdAt: '2020-03-16T00:00:00Z'
      },
      {
        idTest: 2,
        idPlan: 1,
        testCode: 'TEST-BCP0910-PEND',
        testType: 'PENDIENTE',
        testDate: null,
        resultCode: null,
        scopeDescription: 'Prueba pendiente luego de actualizacion por RIA.',
        participants: null,
        objectives: 'Validar dotacion minima y reemplazos.',
        resultsSummary: null,
        successRatePct: null,
        issuesFound: null,
        recommendations: 'Programar en plan anual de continuidad.',
        conductedBy: null,
        createdAt: '2026-02-13T00:00:00Z'
      }
    ]
  },

  api: {
    getAll(entityName) {
      return BCMSDataStoreV11.entities[entityName] || [];
    },

    getById(entityName, idField, idValue) {
      const rows = BCMSDataStoreV11.entities[entityName] || [];
      return rows.find((r) => r[idField] === idValue) || null;
    },

    getByCode(entityName, codeField, codeValue) {
      const rows = BCMSDataStoreV11.entities[entityName] || [];
      return rows.find((r) => r[codeField] === codeValue) || null;
    },

    filter(entityName, predicate) {
      const rows = BCMSDataStoreV11.entities[entityName] || [];
      return rows.filter(predicate);
    },

    getLookup(lookupName, code) {
      const values = BCMSDataStoreV11.lookups[lookupName] || [];
      return values.find((v) => v.code === code) || null;
    },

    getSetting(settingKey) {
      const settings = BCMSDataStoreV11.config.applicationSettings || [];
      return settings.find((s) => s.settingKey === settingKey) || null;
    }
  }
};

if (typeof window !== 'undefined') {
  window.BCMSDataStoreV11 = BCMSDataStoreV11;
}

console.log('BCMSDataStoreV11 cargado');
console.log('schemaVersion:', BCMSDataStoreV11.meta.schemaVersion);
console.log('entities:', Object.keys(BCMSDataStoreV11.entities).length);
