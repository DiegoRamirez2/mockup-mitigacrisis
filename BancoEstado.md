# 1) Mapa de documentos (Document Map)

## 1.1 Anexo 7 Especificaciones Técnicas.pdf (RFP / Bases Técnicas)
- **Propósito:** Definir el alcance funcional, NFR, operación y seguridad de la solución BCMS/GRC a licitar.
- **Alcance:** Requerimientos de solución (web, UX, auth), arquitectura técnica (SaaS/nube), continuidad del servicio (RTO/RPO), operación/soporte, y arquitectura de seguridad (ISO27k, logs, cifrado, backups, etc.).
- **Estructura (secciones relevantes):**
  - **4.2.1 Riesgo Operacional** (p. 25–29): registro de matrices de riesgo, escalas impacto/probabilidad/control, cálculo RI/RR, certificación/aprobaciones, KRI, planes de acción.  
    Fuente: Anexo 7, 4.2.1.1–4.2.1.3, p. 25–29.
  - **4.2.2 Continuidad de Negocio** (p. 34, 49–55): registro BIA/RIA, planes de contingencia/BCP y pruebas, paneles/seguimiento anual, DRP.  
    Fuente: Anexo 7, 4.2.2.1–4.2.2.3, p. 34, 49–55.
  - **4.2.4–4.2.5 Contraloría/Auditoría & Reportería** (p. 56–60, 62): planificación auditoría, observaciones y evidencia; reportes (mapas de calor, exportables, PowerBI).  
    Fuente: Anexo 7, 4.2.4, 4.2.5.1, p. 56–60; 4.2.5.4, p. 62.
  - **5.1 Requerimientos de Solución (UX/Auth/DevOps/Correo/Performance)** (p. 65–66): navegadores, responsividad, autenticación AD Azure (SAML), roles, admin por Banco, respuesta <3000 ms, retención de info digitalizada, ambientes y DevOps, correos con dominio BE vía integración.  
    Fuente: Anexo 7, 5.1.1.2–5.1.1.10, p. 65–66.
  - **5.2 Arquitectura Técnica / Operación** (p. 69–71): DR del servicio (RTO 36h, RPO 1 semana, respaldos en Chile), migración/implementación/capacitación, monitoreo 7x24, soporte y SLAs.  
    Fuente: Anexo 7, 5.2.1.4–5.2.1.6.2, p. 69–71.
  - **5.3 Arquitectura de Seguridad** (p. 72–101): ISO27001/27002, controles de acceso, SDLC seguro, criptografía, red, transferencia, logs, backup y destrucción segura, data at rest, datacenter Tier III.  
    Fuente: Anexo 7, 5.3.1–5.3.2.14, p. 72–101 (TOC p. 4–5).
- **Qué información aporta:** Requisitos (funcionales y NFR), seguridad, operación/soporte, arquitectura técnica, criterios de cumplimiento para licitación.
- **Notas importantes (crítico licitación):**
  - Auth con **AD Azure** (idealmente SAML), y **autorización basada en roles** administrada por Banco. (p. 65–66)
  - **Performance:** respuesta consulta unitaria **< 3000 ms**. (p. 66)
  - **DR del servicio:** **RTO 36 horas** y **RPO 1 semana** + respaldos en Chile. (p. 69)
  - **Seguridad:** alineamiento **ISO27001/27002** + auditorías/hacking + logs/retención/borrado seguro + cifrado fuerte y llaves en poder del Banco. (p. 72–75; 85–101)

---

## 1.2 BCP0355_Operar Convenios de Pago.docx (BCP del proceso)
- **Propósito:** Documentar continuidad operacional del proceso “Operar Convenios de Pago” con escenarios y acciones de contingencia, escalamiento y comunicaciones.
- **Alcance:** Escenario T01 (indisponibilidad de app/servicio crítico puntual) con estrategias por sistema; Escenario T02 (indisponibilidad masiva) sin alternativa.
- **Estructura (tablas relevantes):**
  - **“RESUMEN SISTEMAS Y ESTRATEGIAS ANTE INDISPONIBILIDADES”**: lista de sistemas y estrategia de contingencia por cada uno.  
    Fuente: BCP0355, Tabla “RESUMEN SISTEMAS Y ESTRATEGIAS…”.
  - Tablas por sistema: **secuencia de escalamiento**, **coordinación/comunicación**, y **procedimiento de contingencia** (ej. Motor de Convenios, PA, Finesse, Fusión/Inetdatos, Sitio Privado).  
    Fuente: BCP0355, Tablas “CONTINGENCIA…”, “Rol / Actividad a realizar”.
  - **“OPERATORIA NORMAL PORTAL IPS (URL)”**: batch, rescate/validación/retroalimentación (horarios).  
    Fuente: BCP0355, Tabla “OPERATORIA NORMAL PORTAL IPS (URL)”.
  - **“INDISPONIBILIDAD MASIVA DE SISTEMAS”**: estrategia T02 (se interrumpe proceso; esperar restauración).  
    Fuente: BCP0355, Tabla “INDISPONIBILIDAD MASIVA DE SISTEMAS”.
  - **Personal participante / Documentos relacionados / Bitácora de actualización**.  
    Fuente: BCP0355, Tabla “PERSONAL PARTICIPANTE…”, “DOCUMENTOS RELACIONADOS…”, “BITÁCORA…”.
- **Qué información aporta:** Flujos de contingencia, integraciones operativas (Servibanca, IPS, etc.), roles de operación/soporte, evidencia esperada (bitácora/documentos).
- **Notas importantes (crítico licitación):**
  - Para T01 existen contingencias específicas (p.ej. MCO: descarga de nóminas en Middle Office y carga manual a CDS).  
    Fuente: BCP0355, Tablas “CONTINGENCIA INDISPONIBILIDAD…”.
  - Para T02 (caída masiva) **no existe procedimiento alternativo**.  
    Fuente: BCP0355, Tabla “INDISPONIBILIDAD MASIVA DE SISTEMAS”.

---

## 1.3 BIA Operar Convenios de Pago.xlsx (BIA)
- **Propósito:** Evidenciar análisis de impacto del proceso y sus parámetros (escenarios, escalas, MTPD/RTO).
- **Estructura (hojas relevantes):**
  - **Datos entrevistado**: metadatos de entrevista (fecha, unidad, cargo/rol, etc.).  
    Fuente: BIA, hoja “Datos entrevistado” (formulario).
  - **Análisis Impacto**: matriz por escenarios y bandas de tiempo (0.5h…2–7 días) para 5 tipos de impacto + **MTPD** y **RTO** por escenario.  
    Fuente: BIA, hoja “Análisis Impacto”, filas 3–8; columnas de MTPD/RTO (AK/AL).
  - **Escala por tipo de impacto**: definición de niveles (Bajo/Medio/Alto/Crítico) por Monetario/Procesos/Reputacional/Normativo/Clientes.  
    Fuente: BIA, hoja “Escala por tipo de impacto”.
  - **Análisis Impacto (Calculos)**: mapeo nivel→valor y prioridades por tipo de impacto.  
    Fuente: BIA, hoja “Análisis Impacto (Calculos)”.
  - **Listas Desplegables**: catálogos para niveles y opciones RTO.  
    Fuente: BIA, hoja “Listas Desplegables”.
  - **V°B°**: aprobación/validación del BIA.  
    Fuente: BIA, hoja “V°B°”.
- **Qué información aporta:** Datos del dominio BIA (escenarios, time-bands, escalas), objetivos RTO/MTPD del proceso.
- **Notas importantes (crítico licitación):**
  - En escenarios clave (infraestructura/proveedores/sistemas/ciberataque) se consigna **MTPD 1 hora** y **RTO 30 minutos** (según hoja).  
    Fuente: BIA, hoja “Análisis Impacto”, filas 3,5,6,7,8 y columnas AK/AL.

---

