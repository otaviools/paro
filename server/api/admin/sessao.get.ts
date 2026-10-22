import type { SessaoDeAdmin } from '../../../shared/types/admin'

export default defineEventHandler(async (event): Promise<SessaoDeAdmin> => ({
  admin: await ehAdmin(event),
  configurado: adminConfigurado(),
}))
