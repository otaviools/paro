export interface ResultadoDoSeed {
  pergunta: number
  grupo: string
  base: number
  opcoes: [string, number][]
}

export const resultadosDoSeed: ResultadoDoSeed[] = [
  { pergunta: 1, grupo: 'Todos', base: 99, opcoes: [['Carro próprio', 52], ['Carona, aplicativo ou táxi', 18], ['Ônibus', 17], ['Varia', 6], ['Moto própria', 5], ['A pé', 2]] },
  { pergunta: 2, grupo: 'Todos', base: 99, opcoes: [['antes de 8h', 5], ['8h–10h59', 4], ['17h–18h29', 10], ['18h30–19h59', 75], ['20h ou depois', 1], ['varia', 5]] },
  { pergunta: 3, grupo: 'Todos', base: 99, opcoes: [['até 5 min', 14], ['5 a 10 min', 36], ['10 a 20 min', 21], ['20 a 30 min', 15], ['mais de 30 min', 8], ['varia', 5]] },
  { pergunta: 4, grupo: 'Todos', base: 81, opcoes: [['Av. Vasconcelos Costa', 47], ['R. Rivalino Pereira', 31], ['Av. Belo Horizonte', 30], ['R. Arlindo Teixeira', 22], ['R. Alexandre Marquez', 17]] },
  { pergunta: 5, grupo: 'Todos', base: 99, opcoes: [['Bom', 9], ['Mais bom que ruim', 17], ['Nem bom nem ruim', 32], ['Mais ruim que bom', 33], ['Ruim', 9]] },
  { pergunta: 5, grupo: 'Motoristas', base: 56, opcoes: [['Bom', 4], ['Mais bom que ruim', 23], ['Nem bom nem ruim', 27], ['Mais ruim que bom', 34], ['Ruim', 12]] },
  { pergunta: 5, grupo: 'Não motoristas', base: 43, opcoes: [['Bom', 14], ['Mais bom que ruim', 8], ['Nem bom nem ruim', 40], ['Mais ruim que bom', 33], ['Ruim', 5]] },
  { pergunta: 6, grupo: 'Todos', base: 99, opcoes: [['Sim', 66], ['Talvez', 23], ['Não, não sei ou não se aplica', 11]] },
  { pergunta: 6, grupo: 'Motoristas', base: 56, opcoes: [['Sim', 71], ['Talvez', 23], ['Não, não sei ou não se aplica', 6]] },
  { pergunta: 6, grupo: 'Não motoristas', base: 43, opcoes: [['Sim', 58], ['Talvez', 23], ['Não, não sei ou não se aplica', 18]] },
  { pergunta: 7, grupo: 'Todos', base: 99, opcoes: [['estudam na ESAMC', 90], ['vão todos os dias úteis', 78], ['saem entre 21h e 22h59', 85], ['fazem sempre ou quase sempre o mesmo trajeto', 96]] },
  { pergunta: 8, grupo: 'Todos', base: 99, opcoes: [['Localização só quando eu ligar', 55], ['Localização anônima e contínua', 42], ['Registrar chegada e saída à mão', 34], ['Não sei', 7]] },
  { pergunta: 9, grupo: 'Todos', base: 85, opcoes: [['acham a vaga pouco previsível', 54], ['acham a vaga previsível', 38]] },
]
