# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · Português

<div align="center">
  <h3>UI sem bagunça — Um Skill de IA para descobrir, selecionar e implementar interfaces</h3>
  <p><sub>Less Shit UI, More Intentional Interfaces.</sub></p>
</div>

> Um Skill carregado sob demanda para tarefas de páginas web, interfaces de produto e exploração de design: ajuda a IA a compreender primeiro a intenção da interface, escolher recursos de UI de código aberto com critérios claros e implementá-los por meio de alterações mínimas e verificáveis.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-2563EB.svg)](SKILL.md)
[![Catalog](https://img.shields.io/badge/catalog-open--source%20UI-0ea5e9.svg)](open-source-ui-resources/references/ui-libraries.md)

## Apresentação do projeto

O NoShitUi-skill trata de uma das maiores causas de retrabalho em UI: ter à disposição muitas bibliotecas de componentes, modelos, sites de inspiração e trechos de código, mas nenhum critério claro para escolhê-los. O resultado costuma ser uma mistura de sistemas de design, com inconsistências visuais, interações incompletas e licenças pouco claras.

O Skill divide o trabalho em quatro etapas:

1. **Descobrir recursos**: distinguir sites de inspiração, código-fonte de componentes, bibliotecas completas de UI, ícones, gráficos e modelos.
2. **Comparar opções**: filtrar com base no framework do projeto, ambiente de execução, cobertura de componentes, acessibilidade, recursos de temas, tamanho do pacote, licenças e estado de manutenção.
3. **Implementar**: definir uma estratégia principal de componentes e implementar uma página ou um fluxo de usuário representativo com alterações mínimas.
4. **Validar a entrega**: verificar o layout responsivo, o foco do teclado, os estados de interação, os resultados da compilação e a origem dos recursos de terceiros.

O arquivo [`SKILL.md`](SKILL.md) na raiz é o ponto de entrada que pode ser instalado diretamente; [`open-source-ui-resources/`](open-source-ui-resources/) reúne as regras detalhadas, o catálogo de recursos e os scripts de manutenção.

## A ideia de uma UI sem bagunça

Uma UI confusa não nasce de uma única decisão de design: ela se acumula a cada “vamos pegar algo pronto”, “vamos adicionar mais um componente” ou “depois a gente padroniza”.

O princípio central é simples:

> **Defina a intenção da interface antes de escolher recursos; estabeleça regras visuais antes de copiar componentes.**

Três regras:

- Confirme separadamente a origem da inspiração, do código, das fontes, das imagens, dos ícones e dos recursos de marca. Um site de demonstração não equivale a um repositório de código aberto.
- Dê prioridade a uma estratégia principal de componentes por projeto. Acrescente primitivas sem estilos, ícones ou recursos de animação apenas para preencher uma lacuna específica.
- Os estados de interação e o comportamento em dispositivos móveis são tão importantes quanto a aparência visual; verificar apenas capturas estáticas não basta.

## Capacidades principais

| Capacidade | Perguntas que resolve | Entrega principal |
| --- | --- | --- |
| Descoberta de recursos | “Quais sites de UI e bibliotecas de código aberto posso consultar?” | Catálogo por categorias, usos, links oficiais e observações sobre os termos |
| Seleção de UI | “Como escolher entre MUI, shadcn/ui, Radix e Element Plus?” | Comparação de ecossistema, modelo de estilos, cobertura, custos e licenças |
| Recomendação para um projeto | “Recomende uma solução para a tecnologia deste projeto.” | Uma estratégia principal, uma alternativa e os motivos da escolha |
| Implementação de páginas | “Integre ao projeto a solução de componentes escolhida.” | Uma página ou um fluxo de usuário mínimo e representativo, o tema e um registro de fontes |
| Verificação de qualidade | “Esta alteração de UI é confiável?” | Validação em desktop e dispositivos móveis, foco do teclado, estados e compilação |

Essas capacidades podem ser acionadas em linguagem natural, sem memorizar comandos com barra. Você também pode invocar o Skill explicitamente com `$noshit-ui-skill`.

## Exemplos de resultados (visualização rápida, apenas para demonstração)

O Skill também pode transformar a seleção de recursos em páginas funcionais com diferentes direções visuais. O carrossel automático abaixo permite explorar rapidamente 7 páginas conceituais; o projeto continua focado na descoberta de recursos, nos critérios de seleção, nas regras de integração e no processo de validação. [Explorar a demonstração completa](https://wzj1228516103.github.io/NoShitUi-skill/) · [Ver o código-fonte da demonstração](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) · [Explorar o mapa de recursos](https://wzj1228516103.github.io/NoShitUi-skill/resources.html)

<p align="center">
  <img src="docs/screenshots/concepts/ui-atlas-showcase.gif" alt="Prévia de sete direções visuais" width="920">
</p>
<p align="center"><sub>FORME · OFFGRID · rooted. · ORBITAL · NOVA//25 · AETHER · KINETIC</sub></p>

## Fluxo de trabalho

### 1. Identificar o tipo de tarefa

- **Descoberta**: quando o usuário precisa apenas de recomendações, forneça uma lista curta por categorias com links oficiais, sem modificar o projeto.
- **Seleção**: antes de apresentar uma solução principal e suas vantagens e limitações, examine a tecnologia do projeto, as versões, as rotas, a solução de estilos e as dependências existentes.
- **Implementação**: instale ou copie recursos somente depois que o usuário pedir explicitamente alterações no código; então implemente um caso mínimo e verificável.
- **Manutenção**: ao atualizar o catálogo, confira as fontes oficiais, as licenças e as referências locais; depois execute o script de verificação.

### 2. Escolher uma estratégia principal

- **Sistema completo com estilos**: adequado para produtos com muitas telas administrativas, formulários, tabelas e operações CRUD. Deve ser considerado primeiro quando é preciso cobrir rapidamente muitos componentes.
- **Primitivas sem estilos**: adequadas para produtos com uma linguagem de marca definida que exigem controle do DOM e do CSS. Verifique especialmente o gerenciamento de foco e o comportamento do teclado.
- **Código-fonte sob controle do projeto**: adequado para equipes que querem incorporar o código dos componentes ao projeto e mantê-lo por conta própria a longo prazo. Preserve a origem do código copiado e as licenças das dependências.
- **CSS ou classes utilitárias**: adequado para equipes dispostas a assumir a composição dos componentes, os comportamentos de interação e a acessibilidade.

Por padrão, recomende uma estratégia principal de componentes e, no máximo, um recurso adicional de ícones ou comportamento para uma finalidade específica. Não adicione vários sistemas completos de design apenas porque os exemplos de diferentes sites são atraentes.

### 3. Registrar os critérios de adoção

Para os recursos que forem instalados ou copiados, registre pelo menos:

| Aspecto | O que confirmar |
| --- | --- |
| Compatibilidade | Framework, versões, SSR/RSC, navegadores e gerenciador de pacotes |
| Cobertura | Necessidades reais de tabelas, datas, uploads, menus de comandos, gráficos, navegação etc. |
| Custo de integração | peer dependencies, Provider, estilos globais, tamanho do pacote e esforço de atualização |
| Controle do produto | Tokens de tema, controle do DOM, propriedade do código-fonte e formas de personalização |
| Requisitos de qualidade | Teclado, foco, semântica, leitores de tela, RTL, localização e reduced motion |
| Licenças | Autorizações separadas para pacotes diretos, código copiado, modelos, fontes, imagens, ícones e exemplos |
| Evidências de manutenção | Versões compatíveis, lançamentos recentes, tratamento de issues e avisos de segurança |

## Catálogo de recursos

O catálogo detalhado está em [`open-source-ui-resources/references/`](open-source-ui-resources/references/) e inclui:

- **Sistemas com estilos para React**: MUI, Ant Design, Mantine, Chakra UI, PrimeReact, Fluent UI.
- **Primitivas sem estilos e soluções de código-fonte para React**: shadcn/ui, Radix UI, React Aria, Headless UI, Base UI.
- **Sistemas de componentes para Vue**: Element Plus, Naive UI, Vuetify, Quasar, PrimeVue, Arco Design Vue.
- **Soluções para Svelte e independentes de framework**: Skeleton, Melt UI, shadcn-svelte, Bootstrap, Bulma, Pico CSS, Tailwind CSS, daisyUI.
- **Ícones e visualização**: Lucide, Heroicons, Tabler Icons, Phosphor, Apache ECharts, Recharts, Nivo.
- **Inspiração e referências de padrões**: Mobbin, Page Flows, Godly, Awwwards, UIverse, HyperUI, Component Gallery, Component Party.

O catálogo não é um registro exaustivo. Sites de demonstração servem principalmente para estudar hierarquia, fluxos, espaçamento, estados e mudanças responsivas. Apenas repositórios oficiais, pacotes ou páginas que indiquem explicitamente a disponibilidade do código-fonte podem ser usados como fontes de código reutilizável. Os termos de código, imagens, fontes, ícones e recursos de marca ainda precisam ser verificados separadamente para cada recurso.

## Instalação

Instale o repositório como um Skill do Codex:

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

Se `noshit-ui-skill` aparecer, a instalação está concluída. Abra o Codex novamente e descreva diretamente o objetivo da sua interface.

## Exemplos de uso

```text
Compare MUI, Mantine e shadcn/ui para esta aplicação administrativa em React. Considere SSR, acessibilidade, tamanho do pacote e personalização de temas; depois implemente uma página de tabelas representativa.
```

```text
Preciso apenas de inspiração; não altere o código. Recomende sites de UI para páginas iniciais de SaaS, onboarding móvel e painéis de dados, indicando quais servem apenas como referência.
```

```text
Este projeto de Vue 3 já usa Element Plus. Examine primeiro as dependências e o tema existentes; depois recomende uma solução complementar de ícones, sem adicionar uma segunda biblioteca completa de componentes.
```

```text
Confira se esta alteração de UI tem conflitos de estilos globais, perda de foco do teclado, transbordamento horizontal em dispositivos móveis, estados loading/empty/error ausentes ou origem pouco clara de recursos de terceiros. Por enquanto, apenas verifique; não faça alterações.
```

## Estrutura do diretório

```text
.
├─ SKILL.md                              # Ponto de entrada do Skill instalável a partir da raiz
├─ README.*.md                           # Apresentação e guias de uso em vários idiomas
├─ agents/openai.yaml                    # Metadados da interface do Codex
├─ open-source-ui-resources/
│  ├─ SKILL.md                           # Regras de descoberta e integração de recursos
│  ├─ references/ui-libraries.md         # Bibliotecas de UI por framework e finalidade
│  ├─ references/ui-websites.md          # Sites de inspiração, componentes e padrões
│  ├─ references/selection-and-adoption.md
│  └─ scripts/check_catalog.py           # Script para verificar referências locais e links
```

## Validação e manutenção

Depois de modificar o catálogo de recursos, execute:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Quando houver acesso à rede, você pode verificar os links externos:

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

Links bloqueados, sujeitos a limites de requisições ou com tempo de espera esgotado devem ser marcados como “não verificados”, sem serem classificados diretamente como inválidos. Em uma integração real, execute também os comandos typecheck, lint e build do próprio projeto. Confira em desktop e dispositivos móveis o transbordamento, os alvos de toque, o foco, os diálogos, os estados loading, empty e error, e o comportamento reduced-motion.

## Limites de uso

- Adequado para organizar inspiração de UI, selecionar componentes, comparar direções de design, criar protótipos de interfaces e realizar pequenas integrações.
- A presença de um recurso no catálogo não implica que ele deva ser instalado ou copiado automaticamente; antes da implementação, confirme as restrições do projeto e a autorização do usuário.
- Não substitui uma auditoria formal de acessibilidade, revisão de licenças, autorização de marca, testes de desempenho sob carga ou aprovação de publicação.
- “Gratuito”, “pode ser copiado”, “MIT” e “código aberto” não são promessas equivalentes. As licenças precisam ser verificadas para cada pacote, arquivo e recurso específico.
- Se não for possível confirmar uma fonte oficial, uma versão ou os termos de uso, mantenha o recurso como inspiração até reunir as evidências necessárias.

## Referências e licenças

- [Component Gallery](https://component.gallery/): compara padrões de componentes de diferentes sistemas de design.
- [Component Party](https://component-party.dev/): compara como componentes são escritos em React, Vue, Svelte e outros frameworks.
- [Radix UI](https://www.radix-ui.com/) e [React Aria](https://react-spectrum.adobe.com/react-aria/): referências de interações sem estilos e comportamento acessível.

Este projeto não é um produto oficial dos projetos mencionados nem tem o apoio deles. O conteúdo original do Skill usa a [licença MIT](LICENSE); os projetos de terceiros no catálogo, os recursos remotos e os componentes copiados para outros projetos seguem suas próprias licenças ou termos do site. As notas sobre as fontes do repositório estão em [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

Issues e sugestões de melhoria são bem-vindas.
