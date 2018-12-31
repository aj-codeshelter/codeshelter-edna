import { app, createTestUser, deleteTestUser, getPersistentAgent, serverReady, stubRecaptcha } from './_imports'

stubRecaptcha(test)

test('redirects from http to https on auth page', async () => {
  await serverReady
  return (
    app.get('/auth')
    .set('Host', 'example.com')
    .expect(302)
    .expect('location', 'https://example.com/auth')
  )
})

test('gets auth page', async () => {
  return (
    app.get('/')
    .expect(200)
    .expect(/<title>/)
    .expect(/<body>/)
  )
})

test('gets app page', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)

  return (
    app.get('/app')
    .expect(200)
    .expect(/<title>/)
    .expect(/<body>/)
  )
})
