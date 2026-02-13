/**
 * ============================================================================
 * BCMS v2.0 - Funciones Principales
 * ============================================================================
 * 
 * Archivo consolidado de funciones sin duplicados
 * Usa BCMSDataStore para todos los datos
 * 
 * Secciones:
 *   1. Inicialización
 *   2. Navegación y Vistas
 *   3. Renderizado de Datos
 *   4. CRUD y Formularios
 *   5. Filtros y Búsqueda
 *   6. Utilidades
 *   7. Alertas y Notificaciones
 */

// Variable global para estado de la app
const AppState = {
  currentView: 'dashboard',
  selectedProcess: null,
  selectedPlan: null,
  modals: {},
  tables: {}, // Almacena instancias de DynamicTable
  charts: {} // Instancias de Chart.js para evitar duplicados
};

/* ============================================================================
   1. INICIALIZACIÓN
   ============================================================================ */

/**
 * Inicializa la aplicación
 */
function initializeApp() {
  console.log('[BCMS] Inicializando aplicacion...');
  
  // Cargar datos iniciales
  renderDashboard();
  renderAllTables();
  
  // Inicializar gráficos
  if (typeof initCharts === 'function') {
    initCharts();
  }
  
  // Actualizar info del sistema
  updateSystemInfo();
  
  // Cargar configuración guardada
  loadSavedConfig();
  
  console.log('[BCMS] Aplicacion inicializada correctamente');
}

/**
 * Actualiza la información del sistema en la vista de configuración
 */
function updateSystemInfo() {
  const meta = BCMSDataStore.meta;
  // Solo actualizar si existen los elementos
  const elVersion = document.getElementById('info-version');
  const elSchema = document.getElementById('info-schema');
  const elCompliance = document.getElementById('info-compliance');
  const elUpdated = document.getElementById('info-updated');
  
  if (elVersion) elVersion.textContent = meta.version;
  if (elSchema) elSchema.textContent = meta.schemaVersion;
  if (elCompliance) elCompliance.textContent = meta.isoCompliance;
  if (elUpdated) elUpdated.textContent = new Date(meta.lastUpdated).toLocaleString('es-CL');
}

/**
 * Refresca todos los datos
 */
function refreshData() {
  showToast('Actualizando datos...', 'info');
  
  renderDashboard();
  renderAllTables();
  
  if (typeof updateCharts === 'function') {
    updateCharts();
  }
  
  BCMSDataStore.meta.lastUpdated = new Date().toISOString();
  updateSystemInfo();
  
  showToast('Datos actualizados', 'success');
}

/* ============================================================================
   2. NAVEGACIÓN Y VISTAS
   ============================================================================ */

/**
 * Muestra una vista específica
 * @param {string} viewName - Nombre de la vista a mostrar
 */
function showView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Mostrar la vista seleccionada
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
    AppState.currentView = viewName;
  }
  
  // Actualizar navegación activa
  document.querySelectorAll('.sidebar .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`.sidebar .nav-item[data-view="${viewName}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
  
  // Actualizar título y breadcrumb
  updatePageTitle(viewName);
  
  // Renderizar datos específicos de la vista si es necesario
  onViewChange(viewName);
}

/**
 * Actualiza el título de la página
 * @param {string} viewName - Nombre de la vista
 */
function updatePageTitle(viewName) {
  const viewConfig = {
    'dashboard': { title: 'Dashboard Integrado', subtitle: 'Visión ejecutiva del Sistema BCMS' },
    'datos-maestros': { title: 'Datos Maestros', subtitle: 'Organización, Procesos, Ubicaciones y Personas' },
    'normativas-plantillas': { title: 'Normativas & Plantillas', subtitle: 'Gestión de marcos regulatorios' },
    'proveedores': { title: 'Proveedores & Terceros Críticos', subtitle: 'Gestión de dependencias críticas' },
    'cambios-bcms': { title: 'Gestión de Cambios BCMS', subtitle: 'Control de cambios del BCMS' },
    'configuracion': { title: 'Configuración del Sistema', subtitle: 'Parámetros del sistema' },
    'usuarios': { title: 'Usuarios & Accesos', subtitle: 'Gestión de identidades y permisos' },
    'gobierno': { title: 'Políticas & Estrategias', subtitle: 'Gobierno del BCMS' },
    'bia': { title: 'BIA - Análisis de Impacto', subtitle: 'Business Impact Analysis' },
    'ria': { title: 'RIA - Análisis de Riesgos', subtitle: 'Risk Impact Analysis' },
    'riesgos-ciber': { title: 'Riesgos Ciber', subtitle: 'Gestión de ciberriesgos' },
    'vista-integrada': { title: 'Vista Integrada (BIA + RIA + Ciber)', subtitle: 'Trazabilidad unificada' },
    'recursos-capacidades': { title: 'Recursos & Capacidades', subtitle: 'Inventario de recursos críticos' },
    'bcp': { title: 'Planes de Continuidad (BCP)', subtitle: 'Business Continuity Plans' },
    'drp': { title: 'Planes de Recuperación TI (DRP)', subtitle: 'Disaster Recovery Plans' },
    'incidentes': { title: 'Gestión de Incidentes', subtitle: 'Registro y seguimiento' },
    'crisis': { title: 'Gestión de Crisis', subtitle: 'Protocolo de escalamiento' },
    'comunicaciones-crisis': { title: 'Comunicaciones de Crisis', subtitle: 'Plantillas y canales' },
    'pruebas': { title: 'Pruebas y Simulacros', subtitle: 'Validación de planes' },
    'capacitacion': { title: 'Capacitación & Concienciación', subtitle: 'Formación y concienciación' },
    'auditoria': { title: 'Auditoría', subtitle: 'Evaluaciones internas y externas' },
    'hallazgos': { title: 'Hallazgos & Planes de Acción', subtitle: 'No conformidades y acciones' },
    'aprendizajes': { title: 'Lecciones Aprendidas', subtitle: 'Mejora continua' },
    'reportes': { title: 'Reportes Ejecutivos', subtitle: 'Informes y dashboards' },
    'flujo-temporal': { title: 'Flujo (referencia interna)', subtitle: 'Mapa mental de trazabilidad BCMS' }
  };
  
  const config = viewConfig[viewName] || { title: viewName, subtitle: '' };
  
  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');
  
  if (titleEl) titleEl.textContent = config.title;
  if (subtitleEl) subtitleEl.textContent = config.subtitle;
}

/**
 * Acciones al cambiar de vista
 * @param {string} viewName - Nombre de la vista
 */
function onViewChange(viewName) {
  switch(viewName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'bia':
      renderBIAProcessList();
      break;
    case 'bcp':
      renderPlansList();
      break;
    case 'proveedores':
      // Renderizar tablas de la vista Proveedores
      renderProveedoresRegistroTable();
      renderProveedoresEvaluacionesTable();
      renderProveedoresContingenciaTable();
      break;
    case 'gobierno':
      // Renderizar KPIs y gráficos de la vista Gobierno
      renderGobiernoKPIs();
      setTimeout(() => renderGobiernoCharts(), 100);
      break;
    case 'configuracion':
      // Renderizar KPIs y gráficos de la vista Configuración
      renderConfiguracionKPIs();
      setTimeout(() => renderConfiguracionCharts(), 100);
      break;
    case 'riesgos-ciber':
      // Renderizar vista de Riesgos Ciber
      renderRiesgosCiberKPIs();
      renderRiesgosCiberHeatmap();
      renderRiesgosCiberTable();
      setTimeout(() => renderRiesgosCiberChart(), 100);
      break;
    case 'drp':
      // Renderizar vista de DRP
      renderDRPKPIs();
      renderDRPProveedoresTable();
      renderDRPPlanesTable();
      setTimeout(() => renderDRPChart(), 100);
      break;
    case 'crisis':
      // Renderizar vista de Crisis
      renderCrisisSemaforo();
      renderCrisisKPIs();
      renderCrisisHistorial();
      setTimeout(() => renderCrisisChart(), 100);
      break;
    case 'comunicaciones-crisis':
      // Renderizar vista de Comunicaciones de Crisis
      renderComunicacionesKPIs();
      renderComunicacionesPlantillas();
      renderComunicacionesHistorial();
      setTimeout(() => renderComunicacionesChart(), 100);
      break;
    case 'auditoria':
      // Renderizar vista de Auditoría
      renderAuditoriaKPIs();
      renderAuditoriaTables();
      setTimeout(() => renderAuditoriaChart(), 100);
      break;
    case 'recursos-capacidades':
      // Renderizar vista de Recursos & Capacidades
      renderRecursosKPIs();
      renderRecursosCoberturaTable();
      setTimeout(() => renderRecursosCharts(), 100);
      break;
    case 'capacitacion':
      // Renderizar vista de Capacitación
      renderCapacitacionKPIs();
      renderCapacitacionPrograma();
      renderCapacitacionSimulacros();
      setTimeout(() => renderCapacitacionChart(), 100);
      break;
    case 'cambios-bcms':
      // Renderizar vista de Gestión de Cambios BCMS
      renderCambiosKPIs();
      renderCambiosTable();
      setTimeout(() => renderCambiosChart(), 100);
      break;
    case 'normativas-plantillas':
      renderEditorFrameworks();
      break;
    case 'usuarios':
      // Renderizar vista de Usuarios & Accesos
      renderUsuariosKPIs();
      renderUsuariosRBAC();
      renderUsuariosTable();
      break;
    case 'reportes':
      // Renderizar vista de Reportes Ejecutivos
      renderReportesKPIs();
      renderReportesTable();
      break;
    case 'ria':
      // Renderizar vista de RIA
      renderRIAView();
      break;
    case 'incidentes':
      // Renderizar vista de Incidentes
      renderIncidentesView();
      break;
    case 'pruebas':
      // Renderizar vista de Pruebas y Simulacros
      renderPruebasView();
      break;
    case 'hallazgos':
      // Renderizar vista de Hallazgos
      renderHallazgosView();
      break;
    case 'aprendizajes':
      // Renderizar vista de Lecciones Aprendidas
      renderAprendizajesView();
      break;
    case 'vista-integrada':
      // Renderizar vista integrada
      renderVistaIntegradaView();
      break;
  }
}

/* ============================================================================
   3. RENDERIZADO DE DATOS
   ============================================================================ */

/**
 * Renderiza el dashboard completo
 */
function renderDashboard() {
  const metrics = BCMSDataStore.api.getDashboardMetrics();
  
  // Calcular metricas adicionales para iconos condicionales
  const processes = BCMSDataStore.api.getAll('processes');
  const criticalProcesses = processes.filter(p => p.businessCriticality === 'CRITICAL');
  const processesWithBIA = criticalProcesses.filter(p => p.hasBIA);
  const biaCoverage = criticalProcesses.length > 0 ? (processesWithBIA.length / criticalProcesses.length) * 100 : 0;
  
  const plans = BCMSDataStore.api.getAll('continuityPlans');
  const bcpPlans = plans.filter(p => p.planType === 'BCP');
  const tests = BCMSDataStore.api.getAll('planTests');
  const testedPlans = bcpPlans.filter(p => tests.some(t => t.planId === p.id && t.result === 'PASSED'));
  const testCoverage = bcpPlans.length > 0 ? (testedPlans.length / bcpPlans.length) * 100 : 0;
  
  // Calcular RTO promedio real
  const avgRTO = criticalProcesses.length > 0 
    ? Math.round(criticalProcesses.reduce((sum, p) => sum + (p.rto || 240), 0) / criticalProcesses.length / 60) 
    : 4;
  const rtoTarget = 6; // horas
  const rtoStatus = avgRTO <= rtoTarget ? 'success' : (avgRTO <= rtoTarget * 1.5 ? 'warning' : 'danger');
  
  // Helper para determinar icono y clase
  const getStatusIcon = (status) => {
    if (status === 'success') return { icon: 'bi-check-circle', class: 'status-success' };
    if (status === 'warning') return { icon: 'bi-exclamation-triangle', class: 'status-warning' };
    return { icon: 'bi-x-circle', class: 'status-danger' };
  };
  
  const biaStatus = getStatusIcon(biaCoverage >= 100 ? 'success' : (biaCoverage >= 80 ? 'warning' : 'danger'));
  const testStatus = getStatusIcon(testCoverage >= 80 ? 'success' : (testCoverage >= 60 ? 'warning' : 'danger'));
  const rtoStatusInfo = getStatusIcon(rtoStatus);
  const incidentStatus = getStatusIcon(metrics.openIncidents === 0 ? 'success' : (metrics.openIncidents <= 2 ? 'warning' : 'danger'));
  
  // Renderizar KPIs con iconos en el subtítulo
  const kpiContainer = document.getElementById('kpi-dashboard');
  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">Procesos Criticos</div>
          <div class="kpi-value">${metrics.criticalProcesses}</div>
          <div class="kpi-subtitle-with-icon ${biaStatus.class}">
            <i class="bi ${biaStatus.icon}"></i>
            <span>${Math.round(biaCoverage)}% con BIA</span>
          </div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">Planes BCP</div>
          <div class="kpi-value">${metrics.activePlans}</div>
          <div class="kpi-subtitle-with-icon ${testStatus.class}">
            <i class="bi ${testStatus.icon}"></i>
            <span>${Math.round(testCoverage)}% probados</span>
          </div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">RTO Promedio</div>
          <div class="kpi-value">${avgRTO}h</div>
          <div class="kpi-subtitle-with-icon ${rtoStatusInfo.class}">
            <i class="bi ${rtoStatusInfo.icon}"></i>
            <span>Target: ${rtoTarget}h</span>
          </div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">Incidentes Abiertos</div>
          <div class="kpi-value">${metrics.openIncidents}</div>
          <div class="kpi-subtitle-with-icon ${incidentStatus.class}">
            <i class="bi ${incidentStatus.icon}"></i>
            <span>${metrics.openIncidents === 0 ? 'Sin pendientes' : 'Requiere atencion'}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Renderizar alertas ejecutivas
  renderDashboardAlerts();
  
  // Renderizar matriz de riesgo
  renderRiskMatrix();
  
  // Renderizar tabla de procesos
  renderDashboardProcessTable();
}

/**
 * Renderiza las alertas ejecutivas del dashboard
 */
function renderDashboardAlerts() {
  const tbody = document.getElementById('tbody-alertas');
  if (!tbody) return;
  
  const alerts = generateDashboardAlerts();
  
  tbody.innerHTML = alerts.map(a => `
    <tr>
      <td><span class="badge badge-${a.type}">${a.typeLabel}</span></td>
      <td>${a.description}</td>
      <td>${a.unit}</td>
      <td><span class="badge badge-${a.severity}">${a.severityLabel}</span></td>
      <td>${a.dueDate}</td>
    </tr>
  `).join('');
}

/**
 * Genera las alertas para el dashboard
 */
function generateDashboardAlerts() {
  const alerts = [];
  
  // Riesgos críticos
  const criticalRisks = BCMSDataStore.api.filter('risks', r => r.residualScore >= 15);
  criticalRisks.forEach(r => {
    alerts.push({
      type: 'critical',
      typeLabel: 'Riesgo crítico',
      description: r.title,
      unit: 'Infraestructura',
      severity: 'critical',
      severityLabel: 'Crítica',
      dueDate: '30 días'
    });
  });
  
  // Planes sin probar
  const untestedPlans = BCMSDataStore.api.filter('continuityPlans', p => {
    const tests = BCMSDataStore.api.filter('planTests', t => t.planId === p.id);
    return tests.length === 0;
  });
  untestedPlans.slice(0, 2).forEach(p => {
    alerts.push({
      type: 'high',
      typeLabel: 'Plan no probado',
      description: `${p.code} sin prueba integral en últimos 12 meses`,
      unit: 'Continuidad',
      severity: 'high',
      severityLabel: 'Alta',
      dueDate: '60 días'
    });
  });
  
  // Hallazgos pendientes
  const openFindings = BCMSDataStore.api.filter('findings', f => f.status !== 'CLOSED');
  openFindings.slice(0, 2).forEach(f => {
    alerts.push({
      type: 'warning',
      typeLabel: 'Hallazgo pendiente',
      description: f.title,
      unit: 'Auditoría',
      severity: 'warning',
      severityLabel: 'Media',
      dueDate: f.dueDate || 'Por definir'
    });
  });
  
  return alerts.slice(0, 5); // Máximo 5 alertas
}

/**
 * Renderiza la matriz de riesgo 5x5
 */
function renderRiskMatrix() {
  const container = document.getElementById('risk-matrix-container');
  if (!container) return;
  
  // Contar riesgos por cuadrante
  const risks = BCMSDataStore.api.getAll('risks');
  const matrix = {};
  
  // Inicializar matriz 5x5
  for (let imp = 1; imp <= 5; imp++) {
    for (let prob = 1; prob <= 5; prob++) {
      matrix[`${imp}-${prob}`] = 0;
    }
  }
  
  // Contar riesgos (mapear score a 1-5)
  risks.forEach(r => {
    const prob = Math.min(5, Math.max(1, Math.ceil(r.residualScore / 5)));
    const imp = Math.min(5, Math.max(1, Math.ceil(r.inherentScore / 5)));
    matrix[`${imp}-${prob}`]++;
  });
  
  // Colores por nivel de riesgo
  const getColor = (imp, prob) => {
    const score = imp * prob;
    if (score >= 15) return '#dc2626'; // Rojo
    if (score >= 10) return '#f87171'; // Rojo claro
    if (score >= 6) return '#fed7aa';  // Naranja claro
    if (score >= 3) return '#fef3c7';  // Amarillo
    return '#dcfce7'; // Verde
  };
  
  const getTextColor = (imp, prob) => {
    const score = imp * prob;
    return score >= 15 ? 'white' : '#1e293b';
  };
  
  const impLabels = ['Crítico', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'];
  const probLabels = ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'];
  
  let html = `<div style="display: grid; grid-template-columns: 60px repeat(5, 1fr); gap: 4px; font-size: 11px;">`;
  
  // Header
  html += `<div></div>`;
  probLabels.forEach(label => {
    html += `<div style="text-align: center; font-weight: 600; padding: 8px;">${label}</div>`;
  });
  
  // Filas (de arriba a abajo: Crítico a Muy Bajo)
  for (let imp = 5; imp >= 1; imp--) {
    html += `<div style="font-weight: 600; padding: 8px; display: flex; align-items: center;">${impLabels[5 - imp]}</div>`;
    for (let prob = 1; prob <= 5; prob++) {
      const count = matrix[`${imp}-${prob}`];
      const bgColor = getColor(imp, prob);
      const textColor = getTextColor(imp, prob);
      html += `<div style="background: ${bgColor}; color: ${textColor}; padding: 16px; border-radius: 4px; text-align: center; font-weight: ${count > 0 ? '600' : '400'};">${count}</div>`;
    }
  }
  
  html += `</div>`;
  html += `<div style="margin-top: 12px; text-align: center; font-size: 10px; color: var(--text-muted);">
    Probabilidad (eje X) × Impacto (eje Y) • Total: ${risks.length} riesgos activos
  </div>`;
  
  container.innerHTML = html;
}

/**
 * Renderiza la tabla de procesos del dashboard usando DynamicTable
 */
function renderDashboardProcessTable() {
  const container = document.getElementById('procesos-criticos-table');
  if (!container) return;
  
  // Destruir tabla existente si hay una
  if (AppState.tables.procesosCriticos) {
    AppState.tables.procesosCriticos.destroy();
  }

  // Mapeo de criticidad a colores para badges (usando clases CSS)
  const criticalityColors = {
    'Crítico': 'Critico',
    'Alto': 'Alto',
    'Medio': 'Medio',
    'Bajo': 'Bajo'
  };

  // Obtener nombres de unidades organizacionales
  const getUnitName = (unitId) => {
    const unit = BCMSDataStore.api.getById('organizationalUnits', unitId);
    return unit ? unit.name : '-';
  };

  // Preparar datos para la tabla
  const prepareProcessData = () => {
    const processes = BCMSDataStore.api.getAll('processes');
    
    return processes.map(p => {
      // Buscar planes asociados
      const bcp = BCMSDataStore.api.filter('continuityPlans', plan => 
        plan.planType === 'BCP' && plan.targetProcessId === p.id
      );
      const drp = BCMSDataStore.api.filter('continuityPlans', plan => 
        plan.planType === 'DRP' && plan.targetProcessId === p.id
      );

      // Buscar ultima prueba de los planes asociados
      let lastTestDate = null;
      const allPlans = [...bcp, ...drp];
      if (allPlans.length > 0) {
        const planIds = allPlans.map(pl => pl.id);
        const tests = BCMSDataStore.api.filter('planTests', test => 
          planIds.includes(test.planId)
        );
        if (tests.length > 0) {
          const sorted = tests.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
          lastTestDate = sorted[0].testDate;
        }
      }

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        unitId: p.responsibleUnitId,
        unit: getUnitName(p.responsibleUnitId),
        criticality: BCMSDataStore.api.getLookupLabel('businessCriticality', p.businessCriticality),
        rto: formatMinutesToTime(p.targetRtoMinutes),
        rpo: formatMinutesToTime(p.targetRpoMinutes),
        mtpd: formatMinutesToTime(p.mtpdMinutes),
        hasBcp: bcp.length > 0,
        bcpCode: bcp.length > 0 ? bcp[0].code : null,
        hasDrp: drp.length > 0,
        drpCode: drp.length > 0 ? drp[0].code : null,
        lastTest: lastTestDate
      };
    });
  };

  // Obtener unidades unicas para el filtro
  const getUniqueUnits = () => {
    const units = BCMSDataStore.api.getAll('organizationalUnits');
    return units.map(u => ({ value: u.name, label: u.name }));
  };

  // Crear instancia de DynamicTable
  AppState.tables.procesosCriticos = new DynamicTable({
    container: '#procesos-criticos-table',
    tableId: 'procesos-criticos',
    columns: [
      { key: 'code', label: 'Codigo', type: 'text', sortable: true },
      { key: 'name', label: 'Proceso', type: 'text', sortable: true },
      { key: 'unit', label: 'Unidad', type: 'text', sortable: true },
      { 
        key: 'criticality', 
        label: 'Criticidad', 
        type: 'badge', 
        sortable: true,
        badgeMap: criticalityColors
      },
      { key: 'rto', label: 'RTO', type: 'text', sortable: true },
      { key: 'rpo', label: 'RPO', type: 'text', sortable: true },
      { key: 'mtpd', label: 'MTPD', type: 'text', sortable: true },
      { 
        key: 'hasBcp', 
        label: 'BCP', 
        type: 'custom',
        render: (value, row) => {
          if (value) {
            return `<span class="badge badge-success clickable-badge" data-plan-code="${row.bcpCode}" data-action="view-bcp">${row.bcpCode}</span>`;
          }
          return '<span class="badge badge-secondary">Sin BCP</span>';
        }
      },
      { 
        key: 'hasDrp', 
        label: 'DRP', 
        type: 'custom',
        render: (value, row) => {
          if (value) {
            return `<span class="badge badge-info clickable-badge" data-plan-code="${row.drpCode}" data-action="view-drp">${row.drpCode}</span>`;
          }
          return '<span class="badge badge-secondary">Sin DRP</span>';
        }
      },
      { 
        key: 'lastTest', 
        label: 'Ultima Prueba', 
        type: 'date',
        sortable: true,
        emptyText: 'Sin prueba'
      }
    ],
    filters: [],  // Filtros manejados externamente via table-toolbar-unified
    pagination: { enabled: true, pageSize: 10 },
    showResetButton: false,  // El boton de limpiar esta en la toolbar externa
    emptyState: {
      icon: 'bi-folder2-open',
      message: 'No se encontraron procesos con los filtros aplicados'
    },
    onRowClick: (row, index, event) => {
      // Verificar si se hizo click en un badge clickeable
      const target = event?.target;
      if (target && target.classList.contains('clickable-badge')) {
        const action = target.dataset.action;
        const planCode = target.dataset.planCode;
        
        if (action === 'view-bcp') {
          // Navegar a vista BCP con el plan seleccionado
          AppState.selectedPlan = BCMSDataStore.api.filter('continuityPlans', 
            p => p.code === planCode)[0];
          showView('bcp');
        } else if (action === 'view-drp') {
          // Navegar a vista DRP con el plan seleccionado
          AppState.selectedPlan = BCMSDataStore.api.filter('continuityPlans', 
            p => p.code === planCode)[0];
          showView('drp');
        }
        return; // No ejecutar la accion default de fila
      }
      
      // Click en la fila (no en badge) -> ir a Datos Maestros
      AppState.selectedProcess = row.id;
      showView('datos-maestros');
    },
    data: prepareProcessData
  });

  // Agregar event listener para badges clickeables despues de renderizar
  const tableContainer = document.getElementById('procesos-criticos-table');
  if (tableContainer) {
    tableContainer.addEventListener('click', (e) => {
      const badge = e.target.closest('.clickable-badge');
      if (badge) {
        e.stopPropagation();
        const action = badge.dataset.action;
        const planCode = badge.dataset.planCode;
        
        if (action === 'view-bcp') {
          const plan = BCMSDataStore.api.filter('continuityPlans', p => p.code === planCode)[0];
          if (plan) {
            AppState.selectedPlan = plan;
            showView('bcp');
          }
        } else if (action === 'view-drp') {
          const plan = BCMSDataStore.api.filter('continuityPlans', p => p.code === planCode)[0];
          if (plan) {
            AppState.selectedPlan = plan;
            showView('drp');
          }
        }
      }
    });
  }
  
  // Poblar el select de unidades
  populateUnidadFilter();
}

/**
 * Pobla el filtro de unidades con las unidades disponibles
 */
function populateUnidadFilter() {
  const select = document.getElementById('filter-unidad');
  if (!select) return;
  
  const units = BCMSDataStore.api.getAll('organizationalUnits');
  select.innerHTML = '<option value="">Todas las unidades</option>';
  
  units.forEach(unit => {
    const option = document.createElement('option');
    option.value = unit.name;
    option.textContent = unit.name;
    select.appendChild(option);
  });
}

/**
 * Filtra la tabla de procesos críticos por texto de búsqueda
 */
function filterProcesosCriticos(searchText) {
  if (!AppState.tables.procesosCriticos) return;
  
  const criticidadFilter = document.getElementById('filter-criticidad')?.value || '';
  const unidadFilter = document.getElementById('filter-unidad')?.value || '';
  
  AppState.tables.procesosCriticos.filter(row => {
    const matchesSearch = !searchText || 
      row.name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.code.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCriticidad = !criticidadFilter || row.criticality === criticidadFilter;
    const matchesUnidad = !unidadFilter || row.unit === unidadFilter;
    
    return matchesSearch && matchesCriticidad && matchesUnidad;
  });
}

/**
 * Aplica los filtros de criticidad y unidad a la tabla
 */
function applyProcesosCriticosFilters() {
  const searchText = document.getElementById('search-procesos-criticos')?.value || '';
  filterProcesosCriticos(searchText);
}

/**
 * Limpia todos los filtros de la tabla de procesos críticos
 */
function clearProcesosCriticosFilters() {
  // Limpiar campo de búsqueda
  const searchInput = document.getElementById('search-procesos-criticos');
  if (searchInput) searchInput.value = '';
  
  // Resetear select de criticidad
  const criticalidadSelect = document.getElementById('filter-criticidad');
  if (criticalidadSelect) criticalidadSelect.value = '';
  
  // Resetear select de unidad
  const unidadSelect = document.getElementById('filter-unidad');
  if (unidadSelect) unidadSelect.value = '';
  
  // Limpiar filtro externo de la tabla
  if (AppState.tables?.procesosCriticos) {
    AppState.tables.procesosCriticos.clearExternalFilter();
  }
}

/**
 * Genera alertas basadas en el estado actual de los datos
 */
function generateAlerts() {
  const alerts = [];
  
  // Incidentes abiertos
  const openIncidents = BCMSDataStore.api.filter('incidents', i => 
    !['CLOSED', 'RESOLVED'].includes(i.status)
  );
  if (openIncidents.length > 0) {
    alerts.push({
      severity: 'critical',
      icon: 'bi-lightning-fill',
      title: `${openIncidents.length} incidente(s) sin resolver`,
      detail: 'Requiere atención inmediata'
    });
  }
  
  // Hallazgos pendientes
  const openFindings = BCMSDataStore.api.filter('findings', f => f.status !== 'CLOSED');
  if (openFindings.length > 0) {
    alerts.push({
      severity: 'warning',
      icon: 'bi-flag-fill',
      title: `${openFindings.length} hallazgo(s) pendiente(s)`,
      detail: 'Seguimiento requerido'
    });
  }
  
  // Planes próximos a vencer
  const plans = BCMSDataStore.api.getAll('continuityPlans');
  const today = new Date();
  const nearExpiry = plans.filter(p => {
    if (!p.nextReviewDate) return false;
    const reviewDate = new Date(p.nextReviewDate);
    const daysUntil = (reviewDate - today) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30 && daysUntil > 0;
  });
  if (nearExpiry.length > 0) {
    alerts.push({
      severity: 'warning',
      icon: 'bi-calendar-event',
      title: `${nearExpiry.length} plan(es) próximo(s) a revisión`,
      detail: 'En los próximos 30 días'
    });
  }
  
  // Lecciones en progreso
  const lessonsInProgress = BCMSDataStore.api.filter('lessonsLearned', l => l.status === 'in_progress');
  if (lessonsInProgress.length > 0) {
    alerts.push({
      severity: 'info',
      icon: 'bi-lightbulb',
      title: `${lessonsInProgress.length} lección(es) en implementación`,
      detail: 'Mejora continua activa'
    });
  }
  
  return alerts;
}

/**
 * Renderiza la actividad reciente
 */
