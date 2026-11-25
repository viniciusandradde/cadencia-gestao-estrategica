# 01 · Análise de produto

**Status:** IN_REVIEW · **Data:** 25/11/2026 · **Fonte do método:** treinamento Business High Performance (BHP), de Paulo Vieira / Febracis, registrado em 11 fichas internas (≈41,5 mil palavras) feitas com palavras próprias. Este documento só usa o que está nas fichas.

## 1. O que queremos construir
**Decisão de 25/11/2026:** o sistema é de **uso exclusivamente pessoal** do responsável e será entregue em **web e APK Android**. Isso reduz o escopo (um único usuário no MVP) e o risco de direitos (seção 6), mas não elimina o cuidado com dados de pessoas.

Um **sistema de gestão estratégica** que transforma o método do BHP em rotinas, registros e painéis usáveis no dia a dia. Quatro usos, escolhidos pelo responsável:
1. **Gerenciar pessoas** (cada pessoa tem um perfil com avaliações, feedbacks e evolução).
2. **Gerenciar a equipe** (visão do time, rituais, metas, clima).
3. **Gerenciar projetos pessoais** do próprio gestor.
4. **Gerenciar projetos de outras pessoas** (mentorados, clientes, parceiros), com espaços separados.

## 2. Por que o método cabe num sistema
O BHP é, em essência, uma coleção de **ferramentas com formulário, ritmo e critério de decisão**. Isso é bom para software: cada ferramenta já tem entrada (nota, lista, texto), frequência (diária, semanal, mensal) e saída (decisão ou plano de ação). O que falta no papel é memória, histórico e cobrança. É aí que o sistema entrega valor.

Camadas do método, na ordem em que o sistema deve respeitá-las:
| Camada | Ideia | O que o sistema faz |
|---|---|---|
| Mentalidade | resultado vem de ação; crenças de identidade, capacidade e merecimento; autorresponsabilidade | diário de metas, perguntas diárias, "historinhas" trocadas por ação |
| Estratégia | lucro primeiro; 3 obsessões; SWOT, Porter, Oceano Azul, matriz de valor | quadros estratégicos versionados e revisados todo ano |
| Gestão de pessoas | escada de desempenho em 10 passos; CHAC; matriz de decisão; clima | perfil da pessoa, registros, lembretes, painel de risco e de evolução |
| Rotina | mapa de produtividade; semana; reuniões ritualísticas e deliberativas; 5W2H | agenda, alarmes de 15 min, pautas, atas e planos de ação |
| Resultado | metas mensais, comissão escalonada, ranking, lucro | metas em níveis, acompanhamento diário, indicadores |

## 3. Usuários e papéis (resumo; detalhe em `02-PERFIS-E-ESPACOS.md`)
- **Gestor (você):** dono da conta; vê todos os espaços.
- **Líder de equipe:** gestor intermediário; vê só a sua equipe.
- **Membro:** vê o que é dele (metas, feedbacks recebidos, mapa de produtividade).
- **Mentorado/cliente:** pessoa de fora com espaço próprio de projetos, que você acompanha.
- **Consultor convidado:** acesso limitado e temporário a um espaço.

## 4. Mapa de ferramentas do método para módulos do app
Cada linha é uma ferramenta citada nas fichas. "Fonte" aponta a ficha (D = dia, ap = apostila, eb = ebook).

| Ferramenta do método | Módulo do app | Frequência | Fonte |
|---|---|---|---|
| Caderno de objetivos, ações e semanas (5 a 10 ações por objetivo; o que sobra vai para a semana seguinte) | Metas e Semanas | semanal | D3-a, ap |
| Meta mensal com teste de realidade (quanto falta, quanto faturar hoje); Quadro de Meta Mensal em níveis (mínima, básica, master) com valor por dia útil | Metas e Semanas / Resultado | diária e mensal | D3-a, ap |
| Mapa de Produtividade (alarme a cada 15 min; urgente, importante, delegável, desnecessário; operacional, tático, estratégico) | Produtividade | 1 a 2 semanas, sob demanda | D3-b, ap |
| Valor da hora (salário ou pró-labore ÷ dias úteis ÷ horas) | Produtividade | sob demanda | D3-b |
| Agenda semanal extraordinária (dia real x dia ideal) | Produtividade | semanal | D3-b |
| Gap de gestão por área (importância 0-10 menos nota atual; gap ≥ 3 vira ação; meta: todos abaixo de 2) | Diagnósticos | trimestral | D2-a, ap |
| Perfis Aventureiro, Empreendedor e Gestor (tabela de critérios) | Diagnósticos | semestral | D1-b, eb-a |
| MAAS (11 pilares, importância menos nota atual) e Matriz de Plenitude | Diagnósticos | quinzenal, mensal, trimestral | eb-b |
| CHAC (conhecimento, habilidade, atitude, caráter), duas colunas por dimensão | Pessoas | mensal | D3-b, ap |
| Matriz de Decisão (competência técnica x emocional, 0 a 10, série mensal) | Pessoas | mensal | D3-b, D4-a |
| Escada de desempenho: recrutar, educar, treinar na função, treinar avançado; orientação verbal, coaching, feedback escrito; advertência, suspensão; demissão | Pessoas | por evento | D4-a, D4-b, ap |
| Acompanhamento funcional pré-efetivação (16 critérios, nota 1-5, dias 7, 14, 21, 28) | Pessoas | por contratação | D4-a, ap |
| Razão de conexões positivas por não positivas (mínimo 3:1; ideal 6 a 8:1) | Pessoas / Clima | contínua | D4-a, ap |
| Ficha de feedback (dia, assunto, feedback, compromisso, assinatura) e documento de orientação corretiva | Pessoas | por evento | D4-b, ap |
| Coaching situacional em 4 passos; delegação formal (quem, o quê, quando) | Pessoas / Reuniões | por evento | D4-a, ap |
| Reuniões ritualística e deliberativa; pauta; ata; plano de ação 5W2H com 3 status | Reuniões | semanal | D4-a, ap |
| Hot Seat (grupos de seis, 10 min por caso) | Reuniões | sob demanda | D1-b |
| SWOT; estratégias genéricas (custo, diferenciação, enfoque); Oceano Azul; matriz de valor com quatro ações; matriz de concorrência | Estratégia | anual | D2-b, D3-a, eb-a |
| 3 obsessões e filtro de produto (missão, faturamento mínimo, margem mínima) | Estratégia | por decisão | D1-b, D2-b |
| Lucro em 1º lugar (separar 1% a 5% do faturamento antes das despesas); diagnóstico de lucro | Resultado | mensal | D2-a, ap |
| Jornada de entrega extraordinária (6 a 8 etapas, nota 0-10) | Estratégia / Clima | trimestral | D2-b |
| Clima, satisfação = percepção − expectativa, 8 experiências primordiais, calendário anual | Clima | contínuo e anual | D4-b, ap |
| Avaliações 360 (inteligência emocional, eficácia, vendas, habilidades gerenciais) | Avaliações 360 | semestral | ap, eb-b |
| Lista de ideias a implantar (matriz por impacto: inovação, performance, faturamento, economia, estratégia) | Estratégia | contínua | ap, material do curso |

