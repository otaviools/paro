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

## Dados pessoais

Sem cadastro, nome, e-mail, telefone, CPF ou placa. Cada aparelho recebe um identificador aleatório num cookie selado. O servidor guarda a rua e os horários da vaga; o ponto exato fica só no `localStorage` do aparelho. O histórico é apagado depois de 90 dias pela tarefa `historico:limpar` (todo dia às 4h), e Apagar meu histórico exclui as vagas do banco na hora.

## Pendências conhecidas

- As medições do seed reproduzem os valores das telas do Figma. Troque pelos dados reais do protocolo de contagem em `server/db/dados/ruas.ts` (`chancePorHora`) ou importe as contagens para a tabela `medicoes`.
- Os traçados das ruas vêm do OpenStreetMap. O da R. Alexandre Marquez é aproximado.
- O mapa base usa o estilo Positron da CARTO, recolorido com os tokens `--paro-mapa-*`. Sem internet, o mapa mostra só o fundo e as ruas medidas.
- "Lembrar de registrar a saída" e "Avisar quando eu sair" ficam salvos, mas ainda não disparam notificação nem viram medição anônima.
