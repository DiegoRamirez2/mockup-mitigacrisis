/**
 * DynamicTable - Componente de tabla reutilizable y configurable
 * 
 * Caracteristicas:
 * - Columnas dinamicas con tipos de datos
 * - Filtros configurables (select, text, date-range, multi-select)
 * - Ordenamiento por columna
 * - Paginacion opcional
 * - Filas clickeables
 * - Badges con colores configurables
 * - Iconos para valores booleanos
 * - Acciones por fila
 * 
 * @author BCMS Mitiga
 * @version 1.0.0
 */

class DynamicTable {
  /**
   * Constructor del componente DynamicTable
   * @param {Object} config - Configuracion de la tabla
   * @param {string} config.container - Selector CSS del contenedor
   * @param {Array} config.columns - Definicion de columnas
   * @param {Array} [config.filters] - Definicion de filtros
   * @param {Object} [config.pagination] - Configuracion de paginacion
   * @param {Function} [config.onRowClick] - Callback al hacer clic en fila
   * @param {Array|Function} config.data - Datos o funcion que retorna datos
   * @param {Object} [config.emptyState] - Mensaje cuando no hay datos
   * @param {boolean} [config.showResetButton] - Mostrar boton de reiniciar filtros
   * @param {string} [config.tableId] - ID unico para la tabla
   */
  constructor(config) {
    this.config = {
      container: null,
      columns: [],
      filters: [],
      pagination: { enabled: false, pageSize: 10 },
      onRowClick: null,
      data: [],
      emptyState: { icon: 'bi-inbox', message: 'No hay datos disponibles' },
      showResetButton: true,
      tableId: 'dynamic-table-' + Date.now(),
      ...config
    };

    // Estado interno
    this.state = {
      currentPage: 1,
      sortColumn: null,
      sortDirection: 'asc',
      filters: {},
      filteredData: []
    };

    // Referencias DOM
    this.containerEl = null;
    this.tableEl = null;
    this.filtersEl = null;
    this.paginationEl = null;

    // Inicializar
    this.init();
  }

  /**
   * Inicializa el componente
   */
  init() {
    this.containerEl = document.querySelector(this.config.container);
    if (!this.containerEl) {
      console.error(`DynamicTable: Container "${this.config.container}" not found`);
      return;
    }

    // Inicializar filtros vacios
    this.config.filters.forEach(filter => {
      this.state.filters[filter.key] = filter.type === 'multi-select' ? [] : '';
    });

    // Construir estructura HTML
    this.render();
    
    // Aplicar datos iniciales
    this.applyFiltersAndSort();
  }

  /**
   * Obtiene los datos (soporte para array o funcion)
   * @returns {Array}
   */
  getData() {
    if (typeof this.config.data === 'function') {
      return this.config.data();
    }
    return this.config.data || [];
  }

  /**
   * Renderiza la estructura completa del componente
   */
  render() {
    this.containerEl.innerHTML = '';
    this.containerEl.classList.add('dynamic-table-wrapper');

    // Renderizar filtros si existen
    if (this.config.filters.length > 0) {
      this.renderFilters();
    }

    // Renderizar tabla
    this.renderTable();

    // Renderizar paginacion si esta habilitada
    if (this.config.pagination.enabled) {
      this.renderPagination();
    }
  }

