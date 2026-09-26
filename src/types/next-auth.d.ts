import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      dosen_id?: string;
      nik?: string;
      nama?: string;
      email?: string;
      prodi_id?: string;
      prodi_nama?: string;
      role?: 'DOSEN' | 'KAPRODI' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User {
    dosen_id?: string;
    nik?: string;
    prodi_id?: string;
    prodi_nama?: string;
    role?: 'DOSEN' | 'KAPRODI' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    dosen_id?: string;
    nik?: string;
    prodi_id?: string;
    prodi_nama?: string;
    role?: 'DOSEN' | 'KAPRODI' | 'ADMIN';
  }
}