## 1.4 RIA Operar Convenios de Pago.xlsx (RIA / Matriz continuidad)
- **Propósito:** Registrar riesgos de continuidad, controles, evaluaciones y respuesta (incluye pruebas).
- **Estructura (hojas relevantes):**
  - **1 Ficha Discriminación**: datos generales del proceso y discriminantes (incluye si posee matriz).  
    Fuente: RIA, hoja “1 Ficha Discriminación”.
  - **2 Matriz Continuidad**: tabla central (riesgo, factor, control, tipo de impacto, probabilidad, evaluación de control, RI/RR, riesgo inherente/residual, **Beta**, respuesta, contingencia).  
    Fuente: RIA, hoja “2 Matriz Continuidad”, encabezados en fila 3; datos desde fila 4.
  - **3. Pruebas**: registro de pruebas BCP (código, escenario, fecha, tipo, resultado).  
    Fuente: RIA, hoja “3. Pruebas”.
  - **4. Probabilidad**: escala de probabilidad (Muy poco probable…Casi seguro) con rangos.  
    Fuente: RIA, hoja “4. Probabilidad”.
  - **5. Evaluación del Control**: escala (Deficiente…Óptimo) y criterios.  
    Fuente: RIA, hoja “5. Evaluación del Control”.
  - **6. Evaluac. Respuesta al Riesgo**: regla de decisión para respuesta (crear/modificar BCP, mantener plan de pruebas, etc.).  
    Fuente: RIA, hoja “6. Evaluac. Respuesta al Riesgo”.
  - **1. V°B°**: aprobaciones del RIA.  
    Fuente: RIA, hoja “1. V°B°”.
- **Qué información aporta:** Taxonomía de riesgos/controles, regla de respuesta, y evidencia de pruebas.
- **Notas importantes (crítico licitación):**
  - Presencia del campo **“Beta”** y cálculo “Riesgo Residual con Beta / Final” sin definición explícita.  
    Fuente: RIA, hoja “2 Matriz Continuidad”, columnas “Beta / Riesgo Residual con Beta / Riesgo Residual Final”.

---

## 1.5 Ficha Operar Convenios de Pago.xlsx (Ficha de proceso)
- **Propósito:** Caracterizar el proceso (metadatos, volúmenes, locaciones, sistemas, proveedores, personal crítico y contactos).
- **Estructura (hojas relevantes):**
  - **Datos del Proceso**: nombre/áreas/locaciones, cantidad clientes, sistemas críticos asociados, proveedores/contratos, ventanas críticas.  
    Fuente: Ficha, hoja “Datos del Proceso ” (formulario).
  - **4. Personal crítico**: tabla de personal clave (campos de identificación y contacto).  
    Fuente: Ficha, hoja “4. Personal crítico”.
  - **Contactos**: tabla de contactos por ámbito (incluye correos/teléfonos).  
    Fuente: Ficha, hoja “Contactos”.
- **Qué información aporta:** Dependencias (sistemas y proveedores), ventanas operativas, staffing crítico.
- **Notas importantes (crítico licitación):**
  - Lista explícita de sistemas/plataformas y proveedores (incluye contratos).  
    Fuente: Ficha, hoja “Datos del Proceso ”, secciones “Nombre del Aplicativos…” y “Proveedor”.
  - Contiene PII de contactos: debe tratarse con control de acceso y trazabilidad.  
    Fuente: Ficha, hojas “4. Personal crítico” y “Contactos”.

---

# 2) Glosario y definiciones del dominio

| Término | Definición según documento | Fuente | Implicancia para el sistema |
|---|---|---|---|
| **BIA** | Registro/levantamiento para evaluar impacto y definir requerimientos de continuidad por proceso (incluye escenarios y bandas de tiempo). | Anexo 7, 4.2.2.1, p. 34; BIA, hoja “Análisis Impacto” | Debe modelar escenarios, time-bands, impactos por categoría, y derivar MTPD/RTO. |
| **RIA** | Registro para analizar riesgos/controles asociados a continuidad y respuesta (vinculado a BIA y a planes). | Anexo 7, 4.2.2.1, p. 34; RIA, hoja “2 Matriz Continuidad” | Debe registrar riesgos, controles, escalas, cálculos y respuesta; trazabilidad a BCP/DRP. |
| **MTPD** | “Tiempo máximo tolerable para interrumpir una actividad sin causar un impacto significativo para la organización.” | BIA, hoja “Análisis Impacto”, sección definiciones (filas 10–12 aprox.) | Campo clave por proceso/escenario; alimenta criticidad y necesidad de BCP/DRP. |
| **RTO** | “Tiempo máximo permitido de interrupción para recuperar una actividad/proceso/sistema… a un nivel mínimo de servicio aceptable.” | BIA, hoja “Análisis Impacto”, sección definiciones (filas 12–16 aprox.) | Define objetivos de recuperación; se alinea con DR del servicio y diseño técnico. |
| **BCP / Plan de Contingencia** | Plan que contiene pasos, roles, responsabilidades, recursos, pasos alternativos y vuelta a normalidad; se clasifica por tipo de escenario (personas, edificio, ciberataque, infraestructura, sistemas, terceros). | Anexo 7, 4.2.2.2, p. 49–51 | Debe existir catálogo de planes, versionado, aprobación, y relación a procesos/escenarios. |
| **DRP** | Registro/carga de Plan de Recuperación ante Desastres para TI, asociado a continuidad. | Anexo 7, 4.2.2.3, p. 55 | Entidad/artefacto TI con evidencias y relación a RTO/RPO. |
| **KRI** | Indicador continuo asociado a procesos (incluye catálogo, registro periódico y control por umbrales). | Anexo 7, 4.2.1.2, p. 27 | Debe soportar periodicidad, umbrales, alertas y escalamiento. |
| **Plan de Acción** | Acciones correctivas derivadas de hallazgos o KRIs fuera de rango; con responsable, fechas y seguimiento. | Anexo 7, 4.2.1.3, p. 28–29; 4.2.5.2, p. 60 | Workflow de creación, vencimiento, evidencia y escalamiento. |
| **Riesgo Inherente / Residual** | Riesgo antes y después de considerar controles; se calcula desde escalas y evaluación de control. | Anexo 7, 4.2.1.1, p. 25; RIA, hoja “2 Matriz Continuidad” | Reglas de cálculo auditables y consistentes; trazabilidad a escalas. |
| **RI / RR** | Campos numéricos de evaluación (impacto/probabilidad/control) usados en la matriz RIA (nomenclatura de planilla). | RIA, hoja “2 Matriz Continuidad” | Debe documentarse fórmula y trazarse a escalas (gap si no se explicita). |
| **Beta** | Campo numérico usado en cálculo “Riesgo residual con Beta / final”, sin definición explícita. | RIA, hoja “2 Matriz Continuidad” | Debe modelarse como campo; requiere aclaración normativa/metodológica. |

---

# 3) Taxonomía de módulos (BCMS/GRC)

> Nota: la estructura propone módulos estándar **y** referencia explícita a los documentos que los respaldan.

## 3.1 Riesgo Operacional
- **Objetivo:** Registrar, evaluar y gestionar riesgos, controles, KRIs y planes de acción del Banco.
- **Subcapacidades:**
  - Matrices de riesgo (registro/edición/cálculo inherente-residual/certificación)
  - Catálogos (procesos, riesgos, factores, controles, responsables)
  - KRIs (catálogo, medición continua, umbrales, alertas)
  - Planes de acción (ciclo de vida, vencimientos, evidencias)
- **Entradas/Salidas (alto nivel):**
  - Entradas: procesos, riesgos, escalas, controles, KRIs, mediciones.
  - Salidas: mapas de calor, reportes consolidados, planes de acción y su estado.
- **Documentos respaldo:** Anexo 7 (4.2.1.1–4.2.1.3, p. 25–29); RIA (matriz continuidad como caso de uso).

## 3.2 Continuidad de Negocio (BCMS)
- **Objetivo:** Administrar BIA, RIA, BCP/Planes y pruebas; asegurar trazabilidad a riesgos y requerimientos de continuidad.
- **Subcapacidades:**
  - Registro BIA/RIA y escalas
  - Catálogo de planes BCP (por escenario) + versionado y aprobación
  - Gestión de pruebas (planificación/ejecución/evaluación/reportes)
  - Paneles de continuidad por proceso (ficha+BIA+RIA+BCP) y seguimiento anual
  - DRP (carga/relación con RTO/RPO)
