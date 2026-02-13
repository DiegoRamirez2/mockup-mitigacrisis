/**
 * ============================================================================
 * BCMS v2.0 - Gráficos Chart.js
 * ============================================================================
 * 
 * Configuración y renderizado de gráficos para el dashboard
 * Usa BCMSDataStore para todos los datos
 * 
 * Gráficos:
 *   1. Índice BCMS (Gauge/Doughnut) - chartIndiceBCMS
 *   2. Cobertura de Planes (Doughnut) - chartCobertura
 *   3. Incidentes por Mes (Bar) - chartIncidentes
 *   4. Riesgos por Estado (Doughnut) - chartRiesgos
 */

// Almacén de instancias de gráficos
const Charts = {
  indiceBCMS: null,
  cobertura: null,
  incidentes: null,
  riesgos: null
};

// Paleta de colores consistente con el CSS
const ChartColors = {
  primary: '#0ea5e9',     // --accent-primary
  secondary: '#10b981',   // --accent-secondary  
  warning: '#f59e0b',     // --accent-warning
  danger: '#ef4444',      // --accent-danger
  info: '#3b82f6',
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  neutral: '#94a3b8',
  gradient: ['#0ea5e9', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e']
};

/* ============================================================================
   INICIALIZACIÓN
   ============================================================================ */

/**
 * Inicializa todos los gráficos
 */
function initCharts() {
  console.log('[CHARTS] Inicializando graficos...');
  
  // Configuración global de Chart.js
  Chart.defaults.font.family = "'Poppins', 'Segoe UI', system-ui, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = '#64748b';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 12;
  
  // Inicializar cada gráfico
  initIndiceBCMSChart();
  initCoberturaChart();
  initIncidentesChart();
  initRiesgosChart();
  
  console.log('[CHARTS] Graficos inicializados');
}

/**
 * Actualiza todos los gráficos con datos frescos
 */
function updateCharts() {
  updateIndiceBCMSChart();
  updateCoberturaChart();
  updateIncidentesChart();
  updateRiesgosChart();
}

/* ============================================================================
   1. INDICE BCMS (Gauge con Meta Visual)
   ============================================================================ */

function initIndiceBCMSChart() {
  const ctx = document.getElementById('chartIndiceBCMS');
  if (!ctx) return;
  
  // Calcular indice BCMS basado en multiples factores
  const indexData = calculateBCMSIndex();
  const indice = indexData.score;
  const meta = 85; // Meta organizacional
  
  // Determinar color segun nivel
  const getColor = (value) => {
    if (value >= 80) return ChartColors.secondary; // Verde
    if (value >= 60) return ChartColors.warning;   // Amarillo
    return ChartColors.danger;                      // Rojo
  };
  
  // Determinar estado vs meta
  const vsMetaColor = indice >= meta ? '#10b981' : (indice >= meta * 0.9 ? '#f59e0b' : '#ef4444');
  const diff = indice - meta;
  
  Charts.indiceBCMS = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Indice Actual', 'Restante'],
      datasets: [{
        data: [indice, 100 - indice],
        backgroundColor: [getColor(indice), '#e2e8f0'],
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      rotation: -90,
      circumference: 180,
      animation: false,
      layout: {
        padding: { top: 5, bottom: 5, left: 15, right: 15 }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw: function(chart) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = chartArea.bottom;
        const radius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;
        
        ctx.save();
        
        // Dibujar marcador de META en el arco
        const metaAngle = (-90 + (meta / 100) * 180) * Math.PI / 180;
        
        // Línea de meta más gruesa y visible
        ctx.beginPath();
        ctx.moveTo(centerX + (radius * 0.55) * Math.cos(metaAngle), centerY + (radius * 0.55) * Math.sin(metaAngle));
        ctx.lineTo(centerX + (radius * 1.02) * Math.cos(metaAngle), centerY + (radius * 1.02) * Math.sin(metaAngle));
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Textos centrales
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Valor actual grande
        ctx.font = 'bold 28px Montserrat';
        ctx.fillStyle = getColor(indice);
        ctx.fillText(`${indice}%`, centerX, centerY - 18);
        
        ctx.restore();
      }
    }]
  });
  
  // Renderizar badge de meta en el header
  renderBCMSMetaBadge(meta);
  
  // Renderizar texto de diferencia bajo el gauge
  renderBCMSDiffText(diff, vsMetaColor);
  
  // Renderizar desglose de componentes (barras inline)
  renderBCMSIndexBreakdown(indexData, meta);
}

