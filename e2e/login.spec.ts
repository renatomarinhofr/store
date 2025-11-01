import { test, expect } from '@playwright/test'

const LOGIN_ENDPOINT = '**/login'

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/login')
  })

  test('disables submit until form is valid', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Entrar' })
    await expect(submitButton).toBeDisabled()

    await page.fill('#login-email', 'admin@test.com')
    await expect(submitButton).toBeDisabled()

    await page.fill('#login-password', '123')
    await expect(submitButton).toBeEnabled()
  })

  test('shows error feedback for invalid credentials', async ({ page }) => {
    await page.route(LOGIN_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Credenciais inválidas.' }),
      })
    })

    await page.fill('#login-email', 'admin@test.com')
    await page.fill('#login-password', 'wrong-password')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Credenciais inválidas.')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('logs in successfully and persists jwt token', async ({ page }) => {
    await page.route(LOGIN_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'provider-token', role: 'admin' }),
      })
    })

    await page.route('**/admin/products', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      })
    })

    await page.fill('#login-email', 'admin@test.com')
    await page.fill('#login-password', '123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await page.waitForURL(/\/produtos$/)

    const storedUser = await page.evaluate(() => window.localStorage.getItem('store.auth.user'))
    expect(storedUser).not.toBeNull()

    const parsedUser = JSON.parse(storedUser ?? '{}')
    expect(parsedUser.email).toBe('admin@test.com')
    expect(parsedUser.role).toBe('admin')
    expect(parsedUser.providerToken).toBe('provider-token')
    expect(typeof parsedUser.token).toBe('string')
    expect(parsedUser.token.split('.')).toHaveLength(3)
  })

  test('allows toggling password visibility', async ({ page }) => {
    const passwordInput = page.locator('#login-password')
    await page.fill('#login-password', '123456')
    const toggle = page.getByTestId('password-toggle')

    await expect(toggle).toBeVisible()

    await expect(passwordInput).toHaveAttribute('type', 'password')
    await toggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await toggle.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