- **Entradas/Salidas:**
  - Entradas: fichas de proceso, escenarios, planes, evidencia de pruebas.
  - Salidas: estado de cumplimiento anual, reportes ejecutivos de pruebas, auditoría.
- **Documentos respaldo:** Anexo 7 (4.2.2.1–4.2.2.3, p. 34, 49–55); BCP0355; BIA xlsx; RIA xlsx; Ficha xlsx.

## 3.3 Base de Pérdidas (si aplica)
- **Objetivo:** Registrar eventos/pérdidas y explotar analítica para control/apetito.
- **Subcapacidades:** eventos de pérdida, clasificación, causa raíz, recuperación, reportes.
- **Documentos respaldo:** Anexo 7 indica **“Deseable”** contar con módulo de base de pérdidas. (Anexo 7, p. 55–56)

## 3.4 Contraloría / Auditoría Interna
- **Objetivo:** Planificar auditorías con enfoque basado en riesgos y gestionar observaciones y evidencias.
- **Subcapacidades:**
  - Planificación auditoría (ranking por evaluación de riesgos; universo de procesos/entidades)
  - Gestión de observaciones (alta/med/baja; evidencias; prórrogas; escalamiento)
  - Portal de seguimiento para auditados
- **Documentos respaldo:** Anexo 7, 4.2.4 y 4.2.5.2, p. 56–60.

## 3.5 Reportería / Tableros / Analítica
- **Objetivo:** Entregar reporting operativo/ejecutivo y exportables; habilitar BI.
- **Subcapacidades:** mapas de calor, reportes consolidados, export (Excel/Word/PDF), integración PowerBI.
- **Documentos respaldo:** Anexo 7, 4.2.5.4, p. 62.

## 3.6 Servicios transversales
- **Integraciones:** AD Azure/SAML, correo (API), BI, SFTP/Batch, SIEM (si aplica).
  - Respaldo: Anexo 7, p. 65–66, 87–88, 95–96.
- **Gestión documental/archivos:** evidencias, anexos, reportes de pruebas, documentos BCP/DRP.
  - Respaldo: Anexo 7 (retención de info digitalizada, p. 66; evidencias auditoría p. 60); RIA “3. Pruebas”.
- **Perfiles/ambientes:** dev/test/qa/prod, DevOps.
  - Respaldo: Anexo 7, 5.1.1.9, p. 66.
- **Tracking/auditoría:** logs inmutables, no repudio, reportes.
  - Respaldo: Anexo 7, 5.3.2.10, p. 95–96; 5.3.2.3, p. 82.
- **Soporte:** monitoreo 7x24, canales, SLA, tiempos.
  - Respaldo: Anexo 7, 5.2.1.6, p. 70–71.

## 3.7 IAM / Directorio Activo
- **Objetivo:** Autenticación y autorización (roles/perfiles) con administración por Banco.
- **Subcapacidades:** SSO AD Azure (SAML ideal), RBAC, administración por Banco, reportes de acceso.
- **Documentos respaldo:** Anexo 7, 5.1.1.4–5.1.1.6, p. 65–66; 5.3.2.3, p. 82.

## 3.8 Arquitectura técnica / DevOps / Performance / DR
- **Objetivo:** Asegurar resiliencia, RTO/RPO del servicio, despliegue controlado y performance.
- **Documentos respaldo:** Anexo 7, 5.2.1.4, p. 69; 5.1.1.7, p. 66; 5.1.1.9, p. 66.

## 3.9 Seguridad
- **Objetivo:** Cumplimiento de controles BE (ISO27k, criptografía, logs, backups, destrucción segura, datacenter).
- **Documentos respaldo:** Anexo 7, 5.3.1–5.3.2.14, p. 72–101.

---

# 4) Catálogo de requisitos (Requirements Catalogue)

> Convención de prioridad usada: **Must/Should/Could**. “Could” se usa cuando el documento lo marca como “Deseable” o lo sugiere (p.ej. base de pérdidas; módulo de pruebas deseable).

