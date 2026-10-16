# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · Español · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

<div align="center">
  <h3>UI sin caos — Un Skill de IA para descubrir, seleccionar e implementar interfaces</h3>
  <p><sub>Less Shit UI, More Intentional Interfaces.</sub></p>
</div>

> Un Skill que se carga cuando hace falta para tareas de páginas web, interfaces de producto y exploración de diseño: ayuda a la IA a comprender primero la intención de la interfaz, elegir recursos de UI de código abierto con criterios claros e implementarlos mediante cambios mínimos y verificables.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-2563EB.svg)](SKILL.md)
[![Catalog](https://img.shields.io/badge/catalog-open--source%20UI-0ea5e9.svg)](open-source-ui-resources/references/ui-libraries.md)

## Introducción al proyecto

NoShitUi-skill aborda una de las principales causas de retrabajo en UI: disponer de numerosas bibliotecas de componentes, plantillas, sitios de inspiración y fragmentos de código sin criterios claros para elegirlos. El resultado suele ser una mezcla de sistemas de diseño, con inconsistencias visuales, interacciones incompletas y licencias poco claras.

El Skill divide el trabajo en cuatro etapas:

1. **Descubrir recursos**: distinguir sitios de inspiración, código fuente de componentes, bibliotecas completas de UI, iconos, gráficos y plantillas.
2. **Comparar opciones**: filtrar según el framework del proyecto, el entorno de ejecución, la cobertura de componentes, la accesibilidad, las capacidades de temas, el tamaño del paquete, las licencias y el estado de mantenimiento.
3. **Implementar**: definir una estrategia principal de componentes e implementar una página o un flujo de usuario representativo con cambios mínimos.
4. **Validar la entrega**: comprobar el diseño adaptable, el foco del teclado, los estados de interacción, los resultados de compilación y el origen de los recursos de terceros.

El archivo [`SKILL.md`](SKILL.md) de la raíz es el punto de entrada que se puede instalar directamente; [`open-source-ui-resources/`](open-source-ui-resources/) contiene las reglas detalladas, el catálogo de recursos y los scripts de mantenimiento.

## La idea de una UI sin caos

Una UI caótica no se diseña de una sola vez: se acumula cada vez que alguien dice «busquemos algo ya hecho», «añadamos otro componente» o «ya lo unificaremos después».

El principio central es sencillo:

> **Define la intención de la interfaz antes de elegir recursos; establece reglas visuales antes de copiar componentes.**

Tres reglas:

- Confirma por separado el origen de la inspiración, el código, las fuentes, las imágenes, los iconos y los recursos de marca. Un sitio de demostración no equivale a un repositorio de código abierto.
- Da prioridad a una estrategia principal de componentes por proyecto. Añade primitivas sin estilos, iconos o recursos de animación solo para cubrir una carencia concreta.
- Los estados de interacción y el comportamiento móvil son tan importantes como el aspecto visual; no basta con revisar capturas estáticas.

## Capacidades principales

| Capacidad | Preguntas que resuelve | Entrega principal |
| --- | --- | --- |
| Descubrimiento de recursos | «¿Qué sitios de UI y bibliotecas de código abierto puedo consultar?» | Catálogo clasificado, usos, enlaces oficiales y notas sobre las condiciones |
| Selección de UI | «¿Cómo elijo entre MUI, shadcn/ui, Radix y Element Plus?» | Comparación del ecosistema, modelo de estilos, cobertura, costes y licencias |
| Recomendación para un proyecto | «Recomienda una solución para la tecnología de este proyecto.» | Una estrategia principal, una alternativa y los motivos de la elección |
| Implementación de páginas | «Integra en el proyecto la solución de componentes elegida.» | Una página o un flujo de usuario mínimo y representativo, el tema y un registro de fuentes |
| Comprobación de calidad | «¿Es fiable este cambio de UI?» | Validación en escritorio y móvil, foco del teclado, estados y compilación |

Puedes activar estas capacidades con lenguaje natural, sin memorizar comandos con barra. También puedes invocar el Skill explícitamente con `$noshit-ui-skill`.

## Ejemplos de resultados (vista rápida, solo como demostración)

### Página de inicio en línea

La página de inicio combina blancos fríos y tonos plateados con efectos de luz azul, ventanas flotantes con vistas de proyectos reales y paralaje al mover el cursor.

- **20 ejemplos funcionales**: búsqueda por palabras clave, categorías y un filtro 3D para acceder a cada demostración.
- **Ocho idiomas**: chino simplificado, inglés, japonés, coreano, español, francés, alemán y portugués, con enlaces a las guías README correspondientes.
- **Escritorio y móvil**: el diseño y las vistas previas se adaptan a la pantalla y respetan la preferencia del sistema de movimiento reducido.

<p align="center">
  <a href="https://wzj1228516103.github.io/NoShitUi-skill/?lang=es"><img src="docs/screenshots/concepts/showcase-desktop.png" alt="Página de inicio plateada y azul de NoShitUi-skill con vistas flotantes de proyectos, mostrada en chino" width="920"></a>
</p>

<details>
  <summary>Ver la página de inicio en móvil</summary>
  <p align="center">
    <img src="docs/screenshots/concepts/showcase-mobile.png" alt="Página de inicio móvil plateada y azul con texto y vistas flotantes de proyectos en vertical, mostrada en chino" width="320">
  </p>
</details>

### 20 ejemplos interactivos

El carrusel muestra los 20 proyectos implementados, empezando por las cuatro experiencias 3D: OBJECT, rooted., DRIFT y ORBITAL. Después aparecen las interfaces operativas, el panel de pedidos shadcn, el atlas de recursos UI ATLAS y todos los demás conceptos de marca y movimiento. La página de inicio mantiene el mismo orden y ofrece filtro 3D, categorías y búsqueda. El proyecto sigue centrado en descubrir, seleccionar, integrar y verificar recursos. [Explorar la demostración completa](https://wzj1228516103.github.io/NoShitUi-skill/) · [Ver el código de la demostración](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) · [Explorar el mapa de recursos](https://wzj1228516103.github.io/NoShitUi-skill/resources.html)

<p align="center">
  <img src="docs/screenshots/concepts/ui-atlas-showcase.gif" alt="Los 20 proyectos, con las experiencias 3D primero" width="920">
</p>
<p align="center"><sub>OBJECT// · rooted. · DRIFT. · ORBITAL/ · TEMPO · FRAME · STAY · NODE · LOOP · SOURCE · ARCHIVE · PLATE · PRECISION_ · SHADCN/OPS · UI ATLAS · FORME · OFFGRID · NOVA//25 · AETHER · KINETIC_</sub></p>

## Flujo de trabajo

### 1. Identificar el tipo de tarea

- **Descubrimiento**: cuando solo se necesitan recomendaciones, ofrece una lista breve por categorías con enlaces oficiales, sin modificar el proyecto.
- **Selección**: antes de proponer una solución principal y sus ventajas y limitaciones, examina la tecnología del proyecto, las versiones, las rutas, la solución de estilos y las dependencias existentes.
- **Implementación**: instala o copia recursos solo después de que el usuario pida expresamente modificar el código; implementa entonces un caso mínimo y verificable.
- **Mantenimiento**: al actualizar el catálogo, comprueba las fuentes oficiales, las licencias y las referencias locales; después ejecuta el script de comprobación.

### 2. Elegir una estrategia principal

- **Sistema completo con estilos**: adecuado para productos con muchas pantallas administrativas, formularios, tablas y operaciones CRUD. Es una opción prioritaria cuando se necesita cubrir rápidamente numerosos componentes.
- **Primitivas sin estilos**: adecuadas para productos con un lenguaje de marca definido que requieren control del DOM y CSS. Presta especial atención a la gestión del foco y al comportamiento del teclado.
- **Código fuente bajo control del proyecto**: adecuado para equipos que quieren incorporar el código de los componentes al proyecto y mantenerlo por su cuenta a largo plazo. Conserva el origen del código copiado y las licencias de sus dependencias.
- **CSS o clases utilitarias**: adecuado para equipos dispuestos a responsabilizarse de la composición de componentes, las interacciones y la accesibilidad.

Por defecto, recomienda una estrategia principal de componentes y, como máximo, un recurso adicional de iconos o comportamiento para una necesidad concreta. No incorpores varios sistemas completos de diseño solo porque sus ejemplos resulten atractivos.

### 3. Registrar los criterios de adopción

Para los recursos que se instalen o copien, registra al menos lo siguiente:

| Aspecto | Qué hay que confirmar |
| --- | --- |
| Compatibilidad | Framework, versiones, SSR/RSC, navegadores y gestor de paquetes |
| Cobertura | Necesidades reales de tablas, fechas, cargas de archivos, menús de comandos, gráficos, navegación, etc. |
| Coste de integración | peer dependencies, Provider, estilos globales, tamaño del paquete y carga de las actualizaciones |
| Control del producto | Tokens de tema, control del DOM, propiedad del código fuente y formas de personalización |
| Requisitos de calidad | Teclado, foco, semántica, lectores de pantalla, RTL, localización y reduced motion |
| Licencias | Autorizaciones separadas para paquetes directos, código copiado, plantillas, fuentes, imágenes, iconos y ejemplos |
| Evidencias de mantenimiento | Versiones compatibles, publicaciones recientes, gestión de incidencias y avisos de seguridad |

## Catálogo de recursos

El catálogo detallado está en [`open-source-ui-resources/references/`](open-source-ui-resources/references/) e incluye:

- **Sistemas con estilos para React**: MUI, Ant Design, Mantine, Chakra UI, PrimeReact, Fluent UI.
- **Primitivas sin estilos y soluciones de código fuente para React**: shadcn/ui, Radix UI, React Aria, Headless UI, Base UI.
- **Sistemas de componentes para Vue**: Element Plus, Naive UI, Vuetify, Quasar, PrimeVue, Arco Design Vue.
- **Soluciones para Svelte e independientes del framework**: Skeleton, Melt UI, shadcn-svelte, Bootstrap, Bulma, Pico CSS, Tailwind CSS, daisyUI.
- **Iconos y visualización**: Lucide, Heroicons, Tabler Icons, Phosphor, Apache ECharts, Recharts, Nivo.
- **Inspiración y referencias de patrones**: Mobbin, Page Flows, Godly, Awwwards, UIverse, HyperUI, Component Gallery, Component Party.

El catálogo no es un registro exhaustivo. Los sitios de demostración sirven principalmente para estudiar jerarquía, flujos, espaciado, estados y cambios adaptables. Solo los repositorios oficiales, los paquetes o las páginas que indiquen expresamente que ofrecen código fuente pueden utilizarse como fuentes de código reutilizable. Las condiciones del código, las imágenes, las fuentes, los iconos y los recursos de marca deben comprobarse por separado para cada recurso.

## Instalación

Instala el repositorio como un Skill de Codex:

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

Si aparece `noshit-ui-skill`, la instalación se ha completado. Vuelve a abrir Codex y describe directamente el objetivo de tu interfaz.

## Ejemplos de uso

```text
Compara MUI, Mantine y shadcn/ui para esta aplicación de administración en React. Considera SSR, accesibilidad, tamaño del paquete y personalización de temas; después implementa una página de tablas representativa.
```

```text
Solo necesito inspiración; no cambies el código. Recomienda sitios de UI para páginas de inicio de SaaS, onboarding móvil y paneles de datos, e indica cuáles sirven únicamente como referencia.
```

```text
Este proyecto de Vue 3 ya utiliza Element Plus. Examina primero las dependencias y el tema existentes; después recomienda una solución complementaria de iconos, sin incorporar una segunda biblioteca completa de componentes.
```

```text
Revisa si este cambio de UI tiene conflictos de estilos globales, pérdida del foco del teclado, desbordamiento horizontal en móviles, estados loading/empty/error ausentes o fuentes poco claras de recursos de terceros. Por ahora, solo revisa; no hagas cambios.
```

## Estructura del directorio

```text
.
├─ SKILL.md                              # Punto de entrada del Skill instalable desde la raíz
├─ README.*.md                           # Introducción y guías de uso en varios idiomas
├─ agents/openai.yaml                    # Metadatos de la interfaz de Codex
├─ open-source-ui-resources/
│  ├─ SKILL.md                           # Reglas de descubrimiento e integración de recursos
│  ├─ references/ui-libraries.md         # Bibliotecas de UI por framework y uso
│  ├─ references/ui-websites.md          # Sitios de inspiración, componentes y patrones
│  ├─ references/selection-and-adoption.md
│  └─ scripts/check_catalog.py           # Script para comprobar referencias locales y enlaces
```

## Validación y mantenimiento

Después de modificar el catálogo de recursos, ejecuta:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Cuando haya acceso a la red, puedes comprobar los enlaces externos:

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

Los enlaces bloqueados, sujetos a límites de solicitudes o con tiempo de espera agotado deben marcarse como «sin verificar», sin clasificarlos directamente como enlaces rotos. En una integración real, ejecuta también los comandos typecheck, lint y build del propio proyecto. Revisa en escritorio y móvil los desbordamientos, los objetivos táctiles, el foco, los diálogos, los estados loading, empty y error, y el comportamiento reduced-motion.

## Límites de uso

- Adecuado para organizar inspiración de UI, seleccionar componentes, comparar direcciones de diseño, crear prototipos de interfaces y realizar pequeñas integraciones.
- La presencia de un recurso en el catálogo no implica que deba instalarse o copiarse automáticamente; antes de implementarlo, confirma las restricciones del proyecto y la autorización del usuario.
- No sustituye una auditoría formal de accesibilidad, una revisión de licencias, la autorización de marca, las pruebas de rendimiento bajo carga ni la aprobación de publicación.
- «Gratis», «se puede copiar», «MIT» y «código abierto» no son promesas equivalentes. Las licencias deben comprobarse para cada paquete, archivo y recurso concreto.
- Si no puedes confirmar una fuente oficial, una versión o las condiciones de uso, conserva el recurso como referencia de inspiración hasta reunir las evidencias necesarias.

## Referencias y licencias

- [Component Gallery](https://component.gallery/): compara patrones de componentes de distintos sistemas de diseño.
- [Component Party](https://component-party.dev/): compara cómo se escriben componentes en React, Vue, Svelte y otros frameworks.
- [Radix UI](https://www.radix-ui.com/) y [React Aria](https://react-spectrum.adobe.com/react-aria/): referencias de interacciones sin estilos y comportamiento accesible.

Este proyecto no es un producto oficial de los proyectos mencionados ni cuenta con su respaldo. El contenido original del Skill utiliza la [licencia MIT](LICENSE); los proyectos de terceros del catálogo, los recursos remotos y los componentes copiados a otros proyectos están sujetos a sus propias licencias o condiciones del sitio web. Las notas sobre las fuentes del repositorio están en [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

Las incidencias y las sugerencias de mejora son bienvenidas.
