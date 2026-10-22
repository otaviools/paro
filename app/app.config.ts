const escalaDeTexto = ['hero', 'percentual', 'kpi', 'numero', 'titulo', 'stat', 'botao', 'card', 'destaque', 'corpo', 'interface', 'legenda', 'nota', 'etiqueta', 'mapa']
const escalaDeRaio = ['badge', 'botao', 'alerta', 'lista', 'card']

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'azul',
      secondary: 'asfalto',
      success: 'azul',
      info: 'azul',
      warning: 'asfalto',
      error: 'asfalto',
      neutral: 'asfalto',
    },
    tv: {
      twMergeConfig: {
        extend: {
          theme: {
            text: escalaDeTexto,
            radius: escalaDeRaio,
          },
        },
      },
    },
    card: {
      slots: {
        root: 'rounded-card',
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-(--app-card) ring ring-default divide-y divide-default dark:ring-0',
          },
        },
      },
    },
    button: {
      slots: {
        base: 'font-bold rounded-botao',
      },
    },
    input: {
      slots: {
        base: 'rounded-botao',
      },
    },
    textarea: {
      slots: {
        base: 'rounded-alerta',
      },
    },
  },
})
