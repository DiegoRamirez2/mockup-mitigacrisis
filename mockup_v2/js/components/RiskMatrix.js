/**
 * RiskMatrix - Componente reutilizable para matriz de riesgo
 * 
 * Componente para renderizar matrices de riesgo 5x5 interactivas
 * Usado en: Dashboard, RIA, Riesgos Ciber, Vista Integrada
 * 
 * @author BCMS Mitiga
 * @version 1.0.0
 */

class RiskMatrix {
  /**
   * Constructor del componente RiskMatrix
   * @param {Object} config - Configuración de la matriz
   * @param {string} config.container - Selector CSS del contenedor
   * @param {Array} config.risks - Array de riesgos con {id, name, probability, impact, level}
   * @param {Object} [config.dimensions] - Dimensiones de la matriz
   * @param {number} [config.dimensions.probability] - Niveles de probabilidad (default: 5)
   * @param {number} [config.dimensions.impact] - Niveles de impacto (default: 5)
   * @param {Array} [config.probabilityLabels] - Etiquetas eje X
   * @param {Array} [config.impactLabels] - Etiquetas eje Y
   * @param {Object} [config.colors] - Colores por nivel de riesgo
   * @param {Function} [config.onCellClick] - Callback al hacer clic en celda
   */
  constructor(config) {
    this.config = {
      container: null,
      risks: [],
      dimensions: {
        probability: 5,
        impact: 5
      },
      probabilityLabels: ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'],
      impactLabels: ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'],
      colors: {
        'BAJO': '#dcfce7',
        'MEDIO': '#fef3c7',
        'ALTO': '#fed7aa',
        'MUY_ALTO': '#fca5a5',
        'CRITICO': '#dc2626'
      },
      cellTextColor: {
        'BAJO': '#000',
        'MEDIO': '#000',
        'ALTO': '#000',
        'MUY_ALTO': '#000',
        'CRITICO': '#fff'
      },
      onCellClick: null,
      ...config
    };

    this.containerEl = null;
    this.matrixData = {};
    
    this.init();
  }

  /**
   * Inicializa el componente
   */
  init() {
    this.containerEl = document.querySelector(this.config.container);
    if (!this.containerEl) {
      console.error(`RiskMatrix: Container "${this.config.container}" not found`);
      return;
    }

    this.calculateMatrix();
    this.render();
  }

  /**
   * Calcula la distribución de riesgos en la matriz
   */
  calculateMatrix() {
    // Inicializar matriz vacía
    this.matrixData = {};
    for (let i = 1; i <= this.config.dimensions.impact; i++) {
      for (let j = 1; j <= this.config.dimensions.probability; j++) {
        const key = `${i}-${j}`;
        this.matrixData[key] = {
          count: 0,
          risks: [],
          level: this.getRiskLevel(j, i)
        };
      }
    }

    // Distribuir riesgos
    this.config.risks.forEach(risk => {
      const key = `${risk.impact}-${risk.probability}`;
      if (this.matrixData[key]) {
        this.matrixData[key].count++;
        this.matrixData[key].risks.push(risk);
      }
    });
  }

  /**
   * Determina el nivel de riesgo basado en probabilidad e impacto
   * @param {number} probability - Nivel de probabilidad (1-5)
   * @param {number} impact - Nivel de impacto (1-5)
   * @returns {string} - Nivel: BAJO, MEDIO, ALTO, MUY_ALTO, CRITICO
   */
  getRiskLevel(probability, impact) {
    const score = probability * impact;
    
    if (score >= 20) return 'CRITICO';
    if (score >= 15) return 'MUY_ALTO';
    if (score >= 10) return 'ALTO';
    if (score >= 5) return 'MEDIO';
    return 'BAJO';
  }