  /**
   * Renderiza la seccion de filtros
   */
  renderFilters() {
    this.filtersEl = document.createElement('div');
    this.filtersEl.className = 'dynamic-table-filters';
    
    const filtersRow = document.createElement('div');
    filtersRow.className = 'filters-row';

    this.config.filters.forEach(filter => {
      const filterWrapper = document.createElement('div');
      filterWrapper.className = 'filter-item';

      const label = document.createElement('label');
      label.textContent = filter.label;
      label.htmlFor = `filter-${this.config.tableId}-${filter.key}`;
      filterWrapper.appendChild(label);

      let input;
      
      switch (filter.type) {
        case 'select':
          input = this.createSelectFilter(filter);
          break;
        case 'multi-select':
          input = this.createMultiSelectFilter(filter);
          break;
        case 'text':
          input = this.createTextFilter(filter);
          break;
        case 'date-range':
          input = this.createDateRangeFilter(filter);
          break;
        default:
          input = this.createTextFilter(filter);
      }

      filterWrapper.appendChild(input);
      filtersRow.appendChild(filterWrapper);
    });

    // Boton de reiniciar filtros
    if (this.config.showResetButton) {
      const resetWrapper = document.createElement('div');
      resetWrapper.className = 'filter-item filter-actions';
      
      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'btn btn-secondary btn-sm';
      resetBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Limpiar';
      resetBtn.addEventListener('click', () => this.resetFilters());
      
      resetWrapper.appendChild(resetBtn);
      filtersRow.appendChild(resetWrapper);
    }

    this.filtersEl.appendChild(filtersRow);
    this.containerEl.appendChild(this.filtersEl);
  }

  /**
   * Crea un filtro tipo select
   * @param {Object} filter - Configuracion del filtro
   * @returns {HTMLElement}
   */
  createSelectFilter(filter) {
    const select = document.createElement('select');
    select.id = `filter-${this.config.tableId}-${filter.key}`;
    select.className = 'form-select';

    // Opcion vacia
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = filter.placeholder || 'Todos';
    select.appendChild(emptyOption);

    // Obtener opciones
    let options = filter.options || [];
    
    // Si las opciones vienen de los datos
    if (filter.optionsFrom === 'data') {
      const data = this.getData();
      const uniqueValues = [...new Set(data.map(item => this.getNestedValue(item, filter.key)))];
      options = uniqueValues.filter(v => v !== null && v !== undefined).sort();
    }

    options.forEach(option => {
      const opt = document.createElement('option');
      if (typeof option === 'object') {
        opt.value = option.value;
        opt.textContent = option.label;
      } else {
        opt.value = option;
        opt.textContent = option;
      }
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      this.state.filters[filter.key] = e.target.value;
      this.state.currentPage = 1;
      this.applyFiltersAndSort();
    });

    return select;
  }

