# ISO 22301:2019 - Guía Completa Accesible

> **Norma:** ISO 22301:2019 - Seguridad y resiliencia — Sistemas de gestión de la continuidad del negocio — Requisitos  
> **Propósito:** Documentación accesible de toda la norma con explicaciones prácticas  
> **Fecha:** 2026-01-13

---

## Introducción a la Norma

### ¿Qué es ISO 22301?

ISO 22301 es el estándar internacional que define los requisitos para implementar, mantener y mejorar un **Sistema de Gestión de Continuidad del Negocio (SGCN)** - en inglés Business Continuity Management System (BCMS).

**Objetivo principal:** Asegurar que una organización pueda continuar entregando productos y servicios a niveles aceptables durante y después de una interrupción.

### ¿A quién aplica?

- Cualquier organización, sin importar tamaño, tipo o sector
- Aplicable a empresas privadas, públicas, ONGs, gobiernos
- Escalable: desde una PYME hasta una multinacional

### Estructura de la norma

La norma sigue la **estructura de alto nivel (HLS)** de ISO, compartida con otras normas como ISO 9001, ISO 27001, ISO 14001:

| Cláusula | Nombre | Propósito |
|----------|--------|-----------|
| 1-3 | Alcance, Referencias, Términos | Introductorias (no certificables) |
| **4** | Contexto de la Organización | Entender dónde opera la organización |
| **5** | Liderazgo | Compromiso de la alta dirección |
| **6** | Planificación | Definir objetivos y gestionar riesgos |
| **7** | Apoyo | Recursos, competencia, comunicación |
| **8** | Operación | El corazón: BIA, evaluación de riesgos, planes |
| **9** | Evaluación del desempeño | Monitoreo, auditorías, revisión |
| **10** | Mejora | Acciones correctivas y mejora continua |

### Términos clave en ISO

| Término en inglés | Obligatoriedad |
|-------------------|----------------|
| **SHALL** | OBLIGATORIO - Debe implementarse |
| **SHOULD** | RECOMENDADO - Debería hacerse |
| **MAY** | OPCIONAL - Puede hacerse |
| **CAN** | POSIBILIDAD - Es posible hacerlo |

---

## CLÁUSULA 1: Alcance (Scope)

### 1.1 Texto resumido

Esta norma especifica los requisitos para planificar, establecer, implementar, operar, monitorear, revisar, mantener y mejorar continuamente un sistema de gestión documentado para:

- Protegerse contra incidentes disruptivos
- Reducir la probabilidad de que ocurran
- Prepararse, responder y recuperarse de ellos cuando ocurran

### 1.2 Aplicabilidad

Los requisitos son genéricos y aplicables a todas las organizaciones. La extensión de aplicación depende de:
- El contexto de la organización (cláusula 4.1)
- Los requisitos de partes interesadas (cláusula 4.2)

---

## CLÁUSULA 2: Referencias Normativas

No hay referencias normativas obligatorias. Esta norma es auto-contenida.

---

## CLÁUSULA 3: Términos y Definiciones

### 3.1 Términos fundamentales

| # | Término | Definición accesible |
|---|---------|---------------------|
| 3.1 | **Actividad** | Proceso o conjunto de procesos realizados por la organización que produce o soporta productos y servicios |
| 3.2 | **Auditoría** | Proceso sistemático, independiente y documentado para obtener evidencia y evaluarla objetivamente |
| 3.3 | **Continuidad del negocio** | Capacidad de la organización para continuar la entrega de productos y servicios dentro de plazos aceptables a capacidad predefinida durante una interrupción |
| 3.4 | **Gestión de continuidad del negocio (BCM)** | Proceso holístico de gestión que identifica amenazas potenciales y los impactos que podrían causar |
| 3.5 | **Plan de continuidad del negocio (BCP)** | Información documentada que guía a la organización para responder a una interrupción y reanudar actividades |
| 3.6 | **Programa de continuidad del negocio** | Proceso continuo de gestión y gobierno soportado por la alta dirección |

### 3.2 Términos sobre impacto

| # | Término | Definición accesible |
|---|---------|---------------------|
| 3.7 | **Análisis de impacto al negocio (BIA)** | Proceso de analizar actividades y el efecto que una interrupción del negocio podría tener sobre ellas |
| 3.8 | **Consecuencia** | Resultado de un evento que afecta objetivos |
| 3.9 | **Interrupción** | Incidente, anticipado o no, que causa una desviación no planificada de la entrega esperada de productos y servicios |
| 3.10 | **Evento** | Ocurrencia o cambio de un conjunto particular de circunstancias |

### 3.3 Términos sobre respuesta

| # | Término | Definición accesible |
|---|---------|---------------------|
| 3.11 | **Incidente** | Evento que puede ser, o podría llevar a, una interrupción, pérdida, emergencia o crisis |
| 3.12 | **Respuesta a incidentes** | Respuesta de la organización a un evento o incidente que podría, o lleva a, una interrupción o crisis |
| 3.13 | **Comando de incidentes** | Estructura organizacional temporal responsable de la gestión del incidente |
| 3.14 | **Máximo período de interrupción tolerable (MTPD)** | Tiempo después del cual la viabilidad de la organización se verá irrevocablemente amenazada si no se reanuda la entrega de productos/servicios |

### 3.4 Términos sobre recuperación

| # | Término | Definición accesible |
|---|---------|---------------------|
| 3.15 | **Objetivo mínimo de continuidad del negocio (MBCO)** | Nivel mínimo de servicios/productos aceptable para lograr los objetivos del negocio durante una interrupción |
| 3.16 | **Objetivo de punto de recuperación (RPO)** | Punto en el tiempo al cual los datos deben ser recuperados después de una interrupción |
| 3.17 | **Objetivo de tiempo de recuperación (RTO)** | Período de tiempo después de un incidente dentro del cual un producto/servicio o una actividad debe ser reanudada, o los recursos deben ser recuperados |
| 3.18 | **Estrategia de recuperación** | Enfoque para reanudar la entrega de productos/servicios a un nivel aceptable |
| 3.19 | **Solución de recuperación** | Implementación de una o más estrategias de recuperación |

