# Instruções para extrair fichas de metodologia: Maestria Emocional e Educação de Filhos

Contexto: base pessoal do responsável pela Cadência (sistema de gestão estratégica). O material (cursos pagos de terceiros, Jornada EVO) é de **uso pessoal, só com palavras próprias**. As fichas alimentam a síntese e o Método Cadência (`docs/09-METODOLOGIA-MESCLADA.md`).

## O que fazer
Ler TODOS os arquivos indicados, do começo ao fim. Usar Read com `offset` e `limit` de **cerca de 150 linhas** por lote (cada linha é um parágrafo longo), em sequência, até cobrir cada arquivo. Não pular partes nem resumir de memória.

Escrever uma ficha com o **método operacional**: o que uma pessoa pode aplicar para **gerir a si e as próprias emoções** e, quando couber, para **desenvolver outras pessoas** (liderados, equipe, filhos). Ignorar venda do curso, motivação genérica, logística, chamada de presença e conversa solta, e registrar numa linha o que foi ignorado.

Transcrição automática (Whisper, pt-BR): cada parágrafo começa com `**[hh:mm:ss]**`, e **o tempo recomeça a cada aula**. Cada aula começa com um título `## <código> — <nome>` (ex.: `## M03-02 — Aula 2`, `## P05-02 — Dependência Emocional`). Pode haver erro de reconhecimento em nomes e termos.

## Versões
- **H** = Maestria Emocional Homens (`homens/transcricoes/Mxx …md`)
- **M** = Maestria Emocional Mulheres (`mulheres/transcricoes/Mxx …md`)
- **F** = Técnicas Avançadas de Educação de Filhos (`filhos/transcricoes/Pxx …md`)

H e M são o mesmo programa de 10 a 11 sessões dado a turmas diferentes, com os mesmos módulos. **A numeração das aulas dentro de um módulo pode diferir entre H e M.** F é um curso à parte, curto, sobre educação de filhos.

## Regras críticas
1. Tudo com suas palavras. Nenhuma citação literal com mais de 15 palavras; prefira nenhuma.
2. Não invente: só o que está no trecho. Ambíguo ou provável erro de transcrição: marcar `[incerto]`.
3. **Sem nomes** de alunos, participantes, equipe, crianças, familiares ou terceiros citados, nem dados pessoais. Casos viram descrição anônima. Não nomear o instrutor na ficha.
4. **Dados sensíveis:** depoimentos sobre família, filhos, abuso, trauma, morte, doença, sexualidade, religião pessoal, relacionamento ou dinheiro viram **no máximo uma linha com o aprendizado**, sem detalhe identificável. Na dúvida, omitir o caso e manter só a ideia.
5. Fidelidade: é a ficha do que ESTES arquivos ensinam. Não misturar com outros métodos que você conheça. Ligações com outras fontes vão só em "Conexões", marcadas como tal.
6. Referenciar a origem de cada item com **versão, aula e minuto aproximado**: `[H M03-02 00:05:10]`, `[M M03-04 00:12:00]`, `[F P05-02 00:03:40]`. Item presente nas duas versões: `[H M03-02 00:05:10; M M03-03 00:01:20]`.
7. Afirmações sobre "homens são assim" e "mulheres são assim", números e pesquisas citados sem fonte e conteúdo de cunho religioso: **registrar como "afirmação do curso"**, sem endossar, e listar em "Cuidados".

## Formato (omitir seções vazias, mas não omitir conteúdo relevante)
```
# Ficha — Maestria Emocional, Módulo XX (homens + mulheres)        ← ou: Educação de Filhos, Partes Pxx a Pyy
## Resumo do trecho
(4 a 6 frases: tema do módulo, onde ele fica na sequência do programa, a ideia central)
## Modelos e frameworks
(**Nome** — o que é; componentes ou etapas numeradas; quando usar; origem [ref])
## Ferramentas, exercícios e tarefas
(passo a passo operacional; o que entrega; tarefa de casa da semana, se houver; origem [ref])
## Princípios e regras de decisão
## Indicadores e metas
## Erros comuns e como evitar
## Exemplos e casos (anonimizados)
(só o aprendizado, 1 linha cada)
## Junção homens + mulheres            ← só nas fichas H+M
### Núcleo comum
(o que as duas versões ensinam igual, mesmo com palavras ou exemplos diferentes)
### Só na versão homens
### Só na versão mulheres
### Divergências
(onde ensinam diferente; dizer qual versão é mais operacional e por quê)
## Ligação com o Maestria adulto       ← só nas fichas F
(conceitos que repetem os do programa adulto e o que é próprio da educação de filhos)
## Uso possível na Cadência
(SUGESTÃO, marcada como tal: o que pode virar ferramenta, rotina ou campo para gerir a si, pessoas, equipe ou projetos; transposições de filhos para liderados são "por adaptação")
## Cuidados
(números sem fonte, promessas, conteúdo clínico ou terapêutico, estereótipos de gênero, conteúdo religioso, orientação sobre crianças que dependa de profissional)
## Conexões
(com outros módulos deste curso e, marcado como tal, com BHP ou Bússola se for evidente)
## Ignorado e dúvidas
```

## Resposta final
Só: caminho do arquivo da ficha, número aproximado de palavras, as 5 ideias mais importantes (1 linha cada) e as 3 maiores diferenças (H x M; ou, nas fichas F, adulto x filhos). Não cole a ficha. Não faça commit nem escreva fora da pasta `referencias/maestria-emocional/fichas/`.
