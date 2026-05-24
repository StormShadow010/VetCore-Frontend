import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import type { Propietario } from '../types'
import { PageHeader, Card, Table, Btn, Modal, Input, SearchInput, Spinner, Alert } from '../components/ui'

const EMPTY = { cedula: '', nombres: '', apellidos: '', telefono: '', email: '', direccion: '', ciudad: '' }

export default function PropietariosPage() {
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Propietario | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ ...EMPTY })

  const { data: propietarios, loading, refetch } = useFetch<Propietario[]>(
    `/propietarios?search=${encodeURIComponent(search)}`, [search],
  )
  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setFormError(''); setShowModal(true) }
  const openEdit = (p: Propietario) => {
    setEditing(p)
    setForm({ cedula: p.cedula, nombres: p.nombres, apellidos: p.apellidos, telefono: p.telefono ?? '', email: p.email ?? '', direccion: p.direccion ?? '', ciudad: p.ciudad ?? '' })
    setFormError(''); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.cedula || !form.nombres || !form.apellidos) { setFormError('Cédula, nombres y apellidos son obligatorios'); return }
    setSaving(true); setFormError('')
    try {
      editing ? await api.put(`/propietarios/${editing.id_propietario}`, form) : await api.post('/propietarios', form)
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Propietarios" action={
        <div style={{ display: 'flex', gap: 10 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Nombre, cédula…" />
          {can('USUARIO') && <Btn onClick={openCreate}>+ Nuevo propietario</Btn>}
        </div>
      } />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Cédula', 'Nombre completo', 'Teléfono', 'Email', 'Ciudad', 'Registrado', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(propietarios ?? []).map(p => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.cedula}</span>,
              <strong>{p.nombres} {p.apellidos}</strong>,
              p.telefono ?? '—', p.email ?? '—', p.ciudad ?? '—',
              new Date(p.fecha_registro).toLocaleDateString('es-CO'),
              ...(can('ADMIN') ? [<Btn size="sm" variant="secondary" onClick={() => openEdit(p)}>Editar</Btn>] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Propietario' : 'Nuevo Propietario'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Cédula *" value={form.cedula} onChange={e => set('cedula', e.target.value)} disabled={!!editing} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Nombres *" value={form.nombres} onChange={e => set('nombres', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Apellidos *" value={form.apellidos} onChange={e => set('apellidos', e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Teléfono" value={form.telefono} onChange={e => set('telefono', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Ciudad" value={form.ciudad} onChange={e => set('ciudad', e.target.value)} /></div>
            </div>
            <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            <Input label="Dirección" value={form.direccion} onChange={e => set('direccion', e.target.value)} />
            {formError && <Alert message={formError} />}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Btn>
              <Btn onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : editing ? 'Actualizar' : 'Guardar'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
