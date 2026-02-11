/**
 * KPICard - Componente reutilizable para tarjetas KPI
 * 
 * Componente simple para renderizar tarjetas KPI consistentes
 * Usado en: Dashboard, Gobierno, Pruebas, Auditoría, etc.
 * 
 * @author BCMS Mitiga
 * @version 1.0.0
 */

class KPICard {
  /**
   * Constructor del componente KPICard
   * @param {Object} config - Configuración de la tarjeta KPI
   * @param {string} config.label - Etiqueta del KPI
   * @param {string|number} config.value - Valor principal del KPI
   * @param {string} [config.subtitle] - Subtítulo opcional
   * @param {string} [config.icon] - Ícono Font Awesome (ej: 'fa-chart-line')
   * @param {string} [config.color] - Color de acento (primary, secondary, success, warning, danger, info)
   * @param {string} [config.trend] - Tendencia: 'up', 'down', 'neutral'
   * @param {string} [config.trendText] - Texto de la tendencia
   * @param {Function} [config.onClick] - Callback al hacer clic
   */
  constructor(config) {
    this.config = {
      label: '',
      value: 0,
      subtitle: '',
      icon: null,
      color: 'primary',
      trend: null,
      trendText: '',
      onClick: null,
      ...config
    };
  }

  /**
   * Renderiza la tarjeta KPI y la retorna como elemento DOM
   * @returns {HTMLElement}
   */
  render() {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    
    if (this.config.onClick) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', this.config.onClick);
    }

    // Ícono opcional
    if (this.config.icon) {
      const iconEl = document.createElement('div');
      iconEl.className = 'kpi-icon';
      iconEl.innerHTML = `<i class="fa-solid ${this.config.icon}"></i>`;
      
      // Aplicar color si está definido
      if (this.config.color) {
        iconEl.style.color = `var(--accent-${this.config.color})`;
      }
      
      card.appendChild(iconEl);
    }

    // Label
    const labelEl = document.createElement('div');
    labelEl.className = 'kpi-label';
    labelEl.textContent = this.config.label;
    card.appendChild(labelEl);

    // Value
    const valueEl = document.createElement('div');
    valueEl.className = 'kpi-value';
    valueEl.textContent = this.config.value;
    
    // Aplicar color al valor si está definido
    if (this.config.color) {
      valueEl.style.color = `var(--accent-${this.config.color})`;
    }
    
    card.appendChild(valueEl);

    // Subtitle con tendencia opcional
    if (this.config.subtitle || this.config.trend) {
      const subtitleEl = document.createElement('div');
      subtitleEl.className = 'kpi-subtitle';
      
      // Ícono de tendencia
      if (this.config.trend) {
        const trendIcon = this.getTrendIcon(this.config.trend);
        const trendColor = this.getTrendColor(this.config.trend);
        subtitleEl.innerHTML = `<i class="fa-solid ${trendIcon}" style="color: ${trendColor};"></i> `;
      }
      
      // Texto del subtitle
      const textSpan = document.createElement('span');
      textSpan.textContent = this.config.trendText || this.config.subtitle;
      
      // Color del texto basado en tendencia
      if (this.config.trend) {
        textSpan.style.color = this.getTrendColor(this.config.trend);
      }
      
      subtitleEl.appendChild(textSpan);
      card.appendChild(subtitleEl);
    }

    return card;
  }

  /**
   * Renderiza la tarjeta y la agrega a un contenedor
   * @param {string|HTMLElement} container - Selector CSS o elemento DOM
   */
  renderTo(container) {
    const containerEl = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerEl) {
      console.error(`KPICard: Container not found`);
      return;
    }

    const card = this.render();
    containerEl.appendChild(card);
  }

  /**
   * Obtiene el ícono según la tendencia
   * @param {string} trend - 'up', 'down', 'neutral'
   * @returns {string}
   */
  getTrendIcon(trend) {
    const icons = {
      'up': 'fa-arrow-trend-up',
      'down': 'fa-arrow-trend-down',
      'neutral': 'fa-minus'
    };
    return icons[trend] || 'fa-minus';
  }

  /**
   * Obtiene el color según la tendencia
   * @param {string} trend - 'up', 'down', 'neutral'
   * @returns {string}
   */
  getTrendColor(trend) {
    const colors = {
      'up': 'var(--accent-secondary)',
      'down': 'var(--accent-danger)',
      'neutral': 'var(--text-muted)'
    };
    return colors[trend] || 'var(--text-muted)';
  }

  /**
   * Actualiza el valor del KPI
   * @param {string|number} newValue - Nuevo valor
   */
  updateValue(newValue) {
    this.config.value = newValue;
  }

  /**
   * Actualiza la configuración completa
   * @param {Object} newConfig - Nueva configuración
   */
  update(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Función helper para renderizar múltiples KPIs en un grid
 * @param {string|HTMLElement} container - Contenedor
 * @param {Array<Object>} kpisConfig - Array de configuraciones KPI
 */
function renderKPIGrid(container, kpisConfig) {
  const containerEl = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!containerEl) {
    console.error('renderKPIGrid: Container not found');
    return;
  }

  // Limpiar contenedor
  containerEl.innerHTML = '';

  // Renderizar cada KPI
  kpisConfig.forEach(config => {
    const kpi = new KPICard(config);
    kpi.renderTo(containerEl);
  });
}

// Exportar para uso global
window.KPICard = KPICard;
window.renderKPIGrid = renderKPIGrid;
