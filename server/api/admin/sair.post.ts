export default defineEventHandler(async (event) => {
  await setUserSession(event, { secure: { admin: false } })
  return { admin: false }
})