### 3.5 Términos sobre riesgo

| # | Término | Definición accesible |
|---|---------|---------------------|
| 3.20 | **Riesgo** | Efecto de la incertidumbre sobre los objetivos |
| 3.21 | **Apetito de riesgo** | Cantidad y tipo de riesgo que la organización está dispuesta a perseguir o retener |
| 3.22 | **Evaluación de riesgo** | Proceso general de identificación, análisis y evaluación de riesgos |
| 3.23 | **Tratamiento de riesgo** | Proceso para modificar el riesgo |

### 3.6 Otros términos

| # | Término | Definición accesible |
|---|---------|---------------------|
| 3.24 | **Alta dirección** | Persona o grupo de personas que dirigen y controlan una organización al más alto nivel |
| 3.25 | **Partes interesadas (stakeholders)** | Persona u organización que puede afectar, verse afectada, o percibirse como afectada por una decisión o actividad |
| 3.26 | **Proveedor** | Organización que proporciona un producto o servicio |
| 3.27 | **Ejercicio** | Proceso para entrenar, evaluar, practicar y mejorar el desempeño en una organización |

---

## CLÁUSULA 4: Contexto de la Organización

**Propósito general:** Entender la organización, su entorno y definir el alcance del SGCN.

### 4.1 Comprensión de la organización y su contexto

**Requisito (SHALL):** La organización debe determinar las cuestiones externas e internas que son relevantes para su propósito y que afectan su capacidad para lograr los resultados previstos del SGCN.

**¿Qué significa en la práctica?**

La organización debe analizar:

**Cuestiones externas:**
- Entorno político, legal, económico, social
- Regulaciones y legislación aplicable
- Competencia y mercado
- Cadena de suministro
- Tendencias tecnológicas
- Factores ambientales y climáticos
- Pandemias y eventos globales

**Cuestiones internas:**
- Cultura organizacional
- Estructura y gobernanza
- Capacidades y recursos
- Sistemas de información
- Relaciones contractuales
- Políticas internas

**Ejemplo práctico:**
> *"Somos un banco en Chile. Externamente nos afecta: la Ley 21.663 de ciberseguridad, la CMF como regulador, terremotos frecuentes, dependencia de proveedores cloud. Internamente: tenemos 5.000 empleados, 80% de sistemas en la nube, cultura de aversión al riesgo."*

**Evidencia típica:** Documento de análisis de contexto, PESTEL, FODA estratégico.

---

### 4.2 Comprensión de las necesidades y expectativas de las partes interesadas

**Requisito (SHALL):** La organización debe determinar:
- Las partes interesadas que son relevantes para el SGCN
- Los requisitos relevantes de esas partes interesadas
- Las obligaciones legales y regulatorias

**¿Qué significa en la práctica?**

Identificar quién tiene interés en que la organización continúe operando:

| Parte interesada | Sus expectativas |
|------------------|-----------------|
| **Clientes** | Que el servicio no se interrumpa, que sus datos estén protegidos |
| **Empleados** | Seguridad en el trabajo, continuidad del empleo |
| **Accionistas** | Protección de la inversión, gestión responsable de riesgos |
| **Reguladores** | Cumplimiento de normativas, reporte de incidentes |
| **Proveedores** | Continuidad de la relación comercial |
| **Comunidad** | Que la empresa no genere impactos negativos |
| **Gobierno** | Que servicios esenciales continúen |

**Ejemplo práctico:**
> *"La CMF (regulador financiero) requiere que reportemos incidentes críticos en máximo 3 horas. Los clientes esperan disponibilidad 99.9%. Los accionistas quieren que el RTO de procesos críticos sea menor a 4 horas."*

**Evidencia típica:** Registro de partes interesadas, matriz de requisitos.

---

### 4.3 Determinación del alcance del SGCN

**Requisito (SHALL):** La organización debe determinar los límites y aplicabilidad del SGCN para establecer su alcance, considerando:
- Las cuestiones externas e internas (4.1)
- Los requisitos de partes interesadas (4.2)
- Los productos y servicios de la organización
- El apetito de riesgo de la organización

**El alcance debe:**
- Estar disponible como información documentada
- Ser mantenido

**¿Qué significa en la práctica?**

Definir claramente QUÉ está dentro y QUÉ está fuera del SGCN:

**Dentro del alcance (ejemplo):**
- Procesos de producción de la planta Santiago
- Sistemas de facturación y cobranza
- Data center principal y de respaldo
- Personal de operaciones críticas

**Fuera del alcance (ejemplo):**
- Oficinas comerciales regionales (bajo impacto)
- Procesos de RRHH no críticos
- Sucursal piloto en otro país

**Ejemplo práctico:**
> *"El alcance del SGCN de Banco XYZ incluye: todos los procesos que soportan los productos de Cuenta Corriente, Tarjeta de Crédito y Transferencias, incluyendo los sistemas informáticos asociados, el personal de operaciones, y las instalaciones del edificio corporativo y data center."*

**Evidencia típica:** Declaración de alcance documentada.

---

### 4.4 Sistema de gestión de continuidad del negocio

**Requisito (SHALL):** La organización debe establecer, implementar, mantener y mejorar continuamente un SGCN, incluyendo los procesos necesarios y sus interacciones, de conformidad con los requisitos de esta norma.

**¿Qué significa en la práctica?**

No basta con tener documentos aislados. Debe existir un **sistema** integrado que:
- Tenga procesos definidos
- Esos procesos interactúen entre sí
- Se mantenga actualizado
- Mejore continuamente

**Los procesos típicos del SGCN:**
1. Análisis de contexto y partes interesadas
2. Análisis de impacto al negocio (BIA)
3. Evaluación de riesgos
4. Desarrollo de estrategias y planes
5. Ejercicios y pruebas
6. Gestión de incidentes
7. Auditoría y revisión
8. Mejora continua

---

## CLÁUSULA 5: Liderazgo

**Propósito general:** Asegurar el compromiso de la alta dirección con el SGCN.

### 5.1 Liderazgo y compromiso

**Requisito (SHALL):** La alta dirección debe demostrar liderazgo y compromiso con respecto al SGCN:

