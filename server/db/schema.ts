import { boolean, doublePrecision, index, integer, jsonb, pgEnum, pgTable, smallint, text, time, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { LineString, Point } from 'geojson'
import type { Preferencias } from '../../shared/types/preferencias'

export const fonteMedicao = pgEnum('fonte_medicao', ['campo', 'registro_anonimo'])

export const estadoRelatado = pgEnum('estado_relatado', ['livre', 'apertado', 'lotado'])

export const tempoParaAchar = pgEnum('tempo_para_achar', ['ate_2', 'de_2_a_5', 'mais_de_5', 'desisti'])

export const areas = pgTable('areas', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  cidade: text().notNull(),
  nomeDaReferencia: text().notNull(),
  referencia: jsonb().$type<Point>().notNull(),
})

export const ruas = pgTable('ruas', {
  id: uuid().primaryKey().defaultRandom(),
  areaId: uuid().notNull().references(() => areas.id),
  nome: text().notNull(),
  trajeto: jsonb().$type<LineString>().notNull(),
  destino: jsonb().$type<Point>(),
  distanciaDaReferenciaM: integer().notNull(),
  capacidade: integer(),
})

export const medicoes = pgTable('medicoes', {
  id: uuid().primaryKey().defaultRandom(),
  ruaId: uuid().notNull().references(() => ruas.id),
  diaSemana: smallint().notNull(),
  faixaInicio: time().notNull(),
  vagasTotais: integer().notNull(),
  vagasOcupadas: integer().notNull(),
  fonte: fonteMedicao().notNull(),
  medidoEm: timestamp({ withTimezone: true }).notNull(),
}, tabela => [index('medicoes_rua_dia_faixa').on(tabela.ruaId, tabela.diaSemana, tabela.faixaInicio)])

export const pessoas = pgTable('pessoas', {
  id: uuid().primaryKey().defaultRandom(),
  emailHash: text().notNull().unique(),
  reputacao: doublePrecision().notNull().default(1),
  relatosAvaliados: integer().notNull().default(0),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const dispositivos = pgTable('dispositivos', {
  id: uuid().primaryKey().defaultRandom(),
  pessoaId: uuid().references(() => pessoas.id, { onDelete: 'set null' }),
  preferencias: jsonb().$type<Preferencias>().notNull(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const codigosDeVerificacao = pgTable('codigos_de_verificacao', {
  id: uuid().primaryKey().defaultRandom(),
  dispositivoId: uuid().notNull().references(() => dispositivos.id, { onDelete: 'cascade' }),
  emailHash: text().notNull(),
  codigoHash: text().notNull(),
  tentativas: smallint().notNull().default(0),
  expiraEm: timestamp({ withTimezone: true }).notNull(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, tabela => [index('codigos_email').on(tabela.emailHash), index('codigos_dispositivo').on(tabela.dispositivoId)])

export const relatos = pgTable('relatos', {
  id: uuid().primaryKey().defaultRandom(),
  ruaId: uuid().notNull().references(() => ruas.id, { onDelete: 'cascade' }),
  diaSemana: smallint().notNull(),
  faixaInicio: time().notNull(),
  relatadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  estado: estadoRelatado(),
  tempo: tempoParaAchar(),
  ocupacao: doublePrecision().notNull(),
  peso: doublePrecision().notNull(),
  pertoDaRua: boolean().notNull().default(false),
  dispositivoId: uuid().references(() => dispositivos.id, { onDelete: 'set null' }),
  pessoaId: uuid().references(() => pessoas.id, { onDelete: 'set null' }),
}, tabela => [
  index('relatos_rua_dia_faixa').on(tabela.ruaId, tabela.diaSemana, tabela.faixaInicio),
  index('relatos_relatado_em').on(tabela.relatadoEm),
])

export const vagas = pgTable('vagas', {
  id: uuid().primaryKey().defaultRandom(),
  dispositivoId: uuid().notNull().references(() => dispositivos.id, { onDelete: 'cascade' }),
  ruaId: uuid().notNull().references(() => ruas.id),
  chegada: timestamp({ withTimezone: true }).notNull(),
  saidaPrevista: timestamp({ withTimezone: true }),
  saida: timestamp({ withTimezone: true }),
  previsaoAjudou: boolean(),
  origemNaChegada: text(),
  avisarAoSair: boolean().notNull().default(true),
}, tabela => [index('vagas_dispositivo').on(tabela.dispositivoId)])

export const avaliacoes = pgTable('avaliacoes', {
  id: uuid().primaryKey().defaultRandom(),
  previsaoAjudou: boolean().notNull(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const sugestoesDeRua = pgTable('sugestoes_de_rua', {
  id: uuid().primaryKey().defaultRandom(),
  nomeDaRua: text().notNull(),
  periodos: text().array().notNull().default([]),
  motivo: text(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const resultadosDaPesquisa = pgTable('resultados_da_pesquisa', {
  id: uuid().primaryKey().defaultRandom(),
  pergunta: smallint().notNull(),
  grupo: text().notNull().default('Todos'),
  ordem: smallint().notNull(),
  opcao: text().notNull(),
  percentual: smallint().notNull(),
  base: smallint().notNull(),
})

export const estimativasDaPesquisa = pgTable('estimativas_da_pesquisa', {
  id: uuid().primaryKey().defaultRandom(),
  ruaId: uuid().notNull().unique().references(() => ruas.id, { onDelete: 'cascade' }),
  pergunta: smallint().notNull(),
  percentual: smallint().notNull(),
  base: smallint().notNull(),
  intervaloMin: doublePrecision().notNull(),
  intervaloMax: doublePrecision().notNull(),
  nivelDeConfianca: smallint().notNull(),
  metodo: text().notNull(),
  calculadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
