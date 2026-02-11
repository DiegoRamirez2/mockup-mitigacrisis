/**
 * Timeline - Componente reutilizable para líneas de tiempo
 * 
 * Componente para renderizar líneas de tiempo verticales interactivas
 * Usado en: BIA, Incidentes, Crisis, Auditoría
 * 
 * @author BCMS Mitiga
 * @version 1.0.0
 */

class Timeline {
  /**
   * Constructor del componente Timeline
   * @param {Object} config - Configuración del timeline
   * @param {string} config.container - Selector CSS del contenedor
   * @param {Array} config.events - Array de eventos con {id, date, title, description, type, icon}
   * @param {Object} [config.typeColors] - Colores por tipo de evento
   * @param {boolean} [config.showDate] - Mostrar fecha completa (default: true)
   * @param {boolean} [config.showTime] - Mostrar hora (default: true)
   * @param {Function} [config.onEventClick] - Callback al hacer clic en evento
   * @param {string} [config.emptyMessage] - Mensaje cuando no hay eventos
   */
  constructor(config) {
    this.config = {
      container: null,
      events: [],
      typeColors: {
        'info': '#3b82f6',
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
        'default': '#64748b'
      },
      typeIcons: {
        'info': 'fa-circle-info',
        'success': 'fa-circle-check',
        'warning': 'fa-triangle-exclamation',
        'danger': 'fa-circle-exclamation',
        'default': 'fa-circle'
      },
      showDate: true,
      showTime: true,
      onEventClick: null,
      emptyMessage: 'No hay eventos registrados',
      sortOrder: 'desc', // 'asc' o 'desc'
      ...config
    };

    this.containerEl = null;
    this.init();
  }

  /**
   * Inicializa el componente
   */
  init() {
    this.containerEl = document.querySelector(this.config.container);
    if (!this.containerEl) {
      console.error(`Timeline: Container "${this.config.container}" not found`);
      return;
    }

    this.render();
  }