function renderRecentActivity() {
  const activityList = document.getElementById('activity-list');
  
  // Simular actividad reciente
  const activities = [
    { text: 'Incidente INC-2025-001 reportado', time: 'Hace 2 horas' },
    { text: 'BCP-001 revisado y actualizado', time: 'Hace 1 día' },
    { text: 'Prueba TEST-2024-002 completada exitosamente', time: 'Hace 2 días' },
    { text: 'Lección LL-2024-004 validada', time: 'Hace 3 días' },
    { text: 'Auditoría AUD-2024-002 cerrada', time: 'Hace 1 semana' }
  ];
  
  activityList.innerHTML = activities.map(a => `
    <li class="activity-item">
      <div class="activity-dot"></div>
      <div class="activity-content">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </li>
  `).join('');
}

/**
 * Renderiza todas las tablas
 */
function renderAllTables() {
  renderProcessesTable();
  renderUsersTable();
  renderLocationsTable();
  renderSuppliersTable();
  renderRisksTable();
  renderIncidentsTable();
  renderTestsTable();
  renderAuditsTable();
  renderFindingsTable();
  renderLessonsTable();
  renderChangesTable();
}

/**
 * Renderiza la tabla de procesos
 */
function renderProcessesTable() {
  const tbody = document.getElementById('tbody-procesos');
  if (!tbody) return;
  
  const processes = BCMSDataStore.api.getAll('processes');
  
  tbody.innerHTML = processes.map(p => `
    <tr>
      <td><code>${p.code}</code></td>
      <td>${p.name}</td>
      <td><span class="badge badge-${p.businessCriticality.toLowerCase()}">${BCMSDataStore.api.getLookupLabel('businessCriticality', p.businessCriticality)}</span></td>
      <td>${formatMinutesToTime(p.targetRtoMinutes)}</td>
      <td>${formatMinutesToTime(p.targetRpoMinutes)}</td>
      <td>${formatMinutesToTime(p.mtpdMinutes)}</td>
      <td>${p.mbcoPercent}%</td>
      <td><span class="badge ${p.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}">${p.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewProcess(${p.id})">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary btn-action" onclick="editProcess(${p.id})">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de usuarios
 */
function renderUsersTable() {
  const tbody = document.getElementById('tbody-usuarios');
  if (!tbody) return;
  
  const users = BCMSDataStore.api.getAll('users');
  
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.email}</td>
      <td>${u.firstName} ${u.lastName}</td>
      <td>${u.role}</td>
      <td>${u.orgUnit}</td>
      <td><span class="badge ${u.isActive ? 'bg-success' : 'bg-secondary'}">${u.isActive ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-secondary btn-action" onclick="editUser(${u.id})">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de ubicaciones
 */
function renderLocationsTable() {
  const tbody = document.getElementById('tbody-ubicaciones');
  if (!tbody) return;
  
  const locations = BCMSDataStore.api.getAll('locations');
  
  tbody.innerHTML = locations.map(l => `
    <tr>
      <td><code>${l.code}</code></td>
      <td>${l.name}</td>
      <td>${l.type}</td>
      <td>${l.city}</td>
      <td>${l.isPrimary ? '<i class="bi bi-check-circle-fill text-success"></i>' : ''}</td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de proveedores
 */
function renderSuppliersTable() {
  const tbody = document.getElementById('tbody-proveedores');
  if (!tbody) return;
  
  const suppliers = BCMSDataStore.api.getAll('suppliers');
  
  tbody.innerHTML = suppliers.map(s => `
    <tr>
      <td><code>${s.code}</code></td>
      <td>${s.name}</td>
      <td>${s.type}</td>
      <td><span class="badge badge-${s.criticality.toLowerCase()}">${s.criticality}</span></td>
      <td><span class="badge bg-secondary">${s.riskTier}</span></td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de riesgos
 */
function renderRisksTable() {
  const tbody = document.getElementById('tbody-riesgos');
  if (!tbody) return;
  
  const risks = BCMSDataStore.api.getAll('risks');
  
  tbody.innerHTML = risks.map(r => `
    <tr>
      <td><code>${r.code}</code></td>
      <td>${r.title}</td>
      <td><span class="badge bg-info">${BCMSDataStore.api.getLookupLabel('riskDomain', r.riskDomain)}</span></td>
      <td><span class="badge ${getRiskScoreBadgeClass(r.inherentScore)}">${r.inherentScore}</span></td>
      <td><span class="badge ${getRiskScoreBadgeClass(r.residualScore)}">${r.residualScore}</span></td>
      <td>${BCMSDataStore.api.getLookupLabel('treatmentType', r.treatmentType)}</td>
      <td><span class="badge bg-secondary">${BCMSDataStore.api.getLookupLabel('riskStatus', r.status)}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewRisk(${r.id})">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de incidentes
 */
function renderIncidentsTable() {
  const tbody = document.getElementById('tbody-incidentes');
  if (!tbody) return;
  
  const incidents = BCMSDataStore.api.getAll('incidents');
  
  tbody.innerHTML = incidents.map(i => `
    <tr>
      <td><code>${i.code}</code></td>
      <td>${i.title}</td>
      <td>${i.type}</td>
      <td><span class="badge badge-${i.severity.toLowerCase()}">${i.severity}</span></td>
      <td><span class="badge ${getIncidentStatusBadgeClass(i.status)}">${BCMSDataStore.api.getLookupLabel('incidentStatus', i.status)}</span></td>
      <td>${formatDate(i.reportedAt)}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewIncident(${i.id})">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de pruebas
 */
function renderTestsTable() {
  const tbody = document.getElementById('tbody-pruebas');
  if (!tbody) return;
  
  const tests = BCMSDataStore.api.getAll('planTests');
  
  tbody.innerHTML = tests.map(t => {
    const plan = BCMSDataStore.api.getById('continuityPlans', t.planId);
    return `
      <tr>
        <td><code>${t.code}</code></td>
        <td>${t.title}</td>
        <td>${BCMSDataStore.api.getLookupLabel('testType', t.testType)}</td>
        <td>${plan ? plan.code : '-'}</td>
        <td>${t.testDate}</td>
        <td>${t.successRatePct !== undefined ? `<span class="badge ${t.successRatePct >= 80 ? 'bg-success' : 'bg-warning'}">${t.successRatePct}%</span>` : '<span class="badge bg-secondary">Pendiente</span>'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewTest(${t.id})">
            <i class="bi bi-eye"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Renderiza la tabla de auditorías
 */
function renderAuditsTable() {
  const tbody = document.getElementById('tbody-auditorias');
  if (!tbody) return;
  
  const audits = BCMSDataStore.api.getAll('audits');
  
  tbody.innerHTML = audits.map(a => `
    <tr>
      <td><code>${a.code}</code></td>
      <td>${a.title}</td>
      <td>${BCMSDataStore.api.getLookupLabel('auditType', a.auditType)}</td>
      <td>${a.plannedStart}</td>
      <td><span class="badge ${a.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}">${a.status}</span></td>
      <td>${a.conclusion || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewAudit(${a.id})">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de hallazgos
 */
function renderFindingsTable() {
  const tbody = document.getElementById('tbody-hallazgos');
  if (!tbody) return;
  
  const findings = BCMSDataStore.api.getAll('findings');
  
  tbody.innerHTML = findings.map(f => {
    const audit = BCMSDataStore.api.getById('audits', f.auditId);
    const responsible = f.responsibleUserId ? BCMSDataStore.api.getById('users', f.responsibleUserId) : null;
    return `
      <tr>
        <td><code>${f.code}</code></td>
        <td>${f.title}</td>
        <td><span class="badge ${getFindingTypeBadgeClass(f.findingType)}">${BCMSDataStore.api.getLookupLabel('findingType', f.findingType)}</span></td>
        <td>${audit ? audit.code : '-'}</td>
        <td><span class="badge ${f.status === 'CLOSED' ? 'bg-success' : 'bg-warning'}">${f.status}</span></td>
        <td>${responsible ? `${responsible.firstName} ${responsible.lastName}` : '-'}</td>
        <td>${f.dueDate || '-'}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Renderiza la tabla de lecciones aprendidas
 */
function renderLessonsTable() {
  const tbody = document.getElementById('tbody-lecciones');
  if (!tbody) return;
  
  const lessons = BCMSDataStore.api.getAll('lessonsLearned');
  
  tbody.innerHTML = lessons.map(l => `
    <tr>
      <td><code>${l.code}</code></td>
      <td>${l.title}</td>
      <td><span class="badge bg-info">${BCMSDataStore.api.getLookupLabel('lessonSourceType', l.sourceType)}</span></td>
      <td><span class="badge ${getPriorityBadgeClass(l.priority)}">${l.priority}</span></td>
      <td><span class="badge ${getLessonStatusBadgeClass(l.status)}">${l.status}</span></td>
      <td>${l.lessonDate}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewLesson('${l.id}')">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Renderiza la tabla de cambios BCMS
 */
function renderChangesTable() {
  const tbody = document.getElementById('tbody-cambios');
  if (!tbody) return;
  
  const changes = BCMSDataStore.api.getAll('bcmsChanges');
  
  tbody.innerHTML = changes.map(c => {
    const requester = c.requestedBy ? BCMSDataStore.api.getById('users', c.requestedBy) : null;
    return `
      <tr>
        <td><code>${c.changeCode}</code></td>
        <td>${c.title}</td>
        <td>${BCMSDataStore.api.getLookupLabel('changeType', c.changeType)}</td>
        <td><span class="badge ${c.changeCategory === 'critical' ? 'bg-danger' : c.changeCategory === 'major' ? 'bg-warning' : 'bg-secondary'}">${c.changeCategory}</span></td>
        <td><span class="badge ${getChangeStatusBadgeClass(c.status)}">${BCMSDataStore.api.getLookupLabel('changeStatus', c.status.toUpperCase())}</span></td>
        <td>${requester ? `${requester.firstName} ${requester.lastName}` : '-'}</td>
        <td>${c.requestDate}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewChange('${c.id}')">
            <i class="bi bi-eye"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Renderiza la lista de procesos para BIA
 */
function renderBIAProcessList() {
  const list = document.getElementById('bia-process-list');
  if (!list) return;
  
  const processes = BCMSDataStore.api.getAll('processes');
  
  list.innerHTML = processes.map(p => `
    <li class="list-group-item list-group-item-action bia-process-item ${AppState.selectedProcess === p.id ? 'selected' : ''}" 
        onclick="selectBIAProcess(${p.id})">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${p.name}</strong>
          <br><small class="text-muted">${p.code}</small>
        </div>
        <span class="badge badge-${p.businessCriticality.toLowerCase()}">${p.businessCriticality}</span>
      </div>
    </li>
  `).join('');
}

/**
 * Selecciona un proceso para ver su BIA
 */
function selectBIAProcess(processId) {
  AppState.selectedProcess = processId;
  
  // Actualizar selección visual
  document.querySelectorAll('.bia-process-item').forEach(item => {
    item.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  const process = BCMSDataStore.api.getById('processes', processId);
  if (!process) return;
  
  // Actualizar detalle
  document.getElementById('bia-detail-title').textContent = process.name;
  
  const detailContent = document.getElementById('bia-detail-content');
  detailContent.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <div class="bia-metric">
          <span class="bia-metric-label">Criticidad</span>
          <span class="bia-metric-value"><span class="badge badge-${process.businessCriticality.toLowerCase()}">${BCMSDataStore.api.getLookupLabel('businessCriticality', process.businessCriticality)}</span></span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">RTO (Objetivo)</span>
          <span class="bia-metric-value">${formatMinutesToTime(process.targetRtoMinutes)}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">RPO (Objetivo)</span>
          <span class="bia-metric-value">${formatMinutesToTime(process.targetRpoMinutes)}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="bia-metric">
          <span class="bia-metric-label">MTPD</span>
          <span class="bia-metric-value">${formatMinutesToTime(process.mtpdMinutes)}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">MBCO</span>
          <span class="bia-metric-value">${process.mbcoPercent}%</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">Responsable</span>
          <span class="bia-metric-value">${process.owner}</span>
        </div>
      </div>
    </div>
    <hr>
    <p class="mb-0"><strong>Descripción:</strong> ${process.description}</p>
  `;
  
  // Renderizar dependencias
  renderBIADependencies(processId);
}

/**
 * Renderiza las dependencias de un proceso
 */
function renderBIADependencies(processId) {
  const content = document.getElementById('bia-dependencies-content');
  const dependencies = BCMSDataStore.api.filter('biaDependencies', d => d.processId === processId);
  
  if (dependencies.length === 0) {
    content.innerHTML = '<p class="text-muted">No hay dependencias registradas para este proceso.</p>';
    return;
  }
  
  const grouped = {};
  dependencies.forEach(d => {
    if (!grouped[d.dependencyType]) grouped[d.dependencyType] = [];
    grouped[d.dependencyType].push(d);
  });
  
  content.innerHTML = Object.entries(grouped).map(([type, deps]) => `
    <div class="mb-3">
      <strong>${BCMSDataStore.api.getLookupLabel('dependencyType', type)}</strong>
      <ul class="list-unstyled mb-0 mt-1">
        ${deps.map(d => `
          <li class="d-flex justify-content-between align-items-center py-1">
            <span>${d.referenceName}</span>
            <span class="badge badge-${d.criticality.toLowerCase()}">${d.criticality}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

/**
 * Renderiza la lista de planes
 */
function renderPlansList() {
  const list = document.getElementById('plans-list');
  if (!list) return;
  
  const plans = BCMSDataStore.api.getAll('continuityPlans');
  
  list.innerHTML = plans.map(p => `
    <li class="list-group-item list-group-item-action ${AppState.selectedPlan === p.id ? 'active-item' : ''}" 
        onclick="selectPlan(${p.id})">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span class="badge ${p.planType === 'BCP' ? 'bg-primary' : p.planType === 'DRP' ? 'bg-info' : 'bg-secondary'} me-1">${p.planType}</span>
          <strong>${p.code}</strong>
          <br><small class="text-muted">${p.title}</small>
        </div>
        <span class="badge ${p.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}">${p.status}</span>
      </div>
    </li>
  `).join('');
}

/**
 * Selecciona un plan para ver su detalle
 */
function selectPlan(planId) {
  AppState.selectedPlan = planId;
  
  const plan = BCMSDataStore.api.getById('continuityPlans', planId);
  if (!plan) return;
  
  // Actualizar lista visual
  document.querySelectorAll('#plans-list .list-group-item').forEach(item => {
    item.classList.remove('active-item');
  });
  event.currentTarget.classList.add('active-item');
  
  // Actualizar detalle
  document.getElementById('plan-detail-title').textContent = `${plan.code} - ${plan.title}`;
  
  const owner = plan.ownerUserId ? BCMSDataStore.api.getById('users', plan.ownerUserId) : null;
  const process = plan.targetProcessId ? BCMSDataStore.api.getById('processes', plan.targetProcessId) : null;
  
  const detailContent = document.getElementById('plan-detail-content');
  detailContent.innerHTML = `
    <div class="row g-3 mb-3">
      <div class="col-md-6">
        <p><strong>Tipo:</strong> ${BCMSDataStore.api.getLookupLabel('planType', plan.planType)}</p>
        <p><strong>Versión:</strong> ${plan.version}</p>
        <p><strong>Estado:</strong> <span class="badge ${plan.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}">${plan.status}</span></p>
      </div>
      <div class="col-md-6">
        <p><strong>Responsable:</strong> ${owner ? `${owner.firstName} ${owner.lastName}` : '-'}</p>
        <p><strong>Proceso:</strong> ${process ? process.name : 'Alcance global'}</p>
        <p><strong>Próxima revisión:</strong> ${plan.nextReviewDate || '-'}</p>
      </div>
    </div>
    <p><strong>Descripción:</strong> ${plan.description}</p>
    ${plan.rtoTarget ? `<p><strong>RTO Objetivo:</strong> ${plan.rtoTarget} horas | <strong>RPO Objetivo:</strong> ${plan.rpoTarget} horas</p>` : ''}
  `;
  
  // Mostrar y renderizar estrategias
  const strategiesCard = document.getElementById('strategies-card');
  const strategies = BCMSDataStore.api.filter('recoveryStrategies', s => s.planId === planId);
  
  if (strategies.length > 0) {
    strategiesCard.style.display = 'block';
    document.getElementById('strategies-content').innerHTML = strategies.map(s => `
      <div class="strategy-card">
        <div class="strategy-card-title">${s.name}</div>
        <p class="mb-2">${s.description}</p>
        <div class="strategy-card-meta">
          <span class="me-3"><i class="bi bi-clock"></i> RTO: ${s.rtoHours}h</span>
          <span class="me-3"><i class="bi bi-database"></i> RPO: ${s.rpoHours}h</span>
          <span><i class="bi bi-currency-dollar"></i> Costo est.: $${(s.estimatedCost / 1000000).toFixed(1)}M</span>
        </div>
      </div>
    `).join('');
  } else {
    strategiesCard.style.display = 'none';
  }
  
  // Mostrar y renderizar criterios de activación
  const criteriaCard = document.getElementById('criteria-card');
  const criteria = BCMSDataStore.api.filter('activationCriteria', c => c.planId === planId);
  
  if (criteria.length > 0) {
    criteriaCard.style.display = 'block';
    document.getElementById('criteria-content').innerHTML = `
      <div>
        ${criteria.map(c => `
          <span class="criterion-badge ${c.severity.toLowerCase()}">
            <i class="bi bi-${c.isAutoActivate ? 'lightning' : 'hand-index'}"></i>
            ${c.description}
          </span>
        `).join('')}
      </div>
    `;
  } else {
    criteriaCard.style.display = 'none';
  }
}

/* ============================================================================
   4. CRUD Y FORMULARIOS
   ============================================================================ */

/**
 * Abre el modal genérico para crear/editar
 * @param {string} entityType - Tipo de entidad
 * @param {number} entityId - ID de la entidad (null para crear)
 */
function openModal(entityType, entityId = null) {
  const modal = new bootstrap.Modal(document.getElementById('generic-modal'));
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const saveBtn = document.getElementById('modal-save-btn');
  
  const isEdit = entityId !== null;
  const entity = isEdit ? BCMSDataStore.api.getById(getEntityArrayName(entityType), entityId) : null;
  
  titleEl.textContent = `${isEdit ? 'Editar' : 'Nuevo'} ${getEntityLabel(entityType)}`;
  bodyEl.innerHTML = getModalForm(entityType, entity);
  
  saveBtn.onclick = () => saveEntity(entityType, entityId);
  
  modal.show();
}

/**
 * Obtiene el nombre del array para un tipo de entidad
 */
function getEntityArrayName(entityType) {
  const mapping = {
    'proceso': 'processes',
    'usuario': 'users',
    'riesgo': 'risks',
    'plan': 'continuityPlans',
    'incidente': 'incidents',
    'prueba': 'planTests',
    'auditoria': 'audits',
    'leccion': 'lessonsLearned',
    'cambio': 'bcmsChanges'
  };
  return mapping[entityType] || entityType;
}

/**
 * Obtiene el label para un tipo de entidad
 */
function getEntityLabel(entityType) {
  const labels = {
    'proceso': 'Proceso',
    'usuario': 'Usuario',
    'riesgo': 'Riesgo',
    'plan': 'Plan',
    'incidente': 'Incidente',
    'prueba': 'Prueba',
    'auditoria': 'Auditoría',
    'leccion': 'Lección Aprendida',
    'cambio': 'Cambio BCMS'
  };
  return labels[entityType] || entityType;
}

/**
 * Genera el formulario para el modal
 */
function getModalForm(entityType, entity) {
  switch(entityType) {
    case 'proceso':
      return getProcessForm(entity);
    case 'incidente':
      return getIncidentForm(entity);
    case 'leccion':
      return getLessonForm(entity);
    case 'cambio':
      return getChangeForm(entity);
    default:
      return '<p class="text-muted">Formulario en desarrollo...</p>';
  }
}

/**
 * Formulario de proceso
 */
function getProcessForm(entity) {
  const criticalityOptions = BCMSDataStore.lookups.businessCriticality.map(c => 
    `<option value="${c.code}" ${entity && entity.businessCriticality === c.code ? 'selected' : ''}>${c.label}</option>`
  ).join('');
  
  return `
    <form id="entity-form">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Código</label>
          <input type="text" class="form-control" name="code" value="${entity?.code || ''}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" name="name" value="${entity?.name || ''}" required>
        </div>
        <div class="col-12">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" name="description" rows="2">${entity?.description || ''}</textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label">Criticidad</label>
          <select class="form-select" name="businessCriticality" required>
            ${criticalityOptions}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Responsable</label>
          <input type="text" class="form-control" name="owner" value="${entity?.owner || ''}">
        </div>
        <div class="col-md-3">
          <label class="form-label">RTO (min)</label>
          <input type="number" class="form-control" name="targetRtoMinutes" value="${entity?.targetRtoMinutes || 240}">
        </div>
        <div class="col-md-3">
          <label class="form-label">RPO (min)</label>
          <input type="number" class="form-control" name="targetRpoMinutes" value="${entity?.targetRpoMinutes || 60}">
        </div>
        <div class="col-md-3">
          <label class="form-label">MTPD (min)</label>
          <input type="number" class="form-control" name="mtpdMinutes" value="${entity?.mtpdMinutes || 480}">
        </div>
        <div class="col-md-3">
          <label class="form-label">MBCO (%)</label>
          <input type="number" class="form-control" name="mbcoPercent" value="${entity?.mbcoPercent || 50}" min="0" max="100">
        </div>
      </div>
    </form>
  `;
}

/**
 * Formulario de incidente
 */
function getIncidentForm(entity) {
  const severityOptions = BCMSDataStore.lookups.incidentSeverity.map(s => 
    `<option value="${s.code}" ${entity && entity.severity === s.code ? 'selected' : ''}>${s.label}</option>`
  ).join('');
  
  return `
    <form id="entity-form">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Título</label>
          <input type="text" class="form-control" name="title" value="${entity?.title || ''}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Severidad</label>
          <select class="form-select" name="severity" required>
            ${severityOptions}
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" name="description" rows="3" required>${entity?.description || ''}</textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <select class="form-select" name="type">
            <option value="INFRASTRUCTURE">Infraestructura</option>
            <option value="SECURITY">Seguridad</option>
            <option value="APPLICATION">Aplicación</option>
            <option value="PROCESS">Proceso</option>
            <option value="EXTERNAL">Externo</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Proceso Afectado</label>
          <select class="form-select" name="affectedProcessId">
            <option value="">Ninguno</option>
            ${BCMSDataStore.api.getAll('processes').map(p => 
              `<option value="${p.id}">${p.name}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    </form>
  `;
}

/**
 * Formulario de lección aprendida
 */
function getLessonForm(entity) {
  const sourceOptions = BCMSDataStore.lookups.lessonSourceType.map(s => 
    `<option value="${s.code}" ${entity && entity.sourceType === s.code ? 'selected' : ''}>${s.label}</option>`
  ).join('');
  
  return `
    <form id="entity-form">
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Título</label>
          <input type="text" class="form-control" name="title" value="${entity?.title || ''}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Origen</label>
          <select class="form-select" name="sourceType" required>
            ${sourceOptions}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Prioridad</label>
          <select class="form-select" name="priority">
            <option value="low">Baja</option>
            <option value="medium" selected>Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" name="description" rows="3">${entity?.description || ''}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label">Recomendaciones</label>
          <textarea class="form-control" name="recommendations" rows="2">${entity?.recommendations || ''}</textarea>
        </div>
      </div>
    </form>
  `;
}

/**
 * Formulario de cambio BCMS
 */
function getChangeForm(entity) {
  const typeOptions = BCMSDataStore.lookups.changeType.map(t => 
    `<option value="${t.code}" ${entity && entity.changeType === t.code ? 'selected' : ''}>${t.label}</option>`
  ).join('');
  
  return `
    <form id="entity-form">
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Título</label>
          <input type="text" class="form-control" name="title" value="${entity?.title || ''}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Tipo de Cambio</label>
          <select class="form-select" name="changeType" required>
            ${typeOptions}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Categoría</label>
          <select class="form-select" name="changeCategory">
            <option value="minor">Menor</option>
            <option value="major">Mayor</option>
            <option value="critical">Crítico</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" name="description" rows="3">${entity?.description || ''}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label">Justificación</label>
          <textarea class="form-control" name="reason" rows="2">${entity?.reason || ''}</textarea>
        </div>
      </div>
    </form>
  `;
}

/**
 * Guarda la entidad (crear o actualizar)
 */
function saveEntity(entityType, entityId) {
  const form = document.getElementById('entity-form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  const arrayName = getEntityArrayName(entityType);
  
  if (entityId) {
    BCMSDataStore.api.update(arrayName, entityId, data);
    showToast(`${getEntityLabel(entityType)} actualizado correctamente`, 'success');
  } else {
    BCMSDataStore.api.create(arrayName, data);
    showToast(`${getEntityLabel(entityType)} creado correctamente`, 'success');
  }
  
  // Cerrar modal
  bootstrap.Modal.getInstance(document.getElementById('generic-modal')).hide();
  
  // Refrescar tabla correspondiente
  renderAllTables();
}

/* ============================================================================
   5. FILTROS Y BÚSQUEDA
   ============================================================================ */

/**
 * Filtra una tabla por texto
 */
function filterTable(tableId, searchText) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const rows = table.querySelectorAll('tbody tr');
  const text = searchText.toLowerCase();
  
  rows.forEach(row => {
    const content = row.textContent.toLowerCase();
    row.style.display = content.includes(text) ? '' : 'none';
  });
}

/**
 * Filtra la tabla de riesgos por dominio
 */
function filterRisks() {
  const domain = document.getElementById('filter-risk-domain').value;
  const rows = document.querySelectorAll('#table-riesgos tbody tr');
  
  rows.forEach(row => {
    if (!domain) {
      row.style.display = '';
    } else {
      const domainCell = row.cells[2].textContent;
      row.style.display = domainCell.includes(BCMSDataStore.api.getLookupLabel('riskDomain', domain)) ? '' : 'none';
    }
  });
}

/* ============================================================================
   6. UTILIDADES
   ============================================================================ */

/**
 * Formatea minutos a formato legible
 */
function formatMinutesToTime(minutes) {
  if (!minutes) return '-';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
  return `${(minutes / 1440).toFixed(1)} días`;
}

/**
 * Formatea fecha ISO a formato legible
 */
function formatDate(isoDate) {
  if (!isoDate) return '-';
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Obtiene clase de badge según score de riesgo
 */
function getRiskScoreBadgeClass(score) {
  if (score >= 15) return 'bg-danger';
  if (score >= 9) return 'bg-warning text-dark';
  if (score >= 4) return 'bg-info';
  return 'bg-success';
}

/**
 * Obtiene clase de badge según estado de incidente
 */
function getIncidentStatusBadgeClass(status) {
  const mapping = {
    'REPORTED': 'bg-secondary',
    'ACKNOWLEDGED': 'bg-info',
    'IN_PROGRESS': 'bg-warning text-dark',
    'ESCALATED': 'bg-danger',
    'RESOLVED': 'bg-success',
    'CLOSED': 'bg-dark'
  };
  return mapping[status] || 'bg-secondary';
}

/**
 * Obtiene clase de badge según tipo de hallazgo
 */
function getFindingTypeBadgeClass(type) {
  const mapping = {
    'NC_MAJOR': 'bg-danger',
    'NC_MINOR': 'bg-warning text-dark',
    'OBSERVATION': 'bg-info',
    'OPPORTUNITY': 'bg-primary',
    'POSITIVE': 'bg-success'
  };
  return mapping[type] || 'bg-secondary';
}

/**
 * Obtiene clase de badge según prioridad
 */
function getPriorityBadgeClass(priority) {
  const mapping = {
    'critical': 'bg-danger',
    'high': 'bg-warning text-dark',
    'medium': 'bg-info',
    'low': 'bg-success'
  };
  return mapping[priority] || 'bg-secondary';
}

/**
 * Obtiene clase de badge según estado de lección
 */
function getLessonStatusBadgeClass(status) {
  const mapping = {
    'identified': 'bg-secondary',
    'in_progress': 'bg-warning text-dark',
    'implemented': 'bg-info',
    'validated': 'bg-success',
    'closed': 'bg-dark'
  };
  return mapping[status] || 'bg-secondary';
}

/**
 * Obtiene clase de badge según estado de cambio
 */
function getChangeStatusBadgeClass(status) {
  const mapping = {
    'pending': 'bg-secondary',
    'approved': 'bg-success',
    'in_progress': 'bg-warning text-dark',
    'implemented': 'bg-info',
    'rejected': 'bg-danger',
    'cancelled': 'bg-dark'
  };
  return mapping[status] || 'bg-secondary';
}

/* ============================================================================
   7. ALERTAS Y NOTIFICACIONES
   ============================================================================ */

/**
 * Muestra un toast de notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: success, danger, warning, info
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const toastId = `toast-${Date.now()}`;
  const bgClass = {
    'success': 'bg-success',
    'danger': 'bg-danger',
    'warning': 'bg-warning',
    'info': 'bg-info'
  }[type] || 'bg-info';
  
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} text-white border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', toastHtml);
  
  const toastEl = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/**
 * Guarda la configuración
 */
function saveConfig() {
  const config = {
    rto: document.getElementById('config-rto').value,
    rpo: document.getElementById('config-rpo').value,
    mtpd: document.getElementById('config-mtpd').value
  };
  
  localStorage.setItem('bcms_config', JSON.stringify(config));
  showToast('Configuración guardada', 'success');
}

/**
 * Carga la configuración guardada
 */
function loadSavedConfig() {
  const saved = localStorage.getItem('bcms_config');
  if (saved) {
    const config = JSON.parse(saved);
    if (document.getElementById('config-rto')) {
      document.getElementById('config-rto').value = config.rto || 24;
      document.getElementById('config-rpo').value = config.rpo || 4;
      document.getElementById('config-mtpd').value = config.mtpd || 72;
    }
  }
}

// Placeholders para funciones de vista detalle
function viewProcess(id) { showToast(`Ver proceso ${id}`, 'info'); }
function editProcess(id) { openModal('proceso', id); }
function viewRisk(id) { showToast(`Ver riesgo ${id}`, 'info'); }
function viewIncident(id) { showToast(`Ver incidente ${id}`, 'info'); }
function viewTest(id) { showToast(`Ver prueba ${id}`, 'info'); }
function viewAudit(id) { showToast(`Ver auditoría ${id}`, 'info'); }
function viewLesson(id) { showToast(`Ver lección ${id}`, 'info'); }
function viewChange(id) { showToast(`Ver cambio ${id}`, 'info'); }
function editUser(id) { openModal('usuario', id); }
function editBIA() { showToast('Editar BIA', 'info'); }

/* ============================================================================
   MODAL CONFIGURACIÓN MATRIZ DE RIESGO
   ============================================================================ */

/**
 * Abre el modal de configuración de la matriz de riesgo
 */
function openConfigMatrixModal() {
  const modal = document.getElementById('modal-config-matrix');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }
}

/**
 * Cierra el modal de configuración de la matriz de riesgo
 */
function closeConfigMatrixModal() {
  const modal = document.getElementById('modal-config-matrix');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restaurar scroll
  }
}

/**
 * Abre el modal de configuración de riesgos por unidad
 */
function openConfigRiesgosModal() {
  showToast('Configuración de unidades - Próximamente', 'info');
  // TODO: Implementar modal con checkboxes para seleccionar/ordenar unidades
}

/**
 * Estado del carrusel de riesgos (infinito)
 */
let riesgosCarouselState = {
  currentIndex: 0,
  totalItems: 0,
  visibleItems: 4,
  itemWidth: 136, // 120px card + 16px gap
  isAnimating: false
};

/**
 * Mueve el carrusel de riesgos con animación suave (loop infinito)
 * @param {number} direction - 1 para adelante, -1 para atrás
 */
function moveRiesgosCarousel(direction) {
  const track = document.getElementById('riesgos-multi-donut');
  if (!track || riesgosCarouselState.isAnimating) return;
  
  const items = Array.from(track.querySelectorAll('.riesgo-unit-card'));
  if (items.length <= riesgosCarouselState.visibleItems) return;
  
  riesgosCarouselState.isAnimating = true;
  
  // Calcular desplazamiento
  const moveDistance = riesgosCarouselState.itemWidth * direction;
  
  // Aplicar transición CSS
  track.style.transition = 'transform 0.35s ease-out';
  track.style.transform = `translateX(${-moveDistance}px)`;
  
  // Después de la animación, mover el elemento DOM y resetear
  setTimeout(() => {
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    
    if (direction === 1) {
      // Avanzar: mover el primer elemento al final
      const firstItem = items[0];
      track.appendChild(firstItem);
    } else {
      // Retroceder: mover el último elemento al inicio
      const lastItem = items[items.length - 1];
      track.insertBefore(lastItem, items[0]);
    }
    
    riesgosCarouselState.isAnimating = false;
  }, 350);
}

/**
 * Actualiza el estado habilitado/deshabilitado de los botones del carrusel
 * En modo infinito, los botones siempre están habilitados
 */
function updateCarouselButtons() {
  // En loop infinito, siempre habilitados
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  
  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;
}

/**
 * Inicializa el carrusel después de renderizar los riesgos
 */
function initRiesgosCarousel() {
  const track = document.getElementById('riesgos-multi-donut');
  if (!track) return;
  
  const items = track.querySelectorAll('.riesgo-unit-card');
  riesgosCarouselState.totalItems = items.length;
  riesgosCarouselState.currentIndex = 0;
  
  updateCarouselButtons();
}

/**
 * Inicializa el event listener para el botón de configuración de matriz
 */
function initConfigMatrixButton() {
  const btn = document.getElementById('btn-config-matrix');
  if (btn) {
    btn.addEventListener('click', openConfigMatrixModal);
  }
  
  // Cerrar modal al hacer clic fuera
  const modal = document.getElementById('modal-config-matrix');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeConfigMatrixModal();
      }
    });
  }
}

// Llamar después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', initConfigMatrixButton);

/* ============================================================================
   FUNCIONES ESPECÍFICAS DE VISTAS
   ============================================================================ */

/**
 * Muestra un tab específico en la vista Normativas & Plantillas
 * @param {string} tabName - Nombre del tab (editor, biblioteca)
 */
function showNormativasTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.normativas-tab').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Mostrar el tab seleccionado
  const selectedTab = document.getElementById(`normativas-tab-${tabName}`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // Si es el tab editor, renderizar frameworks
  if (tabName === 'editor') {
    renderEditorFrameworks();
  }
  
  // Actualizar botones activos
  const container = document.querySelector('#view-normativas-plantillas > div:first-child');
  if (container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const buttons = container.querySelectorAll('.tab-btn');
    const tabIndex = { 'editor': 0, 'biblioteca': 1 };
    if (buttons[tabIndex[tabName]]) {
      buttons[tabIndex[tabName]].classList.add('active');
    }
  }
}

/**
 * Renderiza el árbol de frameworks en el sidebar del Editor
 */
function renderEditorFrameworks() {
  const container = document.getElementById('editor-tree-container');
  if (!container) return;
  
  const frameworks = [
    { id: 'iso22301', nombre: 'ISO 22301:2019', estado: 'Activo', icon: '🟢' },
    { id: 'ley21663', nombre: 'Ley 21.663 (Chile)', estado: 'Activo', icon: '🟢' },
    { id: 'iso27001', nombre: 'ISO 27001:2022', estado: 'En Configuración', icon: '🟡' },
    { id: 'nist', nombre: 'NIST CSF 2.0', estado: 'Disponible', icon: '🔵' },
    { id: 'iso31000', nombre: 'ISO 31000:2018', estado: 'Disponible', icon: '🔵' }
  ];
  
  let html = '<div class="tree-view">';
  
  frameworks.forEach(fw => {
    html += `
      <div class="tree-node tree-node-framework" data-level="0">
        <div class="tree-node-content" onclick="toggleTreeNode('tree-${fw.id}', 'framework', '${fw.id}')">
          <i class="bi bi-chevron-right tree-chevron" id="tree-${fw.id}-chevron"></i>
          <span class="tree-icon">${fw.icon}</span>
          <span class="tree-label">${fw.nombre}</span>
        </div>
        <div id="tree-${fw.id}-children" class="tree-children" style="display: none;">
          <!-- Los dominios se cargarán aquí -->
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Toggle de un nodo en el árbol del editor
 * @param {string} nodeId - ID del nodo
 * @param {string} type - Tipo: 'framework', 'dominio', 'categoria'
 * @param {string} dataKey - Key de los datos
 */
function toggleTreeNode(nodeId, type, dataKey) {
  const childrenContainer = document.getElementById(`${nodeId}-children`);
  const chevron = document.getElementById(`${nodeId}-chevron`);
  
  if (!childrenContainer) return;
  
  if (childrenContainer.style.display === 'none') {
    // Expandir
    childrenContainer.style.display = 'block';
    chevron.className = 'bi bi-chevron-down tree-chevron';
    
    // Cargar hijos si no están cargados
    if (childrenContainer.innerHTML.trim() === '' || childrenContainer.innerHTML.includes('cargarán')) {
      if (type === 'framework') {
        loadFrameworkDominios(nodeId, dataKey);
      } else if (type === 'dominio') {
        loadDominioCategorias(nodeId, dataKey);
      } else if (type === 'categoria') {
        loadCategoriaControles(nodeId, dataKey);
      }
    }
  } else {
    // Colapsar
    childrenContainer.style.display = 'none';
    chevron.className = 'bi bi-chevron-right tree-chevron';
  }
  
  // Mostrar contenido en panel derecho
  showEditorContentPanel(type, dataKey);
}

/**
 * Carga los dominios de un framework en el árbol
 * @param {string} nodeId - ID del nodo framework
 * @param {string} frameworkKey - Key del framework
 */
function loadFrameworkDominios(nodeId, frameworkKey) {
  const container = document.getElementById(`${nodeId}-children`);
  if (!container) return;
  
  const dominiosPorFramework = {
    'iso22301': [
      { codigo: '4.1', nombre: 'Contexto de la Organización' },
      { codigo: '5.1', nombre: 'Liderazgo' },
      { codigo: '6.1', nombre: 'Planificación' },
      { codigo: '8.2', nombre: 'Análisis de Impacto (BIA)' },
      { codigo: '8.3', nombre: 'Evaluación de Riesgos' },
      { codigo: '8.4', nombre: 'Estrategias de Continuidad' },
      { codigo: '9.1', nombre: 'Evaluación del Desempeño' },
      { codigo: '10.1', nombre: 'Mejora Continua' }
    ],
    'ley21663': [
      { codigo: 'A1', nombre: 'Gobierno de Ciberseguridad' },
      { codigo: 'A2', nombre: 'Gestión de Riesgos Ciber' },
      { codigo: 'A3', nombre: 'Protección de Activos' },
      { codigo: 'A4', nombre: 'Respuesta a Incidentes' },
      { codigo: 'A5', nombre: 'Continuidad Operacional' }
    ],
    'iso27001': [
      { codigo: 'A.5', nombre: 'Políticas de Seguridad' },
      { codigo: 'A.6', nombre: 'Organización de Seguridad' },
      { codigo: 'A.7', nombre: 'Seguridad RRHH' },
      { codigo: 'A.8', nombre: 'Gestión de Activos' }
    ],
    'nist': [
      { codigo: 'ID', nombre: 'Identify (Identificar)' },
      { codigo: 'PR', nombre: 'Protect (Proteger)' },
      { codigo: 'DE', nombre: 'Detect (Detectar)' },
      { codigo: 'RS', nombre: 'Respond (Responder)' },
      { codigo: 'RC', nombre: 'Recover (Recuperar)' },
      { codigo: 'GV', nombre: 'Govern (Gobernar)' }
    ],
    'iso31000': [
      { codigo: '1', nombre: 'Principios' },
      { codigo: '2', nombre: 'Marco de Trabajo' },
      { codigo: '3', nombre: 'Proceso de Gestión' },
      { codigo: '4', nombre: 'Evaluación de Riesgos' },
      { codigo: '5', nombre: 'Tratamiento de Riesgos' }
    ]
  };
  
  const dominios = dominiosPorFramework[frameworkKey] || [];
  
  let html = '';
  dominios.forEach((dom, idx) => {
    const domId = `${nodeId}-dom-${idx}`;
    html += `
      <div class="tree-node tree-node-dominio" data-level="1">
        <div class="tree-node-content" onclick="toggleTreeNode('${domId}', 'dominio', '${frameworkKey}-${idx}')">
          <i class="bi bi-chevron-right tree-chevron" id="${domId}-chevron"></i>
          <span class="tree-icon"><i class="bi bi-folder" style="color: #3b82f6;"></i></span>
          <span class="tree-label"><strong>${dom.codigo}</strong> ${dom.nombre}</span>
        </div>
        <div id="${domId}-children" class="tree-children" style="display: none;">
          <!-- Las categorías se cargarán aquí -->
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Carga las categorías de un dominio en el árbol
 * @param {string} nodeId - ID del nodo dominio
 * @param {string} dominioKey - Key del dominio
 */
function loadDominioCategorias(nodeId, dominioKey) {
  const container = document.getElementById(`${nodeId}-children`);
  if (!container) return;
  
  const categoriasPorDominio = {
    'iso22301-0': [
      { codigo: '4.1.1', nombre: 'Comprensión de la organización' },
      { codigo: '4.1.2', nombre: 'Partes interesadas' }
    ],
    'iso22301-3': [
      { codigo: '8.2.1', nombre: 'Identificación de Procesos' },
      { codigo: '8.2.2', nombre: 'Análisis de Dependencias' },
      { codigo: '8.2.3', nombre: 'Cálculo de RTO/RPO' }
    ],
    'ley21663-0': [
      { codigo: 'A1.1', nombre: 'Comité de Ciberseguridad' },
      { codigo: 'A1.2', nombre: 'Política de Ciberseguridad' }
    ],
    'nist-0': [
      { codigo: 'ID.AM', nombre: 'Asset Management' },
      { codigo: 'ID.BE', nombre: 'Business Environment' }
    ]
  };
  
  const categorias = categoriasPorDominio[dominioKey] || [
    { codigo: '1.1', nombre: 'Categoría ejemplo 1' },
    { codigo: '1.2', nombre: 'Categoría ejemplo 2' }
  ];
  
  let html = '';
  categorias.forEach((cat, idx) => {
    const catId = `${nodeId}-cat-${idx}`;
    html += `
      <div class="tree-node tree-node-categoria" data-level="2">
        <div class="tree-node-content" onclick="toggleTreeNode('${catId}', 'categoria', '${dominioKey}-${idx}')">
          <i class="bi bi-chevron-right tree-chevron" id="${catId}-chevron"></i>
          <span class="tree-icon"><i class="bi bi-layers" style="color: #10b981;"></i></span>
          <span class="tree-label">${cat.codigo} ${cat.nombre}</span>
        </div>
        <div id="${catId}-children" class="tree-children" style="display: none;">
          <!-- Los controles se cargarán aquí -->
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Carga los controles de una categoría en el árbol
 * @param {string} nodeId - ID del nodo categoría
 * @param {string} categoriaKey - Key de la categoría
 */
function loadCategoriaControles(nodeId, categoriaKey) {
  const container = document.getElementById(`${nodeId}-children`);
  if (!container) return;
  
  const controles = [
    { codigo: 'CTRL-001', nombre: 'Control de implementación' },
    { codigo: 'CTRL-002', nombre: 'Control de verificación' },
    { codigo: 'CTRL-003', nombre: 'Control de monitoreo' }
  ];
  
  let html = '';
  controles.forEach((ctrl, idx) => {
    html += `
      <div class="tree-node tree-node-control" data-level="3">
        <div class="tree-node-content tree-node-leaf" onclick="showEditorContentPanel('control', '${categoriaKey}-${idx}')">
          <span class="tree-icon"><i class="bi bi-shield-shaded" style="color: #f59e0b;"></i></span>
          <span class="tree-label">${ctrl.codigo} ${ctrl.nombre}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Muestra el contenido correspondiente en el panel derecho
 * @param {string} type - Tipo de elemento seleccionado
 * @param {string} dataKey - Key de los datos
 */
function showEditorContentPanel(type, dataKey) {
  const panel = document.getElementById('editor-content-panel');
  if (!panel) return;
  
  let html = '';
  
  if (type === 'framework') {
    html = `
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 8px;">
            <i class="bi bi-diagram-3"></i> Framework: ISO 22301:2019
          </h3>
          <div style="font-size: 12px; color: var(--text-muted);">Sistemas de gestión de la continuidad del negocio</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 3px solid #10b981;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Dominios</div>
            <div style="font-size: 24px; font-weight: 700;">8</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 3px solid #3b82f6;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Categorías</div>
            <div style="font-size: 24px; font-weight: 700;">24</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 3px solid #f59e0b;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Controles</div>
            <div style="font-size: 24px; font-weight: 700;">67</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 24px;">
          <button class="btn btn-primary">
            <i class="bi bi-plus"></i> Añadir Dominio
          </button>
          <button class="btn btn-secondary">
            <i class="bi bi-pencil"></i> Editar Framework
          </button>
          <button class="btn btn-outline">
            <i class="bi bi-box-arrow-up-right"></i> Exportar
          </button>
        </div>
        
        <div style="background: #dbeafe; border-left: 3px solid #3b82f6; padding: 16px; border-radius: 4px;">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">
            <i class="bi bi-info-circle"></i> Información del Framework
          </div>
          <div style="font-size: 11px; line-height: 1.6;">
            <strong>Estado:</strong> Activo<br>
            <strong>Versión:</strong> 2019<br>
            <strong>Última modificación:</strong> 15/01/2025<br>
            <strong>Implementación:</strong> 85%
          </div>
        </div>
      </div>
    `;
  } else if (type === 'dominio') {
    html = `
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">
            <i class="bi bi-diagram-3"></i> ISO 22301:2019
          </div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">
            <i class="bi bi-folder"></i> Dominio: 8.2 Análisis de Impacto (BIA)
          </h3>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Categorías</div>
            <div style="font-size: 24px; font-weight: 700;">5</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Controles</div>
            <div style="font-size: 24px; font-weight: 700;">15</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 24px;">
          <button class="btn btn-primary">
            <i class="bi bi-plus"></i> Añadir Categoría
          </button>
          <button class="btn btn-secondary">
            <i class="bi bi-pencil"></i> Editar Dominio
          </button>
          <button class="btn btn-outline" style="color: var(--accent-danger);">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
        
        <div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; border-radius: 4px;">
          <div style="font-size: 11px; line-height: 1.6;">
            <strong>Descripción:</strong> Este dominio define los requisitos para realizar análisis de impacto del negocio, identificando procesos críticos, dependencias y objetivos de recuperación.
          </div>
        </div>
      </div>
    `;
  } else if (type === 'categoria') {
    html = `
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">
            <i class="bi bi-diagram-3"></i> ISO 22301:2019 > 8.2 BIA
          </div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">
            <i class="bi bi-layers"></i> Categoría: 8.2.1 Identificación de Procesos
          </h3>
        </div>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Controles</div>
          <div style="font-size: 24px; font-weight: 700;">5</div>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 24px;">
          <button class="btn btn-primary">
            <i class="bi bi-plus"></i> Añadir Control
          </button>
          <button class="btn btn-secondary">
            <i class="bi bi-pencil"></i> Editar Categoría
          </button>
          <button class="btn btn-outline" style="color: var(--accent-danger);">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
        
        <div style="background: #d1fae5; border-left: 3px solid #10b981; padding: 16px; border-radius: 4px;">
          <div style="font-size: 11px; line-height: 1.6;">
            <strong>Objetivo:</strong> Identificar y documentar todos los procesos críticos del negocio que deben ser considerados en el BCMS.
          </div>
        </div>
      </div>
    `;
  } else if (type === 'control') {
    html = `
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">
            <i class="bi bi-diagram-3"></i> ISO 22301:2019 > 8.2 BIA > 8.2.1 Identificación
          </div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">
            <i class="bi bi-shield-shaded"></i> Control: CTRL-001
          </h3>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 16px;">Control de implementación</div>
        </div>
        
        <div style="margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">Descripción</div>
          <div style="font-size: 12px; line-height: 1.6; color: var(--text-muted);">
            Este control verifica que la organización haya identificado correctamente todos los procesos críticos del negocio y haya documentado sus características principales.
          </div>
        </div>
        
        <div style="margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">Estado de Implementación</div>
          <span class="badge badge-success">Implementado</span>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 24px;">
          <button class="btn btn-secondary">
            <i class="bi bi-pencil"></i> Editar Control
          </button>
          <button class="btn btn-outline">
            <i class="bi bi-link-45deg"></i> Ver Evidencias
          </button>
          <button class="btn btn-outline" style="color: var(--accent-danger);">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
        
        <div style="background: #f1f5f9; padding: 16px; border-radius: 4px;">
          <div style="font-size: 11px; line-height: 1.6;">
            <strong>Última evaluación:</strong> 10/01/2025<br>
            <strong>Responsable:</strong> BCM Officer<br>
            <strong>Frecuencia de revisión:</strong> Trimestral
          </div>
        </div>
      </div>
    `;
  }
  
  panel.innerHTML = html;
}

/**
 * Renderiza los dominios de un framework
 * @param {string} fwId - ID del framework
 * @param {string} frameworkKey - Key del framework
 */
function renderDominiosDelFramework(fwId, frameworkKey) {
  const content = document.getElementById(`${fwId}-content`);
  if (!content) return;
  
  // Reutilizamos los mismos datos que en la Biblioteca
  const dominiosPorFramework = {
    'iso22301': [
      { codigo: '4.1', nombre: 'Contexto de la Organización', categorias: 2, controles: 6 },
      { codigo: '5.1', nombre: 'Liderazgo', categorias: 3, controles: 8 },
      { codigo: '6.1', nombre: 'Planificación', categorias: 4, controles: 12 },
      { codigo: '8.2', nombre: 'Análisis de Impacto (BIA)', categorias: 5, controles: 15 },
      { codigo: '8.3', nombre: 'Evaluación de Riesgos', categorias: 4, controles: 11 },
      { codigo: '8.4', nombre: 'Estrategias de Continuidad', categorias: 3, controles: 9 },
      { codigo: '9.1', nombre: 'Evaluación del Desempeño', categorias: 2, controles: 5 },
      { codigo: '10.1', nombre: 'Mejora Continua', categorias: 1, controles: 3 }
    ],
    'ley21663': [
      { codigo: 'A1', nombre: 'Gobierno de Ciberseguridad', categorias: 3, controles: 8 },
      { codigo: 'A2', nombre: 'Gestión de Riesgos Ciber', categorias: 4, controles: 12 },
      { codigo: 'A3', nombre: 'Protección de Activos', categorias: 5, controles: 10 },
      { codigo: 'A4', nombre: 'Respuesta a Incidentes', categorias: 3, controles: 7 },
      { codigo: 'A5', nombre: 'Continuidad Operacional', categorias: 2, controles: 5 }
    ],
    'iso27001': [
      { codigo: 'A.5', nombre: 'Políticas de Seguridad', categorias: 2, controles: 2 },
      { codigo: 'A.6', nombre: 'Organización de Seguridad', categorias: 7, controles: 7 },
      { codigo: 'A.7', nombre: 'Seguridad RRHH', categorias: 6, controles: 6 },
      { codigo: 'A.8', nombre: 'Gestión de Activos', categorias: 10, controles: 10 }
    ],
    'nist': [
      { codigo: 'ID', nombre: 'Identify (Identificar)', categorias: 6, controles: 23 },
      { codigo: 'PR', nombre: 'Protect (Proteger)', categorias: 6, controles: 24 },
      { codigo: 'DE', nombre: 'Detect (Detectar)', categorias: 3, controles: 13 },
      { codigo: 'RS', nombre: 'Respond (Responder)', categorias: 5, controles: 16 },
      { codigo: 'RC', nombre: 'Recover (Recuperar)', categorias: 4, controles: 14 },
      { codigo: 'GV', nombre: 'Govern (Gobernar)', categorias: 6, controles: 8 }
    ],
    'iso31000': [
      { codigo: '1', nombre: 'Principios', categorias: 2, controles: 8 },
      { codigo: '2', nombre: 'Marco de Trabajo', categorias: 3, controles: 6 },
      { codigo: '3', nombre: 'Proceso de Gestión', categorias: 4, controles: 12 },
      { codigo: '4', nombre: 'Evaluación de Riesgos', categorias: 3, controles: 6 },
      { codigo: '5', nombre: 'Tratamiento de Riesgos', categorias: 2, controles: 3 }
    ]
  };
  
  const dominios = dominiosPorFramework[frameworkKey] || [];
  
  let html = `
    <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
      <i class="bi bi-folder"></i> Dominios del Framework (${dominios.length})
      <button class="btn btn-primary btn-sm" style="margin-left: auto;" onclick="showToast('Añadir dominio en desarrollo', 'info')">
        <i class="bi bi-plus"></i> Añadir Dominio
      </button>
    </h4>
    <table>
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="width: 15%;">Código</th>
          <th style="width: 40%;">Dominio</th>
          <th style="width: 12%;">Categorías</th>
          <th style="width: 12%;">Controles</th>
          <th style="width: 21%;">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  dominios.forEach((dom, domIdx) => {
    const domId = `${fwId}-dom-${domIdx}`;
    html += `
      <tr id="${domId}" style="background: white;">
        <td><span class="badge badge-neutral">${dom.codigo}</span></td>
        <td><strong>${dom.nombre}</strong></td>
        <td>${dom.categorias}</td>
        <td>${dom.controles}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleEditorDominioDetalle('${domId}', '${frameworkKey}', ${domIdx})">
            <i class="bi bi-chevron-down" id="${domId}-icon"></i> Ver
          </button>
          <button class="btn btn-outline btn-sm">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline btn-sm" style="color: var(--accent-danger);">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
      <tr id="${domId}-detalle" style="display: none;">
        <td colspan="5" style="padding: 0; background: #fafafa;">
          <div style="padding: 16px; border-left: 3px solid var(--accent-primary);">
            <div id="${domId}-content">
              <!-- Las categorías se cargarán aquí -->
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  content.innerHTML = html;
}

/**
 * Toggle del detalle de un dominio en el editor
 * @param {string} domId - ID del dominio
 * @param {string} frameworkKey - Key del framework
 * @param {number} domIdx - Índice del dominio
 */
function toggleEditorDominioDetalle(domId, frameworkKey, domIdx) {
  const detalleRow = document.getElementById(`${domId}-detalle`);
  const icon = document.getElementById(`${domId}-icon`);
  const content = document.getElementById(`${domId}-content`);
  
  if (detalleRow.style.display === 'none') {
    // Mostrar detalle
    detalleRow.style.display = 'table-row';
    icon.className = 'bi bi-chevron-up';
    
    // Cargar categorías si no están cargadas
    if (content.innerHTML.trim() === '' || content.innerHTML.includes('categorías se cargarán')) {
      renderCategoriasEditor(domId, frameworkKey, domIdx);
    }
  } else {
    // Ocultar detalle
    detalleRow.style.display = 'none';
    icon.className = 'bi bi-chevron-down';
  }
}

/**
 * Renderiza las categorías de un dominio en el editor
 * @param {string} domId - ID del dominio
 * @param {string} frameworkKey - Key del framework
 * @param {number} domIdx - Índice del dominio
 */
function renderCategoriasEditor(domId, frameworkKey, domIdx) {
  const content = document.getElementById(`${domId}-content`);
  if (!content) return;
  
  // Categorías de ejemplo (mismas que en la biblioteca)
  const categoriasPorDominio = {
    'iso22301-0': [
      { codigo: '4.1.1', nombre: 'Comprensión de la organización y su contexto', controles: 3 },
      { codigo: '4.1.2', nombre: 'Partes interesadas y requisitos', controles: 3 }
    ],
    'iso22301-3': [
      { codigo: '8.2.1', nombre: 'Identificación de Procesos Críticos', controles: 5 },
      { codigo: '8.2.2', nombre: 'Análisis de Dependencias', controles: 4 },
      { codigo: '8.2.3', nombre: 'Cálculo de RTO/RPO', controles: 3 },
      { codigo: '8.2.4', nombre: 'Evaluación de Impacto Financiero', controles: 2 },
      { codigo: '8.2.5', nombre: 'Impacto Reputacional y Legal', controles: 1 }
    ],
    'ley21663-0': [
      { codigo: 'A1.1', nombre: 'Comité de Ciberseguridad', controles: 3 },
      { codigo: 'A1.2', nombre: 'Política de Ciberseguridad', controles: 3 },
      { codigo: 'A1.3', nombre: 'Marco de Gobierno', controles: 2 }
    ],
    'nist-0': [
      { codigo: 'ID.AM', nombre: 'Asset Management', controles: 6 },
      { codigo: 'ID.BE', nombre: 'Business Environment', controles: 5 },
      { codigo: 'ID.GV', nombre: 'Governance', controles: 6 }
    ]
  };
  
  const catKey = `${frameworkKey}-${domIdx}`;
  const categorias = categoriasPorDominio[catKey] || [
    { codigo: `${domIdx}.1`, nombre: 'Categoría ejemplo 1', controles: 3 },
    { codigo: `${domIdx}.2`, nombre: 'Categoría ejemplo 2', controles: 2 }
  ];
  
  let html = `
    <h4 style="font-size: 12px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
      <i class="bi bi-layers"></i> Categorías (${categorias.length})
      <button class="btn btn-secondary btn-sm" style="margin-left: auto; font-size: 10px;" onclick="showToast('Añadir categoría en desarrollo', 'info')">
        <i class="bi bi-plus"></i> Añadir
      </button>
    </h4>
    <table style="margin: 0; font-size: 12px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="width: 15%;">Código</th>
          <th style="width: 45%;">Categoría</th>
          <th style="width: 12%;">Controles</th>
          <th style="width: 28%;">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  categorias.forEach((cat, catIdx) => {
    const catId = `${domId}-cat-${catIdx}`;
    html += `
      <tr id="${catId}" style="background: white;">
        <td><span class="badge badge-info">${cat.codigo}</span></td>
        <td><strong>${cat.nombre}</strong></td>
        <td>${cat.controles}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleEditorCategoriaDetalle('${catId}', ${catIdx})">
            <i class="bi bi-chevron-down" id="${catId}-icon"></i> Ver
          </button>
          <button class="btn btn-outline btn-sm">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline btn-sm" style="color: var(--accent-danger);">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
      <tr id="${catId}-detalle" style="display: none;">
        <td colspan="4" style="padding: 0; background: #f9fafb;">
          <div style="padding: 12px; border-left: 2px solid var(--accent-secondary);">
            <div id="${catId}-content">
              <!-- Los controles se cargarán aquí -->
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  content.innerHTML = html;
}

/**
 * Toggle del detalle de una categoría en el editor
 * @param {string} catId - ID de la categoría
 * @param {number} catIdx - Índice de la categoría
 */
function toggleEditorCategoriaDetalle(catId, catIdx) {
  const detalleRow = document.getElementById(`${catId}-detalle`);
  const icon = document.getElementById(`${catId}-icon`);
  const content = document.getElementById(`${catId}-content`);
  
  if (detalleRow.style.display === 'none') {
    // Mostrar detalle
    detalleRow.style.display = 'table-row';
    icon.className = 'bi bi-chevron-up';
    
    // Cargar controles si no están cargados
    if (content.innerHTML.trim() === '' || content.innerHTML.includes('controles se cargarán')) {
      renderControlesEditor(catId, catIdx);
    }
  } else {
    // Ocultar detalle
    detalleRow.style.display = 'none';
    icon.className = 'bi bi-chevron-down';
  }
}

/**
 * Renderiza los controles de una categoría en el editor
 * @param {string} catId - ID de la categoría
 * @param {number} catIdx - Índice de la categoría
 */
function renderControlesEditor(catId, catIdx) {
  const content = document.getElementById(`${catId}-content`);
  if (!content) return;
  
  // Controles de ejemplo
  const controles = [
    { codigo: `CTRL-${catIdx + 1}-001`, nombre: 'Control de implementación', descripcion: 'Descripción del control de implementación' },
    { codigo: `CTRL-${catIdx + 1}-002`, nombre: 'Control de verificación', descripcion: 'Verificación periódica del cumplimiento' },
    { codigo: `CTRL-${catIdx + 1}-003`, nombre: 'Control de monitoreo', descripcion: 'Monitoreo continuo de la efectividad' }
  ];
  
  let html = `
    <h4 style="font-size: 11px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
      <i class="bi bi-shield-shaded"></i> Controles (${controles.length})
      <button class="btn btn-secondary btn-sm" style="margin-left: auto; font-size: 9px;" onclick="showToast('Añadir control en desarrollo', 'info')">
        <i class="bi bi-plus"></i> Añadir
      </button>
    </h4>
    <table style="margin: 0; font-size: 11px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="width: 18%;">Código</th>
          <th style="width: 28%;">Control</th>
          <th style="width: 40%;">Descripción</th>
          <th style="width: 14%;">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  controles.forEach(ctrl => {
    html += `
      <tr style="background: white;">
        <td><code style="font-size: 10px;">${ctrl.codigo}</code></td>
        <td><strong>${ctrl.nombre}</strong></td>
        <td style="font-size: 10px; color: var(--text-muted);">${ctrl.descripcion}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="showToast('Editar control en desarrollo', 'info')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline btn-sm" style="color: var(--accent-danger);" onclick="showToast('Eliminar control en desarrollo', 'warning')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  content.innerHTML = html;
}

/**
 * Muestra el detalle de un marco normativo específico
 * @param {string} marcoId - ID del marco (iso22301, iso27001, nist, etc.)
 */
function verDetalleMarco(marcoId) {
  const panel = document.getElementById('detalle-marco-biblioteca');
  if (!panel) return;
  
  // Datos de los marcos (deberían venir del datastore)
  const marcos = {
    'iso22301': {
      nombre: 'ISO 22301:2019',
      descripcion: 'Sistemas de gestión de la continuidad del negocio',
      alcance: 'Continuidad y resiliencia organizacional',
      dominios: 8,
      controles: 67,
      implementacion: 85,
      estado: 'Activo',
      certificadora: 'IRAM Argentina',
      vencimiento: '15-Mar-2026'
    },
    'ley21663': {
      nombre: 'Ley 21.663 (Chile)',
      descripcion: 'Ciberseguridad - Normativa Local',
      alcance: 'Entidades reguladas sector financiero/SaaS',
      dominios: 5,
      controles: 42,
      implementacion: 87,
      estado: 'Activo',
      certificadora: 'CMF Chile',
      vencimiento: 'Vigente'
    },
    'iso27001': {
      nombre: 'ISO 27001:2022',
      descripcion: 'Seguridad de la Información',
      alcance: 'Gestión de seguridad de la información',
      dominios: 4,
      controles: 93,
      implementacion: 45,
      estado: 'En Configuración',
      certificadora: '-',
      vencimiento: '-'
    },
    'nist': {
      nombre: 'NIST CSF 2.0',
      descripcion: 'Cybersecurity Framework',
      alcance: 'Gestión de ciberseguridad organizacional',
      dominios: 6,
      controles: 98,
      implementacion: 0,
      estado: 'Disponible',
      certificadora: '-',
      vencimiento: '-'
    },
    'iso31000': {
      nombre: 'ISO 31000:2018',
      descripcion: 'Gestión de Riesgos',
      alcance: 'Gestión integral de riesgos',
      dominios: 5,
      controles: 35,
      implementacion: 0,
      estado: 'Disponible',
      certificadora: '-',
      vencimiento: '-'
    }
  };
  
  const marco = marcos[marcoId];
  if (!marco) return;
  
  // Actualizar nombre del marco
  const nombreSpan = document.getElementById('detalle-marco-nombre');
  if (nombreSpan) nombreSpan.textContent = marco.nombre;
  
  // Renderizar información general
  const infoContainer = document.getElementById('detalle-marco-info');
  if (infoContainer) {
    infoContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; padding: 8px; background: #f9fafb; border-radius: 4px;">
        <span style="color: var(--text-muted);">Nombre completo:</span>
        <span style="font-weight: 600;">${marco.nombre} - ${marco.descripcion}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px; background: #f9fafb; border-radius: 4px;">
        <span style="color: var(--text-muted);">Alcance:</span>
        <span style="font-weight: 600;">${marco.alcance}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px; background: #f9fafb; border-radius: 4px;">
        <span style="color: var(--text-muted);">Dominios:</span>
        <span style="font-weight: 600;">${marco.dominios} dominios principales</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px; background: #f9fafb; border-radius: 4px;">
        <span style="color: var(--text-muted);">Controles totales:</span>
        <span style="font-weight: 600;">${marco.controles} controles</span>
      </div>
      ${marco.implementacion > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 8px; background: #f9fafb; border-radius: 4px;">
        <span style="color: var(--text-muted);">Implementación:</span>
        <span style="font-weight: 600; color: #10b981;">${marco.implementacion}% completado</span>
      </div>` : ''}
    `;
  }
  
  // Renderizar estado
  const estadoContainer = document.getElementById('detalle-marco-estado');
  if (estadoContainer) {
    let estadoHTML = '';
    
    if (marco.estado === 'Activo') {
      estadoHTML = `
        <div style="padding: 12px; background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #065f46; font-weight: 600;">${marco.estado.toUpperCase()}</div>
          <div style="font-size: 10px; color: #047857; margin-top: 4px;">Marco implementado y en uso</div>
        </div>
        <button class="btn btn-outline btn-sm" style="width: 100%;" onclick="showNormativasTab('editor')">
          <i class="bi bi-pencil"></i> Editar estructura
        </button>
        <button class="btn btn-outline btn-sm" style="width: 100%; color: var(--accent-danger);">
          <i class="bi bi-slash-circle"></i> Desactivar marco
        </button>
      `;
    } else if (marco.estado === 'En Configuración') {
      estadoHTML = `
        <div style="padding: 12px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #92400e; font-weight: 600;">${marco.estado.toUpperCase()}</div>
          <div style="font-size: 10px; color: #78350f; margin-top: 4px;">Importado - ${marco.implementacion}% configurado</div>
        </div>
        <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="showNormativasTab('editor')">
          <i class="bi bi-pencil"></i> Continuar configuración
        </button>
        <button class="btn btn-outline btn-sm" style="width: 100%; color: var(--accent-danger);">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      `;
    } else { // Disponible
      estadoHTML = `
        <div style="padding: 12px; background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #1e40af; font-weight: 600;">${marco.estado.toUpperCase()}</div>
          <div style="font-size: 10px; color: #1e3a8a; margin-top: 4px;">Plantilla lista para importar</div>
        </div>
        <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="importarPlantilla('${marcoId}'); showNormativasTab('editor')">
          <i class="bi bi-download"></i> Importar al Editor
        </button>
        <button class="btn btn-outline btn-sm" style="width: 100%;">
          <i class="bi bi-box-arrow-up-right"></i> Exportar JSON
        </button>
      `;
    }
    
    estadoContainer.innerHTML = estadoHTML;
  }
  
  // Actualizar badge de total dominios
  const totalDominiosSpan = document.getElementById('detalle-marco-total-dominios');
  if (totalDominiosSpan) {
    totalDominiosSpan.textContent = marco.dominios;
  }
  
  // Renderizar tabla de dominios (ejemplo simplificado - debería venir del datastore)
  const tablaDominios = document.getElementById('detalle-marco-dominios-tabla').querySelector('tbody');
  if (tablaDominios) {
    // Dominios de ejemplo para cada marco
    const dominiosPorMarco = {
      'iso22301': [
        { codigo: '4.1', nombre: 'Contexto de la Organización', categorias: 2, controles: 6, implementacion: 100 },
        { codigo: '5.1', nombre: 'Liderazgo', categorias: 3, controles: 8, implementacion: 90 },
        { codigo: '6.1', nombre: 'Planificación', categorias: 4, controles: 12, implementacion: 75 },
        { codigo: '8.2', nombre: 'Análisis de Impacto (BIA)', categorias: 5, controles: 15, implementacion: 85 },
        { codigo: '8.3', nombre: 'Evaluación de Riesgos', categorias: 4, controles: 11, implementacion: 70 },
        { codigo: '8.4', nombre: 'Estrategias de Continuidad', categorias: 3, controles: 9, implementacion: 80 },
        { codigo: '9.1', nombre: 'Evaluación del Desempeño', categorias: 2, controles: 5, implementacion: 60 },
        { codigo: '10.1', nombre: 'Mejora Continua', categorias: 1, controles: 3, implementacion: 75 }
      ],
      'ley21663': [
        { codigo: 'A1', nombre: 'Gobierno de Ciberseguridad', categorias: 3, controles: 8, implementacion: 90 },
        { codigo: 'A2', nombre: 'Gestión de Riesgos Ciber', categorias: 4, controles: 12, implementacion: 85 },
        { codigo: 'A3', nombre: 'Protección de Activos', categorias: 5, controles: 10, implementacion: 88 },
        { codigo: 'A4', nombre: 'Respuesta a Incidentes', categorias: 3, controles: 7, implementacion: 82 },
        { codigo: 'A5', nombre: 'Continuidad Operacional', categorias: 2, controles: 5, implementacion: 90 }
      ],
      'iso27001': [
        { codigo: 'A.5', nombre: 'Políticas de Seguridad', categorias: 2, controles: 2, implementacion: 50 },
        { codigo: 'A.6', nombre: 'Organización de Seguridad', categorias: 7, controles: 7, implementacion: 40 },
        { codigo: 'A.7', nombre: 'Seguridad RRHH', categorias: 6, controles: 6, implementacion: 45 },
        { codigo: 'A.8', nombre: 'Gestión de Activos', categorias: 10, controles: 10, implementacion: 50 }
      ],
      'nist': [
        { codigo: 'ID', nombre: 'Identify (Identificar)', categorias: 6, controles: 23, implementacion: 0 },
        { codigo: 'PR', nombre: 'Protect (Proteger)', categorias: 6, controles: 24, implementacion: 0 },
        { codigo: 'DE', nombre: 'Detect (Detectar)', categorias: 3, controles: 13, implementacion: 0 },
        { codigo: 'RS', nombre: 'Respond (Responder)', categorias: 5, controles: 16, implementacion: 0 },
        { codigo: 'RC', nombre: 'Recover (Recuperar)', categorias: 4, controles: 14, implementacion: 0 },
        { codigo: 'GV', nombre: 'Govern (Gobernar)', categorias: 6, controles: 8, implementacion: 0 }
      ],
      'iso31000': [
        { codigo: '1', nombre: 'Principios', categorias: 2, controles: 8, implementacion: 0 },
        { codigo: '2', nombre: 'Marco de Trabajo', categorias: 3, controles: 6, implementacion: 0 },
        { codigo: '3', nombre: 'Proceso de Gestión', categorias: 4, controles: 12, implementacion: 0 },
        { codigo: '4', nombre: 'Evaluación de Riesgos', categorias: 3, controles: 6, implementacion: 0 },
        { codigo: '5', nombre: 'Tratamiento de Riesgos', categorias: 2, controles: 3, implementacion: 0 }
      ]
    };
    
    const dominios = dominiosPorMarco[marcoId] || [];
    
    if (dominios.length === 0) {
      tablaDominios.innerHTML = `
        <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
          <i class="bi bi-info-circle"></i> No hay dominios configurados para este marco
        </td></tr>
      `;
    } else {
      let htmlDominios = '';
      dominios.forEach((dominio, idx) => {
        const dominioId = `dominio-${marcoId}-${idx}`;
        const badgeClass = dominio.implementacion >= 80 ? 'badge-success' : 
                          (dominio.implementacion >= 60 ? 'badge-warning' : 
                          (dominio.implementacion > 0 ? 'badge-danger' : 'badge-neutral'));
        
        // Fila principal del dominio
        htmlDominios += `
          <tr id="${dominioId}" class="dominio-row">
            <td><span class="badge badge-neutral">${dominio.codigo}</span></td>
            <td><strong>${dominio.nombre}</strong></td>
            <td>${dominio.categorias}</td>
            <td>${dominio.controles}</td>
            <td><span class="badge ${badgeClass}">${dominio.implementacion > 0 ? dominio.implementacion + '%' : 'Sin iniciar'}</span></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="toggleDominioDetalle('${dominioId}', '${marcoId}', ${idx})">
                <i class="bi bi-chevron-down" id="${dominioId}-icon"></i> Ver
              </button>
            </td>
          </tr>
          <tr id="${dominioId}-detalle" style="display: none;">
            <td colspan="6" style="padding: 0; background: #f9fafb;">
              <div style="padding: 16px; border-left: 3px solid var(--accent-primary);">
                <div id="${dominioId}-content">
                  <!-- Las categorías se cargarán aquí -->
                </div>
              </div>
            </td>
          </tr>
        `;
      });
      tablaDominios.innerHTML = htmlDominios;
    }
  }
  
  // Mostrar panel y hacer scroll
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Cierra el panel de detalle de marco
 */
function cerrarDetalleMarco() {
  const panel = document.getElementById('detalle-marco-biblioteca');
  if (panel) {
    panel.style.display = 'none';
  }
}

/**
 * Importa una plantilla normativa al editor
 * @param {string} plantillaId - ID de la plantilla a importar
 */
function importarPlantilla(plantillaId) {
  showToast(`Importando plantilla ${plantillaId} al Editor...`, 'success');
  // Aquí se cargaría la estructura de la plantilla desde el datastore
  // y se actualizaría el estado del marco a "En Configuración"
}

/**
 * Toggle del detalle de un dominio (muestra categorías)
 * @param {string} dominioId - ID del dominio
 * @param {string} marcoId - ID del marco
 * @param {number} idx - Índice del dominio
 */
function toggleDominioDetalle(dominioId, marcoId, idx) {
  const detalleRow = document.getElementById(`${dominioId}-detalle`);
  const icon = document.getElementById(`${dominioId}-icon`);
  const content = document.getElementById(`${dominioId}-content`);
  
  if (detalleRow.style.display === 'none') {
    // Mostrar detalle
    detalleRow.style.display = 'table-row';
    icon.className = 'bi bi-chevron-up';
    
    // Cargar categorías si no están cargadas
    if (content.innerHTML.trim() === '' || content.innerHTML.includes('categorías se cargarán')) {
      renderCategoriasDelDominio(dominioId, marcoId, idx);
    }
  } else {
    // Ocultar detalle
    detalleRow.style.display = 'none';
    icon.className = 'bi bi-chevron-down';
  }
}

/**
 * Renderiza las categorías de un dominio
 * @param {string} dominioId - ID del dominio
 * @param {string} marcoId - ID del marco
 * @param {number} idx - Índice del dominio
 */
function renderCategoriasDelDominio(dominioId, marcoId, idx) {
  const content = document.getElementById(`${dominioId}-content`);
  if (!content) return;
  
  // Categorías de ejemplo (deberían venir del datastore)
  const categoriasPorDominio = {
    'iso22301-0': [
      { codigo: '4.1.1', nombre: 'Comprensión de la organización y su contexto', controles: 3 },
      { codigo: '4.1.2', nombre: 'Partes interesadas y requisitos', controles: 3 }
    ],
    'iso22301-1': [
      { codigo: '5.1.1', nombre: 'Política BCMS', controles: 3 },
      { codigo: '5.1.2', nombre: 'Roles y responsabilidades', controles: 3 },
      { codigo: '5.1.3', nombre: 'Recursos', controles: 2 }
    ],
    'iso22301-2': [
      { codigo: '6.1.1', nombre: 'Acciones para abordar riesgos', controles: 4 },
      { codigo: '6.1.2', nombre: 'Objetivos BCMS', controles: 3 },
      { codigo: '6.1.3', nombre: 'Recursos financieros', controles: 3 },
      { codigo: '6.1.4', nombre: 'Planificación de cambios', controles: 2 }
    ],
    'ley21663-0': [
      { codigo: 'A1.1', nombre: 'Comité de Ciberseguridad', controles: 3 },
      { codigo: 'A1.2', nombre: 'Política de Ciberseguridad', controles: 3 },
      { codigo: 'A1.3', nombre: 'Marco de Gobierno', controles: 2 }
    ],
    'iso27001-0': [
      { codigo: 'A.5.1', nombre: 'Políticas de seguridad de la información', controles: 2 }
    ],
    'nist-0': [
      { codigo: 'ID.AM', nombre: 'Asset Management', controles: 6 },
      { codigo: 'ID.BE', nombre: 'Business Environment', controles: 5 },
      { codigo: 'ID.GV', nombre: 'Governance', controles: 6 },
      { codigo: 'ID.RA', nombre: 'Risk Assessment', controles: 6 }
    ]
  };
  
  const categoriasKey = `${marcoId}-${idx}`;
  const categorias = categoriasPorDominio[categoriasKey] || [
    { codigo: `${idx}.1`, nombre: 'Categoría de ejemplo 1', controles: 3 },
    { codigo: `${idx}.2`, nombre: 'Categoría de ejemplo 2', controles: 2 }
  ];
  
  let html = `
    <h4 style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 12px;">
      <i class="bi bi-layers"></i> Categorías (${categorias.length})
    </h4>
    <table style="margin: 0;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="width: 15%;">Código</th>
          <th style="width: 50%;">Categoría</th>
          <th style="width: 15%;">Controles</th>
          <th style="width: 20%;">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  categorias.forEach((cat, catIdx) => {
    const catId = `${dominioId}-cat-${catIdx}`;
    html += `
      <tr id="${catId}" style="background: white;">
        <td><span class="badge badge-info">${cat.codigo}</span></td>
        <td><strong>${cat.nombre}</strong></td>
        <td>${cat.controles}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleCategoriaDetalle('${catId}', '${dominioId}', ${catIdx})">
            <i class="bi bi-chevron-down" id="${catId}-icon"></i> Ver
          </button>
        </td>
      </tr>
      <tr id="${catId}-detalle" style="display: none;">
        <td colspan="4" style="padding: 0; background: #fafafa;">
          <div style="padding: 12px; border-left: 2px solid var(--accent-secondary);">
            <div id="${catId}-content">
              <!-- Los controles se cargarán aquí -->
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  content.innerHTML = html;
}

/**
 * Toggle del detalle de una categoría (muestra controles)
 * @param {string} catId - ID de la categoría
 * @param {string} dominioId - ID del dominio padre
 * @param {number} catIdx - Índice de la categoría
 */
function toggleCategoriaDetalle(catId, dominioId, catIdx) {
  const detalleRow = document.getElementById(`${catId}-detalle`);
  const icon = document.getElementById(`${catId}-icon`);
  const content = document.getElementById(`${catId}-content`);
  
  if (detalleRow.style.display === 'none') {
    // Mostrar detalle
    detalleRow.style.display = 'table-row';
    icon.className = 'bi bi-chevron-up';
    
    // Cargar controles si no están cargados
    if (content.innerHTML.trim() === '' || content.innerHTML.includes('controles se cargarán')) {
      renderControlesDeCategoria(catId, catIdx);
    }
  } else {
    // Ocultar detalle
    detalleRow.style.display = 'none';
    icon.className = 'bi bi-chevron-down';
  }
}

/**
 * Renderiza los controles de una categoría
 * @param {string} catId - ID de la categoría
 * @param {number} catIdx - Índice de la categoría
 */
function renderControlesDeCategoria(catId, catIdx) {
  const content = document.getElementById(`${catId}-content`);
  if (!content) return;
  
  // Controles de ejemplo (deberían venir del datastore)
  const controles = [
    { codigo: `CTRL-${catIdx + 1}-001`, nombre: 'Control de implementación', descripcion: 'Descripción del control', estado: 'Implementado' },
    { codigo: `CTRL-${catIdx + 1}-002`, nombre: 'Control de verificación', descripcion: 'Verificación periódica del cumplimiento', estado: 'En Progreso' },
    { codigo: `CTRL-${catIdx + 1}-003`, nombre: 'Control de monitoreo', descripcion: 'Monitoreo continuo de la efectividad', estado: 'Planificado' }
  ];
  
  let html = `
    <h4 style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
      <i class="bi bi-shield-shaded"></i> Controles (${controles.length})
    </h4>
    <table style="margin: 0; font-size: 11px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="width: 15%;">Código</th>
          <th style="width: 30%;">Control</th>
          <th style="width: 40%;">Descripción</th>
          <th style="width: 15%;">Estado</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  controles.forEach(ctrl => {
    const badgeClass = ctrl.estado === 'Implementado' ? 'badge-success' : 
                       (ctrl.estado === 'En Progreso' ? 'badge-warning' : 'badge-neutral');
    html += `
      <tr style="background: white;">
        <td><code style="font-size: 10px;">${ctrl.codigo}</code></td>
        <td><strong>${ctrl.nombre}</strong></td>
        <td style="font-size: 10px; color: var(--text-muted);">${ctrl.descripcion}</td>
        <td><span class="badge ${badgeClass}">${ctrl.estado}</span></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  content.innerHTML = html;
}

/**
 * Muestra configuración de dominio en el editor
 * @param {string} normativaId - ID de la normativa seleccionada
 */
function showDomainConfig(normativaId) {
  if (!normativaId) {
    showToast('Selecciona una normativa para editar', 'warning');
    return;
  }
  
  showToast(`Cargando estructura de: ${normativaId}`, 'info');
  // Aquí se cargarían los dominios específicos de la normativa desde el datastore
}

/**
 * Muestra las categorías de un dominio específico
 * @param {string} dominioId - ID del dominio
 */
function mostrarCategoriasDominio(dominioId) {
  const card = document.getElementById('categorias-dominio-card');
  if (card) {
    card.style.display = 'block';
    
    // Actualizar título
    const titulo = document.getElementById('categorias-dominio-titulo');
    if (titulo) {
      const nombres = {
        'gobierno': 'Gobierno de Continuidad',
        'bia': 'Análisis de Impacto (BIA)',
        'riesgos': 'Evaluación de Riesgos',
        'estrategias': 'Estrategias de Continuidad'
      };
      titulo.textContent = nombres[dominioId] || 'Dominio';
    }
    
    // Scroll suave hacia la card
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * ============================================================================
 * RIESGOS CIBER - Funciones de renderizado
 * ============================================================================
 */

/**
 * Renderiza los KPIs de Riesgos Ciber usando el componente KPICard
 */
function renderRiesgosCiberKPIs() {
  const container = document.getElementById('riesgos-ciber-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Obtener riesgos ciber del datastore
  const riesgosCiber = BCMSDataStore.api.filter('risks', r => r.riskDomain === 'CYBER');
  const riesgosActivos = riesgosCiber.filter(r => r.status !== 'CLOSED');
  const riesgosCriticos = riesgosActivos.filter(r => r.cvssScore >= 9.0);
  const riesgosAltos = riesgosActivos.filter(r => r.cvssScore >= 7.0 && r.cvssScore < 9.0);
  const avgScore = riesgosActivos.length > 0 
    ? (riesgosActivos.reduce((sum, r) => sum + (r.cvssScore || 0), 0) / riesgosActivos.length).toFixed(1)
    : '0.0';
  
  // Contar controles activos relacionados con ciber
  const controlesCiber = BCMSDataStore.api.filter('controls', c => c.type && c.status === 'IMPLEMENTED');
  const efectividad = controlesCiber.length > 0
    ? Math.round((controlesCiber.filter(c => c.effectiveness === 'STRONG').length / controlesCiber.length) * 100)
    : 0;
  
  // Contar vulnerabilidades
  const vulnerabilidadesAltas = riesgosActivos.filter(r => r.cvssScore >= 7.0).length;
  const vulnerabilidadesMedias = riesgosActivos.filter(r => r.cvssScore >= 4.0 && r.cvssScore < 7.0).length;
  
  const kpis = [
    {
      title: 'Riesgos Ciber Activos',
      value: riesgosActivos.length.toString(),
      trend: `${riesgosCriticos.length + riesgosAltos.length} críticos/altos`,
      subtitle: `Total identificados: ${riesgosCiber.length}`,
      icon: 'bi-bug',
      variant: riesgosCriticos.length > 0 ? 'danger' : 'warning'
    },
    {
      title: 'Críticos/Muy Altos',
      value: riesgosCriticos.length.toString(),
      trend: riesgosCriticos.length > 0 ? 'Requieren atención' : 'Sin críticos',
      subtitle: `${riesgosAltos.length} altos adicionales`,
      icon: 'bi-exclamation-triangle-fill',
      variant: riesgosCriticos.length > 0 ? 'danger' : 'success'
    },
    {
      title: 'Puntaje Promedio CVSS',
      value: avgScore + '/10',
      subtitle: 'Score promedio de riesgos activos',
      icon: 'bi-speedometer2',
      variant: avgScore >= 7.0 ? 'danger' : (avgScore >= 4.0 ? 'warning' : 'success')
    },
    {
      title: 'Controles Activos',
      value: controlesCiber.length.toString(),
      trend: `${efectividad}% efectividad`,
      subtitle: 'Controles implementados',
      icon: 'bi-shield-shaded',
      variant: 'primary'
    },
    {
      title: 'Vulnerabilidades',
      value: (vulnerabilidadesAltas + vulnerabilidadesMedias).toString(),
      trend: `${vulnerabilidadesAltas} altas, ${vulnerabilidadesMedias} medias`,
      subtitle: 'Requieren remediación',
      icon: 'bi-exclamation-triangle',
      variant: vulnerabilidadesAltas > 0 ? 'warning' : 'neutral'
    }
  ];
  
  kpis.forEach(kpi => {
    const kpiCard = new KPICard({
      container: container,
      title: kpi.title,
      value: kpi.value,
      trend: kpi.trend,
      subtitle: kpi.subtitle,
      icon: kpi.icon,
      variant: kpi.variant
    });
  });
}

/**
 * Renderiza el heatmap de riesgos ciber
 */
function renderRiesgosCiberHeatmap() {
  const container = document.getElementById('riesgos-ciber-heatmap-container');
  if (!container) return;
  
  // Matriz 5x5 (Impacto x Probabilidad)
  const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
  
  // Poblar matriz con datos del datastore
  const riesgosCiber = BCMSDataStore.api.filter('risks', r => r.riskDomain === 'CYBER' && r.status !== 'CLOSED');
  riesgosCiber.forEach(r => {
    const prob = r.residualProbability || r.inherentProbability || 1;
    const imp = r.residualImpact || r.inherentImpact || 1;
    if (prob >= 1 && prob <= 5 && imp >= 1 && imp <= 5) {
      matrix[5 - imp][prob - 1]++;
    }
  });
  
  // Configuración de colores del heatmap
  const getColorForCell = (impacto, probabilidad, count) => {
    const score = impacto * probabilidad;
    if (score >= 20) return count > 0 ? '#991b1b' : '#fecaca';  // Crítico
    if (score >= 15) return count > 0 ? '#dc2626' : '#fca5a5';  // Muy Alto
    if (score >= 10) return count > 0 ? '#f59e0b' : '#fde047';  // Alto
    if (score >= 5) return count > 0 ? '#fbbf24' : '#fef08a';   // Medio
    return count > 0 ? '#d4f4dd' : '#f0fdf4';                    // Bajo
  };
  
  const getTextColor = (impacto, probabilidad) => {
    const score = impacto * probabilidad;
    return score >= 10 ? '#ffffff' : '#1f2937';
  };
  
  // Renderizar heatmap
  let html = '<div style="display: grid; grid-template-columns: 60px repeat(5, 1fr); gap: 3px; font-size: 10px;">';
  
  // Headers columnas
  html += '<div></div>';
  ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'].forEach(label => {
    html += `<div style="text-align: center; padding: 4px; font-weight: 600;">${label}</div>`;
  });
  
  // Filas del heatmap
  const impactos = ['Crítico', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'];
  matrix.forEach((row, i) => {
    const impacto = 5 - i;
    html += `<div style="font-weight: 600; padding: 4px; display: flex; align-items: center;">${impactos[i]}</div>`;
    row.forEach((count, j) => {
      const probabilidad = j + 1;
      const bgColor = getColorForCell(impacto, probabilidad, count);
      const textColor = getTextColor(impacto, probabilidad);
      html += `<div style="background: ${bgColor}; color: ${textColor}; padding: 12px; text-align: center; border-radius: 3px; font-weight: ${count > 0 ? '600' : '400'};">${count}</div>`;
    });
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Renderiza el gráfico de distribución de riesgos ciber
 */
function renderRiesgosCiberChart() {
  const ctx = document.getElementById('riesgos-ciber-chart');
  if (!ctx) return;
  
  const riesgosCiber = BCMSDataStore.api.filter('risks', r => r.riskDomain === 'CYBER' && r.status !== 'CLOSED');
  
  // Agrupar por nivel de CVSS
  const criticos = riesgosCiber.filter(r => r.cvssScore >= 9.0).length;
  const altos = riesgosCiber.filter(r => r.cvssScore >= 7.0 && r.cvssScore < 9.0).length;
  const medios = riesgosCiber.filter(r => r.cvssScore >= 4.0 && r.cvssScore < 7.0).length;
  const bajos = riesgosCiber.filter(r => r.cvssScore < 4.0).length;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Críticos (9.0-10)', 'Altos (7.0-8.9)', 'Medios (4.0-6.9)', 'Bajos (0-3.9)'],
      datasets: [{
        data: [criticos, altos, medios, bajos],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',   // Rojo crítico
          'rgba(251, 191, 36, 0.8)',  // Amarillo alto
          'rgba(59, 130, 246, 0.8)',  // Azul medio
          'rgba(16, 185, 129, 0.8)'   // Verde bajo
        ],
        borderColor: [
          '#dc2626',
          '#fbbf24',
          '#3b82f6',
          '#10b981'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 11
            },
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Renderiza la tabla de riesgos ciber desde el datastore
 */
function renderRiesgosCiberTable() {
  const tbody = document.getElementById('riesgos-ciber-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const riesgosCiber = BCMSDataStore.api.filter('risks', r => r.riskDomain === 'CYBER');
  
  if (riesgosCiber.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No hay riesgos ciber registrados</td></tr>';
    return;
  }
  
  riesgosCiber.forEach(riesgo => {
    const scoreClass = riesgo.cvssScore >= 9.0 ? 'badge-danger' 
                      : riesgo.cvssScore >= 7.0 ? 'badge-warning'
                      : riesgo.cvssScore >= 4.0 ? 'badge-info'
                      : 'badge-success';
    
    const tratamientoClass = riesgo.treatmentType === 'MITIGATE' ? 'badge-warning'
                            : riesgo.treatmentType === 'AVOID' ? 'badge-danger'
                            : riesgo.treatmentType === 'ACCEPT' ? 'badge-success'
                            : 'badge-neutral';
    
    const tratamientoLabel = BCMSDataStore.api.getLookupLabel('riskTreatment', riesgo.treatmentType) || riesgo.treatmentType;
    
    const statusClass = riesgo.status === 'TREATING' ? 'badge-active'
                       : riesgo.status === 'MONITORED' ? 'badge-neutral'
                       : 'badge-success';
    
    const statusLabel = BCMSDataStore.api.getLookupLabel('riskStatus', riesgo.status) || riesgo.status;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${riesgo.code}</strong></td>
      <td>${riesgo.targetAsset || 'N/A'}</td>
      <td>${riesgo.threat || 'N/A'}</td>
      <td>${riesgo.vulnerability || 'N/A'}</td>
      <td><span class="badge ${scoreClass}">${riesgo.cvssScore ? riesgo.cvssScore.toFixed(1) : 'N/A'}</span></td>
      <td><span class="badge ${tratamientoClass}">${tratamientoLabel}</span></td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
      <td>${riesgo.ownerName || 'N/A'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showDetalleRiesgoCiber('${riesgo.code}')">
          <i class="bi bi-eye"></i> Detalle
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Muestra el panel de detalle de un riesgo ciber
 */
function showDetalleRiesgoCiber(riesgoCode) {
  const riesgo = BCMSDataStore.api.getById('risks', riesgoCode);
  if (!riesgo) return;
  
  const panel = document.getElementById('detalle-riesgo-ciber');
  const titleEl = document.getElementById('detalle-riesgo-ciber-title');
  const contentEl = document.getElementById('detalle-riesgo-ciber-content');
  
  if (!panel || !titleEl || !contentEl) return;
  
  titleEl.textContent = riesgo.code;
  
  const scoreClass = riesgo.cvssScore >= 9.0 ? 'badge-danger' 
                    : riesgo.cvssScore >= 7.0 ? 'badge-warning'
                    : 'badge-info';
  
  const tratamientoLabel = BCMSDataStore.api.getLookupLabel('riskTreatment', riesgo.treatmentType) || riesgo.treatmentType;
  const statusLabel = BCMSDataStore.api.getLookupLabel('riskStatus', riesgo.status) || riesgo.status;
  
  contentEl.innerHTML = `
    <div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Activo/Sistema afectado:</div>
        <div style="font-size: 13px; color: #374151;">${riesgo.targetAsset || 'N/A'}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Amenaza / Vector de ataque:</div>
        <div style="font-size: 13px; color: #374151;">${riesgo.threat || 'N/A'}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Vulnerabilidad identificada:</div>
        <div style="font-size: 13px; color: #374151;">${riesgo.vulnerability || 'N/A'}</div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Descripción:</div>
        <div style="font-size: 13px; color: #374151;">${riesgo.description || 'N/A'}</div>
      </div>
    </div>
    <div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Puntaje CVSS:</div>
        <div><span class="badge ${scoreClass}" style="font-size: 16px; padding: 6px 12px;">${riesgo.cvssScore ? riesgo.cvssScore.toFixed(1) : 'N/A'} / 10</span></div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Tratamiento:</div>
        <div><span class="badge badge-warning">${tratamientoLabel}</span></div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Controles relacionados:</div>
        <div style="font-size: 13px; color: #374151;">
          ${riesgo.controls && riesgo.controls.length > 0 
            ? riesgo.controls.map(c => `<span class="badge badge-info" style="margin-right: 4px;">${c}</span>`).join(' ')
            : 'Sin controles asignados'
          }
        </div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Responsable:</div>
        <div style="font-size: 13px; color: #374151;">${riesgo.ownerName || 'N/A'}</div>
      </div>
      <div>
        <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Estado:</div>
        <div><span class="badge badge-active">${statusLabel}</span> Última actualización: ${riesgo.updatedAt ? new Date(riesgo.updatedAt).toLocaleDateString('es-CL') : 'N/A'}</div>
      </div>
    </div>
  `;
  
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * ============================================================================
 * DRP (DISASTER RECOVERY PLAN) - Funciones de renderizado
 * ============================================================================
 */

/**
 * Renderiza los KPIs de DRP usando el componente KPICard
 */
function renderDRPKPIs() {
  const container = document.getElementById('drp-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Obtener planes DRP del datastore
  const planesDRP = BCMSDataStore.api.filter('continuityPlans', p => p.planType === 'DRP');
  const planesActivos = planesDRP.filter(p => p.status === 'ACTIVE');
  
  // Calcular RTO promedio
  const rtoPromedio = planesActivos.length > 0
    ? (planesActivos.reduce((sum, p) => sum + (p.rtoTarget || 0), 0) / planesActivos.length).toFixed(1)
    : '0.0';
  
  // Contar sites alternos únicos
  const sitesAlternos = new Set(planesActivos.map(p => p.alternateSite).filter(s => s)).size;
  
  // Contar replicaciones sincrónicas
  const replicacionSincronica = planesActivos.filter(p => 
    p.replicationType === 'SYNCHRONOUS' || p.replicationType === 'REALTIME'
  ).length;
  
  // Contar activaciones (planes con última prueba exitosa en 2025)
  const activaciones2025 = planesActivos.filter(p => 
    p.lastTest && p.lastTest.includes('2025') && p.testResult === 'SUCCESS'
  ).length;
  
  const kpis = [
    {
      title: 'Planes DRP Activos',
      value: planesActivos.length.toString(),
      subtitle: 'Sistemas críticos cubiertos',
      icon: 'bi-shield-shaded',
      variant: 'primary'
    },
    {
      title: 'RTO Promedio',
      value: rtoPromedio + 'h',
      subtitle: 'Objetivo: 2h',
      icon: 'bi-clock',
      variant: parseFloat(rtoPromedio) <= 2 ? 'success' : 'warning'
    },
    {
      title: 'Sites Alternos',
      value: sitesAlternos.toString(),
      subtitle: 'Cloud + On-premise',
      icon: 'bi-hdd-rack',
      variant: 'secondary'
    },
    {
      title: 'Replicación Sincrónica',
      value: replicacionSincronica.toString(),
      subtitle: 'RPO = 0 minutos',
      icon: 'bi-arrow-clockwise',
      variant: 'secondary'
    },
    {
      title: 'Activaciones 2025',
      value: activaciones2025.toString(),
      subtitle: 'Todas exitosas',
      icon: 'bi-check-circle',
      variant: 'neutral'
    }
  ];
  
  kpis.forEach(kpi => {
    const kpiCard = new KPICard({
      container: container,
      title: kpi.title,
      value: kpi.value,
      subtitle: kpi.subtitle,
      icon: kpi.icon,
      variant: kpi.variant
    });
  });
}

/**
 * Renderiza el gráfico de distribución de planes DRP
 */
function renderDRPChart() {
  const ctx = document.getElementById('drp-distribucion-chart');
  if (!ctx) return;
  
  const planesDRP = BCMSDataStore.api.filter('continuityPlans', p => p.planType === 'DRP' && p.status === 'ACTIVE');
  
  // Agrupar por criticidad
  const criticos = planesDRP.filter(p => p.criticality === 'CRITICAL').length;
  const altos = planesDRP.filter(p => p.criticality === 'HIGH').length;
  const medios = planesDRP.filter(p => p.criticality === 'MEDIUM').length;
  const bajos = planesDRP.filter(p => p.criticality === 'LOW').length;
  
  // Agrupar por tipo de replicación
  const sincronica = planesDRP.filter(p => p.replicationType === 'SYNCHRONOUS').length;
  const asincronica = planesDRP.filter(p => p.replicationType === 'ASYNCHRONOUS').length;
  const realtime = planesDRP.filter(p => p.replicationType === 'REALTIME').length;
  const cloudNative = planesDRP.filter(p => p.replicationType === 'CLOUD_NATIVE').length;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Crítico', 'Alto', 'Medio', 'Bajo', 'Sincrónica', 'Asincrónica', 'Tiempo Real', 'Cloud Native'],
      datasets: [{
        label: 'Cantidad de Planes',
        data: [criticos, altos, medios, bajos, sincronica, asincronica, realtime, cloudNative],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',   // Crítico - Rojo
          'rgba(251, 191, 36, 0.8)',  // Alto - Amarillo
          'rgba(59, 130, 246, 0.8)',  // Medio - Azul
          'rgba(16, 185, 129, 0.8)',  // Bajo - Verde
          'rgba(16, 185, 129, 0.6)',  // Sincrónica - Verde claro
          'rgba(251, 191, 36, 0.6)',  // Asincrónica - Amarillo claro
          'rgba(59, 130, 246, 0.6)',  // Tiempo Real - Azul claro
          'rgba(147, 51, 234, 0.6)'   // Cloud Native - Violeta
        ],
        borderColor: [
          '#dc2626',
          '#fbbf24',
          '#3b82f6',
          '#10b981',
          '#10b981',
          '#fbbf24',
          '#3b82f6',
          '#9333ea'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Planes: ' + context.parsed.y;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 10
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Renderiza la tabla de proveedores críticos para DRP
 */
function renderDRPProveedoresTable() {
  const tbody = document.getElementById('drp-proveedores-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Datos de ejemplo de proveedores críticos (estos deberían venir del datastore de proveedores)
  const proveedoresCriticos = [
    {
      nombre: 'AWS Cloud Services',
      servicio: 'Cloud/Hosting',
      sistemas: 'Core Banking, Portal Web (8 sistemas)',
      evaluacion: 'Aprobado (8.7/10)',
      evaluacionClass: 'badge-success',
      planContingencia: 'CONT-PROV-001'
    },
    {
      nombre: 'Entel Telecomunicaciones',
      servicio: 'Red WAN/Internet',
      sistemas: 'Todos los sistemas (15 sistemas)',
      evaluacion: 'Aprobado (9.1/10)',
      evaluacionClass: 'badge-success',
      planContingencia: 'CONT-PROV-002'
    },
    {
      nombre: 'Sonda IT Services',
      servicio: 'Soporte TI N3',
      sistemas: 'Mesa de Ayuda, Infraestructura (2 sistemas)',
      evaluacion: 'En revisión (7.3/10)',
      evaluacionClass: 'badge-warning',
      planContingencia: 'CONT-PROV-003'
    }
  ];
  
  proveedoresCriticos.forEach(prov => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${prov.nombre}</strong></td>
      <td>${prov.servicio}</td>
      <td>${prov.sistemas}</td>
      <td><span class="badge ${prov.evaluacionClass}">${prov.evaluacion}</span></td>
      <td><button class="badge badge-info" onclick="showView('proveedores')" style="cursor: pointer; border: none;">${prov.planContingencia}</button></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showView('proveedores')">
          <i class="bi bi-eye"></i> Ver Plan
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Renderiza la tabla de planes DRP desde el datastore
 */
function renderDRPPlanesTable() {
  const tbody = document.getElementById('drp-planes-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const planesDRP = BCMSDataStore.api.filter('continuityPlans', p => p.planType === 'DRP' && p.status === 'ACTIVE');
  
  if (planesDRP.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No hay planes DRP registrados</td></tr>';
    return;
  }
  
  planesDRP.forEach(plan => {
    const criticalityClass = plan.criticality === 'CRITICAL' ? 'badge-critical'
                            : plan.criticality === 'HIGH' ? 'badge-high'
                            : plan.criticality === 'MEDIUM' ? 'badge-info'
                            : 'badge-neutral';
    
    const criticalityLabel = BCMSDataStore.api.getLookupLabel('businessCriticality', plan.criticality) || plan.criticality;
    
    const rto = plan.rtoTarget ? (plan.rtoTarget >= 1 ? plan.rtoTarget + 'h' : (plan.rtoTarget * 60) + 'min') : 'N/A';
    const rpo = plan.rpoTarget === 0 ? '0' : (plan.rpoTarget >= 1 ? plan.rpoTarget + 'h' : (plan.rpoTarget * 60).toFixed(0) + 'min');
    
    const replicationType = plan.replicationType || 'N/A';
    const replicationClass = replicationType === 'SYNCHRONOUS' || replicationType === 'REALTIME' 
      ? 'badge-success' 
      : replicationType === 'ASYNCHRONOUS' 
        ? 'badge-warning' 
        : 'badge-info';
    
    const replicationLabel = replicationType === 'SYNCHRONOUS' ? 'Sincrónica'
                            : replicationType === 'ASYNCHRONOUS' ? 'Asincrónica'
                            : replicationType === 'REALTIME' ? 'Tiempo Real'
                            : replicationType === 'CLOUD_NATIVE' ? 'Nativa Cloud'
                            : replicationType;
    
    const testStatus = plan.testResult === 'SUCCESS' ? '✓' : plan.testResult === 'PENDING' ? '-' : '✗';
    const lastTest = plan.lastTest ? plan.lastTest + ' ' + testStatus : '-';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${plan.code}</strong></td>
      <td>${plan.title || plan.application || 'N/A'}</td>
      <td><span class="badge ${criticalityClass}">${criticalityLabel}</span></td>
      <td>${rto}</td>
      <td>${rpo}</td>
      <td>${plan.alternateSite || 'N/A'}</td>
      <td><span class="badge ${replicationClass}">${replicationLabel}</span></td>
      <td>${lastTest}</td>
      <td><span class="badge badge-success">Vigente</span></td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * ============================================================================
 * CRISIS - Funciones de renderizado
 * ============================================================================
 */

/**
 * Renderiza el semáforo de estado de crisis
 */
function renderCrisisSemaforo() {
  const container = document.getElementById('crisis-estado-semaforo');
  if (!container) return;
  
  // Por ahora, estado verde (sin crisis activas)
  // En producción, esto vendría del datastore
  const estadoActual = 'VERDE';
  
  const config = {
    'VERDE': {
      bgStart: '#10b981',
      bgEnd: '#059669',
      textColor: '#fff',
      icon: 'bi-check-circle-fill',
      label: 'ESTADO ACTUAL',
      estado: 'VERDE - Normal',
      desc: 'No hay crisis activas · Operación normal · Comité en standby'
    },
    'AMARILLO': {
      bgStart: '#f59e0b',
      bgEnd: '#d97706',
      textColor: '#fff',
      icon: 'bi-exclamation-triangle-fill',
      label: 'ALERTA ACTIVADA',
      estado: 'AMARILLO - Alerta',
      desc: 'Situación monitoreada · Comité en alerta · Revisión continua'
    },
    'ROJO': {
      bgStart: '#dc2626',
      bgEnd: '#991b1b',
      textColor: '#fff',
      icon: 'bi-exclamation-circle-fill',
      label: 'CRISIS ACTIVA',
      estado: 'ROJO - Crisis Total',
      desc: 'Protocolo activado · Comité reunido · Gestión en curso'
    }
  };
  
  const cfg = config[estadoActual];
  
  container.style.setProperty('--bg-start', cfg.bgStart);
  container.style.setProperty('--bg-end', cfg.bgEnd);
  container.style.setProperty('--text-color', cfg.textColor);
  container.className = 'card crisis-semaforo';
  
  container.innerHTML = `
    <div class="crisis-semaforo-icon"></div>
    <div class="crisis-semaforo-content">
      <div class="crisis-semaforo-label">
        <i class="bi ${cfg.icon}"></i> ${cfg.label}
      </div>
      <div class="crisis-semaforo-estado">${cfg.estado}</div>
      <div class="crisis-semaforo-desc">${cfg.desc}</div>
    </div>
  `;
}

/**
 * Renderiza KPIs de crisis
 */
function renderCrisisKPIs() {
  // KPI Historial
  const kpiHistorial = document.getElementById('crisis-kpi-historial');
  if (kpiHistorial) {
    const crisisResueltas = BCMSDataStore.api.filter('incidents', i => i.severity === 'CRITICAL' && i.status === 'CLOSED').length;
    kpiHistorial.innerHTML = `
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Crisis Históricas 2025</div>
      <div style="font-size: 28px; font-weight: 700; color: var(--accent-primary);">${crisisResueltas}</div>
      <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Todas resueltas exitosamente</div>
    `;
  }
  
  // KPI Tiempo
  const kpiTiempo = document.getElementById('crisis-kpi-tiempo');
  if (kpiTiempo) {
    kpiTiempo.innerHTML = `
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Tiempo Promedio Resolución</div>
      <div style="font-size: 28px; font-weight: 700; color: var(--accent-secondary);">9.6h</div>
      <div style="font-size: 10px; color: var(--accent-secondary); margin-top: 4px;">-2.4h vs 2024</div>
    `;
  }
}

/**
 * Renderiza gráfico de crisis por tipo
 */
function renderCrisisChart() {
  const ctx = document.getElementById('crisis-tipo-chart');
  if (!ctx) return;
  
  // Datos de ejemplo
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Ciberseguridad', 'Infraestructura', 'Servicios', 'Desastre Natural', 'Reputacional'],
      datasets: [{
        data: [5, 3, 2, 1, 1],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(147, 51, 234, 0.8)'
        ],
        borderColor: ['#dc2626', '#fbbf24', '#3b82f6', '#10b981', '#9333ea'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 12, font: { size: 10 }, usePointStyle: true }
        }
      }
    }
  });
}

/**
 * Renderiza tabla de historial de crisis
 */
function renderCrisisHistorial() {
  const tbody = document.getElementById('crisis-historial-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const crisisHistoricas = BCMSDataStore.api.filter('incidents', i => i.severity === 'CRITICAL');
  
  if (crisisHistoricas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No hay crisis registradas</td></tr>';
    return;
  }
  
  crisisHistoricas.forEach(crisis => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${crisis.code}</strong></td>
      <td>${crisis.type || 'N/A'}</td>
      <td>${new Date(crisis.reportedAt).toLocaleDateString('es-CL')}</td>
      <td>${crisis.resolvedAt ? 'Calculado' : 'En curso'}</td>
      <td><span class="badge badge-danger">Crítico</span></td>
      <td><span class="badge ${crisis.status === 'CLOSED' ? 'badge-success' : 'badge-active'}">${crisis.status === 'CLOSED' ? 'Resuelta' : 'Activa'}</span></td>
      <td><button class="btn btn-outline btn-sm"><i class="bi bi-eye"></i> Detalle</button></td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * ============================================================================
 * VISTA INTEGRADA - Funciones de navegación de tabs
 * ============================================================================
 */

function showIntegradaTab(tabName) {
  // Ocultar todos los contenidos de tabs
  const allContents = document.querySelectorAll('.integrada-tab-content');
  allContents.forEach(content => {
    content.style.display = 'none';
  });
  
  // Desactivar todos los botones de tabs
  const allButtons = document.querySelectorAll('.tab-button[data-tab]');
  allButtons.forEach(button => {
    button.classList.remove('active');
    button.style.borderBottom = '3px solid transparent';
    button.style.color = 'var(--text-muted)';
  });
  
  // Mostrar el contenido del tab seleccionado
  const selectedContent = document.getElementById(`integrada-${tabName}`);
  if (selectedContent) {
    selectedContent.style.display = 'block';
  }
  
  // Activar el botón del tab seleccionado
  const selectedButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
    selectedButton.style.borderBottom = '3px solid var(--accent-primary)';
    selectedButton.style.color = 'var(--accent-primary)';
  }
}

/**
 * ============================================================================
 * COMUNICACIONES DE CRISIS - Funciones de renderizado
 * ============================================================================
 */

function renderComunicacionesKPIs() {
  const container = document.getElementById('comunicaciones-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const comunicacionesTemplates = BCMSDataStore.api.getAll('communicationTemplates') || [];
  const comunicacionesLogs = BCMSDataStore.api.getAll('communicationLogs') || [];
  
  const kpis = [
    {
      title: 'Comunicados Emitidos',
      value: comunicacionesLogs.length.toString(),
      subtitle: 'Total en 2025',
      icon: 'bi-send',
      variant: 'primary'
    },
    {
      title: 'Borradores Pendientes',
      value: '5',
      subtitle: 'Requieren aprobación',
      icon: 'bi-file-earmark-text',
      variant: 'warning'
    },
    {
      title: 'Stakeholders Activos',
      value: '87',
      subtitle: '12 grupos definidos',
      icon: 'bi-persons',
      variant: 'secondary'
    },
    {
      title: 'Canales Operativos',
      value: '7/7',
      subtitle: '100% disponibilidad',
      icon: 'bi-broadcast',
      variant: 'success'
    },
    {
      title: 'Tasa Entrega',
      value: '98%',
      subtitle: 'Apertura: 94%',
      icon: 'bi-graph-up',
      variant: 'success'
    }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({
      container: container,
      title: kpi.title,
      value: kpi.value,
      subtitle: kpi.subtitle,
      icon: kpi.icon,
      variant: kpi.variant
    });
  });
}

function renderComunicacionesChart() {
  const ctx = document.getElementById('comunicaciones-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Comunicados Emitidos',
        data: [2, 1, 3, 2, 4, 2, 3, 1, 2, 1, 2, 1],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}

function renderComunicacionesPlantillas() {
  const tbody = document.getElementById('comunicaciones-plantillas-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const plantillas = BCMSDataStore.api.getAll('communicationTemplates') || [];
  
  if (plantillas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No hay plantillas registradas</td></tr>';
    return;
  }
  
  plantillas.forEach(plantilla => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${plantilla.templateCode || 'N/A'}</strong></td>
      <td>${plantilla.templateName || 'N/A'}</td>
      <td>${plantilla.templateType || 'N/A'}</td>
      <td>${plantilla.channels ? plantilla.channels.join(', ') : 'N/A'}</td>
      <td>${plantilla.targetAudience || 'N/A'}</td>
      <td><span class="badge badge-success">Activa</span></td>
      <td><button class="btn btn-outline btn-sm"><i class="bi bi-eye"></i> Ver</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderComunicacionesHistorial() {
  const tbody = document.getElementById('comunicaciones-historial-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const logs = BCMSDataStore.api.getAll('communicationLogs') || [];
  
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No hay comunicados registrados</td></tr>';
    return;
  }
  
  logs.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(log.sentAt).toLocaleString('es-CL')}</td>
      <td>${log.messageType || 'N/A'}</td>
      <td>${log.subject || 'N/A'}</td>
      <td>${log.recipientCount || 0}</td>
      <td>${log.channel || 'N/A'}</td>
      <td><span class="badge badge-success">${log.status || 'Enviado'}</span></td>
      <td><button class="btn btn-outline btn-sm"><i class="bi bi-eye"></i> Detalle</button></td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * ============================================================================
 * AUDITORÍA - Funciones de renderizado
 * ============================================================================
 */

function renderAuditoriaKPIs() {
  const container = document.getElementById('auditoria-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const auditorias = BCMSDataStore.api.getAll('audits') || [];
  const hallazgos = BCMSDataStore.api.getAll('findings') || [];
  
  const kpis = [
    { title: 'Auditorías 2025', value: auditorias.length.toString(), subtitle: 'Completadas y programadas', icon: 'bi-clipboard-check', variant: 'primary' },
    { title: 'Hallazgos Totales', value: hallazgos.length.toString(), subtitle: 'NC Mayor + NC Menor', icon: 'bi-exclamation-triangle-fill', variant: 'warning' },
    { title: 'Hallazgos Abiertos', value: hallazgos.filter(h => h.status !== 'CLOSED').length.toString(), subtitle: 'Requieren atención', icon: 'bi-exclamation-circle', variant: 'danger' },
    { title: 'Acciones Correctivas', value: '34', subtitle: '26 cerradas | 8 activas', icon: 'bi-list-task', variant: 'secondary' },
    { title: 'Índice Madurez', value: '4.2', subtitle: '/ 5.0 (Optimizado)', icon: 'bi-star-fill', variant: 'secondary' }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({ container, title: kpi.title, value: kpi.value, subtitle: kpi.subtitle, icon: kpi.icon, variant: kpi.variant });
  });
}

function renderAuditoriaTables() {
  const tbody = document.getElementById('tbody-auditorias');
  if (tbody) {
    tbody.innerHTML = '';
    const auditorias = BCMSDataStore.api.getAll('audits') || [];
    auditorias.slice(0, 6).forEach(a => {
      tbody.innerHTML += `<tr>
        <td>${new Date(a.scheduledDate).toLocaleDateString('es-CL')}</td>
        <td>${a.auditType || 'N/A'}</td>
        <td>${a.frameworkScope || 'N/A'}</td>
        <td>${a.leadAuditor || 'N/A'}</td>
        <td><span class="badge ${a.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}">${a.status === 'COMPLETED' ? 'Completada' : 'Programada'}</span></td>
      </tr>`;
    });
  }
  
  const tbodyH = document.getElementById('tbody-hallazgos-recientes');
  if (tbodyH) {
    tbodyH.innerHTML = '';
    const hallazgos = BCMSDataStore.api.getAll('findings') || [];
    hallazgos.slice(0, 5).forEach(h => {
      tbodyH.innerHTML += `<tr>
        <td><strong>${h.code}</strong></td>
        <td><span class="badge ${h.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${h.severity || 'N/A'}</span></td>
        <td>${h.title || 'N/A'}</td>
        <td><span class="badge ${h.status === 'CLOSED' ? 'badge-success' : 'badge-active'}">${h.status === 'CLOSED' ? 'Cerrado' : 'Abierto'}</span></td>
      </tr>`;
    });
  }
}

function renderAuditoriaChart() {
  const ctx = document.getElementById('auditoria-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Hallazgos',
        data: [5, 3, 4, 2, 6, 3, 4, 2, 5, 4, 2, 2],
        backgroundColor: 'rgba(251, 191, 36, 0.8)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/**
 * ============================================================================
 * RECURSOS & CAPACIDADES - Funciones de renderizado
 * ============================================================================
 */

function renderRecursosKPIs() {
  const container = document.getElementById('recursos-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const kpis = [
    { title: 'Cobertura vs Procesos', value: '95%', subtitle: '18/19 procesos', icon: 'bi-check-circle', variant: 'secondary' },
    { title: 'Recursos sin Backup', value: '7', subtitle: 'Requieren acción', icon: 'bi-exclamation-triangle', variant: 'danger' },
    { title: 'Brechas Capacidad', value: '5', subtitle: '2 críticas, 3 moderadas', icon: 'bi-exclamation-triangle-fill', variant: 'warning' },
    { title: 'Dependencias Terceros', value: '12', subtitle: '8 con SLA vigente', icon: 'bi-people', variant: 'primary' },
    { title: 'Capacidad Operativa', value: '78%', subtitle: '↑ 5% vs mes anterior', icon: 'bi-speedometer2', variant: 'secondary' }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({ container, title: kpi.title, value: kpi.value, subtitle: kpi.subtitle, icon: kpi.icon, variant: kpi.variant });
  });
}

function renderRecursosCoberturaTable() {
  const tbody = document.getElementById('recursos-cobertura-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const procesos = [
    { codigo: 'BIA-PROC-001', nombre: 'Gestión Operaciones', recursos: '5 personal + 3 sistemas', backup: '100%', backupClass: 'badge-success', capacidad: '85%', capacidadClass: 'badge-success', objetivo: '60%', estadoClass: 'badge-active', estado: 'Óptimo' },
    { codigo: 'BIA-PROC-002', nombre: 'Atención al Cliente', recursos: '8 personal + 2 sistemas', backup: '87.5%', backupClass: 'badge-success', capacidad: '55%', capacidadClass: 'badge-warning', objetivo: '70%', estadoClass: 'badge-warning', estado: 'Brecha' },
    { codigo: 'BIA-PROC-005', nombre: 'Procesamiento Transacciones', recursos: '3 personal + 5 sistemas', backup: '60%', backupClass: 'badge-danger', capacidad: '45%', capacidadClass: 'badge-danger', objetivo: '80%', estadoClass: 'badge-expired', estado: 'Crítico' },
    { codigo: 'BIA-PROC-008', nombre: 'Gestión TI & Seguridad', recursos: '4 personal + 8 sistemas', backup: '100%', backupClass: 'badge-success', capacidad: '90%', capacidadClass: 'badge-success', objetivo: '60%', estadoClass: 'badge-active', estado: 'Óptimo' },
    { codigo: 'BIA-PROC-012', nombre: 'Logística & Distribución', recursos: '6 personal + 2 sistemas', backup: '66%', backupClass: 'badge-warning', capacidad: '70%', capacidadClass: 'badge-success', objetivo: '60%', estadoClass: 'badge-active', estado: 'Óptimo' }
  ];
  
  procesos.forEach(p => {
    tbody.innerHTML += `<tr>
      <td><span class="badge badge-info">${p.codigo}</span> ${p.nombre}</td>
      <td style="font-size: 12px;">${p.recursos}</td>
      <td><span class="badge ${p.backupClass}">${p.backup}</span></td>
      <td><span class="badge ${p.capacidadClass}">${p.capacidad}</span> (Obj: ${p.objetivo})</td>
      <td><span class="badge ${p.estadoClass}">${p.estado}</span></td>
    </tr>`;
  });
}

function renderRecursosCharts() {
  // Chart: Distribución de Recursos
  const ctxDist = document.getElementById('recursos-distribucion-chart');
  if (ctxDist) {
    new Chart(ctxDist, {
      type: 'doughnut',
      data: {
        labels: ['Personal', 'Sistemas', 'Infraestructura', 'Proveedores'],
        datasets: [{
          data: [40, 30, 20, 10],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
  
  // Chart: Brechas de Capacidad
  const ctxBrechas = document.getElementById('recursos-brechas-chart');
  if (ctxBrechas) {
    new Chart(ctxBrechas, {
      type: 'bar',
      data: {
        labels: ['Operaciones', 'Atención Cliente', 'Transacciones', 'TI', 'Logística'],
        datasets: [{
          label: 'Capacidad Actual',
          data: [85, 55, 45, 90, 70],
          backgroundColor: 'rgba(16, 185, 129, 0.8)'
        }, {
          label: 'Objetivo',
          data: [60, 70, 80, 60, 60],
          backgroundColor: 'rgba(251, 191, 36, 0.4)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });
  }
}

/**
 * ============================================================================
 * CAPACITACIÓN - Funciones de renderizado
 * ============================================================================
 */

function renderCapacitacionKPIs() {
  const container = document.getElementById('capacitacion-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const kpis = [
    { title: 'Cobertura Capacitación', value: '87%', subtitle: '↑ 12% vs 2024 | Meta: 95%', icon: 'bi-mortarboard', variant: 'secondary' },
    { title: 'Cursos Completados', value: '342', subtitle: 'En 2025 | 28.5 promedio/mes', icon: 'bi-book', variant: 'primary' },
    { title: 'Simulacros Realizados', value: '8', subtitle: '4 BCP | 4 Crisis | Part. 92%', icon: 'bi-clipboard-check', variant: 'primary' },
    { title: 'Nivel Concienciación', value: '8.2/10', subtitle: '↑ 0.8 vs 2024', icon: 'bi-star-fill', variant: 'secondary' }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({ container, title: kpi.title, value: kpi.value, subtitle: kpi.subtitle, icon: kpi.icon, variant: kpi.variant });
  });
}

function renderCapacitacionPrograma() {
  const tbody = document.getElementById('capacitacion-programa-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const cursos = [
    { nombre: 'Fundamentos ISO 22301', tipo: 'Obligatorio', tipoClass: 'badge-info', duracion: '4 horas', publico: 'Todo el personal', modalidad: 'E-Learning', fecha: '15-Ene-2026', estado: 'Abierto', estadoClass: 'badge-success' },
    { nombre: 'Activación BCP/DRP', tipo: 'Crítico', tipoClass: 'badge-danger', duracion: '8 horas', publico: 'Equipos respuesta', modalidad: 'Presencial', fecha: '22-Ene-2026', estado: 'Abierto', estadoClass: 'badge-success' },
    { nombre: 'Gestión de Crisis', tipo: 'Crítico', tipoClass: 'badge-danger', duracion: '6 horas', publico: 'Comité Crisis', modalidad: 'Híbrido', fecha: '05-Feb-2026', estado: 'Programado', estadoClass: 'badge-warning' },
    { nombre: 'Ciberseguridad Básica', tipo: 'Obligatorio', tipoClass: 'badge-info', duracion: '3 horas', publico: 'Todo el personal', modalidad: 'E-Learning', fecha: '01-Feb-2026', estado: 'Abierto', estadoClass: 'badge-success' },
    { nombre: 'Test de Recuperación', tipo: 'Especializado', tipoClass: 'badge-active', duracion: '4 horas', publico: 'TI / Operaciones', modalidad: 'Presencial', fecha: '18-Feb-2026', estado: 'Programado', estadoClass: 'badge-warning' }
  ];
  
  cursos.forEach(c => {
    tbody.innerHTML += `<tr>
      <td><strong>${c.nombre}</strong></td>
      <td><span class="badge ${c.tipoClass}">${c.tipo}</span></td>
      <td style="font-size: 12px;">${c.duracion}</td>
      <td style="font-size: 12px;">${c.publico}</td>
      <td style="font-size: 12px;">${c.modalidad}</td>
      <td style="font-size: 12px;">${c.fecha}</td>
      <td><span class="badge ${c.estadoClass}">${c.estado}</span></td>
    </tr>`;
  });
}

function renderCapacitacionSimulacros() {
  const tbody = document.getElementById('capacitacion-simulacros-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const simulacros = [
    { tipo: 'BCP', fecha: '10-Nov-2025', participacion: '92%', resultado: 'Exitoso', resultClass: 'badge-success' },
    { tipo: 'Crisis', fecha: '15-Oct-2025', participacion: '88%', resultado: 'Exitoso', resultClass: 'badge-success' },
    { tipo: 'DRP', fecha: '20-Sep-2025', participacion: '95%', resultado: 'Con observaciones', resultClass: 'badge-warning' },
    { tipo: 'BCP', fecha: '05-Ago-2025', participacion: '90%', resultado: 'Exitoso', resultClass: 'badge-success' }
  ];
  
  simulacros.forEach(s => {
    tbody.innerHTML += `<tr>
      <td><span class="badge badge-info">${s.tipo}</span></td>
      <td style="font-size: 12px;">${s.fecha}</td>
      <td style="font-size: 12px;">${s.participacion}</td>
      <td><span class="badge ${s.resultClass}">${s.resultado}</span></td>
    </tr>`;
  });
}

function renderCapacitacionChart() {
  const ctx = document.getElementById('capacitacion-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Cobertura (%)',
        data: [72, 74, 76, 78, 79, 81, 82, 83, 84, 85, 86, 87],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false, min: 70, max: 100 } }
    }
  });
}

/**
 * ============================================================================
 * GESTIÓN DE CAMBIOS BCMS - Funciones de renderizado
 * ============================================================================
 */

function renderCambiosKPIs() {
  const container = document.getElementById('cambios-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const kpis = [
    { title: 'Cambios 2025', value: '18', subtitle: '12 aprobados | 4 pendientes', icon: 'bi-clipboard-data', variant: 'primary' },
    { title: 'Tiempo Promedio Aprobación', value: '5.2 días', subtitle: '↓ -1.8d vs 2024 | Meta: 7 días', icon: 'bi-clock', variant: 'secondary' },
    { title: 'Tasa de Implementación Exitosa', value: '95.8%', subtitle: '11/12 sin rollback', icon: 'bi-check-circle', variant: 'secondary' }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({ container, title: kpi.title, value: kpi.value, subtitle: kpi.subtitle, icon: kpi.icon, variant: kpi.variant });
  });
}

function renderCambiosTable() {
  const tbody = document.getElementById('tbody-cambios');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const cambios = [
    { id: 'CHG-2025-012', fecha: '15-Dic-2025', tipo: 'Políticas', tipoClass: 'badge-info', desc: 'Actualización Política de Continuidad Ley 21.663', solicitante: 'M. González - CISO', impacto: 'Medio', impactoClass: 'badge-warning', estado: 'Aprobado', estadoClass: 'badge-success' },
    { id: 'CHG-2025-011', fecha: '10-Dic-2025', tipo: 'Planes BCP', tipoClass: 'badge-active', desc: 'Actualización RTO/RPO BCP-001', solicitante: 'C. Morales - BCM', impacto: 'Alto', impactoClass: 'badge-danger', estado: 'Implementado', estadoClass: 'badge-success' },
    { id: 'CHG-2025-010', fecha: '05-Dic-2025', tipo: 'Roles', tipoClass: 'badge-warning', desc: 'Nuevo miembro Comité Crisis', solicitante: 'A. Silva - RRHH', impacto: 'Bajo', impactoClass: 'badge-info', estado: 'Aprobado', estadoClass: 'badge-success' },
    { id: 'CHG-2025-009', fecha: '28-Nov-2025', tipo: 'Controles', tipoClass: 'badge-danger', desc: 'Nuevo control para Ley 21.663', solicitante: 'M. González - CISO', impacto: 'Medio', impactoClass: 'badge-warning', estado: 'En Evaluación', estadoClass: 'badge-active' },
    { id: 'CHG-2025-008', fecha: '20-Nov-2025', tipo: 'Infraestructura', tipoClass: 'badge-primary', desc: 'Migración a sitio alterno secundario', solicitante: 'R. Torres - TI', impacto: 'Alto', impactoClass: 'badge-danger', estado: 'Pendiente', estadoClass: 'badge-warning' }
  ];
  
  cambios.forEach(c => {
    tbody.innerHTML += `<tr>
      <td><strong>${c.id}</strong></td>
      <td style="font-size: 12px;">${c.fecha}</td>
      <td><span class="badge ${c.tipoClass}">${c.tipo}</span></td>
      <td style="font-size: 12px;">${c.desc}</td>
      <td style="font-size: 12px;">${c.solicitante}</td>
      <td><span class="badge ${c.impactoClass}">${c.impacto}</span></td>
      <td><span class="badge ${c.estadoClass}">${c.estado}</span></td>
    </tr>`;
  });
}

function renderCambiosChart() {
  const ctx = document.getElementById('cambios-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Políticas', 'Planes BCP', 'Roles', 'Controles', 'Infraestructura'],
      datasets: [{
        label: 'Cantidad de Cambios',
        data: [5, 4, 3, 4, 2],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/**
 * ============================================================================
 * USUARIOS & ACCESOS - Funciones de renderizado
 * ============================================================================
 */

function renderUsuariosKPIs() {
  const container = document.getElementById('usuarios-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const usuarios = BCMSDataStore.api.getAll('users') || [];
  const roles = BCMSDataStore.api.getAll('roles') || [];
  const usuariosActivos = usuarios.filter(u => u.isActive);
  const admins = usuarios.filter(u => u.profile === 'Administrador');
  const mfaEnabled = usuarios.filter(u => u.mfaEnabled);
  
  const kpis = [
    { title: 'Usuarios Registrados', value: usuarios.length.toString(), subtitle: `${usuariosActivos.length} activos`, icon: 'bi-persons', variant: 'primary' },
    { title: 'Roles Activos', value: roles.length.toString(), subtitle: 'RBAC configurado', icon: 'bi-shield-lock', variant: 'secondary' },
    { title: 'Administradores', value: admins.length.toString(), subtitle: `${Math.round((admins.length/usuarios.length)*100)}% del total`, icon: 'bi-gem', variant: 'primary' },
    { title: 'Accesos Últimas 24h', value: '14', subtitle: '77.8% actividad', icon: 'bi-clock', variant: 'primary' },
    { title: 'MFA Habilitado', value: `${mfaEnabled.length}/${usuarios.length}`, subtitle: '100% cobertura', icon: 'bi-shield-shaded', variant: 'secondary' }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({ container, title: kpi.title, value: kpi.value, subtitle: kpi.subtitle, icon: kpi.icon, variant: kpi.variant });
  });
}

function renderUsuariosRBAC() {
  const tbody = document.getElementById('usuarios-rbac-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const roles = BCMSDataStore.api.getAll('roles') || [];
  
  const permissionBadge = (perm) => {
    if (perm === 'Full') return '<span class="badge badge-success">Full</span>';
    if (perm === 'RW') return '<span class="badge badge-success">Lectura/Escritura</span>';
    if (perm === 'R') return '<span class="badge badge-info">Lectura</span>';
    return '<span class="badge badge-danger">Sin acceso</span>';
  };
  
  roles.forEach(role => {
    const p = role.permissions;
    tbody.innerHTML += `<tr>
      <td><strong><i class="bi bi-person"></i> ${role.name}</strong></td>
      <td>${permissionBadge(p.dashboard)}</td>
      <td>${permissionBadge(p.riesgos)}</td>
      <td>${permissionBadge(p.bcpdrp)}</td>
      <td>${permissionBadge(p.incidentes)}</td>
      <td>${permissionBadge(p.crisis)}</td>
      <td>${permissionBadge(p.pruebas)}</td>
      <td>${permissionBadge(p.auditoria)}</td>
      <td>${permissionBadge(p.config)}</td>
      <td>${permissionBadge(p.reportes)}</td>
      <td>${permissionBadge(p.usuarios)}</td>
    </tr>`;
  });
}

function renderUsuariosTable() {
  const tbody = document.getElementById('usuarios-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const usuarios = BCMSDataStore.api.getAll('users') || [];
  
  const profileColors = {
    'Administrador': 'badge-danger',
    'BCM Manager': 'badge-warning',
    'Auditor': 'badge-info',
    'Analista BCMS': 'badge-active',
    'Viewer': 'badge-secondary'
  };
  
  usuarios.forEach(user => {
    const lastAccess = user.lastAccess ? new Date(user.lastAccess).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A';
    tbody.innerHTML += `<tr>
      <td><strong>${user.firstName} ${user.lastName}</strong></td>
      <td style="font-size: 12px;">${user.email}</td>
      <td><span class="badge ${profileColors[user.profile] || 'badge-secondary'}">${user.profile}</span></td>
      <td style="font-size: 12px;">${lastAccess}</td>
      <td><span class="badge ${user.mfaEnabled ? 'badge-success' : 'badge-danger'}">${user.mfaEnabled ? 'Sí' : 'No'}</span></td>
      <td><span class="badge ${user.isActive ? 'badge-success' : 'badge-expired'}">${user.isActive ? 'Activo' : 'Inactivo'}</span></td>
      <td class="actions-cell">
        <button class="btn btn-outline" onclick="showToast('Editar usuario ${user.firstName} ${user.lastName}', 'info')">
          <i class="bi bi-pencil"></i> Editar
        </button>
      </td>
    </tr>`;
  });
}

/**
 * ============================================================================
 * REPORTES EJECUTIVOS - Funciones de renderizado
 * ============================================================================
 */

function renderReportesKPIs() {
  const container = document.getElementById('reportes-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const kpis = [
    { title: 'Reportes Generados', value: '142', subtitle: '+18 este mes', icon: 'bi-graph-up', variant: 'primary' },
    { title: 'Programados', value: '28', subtitle: '12 semanales, 16 mensuales', icon: 'bi-calendar-check', variant: 'secondary' },
    { title: 'Exportaciones', value: '385', subtitle: 'PDF (62%), Excel (38%)', icon: 'bi-box-arrow-up-right', variant: 'primary' },
    { title: 'Integraciones BI', value: '3', subtitle: 'Power BI, Tableau, Qlik', icon: 'bi-link-45deg', variant: 'secondary' }
  ];
  
  kpis.forEach(kpi => {
    new KPICard({ container, title: kpi.title, value: kpi.value, subtitle: kpi.subtitle, icon: kpi.icon, variant: kpi.variant });
  });
}

function renderReportesTable() {
  const tbody = document.getElementById('reportes-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const reportes = [
    { nombre: 'Dashboard Directorio', generado: '11-Dic-2025 10:30', periodo: 'Nov 2025', formato: 'PDF', usuario: 'C. Mendoza', tamano: '2.4 MB' },
    { nombre: 'Cumplimiento Ley 21.663', generado: '10-Dic-2025 15:20', periodo: 'Q4 2025', formato: 'PDF', usuario: 'M. González', tamano: '1.8 MB' },
    { nombre: 'Estado BCMS', generado: '09-Dic-2025 09:15', periodo: 'Nov 2025', formato: 'Excel', usuario: 'J. Pérez', tamano: '3.2 MB' },
    { nombre: 'Matriz de Riesgos', generado: '08-Dic-2025 14:45', periodo: 'Q4 2025', formato: 'PDF', usuario: 'M. García', tamano: '1.5 MB' },
    { nombre: 'Reporte Incidentes', generado: '05-Dic-2025 11:00', periodo: 'Nov 2025', formato: 'Excel', usuario: 'A. López', tamano: '2.1 MB' },
    { nombre: 'Resultados Pruebas', generado: '03-Dic-2025 16:30', periodo: 'Q4 2025', formato: 'PDF', usuario: 'P. Morales', tamano: '1.9 MB' }
  ];
  
  reportes.forEach(r => {
    tbody.innerHTML += `<tr>
      <td><strong>${r.nombre}</strong></td>
      <td style="font-size: 12px;">${r.generado}</td>
      <td style="font-size: 12px;">${r.periodo}</td>
      <td><span class="badge ${r.formato === 'PDF' ? 'badge-danger' : 'badge-success'}">${r.formato}</span></td>
      <td style="font-size: 12px;">${r.usuario}</td>
      <td style="font-size: 12px;">${r.tamano}</td>
      <td>
        <button class="btn-secondary btn-sm"><i class="bi bi-download"></i></button>
      </td>
    </tr>`;
  });
}

/**
 * ============================================================================
 * CONFIGURACIÓN - Funciones de renderizado
 * ============================================================================
 */

/**
 * Renderiza los KPIs de la vista Configuración usando el componente KPICard
 */
function renderConfiguracionKPIs() {
  const container = document.getElementById('configuracion-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const kpis = [
    {
      title: 'Integraciones Activas',
      value: '8',
      trend: '2 agregadas este mes',
      subtitle: '4 sistemas | 4 canales',
      icon: 'bi-plug',
      variant: 'success'
    },
    {
      title: 'API Calls (24h)',
      value: '12,547',
      trend: '+8.3%',
      subtitle: 'vs promedio 7 días',
      icon: 'bi-code-slash',
      variant: 'primary'
    },
    {
      title: 'Canales Operativos',
      value: '4/4',
      trend: '100%',
      subtitle: 'Email | SMS | Teams | Web',
      icon: 'bi-broadcast',
      variant: 'success'
    },
    {
      title: 'Backups Diarios',
      value: '3',
      subtitle: 'Último: hace 2 horas',
      icon: 'bi-database',
      variant: 'neutral'
    }
  ];
  
  kpis.forEach(kpi => {
    const kpiCard = new KPICard({
      container: container,
      title: kpi.title,
      value: kpi.value,
      trend: kpi.trend,
      subtitle: kpi.subtitle,
      icon: kpi.icon,
      variant: kpi.variant
    });
  });
}

/**
 * Renderiza los gráficos de la vista Configuración usando Chart.js
 */
function renderConfiguracionCharts() {
  // No hay gráficos en la vista de Configuración actualmente
}

/**
 * Renderiza los KPIs de la vista Gobierno usando el componente KPICard
 */
function renderGobiernoKPIs() {
  const container = document.getElementById('gobierno-kpis-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const kpis = [
    {
      title: 'Políticas Vigentes',
      value: '14',
      subtitle: 'BCMS + Ciber + RRHH',
      icon: 'bi-file-earmark-text',
      variant: 'primary'
    },
    {
      title: 'Estrategias Activas',
      value: '3',
      subtitle: '2025-2027',
      icon: 'bi-diagram-3',
      variant: 'neutral'
    },
    {
      title: 'Objetivos Trazados',
      value: '8',
      trend: '75% cumplidos',
      subtitle: '6 cumplidos | 2 en curso',
      icon: 'bi-bullseye',
      variant: 'success'
    },
    {
      title: 'Roles Definidos',
      value: '12',
      subtitle: 'Gobierno BCMS',
      icon: 'bi-people-fill',
      variant: 'primary'
    },
    {
      title: 'Estándares Adoptados',
      value: '5',
      subtitle: 'ISO + NIST + Ley',
      icon: 'bi-patch-check',
      variant: 'success'
    }
  ];
  
  kpis.forEach(kpi => {
    const kpiCard = new KPICard({
      container: container,
      title: kpi.title,
      value: kpi.value,
      trend: kpi.trend,
      subtitle: kpi.subtitle,
      icon: kpi.icon,
      variant: kpi.variant
    });
  });
}

/**
 * Renderiza los gráficos de la vista Gobierno usando Chart.js
 */
function renderGobiernoCharts() {
  // Gráfico 1: Distribución de Políticas por Área (Doughnut)
  const ctx1 = document.getElementById('gobierno-politicas-chart');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['BCMS', 'Seguridad Info', 'Ciberseguridad', 'RRHH', 'Otros'],
        datasets: [{
          label: 'Políticas',
          data: [5, 4, 2, 2, 1],
          backgroundColor: [
            '#3b82f6', // azul
            '#10b981', // verde
            '#ef4444', // rojo
            '#f59e0b', // amarillo
            '#8b5cf6'  // violeta
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 11
              }
            }
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} políticas (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  // Gráfico 2: Cumplimiento de Objetivos BCMS (Horizontal Bar)
  const ctx2 = document.getElementById('gobierno-objetivos-chart');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: [
          'Madurez BCMS 95%',
          'Reducir Impacto 40%',
          'RTO < 4h',
          'Cobertura BIA 100%',
          'Certificación ISO',
          'Simulacros Trimestrales',
          'Site Backup Tier III',
          'Automatización Failover'
        ],
        datasets: [{
          label: 'Cumplimiento (%)',
          data: [68, 45, 92, 88, 75, 100, 60, 55],
          backgroundColor: function(context) {
            const value = context.parsed.x;
            if (value >= 90) return '#10b981'; // verde
            if (value >= 70) return '#f59e0b'; // amarillo
            return '#ef4444'; // rojo
          },
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.x}% completado`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              font: {
                size: 10
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            ticks: {
              font: {
                size: 10
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}

/**
 * Muestra un tab específico en la vista Gobierno
 * @param {string} tabName - Nombre del tab
 */
function showGobiernoTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.gobierno-tab').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Mostrar el tab seleccionado
  const selectedTab = document.getElementById(`gobierno-${tabName}`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // Actualizar botones activos
  const container = document.querySelector('#view-gobierno > div:nth-child(2)');
  if (container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const buttons = container.querySelectorAll('.tab-btn');
    const tabIndex = { 'politicas': 0, 'estrategias': 1, 'objetivos': 2, 'roles': 3, 'paises': 4, 'estandares': 5 };
    if (buttons[tabIndex[tabName]]) {
      buttons[tabIndex[tabName]].classList.add('active');
    }
  }
  
  // Renderizar contenido dinámico si es necesario
  if (tabName === 'objetivos') {
    renderGobiernoObjetivos();
  } else if (tabName === 'roles') {
    renderGobiernoRoles();
  } else if (tabName === 'paises') {
    renderGobiernoPaises();
  } else if (tabName === 'estandares') {
    renderGobiernoEstandares();
  }
}

/**
 * Renderiza la tabla de objetivos BCMS
 */
function renderGobiernoObjetivos() {
  const container = document.getElementById('gobierno-objetivos-table-container');
  if (!container) return;
  
  const objetivos = BCMSDataStore.entities.bcmsObjectives || [];
  
  let html = `
    <table style="margin-top: 16px;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Objetivo</th>
          <th>Meta</th>
          <th>Actual</th>
          <th>% Logro</th>
          <th>Responsable</th>
          <th>Fecha Límite</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  objetivos.forEach(obj => {
    const logro = obj.currentValue && obj.targetValue ? Math.round((obj.currentValue / obj.targetValue) * 100) : 0;
    const statusClass = logro >= 100 ? 'success' : (logro >= 75 ? 'warning' : 'danger');
    const statusLabel = logro >= 100 ? 'Cumplido' : 'En Progreso';
    
    html += `
      <tr>
        <td><b>${obj.objectiveCode}</b></td>
        <td>${obj.objectiveName}</td>
        <td>${obj.targetValue} ${obj.measureUnit}</td>
        <td>${obj.currentValue} ${obj.measureUnit}</td>
        <td>
          <div style="background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(logro, 100)}%; height: 100%; background: var(--accent-${statusClass}); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #fff;">
              ${logro}%
            </div>
          </div>
        </td>
        <td>${obj.ownerName}</td>
        <td>${new Date(obj.targetDate).toLocaleDateString('es-CL')}</td>
        <td><span class="badge badge-${statusClass}">${statusLabel}</span></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

/**
 * Renderiza la tabla de roles BCMS
 */
function renderGobiernoRoles() {
  const container = document.getElementById('gobierno-roles-table-container');
  if (!container) return;
  
  // Datos de ejemplo (deberían venir del datastore)
  const roles = [
    { nombre: 'Sponsor Ejecutivo BCMS', titular: 'Juan Pérez', cargo: 'CEO', suplente: 'María González', area: 'Dirección Ejecutiva', responsabilidades: 'Aprobar políticas, estrategias y presupuesto BCMS. Liderazgo en crisis nivel 3.', nivel: 'Nivel 1', contacto: '+56912345678' },
    { nombre: 'BCMS Manager', titular: 'Carlos Rodríguez', suplente: 'Ana Martínez', area: 'Riesgos', responsabilidades: 'Diseñar, implementar y mantener BCMS. Coordinar BIA, planes, pruebas. Reportar a sponsor.', nivel: 'Nivel 2', contacto: '+56987654321' },
    { nombre: 'CISO', titular: 'Roberto Silva', suplente: 'Patricia López', area: 'TI / Seguridad', responsabilidades: 'Liderar ciberseguridad, cumplimiento Ley 21.663, gestión de controles, respuesta incidentes ciber.', nivel: 'Nivel 2', contacto: '+56911223344' }
  ];
  
  let html = `
    <table style="margin-top: 16px;">
      <thead>
        <tr>
          <th>Rol</th>
          <th>Titular</th>
          <th>Suplente</th>
          <th>Área</th>
          <th>Responsabilidades Clave</th>
          <th>Nivel Autoridad</th>
          <th>Contacto</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  roles.forEach(rol => {
    const nivelClass = rol.nivel === 'Nivel 1' ? 'critical' : (rol.nivel === 'Nivel 2' ? 'warning' : 'info');
    html += `
      <tr>
        <td><b>${rol.nombre}</b></td>
        <td>${rol.titular}${rol.cargo ? `<br><span style="font-size: 10px; color: var(--text-muted);">${rol.cargo}</span>` : ''}</td>
        <td>${rol.suplente}</td>
        <td>${rol.area}</td>
        <td style="font-size: 11px;">${rol.responsabilidades}</td>
        <td><span class="badge badge-${nivelClass}">${rol.nivel}</span></td>
        <td>${rol.contacto}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

/**
 * Renderiza la tabla de países
 */
function renderGobiernoPaises() {
  const container = document.getElementById('gobierno-paises-table-container');
  if (!container) return;
  
  // Datos de ejemplo
  const paises = [
    { nombre: 'Chile', bandera: '🇨🇱', ciudad: 'Santiago', tipo: 'HQ + Operaciones', procesos: 18, personal: 450, siteStatus: 'Primary Site', normativa: 'Ley 21.663, CMF', responsable: 'Carlos Rodríguez' },
    { nombre: 'México', bandera: '🇲🇽', ciudad: 'Ciudad de México', tipo: 'Operaciones Regionales', procesos: 8, personal: 120, siteStatus: 'Regional Hub', normativa: 'CNBV, LFPIORPI', responsable: 'Ana Martínez' },
    { nombre: 'Perú', bandera: '🇵🇪', ciudad: 'Lima', tipo: 'Soporte & Servicios', procesos: 3, personal: 60, siteStatus: 'Support Center', normativa: 'SBS Perú', responsable: 'Diego Morales' }
  ];
  
  let html = `
    <table style="margin-top: 16px;">
      <thead>
        <tr>
          <th>País</th>
          <th>Ciudad Principal</th>
          <th>Tipo Operación</th>
          <th>Procesos Críticos</th>
          <th>Personal</th>
          <th>Site Status</th>
          <th>Normativa Local</th>
          <th>Responsable BCMS</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  paises.forEach(pais => {
    const statusClass = pais.siteStatus.includes('Primary') ? 'success' : 'info';
    html += `
      <tr>
        <td><b>${pais.nombre}</b></td>
        <td>${pais.ciudad}</td>
        <td>${pais.tipo}</td>
        <td>${pais.procesos}</td>
        <td>${pais.personal}</td>
        <td><span class="badge badge-${statusClass}">${pais.siteStatus}</span></td>
        <td>${pais.normativa}</td>
        <td>${pais.responsable}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

/**
 * Renderiza la tabla de estándares y certificaciones
 */
function renderGobiernoEstandares() {
  const container = document.getElementById('gobierno-estandares-table-container');
  if (!container) return;
  
  const estandares = BCMSDataStore.entities.complianceFrameworks || [];
  
  let html = `
    <div style="margin-top: 16px;">
      <table>
        <thead>
          <tr>
            <th>Marco Normativo</th>
            <th>Versión</th>
            <th>Estado</th>
            <th>Fecha Emisión</th>
            <th>Vencimiento</th>
            <th>Entidad Certificadora</th>
            <th>Próxima Auditoría</th>
            <th>% Cumplimiento</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  estandares.forEach(std => {
    const compliance = Math.floor(Math.random() * 20) + 80; // Simulado 80-100%
    const statusClass = std.isActive ? 'success' : 'neutral';
    
    html += `
      <tr>
        <td><b>${std.name}</b><br><span style="font-size: 10px; color: var(--text-muted);">${std.code}</span></td>
        <td>${std.version}</td>
        <td><span class="badge badge-${statusClass}">${std.isActive ? 'Activo' : 'Inactivo'}</span></td>
        <td>-</td>
        <td>-</td>
        <td>${std.issuingBody}</td>
        <td>-</td>
        <td>
          <div style="background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${compliance}%; height: 100%; background: var(--accent-secondary); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #fff;">
              ${compliance}%
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

function getLatestSupplierAssessment(assessments, supplierId) {
  const matches = assessments.filter(a => a.supplierId === supplierId);
  if (!matches.length) return null;
  return matches.sort((a, b) => new Date(b.assessmentDate) - new Date(a.assessmentDate))[0];
}

function getLatestSupplierContract(contracts, supplierId) {
  const matches = contracts.filter(c => c.supplierId === supplierId);
  if (!matches.length) return null;
  return matches.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getReviewStatus(assessment, warningDays) {
  if (!assessment || !assessment.nextReviewDate) return 'missing';
  const days = getDaysUntil(assessment.nextReviewDate);
  if (days === null) return 'missing';
  if (days < 0) return 'expired';
  if (days <= warningDays) return 'due';
  return 'valid';
}

function getContractStatus(contract, warningDays) {
  if (!contract || !contract.endDate) return 'missing';
  const days = getDaysUntil(contract.endDate);
  if (days === null) return 'missing';
  if (days < 0) return 'expired';
  if (days <= warningDays) return 'due';
  return 'valid';
}

function getRiskLabelFromScore(score) {
  if (score >= 8) return 'Alto';
  if (score >= 6) return 'Medio';
  return 'Bajo';
}

function getRiskLabelFromLevel(level) {
  const mapping = {
    LOW: 'Bajo',
    MEDIUM: 'Medio',
    HIGH: 'Alto',
    CRITICAL: 'Crítico'
  };
  return mapping[level] || 'Medio';
}

function getRiskBadgeClass(label) {
  const mapping = {
    'Crítico': 'badge-danger',
    'Alto': 'badge-danger',
    'Medio': 'badge-warning',
    'Bajo': 'badge-success'
  };
  return mapping[label] || 'badge-neutral';
}

function getSupplierCriticalityBadge(criticality) {
  const label = BCMSDataStore.api.getLookupLabel('businessCriticality', criticality) || criticality;
  const badgeClass = getRiskBadgeClass(label);
  return { label, badgeClass };
}

function getAssessmentStatusLabel(status) {
  const mapping = {
    APPROVED: 'Aprobado',
    IN_REVIEW: 'En revisión',
    PENDING: 'Pendiente',
    REJECTED: 'Rechazado'
  };
  return mapping[status] || status || 'Pendiente';
}

function getAssessmentStatusBadge(status) {
  const mapping = {
    APPROVED: 'badge-success',
    IN_REVIEW: 'badge-warning',
    PENDING: 'badge-warning',
    REJECTED: 'badge-danger'
  };
  return mapping[status] || 'badge-warning';
}

function renderProveedoresRegistroTable() {
  const tbody = document.getElementById('tbody-proveedores-criticos');
  if (!tbody) return;

  const suppliers = BCMSDataStore.api.getAll('suppliers').filter(s => !s.isDeleted);
  const assessments = BCMSDataStore.api.getAll('supplierAssessments');
  const dependencies = BCMSDataStore.api.getAll('biaDependencies');
  const processes = BCMSDataStore.api.getAll('processes');

  tbody.innerHTML = suppliers.map(supplier => {
    const latestAssessment = getLatestSupplierAssessment(assessments, supplier.id);
    const assessmentDate = latestAssessment ? formatDate(latestAssessment.assessmentDate) : '-';
    const assessmentStatus = latestAssessment ? getAssessmentStatusLabel(latestAssessment.status) : 'Sin evaluación';
    const assessmentStatusClass = latestAssessment ? getAssessmentStatusBadge(latestAssessment.status) : 'badge-warning';
    const riskScore = latestAssessment && typeof latestAssessment.overallScore === 'number'
      ? Math.max(0, (100 - latestAssessment.overallScore) / 10)
      : null;
    const riskLabel = latestAssessment
      ? (latestAssessment.riskLevel ? getRiskLabelFromLevel(latestAssessment.riskLevel) : getRiskLabelFromScore(riskScore || 0))
      : 'Sin evaluación';
    const riskBadgeClass = getRiskBadgeClass(riskLabel);
    const riskText = riskScore !== null
      ? `${riskLabel} (${riskScore.toFixed(1)}/10)`
      : riskLabel;

    const relatedDeps = dependencies.filter(dep =>
      dep.dependencyType === 'SUPPLIER' &&
      (dep.referenceId === supplier.code || dep.referenceName === supplier.name)
    );
    const processNames = relatedDeps.map(dep => {
      const process = processes.find(p => p.id === dep.processId);
      return process ? process.name : null;
    }).filter(Boolean);
    const uniqueProcessNames = [...new Set(processNames)];
    let processSummary = '-';
    if (uniqueProcessNames.length) {
      const preview = uniqueProcessNames.slice(0, 2).join(', ');
      const suffix = uniqueProcessNames.length > 2 ? ` +${uniqueProcessNames.length - 2}` : '';
      processSummary = `${uniqueProcessNames.length} proceso${uniqueProcessNames.length > 1 ? 's' : ''}: ${preview}${suffix}`;
    }

    const supplierType = supplier.supplierType || supplier.type || '-';
    const criticalityBadge = getSupplierCriticalityBadge(supplier.criticality);
    const slaSummary = supplier.slaSummary || '-';
    const slaBadgeClass = slaSummary !== '-' ? 'badge-success' : 'badge-neutral';

    return `
      <tr data-row-id="proveedor-${supplier.id}">
        <td><strong>${supplier.name}</strong><br><span style="font-size: 10px; color: #6b7280;">ID fiscal: ${supplier.taxId || '-'}</span></td>
        <td><span class="badge badge-info">${supplierType}</span></td>
        <td><span class="badge ${criticalityBadge.badgeClass}">${criticalityBadge.label}</span></td>
        <td>${processSummary}</td>
        <td>${assessmentDate}<br><span style="font-size: 10px; color: #6b7280;"><span class="badge ${assessmentStatusClass}">${assessmentStatus}</span></span></td>
        <td><span class="badge ${riskBadgeClass}">${riskText}</span></td>
        <td><span class="badge ${slaBadgeClass}">${slaSummary}</span></td>
        <td><span class="badge ${supplier.isActive ? 'badge-success' : 'badge-warning'}">${supplier.isActive ? 'Activo' : 'Inactivo'}</span></td>
        <td class="actions-cell">
          <button class="btn btn-outline" onclick="showToast('Ver detalle de ${supplier.name}', 'info')">
            <i class="bi bi-eye"></i> Ver detalle
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Actualizar paginación
  const paginationEl = document.getElementById('pagination-proveedores-criticos');
  if (paginationEl) {
    const total = suppliers.length;
    paginationEl.querySelector('.page-info').textContent = `Página 1 de 1 (${total} registro${total !== 1 ? 's' : ''} mostrado${total !== 1 ? 's' : ''})`;
  }
}

function renderProveedoresEvaluacionesTable() {
  const tbody = document.getElementById('tbody-tprm-evaluaciones');
  if (!tbody) return;

  const assessments = BCMSDataStore.api.getAll('supplierAssessments');
  const suppliers = BCMSDataStore.api.getAll('suppliers');
  const reviewWindowDays = 30;

  const sorted = [...assessments].sort((a, b) => new Date(b.assessmentDate) - new Date(a.assessmentDate));
  tbody.innerHTML = sorted.map(assessment => {
    const supplier = suppliers.find(s => s.id === assessment.supplierId);
    const supplierName = supplier ? supplier.name : 'Proveedor no registrado';

    const inherentScore = typeof assessment.criticalityScore === 'number'
      ? assessment.criticalityScore / 10
      : null;
    const inherentLabel = inherentScore !== null ? getRiskLabelFromScore(inherentScore) : 'N/D';
    const inherentBadge = getRiskBadgeClass(inherentLabel);
    const inherentText = inherentScore !== null
      ? `${inherentLabel} (${inherentScore.toFixed(1)})`
      : inherentLabel;

    const residualScore = typeof assessment.overallScore === 'number'
      ? Math.max(0, (100 - assessment.overallScore) / 10)
      : null;
    const residualLabel = getRiskLabelFromLevel(assessment.riskLevel);
    const residualBadge = getRiskBadgeClass(residualLabel);
    const residualText = residualScore !== null
      ? `${residualLabel} (${residualScore.toFixed(1)})`
      : residualLabel;

    const statusLabel = getAssessmentStatusLabel(assessment.status);
    const statusBadge = getAssessmentStatusBadge(assessment.status);
    const reviewStatus = getReviewStatus(assessment, reviewWindowDays);
    const reviewBadge = reviewStatus === 'expired'
      ? '<span class="badge badge-danger">Vencida</span>'
      : reviewStatus === 'due'
        ? '<span class="badge badge-warning">Por vencer</span>'
        : '';
    const reviewDate = formatDate(assessment.nextReviewDate);
    const reviewInfo = reviewBadge ? `${reviewDate}<br>${reviewBadge}` : reviewDate;

    return `
      <tr data-row-id="evaluacion-${assessment.id}" onclick="toggleDetalleEvaluacionTPRM()" style="cursor: pointer;">
        <td><strong>${supplierName}</strong></td>
        <td>${formatDate(assessment.assessmentDate)}</td>
        <td><span class="badge ${inherentBadge}">${inherentText}</span></td>
        <td><span class="badge ${residualBadge}">${residualText}</span></td>
        <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
        <td>${reviewInfo}</td>
        <td class="actions-cell">
          <button class="btn btn-outline" onclick="event.stopPropagation(); toggleDetalleEvaluacionTPRM()">
            <i class="bi bi-eye"></i> Ver Detalle
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Actualizar paginación
  const paginationEl = document.getElementById('pagination-tprm-evaluaciones');
  if (paginationEl) {
    const total = assessments.length;
    paginationEl.querySelector('.page-info').textContent = `Página 1 de 1 (${total} registro${total !== 1 ? 's' : ''} mostrado${total !== 1 ? 's' : ''})`;
  }
}

function renderProveedoresContingenciaTable() {
  const tbody = document.getElementById('tbody-tprm-contingencia');
  if (!tbody) return;

  const suppliers = BCMSDataStore.api.getAll('suppliers').filter(s => !s.isDeleted);
  const contracts = BCMSDataStore.api.getAll('supplierContracts');
  const assessments = BCMSDataStore.api.getAll('supplierAssessments');
  const reviewWindowDays = 30;

  tbody.innerHTML = suppliers.map(supplier => {
    const latestContract = getLatestSupplierContract(contracts, supplier.id);
    const latestAssessment = getLatestSupplierAssessment(assessments, supplier.id);
    const serviceType = supplier.supplierType || supplier.type || '-';
    const planSummary = supplier.slaSummary || (latestContract ? latestContract.slaTerms : '-') || '-';
    const contractStatus = latestContract ? latestContract.status : null;
    const statusLabel = contractStatus === 'ACTIVE' ? 'Vigente'
      : contractStatus === 'EXPIRED' ? 'Vencido'
      : contractStatus ? 'Revisar' : 'Sin contrato';
    const statusClass = contractStatus === 'ACTIVE' ? 'badge-success'
      : contractStatus === 'EXPIRED' ? 'badge-danger'
      : contractStatus ? 'badge-warning' : 'badge-neutral';

    let lastReview = '-';
    if (latestAssessment) {
      const reviewStatus = getReviewStatus(latestAssessment, reviewWindowDays);
      const reviewBadge = reviewStatus === 'expired'
        ? '<span class="badge badge-danger">Vencida</span>'
        : reviewStatus === 'due'
          ? '<span class="badge badge-warning">Por vencer</span>'
          : '<span class="badge badge-success">Vigente</span>';
      lastReview = `${formatDate(latestAssessment.assessmentDate)}<br>${reviewBadge}`;
    }

    return `
      <tr data-row-id="contingencia-${supplier.id}" onclick="toggleDetallePlanContingencia()" style="cursor: pointer;">
        <td><strong>${supplier.name}</strong></td>
        <td>${serviceType}</td>
        <td>${planSummary}</td>
        <td>-</td>
        <td><span class="badge badge-neutral">N/D</span></td>
        <td>${lastReview}</td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td class="actions-cell">
          <button class="btn btn-outline" onclick="event.stopPropagation(); toggleDetallePlanContingencia()">
            <i class="bi bi-eye"></i> Ver Detalle
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Actualizar paginación
  const paginationEl = document.getElementById('pagination-tprm-contingencia');
  if (paginationEl) {
    const total = suppliers.length;
    paginationEl.querySelector('.page-info').textContent = `Página 1 de 1 (${total} registro${total !== 1 ? 's' : ''} mostrado${total !== 1 ? 's' : ''})`;
  }
}

/**
 * Toggle del panel de detalle de evaluación TPRM
 */
function toggleDetalleEvaluacionTPRM() {
  const panel = document.getElementById('detalle-evaluacion-tprm');
  if (panel) {
    if (panel.style.display === 'none' || !panel.style.display) {
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      panel.style.display = 'none';
    }
  }
}

/**
 * Toggle del panel de detalle de plan de contingencia
 */
function toggleDetallePlanContingencia() {
  const panel = document.getElementById('detalle-plan-contingencia');
  if (panel) {
    if (panel.style.display === 'none' || !panel.style.display) {
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      panel.style.display = 'none';
    }
  }
}

/**
 * Muestra un tab específico en los detalles TPRM
 * @param {string} tabName - Nombre del tab
 */
function mostrarTabTPRM(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tprm-tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Mostrar el tab seleccionado
  const selectedTab = document.getElementById(`tprm-tab-${tabName}`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // Actualizar botones activos
  const container = document.querySelector('#detalle-evaluacion-tprm .card-header').nextElementSibling;
  if (container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const buttons = container.querySelectorAll('.tab-btn');
    const tabIndex = { 'cuestionario': 0, 'evidencias': 1, 'mitigacion': 2, 'aprobaciones': 3 };
    if (buttons[tabIndex[tabName]]) {
      buttons[tabIndex[tabName]].classList.add('active');
    }
  }
}

/**
 * Muestra un tab específico en el detalle de plan de contingencia
 * @param {string} tabName - Nombre del tab
 */
function mostrarTabContingencia(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.contingencia-tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Mostrar el tab seleccionado
  const selectedTab = document.getElementById(`contingencia-tab-${tabName}`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // Actualizar botones activos
  const container = document.querySelector('#detalle-plan-contingencia .card-header').nextElementSibling;
  if (container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const buttons = container.querySelectorAll('.tab-btn');
    const tabIndex = { 'resumen': 0, 'disparadores': 1, 'acciones': 2, 'alternativos': 3 };
    if (buttons[tabIndex[tabName]]) {
      buttons[tabIndex[tabName]].classList.add('active');
    }
  }
}

/**
 * ============================================================================
 * HALLAZGOS & PLANES DE ACCIÓN - Funciones de renderizado
 * Vista: view-hallazgos | Entidad: findings + findingActions
 * ============================================================================
 */

function renderHallazgosView() {
  renderHallazgosKPIs();
  renderHallazgosTable();
}

function renderHallazgosKPIs() {
  const container = document.getElementById('hallazgos-kpis-container');
  if (!container) return;
  const findings = BCMSDataStore.entities.findings || [];
  const ncMajor = findings.filter(f => f.findingType === 'NC_MAJOR').length;
  const ncMinor = findings.filter(f => f.findingType === 'NC_MINOR').length;
  const obs = findings.filter(f => f.findingType === 'OBSERVATION').length;
  const open = findings.filter(f => ['OPEN','IN_PROGRESS'].includes(f.status)).length;
  const closed = findings.filter(f => f.status === 'CLOSED').length;
  container.innerHTML = new KPICard({ title: 'Total Hallazgos', value: findings.length, icon: 'bi-search' }).render() +
    new KPICard({ title: 'NC Mayor', value: ncMajor, icon: 'bi-exclamation-triangle', color: '#ef4444' }).render() +
    new KPICard({ title: 'NC Menor', value: ncMinor, icon: 'bi-exclamation-circle', color: '#f59e0b' }).render() +
    new KPICard({ title: 'Observaciones', value: obs, icon: 'bi-info-circle', color: '#6366f1' }).render() +
    new KPICard({ title: 'Abiertos', value: open, icon: 'bi-folder2-open', color: '#ef4444' }).render();
}

function renderHallazgosTable() {
  const tbody = document.getElementById('hallazgos-tbody');
  if (!tbody) return;
  const findings = BCMSDataStore.entities.findings || [];
  const audits = BCMSDataStore.entities.audits || [];
  const users = BCMSDataStore.entities.users || [];
  const actions = BCMSDataStore.entities.findingActions || [];
  tbody.innerHTML = findings.map(f => {
    const audit = audits.find(a => a.id === f.auditId);
    const user = users.find(u => u.id === f.responsibleUserId);
    const fActions = actions.filter(a => a.findingId === f.id);
    const completedActions = fActions.filter(a => a.status === 'COMPLETED').length;
    const totalActions = fActions.length;
    const typeBadge = f.findingType === 'NC_MAJOR' ? 'badge-danger' : f.findingType === 'NC_MINOR' ? 'badge-warning' : f.findingType === 'POSITIVE' ? 'badge-success' : 'badge-info';
    const typeLabel = f.findingType === 'NC_MAJOR' ? 'NC Mayor' : f.findingType === 'NC_MINOR' ? 'NC Menor' : f.findingType === 'POSITIVE' ? 'Positivo' : 'Observación';
    const sevBadge = f.severity === 'HIGH' ? 'badge-danger' : f.severity === 'MEDIUM' ? 'badge-warning' : f.severity === 'LOW' ? 'badge-info' : 'badge-success';
    const statusBadge = f.status === 'CLOSED' ? 'badge-success' : f.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info';
    const statusLabel = f.status === 'CLOSED' ? 'Cerrado' : f.status === 'IN_PROGRESS' ? 'En Progreso' : 'Abierto';
    return `<tr onclick="showDetalleHallazgo(${f.id})" style="cursor:pointer;">
      <td class="fw-600">${f.code}</td>
      <td>${audit ? audit.code : '-'}</td>
      <td>${f.relatedRequirementCode || '-'}</td>
      <td><span class="badge ${sevBadge}">${f.severity}</span></td>
      <td><span class="badge ${typeBadge}">${typeLabel}</span></td>
      <td class="fs-12">${f.title}</td>
      <td class="fs-12">${totalActions > 0 ? completedActions + '/' + totalActions + ' acciones' : 'Sin acciones'}</td>
      <td class="fs-12">${user ? user.fullName : '-'}</td>
      <td class="fs-12">${f.dueDate || '-'}</td>
      <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
    </tr>`;
  }).join('');
}

function showDetalleHallazgo(id) {
  const panel = document.getElementById('detalle-hallazgo');
  if (!panel) return;
  const f = BCMSDataStore.entities.findings.find(x => x.id === id);
  if (!f) return;
  const audits = BCMSDataStore.entities.audits || [];
  const users = BCMSDataStore.entities.users || [];
  const actions = BCMSDataStore.entities.findingActions.filter(a => a.findingId === id);
  const audit = audits.find(a => a.id === f.auditId);
  const user = users.find(u => u.id === f.responsibleUserId);
  const sevBadge = f.severity === 'HIGH' ? 'badge-danger' : f.severity === 'MEDIUM' ? 'badge-warning' : f.severity === 'LOW' ? 'badge-info' : 'badge-success';
  const statusBadge = f.status === 'CLOSED' ? 'badge-success' : f.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info';
  const statusLabel = f.status === 'CLOSED' ? 'Cerrado' : f.status === 'IN_PROGRESS' ? 'En Progreso' : 'Abierto';
  const completedActions = actions.filter(a => a.status === 'COMPLETED').length;
  const progressPct = actions.length > 0 ? Math.round((completedActions / actions.length) * 100) : 0;
  
  panel.innerHTML = `
    <div class="card mb-24" style="border-left: 4px solid ${f.severity === 'HIGH' ? '#ef4444' : f.severity === 'MEDIUM' ? '#f59e0b' : '#6366f1'};">
      <div class="card-header">
        <div>
          <h3><i class="bi bi-search"></i> ${f.code} - ${f.title}</h3>
          <div class="fs-12 color-muted mt-4">Hallazgo de ${audit ? audit.code + ' - ' + audit.title : 'auditoría no especificada'}</div>
        </div>
        <div class="d-flex gap-8">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('detalle-hallazgo').classList.add('d-none')"><i class="bi bi-x"></i> Cerrar</button>
        </div>
      </div>
      <div class="p-20">
        <div class="d-grid grid-3-equal gap-16 mb-24">
          <div><span class="fs-11 fw-600 color-muted">Auditoría Origen</span><div class="fs-13 mt-4">${audit ? audit.code : '-'}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Severidad</span><div class="mt-4"><span class="badge ${sevBadge}">${f.severity}</span></div></div>
          <div><span class="fs-11 fw-600 color-muted">Estado</span><div class="mt-4"><span class="badge ${statusBadge}">${statusLabel}</span></div></div>
          <div><span class="fs-11 fw-600 color-muted">Marco / Requisito</span><div class="fs-13 mt-4">${f.relatedRequirementCode || '-'}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Responsable</span><div class="fs-13 mt-4">${user ? user.fullName : '-'}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Fecha Límite</span><div class="fs-13 mt-4">${f.dueDate || '-'}</div></div>
        </div>
        <div class="mb-24">
          <h4 class="fs-13 fw-600 mb-8">Descripción del Hallazgo</h4>
          <p class="fs-13 color-secondary" style="line-height:1.6;">${f.description}</p>
        </div>
        ${f.rootCause ? `<div class="mb-24"><h4 class="fs-13 fw-600 mb-8">Causa Raíz</h4><p class="fs-13 color-secondary" style="line-height:1.6;">${f.rootCause}</p></div>` : ''}
        ${f.recommendation ? `<div class="mb-24"><h4 class="fs-13 fw-600 mb-8">Recomendación</h4><p class="fs-13 color-secondary" style="line-height:1.6;">${f.recommendation}</p></div>` : ''}
        <div class="mb-16">
          <h4 class="fs-13 fw-600 mb-8">Plan de Acción Correctiva</h4>
          <div class="d-flex ai-center gap-12 mb-12">
            <div class="progress-track flex-1"><div style="width:${progressPct}%; height:100%; background: var(--accent-primary); border-radius: 4px;"></div></div>
            <span class="fs-12 fw-600">${progressPct}%</span>
          </div>
          ${actions.length > 0 ? `<table class="fs-12"><thead><tr><th>Tipo</th><th>Descripción</th><th>Responsable</th><th>Fecha Límite</th><th>Estado</th></tr></thead><tbody>` + 
            actions.map(a => {
              const aUser = users.find(u => u.id === a.ownerUserId);
              const aBadge = a.status === 'COMPLETED' ? 'badge-success' : a.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info';
              const aLabel = a.status === 'COMPLETED' ? 'Completada' : a.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente';
              const tBadge = a.actionType === 'CORRECTIVE' ? 'badge-danger' : a.actionType === 'PREVENTIVE' ? 'badge-warning' : 'badge-info';
              return `<tr><td><span class="badge ${tBadge}">${a.actionType}</span></td><td>${a.description}</td><td>${aUser ? aUser.fullName : '-'}</td><td>${a.dueDate || '-'}</td><td><span class="badge ${aBadge}">${aLabel}</span></td></tr>`;
            }).join('') + `</tbody></table>` : '<p class="fs-12 color-muted">Sin acciones registradas</p>'}
        </div>
      </div>
    </div>`;
  panel.classList.remove('d-none');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * ============================================================================
 * LECCIONES APRENDIDAS - Funciones de renderizado
 * Vista: view-aprendizajes | Entidad: lessonsLearned
 * ============================================================================
 */

function renderAprendizajesView() {
  renderAprendizajesKPIs();
  renderAprendizajesRepositorio();
  renderAprendizajesInforme();
}

function renderAprendizajesKPIs() {
  const container = document.getElementById('aprendizajes-kpis-container');
  if (!container) return;
  const lessons = BCMSDataStore.entities.lessonsLearned || [];
  const implemented = lessons.filter(l => l.status === 'implemented' || l.status === 'validated').length;
  const inProgress = lessons.filter(l => l.status === 'in_progress').length;
  const totalImprovement = lessons.reduce((sum, l) => {
    if (l.effectivenessMetrics && l.effectivenessMetrics.improvement_percentage) return sum + l.effectivenessMetrics.improvement_percentage;
    return sum;
  }, 0);
  const avgImprovement = lessons.length > 0 ? Math.round(totalImprovement / lessons.length) : 0;
  container.innerHTML = new KPICard({ title: 'Lecciones Registradas', value: lessons.length, icon: 'bi-lightbulb' }).render() +
    new KPICard({ title: 'Mejoras Implementadas', value: implemented, icon: 'bi-check-circle', color: '#10b981' }).render() +
    new KPICard({ title: 'En Progreso', value: inProgress, icon: 'bi-clock', color: '#f59e0b' }).render() +
    new KPICard({ title: 'Impacto Promedio', value: avgImprovement + '%', icon: 'bi-graph-down-arrow', color: '#6366f1' }).render() +
    new KPICard({ title: 'Tasa Efectividad', value: Math.round((implemented / Math.max(lessons.length, 1)) * 100) + '%', icon: 'bi-trophy', color: '#10b981' }).render();
}

function renderAprendizajesRepositorio() {
  const container = document.getElementById('aprendizajes-repositorio');
  if (!container) return;
  const lessons = BCMSDataStore.entities.lessonsLearned || [];
  const users = BCMSDataStore.entities.users || [];
  
  container.innerHTML = lessons.map(l => {
    const user = users.find(u => u.id === l.responsibleId);
    const statusBadge = l.status === 'validated' ? 'badge-success' : l.status === 'implemented' ? 'badge-info' : 'badge-warning';
    const statusLabel = l.status === 'validated' ? 'Validada' : l.status === 'implemented' ? 'Implementada' : 'En Progreso';
    const priorBadge = l.priority === 'high' ? 'badge-danger' : l.priority === 'medium' ? 'badge-warning' : 'badge-info';
    const sourceLabel = l.sourceType === 'INCIDENT' ? 'Incidente' : l.sourceType === 'EXERCISE' ? 'Ejercicio' : l.sourceType;
    const metrics = l.effectivenessMetrics || {};
    
    return `<div class="card mb-16">
      <div class="card-header">
        <div>
          <h3 class="fs-14">${l.code} - ${l.title}</h3>
          <div class="d-flex gap-8 mt-4">
            <span class="badge ${priorBadge}">${l.priority}</span>
            <span class="badge badge-secondary">${sourceLabel}</span>
            <span class="badge ${statusBadge}">${statusLabel}</span>
            <span class="fs-11 color-muted">${l.lessonDate}</span>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.card').querySelector('.lesson-detail').classList.toggle('d-none')"><i class="bi bi-chevron-down"></i> Detalle</button>
      </div>
      <div class="lesson-detail d-none p-20">
        <div class="mb-16">
          <h4 class="fs-13 fw-600 mb-8">Lección Aprendida</h4>
          <p class="fs-13 color-secondary" style="line-height:1.6;">${l.description}</p>
        </div>
        <div class="d-grid grid-2-equal gap-20">
          <div>
            <h4 class="fs-13 fw-600 mb-8">Mejora Implementada</h4>
            <p class="fs-12 color-secondary mb-8">${l.improvementActions || l.actionsTaken || '-'}</p>
            <div class="fs-12"><strong>Responsable:</strong> ${user ? user.fullName : '-'}</div>
            <div class="fs-12 mt-4"><strong>Estado:</strong> <span class="badge ${statusBadge}">${statusLabel}</span></div>
          </div>
          <div>
            <h4 class="fs-13 fw-600 mb-8">Métricas de Efectividad</h4>
            ${Object.keys(metrics).length > 0 ? Object.entries(metrics).map(([k, v]) => 
              `<div class="d-flex jc-between fs-12 mb-4"><span class="color-muted">${k.replace(/_/g, ' ')}</span><span class="fw-600">${v}</span></div>`
            ).join('') : '<p class="fs-12 color-muted">Sin métricas definidas</p>'}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderAprendizajesInforme() {
  const container = document.getElementById('aprendizajes-informe');
  if (!container) return;
  const lessons = BCMSDataStore.entities.lessonsLearned || [];
  const implemented = lessons.filter(l => l.status === 'implemented' || l.status === 'validated').length;
  const bySource = {};
  lessons.forEach(l => { bySource[l.sourceType] = (bySource[l.sourceType] || 0) + 1; });
  
  container.innerHTML = `
    <div class="d-grid grid-2-equal gap-20">
      <div>
        <h4 class="fs-13 fw-600 mb-12">Métricas Clave</h4>
        <div class="d-flex jc-between fs-12 mb-8 pb-8 border-bottom-soft"><span>Total lecciones registradas</span><span class="fw-600">${lessons.length}</span></div>
        <div class="d-flex jc-between fs-12 mb-8 pb-8 border-bottom-soft"><span>Mejoras implementadas</span><span class="fw-600 color-green">${implemented}</span></div>
        <div class="d-flex jc-between fs-12 mb-8 pb-8 border-bottom-soft"><span>Tasa de cierre</span><span class="fw-600">${Math.round((implemented/Math.max(lessons.length,1))*100)}%</span></div>
        ${Object.entries(bySource).map(([k,v]) => `<div class="d-flex jc-between fs-12 mb-8 pb-8 border-bottom-soft"><span>Fuente: ${k}</span><span class="fw-600">${v}</span></div>`).join('')}
      </div>
      <div>
        <h4 class="fs-13 fw-600 mb-12">Resumen Ejecutivo</h4>
        <p class="fs-12 color-secondary" style="line-height:1.6;">
          El programa de lecciones aprendidas ha registrado <strong>${lessons.length}</strong> lecciones durante el período, 
          de las cuales <strong>${implemented}</strong> ya han sido implementadas o validadas. 
          La tasa de efectividad general del programa es del <strong>${Math.round((implemented/Math.max(lessons.length,1))*100)}%</strong>.
        </p>
      </div>
    </div>`;
}

/**
 * ============================================================================
 * PRUEBAS Y SIMULACROS - Funciones de renderizado
 * Vista: view-pruebas | Entidad: planTests + continuityPlans
 * ============================================================================
 */

function renderPruebasView() {
  renderPruebasKPIs();
  renderPruebasCalendario();
  renderPruebasEscenarios();
  renderPruebasTable();
}

function renderPruebasKPIs() {
  const container = document.getElementById('pruebas-kpis-container');
  if (!container) return;
  const tests = BCMSDataStore.entities.planTests || [];
  const scheduled = tests.filter(t => t.status === 'SCHEDULED').length;
  const completed = tests.filter(t => !t.status || t.status === 'COMPLETED');
  const avgSuccess = completed.length > 0 ? Math.round(completed.reduce((s,t) => s + (t.successRatePct||0), 0) / completed.length) : 0;
  const totalIssues = tests.reduce((s,t) => s + (t.issuesFound || 0), 0);
  const nextTest = tests.filter(t => t.status === 'SCHEDULED').sort((a,b) => a.testDate > b.testDate ? 1 : -1)[0];
  container.innerHTML = new KPICard({ title: 'Pruebas Programadas', value: tests.length, icon: 'bi-calendar-check' }).render() +
    new KPICard({ title: 'Tasa Éxito', value: avgSuccess + '%', icon: 'bi-check-circle', color: '#10b981' }).render() +
    new KPICard({ title: 'Hallazgos Abiertos', value: totalIssues, icon: 'bi-exclamation-triangle', color: '#f59e0b' }).render() +
    new KPICard({ title: 'Próxima Prueba', value: nextTest ? nextTest.testDate.substring(5,10) : '-', icon: 'bi-calendar-event', color: '#6366f1' }).render();
}

function renderPruebasCalendario() {
  const container = document.getElementById('pruebas-calendario');
  if (!container) return;
  const tests = BCMSDataStore.entities.planTests || [];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const typeColors = { 'TABLETOP': '#8b5cf6', 'SIMULATION': '#f59e0b', 'FULL_EXERCISE': '#ef4444', 'TECHNICAL_TEST': '#3b82f6', 'WALKTHROUGH': '#10b981' };
  
  let html = '<div style="display:grid; grid-template-columns: repeat(12, 1fr); gap:8px;">';
  months.forEach((m, i) => {
    const monthTests = tests.filter(t => { const d = new Date(t.testDate); return d.getMonth() === i; });
    html += `<div style="text-align:center; padding:8px 4px; background: ${monthTests.length > 0 ? '#f5f3ff' : '#f9fafb'}; border-radius:8px; border: 1px solid ${monthTests.length > 0 ? 'var(--accent-primary)' : '#e5e7eb'};">
      <div class="fs-11 fw-600 mb-4">${m}</div>
      ${monthTests.length > 0 ? monthTests.map(t => `<div style="width:8px;height:8px;border-radius:50%;background:${typeColors[t.testType]||'#6b7280'};margin:2px auto;" title="${t.title}"></div>`).join('') : '<div class="fs-10 color-muted">-</div>'}
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderPruebasEscenarios() {
  const container = document.getElementById('pruebas-escenarios');
  if (!container) return;
  const scenarios = [
    { type: 'Tabletop', icon: 'bi-people', color: '#8b5cf6', desc: 'Ejercicio de mesa con escenarios hipotéticos y discusión grupal', duration: '2-4 horas', complexity: 'Baja' },
    { type: 'Simulación', icon: 'bi-pc-display', color: '#f59e0b', desc: 'Prueba técnica con simulación parcial de disrupción en ambiente controlado', duration: '4-8 horas', complexity: 'Media' },
    { type: 'Ejercicio Real', icon: 'bi-lightning', color: '#ef4444', desc: 'Ejecución completa del plan con activación real de procedimientos de recuperación', duration: '8-24 horas', complexity: 'Alta' }
  ];
  container.innerHTML = `<div class="d-grid grid-3-equal gap-16">` + scenarios.map(s => `
    <div class="card" style="border-top: 3px solid ${s.color};">
      <div class="p-16">
        <div class="d-flex ai-center gap-8 mb-12"><i class="bi ${s.icon}" style="font-size:20px;color:${s.color}"></i><span class="fw-600 fs-14">${s.type}</span></div>
        <p class="fs-12 color-secondary mb-12" style="line-height:1.5;">${s.desc}</p>
        <div class="d-flex jc-between fs-11 color-muted"><span>Duración: ${s.duration}</span><span>Complejidad: ${s.complexity}</span></div>
      </div>
    </div>`).join('') + '</div>';
}

function renderPruebasTable() {
  const tbody = document.getElementById('pruebas-tbody');
  if (!tbody) return;
  const tests = BCMSDataStore.entities.planTests || [];
  const plans = BCMSDataStore.entities.continuityPlans || [];
  const processes = BCMSDataStore.entities.processes || [];
  
  tbody.innerHTML = tests.map(t => {
    const plan = plans.find(p => p.id === t.planId);
    const proc = plan && plan.targetProcessId ? processes.find(p => p.id === plan.targetProcessId) : null;
    const typeBadge = t.testType === 'TABLETOP' ? 'badge-purple' : t.testType === 'SIMULATION' ? 'badge-warning' : t.testType === 'FULL_EXERCISE' ? 'badge-danger' : 'badge-info';
    const statusBadge = t.status === 'SCHEDULED' ? 'badge-info' : (t.successRatePct >= 90 ? 'badge-success' : t.successRatePct >= 70 ? 'badge-warning' : 'badge-danger');
    const statusLabel = t.status === 'SCHEDULED' ? 'Programada' : (t.successRatePct >= 90 ? 'Exitosa' : t.successRatePct >= 70 ? 'Parcial' : 'Fallida');
    return `<tr>
      <td class="fs-12">${t.testDate}</td>
      <td><span class="badge ${typeBadge}">${t.testType}</span></td>
      <td class="fs-12">${plan ? plan.code : '-'} ${proc ? '/ ' + proc.name : ''}</td>
      <td class="fs-12 text-center">${plan ? (plan.rtoTarget || '-') + 'h' : '-'}</td>
      <td class="fs-12 text-center fw-600">${t.successRatePct ? Math.round(plan?.rtoTarget * (1 + (100 - t.successRatePct)/100)) + 'h' : '-'}</td>
      <td class="fs-12 text-center">${plan ? (plan.rpoTarget || '-') + 'h' : '-'}</td>
      <td class="fs-12 text-center fw-600">${t.successRatePct ? Math.round(plan?.rpoTarget * (1 + (100 - t.successRatePct)/200)) + 'h' : '-'}</td>
      <td class="fs-12 text-center">${t.issuesFound || 0}</td>
      <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
    </tr>`;
  }).join('');
}

/**
 * ============================================================================
 * RIA - ANÁLISIS DE RIESGOS - Funciones de renderizado
 * Vista: view-ria | Entidad: risks (filtrado riskDomain !== 'CYBER')
 * ============================================================================
 */

function renderRIAView() {
  renderRIAKPIs();
  renderRIATable();
}

function renderRIAKPIs() {
  const container = document.getElementById('ria-kpis-container');
  if (!container) return;
  const risks = (BCMSDataStore.entities.risks || []).filter(r => r.riskDomain !== 'CYBER' && !r.code.startsWith('RCIBER'));
  const open = risks.filter(r => r.status !== 'CLOSED').length;
  const critical = risks.filter(r => r.inherentScore >= 20).length;
  const treating = risks.filter(r => r.status === 'TREATING').length;
  const highResidual = risks.filter(r => r.residualScore >= 15).length;
  container.innerHTML = new KPICard({ title: 'Riesgos Registrados', value: risks.length, icon: 'bi-shield-exclamation' }).render() +
    new KPICard({ title: 'Riesgos Críticos', value: critical, icon: 'bi-exclamation-triangle', color: '#ef4444' }).render() +
    new KPICard({ title: 'En Tratamiento', value: treating, icon: 'bi-wrench', color: '#f59e0b' }).render() +
    new KPICard({ title: 'Residual Alto', value: highResidual, icon: 'bi-arrow-up-circle', color: '#ef4444' }).render() +
    new KPICard({ title: 'Monitoreados', value: risks.filter(r => r.status === 'MONITORED').length, icon: 'bi-eye', color: '#10b981' }).render();
}

function renderRIATable() {
  const tbody = document.getElementById('ria-tbody');
  if (!tbody) return;
  const risks = (BCMSDataStore.entities.risks || []).filter(r => r.riskDomain !== 'CYBER' && !r.code.startsWith('RCIBER'));
  const processes = BCMSDataStore.entities.processes || [];
  
  tbody.innerHTML = risks.map(r => {
    const proc = processes.find(p => p.id === r.targetProcessId);
    const inhBadge = r.inherentScore >= 20 ? 'badge-danger' : r.inherentScore >= 12 ? 'badge-warning' : r.inherentScore >= 6 ? 'badge-info' : 'badge-success';
    const resBadge = r.residualScore >= 20 ? 'badge-danger' : r.residualScore >= 12 ? 'badge-warning' : r.residualScore >= 6 ? 'badge-info' : 'badge-success';
    const statusBadge = r.status === 'TREATING' ? 'badge-warning' : r.status === 'MONITORED' ? 'badge-success' : 'badge-info';
    const treatLabel = r.treatmentType === 'MITIGATE' ? 'Mitigar' : r.treatmentType === 'ACCEPT' ? 'Aceptar' : r.treatmentType === 'TRANSFER' ? 'Transferir' : r.treatmentType || '-';
    return `<tr onclick="showDetalleRIA(${r.id})" style="cursor:pointer;">
      <td class="fw-600">${r.code}</td>
      <td class="fs-12">${r.title}</td>
      <td class="fs-12">${proc ? proc.name : r.riskScope || '-'}</td>
      <td class="fs-12">${r.riskDomain || '-'}</td>
      <td class="text-center"><span class="badge ${inhBadge}">${r.inherentScore}</span></td>
      <td class="text-center"><span class="badge ${resBadge}">${r.residualScore}</span></td>
      <td class="fs-12">${treatLabel}</td>
      <td><span class="badge ${statusBadge}">${r.status}</span></td>
      <td><button class="btn btn-secondary btn-sm"><i class="bi bi-eye"></i></button></td>
    </tr>`;
  }).join('');
}

function showDetalleRIA(riskId) {
  const panel = document.getElementById('detalle-ria');
  if (!panel) return;
  const r = BCMSDataStore.entities.risks.find(x => x.id === riskId);
  if (!r) return;
  const processes = BCMSDataStore.entities.processes || [];
  const proc = processes.find(p => p.id === r.targetProcessId);
  const controls = r.controls || [];
  const allControls = BCMSDataStore.entities.controls || [];
  
  panel.innerHTML = `
    <div class="card mb-24" style="border-left: 4px solid ${r.inherentScore >= 20 ? '#ef4444' : '#f59e0b'};">
      <div class="card-header">
        <div><h3><i class="bi bi-shield-exclamation"></i> ${r.code} - ${r.title}</h3></div>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('detalle-ria').classList.add('d-none')"><i class="bi bi-x"></i> Cerrar</button>
      </div>
      <div class="p-20">
        <div class="d-grid grid-3-equal gap-16 mb-24">
          <div><span class="fs-11 fw-600 color-muted">Proceso/Activo</span><div class="fs-13 mt-4">${proc ? proc.name : r.riskScope || '-'}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Dominio</span><div class="fs-13 mt-4">${r.riskDomain}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Estado</span><div class="mt-4"><span class="badge ${r.status === 'TREATING' ? 'badge-warning' : 'badge-success'}">${r.status}</span></div></div>
          <div><span class="fs-11 fw-600 color-muted">Escenario</span><div class="fs-12 mt-4">${r.scenario || '-'}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Causa</span><div class="fs-12 mt-4">${r.cause || '-'}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Efecto</span><div class="fs-12 mt-4">${r.effect || '-'}</div></div>
        </div>
        <div class="d-grid grid-2-equal gap-20 mb-24">
          <div class="card p-16" style="background:#fef2f2;border:1px solid #fecaca;">
            <h4 class="fs-12 fw-600 color-danger mb-8">Riesgo Inherente</h4>
            <div class="d-flex jc-between fs-12 mb-4"><span>Probabilidad</span><span class="fw-600">${r.inherentProbability}</span></div>
            <div class="d-flex jc-between fs-12 mb-4"><span>Impacto</span><span class="fw-600">${r.inherentImpact}</span></div>
            <div class="d-flex jc-between fs-13 fw-600 pt-8 border-top-soft"><span>Score</span><span>${r.inherentScore}</span></div>
          </div>
          <div class="card p-16" style="background:#f0fdf4;border:1px solid #bbf7d0;">
            <h4 class="fs-12 fw-600 color-green mb-8">Riesgo Residual</h4>
            <div class="d-flex jc-between fs-12 mb-4"><span>Probabilidad</span><span class="fw-600">${r.residualProbability}</span></div>
            <div class="d-flex jc-between fs-12 mb-4"><span>Impacto</span><span class="fw-600">${r.residualImpact}</span></div>
            <div class="d-flex jc-between fs-13 fw-600 pt-8 border-top-soft"><span>Score</span><span>${r.residualScore}</span></div>
          </div>
        </div>
        <div class="mb-16">
          <h4 class="fs-13 fw-600 mb-8">Controles Identificados</h4>
          ${controls.length > 0 ? `<table class="fs-12"><thead><tr><th>Control</th><th>Tipo</th><th>Efectividad</th></tr></thead><tbody>` +
            controls.map(cId => {
              const ctrl = allControls.find(c => c.id === cId || c.code === cId);
              return ctrl ? `<tr><td>${ctrl.code} - ${ctrl.name}</td><td>${ctrl.type || '-'}</td><td>${ctrl.effectiveness || '-'}</td></tr>` : '';
            }).join('') + `</tbody></table>` : '<p class="fs-12 color-muted">Sin controles vinculados</p>'}
        </div>
        <div>
          <h4 class="fs-13 fw-600 mb-8">Plan de Tratamiento</h4>
          <div class="fs-12"><strong>Estrategia:</strong> ${r.treatmentType || '-'}</div>
        </div>
      </div>
    </div>`;
  panel.classList.remove('d-none');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * ============================================================================
 * BIA - ANÁLISIS DE IMPACTO - Funciones de renderizado
 * Vista: view-bia | Entidad: processes + biaDependencies
 * ============================================================================
 */

function renderBIAResumen() {
  const container = document.getElementById('bia-resumen-container');
  if (!container) return;
  const processes = (BCMSDataStore.entities.processes || []).filter(p => !p.isDeleted);
  
  container.innerHTML = `<table class="fs-12">
    <thead><tr><th>Código</th><th>Proceso/Servicio</th><th>Criticidad</th><th>RTO (h)</th><th>MTPD (h)</th><th>Margen (h)</th><th>Cumplimiento</th></tr></thead>
    <tbody>${processes.filter(p => p.businessCriticality === 'CRITICAL' || p.businessCriticality === 'HIGH').map(p => {
      const rto = p.rto || (p.targetRtoMinutes ? p.targetRtoMinutes / 60 : null);
      const mtpd = p.mtpdMinutes ? p.mtpdMinutes / 60 : (p.maximumTolerableDowntimeMinutes ? p.maximumTolerableDowntimeMinutes / 60 : null);
      const margen = (rto !== null && mtpd !== null) ? Math.round((mtpd - rto) * 10) / 10 : null;
      const cumple = margen !== null ? margen >= 0 : null;
      const critBadge = p.businessCriticality === 'CRITICAL' ? 'badge-danger' : 'badge-warning';
      return `<tr class="${cumple === false ? 'row-danger-bg' : ''}">
        <td class="fw-600">${p.code}</td><td>${p.name}</td>
        <td><span class="badge ${critBadge}">${p.businessCriticality}</span></td>
        <td class="text-center">${rto !== null ? rto : '-'}</td>
        <td class="text-center">${mtpd !== null ? mtpd : '-'}</td>
        <td class="text-center ${margen !== null && margen < 0 ? 'color-danger fw-600' : 'color-green fw-600'}">${margen !== null ? (margen >= 0 ? '+' : '') + margen : '-'}</td>
        <td class="text-center">${cumple === null ? '-' : cumple ? '<span class="badge badge-success">Cumple</span>' : '<span class="badge badge-danger">No cumple</span>'}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

/**
 * ============================================================================
 * BCP - PLANES DE CONTINUIDAD - Funciones de renderizado
 * Vista: view-bcp | Entidad: continuityPlans + recoveryStrategies + activationCriteria
 * ============================================================================
 */

function renderBCPKPIs() {
  const container = document.getElementById('bcp-kpis-container');
  if (!container) return;
  const plans = (BCMSDataStore.entities.continuityPlans || []).filter(p => p.planType === 'BCP');
  const active = plans.filter(p => p.status === 'ACTIVE').length;
  const tests = BCMSDataStore.entities.planTests || [];
  const testedPlanIds = [...new Set(tests.map(t => t.planId))];
  const testedBCP = plans.filter(p => testedPlanIds.includes(p.id)).length;
  const avgRto = plans.length > 0 ? Math.round(plans.reduce((s,p) => s + (p.rtoTarget || 0), 0) / plans.length * 10) / 10 : 0;
  container.innerHTML = new KPICard({ title: 'Total Planes BCP', value: plans.length, icon: 'bi-journal-check' }).render() +
    new KPICard({ title: 'Vigentes', value: active, icon: 'bi-check-circle', color: '#10b981' }).render() +
    new KPICard({ title: 'Probados', value: testedBCP, icon: 'bi-clipboard-check', color: '#6366f1' }).render() +
    new KPICard({ title: 'RTO Promedio', value: avgRto + 'h', icon: 'bi-clock-history', color: '#f59e0b' }).render() +
    new KPICard({ title: 'Requieren Prueba', value: plans.length - testedBCP, icon: 'bi-exclamation-circle', color: '#ef4444' }).render();
}

/**
 * ============================================================================
 * INCIDENTES - Funciones de renderizado
 * Vista: view-incidentes | Entidad: incidents
 * ============================================================================
 */

function renderIncidentesView() {
  renderIncidentesKPIs();
  renderIncidentesBacklog();
  renderIncidentesList();
}

function renderIncidentesKPIs() {
  const container = document.getElementById('incidentes-kpis-container');
  if (!container) return;
  const incidents = BCMSDataStore.entities.incidents || [];
  const active = incidents.filter(i => ['OPEN','IN_PROGRESS','ESCALATED'].includes(i.status)).length;
  const critical = incidents.filter(i => i.severity === 'HIGH' && ['OPEN','IN_PROGRESS','ESCALATED'].includes(i.status)).length;
  const resolved30d = incidents.filter(i => { if (!i.resolvedAt) return false; const d = new Date(i.resolvedAt); const now = new Date(); return (now - d) / 86400000 <= 30; }).length;
  const closed = incidents.filter(i => i.status === 'CLOSED');
  const avgResolve = closed.length > 0 ? Math.round(closed.filter(i => i.resolvedAt && i.reportedAt).reduce((s, i) => { return s + (new Date(i.resolvedAt) - new Date(i.reportedAt)) / 3600000; }, 0) / closed.filter(i => i.resolvedAt && i.reportedAt).length * 10) / 10 : 0;
  const escalated = incidents.filter(i => i.status === 'ESCALATED').length;
  container.innerHTML = new KPICard({ title: 'Activos', value: active, icon: 'bi-exclamation-diamond', color: '#ef4444' }).render() +
    new KPICard({ title: 'Críticos', value: critical, icon: 'bi-exclamation-triangle', color: '#ef4444' }).render() +
    new KPICard({ title: 'MTTR (h)', value: avgResolve, icon: 'bi-clock', color: '#f59e0b' }).render() +
    new KPICard({ title: 'Resueltos 30d', value: resolved30d, icon: 'bi-check-circle', color: '#10b981' }).render() +
    new KPICard({ title: 'Escalados', value: escalated, icon: 'bi-arrow-up-right', color: '#8b5cf6' }).render();
}

function renderIncidentesBacklog() {
  const container = document.getElementById('incidentes-backlog');
  if (!container) return;
  const incidents = BCMSDataStore.entities.incidents || [];
  const severities = ['HIGH', 'MEDIUM', 'LOW'];
  const sevLabels = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };
  const sevColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#6366f1' };
  
  container.innerHTML = `<table class="fs-12"><thead><tr><th>Severidad</th><th>Abiertos</th><th>En Curso</th><th>Escalados</th><th>Resueltos</th><th>Cerrados</th></tr></thead><tbody>` +
    severities.map(sev => {
      const filtered = incidents.filter(i => i.severity === sev);
      return `<tr>
        <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sevColors[sev]};margin-right:6px;"></span>${sevLabels[sev]}</td>
        <td class="text-center">${filtered.filter(i => i.status === 'OPEN').length}</td>
        <td class="text-center">${filtered.filter(i => i.status === 'IN_PROGRESS').length}</td>
        <td class="text-center">${filtered.filter(i => i.status === 'ESCALATED').length}</td>
        <td class="text-center">${filtered.filter(i => i.status === 'RESOLVED').length}</td>
        <td class="text-center">${filtered.filter(i => i.status === 'CLOSED').length}</td>
      </tr>`;
    }).join('') + '</tbody></table>';
}

function renderIncidentesList() {
  const container = document.getElementById('incidentes-lista');
  if (!container) return;
  const incidents = BCMSDataStore.entities.incidents || [];
  
  container.innerHTML = incidents.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)).map(inc => {
    const sevColor = inc.severity === 'HIGH' ? '#ef4444' : inc.severity === 'MEDIUM' ? '#f59e0b' : '#6366f1';
    const statusBadge = inc.status === 'CLOSED' ? 'badge-success' : inc.status === 'RESOLVED' ? 'badge-success' : inc.status === 'ESCALATED' ? 'badge-danger' : inc.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info';
    const statusLabel = inc.status === 'CLOSED' ? 'Cerrado' : inc.status === 'RESOLVED' ? 'Resuelto' : inc.status === 'ESCALATED' ? 'Escalado' : inc.status === 'IN_PROGRESS' ? 'En Curso' : 'Abierto';
    return `<div class="card mb-8 p-12" style="border-left:3px solid ${sevColor};cursor:pointer;" onclick="selectIncidente(${inc.id})">
      <div class="d-flex jc-between ai-center">
        <div>
          <div class="fw-600 fs-12">${inc.code}</div>
          <div class="fs-11 color-muted" style="margin-top:2px;">${inc.title.substring(0, 40)}${inc.title.length > 40 ? '...' : ''}</div>
        </div>
        <span class="badge ${statusBadge} fs-10">${statusLabel}</span>
      </div>
    </div>`;
  }).join('');
}

function selectIncidente(id) {
  const panel = document.getElementById('incidente-detalle');
  if (!panel) return;
  const inc = BCMSDataStore.entities.incidents.find(x => x.id === id);
  if (!inc) return;
  const users = BCMSDataStore.entities.users || [];
  const processes = BCMSDataStore.entities.processes || [];
  const reporter = users.find(u => u.id === inc.reportedBy);
  const proc = processes.find(p => p.id === inc.affectedProcessId);
  const sevBadge = inc.severity === 'HIGH' ? 'badge-danger' : inc.severity === 'MEDIUM' ? 'badge-warning' : 'badge-info';
  
  const workflowSteps = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
  const stepLabels = { OPEN: 'Abierto', IN_PROGRESS: 'En Curso', ESCALATED: 'Escalado', RESOLVED: 'Resuelto', CLOSED: 'Cerrado' };
  const currentStepIdx = workflowSteps.indexOf(inc.status);
  
  panel.innerHTML = `
    <div class="mb-16">
      <h3 class="fs-16 fw-600 mb-4">${inc.code} - ${inc.title}</h3>
      <div class="d-flex gap-8"><span class="badge ${sevBadge}">${inc.severity}</span><span class="badge badge-secondary">${inc.type}</span></div>
    </div>
    <div class="d-grid grid-3-equal gap-12 mb-16">
      <div><span class="fs-11 color-muted">Reportado por</span><div class="fs-12 mt-2">${reporter ? reporter.fullName : '-'}</div></div>
      <div><span class="fs-11 color-muted">Fecha Reporte</span><div class="fs-12 mt-2">${inc.reportedAt ? inc.reportedAt.substring(0, 10) : '-'}</div></div>
      <div><span class="fs-11 color-muted">Proceso Afectado</span><div class="fs-12 mt-2">${proc ? proc.name : '-'}</div></div>
    </div>
    <div class="mb-16"><p class="fs-12 color-secondary" style="line-height:1.6;">${inc.description || ''}</p></div>
    <div class="mb-16">
      <h4 class="fs-12 fw-600 mb-8">Workflow</h4>
      <div class="d-flex gap-4 ai-center">
        ${workflowSteps.map((step, i) => {
          const isActive = i <= currentStepIdx;
          const isCurrent = i === currentStepIdx;
          return `<div style="flex:1;text-align:center;">
            <div style="height:6px;border-radius:3px;background:${isActive ? 'var(--accent-primary)' : '#e5e7eb'};${isCurrent ? 'box-shadow:0 0 0 2px var(--accent-primary);' : ''}"></div>
            <div class="fs-10 mt-4 ${isActive ? 'fw-600' : 'color-muted'}">${stepLabels[step]}</div>
          </div>${i < workflowSteps.length - 1 ? '' : ''}`;
        }).join('')}
      </div>
    </div>
    ${inc.impactDescription ? `<div class="mb-16"><h4 class="fs-12 fw-600 mb-4">Impacto</h4><p class="fs-12 color-secondary">${inc.impactDescription}</p></div>` : ''}
    ${inc.rootCause ? `<div class="mb-16"><h4 class="fs-12 fw-600 mb-4">Causa Raíz</h4><p class="fs-12 color-secondary">${inc.rootCause}</p></div>` : ''}
    ${inc.resolutionSummary ? `<div class="mb-16"><h4 class="fs-12 fw-600 mb-4">Resolución</h4><p class="fs-12 color-secondary">${inc.resolutionSummary}</p></div>` : ''}
    <div class="d-flex gap-8 mt-16">
      <button class="btn btn-primary btn-sm"><i class="bi bi-arrow-up-right"></i> Escalar</button>
      <button class="btn btn-secondary btn-sm"><i class="bi bi-check-circle"></i> Marcar Resuelto</button>
      <button class="btn btn-secondary btn-sm"><i class="bi bi-chat-dots"></i> Comentar</button>
    </div>`;
  
  // Highlight selected in list
  document.querySelectorAll('#incidentes-lista .card').forEach(c => c.style.background = '');
  const cards = document.querySelectorAll('#incidentes-lista .card');
  const idx = BCMSDataStore.entities.incidents.sort((a,b) => new Date(b.reportedAt) - new Date(a.reportedAt)).findIndex(i => i.id === id);
  if (cards[idx]) cards[idx].style.background = '#f5f3ff';
}

function showIncidentesTab(tabName) {
  document.querySelectorAll('.incidentes-tab').forEach(t => t.classList.add('d-none'));
  const tab = document.getElementById('incidentes-tab-' + tabName);
  if (tab) tab.classList.remove('d-none');
  document.querySelectorAll('.incidentes-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.incidentes-tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.classList.add('active');
}

/**
 * ============================================================================
 * VISTA INTEGRADA - Funciones de renderizado
 * Vista: view-vista-integrada | Entidades: risks, processes, continuityPlans, controls
 * ============================================================================
 */

function renderVistaIntegradaView() {
  renderVistaIntegradaContinuidad();
  renderVistaIntegradaCiber();
}

function renderVistaIntegradaContinuidad() {
  const container = document.getElementById('integrada-continuidad-stats');
  if (!container) return;
  const processes = (BCMSDataStore.entities.processes || []).filter(p => !p.isDeleted);
  const criticalProcesses = processes.filter(p => p.businessCriticality === 'CRITICAL' || p.businessCriticality === 'HIGH').length;
  const risks = (BCMSDataStore.entities.risks || []).filter(r => r.riskDomain !== 'CYBER' && !r.code.startsWith('RCIBER'));
  const activeRisks = risks.filter(r => r.status !== 'CLOSED').length;
  const plans = (BCMSDataStore.entities.continuityPlans || []).filter(p => p.planType === 'BCP');
  const coverage = processes.length > 0 ? Math.round((plans.length / processes.length) * 100) : 0;
  container.innerHTML = `
    <div class="integrada-stat-card"><div class="integrada-stat-value">${criticalProcesses}</div><div class="integrada-stat-label">Procesos Críticos/Altos</div></div>
    <div class="integrada-stat-card"><div class="integrada-stat-value">${activeRisks}</div><div class="integrada-stat-label">Riesgos Activos</div></div>
    <div class="integrada-stat-card"><div class="integrada-stat-value">${Math.min(coverage, 100)}%</div><div class="integrada-stat-label">Cobertura BCP</div></div>`;
}

function renderVistaIntegradaCiber() {
  const container = document.getElementById('integrada-ciber-stats');
  if (!container) return;
  const risks = (BCMSDataStore.entities.risks || []).filter(r => r.riskDomain === 'CYBER' || r.code.startsWith('RCIBER'));
  const criticalCiber = risks.filter(r => r.inherentScore >= 15).length;
  const controls = BCMSDataStore.entities.controls || [];
  const activeControls = controls.filter(c => c.status === 'ACTIVE' || c.status === 'IMPLEMENTED').length;
  const coverage = controls.length > 0 ? Math.round((activeControls / controls.length) * 100) : 0;
  container.innerHTML = `
    <div class="integrada-stat-card"><div class="integrada-stat-value">${risks.length}</div><div class="integrada-stat-label">Riesgos Ciber</div></div>
    <div class="integrada-stat-card"><div class="integrada-stat-value">${criticalCiber}</div><div class="integrada-stat-label">Críticos Ciber</div></div>
    <div class="integrada-stat-card"><div class="integrada-stat-value">${activeControls}</div><div class="integrada-stat-label">Controles Activos</div></div>
    <div class="integrada-stat-card"><div class="integrada-stat-value">${coverage}%</div><div class="integrada-stat-label">Cobertura Controles</div></div>`;
}

console.log('functions.js cargado correctamente');