a) Asegurando que la política y objetivos del SGCN se establezcan y sean compatibles con la dirección estratégica
b) Asegurando la integración de los requisitos del SGCN en los procesos del negocio
c) Asegurando que los recursos necesarios estén disponibles
d) Comunicando la importancia de una gestión efectiva de continuidad
e) Asegurando que el SGCN logre sus resultados previstos
f) Dirigiendo y apoyando a las personas para contribuir a la efectividad
g) Promoviendo la mejora continua
h) Apoyando otros roles de gestión relevantes para demostrar su liderazgo

**¿Qué significa en la práctica?**

La alta dirección (CEO, Gerente General, Directorio) debe:
- Firmar y aprobar la política de continuidad
- Asignar presupuesto para el SGCN
- Participar en revisiones por la dirección
- Comunicar la importancia del SGCN a toda la organización
- Nombrar un responsable del SGCN con autoridad suficiente

**Evidencia típica:** 
- Política firmada por el CEO
- Actas de reuniones de directorio donde se discute el SGCN
- Presupuesto asignado
- Comunicaciones internas sobre continuidad

---

### 5.2 Política

**Requisito (SHALL):** La alta dirección debe establecer una política de continuidad del negocio que:

a) Sea apropiada al propósito de la organización
b) Proporcione un marco para establecer objetivos
c) Incluya un compromiso para satisfacer requisitos aplicables
d) Incluya un compromiso para la mejora continua del SGCN

La política debe:
- Estar disponible como información documentada
- Ser comunicada dentro de la organización
- Estar disponible para partes interesadas, según corresponda

**¿Qué significa en la práctica?**

La política es un documento de 1-2 páginas que establece el compromiso formal. Típicamente incluye:

**Ejemplo de política:**
> *"Banco XYZ está comprometido con mantener la continuidad de los servicios financieros críticos para nuestros clientes, empleados y partes interesadas. Esta política establece que:*
> - *Identificaremos y protegeremos los procesos críticos del negocio*
> - *Mantendremos planes de continuidad actualizados y probados*
> - *Cumpliremos con todos los requisitos legales y regulatorios aplicables*
> - *Asignaremos los recursos necesarios para la continuidad*
> - *Mejoraremos continuamente nuestras capacidades de resiliencia*
> 
> *Firmado: CEO, Fecha"*

---

### 5.3 Roles, responsabilidades y autoridades organizacionales

**Requisito (SHALL):** La alta dirección debe asegurar que las responsabilidades y autoridades para roles relevantes sean asignadas y comunicadas dentro de la organización.

La alta dirección debe asignar responsabilidad y autoridad para:
a) Asegurar que el SGCN sea conforme con los requisitos de esta norma
b) Reportar sobre el desempeño del SGCN a la alta dirección

**¿Qué significa en la práctica?**

Roles típicos en un SGCN:

| Rol | Responsabilidad |
|-----|-----------------|
| **Sponsor ejecutivo** | Apoyo de la alta dirección, asignación de recursos |
| **Coordinador/Gerente de BCM** | Responsable del día a día del SGCN |
| **Dueños de proceso** | Mantener BCPs de sus procesos |
| **Coordinador de crisis** | Liderar respuesta a crisis |
| **Equipo de recuperación** | Ejecutar procedimientos de recuperación |
| **Auditores internos** | Evaluar conformidad del SGCN |

**Evidencia típica:**
- Organigrama del SGCN
- Descripciones de cargo con responsabilidades de BCM
- Matriz RACI de continuidad

---

## CLÁUSULA 6: Planificación

**Propósito general:** Planificar el SGCN para abordar riesgos y lograr objetivos.

### 6.1 Acciones para abordar riesgos y oportunidades

**Requisito (SHALL):** Al planificar el SGCN, la organización debe considerar las cuestiones (4.1), requisitos (4.2) y determinar los riesgos y oportunidades que necesitan ser abordados para:

a) Asegurar que el SGCN pueda lograr sus resultados previstos
b) Prevenir o reducir efectos no deseados
c) Lograr la mejora continua

La organización debe planificar:
- Acciones para abordar estos riesgos y oportunidades
- Cómo integrar e implementar las acciones en los procesos del SGCN
- Cómo evaluar la efectividad de estas acciones

**¿Qué significa en la práctica?**

Esta cláusula habla de riesgos **del propio SGCN**, no de los riesgos de continuidad del negocio (esos se tratan en 8.2.3).

Ejemplos de riesgos del SGCN:
- Falta de recursos para mantener el SGCN
- Falta de compromiso de la dirección
- Rotación del personal clave de BCM
- Planes desactualizados

Ejemplos de oportunidades del SGCN:
- Integrar BCM con gestión de riesgos operacionales
- Usar tecnología para automatizar pruebas
- Certificar ISO 22301 para diferenciación comercial

---

### 6.2 Objetivos de continuidad del negocio y planificación para lograrlos

**Requisito (SHALL):** La organización debe establecer objetivos de continuidad del negocio en funciones y niveles relevantes.

Los objetivos deben:
a) Ser consistentes con la política de continuidad
b) Ser medibles (si es practicable)
c) Tener en cuenta requisitos aplicables
d) Ser monitoreados
e) Ser comunicados
f) Ser actualizados según corresponda

Al planificar cómo lograr objetivos, la organización debe determinar:
- Qué se hará
- Qué recursos se requerirán
- Quién será responsable
- Cuándo se completará
- Cómo se evaluarán los resultados

**¿Qué significa en la práctica?**

Objetivos típicos del SGCN:

| Objetivo | Indicador | Meta |
|----------|-----------|------|
| Identificar procesos críticos | % procesos con BIA completado | 100% |
| Desarrollar planes | % procesos críticos con BCP | 100% |
| Probar planes | Ejercicios anuales | ≥2 por proceso crítico |
| Capacitar personal | % personal capacitado | 95% |
| Cumplir RTO | RTO real vs objetivo en ejercicios | ≤ RTO objetivo |
| Recuperar de incidentes | MTTR (tiempo medio de recuperación) | ≤4 horas para críticos |

