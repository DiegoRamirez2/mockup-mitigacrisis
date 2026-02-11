# REGLAS
- Trabajarás únicamente dentro de la carpeta `final_mockup`, aquí será todo tu entorno de trabajo a menos que se te solicite consultar un documento externo
- La estructura del proyecto actual es la siguiente:
    - `index.html` que contendrá el esqueleto del mockup a construir.
        - Las vistas que vienen desde `mockup_final.html` se deben mantener, pueden cambiar sus nombres, pero la estructura y contenido debe mantenerse, el `index.html` es ajuste para mejor control y estructuración.
        - Las vistas deben comentarse con `<!-- INICIO VISTA: Nombre vista -->` y luego cerrarse con `<!-- FIN VISTA: Nombre vista -->`.
         - También debe comentarse los componentes o submódulos grandes que hayan dentro de una vista de la siguiente forma: `<!-- Inicio - Nombre vista: Nombre componente/submodulo -->`, mismo formato de cierre.
         - Cuando se quiera modificar una vista específica o un componente grande, basta con realizar la búsqueda a través de los comentarios.
    - `js` es la carpeta que contiene lo siguiente:
        - `\components` que tiene componentes a reutilizar, la idea es que si algo ya está construido, no volver a hacerlo, solo reutilizar
        - `chart.js` que contiene los distintos gráficos del mockup en construcción.
        - `datastore.js` que posee la estructura de datos sobre la cual persiste la información, la idea es que no haya nada estático diferente por vista, sino que se utilice/actualice y transforme los datos que hay ahí para dar un sentido de fluidez de los datos en una demo. PROHIBIDO usar datos estáticos que no están en el datastore
        - `functions.js` son las funciones implementadas para el mockup, la idea es que estas sean reutilizadas si es posible para evitar generación de código extra.
    - `mockup_final.html` es el mockup antiguo, este posee la estructura y diseño que se busca replicar en
        `index.html` pero con reutilización de código, eliminación de emojis y una estructura de datos persistente. Es el ejemplo de cómo debe ser la vista, pero que debe ser reformulada.
        - Dentro del `mockup_final.html` hay comentarios del estilo "<!-- VISTA: Catálogos -->" que indican cuando empieza y termina una vista, es necesario que utilices esto para focalizar el código importante y no tomar contexto de más ni perder tiempo explorando todo el archivo.
    - `css` es la carpeta que contiene lo siguiente:
        - `\components` que contiene componentes a reutilizar en estilo, la idea es que si algo ya está construido (estilos), no volver a hacerlo
        - `styles.css` contiene los estilos centralizados, la idea es reutilizar de allí para evitar repetir estilos que ya existen.
    - `BCMS_PostgreSQL_schema_v10.sql` corresponde a la arquitectura propuesta (pero que puede cambiar dependiendo del resultado final de este mockup con su `datastore.js`), la idea es que sirva como base.
    - `BCMS_PostgreSQL_schema_v9.sql` corresponde a la versión pasada de la arquitectura que sirva para comparar como estaba diseñado antes y cómo está ahora.

# Contexto
El proyecto actual consiste en el diseño de una DEMO para BCMS (Business Continuity Management System) para la empresa GrupoMitiga, el nombre propuesto por ahora es MitigaResilience. La idea es que el sistema cumpla con la ISO 22301 y sus requisitos, la idea es que el sistema funcione en cascada, que lo que se alimente en el apartado anterior, sirva para utilizar en la siguiente vista, ejemplo: Vista 1 se llena, Vista 2 lo usa, Vista 3 usa lo que hay en Vista 2 (ordenado en el sidebar). El diseño está hecho con HTML, CSS y JS vanilla, solo se usan íconos de Bootstrap (están prohibidos los emojis o símbolos raros).

# Arquitectura
El sistema se organiza en **vistas (módulos)** que cubren el ciclo BCMS y el cumplimiento multi-norma (ISO 22301, ISO 27001, NIST CSF, etc.).
La regla base es: **Datos Maestros** es el hub (source of truth) y el resto de vistas **consumen** esa base para análisis, operación, evidencia, auditoría y mejora.

## Vistas del sistema

### 1) Datos Maestros
**Propósito:** catálogo central del sistema + legado que debe mantenerse invariante.  
**Registra:** Organizaciones, Macroprocesos/Procesos, Activos, Ubicaciones, Taxonomías, Proveedores base, etc.  
**Alimenta:** BIA, RIA, Planes, Proveedores críticos, Incidentes/Crisis, Cumplimiento y Reportes.

### 2) Normativas y Plantillas
**Propósito:** repositorio de normativas y plantillas “importables” (estructura de dominios/categorías/controles).  
**Ejemplos:** ISO 22301, ISO 27001, NIST CSF 2.0, leyes locales.  
**Salida:** estructura lista para que el cliente gestione controles/estado/evidencias en Cumplimiento y Auditoría.

