import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const adminEmail = process.env.APP_ADMIN_EMAIL
        const adminPassword = process.env.APP_ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) {
          throw new Error('Admin credentials not configured')
        }

        if (credentials.email !== adminEmail) {
          return null
        }

        // For MVP, we'll do a simple string comparison
        // In production, you'd hash the password and compare
        const isValid = credentials.password === adminPassword

        if (!isValid) {
          return null
        }

        return {
          id: '1',
          email: adminEmail,
          name: 'Admin',
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
})