**Evidencia típica:**
- Plan anual del SGCN con objetivos
- Dashboard de indicadores de continuidad

---

### 6.3 Planificación de cambios

**Requisito (SHALL):** Cuando la organización determine la necesidad de cambios al SGCN, los cambios deben llevarse a cabo de manera planificada.

La organización debe considerar:
a) El propósito de los cambios y sus consecuencias potenciales
b) La integridad del SGCN
c) La disponibilidad de recursos
d) La asignación o reasignación de responsabilidades y autoridades

**¿Qué significa en la práctica?**

No se pueden hacer cambios al SGCN "al vuelo". Ejemplos de cambios que requieren planificación:

- Agregar o quitar procesos del alcance
- Cambiar estrategias de recuperación
- Modificar RTO/RPO de procesos críticos
- Cambiar la estructura de respuesta a crisis
- Actualizar la política de continuidad

**Proceso típico de cambios:**
1. Solicitud de cambio documentada
2. Evaluación de impacto
3. Aprobación por rol autorizado
4. Implementación planificada
5. Comunicación a afectados
6. Verificación post-implementación

---

## CLÁUSULA 7: Apoyo

**Propósito general:** Asegurar que el SGCN tenga los recursos y soporte necesarios.

### 7.1 Recursos

**Requisito (SHALL):** La organización debe determinar y proporcionar los recursos necesarios para el establecimiento, implementación, mantenimiento y mejora continua del SGCN.

**¿Qué significa en la práctica?**

Recursos típicos requeridos:

| Tipo de recurso | Ejemplos |
|-----------------|----------|
| **Humanos** | Coordinador BCM, equipo de continuidad, participantes en ejercicios |
| **Financieros** | Presupuesto para herramientas, capacitación, sitios de respaldo |
| **Tecnológicos** | Software de BCM, sistemas de backup, comunicaciones alternas |
| **Infraestructura** | Sitio alterno, centros de datos de respaldo |
| **Información** | Acceso a documentación, datos de contacto actualizados |

---

### 7.2 Competencia

**Requisito (SHALL):** La organización debe:

a) Determinar la competencia necesaria de las personas que hacen trabajo que afecta el desempeño del SGCN
b) Asegurar que estas personas sean competentes basándose en educación, entrenamiento o experiencia apropiados
c) Cuando sea aplicable, tomar acciones para adquirir la competencia necesaria, y evaluar la efectividad de las acciones tomadas
d) Retener información documentada apropiada como evidencia de competencia

**¿Qué significa en la práctica?**

| Rol | Competencias requeridas |
|-----|------------------------|
| **Coordinador BCM** | Conocimiento de ISO 22301, gestión de riesgos, gestión de proyectos |
| **Dueños de proceso** | Conocimiento de sus procesos, análisis de impacto, planificación |
| **Equipo de crisis** | Toma de decisiones bajo presión, comunicación de crisis |
| **Personal operativo** | Conocimiento de procedimientos de recuperación |

**Cómo adquirir competencia:**
- Capacitación formal (cursos ISO 22301, BCI, DRII)
- Participación en ejercicios
- Mentoring de personal experimentado
- Lecciones aprendidas de incidentes

**Evidencia típica:**
- Registros de capacitación
- Certificaciones profesionales
- Evaluaciones de desempeño en ejercicios

---

### 7.3 Concienciación

**Requisito (SHALL):** Las personas que hacen trabajo bajo el control de la organización deben ser conscientes de:

a) La política de continuidad del negocio
b) Su contribución a la efectividad del SGCN, incluyendo los beneficios de un mejor desempeño
c) Las implicaciones de no conformarse con los requisitos del SGCN
d) Sus roles y responsabilidades antes, durante y después de una interrupción

**¿Qué significa en la práctica?**

Todo el personal debe saber:
- Que existe un SGCN
- Qué hacer si ocurre una interrupción
- A quién reportar incidentes
- Dónde encontrar los planes
- Su rol específico en la respuesta

**Métodos de concienciación:**
- Inducción de nuevos empleados
- Campañas de comunicación interna
- Participación en ejercicios
- Recordatorios periódicos
- Afiches y material visual

---

### 7.4 Comunicación

**Requisito (SHALL):** La organización debe determinar la necesidad de comunicaciones internas y externas relevantes al SGCN, incluyendo:

a) Sobre qué comunicar
b) Cuándo comunicar
c) Con quién comunicar
d) Cómo comunicar
e) Quién comunica

La organización también debe establecer, implementar y mantener procedimientos para:
- Comunicación interna con partes interesadas y empleados
- Comunicación externa con partes interesadas, incluyendo medios
- Recibir, documentar y responder comunicaciones de partes interesadas
- Asegurar disponibilidad de medios de comunicación durante una interrupción
- Facilitar comunicación estructurada con servicios de emergencia
- Asegurar la interoperabilidad de múltiples organizaciones y personal de respuesta
- Operar y probar capacidades de comunicación

**¿Qué significa en la práctica?**

**Comunicación en situación normal:**

| Qué | Cuándo | A quién | Cómo |
|-----|--------|---------|------|
| Estado del SGCN | Trimestral | Alta dirección | Reporte ejecutivo |
| Actualización de planes | Cuando cambian | Dueños de proceso | Email + reunión |
| Resultados de ejercicios | Post-ejercicio | Participantes | Informe |

**Comunicación en crisis:**

| Qué | Cuándo | A quién | Cómo |
|-----|--------|---------|------|
| Activación de crisis | Al declarar | Equipo de crisis | Llamada + SMS |
| Estado situacional | Cada 2 horas | Alta dirección | Llamada |
| Comunicado público | Cuando sea necesario | Medios, clientes | Comunicado de prensa |
| Instrucciones a empleados | Inicio y cambios | Todo el personal | Email, intranet, SMS |

---

### 7.5 Información documentada

#### 7.5.1 Generalidades

**Requisito (SHALL):** El SGCN debe incluir:

a) Información documentada requerida por esta norma
b) Información documentada que la organización determine como necesaria para la efectividad del SGCN

**Documentación mínima requerida por ISO 22301:**