/**
 * Renderiza el badge de META en el header del card
 */
function renderBCMSMetaBadge(meta) {
  const container = document.getElementById('indiceBCMS-meta-badge');
  if (!container) return;
  
  container.innerHTML = `
    <span class="meta-badge-label">META</span>
    <span class="meta-badge-value">${meta}%</span>
  `;
}

/**
 * Renderiza el texto de diferencia bajo el valor del gauge
 */
function renderBCMSDiffText(diff, color) {
  const container = document.getElementById('indiceBCMS-diff');
  if (!container) return;
  
  const icon = diff >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
  const text = diff >= 0 ? `+${diff}% sobre meta` : `${Math.abs(diff)}% bajo meta`;
  
  container.innerHTML = `
    <i class="bi ${icon}" style="color: ${color};"></i>
    <span style="color: ${color};">${text}</span>
  `;
}

function renderBCMSIndexBreakdown(indexData, meta) {
  const container = document.getElementById('indiceBCMS-legend');
  if (!container) return;
  
  // Preservar el div de diferencia que ya existe
  const diffDiv = container.querySelector('#indiceBCMS-diff');
  
  // Calcular porcentajes de cada componente
  const components = [
    { label: 'BIA', score: indexData.biaScore, max: 30, pct: Math.round(indexData.biaScore/30*100) },
    { label: 'Planes', score: indexData.planScore, max: 25, pct: Math.round(indexData.planScore/25*100) },
    { label: 'Riesgos', score: indexData.riskScore, max: 20, pct: Math.round(indexData.riskScore/20*100) },
    { label: 'Incidentes', score: indexData.incidentScore, max: 15, pct: Math.round(indexData.incidentScore/15*100) }
  ];
  
  // Buscar o crear el contenedor de barras
  let breakdownDiv = container.querySelector('.bcms-breakdown-inline');
  if (!breakdownDiv) {
    breakdownDiv = document.createElement('div');
    breakdownDiv.className = 'bcms-breakdown-inline';
    container.appendChild(breakdownDiv);
  }
  
  breakdownDiv.innerHTML = components.map(c => `
    <div class="breakdown-inline-item">
      <span class="breakdown-inline-label">${c.label}</span>
      <div class="breakdown-inline-bar">
        <div class="breakdown-inline-fill ${c.pct >= 80 ? 'good' : (c.pct >= 60 ? 'warning' : 'bad')}" style="width: ${c.pct}%"></div>
      </div>
      <span class="breakdown-inline-pct ${c.pct >= 80 ? 'good' : (c.pct >= 60 ? 'warning' : 'bad')}">${c.pct}%</span>
    </div>
  `).join('');
}

function calculateBCMSIndex() {
  // Factores del indice con detalle:
  // - Procesos con BIA: 30%
  // - Planes probados: 25%
  // - Riesgos bajo control: 20%
  // - Sin incidentes criticos: 15%
  // - Cumplimiento normativo: 10%
  
  let biaScore = 0;
  let planScore = 0;
  let riskScore = 0;
  let incidentScore = 0;
  let complianceScore = 0;
  
  // Procesos con BIA (asumimos todos tienen BIA por ahora = 100%)
  const processes = BCMSDataStore.api.getAll('processes');
  const criticalProcesses = processes.filter(p => p.businessCriticality === 'CRITICAL' || p.businessCriticality === 'HIGH');
  biaScore = criticalProcesses.length > 0 ? 30 : 15; // 30 pts max
  
  // Planes probados (con prueba en ultimos 12 meses)
  const plans = BCMSDataStore.api.getAll('continuityPlans');
  const tests = BCMSDataStore.api.getAll('planTests');
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const testedPlans = plans.filter(p => {
    const planTests = tests.filter(t => t.planId === p.id && new Date(t.testDate) > oneYearAgo);
    return planTests.length > 0;
  });
  planScore = (testedPlans.length / Math.max(plans.length, 1)) * 25; // 25 pts max
  
  // Riesgos bajo control (residualScore < 10)
  const risks = BCMSDataStore.api.getAll('risks');
  const controlledRisks = risks.filter(r => r.residualScore < 10);
  riskScore = (controlledRisks.length / Math.max(risks.length, 1)) * 20; // 20 pts max
  
  // Sin incidentes criticos abiertos
  const openIncidents = BCMSDataStore.api.filter('incidents', i => i.status === 'OPEN');
  incidentScore = openIncidents.length === 0 ? 15 : Math.max(0, 15 - openIncidents.length * 5); // 15 pts max
  
  // Cumplimiento (asumimos 80% base)
  complianceScore = 8; // 10 pts max
  
  const totalScore = Math.round(biaScore + planScore + riskScore + incidentScore + complianceScore);
  
  return {
    score: Math.min(100, totalScore),
    biaScore: biaScore,
    planScore: planScore,
    riskScore: riskScore,
    incidentScore: incidentScore,
    complianceScore: complianceScore
  };
}

