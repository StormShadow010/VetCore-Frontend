import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import type { Mascota, Especie, Propietario } from '../types'
import {
  PageHeader, Card, Table, Badge, Btn, Modal,
  Input, Select, SearchInput, Spinner, Alert,
} from '../components/ui'

const EMPTY = { nombre: '', id_especie: '', raza: '', sexo: 'M', peso_kg: '', color: '', id_propietario: '' }

export default function MascotasPage() {
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Mascota | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ ...EMPTY })

  const { data: mascotas, loading, refetch } = useFetch<Mascota[]>(
    `/mascotas?search=${encodeURIComponent(search)}`, [search],
  )
  const { data: especies } = useFetch<Especie[]>('/especies')
  const { data: propietarios } = useFetch<Propietario[]>('/propietarios')

  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setFormError(''); setShowModal(true) }
  const openEdit = (m: Mascota) => {
    setEditing(m)
    setForm({ nombre: m.nombre, id_especie: String(m.id_especie), raza: m.raza ?? '', sexo: m.sexo, peso_kg: m.peso_kg ? String(m.peso_kg) : '', color: m.color ?? '', id_propietario: String(m.id_propietario) })
    setFormError(''); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nombre || !form.id_especie || !form.id_propietario) { setFormError('Nombre, especie y propietario son obligatorios'); return }
    setSaving(true); setFormError('')
    const body = { ...form, id_especie: Number(form.id_especie), id_propietario: Number(form.id_propietario), peso_kg: form.peso_kg ? Number(form.peso_kg) : null }
    try {
      editing ? await api.put(`/mascotas/${editing.id_mascota}`, body) : await api.post('/mascotas', body)
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (m: Mascota) => {
    if (!confirm(`¿Desactivar a ${m.nombre}?`)) return
    try { await api.patch(`/mascotas/${m.id_mascota}/desactivar`, {}); refetch() }
    catch (e) { alert((e as Error).message) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Mascotas" action={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Nombre, propietario…" />
          {can('USUARIO') && <Btn onClick={openCreate}>+ Nueva mascota</Btn>}
        </div>
      } />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Nombre', 'Especie', 'Raza', 'Sexo', 'Peso', 'Color', 'Propietario', 'Tel.', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(mascotas ?? []).map(m => [
              <strong>{m.nombre}</strong>,
              m.especie_nombre, m.raza ?? '—',
              <Badge label={m.sexo === 'M' ? 'Macho' : 'Hembra'} variant={m.sexo === 'M' ? 'blue' : 'purple'} />,
              m.peso_kg ? `${m.peso_kg} kg` : '—', m.color ?? '—',
              m.propietario_nombre, m.propietario_telefono ?? '—',
              ...(can('ADMIN') ? [<div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" variant="secondary" onClick={() => openEdit(m)}>Editar</Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(m)}>Desact.</Btn>
              </div>] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? `Editar: ${editing.nombre}` : 'Nueva Mascota'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Nombre *" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Select label="Especie *" value={form.id_especie} onChange={e => set('id_especie', e.target.value)}>
                <option value="">Seleccionar…</option>
                {(especies ?? []).map(e => <option key={e.id_especie} value={e.id_especie}>{e.nombre}</option>)}
              </Select></div>
              <div style={{ flex: 1 }}><Input label="Raza" value={form.raza} onChange={e => set('raza', e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Select label="Sexo" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                <option value="M">Macho</option><option value="F">Hembra</option>
              </Select></div>
              <div style={{ flex: 1 }}><Input label="Peso (kg)" type="number" step="0.1" value={form.peso_kg} onChange={e => set('peso_kg', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Color" value={form.color} onChange={e => set('color', e.target.value)} /></div>
            </div>
            <Select label="Propietario *" value={form.id_propietario} onChange={e => set('id_propietario', e.target.value)}>
              <option value="">Seleccionar…</option>
              {(propietarios ?? []).map(p => <option key={p.id_propietario} value={p.id_propietario}>{p.nombres} {p.apellidos} — {p.cedula}</option>)}
            </Select>
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