| Cláusula | Documento requerido |
|----------|---------------------|
| 4.3 | Alcance del SGCN |
| 5.2 | Política de continuidad |
| 6.2 | Objetivos de continuidad |
| 7.2 | Evidencia de competencia |
| 8.2.2 | Resultados del BIA |
| 8.2.3 | Resultados de evaluación de riesgos |
| 8.3 | Estrategias y soluciones |
| 8.4 | Planes y procedimientos de continuidad |
| 8.5 | Resultados de ejercicios |
| 9.1 | Evidencia de monitoreo y medición |
| 9.2 | Programa de auditoría y resultados |
| 9.3 | Resultados de revisión por la dirección |
| 10.1 | Evidencia de no conformidades y acciones correctivas |

#### 7.5.2 Creación y actualización

**Requisito (SHALL):** Al crear y actualizar información documentada, la organización debe asegurar apropiados:

a) Identificación y descripción (título, fecha, autor, número de referencia)
b) Formato (idioma, versión de software, gráficos) y medio (papel, electrónico)
c) Revisión y aprobación para idoneidad y adecuación

#### 7.5.3 Control de información documentada

**Requisito (SHALL):** La información documentada debe ser controlada para asegurar:

a) Que esté disponible y sea adecuada para su uso, donde y cuando se necesite
b) Que esté protegida adecuadamente (pérdida de confidencialidad, uso impropio, pérdida de integridad)

Para el control de información documentada, la organización debe abordar:
- Distribución, acceso, recuperación y uso
- Almacenamiento y preservación, incluyendo preservación de legibilidad
- Control de cambios (control de versiones)
- Retención y disposición

---

## CLÁUSULA 8: Operación

**Propósito general:** Esta es la cláusula central - define CÓMO hacer continuidad del negocio.

### 8.1 Planificación y control operacional

**Requisito (SHALL):** La organización debe planificar, implementar y controlar los procesos necesarios para cumplir requisitos e implementar acciones (determinadas en 6.1) por:

a) Establecer criterios para los procesos
b) Implementar control de los procesos de acuerdo con los criterios

La organización debe controlar cambios planificados y revisar consecuencias de cambios no intencionales.

La organización debe asegurar que procesos, productos o servicios proporcionados externamente que afectan al SGCN sean controlados.

**¿Qué significa en la práctica?**

- Los procesos del SGCN deben estar documentados
- Deben existir criterios de aceptación (ej: BIA completo, BCP aprobado)
- Los proveedores críticos deben tener requisitos de continuidad en contratos

---

### 8.2 Análisis de impacto al negocio y evaluación de riesgos

#### 8.2.1 Generalidades

**Requisito (SHALL):** La organización debe establecer, implementar y mantener un proceso formal y documentado para el análisis de impacto al negocio y evaluación de riesgos que:

a) Establezca el contexto de la evaluación
b) Defina criterios
c) Tenga en cuenta el impacto potencial de una interrupción

**IMPORTANTE:** El BIA y la evaluación de riesgos deben ser repetidos a intervalos planificados y cuando haya cambios significativos.

#### 8.2.2 Análisis de impacto al negocio (BIA)

**Requisito (SHALL):** La organización debe establecer, implementar y mantener un proceso de evaluación formal y documentado para determinar prioridades de continuidad y requisitos.

**El proceso debe:**

a) **Identificar actividades** que soportan la provisión de productos y servicios

b) **Evaluar impactos** a lo largo del tiempo de no realizar estas actividades

c) **Establecer plazos priorizados** para reanudar estas actividades a un nivel mínimo aceptable especificado, teniendo en cuenta el tiempo después del cual los impactos de no reanudarlas se vuelven inaceptables

d) **Identificar dependencias y recursos** de apoyo para estas actividades, incluyendo proveedores, socios externos y otras partes interesadas relevantes

**¿Qué significa en la práctica?**

**Paso a paso del BIA:**

**1. Identificar actividades críticas**
> *"¿Qué procesos son esenciales para entregar nuestros productos/servicios?"*

| Proceso | Producto/Servicio que soporta |
|---------|------------------------------|
| Procesamiento de pagos | Transferencias, pagos de tarjetas |
| Atención al cliente | Soporte, reclamos |
| Operación de data center | Todos los servicios digitales |

**2. Evaluar impactos en el tiempo**
> *"Si este proceso se detiene, ¿qué pasa a las 2 horas? ¿A las 8 horas? ¿A las 24 horas?"*

| Proceso | 2 horas | 8 horas | 24 horas | 72 horas |
|---------|---------|---------|----------|----------|
| Pagos | Bajo | Medio | Alto | Crítico |
| Atención cliente | Bajo | Medio | Alto | Alto |
| Data center | Alto | Crítico | Catastrófico | Catastrófico |

**Tipos de impacto a evaluar:**
- Financiero (pérdida de ingresos, multas)
- Reputacional (daño a la marca, pérdida de clientes)
- Legal/Regulatorio (incumplimientos, sanciones)
- Operacional (backlog, pérdida de productividad)
- Salud y seguridad

**3. Establecer objetivos de recuperación**

| Proceso | RTO | RPO | MTPD | MBCO |
|---------|-----|-----|------|------|
| Pagos | 2h | 30min | 8h | 60% transacciones |
| Atención cliente | 4h | 1h | 24h | Canales digitales |
| Data center | 1h | 15min | 4h | 100% sistemas críticos |

**4. Identificar dependencias**

| Proceso | Dependencias internas | Dependencias externas |
|---------|----------------------|----------------------|
| Pagos | TI, Tesorería, Compliance | Banco Central, Visa, Mastercard |
| Atención cliente | TI, RRHH | Call center externo, proveedor CRM |
| Data center | Instalaciones, Seguridad | Electricidad, telecomunicaciones, cloud |

#### 8.2.3 Evaluación de riesgos

**Requisito (SHALL):** La organización debe establecer, implementar y mantener un proceso de evaluación de riesgos formal y documentado que sistemáticamente:

a) Identifique riesgos de interrupción a las actividades priorizadas de la organización y los procesos, sistemas, información, personas, activos, socios externos y otros recursos que las soportan

b) Analice los riesgos

