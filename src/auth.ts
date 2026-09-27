import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import Credentials from 'next-auth/providers/credentials';
import { findOrCreateDosenForAuth, getDosenByEmail, getDosenByNik } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'monev-secret-key-fallback-for-dev-32chars',
  trustHost: true,
  providers: [
    ...(process.env.AUTH_KEYCLOAK_ID && process.env.AUTH_KEYCLOAK_ISSUER
      ? [
          Keycloak({
            clientId: process.env.AUTH_KEYCLOAK_ID,
            clientSecret: process.env.AUTH_KEYCLOAK_SECRET || '',
            issuer: process.env.AUTH_KEYCLOAK_ISSUER,
          }),
        ]
      : []),
    // Development & Fallback Credentials Provider
    Credentials({
      id: 'credentials',
      name: 'Dosen Wali / Akun Dev',
      credentials: {
        nik: { label: 'NIK atau Email Dosen', type: 'text', placeholder: '581000020 atau philipus@ukwms.ac.id' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.nik) return null;
        const identifier = String(credentials.nik).trim();
        
        let dosen = await getDosenByEmail(identifier);
        if (!dosen) {
          dosen = await getDosenByNik(identifier);
        }
        if (!dosen) {
          dosen = await findOrCreateDosenForAuth({
            email: identifier.includes('@') ? identifier : undefined,
            nik: !identifier.includes('@') ? identifier : undefined,
            name: identifier.split('@')[0],
          });
        }

        if (dosen) {
          return {
            id: dosen.id,
            name: dosen.nama,
            email: dosen.email || `${dosen.nik}@ukwms.ac.id`,
            dosen_id: dosen.id,
            nik: dosen.nik,
            prodi_id: dosen.prodi_id,
            prodi_nama: dosen.prodi_nama,
            role: 'DOSEN',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, profile, account }) {
      if (user) {
        token.dosen_id = (user as any).dosen_id;
        token.nik = (user as any).nik;
        token.prodi_id = (user as any).prodi_id;
        token.prodi_nama = (user as any).prodi_nama;
        token.role = (user as any).role || 'DOSEN';
      }

      // If logging in via Keycloak provider, link to database Dosen record
      if (account?.provider === 'keycloak' && (profile || token.email)) {
        const email = token.email || (profile as any)?.email;
        const preferredUsername = (profile as any)?.preferred_username;
        const nikAttr = (profile as any)?.nik || (profile as any)?.attributes?.nik?.[0];
        const fullName = (profile as any)?.name || token.name;

        const dosen = await findOrCreateDosenForAuth({
          email,
          username: preferredUsername,
          nik: nikAttr,
          name: fullName,
        });

        if (dosen) {
          token.dosen_id = dosen.id;
          token.nik = dosen.nik;
          token.prodi_id = dosen.prodi_id;
          token.prodi_nama = dosen.prodi_nama;
          token.name = dosen.nama;
          token.email = dosen.email || email;
          
          const realmRoles = (profile as any)?.realm_access?.roles || [];
          if (realmRoles.includes('admin') || realmRoles.includes('kaprodi')) {
            token.role = realmRoles.includes('admin') ? 'ADMIN' : 'KAPRODI';
          } else {
            token.role = 'DOSEN';
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || (token.dosen_id as string);
        session.user.dosen_id = token.dosen_id as string;
        session.user.nik = token.nik as string;
        session.user.prodi_id = token.prodi_id as string;
        session.user.prodi_nama = token.prodi_nama as string;
        session.user.role = (token.role as any) || 'DOSEN';
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
});