function updateIndiceBCMSChart() {
  if (!Charts.indiceBCMS) return;
  const indexData = calculateBCMSIndex();
  const indice = indexData.score;
  
  const getColor = (value) => {
    if (value >= 80) return ChartColors.secondary;
    if (value >= 60) return ChartColors.warning;
    return ChartColors.danger;
  };
  
  Charts.indiceBCMS.data.datasets[0].data = [indice, 100 - indice];
  Charts.indiceBCMS.data.datasets[0].backgroundColor[0] = getColor(indice);
  Charts.indiceBCMS.update('none');
  renderBCMSIndexLegend(indexData);
}

/* ============================================================================
   2. COBERTURA DE PLANES (Doughnut)
   ============================================================================ */

/* ============================================================================
   2. COBERTURA BIA/BCP/DRP (Triple Mini-Donut)
   ============================================================================ */

function initCoberturaChart() {
  const container = document.getElementById('cobertura-grid');
  if (!container) return;
  
  const data = getCoberturaData();
  
  // Crear HTML para 3 mini-donuts con leyenda de estados debajo
  container.innerHTML = `
    <div class="cobertura-donuts-row">
      <div class="cobertura-donut-item">
        <canvas id="chartBIA" width="100" height="100"></canvas>
        <div class="cobertura-label">BIA</div>
        <div class="cobertura-stat">${data.bia.covered}/${data.bia.total}</div>
      </div>
      <div class="cobertura-donut-item">
        <canvas id="chartBCP" width="100" height="100"></canvas>
        <div class="cobertura-label">BCP</div>
        <div class="cobertura-stat">${data.bcp.covered}/${data.bcp.total}</div>
      </div>
      <div class="cobertura-donut-item">
        <canvas id="chartDRP" width="100" height="100"></canvas>
        <div class="cobertura-label">DRP</div>
        <div class="cobertura-stat">${data.drp.covered}/${data.drp.total}</div>
      </div>
    </div>
    <div class="cobertura-legend">
      <div class="legend-item">
        <span class="legend-dot" style="background: #10b981;"></span>
        <span>≥80% Óptimo</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #f59e0b;"></span>
        <span>60-79% En progreso</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #ef4444;"></span>
        <span>&lt;60% Requiere atención</span>
      </div>
    </div>
  `;
  
  // Crear cada mini-donut
  createCoberturaDonut('chartBIA', data.bia, '#8b5cf6'); // Violeta para BIA
  createCoberturaDonut('chartBCP', data.bcp, '#0ea5e9'); // Azul para BCP
  createCoberturaDonut('chartDRP', data.drp, '#10b981'); // Verde para DRP
}

function createCoberturaDonut(canvasId, data, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  const percentage = data.total > 0 ? Math.round((data.covered / data.total) * 100) : 0;
  const getStatusColor = (pct) => pct >= 80 ? color : (pct >= 60 ? '#f59e0b' : '#ef4444');
  const statusColor = getStatusColor(percentage);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [data.covered, data.total - data.covered],
        backgroundColor: [statusColor, '#e2e8f0'],
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw: function(chart) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 18px Montserrat';
        ctx.fillStyle = statusColor;
        ctx.fillText(`${percentage}%`, centerX, centerY);
        ctx.restore();
      }
    }]
  });
}

function getCoberturaData() {
  // Analizar cobertura de procesos criticos/altos
  const processes = BCMSDataStore.api.getAll('processes');
  const plans = BCMSDataStore.api.getAll('continuityPlans');
  
  // Solo procesos criticos y altos
  const relevantProcesses = processes.filter(p => 
    p.businessCriticality === 'CRITICAL' || p.businessCriticality === 'HIGH'
  );
  
  // Contar BIA
  const withBIA = relevantProcesses.filter(p => p.hasBIA).length;
  
  // Contar BCP
  const withBCP = relevantProcesses.filter(proc => 
    plans.some(p => p.planType === 'BCP' && p.targetProcessId === proc.id)
  ).length;
  
  // Contar DRP
  const withDRP = relevantProcesses.filter(proc => 
    plans.some(p => p.planType === 'DRP' && p.targetProcessId === proc.id)
  ).length;
  
  return {
    bia: { covered: withBIA, total: relevantProcesses.length },
    bcp: { covered: withBCP, total: relevantProcesses.length },
    drp: { covered: withDRP, total: relevantProcesses.length }
  };
}