c) Evalúe cuáles requieren tratamiento

d) Identifique tratamientos consistentes con los objetivos de continuidad y el apetito de riesgo de la organización

**¿Qué significa en la práctica?**

**Identificar riesgos (ejemplos):**

| Categoría | Amenaza | Riesgo específico |
|-----------|---------|------------------|
| Natural | Terremoto | Colapso de edificio corporativo |
| Natural | Inundación | Daño al data center |
| Tecnológica | Ciberataque | Ransomware que encripta sistemas críticos |
| Tecnológica | Falla hardware | Falla del servidor principal |
| Humana | Pandemia | 50% de personal no disponible |
| Humana | Renuncia masiva | Pérdida de personal clave |
| Proveedor | Quiebra | Proveedor cloud deja de operar |

**Analizar riesgos:**

| Riesgo | Probabilidad | Impacto | Nivel de riesgo |
|--------|--------------|---------|-----------------|
| Ransomware | Media | Crítico | ALTO |
| Terremoto grado 8 | Baja | Catastrófico | ALTO |
| Falla servidor | Alta | Medio | MEDIO |
| Pandemia prolongada | Baja | Alto | MEDIO |

**Tratamiento de riesgos:**

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| **Mitigar** | Reducir probabilidad o impacto | Backup multi-región para ransomware |
| **Transferir** | Pasar el riesgo a otro | Seguro de interrupción de negocio |
| **Aceptar** | Aceptar el riesgo residual | Riesgos de bajo impacto |
| **Evitar** | Eliminar la fuente de riesgo | No almacenar datos sensibles localmente |

---

### 8.3 Estrategias y soluciones de continuidad del negocio

#### 8.3.1 Generalidades

**Requisito (SHALL):** La organización debe establecer, implementar y mantener procesos para determinar y seleccionar estrategias de continuidad basándose en los resultados del BIA y la evaluación de riesgos.

#### 8.3.2 Determinación y selección

**Requisito (SHALL):** Las estrategias seleccionadas deben:

a) Basarse en los requisitos determinados por el análisis de impacto
b) Ser capaces de proteger, estabilizar, continuar, reanudar y recuperar actividades priorizadas
c) Ser capaces de mitigar, responder y gestionar los impactos de la interrupción

**Estrategias típicas:**

| Recurso | Estrategia | Descripción |
|---------|-----------|-------------|
| **Personal** | Trabajo remoto | Personal opera desde casa |
| **Personal** | Cross-training | Personal puede cubrir múltiples roles |
| **Personal** | Personal de respaldo | Tercerizar temporalmente |
| **Instalaciones** | Sitio alterno | Oficina de respaldo |
| **Instalaciones** | Trabajo desde casa | Operación distribuida |
| **Tecnología** | Hot site | Data center de respaldo activo |
| **Tecnología** | Warm site | Data center listo pero inactivo |
| **Tecnología** | Cloud | Recuperación en nube pública |
| **Proveedores** | Proveedores alternos | Segundo proveedor calificado |
| **Proveedores** | Inventario de seguridad | Stock adicional |

#### 8.3.3 Requisitos de recursos

**Requisito (SHALL):** Para implementar las estrategias seleccionadas, la organización debe determinar:

a) Personas con habilidades, conocimiento y competencia apropiados
b) Información y datos
c) Edificios, ambiente de trabajo e infraestructura asociada
d) Instalaciones, equipamiento y consumibles
e) Sistemas de TIC
f) Transporte y logística
g) Finanzas
h) Socios y proveedores

---

### 8.4 Establecimiento e implementación de procedimientos de continuidad

#### 8.4.1 Generalidades

**Requisito (SHALL):** La organización debe establecer, implementar y mantener procedimientos para gestionar una interrupción y continuar sus actividades basándose en los objetivos de recuperación identificados en el BIA y las estrategias seleccionadas.

#### 8.4.2 Estructura de respuesta

**Requisito (SHALL):** La organización debe establecer, implementar y mantener una estructura de respuesta que:

a) Identifique umbrales de impacto que justifiquen inicio de respuesta formal
b) Evalúe la naturaleza y extensión de una interrupción
c) Active una respuesta de continuidad apropiada

La organización debe tener procedimientos para:
- Activación de respuesta
- Operación de respuesta
- Coordinación de respuesta
- Comunicación con partes interesadas internas y externas

**¿Qué significa en la práctica?**

**Niveles de respuesta típicos:**

| Nivel | Nombre | Criterio de activación | Quién responde |
|-------|--------|----------------------|----------------|
| 1 | Incidente menor | Impacto localizado, <4 horas | Equipo local |
| 2 | Incidente mayor | Múltiples áreas, 4-24 horas | Equipo de recuperación |
| 3 | Crisis | Impacto severo, >24 horas | Comité de crisis |
| 4 | Desastre | Amenaza la viabilidad | Alta dirección + externo |

#### 8.4.3 Advertencia y comunicación

**Requisito (SHALL):** La organización debe establecer, implementar y mantener procedimientos para:

a) Detectar incidentes
b) Monitorear incidentes regularmente
c) Comunicación interna dentro de la organización
d) Comunicación externa con partes interesadas
e) Recepción, documentación y respuesta a comunicaciones
f) Interactuar con medios de comunicación
g) Asegurar disponibilidad de medios de comunicación durante interrupción

#### 8.4.4 Planes de continuidad del negocio

**Requisito (SHALL):** La organización debe establecer, implementar y mantener planes de continuidad del negocio y procedimientos.

**Cada plan debe definir:**

a) Propósito, alcance y objetivos
b) Roles y responsabilidades con autoridad
c) Acciones para implementar soluciones
d) Información necesaria para activar, operar, coordinar y comunicar
e) Interdependencias internas y externas y sus interacciones
f) Requisitos de recursos
g) Requisitos de reporte
h) Un proceso de stand-down

**Estructura típica de un BCP:**

1. **Propósito y alcance**
   - Objetivo del plan
   - Procesos cubiertos
   - Escenarios de activación

2. **Roles y responsabilidades**
   - Coordinador del plan
   - Equipo de recuperación
   - Cadena de mando

