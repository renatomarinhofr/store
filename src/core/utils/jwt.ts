const encodeBase64 = (value: string): string => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(value)))
  }

  if (typeof globalThis !== 'undefined') {
    const maybeBuffer = (globalThis as Record<string, unknown>).Buffer as
      | { from: (input: string, encoding: string) => { toString: (encoding: string) => string } }
      | undefined

    if (maybeBuffer) {
      return maybeBuffer.from(value, 'utf-8').toString('base64')
    }
  }

  throw new Error('No base64 encoder available in this environment.')
}

const toBase64Url = (value: string): string =>
  encodeBase64(value)
    .replace(/=+$/u, '')
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_')

export interface FakeJwtPayload {
  email: string
  role: string
  iat: number
  exp: number
  [key: string]: unknown
}

export function createFakeJwt(payload: FakeJwtPayload): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const fakeSignature = toBase64Url('fake-signature')

  return `${encodedHeader}.${encodedPayload}.${fakeSignature}`
}