  /**
   * Renderiza el timeline
   */
  render() {
    this.containerEl.innerHTML = '';
    this.containerEl.className = 'timeline-container';

    // Ordenar eventos
    const sortedEvents = this.sortEvents();

    // Estado vacío
    if (sortedEvents.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'timeline-empty';
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
      `;
      emptyState.innerHTML = `
        <i class="fa-solid fa-clock" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>${this.config.emptyMessage}</p>
      `;
      this.containerEl.appendChild(emptyState);
      return;
    }

    // Timeline wrapper
    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    timeline.style.cssText = `
      position: relative;
      padding: 20px 0;
    `;

    // Línea vertical central
    const line = document.createElement('div');
    line.className = 'timeline-line';
    line.style.cssText = `
      position: absolute;
      left: 30px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border);
    `;
    timeline.appendChild(line);

    // Renderizar eventos
    sortedEvents.forEach((event, index) => {
      const eventEl = this.createEvent(event, index === sortedEvents.length - 1);
      timeline.appendChild(eventEl);
    });

    this.containerEl.appendChild(timeline);
  }

  /**
   * Ordena los eventos según configuración
   * @returns {Array}
   */
  sortEvents() {
    const sorted = [...this.config.events];
    sorted.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return this.config.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }

  /**
   * Crea un elemento de evento
   * @param {Object} event - Datos del evento
   * @param {boolean} isLast - Si es el último evento
   * @returns {HTMLElement}
   */
  createEvent(event, isLast) {
    const eventEl = document.createElement('div');
    eventEl.className = 'timeline-event';
    eventEl.dataset.eventId = event.id;
    eventEl.style.cssText = `
      position: relative;
      padding-left: 60px;
      padding-bottom: ${isLast ? '0' : '32px'};
    `;

    // Punto/ícono
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    const eventType = event.type || 'default';
    const dotColor = this.config.typeColors[eventType] || this.config.typeColors['default'];
    const dotIcon = event.icon || this.config.typeIcons[eventType] || this.config.typeIcons['default'];
    
    dot.style.cssText = `
      position: absolute;
      left: 20px;
      top: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${dotColor};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      z-index: 1;
    `;
    dot.innerHTML = `<i class="fa-solid ${dotIcon}"></i>`;
    eventEl.appendChild(dot);

    // Contenido del evento
    const content = document.createElement('div');
    content.className = 'timeline-content';
    content.style.cssText = `
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--shadow-soft);
      ${this.config.onEventClick ? 'cursor: pointer;' : ''}
      transition: box-shadow 0.2s, transform 0.2s;
    `;

    if (this.config.onEventClick) {
      content.addEventListener('mouseenter', () => {
        content.style.boxShadow = 'var(--shadow-md)';
        content.style.transform = 'translateY(-2px)';
      });
      content.addEventListener('mouseleave', () => {
        content.style.boxShadow = 'var(--shadow-soft)';
        content.style.transform = 'translateY(0)';
      });
      content.addEventListener('click', () => {
        this.config.onEventClick(event);
      });
    }

    // Fecha/hora
    if (this.config.showDate || this.config.showTime) {
      const dateEl = document.createElement('div');
      dateEl.className = 'timeline-date';
      dateEl.style.cssText = 'font-size: 11px; color: var(--text-muted); margin-bottom: 8px;';
      
      const eventDate = new Date(event.date);
      let dateStr = '';
      
      if (this.config.showDate) {
        dateStr = eventDate.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      if (this.config.showTime) {
        const timeStr = eventDate.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit'
        });
        dateStr += (dateStr ? ' • ' : '') + timeStr;
      }
      
      dateEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${dateStr}`;
      content.appendChild(dateEl);
    }

    // Título
    const title = document.createElement('div');
    title.className = 'timeline-title';
    title.style.cssText = 'font-weight: 600; font-size: 14px; margin-bottom: 6px; color: var(--text-main);';
    title.textContent = event.title;
    content.appendChild(title);

    // Descripción
    if (event.description) {
      const desc = document.createElement('div');
      desc.className = 'timeline-description';
      desc.style.cssText = 'font-size: 13px; color: var(--text-secondary); line-height: 1.5;';
      desc.textContent = event.description;
      content.appendChild(desc);
    }

    // Metadata adicional (usuario, estado, etc.)
    if (event.metadata) {
      const meta = document.createElement('div');
      meta.className = 'timeline-metadata';
      meta.style.cssText = 'margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted);';
      
      const metaItems = [];
      if (event.metadata.user) {
        metaItems.push(`<i class="fa-solid fa-user"></i> ${event.metadata.user}`);
      }
      if (event.metadata.status) {
        metaItems.push(`<i class="fa-solid fa-circle-dot"></i> ${event.metadata.status}`);
      }
      if (event.metadata.tags) {
        event.metadata.tags.forEach(tag => {
          metaItems.push(`<span class="badge badge-neutral" style="font-size: 10px;">${tag}</span>`);
        });
      }
      
      meta.innerHTML = metaItems.join(' • ');
      content.appendChild(meta);
    }

    eventEl.appendChild(content);
    return eventEl;
  }

  /**
   * Agrega un nuevo evento al timeline
   * @param {Object} event - Datos del evento
   */
  addEvent(event) {
    this.config.events.push(event);
    this.render();
  }

  /**
   * Actualiza los eventos del timeline
   * @param {Array} newEvents - Nuevos eventos
   */
  updateEvents(newEvents) {
    this.config.events = newEvents;
    this.render();
  }

  /**
   * Filtra eventos por tipo
   * @param {string|Array} types - Tipo(s) de evento a mostrar
   */
  filterByType(types) {
    const typeArray = Array.isArray(types) ? types : [types];
    const filtered = this.config.events.filter(event => 
      typeArray.includes(event.type)
    );
    
    // Renderizar temporalmente con eventos filtrados
    const originalEvents = this.config.events;
    this.config.events = filtered;
    this.render();
    this.config.events = originalEvents;
  }

  /**
   * Limpia todos los eventos
   */
  clear() {
    this.config.events = [];
    this.render();
  }

  /**
   * Destruye el componente
   */
  destroy() {
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
      this.containerEl.className = '';
    }
  }
}

// Exportar para uso global
window.Timeline = Timeline;
