# Instruções para extrair fichas de metodologia de gestão

Contexto: base interna da VSA Soluções em Tecnologia. O material (treinamento ou programa de terceiros, pago) é de **uso interno, só com palavras próprias**.

## O que fazer
Ler TODO o trecho indicado (Read com `offset` e `limit` de ~400 linhas, em lotes, até cobrir o intervalo; não pular partes nem resumir de memória) e escrever uma ficha com o **método operacional de gestão** (de pessoas, de si, de resultados, de negócio, de carreira executiva): o que um gestor pode aplicar. Ignorar venda do curso, motivação genérica, logística e conversa solta (registrar numa linha o que foi ignorado).

Transcrição automática (Whisper, pt-BR): cada linha tem `[hh:mm:ss]`; pode haver erro de reconhecimento em nomes e termos. Texto de PDF/DOCX: pode ter quebras de linha e cabeçalhos repetidos.

## Regras críticas
1. Tudo com suas palavras. Nenhuma citação literal com mais de 15 palavras; prefira nenhuma.
2. Não invente: só o que está no trecho. Ambíguo ou provável erro de transcrição: marcar `[incerto]`.
3. Sem nomes de alunos, participantes ou terceiros nem dados pessoais; casos viram descrição anônima.
4. Fidelidade: é a ficha do que ESTE trecho ensina; não misturar com outros métodos que você conheça.
5. Referenciar a origem de cada item: minuto aproximado `[02:15:30]` (transcrição) ou linha aproximada `[L1234]` (texto escrito).

## Formato (omitir seções vazias, mas não omitir conteúdo relevante)
```
# Ficha — <fonte e trecho>
## Resumo do trecho
(4 a 6 frases)
## Modelos e frameworks
(**Nome** — o que é; componentes ou etapas numeradas; quando usar; origem [ref])
## Ferramentas, rituais e práticas
(passo a passo operacional; o que entrega; origem [ref])
## Princípios e regras de decisão
## Indicadores e metas
## Erros comuns e como evitar
## Exemplos e casos (anonimizados)
(só o aprendizado, 1-2 linhas cada)
## Conexões
## Ignorado e dúvidas
```

## Resposta final
Só: caminho do arquivo da ficha, nº aproximado de palavras e as 5 ideias mais importantes (1 linha cada). Não cole a ficha. Não faça commit nem escreva fora da pasta indicada.
