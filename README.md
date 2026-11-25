# Cadência — sistema de gestão estratégica

**Nome escolhido em 25/11/2026.** Falta conferir disponibilidade no INPI e nas lojas.

Sistema para **gerenciar pessoas, equipe, projetos pessoais e projetos de outras pessoas** com rotinas de gestão (metas e semanas, mapa do tempo, matriz de pessoas, feedbacks, reuniões, estratégia), em **app** e em **fichas impressas e em PDF**.

**Status:** análise de produto concluída (25/11/2026); **primeira versão do app** (PWA local primeiro, núcleo de gerir a si) publicada pelo GitHub Pages a partir de `main`: https://viniciusandradde.github.io/cadencia-gestao-estrategica/ (código em `apps/web/`, decisão em `docs/05`, seção 2.1). Os dados ficam só no aparelho; o backup é por exportar e importar JSON. **Uso exclusivamente pessoal** do responsável, em **web e APK Android**. O método que inspira o produto é de terceiros: para uso pessoal o risco é baixo, mas **qualquer compartilhamento ou venda exige revisão jurídica** (ver `docs/01-ANALISE-DE-PRODUTO.md`, risco R1). Repositório **privado**.

## Documentos
| Arquivo | Conteúdo |
|---|---|
| `docs/01-ANALISE-DE-PRODUTO.md` | visão, camadas do método, mapa de ferramentas para módulos, princípios, riscos, escopo do MVP |
| `docs/02-PERFIS-E-ESPACOS.md` | espaços (pessoal, equipe, terceiros), papéis, permissões, transparência, perfil da pessoa, cockpit do gestor |
| `docs/03-MODULOS-E-FUNCIONALIDADES.md` | 12 módulos com regras, alertas e fichas ligadas |
| `docs/04-MODELO-DE-DADOS.md` | entidades, relações (diagrama), regras de integridade |
| `docs/05-ARQUITETURA-E-STACK.md` | stack recomendada, segurança, estrutura do repositório, decisões abertas |
| `docs/06-BACKLOG-E-MVP.md` | fases, épicos e as 20 primeiras issues |
| `docs/07-MAPA-DE-NOMES-E-FONTES.md` | nomes próprios do produto, ideias de terceiros, o que não pode virar regra, fichas de origem |
| `docs/08-FICHAS-IMPRIMIVEIS.md` | as 20 fichas em branco e preenchidas, padrões de impressão e fluxo de entrega |
| `docs/09-METODOLOGIA-MESCLADA.md` | **Método Cadência:** o melhor do BHP, da Bússola e do Maestria Emocional por tema, conflitos resolvidos, cadência, caixa de ferramentas unificada (50 ferramentas), lacunas e o que não entra |
| `referencias/` | **material de origem completo** (privado, uso pessoal): fichas de metodologia do BHP (11), da Bússola (8) e do Maestria Emocional (16), sínteses temáticas, texto e PDFs da apostila e do ebook, transcrições do BHP, da Bússola, do Maestria Emocional e da Educação de Filhos; ver `referencias/README.md` |
| `apps/web/` | **app** (React, Vite, PWA): Caderno de Metas, Teste de Realidade, Avaliação Semanal, Registro de Insights e backup; ver `apps/web/README.md` |

## Nome do produto (decidido: Cadência)
Critérios: curto, em português, sem marca de terceiros (evitar "BHP", "Febracis", "Bússola"), que lembre ritmo e rotina de gestão.

| Opção | Ideia | Observação |
|---|---|---|
| **Cadência** (recomendado) | o método vive de rotinas: semana, mês, ritual | repositório sugerido: `cadencia-gestao-estrategica` |
| Aprumo | alinhamento e postura; deriva de "prumo" | repositório: `aprumo-gestao` |
| Leme | quem conduz o rumo | repositório: `leme-gestao` |
| Prumo | direção e alinhamento | **evitar**: é nome de empresa conhecida no Brasil |

Antes de adotar, conferir o nome no INPI e nas lojas de aplicativos; esta lista não faz essa checagem.

## Próximos passos
1. Escolher o nome e criar o repositório no GitHub (privado).
2. Subir esta análise e abrir as 20 primeiras issues (ver `docs/06`).
3. Revisão jurídica do método, da LGPD e dos modelos disciplinares.
4. Começar a Fase 0 (fundação) e a Fase 1 (MVP).