| ReqID | Módulo | Tipo | Prioridad | Requisito (El sistema debe…) | Fuente | Criterio de aceptación / Evidencia | Notas / Dependencias |
|---|---|---|---|---|---|---|---|
| BE-ANX7-5.1.1.4-01 | IAM | Seguridad | Must | …integrarse con **AD Azure** del Banco para autenticación online con credenciales Banco (idealmente **SAML**). | Anexo 7, 5.1.1.4, p. 65 | Prueba SSO con usuarios BE; evidencia de configuración SAML/IdP. | Dep: definición técnica de AD Azure/IdP. |
| BE-ANX7-5.1.1.5-01 | IAM | Funcional | Must | …implementar **roles y perfiles** ajustables según defina el Banco. | Anexo 7, 5.1.1.5, p. 66 | Catálogo de roles; pruebas de autorización por rol. |  |
| BE-ANX7-5.1.1.6-01 | IAM | Operacional | Must | …permitir que **la administración de la autorización** sea realizada por el Banco. | Anexo 7, 5.1.1.6, p. 66 | Rol “Admin Banco” puede crear/editar roles y asignaciones. | Aclarar gobierno: Banco vs proveedor. |
| BE-ANX7-5.1.1.7-01 | Plataforma | No funcional | Must | …asegurar tiempo de respuesta **< 3000 ms** para consulta unitaria del portal web. | Anexo 7, 5.1.1.7, p. 66 | Prueba performance (carga) con métricas p95/p99 ≤ 3000ms (definir). | No se especifica concurrencia/volumen. |
| BE-ANX7-5.1.1.9-01 | DevOps | No funcional | Must | …soportar ambientes **Dev/Test/QA/Prod** y prácticas DevOps para probar integraciones batch/en línea antes de Prod. | Anexo 7, 5.1.1.9, p. 66 | Evidencia de pipeline + entornos separados + despliegue controlado. |  |
| BE-ANX7-5.1.1.10-01 | Integraciones | Funcional | Must | …integrarse para envío de correos con dominio BancoEstado mediante el mecanismo que el Banco defina (API REST u otro). | Anexo 7, 5.1.1.10, p. 66 | Prueba envío notificaciones vía integración definida por BE. | Dep: servicio correo BE. |
| BE-ANX7-5.2.1.4-01 | DR Servicio | No funcional | Must | …proveer mecanismos de DR y continuidad del servicio y adjuntar diagramas. | Anexo 7, 5.2.1.4, p. 69 | Entrega de diagramas + prueba de conmutación/restauración. |  |
| BE-ANX7-5.2.1.4-02 | DR Servicio | No funcional | Must | …cumplir **RTO del servicio 36 horas** y **RPO 1 semana**. | Anexo 7, 5.2.1.4, p. 69 | Evidencia de diseño y prueba DR; reportes de backup. |  |
| BE-ANX7-5.2.1.4-03 | DR Servicio | Seguridad | Must | …mantener respaldos (datos y aplicativo) en **Chile** por continuidad operativa. | Anexo 7, 5.2.1.4, p. 69 | Evidencia de ubicación y política de backup. |  |
| BE-ANX7-5.2.1.6.1-01 | Operación | Operacional | Must | …implementar monitoreo proactivo con dashboards/alertas para disponibilidad y continuidad. | Anexo 7, 5.2.1.6.1, p. 70–71 | Monitoreo activo + panel BE + alertas configuradas. |  |
| BE-ANX7-5.2.1.6.1-02 | Operación | Operacional | Must | …operar monitoreo proactivo **7x24x365** y reactivo a demanda. | Anexo 7, 5.2.1.6.1, p. 71 | SLA/OLA + bitácora de monitoreo. |  |
| BE-ANX7-5.2.1.6.2-01 | Soporte | Operacional | Must | …disponer canales diferenciados para requerimientos/soporte/incidentes. | Anexo 7, 5.2.1.6.2, p. 71 | Matriz canales + pruebas de atención. |  |
| BE-ANX7-5.2.1.6.2-02 | Soporte | No funcional | Must | …cumplir disponibilidad canal correo 99,95% y canal telefónico 7x9 (req/soporte) y 7x24 (incidentes). | Anexo 7, 5.2.1.6.2, p. 71 | Reporte SLA canal + evidencia de turnos. |  |
| BE-ANX7-5.2.1.6.2-03 | Soporte | No funcional | Must | …asegurar **tiempo medio de atención < 10 min**. | Anexo 7, 5.2.1.6.2, p. 71 | Reporte SLA atención. | Definir severidades y métricas. |
| BE-ANX7-4.2.1.1-01 | Riesgo Op | Funcional | Must | …permitir **registro de matrices de riesgo** asociadas a procesos, con campos (riesgo, factor, control, probabilidad, impacto, efectividad control, etc.) y cálculo automático. | Anexo 7, 4.2.1.1, p. 25 | Pantalla + cálculo reproducible + export. |  |
| BE-ANX7-4.2.1.1-02 | Riesgo Op | Funcional | Must | …administrar **escalas** de impacto, probabilidad y evaluación de control para el cálculo de riesgo inherente/residual. | Anexo 7, 4.2.1.1, p. 25 | ABM de escalas + evidencia de uso en cálculo. |  |
| BE-ANX7-4.2.1.1-03 | Riesgo Op | Operacional | Must | …permitir **certificación/aprobación** de la matriz de riesgo por responsables definidos. | Anexo 7, 4.2.1.1, p. 25 | Flujo de aprobación + registro de auditoría. | Aclarar aprobadores exactos por banco. |
| BE-ANX7-4.2.1.1-04 | Riesgo Op | Funcional | Must | …permitir **edición y carga masiva** (o import) para registro de matrices/riesgos desde fuentes existentes (planillas). | Anexo 7, 4.2.1.1, p. 25–26 (se referencia uso de bases/catálogos y registro) | Evidencia import + trazabilidad de cambios. | No se especifica formato de import. |
| BE-ANX7-4.2.1.2-01 | KRI | Funcional | Must | …mantener **catálogo de KRIs** con nombre, descripción, proceso asociado y umbrales. | Anexo 7, 4.2.1.2, p. 27 | ABM KRI + relación a proceso. |  |
| BE-ANX7-4.2.1.2-02 | KRI | Operacional | Must | …permitir el **registro continuo** (mensual) por dueños de proceso y generar alertas por no registro. | Anexo 7, 4.2.1.2, p. 27 | Notificación automática si falta carga mensual. | Se menciona escalamiento. |
| BE-ANX7-4.2.1.2-03 | KRI | Operacional | Must | …escalar a jefatura si el dueño de proceso no registra indicadores en el periodo. | Anexo 7, 4.2.1.2, p. 27 | Bitácora de notificación y escalamiento. | Dep: jerarquía/roles BE. |
| BE-ANX7-4.2.1.2-04 | KRI | Funcional | Must | …gatillar **plan de acción** si un KRI está fuera de umbral por **3 meses**. | Anexo 7, 4.2.1.2, p. 27 | Regla configurada + creación de plan de acción. | Aclarar si “3 meses” es fijo o parámetro. |
| BE-ANX7-4.2.1.3-01 | Planes de Acción | Funcional | Must | …permitir registrar planes de acción con responsable, actividades, fechas, estado y evidencias. | Anexo 7, 4.2.1.3, p. 28–29; 4.2.5.2, p. 60 | ABM + workflow + carga evidencia. |  |
| BE-ANX7-4.2.1.3-02 | Planes de Acción | Operacional | Must | …notificar **vencimientos** y atrasos de planes de acción. | Anexo 7, 4.2.1.3, p. 29 | Alertas + reporte de atrasos. |  |
| BE-ANX7-4.2.2.1-01 | Continuidad | Funcional | Must | …permitir **registro BIA/RIA por proceso**, incluyendo carga/registro de datos del análisis. | Anexo 7, 4.2.2.1, p. 34 | Pantallas BIA/RIA + vínculo a proceso. |  |
| BE-ANX7-4.2.2.1-02 | Continuidad | Funcional | Must | …incluir información del proceso (ficha) para BIA/RIA: dependencias, sistemas, personal, etc. | Anexo 7, 4.2.2.1, p. 34 (se referencia carga de info de proceso) | Evidencia de relación Ficha→BIA/RIA. |  |
| BE-ANX7-4.2.2.2-01 | BCP/Planes | Funcional | Must | …crear/actualizar planes BCP para procesos críticos en base a riesgo/impacto y escenarios (personas, edificio, ciber, infraestructura, sistemas, terceros). | Anexo 7, 4.2.2.2, p. 49–50 | Catálogo BCP + clasificación por escenario. |  |
| BE-ANX7-4.2.2.2-02 | BCP/Planes | Funcional | Must | …mantener para cada BCP: **código**, nombre, unidad, alcance, vigencia, responsables, pasos de contingencia y vuelta a normalidad. | Anexo 7, 4.2.2.2, p. 50–51 | Formulario completo + versionado. | Campos exactos: ver p. 50–51. |
| BE-ANX7-4.2.2.2-03 | BCP/Planes | Operacional | Must | …soportar **actualización anual** de BCP y trazabilidad de cambios. | Anexo 7, 4.2.2.2, p. 49 | Registro de versionado + bitácora. |  |
| BE-ANX7-4.2.2.2-04 | Pruebas | Funcional | Must | …registrar pruebas con etapas (planificación/desarrollo/evaluación), participantes, resultados y reporte ejecutivo. | Anexo 7, 4.2.2.2, p. 51 | Registro prueba + reporte exportable. |  |
| BE-ANX7-4.2.2.3-01 | Continuidad | Funcional | Must | …proveer un **panel** por proceso que consolide ficha + BIA + RIA + BCP. | Anexo 7, 4.2.2.3, p. 54 | Dashboard por proceso con indicadores. |  |
| BE-ANX7-4.2.2.3-02 | Continuidad | Operacional | Must | …permitir **seguimiento anual** del plan de continuidad (actividades, alertas, % avance). | Anexo 7, 4.2.2.3, p. 54–55 | Panel anual + alertas. |  |
| BE-ANX7-4.2.2.3-03 | DRP | Funcional | Must | …permitir la **carga/gestión de DRP** (plan de recuperación ante desastres TI) asociado a continuidad. | Anexo 7, 4.2.2.3, p. 55 | Registro DRP + relación a RTO/RPO. |  |
| BE-ANX7-BASEPERD-01 | Base de Pérdidas | Funcional | Could | …contar con un módulo de **Base de Pérdidas** (eventos/pérdidas) como capacidad deseable. | Anexo 7, nota “Deseable…Base de Pérdidas”, p. 55–56 | Demo funcional + reportes básicos. | Confirmar alcance exacto esperado. |
| BE-ANX7-4.2.4-01 | Auditoría | Funcional | Must | …planificar auditorías con base en mapa de procesos/entidades y evaluación de riesgos (ranking). | Anexo 7, 4.2.4, p. 56–57 | Plan anual + criterios + reportes. |  |
| BE-ANX7-4.2.5.2-01 | Auditoría | Funcional | Must | …gestionar observaciones (alta/media/baja), asignación, plazos, prórrogas y evidencias. | Anexo 7, 4.2.5.2, p. 60 | Flujo obs→plan acción→cierre con evidencia. |  |
| BE-ANX7-4.2.5.4-01 | Reportería | Funcional | Must | …generar reportes (incl. **mapas de calor**) y exportables (Excel/Word/PDF). | Anexo 7, 4.2.5.4, p. 62 | Reporte generado + export validado. |  |
| BE-ANX7-4.2.5.4-02 | Reportería | Integración | Should | …integrarse o habilitar interoperabilidad con **PowerBI** (o que el Banco cree paneles propios). | Anexo 7, 4.2.5.4, p. 62; 5.2.1.6.1, p. 71 | Dataset/conector + demo PowerBI. | Definir mecanismo (API/DB/Export). |
| BE-ANX7-5.3.1.1-01 | Seguridad | Seguridad | Must | …estar alineado a **ISO27001/ISO27002** y acreditarlo (certificación o GAP analysis). | Anexo 7, 5.3.1.1, p. 72 | Certificación/GAP + plan de remediación. |  |
| BE-ANX7-5.3.2.10-01 | Seguridad | Seguridad | Must | …generar **logs de eventos** con campos mínimos (cuándo/dónde/quién/qué/resultado) y sincronización NTP. | Anexo 7, 5.3.2.10–5.3.2.11, p. 95–97 | Evidencia de logs + ejemplo + NTP. |  |
| BE-ANX7-5.3.2.11-01 | Seguridad | Seguridad | Must | …implementar **respaldo** y pruebas de recuperación, con cifrado y retención controlada. | Anexo 7, 5.3.2.11, p. 97–98 | Reporte backup + prueba restore documentada. |  |
| BE-ANX7-5.3.2.12-01 | Seguridad | Seguridad | Must | …asegurar **borrado/destrucción segura** de medios según inventario y retención. | Anexo 7, 5.3.2.12, p. 98–99 | Procedimiento + evidencias de destrucción. |  |
| BE-BCP-T01-SIST-01 | Continuidad | Operacional | Must | …mantener un catálogo de **sistemas críticos del proceso** y su estrategia de contingencia por indisponibilidad. | BCP0355, Tabla “RESUMEN SISTEMAS Y ESTRATEGIAS…”; Ficha, hoja “Datos del Proceso ” (sistemas) | Pantalla “Sistemas críticos” + estrategias + versionado. | Vincular a Proceso. |
| BE-BCP-T01-ESC-01 | Continuidad | Operacional | Must | …soportar secuencias de **escalamiento y comunicación** para activar contingencia por sistema. | BCP0355, tablas “SECUENCIA…/ACTIVIDADES…” (roles/actividades) | Workflow configurable + notificaciones. | Requiere directorio/roles. |
| BE-BCP-T02-01 | Continuidad | Operacional | Must | …registrar escenarios donde **no hay contingencia** (interrupción total) y controlar comunicación/estado hasta restauración. | BCP0355, Tabla “INDISPONIBILIDAD MASIVA DE SISTEMAS” | Caso de uso “T02” en sistema + bitácora de incidentes. | Se sugiere integrar con ITSM (no especificado). |
| BE-BIA-AI-01 | Continuidad | Funcional | Must | …capturar matriz BIA por **escenario y bandas de tiempo** para impactos (Monetario/Procesos/Reputacional/Normativo/Clientes). | BIA, hoja “Análisis Impacto”, filas 3–8; encabezados | Registro editable + export. |  |
| BE-BIA-AI-02 | Continuidad | Funcional | Must | …registrar **MTPD y RTO** por escenario/proceso y usarlos en criticidad. | BIA, hoja “Análisis Impacto”, columnas AK/AL | Campo MTPD/RTO + reportes. |  |
| BE-RIA-MC-01 | Continuidad | Funcional | Must | …registrar **matriz RIA** con riesgos, controles, escalas y respuesta (incl. contingencia). | RIA, hoja “2 Matriz Continuidad”, fila 3+ | Pantalla matriz + cálculos + export. | Definir fórmula RI/RR/Beta. |
| BE-RIA-PRUEB-01 | Pruebas | Operacional | Must | …registrar pruebas con (código BCP, escenario, fecha, tipo, resultado). | RIA, hoja “3. Pruebas” | Reporte histórico de pruebas. |  |
| BE-FICHA-META-01 | Datos | Funcional | Must | …mantener ficha de proceso con locación, unidades, volumen (clientes), ventanas críticas, y dependencias. | Ficha, hoja “Datos del Proceso ” | Vista ficha + export. |  |
| BE-FICHA-CONTACT-01 | Datos | Seguridad | Must | …almacenar contactos/personal crítico con control de acceso y auditoría (contiene PII). | Ficha, hojas “4. Personal crítico” y “Contactos” | RBAC + auditoría accesos. | Requiere política de privacidad BE. |

