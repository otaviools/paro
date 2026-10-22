import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/test-utils/module', 'nuxt-auth-utils', 'nuxt-email-renderer', ...(process.env.VITEST ? [] : ['@vite-pwa/nuxt'])],
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Parô',
      meta: [
        { name: 'description', content: 'Chance de vaga por rua e horário no entorno da ESAMC. Previsão, não garantia.' },
      ],
      link: [{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    },
  },
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'system', fallback: 'light' },
  runtimeConfig: {
    databaseUrl: '',
    adminPassword: '',
    emailPepper: '',
    smtpHost: '',
    smtpPort: '465',
    smtpUser: '',
    smtpPassword: '',
    emailRemetente: '',
    session: { maxAge: 60 * 60 * 24 * 365, cookie: { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' } },
    public: {
      favicon: process.env.NODE_ENV === 'production' ? '/favicon-producao.svg' : '/favicon-localhost.svg',
    },
  }, compatibilityDate: '2026-10-01',
  nitro: {
    // Logo empacotada no servidor para ir anexada aos e-mails (cid), sem depender de URL pública.
    serverAssets: [{ baseName: 'marca-logo', dir: fileURLToPath(new URL('./marca/logo', import.meta.url)) }],
    publicAssets: [
      { dir: fileURLToPath(new URL('./marca/favicon', import.meta.url)), baseURL: '/', maxAge: 60 * 60 * 24 },
      { dir: fileURLToPath(new URL('./marca/logo', import.meta.url)), baseURL: '/marca/logo', maxAge: 60 * 60 * 24 },
      { dir: fileURLToPath(new URL('./marca/simbolo', import.meta.url)), baseURL: '/marca/simbolo', maxAge: 60 * 60 * 24 },
      { dir: fileURLToPath(new URL('./marca/grafismos', import.meta.url)), baseURL: '/marca/grafismos', maxAge: 60 * 60 * 24 },
      { dir: fileURLToPath(new URL('./node_modules/maplibre-gl/dist', import.meta.url)), baseURL: '/maplibre', maxAge: 60 * 60 * 24 * 7 },
    ],
    experimental: { tasks: true },
    scheduledTasks: { '0 4 * * *': ['historico:limpar'], '15 * * * *': ['relatos:anonimizar'] },
  },
  vite: {
    optimizeDeps: { exclude: ['maplibre-gl'] },
  },
  typescript: { strict: true, typeCheck: false, tsConfig: { compilerOptions: { noUncheckedIndexedAccess: true } } },
  eslint: { config: { stylistic: true } },
  fonts: {
    providers: { google: false, googleicons: false, bunny: false, fontshare: false, fontsource: false, adobe: false },
  },
  icon: {
    serverBundle: { collections: ['lucide'] },
  },
  nuxtEmailRenderer: { codeHighlighting: false },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Parô',
      short_name: 'Parô',
      description: 'Chance de vaga por rua e horário. Previsão, não garantia.',
      lang: 'pt-BR',
      background_color: '#FFF9E3',
      theme_color: '#32312C',
      display: 'standalone',
      icons: [
        { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { navigateFallback: null, globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], importScripts: ['/sw-notificacao.js'] },
    devOptions: { enabled: false },
  },
})