  /**
   * Renderiza la matriz
   */
  render() {
    this.containerEl.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'risk-matrix-wrapper';
    wrapper.style.cssText = 'padding: 20px; background: #f8f9fa; border-radius: 8px;';

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: 80px repeat(${this.config.dimensions.probability}, 1fr);
      gap: 4px;
      font-size: 11px;
    `;

    // Header vacío (esquina)
    const corner = document.createElement('div');
    corner.style.cssText = 'display: flex; align-items: center; justify-content: center;';
    corner.innerHTML = '<div style="text-align: center; font-weight: 600; font-size: 9px; color: var(--text-muted);">Probabilidad →<br>↑ Impacto</div>';
    grid.appendChild(corner);

    // Headers de probabilidad (columnas)
    for (let j = 0; j < this.config.dimensions.probability; j++) {
      const header = document.createElement('div');
      header.style.cssText = 'text-align: center; font-weight: 600; padding: 8px;';
      header.textContent = this.config.probabilityLabels[j] || `P${j + 1}`;
      grid.appendChild(header);
    }

    // Filas (de arriba hacia abajo: impacto alto a bajo)
    for (let i = this.config.dimensions.impact; i >= 1; i--) {
      // Label de impacto
      const rowLabel = document.createElement('div');
      rowLabel.style.cssText = 'font-weight: 600; padding: 8px; display: flex; align-items: center; font-size: 10px;';
      rowLabel.textContent = this.config.impactLabels[i - 1] || `I${i}`;
      grid.appendChild(rowLabel);

      // Celdas
      for (let j = 1; j <= this.config.dimensions.probability; j++) {
        const cell = this.createCell(i, j);
        grid.appendChild(cell);
      }
    }

    wrapper.appendChild(grid);

    // Footer informativo
    const footer = document.createElement('div');
    footer.style.cssText = 'margin-top: 12px; text-align: center; font-size: 10px; color: var(--text-muted);';
    
    const totalRisks = this.config.risks.length;
    const summary = this.getRiskSummary();
    
    footer.innerHTML = `
      Total de riesgos: <strong>${totalRisks}</strong> | 
      Críticos: <strong style="color: var(--critical);">${summary.CRITICO || 0}</strong> | 
      Altos: <strong style="color: var(--high);">${summary.MUY_ALTO + summary.ALTO || 0}</strong> | 
      Medios: <strong style="color: var(--medium);">${summary.MEDIO || 0}</strong> | 
      Bajos: <strong style="color: var(--low);">${summary.BAJO || 0}</strong>
    `;
    
    wrapper.appendChild(footer);

    this.containerEl.appendChild(wrapper);
  }

  /**
   * Crea una celda de la matriz
   * @param {number} impact - Nivel de impacto
   * @param {number} probability - Nivel de probabilidad
   * @returns {HTMLElement}
   */
  createCell(impact, probability) {
    const key = `${impact}-${probability}`;
    const cellData = this.matrixData[key];
    
    const cell = document.createElement('div');
    cell.className = 'risk-matrix-cell';
    cell.dataset.impact = impact;
    cell.dataset.probability = probability;
    cell.dataset.level = cellData.level;
    
    const bgColor = this.config.colors[cellData.level];
    const textColor = this.config.cellTextColor[cellData.level];
    
    cell.style.cssText = `
      background: ${bgColor};
      padding: 16px;
      border-radius: 4px;
      text-align: center;
      font-weight: ${cellData.count > 0 ? '600' : '400'};
      cursor: ${cellData.count > 0 && this.config.onCellClick ? 'pointer' : 'default'};
      color: ${textColor};
      transition: transform 0.2s, box-shadow 0.2s;
    `;

    cell.textContent = cellData.count;

    // Hover effect
    if (cellData.count > 0) {
      cell.addEventListener('mouseenter', () => {
        cell.style.transform = 'scale(1.05)';
        cell.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        
        // Mostrar tooltip
        if (cellData.risks.length > 0) {
          this.showTooltip(cell, cellData.risks);
        }
      });

      cell.addEventListener('mouseleave', () => {
        cell.style.transform = 'scale(1)';
        cell.style.boxShadow = 'none';
        this.hideTooltip();
      });

      // Click event
      if (this.config.onCellClick) {
        cell.addEventListener('click', () => {
          this.config.onCellClick(cellData.risks, { impact, probability, level: cellData.level });
        });
      }
    }

    return cell;
  }

  /**
   * Muestra tooltip con lista de riesgos
   * @param {HTMLElement} cell - Celda
   * @param {Array} risks - Riesgos en la celda
   */
  showTooltip(cell, risks) {
    this.hideTooltip(); // Limpiar tooltip anterior

    const tooltip = document.createElement('div');
    tooltip.id = 'risk-matrix-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      border: 2px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 300px;
      font-size: 12px;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 8px; color: var(--text-main);';
    title.textContent = `Riesgos en esta celda (${risks.length})`;
    tooltip.appendChild(title);

    const list = document.createElement('ul');
    list.style.cssText = 'margin: 0; padding-left: 20px; list-style: disc;';
    
    risks.slice(0, 5).forEach(risk => {
      const item = document.createElement('li');
      item.style.cssText = 'margin-bottom: 4px; color: var(--text-secondary);';
      item.textContent = risk.name || `Riesgo #${risk.id}`;
      list.appendChild(item);
    });

    tooltip.appendChild(list);

    if (risks.length > 5) {
      const more = document.createElement('div');
      more.style.cssText = 'margin-top: 8px; color: var(--text-muted); font-style: italic;';
      more.textContent = `... y ${risks.length - 5} más`;
      tooltip.appendChild(more);
    }

    document.body.appendChild(tooltip);

    // Posicionar tooltip
    const cellRect = cell.getBoundingClientRect();
    tooltip.style.left = `${cellRect.right + 10}px`;
    tooltip.style.top = `${cellRect.top}px`;
  }

  /**
   * Oculta el tooltip
   */
  hideTooltip() {
    const existing = document.getElementById('risk-matrix-tooltip');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Obtiene resumen de riesgos por nivel
   * @returns {Object}
   */
  getRiskSummary() {
    const summary = {
      BAJO: 0,
      MEDIO: 0,
      ALTO: 0,
      MUY_ALTO: 0,
      CRITICO: 0
    };

    Object.values(this.matrixData).forEach(cell => {
      summary[cell.level] += cell.count;
    });

    return summary;
  }

  /**
   * Actualiza los datos de la matriz
   * @param {Array} newRisks - Nuevos datos de riesgos
   */
  updateData(newRisks) {
    this.config.risks = newRisks;
    this.calculateMatrix();
    this.render();
  }

  /**
   * Destruye el componente
   */
  destroy() {
    this.hideTooltip();
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
    }
  }
}

// Exportar para uso global
window.RiskMatrix = RiskMatrix;
