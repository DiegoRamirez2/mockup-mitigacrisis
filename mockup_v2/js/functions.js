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
  selectedBIATargetType: 'PROCESS',
  selectedBIATargetId: null,
  selectedBIATargetKey: '',
  selectedPlan: null,
  selectedIncidente: null,
  integradaTab: 'continuidad',
  crisisManualLevel: null,
  biaSearchTerm: '',
  biaMatrixSearchTerm: '',
  biaMatrixPageByProcess: {},
  biaMatrixPageSize: 10,
  biaStickyColumnsEnabled: true,
  riaDomainFilter: 'TRIGGERED',
  selectedRIAProcessId: null,
  riaSearchTerm: '',
  riaModalDraft: null,
  biaImpactOverrides: {},
  biaLevantamientoByProcess: {},
  biaLevantamientoImportFileName: '',
  biaLevantamientoScenarioDraft: null,
  modals: {},
  tables: {}, // Almacena instancias de DynamicTable
  charts: {} // Instancias de Chart.js para evitar duplicados
};
/**
 * Crea o reemplaza un gráfico Chart.js asociado a un canvas.
 * Evita errores por reinicialización al cambiar de vista.
 * @param {HTMLCanvasElement} ctx - Canvas destino
 * @param {Object} config - Configuración de Chart.js
 * @param {string} [key] - Clave opcional para registrar instancia
 * @returns {Chart|null}
 */
function createManagedChart(ctx, config, key = null) {
  if (!ctx || typeof Chart === 'undefined') return null;

  const chartKey = key || ctx.id;

  if (chartKey && AppState.charts[chartKey]) {
    AppState.charts[chartKey].destroy();
    delete AppState.charts[chartKey];
  }

  const existingChart = typeof Chart.getChart === 'function' ? Chart.getChart(ctx) : null;
  if (existingChart) {
    existingChart.destroy();
  }

  const chart = new Chart(ctx, config);

  if (chartKey) {
    AppState.charts[chartKey] = chart;
  }

  return chart;
}

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
  // Vista temporalmente fuera de alcance visual del demo
  if (viewName === 'gobierno') {
    viewName = 'dashboard';
  }

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
    'bia': { title: 'BIA - Análisis de Impacto', subtitle: 'Análisis de Impacto al Negocio' },
    'ria': { title: 'RIA - Riesgo de Interrupción por Proceso', subtitle: 'Evaluación RIA gatillada por resultado BIA' },
    'riesgos-ciber': { title: 'Riesgos Ciber', subtitle: 'Gestión de ciberriesgos' },
    'vista-integrada': { title: 'Vista Integrada (BIA + RIA + Ciber)', subtitle: 'Trazabilidad unificada' },
    'recursos-capacidades': { title: 'Recursos & Capacidades', subtitle: 'Inventario de recursos críticos' },
    'bcp': { title: 'Planes de Continuidad (BCP)', subtitle: 'Planes de Continuidad del Negocio' },
    'drp': { title: 'Planes de Recuperación TI (DRP)', subtitle: 'Planes de Recuperación ante Desastres' },
    'incidentes': { title: 'Incidentes', subtitle: 'Registro y seguimiento' },
    'crisis': { title: 'Crisis', subtitle: 'Protocolo de escalamiento' },
    'comunicaciones-crisis': { title: 'Comunicaciones en Crisis', subtitle: 'Plantillas y canales' },
    'pruebas': { title: 'Pruebas y Simulacros', subtitle: 'Validación de planes' },
    'capacitacion': { title: 'Formación & Concienciación', subtitle: 'Formación y concienciación' },
    'auditoria': { title: 'Auditoría', subtitle: 'Evaluaciones internas y externas' },
    'hallazgos': { title: 'Hallazgos & Planes de Acción', subtitle: 'No conformidades y acciones' },
    'aprendizajes': { title: 'Lecciones Aprendidas', subtitle: 'Mejora continua' },
    'reportes': { title: 'Reportes Ejecutivos', subtitle: 'Informes y tableros' },
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
      renderBIAView();
      break;
    case 'bcp':
      renderBCPKPIs();
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
      initCrisisActivationForm();
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
 * Renderiza la vista BIA completa (KPIs + resumen + lista)
 */
function renderBIAView() {
  renderBIAKPIs();
  renderBIAResumen();
  renderBIAProcessList();
  bindBIASearch();

  if (AppState.selectedBIATargetKey) {
    const selected = parseBIATargetKey(AppState.selectedBIATargetKey);
    if (selected) {
      selectBIAEntity(selected.targetType, selected.targetId);
      return;
    }
  }

  if (AppState.selectedProcess) {
    selectBIAProcess(AppState.selectedProcess);
  }
}

function getBIAImpactLevels() {
  return getBIALookupLabels('biaImpactLevels', ['Bajo', 'Medio Bajo', 'Medio', 'Medio Alto', 'Alto']);
}

function getBIALookupLabels(lookupName, fallback = []) {
  const lookup = (typeof BCMSDataStore !== 'undefined' && BCMSDataStore && BCMSDataStore.lookups)
    ? BCMSDataStore.lookups[lookupName]
    : null;
  if (!Array.isArray(lookup) || lookup.length === 0) return fallback;
  return [...lookup]
    .sort((a, b) => (Number(a.order || a.id || 0) - Number(b.order || b.id || 0)))
    .map(item => String(item.label || '').trim())
    .filter(Boolean);
}

function getBIAEntityTypeLabel(targetType) {
  const normalized = String(targetType || '').toUpperCase();
  const labels = {
    MACROPROCESS: 'Macroproceso',
    PROCESS: 'Proceso',
    SUBPROCESS: 'Subproceso'
  };
  return labels[normalized] || 'Proceso';
}

function getBIATargetKey(targetType, targetId) {
  const normalizedType = String(targetType || 'PROCESS').toUpperCase();
  return `${normalizedType}:${Number(targetId || 0)}`;
}

function parseBIATargetKey(targetKey) {
  if (!targetKey || typeof targetKey !== 'string' || !targetKey.includes(':')) return null;
  const [targetTypeRaw, targetIdRaw] = targetKey.split(':');
  const targetId = Number(targetIdRaw);
  if (!targetTypeRaw || Number.isNaN(targetId)) return null;
  const targetType = String(targetTypeRaw).toUpperCase();
  return {
    targetType,
    targetId,
    targetKey: getBIATargetKey(targetType, targetId)
  };
}

function resolveBIATargetRef(targetRef, targetId = null) {
  if (targetId !== null && targetId !== undefined) {
    const normalizedType = String(targetRef || 'PROCESS').toUpperCase();
    const normalizedId = Number(targetId);
    return {
      targetType: normalizedType,
      targetId: normalizedId,
      targetKey: getBIATargetKey(normalizedType, normalizedId)
    };
  }

  if (typeof targetRef === 'number') {
    return { targetType: 'PROCESS', targetId: Number(targetRef), targetKey: getBIATargetKey('PROCESS', targetRef) };
  }

  if (typeof targetRef === 'string') {
    const parsed = parseBIATargetKey(targetRef);
    if (parsed) return parsed;
    return { targetType: 'PROCESS', targetId: Number(targetRef), targetKey: getBIATargetKey('PROCESS', targetRef) };
  }

  if (targetRef && typeof targetRef === 'object') {
    if (targetRef.targetType && targetRef.targetId !== undefined) {
      return {
        targetType: String(targetRef.targetType).toUpperCase(),
        targetId: Number(targetRef.targetId),
        targetKey: getBIATargetKey(targetRef.targetType, targetRef.targetId)
      };
    }
    if (targetRef.id !== undefined && (targetRef.code || targetRef.name)) {
      const inferredType = String(targetRef.entityType || targetRef.targetType || 'PROCESS').toUpperCase();
      return {
        targetType: inferredType,
        targetId: Number(targetRef.id),
        targetKey: getBIATargetKey(inferredType, targetRef.id)
      };
    }
  }

  return null;
}

function getBIAEntityCatalog() {
  const users = BCMSDataStore.entities.users || [];
  const macroprocesses = (BCMSDataStore.entities.macroprocesses || []).filter(m => !m.isDeleted);
  const processes = (BCMSDataStore.entities.processes || []).filter(p => !p.isDeleted);
  const subprocesses = (BCMSDataStore.entities.subprocesses || []).filter(sp => !sp.isDeleted);
  const dependencies = BCMSDataStore.entities.biaDependencies || [];
  const criticalityRank = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

  const processById = new Map(processes.map(p => [Number(p.id), p]));
  const processesByMacro = processes.reduce((acc, proc) => {
    const macroId = Number(proc.macroprocessId || 0);
    if (!acc[macroId]) acc[macroId] = [];
    acc[macroId].push(proc);
    return acc;
  }, {});

  const dependencyCountByProcess = dependencies.reduce((acc, dep) => {
    const processKey = Number(dep.processId);
    acc[processKey] = (acc[processKey] || 0) + 1;
    return acc;
  }, {});

  const getUserFullName = (userId, fallback = '-') => {
    const user = users.find(u => Number(u.id) === Number(userId));
    return user ? `${user.firstName} ${user.lastName}` : fallback;
  };

  const getMinNumeric = (values) => {
    const numeric = values.filter(v => typeof v === 'number' && !Number.isNaN(v));
    return numeric.length > 0 ? Math.min(...numeric) : null;
  };

  const macroTargets = macroprocesses.map((macro) => {
    const childProcesses = processesByMacro[Number(macro.id)] || [];
    const processIds = childProcesses.map(p => Number(p.id));
    const dependencyCount = dependencies.filter(dep => processIds.includes(Number(dep.processId))).length;
    const rto = getMinNumeric(childProcesses.map(p => p.targetRtoMinutes));
    const rpo = getMinNumeric(childProcesses.map(p => p.targetRpoMinutes));
    const mtpd = getMinNumeric(childProcesses.map(p => p.mtpdMinutes ?? p.maximumTolerableDowntimeMinutes));
    const ownerName = getUserFullName(macro.governanceOwnerId, '-');

    return {
      targetType: 'MACROPROCESS',
      targetId: Number(macro.id),
      targetKey: getBIATargetKey('MACROPROCESS', macro.id),
      code: macro.code || '-',
      name: macro.name || '-',
      businessCriticality: macro.strategicImportance || 'MEDIUM',
      targetRtoMinutes: rto,
      targetRpoMinutes: rpo,
      mtpdMinutes: mtpd,
      maximumTolerableDowntimeMinutes: mtpd,
      mbcoPercent: null,
      ownerName,
      owner: ownerName,
      responsibleUnitId: null,
      processCategory: 'Macroproceso',
      description: macro.description || 'Sin descripción registrada.',
      parentProcessId: null,
      dependencyCount,
      createdAt: macro.createdAt,
      updatedAt: macro.updatedAt,
      createdBy: macro.createdBy,
      updatedBy: macro.updatedBy
    };
  });

  const processTargets = processes.map((proc) => {
    const mtpd = proc.mtpdMinutes ?? proc.maximumTolerableDowntimeMinutes ?? null;
    return {
      targetType: 'PROCESS',
      targetId: Number(proc.id),
      targetKey: getBIATargetKey('PROCESS', proc.id),
      code: proc.code || '-',
      name: proc.name || '-',
      businessCriticality: proc.businessCriticality || 'MEDIUM',
      targetRtoMinutes: proc.targetRtoMinutes,
      targetRpoMinutes: proc.targetRpoMinutes,
      mtpdMinutes: mtpd,
      maximumTolerableDowntimeMinutes: mtpd,
      mbcoPercent: proc.mbcoPercent || null,
      ownerName: proc.ownerName || proc.owner || '-',
      owner: proc.owner || proc.ownerName || '-',
      responsibleUnitId: proc.responsibleUnitId || null,
      processCategory: proc.processCategory || '-',
      description: proc.description || 'Sin descripción registrada.',
      parentProcessId: null,
      dependencyCount: dependencyCountByProcess[Number(proc.id)] || 0,
      createdAt: proc.createdAt,
      updatedAt: proc.updatedAt,
      createdBy: proc.createdBy,
      updatedBy: proc.updatedBy
    };
  });

  const subprocessTargets = subprocesses.map((sub) => {
    const parentProcess = processById.get(Number(sub.processId));
    const inheritedCriticality = parentProcess?.businessCriticality || 'MEDIUM';
    const effectiveCriticality = sub.overrideCriticality || (sub.criticalityInherited ? inheritedCriticality : inheritedCriticality);
    const mtpd = parentProcess?.mtpdMinutes ?? parentProcess?.maximumTolerableDowntimeMinutes ?? null;
    const owner = sub.ownerName || parentProcess?.ownerName || parentProcess?.owner || '-';
    return {
      targetType: 'SUBPROCESS',
      targetId: Number(sub.id),
      targetKey: getBIATargetKey('SUBPROCESS', sub.id),
      code: sub.code || '-',
      name: sub.name || '-',
      businessCriticality: effectiveCriticality || 'MEDIUM',
      targetRtoMinutes: parentProcess?.targetRtoMinutes ?? null,
      targetRpoMinutes: parentProcess?.targetRpoMinutes ?? null,
      mtpdMinutes: mtpd,
      maximumTolerableDowntimeMinutes: mtpd,
      mbcoPercent: parentProcess?.mbcoPercent ?? null,
      ownerName: owner,
      owner,
      responsibleUnitId: parentProcess?.responsibleUnitId || null,
      processCategory: 'Subproceso',
      description: sub.description || 'Sin descripción registrada.',
      parentProcessId: parentProcess ? Number(parentProcess.id) : null,
      dependencyCount: parentProcess ? (dependencyCountByProcess[Number(parentProcess.id)] || 0) : 0,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      createdBy: sub.createdBy,
      updatedBy: sub.updatedBy
    };
  });

  return [...macroTargets, ...processTargets, ...subprocessTargets]
    .sort((a, b) => {
      const rankDiff = (criticalityRank[String(a.businessCriticality || '').toUpperCase()] || 99)
        - (criticalityRank[String(b.businessCriticality || '').toUpperCase()] || 99);
      if (rankDiff !== 0) return rankDiff;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
}

function getBIAEntityFromTarget(targetType, targetId) {
  const targetKey = getBIATargetKey(targetType, targetId);
  return getBIAEntityCatalog().find(item => item.targetKey === targetKey) || null;
}

/**
 * Enlaza el buscador de procesos BIA
 */
function bindBIASearch() {
  const searchInput = document.getElementById('bia-search');
  if (!searchInput || searchInput.dataset.bound === '1') return;

  searchInput.addEventListener('input', (event) => {
    AppState.biaSearchTerm = event.target.value || '';
    renderBIAProcessList();
  });

  searchInput.dataset.bound = '1';
}

function clearBIAProcessFilter() {
  AppState.biaSearchTerm = '';
  const searchInput = document.getElementById('bia-search');
  if (searchInput) searchInput.value = '';
  renderBIAProcessList();
}

/**
 * Renderiza KPIs del módulo BIA
 */
function renderBIAKPIs() {
  const container = document.getElementById('bia-kpis-container');
  if (!container) return;

  const targets = getBIAEntityCatalog();
  const criticalTargets = targets.filter(t => String(t.businessCriticality || '').toUpperCase() === 'CRITICAL');
  const highTargets = targets.filter(t => String(t.businessCriticality || '').toUpperCase() === 'HIGH');
  const dependencies = BCMSDataStore.entities.biaDependencies || [];
  const mtpdBreaches = targets.filter((target) => {
    const rto = target.targetRtoMinutes ?? null;
    const mtpd = target.mtpdMinutes ?? target.maximumTolerableDowntimeMinutes ?? null;
    return rto !== null && mtpd !== null && rto > mtpd;
  }).length;

  const kpis = [
    { label: 'Objetivos evaluables', value: targets.length, icon: 'bi-diagram-3', color: 'primary', subtitle: 'Macro + Proceso + Subproceso' },
    { label: 'Objetivos críticos', value: criticalTargets.length, icon: 'bi-exclamation-octagon', color: 'danger', subtitle: 'Prioridad máxima BCMS' },
    { label: 'Objetivos alto impacto', value: highTargets.length, icon: 'bi-flag', color: 'warning', subtitle: 'Seguimiento reforzado' },
    { label: 'Dependencias registradas', value: dependencies.length, icon: 'bi-link-45deg', color: 'info', subtitle: 'Personas, activos, terceros' },
    { label: 'Brechas RTO/MTPD', value: mtpdBreaches, icon: 'bi-activity', color: mtpdBreaches > 0 ? 'danger' : 'secondary', subtitle: mtpdBreaches > 0 ? 'Requiere ajuste inmediato' : 'Sin brechas críticas' }
  ];

  if (typeof renderKPIGrid === 'function') {
    renderKPIGrid(container, kpis);
    return;
  }

  // Fallback defensivo si el componente KPI no está disponible
  container.innerHTML = kpis.map(kpi => `<div class="kpi-card"><div class="kpi-label">${kpi.label}</div><div class="kpi-value">${kpi.value}</div><div class="kpi-subtitle">${kpi.subtitle || ''}</div></div>`).join('');
}

/**
 * Renderiza la tabla de procesos para selección BIA
 */
function renderBIAProcessList() {
  const tbody = document.getElementById('bia-process-summary-body');
  if (!tbody) return;

  const search = (AppState.biaSearchTerm || '').trim().toLowerCase();
  const targets = getBIAEntityCatalog().filter((target) => {
    if (!search) return true;
    const searchable = `${target.code || ''} ${target.name || ''} ${target.ownerName || ''} ${target.processCategory || ''} ${getBIAEntityTypeLabel(target.targetType)}`.toLowerCase();
    return searchable.includes(search);
  });

  if (targets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center color-muted">No se encontraron procesos para el filtro aplicado.</td></tr>';
    return;
  }

  tbody.innerHTML = targets.map((target) => {
    const isSelected = AppState.selectedBIATargetKey === target.targetKey;
    const rtoLabel = typeof target.targetRtoMinutes === 'number' ? formatMinutesToTime(target.targetRtoMinutes) : '-';
    const dependenciesCount = Number(target.dependencyCount || 0);
    const dependenciesBadgeClass = dependenciesCount > 0 ? 'badge-info' : 'badge-neutral';
    const criticalityLabel = BCMSDataStore.api.getLookupLabel('businessCriticality', target.businessCriticality) || target.businessCriticality || 'N/A';
    const status = getBIALevantamientoStatus(target.targetType, target.targetId);
    AppState.biaLevantamientoByProcess[target.targetKey] = status.code;

    return `
      <tr class="${isSelected ? 'bia-row-selected' : ''}" data-target-key="${target.targetKey}">
        <td class="fw-600">${target.code || '-'}</td>
        <td>
          <div class="fw-600">${target.name || '-'}</div>
          <div class="sub-text-muted">${getBIAEntityTypeLabel(target.targetType)}</div>
        </td>
        <td><span class="badge badge-${(target.businessCriticality || 'medium').toLowerCase()}">${criticalityLabel}</span></td>
        <td>${rtoLabel}</td>
        <td>${target.ownerName || '-'}</td>
        <td><span class="badge ${dependenciesBadgeClass} bia-dependency-total">${dependenciesCount}</span></td>
        <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
        <td class="actions-cell bia-col-action">
          <button type="button" class="btn btn-outline btn-sm" onclick="selectBIAEntity('${target.targetType}', ${Number(target.targetId)})">
            <i class="bi bi-eye"></i> Ver detalle
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Selecciona un proceso para ver su BIA (wrapper legacy)
 */
function selectBIAProcess(processId) {
  selectBIAEntity('PROCESS', processId);
}

function selectBIAEntity(targetType, targetId) {
  const normalized = resolveBIATargetRef(targetType, targetId);
  if (!normalized || Number.isNaN(normalized.targetId)) return;

  AppState.selectedBIATargetType = normalized.targetType;
  AppState.selectedBIATargetId = normalized.targetId;
  AppState.selectedBIATargetKey = normalized.targetKey;
  AppState.selectedProcess = normalized.targetType === 'PROCESS' ? normalized.targetId : null;
  AppState.biaMatrixSearchTerm = '';
  AppState.biaMatrixPageByProcess[normalized.targetKey] = 1;

  document.querySelectorAll('#bia-process-summary-body tr[data-target-key]').forEach((row) => {
    row.classList.toggle('bia-row-selected', String(row.dataset.targetKey || '') === normalized.targetKey);
  });

  const target = getBIAEntityFromTarget(normalized.targetType, normalized.targetId);
  if (!target) return;

  const detailTitle = document.getElementById('bia-detail-title');
  if (detailTitle) {
    detailTitle.innerHTML = `<i class="bi bi-clipboard-data"></i> ${target.name}`;
  }

  const detailContent = document.getElementById('bia-detail-content');
  if (!detailContent) return;

  try {
    const rtoLabel = typeof target.targetRtoMinutes === 'number'
      ? formatMinutesToTime(target.targetRtoMinutes)
      : '-';
    const rpoLabel = typeof target.targetRpoMinutes === 'number'
      ? formatMinutesToTime(target.targetRpoMinutes)
      : '-';
    const mtpdLabel = typeof target.mtpdMinutes === 'number'
      ? formatMinutesToTime(target.mtpdMinutes)
      : (typeof target.maximumTolerableDowntimeMinutes === 'number' ? formatMinutesToTime(target.maximumTolerableDowntimeMinutes) : '-');
    const mbcoLabel = typeof target.mbcoPercent === 'number' ? `${target.mbcoPercent}%` : '-';
    const interviewData = getBIAInterviewData(target);
    const approvalData = getBIAApprovalData(target);
    const status = getBIALevantamientoStatus(target.targetType, target.targetId);
    const dependenciesMarkup = getBIADependenciesMarkup(target);
    const xlsxSchema = renderBIAExcelProcessSchema(target);

    detailContent.innerHTML = `
    <div class="bia-detail-top">
      <div class="bia-metric-grid">
        <div class="bia-metric">
          <span class="bia-metric-label">Tipo objetivo</span>
          <span class="bia-metric-value">${getBIAEntityTypeLabel(target.targetType)}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">Criticidad</span>
          <span class="bia-metric-value"><span class="badge badge-${(target.businessCriticality || 'medium').toLowerCase()}">${BCMSDataStore.api.getLookupLabel('businessCriticality', target.businessCriticality)}</span></span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">RTO (Objetivo)</span>
          <span class="bia-metric-value">${rtoLabel}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">RPO (Objetivo)</span>
          <span class="bia-metric-value">${rpoLabel}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">MTPD</span>
          <span class="bia-metric-value">${mtpdLabel}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">MBCO</span>
          <span class="bia-metric-value">${mbcoLabel}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">Responsable</span>
          <span class="bia-metric-value">${target.ownerName || '-'}</span>
        </div>
        <div class="bia-metric">
          <span class="bia-metric-label">Estado levantamiento</span>
          <span class="bia-metric-value"><span class="badge ${status.badgeClass}">${status.label}</span></span>
        </div>
      </div>

      <div class="bia-description">
        <strong>Descripción:</strong> ${target.description || 'Sin descripción registrada.'}
      </div>

      <div class="bia-xlsx-grid mt-14">
        <div class="bia-xlsx-card">
          <h5><i class="bi bi-person-vcard"></i> Datos entrevistado</h5>
          <div class="bia-xlsx-kv">
            <div><span>Fecha de entrevista</span><strong>${interviewData.interviewDate}</strong></div>
            <div><span>Nombre del entrevistado</span><strong>${interviewData.intervieweeName}</strong></div>
            <div><span>Cargo del entrevistado</span><strong>${interviewData.intervieweeRole}</strong></div>
            <div><span>Persona que realiza levantamiento</span><strong>${interviewData.surveyorName}</strong></div>
            <div><span>Cargo de levantamiento</span><strong>${interviewData.surveyorRole}</strong></div>
          </div>
        </div>

        <div class="bia-xlsx-card">
          <h5><i class="bi bi-check2-square"></i> Validación del proceso</h5>
          <div class="table-wrapper">
            <table class="bia-approval-table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${approvalData.map((row) => `
                  <tr>
                    <td>${row.role}</td>
                    <td>${row.name}</td>
                    <td>${row.date}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="bia-inline-dependencies mt-14">
        <h4><i class="bi bi-link-45deg"></i> Dependencias del proceso</h4>
        ${dependenciesMarkup}
      </div>
    </div>

    <hr class="bia-detail-separator">

    <div class="bia-detail-matrix" id="bia-matrix-section">
      ${xlsxSchema}
    </div>
  `;
  } catch (error) {
    console.error('[BIA] Error al renderizar detalle', error);
    detailContent.innerHTML = `
      <div class="bia-empty-state">
        No fue posible renderizar el detalle del objetivo seleccionado.
      </div>
    `;
    showToast('No se pudo mostrar el detalle BIA. Revise datos del levantamiento.', 'warning');
  }

  renderBIAKPIs();
}

function renderBIAExcelProcessSchema(target) {
  const timeBuckets = getBIATimeBuckets();
  const impactCategories = getBIAImpactCategories();
  const matrixRows = getBIAMatrixRows(target);
  const searchTerm = String(AppState.biaMatrixSearchTerm || '').toLowerCase().trim();
  const filteredRows = matrixRows.filter((row) => searchTerm === '' || row.searchText.includes(searchTerm));
  const pageInfo = paginateBIAMatrix(target.targetKey, filteredRows.length, AppState.biaMatrixPageSize || 10);
  const pagedRows = filteredRows.slice(pageInfo.startIndex, pageInfo.endIndex);

  const matrixColspan = (impactCategories.length * timeBuckets.length) + 7;
  const hasData = pagedRows.length > 0;
  const rowMarkup = hasData
    ? pagedRows.map(row => row.html).join('')
    : `<tr id="bia-matrix-empty-row"><td colspan="${matrixColspan}" class="text-center color-muted">${matrixRows.length === 0 ? 'Sin escenarios disponibles para este proceso.' : 'No se encontraron escenarios con ese criterio de búsqueda.'}</td></tr>`;

  return `
    <div class="bia-xlsx-section">
      <div class="bia-xlsx-header">
        <h4><i class="bi bi-file-earmark-spreadsheet"></i> Esquema BancoEstado - BIA (formato planilla)</h4>
        <span class="badge badge-info">Datos desde datastore actual</span>
      </div>

      <div class="table-toolbar-unified bia-matrix-toolbar">
        <div class="toolbar-search-integrated">
          <i class="bi bi-search"></i>
          <input
            type="text"
            id="bia-matrix-search"
            value="${AppState.biaMatrixSearchTerm || ''}"
            placeholder="Buscar escenario o tipo de impacto..."
            oninput="filterBIAMatrix(this.value)"
          >
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="clearBIAMatrixFilter()">
          <i class="bi bi-arrow-counterclockwise"></i> Limpiar
        </button>
        <button
          id="btn-toggle-bia-sticky"
          type="button"
          class="btn btn-outline btn-sm"
          aria-pressed="${AppState.biaStickyColumnsEnabled ? 'true' : 'false'}"
          onclick="toggleBIAStickyColumns()"
        >
          <i class="bi ${AppState.biaStickyColumnsEnabled ? 'bi-lock' : 'bi-unlock'}"></i>
          ${AppState.biaStickyColumnsEnabled ? 'Desactivar fijado' : 'Activar fijado'}
        </button>
      </div>

      <div class="bia-xlsx-table-wrapper table-wrapper mt-12">
        <table id="bia-matrix-table" class="bia-xlsx-table fs-11${AppState.biaStickyColumnsEnabled ? '' : ' bia-sticky-disabled'}">
          <thead>
            <tr>
              <th rowspan="2" class="bia-sticky-name">Objetivo BCMS</th>
              <th rowspan="2" class="bia-sticky-id">ID objetivo</th>
              <th rowspan="2" class="bia-sticky-scenario">Escenario de Disrupción</th>
              ${impactCategories.map((category) => `<th colspan="${timeBuckets.length}" class="bia-th-group">${category}</th>`).join('')}
              <th colspan="4" class="bia-th-group">Impacto Final</th>
            </tr>
            <tr>
              ${impactCategories.map(() => timeBuckets.map((bucket, bucketIndex) => `<th class="bia-th-sub ${bucketIndex === 0 ? 'group-start' : ''} ${bucketIndex === timeBuckets.length - 1 ? 'group-end' : ''}">${bucket}</th>`).join('')).join('')}
              <th class="bia-th-sub final-start">Mayor impacto hasta 24h</th>
              <th class="bia-th-sub">Tipo de impacto</th>
              <th class="bia-th-sub">MTPD</th>
              <th class="bia-th-sub">RTO</th>
            </tr>
          </thead>
          <tbody>
            ${rowMarkup}
          </tbody>
        </table>
      </div>
      ${renderBIAMatrixPagination(target.targetKey, filteredRows.length, pageInfo.currentPage, pageInfo.pageSize)}
    </div>
  `;
}

function getBIAMatrixRows(target) {
  const timeBuckets = getBIATimeBuckets();
  const impactCategories = getBIAImpactCategories();
  const scenarios = getBIAScenariosForTarget(target);

  const mtpdLabel = typeof target.mtpdMinutes === 'number'
    ? formatMinutesToTime(target.mtpdMinutes)
    : (typeof target.maximumTolerableDowntimeMinutes === 'number' ? formatMinutesToTime(target.maximumTolerableDowntimeMinutes) : '-');
  const rtoLabel = typeof target.targetRtoMinutes === 'number'
    ? formatMinutesToTime(target.targetRtoMinutes)
    : '-';

  return scenarios.map((scenario, scenarioIndex) => {
    const scenarioKey = getBIAScenarioKey(scenario, scenarioIndex);
    const impactScores24h = [];
    const impactTypePeak = {};

    const matrixCells = impactCategories.map((category) => {
      return timeBuckets.map((_, bucketIndex) => {
        const score = getBIAImpactCellScore(target.targetKey, scenario, scenarioKey, category, bucketIndex);
        if (bucketIndex <= 3) {
          impactScores24h.push(score);
          impactTypePeak[category] = Math.max(impactTypePeak[category] || 0, score);
        }

        const cellClasses = [
          'bia-impact-cell',
          bucketIndex === 0 ? 'bia-impact-group-start' : '',
          bucketIndex === timeBuckets.length - 1 ? 'bia-impact-group-end' : ''
        ].filter(Boolean).join(' ');

        return `
          <td class="${cellClasses}" data-impact-cell="1" data-category="${category}" data-bucket-index="${bucketIndex}">
            <button
              type="button"
              class="bia-impact-pill bia-impact-editor level-${score}"
              data-level="${score}"
              data-target-key="${target.targetKey}"
              data-scenario-key="${scenarioKey}"
              data-category="${category}"
              data-bucket-index="${bucketIndex}"
              onclick="cycleBIAImpactLevel(this)"
              title="Click para editar nivel de impacto"
            >${getBIAImpactLabel(score)}</button>
          </td>
        `;
      }).join('');
    }).join('');

    const maxImpact24hScore = impactScores24h.length > 0 ? Math.max(...impactScores24h) : 1;
    const maxImpact24h = getBIAImpactLabel(maxImpact24hScore);
    const majorType = resolveBiaMajorImpactType(impactTypePeak, impactCategories);
    const scenarioText = scenario.scenario || scenario.title || '-';
    const searchText = `${target.name || ''} ${scenarioText} ${majorType} ${getBIAEntityTypeLabel(target.targetType)}`.toLowerCase();
    const targetIdLabel = `${getBIAEntityTypeLabel(target.targetType)} #${target.targetId}`;

    return {
      scenarioKey,
      searchText,
      html: `
        <tr data-target-key="${target.targetKey}" data-scenario-key="${scenarioKey}">
          <td class="fw-600 bia-sticky-name">${target.name}</td>
          <td class="bia-sticky-id">${targetIdLabel}</td>
          <td class="bia-scenario-cell bia-sticky-scenario" title="${scenarioText}">${scenarioText}</td>
          ${matrixCells}
          <td class="bia-final-start" data-bia-final-impact><span class="bia-impact-pill level-${maxImpact24hScore}" data-level="${maxImpact24hScore}">${maxImpact24h}</span></td>
          <td class="bia-final-value" data-bia-final-type>${majorType}</td>
          <td class="bia-final-value">${mtpdLabel}</td>
          <td class="bia-final-value">${rtoLabel}</td>
        </tr>
      `
    };
  });
}

function paginateBIAMatrix(targetKey, totalRows, pageSize = 10) {
  const normalizedTargetKey = String(targetKey || '');
  const normalizedPageSize = Math.max(1, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(totalRows / normalizedPageSize));
  const currentFromState = Number(AppState.biaMatrixPageByProcess[normalizedTargetKey] || 1);
  const currentPage = Math.max(1, Math.min(totalPages, currentFromState));
  const startIndex = (currentPage - 1) * normalizedPageSize;
  const endIndex = Math.min(startIndex + normalizedPageSize, totalRows);

  AppState.biaMatrixPageByProcess[normalizedTargetKey] = currentPage;

  return {
    currentPage,
    totalPages,
    pageSize: normalizedPageSize,
    startIndex,
    endIndex
  };
}

function renderBIAMatrixPagination(targetKey, totalRows, currentPage, pageSize) {
  const normalizedPageSize = Math.max(1, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(totalRows / normalizedPageSize));
  const safePage = Math.max(1, Math.min(totalPages, Number(currentPage) || 1));
  const from = totalRows === 0 ? 0 : ((safePage - 1) * normalizedPageSize) + 1;
  const to = totalRows === 0 ? 0 : Math.min(totalRows, safePage * normalizedPageSize);
  const pages = [];

  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(`
      <button type="button" class="${i === safePage ? 'active' : ''}" onclick="changeBIAMatrixPage('${targetKey}', ${i})">${i}</button>
    `);
  }

  return `
    <div class="dm-pagination bia-matrix-pagination">
      <span class="page-info">Mostrando ${from} a ${to} de ${totalRows}</span>
      <div class="d-flex gap-8 ai-center">
        <button type="button" ${safePage <= 1 ? 'disabled' : ''} onclick="changeBIAMatrixPage('${targetKey}', ${safePage - 1})">Previo</button>
        ${pages.join('')}
        <button type="button" ${safePage >= totalPages ? 'disabled' : ''} onclick="changeBIAMatrixPage('${targetKey}', ${safePage + 1})">Siguiente</button>
      </div>
    </div>
  `;
}

function changeBIAMatrixPage(targetKey, targetPage) {
  const normalizedTargetKey = String(targetKey || '');
  const nextPage = Math.max(1, Number(targetPage) || 1);
  AppState.biaMatrixPageByProcess[normalizedTargetKey] = nextPage;
  refreshBIASelectedProcessMatrix();
}

function refreshBIASelectedProcessMatrix() {
  if (!AppState.selectedBIATargetKey) return;
  const selected = parseBIATargetKey(AppState.selectedBIATargetKey);
  if (!selected) return;
  const target = getBIAEntityFromTarget(selected.targetType, selected.targetId);
  const container = document.getElementById('bia-matrix-section');
  if (!target || !container) return;
  container.innerHTML = renderBIAExcelProcessSchema(target);
}

function toggleBIAStickyColumns() {
  AppState.biaStickyColumnsEnabled = !AppState.biaStickyColumnsEnabled;
  const enabled = AppState.biaStickyColumnsEnabled;

  document.querySelectorAll('.bia-xlsx-table').forEach((tableEl) => {
    tableEl.classList.toggle('bia-sticky-disabled', !enabled);
  });

  const buttonEl = document.getElementById('btn-toggle-bia-sticky');
  if (buttonEl) {
    buttonEl.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    buttonEl.innerHTML = `
      <i class="bi ${enabled ? 'bi-lock' : 'bi-unlock'}"></i>
      ${enabled ? 'Desactivar fijado' : 'Activar fijado'}
    `;
  }
}

function clearBIAMatrixFilter() {
  AppState.biaMatrixSearchTerm = '';
  if (AppState.selectedBIATargetKey) {
    AppState.biaMatrixPageByProcess[AppState.selectedBIATargetKey] = 1;
  }
  const input = document.getElementById('bia-matrix-search');
  if (input) input.value = '';
  refreshBIASelectedProcessMatrix();
}

function filterBIAMatrix(query) {
  const term = (query || '').toLowerCase().trim();
  AppState.biaMatrixSearchTerm = term;
  if (AppState.selectedBIATargetKey) {
    AppState.biaMatrixPageByProcess[AppState.selectedBIATargetKey] = 1;
  }
  refreshBIASelectedProcessMatrix();
}

function getBIATimeBuckets() {
  return getBIALookupLabels('biaTimeBuckets', ['< 1 HORA', 'ENTRE 1 Y 2 HORAS', 'ENTRE 2 Y 6 HORAS', 'ENTRE 6 Y 24 HORAS', 'ENTRE 24 Y 36 HORAS', '> 36 HORAS']);
}

function getBIAImpactCategories() {
  return getBIALookupLabels('biaImpactCategories', ['Monetario', 'Procesos', 'Reputacional', 'Normativo', 'Clientes']);
}

function getBIAImpactLabel(score) {
  const levels = getBIAImpactLevels();
  const maxLevel = Math.max(1, levels.length || 5);
  const normalized = Math.max(1, Math.min(maxLevel, Number(score) || 1));
  return levels[normalized - 1];
}

function getBIAImpactScoreForCell(scenario, category, bucketIndex) {
  const baseScore = Number(scenario.residualImpact || scenario.inherentImpact || 3);
  const domainBoost = String(scenario.riskDomain || '').toUpperCase() === 'CYBER' ? 1 : 0;
  const timeBoost = bucketIndex <= 1 ? 0 : (bucketIndex <= 3 ? 1 : 2);
  const categoryBias = {
    Monetario: 0,
    Procesos: -1,
    Reputacional: 0,
    Normativo: -1,
    Clientes: 1
  };

  const rawScore = baseScore + domainBoost + timeBoost + (categoryBias[category] || 0) - 1;
  return Math.max(1, Math.min(5, rawScore));
}

function getBIAScenarioKey(scenario, scenarioIndex = 0) {
  const raw = String(scenario.id || scenario.code || scenario.scenario || scenario.title || `scn-${scenarioIndex}`);
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || `scn-${scenarioIndex}`;
}

function getBIAImpactOverrideKey(targetKey, scenarioKey, category, bucketIndex) {
  return `${targetKey}::${scenarioKey}::${category}::${bucketIndex}`;
}

function normalizeBIAImpactMap(rawMap) {
  if (!rawMap || typeof rawMap !== 'object') return null;
  const timeBuckets = getBIATimeBuckets();
  const categories = getBIAImpactCategories();
  const normalized = {};

  categories.forEach((category) => {
    const row = rawMap[category];
    const fallbackRow = rawMap[String(category).toLowerCase()];
    const values = Array.isArray(row) ? row : (Array.isArray(fallbackRow) ? fallbackRow : []);
    normalized[category] = timeBuckets.map((_, idx) => {
      const score = Number(values[idx]);
      return Number.isNaN(score) ? 3 : Math.max(1, Math.min(5, score));
    });
  });

  return normalized;
}

function getBIAMatrixTemplateForTarget(targetRef) {
  const target = resolveBIATargetRef(targetRef);
  if (!target) return null;

  const assessment = getLatestBIAAssessment(target);
  if (!assessment) return null;

  const explicitTemplate = normalizeBIAImpactMap(assessment.matrixTemplate || null);
  if (explicitTemplate) return explicitTemplate;

  const matrixSummary = assessment.matrixSummary || null;
  if (!matrixSummary) return null;

  const summaryByCategory = {
    Monetario: Number(matrixSummary.monetarioLevel || 3),
    Procesos: Number(matrixSummary.procesosLevel || 3),
    Reputacional: Number(matrixSummary.reputacionalLevel || 3),
    Normativo: Number(matrixSummary.normativoLevel || 3),
    Clientes: Number(matrixSummary.clientesLevel || 3)
  };

  const fallbackTemplate = {};
  getBIAImpactCategories().forEach((category) => {
    const level = Math.max(1, Math.min(5, Number(summaryByCategory[category] || 3)));
    fallbackTemplate[category] = getBIATimeBuckets().map(() => level);
  });
  return fallbackTemplate;
}

function getBIAMatrixByScenarioForTarget(targetRef) {
  const target = resolveBIATargetRef(targetRef);
  if (!target) return {};
  const assessment = getLatestBIAAssessment(target);
  if (!assessment || !assessment.matrixByScenario || typeof assessment.matrixByScenario !== 'object') return {};

  const normalizedMap = {};
  Object.entries(assessment.matrixByScenario).forEach(([scenarioKey, scenarioData]) => {
    const normalizedKey = String(scenarioKey || '').trim();
    if (!normalizedKey) return;
    const rawTemplate = scenarioData?.matrixTemplate || scenarioData;
    const normalizedTemplate = normalizeBIAImpactMap(rawTemplate || null);
    if (!normalizedTemplate) return;
    normalizedMap[normalizedKey] = normalizedTemplate;
  });
  return normalizedMap;
}

function getBIAScenarioTemplateScore(targetRef, scenarioKey, category, bucketIndex) {
  const normalizedScenarioKey = String(scenarioKey || '').trim();
  if (!normalizedScenarioKey) return null;
  const scenarioMap = getBIAMatrixByScenarioForTarget(targetRef);
  const template = scenarioMap[normalizedScenarioKey];
  if (!template || !Array.isArray(template[category])) return null;
  const score = Number(template[category][bucketIndex]);
  if (Number.isNaN(score)) return null;
  return Math.max(1, Math.min(5, score));
}

function getBIAImpactTemplateScore(targetRef, category, bucketIndex) {
  const template = getBIAMatrixTemplateForTarget(targetRef);
  if (!template || !Array.isArray(template[category])) return null;
  const score = Number(template[category][bucketIndex]);
  if (Number.isNaN(score)) return null;
  return Math.max(1, Math.min(5, score));
}

function getBIAImpactCellScore(targetRef, scenario, scenarioKey, category, bucketIndex) {
  const target = resolveBIATargetRef(targetRef);
  const targetKey = target ? target.targetKey : getBIATargetKey('PROCESS', targetRef);
  const overrideKey = getBIAImpactOverrideKey(targetKey, scenarioKey, category, bucketIndex);
  const override = AppState.biaImpactOverrides[overrideKey];
  if (typeof override === 'number') {
    return override;
  }

  const scenarioTemplateScore = getBIAScenarioTemplateScore(target || targetRef, scenarioKey, category, bucketIndex);
  if (typeof scenarioTemplateScore === 'number') return scenarioTemplateScore;

  const templateScore = getBIAImpactTemplateScore(target || targetRef, category, bucketIndex);
  if (typeof templateScore === 'number') return templateScore;

  return getBIAImpactScoreForCell(scenario, category, bucketIndex);
}

function resolveBiaMajorImpactType(impactTypePeak, impactCategories) {
  const entries = Object.entries(impactTypePeak);
  if (entries.length === 0) return 'Procesos';
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return impactCategories.indexOf(a[0]) - impactCategories.indexOf(b[0]);
  });
  return entries[0][0];
}

