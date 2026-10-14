import { boolean, index, integer, jsonb, pgEnum, pgTable, smallint, text, time, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { LineString, Point } from 'geojson'
import type { Preferencias } from '../../shared/types/preferencias'

export const fonteMedicao = pgEnum('fonte_medicao', ['campo', 'registro_anonimo'])

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
  distanciaDaReferenciaM: integer().notNull(),
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

export const dispositivos = pgTable('dispositivos', {
  id: uuid().primaryKey().defaultRandom(),
  preferencias: jsonb().$type<Preferencias>().notNull(),
  criadoEm: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const vagas = pgTable('vagas', {
  id: uuid().primaryKey().defaultRandom(),
  dispositivoId: uuid().notNull().references(() => dispositivos.id, { onDelete: 'cascade' }),
  ruaId: uuid().notNull().references(() => ruas.id),
  chegada: timestamp({ withTimezone: true }).notNull(),
  saidaPrevista: timestamp({ withTimezone: true }),
  saida: timestamp({ withTimezone: true }),
  previsaoAjudou: boolean(),
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