## 5. Princípios de produto
1. **A decisão é humana.** O sistema organiza evidência e lembra de prazos; nunca decide demitir, promover ou punir. O método exige feedback registrado e advertência antes de demissão; o sistema deve **impor esse caminho como trilha**, não pular etapas.
2. **Rastreabilidade.** Todo registro sobre uma pessoa tem autor, data e histórico de edição (log de auditoria).
3. **Pessoa no centro, com transparência.** O membro vê o que foi registrado sobre ele (feedbacks, notas) conforme a regra do espaço; segredo só onde a lei e a política interna permitirem.
4. **Pouco atrito.** Alarmes e notas rápidas no celular; formulários curtos. Se for chato de preencher, ninguém preenche.
5. **Método com nome neutro.** Os nomes de ferramentas da Febracis/BHP viram nomes próprios do produto (ver `07-MAPA-DE-NOMES-E-FONTES.md`).
6. **Evidência marcada.** Estatísticas citadas no curso sem fonte não entram como verdade no produto.

## 6. Riscos e restrições
| # | Risco | Tratamento |
|---|---|---|
| R1 | **Direitos e marca.** O método e os nomes são de terceiros (Febracis/Paulo Vieira). Para **uso pessoal**, o risco é baixo; se o sistema um dia for compartilhado, distribuído ou vendido, precisa de licença ou reescrita autoral. | Manter nomes e textos próprios desde já (ver `07`); revisão jurídica **antes** de qualquer compartilhamento ou oferta comercial. |
| R2 | **Dados de pessoas (LGPD).** Avaliações, feedbacks e advertências sobre membros de equipe são dados pessoais; saúde emocional e perfil comportamental podem ser sensíveis. O uso ser pessoal **não garante** isenção quando há relação profissional com as pessoas registradas; confirmar com advogado. | Base legal definida, minimização, controle de acesso por espaço e papel, criptografia, retenção, direito de acesso do titular. |
| R3 | **Trabalhista.** Advertência, suspensão e demissão têm regras legais. O próprio instrutor recomenda validar modelos com advogado e diz que parte da orientação depende da legislação local. | Modelos de documento marcados "validar com advogado"; sistema não emite ato disciplinar sozinho. |
| R4 | **Decisão automatizada.** Matriz de Decisão e "lista dos demitíveis" podem virar decisão automática injusta. | Só apoio à decisão; justificativa obrigatória; revisão humana; sem ranking público de pessoas. |
| R5 | **Qualidade do método.** Vários números do curso não têm fonte (ex.: ganhos de produtividade, percentuais de pesquisa). | Não usar como regra do sistema; configurações editáveis (por exemplo, o limite de 3:1). |
| R6 | **Conteúdo incompleto.** Tabelas e agendas do ebook vieram vazias do PDF. | Reconstruir formulários com campos mínimos; validar com o material original antes de fixar. |

## 7. Escopo do MVP (resumo; detalhe em `06-BACKLOG-E-MVP.md`)
Espaços e perfis; Metas e Semanas; Mapa de Produtividade; Pessoas (CHAC, Matriz de Decisão, registros de feedback com compromisso); painel do gestor. O restante entra por fases.

## 8. Indicadores de sucesso
- Gestor abre o sistema pelo menos 4 dias por semana.
- 80% das semanas com ações do caderno fechadas ou reprogramadas.
- Todo membro tem Matriz de Decisão atualizada no mês.
- Tempo para registrar um feedback: menos de 2 minutos.