function cycleBIAImpactLevel(buttonEl) {
  if (!buttonEl) return;
  const maxLevel = Math.max(1, getBIAImpactLevels().length || 5);
  const current = Number(buttonEl.dataset.level) || 1;
  const next = current >= maxLevel ? 1 : current + 1;
  applyBIAImpactPillLevel(buttonEl, next);

  const targetKey = buttonEl.dataset.targetKey || getBIATargetKey('PROCESS', buttonEl.dataset.processId);
  const scenarioKey = buttonEl.dataset.scenarioKey;
  const category = buttonEl.dataset.category;
  const bucketIndex = buttonEl.dataset.bucketIndex;
  const overrideKey = getBIAImpactOverrideKey(targetKey, scenarioKey, category, bucketIndex);
  AppState.biaImpactOverrides[overrideKey] = next;

  const row = buttonEl.closest('tr');
  refreshBIAImpactRowSummary(row);
}

function applyBIAImpactPillLevel(buttonEl, level) {
  const normalized = Math.max(1, Math.min(5, Number(level) || 1));
  buttonEl.dataset.level = String(normalized);
  buttonEl.classList.remove('level-1', 'level-2', 'level-3', 'level-4', 'level-5');
  buttonEl.classList.add(`level-${normalized}`);
  buttonEl.textContent = getBIAImpactLabel(normalized);
}

function refreshBIAImpactRowSummary(rowEl) {
  if (!rowEl) return;
  const impactCategories = getBIAImpactCategories();
  const peakByCategory = {};
  let max24hScore = 1;

  rowEl.querySelectorAll('td[data-impact-cell="1"]').forEach((cell) => {
    const bucketIndex = Number(cell.dataset.bucketIndex);
    const category = cell.dataset.category;
    const button = cell.querySelector('.bia-impact-pill');
    if (!button) return;

    const score = Number(button.dataset.level) || 1;
    if (bucketIndex <= 3) {
      peakByCategory[category] = Math.max(peakByCategory[category] || 0, score);
      max24hScore = Math.max(max24hScore, score);
    }
  });

  const finalImpactPill = rowEl.querySelector('[data-bia-final-impact] .bia-impact-pill');
  if (finalImpactPill) {
    applyBIAImpactPillLevel(finalImpactPill, max24hScore);
  }

  const finalTypeCell = rowEl.querySelector('[data-bia-final-type]');
  if (finalTypeCell) {
    finalTypeCell.textContent = resolveBiaMajorImpactType(peakByCategory, impactCategories);
  }
}