function updateCoberturaChart() {
  // Para actualizaciones, recreamos los donuts
  initCoberturaChart();
}

/* ============================================================================
   3. INCIDENTES POR SEVERIDAD (Stacked Bar Chart)
   ============================================================================ */

function initIncidentesChart() {
  const ctx = document.getElementById('chartIncidentes');
  if (!ctx) return;
  
  const data = getIncidentesData();
  
  Charts.incidentes = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Critico',
          data: data.critical,
          backgroundColor: ChartColors.critical,
          borderRadius: 4,
          stack: 'stack0'
        },
        {
          label: 'Alto',
          data: data.high,
          backgroundColor: ChartColors.high,
          borderRadius: 4,
          stack: 'stack0'
        },
        {
          label: 'Medio',
          data: data.medium,
          backgroundColor: ChartColors.medium,
          borderRadius: 4,
          stack: 'stack0'
        },
        {
          label: 'Bajo',
          data: data.low,
          backgroundColor: ChartColors.low,
          borderRadius: 4,
          stack: 'stack0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterTitle: function(context) {
              const total = context.reduce((sum, item) => sum + item.raw, 0);
              return `Total: ${total} incidentes`;
            }
          }
        }
      }
    }
  });
}

function getIncidentesData() {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('es-CL', { month: 'short' }));
  }
  
  // Datos de ejemplo por severidad para demostracion
  // En produccion, esto vendria del datastore agrupado por mes y severidad
  return {
    labels: months,
    critical: [0, 0, 1, 0, 0, 0],
    high: [1, 0, 1, 1, 0, 1],
    medium: [1, 2, 1, 1, 2, 1],
    low: [2, 1, 2, 3, 1, 2]
  };
}

function updateIncidentesChart() {
  if (!Charts.incidentes) return;
  const data = getIncidentesData();
  Charts.incidentes.data.labels = data.labels;
  Charts.incidentes.data.datasets[0].data = data.critical;
  Charts.incidentes.data.datasets[1].data = data.high;
  Charts.incidentes.data.datasets[2].data = data.medium;
  Charts.incidentes.data.datasets[3].data = data.low;
  Charts.incidentes.update('none');
}

/* ============================================================================
   4. RIESGOS POR UNIDAD - Multi Donut
   ============================================================================ */

function initRiesgosChart() {
  const container = document.getElementById('riesgos-multi-donut');
  if (!container) return;
  
  renderRiesgosMultiDonut();
}

/**
 * Renderiza multiples mini-donuts de riesgos, una por cada unidad organizacional
 */
function renderRiesgosMultiDonut() {
  const container = document.getElementById('riesgos-multi-donut');
  if (!container) return;

  // Limpiar contenedor manteniendo su clase original
  container.innerHTML = '';

  // Obtener datos de riesgos por unidad
  const risksByUnit = getRiesgosDataByUnit();

  // Crear items directamente en el grid (el contenedor ya tiene la clase riesgos-grid)
  risksByUnit.forEach((unitData, index) => {
    const unitCard = document.createElement('div');
    unitCard.className = 'riesgo-unit-card';
    
    // Contenedor del mini chart
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'riesgo-unit-chart';
    
    const canvas = document.createElement('canvas');
    canvas.id = `mini-risk-chart-${index}`;
    chartWrapper.appendChild(canvas);
    
    // Total en el centro
    const totalEl = document.createElement('div');
    totalEl.className = 'riesgo-unit-total';
    totalEl.textContent = unitData.total;
    chartWrapper.appendChild(totalEl);
    
    // Nombre de la unidad (abreviado)
    const nameEl = document.createElement('div');
    nameEl.className = 'riesgo-unit-name';
    nameEl.textContent = unitData.abbreviation || unitData.unitName;
    nameEl.title = unitData.unitName; // Tooltip para nombres largos
    
    unitCard.appendChild(chartWrapper);
    unitCard.appendChild(nameEl);
    container.appendChild(unitCard);
    
    // Crear mini chart despues de agregarlo al DOM
    setTimeout(() => {
      createMiniRiskChart(canvas, unitData);
    }, 0);
  });

  // Agregar leyenda fuera del scroll container (en el card padre)
  const cardEl = container.closest('.card');
  if (cardEl) {
    // Remover leyenda existente si hay
    const existingLegend = cardEl.querySelector('.riesgos-legend');
    if (existingLegend) existingLegend.remove();
    
    const legend = document.createElement('div');
    legend.className = 'riesgos-legend';
    legend.innerHTML = `
      <div class="riesgos-legend-item">
        <span class="riesgos-legend-color" style="background: ${ChartColors.critical}"></span>
        <span>Crítico</span>
      </div>
      <div class="riesgos-legend-item">
        <span class="riesgos-legend-color" style="background: ${ChartColors.high}"></span>
        <span>Alto</span>
      </div>
      <div class="riesgos-legend-item">
        <span class="riesgos-legend-color" style="background: ${ChartColors.medium}"></span>
        <span>Medio</span>
      </div>
      <div class="riesgos-legend-item">
        <span class="riesgos-legend-color" style="background: ${ChartColors.low}"></span>
        <span>Bajo</span>
      </div>
    `;
    cardEl.appendChild(legend);
  }
  
  // Inicializar carrusel después de renderizar
  setTimeout(() => {
    if (typeof initRiesgosCarousel === 'function') {
      initRiesgosCarousel();
    }
  }, 100);
}