> Nota: el catálogo anterior incluye requisitos “núcleo” y los más trazables. El Anexo 7 contiene muchos requisitos de seguridad (5.3) que se detallan en la sección 11 con tabla de controles.

---

# 5) Matriz de trazabilidad (Compliance / Traceability Matrix)

| ReqID | Fuente primaria (RFP/Anexo7) | Fuentes secundarias (BIA/RIA/BCP/Ficha) | Cómo se implementa (feature/config/proceso/integración) | Evidencia esperada | Riesgo si no se cumple | Estado |
|---|---|---|---|---|---|---|
| BE-ANX7-5.1.1.4-01 | Anexo 7 p.65 | — | Integración SSO (SAML) con AD Azure | Prueba login SSO + configuración IdP/SP | Alto | Pendiente |
| BE-ANX7-5.1.1.5-01 | Anexo 7 p.66 | Ficha/RIA (roles operativos) | RBAC + catálogo roles/perfiles | Matriz permisos + test casos | Alto | Pendiente |
| BE-ANX7-4.2.2.1-01 | Anexo 7 p.34 | BIA “Análisis Impacto”; RIA “2 Matriz…” | Módulo BIA/RIA + relación a Proceso | Pantallas + export + auditoría cambios | Alto | Parcial (diseño) |
| BE-ANX7-4.2.2.2-02 | Anexo 7 p.50–51 | BCP0355 tablas | Catálogo BCP + versionado + aprobaciones | Plan BCP versionado + bitácora | Alto | Parcial (diseño) |
| BE-BIA-AI-02 | — | BIA columnas AK/AL | Campos MTPD/RTO + reglas de criticidad | Reporte criticidad + MTPD/RTO | Medio | Pendiente |
| BE-RIA-MC-01 | — | RIA “2 Matriz…” | Módulo RIA + escalas + cálculos | Matriz + cálculo reproducible | Alto | Pendiente |
| BE-ANX7-5.3.2.10-01 | Anexo 7 p.95–97 | — | Logging estándar + inmutabilidad | Evidencia logs + retención + NTP | Alto | Pendiente |
| BE-ANX7-5.2.1.4-02 | Anexo 7 p.69 | — | Arquitectura resiliente + backup/restore | Reporte prueba DR + RTO/RPO | Alto | Pendiente |

---

# 6) Flujos operativos y workflows (especialmente continuidad)

## 6.1 Flujo: Registro y aprobación BIA (Proceso)
- **Disparador:** actualización anual o cambio relevante del proceso / requerimiento continuidad.  
- **Actores:** Dueño de Proceso; Riesgo No Financiero; Jefatura División/Departamento; aprobadores BIA.  
- **Pasos:**
  1) Registrar metadatos de entrevista y proceso. (BIA “Datos entrevistado”)  
  2) Completar matriz de impacto por escenarios y bandas de tiempo. (BIA “Análisis Impacto”)  
  3) Registrar/validar MTPD y RTO. (BIA “Análisis Impacto”, AK/AL)  
  4) Enviar a aprobación (V°B°). (BIA “V°B°”)  
  5) Versionar y publicar BIA.  
- **Entradas/Salidas:** Entradas: ficha proceso, escalas; Salidas: BIA aprobado + criticidad.  
- **Alertas:** pendientes de aprobación; cambios en MTPD/RTO.  
- **Evidencia/auditoría:** historial de versiones + quién aprobó y cuándo.  
- **Fuente:** BIA “V°B°”; Anexo 7 4.2.2.1 p.34.

## 6.2 Flujo: RIA / Matriz de continuidad y decisión de respuesta
- **Disparador:** resultado BIA (criticidad) o actualización de riesgos/controles o incidentes.  
- **Actores:** Dueño Proceso; Riesgo No Financiero; áreas control/operación.  
- **Pasos:**
  1) Registrar riesgos, factores, controles y contingencia asociada. (RIA “2 Matriz Continuidad”)  
  2) Asignar probabilidad y evaluación de control (según escalas). (RIA “4. Probabilidad”, “5. Evaluación del Control”)  
  3) Calcular RI/RR/Riesgo residual (incl. Beta si aplica). (RIA “2 Matriz…”)  
  4) Determinar respuesta (crear/modificar BCP o mantener plan de pruebas). (RIA “6. Evaluac. Respuesta…”)  
  5) Flujo de aprobación (V°B°). (RIA “1. V°B°”)  
