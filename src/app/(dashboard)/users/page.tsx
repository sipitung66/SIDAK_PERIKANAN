'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users as UsersIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { UserRole } from '@/types';

interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
}

const emptyForm = { nama: '', email: '', password: '', role: 'petugas_lapangan' as UserRole };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const filtered = (d.data as User[]).filter(u => 
            u.nama.toLowerCase().includes(search.toLowerCase()) || 
            u.email.toLowerCase().includes(search.toLowerCase())
          );
          setUsers(filtered);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u: User) => {
    setEditItem(u);
    setForm({ nama: u.nama, email: u.email, password: '', role: u.role });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const method = editItem ? 'PUT' : 'POST';
    const url = editItem ? `/api/users/${editItem.id}` : '/api/users';
    
    // Don't send empty password on edit
    const payload = { ...form };
    if (editItem && !payload.password) {
      delete (payload as any).password;
    }

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setModalOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/users/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchData();
  };

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin_dinas: 'Admin Dinas',
    admin_program: 'Admin Program / PPTK',
    petugas_lapangan: 'Penyuluh / Petugas Lapangan',
    pimpinan: 'Pimpinan (Kadis)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
            <UsersIcon size={20} style={{ color: '#00d4aa' }} /> Manajemen User
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Kelola data pengguna sistem</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
          <Plus size={16} /> Tambah User
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari user..."
          className="input-dark pl-9 py-2 text-sm w-full" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10" style={{ color: '#475569' }}>Tidak ada data user</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.id}>
                    <td><p className="font-medium" style={{ color: '#e2e8f0' }}>{u.nama}</p></td>
                    <td style={{ color: '#94a3b8' }}>{u.email}</td>
                    <td><Badge variant={u.role === 'super_admin' ? 'aktif' : (u.role === 'admin_dinas' ? 'selesai' : 'tidak_aktif')}>{roleLabels[u.role]}</Badge></td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(u)} title="Edit"
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#94a3b8' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteId(u.id)} title="Hapus"
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors" style={{ color: '#f87171' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit User' : 'Tambah User'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Lengkap</label>
            <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
              placeholder="Masukkan nama" className="input-dark text-sm w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com" className="input-dark text-sm w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>
              Password {editItem && <span className="text-xs italic">(Kosongkan jika tidak ingin mengubah)</span>}
            </label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="***" className="input-dark text-sm w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
              className="input-dark text-sm w-full">
              <option value="super_admin">Super Admin</option>
              <option value="admin_program">Admin Program / PPTK</option>
              <option value="admin_dinas">Admin Dinas</option>
              <option value="petugas_lapangan">Penyuluh / Petugas Lapangan</option>
              <option value="pimpinan">Pimpinan (Kadis)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
              Batal
            </button>
            <button onClick={handleSave} disabled={saving || !form.nama || !form.email || (!editItem && !form.password)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Yakin hapus user ini?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            Batal
          </button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