### 3) Proveedores & Terceros Críticos
**Propósito:** evaluación detallada (TPRM) de proveedores registrados en Datos Maestros y su impacto en continuidad.  
**Incluye:** criticidad, dependencias, SLAs, contratos, controles, planes de contingencia, seguimiento y evidencias.  
**Cubre ISO:** control de procesos tercerizados / cadena de suministro (asegurar continuidad en servicios externalizados).

### 4) Gestión de cambios BCMS
**Propósito:** registrar y auditar cambios del BCMS (gobierno, planes, controles, infraestructura, roles).  
**Incluye:** solicitud → evaluación → aprobación → implementación → verificación.  
**Conecta:** Hallazgos/Acciones correctivas, Lecciones aprendidas, Auditoría, Planes.

### 5) Configuración del sistema
**Propósito:** configuración técnica de plataforma (no operativa).  
**Incluye:** parámetros de canales (SMTP/SMS/webhooks/APIs), integraciones (API keys), logs técnicos, backups/restauración.

---

## Vistas operativas recomendadas (aparecen en el diseño / son necesarias para ISO 22301)

### 6) Contexto y Alcance del BCMS (EXPLÍCITO)
**Propósito:** declarar “qué cubre” el BCMS y bajo qué condiciones.  
**Debe contener:** alcance (scope) versionado, partes interesadas y requisitos, obligaciones regulatorias, supuestos y límites.  
> Nota: puede vivir dentro de “Políticas & Estrategias”, pero debe estar **nombrado** y **versionado**.

### 7) Políticas & Estrategias (Gobierno)
**Propósito:** política BCMS, objetivos, roles/autoridades, y lineamientos de continuidad.  
**Salida:** base para auditorías y para justificar priorización (qué es crítico y por qué).

### 8) Riesgos y Oportunidades del BCMS (cl. 6.1) (EXPLÍCITO)
**Propósito:** gestionar riesgos del **sistema de gestión** (no los escenarios de disrupción).  
**Ejemplos:** falta de recursos, baja competencia, documentación incompleta, planes sin pruebas, deuda de auditoría, etc.  
**Salida:** acciones de mejora / cambios BCMS / objetivos.

### 9) BIA – Análisis de Impacto
**Propósito:** determinar criticidad e impactos; definir RTO/RPO y dependencias por proceso.  
**Salida:** insumos para RIA y para diseñar/ajustar estrategias y planes (BCP/DRP).

### 10) RIA – Análisis de Riesgos de Disrupción (cl. 8.2)
**Propósito:** evaluar escenarios de disrupción que afectan continuidad (probabilidad/impacto/nivel/residual).  
**Salida:** priorización de tratamientos, necesidades de controles y ajustes de planes.

### 11) Estrategias y Soluciones (cl. 8.3) (EXPLÍCITO)
**Propósito:** definir “cómo” se asegura continuidad antes del plan (redundancia, alternativas, capacidades mínimas, etc.).  
**Salida:** decisiones de arquitectura/capacidad que sustentan BCP/DRP (no solo procedimientos).

### 12) Planes de Continuidad (BCP)
**Propósito:** procedimientos por proceso crítico (activación, responsables, pasos, dependencias).  
**Entrada:** BIA + RIA + Estrategias/Soluciones + Recursos/Capacidades.

### 13) Planes de Recuperación TI (DRP)
**Propósito:** recuperación tecnológica alineada a RTO/RPO (servicios, apps, infraestructura).  
**Entrada:** BIA/RTO-RPO + Estrategias + dependencias de TI.

### 14) Recursos & Capacidades
**Propósito:** mapear capacidades disponibles/necesarias (personas, sitios, TI, proveedores, inventario, etc.).  
**Salida:** soporte para BCP/DRP y validación de factibilidad.

### 15) Incidentes, Crisis y Comunicaciones
**Incidentes:** registro, severidad, escalamiento, vínculo a planes.  
**Crisis:** comité, decisiones, activación y seguimiento.  
**Comunicaciones:** ejecución operativa (plantillas, envíos, bitácora).  
> La “plomería” del canal vive en Configuración; el uso operativo vive aquí.

### 16) Pruebas y Simulacros (cl. 8.5 / 8.6)
**Propósito:** ejecutar ejercicios y demostrar capacidad de respuesta/recuperación.  
**Debe incluir explícito:** evaluación de **capacidad** y de **documentación** (qué funcionó, qué no, evidencia).

