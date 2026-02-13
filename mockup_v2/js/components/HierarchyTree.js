/**
 * HierarchyTree - Componente reutilizable para árboles jerárquicos
 * 
 * Componente para renderizar estructuras jerárquicas colapsables
 * Usado en: Datos Maestros (Organización → Macroprocesos → Procesos)
 * 
 * @author BCMS Mitiga
 * @version 1.0.0
 */

class HierarchyTree {
  /**
   * Constructor del componente HierarchyTree
   * @param {Object} config - Configuración del árbol
   * @param {string} config.container - Selector CSS del contenedor
   * @param {Array} config.data - Datos jerárquicos [{id, name, children: [...]}]
   * @param {Object} [config.icons] - Íconos por nivel {level0: 'bi-icon', level1: '...'}
   * @param {Object} [config.colors] - Colores por nivel
   * @param {Function} [config.onNodeClick] - Callback al hacer clic en nodo
   * @param {Function} [config.onNodeExpand] - Callback al expandir/colapsar
   * @param {boolean} [config.expandedByDefault] - Expandir todo por defecto
   * @param {boolean} [config.showCount] - Mostrar conteo de hijos
   */
  constructor(config) {
    this.config = {
      container: null,
      data: [],
      icons: {
        level0: 'bi-building',
        level1: 'bi-diagram-3',
        level2: 'bi-diagram-3',
        level3: 'bi-list-check',
        default: 'bi-folder'
      },
      colors: {
        level0: '#1f6feb',
        level1: '#8b5cf6',
        level2: '#10b981',
        level3: '#f59e0b',
        default: '#64748b'
      },
      onNodeClick: null,
      onNodeExpand: null,
      expandedByDefault: false,
      showCount: true,
      emptyMessage: 'No hay datos para mostrar',
      ...config
    };

    this.containerEl = null;
    this.expandedNodes = new Set();
    
    this.init();
  }

  /**
   * Inicializa el componente
   */
  init() {
    this.containerEl = document.querySelector(this.config.container);
    if (!this.containerEl) {
      console.error(`HierarchyTree: Container "${this.config.container}" not found`);
      return;
    }

    if (this.config.expandedByDefault) {
      this.expandAll();
    }

    this.render();
  }

