# 02 · Perfis, espaços e permissões

**Status:** IN_REVIEW · O pedido do responsável fala em **perfis** para gerenciar pessoas, equipe, projetos pessoais e projetos de outras pessoas. Aqui isso vira dois conceitos: **espaço** (onde as coisas vivem) e **papel** (o que cada pessoa pode fazer ali).

**Uso pessoal (decisão de 25/11/2026):** no MVP existe **um único usuário** (o responsável). As pessoas gerenciadas e as pessoas acompanhadas são **cadastros**, sem login: ele registra por elas e entrega as fichas em PDF e impressas. Os papéis de líder, membro, mentorado e consultor, o convite e a política de transparência abaixo ficam **desenhados para uma evolução futura** e não entram no MVP. O isolamento por espaço continua, para não misturar equipe, projetos pessoais e projetos de terceiros.

## 1. Espaços
Um espaço é um cofre isolado: dados de um espaço não aparecem em outro.

| Tipo de espaço | Para quê | Quem entra |
|---|---|---|
| **Pessoal** | seus projetos, metas, mapa de produtividade, diário | só você |
| **Equipe** | uma equipe ou empresa que você gerencia: pessoas, rituais, metas, clima | você, líderes e membros |
| **Projetos de terceiros** (um espaço por pessoa ou cliente) | acompanhar projetos de mentorados, clientes ou parceiros | você e a pessoa acompanhada; consultores convidados |

Regras:
- Uma pessoa pode estar em vários espaços com papéis diferentes (por exemplo, líder numa equipe e mentorado em outro).
- Cada espaço tem **dono** (quem criou) e **política de transparência** (ver seção 3).
- Pessoas que não têm conta podem existir como **cadastro** em um espaço (para registrar CHAC e feedback), mas só veem seus dados se forem convidadas.

## 2. Papéis e permissões
Legenda: **L** ler, **E** escrever, **A** aprovar, **—** sem acesso, **(próprio)** só o que é seu.

| Recurso | Dono/Gestor | Líder | Membro | Mentorado/cliente | Consultor convidado |
|---|---|---|---|---|---|
| Metas e semanas | L E A | L E (equipe) | L E (próprio) | L E (próprio) | L (se liberado) |
| Mapa de produtividade | L E | L (equipe, se o membro compartilhar) | L E (próprio) | L E (próprio) | — |
| CHAC e Matriz de Decisão sobre uma pessoa | L E A | L E (liderados diretos) | L (própria, conforme transparência) | — | — |
| Feedback, orientação corretiva, advertência | L E A | L E (liderados diretos) | L (próprios) + assinar | — | — |
| Lista de risco ("demitíveis") e dados de desligamento | L E A | L (só liderados) | — | — | — |
| Reuniões, pautas, atas, 5W2H | L E A | L E | L E (participante) | L E | L |
| Estratégia (SWOT, matriz de valor, 3 obsessões) | L E A | L | L | — | L (se liberado) |
| Indicadores financeiros e lucro | L E A | L (resumo) | — | — | — |
| Configuração do espaço e convites | L E A | — | — | — | — |

Regra de ouro: **líder só vê liderados diretos**, e **ninguém vê dado de outro espaço**.

## 3. Política de transparência (por espaço)
Escolhida pelo dono e visível a todos:
1. **Aberta:** o membro vê tudo que foi registrado sobre ele (notas, feedbacks, matriz).
2. **Parcial (padrão sugerido):** o membro vê feedbacks, compromissos e a própria matriz; não vê a lista de risco nem anotações privadas do gestor.
3. **Reservada:** o membro vê só o que assinou. Exige justificativa na configuração e revisão jurídica (LGPD e trabalhista).

Qualquer que seja a política, o titular pode pedir acesso aos seus dados (direito previsto na LGPD; a forma final fica com o jurídico).

## 4. Perfil da pessoa (ficha)
O "perfil" de cada pessoa gerenciada reúne, por espaço:
- Dados básicos (nome, cargo, líder direto, data de entrada) e **status na escada de desempenho** (proativa, reativa, resgate, eliminação).
- **CHAC** (4 dimensões, histórico).
- **Matriz de Decisão** (série mensal, gráfico de evolução).
- **Feedbacks** (por escrito, com compromisso e assinatura), **orientações corretivas**.
- **Razão de positividade** (interações positivas por não positivas, com clima 0 a 10).
- **Metas e semanas** da pessoa, **mapa de produtividade** se compartilhado.
- **Avaliações 360** e **perfil comportamental** (anexos).
- Linha do tempo única (tudo em ordem cronológica, com autor).

## 5. Perfil do gestor (cockpit)
Painel com:
- Pessoas por quadrante da Matriz de Decisão e quem mudou de quadrante.
- Quem está sem feedback há mais de N dias.
- Metas da semana e do mês; atrasos.
- Reuniões da semana e ações 5W2H abertas.
- Clima e razão de positividade por equipe.
- Alertas de prazo do processo disciplinar (por exemplo, advertência sem acompanhamento).

## 6. Autenticação e convites
- Login por e-mail com senha forte ou link mágico; verificação em dois fatores para gestor.
- Convite por e-mail com papel e espaço definidos; revogável.
- Registro de aceite dos termos e da política de transparência no primeiro acesso.