3. **Activación del plan**
   - Criterios de activación
   - Quién puede activar
   - Notificación inicial

4. **Respuesta inmediata** (primeras 4 horas)
   - Evaluación de daños
   - Comunicación inicial
   - Decisiones críticas

5. **Procedimientos de recuperación**
   - Paso a paso para restaurar operaciones
   - Prioridades de recuperación
   - Recursos necesarios

6. **Comunicación**
   - Árbol de llamadas
   - Mensajes predefinidos
   - Contactos clave

7. **Stand-down (desactivación)**
   - Criterios de retorno a normalidad
   - Transición de vuelta
   - Lecciones aprendidas

#### 8.4.5 Recuperación

**Requisito (SHALL):** La organización debe establecer, implementar y mantener procedimientos para restaurar y retornar las actividades del negocio desde las medidas temporales adoptadas durante y después de un incidente.

**Fases de recuperación:**

| Fase | Objetivo | Actividades |
|------|----------|-------------|
| **Respuesta** | Estabilizar | Contener daño, proteger personas, evaluar |
| **Continuidad** | Mantener operación mínima | Operar en modo degradado, MBCO |
| **Recuperación** | Restaurar operación normal | Reparar, reconstruir, migrar de vuelta |
| **Retorno** | Volver a normalidad | Cerrar modo emergencia, documentar |

---

### 8.5 Programa de ejercicios

**Requisito (SHALL):** La organización debe ejercitar y probar sus procedimientos de continuidad para asegurar que son consistentes con sus objetivos.

La organización debe:
a) Conducir ejercicios y pruebas consistentes con el alcance y objetivos
b) Basar los ejercicios en escenarios apropiados
c) Realizar ejercicios y pruebas a intervalos planificados, cuando haya cambios significativos, o cuando la alta dirección lo solicite
d) Minimizar riesgo de interrupción de operaciones durante ejercicios
e) Producir informes formalizados post-ejercicio con recomendaciones
f) Revisar los resultados y tomar acciones apropiadas
g) Usar los resultados para mejorar el SGCN

**Tipos de ejercicios:**

| Tipo | Descripción | Complejidad | Frecuencia típica |
|------|-------------|-------------|-------------------|
| **Tabletop** | Discusión de escenarios en sala | Baja | Trimestral |
| **Walkthrough** | Recorrido paso a paso del plan | Media | Semestral |
| **Simulación** | Ejecución parcial de procedimientos | Alta | Anual |
| **Ejercicio completo** | Ejecución real del plan | Muy alta | Anual |

---

### 8.6 Evaluación de la documentación y capacidades

**Requisito (SHALL):** La organización debe:

a) Evaluar la efectividad de su documentación y capacidades por medio de revisiones, análisis, ejercicios y pruebas

b) Conducir evaluaciones cuando haya cambios significativos o a intervalos planificados

c) Demostrar que los documentos de continuidad son relevantes, consistentes y vigentes

---

## CLÁUSULA 9: Evaluación del Desempeño

**Propósito general:** Monitorear, medir, analizar y evaluar el SGCN.

### 9.1 Monitoreo, medición, análisis y evaluación

#### 9.1.1 Generalidades

**Requisito (SHALL):** La organización debe determinar:

a) Qué necesita ser monitoreado y medido
b) Los métodos para monitoreo, medición, análisis y evaluación para asegurar resultados válidos
c) Cuándo se debe realizar el monitoreo y medición
d) Cuándo se deben analizar y evaluar los resultados

La organización debe retener información documentada como evidencia de los resultados.

**Indicadores típicos del SGCN:**

| Categoría | Indicador | Meta |
|-----------|-----------|------|
| **Cobertura** | % procesos críticos con BIA | 100% |
| **Cobertura** | % procesos críticos con BCP | 100% |
| **Preparación** | Ejercicios realizados vs planificados | 100% |
| **Efectividad** | RTO real vs RTO objetivo en ejercicios | ≤100% |
| **Actualización** | % planes actualizados en último año | 100% |
| **Capacitación** | % personal clave capacitado | 95% |
| **Incidentes** | MTTR (tiempo medio de recuperación) | Según objetivo |
| **Madurez** | Score de auditoría interna | Mejorando |

#### 9.1.2 Evaluación de procedimientos

**Requisito (SHALL):** La organización debe conducir evaluaciones de sus procedimientos de continuidad por medio de:

a) Ejercicios apropiados
b) Revisiones post-incidente
c) Pruebas de rendimiento de sistemas y tecnologías

**La evaluación debe incluir:**
- Si los objetivos de continuidad se lograron
- Si los planes y procedimientos son adecuados
- Si el personal tiene las habilidades necesarias
- Si los recursos son suficientes

---

### 9.2 Auditoría interna

**Requisito (SHALL):** La organización debe conducir auditorías internas a intervalos planificados para proporcionar información sobre si el SGCN:

a) Es conforme con:
   - Los propios requisitos de la organización para su SGCN
   - Los requisitos de esta norma

b) Está efectivamente implementado y mantenido

La organización debe:
a) Planificar, establecer, implementar y mantener un programa de auditoría
b) Definir criterios y alcance de cada auditoría
c) Seleccionar auditores que aseguren objetividad e imparcialidad
d) Asegurar que los resultados se reporten a la gerencia relevante
e) Retener información documentada como evidencia

**Programa de auditoría típico:**

| Cláusula | Frecuencia | Auditor |
|----------|------------|---------|
| 4-5 (Contexto, Liderazgo) | Anual | Interno |
| 6-7 (Planificación, Apoyo) | Anual | Interno |
| 8 (Operación) | Semestral | Interno |
| 9-10 (Evaluación, Mejora) | Anual | Interno |
| Ciclo completo | Anual | Externo (pre-certificación) |

---

### 9.3 Revisión por la dirección

**Requisito (SHALL):** La alta dirección debe revisar el SGCN de la organización a intervalos planificados para asegurar su continua idoneidad, adecuación y efectividad.

**La revisión debe incluir consideración de:**