  /**
   * Renderiza el árbol completo
   */
  render() {
    this.containerEl.innerHTML = '';
    this.containerEl.className = 'hierarchy-tree-container';
    
    // Estilos del contenedor
    this.containerEl.style.cssText = `
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      max-height: 600px;
      overflow-y: auto;
    `;

    // Estado vacío
    if (!this.config.data || this.config.data.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'tree-empty';
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
      `;
      emptyState.innerHTML = `
        <i class="bi bi-folder2-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>${this.config.emptyMessage}</p>
      `;
      this.containerEl.appendChild(emptyState);
      return;
    }

    // Renderizar nodos raíz
    const tree = document.createElement('div');
    tree.className = 'hierarchy-tree';
    
    this.config.data.forEach(node => {
      const nodeEl = this.createNode(node, 0);
      tree.appendChild(nodeEl);
    });

    this.containerEl.appendChild(tree);
  }

  /**
   * Crea un nodo del árbol
   * @param {Object} node - Datos del nodo
   * @param {number} level - Nivel de profundidad
   * @returns {HTMLElement}
   */
  createNode(node, level) {
    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'tree-node-wrapper';
    nodeWrapper.dataset.nodeId = node.id;
    nodeWrapper.dataset.level = level;
    
    // Nodo principal
    const nodeEl = document.createElement('div');
    nodeEl.className = 'tree-node';
    nodeEl.style.cssText = `
      display: flex;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 4px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
      padding-left: ${12 + (level * 24)}px;
    `;

    // Hover effect
    nodeEl.addEventListener('mouseenter', () => {
      nodeEl.style.background = 'rgba(59, 130, 246, 0.05)';
    });
    nodeEl.addEventListener('mouseleave', () => {
      nodeEl.style.background = 'transparent';
    });

    // Click event
    nodeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Expandir/colapsar si tiene hijos
      if (node.children && node.children.length > 0) {
        this.toggleNode(node.id);
      }
      
      // Callback de click
      if (this.config.onNodeClick) {
        this.config.onNodeClick(node, level);
      }
    });

    // Botón de expandir/colapsar (si tiene hijos)
    if (node.children && node.children.length > 0) {
      const expandBtn = document.createElement('span');
      expandBtn.className = 'tree-expand-btn';
      expandBtn.style.cssText = `
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        color: var(--text-muted);
        font-size: 12px;
      `;
      
      const isExpanded = this.expandedNodes.has(node.id);
      expandBtn.innerHTML = `<i class="bi bi-chevron-${isExpanded ? 'down' : 'right'}"></i>`;
      
      nodeEl.appendChild(expandBtn);
    } else {
      // Espaciador si no tiene hijos
      const spacer = document.createElement('span');
      spacer.style.cssText = 'width: 20px; margin-right: 8px;';
      nodeEl.appendChild(spacer);
    }

    // Ícono del nodo
    const icon = document.createElement('span');
    icon.className = 'tree-node-icon';
    const iconClass = this.config.icons[`level${level}`] || this.config.icons['default'];
    const iconColor = this.config.colors[`level${level}`] || this.config.colors['default'];
    
    icon.style.cssText = `
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      margin-right: 10px;
      color: ${iconColor};
      font-size: 14px;
    `;
    icon.innerHTML = `<i class="bi ${iconClass}"></i>`;
    nodeEl.appendChild(icon);

    // Nombre del nodo
    const name = document.createElement('span');
    name.className = 'tree-node-name';
    name.style.cssText = `
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-main);
    `;
    name.textContent = node.name || `Nodo ${node.id}`;
    nodeEl.appendChild(name);

    // Contador de hijos (opcional)
    if (this.config.showCount && node.children && node.children.length > 0) {
      const count = document.createElement('span');
      count.className = 'tree-node-count';
      count.style.cssText = `
        background: rgba(59, 130, 246, 0.1);
        color: var(--accent-primary);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        margin-left: 8px;
      `;
      count.textContent = node.children.length;
      nodeEl.appendChild(count);
    }

    // Badge personalizado (si existe)
    if (node.badge) {
      const badge = document.createElement('span');
      badge.className = `badge badge-${node.badge.type || 'neutral'}`;
      badge.style.cssText = 'margin-left: 8px; font-size: 10px;';
      badge.textContent = node.badge.text;
      nodeEl.appendChild(badge);
    }

    nodeWrapper.appendChild(nodeEl);

    // Contenedor de hijos
    if (node.children && node.children.length > 0) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      childrenContainer.dataset.parentId = node.id;
      childrenContainer.style.display = this.expandedNodes.has(node.id) ? 'block' : 'none';

      node.children.forEach(child => {
        const childNode = this.createNode(child, level + 1);
        childrenContainer.appendChild(childNode);
      });

      nodeWrapper.appendChild(childrenContainer);
    }

    return nodeWrapper;
  }

  /**
   * Expande o colapsa un nodo
   * @param {string|number} nodeId - ID del nodo
   */
  toggleNode(nodeId) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }

    // Callback de expansión
    if (this.config.onNodeExpand) {
      this.config.onNodeExpand(nodeId, this.expandedNodes.has(nodeId));
    }

    this.render();
  }

  /**
   * Expande un nodo específico
   * @param {string|number} nodeId - ID del nodo
   */
  expandNode(nodeId) {
    if (!this.expandedNodes.has(nodeId)) {
      this.expandedNodes.add(nodeId);
      this.render();
    }
  }

  /**
   * Colapsa un nodo específico
   * @param {string|number} nodeId - ID del nodo
   */
  collapseNode(nodeId) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
      this.render();
    }
  }

  /**
   * Expande todos los nodos
   */
  expandAll() {
    const getAllIds = (nodes) => {
      let ids = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children) {
          ids = ids.concat(getAllIds(node.children));
        }
      });
      return ids;
    };

    const allIds = getAllIds(this.config.data);
    allIds.forEach(id => this.expandedNodes.add(id));
    this.render();
  }

  /**
   * Colapsa todos los nodos
   */
  collapseAll() {
    this.expandedNodes.clear();
    this.render();
  }

  /**
   * Busca y resalta nodos por texto
   * @param {string} searchText - Texto a buscar
   */
  search(searchText) {
    if (!searchText) {
      this.render();
      return;
    }

    const searchLower = searchText.toLowerCase();
    
    // Encuentra nodos que coinciden
    const findMatches = (nodes, matches = []) => {
      nodes.forEach(node => {
        if (node.name.toLowerCase().includes(searchLower)) {
          matches.push(node.id);
        }
        if (node.children) {
          findMatches(node.children, matches);
        }
      });
      return matches;
    };

    const matches = findMatches(this.config.data);
    
    // Expandir padres de nodos encontrados
    // (lógica simplificada, en producción buscaría toda la ruta)
    matches.forEach(id => this.expandedNodes.add(id));
    
    this.render();

    // Resaltar nodos encontrados
    setTimeout(() => {
      matches.forEach(id => {
        const nodeEl = this.containerEl.querySelector(`[data-node-id="${id}"] .tree-node`);
        if (nodeEl) {
          nodeEl.style.background = 'rgba(251, 191, 36, 0.2)';
          nodeEl.style.border = '2px solid #fbbf24';
        }
      });
    }, 100);
  }

  /**
   * Actualiza los datos del árbol
   * @param {Array} newData - Nuevos datos
   */
  updateData(newData) {
    this.config.data = newData;
    this.render();
  }

  /**
   * Obtiene el nodo por ID (recursivo)
   * @param {string|number} nodeId - ID del nodo
   * @returns {Object|null}
   */
  getNodeById(nodeId) {
    const search = (nodes) => {
      for (let node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
          const found = search(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return search(this.config.data);
  }

  /**
   * Destruye el componente
   */
  destroy() {
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
      this.containerEl.className = '';
    }
    this.expandedNodes.clear();
  }
}

// Exportar para uso global
window.HierarchyTree = HierarchyTree;

