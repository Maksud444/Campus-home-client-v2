export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/post/:path*',
    '/messages/:path*',
    '/profile/:path*'
  ]
}
