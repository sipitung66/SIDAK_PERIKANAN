import bcrypt from 'bcryptjs';

const DEMO_USERS = {
  'admin@sidak.go.id': {
    id: 'demo-super-admin',
    nama: 'Super Admin',
    email: 'admin@sidak.go.id',
    role: 'super_admin',
    password: 'Admin123!',
  },
  'admin2@sidak.go.id': {
    id: 'demo-admin-dinas',
    nama: 'Admin Dinas',
    email: 'admin2@sidak.go.id',
    role: 'admin_dinas',
    password: 'Admin123!',
  },
  'petugas@sidak.go.id': {
    id: 'demo-petugas',
    nama: 'Petugas Lapangan',
    email: 'petugas@sidak.go.id',
    role: 'petugas_lapangan',
    password: 'Petugas123!',
  },
  'admin@sidak.com': {
    id: 'demo-super-admin-alt',
    nama: 'Super Admin',
    email: 'admin@sidak.com',
    role: 'super_admin',
    password: 'password123',
  },
};

export async function findUserForCredentials({ email, password, prisma }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPassword = (password || '').trim();

  if (!normalizedEmail || !normalizedPassword) {
    return null;
  }

  try {
    const user = await prisma?.user?.findUnique?.({ where: { email: normalizedEmail } });
    if (user?.password_hash) {
      const isValid = await bcrypt.compare(normalizedPassword, user.password_hash);
      if (isValid) {
        return {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        };
      }
    }
  } catch (error) {
    console.warn('Prisma auth lookup failed, trying fallback credentials.', error);
  }

  const fallbackUser = DEMO_USERS[normalizedEmail];
  if (fallbackUser && normalizedPassword === fallbackUser.password) {
    return {
      id: fallbackUser.id,
      nama: fallbackUser.nama,
      email: fallbackUser.email,
      role: fallbackUser.role,
    };
  }

  return null;
}