a) Estado de acciones de revisiones previas
b) Cambios en cuestiones externas e internas relevantes
c) Información sobre el desempeño del SGCN incluyendo:
   - No conformidades y acciones correctivas
   - Resultados de monitoreo y medición
   - Resultados de auditorías
   - Cumplimiento de objetivos
d) Retroalimentación de partes interesadas
e) Resultados de evaluación de riesgos y estado del tratamiento
f) Resultados de ejercicios
g) Oportunidades para mejora continua

**Los resultados deben incluir decisiones relacionadas con:**

a) Oportunidades de mejora continua
b) Cualquier necesidad de cambios al SGCN
c) Necesidades de recursos
d) Mejora de la efectividad
e) Cualquier implicación para la dirección estratégica

La organización debe retener información documentada como evidencia de los resultados.

**Agenda típica de revisión por la dirección:**

1. Seguimiento de acciones previas
2. Resultados de auditorías internas/externas
3. Estado de no conformidades
4. Indicadores de desempeño
5. Resultados de ejercicios del período
6. Incidentes y lecciones aprendidas
7. Cambios en contexto y partes interesadas
8. Evaluación de recursos
9. Oportunidades de mejora
10. Decisiones y asignación de acciones

---

## CLÁUSULA 10: Mejora

**Propósito general:** Mejorar continuamente el SGCN.

### 10.1 No conformidad y acción correctiva

**Requisito (SHALL):** Cuando ocurra una no conformidad, la organización debe:

a) Reaccionar a la no conformidad y, según aplique:
   - Tomar acción para controlarla y corregirla
   - Lidiar con las consecuencias

b) Evaluar la necesidad de acción para eliminar las causas de la no conformidad:
   - Revisar y analizar la no conformidad
   - Determinar las causas
   - Determinar si existen no conformidades similares

c) Implementar cualquier acción necesaria

d) Revisar la efectividad de cualquier acción correctiva tomada

e) Hacer cambios al SGCN si es necesario

Las acciones correctivas deben ser apropiadas a los efectos de las no conformidades encontradas.

La organización debe retener información documentada como evidencia de:
- La naturaleza de las no conformidades y acciones tomadas
- Los resultados de cualquier acción correctiva

**Proceso de gestión de no conformidades:**

```
1. Identificar NC
   ↓
2. Contener (acción inmediata)
   ↓
3. Analizar causa raíz
   ↓
4. Definir acción correctiva
   ↓
5. Implementar
   ↓
6. Verificar efectividad
   ↓
7. Cerrar NC
```

**Fuentes de no conformidades:**
- Hallazgos de auditoría
- Resultados de ejercicios
- Incidentes reales
- Revisiones por la dirección
- Quejas de partes interesadas
- Auto-evaluaciones

---

### 10.2 Mejora continua

**Requisito (SHALL):** La organización debe mejorar continuamente la idoneidad, adecuación y efectividad del SGCN.

**Fuentes de mejora:**
- Lecciones aprendidas de ejercicios
- Lecciones aprendidas de incidentes reales
- Resultados de auditorías
- Benchmarking con otras organizaciones
- Cambios en mejores prácticas de la industria
- Nuevas tecnologías disponibles
- Retroalimentación de partes interesadas

**Modelo de mejora continua (PDCA):**

```
    PLAN (Planificar)
         ↓
    DO (Hacer)
         ↓
    CHECK (Verificar)
         ↓
    ACT (Actuar)
         ↓
    (volver a PLAN)
```

---

## ANEXO A: Guía para usar esta norma (Informativo)

El Anexo A proporciona guía adicional sobre la implementación. No contiene requisitos adicionales, pero ayuda a interpretar las cláusulas principales.

### A.1 Visión general

El Anexo A proporciona orientación sobre:
- Cómo aplicar cada cláusula
- Ejemplos de implementación
- Consideraciones adicionales

### A.2 Temas clave

| Tema | Guía |
|------|------|
| **Planificación** | El BIA y evaluación de riesgos son la base de todo |
| **Recursos** | Incluir alternativas para todos los recursos críticos |
| **Ejercicios** | Variar tipos y escenarios, incluir proveedores |
| **Documentación** | Mantener simple y usable, no crear burocracia |
| **Mejora** | Usar cada incidente y ejercicio como oportunidad |

---

## Resumen: Los 10 Mandamientos de ISO 22301

1. **Conoce tu organización** - Entiende tu contexto y partes interesadas
2. **Compromete a la dirección** - Sin liderazgo no hay SGCN efectivo
3. **Define tu alcance** - Sé claro en qué está dentro y qué fuera
4. **Haz tu BIA** - Identifica qué es crítico y en cuánto tiempo
5. **Evalúa tus riesgos** - Conoce qué puede interrumpirte
6. **Desarrolla estrategias** - Ten alternativas para todo lo crítico
7. **Documenta planes** - Pero que sean usables, no solo paper
8. **Prueba, prueba, prueba** - Un plan no probado es solo papel
9. **Audita y revisa** - Asegura conformidad y efectividad
10. **Mejora siempre** - Cada incidente te hace más fuerte

---

## Mapeo Rápido: Qué documento va en cada cláusula

| Cláusula | Documento típico |
|----------|-----------------|
| 4.1 | Análisis de contexto |
| 4.2 | Registro de partes interesadas |
| 4.3 | Declaración de alcance |
| 5.2 | Política de continuidad |
| 5.3 | Organigrama BCM, matriz RACI |
| 6.2 | Plan anual BCM, objetivos |
| 7.2 | Registros de capacitación |
| 7.4 | Plan de comunicación de crisis |
| 7.5 | Procedimiento de control documental |
| 8.2.2 | Informes de BIA |
| 8.2.3 | Registro de riesgos |
| 8.3 | Documento de estrategias |
| 8.4.4 | Planes de continuidad (BCP, DRP) |
| 8.5 | Programa de ejercicios, informes |
| 9.2 | Programa de auditoría, informes |
| 9.3 | Actas de revisión por la dirección |
| 10.1 | Registro de NC y acciones correctivas |

---

*Documento generado: 2026-01-13*  
*Basado en: ISO 22301:2019 - Security and resilience — Business continuity management systems — Requirements*  
*Propósito: Guía accesible para implementación y comprensión*