### 17) Auditoría, Hallazgos y Planes de Acción (cl. 9.2 / 10.2)
**Propósito:** auditoría interna, no conformidades, acciones correctivas y verificación de eficacia.  
**Salida:** cambios BCMS + actualización de planes/controles + mejora continua.

### 18) Revisión por la Dirección (Management Review) (cl. 9.3) (EXPLÍCITO)
**Propósito:** revisión formal de desempeño del BCMS y decisiones de dirección.  
**Debe guardar:** agenda/inputs, decisiones/outputs, asignaciones y seguimiento.

### 19) Monitoreo, Medición y KPIs (cl. 9.1) (EXPLÍCITO)
**Propósito:** definir qué se mide, cómo, cuándo y con qué criterios (no solo “dashboard”).  
**Ejemplos:** % planes probados, tiempos de recuperación logrados vs objetivo, hallazgos abiertos, cumplimiento de controles, etc.

### 20) Reportes Ejecutivos
**Propósito:** consolidar estado (cumplimiento, riesgos, planes, operación, auditoría) para dirección y regulador.

---

## Reglas de diseño (para mantener alineación ISO 22301)
- **Separación obligatoria de riesgos:**
  - **Riesgos del BCMS (6.1)** ≠ **Riesgos de disrupción (8.2)**.
- **Trazabilidad end-to-end:** proceso/activo/proveedor → BIA → RIA → estrategia/solución → plan (BCP/DRP) → prueba → evidencia → auditoría → acción → cambio.
- **Información documentada:** todo lo “normativo/operativo” relevante debe ser versionado, aprobable y auditable (políticas, alcance, planes, evidencias, actas).

---

## Checklist de cobertura ISO 22301 (módulos)
✅ BIA / RIA / Planes / Incidentes-Crisis / Pruebas / Auditoría-Hallazgos / Cambios  
⚠️ Debe estar explícito para decir “100%”:  
- Contexto y Alcance del BCMS  
- Información documentada (control de documentos/evidencia)  
- Riesgos y oportunidades del BCMS (6.1)  
- Estrategias y soluciones (8.3)  
- Revisión por la Dirección (9.3)  
- Monitoreo y Medición formal (9.1)

---

# Que hacer
- Siempre que necesites responder una pregunta de diseño, de lógica de negocios, etc. Apoyate en el archivo `final_mockup\mockup_v2\docs\BCMS_PostgreSQL_schema_v10.sql` para obtener la información correcta. No de los archivos `.md`.
- Siempre que te pidan responder, discutir algo, resumir lo realizado, es a través del chat.
- Ten en cuenta que la información en los archivos `.md` puede estar desactualizada o incompleta, por lo que siempre debes verificar con el archivo de diseño SQL o el `datastore.js`. Esto sucede ya que tú mismo eres el que crea los archivos `.md`.
- Toda tabla que no sea intermedia y cuente como una entidad, debe tener los campos de auditoría: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`, `is_deleted`  (esto no aplica para `final_mockup\mockup_v2\docs\BCMS_PostgreSQL_schema_v10.sql`). Salvo casos excepcionales que se te indiquen.
- Los tipos de dato en `datastore.js` poseen reglas para insertarlo o modificarlos, revisar `BCMS_datastore_contract.md` para respetar los requisitos y reglas.

- Toda seccion de auditoria en formularios/tablas debe mostrar: Creado el, Actualizado el, Creado por, Actualizado por, Eliminado el, Eliminado por (y estado si aplica).
- Antes de proceder con un cambio grande, siempre confirma los detalles con el usuario a través del chat.
- Las modificaciones se hacen en el `index.html` alimentandose con `mockup_final.html`.
- Para referencias de la ISO 22301 a seguir, usar el documento `final_mockup\mockup_v2\docs\docs\ISO_22301_2019_Guia_Completa_Accesible.md`
- Para referencias del sistema legacy de B-GRC que se usa para importación, revisa : `final_mockup\mockup_v2\docs\docs\MitigaResilience - MitigaData.csv`, pero esto es solo para la migración, las estructuras que se deben mantener para BCMS son las extensiones de las tablas *_bcms

# Que no hacer
- Nunca asumas que la información en los archivos `.md` es correcta sin antes verificarla con el archivo de diseño SQL.
- No respondas preguntas de diseño, lógica de negocios, etc., sin antes consultar el archivo de diseño SQL.
- No modifiques el `final_mockup\mockup_v2\docs\BCMS_PostgreSQL_schema_v10.sql` a menos que se te indique explícitamente hacerlo.
- No usar emojis, siempre íconos.
- **No incluir mensajes explicativos sobre "Relación con Datos Maestros"** o similares en las vistas. Este tipo de información de arquitectura/flujo interno debe ir en la sidebar de "Flujo (referencia interna)" como mapa mental, no en el contenido de las vistas.