- **Entradas/Salidas:** Entradas: BIA aprobado, escalas; Salidas: RIA aprobado + respuesta.  
- **Alertas:** cambios en riesgo residual; pendientes de aprobación.  
- **Evidencia:** export matriz + trazabilidad de cálculo.  
- **Fuente:** RIA hojas “2…”, “4…”, “5…”, “6…”, “1. V°B°”.

## 6.3 Flujo: Creación/actualización BCP (por escenario)
- **Disparador:** Respuesta de riesgo “Se debe crear o modificar un BCP” o “plan existe y no probado”.  
- **Actores:** Dueño Proceso; Continuidad; TI/Soporte; aprobadores.  
- **Pasos:**
  1) Seleccionar proceso y escenario (personas/sistemas/terceros/etc.). (Anexo 7 4.2.2.2 p.49–50)  
  2) Completar metadatos (código BCP, vigencia, responsables, alcance). (Anexo 7 p.50–51)  
  3) Definir pasos, recursos, comunicaciones y vuelta a normalidad. (Anexo 7 p.50–51; BCP0355 tablas)  
  4) Publicar/Versionar y programar pruebas.  
- **Entradas/Salidas:** Entradas: RIA, BIA, ficha; Salidas: BCP versionado.  
- **Alertas:** vencimiento vigencia/actualización anual.  
- **Evidencia:** BCP exportable + bitácora actualización.  
- **Fuente:** Anexo 7 4.2.2.2; BCP0355.

## 6.4 Flujo: Ejecución de contingencia T01 (indisponibilidad puntual)
- **Disparador:** indisponibilidad de sistema crítico del proceso (ej. MCO, Sitio Privado).  
- **Actores:** Mesa soporte / Operaciones convenios / Jefaturas / Comercial (según sistema).  
- **Pasos (ejemplo Motor de Convenios):**
  1) Detección y evaluación impacto; decidir activar contingencia. (BCP0355 tablas de escalamiento/coordinación)  
  2) Descargar nóminas desde Middle Office (Servibanca) y validar no duplicidad. (BCP0355 “CONTINGENCIA… MCO”)  
  3) Refundir y cargar manualmente para procesamiento por CDS. (BCP0355 “CONTINGENCIA… MCO”)  
  4) Validar pagos y continuar batch/distribución normal. (BCP0355 “CONTINGENCIA… MCO”)  
- **Entradas/Salidas:** Nóminas, carta de instrucción (según casos), logs de ejecución.  
- **Alertas:** a jefaturas y áreas comerciales por impacto/plazos.  
- **Evidencia/auditoría:** bitácora de activación, quién decidió, evidencias de carga manual.  
- **Fuente:** BCP0355, tablas “SECUENCIA… MCO” + “CONTINGENCIA… MCO”.

## 6.5 Flujo: Gestión de pruebas de continuidad (BCP)
- **Disparador:** plan anual de continuidad o hallazgo “plan no probado”.  
- **Actores:** Continuidad; Dueños proceso; participantes; auditoría.  
- **Pasos:**
  1) Planificar (fecha, alcance, participantes).  
  2) Ejecutar (actividades y registro).  
  3) Evaluar (resultados, brechas, acciones).  
  4) Reporte ejecutivo y carga en registro de pruebas.  
- **Entradas/Salidas:** Formatos de evaluación y reporte ejecutivo.  
- **Evidencia:** Registro de prueba y resultado. (RIA “3. Pruebas”; Anexo 7 p.51)  
- **Fuente:** Anexo 7 4.2.2.2 p.51; RIA “3. Pruebas”.

---

# 7) Roles, permisos e IAM

| Rol (propuesto / evidenciado) | Permisos esperados | Módulos | Fuente | Notas |
|---|---|---|---|---|
| **Admin Banco (Autorización)** | ABM roles/perfiles, asignaciones, revocación, reportes de usuarios/grupos | IAM transversal | Anexo 7 5.1.1.6 p.66; 5.3.2.3 p.82 | Explícito: “administración por Banco”. |
| **Administrador de Seguridad** | Gestión seguridad (políticas, auditoría, revisión logs, claves según rol) | Seguridad transversal | Anexo 7 5.3.2.3 p.82; 5.3.2.7 p.85–86 | Segregación de funciones requerida. |
| **Auditor** | Acceso lectura a evidencias, logs, reportes; no modificación | Auditoría/Seguridad | Anexo 7 5.3.2.3 p.82; 4.2.5.2 p.60 | No repudio, logs inmutables. |
| **Supervisor / Jefatura** | Aprobar matrices/planes, ver reportes y alertas, escalamientos | Riesgo/Continuidad | Anexo 7 4.2.1.1 p.25; 4.2.1.2 p.27; BIA/RIA “V°B°” | Aprobadores exactos: ver hojas V°B°. |
| **Dueño de Proceso / Responsable Proceso** | Mantener ficha, registrar BIA/RIA, registrar KRIs, ejecutar planes de acción | Riesgo/Continuidad | Anexo 7 4.2.1.2 p.27; 4.2.2.1 p.34; Ficha/BIA/RIA | Debe mapearse a estructura BE. |
| **Operador Continuidad** | Crear/actualizar BCP, planificar pruebas, panel anual | Continuidad | Anexo 7 4.2.2.2–4.2.2.3 |  |
| **Usuario Operativo (Abonos/Soporte)** | Ejecutar workflows de contingencia y registrar evidencias | Continuidad Operativa | BCP0355 (tablas de roles/actividades) | Roles nominales existen en BCP; normalizar a “cargo/rol” en sistema. |

**Reglas IAM relevantes (requisitos):**
- No permitir múltiples instancias de login por UserID; no usar usuarios genéricos; auditable toda acción.  
  Fuente: Anexo 7, 5.3.2.3, p. 82.
- Reportes de usuarios/grupos/opciones; revocación total al dar de baja; logs no modificables.  
  Fuente: Anexo 7, 5.3.2.3, p. 82.

---

# 8) Modelo conceptual de datos + diccionario mínimo

## 8.A Entidades (definición + fuente)
- **Proceso**: unidad/área/locación, criticidad, ventanas críticas, volumen.  
  Fuente: Ficha “Datos del Proceso ”; BIA/RIA identifican “Proceso: Operar Convenios de Pago”.
- **Sistema/Aplicativo**: nombre, descripción, proveedor, estrategia contingencia.  
  Fuente: BCP0355 “RESUMEN SISTEMAS…”; Ficha “Nombre del Aplicativos…”.
- **Proveedor/Contrato**: proveedor, contrato, servicio asociado.  
  Fuente: Ficha “Proveedor” (incluye contratos).
- **BIA**: entrevista, escenarios, impactos por time-band, MTPD/RTO, aprobaciones.  
  Fuente: BIA hojas “Datos entrevistado”, “Análisis Impacto”, “V°B°”.
- **RIA**: matriz de continuidad, escalas, decisión de respuesta, aprobaciones.  
  Fuente: RIA “2 Matriz Continuidad”, “4. Probabilidad”, “5. Evaluación del Control”, “6…”, “1. V°B°”.
- **Riesgo (Continuidad)**: descripción, factor, factor específico, tipo de impacto, probabilidad, evaluación control, RI/RR, riesgo inherente/residual, beta, respuesta, contingencia.  
  Fuente: RIA “2 Matriz Continuidad”.
- **Control**: controles identificados asociados al riesgo.  
  Fuente: RIA “2 Matriz Continuidad”; Anexo 7 4.2.1.1 p.25.
- **PlanBCP**: código, escenario, responsables, actividades, comunicaciones, versión, vigencia, evidencias.  
  Fuente: Anexo 7 4.2.2.2 p.50–51; BCP0355.
