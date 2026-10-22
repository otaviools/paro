export default defineTask({
  meta: {
    name: 'relatos:anonimizar',
    description: 'Ajusta a reputação e tira o vínculo com a pessoa dos relatos com mais de 24 horas',
  },
  async run() {
    return { result: await anonimizarRelatosAntigos() }
  },
})