function getBIAScenariosForProcessCore(process) {
  const risks = (BCMSDataStore.entities.risks || []).filter(r => !r.isDeleted);
  const processId = Number(process.id);
  const direct = risks.filter(r => Number(r.targetProcessId) === processId);
  const global = risks.filter(r => !r.targetProcessId && ['CONTINUITY', 'CYBER', 'OPERATIONAL'].includes(String(r.riskDomain || '').toUpperCase()));
  const merged = [...direct];

  global.forEach(r => {
    if (!merged.find(item => item.id === r.id)) {
      merged.push(r);
    }
  });

  if (merged.length > 0) {
    return merged;
  }

  const dependencies = BCMSDataStore.api.filter('biaDependencies', d => Number(d.processId) === processId);
  if (dependencies.length > 0) {
    const criticalityToImpact = { LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
    return dependencies.map((dep) => ({
      id: `dep-${dep.id}`,
      scenario: `Indisponibilidad de ${dep.referenceName}`,
      residualImpact: criticalityToImpact[String(dep.criticality || '').toUpperCase()] || 3,
      riskDomain: dep.dependencyType === 'APPLICATION' ? 'CONTINUITY' : 'OPERATIONAL'
    }));
  }

  return [{
    id: `proc-${process.id}`,
    scenario: process.description || 'Escenario no registrado',
    residualImpact: process.businessCriticality === 'CRITICAL' ? 5 : process.businessCriticality === 'HIGH' ? 4 : 3,
    riskDomain: 'CONTINUITY'
  }];
}

function getBIAScenariosForTarget(targetRef) {
  const resolved = resolveBIATargetRef(targetRef);
  if (!resolved) return [];
  const target = getBIAEntityFromTarget(resolved.targetType, resolved.targetId);
  if (!target) return [];

  const mergeWithAssessmentScenarios = (baseScenarios) => {
    const scenarios = Array.isArray(baseScenarios) ? [...baseScenarios] : [];
    const latestAssessment = getLatestBIAAssessment(resolved.targetType, resolved.targetId);
    const customScenarios = Array.isArray(latestAssessment?.customScenarios)
      ? latestAssessment.customScenarios
      : [];

    if (customScenarios.length === 0) return scenarios;

    const existingKeys = new Set(scenarios.map((scenario, index) => getBIAScenarioKey(scenario, index)));
    customScenarios.forEach((customScenario, index) => {
      const scenarioTitle = String(customScenario?.scenario || customScenario?.title || '').trim();
      if (!scenarioTitle) return;
      const scenarioKey = String(customScenario?.scenarioKey || getBIAScenarioKey(scenarioTitle, index)).trim();
      if (!scenarioKey || existingKeys.has(scenarioKey)) return;
      existingKeys.add(scenarioKey);
      scenarios.push({
        id: scenarioKey,
        scenario: scenarioTitle,
        residualImpact: Number(customScenario?.residualImpact || 3),
        riskDomain: 'CONTINUITY',
        isCustom: true
      });
    });
    return scenarios;
  };

  if (resolved.targetType === 'PROCESS') {
    return mergeWithAssessmentScenarios(getBIAScenariosForProcessCore(target));
  }

  if (resolved.targetType === 'SUBPROCESS') {
    const parent = target.parentProcessId ? BCMSDataStore.api.getById('processes', target.parentProcessId) : null;
    if (parent) {
      const derivedScenarios = getBIAScenariosForProcessCore(parent).map((scenario, index) => ({
        ...scenario,
        id: `${scenario.id || `sub-${index}`}-sub-${target.targetId}`,
        scenario: `Subproceso ${target.name}: ${scenario.scenario || scenario.title || 'Escenario derivado'}`
      }));
      return mergeWithAssessmentScenarios(derivedScenarios);
    }

    return mergeWithAssessmentScenarios([{
      id: `sub-${target.targetId}`,
      scenario: target.description || `Interrupción de ${target.name}`,
      residualImpact: String(target.businessCriticality || '').toUpperCase() === 'CRITICAL' ? 5 : 4,
      riskDomain: 'CONTINUITY'
    }]);
  }

  const childProcesses = (BCMSDataStore.entities.processes || [])
    .filter(p => !p.isDeleted && Number(p.macroprocessId) === Number(target.targetId));
  if (childProcesses.length === 0) {
    return mergeWithAssessmentScenarios([{
      id: `macro-${target.targetId}`,
      scenario: target.description || `Interrupción de ${target.name}`,
      residualImpact: String(target.businessCriticality || '').toUpperCase() === 'CRITICAL' ? 5 : 4,
      riskDomain: 'CONTINUITY'
    }]);
  }

  const processIds = childProcesses.map(p => Number(p.id));
  const risks = (BCMSDataStore.entities.risks || []).filter(r => !r.isDeleted);
  const directRisks = risks.filter(r => processIds.includes(Number(r.targetProcessId)));
  const globalRisks = risks.filter(r => !r.targetProcessId && ['CONTINUITY', 'CYBER', 'OPERATIONAL'].includes(String(r.riskDomain || '').toUpperCase()));
  const merged = [...directRisks];

  globalRisks.forEach((risk) => {
    if (!merged.find(item => item.id === risk.id)) merged.push(risk);
  });

  if (merged.length > 0) return mergeWithAssessmentScenarios(merged);

  return mergeWithAssessmentScenarios([{
    id: `macro-${target.targetId}`,
    scenario: target.description || `Interrupción de ${target.name}`,
    residualImpact: String(target.businessCriticality || '').toUpperCase() === 'CRITICAL' ? 5 : 4,
    riskDomain: 'CONTINUITY'
  }]);
}

function getBIAScenariosForProcess(process) {
  return getBIAScenariosForTarget({
    targetType: 'PROCESS',
    targetId: process.id
  });
}

function getBIAInterviewData(targetRef) {
  const target = resolveBIATargetRef(targetRef);
  if (!target) {
    return {
      interviewDate: '-',
      intervieweeName: '-',
      intervieweeRole: '-',
      surveyorName: '-',
      surveyorRole: '-',
      participants: []
    };
  }

  const targetEntity = getBIAEntityFromTarget(target.targetType, target.targetId);
  if (!targetEntity) {
    return {
      interviewDate: '-',
      intervieweeName: '-',
      intervieweeRole: '-',
      surveyorName: '-',
      surveyorRole: '-',
      participants: []
    };
  }

  const latestAssessment = getLatestBIAAssessment(target);
  if (latestAssessment) {
    const participants = Array.isArray(latestAssessment.interviewParticipants)
      ? latestAssessment.interviewParticipants.filter(Boolean)
      : [];
    const firstParticipant = participants[0] || {};
    return {
      interviewDate: formatDate(latestAssessment.interviewDate),
      intervieweeName: latestAssessment.intervieweeName || firstParticipant.name || '-',
      intervieweeRole: latestAssessment.intervieweeRole || firstParticipant.role || '-',
      surveyorName: latestAssessment.surveyorName || '-',
      surveyorRole: latestAssessment.surveyorRole || '-',
      participants
    };
  }

  const surveyorUser = findUserByFullName(getActiveSessionUserName()) || null;
  return {
    interviewDate: '-',
    intervieweeName: '-',
    intervieweeRole: '-',
    surveyorName: getActiveSessionUserName(),
    surveyorRole: surveyorUser?.role || '-',
    participants: []
  };
}

function getBIAApprovalData(targetRef) {
  const target = resolveBIATargetRef(targetRef);
  if (!target) return [];
  const targetEntity = getBIAEntityFromTarget(target.targetType, target.targetId);
  if (!targetEntity) return [];

  const latestAssessment = getLatestBIAAssessment(target);
  if (latestAssessment) {
    const approvals = (BCMSDataStore.entities.biaAssessmentApprovals || [])
      .filter(row => !row.isDeleted && Number(row.assessmentId) === Number(latestAssessment.id));
    if (approvals.length > 0) {
      return approvals.map(row => ({
        role: row.role,
        name: row.name || '-',
        date: formatDate(row.date)
      }));
    }
  }

  const users = BCMSDataStore.entities.users || [];
  const continuityLead = users.find(u => String(u.role || '').toLowerCase().includes('continuidad'));
  const riskLead = users.find(u => String(u.role || '').toLowerCase().includes('riesgo'));
  const owner = target.targetType === 'PROCESS' ? getUserByProcess(targetEntity) : null;
  const processDate = formatDate(targetEntity.updatedAt || targetEntity.createdAt);
  const processOwnerName = targetEntity.ownerName || targetEntity.owner || (owner ? `${owner.firstName} ${owner.lastName}` : '-');

  return [
    { role: 'Responsable de Proceso', name: processOwnerName, date: processDate },
    { role: 'Jefe de Continuidad de Negocio', name: continuityLead ? `${continuityLead.firstName} ${continuityLead.lastName}` : '-', date: processDate },
    { role: 'Jefe de Departamento de Riesgo Operacional', name: riskLead ? `${riskLead.firstName} ${riskLead.lastName}` : '-', date: processDate }
  ];
}

function resolveBIAAssessmentTarget(assessment) {
  if (!assessment) return null;
  if (assessment.targetProcessType && assessment.targetProcessId !== undefined && assessment.targetProcessId !== null) {
    return {
      targetType: String(assessment.targetProcessType).toUpperCase(),
      targetId: Number(assessment.targetProcessId),
      targetKey: getBIATargetKey(assessment.targetProcessType, assessment.targetProcessId)
    };
  }

  if (assessment.processId !== undefined && assessment.processId !== null) {
    return {
      targetType: 'PROCESS',
      targetId: Number(assessment.processId),
      targetKey: getBIATargetKey('PROCESS', assessment.processId)
    };
  }

  return null;
}

function getLatestBIAAssessment(targetType = 'PROCESS', targetId = null) {
  const target = resolveBIATargetRef(targetType, targetId);
  if (!target) return null;

  const assessments = (BCMSDataStore.entities.biaAssessments || [])
    .filter(a => !a.isDeleted)
    .filter((assessment) => {
      const assessmentTarget = resolveBIAAssessmentTarget(assessment);
      return assessmentTarget && assessmentTarget.targetKey === target.targetKey;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  return assessments[0] || null;
}

function getBIALevantamientoStatus(targetType = 'PROCESS', targetId = null) {
  const assessment = getLatestBIAAssessment(targetType, targetId);
  if (!assessment) {
    return { code: 'SIN_INICIAR', label: 'Sin iniciar', badgeClass: 'badge-neutral' };
  }

  const status = String(assessment.status || '').toUpperCase();
  if (['COMPLETADO', 'COMPLETED', 'CERRADO', 'CLOSED'].includes(status)) {
    return { code: 'COMPLETADO', label: 'Completado', badgeClass: 'badge-success' };
  }

  return { code: 'EN_CURSO', label: 'En curso', badgeClass: 'badge-warning' };
}

function getUserByProcess(process) {
  return findUserByFullName(process.ownerName || process.owner);
}

function findUserByFullName(fullName) {
  if (!fullName) return null;
  const target = String(fullName).toLowerCase().trim();
  const users = BCMSDataStore.entities.users || [];
  return users.find(u => `${u.firstName} ${u.lastName}`.toLowerCase().trim() === target) || null;
}

function getBIADependenciesForTarget(targetRef) {
  const target = resolveBIATargetRef(targetRef);
  if (!target) return [];

  let processIds = [];
  if (target.targetType === 'PROCESS') {
    processIds = [Number(target.targetId)];
  } else if (target.targetType === 'SUBPROCESS') {
    const sub = BCMSDataStore.api.getById('subprocesses', Number(target.targetId));
    if (sub?.processId) processIds = [Number(sub.processId)];
  } else if (target.targetType === 'MACROPROCESS') {
    processIds = (BCMSDataStore.entities.processes || [])
      .filter(p => !p.isDeleted && Number(p.macroprocessId) === Number(target.targetId))
      .map(p => Number(p.id));
  }

  if (processIds.length === 0) return [];
  return BCMSDataStore.api.filter('biaDependencies', d => processIds.includes(Number(d.processId)));
}

function getBIADependenciesMarkup(targetRef) {
  const dependencies = getBIADependenciesForTarget(targetRef);

  if (dependencies.length === 0) {
    return '<p class="color-muted fs-13">No hay dependencias registradas para este proceso.</p>';
  }

  const grouped = {};
  dependencies.forEach((dep) => {
    if (!grouped[dep.dependencyType]) grouped[dep.dependencyType] = [];
    grouped[dep.dependencyType].push(dep);
  });

  return Object.entries(grouped).map(([type, deps]) => `
    <div class="bia-dependency-group">
      <div class="bia-dependency-group-header">
        <span>${BCMSDataStore.api.getLookupLabel('dependencyType', type)}</span>
        <span class="badge badge-info">${deps.length}</span>
      </div>
      <div class="bia-dependency-list">
        ${deps.map(d => `<div class="bia-dependency-row"><span>${d.referenceName}</span><span class="badge badge-${(d.criticality || 'medium').toLowerCase()}">${d.criticality || 'N/A'}</span></div>`).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Renderiza las dependencias de un proceso
 */
function renderBIADependencies(targetRef) {
  const content = document.getElementById('bia-dependencies-content');
  if (!content) return;
  content.innerHTML = getBIADependenciesMarkup(targetRef);
}

/**
 * Renderiza la lista de planes
 */
function renderPlansList() {
  const list = document.getElementById('plans-list');
  if (!list) return;

  const plans = BCMSDataStore.api
    .filter('continuityPlans', p => p.planType === 'BCP')
    .sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return String(a.code || '').localeCompare(String(b.code || ''));
    });

  if (plans.length === 0) {
    list.innerHTML = '<div class="bia-empty-state">No hay planes BCP registrados.</div>';
    return;
  }

  list.innerHTML = plans.map(p => `
    <div class="plan-item ${AppState.selectedPlan === p.id ? 'active-item' : ''}" data-plan-id="${p.id}" onclick="selectPlan(${p.id})">
      <div class="plan-item-header">
        <div>
          <div class="plan-item-title"><span class="badge badge-info">${p.planType}</span> ${p.code}</div>
          <div class="plan-item-subtitle">${p.title}</div>
          <div class="plan-item-meta">${p.nextReviewDate ? `Próx. revisión: ${p.nextReviewDate}` : 'Sin próxima revisión definida'}</div>
        </div>
        <span class="badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}">${BCMSDataStore.api.getLookupLabel('planStatus', p.status) || p.status}</span>
      </div>
    </div>
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
  document.querySelectorAll('#plans-list .plan-item').forEach(item => {
    item.classList.toggle('active-item', Number(item.dataset.planId) === planId);
  });

  // Actualizar detalle
  document.getElementById('plan-detail-title').textContent = `${plan.code} - ${plan.title}`;
  
  const owner = plan.ownerUserId ? BCMSDataStore.api.getById('users', plan.ownerUserId) : null;
  const process = plan.targetProcessId ? BCMSDataStore.api.getById('processes', plan.targetProcessId) : null;
  
  const detailContent = document.getElementById('plan-detail-content');
  detailContent.innerHTML = `
    <div class="plan-detail-grid">
      <div class="plan-detail-col">
        <div class="plan-detail-item"><span class="plan-detail-label">Tipo</span><span class="plan-detail-value">${BCMSDataStore.api.getLookupLabel('planType', plan.planType) || plan.planType}</span></div>
        <div class="plan-detail-item"><span class="plan-detail-label">Versión</span><span class="plan-detail-value">${plan.version || '-'}</span></div>
        <div class="plan-detail-item"><span class="plan-detail-label">Estado</span><span class="badge ${plan.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}">${BCMSDataStore.api.getLookupLabel('planStatus', plan.status) || plan.status}</span></div>
      </div>
      <div class="plan-detail-col">
        <div class="plan-detail-item"><span class="plan-detail-label">Responsable</span><span class="plan-detail-value">${owner ? `${owner.firstName} ${owner.lastName}` : '-'}</span></div>
        <div class="plan-detail-item"><span class="plan-detail-label">Proceso</span><span class="plan-detail-value">${process ? process.name : 'Alcance global'}</span></div>
        <div class="plan-detail-item"><span class="plan-detail-label">Próxima revisión</span><span class="plan-detail-value">${plan.nextReviewDate || '-'}</span></div>
      </div>
    </div>
    <div class="plan-detail-description">${plan.description || 'Sin descripción registrada.'}</div>
    ${plan.rtoTarget ? `<div class="plan-detail-metrics"><span class="badge badge-info">RTO: ${plan.rtoTarget}h</span><span class="badge badge-warning">RPO: ${plan.rpoTarget || '-'}h</span></div>` : ''}
  `;
  
  // Mostrar y renderizar estrategias
  const strategiesCard = document.getElementById('strategies-card');
  const strategies = BCMSDataStore.api.filter('recoveryStrategies', s => s.planId === planId);
  
  if (strategies.length > 0) {
    strategiesCard.classList.remove('d-none');
    document.getElementById('strategies-content').innerHTML = strategies.map(s => `
      <div class="strategy-card">
        <div class="strategy-card-title">${s.name}</div>
        <p class="strategy-card-description">${s.description || 'Sin descripción'}</p>
        <div class="strategy-card-meta">
          <span><i class="bi bi-clock"></i> RTO: ${s.rtoHours || '-'}h</span>
          <span><i class="bi bi-database"></i> RPO: ${s.rpoHours || '-'}h</span>
          <span><i class="bi bi-currency-dollar"></i> Costo est.: $${s.estimatedCost ? (s.estimatedCost / 1000000).toFixed(1) : '0.0'}M</span>
        </div>
      </div>
    `).join('');
  } else {
    strategiesCard.classList.add('d-none');
  }
  
  // Mostrar y renderizar criterios de activación
  const criteriaCard = document.getElementById('criteria-card');
  const criteria = BCMSDataStore.api.filter('activationCriteria', c => c.planId === planId);
  
  if (criteria.length > 0) {
    criteriaCard.classList.remove('d-none');
    document.getElementById('criteria-content').innerHTML = `
      <div class="criteria-badges-wrap">
        ${criteria.map(c => `
          <span class="criterion-badge ${(c.severity || 'MEDIUM').toLowerCase()}">
            <i class="bi bi-${c.isAutoActivate ? 'lightning' : 'hand-index'}"></i>
            ${c.description}
          </span>
        `).join('')}
      </div>
    `;
  } else {
    criteriaCard.classList.add('d-none');
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
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1200';
    document.body.appendChild(container);
  }
  
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
  if (window.bootstrap && bootstrap.Toast) {
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
  } else {
    setTimeout(() => toastEl.remove(), 3000);
  }
  
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
function editBIA() { openBIALevantamientoModal(); }

function setBIALevSaveButtonsState(isEnabled) {
  ['bia-lev-save-draft-btn', 'bia-lev-save-close-btn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = !isEnabled;
  });
}

function getBIALevTargetOptions(targetType) {
  return getBIAEntityCatalog()
    .filter(item => item.targetType === String(targetType || 'PROCESS').toUpperCase())
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    .map((item) => ({
      id: item.targetId,
      label: `${item.code || '-'} - ${item.name || '-'}`,
      targetType: item.targetType
    }));
}

function renderBIALevTargetSelect(targetType, selectedId = null) {
  const select = document.getElementById('bia-lev-target-id');
  if (!select) return;
  const selected = Number(selectedId || 0);
  const options = getBIALevTargetOptions(targetType);
  select.innerHTML = `
    <option value="">-- Seleccionar objetivo --</option>
    ${options.map(opt => `<option value="${opt.id}" ${selected === Number(opt.id) ? 'selected' : ''}>${opt.label}</option>`).join('')}
  `;
}

function getBIAEligiblePeople() {
  const lookupPeople = Array.isArray(BCMSDataStore?.lookups?.biaInterviewPeople)
    ? BCMSDataStore.lookups.biaInterviewPeople
    : [];
  const users = Array.isArray(BCMSDataStore?.entities?.users)
    ? BCMSDataStore.entities.users.filter(user => !user.isDeleted)
    : [];
  const uniqueByName = new Map();

  lookupPeople.forEach((person, index) => {
    const name = String(person?.name || '').trim();
    if (!name) return;
    uniqueByName.set(name.toLowerCase(), {
      id: person.id || `lookup-${index + 1}`,
      name,
      role: String(person?.role || '').trim() || '-',
      source: person?.source || 'BIA'
    });
  });

  users.forEach((user) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!uniqueByName.has(key)) {
      uniqueByName.set(key, {
        id: user.id,
        name,
        role: String(user.role || '').trim() || '-',
        source: 'Usuarios'
      });
    }
  });

  return [...uniqueByName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function getBIAEligiblePeopleOptionsMarkup(selectedName = '') {
  const selected = String(selectedName || '').trim();
  return `
    <option value="">-- Seleccionar persona --</option>
    ${getBIAEligiblePeople().map((person) => `
      <option value="${person.name}" data-role="${person.role}" ${person.name === selected ? 'selected' : ''}>
        ${person.name}
      </option>
    `).join('')}
  `;
}

function getDefaultBIAInterviewParticipants() {
  return [{ name: '', role: '' }];
}

function renderBIAParticipantRows(participants = null) {
  const tbody = document.getElementById('bia-lev-participants-body');
  if (!tbody) return;

  const sourceParticipants = Array.isArray(participants)
    ? participants.filter(item => item && (item.name || item.role))
    : [];
  const rows = sourceParticipants.length > 0 ? sourceParticipants : getDefaultBIAInterviewParticipants();
  tbody.innerHTML = rows.map((participant, index) => `
    <tr data-participant-index="${index}">
      <td>
        <select class="bia-lev-participant-name" onchange="onBIAParticipantPersonChange(this)">
          ${getBIAEligiblePeopleOptionsMarkup(participant.name)}
        </select>
      </td>
      <td>
        <input type="text" class="bia-lev-participant-role" value="${participant.role || ''}" placeholder="Cargo">
      </td>
      <td class="actions-cell">
        <button type="button" class="btn btn-outline btn-sm" onclick="removeBIAParticipantRow(${index})">
          <i class="bi bi-trash"></i> Quitar
        </button>
      </td>
    </tr>
  `).join('');
}

function addBIAParticipantRow() {
  const participants = collectBIAInterviewParticipants();
  participants.push({ name: '', role: '' });
  renderBIAParticipantRows(participants);
}

function removeBIAParticipantRow(index) {
  const participants = collectBIAInterviewParticipants();
  const next = participants.filter((_, rowIndex) => rowIndex !== Number(index));
  renderBIAParticipantRows(next.length > 0 ? next : [{ name: '', role: '' }]);
}

function onBIAParticipantPersonChange(selectEl) {
  if (!selectEl) return;
  const selectedOption = selectEl.options?.[selectEl.selectedIndex];
  if (!selectedOption) return;
  const inferredRole = String(selectedOption.getAttribute('data-role') || '').trim();
  if (!inferredRole) return;
  const row = selectEl.closest('tr');
  const roleInput = row ? row.querySelector('.bia-lev-participant-role') : null;
  if (roleInput && !String(roleInput.value || '').trim()) {
    roleInput.value = inferredRole;
  }
}

function collectBIAInterviewParticipants() {
  const rows = document.querySelectorAll('#bia-lev-participants-body tr');
  const participants = [];
  rows.forEach((row) => {
    const name = String(row.querySelector('.bia-lev-participant-name')?.value || '').trim();
    const role = String(row.querySelector('.bia-lev-participant-role')?.value || '').trim();
    if (!name && !role) return;
    participants.push({ name, role });
  });
  return participants;
}

function getBIAEmptyMatrixTemplate(defaultScore = 3) {
  const normalizedDefault = Math.max(1, Math.min(5, Number(defaultScore) || 3));
  const template = {};
  getBIAImpactCategories().forEach((category) => {
    template[category] = getBIATimeBuckets().map(() => normalizedDefault);
  });
  return template;
}

function renderBIALevMatrixTable() {
  const table = document.querySelector('.bia-lev-matrix-table');
  const thead = table ? table.querySelector('thead') : null;
  const tbody = document.getElementById('bia-lev-matrix-tbody');
  if (!tbody) return;
  const timeBuckets = getBIATimeBuckets();
  const impactCategories = getBIAImpactCategories();
  const impactLevels = getBIAImpactLevels();
  const getImpactClass = (category) => {
    const key = String(category || '').toLowerCase();
    if (key === 'monetario') return 'bia-lev-impact-monetario';
    if (key === 'procesos') return 'bia-lev-impact-procesos';
    if (key === 'reputacional') return 'bia-lev-impact-reputacional';
    if (key === 'normativo') return 'bia-lev-impact-normativo';
    if (key === 'clientes') return 'bia-lev-impact-clientes';
    return '';
  };

  if (thead) {
    thead.innerHTML = `
      <tr>
        <th class="bia-lev-time-header">Rango de tiempo</th>
        ${impactCategories.map((category) => `<th class="bia-lev-impact-header ${getImpactClass(category)}">${category}</th>`).join('')}
      </tr>
    `;
  }

  tbody.innerHTML = timeBuckets.map((bucketLabel, bucketIndex) => {
    return `
      <tr>
        <td class="fw-600">${bucketLabel}</td>
        ${impactCategories.map((category) => {
          const categoryKey = String(category).toLowerCase();
          return `
          <td>
            <select id="bia-lev-matrix-${categoryKey}-${bucketIndex}" class="bia-lev-cell-select" onchange="onBIALevMatrixCellChange(this)">
              ${impactLevels.map((label, idx) => `<option value="${idx + 1}">${label}</option>`).join('')}
            </select>
          </td>
          `;
        }).join('')}
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.bia-lev-cell-select').forEach((selectEl) => {
    setBIALevMatrixCellLevelClass(selectEl);
  });
}

function setBIALevMatrixCellLevelClass(selectEl) {
  if (!selectEl) return;
  const level = Math.max(1, Math.min(5, Number(selectEl.value) || 1));
  selectEl.classList.remove('level-1', 'level-2', 'level-3', 'level-4', 'level-5');
  selectEl.classList.add(`level-${level}`);
}

function onBIALevMatrixCellChange(selectEl) {
  setBIALevMatrixCellLevelClass(selectEl);
}

function initializeBIALevScenarioDraft(target, latestAssessment = null) {
  const baseScenarioRows = getBIAScenariosForTarget(target);
  const baseScenarios = baseScenarioRows.map((scenario, index) => {
    const scenarioTitle = String(scenario.scenario || scenario.title || `Escenario ${index + 1}`).trim();
    const scenarioKey = getBIAScenarioKey(scenario, index);
    return {
      scenarioKey,
      scenario: scenarioTitle,
      matrixTemplate: null
    };
  });

  const mapByKey = new Map(baseScenarios.map(item => [item.scenarioKey, item]));
  const assessmentScenarioMap = latestAssessment?.matrixByScenario && typeof latestAssessment.matrixByScenario === 'object'
    ? latestAssessment.matrixByScenario
    : {};

  const customScenarios = Array.isArray(latestAssessment?.customScenarios)
    ? latestAssessment.customScenarios
    : [];

  Object.keys(assessmentScenarioMap).forEach((scenarioKey, index) => {
    const normalizedKey = String(scenarioKey || '').trim();
    if (!normalizedKey || mapByKey.has(normalizedKey)) return;
    const scenarioRecord = assessmentScenarioMap[scenarioKey];
    const inferredName = String(scenarioRecord?.scenario || scenarioRecord?.title || '').trim();
    mapByKey.set(normalizedKey, {
      scenarioKey: normalizedKey,
      scenario: inferredName || `Escenario ${index + 1}`,
      matrixTemplate: null
    });
  });

  customScenarios.forEach((customScenario, index) => {
    const scenarioTitle = String(customScenario?.scenario || customScenario?.title || '').trim();
    if (!scenarioTitle) return;
    const scenarioKey = String(customScenario?.scenarioKey || getBIAScenarioKey(scenarioTitle, index)).trim();
    if (!scenarioKey) return;
    if (!mapByKey.has(scenarioKey)) {
      mapByKey.set(scenarioKey, {
        scenarioKey,
        scenario: scenarioTitle,
        matrixTemplate: null
      });
    }
  });

  let scenarios = [...mapByKey.values()].map((scenarioItem) => {
    const rawScenarioMap = assessmentScenarioMap[scenarioItem.scenarioKey];
    const matrixTemplate = normalizeBIAImpactMap(rawScenarioMap?.matrixTemplate || rawScenarioMap || null)
      || normalizeBIAImpactMap(latestAssessment?.matrixTemplate || null)
      || getBIAEmptyMatrixTemplate();

    return {
      scenarioKey: scenarioItem.scenarioKey,
      scenario: scenarioItem.scenario,
      matrixTemplate
    };
  });

  if (scenarios.length === 0) {
    const fallbackTemplate = normalizeBIAImpactMap(latestAssessment?.matrixTemplate || null) || getBIAEmptyMatrixTemplate();
    scenarios = [{
      scenarioKey: 'escenario-1',
      scenario: 'Escenario 1',
      matrixTemplate: fallbackTemplate
    }];
  }

  AppState.biaLevantamientoScenarioDraft = {
    activeScenarioKey: scenarios[0].scenarioKey,
    scenarios
  };
}

function getBIALevScenarioDraft() {
  return AppState.biaLevantamientoScenarioDraft && Array.isArray(AppState.biaLevantamientoScenarioDraft.scenarios)
    ? AppState.biaLevantamientoScenarioDraft
    : null;
}

function captureBIALevActiveScenarioMatrix() {
  const draft = getBIALevScenarioDraft();
  if (!draft) return;
  const activeScenario = draft.scenarios.find(item => item.scenarioKey === draft.activeScenarioKey);
  if (!activeScenario) return;

  const capturedTemplate = {};
  getBIAImpactCategories().forEach((category) => {
    const categoryKey = String(category).toLowerCase();
    capturedTemplate[category] = getBIATimeBuckets().map((_, bucketIndex) => {
      const cell = document.getElementById(`bia-lev-matrix-${categoryKey}-${bucketIndex}`);
      const score = Number(cell?.value || 3);
      return Number.isNaN(score) ? 3 : Math.max(1, Math.min(5, score));
    });
  });
  activeScenario.matrixTemplate = capturedTemplate;
}

function applyBIALevActiveScenarioMatrix() {
  const draft = getBIALevScenarioDraft();
  if (!draft) return;
  const activeScenario = draft.scenarios.find(item => item.scenarioKey === draft.activeScenarioKey);
  const normalizedTemplate = normalizeBIAImpactMap(activeScenario?.matrixTemplate || null) || getBIAEmptyMatrixTemplate();

  getBIAImpactCategories().forEach((category) => {
    const categoryKey = String(category).toLowerCase();
    const rowValues = normalizedTemplate[category] || getBIATimeBuckets().map(() => 3);
    rowValues.forEach((score, bucketIndex) => {
      const cell = document.getElementById(`bia-lev-matrix-${categoryKey}-${bucketIndex}`);
      if (cell) {
        cell.value = String(Math.max(1, Math.min(5, Number(score) || 3)));
        setBIALevMatrixCellLevelClass(cell);
      }
    });
  });
}

function renderBIALevScenarioSelect() {
  const select = document.getElementById('bia-lev-scenario-select');
  if (!select) return;
  const draft = getBIALevScenarioDraft();
  if (!draft || draft.scenarios.length === 0) {
    select.innerHTML = '<option value="">-- Sin escenarios --</option>';
    return;
  }

  select.innerHTML = draft.scenarios.map((scenario) => `
    <option value="${scenario.scenarioKey}" ${scenario.scenarioKey === draft.activeScenarioKey ? 'selected' : ''}>
      ${scenario.scenario}
    </option>
  `).join('');
}

function onBIALevScenarioChange() {
  const draft = getBIALevScenarioDraft();
  const select = document.getElementById('bia-lev-scenario-select');
  if (!draft || !select) return;
  captureBIALevActiveScenarioMatrix();
  const nextKey = String(select.value || '').trim();
  if (!nextKey) return;
  draft.activeScenarioKey = nextKey;
  applyBIALevActiveScenarioMatrix();
}

function addBIALevScenario() {
  const draft = getBIALevScenarioDraft();
  if (!draft) return;
  const nameInput = document.getElementById('bia-lev-scenario-name');
  const scenarioName = String(nameInput?.value || '').trim();
  if (!scenarioName) {
    showToast('Debe ingresar un nombre para el nuevo escenario', 'warning');
    return;
  }

  captureBIALevActiveScenarioMatrix();
  let scenarioKey = getBIAScenarioKey(scenarioName, draft.scenarios.length + 1);
  let suffix = 2;
  while (draft.scenarios.some(item => item.scenarioKey === scenarioKey)) {
    scenarioKey = `${getBIAScenarioKey(scenarioName, draft.scenarios.length + 1)}-${suffix}`;
    suffix += 1;
  }

  draft.scenarios.push({
    scenarioKey,
    scenario: scenarioName,
    matrixTemplate: getBIAEmptyMatrixTemplate()
  });
  draft.activeScenarioKey = scenarioKey;

  if (nameInput) nameInput.value = '';
  renderBIALevScenarioSelect();
  applyBIALevActiveScenarioMatrix();
}

function removeBIALevScenario() {
  const draft = getBIALevScenarioDraft();
  if (!draft || draft.scenarios.length === 0) return;
  if (draft.scenarios.length === 1) {
    showToast('Debe existir al menos un escenario en el levantamiento', 'warning');
    return;
  }

  captureBIALevActiveScenarioMatrix();
  const currentIndex = draft.scenarios.findIndex(item => item.scenarioKey === draft.activeScenarioKey);
  if (currentIndex < 0) return;

  draft.scenarios.splice(currentIndex, 1);
  draft.activeScenarioKey = draft.scenarios[Math.max(0, currentIndex - 1)].scenarioKey;
  renderBIALevScenarioSelect();
  applyBIALevActiveScenarioMatrix();
}

function getBIAFormScenarioMap() {
  const draft = getBIALevScenarioDraft();
  if (!draft || draft.scenarios.length === 0) {
    return { matrixByScenario: {}, customScenarios: [] };
  }
  captureBIALevActiveScenarioMatrix();

  const matrixByScenario = {};
  const customScenarios = [];
  draft.scenarios.forEach((scenario) => {
    matrixByScenario[scenario.scenarioKey] = {
      scenarioKey: scenario.scenarioKey,
      scenario: scenario.scenario,
      matrixTemplate: normalizeBIAImpactMap(scenario.matrixTemplate) || getBIAEmptyMatrixTemplate()
    };
    customScenarios.push({
      scenarioKey: scenario.scenarioKey,
      scenario: scenario.scenario
    });
  });

  return { matrixByScenario, customScenarios };
}

function buildBIAAggregateMatrixTemplate(matrixByScenario) {
  const normalizedByScenario = (matrixByScenario && typeof matrixByScenario === 'object') ? matrixByScenario : {};
  const scenarioRows = Object.values(normalizedByScenario);
  if (scenarioRows.length === 0) return getBIAEmptyMatrixTemplate();

  const aggregate = {};
  getBIAImpactCategories().forEach((category) => {
    aggregate[category] = getBIATimeBuckets().map((_, bucketIndex) => {
      const scores = scenarioRows.map((scenario) => {
        const template = normalizeBIAImpactMap(scenario?.matrixTemplate || scenario || null);
        const score = Number(template?.[category]?.[bucketIndex] || 3);
        return Number.isNaN(score) ? 3 : Math.max(1, Math.min(5, score));
      });
      return scores.length > 0 ? Math.max(...scores) : 3;
    });
  });
  return aggregate;
}

function getBIAFormMatrixTemplate() {
  return buildBIAAggregateMatrixTemplate(getBIAFormScenarioMap().matrixByScenario);
}

function applyBIAFormMatrixTemplate(matrixTemplate = null) {
  const draft = getBIALevScenarioDraft();
  if (!draft || draft.scenarios.length === 0) return;
  const normalizedTemplate = normalizeBIAImpactMap(matrixTemplate || null) || getBIAEmptyMatrixTemplate();
  draft.scenarios.forEach((scenario) => {
    scenario.matrixTemplate = normalizeBIAImpactMap(scenario.matrixTemplate || null) || normalizedTemplate;
  });
  applyBIALevActiveScenarioMatrix();
}

function onBIALevTargetTypeChange() {
  const typeInput = document.getElementById('bia-lev-target-type');
  const targetType = String(typeInput?.value || 'PROCESS').toUpperCase();
  renderBIALevTargetSelect(targetType, null);

  const hiddenType = document.getElementById('bia-lev-target-type-hidden');
  const hiddenId = document.getElementById('bia-lev-target-id-hidden');
  if (hiddenType) hiddenType.value = targetType;
  if (hiddenId) hiddenId.value = '';

  const ficha = document.getElementById('bia-lev-ficha');
  if (ficha) ficha.innerHTML = '<p class="color-muted fs-12 m-0">Seleccione un objetivo para cargar la ficha.</p>';
  renderBIAParticipantRows([{ name: '', role: '' }]);
  AppState.biaLevantamientoScenarioDraft = {
    activeScenarioKey: 'escenario-1',
    scenarios: [{
      scenarioKey: 'escenario-1',
      scenario: 'Escenario 1',
      matrixTemplate: getBIAEmptyMatrixTemplate()
    }]
  };
  const scenarioNameInput = document.getElementById('bia-lev-scenario-name');
  if (scenarioNameInput) scenarioNameInput.value = '';
  renderBIALevScenarioSelect();
  applyBIALevActiveScenarioMatrix();
  setBIALevSaveButtonsState(false);
}

function onBIALevTargetEntityChange() {
  const targetType = String(document.getElementById('bia-lev-target-type')?.value || 'PROCESS').toUpperCase();
  const targetId = Number(document.getElementById('bia-lev-target-id')?.value || 0);
  const hiddenType = document.getElementById('bia-lev-target-type-hidden');
  const hiddenId = document.getElementById('bia-lev-target-id-hidden');
  const assessmentId = document.getElementById('bia-lev-assessment-id');
  if (!targetId) {
    if (hiddenType) hiddenType.value = targetType;
    if (hiddenId) hiddenId.value = '';
    if (assessmentId) assessmentId.value = '';
    setBIALevSaveButtonsState(false);
    return;
  }
  const target = getBIAEntityFromTarget(targetType, targetId);
  if (!target) {
    if (hiddenType) hiddenType.value = targetType;
    if (hiddenId) hiddenId.value = '';
    if (assessmentId) assessmentId.value = '';
    setBIALevSaveButtonsState(false);
    return;
  }
  prefillBIAFromTarget(target);
  setBIALevSaveButtonsState(true);
}

function openBIALevantamientoModal(targetType = null, targetId = null) {
  let resolvedTarget = null;
  if (typeof targetType === 'number' && (targetId === null || targetId === undefined)) {
    resolvedTarget = resolveBIATargetRef('PROCESS', targetType);
  } else if (targetType && targetId !== null && targetId !== undefined) {
    resolvedTarget = resolveBIATargetRef(targetType, targetId);
  } else if (AppState.selectedBIATargetKey) {
    resolvedTarget = parseBIATargetKey(AppState.selectedBIATargetKey);
  } else if (AppState.selectedProcess) {
    resolvedTarget = resolveBIATargetRef('PROCESS', AppState.selectedProcess);
  }

  const modal = document.getElementById('modal-bia-levantamiento');
  if (!modal) return;

  const typeInput = document.getElementById('bia-lev-target-type');
  if (typeInput) typeInput.value = resolvedTarget?.targetType || 'PROCESS';

  renderBIALevTargetSelect(typeInput?.value || 'PROCESS', resolvedTarget?.targetId || null);
  renderBIALevMatrixTable();

  if (resolvedTarget?.targetId) {
    const targetIdInput = document.getElementById('bia-lev-target-id');
    if (targetIdInput) targetIdInput.value = String(resolvedTarget.targetId);
    const target = getBIAEntityFromTarget(resolvedTarget.targetType, resolvedTarget.targetId);
    if (target) prefillBIAFromTarget(target);
    setBIALevSaveButtonsState(Boolean(target));
  } else {
    onBIALevTargetTypeChange();
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBIALevantamientoModal() {
  const modal = document.getElementById('modal-bia-levantamiento');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function prefillBIAFromTarget(target) {
  const latestAssessment = getLatestBIAAssessment(target.targetType, target.targetId);
  const interviewDefaults = getBIAInterviewData(target);
  const approvalDefaults = getBIAApprovalData(target);
  const dependenciesCount = Number(target.dependencyCount || 0);
  const detailTitle = document.getElementById('bia-lev-title');
  const fichaContainer = document.getElementById('bia-lev-ficha');
  const targetTypeInput = document.getElementById('bia-lev-target-type-hidden');
  const targetIdInput = document.getElementById('bia-lev-target-id-hidden');
  const assessmentIdInput = document.getElementById('bia-lev-assessment-id');
  const importedFileLabel = document.getElementById('bia-lev-imported-file');

  if (detailTitle) {
    detailTitle.innerHTML = `<i class="bi bi-journal-check"></i> Levantamiento BIA - ${target.name}`;
  }

  if (fichaContainer) {
    fichaContainer.innerHTML = `
      <div><span>Tipo objetivo</span><strong>${getBIAEntityTypeLabel(target.targetType)}</strong></div>
      <div><span>Código</span><strong>${target.code || '-'}</strong></div>
      <div><span>ID objetivo</span><strong>${target.targetId}</strong></div>
      <div><span>Nombre</span><strong>${target.name || '-'}</strong></div>
      <div><span>Responsable</span><strong>${target.ownerName || '-'}</strong></div>
      <div><span>Categoría</span><strong>${target.processCategory || '-'}</strong></div>
      <div><span>Criticidad</span><strong>${BCMSDataStore.api.getLookupLabel('businessCriticality', target.businessCriticality) || target.businessCriticality || '-'}</strong></div>
      <div><span>RTO objetivo</span><strong>${typeof target.targetRtoMinutes === 'number' ? formatMinutesToTime(target.targetRtoMinutes) : '-'}</strong></div>
      <div><span>RPO objetivo</span><strong>${typeof target.targetRpoMinutes === 'number' ? formatMinutesToTime(target.targetRpoMinutes) : '-'}</strong></div>
      <div><span>MTPD</span><strong>${typeof target.mtpdMinutes === 'number' ? formatMinutesToTime(target.mtpdMinutes) : '-'}</strong></div>
      <div><span>Dependencias</span><strong>${dependenciesCount}</strong></div>
    `;
  }

  if (targetTypeInput) targetTypeInput.value = target.targetType;
  if (targetIdInput) targetIdInput.value = String(target.targetId);
  if (assessmentIdInput) assessmentIdInput.value = latestAssessment ? String(latestAssessment.id) : '';
  if (importedFileLabel) importedFileLabel.textContent = AppState.biaLevantamientoImportFileName || 'Sin archivo importado';

  const interviewDateValue = latestAssessment?.interviewDate
    ? String(latestAssessment.interviewDate).slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  setInputValue('bia-lev-interview-date', interviewDateValue);
  setInputValue('bia-lev-surveyor-name', latestAssessment?.surveyorName || interviewDefaults.surveyorName || getActiveSessionUserName());
  setInputValue('bia-lev-surveyor-role', latestAssessment?.surveyorRole || interviewDefaults.surveyorRole || '');

  const interviewParticipants = Array.isArray(latestAssessment?.interviewParticipants)
    ? latestAssessment.interviewParticipants
    : [
      {
        name: latestAssessment?.intervieweeName || '',
        role: latestAssessment?.intervieweeRole || ''
      }
    ];
  renderBIAParticipantRows(interviewParticipants);

  const approvalMap = {};
  approvalDefaults.forEach((item) => {
    approvalMap[item.role] = item;
  });
  if (latestAssessment) {
    (BCMSDataStore.entities.biaAssessmentApprovals || [])
      .filter(row => !row.isDeleted && Number(row.assessmentId) === Number(latestAssessment.id))
      .forEach((row) => {
        approvalMap[row.role] = { role: row.role, name: row.name || '-', date: row.date || '' };
      });
  }

  setInputValue('bia-approval-owner-name', approvalMap['Responsable de Proceso']?.name || '');
  setInputValue('bia-approval-owner-date', normalizeDateInput(approvalMap['Responsable de Proceso']?.date) || interviewDateValue);
  setInputValue('bia-approval-cont-name', approvalMap['Jefe de Continuidad de Negocio']?.name || '');
  setInputValue('bia-approval-cont-date', normalizeDateInput(approvalMap['Jefe de Continuidad de Negocio']?.date) || interviewDateValue);
  setInputValue('bia-approval-risk-name', approvalMap['Jefe de Departamento de Riesgo Operacional']?.name || '');
  setInputValue('bia-approval-risk-date', normalizeDateInput(approvalMap['Jefe de Departamento de Riesgo Operacional']?.date) || interviewDateValue);

  initializeBIALevScenarioDraft(target, latestAssessment);
  renderBIALevScenarioSelect();
  applyBIALevActiveScenarioMatrix();
  const scenarioNameInput = document.getElementById('bia-lev-scenario-name');
  if (scenarioNameInput) scenarioNameInput.value = '';
}

function saveBIALevantamiento(markCompleted = false) {
  const selectedType = String(document.getElementById('bia-lev-target-type')?.value || '').toUpperCase();
  const selectedId = Number(document.getElementById('bia-lev-target-id')?.value || 0);
  const hiddenType = String(document.getElementById('bia-lev-target-type-hidden')?.value || '').toUpperCase();
  const hiddenId = Number(document.getElementById('bia-lev-target-id-hidden')?.value || 0);
  const targetType = selectedType || hiddenType;
  const targetId = selectedId || hiddenId;
  if (!targetType || !targetId) {
    showToast('Debe seleccionar un objetivo BIA antes de guardar', 'warning');
    return;
  }

  if (!BCMSDataStore.entities.biaAssessments) BCMSDataStore.entities.biaAssessments = [];
  if (!BCMSDataStore.entities.biaAssessmentApprovals) BCMSDataStore.entities.biaAssessmentApprovals = [];

  const currentUser = getActiveSessionUserName();
  const nowIso = new Date().toISOString();
  const status = markCompleted ? 'COMPLETADO' : 'BORRADOR';
  const assessmentIdField = document.getElementById('bia-lev-assessment-id');
  const existingId = Number(assessmentIdField?.value || 0);
  const participants = collectBIAInterviewParticipants();
  if (participants.length === 0) {
    showToast('Debe agregar al menos una persona entrevistada', 'warning');
    return;
  }
  const firstParticipant = participants[0] || {};
  const { matrixByScenario, customScenarios } = getBIAFormScenarioMap();
  const matrixTemplate = getBIAFormMatrixTemplate();
  const matrixSummary = {
    monetarioLevel: Math.max(...(matrixTemplate.Monetario || [3])),
    monetarioNotes: '',
    procesosLevel: Math.max(...(matrixTemplate.Procesos || [3])),
    procesosNotes: '',
    reputacionalLevel: Math.max(...(matrixTemplate.Reputacional || [3])),
    reputacionalNotes: '',
    normativoLevel: Math.max(...(matrixTemplate.Normativo || [3])),
    normativoNotes: '',
    clientesLevel: Math.max(...(matrixTemplate.Clientes || [3])),
    clientesNotes: ''
  };

  const assessmentData = {
    processId: targetType === 'PROCESS' ? targetId : null,
    targetProcessType: targetType,
    targetProcessId: targetId,
    interviewDate: getInputValue('bia-lev-interview-date'),
    intervieweeName: firstParticipant.name || '',
    intervieweeRole: firstParticipant.role || '',
    interviewParticipants: participants,
    surveyorName: getInputValue('bia-lev-surveyor-name'),
    surveyorRole: getInputValue('bia-lev-surveyor-role'),
    status,
    customScenarios,
    matrixByScenario,
    matrixTemplate,
    matrixSummary,
    updatedBy: currentUser,
    deletedAt: null,
    deletedBy: null,
    isDeleted: false
  };

  let savedAssessment;
  if (existingId > 0) {
    savedAssessment = BCMSDataStore.api.update('biaAssessments', existingId, assessmentData);
  } else {
    savedAssessment = BCMSDataStore.api.create('biaAssessments', {
      ...assessmentData,
      createdBy: currentUser,
      createdAt: nowIso
    });
  }

  if (!savedAssessment) {
    showToast('No fue posible guardar el levantamiento BIA', 'danger');
    return;
  }

  if (assessmentIdField) assessmentIdField.value = String(savedAssessment.id);
  upsertBIAApprovalRows(savedAssessment.id, currentUser);

  const targetKey = getBIATargetKey(targetType, targetId);
  Object.keys(AppState.biaImpactOverrides || {}).forEach((overrideKey) => {
    if (String(overrideKey).startsWith(`${targetKey}::`)) {
      delete AppState.biaImpactOverrides[overrideKey];
    }
  });
  AppState.biaLevantamientoByProcess[targetKey] = markCompleted ? 'COMPLETADO' : 'EN_CURSO';
  BCMSDataStore.meta.lastUpdated = nowIso;

  renderBIAProcessList();
  selectBIAEntity(targetType, targetId);
  showToast(markCompleted ? 'Levantamiento BIA guardado y cerrado' : 'Borrador de levantamiento BIA guardado', 'success');

  if (markCompleted) closeBIALevantamientoModal();
}

function upsertBIAApprovalRows(assessmentId, currentUser) {
  const nowIso = new Date().toISOString();
  const approvalRows = BCMSDataStore.entities.biaAssessmentApprovals || [];

  approvalRows
    .filter(row => !row.isDeleted && Number(row.assessmentId) === Number(assessmentId))
    .forEach(row => {
      row.isDeleted = true;
      row.deletedAt = nowIso;
      row.deletedBy = currentUser;
      row.updatedAt = nowIso;
      row.updatedBy = currentUser;
    });

  const rowsToSave = [
    {
      role: 'Responsable de Proceso',
      name: getInputValue('bia-approval-owner-name'),
      date: getInputValue('bia-approval-owner-date')
    },
    {
      role: 'Jefe de Continuidad de Negocio',
      name: getInputValue('bia-approval-cont-name'),
      date: getInputValue('bia-approval-cont-date')
    },
    {
      role: 'Jefe de Departamento de Riesgo Operacional',
      name: getInputValue('bia-approval-risk-name'),
      date: getInputValue('bia-approval-risk-date')
    }
  ];

  let maxId = Math.max(0, ...approvalRows.map(row => Number(row.id) || 0));
  rowsToSave.forEach((row) => {
    maxId += 1;
    approvalRows.push({
      id: maxId,
      assessmentId: Number(assessmentId),
      role: row.role,
      name: row.name || '-',
      date: row.date || nowIso.slice(0, 10),
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
      createdBy: currentUser,
      updatedBy: currentUser,
      deletedBy: null,
      isDeleted: false
    });
  });
}

function goToDMEntityFromBIA() {
  const selectedType = String(document.getElementById('bia-lev-target-type')?.value || '').toUpperCase();
  const selectedId = Number(document.getElementById('bia-lev-target-id')?.value || 0);
  const hiddenType = String(document.getElementById('bia-lev-target-type-hidden')?.value || '').toUpperCase();
  const hiddenId = Number(document.getElementById('bia-lev-target-id-hidden')?.value || 0);
  const targetType = selectedType || hiddenType;
  const targetId = selectedId || hiddenId;
  if (!targetType || !targetId) {
    showToast('Seleccione un objetivo antes de ir a Datos Maestros', 'warning');
    return;
  }

  const mappingByType = {
    MACROPROCESS: { subtab: 'macroprocesses', entity: 'macroprocesses', rowPrefix: 'macro' },
    PROCESS: { subtab: 'processes', entity: 'processes', rowPrefix: 'proc' },
    SUBPROCESS: { subtab: 'subprocesses', entity: 'subprocesses', rowPrefix: 'subproc' }
  };
  const mapping = mappingByType[targetType];
  if (!mapping) return;

  closeBIALevantamientoModal();
  showView('datos-maestros');
  if (typeof showDMGroup === 'function') showDMGroup('orgproc');
  if (typeof showDMSubtab === 'function') showDMSubtab('orgproc', mapping.subtab);
  if (typeof toggleEditForm === 'function') toggleEditForm(mapping.entity, `${mapping.rowPrefix}-${targetId}`);
}

function handleImportBIAPlanilla() {
  const fileInput = document.getElementById('bia-lev-file-input');
  if (!fileInput) return;
  fileInput.click();
}

function onBIAPlanillaSelected(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  AppState.biaLevantamientoImportFileName = file.name;

  const importedFileLabel = document.getElementById('bia-lev-imported-file');
  if (importedFileLabel) {
    importedFileLabel.textContent = file.name;
  }

  // Precarga demo: completar fecha y levantador si faltan
  if (!getInputValue('bia-lev-interview-date')) {
    setInputValue('bia-lev-interview-date', new Date().toISOString().slice(0, 10));
  }
  if (!getInputValue('bia-lev-surveyor-name')) {
    setInputValue('bia-lev-surveyor-name', getActiveSessionUserName());
  }
  if (!getInputValue('bia-lev-surveyor-role')) {
    const surveyorName = getInputValue('bia-lev-surveyor-name');
    const match = getBIAEligiblePeople().find((person) => person.name === surveyorName);
    if (match) setInputValue('bia-lev-surveyor-role', match.role);
  }

  showToast(`Planilla "${file.name}" importada para precarga de levantamiento`, 'success');
}

function getActiveSessionUserName() {
  const userEl = document.querySelector('.session-user span');
  const name = userEl ? String(userEl.textContent || '').trim() : '';
  return name || 'María González';
}

function getInputValue(inputId) {
  const input = document.getElementById(inputId);
  return input ? String(input.value || '').trim() : '';
}

function setInputValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = value ?? '';
}

function normalizeDateInput(value) {
  if (!value) return '';
  const candidate = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

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

  // Obtener riesgos ciber del datastore
  const riesgosCiber = BCMSDataStore.api.filter('risks', r => r.riskDomain === 'CYBER');
  const riesgosActivos = riesgosCiber.filter(r => r.status !== 'CLOSED');
  const riesgosCriticos = riesgosActivos.filter(r => r.cvssScore >= 9.0);
  const riesgosAltos = riesgosActivos.filter(r => r.cvssScore >= 7.0 && r.cvssScore < 9.0);
  const avgScore = riesgosActivos.length > 0
    ? (riesgosActivos.reduce((sum, r) => sum + (r.cvssScore || 0), 0) / riesgosActivos.length).toFixed(1)
    : '0.0';

  // Contar controles activos relacionados con ciber
  const controlesCiber = BCMSDataStore.api.filter('controls', control => control.type && control.status === 'IMPLEMENTED');
  const efectividad = controlesCiber.length > 0
    ? Math.round((controlesCiber.filter(control => control.effectiveness === 'STRONG').length / controlesCiber.length) * 100)
    : 0;

  // Contar vulnerabilidades
  const vulnerabilidadesAltas = riesgosActivos.filter(r => r.cvssScore >= 7.0).length;
  const vulnerabilidadesMedias = riesgosActivos.filter(r => r.cvssScore >= 4.0 && r.cvssScore < 7.0).length;

  renderKPIGrid(container, [
    {
      label: 'Riesgos Ciber Activos',
      value: riesgosActivos.length,
      subtitle: `${riesgosCriticos.length + riesgosAltos.length} críticos/altos`,
      icon: 'bi-bug',
      color: riesgosCriticos.length > 0 ? 'danger' : 'warning'
    },
    {
      label: 'Críticos / Muy Altos',
      value: riesgosCriticos.length,
      subtitle: `${riesgosAltos.length} altos adicionales`,
      icon: 'bi-exclamation-triangle-fill',
      color: riesgosCriticos.length > 0 ? 'danger' : 'secondary'
    },
    {
      label: 'Puntaje Promedio CVSS',
      value: `${avgScore}/10`,
      subtitle: 'Score promedio de riesgos activos',
      icon: 'bi-speedometer2',
      color: Number(avgScore) >= 7 ? 'danger' : (Number(avgScore) >= 4 ? 'warning' : 'secondary')
    },
    {
      label: 'Controles Activos',
      value: controlesCiber.length,
      subtitle: `${efectividad}% efectividad`,
      icon: 'bi-shield-shaded',
      color: 'info'
    },
    {
      label: 'Vulnerabilidades',
      value: vulnerabilidadesAltas + vulnerabilidadesMedias,
      subtitle: `${vulnerabilidadesAltas} altas, ${vulnerabilidadesMedias} medias`,
      icon: 'bi-exclamation-triangle',
      color: vulnerabilidadesAltas > 0 ? 'warning' : 'secondary'
    }
  ]);
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
  let html = '<div class="ciber-heatmap-grid">';
  
  // Headers columnas
  html += '<div></div>';
  ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'].forEach(label => {
    html += `<div class="ciber-heatmap-col-header">${label}</div>`;
  });
  
  // Filas del heatmap
  const impactos = ['Crítico', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'];
  matrix.forEach((row, i) => {
    const impacto = 5 - i;
    html += `<div class="ciber-heatmap-row-header">${impactos[i]}</div>`;
    row.forEach((count, j) => {
      const probabilidad = j + 1;
      const bgColor = getColorForCell(impacto, probabilidad, count);
      const textColor = getTextColor(impacto, probabilidad);
      html += `<div class="ciber-heatmap-cell" style="background: ${bgColor}; color: ${textColor}; font-weight: ${count > 0 ? '600' : '400'};">${count}</div>`;
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
  
  createManagedChart(ctx, {
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
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay riesgos ciber registrados</td></tr>';
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
    
    const tratamientoLabel = BCMSDataStore.api.getLookupLabel('treatmentType', riesgo.treatmentType) || riesgo.treatmentType;
    
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
  
  const tratamientoLabel = BCMSDataStore.api.getLookupLabel('treatmentType', riesgo.treatmentType) || riesgo.treatmentType;
  const statusLabel = BCMSDataStore.api.getLookupLabel('riskStatus', riesgo.status) || riesgo.status;

  const controlsHtml = riesgo.controls && riesgo.controls.length > 0
    ? riesgo.controls.map(control => `<span class="badge badge-info ciber-control-badge">${control}</span>`).join(' ')
    : '<span class="color-muted">Sin controles asignados</span>';

  contentEl.innerHTML = `
    <div class="ciber-detail-column">
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Activo/Sistema afectado:</div>
        <div class="ciber-detail-value">${riesgo.targetAsset || 'N/A'}</div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Amenaza / Vector de ataque:</div>
        <div class="ciber-detail-value">${riesgo.threat || 'N/A'}</div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Vulnerabilidad identificada:</div>
        <div class="ciber-detail-value">${riesgo.vulnerability || 'N/A'}</div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Descripción:</div>
        <div class="ciber-detail-value">${riesgo.description || 'N/A'}</div>
      </div>
    </div>
    <div class="ciber-detail-column">
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Puntaje CVSS:</div>
        <div><span class="badge ${scoreClass} ciber-cvss-badge">${riesgo.cvssScore ? riesgo.cvssScore.toFixed(1) : 'N/A'} / 10</span></div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Tratamiento:</div>
        <div><span class="badge badge-warning">${tratamientoLabel}</span></div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Controles relacionados:</div>
        <div class="ciber-detail-value">${controlsHtml}</div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Responsable:</div>
        <div class="ciber-detail-value">${riesgo.ownerName || 'N/A'}</div>
      </div>
      <div class="ciber-detail-block">
        <div class="ciber-detail-label">Estado:</div>
        <div><span class="badge badge-active">${statusLabel}</span> Última actualización: ${riesgo.updatedAt ? new Date(riesgo.updatedAt).toLocaleDateString('es-CL') : 'N/A'}</div>
      </div>
    </div>
  `;
  
  panel.classList.remove('d-none');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeRiesgoCiberDetalle() {
  const panel = document.getElementById('detalle-riesgo-ciber');
  if (panel) panel.classList.add('d-none');
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

  renderKPIGrid(container, [
    { label: 'Planes DRP activos', value: planesActivos.length, subtitle: 'Sistemas críticos cubiertos', icon: 'bi-shield-shaded', color: 'primary' },
    { label: 'RTO promedio', value: `${rtoPromedio}h`, subtitle: 'Objetivo: 2h', icon: 'bi-clock', color: parseFloat(rtoPromedio) <= 2 ? 'secondary' : 'warning' },
    { label: 'Sites alternos', value: sitesAlternos, subtitle: 'Cloud + On-premise', icon: 'bi-hdd-rack', color: 'info' },
    { label: 'Replicación sincrónica', value: replicacionSincronica, subtitle: 'RPO objetivo mínimo', icon: 'bi-arrow-clockwise', color: 'secondary' },
    { label: 'Activaciones 2025', value: activaciones2025, subtitle: 'Resultado satisfactorio', icon: 'bi-check-circle', color: 'secondary' }
  ]);
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
  
  createManagedChart(ctx, {
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
  const suppliers = BCMSDataStore.api.getAll('suppliers').filter(s => !s.isDeleted);
  const assessments = BCMSDataStore.api.getAll('supplierAssessments');
  const contracts = BCMSDataStore.api.getAll('supplierContracts');
  const drpPlans = BCMSDataStore.api
    .getAll('continuityPlans')
    .filter(plan => plan.planType === 'DRP' && plan.status === 'ACTIVE');

  if (!suppliers.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay proveedores críticos disponibles</td></tr>';
    return;
  }

  suppliers.forEach(supplier => {
    const latestAssessment = getLatestSupplierAssessment(assessments, supplier.id);
    const latestContract = getLatestSupplierContract(contracts, supplier.id);
    const serviceType = supplier.supplierType || supplier.type || '-';
    const relatedPlans = drpPlans.slice(0, 2).map(plan => plan.title || plan.code).filter(Boolean);
    const systemsText = relatedPlans.length
      ? `${relatedPlans.join(', ')}${drpPlans.length > 2 ? ` +${drpPlans.length - 2}` : ''}`
      : 'Sin sistemas DRP vinculados';

    const assessmentLabel = latestAssessment
      ? `${getAssessmentStatusLabel(latestAssessment.status)} (${latestAssessment.overallScore || 0}/100)`
      : 'Sin evaluación';
    const assessmentClass = latestAssessment
      ? getAssessmentStatusBadge(latestAssessment.status)
      : 'badge-warning';
    const contingencyCode = latestContract?.contractCode || 'N/D';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${supplier.name}</strong></td>
      <td>${serviceType}</td>
      <td>${systemsText}</td>
      <td><span class="badge ${assessmentClass}">${assessmentLabel}</span></td>
      <td><button class="badge badge-info badge-link-button" onclick="showView('proveedores')">${contingencyCode}</button></td>
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
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay planes DRP registrados</td></tr>';
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
    
    const statusClass = plan.status === 'ACTIVE'
      ? 'badge-success'
      : plan.status === 'DRAFT'
        ? 'badge-draft'
        : plan.status === 'IN_REVIEW'
          ? 'badge-review'
          : 'badge-neutral';
    const statusLabel = BCMSDataStore.api.getLookupLabel('planStatus', plan.status) || plan.status || 'N/D';

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
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
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
  
  const incidents = BCMSDataStore.api
    .getAll('incidents')
    .filter(incident => !incident.isDeleted);

  const activeStatuses = ['OPEN', 'IN_PROGRESS', 'ESCALATED'];
  const activeCritical = incidents.filter(incident =>
    incident.severity === 'CRITICAL' && activeStatuses.includes(incident.status)
  ).length;
  const activeHigh = incidents.filter(incident =>
    incident.severity === 'HIGH' && activeStatuses.includes(incident.status)
  ).length;

  const computedLevel = activeCritical > 0 ? 'ROJO' : activeHigh > 0 ? 'AMARILLO' : 'VERDE';
  const estadoActual = AppState.crisisManualLevel || computedLevel;
  
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
      desc: 'Incidentes de alta severidad en seguimiento · Comité en alerta'
    },
    'ROJO': {
      bgStart: '#dc2626',
      bgEnd: '#991b1b',
      textColor: '#fff',
      icon: 'bi-exclamation-circle-fill',
      label: 'CRISIS ACTIVA',
      estado: 'ROJO - Crisis Total',
      desc: 'Incidente crítico activo · Protocolo de crisis habilitado'
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
  const incidents = BCMSDataStore.api
    .getAll('incidents')
    .filter(incident => !incident.isDeleted && incident.severity === 'CRITICAL');
  const currentYear = new Date().getFullYear();
  const closedThisYear = incidents.filter(incident =>
    incident.status === 'CLOSED' &&
    incident.resolvedAt &&
    new Date(incident.resolvedAt).getFullYear() === currentYear
  ).length;
  const resolvedWithDates = incidents.filter(incident =>
    incident.resolvedAt && incident.reportedAt && incident.status === 'CLOSED'
  );
  const avgResolutionHours = resolvedWithDates.length > 0
    ? resolvedWithDates.reduce((sum, incident) => {
        return sum + ((new Date(incident.resolvedAt) - new Date(incident.reportedAt)) / 3600000);
      }, 0) / resolvedWithDates.length
    : 0;

  // KPI Historial
  const kpiHistorial = document.getElementById('crisis-kpi-historial');
  if (kpiHistorial) {
    kpiHistorial.innerHTML = `
      <div class="crisis-kpi-label">Crisis resueltas ${currentYear}</div>
      <div class="crisis-kpi-value">${closedThisYear}</div>
      <div class="crisis-kpi-subtext">Total histórico crítico: ${incidents.length}</div>
    `;
  }
  
  // KPI Tiempo
  const kpiTiempo = document.getElementById('crisis-kpi-tiempo');
  if (kpiTiempo) {
    kpiTiempo.innerHTML = `
      <div class="crisis-kpi-label">Tiempo promedio resolución</div>
      <div class="crisis-kpi-value crisis-kpi-value-secondary">${avgResolutionHours > 0 ? `${avgResolutionHours.toFixed(1)}h` : 'N/D'}</div>
      <div class="crisis-kpi-subtext">Basado en incidentes críticos cerrados</div>
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
  createManagedChart(ctx, {
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
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay crisis registradas</td></tr>';
    return;
  }
  
  const sorted = [...crisisHistoricas].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  sorted.forEach(crisis => {
    const reportedAt = crisis.reportedAt ? new Date(crisis.reportedAt) : null;
    const resolvedAt = crisis.resolvedAt ? new Date(crisis.resolvedAt) : null;
    const durationHours = reportedAt && resolvedAt ? ((resolvedAt - reportedAt) / 3600000) : null;
    const durationLabel = durationHours === null ? 'En curso' : `${durationHours.toFixed(1)}h`;
    const statusLabel = crisis.status === 'CLOSED' ? 'Resuelta' : crisis.status === 'ESCALATED' ? 'Escalada' : 'Activa';
    const statusClass = crisis.status === 'CLOSED' ? 'badge-success' : crisis.status === 'ESCALATED' ? 'badge-danger' : 'badge-active';
    const crisisTypeLabel = BCMSDataStore.api.getLookupLabel('incidentType', crisis.type) || crisis.type || 'N/A';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${crisis.code}</strong></td>
      <td>${crisisTypeLabel}</td>
      <td>${reportedAt ? reportedAt.toLocaleDateString('es-CL') : 'N/A'}</td>
      <td><span class="crisis-duration ${durationHours !== null && durationHours > 24 ? 'crisis-duration-critical' : ''}">${durationLabel}</span></td>
      <td><span class="badge badge-danger">Crítico</span></td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
      <td><button class="btn btn-outline btn-sm" onclick="showToast('Detalle de crisis en siguiente iteración', 'info')"><i class="bi bi-eye"></i> Detalle</button></td>
    `;
    tbody.appendChild(row);
  });
}

function initCrisisActivationForm() {
  const form = document.getElementById('crisis-activation-form');
  if (!form || form.dataset.bound === '1') return;

  const severityButtons = form.querySelectorAll('.crisis-severity-btn');
  severityButtons.forEach(button => {
    button.addEventListener('click', () => {
      severityButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      form.dataset.selectedSeverity = button.dataset.level || '';
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const tipoEl = document.getElementById('crisis-tipo');
    const selectedType = tipoEl ? tipoEl.value : '';
    const selectedSeverity = form.dataset.selectedSeverity || '';
    const description = form.querySelector('textarea')?.value?.trim() || '';

    if (!selectedType || !selectedSeverity || !description) {
      showToast('Completa tipo, severidad y descripción para activar el protocolo', 'warning');
      return;
    }

    const severityMap = { GREEN: 'VERDE', YELLOW: 'AMARILLO', RED: 'ROJO' };
    AppState.crisisManualLevel = severityMap[selectedSeverity] || null;
    renderCrisisSemaforo();
    showToast('Protocolo de crisis activado (demo)', 'success');
  });

  form.dataset.bound = '1';
}

/**
 * ============================================================================
 * VISTA INTEGRADA - Funciones de navegación de tabs
 * ============================================================================
 */

function showIntegradaTab(tabName) {
  const view = document.getElementById('view-vista-integrada');
  if (!view) return;

  view.querySelectorAll('.integrada-tab-content').forEach(content => {
    content.classList.add('d-none');
  });

  const selectedContent = view.querySelector(`#integrada-${tabName}`);
  if (selectedContent) {
    selectedContent.classList.remove('d-none');
  }

  view.querySelectorAll('.integrada-tab-btn').forEach(button => {
    button.classList.remove('active');
  });

  const selectedButton = view.querySelector(`.integrada-tab-btn[data-integrada-tab="${tabName}"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  AppState.integradaTab = tabName;
}

/**
 * ============================================================================
 * COMUNICACIONES DE CRISIS - Funciones de renderizado
 * ============================================================================
 */

function renderComunicacionesKPIs() {
  const container = document.getElementById('comunicaciones-kpis-container');
  if (!container) return;
  
  const comunicacionesTemplates = BCMSDataStore.api.getAll('communicationTemplates') || [];
  const comunicacionesLogs = BCMSDataStore.api.getAll('communicationLogs') || [];
  
  renderKPIGrid(container, [
    {
      label: 'Comunicados Emitidos',
      value: comunicacionesLogs.length,
      subtitle: 'Total en 2025',
      icon: 'bi-send',
      color: 'primary'
    },
    {
      label: 'Borradores Pendientes',
      value: '5',
      subtitle: 'Requieren aprobación',
      icon: 'bi-file-earmark-text',
      color: 'warning'
    },
    {
      label: 'Stakeholders Activos',
      value: '87',
      subtitle: '12 grupos definidos',
      icon: 'bi-persons',
      color: 'secondary'
    },
    {
      label: 'Canales Operativos',
      value: '7/7',
      subtitle: '100% disponibilidad',
      icon: 'bi-broadcast',
      color: 'success'
    },
    {
      label: 'Tasa Entrega',
      value: '98%',
      subtitle: 'Apertura: 94%',
      icon: 'bi-graph-up',
      color: 'success'
    }
  ]);
}

function renderComunicacionesChart() {
  const ctx = document.getElementById('comunicaciones-chart');
  if (!ctx) return;
  
  createManagedChart(ctx, {
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
  
  const auditorias = BCMSDataStore.api.getAll('audits') || [];
  const hallazgos = BCMSDataStore.api.getAll('findings') || [];
  
  renderKPIGrid(container, [
    { label: 'Auditorías 2025', value: auditorias.length, subtitle: 'Completadas y programadas', icon: 'bi-clipboard-check', color: 'primary' },
    { label: 'Hallazgos Totales', value: hallazgos.length, subtitle: 'NC Mayor + NC Menor', icon: 'bi-exclamation-triangle-fill', color: 'warning' },
    { label: 'Hallazgos Abiertos', value: hallazgos.filter(h => h.status !== 'CLOSED').length, subtitle: 'Requieren atención', icon: 'bi-exclamation-circle', color: 'danger' },
    { label: 'Acciones Correctivas', value: '34', subtitle: '26 cerradas | 8 activas', icon: 'bi-list-task', color: 'secondary' },
    { label: 'Índice Madurez', value: '4.2', subtitle: '/ 5.0 (Optimizado)', icon: 'bi-star-fill', color: 'secondary' }
  ]);
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
  
  createManagedChart(ctx, {
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

  renderKPIGrid(container, [
    { label: 'Cobertura vs Procesos', value: '95%', subtitle: '18/19 procesos', icon: 'bi-check-circle', color: 'secondary' },
    { label: 'Recursos sin Backup', value: '7', subtitle: 'Requieren acción', icon: 'bi-exclamation-triangle', color: 'danger' },
    { label: 'Brechas Capacidad', value: '5', subtitle: '2 críticas, 3 moderadas', icon: 'bi-exclamation-triangle-fill', color: 'warning' },
    { label: 'Dependencias Terceros', value: '12', subtitle: '8 con SLA vigente', icon: 'bi-people', color: 'primary' },
    { label: 'Capacidad Operativa', value: '78%', subtitle: '↑ 5% vs mes anterior', icon: 'bi-speedometer2', color: 'secondary' }
  ]);
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
    createManagedChart(ctxDist, {
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
    createManagedChart(ctxBrechas, {
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

  renderKPIGrid(container, [
    { label: 'Cobertura Capacitación', value: '87%', subtitle: '↑ 12% vs 2024 | Meta: 95%', icon: 'bi-mortarboard', color: 'secondary' },
    { label: 'Cursos Completados', value: '342', subtitle: 'En 2025 | 28.5 promedio/mes', icon: 'bi-book', color: 'primary' },
    { label: 'Simulacros Realizados', value: '8', subtitle: '4 BCP | 4 Crisis | Part. 92%', icon: 'bi-clipboard-check', color: 'primary' },
    { label: 'Nivel Concienciación', value: '8.2/10', subtitle: '↑ 0.8 vs 2024', icon: 'bi-star-fill', color: 'secondary' }
  ]);
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
  
  createManagedChart(ctx, {
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

  renderKPIGrid(container, [
    { label: 'Cambios 2025', value: '18', subtitle: '12 aprobados | 4 pendientes', icon: 'bi-clipboard-data', color: 'primary' },
    { label: 'Tiempo Promedio Aprobación', value: '5.2 días', subtitle: '↓ -1.8d vs 2024 | Meta: 7 días', icon: 'bi-clock', color: 'secondary' },
    { label: 'Tasa de Implementación Exitosa', value: '95.8%', subtitle: '11/12 sin rollback', icon: 'bi-check-circle', color: 'secondary' }
  ]);
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
  
  createManagedChart(ctx, {
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
  
  const usuarios = BCMSDataStore.api.getAll('users') || [];
  const roles = BCMSDataStore.api.getAll('roles') || [];
  const usuariosActivos = usuarios.filter(u => u.isActive);
  const admins = usuarios.filter(u => u.profile === 'Administrador');
  const mfaEnabled = usuarios.filter(u => u.mfaEnabled);
  const adminPct = usuarios.length > 0 ? Math.round((admins.length / usuarios.length) * 100) : 0;
  
  renderKPIGrid(container, [
    { label: 'Usuarios Registrados', value: usuarios.length, subtitle: `${usuariosActivos.length} activos`, icon: 'bi-persons', color: 'primary' },
    { label: 'Roles Activos', value: roles.length, subtitle: 'RBAC configurado', icon: 'bi-shield-lock', color: 'secondary' },
    { label: 'Administradores', value: admins.length, subtitle: `${adminPct}% del total`, icon: 'bi-gem', color: 'primary' },
    { label: 'Accesos Últimas 24h', value: '14', subtitle: '77.8% actividad', icon: 'bi-clock', color: 'primary' },
    { label: 'MFA Habilitado', value: `${mfaEnabled.length}/${usuarios.length}`, subtitle: '100% cobertura', icon: 'bi-shield-shaded', color: 'secondary' }
  ]);
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

  const reports = BCMSDataStore.api.getAll('executiveReports');
  const publishedReports = reports.filter(r => r.status === 'PUBLISHED').length;
  const draftReports = reports.filter(r => r.status === 'DRAFT').length;
  const generatedWithFile = reports.filter(r => !!r.fileUrl).length;
  const pdfExports = reports.filter(r => (r.fileUrl || '').toLowerCase().endsWith('.pdf')).length;
  const nonPdfExports = Math.max(generatedWithFile - pdfExports, 0);

  renderKPIGrid(container, [
    {
      label: 'Reportes Generados',
      value: reports.length,
      subtitle: `${publishedReports} publicados`,
      icon: 'bi-graph-up',
      color: 'primary'
    },
    {
      label: 'Borradores',
      value: draftReports,
      subtitle: 'Pendientes de publicación',
      icon: 'bi-journal-text',
      color: 'warning'
    },
    {
      label: 'Exportaciones',
      value: generatedWithFile,
      subtitle: `PDF (${pdfExports}) · Otros (${nonPdfExports})`,
      icon: 'bi-box-arrow-up-right',
      color: 'secondary'
    },
    {
      label: 'Templates Disponibles',
      value: BCMSDataStore.lookups.reportTypes?.length || 0,
      subtitle: 'Catálogo activo',
      icon: 'bi-file-earmark-richtext',
      color: 'info'
    }
  ]);
}

function renderReportesTable() {
  const tbody = document.getElementById('reportes-tbody');
  if (!tbody) return;

  const reports = [...BCMSDataStore.api.getAll('executiveReports')]
    .sort((a, b) => new Date(b.generatedDate || b.createdAt) - new Date(a.generatedDate || a.createdAt));

  if (!reports.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay reportes generados</td></tr>';
    return;
  }

  tbody.innerHTML = reports.map(report => {
    const generatedAt = report.generatedDate || report.createdAt;
    const generatedLabel = generatedAt ? formatDate(generatedAt) : '-';
    const periodLabel = (report.periodStart && report.periodEnd)
      ? `${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}`
      : '-';
    const format = (report.fileUrl || '').toLowerCase().endsWith('.pdf') ? 'PDF' : 'N/A';
    const formatBadge = format === 'PDF' ? 'badge-danger' : 'badge-neutral';
    const statusBadge = report.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning';

    return `
      <tr>
        <td>
          <strong>${report.reportName}</strong>
          <div class="table-cell-meta">${report.reportCode}</div>
        </td>
        <td class="table-cell-muted">${generatedLabel}</td>
        <td class="table-cell-muted">${periodLabel}</td>
        <td>
          <span class="badge ${formatBadge}">${format}</span>
          <span class="badge ${statusBadge}">${report.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}</span>
        </td>
        <td class="table-cell-muted">${report.generatedByName || '-'}</td>
        <td class="table-cell-muted">${report.fileUrl ? 'Disponible' : 'Pendiente'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="showToast('Descarga en desarrollo', 'info')">
            <i class="bi bi-download"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
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

  const appServices = BCMSDataStore.api.getAll('appServices');
  const supplierContracts = BCMSDataStore.api.getAll('supplierContracts');
  const templates = BCMSDataStore.api.getAll('communicationTemplates');
  const communications = BCMSDataStore.api.getAll('communicationLogs');
  const frameworks = BCMSDataStore.api.getAll('frameworks');
  const activeContracts = supplierContracts.filter(contract => contract.status === 'ACTIVE');
  const integrationsScore = appServices.length + frameworks.filter(framework => framework.isActive).length;

  renderKPIGrid(container, [
    {
      label: 'Integraciones Activas',
      value: integrationsScore,
      subtitle: `${appServices.length} servicios + ${frameworks.length} marcos`,
      icon: 'bi-plug',
      color: 'secondary'
    },
    {
      label: 'Canales Operativos',
      value: templates.length,
      subtitle: 'Templates de comunicación',
      icon: 'bi-broadcast',
      color: 'info'
    },
    {
      label: 'Comunicaciones enviadas',
      value: communications.length,
      subtitle: `${communications.filter(log => log.deliveryStatus === 'DELIVERED').length} entregadas`,
      icon: 'bi-envelope-check',
      color: 'primary'
    },
    {
      label: 'Contratos vigentes',
      value: activeContracts.length,
      subtitle: `${supplierContracts.length} contratos de proveedor`,
      icon: 'bi-file-earmark-lock2',
      color: 'warning'
    }
  ]);
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

  const policies = BCMSDataStore.api.getAll('bcmsPolicies');
  const activePolicies = policies.filter(policy => policy.status === 'ACTIVE').length;
  const strategies = BCMSDataStore.api.getAll('bcmsStrategies');
  const objectives = BCMSDataStore.api.getAll('bcmsObjectives');
  const achievedObjectives = objectives.filter(obj => obj.status === 'ACHIEVED').length;
  const roles = BCMSDataStore.api.getAll('bcmsRoles');
  const frameworks = BCMSDataStore.api.getAll('frameworks');

  renderKPIGrid(container, [
    {
      label: 'Políticas Vigentes',
      value: activePolicies,
      subtitle: `${policies.length} políticas registradas`,
      icon: 'bi-file-earmark-text',
      color: 'primary'
    },
    {
      label: 'Estrategias Activas',
      value: strategies.filter(strategy => strategy.status === 'ACTIVE').length,
      subtitle: 'Planificación BCMS vigente',
      icon: 'bi-diagram-3',
      color: 'info'
    },
    {
      label: 'Objetivos Cumplidos',
      value: `${achievedObjectives}/${objectives.length}`,
      subtitle: 'Seguimiento de desempeño BCMS',
      icon: 'bi-bullseye',
      color: 'secondary'
    },
    {
      label: 'Roles Definidos',
      value: roles.length,
      subtitle: 'Gobierno BCMS',
      icon: 'bi-people-fill',
      color: 'primary'
    },
    {
      label: 'Marcos Normativos',
      value: frameworks.length,
      subtitle: 'ISO, NIST y regulación local',
      icon: 'bi-patch-check',
      color: 'success'
    }
  ]);
}

/**
 * Renderiza los gráficos de la vista Gobierno usando Chart.js
 */
function renderGobiernoCharts() {
  // Gráfico 1: Distribución de Políticas por Área (Doughnut)
  const ctx1 = document.getElementById('gobierno-politicas-chart');
  if (ctx1) {
    createManagedChart(ctx1, {
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
    createManagedChart(ctx2, {
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
    <div class="table-wrapper mt-16">
      <table>
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
    const targetRaw = obj.targetValue;
    const currentRaw = obj.currentValue;
    const targetNum = Number(String(targetRaw || '').replace(/[^\d.-]/g, ''));
    const currentNum = Number(String(currentRaw || '').replace(/[^\d.-]/g, ''));
    const logro = targetNum > 0 && currentNum >= 0 ? Math.round((currentNum / targetNum) * 100) : 0;
    const statusClass = logro >= 100 || obj.status === 'ACHIEVED' ? 'success' : (logro >= 75 ? 'warning' : 'danger');
    const statusLabel = statusClass === 'success' ? 'Cumplido' : 'En Progreso';
    const targetLabel = [targetRaw, obj.measureUnit || obj.unit].filter(Boolean).join(' ');
    const currentLabel = [currentRaw, obj.measureUnit || obj.unit].filter(Boolean).join(' ');
    
    html += `
      <tr>
        <td><b>${obj.objectiveCode || obj.code || '-'}</b></td>
        <td>${obj.objectiveName || obj.title || '-'}</td>
        <td>${targetLabel || '-'}</td>
        <td>${currentLabel || '-'}</td>
        <td>
          <div class="progress-xs">
            <div class="progress-xs-fill progress-xs-fill-${statusClass}" style="width: ${Math.min(logro, 100)}%;">
              ${logro}%
            </div>
          </div>
        </td>
        <td>${obj.ownerName || '-'}</td>
        <td>${obj.targetDate ? new Date(obj.targetDate).toLocaleDateString('es-CL') : '-'}</td>
        <td><span class="badge badge-${statusClass}">${statusLabel}</span></td>
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

/**
 * Renderiza la tabla de roles BCMS
 */
function renderGobiernoRoles() {
  const container = document.getElementById('gobierno-roles-table-container');
  if (!container) return;

  const roles = BCMSDataStore.api.getAll('bcmsRoles');
  const assignments = BCMSDataStore.api.getAll('bcmsRoleAssignments');
  const users = BCMSDataStore.api.getAll('users');
  const units = BCMSDataStore.api.getAll('organizationalUnits');

  let html = `
    <div class="table-wrapper mt-16">
      <table>
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
  
  roles.forEach((role, idx) => {
    const roleAssignments = assignments.filter(assignment => assignment.roleId === role.id);
    const primaryAssignment = roleAssignments.find(assignment => assignment.isPrimary) || roleAssignments[0];
    const backupAssignment = roleAssignments.find(assignment => !assignment.isPrimary);
    const primaryUser = users.find(user => user.id === primaryAssignment?.userId);
    const backupUser = users.find(user => user.id === backupAssignment?.userId);
    const userUnit = units.find(unit => unit.id === primaryUser?.orgUnitId);

    const primaryName = primaryUser ? `${primaryUser.firstName} ${primaryUser.lastName}` : '-';
    const backupName = backupUser ? `${backupUser.firstName} ${backupUser.lastName}` : '-';
    const authorityLevel = idx === 0 ? 'Nivel 1' : 'Nivel 2';
    const authorityClass = idx === 0 ? 'critical' : 'warning';

    html += `
      <tr>
        <td><b>${role.name}</b><div class="table-cell-meta">${role.code}</div></td>
        <td>${primaryName}</td>
        <td>${backupName}</td>
        <td>${userUnit?.name || '-'}</td>
        <td class="table-cell-muted">${role.description || '-'}</td>
        <td><span class="badge badge-${authorityClass}">${authorityLevel}</span></td>
        <td>${primaryUser?.email || '-'}</td>
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

/**
 * Renderiza la tabla de países
 */
function renderGobiernoPaises() {
  const container = document.getElementById('gobierno-paises-table-container');
  if (!container) return;

  const locations = BCMSDataStore.api.getAll('locations').filter(location => !location.isDeleted);
  const suppliers = BCMSDataStore.api.getAll('suppliers').filter(supplier => !supplier.isDeleted);
  const processes = BCMSDataStore.api.getAll('processes');
  const assignments = BCMSDataStore.api.getAll('bcmsRoleAssignments');
  const users = BCMSDataStore.api.getAll('users');

  const regulationsByCountry = {
    CL: 'Ley 21.663 · CMF · CSIRT',
    US: 'NIST · FFIEC',
    PE: 'SBS Perú',
    CO: 'SFC Colombia',
    MX: 'CNBV'
  };

  const countryCodes = [...new Set([
    ...locations.map(location => location.countryCode),
    ...suppliers.map(supplier => supplier.countryCode)
  ])].filter(Boolean);

  const bcmsLeadAssignment = assignments.find(assignment => assignment.roleId === 1 && assignment.isPrimary);
  const bcmsLeadUser = users.find(user => user.id === bcmsLeadAssignment?.userId);
  const responsibleName = bcmsLeadUser
    ? `${bcmsLeadUser.firstName} ${bcmsLeadUser.lastName}`
    : '-';

  let html = `
    <div class="table-wrapper mt-16">
      <table>
        <thead>
          <tr>
            <th>País</th>
            <th>Ciudad Principal</th>
            <th>Tipo Operación</th>
            <th>Procesos Críticos</th>
            <th>Capacidad Personal</th>
            <th>Site Status</th>
            <th>Normativa Local</th>
            <th>Responsable BCMS</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  countryCodes.forEach(countryCode => {
    const countryLocations = locations.filter(location => location.countryCode === countryCode);
    const hasPrimarySite = countryLocations.some(location => location.isPrimary);
    const siteStatus = hasPrimarySite ? 'Primary Site' : 'Regional/Support';
    const statusClass = hasPrimarySite ? 'success' : 'info';
    const city = countryLocations[0]?.city || '-';
    const operationType = countryLocations.length > 1 ? 'HQ + Operaciones' : 'Operación Local';
    const criticalProcesses = processes.filter(process => process.businessCriticality === 'CRITICAL').length;
    const processCoverage = countryLocations.length
      ? Math.max(1, Math.round((countryLocations.length / Math.max(locations.length, 1)) * criticalProcesses))
      : 0;
    const personnelCapacity = countryLocations.reduce((acc, location) => acc + (location.capacityPersons || 0), 0);

    html += `
      <tr>
        <td><b>${countryCode}</b></td>
        <td>${city}</td>
        <td>${operationType}</td>
        <td>${processCoverage}</td>
        <td>${personnelCapacity || '-'}</td>
        <td><span class="badge badge-${statusClass}">${siteStatus}</span></td>
        <td>${regulationsByCountry[countryCode] || 'Regulación local'}</td>
        <td>${responsibleName}</td>
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

/**
 * Renderiza la tabla de estándares y certificaciones
 */
function renderGobiernoEstandares() {
  const container = document.getElementById('gobierno-estandares-table-container');
  if (!container) return;
  
  const estandares = BCMSDataStore.api.getAll('frameworks');
  
  let html = `
    <div class="table-wrapper mt-16">
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
    const compliance = 78 + ((std.id * 7) % 22);
    const statusClass = std.isActive ? 'success' : 'neutral';
    
    html += `
      <tr>
        <td><b>${std.name}</b><div class="table-cell-meta">${std.code}</div></td>
        <td>${std.version}</td>
        <td><span class="badge badge-${statusClass}">${std.isActive ? 'Activo' : 'Inactivo'}</span></td>
        <td>-</td>
        <td>-</td>
        <td>${std.issuingBody}</td>
        <td>-</td>
        <td>
          <div class="progress-xs">
            <div class="progress-xs-fill progress-xs-fill-success" style="width: ${compliance}%;">
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
        <td><strong>${supplier.name}</strong><br><span class="table-cell-meta">ID fiscal: ${supplier.taxId || '-'}</span></td>
        <td><span class="badge badge-info">${supplierType}</span></td>
        <td><span class="badge ${criticalityBadge.badgeClass}">${criticalityBadge.label}</span></td>
        <td>${processSummary}</td>
        <td>${assessmentDate}<br><span class="table-cell-meta"><span class="badge ${assessmentStatusClass}">${assessmentStatus}</span></span></td>
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
      <tr data-row-id="evaluacion-${assessment.id}" class="selectable-row" onclick="toggleDetalleEvaluacionTPRM()">
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
      <tr data-row-id="contingencia-${supplier.id}" class="selectable-row" onclick="toggleDetallePlanContingencia()">
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
  renderKPIGrid(container, [
    { label: 'Total Hallazgos', value: findings.length, icon: 'bi-search', color: 'primary' },
    { label: 'NC Mayor', value: ncMajor, icon: 'bi-exclamation-triangle', color: 'danger' },
    { label: 'NC Menor', value: ncMinor, icon: 'bi-exclamation-circle', color: 'warning' },
    { label: 'Observaciones', value: obs, icon: 'bi-info-circle', color: 'info' },
    { label: 'Abiertos', value: open, icon: 'bi-folder2-open', color: 'danger' }
  ]);
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
  renderKPIGrid(container, [
    { label: 'Lecciones Registradas', value: lessons.length, icon: 'bi-lightbulb', color: 'primary' },
    { label: 'Mejoras Implementadas', value: implemented, icon: 'bi-check-circle', color: 'secondary' },
    { label: 'En Progreso', value: inProgress, icon: 'bi-clock', color: 'warning' },
    { label: 'Impacto Promedio', value: `${avgImprovement}%`, icon: 'bi-graph-down-arrow', color: 'info' },
    { label: 'Tasa Efectividad', value: `${Math.round((implemented / Math.max(lessons.length, 1)) * 100)}%`, icon: 'bi-trophy', color: 'secondary' }
  ]);
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
  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const countIssues = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean).length;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const normalized = value.trim();
      if (!normalized) return 0;
      const numeric = Number(normalized);
      if (Number.isFinite(numeric)) return numeric;
      return normalized
        .split(/\r?\n|;|,/)
        .map(item => item.trim())
        .filter(Boolean).length;
    }
    return 0;
  };
  const avgSuccess = completed.length > 0 ? Math.round(completed.reduce((s,t) => s + toNumber(t.successRatePct), 0) / completed.length) : 0;
  const totalIssues = tests.reduce((s,t) => s + countIssues(t.issuesFound), 0);
  const nextTest = tests.filter(t => t.status === 'SCHEDULED').sort((a,b) => a.testDate > b.testDate ? 1 : -1)[0];
  renderKPIGrid(container, [
    { label: 'Pruebas Programadas', value: tests.length, icon: 'bi-clipboard-check', color: 'primary' },
    { label: 'Tasa Éxito', value: `${avgSuccess}%`, icon: 'bi-check-circle', color: 'secondary' },
    { label: 'Hallazgos Abiertos', value: totalIssues, icon: 'bi-exclamation-triangle', color: 'warning' },
    { label: 'Próxima Prueba', value: nextTest ? nextTest.testDate.substring(5,10) : '-', icon: 'bi-calendar3', color: 'info' }
  ]);
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
 * RIA - ANÁLISIS DE RIESGO DE INTERRUPCIÓN - Funciones de renderizado
 * Vista: view-ria | Enfoque: proceso (gatillado por resultado BIA)
 * ============================================================================
 */

function renderRIAView() {
  const domainFilter = document.getElementById('ria-domain-filter');
  if (domainFilter) {
    domainFilter.value = AppState.riaDomainFilter || '';
  }
  renderRIAKPIs();
  renderRIATable();
  if (AppState.selectedRIAProcessId) {
    showDetalleRIA(AppState.selectedRIAProcessId);
  }
}

function getRIAProcessRisks(processId) {
  return (BCMSDataStore.entities.risks || []).filter(r => !r.isDeleted && r.riskDomain !== 'CYBER' && !String(r.code || '').startsWith('RCIBER') && Number(r.targetProcessId) === Number(processId));
}

function getLatestRIAAssessment(processId) {
  return (BCMSDataStore.entities.riaAssessments || [])
    .filter(a => !a.isDeleted && (Number(a.targetProcessId) === Number(processId) || Number(a.processId) === Number(processId)))
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    })[0] || null;
}

function getRIAItemsByAssessment(assessmentId) {
  return (BCMSDataStore.entities.riaItems || [])
    .filter(item => !item.isDeleted && Number(item.riaAssessmentId) === Number(assessmentId))
    .sort((a, b) => Number(a.itemNo || 0) - Number(b.itemNo || 0));
}

function normalizeRIAAssessmentStatus(status) {
  const normalized = String(status || '').toUpperCase();
  if (['COMPLETADO', 'COMPLETED', 'CERRADO', 'CLOSED'].includes(normalized)) return 'COMPLETADO';
  if (['BORRADOR', 'DRAFT', 'EN_CURSO', 'IN_PROGRESS'].includes(normalized)) return 'EN_CURSO';
  if (['NO_REQUERIDO', 'NOT_REQUIRED'].includes(normalized)) return 'NO_REQUERIDO';
  return 'SIN_INICIAR';
}

function getRIAAssessmentStatusInfo(assessment, hasLegacyMatrix, biaTriggered) {
  if (assessment) {
    const code = normalizeRIAAssessmentStatus(assessment.status);
    if (code === 'COMPLETADO') return { code, label: 'Completado', badgeClass: 'badge-success' };
    if (code === 'EN_CURSO') return { code, label: 'En curso', badgeClass: 'badge-warning' };
    if (code === 'NO_REQUERIDO') return { code, label: 'No requerido', badgeClass: 'badge-info' };
  }
  if (hasLegacyMatrix) return { code: 'COMPLETADO_LEGACY', label: 'Completado (legacy)', badgeClass: 'badge-active' };
  if (!biaTriggered) return { code: 'NO_REQUERIDO', label: 'No requerido', badgeClass: 'badge-info' };
  return { code: 'SIN_INICIAR', label: 'Sin iniciar', badgeClass: 'badge-neutral' };
}

function evaluateBIAForRIA(process) {
  const scenarios = getBIAScenariosForProcess(process);
  const impactCategories = getBIAImpactCategories();
  let triggerScenarios = 0;
  let maxLateImpactScore = 1;
  let maxLateImpactType = 'Procesos';

  scenarios.forEach((scenario, scenarioIndex) => {
    const scenarioKey = getBIAScenarioKey(scenario, scenarioIndex);
    let scenarioMaxLate = 1;
    let scenarioLateType = 'Procesos';

    impactCategories.forEach((category) => {
      for (let bucketIndex = 4; bucketIndex <= 5; bucketIndex += 1) {
        const score = getBIAImpactCellScore(process.id, scenario, scenarioKey, category, bucketIndex);
        if (score > scenarioMaxLate) {
          scenarioMaxLate = score;
          scenarioLateType = category;
        }
      }
    });

    if (scenarioMaxLate >= 4) {
      triggerScenarios += 1;
    }

    if (scenarioMaxLate > maxLateImpactScore) {
      maxLateImpactScore = scenarioMaxLate;
      maxLateImpactType = scenarioLateType;
    }
  });

  const triggered = triggerScenarios > 0;
  const triggerReason = triggered
    ? `${triggerScenarios} escenario(s) con impacto >24h y nivel ${getBIAImpactLabel(maxLateImpactScore)}`
    : 'Sin escenarios >24h con nivel Medio Alto/Alto';

  return {
    triggered,
    triggerScenarios,
    totalScenarios: scenarios.length,
    maxLateImpactScore,
    maxLateImpactType,
    triggerReason,
    maxLateImpactLabel: getBIAImpactLabel(maxLateImpactScore)
  };
}

function getRIAProcessCandidates(applyFilter = true) {
  const processes = (BCMSDataStore.entities.processes || []).filter(p => !p.isDeleted);
  const items = processes.map((process) => {
    const bia = evaluateBIAForRIA(process);
    const relatedRisks = getRIAProcessRisks(process.id);
    const assessment = getLatestRIAAssessment(process.id);
    const assessmentItems = assessment ? getRIAItemsByAssessment(assessment.id) : [];
    const hasMatrix = assessmentItems.length > 0 || relatedRisks.length > 0;
    const status = getRIAAssessmentStatusInfo(assessment, !assessment && relatedRisks.length > 0, bia.triggered);

    return {
      process,
      bia,
      relatedRisks,
      assessment,
      assessmentItems,
      hasMatrix,
      status
    };
  });

  if (!applyFilter || !AppState.riaDomainFilter) {
    return items;
  }

  return items.filter(item => {
    if (AppState.riaDomainFilter === 'TRIGGERED') return item.bia.triggered;
    if (AppState.riaDomainFilter === 'WITH_MATRIX') return item.hasMatrix;
    if (AppState.riaDomainFilter === 'PENDING') return item.bia.triggered && !item.hasMatrix;
    if (AppState.riaDomainFilter === 'COMPLETED') return ['COMPLETADO', 'COMPLETADO_LEGACY'].includes(item.status.code);
    if (AppState.riaDomainFilter === 'NO_REQUIRED') return item.status.code === 'NO_REQUERIDO';
    return true;
  });
}

function filterRIAByDomain(domain) {
  AppState.riaDomainFilter = domain || '';
  renderRIAKPIs();
  renderRIATable();
  const panel = document.getElementById('detalle-ria');
  if (panel) panel.classList.add('d-none');
}

function renderRIAKPIs() {
  const container = document.getElementById('ria-kpis-container');
  if (!container) return;

  const allCandidates = getRIAProcessCandidates(false);
  const triggered = allCandidates.filter(c => c.bia.triggered).length;
  const withMatrix = allCandidates.filter(c => c.hasMatrix).length;
  const completed = allCandidates.filter(c => ['COMPLETADO', 'COMPLETADO_LEGACY'].includes(c.status.code)).length;
  const pending = allCandidates.filter(c => c.status.code === 'SIN_INICIAR' && c.bia.triggered).length;
  const inProgress = allCandidates.filter(c => c.status.code === 'EN_CURSO').length;
  const notRequired = allCandidates.filter(c => c.status.code === 'NO_REQUERIDO').length;
  const currentlyVisible = getRIAProcessCandidates().length;

  renderKPIGrid(container, [
    { label: 'Procesos en RIA', value: allCandidates.length, icon: 'bi-diagram-3', color: 'primary', subtitle: `Visibles por filtro: ${currentlyVisible}` },
    { label: 'Gatillo RIA activo', value: triggered, icon: 'bi-exclamation-triangle', color: 'danger', subtitle: 'Impacto >24h y nivel Medio Alto/Alto' },
    { label: 'Matriz RIA levantada', value: withMatrix, icon: 'bi-table', color: 'secondary', subtitle: 'Con escenarios registrados' },
    { label: 'Pendientes de levantar', value: pending, icon: 'bi-hourglass-split', color: 'warning', subtitle: 'Gatillados sin matriz' },
    { label: 'Completados / En curso', value: `${completed} / ${inProgress}`, icon: 'bi-wrench', color: 'info', subtitle: `No requerido: ${notRequired}` }
  ]);
}

function renderRIATable() {
  const tbody = document.getElementById('ria-tbody');
  if (!tbody) return;

  const candidates = getRIAProcessCandidates();

  if (candidates.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center fs-12 color-muted">No existen procesos para el filtro seleccionado.</td></tr>';
    return;
  }

  tbody.innerHTML = candidates.map(item => {
    const process = item.process;
    const triggerBadge = item.bia.triggered ? 'badge-danger' : 'badge-success';
    const matrixBadge = item.hasMatrix ? 'badge-secondary' : 'badge-neutral';
    const criticalityKey = String(process.businessCriticality || 'medium').toLowerCase().replace(/_/g, '-');
    const statusBadge = item.status.badgeClass;
    const actionLabel = ['COMPLETADO', 'COMPLETADO_LEGACY', 'EN_CURSO'].includes(item.status.code) ? 'Editar RIA' : 'Evaluar';
    const scenarioCount = item.assessmentItems.length > 0 ? item.assessmentItems.length : item.relatedRisks.length;

    return `<tr class="ria-clickable-row cursor-pointer" onclick="showDetalleRIA(${process.id})">
      <td class="fw-600">${process.code}</td>
      <td class="fs-12">${process.name || '-'}</td>
      <td class="fs-12"><span class="badge badge-${criticalityKey}">${BCMSDataStore.api.getLookupLabel('businessCriticality', process.businessCriticality) || process.businessCriticality || '-'}</span></td>
      <td class="fs-12">${item.bia.maxLateImpactLabel} (${item.bia.maxLateImpactType})</td>
      <td class="text-center"><span class="badge ${triggerBadge}">${item.bia.triggered ? 'Si' : 'No'}</span></td>
      <td class="text-center"><span class="badge ${matrixBadge}">${scenarioCount}</span></td>
      <td><span class="badge ${statusBadge}">${item.status.label}</span></td>
      <td class="bia-col-action">
        <div class="d-flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); showDetalleRIA(${process.id});">
            <i class="bi bi-eye"></i> Ver detalle
          </button>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openRIALevantamientoModal(${process.id});">
            <i class="bi bi-pencil"></i> ${actionLabel}
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function showDetalleRIA(processId) {
  const panel = document.getElementById('detalle-ria');
  if (!panel) return;

  const processes = BCMSDataStore.entities.processes || [];
  const proc = processes.find(p => p.id === processId);
  if (!proc) return;
  AppState.selectedRIAProcessId = Number(processId);

  const relatedRisks = getRIAProcessRisks(processId);
  const latestAssessment = getLatestRIAAssessment(processId);
  const assessmentItems = latestAssessment ? getRIAItemsByAssessment(latestAssessment.id) : [];
  const bia = evaluateBIAForRIA(proc);
  const allControls = BCMSDataStore.entities.controls || [];
  const controlsFromRelated = relatedRisks.flatMap(r => r.controls || []);
  const uniqueControls = [...new Set(controlsFromRelated)];
  const hasLegacy = !latestAssessment && relatedRisks.length > 0;
  const statusInfo = getRIAAssessmentStatusInfo(latestAssessment, hasLegacy, bia.triggered);
  const matrixRowsForSummary = assessmentItems.length > 0 ? assessmentItems : relatedRisks;

  const avgInherent = matrixRowsForSummary.length > 0
    ? Math.round(matrixRowsForSummary.reduce((sum, r) => sum + Number(r.inherentScore || r.ri || 0), 0) / matrixRowsForSummary.length)
    : 0;
  const avgResidual = matrixRowsForSummary.length > 0
    ? Math.round(matrixRowsForSummary.reduce((sum, r) => sum + Number(r.residualScore || r.residualWithBeta || r.rr || 0), 0) / matrixRowsForSummary.length)
    : 0;
  const detailClass = bia.triggered ? 'ria-detail-critical' : 'ria-detail-warning';

  const syntheticRisk = assessmentItems[0] || relatedRisks[0] || {
    id: `RIA-PROC-${proc.id}`,
    code: `RIA-${proc.code}`,
    title: `Matriz continuidad ${proc.name}`,
    targetProcessId: proc.id,
    riskDomain: 'CONTINUITY',
    scenario: 'Escenario base derivado de BIA',
    cause: bia.triggerReason,
    effect: 'Afectación de continuidad operacional',
    inherentImpact: Math.max(3, bia.maxLateImpactScore),
    residualImpact: Math.max(2, bia.maxLateImpactScore - 1),
    inherentProbability: 3,
    residualProbability: 2,
    inherentScore: Math.max(6, bia.maxLateImpactScore * 3),
    residualScore: Math.max(4, (bia.maxLateImpactScore - 1) * 2),
    treatmentType: 'MITIGATE',
    controls: []
  };
  syntheticRisk.assessmentRows = assessmentItems;
  syntheticRisk.assessmentId = latestAssessment?.id || null;

  panel.innerHTML = `
    <div class="card mb-24 ria-detail-card ${detailClass}">
      <div class="card-header">
        <div><h3><i class="bi bi-shield-exclamation"></i> ${proc.code} - ${proc.name}</h3></div>
        <div class="d-flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="openRIALevantamientoModal(${proc.id})"><i class="bi bi-pencil"></i> Editar RIA</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('detalle-ria').classList.add('d-none')"><i class="bi bi-x"></i> Cerrar</button>
        </div>
      </div>
      <div class="p-20">
        <div class="d-grid grid-3-equal gap-16 mb-24">
          <div><span class="fs-11 fw-600 color-muted">Resultado BIA</span><div class="fs-13 mt-4"><span class="badge badge-${(proc.businessCriticality || 'medium').toLowerCase()}">${proc.businessCriticality || '-'}</span></div></div>
          <div><span class="fs-11 fw-600 color-muted">Gatillo RIA</span><div class="mt-4"><span class="badge ${bia.triggered ? 'badge-danger' : 'badge-success'}">${bia.triggered ? 'Si' : 'No'}</span></div></div>
          <div><span class="fs-11 fw-600 color-muted">Estado</span><div class="mt-4"><span class="badge ${statusInfo.badgeClass}">${statusInfo.label}</span></div></div>
          <div><span class="fs-11 fw-600 color-muted">Criterio BancoEstado</span><div class="fs-12 mt-4">${bia.triggerReason}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Escenarios matriz</span><div class="fs-12 mt-4">${assessmentItems.length > 0 ? assessmentItems.length : relatedRisks.length}</div></div>
          <div><span class="fs-11 fw-600 color-muted">Controles asociados</span><div class="fs-12 mt-4">${uniqueControls.length}</div></div>
        </div>
        <div class="d-grid grid-2-equal gap-20 mb-24">
          <div class="card p-16 ria-risk-box ria-risk-box-inherent">
            <h4 class="fs-12 fw-600 color-danger mb-8">Promedio Riesgo Inherente</h4>
            <div class="d-flex jc-between fs-12 mb-4"><span>Escenarios gatillados</span><span class="fw-600">${bia.triggerScenarios}/${bia.totalScenarios}</span></div>
            <div class="d-flex jc-between fs-12 mb-4"><span>Impacto BIA >24h</span><span class="fw-600">${bia.maxLateImpactLabel}</span></div>
            <div class="d-flex jc-between fs-13 fw-600 pt-8 border-top-soft"><span>Score promedio</span><span>${avgInherent || '-'}</span></div>
          </div>
          <div class="card p-16 ria-risk-box ria-risk-box-residual">
            <h4 class="fs-12 fw-600 color-green mb-8">Promedio Riesgo Residual</h4>
            <div class="d-flex jc-between fs-12 mb-4"><span>Matriz levantada</span><span class="fw-600">${matrixRowsForSummary.length > 0 ? 'Si' : 'No'}</span></div>
            <div class="d-flex jc-between fs-12 mb-4"><span>Riesgos en tratamiento</span><span class="fw-600">${relatedRisks.filter(r => r.status === 'TREATING').length}</span></div>
            <div class="d-flex jc-between fs-13 fw-600 pt-8 border-top-soft"><span>Score promedio</span><span>${avgResidual || '-'}</span></div>
          </div>
        </div>
        <div class="mb-16">
          <h4 class="fs-13 fw-600 mb-8">Riesgos derivados de la matriz</h4>
          ${(assessmentItems.length > 0 || relatedRisks.length > 0) ? `<div class="table-wrapper"><table class="fs-12"><thead><tr><th>Código</th><th>Riesgo</th><th>Inherente</th><th>Residual</th><th>Estado</th><th>Tratamiento</th></tr></thead><tbody>` +
            (assessmentItems.length > 0 ? assessmentItems : relatedRisks).map(r => {
              const statusBadgeRow = r.status === 'TREATING' ? 'badge-warning' : r.status === 'MONITORED' ? 'badge-success' : 'badge-info';
              const treatmentLabel = r.treatmentType === 'MITIGATE' ? 'Mitigar' : r.treatmentType === 'ACCEPT' ? 'Aceptar' : r.treatmentType === 'TRANSFER' ? 'Transferir' : (r.treatmentType || (r.responseText ? 'Evaluado' : '-'));
              return `<tr><td class="fw-600">${r.code || `RIA-${proc.code}-${r.itemNo || ''}`}</td><td>${r.title || r.lossRiskText || '-'}</td><td>${r.inherentScore || r.ri || '-'}</td><td>${r.residualScore || r.residualWithBeta || r.rr || '-'}</td><td><span class="badge ${statusBadgeRow}">${r.status || (r.responseText ? 'Evaluado' : '-')}</span></td><td>${treatmentLabel}</td></tr>`;
            }).join('') + `</tbody></table></div>` : '<p class="fs-12 color-muted">No hay riesgos asociados todavía. El proceso está gatillado por BIA y requiere levantar matriz RIA.</p>'}
        </div>
        <div class="mb-16">
          <h4 class="fs-13 fw-600 mb-8">Controles Identificados</h4>
          ${uniqueControls.length > 0 ? `<div class="table-wrapper"><table class="fs-12"><thead><tr><th>Control</th><th>Tipo</th><th>Efectividad</th></tr></thead><tbody>` +
            uniqueControls.map(cId => {
              const ctrl = allControls.find(c => c.id === cId || c.code === cId);
              return ctrl ? `<tr><td>${ctrl.code} - ${ctrl.name}</td><td>${ctrl.type || '-'}</td><td>${ctrl.effectiveness || '-'}</td></tr>` : '';
            }).join('') + `</tbody></table></div>` : '<p class="fs-12 color-muted">Sin controles vinculados</p>'}
        </div>
        ${renderRIABancoEstadoSchema(syntheticRisk, proc, allControls)}
      </div>
    </div>`;
  panel.classList.remove('d-none');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRIABancoEstadoSchema(risk, process, allControls) {
  const relatedRisks = getRIARelatedRisksForSchema(risk);

  const matrixRows = relatedRisks.map((item, index) => {
    const mappedControlEval = Number(item.controlEvaluation || item.controlNum || 0);
    const fallbackControl = getRIAControlEvaluation(item, allControls);
    const controlEval = {
      score: mappedControlEval > 0 ? Math.max(1, Math.min(5, mappedControlEval)) : fallbackControl.score,
      label: mappedControlEval > 0 ? getRIAControlLabel(mappedControlEval) : fallbackControl.label
    };
    const impact = Number(item.maxImpact24h || item.impactNum || item.inherentImpact || item.residualImpact || 3);
    const inherentProbability = Number(item.probability || item.probabilityNum || item.inherentProbability || 1);
    const residualProbability = Number(item.probabilityNum || item.residualProbability || inherentProbability || 1);
    const inherentScore = Number(item.ri || item.inherentScore || (impact * inherentProbability));
    const residualScore = Number(item.rr || item.residualScore || inherentScore);
    const residualControlScore = Number(item.controlNum || controlEval.score || 1);
    const inherentBand = item.inherentBand || getRIAScoreBand(inherentScore);
    const residualBand = item.residualBand || getRIAScoreBand(residualScore);
    const beta = Number(item.beta || getRIABetaValue(residualScore, controlEval.score));
    const residualWithBeta = Number(item.residualWithBeta || Math.min(inherentScore, residualScore / Math.max(beta, 0.01)));
    const residualFinalBand = item.residualFinalBand || getRIAResidualFinalBand(residualBand, beta, residualScore);
    const response = item.responseText || getRIAResponseByFinalBand(residualFinalBand);
    const controlNames = item.controlsText || getRIAControlNames(item, allControls);
    const riskCode = item.code || `RIA-${process?.code || 'PROC'}-${item.itemNo || index + 1}`;
    const scenarioText = item.riskFactorSpecificText || item.scenario || item.cause || item.effect || '-';
    const riskText = item.lossRiskText || item.effect || 'Costos adicionales del proceso';

    return `
      <tr>
        <td class="fw-600 ria-sticky-id">${riskCode}</td>
        <td class="ria-matrix-text ria-sticky-name">${process?.name || process?.description || '-'}</td>
        <td class="ria-matrix-text ria-sticky-scenario">${scenarioText}</td>
        <td class="ria-matrix-text">${riskText}</td>
        <td>${item.riskFactorText || getRIAFactorLabel(item.riskDomain)}</td>
        <td class="ria-matrix-text">${scenarioText}</td>
        <td class="ria-matrix-text">${controlNames}</td>
        <td>${item.impactType || getRIAImpactType(item)}</td>
        <td><span class="ria-level-pill ${riaV2BandClass(impact)}">${impact} ${getRIAImpactLevelLabel(impact)}</span></td>
        <td>${inherentProbability} ${getRIAProbabilityLabel(inherentProbability)}</td>
        <td>${controlEval.score} ${controlEval.label}</td>
        <td class="fw-600 text-center">${impact}</td>
        <td class="fw-600 text-center">${residualProbability}</td>
        <td class="fw-600 text-center">${residualControlScore}</td>
        <td class="fw-700 text-center">${inherentScore}</td>
        <td class="fw-700 text-center">${residualScore}</td>
        <td><span class="ria-level-pill ${riaV2BandClass(inherentBand)}">${inherentBand}</span></td>
        <td><span class="ria-level-pill ${riaV2BandClass(residualBand)}">${residualBand}</span></td>
        <td class="text-center">${beta < 1 ? beta.toFixed(2) : beta}</td>
        <td class="text-center fw-700">${residualWithBeta}</td>
        <td><span class="ria-level-pill ${riaV2BandClass(residualFinalBand)}">${residualFinalBand}</span></td>
        <td class="ria-matrix-text">${response}</td>
        <td class="ria-matrix-text">${item.observations || item.description || 'Sin observaciones'}</td>
        <td class="ria-matrix-text">${item.contingencyDesc || getRIAContingencyDescription(item)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="ria-xlsx-section mt-20">
      <div class="ria-xlsx-header">
        <h4><i class="bi bi-file-earmark-spreadsheet"></i> BancoEstado - 2 Matriz Continuidad (RIA)</h4>
        <span class="badge badge-info">Vista operativa prioritaria</span>
      </div>

      <div class="ria-xlsx-table-wrapper table-wrapper mt-12">
        <table class="ria-xlsx-table fs-11">
          <thead>
            <tr>
              <th class="ria-sticky-id">ID</th>
              <th class="ria-sticky-name">Nombre</th>
              <th class="ria-sticky-scenario">Escenario</th>
              <th>Riesgos de Pérdida</th>
              <th>Factor de Riesgo</th>
              <th>Factor de Riesgo Específico</th>
              <th>Controles identificados</th>
              <th>Tipo de Impacto</th>
              <th>Mayor Impacto hasta 24h</th>
              <th>Probabilidad</th>
              <th>Evaluación del Control</th>
              <th>Impacto</th>
              <th>Probabilidad (residual)</th>
              <th>Eval. control (residual)</th>
              <th>RI</th>
              <th>RR</th>
              <th>Riesgo Inherente</th>
              <th>Riesgo Residual</th>
              <th>Beta</th>
              <th>Riesgo Residual con Beta</th>
              <th>Riesgo Residual Final</th>
              <th>Respuesta al Riesgo de Continuidad</th>
              <th>Observaciones</th>
              <th>Descripción contingencia</th>
            </tr>
          </thead>
          <tbody>
            ${matrixRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getRIARelatedRisksForSchema(risk) {
  if (Array.isArray(risk?.assessmentRows) && risk.assessmentRows.length > 0) {
    return risk.assessmentRows;
  }
  const risks = (BCMSDataStore.entities.risks || []).filter(r => !r.isDeleted);
  const nonCyber = risks.filter(r => r.riskDomain !== 'CYBER' && !String(r.code || '').startsWith('RCIBER'));
  if (risk.targetProcessId) {
    const related = nonCyber.filter(r => Number(r.targetProcessId) === Number(risk.targetProcessId));
    if (related.length > 0) return related.slice(0, 12);
  }
  return [risk];
}

function getRIAProbabilityLabel(score) {
  const map = {
    1: 'Muy poco probable',
    2: 'Poco probable',
    3: 'Ocasional',
    4: 'Frecuente',
    5: 'Muy frecuente'
  };
  return map[score] || '-';
}

function getRIAImpactLevelLabel(score) {
  const levels = ['Bajo', 'Medio Bajo', 'Medio', 'Medio Alto', 'Alto'];
  const normalized = Math.max(1, Math.min(5, Number(score) || 1));
  return levels[normalized - 1];
}

function getRIAControlLabel(score) {
  const map = {
    1: 'Deficiente',
    2: 'Regular',
    3: 'Suficiente',
    4: 'Bueno',
    5: 'Óptimo'
  };
  return map[Math.max(1, Math.min(5, Number(score) || 1))] || '-';
}

function riaV2BandClass(value) {
  const normalizedText = String(value || '').toUpperCase();
  if (normalizedText === 'BAJO' || normalizedText === 'LOW' || normalizedText === '1') return 'level-1';
  if (normalizedText === 'MEDIO BAJO' || normalizedText === 'MEDIUM_LOW' || normalizedText === '2') return 'level-2';
  if (normalizedText === 'MEDIO' || normalizedText === 'MEDIUM' || normalizedText === '3') return 'level-3';
  if (normalizedText === 'MEDIO ALTO' || normalizedText === 'MEDIUM_HIGH' || normalizedText === '4') return 'level-4';
  return 'level-5';
}

function getRIAScoreBand(score) {
  const value = Number(score) || 0;
  if (value <= 2.99) return 'Bajo';
  if (value <= 4.99) return 'Medio Bajo';
  if (value <= 9.99) return 'Medio';
  if (value <= 14.99) return 'Medio Alto';
  return 'Alto';
}

function getRIABetaValue(residualScore, controlScore) {
  if (residualScore >= 10 && controlScore <= 2) return 0.01;
  if (residualScore >= 8 && controlScore <= 2) return 0.1;
  return 1;
}

function getRIAResidualFinalBand(residualBand, beta, residualScore) {
  if (beta < 1 && residualScore >= 10) return 'Alto';
  if (beta < 1 && residualScore >= 7) return 'Medio Alto';
  return residualBand;
}

function getRIAResponseByFinalBand(finalBand) {
  if (finalBand === 'Alto' || finalBand === 'Medio Alto') {
    return 'Se debe crear o modificar un Plan de Continuidad, o bien, si el plan existe y no se ha probado, se debe concretar una prueba.';
  }
  return 'No se requiere actualizar o construir un plan de continuidad, se debe mantener el plan de pruebas.';
}

function getRIAFactorLabel(domain) {
  const map = {
    CONTINUITY: 'Escenario de Continuidad',
    OPERATIONAL: 'Escenario Operacional',
    COMPLIANCE: 'Escenario Normativo',
    INTEGRATED: 'Escenario Integrado'
  };
  return map[String(domain || '').toUpperCase()] || 'Escenario Operacional';
}

function getRIAControlNames(risk, allControls) {
  const controls = risk.controls || [];
  if (controls.length === 0) return 'No existen controles identificados';
  const names = controls.map(cId => {
    const ctrl = allControls.find(c => c.id === cId || c.code === cId);
    return ctrl ? `${ctrl.code} - ${ctrl.name}` : String(cId);
  });
  return names.join(' | ');
}

function getRIAControlEvaluation(risk, allControls) {
  const controls = risk.controls || [];
  if (controls.length === 0) return { score: 1, label: 'Deficiente' };

  const effectivityMap = { WEAK: 1, ADEQUATE: 3, STRONG: 5 };
  const scores = controls.map(cId => {
    const ctrl = allControls.find(c => c.id === cId || c.code === cId);
    const key = String(ctrl?.effectiveness || '').toUpperCase();
    return effectivityMap[key] || 2;
  });
  const avg = Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length);
  const labelMap = { 1: 'Deficiente', 2: 'Regular', 3: 'Suficiente', 4: 'Bueno', 5: 'Óptimo' };
  return { score: Math.max(1, Math.min(5, avg)), label: labelMap[Math.max(1, Math.min(5, avg))] };
}

function getRIAImpactType(risk) {
  const text = `${risk.effect || ''} ${risk.title || ''}`.toLowerCase();
  if (text.includes('reput')) return 'Reputacional';
  if (text.includes('norm') || text.includes('regul')) return 'Normativo';
  if (text.includes('cliente') || text.includes('afiliad')) return 'Clientes';
  if (text.includes('costo') || text.includes('financ')) return 'Monetario';
  return 'Procesos';
}

function getRIAContingencyDescription(risk) {
  if (String(risk.treatmentType || '').toUpperCase() === 'MITIGATE') {
    return 'Ruta de contingencia definida y pendiente de validación en prueba.';
  }
  if (String(risk.treatmentType || '').toUpperCase() === 'TRANSFER') {
    return 'Cobertura por tercero/proveedor con seguimiento contractual.';
  }
  return 'Sin contingencia adicional declarada.';
}

function buildRIAFichaDiscriminacion(process, risk) {
  if (risk?.assessmentId) {
    const header = (BCMSDataStore.entities.riaDiscriminations || []).find(item => !item.isDeleted && Number(item.riaAssessmentId) === Number(risk.assessmentId));
    if (header) {
      const rows = (BCMSDataStore.entities.riaDiscriminationItems || [])
        .filter(item => !item.isDeleted && Number(item.discriminationId) === Number(header.id))
        .map(item => ({
          condition: item.criterion || '-',
          result: String(item.result || '').toUpperCase() === 'SI' ? 'Sí' : 'No',
          evidence: item.evidence || '-'
        }));
      if (rows.length > 0) return rows;
    }
  }

  const incidents = BCMSDataStore.entities.incidents || [];
  const processIncidents = incidents.filter(i => Number(i.affectedProcessId) === Number(process?.id));
  const hasMassiveImpact = Number(risk.inherentImpact || 0) >= 4 || Number(risk.residualImpact || 0) >= 4;
  const evidenceProcess = process?.name || risk.riskScope || 'No definido';

  return [
    { condition: 'Nivel de Exposición Monetaria', result: hasMassiveImpact ? 'Sí' : 'No', evidence: `Proceso evaluado: ${evidenceProcess}` },
    { condition: 'Pérdidas Operacionales', result: (risk.effect || '').toLowerCase().includes('costo') ? 'Sí' : 'No', evidence: risk.effect || 'Sin evidencia declarada' },
    { condition: 'Lineamientos Estratégicos', result: ['CRITICAL', 'HIGH'].includes(process?.businessCriticality) ? 'Sí' : 'No', evidence: `Criticidad proceso: ${process?.businessCriticality || 'N/A'}` },
    { condition: 'Nivel de Exposición Reputacional', result: (risk.effect || '').toLowerCase().includes('reput') ? 'Sí' : 'No', evidence: risk.title || '-' },
    { condition: 'Riesgo de Incumplimiento Normativo', result: String(risk.riskDomain || '').toUpperCase() === 'COMPLIANCE' ? 'Sí' : 'No', evidence: risk.riskDomain || '-' },
    { condition: 'Incidentes Operacionales', result: processIncidents.length > 0 ? 'Sí' : 'No', evidence: `${processIncidents.length} incidentes vinculados` }
  ];
}

function getRIAApprovalData(process, risk) {
  if (risk?.assessmentId) {
    const approvals = (BCMSDataStore.entities.riaAssessmentApprovals || [])
      .filter(item => !item.isDeleted && Number(item.assessmentId) === Number(risk.assessmentId))
      .map(item => ({
        role: item.role,
        name: item.name || '-',
        date: item.date || ''
      }));
    if (approvals.length > 0) return approvals;
  }

  const users = BCMSDataStore.entities.users || [];
  const continuityLead = users.find(u => String(u.role || '').toLowerCase().includes('continuidad'));
  const riskLead = users.find(u => String(u.role || '').toLowerCase().includes('riesgo'));
  const ownerName = process?.ownerName || process?.owner || risk.ownerName || '-';
  const dateRef = formatDate(process?.updatedAt || risk.updatedAt || risk.createdAt);

  return [
    { role: 'Responsable de Proceso', name: ownerName, date: dateRef },
    { role: 'Jefe de Continuidad de Negocios', name: continuityLead ? `${continuityLead.firstName} ${continuityLead.lastName}` : '-', date: dateRef },
    { role: 'Jefe de Departamento de Riesgo Operacional', name: riskLead ? `${riskLead.firstName} ${riskLead.lastName}` : '-', date: dateRef }
  ];
}

function getRIAProcessTests(processId) {
  if (!processId) return [];
  const plans = BCMSDataStore.entities.continuityPlans || [];
  const tests = BCMSDataStore.entities.planTests || [];
  const relatedPlans = plans.filter(p => Number(p.targetProcessId) === Number(processId));
  if (relatedPlans.length === 0) return [];
  const planMap = {};
  relatedPlans.forEach(p => { planMap[p.id] = p; });

  return tests
    .filter(t => Boolean(planMap[t.planId]))
    .sort((a, b) => new Date(b.testDate || 0) - new Date(a.testDate || 0))
    .slice(0, 8)
    .map((test) => {
      const plan = planMap[test.planId];
      const testTypeMap = {
        TABLETOP: 'Escritorio',
        WALKTHROUGH: 'Recorrido',
        SIMULATION: 'Simulación',
        TECHNICAL_TEST: 'Técnica',
        FULL_EXERCISE: 'Real'
      };
      const success = Number(test.successRatePct || 0);
      const result = test.status === 'SCHEDULED'
        ? 'Programada'
        : (success >= 80 ? 'Satisfactorio' : (success > 0 ? 'Insuficiente' : 'En evaluación'));
      const resultClass = test.status === 'SCHEDULED'
        ? 'badge-info'
        : (success >= 80 ? 'badge-success' : 'badge-warning');

      return {
        planCode: plan.code || '-',
        planName: plan.title || '-',
        scenario: test.scopeDescription || test.title || '-',
        date: test.testDate ? formatDate(test.testDate) : '-',
        type: testTypeMap[test.testType] || test.testType || '-',
        result,
        resultClass
      };
    });
}

function getRIAProbabilityScale() {
  return [
    { level: '1', label: 'Muy poco probable' },
    { level: '2', label: 'Poco probable' },
    { level: '3', label: 'Ocasional' },
    { level: '4', label: 'Frecuente' },
    { level: '5', label: 'Muy frecuente' }
  ];
}

function getRIAControlScale() {
  return [
    { level: '1', label: 'Deficiente' },
    { level: '2', label: 'Regular' },
    { level: '3', label: 'Suficiente' },
    { level: '4', label: 'Bueno' },
    { level: '5', label: 'Óptimo' }
  ];
}

function getRIAResponseScale() {
  return [
    {
      when: 'Residual Final Alto / Medio Alto',
      action: 'Se debe crear o modificar un Plan de Continuidad o ejecutar prueba pendiente.'
    },
    {
      when: 'Residual Final Medio / Medio Bajo / Bajo',
      action: 'No se requiere construir nuevo plan, mantener y probar el plan vigente.'
    }
  ];
}

function getRIALevImpactTypeOptions() {
  const lookups = BCMSDataStore.lookups?.riaImpactTypes || [];
  if (lookups.length > 0) return lookups.map(item => item.label);
  return ['Monetario', 'Procesos', 'Reputacional', 'Normativo', 'Clientes'];
}

function getRIALevDiscriminationDefaults(process, bia, rows = []) {
  const incidents = BCMSDataStore.entities.incidents || [];
  const linkedIncidents = incidents.filter(item => Number(item.affectedProcessId) === Number(process.id));
  return [
    { criterion: 'Nivel de Exposición Monetaria', result: (bia.maxLateImpactType === 'Monetario' || bia.maxLateImpactScore >= 4) ? 'SI' : 'NO', evidence: `Impacto >24h: ${bia.maxLateImpactLabel} (${bia.maxLateImpactType})` },
    { criterion: 'Perdidas Operacionales', result: rows.length > 0 ? 'SI' : 'NO', evidence: `${rows.length} escenario(s) levantados` },
    { criterion: 'Lineamientos Estrategicos', result: ['CRITICAL', 'HIGH'].includes(String(process.businessCriticality || '').toUpperCase()) ? 'SI' : 'NO', evidence: `Criticidad: ${process.businessCriticality || '-'}` },
    { criterion: 'Nivel de Exposición Reputacional', result: rows.some(row => String(row.impactType || '').toLowerCase().includes('reput')) ? 'SI' : 'NO', evidence: 'Evaluado en matriz RIA' },
    { criterion: 'Riesgo de Incumplimiento Normativo', result: rows.some(row => String(row.impactType || '').toLowerCase().includes('norm')) ? 'SI' : 'NO', evidence: 'Validación normativa en escenarios' },
    { criterion: 'Incidentes Operacionales', result: linkedIncidents.length > 0 ? 'SI' : 'NO', evidence: `${linkedIncidents.length} incidente(s) vinculados` }
  ];
}

function buildRIALevRow(source, itemNo, processName) {
  const impactNum = Math.max(1, Math.min(5, Number(source.maxImpact24h || source.impactNum || 3)));
  const probabilityNum = Math.max(1, Math.min(5, Number(source.probability || source.probabilityNum || 3)));
  const controlNum = Math.max(1, Math.min(5, Number(source.controlEvaluation || source.controlNum || 3)));
  const ri = Number(source.ri || ((impactNum === 5 && probabilityNum === 1) ? 10 : impactNum * probabilityNum));
  const rr = Number(source.rr || (ri / controlNum));
  const betaRaw = Number(source.beta || 1);
  const beta = Math.max(0.01, Math.min(1, Number.isNaN(betaRaw) ? 1 : betaRaw));
  const residualWithBeta = Number(source.residualWithBeta || Math.min(ri, rr / beta));
  const residualFinalBand = source.residualFinalBand || getRIAScoreBand(residualWithBeta);

  return {
    itemNo,
    activityText: source.activityText || processName || '',
    lossRiskText: source.lossRiskText || source.effect || '',
    riskFactorText: source.riskFactorText || getRIAFactorLabel(source.riskDomain),
    riskFactorSpecificText: source.riskFactorSpecificText || source.scenario || source.cause || '',
    controlsText: source.controlsText || '',
    impactType: source.impactType || getRIAImpactType(source),
    maxImpact24h: impactNum,
    probability: probabilityNum,
    controlEvaluation: controlNum,
    impactNum,
    probabilityNum,
    controlNum,
    ri: Number(ri.toFixed(2)),
    rr: Number(rr.toFixed(2)),
    inherentBand: source.inherentBand || getRIAScoreBand(ri),
    residualBand: source.residualBand || getRIAScoreBand(rr),
    beta: Number(beta.toFixed(2)),
    residualWithBeta: Number(residualWithBeta.toFixed(2)),
    residualFinalBand,
    responseText: source.responseText || getRIAResponseByFinalBand(residualFinalBand),
    observations: source.observations || source.description || '',
    contingencyDesc: source.contingencyDesc || getRIAContingencyDescription(source),
    linkedRiskId: source.linkedRiskId || source.id || null
  };
}

function setRIALevSaveButtonsState(enabled) {
  const draftBtn = document.getElementById('ria-lev-save-draft-btn');
  const closeBtn = document.getElementById('ria-lev-save-close-btn');
  if (draftBtn) draftBtn.disabled = !enabled;
  if (closeBtn) closeBtn.disabled = !enabled;
}

function renderRIALevTargetSelect(selectedProcessId = null) {
  const select = document.getElementById('ria-lev-target-id');
  if (!select) return;
  const selected = Number(selectedProcessId || 0);
  const processes = (BCMSDataStore.entities.processes || []).filter(p => !p.isDeleted);
  select.innerHTML = '<option value="">-- Seleccionar proceso --</option>' + processes.map(process => (
    `<option value="${process.id}" ${Number(process.id) === selected ? 'selected' : ''}>${process.code} - ${process.name}</option>`
  )).join('');
}

function renderRIALevDiscriminationTable() {
  const tbody = document.getElementById('ria-lev-discrimination-body');
  if (!tbody) return;
  const rows = AppState.riaModalDraft?.discriminationItems || [];
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center fs-12 color-muted">Seleccione un proceso para cargar la ficha de discriminación.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((row, index) => `
    <tr>
      <td>${row.criterion || '-'}</td>
      <td>
        <select class="ria-lev-result-select" onchange="updateRIALevDiscriminationField(${index}, 'result', this.value)">
          <option value="SI" ${row.result === 'SI' ? 'selected' : ''}>Si</option>
          <option value="NO" ${row.result === 'NO' ? 'selected' : ''}>No</option>
        </select>
      </td>
      <td><input type="text" value="${row.evidence || ''}" onchange="updateRIALevDiscriminationField(${index}, 'evidence', this.value)"></td>
    </tr>
  `).join('');
}

function renderRIALevMatrixTable() {
  const tbody = document.getElementById('ria-lev-matrix-body');
  if (!tbody) return;
  const rows = AppState.riaModalDraft?.rows || [];
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="25" class="text-center fs-12 color-muted">Seleccione un proceso para editar la matriz.</td></tr>';
    return;
  }

  const impactTypes = getRIALevImpactTypeOptions();
  const scoreOptions = [1, 2, 3, 4, 5];

  tbody.innerHTML = rows.map((row, index) => `
    <tr>
      <td class="ria-sticky-id">RIA-${AppState.riaModalDraft.processId}-${index + 1}</td>
      <td class="ria-sticky-name"><input type="text" value="${row.activityText || ''}" onchange="updateRIALevRowField(${index}, 'activityText', this.value)"></td>
      <td class="ria-sticky-scenario"><input type="text" value="${row.riskFactorSpecificText || ''}" onchange="updateRIALevRowField(${index}, 'riskFactorSpecificText', this.value)"></td>
      <td><input type="text" value="${row.lossRiskText || ''}" onchange="updateRIALevRowField(${index}, 'lossRiskText', this.value)"></td>
      <td><input type="text" value="${row.riskFactorText || ''}" onchange="updateRIALevRowField(${index}, 'riskFactorText', this.value)"></td>
      <td><input type="text" value="${row.riskFactorSpecificText || ''}" onchange="updateRIALevRowField(${index}, 'riskFactorSpecificText', this.value)"></td>
      <td><input type="text" value="${row.controlsText || ''}" onchange="updateRIALevRowField(${index}, 'controlsText', this.value)"></td>
      <td>
        <select onchange="updateRIALevRowField(${index}, 'impactType', this.value)">
          ${impactTypes.map(label => `<option value="${label}" ${label === row.impactType ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="ria-lev-score-select level-${row.maxImpact24h}" onchange="updateRIALevRowField(${index}, 'maxImpact24h', this.value)">
          ${scoreOptions.map(score => `<option value="${score}" ${score === Number(row.maxImpact24h) ? 'selected' : ''}>${score} - ${getRIAImpactLevelLabel(score)}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="ria-lev-score-select level-${row.probability}" onchange="updateRIALevRowField(${index}, 'probability', this.value)">
          ${scoreOptions.map(score => `<option value="${score}" ${score === Number(row.probability) ? 'selected' : ''}>${score} - ${getRIAProbabilityLabel(score)}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="ria-lev-score-select level-${row.controlEvaluation}" onchange="updateRIALevRowField(${index}, 'controlEvaluation', this.value)">
          ${scoreOptions.map(score => `<option value="${score}" ${score === Number(row.controlEvaluation) ? 'selected' : ''}>${score} - ${getRIAControlLabel(score)}</option>`).join('')}
        </select>
      </td>
      <td class="text-center fw-600">${row.impactNum}</td>
      <td class="text-center fw-600">${row.probabilityNum}</td>
      <td class="text-center fw-600">${row.controlNum}</td>
      <td class="text-center fw-700">${row.ri}</td>
      <td class="text-center fw-700">${row.rr}</td>
      <td><span class="ria-level-pill ${riaV2BandClass(row.inherentBand)}">${row.inherentBand}</span></td>
      <td><span class="ria-level-pill ${riaV2BandClass(row.residualBand)}">${row.residualBand}</span></td>
      <td><input type="number" min="0.01" max="1" step="0.01" value="${row.beta}" onchange="updateRIALevRowField(${index}, 'beta', this.value)"></td>
      <td class="text-center fw-700">${row.residualWithBeta}</td>
      <td><span class="ria-level-pill ${riaV2BandClass(row.residualFinalBand)}">${row.residualFinalBand}</span></td>
      <td class="ria-matrix-text">${row.responseText || '-'}</td>
      <td><input type="text" value="${row.observations || ''}" onchange="updateRIALevRowField(${index}, 'observations', this.value)"></td>
      <td><input type="text" value="${row.contingencyDesc || ''}" onchange="updateRIALevRowField(${index}, 'contingencyDesc', this.value)"></td>
      <td><button type="button" class="btn btn-outline btn-sm" onclick="removeRIALevMatrixRow(${index})"><i class="bi bi-trash"></i></button></td>
    </tr>
  `).join('');
}

function renderRIALevTests(processId) {
  const container = document.getElementById('ria-lev-tests');
  if (!container) return;
  if (!processId) {
    container.innerHTML = '<p class="color-muted fs-12 m-0">Seleccione un proceso para revisar pruebas asociadas.</p>';
    return;
  }
  const tests = getRIAProcessTests(processId);
  container.innerHTML = `
    <div class="table-wrapper">
      <table class="ria-pruebas-table">
        <thead><tr><th>Plan</th><th>Escenario</th><th>Fecha</th><th>Tipo</th><th>Resultado</th></tr></thead>
        <tbody>
          ${tests.map(test => `
            <tr>
              <td>${test.planCode} - ${test.planName}</td>
              <td>${test.scenario}</td>
              <td>${test.date}</td>
              <td>${test.type}</td>
              <td><span class="badge ${test.resultClass}">${test.result}</span></td>
            </tr>
          `).join('') || '<tr><td colspan="5" class="text-center color-muted">Sin pruebas asociadas.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function clearRIALevState() {
  const title = document.getElementById('ria-lev-title');
  const ficha = document.getElementById('ria-lev-ficha');
  if (title) title.innerHTML = '<i class="bi bi-shield-exclamation"></i> Levantamiento RIA';
  if (ficha) ficha.innerHTML = '<p class="color-muted fs-12 m-0">Seleccione un proceso para cargar la ficha.</p>';
  setInputValue('ria-lev-target-id-hidden', '');
  setInputValue('ria-lev-assessment-id', '');
  setInputValue('ria-lev-notes', '');
  setInputValue('ria-lev-residual-note', '');
  setInputValue('ria-approval-owner-name', '');
  setInputValue('ria-approval-owner-date', '');
  setInputValue('ria-approval-cont-name', '');
  setInputValue('ria-approval-cont-date', '');
  setInputValue('ria-approval-risk-name', '');
  setInputValue('ria-approval-risk-date', '');
  AppState.riaModalDraft = null;
  renderRIALevDiscriminationTable();
  renderRIALevMatrixTable();
  renderRIALevTests(null);
  setRIALevSaveButtonsState(false);
}

function prefillRIALevFromProcess(processId) {
  const process = (BCMSDataStore.entities.processes || []).find(p => !p.isDeleted && Number(p.id) === Number(processId));
  if (!process) return;

  const latestAssessment = getLatestRIAAssessment(process.id);
  const assessmentItems = latestAssessment ? getRIAItemsByAssessment(latestAssessment.id) : [];
  const legacyRows = !latestAssessment ? getRIAProcessRisks(process.id) : [];
  const bia = evaluateBIAForRIA(process);
  const rowsSource = assessmentItems.length > 0 ? assessmentItems : legacyRows;
  const rows = rowsSource.length > 0
    ? rowsSource.map((row, index) => buildRIALevRow(row, index + 1, process.name))
    : [buildRIALevRow({ impactType: 'Procesos', maxImpact24h: 3, probability: 3, controlEvaluation: 3, beta: 1 }, 1, process.name)];

  const discriminationStored = latestAssessment ? ((() => {
    const header = (BCMSDataStore.entities.riaDiscriminations || []).find(item => !item.isDeleted && Number(item.riaAssessmentId) === Number(latestAssessment.id));
    if (!header) return [];
    return (BCMSDataStore.entities.riaDiscriminationItems || [])
      .filter(item => !item.isDeleted && Number(item.discriminationId) === Number(header.id))
      .map(item => ({ criterion: item.criterion || '-', result: String(item.result || '').toUpperCase() === 'SI' ? 'SI' : 'NO', evidence: item.evidence || '' }));
  })()) : [];

  AppState.riaModalDraft = {
    processId: process.id,
    assessmentId: latestAssessment?.id || 0,
    rows,
    discriminationItems: discriminationStored.length > 0 ? discriminationStored : getRIALevDiscriminationDefaults(process, bia, rows)
  };

  const title = document.getElementById('ria-lev-title');
  const ficha = document.getElementById('ria-lev-ficha');
  if (title) title.innerHTML = `<i class="bi bi-shield-exclamation"></i> Levantamiento RIA - ${process.name}`;
  if (ficha) {
    const deps = getBIADependenciesForTarget({ targetType: 'PROCESS', targetId: process.id });
    ficha.innerHTML = `
      <div><span>Código</span><strong>${process.code || '-'}</strong></div>
      <div><span>Proceso</span><strong>${process.name || '-'}</strong></div>
      <div><span>Responsable</span><strong>${process.ownerName || process.owner || '-'}</strong></div>
      <div><span>Criticidad</span><strong>${BCMSDataStore.api.getLookupLabel('businessCriticality', process.businessCriticality) || process.businessCriticality || '-'}</strong></div>
      <div><span>Categoría</span><strong>${process.processCategory || '-'}</strong></div>
      <div><span>Dependencias</span><strong>${deps.length}</strong></div>
      <div><span>RTO</span><strong>${typeof process.targetRtoMinutes === 'number' ? formatMinutesToTime(process.targetRtoMinutes) : '-'}</strong></div>
      <div><span>RPO</span><strong>${typeof process.targetRpoMinutes === 'number' ? formatMinutesToTime(process.targetRpoMinutes) : '-'}</strong></div>
      <div><span>MTPD</span><strong>${typeof process.mtpdMinutes === 'number' ? formatMinutesToTime(process.mtpdMinutes) : '-'}</strong></div>
      <div><span>Estado RIA</span><strong>${getRIAAssessmentStatusInfo(latestAssessment, !latestAssessment && legacyRows.length > 0, bia.triggered).label}</strong></div>
    `;
  }

  setInputValue('ria-lev-target-id-hidden', String(process.id));
  setInputValue('ria-lev-assessment-id', latestAssessment ? String(latestAssessment.id) : '');
  setInputValue('ria-lev-notes', latestAssessment?.notes || '');
  setInputValue('ria-lev-residual-note', latestAssessment?.globalResidualNote || '');

  const approvalRows = latestAssessment
    ? (BCMSDataStore.entities.riaAssessmentApprovals || []).filter(item => !item.isDeleted && Number(item.assessmentId) === Number(latestAssessment.id))
    : getRIAApprovalData(process, { ownerName: process.ownerName || process.owner, updatedAt: process.updatedAt || process.createdAt || new Date().toISOString(), createdAt: process.createdAt || new Date().toISOString() }).map(item => ({ role: item.role, name: item.name, date: item.date }));
  const approvalMap = {};
  approvalRows.forEach(item => { approvalMap[item.role] = item; });
  const defaultDate = normalizeDateInput(latestAssessment?.assessmentDate || new Date().toISOString().slice(0, 10));
  setInputValue('ria-approval-owner-name', approvalMap['Responsable de Proceso']?.name || '');
  setInputValue('ria-approval-owner-date', normalizeDateInput(approvalMap['Responsable de Proceso']?.date) || defaultDate);
  setInputValue('ria-approval-cont-name', approvalMap['Jefe de Continuidad de Negocio']?.name || '');
  setInputValue('ria-approval-cont-date', normalizeDateInput(approvalMap['Jefe de Continuidad de Negocio']?.date) || defaultDate);
  setInputValue('ria-approval-risk-name', approvalMap['Jefe de Departamento de Riesgo Operacional']?.name || '');
  setInputValue('ria-approval-risk-date', normalizeDateInput(approvalMap['Jefe de Departamento de Riesgo Operacional']?.date) || defaultDate);

  renderRIALevDiscriminationTable();
  renderRIALevMatrixTable();
  renderRIALevTests(process.id);
  setRIALevSaveButtonsState(true);
}

function openRIALevantamientoModal(processId = null) {
  const modal = document.getElementById('modal-ria-levantamiento');
  if (!modal) return;
  const selected = Number(processId || AppState.selectedRIAProcessId || 0);
  renderRIALevTargetSelect(selected || null);
  if (selected) {
    const targetInput = document.getElementById('ria-lev-target-id');
    if (targetInput) targetInput.value = String(selected);
    prefillRIALevFromProcess(selected);
  } else {
    clearRIALevState();
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeRIALevantamientoModal() {
  const modal = document.getElementById('modal-ria-levantamiento');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function onRIALevTargetEntityChange() {
  const processId = Number(document.getElementById('ria-lev-target-id')?.value || 0);
  if (!processId) {
    clearRIALevState();
    return;
  }
  prefillRIALevFromProcess(processId);
}

function updateRIALevDiscriminationField(index, field, value) {
  if (!AppState.riaModalDraft || !Array.isArray(AppState.riaModalDraft.discriminationItems) || !AppState.riaModalDraft.discriminationItems[index]) return;
  AppState.riaModalDraft.discriminationItems[index][field] = field === 'result'
    ? (String(value || '').toUpperCase() === 'SI' ? 'SI' : 'NO')
    : String(value || '').trim();
}

function updateRIALevRowField(index, field, value) {
  if (!AppState.riaModalDraft || !Array.isArray(AppState.riaModalDraft.rows) || !AppState.riaModalDraft.rows[index]) return;
  const processName = AppState.riaModalDraft.rows[index]?.activityText || '';
  const row = { ...AppState.riaModalDraft.rows[index] };
  row[field] = ['maxImpact24h', 'probability', 'controlEvaluation', 'beta'].includes(field)
    ? Number(value)
    : String(value || '').trim();
  AppState.riaModalDraft.rows[index] = buildRIALevRow(row, index + 1, processName);
  renderRIALevMatrixTable();
}

function addRIALevMatrixRow() {
  if (!AppState.riaModalDraft || !AppState.riaModalDraft.processId) {
    showToast('Seleccione un proceso antes de agregar escenario', 'warning');
    return;
  }
  const process = (BCMSDataStore.entities.processes || []).find(p => Number(p.id) === Number(AppState.riaModalDraft.processId));
  const nextItem = (AppState.riaModalDraft.rows || []).length + 1;
  AppState.riaModalDraft.rows.push(buildRIALevRow({ impactType: 'Procesos', maxImpact24h: 3, probability: 3, controlEvaluation: 3, beta: 1 }, nextItem, process?.name || ''));
  renderRIALevMatrixTable();
}

function removeRIALevMatrixRow(index) {
  if (!AppState.riaModalDraft || !Array.isArray(AppState.riaModalDraft.rows) || !AppState.riaModalDraft.rows[index]) return;
  if (AppState.riaModalDraft.rows.length === 1) {
    showToast('Debe existir al menos un escenario en la matriz RIA', 'warning');
    return;
  }
  AppState.riaModalDraft.rows.splice(index, 1);
  AppState.riaModalDraft.rows = AppState.riaModalDraft.rows.map((row, idx) => buildRIALevRow({ ...row, itemNo: idx + 1 }, idx + 1, row.activityText || ''));
  renderRIALevMatrixTable();
}

function saveRIALevantamiento(markCompleted = false) {
  const processId = Number(document.getElementById('ria-lev-target-id')?.value || document.getElementById('ria-lev-target-id-hidden')?.value || 0);
  const process = (BCMSDataStore.entities.processes || []).find(p => !p.isDeleted && Number(p.id) === Number(processId));
  if (!process) {
    showToast('Debe seleccionar un proceso RIA antes de guardar', 'warning');
    return;
  }
  if (!AppState.riaModalDraft || !Array.isArray(AppState.riaModalDraft.rows) || AppState.riaModalDraft.rows.length === 0) {
    showToast('Debe registrar al menos un escenario en la matriz RIA', 'warning');
    return;
  }

  if (!BCMSDataStore.entities.riaAssessments) BCMSDataStore.entities.riaAssessments = [];
  if (!BCMSDataStore.entities.riaItems) BCMSDataStore.entities.riaItems = [];
  if (!BCMSDataStore.entities.riaDiscriminations) BCMSDataStore.entities.riaDiscriminations = [];
  if (!BCMSDataStore.entities.riaDiscriminationItems) BCMSDataStore.entities.riaDiscriminationItems = [];
  if (!BCMSDataStore.entities.riaAssessmentApprovals) BCMSDataStore.entities.riaAssessmentApprovals = [];

  const currentUser = getActiveSessionUserName();
  const nowIso = new Date().toISOString();
  const status = markCompleted ? 'COMPLETADO' : 'BORRADOR';
  const latestBIA = getLatestBIAAssessment('PROCESS', process.id);
  const assessmentIdField = document.getElementById('ria-lev-assessment-id');
  const existingId = Number(assessmentIdField?.value || 0);

  const assessmentPayload = {
    targetProcessType: 'PROCESS',
    targetProcessId: process.id,
    processId: process.id,
    idBia: latestBIA?.id || null,
    assessmentDate: new Date().toISOString().slice(0, 10),
    status,
    notes: getInputValue('ria-lev-notes'),
    globalResidualNote: getInputValue('ria-lev-residual-note'),
    updatedBy: currentUser,
    deletedAt: null,
    deletedBy: null,
    isDeleted: false
  };

  const savedAssessment = existingId > 0
    ? BCMSDataStore.api.update('riaAssessments', existingId, assessmentPayload)
    : BCMSDataStore.api.create('riaAssessments', {
      ...assessmentPayload,
      riaCode: `RIA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(process.id).padStart(3, '0')}`,
      createdBy: currentUser
    });

  if (!savedAssessment) {
    showToast('No fue posible guardar el levantamiento RIA', 'danger');
    return;
  }

  setInputValue('ria-lev-assessment-id', String(savedAssessment.id));
  AppState.riaModalDraft.assessmentId = Number(savedAssessment.id);

  (BCMSDataStore.entities.riaItems || []).forEach(item => {
    if (!item.isDeleted && Number(item.riaAssessmentId) === Number(savedAssessment.id)) {
      item.isDeleted = true;
      item.deletedAt = nowIso;
      item.deletedBy = currentUser;
      item.updatedAt = nowIso;
      item.updatedBy = currentUser;
    }
  });

  AppState.riaModalDraft.rows.forEach((row, index) => {
    const normalized = buildRIALevRow({ ...row, itemNo: index + 1 }, index + 1, process.name);
    BCMSDataStore.entities.riaItems.push({
      id: Math.max(0, ...(BCMSDataStore.entities.riaItems || []).map(item => Number(item.id) || 0)) + 1,
      riaAssessmentId: Number(savedAssessment.id),
      itemNo: index + 1,
      activityText: normalized.activityText,
      lossRiskText: normalized.lossRiskText,
      riskFactorText: normalized.riskFactorText,
      riskFactorSpecificText: normalized.riskFactorSpecificText,
      controlsText: normalized.controlsText,
      impactType: normalized.impactType,
      maxImpact24h: normalized.maxImpact24h,
      probability: normalized.probability,
      controlEvaluation: normalized.controlEvaluation,
      impactNum: normalized.impactNum,
      probabilityNum: normalized.probabilityNum,
      controlNum: normalized.controlNum,
      ri: normalized.ri,
      rr: normalized.rr,
      inherentBand: normalized.inherentBand,
      residualBand: normalized.residualBand,
      beta: normalized.beta,
      residualWithBeta: normalized.residualWithBeta,
      residualFinalBand: normalized.residualFinalBand,
      responseText: normalized.responseText,
      observations: normalized.observations,
      contingencyDesc: normalized.contingencyDesc,
      linkedRiskId: normalized.linkedRiskId,
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
      createdBy: currentUser,
      updatedBy: currentUser,
      deletedBy: null,
      isDeleted: false
    });
  });

  let discriminationHeader = (BCMSDataStore.entities.riaDiscriminations || []).find(item => !item.isDeleted && Number(item.riaAssessmentId) === Number(savedAssessment.id));
  if (!discriminationHeader) {
    discriminationHeader = {
      id: Math.max(0, ...(BCMSDataStore.entities.riaDiscriminations || []).map(item => Number(item.id) || 0)) + 1,
      riaAssessmentId: Number(savedAssessment.id),
      title: 'Ficha de discriminacion RIA',
      notes: '',
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
      createdBy: currentUser,
      updatedBy: currentUser,
      deletedBy: null,
      isDeleted: false
    };
    BCMSDataStore.entities.riaDiscriminations.push(discriminationHeader);
  }

  (BCMSDataStore.entities.riaDiscriminationItems || []).forEach(item => {
    if (!item.isDeleted && Number(item.discriminationId) === Number(discriminationHeader.id)) {
      item.isDeleted = true;
      item.deletedAt = nowIso;
      item.deletedBy = currentUser;
      item.updatedAt = nowIso;
      item.updatedBy = currentUser;
    }
  });

  AppState.riaModalDraft.discriminationItems.forEach(item => {
    BCMSDataStore.entities.riaDiscriminationItems.push({
      id: Math.max(0, ...(BCMSDataStore.entities.riaDiscriminationItems || []).map(row => Number(row.id) || 0)) + 1,
      discriminationId: Number(discriminationHeader.id),
      criterion: item.criterion || '',
      result: String(item.result || '').toUpperCase() === 'SI' ? 'SI' : 'NO',
      evidence: item.evidence || '',
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
      createdBy: currentUser,
      updatedBy: currentUser,
      deletedBy: null,
      isDeleted: false
    });
  });

  (BCMSDataStore.entities.riaAssessmentApprovals || []).forEach(item => {
    if (!item.isDeleted && Number(item.assessmentId) === Number(savedAssessment.id)) {
      item.isDeleted = true;
      item.deletedAt = nowIso;
      item.deletedBy = currentUser;
      item.updatedAt = nowIso;
      item.updatedBy = currentUser;
    }
  });

  [
    { role: 'Responsable de Proceso', name: getInputValue('ria-approval-owner-name'), date: getInputValue('ria-approval-owner-date') },
    { role: 'Jefe de Continuidad de Negocio', name: getInputValue('ria-approval-cont-name'), date: getInputValue('ria-approval-cont-date') },
    { role: 'Jefe de Departamento de Riesgo Operacional', name: getInputValue('ria-approval-risk-name'), date: getInputValue('ria-approval-risk-date') }
  ].forEach(row => {
    BCMSDataStore.entities.riaAssessmentApprovals.push({
      id: Math.max(0, ...(BCMSDataStore.entities.riaAssessmentApprovals || []).map(item => Number(item.id) || 0)) + 1,
      assessmentId: Number(savedAssessment.id),
      role: row.role,
      name: row.name || '-',
      date: row.date || nowIso.slice(0, 10),
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
      createdBy: currentUser,
      updatedBy: currentUser,
      deletedBy: null,
      isDeleted: false
    });
  });

  AppState.selectedRIAProcessId = process.id;
  BCMSDataStore.meta.lastUpdated = nowIso;
  renderRIAKPIs();
  renderRIATable();
  showDetalleRIA(process.id);
  showToast(markCompleted ? 'Levantamiento RIA guardado y cerrado' : 'Borrador RIA guardado', 'success');
  if (markCompleted) closeRIALevantamientoModal();
}

function goToDMEntityFromRIA() {
  const processId = Number(document.getElementById('ria-lev-target-id')?.value || document.getElementById('ria-lev-target-id-hidden')?.value || 0);
  if (!processId) {
    showToast('Seleccione un proceso antes de ir a Datos Maestros', 'warning');
    return;
  }
  closeRIALevantamientoModal();
  showView('datos-maestros');
  if (typeof showDMGroup === 'function') showDMGroup('orgproc');
  if (typeof showDMSubtab === 'function') showDMSubtab('orgproc', 'processes');
  if (typeof toggleEditForm === 'function') toggleEditForm('processes', `proc-${processId}`);
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

  const criticalScope = processes.filter(p => p.businessCriticality === 'CRITICAL' || p.businessCriticality === 'HIGH');

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="fs-12 bia-resumen-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Proceso/Servicio</th>
            <th>Criticidad</th>
            <th>RTO (h)</th>
            <th>MTPD (h)</th>
            <th>Margen (h)</th>
            <th>Cumplimiento</th>
          </tr>
        </thead>
        <tbody>
          ${criticalScope.map(p => {
            const rto = p.rto || (p.targetRtoMinutes ? p.targetRtoMinutes / 60 : null);
            const mtpd = p.mtpdMinutes ? p.mtpdMinutes / 60 : (p.maximumTolerableDowntimeMinutes ? p.maximumTolerableDowntimeMinutes / 60 : null);
            const margin = (rto !== null && mtpd !== null) ? Math.round((mtpd - rto) * 10) / 10 : null;
            const isCompliant = margin !== null ? margin >= 0 : null;
            const critBadge = p.businessCriticality === 'CRITICAL' ? 'badge-danger' : 'badge-warning';
            const rowClass = isCompliant === false ? 'bia-row-nocumple' : isCompliant === true ? 'bia-row-cumple' : 'bia-row-riesgo';
            const marginClass = margin !== null && margin < 0 ? 'margen-negativo' : 'margen-positivo';

            return `<tr class="${rowClass}">
              <td class="fw-600">${p.code}</td>
              <td>${p.name}</td>
              <td><span class="badge ${critBadge}">${p.businessCriticality}</span></td>
              <td class="text-center">${rto !== null ? rto : '-'}</td>
              <td class="text-center">${mtpd !== null ? mtpd : '-'}</td>
              <td class="text-center ${marginClass}">${margin !== null ? (margin >= 0 ? '+' : '') + margin : '-'}</td>
              <td class="text-center">${isCompliant === null ? '-' : isCompliant ? '<span class="badge badge-success">Cumple</span>' : '<span class="badge badge-danger">No cumple</span>'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
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
  renderKPIGrid(container, [
    { label: 'Total planes BCP', value: plans.length, icon: 'bi-journal-check', color: 'primary', subtitle: 'Catálogo operativo' },
    { label: 'Vigentes', value: active, icon: 'bi-check-circle', color: 'secondary', subtitle: 'Estado activo' },
    { label: 'Probados', value: testedBCP, icon: 'bi-clipboard-check', color: 'info', subtitle: 'Con evidencia reciente' },
    { label: 'RTO promedio', value: `${avgRto}h`, icon: 'bi-clock-history', color: 'warning', subtitle: 'Objetivo agregado' },
    { label: 'Requieren prueba', value: plans.length - testedBCP, icon: 'bi-exclamation-circle', color: 'danger', subtitle: 'Pendientes por ejecutar' }
  ]);
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

  renderKPIGrid(container, [
    { label: 'Activos', value: active, icon: 'bi-exclamation-diamond', color: 'danger', subtitle: 'Incidentes en gestión' },
    { label: 'Críticos', value: critical, icon: 'bi-exclamation-triangle', color: 'danger', subtitle: 'Severidad alta' },
    { label: 'MTTR (h)', value: avgResolve, icon: 'bi-clock', color: 'warning', subtitle: 'Tiempo medio de resolución' },
    { label: 'Resueltos 30d', value: resolved30d, icon: 'bi-check-circle', color: 'secondary', subtitle: 'Tendencia reciente' },
    { label: 'Escalados', value: escalated, icon: 'bi-arrow-up-right', color: 'info', subtitle: 'Con impacto transversal' }
  ]);
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
  const incidents = [...(BCMSDataStore.entities.incidents || [])].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  if (!AppState.selectedIncidente && incidents.length > 0) {
    AppState.selectedIncidente = incidents[0].id;
  }

  container.innerHTML = incidents.map(inc => {
    const sevColor = inc.severity === 'HIGH' ? '#ef4444' : inc.severity === 'MEDIUM' ? '#f59e0b' : '#6366f1';
    const statusBadge = inc.status === 'CLOSED' ? 'badge-success' : inc.status === 'RESOLVED' ? 'badge-success' : inc.status === 'ESCALATED' ? 'badge-danger' : inc.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info';
    const statusLabel = inc.status === 'CLOSED' ? 'Cerrado' : inc.status === 'RESOLVED' ? 'Resuelto' : inc.status === 'ESCALATED' ? 'Escalado' : inc.status === 'IN_PROGRESS' ? 'En Curso' : 'Abierto';
    const isSelected = AppState.selectedIncidente === inc.id;
    return `<div class="incidente-list-item ${isSelected ? 'selected' : ''}" style="--severity-color:${sevColor}" data-incident-id="${inc.id}" onclick="selectIncidente(${inc.id})">
      <div class="d-flex jc-between ai-center gap-8">
        <div>
          <div class="fw-600 fs-12">${inc.code}</div>
          <div class="fs-11 color-muted mt-4">${inc.title.substring(0, 48)}${inc.title.length > 48 ? '...' : ''}</div>
        </div>
        <span class="badge ${statusBadge} fs-10">${statusLabel}</span>
      </div>
    </div>`;
  }).join('');

  if (AppState.selectedIncidente) {
    selectIncidente(AppState.selectedIncidente);
  }
}

function selectIncidente(id) {
  const panel = document.getElementById('incidente-detalle');
  if (!panel) return;
  AppState.selectedIncidente = id;
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
    <div class="mb-16"><p class="fs-12 color-secondary incident-description">${inc.description || ''}</p></div>
    <div class="mb-16">
      <h4 class="fs-12 fw-600 mb-8">Workflow</h4>
      <div class="incident-workflow">
        ${workflowSteps.map((step, i) => {
          const isActive = i <= currentStepIdx;
          const isCurrent = i === currentStepIdx;
          return `<div class="incident-workflow-step">
            <div class="incident-workflow-bar ${isActive ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}"></div>
            <div class="fs-10 mt-4 ${isActive ? 'fw-600' : 'color-muted'}">${stepLabels[step]}</div>
          </div>`;
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
  document.querySelectorAll('#incidentes-lista .incidente-list-item').forEach(item => {
    item.classList.toggle('selected', Number(item.dataset.incidentId) === id);
  });
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
  renderVistaIntegradaKPIs();
  renderVistaIntegradaContinuidad();
  renderVistaIntegradaCiber();
  showIntegradaTab(AppState.integradaTab || 'continuidad');
}

function renderVistaIntegradaKPIs() {
  const container = document.getElementById('integrada-kpis-container');
  if (!container) return;

  const processes = BCMSDataStore.api
    .getAll('processes')
    .filter(process => !process.isDeleted && ['CRITICAL', 'HIGH'].includes(process.businessCriticality));
  const risks = BCMSDataStore.api
    .getAll('risks')
    .filter(risk => !risk.isDeleted);
  const openRisks = risks.filter(risk => risk.status !== 'CLOSED');
  const continuityPlans = BCMSDataStore.api
    .getAll('continuityPlans')
    .filter(plan => !plan.isDeleted && ['BCP', 'DRP'].includes(plan.planType) && plan.status === 'ACTIVE');
  const tests = BCMSDataStore.api.getAll('planTests');
  const testedPlanIds = new Set((tests || []).map(test => test.planId));
  const testedPlans = continuityPlans.filter(plan => testedPlanIds.has(plan.id));
  const mappedProcesses = processes.filter(process =>
    continuityPlans.some(plan => Number(plan.targetProcessId) === process.id)
  ).length;
  const traceabilityCoverage = processes.length > 0 ? Math.round((mappedProcesses / processes.length) * 100) : 0;

  renderKPIGrid(container, [
    {
      label: 'Procesos foco',
      value: processes.length,
      subtitle: 'Criticidad alta y crítica',
      icon: 'bi-diagram-3',
      color: 'primary'
    },
    {
      label: 'Riesgos activos',
      value: openRisks.length,
      subtitle: 'Continuidad + ciber',
      icon: 'bi-exclamation-octagon',
      color: openRisks.length > 0 ? 'warning' : 'secondary'
    },
    {
      label: 'Planes vigentes',
      value: continuityPlans.length,
      subtitle: 'BCP y DRP activos',
      icon: 'bi-journal-check',
      color: 'info'
    },
    {
      label: 'Planes probados',
      value: testedPlans.length,
      subtitle: 'Con evidencia en pruebas',
      icon: 'bi-clipboard-check',
      color: testedPlans.length > 0 ? 'secondary' : 'warning'
    },
    {
      label: 'Cobertura trazabilidad',
      value: `${traceabilityCoverage}%`,
      subtitle: 'Procesos con plan vinculado',
      icon: 'bi-link-45deg',
      color: traceabilityCoverage >= 80 ? 'secondary' : traceabilityCoverage >= 60 ? 'warning' : 'danger'
    }
  ]);
}

function getVistaIntegradaContinuidadRows() {
  const processes = BCMSDataStore.api
    .getAll('processes')
    .filter(process => !process.isDeleted && ['CRITICAL', 'HIGH'].includes(process.businessCriticality))
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.businessCriticality] ?? 9) - (order[b.businessCriticality] ?? 9);
    });

  const risks = BCMSDataStore.api.getAll('risks').filter(risk =>
    !risk.isDeleted &&
    risk.riskDomain !== 'CYBER' &&
    !String(risk.code || '').startsWith('RCIBER')
  );
  const plans = BCMSDataStore.api
    .getAll('continuityPlans')
    .filter(plan => !plan.isDeleted && ['BCP', 'DRP'].includes(plan.planType) && plan.status === 'ACTIVE');
  const tests = BCMSDataStore.api.getAll('planTests');

  const isDateLike = value => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
  const getRiskClass = score => {
    if (score >= 15) return 'badge-danger';
    if (score >= 9) return 'badge-warning';
    if (score >= 4) return 'badge-info';
    return 'badge-success';
  };

  return processes.map(process => {
    const processRisks = risks.filter(risk => Number(risk.targetProcessId) === process.id);
    const openRisks = processRisks.filter(risk => risk.status !== 'CLOSED');
    const maxResidual = processRisks.reduce((maxScore, risk) => {
      const score = Number(risk.residualScore ?? risk.inherentScore ?? 0);
      return Math.max(maxScore, score);
    }, 0);

    const bcpPlan = plans.find(plan => plan.planType === 'BCP' && Number(plan.targetProcessId) === process.id);
    const drpPlan = plans.find(plan => plan.planType === 'DRP' && Number(plan.targetProcessId) === process.id);
    const planIds = [bcpPlan?.id, drpPlan?.id].filter(Boolean);
    const planTests = tests.filter(test => planIds.includes(test.planId));

    const dateCandidates = [];
    planTests.forEach(test => {
      if (isDateLike(test.testDate)) dateCandidates.push(test.testDate);
    });
    [bcpPlan, drpPlan].forEach(plan => {
      if (plan && isDateLike(plan.lastTest)) dateCandidates.push(plan.lastTest);
    });
    const sortedDates = dateCandidates.sort((a, b) => new Date(b) - new Date(a));
    const fallbackDate = [bcpPlan?.lastTest, drpPlan?.lastTest].find(value => value);
    const lastTestRaw = sortedDates[0] || fallbackDate || null;
    const lastTestLabel = lastTestRaw
      ? (isDateLike(lastTestRaw) ? formatDate(lastTestRaw) : lastTestRaw)
      : 'Sin evidencia';

    let integratedState = { label: 'Sin plan', className: 'badge-danger' };
    if ((bcpPlan || drpPlan) && planTests.length > 0 && openRisks.length <= 1) {
      integratedState = { label: 'Operativo', className: 'badge-success' };
    } else if (bcpPlan || drpPlan) {
      integratedState = openRisks.length > 0
        ? { label: 'Atención', className: 'badge-warning' }
        : { label: 'En despliegue', className: 'badge-info' };
    }

    return {
      process,
      openRiskCount: openRisks.length,
      totalRiskCount: processRisks.length,
      maxResidual,
      residualClass: getRiskClass(maxResidual),
      bcpPlan,
      drpPlan,
      planTestsCount: planTests.length,
      lastTestRaw,
      lastTestLabel,
      integratedState
    };
  });
}

function renderVistaIntegradaContinuidad() {
  const flowContainer = document.getElementById('integrada-flujo');
  const tbody = document.getElementById('integrada-continuidad-tbody');
  const alertsContainer = document.getElementById('integrada-alertas');
  if (!flowContainer || !tbody || !alertsContainer) return;

  const rows = getVistaIntegradaContinuidadRows();
  const total = rows.length || 1;
  const withRiskAssessment = rows.filter(row => row.totalRiskCount > 0).length;
  const withBCP = rows.filter(row => row.bcpPlan).length;
  const withDRP = rows.filter(row => row.drpPlan).length;
  const withTests = rows.filter(row => row.lastTestRaw).length;

  const getFlowClass = value => {
    const pct = Math.round((value / total) * 100);
    if (pct >= 80) return 'integrada-flow-good';
    if (pct >= 55) return 'integrada-flow-warn';
    return 'integrada-flow-danger';
  };

  const flowItems = [
    { icon: 'bi-diagram-3', label: 'Procesos foco', value: rows.length, detail: 'Alta criticidad' },
    { icon: 'bi-search', label: 'Con evaluación riesgo', value: withRiskAssessment, detail: `${Math.round((withRiskAssessment / total) * 100)}% cobertura` },
    { icon: 'bi-journal-text', label: 'Con BCP', value: withBCP, detail: `${Math.round((withBCP / total) * 100)}% procesos` },
    { icon: 'bi-hdd-rack', label: 'Con DRP', value: withDRP, detail: `${Math.round((withDRP / total) * 100)}% procesos` },
    { icon: 'bi-clipboard-check', label: 'Con evidencia prueba', value: withTests, detail: `${Math.round((withTests / total) * 100)}% procesos` }
  ];

  flowContainer.innerHTML = flowItems.map(item => `
    <div class="integrada-flow-item ${getFlowClass(item.value)}">
      <div class="integrada-flow-icon"><i class="bi ${item.icon}"></i></div>
      <div class="integrada-flow-title">${item.label}</div>
      <div class="integrada-flow-value">${item.value}/${rows.length}</div>
      <div class="integrada-flow-detail">${item.detail}</div>
    </div>
  `).join('');

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay procesos críticos para trazabilidad integrada</td></tr>';
    alertsContainer.innerHTML = '<div class="integrada-alert-empty">Sin alertas de trazabilidad</div>';
    return;
  }

  tbody.innerHTML = rows.map(row => `
    <tr>
      <td>
        <div class="integrada-process-cell">
          <span class="integrada-process-code">${row.process.code}</span>
          <span class="integrada-process-name">${row.process.name}</span>
        </div>
      </td>
      <td><span class="badge ${row.process.businessCriticality === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${BCMSDataStore.api.getLookupLabel('businessCriticality', row.process.businessCriticality) || row.process.businessCriticality}</span></td>
      <td class="text-center">${row.openRiskCount}/${row.totalRiskCount}</td>
      <td class="text-center">${row.maxResidual > 0 ? `<span class="badge ${row.residualClass}">${row.maxResidual}</span>` : '<span class="badge badge-neutral">N/A</span>'}</td>
      <td>${row.bcpPlan ? `<span class="badge badge-success">${row.bcpPlan.code}</span>` : '<span class="badge badge-neutral">Sin BCP</span>'}</td>
      <td>${row.drpPlan ? `<span class="badge badge-info">${row.drpPlan.code}</span>` : '<span class="badge badge-neutral">Sin DRP</span>'}</td>
      <td>${row.lastTestLabel}</td>
      <td><span class="badge ${row.integratedState.className}">${row.integratedState.label}</span></td>
    </tr>
  `).join('');

  const alerts = [];
  const noPlan = rows.filter(row => !row.bcpPlan && !row.drpPlan);
  const criticalResidual = rows.filter(row => row.maxResidual >= 15);
  const noEvidence = rows.filter(row => (row.bcpPlan || row.drpPlan) && !row.lastTestRaw);

  if (noPlan.length > 0) {
    alerts.push({ className: 'integrada-alert-danger', text: `${noPlan.length} proceso(s) críticos sin BCP/DRP vinculado` });
  }
  if (criticalResidual.length > 0) {
    alerts.push({ className: 'integrada-alert-warning', text: `${criticalResidual.length} proceso(s) con riesgo residual crítico (>=15)` });
  }
  if (noEvidence.length > 0) {
    alerts.push({ className: 'integrada-alert-info', text: `${noEvidence.length} proceso(s) con plan pero sin evidencia reciente de prueba` });
  }

  alertsContainer.innerHTML = alerts.length > 0
    ? alerts.map(alert => `<div class="integrada-alert-item ${alert.className}"><i class="bi bi-exclamation-circle"></i> ${alert.text}</div>`).join('')
    : '<div class="integrada-alert-empty"><i class="bi bi-check-circle"></i> Sin alertas críticas de trazabilidad</div>';
}

function renderVistaIntegradaCiber() {
  const statsContainer = document.getElementById('integrada-ciber-stats');
  const tbody = document.getElementById('integrada-ciber-riesgos-tbody');
  const postureContainer = document.getElementById('integrada-ciber-postura');
  if (!statsContainer || !tbody || !postureContainer) return;

  const processMap = new Map(
    BCMSDataStore.api.getAll('processes').map(process => [process.id, process])
  );
  const userMap = new Map(
    BCMSDataStore.api.getAll('users').map(user => [user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim()])
  );

  const cyberRisks = BCMSDataStore.api
    .getAll('risks')
    .filter(risk => !risk.isDeleted && (risk.riskDomain === 'CYBER' || String(risk.code || '').startsWith('RCIBER')));
  const openCyberRisks = cyberRisks.filter(risk => risk.status !== 'CLOSED');
  const criticalCyberRisks = cyberRisks.filter(risk => {
    const cvss = Number(risk.cvssScore || 0);
    const residual = Number(risk.residualScore || risk.inherentScore || 0);
    return cvss >= 9 || residual >= 15;
  });

  const controls = BCMSDataStore.api.getAll('controls').filter(control => !control.isDeleted);
  const implementedControls = controls.filter(control => ['IMPLEMENTED', 'ACTIVE'].includes(control.status)).length;
  const coverage = controls.length > 0 ? Math.round((implementedControls / controls.length) * 100) : 0;
  const withOwner = openCyberRisks.filter(risk => risk.ownerUserId || risk.ownerName).length;

  renderKPIGrid(statsContainer, [
    { label: 'Riesgos ciber activos', value: openCyberRisks.length, subtitle: 'Monitoreados y en tratamiento', icon: 'bi-shield-exclamation', color: 'danger' },
    { label: 'Riesgos críticos', value: criticalCyberRisks.length, subtitle: 'CVSS>=9 o residual>=15', icon: 'bi-exclamation-octagon', color: criticalCyberRisks.length > 0 ? 'warning' : 'secondary' },
    { label: 'Controles implementados', value: implementedControls, subtitle: `Sobre ${controls.length} controles`, icon: 'bi-check2-square', color: 'secondary' },
    { label: 'Cobertura controles', value: `${coverage}%`, subtitle: `${withOwner}/${openCyberRisks.length || 0} riesgos con responsable`, icon: 'bi-shield-check', color: coverage >= 80 ? 'secondary' : coverage >= 60 ? 'warning' : 'danger' }
  ]);

  if (cyberRisks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay riesgos ciber registrados</td></tr>';
  } else {
    const sortedRisks = [...cyberRisks].sort((a, b) => {
      const scoreA = Number(a.cvssScore ?? a.residualScore ?? a.inherentScore ?? 0);
      const scoreB = Number(b.cvssScore ?? b.residualScore ?? b.inherentScore ?? 0);
      return scoreB - scoreA;
    });

    tbody.innerHTML = sortedRisks.slice(0, 10).map(risk => {
      const score = Number(risk.cvssScore ?? risk.residualScore ?? risk.inherentScore ?? 0);
      const scoreLabel = Number.isFinite(score) ? (risk.cvssScore ? score.toFixed(1) : `${score}`) : 'N/A';
      const scoreClass = score >= 15 || Number(risk.cvssScore || 0) >= 9
        ? 'badge-danger'
        : score >= 9 || Number(risk.cvssScore || 0) >= 7
          ? 'badge-warning'
          : 'badge-info';
      const treatmentLabel = BCMSDataStore.api.getLookupLabel('treatmentType', risk.treatmentType) || risk.treatmentType || 'N/D';
      const statusLabel = BCMSDataStore.api.getLookupLabel('riskStatus', risk.status) || risk.status || 'N/D';
      const statusClass = risk.status === 'TREATING' ? 'badge-warning' : risk.status === 'MONITORED' ? 'badge-info' : 'badge-success';
      const process = processMap.get(Number(risk.targetProcessId));
      const targetName = risk.targetAsset || (process ? process.name : 'Cobertura global');
      const controlCount = Array.isArray(risk.controls) ? risk.controls.length : 0;

      return `
        <tr>
          <td><strong>${risk.code}</strong></td>
          <td>${targetName}</td>
          <td><span class="badge ${scoreClass}">${scoreLabel}</span></td>
          <td><span class="badge badge-neutral">${treatmentLabel}</span></td>
          <td><span class="badge ${statusClass}">${statusLabel}</span></td>
          <td class="text-center">${controlCount}</td>
        </tr>
      `;
    }).join('');
  }

  const statusCounts = {
    implemented: controls.filter(control => ['IMPLEMENTED', 'ACTIVE'].includes(control.status)).length,
    partial: controls.filter(control => control.status === 'PARTIAL').length,
    pending: controls.filter(control => ['PLANNED', 'DRAFT', 'IN_PROGRESS'].includes(control.status)).length
  };
  statusCounts.other = Math.max(0, controls.length - statusCounts.implemented - statusCounts.partial - statusCounts.pending);

  const mappedControlCodes = new Set(
    cyberRisks.flatMap(risk => Array.isArray(risk.controls) ? risk.controls : [])
  );
  const mappedControls = controls.filter(control => mappedControlCodes.has(control.code)).length;
  const mappingCoverage = controls.length > 0 ? Math.round((mappedControls / controls.length) * 100) : 0;
  const denominator = controls.length || 1;

  const postureItems = [
    { label: 'Implementados', count: statusCounts.implemented, className: 'integrada-postura-fill-success' },
    { label: 'Parciales', count: statusCounts.partial, className: 'integrada-postura-fill-warning' },
    { label: 'Pendientes', count: statusCounts.pending + statusCounts.other, className: 'integrada-postura-fill-danger' }
  ];

  postureContainer.innerHTML = postureItems.map(item => `
    <div class="integrada-postura-item">
      <div class="integrada-postura-head">
        <span>${item.label}</span>
        <strong>${item.count}</strong>
      </div>
      <div class="integrada-postura-track">
        <div class="integrada-postura-fill ${item.className}" style="width:${Math.round((item.count / denominator) * 100)}%"></div>
      </div>
    </div>
  `).join('') + `
    <div class="integrada-postura-meta">
      <span class="badge badge-info">Controles mapeados a riesgos: ${mappedControls}/${controls.length}</span>
      <span class="badge ${mappingCoverage >= 80 ? 'badge-success' : mappingCoverage >= 60 ? 'badge-warning' : 'badge-danger'}">Cobertura mapeo: ${mappingCoverage}%</span>
    </div>
  `;
}

console.log('functions.js cargado correctamente');


