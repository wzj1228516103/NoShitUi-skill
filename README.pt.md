# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · Português

> Um Skill do Codex para descobrir, comparar e integrar recursos de UI de código aberto. Primeiro compreenda a intenção da interface; depois escolha os recursos e implemente uma alteração pequena e verificável.

**Menos UI confusa, mais interfaces com intenção.**

## O que o Skill faz

O NoShitUi-skill ajuda a evitar o retrabalho causado pela mistura de bibliotecas de componentes, modelos e trechos de código sem critérios claros. Ele relaciona as restrições do projeto a uma estratégia coerente de componentes, ao comportamento das interações e ao registro das fontes.

O fluxo de trabalho tem quatro etapas:

1. **Descobrir**: distinguir sites de inspiração de código reutilizável, bibliotecas de UI, ícones, gráficos e modelos.
2. **Comparar**: avaliar o framework, o ambiente de execução, a cobertura de componentes, a acessibilidade, os temas, o tamanho do pacote, as licenças e as evidências de manutenção.
3. **Integrar**: escolher uma estratégia principal de componentes e implementar uma página ou um fluxo de usuário representativo com alterações mínimas.
4. **Verificar**: conferir os layouts responsivos, o foco do teclado, os estados de interação, a compilação e a origem dos recursos de terceiros.

Defina a intenção da interface antes de escolher recursos e estabeleça regras visuais antes de copiar componentes. Mantenha uma estratégia principal; adicione recursos complementares apenas para uma necessidade específica. Confira as interações e o comportamento em dispositivos móveis junto com a aparência visual.

## Instalação

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

O Skill instalado se chama `noshit-ui-skill`. Abra o Codex novamente e descreva seu objetivo em linguagem natural, ou invoque o Skill explicitamente:

```text
$noshit-ui-skill
```

## Exemplos de uso

```text
Compare MUI, Mantine e shadcn/ui para esta aplicação administrativa em React. Considere SSR, acessibilidade, tamanho do pacote e personalização de temas; depois implemente uma página de tabelas representativa.
```

```text
Preciso apenas de inspiração; não altere o código. Recomende sites de UI para páginas iniciais de SaaS, onboarding móvel e painéis de dados, indicando quais servem apenas como referência.
```

Antes de recomendar uma solução, examine a tecnologia e as dependências existentes. Ao integrar recursos, registre compatibilidade, custo de integração, controle de temas e código-fonte, requisitos de acessibilidade, licenças e evidências de manutenção. Descobrir recursos, por si só, não autoriza instalar dependências ou copiar código.

## Recursos

| Documento | Finalidade |
| --- | --- |
| [SKILL.md](SKILL.md) | Ponto de entrada instalável e fluxo de trabalho |
| [Bibliotecas de UI](open-source-ui-resources/references/ui-libraries.md) | Opções de componentes por framework e finalidade |
| [Sites de UI](open-source-ui-resources/references/ui-websites.md) | Inspiração, componentes e padrões de interface |
| [Seleção e integração](open-source-ui-resources/references/selection-and-adoption.md) | Critérios para escolher e incorporar recursos |

Sites de inspiração ajudam a estudar hierarquia, fluxos, espaçamento, estados e comportamento responsivo. O código reutilizável deve vir de um repositório oficial, pacote ou página que disponibilize explicitamente o código-fonte. Verifique separadamente os termos para código, imagens, fontes, ícones e recursos de marca.

## Exemplos de resultados

O Skill pode transformar a seleção de recursos em páginas funcionais com diferentes direções visuais. Estes exemplos mostram resultados possíveis; o projeto continua focado em descobrir, selecionar, integrar e verificar recursos.
[Explorar os exemplos](https://wzj1228516103.github.io/NoShitUi-skill/) · [Ver o código-fonte](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo)

## Validação e manutenção

Depois de atualizar o catálogo, execute:

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

Use `--check-links` quando houver acesso à rede. Links bloqueados, limitados ou com tempo de espera esgotado estão **não verificados**; não devem ser considerados inválidos automaticamente. Em uma integração real, execute também a verificação de tipos, o lint e a compilação do projeto, e confira os layouts de desktop e dispositivos móveis, o foco, os diálogos, os estados de carregamento/vazio/erro e a redução de movimento.

## Escopo e licenças

O Skill serve para pesquisar inspiração, selecionar componentes, comparar designs, criar protótipos e realizar pequenas integrações. Ele não substitui uma auditoria formal de acessibilidade, revisão de licenças, autorização de marca, testes de desempenho ou aprovação de publicação. Se não for possível confirmar as fontes oficiais, versões ou termos, mantenha o recurso como inspiração até reunir as evidências necessárias.

O conteúdo original do Skill usa a [licença MIT](LICENSE). Projetos de terceiros, recursos remotos e componentes copiados mantêm suas próprias licenças ou termos de uso; “gratuito”, “copiável”, “MIT” e “código aberto” não são equivalentes. Consulte [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) para informações sobre as fontes. Este projeto não é um produto oficial dos projetos mencionados nem tem o apoio deles.

Issues e sugestões de melhoria são bem-vindas.
