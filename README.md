# Parô web

Chance de vaga por rua e horário no entorno da ESAMC Uberlândia. Previsão, não garantia.

Nuxt 4, Nuxt UI, TypeScript estrito, Drizzle ORM e PostgreSQL. As telas seguem as páginas Produto Mobile e Produto Desktop do Figma (`bJ0BYMZVBRFfli4roAu0oq`), e cores, tipografia, raios e padrões de ocupação vêm do `marca/tokens/paro.css` (submódulo [paro-brand](https://github.com/otaviools/paro-brand)).

## Rodar no localhost

Requisitos: Node 22 ou mais novo e pnpm 11.

```bash
git submodule update --init
pnpm install
cp .env.example .env
```

Edite o `.env` e troque `SUA_CHAVE_DE_32_CARACTERES_AQUI` por uma chave aleatória de 32 caracteres ou mais. Depois:

```bash
pnpm db:preparar
pnpm dev --host
```

`pnpm db:preparar` aplica as migrações e roda o seed. Rodar de novo apaga e recria os dados.

### Banco de dados

O `.env.example` aponta para o PGlite (`pglite://./.data/paro`), o PostgreSQL 17 compilado para WebAssembly, que roda dentro do Node sem instalar nada. Os dados ficam em `.data/`. Só um processo abre a pasta por vez: pare o `pnpm dev` antes de rodar `pnpm db:preparar`.

Para usar o PostgreSQL no Docker, como no roteiro:

```bash
docker compose up -d
```

Troque no `.env` a `NUXT_DATABASE_URL` para `postgres://paro:<senha>@localhost:5432/paro`, com a mesma senha de `POSTGRES_PASSWORD`, e rode `pnpm db:preparar`.

`pglite://memoria` cria um banco em memória já migrado e semeado a cada início do servidor. Os testes de API e de ponta a ponta usam esse modo.

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento em http://localhost:3000 |
| `pnpm build` e `pnpm preview` | Build de produção e servidor Node em `.output/` |
| `pnpm lint` | ESLint, com as regras de sem comentários e funções de até 30 linhas |
| `pnpm typecheck` | `nuxi typecheck` com `strict` e `noUncheckedIndexedAccess` |
| `pnpm test` | Vitest: unidade, componentes e API |
| `pnpm test:e2e` | Playwright em 393 × 852 e 1440 × 1024, com axe nos dois temas. Rode `pnpm build` antes |
| `pnpm db:generate` | Gera uma migração a partir do `server/db/schema.ts` |
| `pnpm db:preparar` | Aplica migrações e roda o seed |
| `pnpm db:estimativas` | Recalcula as estimativas da pesquisa com intervalo de confiança de 95% |

## Estrutura

```
app/          páginas, layouts, componentes e composables
server/       API Nitro, banco (schema, migrações, seed) e tarefa de limpeza
shared/       regras puras (ocupação, horário, formatação) e tipos
marca/        submódulo paro-brand
tests/        unit · nuxt · api · e2e
```

Componentes não buscam dados: recebem props e emitem eventos. Quem busca são os composables em `app/composables`.

## Telas

| Rota | Telas do Figma |
| --- | --- |
| `/boas-vindas` | Primeira visita |
| `/` | Início, Estacionado (celular) e Painel (desktop) |
| `/local` | Escolher local |
| `/busca` | Busca por destino e Resultados da busca |
| `/sugerir` | Sugerir rua |
| `/mapa` | Mapa · visão geral |
| `/ruas` | Ruas por perto (celular) e Ruas com tabela (desktop) |
| `/ruas/[id]` | Detalhe da rua e Sem dado |
| `/ruas/[id]/rota` | Como chegar |
| `/vaga` | Sem vaga registrada, Vaga ativa e Editar saída prevista |
| `/vaga/registrar` | Registrar vaga |
| `/vaga/rota` | Voltar até o carro |
| `/vaga/saida` | Saída confirmada |
| `/vaga/historico/[id]` | Detalhe do histórico |
| `/ajustes` | Ajustes |
| `/pesquisa` | Pesquisa |
| `/termos` | Termos e privacidade |
| `/catalogo` | Catálogo de componentes, só em desenvolvimento |

## De onde vem a chance de vaga

Cada chance mostra a origem e um selo de confiança (baixa, média ou alta).

1. **Contagem de campo**, registrada em `/admin`. A faixa de chance usa os percentis 25 e 75 das contagens do mesmo dia da semana e da mesma faixa de 30 minutos. A confiança depende do número de contagens: 1 ou 2, baixa; 3 a 5, média; 6 ou mais, alta. Com 2 contagens ou mais, o app mostra também a margem de 95% da média.
2. **Estimativa da pesquisa**, usada quando não há contagem de campo na faixa. É o percentual dos 81 respondentes que costumam conseguir vaga na rua (pergunta "Onde costumam conseguir vaga"), com intervalo de confiança de 95% pelo método de Wilson. A confiança depende da margem: até ±5 p.p., alta; até ±10 p.p., média; acima disso, baixa. A estimativa é igual em todos os horários.

As estimativas ficam na tabela `estimativas_da_pesquisa`. O `pnpm db:preparar` já as calcula; para recalcular sem apagar nada, rode `pnpm db:estimativas`.

3. **Relatos de usuários**, enviados na tela de registrar vaga ou pelo botão "Relatar esta rua". Cada relato responde como estava a rua (Livre, Apertado, Lotado) e/ou quanto tempo levou para achar vaga, e vira uma ocupação pela tabela de `shared/utils/relato.ts`. Quando há relatos na faixa (mesmo dia da semana, últimas 8 semanas), o app combina as três fontes numa média ponderada: cada contagem de campo pesa 10, a pesquisa pesa 5 e cada relato pesa de 0,25 a 3. O selo mostra as fontes, por exemplo "pesquisa + 12 relatos".

| Relato | Peso |
| --- | --- |
| Aparelho sem e-mail | 0,5 |
| E-mail verificado | 1,0 × reputação (0,25 a 2) |
| GPS a até 150 m da rua | +0,5 |
| Relato dos últimos 20 minutos | × 3, e aparece como "relatado há N min" |

Vale 1 relato por pessoa (ou aparelho) por rua por faixa de 30 minutos; um novo substitui o anterior. A tarefa `relatos:anonimizar` (de hora em hora no servidor Node; uma vez por dia no Vercel) compara cada relato com mais de 24 horas com a contagem de campo do mesmo dia e faixa (ou com o consenso de 3 relatos ou mais), ajusta a reputação de quem relatou e apaga o vínculo do relato com a pessoa e com o aparelho.

### Verificação de e-mail

O e-mail é verificado por um código de 6 números, uma vez por aparelho. O banco guarda só um HMAC do e-mail, nunca o endereço. Aparelhos que verificaram o mesmo e-mail compartilham a vaga ativa, o histórico e a rotina (`vagaDoDono` em `server/utils/vagas.ts`); o ponto exato da vaga continua só no aparelho onde ela foi registrada.

1. No `.env`, defina `NUXT_EMAIL_PEPPER` com 32 caracteres aleatórios ou mais (a mesma receita da `NUXT_SESSION_PASSWORD`). Sem ela a verificação fica desligada e o app esconde o campo de e-mail. Não troque o valor depois: os e-mails já verificados deixam de ser reconhecidos.
2. Para enviar de verdade, defina o SMTP no `.env`: `NUXT_SMTP_HOST`, `NUXT_SMTP_PORT`, `NUXT_SMTP_USER`, `NUXT_SMTP_PASSWORD` e `NUXT_EMAIL_REMETENTE`. Sem elas, o código aparece só no terminal do `pnpm dev`, com o e-mail mascarado.

Com Gmail: use `smtp.gmail.com`, porta 465, o endereço do Gmail como usuário e uma senha de app como senha (a senha normal da conta não funciona). A senha de app exige a verificação em duas etapas ligada e é criada em myaccount.google.com/apppasswords. O Gmail gratuito envia até cerca de 500 e-mails por dia.

Para testar no celular pela rede local (`http://192.168…:3000`), use o `pnpm dev`: nele o cookie de sessão não é `Secure`, então o celular guarda a sessão. Em produção o cookie é `Secure` e o app precisa estar em https. A localização do aparelho também só funciona em https ou em `localhost`.

O template fica em `app/emails/CodigoDeVerificacao.vue` (Nuxt Email Renderer) e o envio usa o nodemailer.

## Área de admin

A chance de vaga vem das contagens de campo da tabela `medicoes`. Elas são registradas em `/admin`, que também tem um link no rodapé de Ajustes.

1. No `.env`, defina `NUXT_ADMIN_PASSWORD` com 12 caracteres ou mais e reinicie o `pnpm dev`. Sem essa variável, ou com o valor de exemplo, a área fica desligada.
2. Em `/admin`, entre com a senha, escolha a rua e a data, preencha vagas totais e ocupadas em cada faixa de 30 minutos (17h00 a 22h30) e salve.

Salvar substitui as contagens daquela rua naquela data. Para apagar um dia, use "Apagar contagens deste dia". A previsão usa as contagens do mesmo dia da semana e da mesma faixa.

A capacidade fixa de cada rua também fica no admin. Ela preenche as vagas totais das faixas vazias e aparece no painel da rua como "cerca de N vagas na rua". O admin ainda mostra:

- **A previsão ajudou?**: as respostas dadas ao registrar a saída, por rua e pela origem da chance mostrada na chegada.
- **Relatos × Campo**: para cada resposta de relato, o valor da tabela e a ocupação média contada em campo na mesma rua, dia e faixa. Use para ajustar a tabela à mão.

O `pnpm db:preparar` não cria contagens. As contagens fictícias de demonstração só existem com `NUXT_DATABASE_URL=pglite://memoria`, usado nos testes.

## Dados pessoais

Sem cadastro obrigatório, nome, telefone, CPF ou placa. O e-mail é opcional e fica guardado só como HMAC. Cada aparelho recebe um identificador aleatório num cookie selado, que dura 1 ano. A posição do GPS enviada com um relato vira só "perto da rua: sim ou não" e não é guardada. Apagar meus dados (Ajustes) exclui o e-mail, a reputação, as vagas e as preferências; os relatos ficam só como contagem anônima. O servidor guarda a rua e os horários da vaga; o ponto exato fica só no `localStorage` do aparelho. O histórico é apagado depois de 90 dias pela tarefa `historico:limpar` (todo dia às 4h), e Apagar meu histórico exclui as vagas do banco na hora.

## Pendências conhecidas

- Os traçados das ruas vêm do OpenStreetMap.
- O mapa base usa o estilo Positron da CARTO, recolorido com os tokens `--paro-mapa-*`. Sem internet, o mapa mostra só o fundo e as ruas medidas.
- "Lembrar de registrar a saída" e "Avisar quando eu sair" ficam salvos, mas ainda não disparam notificação nem viram medição anônima.

## Deploy no Vercel

O Vercel não roda as tarefas agendadas do Nitro. Elas são chamadas pelo Cron do Vercel, configurado em `vercel.json`, na rota protegida `/api/tarefas/[nome]`:

| Tarefa | Rota | Horário (UTC) | Horário de Brasília |
| --- | --- | --- | --- |
| `relatos:anonimizar` | `/api/tarefas/relatos-anonimizar` | 06:15 | 03:15 |
| `historico:limpar` | `/api/tarefas/historico-limpar` | 07:00 | 04:00 |

1. Em Project → Settings → Environment Variables, crie `CRON_SECRET` com 16 caracteres aleatórios ou mais. O Vercel envia esse valor no cabeçalho `Authorization: Bearer …` de cada chamada do cron; sem ele, a rota responde 401.
2. Faça um novo deploy para o Vercel ler o `vercel.json`. Os crons aparecem em Project → Settings → Cron Jobs, onde também dá para rodar cada um na hora ("Run").

No plano gratuito (Hobby) o cron roda uma vez por dia, então o relato perde o vínculo com a pessoa entre 24 e 48 horas depois de enviado, como dizem os Termos.