- **EscenarioBCP**: tipo (personas/sistemas/terceros…), T01/T02 u otro catálogo.  
  Fuente: Anexo 7 4.2.2.2 p.49–50; BCP0355.
- **PruebaBCP**: código BCP, escenario, fecha, tipo, resultado, reporte ejecutivo.  
  Fuente: RIA “3. Pruebas”; Anexo 7 p.51.
- **PlanAccion**: acciones, responsables, fechas, estado, evidencias, origen (KRI/Obs/Auditoría).  
  Fuente: Anexo 7 4.2.1.3 p.28–29; 4.2.5.2 p.60.
- **KRI**: catálogo, mediciones periódicas, umbrales, alertas/escalamiento.  
  Fuente: Anexo 7 4.2.1.2 p.27.
- **Contacto/PersonalCritico**: datos de contacto, rol/cargo, respaldo.  
  Fuente: Ficha “4. Personal crítico”, “Contactos”; BCP0355 “PERSONAL PARTICIPANTE…”.

## 8.B Relaciones (cardinalidad sugerida)
- Proceso **1..n** Sistema/Aplicativo (dependencias). (Ficha/BCP)
- Proceso **1..n** BIA (versiones/años). (BIA)
- BIA **1..n** BIAImpacto (por escenario × tipo impacto × time-band). (BIA “Análisis Impacto”)
- Proceso **1..n** RIA (versiones/años). (RIA)
- RIA **1..n** RiesgoContinuidad. (RIA “2 Matriz…”)
- RiesgoContinuidad **0..n** Control. (RIA “2 Matriz…”)
- Proceso **0..n** PlanBCP; PlanBCP **1..n** ActividadContingencia/Comunicacion. (Anexo 7; BCP0355)
- PlanBCP **0..n** PruebaBCP. (RIA “3. Pruebas”)
- KRI **0..n** MedicionKRI; MedicionKRI fuera umbral → **0..n** PlanAccion. (Anexo 7 p.27)
- ObservacionAuditoria **0..n** PlanAccion **0..n** Evidencia. (Anexo 7 p.60)

## 8.C Diccionario mínimo (campos clave obligatorios)

### Proceso
| Campo | Origen |
|---|---|
| proceso_id (código interno) | No especificado (definir) |
| nombre | RIA “2 Matriz…” (Proceso); Ficha |
| unidades_negocio / área | Ficha “Datos del Proceso ” |
| locación | Ficha |
| volumen_clientes | Ficha (“Cantidad de clientes involucrados”) |
| ventanas_criticas | Ficha (“Fechas y horarios críticos…”) |

### BIA
| Campo | Origen |
|---|---|
| bia_id, version, fecha | No especificado explícito (sugerido por versionado) |
| proceso_id | BIA/Proceso |
| escenario (catálogo) | BIA “Análisis Impacto” (filas de escenarios) |
| impactos_por_timeband | BIA “Análisis Impacto” |
| mtpd | BIA “Análisis Impacto” col AK |
| rto | BIA “Análisis Impacto” col AL |
| aprobaciones | BIA “V°B°” |

### RIA
| Campo | Origen |
|---|---|
| ria_id, version, fecha | No especificado explícito |
| proceso_id | RIA “2 Matriz…” |
| riesgo, factor, factor_especifico | RIA “2 Matriz…” |
| controles | RIA “2 Matriz…” |
| tipo_impacto, mayor_impacto_24h | RIA “2 Matriz…” |
| probabilidad, eval_control | RIA “2 Matriz…” + escalas “4./5.” |
| ri, rr, riesgo_inherente, riesgo_residual | RIA “2 Matriz…” |
| beta | RIA “2 Matriz…” (definición no especificada) |
| respuesta_riesgo, contingencia | RIA “2 Matriz…” |
| aprobaciones | RIA “1. V°B°” |

### PlanBCP
| Campo | Origen |
|---|---|
| bcp_codigo | Anexo 7 p.50–51; RIA “3. Pruebas”; BCP0355 |
| proceso_id | Anexo 7; BCP0355 |
| escenario_tipo | Anexo 7 p.49–50 |
| version/vigencia | Anexo 7 p.50–51; BCP0355 “Bitácora…” |
| roles/actividades | BCP0355 tablas “Rol / Actividad…” |
| comunicaciones/escalamiento | BCP0355 tablas “SECUENCIA…” |
| evidencias | Anexo 7 p.51; RIA “3. Pruebas” |

---

# 9) Integraciones y dependencias externas

| Integración / Dependencia | Mecanismo | Datos (alto nivel) | Frecuencia | Seguridad | Fuente | Preguntas |
|---|---|---|---|---|---|---|
| **AD Azure (SSO)** | SAML (ideal) | Identidad/claims | Online | SSO | Anexo 7 p.65 | ¿Proveedor de IdP exacto y políticas MFA? |
| **Correo BancoEstado** | API REST u otro | Notificaciones (KRI, vencimientos, aprobaciones) | Event-driven | TLS/según BE | Anexo 7 p.66 | ¿Servicio/API específico (Graph, SMTP relay, etc.)? |
| **Servibanca (Middle Office)** | Acceso operativo (descarga) | Nóminas (txt) | Contingencia (T01) | No especificado | BCP0355 “CONTINGENCIA… MCO” | ¿Se requiere integración automática o solo procedimiento? |
| **Portal IPS / SFTP** | Conexión por IP + rescate/validación/carga portal | Archivos CIB + archivo respuesta | Batch (horarios 10/12/15/17; validación; carga antes 18:00) | SFTP/TLS (si aplica) | BCP0355 “OPERATORIA NORMAL PORTAL IPS” | ¿Dónde se deben registrar evidencias/logs de cada malla? |
| **CCA (Centro Compensación Automatizado)** | Integración de proceso (mencionada) | Envíos/contabilización | Operación diaria | No especificado | BCP0355 resumen MCO; Ficha “Proveedor CCA” | ¿Existe API/archivo/ventana? |
| **PowerBI** | Interoperabilidad/consumo | Dataset/reportes | Periodicidad definida por BE | Control de acceso | Anexo 7 p.62, 71 | ¿Conector requerido (API/SQL/Export)? |
| **Transferencia segura batch** | SFTP/FTPS/PGP | Archivos batch | Según integración | Cifrado end-to-end; protocolos seguros | Anexo 7 p.87–88; 95 | ¿Qué integraciones batch concretas se deben soportar? |

---

# 10) Requerimientos no funcionales (NFR) y operación/soporte

| NFR | Valor/umbral | Aplicación | Evidencia | Fuente |
|---|---:|---|---|---|
| Performance portal | Consulta unitaria < **3000 ms** | Web | Pruebas carga/perf | Anexo 7 p.66 |
| DR del servicio | **RTO 36h**, **RPO 1 semana** | Servicio | Prueba DR + reportes | Anexo 7 p.69 |
| Backups en Chile | Respaldo de datos y aplicativo en Chile | Servicio | Evidencia ubicación | Anexo 7 p.69 |
| Monitoreo proactivo | **7x24x365** | Servicio | Dashboards + alertas + reportes | Anexo 7 p.70–71 |
| Canales soporte | Correo 99,95%; Tel 7x9 (req/soporte); Tel 7x24 (incidentes) | Soporte | Reporte SLA canal | Anexo 7 p.71 |
| Tiempo medio atención | < 10 min | Soporte | Métrica SLA | Anexo 7 p.71 |
| Ambientes | Dev/Test/QA/Prod; soporta DevOps | Plataforma | Evidencia entornos/pipeline | Anexo 7 p.66 |
| Retención info digitalizada | “tiempo que el Banco defina” | Documental | Parámetro configurable + prueba | Anexo 7 p.66 |
| Navegadores estándar | IE11, Edge 86, Chrome 85 (Win10+), Chrome78 (Win8.1) | Web | Matriz compatibilidad | Anexo 7 p.65 |

---

# 11) Seguridad y cumplimiento (Security Requirements)