/**
 * Crea un mini donut chart para una unidad
 */
function createMiniRiskChart(canvas, unitData) {
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Critico', 'Alto', 'Medio', 'Bajo'],
      datasets: [{
        data: [unitData.critical, unitData.high, unitData.medium, unitData.low],
        backgroundColor: [
          ChartColors.critical,
          ChartColors.high,
          ChartColors.medium,
          ChartColors.low
        ],
        borderWidth: 0,
        cutout: '65%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => `${context.label}: ${context.raw}`
          }
        }
      }
    }
  });
}

/**
 * Obtiene datos de riesgos agrupados por unidad organizacional
 */
function getRiesgosDataByUnit() {
  const risks = BCMSDataStore.api.getAll('risks');
  const processes = BCMSDataStore.api.getAll('processes');
  const units = BCMSDataStore.api.getAll('organizationalUnits');
  
  // Crear mapa de proceso -> unidad
  const processToUnit = {};
  processes.forEach(p => {
    processToUnit[p.id] = p.responsibleUnitId;
  });
  
  // Agrupar riesgos por unidad
  const risksByUnit = {};
  
  // Inicializar todas las unidades
  units.forEach(u => {
    risksByUnit[u.id] = {
      unitId: u.id,
      unitName: u.abbreviation || u.name.substring(0, 15),
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };
  });
  
  // Contar riesgos por unidad
  risks.forEach(r => {
    let unitId = null;
    
    // Riesgo asociado a proceso
    if (r.targetProcessId && processToUnit[r.targetProcessId]) {
      unitId = processToUnit[r.targetProcessId];
    } else if (r.riskScope === 'GLOBAL') {
      // Riesgos globales se asignan a la gerencia general (asumimos id 1)
      unitId = 1;
    }
    
    if (unitId && risksByUnit[unitId]) {
      const level = getRiskLevel(r.residualScore);
      risksByUnit[unitId][level]++;
      risksByUnit[unitId].total++;
    }
  });
  
  // Filtrar unidades sin riesgos y ordenar por total descendente
  return Object.values(risksByUnit)
    .filter(u => u.total > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * Determina el nivel de riesgo basado en el score
 */
function getRiskLevel(score) {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

function updateRiesgosChart() {
  // Simplemente re-renderizar
  renderRiesgosMultiDonut();
}

/* ============================================================================
   UTILIDADES DE GRÁFICOS
   ============================================================================ */

/**
 * Exporta un gráfico como imagen
 */
function exportChartAsImage(chartId) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Destruye todos los gráficos
 */
function destroyAllCharts() {
  Object.keys(Charts).forEach(key => {
    if (Charts[key]) {
      Charts[key].destroy();
      Charts[key] = null;
    }
  });
}

/**
 * Redimensiona todos los gráficos
 */
function resizeAllCharts() {
  Object.keys(Charts).forEach(key => {
    if (Charts[key]) {
      Charts[key].resize();
    }
  });
}

window.addEventListener('resize', () => {
  clearTimeout(window.chartResizeTimeout);
  window.chartResizeTimeout = setTimeout(resizeAllCharts, 250);
});

console.log('[CHARTS] charts.js cargado correctamente');
