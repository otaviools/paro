declare module '#auth-utils' {
  interface User {
    dispositivoId: string
  }

  interface SecureSessionData {
    admin?: boolean
  }
}

export {}
