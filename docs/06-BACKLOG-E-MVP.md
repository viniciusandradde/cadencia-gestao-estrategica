# 06 · Backlog e MVP

**Status:** IN_REVIEW · Fases com épicos e **títulos de issue** prontos para virar tarefas no GitHub.

## Fase 0 · Fundação
- E0.1 Repositório, licença, CI (lint, testes, build).
- E0.2 Ambiente local com Docker Compose (aplicação, banco, armazenamento).
- E0.3 Esquema do banco e migrações (núcleo de `04-MODELO-DE-DADOS.md`).
- E0.4 Autenticação, convites e papéis; 2FA do gestor.
- E0.5 Isolamento por espaço com **RLS** e testes de permissão (matriz de `02`).
- E0.6 Log de auditoria.
- E0.7 **Pipeline do APK:** projeto Capacitor, compilação do APK, assinatura com chave própria (guardada fora do Git), instalação direta; teste em um aparelho real.

## Fase 1 · MVP (uso próprio)
Objetivo: o gestor (único usuário) gerencia **a si, as pessoas e a equipe** no básico, em **web e APK**, e **imprime as fichas centrais**.
- E1.1 **Espaços e cadastros:** criar espaço pessoal, de equipe e de terceiro; cadastrar pessoas (sem login); política de transparência fica desenhada para o futuro.
- E1.2 **Metas e Semanas (M1):** objetivos, ações, semana, transporte, meta do mês.
- E1.3 **Mapa do tempo (M2):** notas rápidas em blocos de 15 min, classificação, somatório, valor da hora.
- E1.4 **Pessoas (M3 parcial):** perfil, quatro dimensões, matriz de pessoas mensal, feedbacks com compromisso.
- E1.5 **Painel do gestor:** quem está sem feedback, quadrantes da matriz, metas da semana.
- E1.6 **Fichas imprimíveis (M12) MVP:** F01 caderno de metas, F03 mapa do tempo, F06 quatro dimensões, F07 matriz de pessoas, F09 feedback — em branco e preenchidas, com código e QR.
- E1.7 **Anexar ficha escaneada** a um registro.
- E1.8 **Lembretes nativos no APK:** alarme de 15 minutos para o mapa do tempo e lembretes de feedback e de semana, com permissão de alarme exato e teste com o aparelho bloqueado.
- E1.9 **Offline:** fila local no celular e sincronização com a API.

Critério de pronto do MVP: o gestor roda uma **semana completa** (metas, mapa do tempo, três feedbacks, uma matriz mensal) **no celular (APK) e no site**, e imprime as cinco fichas.

## Fase 2 · Gestão de equipe e rotina
- E2.1 Reuniões (M4): ritualística e deliberativa, pauta, ata, decisões, **5W2H**, delegação (F12, F13, F14).
- E2.2 Escada de desempenho completa (M3): coaching situacional, orientação corretiva com modelo validado, acompanhamento do novo colaborador de 16 critérios (F08, F10).
- E2.3 Diagnósticos (M6): gap de gestão e perfis (F05).
- E2.4 Razão de positividade (M7) e clima básico (F11).
- E2.5 Resultado (M8): meta mensal em níveis, lucro em 1º, curva (F02, F16).
- E2.6 Projetos de terceiros (M10) com espaço próprio e pacote do projeto (F20).
- E2.7 Ficha da pessoa e relatório da equipe em PDF (F18, F19).
- E2.8 Lembretes por e-mail (feedback atrasado, acompanhamento, ações vencidas).

## Fase 3 · Estratégia e profundidade
- E3.1 Estratégia (M5): SWOT, matriz de valor, quatro ações, matriz de concorrência, versões anuais (F15).
- E3.2 Avaliações 360 anônimas por avaliador (M9).
- E3.3 MAAS de 11 pilares e matriz de plenitude.
- E3.4 Calendário anual de experiências da equipe.
- E3.5 Lista de ideias a implantar (F17).

## Fase 4 · Escala e inteligência
- E4.1 Reconhecimento (OCR) de fichas escaneadas, com conferência humana.
- E4.2 Assistente de IA para **resumir** histórico e sugerir perguntas de coaching (nunca decide).
- E4.3 Aplicativo nativo ou notificações mais confiáveis.
- E4.4 Painel para mentor com vários espaços de terceiros.

## Issues iniciais sugeridas (primeiras 20)
1. Definir licença e política de contribuição.
2. Configurar monorepo e CI.
3. Docker Compose com Postgres e armazenamento.
4. Esquema `user`, `space`, `membership`, `person`, `team`.
5. Autenticação por e-mail com link mágico.
6. Convites com papel e espaço.
7. RLS por espaço e testes da matriz de permissões.
8. Log de auditoria.
9. Tela: criar espaço e escolher política de transparência.
10. Cadastro de pessoas e equipes.
11. Metas e ações com semana e transporte.
12. Tela da semana (arrastar ações).
13. Meta do mês com teste de realidade.
14. Mapa do tempo: registro rápido em 15 min.
15. Mapa do tempo: classificação e resumo de horas, valor da hora.
16. Perfil da pessoa e linha do tempo.
17. Quatro dimensões e matriz de pessoas mensal.
18. Feedback com compromisso e assinatura.
19. Painel do gestor.
20. Gerar PDF das fichas F01, F03, F06, F07, F09 (branco e preenchida) com QR.
21. Projeto Capacitor e APK assinado, instalado em um aparelho real.
22. Alarme de 15 minutos com notificação local nativa.
23. Fila offline e sincronização com a API.

## Dependências e riscos do plano
- **Jurídico:** LGPD e trabalhista, antes da Fase 2 (orientação corretiva). Sobre o método de terceiros, só é obrigatório **se o sistema sair do uso pessoal**.
- Conferir os formulários originais antes de fixar campos (tabelas do ebook vieram vazias).
- Decidir o **nome do produto** antes de criar o repositório e a identidade visual.