  /**
   * Crea un filtro tipo multi-select
   * @param {Object} filter - Configuracion del filtro
   * @returns {HTMLElement}
   */
  createMultiSelectFilter(filter) {
    const wrapper = document.createElement('div');
    wrapper.className = 'multi-select-wrapper';
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'multi-select-btn form-select';
    button.textContent = filter.placeholder || 'Seleccionar...';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'multi-select-dropdown';
    
    let options = filter.options || [];
    if (filter.optionsFrom === 'data') {
      const data = this.getData();
      const uniqueValues = [...new Set(data.map(item => this.getNestedValue(item, filter.key)))];
      options = uniqueValues.filter(v => v !== null && v !== undefined).sort();
    }

    options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'multi-select-option';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = typeof option === 'object' ? option.value : option;
      
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.state.filters[filter.key].push(checkbox.value);
        } else {
          const idx = this.state.filters[filter.key].indexOf(checkbox.value);
          if (idx > -1) this.state.filters[filter.key].splice(idx, 1);
        }
        this.updateMultiSelectButton(button, filter, this.state.filters[filter.key]);
        this.state.currentPage = 1;
        this.applyFiltersAndSort();
      });
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + (typeof option === 'object' ? option.label : option)));
      dropdown.appendChild(label);
    });

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    wrapper.appendChild(button);
    wrapper.appendChild(dropdown);
    return wrapper;
  }

  /**
   * Actualiza el texto del boton multi-select
   */
  updateMultiSelectButton(button, filter, selectedValues) {
    if (selectedValues.length === 0) {
      button.textContent = filter.placeholder || 'Seleccionar...';
    } else if (selectedValues.length === 1) {
      button.textContent = selectedValues[0];
    } else {
      button.textContent = `${selectedValues.length} seleccionados`;
    }
  }

  /**
   * Crea un filtro tipo texto
   * @param {Object} filter - Configuracion del filtro
   * @returns {HTMLElement}
   */
  createTextFilter(filter) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `filter-${this.config.tableId}-${filter.key}`;
    input.className = 'form-control';
    input.placeholder = filter.placeholder || 'Buscar...';

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.state.filters[filter.key] = e.target.value;
        this.state.currentPage = 1;
        this.applyFiltersAndSort();
      }, 300);
    });

    return input;
  }

  /**
   * Crea un filtro tipo rango de fechas
   * @param {Object} filter - Configuracion del filtro
   * @returns {HTMLElement}
   */
  createDateRangeFilter(filter) {
    const wrapper = document.createElement('div');
    wrapper.className = 'date-range-wrapper';

    const inputFrom = document.createElement('input');
    inputFrom.type = 'date';
    inputFrom.className = 'form-control';
    inputFrom.placeholder = 'Desde';
    
    const inputTo = document.createElement('input');
    inputTo.type = 'date';
    inputTo.className = 'form-control';
    inputTo.placeholder = 'Hasta';

    const updateFilter = () => {
      this.state.filters[filter.key] = {
        from: inputFrom.value || null,
        to: inputTo.value || null
      };
      this.state.currentPage = 1;
      this.applyFiltersAndSort();
    };

    inputFrom.addEventListener('change', updateFilter);
    inputTo.addEventListener('change', updateFilter);

    wrapper.appendChild(inputFrom);
    wrapper.appendChild(document.createTextNode(' - '));
    wrapper.appendChild(inputTo);

    return wrapper;
  }

  /**
   * Renderiza la tabla
   */
  renderTable() {
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'dynamic-table-container';

    this.tableEl = document.createElement('table');
    this.tableEl.className = 'dynamic-table';
    this.tableEl.id = this.config.tableId;

    // Thead
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    this.config.columns.forEach(col => {
      const th = document.createElement('th');
      th.dataset.column = col.key;
      
      const headerContent = document.createElement('div');
      headerContent.className = 'th-content';
      
      const headerText = document.createElement('span');
      headerText.textContent = col.label;
      headerContent.appendChild(headerText);

      if (col.sortable !== false) {
        th.classList.add('sortable');
        const sortIcon = document.createElement('i');
        sortIcon.className = 'bi bi-arrow-down-up sort-icon';
        headerContent.appendChild(sortIcon);

        th.addEventListener('click', () => this.handleSort(col.key));
      }

      th.appendChild(headerContent);
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    this.tableEl.appendChild(thead);

    // Tbody
    const tbody = document.createElement('tbody');
    this.tableEl.appendChild(tbody);

    tableWrapper.appendChild(this.tableEl);
    this.containerEl.appendChild(tableWrapper);
  }

  /**
   * Renderiza la paginacion
   */
  renderPagination() {
    this.paginationEl = document.createElement('div');
    this.paginationEl.className = 'dynamic-table-pagination';
    this.containerEl.appendChild(this.paginationEl);
  }

  /**
   * Maneja el ordenamiento al hacer clic en cabecera
   * @param {string} column - Nombre de la columna
   */
  handleSort(column) {
    if (this.state.sortColumn === column) {
      this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortColumn = column;
      this.state.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  /**
   * Aplica filtros y ordenamiento a los datos
   */
  applyFiltersAndSort() {
    let data = [...this.getData()];

    // Aplicar filtro externo si existe
    if (this.state.externalFilter && typeof this.state.externalFilter === 'function') {
      data = data.filter(this.state.externalFilter);
    }

    // Aplicar filtros internos
    this.config.filters.forEach(filter => {
      const filterValue = this.state.filters[filter.key];
      
      if (filter.type === 'multi-select' && filterValue.length > 0) {
        data = data.filter(item => {
          const itemValue = String(this.getNestedValue(item, filter.key));
          return filterValue.includes(itemValue);
        });
      } else if (filter.type === 'date-range' && (filterValue?.from || filterValue?.to)) {
        data = data.filter(item => {
          const itemDate = new Date(this.getNestedValue(item, filter.key));
          if (filterValue.from && itemDate < new Date(filterValue.from)) return false;
          if (filterValue.to && itemDate > new Date(filterValue.to)) return false;
          return true;
        });
      } else if (filterValue && filter.type === 'text') {
        data = data.filter(item => {
          const itemValue = String(this.getNestedValue(item, filter.key)).toLowerCase();
          return itemValue.includes(filterValue.toLowerCase());
        });
      } else if (filterValue && filter.type === 'select') {
        data = data.filter(item => {
          const itemValue = String(this.getNestedValue(item, filter.key));
          return itemValue === filterValue;
        });
      } else if (filter.customFilter && typeof filter.customFilter === 'function') {
        data = data.filter(item => filter.customFilter(item, filterValue));
      }
    });

    // Aplicar ordenamiento
    if (this.state.sortColumn) {
      const col = this.config.columns.find(c => c.key === this.state.sortColumn);
      data.sort((a, b) => {
        let valA = this.getNestedValue(a, this.state.sortColumn);
        let valB = this.getNestedValue(b, this.state.sortColumn);

        // Manejar tipos especificos
        if (col?.type === 'date' || col?.type === 'datetime') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else if (col?.type === 'number') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return this.state.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.state.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.state.filteredData = data;

    // Actualizar UI
    this.updateTableBody();
    this.updatePagination();
    this.updateSortIcons();
  }

  /**
   * Obtiene un valor anidado de un objeto usando dot notation
   * @param {Object} obj - Objeto
   * @param {string} path - Ruta (ej: 'user.name')
   * @returns {*}
   */
  getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  /**
   * Actualiza el cuerpo de la tabla
   */
  updateTableBody() {
    const tbody = this.tableEl.querySelector('tbody');
    tbody.innerHTML = '';

    let displayData = this.state.filteredData;

    // Aplicar paginacion
    if (this.config.pagination.enabled) {
      const start = (this.state.currentPage - 1) * this.config.pagination.pageSize;
      const end = start + this.config.pagination.pageSize;
      displayData = displayData.slice(start, end);
    }

    // Estado vacio
    if (displayData.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-row';
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = this.config.columns.length;
      emptyCell.innerHTML = `
        <div class="empty-state">
          <i class="bi ${this.config.emptyState.icon}"></i>
          <p>${this.config.emptyState.message}</p>
        </div>
      `;
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
      return;
    }

    // Renderizar filas
    displayData.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = index;
      
      if (this.config.onRowClick) {
        tr.classList.add('clickable');
        tr.addEventListener('click', (e) => {
          // Evitar si se hizo clic en un boton de accion
          if (e.target.closest('.action-btn')) return;
          this.config.onRowClick(row, index);
        });
      }

      this.config.columns.forEach(col => {
        const td = document.createElement('td');
        const value = this.getNestedValue(row, col.key);
        td.appendChild(this.renderCell(value, col, row));
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  /**
   * Renderiza una celda segun su tipo
   * @param {*} value - Valor de la celda
   * @param {Object} col - Configuracion de la columna
   * @param {Object} row - Fila completa
   * @returns {HTMLElement|string}
   */
  renderCell(value, col, row) {
    const container = document.createElement('span');

    switch (col.type) {
      case 'badge':
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = value || '-';
        
        if (col.badgeMap && col.badgeMap[value]) {
          badge.classList.add(`badge-${col.badgeMap[value]}`);
        } else if (col.badgeClass) {
          badge.classList.add(col.badgeClass);
        }
        container.appendChild(badge);
        break;

      case 'icon':
        const icon = document.createElement('i');
        if (value) {
          icon.className = `bi ${col.iconTrue || 'bi-check2'} icon-success`;
        } else {
          icon.className = `bi ${col.iconFalse || 'bi-x-lg'} icon-danger`;
        }
        container.appendChild(icon);
        break;

      case 'date':
        if (value) {
          const date = new Date(value);
          container.textContent = date.toLocaleDateString('es-CL');
        } else {
          container.textContent = col.emptyText || '-';
        }
        break;

      case 'datetime':
        if (value) {
          const datetime = new Date(value);
          container.textContent = datetime.toLocaleString('es-CL');
        } else {
          container.textContent = col.emptyText || '-';
        }
        break;

      case 'number':
        container.textContent = value?.toLocaleString('es-CL') ?? '-';
        break;

      case 'currency':
        if (value !== null && value !== undefined) {
          container.textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: col.currency || 'CLP'
          }).format(value);
        } else {
          container.textContent = '-';
        }
        break;

      case 'progress':
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'progress-bar-wrapper';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${Math.min(100, Math.max(0, value || 0))}%`;
        progressWrapper.appendChild(progressBar);
        const progressText = document.createElement('span');
        progressText.className = 'progress-text';
        progressText.textContent = `${value || 0}%`;
        container.appendChild(progressWrapper);
        container.appendChild(progressText);
        break;

      case 'actions':
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'actions-wrapper';
        
        (col.actions || []).forEach(action => {
          // Verificar condicion si existe
          if (action.condition && !action.condition(row)) return;
          
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `action-btn ${action.class || ''}`;
          btn.title = action.tooltip || action.label || '';
          btn.innerHTML = action.icon ? `<i class="bi ${action.icon}"></i>` : action.label;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (action.onClick) action.onClick(row, e);
          });
          actionsWrapper.appendChild(btn);
        });
        
        container.appendChild(actionsWrapper);
        break;

      case 'link':
        const link = document.createElement('a');
        link.href = col.href ? (typeof col.href === 'function' ? col.href(row) : col.href) : '#';
        link.textContent = value || '-';
        if (col.target) link.target = col.target;
        container.appendChild(link);
        break;

      case 'custom':
        if (col.render && typeof col.render === 'function') {
          const customContent = col.render(value, row);
          if (typeof customContent === 'string') {
            container.innerHTML = customContent;
          } else if (customContent instanceof HTMLElement) {
            container.appendChild(customContent);
          }
        }
        break;

      default: // text
        container.textContent = value ?? col.emptyText ?? '-';
    }

    return container;
  }

  /**
   * Actualiza los iconos de ordenamiento
   */
  updateSortIcons() {
    const ths = this.tableEl.querySelectorAll('th.sortable');
    ths.forEach(th => {
      const icon = th.querySelector('.sort-icon');
      if (!icon) return;

      if (th.dataset.column === this.state.sortColumn) {
        icon.className = `bi bi-sort-${this.state.sortDirection === 'asc' ? 'up' : 'down'} sort-icon active`;
      } else {
        icon.className = 'bi bi-arrow-down-up sort-icon';
      }
    });
  }

  /**
   * Actualiza la paginacion
   */
  updatePagination() {
    if (!this.paginationEl) return;

    const totalItems = this.state.filteredData.length;
    const totalPages = Math.ceil(totalItems / this.config.pagination.pageSize);
    const currentPage = this.state.currentPage;

    this.paginationEl.innerHTML = '';

    if (totalPages <= 1) {
      this.paginationEl.innerHTML = `<span class="pagination-info">Mostrando ${totalItems} registro${totalItems !== 1 ? 's' : ''}</span>`;
      return;
    }

    // Informacion
    const start = (currentPage - 1) * this.config.pagination.pageSize + 1;
    const end = Math.min(currentPage * this.config.pagination.pageSize, totalItems);
    
    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Mostrando ${start}-${end} de ${totalItems}`;
    this.paginationEl.appendChild(info);

    // Botones
    const buttons = document.createElement('div');
    buttons.className = 'pagination-buttons';

    // Anterior
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => this.goToPage(currentPage - 1));
    buttons.appendChild(prevBtn);

    // Paginas
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.appendChild(this.createPageButton(1));
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        buttons.appendChild(ellipsis);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.appendChild(this.createPageButton(i));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        buttons.appendChild(ellipsis);
      }
      buttons.appendChild(this.createPageButton(totalPages));
    }

    // Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => this.goToPage(currentPage + 1));
    buttons.appendChild(nextBtn);

    this.paginationEl.appendChild(buttons);
  }

  /**
   * Crea un boton de pagina
   * @param {number} page - Numero de pagina
   * @returns {HTMLElement}
   */
  createPageButton(page) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pagination-btn';
    btn.textContent = page;
    if (page === this.state.currentPage) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => this.goToPage(page));
    return btn;
  }

  /**
   * Navega a una pagina especifica
   * @param {number} page - Numero de pagina
   */
  goToPage(page) {
    const totalPages = Math.ceil(this.state.filteredData.length / this.config.pagination.pageSize);
    if (page < 1 || page > totalPages) return;
    
    this.state.currentPage = page;
    this.updateTableBody();
    this.updatePagination();
  }

  /**
   * Reinicia todos los filtros
   */
  resetFilters() {
    this.config.filters.forEach(filter => {
      this.state.filters[filter.key] = filter.type === 'multi-select' ? [] : '';
      
      // Resetear el elemento DOM
      const selector = `#filter-${this.config.tableId}-${filter.key}`;
      const el = this.filtersEl.querySelector(selector);
      
      if (el) {
        if (el.tagName === 'SELECT') {
          el.selectedIndex = 0;
        } else if (el.tagName === 'INPUT') {
          el.value = '';
        }
      }

      // Para multi-select, desmarcar checkboxes
      if (filter.type === 'multi-select') {
        const wrapper = this.filtersEl.querySelector(`[data-filter="${filter.key}"]`) ||
                        this.filtersEl.querySelectorAll('.multi-select-wrapper')[
                          this.config.filters.findIndex(f => f.key === filter.key)
                        ];
        if (wrapper) {
          wrapper.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
          });
          const btn = wrapper.querySelector('.multi-select-btn');
          if (btn) btn.textContent = filter.placeholder || 'Seleccionar...';
        }
      }

      // Para date-range
      if (filter.type === 'date-range') {
        const wrappers = this.filtersEl.querySelectorAll('.date-range-wrapper');
        const wrapper = wrappers[this.config.filters.filter(f => f.type === 'date-range').indexOf(filter)];
        if (wrapper) {
          wrapper.querySelectorAll('input').forEach(input => input.value = '');
        }
      }
    });

    this.state.currentPage = 1;
    this.state.sortColumn = null;
    this.state.sortDirection = 'asc';
    
    this.applyFiltersAndSort();
  }

  /**
   * Actualiza los datos de la tabla
   * @param {Array|Function} newData - Nuevos datos
   */
  setData(newData) {
    this.config.data = newData;
    this.state.currentPage = 1;
    this.applyFiltersAndSort();
  }

  /**
   * Actualiza una fila especifica
   * @param {number} index - Indice de la fila en los datos originales
   * @param {Object} newRowData - Nuevos datos para la fila
   */
  updateRow(index, newRowData) {
    if (typeof this.config.data === 'function') {
      console.warn('DynamicTable: Cannot update row when data is a function');
      return;
    }
    if (this.config.data[index]) {
      this.config.data[index] = { ...this.config.data[index], ...newRowData };
      this.applyFiltersAndSort();
    }
  }

  /**
   * Obtiene los datos filtrados actuales
   * @returns {Array}
   */
  getFilteredData() {
    return this.state.filteredData;
  }

  /**
   * Aplica un filtro externo a la tabla
   * @param {Function} filterFn - Función que recibe cada fila y retorna true/false
   */
  filter(filterFn) {
    this.state.externalFilter = filterFn;
    this.applyFiltersAndSort();
  }

  /**
   * Limpia el filtro externo
   */
  clearExternalFilter() {
    this.state.externalFilter = null;
    this.applyFiltersAndSort();
  }

  /**
   * Destruye el componente y limpia el DOM
   */
  destroy() {
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
      this.containerEl.classList.remove('dynamic-table-wrapper');
    }
    this.tableEl = null;
    this.filtersEl = null;
    this.paginationEl = null;
  }

  /**
   * Refresca la tabla manteniendo el estado
   */
  refresh() {
    this.applyFiltersAndSort();
  }
}

// Exportar para uso global
window.DynamicTable = DynamicTable;