| Control/Requisito | Dominio | Evidencia | Fuente | Observaciones |
|---|---|---|---|---|
| Alineamiento ISO27001/27002 (cert o GAP) | Gobierno/políticas | Certificado/GAP | Anexo 7 p.72 | Must. |
| Programa de seguridad (CIA + trazabilidad) | Gobierno | Política + evidencias | Anexo 7 p.72 |  |
| Gestión de riesgos de seguridad del proveedor | Gobierno | Plan + evidencias | Anexo 7 p.73 |  |
| Control de acceso: segregación funciones (admin seguridad/auditor/supervisor/operador) | IAM | Matriz SoD + RBAC | Anexo 7 p.82 |  |
| No múltiples logins; no usuarios genéricos; acciones auditables | IAM/Auditoría | Prueba control + logs | Anexo 7 p.82 |  |
| Administración: 1 perfil por usuario; reportes usuarios/grupos/opciones; revocación total al baja | IAM | Reportes + prueba baja | Anexo 7 p.82 |  |
| Logs estándar e inmutables; no registrar secretos (tokens, llaves, strings conexión) | Logs | Evidencia logs + hardening | Anexo 7 p.95–96 |  |
| Sincronización NTP | Logs | Config NTP | Anexo 7 p.97 |  |
| Cifrado fuerte (>=128 bits) para activos críticos; llaves en poder del Banco | Criptografía | Política + KMS/HSM | Anexo 7 p.85–86 |  |
| Gestión de claves (custodia, intercambio seguro, revocación) | Criptografía | Procedimientos | Anexo 7 p.86–87 |  |
| Protocolos seguros (TLS1.2+, SSHv2+, SFTP/FTPS, etc.); prohibir inseguros | Red | Config + escaneo | Anexo 7 p.87–88 |  |
| Certificados X.509v3, 2048 bits, SHA256; CA pública si expuesto a internet | Red | Evidencia certs | Anexo 7 p.88 |  |
| Transferencia: procedimientos escritos (trazabilidad/no repudio/custodia) | Transferencia | Procedimientos + auditoría | Anexo 7 p.88 |  |
| Log de eventos: campos mínimos (cuando/donde/quien/que/resultado) | Logs | Ejemplos logs | Anexo 7 p.95–96 |  |
| Backups: cifrado, almacenamiento seguro, sitios separados, pruebas, documentación | Backups | Reporte backup/restore | Anexo 7 p.97–98 |  |
| Inventario/retención medios; borrado/destrucción segura | Retención | Inventario + actas | Anexo 7 p.98–99 | Incluye métodos (DoD/Gutmann) como referencia del estándar. |
| Datos en reposo (nube/sitio externo): control de acceso + cifrado + correlación eventos | Data at rest | Evidencia monitoreo | Anexo 7 p.100 |  |
| Datacenter Tier III; redundancia; activo-activo preferente; 24x7 | Infra/DR | Certificaciones + diseño | Anexo 7 p.100–101 |  |
| Ethical hacking trimestral (si expuesto a internet) y auditoría anual; banco puede testear | Auditoría seguridad | Informes | Anexo 7 p.74–75 |  |

---

# 12) Gaps, ambigüedades y preguntas al cliente (priorizadas)

| Pregunta | Por qué importa | Qué decisión habilita | Fuente | Prioridad |
|---|---|---|---|---|
| ¿Cuál es la **fórmula oficial** para RI/RR/Riesgo Residual Final y el uso de **Beta**? | Impacta cálculos, reportes, auditoría y comparabilidad histórica | Modelo de datos + motor de cálculo + validación | RIA “2 Matriz Continuidad” (campo Beta) | Alta |
| ¿Qué **roles exactos** (estructura BE) administran RBAC y aprueban BIA/RIA/BCP? | Define SoD, flujos de aprobación y delegaciones | Diseño IAM + workflows | Anexo 7 p.66/82; BIA “V°B°”; RIA “V°B°” | Alta |
| ¿Se requiere **integración automática** con Servibanca Middle Office / IPS / otros, o solo registrar evidencia del procedimiento? | Cambia esfuerzo (APIs vs documental) | Arquitectura de integraciones | BCP0355 (procedimientos) | Alta |
| ¿Cuál es el **volumen esperado** (usuarios concurrentes, registros, reportes) para dimensionar performance y licenciamiento SaaS? | Afecta sizing, costos y cumplimiento <3000ms | Estimación y arquitectura | Anexo 7 p.66 (performance) | Alta |
| ¿Se exige **SIEM** o plataforma específica para envío/centralización de logs? | Ajusta diseño de auditoría y seguridad | Integración de logs | Anexo 7 p.95–97 | Media |
| ¿Qué formato de **exportables/evidencias** es mandatorio (plantillas Word/PDF, firma, etc.)? | Afecta generación de documentos y trazabilidad | Diseño documental | Anexo 7 p.66 (retención); p.51 (reportes pruebas) | Media |
| ¿Cómo se gobierna la **retención** de información digitalizada (plazos por tipo de documento)? | Impacta costos y compliance | Políticas de datos y storage | Anexo 7 p.66 | Media |
| Para continuidad, ¿cuál es el estándar de **“vuelta a normalidad”** y su evidencia? | Evita planes incompletos | Modelo BCP + auditoría | Anexo 7 p.50–51; BCP0355 (a veces “No aplica”) | Media |
| Base de pérdidas: ¿se incluye en el alcance licitado (aunque “Deseable”)? | Cambia roadmap y costo | Alcance propuesta | Anexo 7 p.55–56 | Media |
| ¿Existe un ITSM/mesa de incidentes oficial al que debamos integrarnos (activación T01/T02)? | Mejora trazabilidad operacional | Integración ITSM | BCP0355 (declara incidente) | Media |

---

# 13) Resumen ejecutivo (para ti)

- **Must-have licitación (núcleo):** SSO con **AD Azure (SAML ideal)**, RBAC administrado por Banco, performance web **<3000 ms**, ambientes Dev/Test/QA/Prod y DevOps. (Anexo 7 p.65–66)
- **Continuidad (BCMS):** módulo BIA/RIA + catálogo BCP por escenarios + gestión de pruebas + panel anual por proceso (ficha+BIA+RIA+BCP) + DRP. (Anexo 7 p.34, 49–55)
- **DR del servicio SaaS:** **RTO 36h / RPO 1 semana** y respaldos en Chile. (Anexo 7 p.69)
- **Operación/soporte:** monitoreo proactivo **7x24x365**, soporte con canales y SLA (correo 99,95%; tel 7x9 / 7x24; atención <10 min). (Anexo 7 p.70–71)
- **Seguridad fuerte y auditable:** ISO27001/27002 (cert o GAP), logs estándar e inmutables, cifrado fuerte con llaves en poder del Banco, protocolos TLS1.2+, backups + destrucción segura, datacenter Tier III, auditorías/hacking. (Anexo 7 p.72–101)
- **Caso de uso real (Operar Convenios de Pago):**  
  - T01: contingencias específicas por sistema (MCO, IPS, Sitio Privado, etc.) con roles/actividades. (BCP0355)  
  - T02: caída masiva → sin alternativa, se espera restauración. (BCP0355)
- **Datos críticos para el modelo:** BIA trae escenarios/time-bands e incluye MTPD/RTO (en varios escenarios **MTPD 1h, RTO 30m**). (BIA “Análisis Impacto”)
- **Mayor gap metodológico:** definición de **Beta** y fórmulas RI/RR/residual final (impacta cálculo y compliance). (RIA “2 Matriz Continuidad”)
- **Lo que sí o sí debe estar en la propuesta:**  
  1) Matriz completa de cumplimiento (ReqID→evidencia) para Anexo 7 (incl. seguridad 5.3).  
  2) Diseño de módulos BCMS (BIA/RIA/BCP/Pruebas/Panel anual) y Riesgo Op (matrices/KRI/planes).  
  3) Diseño de operación (7x24 monitoreo + soporte) y DR (RTO/RPO) con evidencia verificable.  
  4) Enfoque de seguridad alineado a ISO27k + logging + cifrado/llaves + backups/retención/borrado.  
  5) Plan de integración (SSO, correo, BI, batch/SFTP) y aclaraciones pendientes (Beta, volúmenes, ITSM).
