# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · Español · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

> Un Skill de Codex para descubrir, comparar e integrar recursos de UI de código abierto. Primero comprende la intención de la interfaz; después selecciona los recursos e implementa un cambio pequeño y verificable.

**Menos UI caótica, más interfaces con intención.**

## Qué hace este Skill

NoShitUi-skill ayuda a evitar el retrabajo causado por mezclar bibliotecas de componentes, plantillas y fragmentos de código sin criterios claros. Vincula las restricciones del proyecto con una estrategia de componentes coherente, el comportamiento de las interacciones y el registro de las fuentes.

El flujo de trabajo tiene cuatro etapas:

1. **Descubrir**: distinguir los sitios de inspiración del código reutilizable, las bibliotecas de UI, los iconos, los gráficos y las plantillas.
2. **Comparar**: evaluar el framework, el entorno de ejecución, la cobertura de componentes, la accesibilidad, los temas, el tamaño del paquete, las licencias y las evidencias de mantenimiento.
3. **Integrar**: elegir una estrategia principal de componentes e implementar una página o un flujo de usuario representativo con cambios mínimos.
4. **Verificar**: revisar los diseños adaptables, el foco del teclado, los estados de interacción, la compilación y el origen de los recursos de terceros.

Define la intención de la interfaz antes de elegir recursos y establece reglas visuales antes de copiar componentes. Mantén una estrategia principal; añade recursos complementarios solo para una necesidad concreta. Revisa las interacciones y el comportamiento móvil junto con el aspecto visual.

## Instalación

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

El Skill instalado se llama `noshit-ui-skill`. Vuelve a abrir Codex y describe tu objetivo en lenguaje natural, o invócalo explícitamente:

```text
$noshit-ui-skill
```

## Ejemplos de uso

```text
Compara MUI, Mantine y shadcn/ui para esta aplicación de administración en React. Considera SSR, accesibilidad, tamaño del paquete y personalización de temas; después implementa una página de tablas representativa.
```

```text
Solo necesito inspiración; no cambies el código. Recomienda sitios de UI para páginas de inicio de SaaS, onboarding móvil y paneles de datos, e indica cuáles sirven únicamente como referencia.
```

Antes de recomendar una solución, revisa la tecnología y las dependencias existentes. Al integrar recursos, registra su compatibilidad, coste de integración, control de temas y código fuente, requisitos de accesibilidad, licencias y evidencias de mantenimiento. Descubrir recursos no autoriza por sí solo a instalar dependencias ni copiar código.

## Recursos

| Documento | Propósito |
| --- | --- |
| [SKILL.md](SKILL.md) | Punto de entrada instalable y flujo de trabajo |
| [Bibliotecas de UI](open-source-ui-resources/references/ui-libraries.md) | Opciones de componentes por framework y uso |
| [Sitios de UI](open-source-ui-resources/references/ui-websites.md) | Inspiración, componentes y patrones de interfaz |
| [Selección e integración](open-source-ui-resources/references/selection-and-adoption.md) | Criterios para elegir e incorporar recursos |

Los sitios de inspiración permiten estudiar jerarquía, flujos, espaciado, estados y comportamiento adaptable. El código reutilizable debe proceder de un repositorio oficial, un paquete o una página que ofrezca explícitamente su código fuente. Comprueba por separado las condiciones del código, las imágenes, las fuentes, los iconos y los recursos de marca.

## Ejemplos de resultados

El Skill puede convertir la selección de recursos en páginas funcionales con distintas direcciones visuales. Estos ejemplos muestran posibles resultados; el proyecto se centra en descubrir, seleccionar, integrar y verificar recursos.
[Explorar los ejemplos](https://wzj1228516103.github.io/NoShitUi-skill/) · [Ver su código fuente](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo)

## Validación y mantenimiento

Después de actualizar el catálogo, ejecuta:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Usa `--check-links` cuando haya acceso a la red. Los enlaces bloqueados, limitados o con tiempo de espera agotado están **sin verificar**; no se consideran rotos automáticamente. Para una integración real, ejecuta también las comprobaciones de tipos, lint y compilación del proyecto, y revisa los diseños de escritorio y móvil, el foco, los diálogos, los estados de carga/vacío/error y la reducción de movimiento.

## Alcance y licencias

El Skill sirve para buscar inspiración, seleccionar componentes, comparar diseños, crear prototipos e integrar cambios pequeños. No sustituye una auditoría formal de accesibilidad, revisión de licencias, autorización de marca, pruebas de rendimiento ni aprobación de publicación. Si no puedes confirmar las fuentes oficiales, las versiones o las condiciones, conserva el recurso como referencia hasta obtener pruebas suficientes.

El contenido original del Skill usa la [licencia MIT](LICENSE). Los proyectos de terceros, los recursos remotos y los componentes copiados mantienen sus propias licencias o condiciones de uso; «gratis», «copiable», «MIT» y «código abierto» no son equivalentes. Consulta [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) para conocer las fuentes. Este proyecto no es un producto oficial de los proyectos mencionados ni cuenta con su respaldo.

Las incidencias y las propuestas de mejora son bienvenidas.
