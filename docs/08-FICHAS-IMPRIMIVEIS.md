# 08 · Fichas imprimíveis (PDF e papel)

**Status:** IN_REVIEW · **Requisito do responsável (25/11/2026):** além do app, manter a parte **física**. As fichas serão preenchidas, impressas e entregues à pessoa ou às pessoas, que ficam com a cópia **em PDF e impressa**.

## 1. Dois modos para cada ficha
| Modo | Como funciona | Para quê |
|---|---|---|
| **Ficha em branco** | o app gera o PDF de qualquer ficha, vazio, pronto para imprimir e preencher à mão | reuniões, treinamento, quem não usa o app |
| **Ficha preenchida** | o app gera o PDF com os dados já registrados (de uma pessoa, equipe ou projeto), pronto para imprimir e entregar | entregar a avaliação, a ata, o plano de ação, o feedback |

Em ambos há um **código da ficha** (ex.: `FB-2026-000123`) e um **QR code** que leva ao registro no app. Ficha em papel preenchida à mão pode ser **digitada** no app ou **fotografada/escaneada** e anexada ao registro (primeiro anexo; reconhecimento automático fica para depois).

## 2. Catálogo de fichas (uma por ferramenta do método)
Os nomes abaixo são os nomes **do produto**; o mapa para os nomes do curso está em `07-MAPA-DE-NOMES-E-FONTES.md`. O desenho de cada ficha é próprio (não reproduz o layout do material original).

| # | Ficha | Conteúdo principal | Campo de assinatura | Fase |
|---|---|---|---|---|
| F01 | Caderno de metas e semana | objetivo, porquê, 5 a 10 ações, semana, transportado | não | MVP |
| F02 | Meta do mês (níveis) | meta mínima, básica e master; valor por dia útil; acompanhamento diário | não | 2 |
| F03 | Mapa do tempo (produtividade) | grade de blocos de 15 min; classificação urgente/importante/delegável/desnecessário; operacional/tático/estratégico; somatório | não | MVP |
| F04 | Agenda semanal (dia real x dia ideal) | duas colunas por dia | não | 2 |
| F05 | Diagnóstico de gap por área | área, importância (0-10), nota atual, gap, ação | não | 2 |
| F06 | Quatro dimensões da pessoa (conhecimento, habilidade, atitude, caráter) | duas colunas por dimensão (quem tem mais e menos) | não | MVP |
| F07 | Matriz de pessoas (decisão) | eixos técnico e emocional, 0 a 10, posição e decisão sugerida | gestor e pessoa (opcional) | MVP |
| F08 | Acompanhamento do novo colaborador (16 critérios) | notas 1-5 em 3 a 4 datas, observações | gestor e colaborador | 2 |
| F09 | Ficha de feedback | dia, assunto, feedback, compromisso, prazo | gestor e pessoa | MVP |
| F10 | Orientação corretiva | data, testemunha, problema, histórico, consequência prevista, plano acordado | gestor, pessoa e testemunha | 2 (validar com advogado) |
| F11 | Positividade do líder | por pessoa: clima 0-10, interações positivas e não positivas | não | 2 |
| F12 | Pauta e ata de reunião | data, hora, participantes, assuntos, decisões | lista de presença | 2 |
| F13 | Plano de ação (5W2H) | o quê, por quê, quando, onde, quem, como, quanto; 3 status | responsável | 2 |
| F14 | Delegação | quem, o quê, quando (obrigatórios); como, por quê (opcionais) | quem recebe | 2 |
| F15 | Quadro estratégico (SWOT, matriz de valor, 4 ações) | quadrantes e notas de 1 a 10 | não | 3 |
| F16 | Lucro em primeiro lugar | faturamento, percentual separado, lucro do mês | não | 3 |
| F17 | Relação de ideias a implantar | lista numerada, marcação de impacto (inovação, performance, faturamento, economia, estratégia) | não | 3 |
| F18 | Ficha da pessoa (resumo) | perfil completo exportado: CHAC, matriz, feedbacks, metas | gestor | 2 |
| F19 | Relatório da equipe | clima, matriz, metas, ações abertas | gestor | 3 |
| F20 | Pacote do projeto (pessoal ou de terceiro) | metas, ações, indicadores e histórico do projeto | gestor e dono do projeto | 2 |

## 3. Padrões de layout para impressão
- **A4**, retrato (paisagem só quando a grade pedir, como a F03); margens de 15 mm; fonte legível (mínimo 10 pt); funciona em preto e branco.
- Cabeçalho: logo do espaço, nome da ficha, versão (ex.: `v1.0`), código, data, espaço, pessoa ou equipe.
- Rodapé: código, QR code, página x de y, aviso de confidencialidade quando houver dado de pessoa.
- Campos de escrever com **linhas e caixas largas** (mão humana); espaço para anotar à margem.
- Fichas com assinatura trazem quadro de assinatura e data; a ficha de orientação corretiva tem campo de **testemunha**.
- **Acessibilidade:** contraste alto, ordem lógica de leitura, texto selecionável no PDF.
- **Versionamento:** cada ficha tem versão; o PDF impresso guarda a versão com que foi gerado (importante para auditoria).

## 4. Fluxo típico
1. Gestor registra uma avaliação ou um feedback no app (ou preenche a ficha em branco à mão).
2. Pede **Gerar PDF** da ficha (preenchida ou em branco).
3. Imprime; a pessoa assina quando houver campo de assinatura.
4. A cópia assinada é **escaneada e anexada** ao registro (ou o registro é marcado "assinado em papel").
5. A pessoa recebe o **PDF** por e-mail ou link seguro, além da cópia impressa.

## 5. Regras
- **Dado de pessoa em PDF:** o PDF é gerado só para quem tem permissão; link de download expira; marca d'água com nome de quem gerou (opcional).
- **Registro de entrega:** o app registra quando a ficha foi gerada, para quem, e se foi assinada.
- **Fichas disciplinares (F10)** só saem com texto revisado por advogado (modelo marcado "validar"), e o app nunca as emite sem ação explícita do gestor.
- **Ficha preenchida à mão e digitada:** campo "origem: papel" mostra que veio do preenchimento manual.
- **Direitos:** o desenho das fichas é próprio. Não usar os formulários originais do material de terceiros como arte final em versão comercial.

## 6. Como gerar (proposta técnica; ver `05-ARQUITETURA-E-STACK.md`)
Cada ficha é um **modelo HTML/CSS de impressão** (uma folha de estilo `@media print`), renderizado para PDF por um navegador sem tela. Assim o mesmo modelo serve para visualizar na tela, imprimir direto do navegador e baixar o PDF. Modelo em branco e preenchido compartilham o mesmo layout; muda só o preenchimento dos campos.
