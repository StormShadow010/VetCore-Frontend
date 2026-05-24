import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { validate, rules } from '../services/validation'
import { PageHeader, Card, Table, Btn, Modal, Input, SearchInput, Spinner, Alert, FormRow, FormCol, PATTERNS } from '../components/ui'

const EMPTY = { cedula: '', nombres: '', apellidos: '', telefono: '', email: '', direccion: '', ciudad: '' }
const SCHEMA = {
  cedula:    [rules.cedula],
  nombres:   [rules.required, rules.soloLetras, rules.minLen(2), rules.maxLen(100)],
  apellidos: [rules.required, rules.soloLetras, rules.minLen(2), rules.maxLen(100)],
  telefono:  [rules.telefono],
  email:     [rules.email],
}

export default function PropietariosPage() {
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState({})

  const { data: propietarios, loading, refetch } = useFetch(`/propietarios?search=${encodeURIComponent(search)}`, [search])
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ cedula: p.cedula, nombres: p.nombres, apellidos: p.apellidos, telefono: p.telefono ?? '', email: p.email ?? '', direccion: p.direccion ?? '', ciudad: p.ciudad ?? '' })
    setErrors({}); setApiError(''); setShowModal(true)
  }

  const handleSave = async () => {
    const errs = validate(form, SCHEMA)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    try {
      editing ? await api.put(`/propietarios/${editing.id_propietario}`, form) : await api.post('/propietarios', form)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Cédula *" value={form.cedula} error={errors.cedula}
              allowPattern={PATTERNS.soloNumeros}
              maxLength={12}
              onChange={e => set('cedula', e.target.value)}
              disabled={!!editing}
              placeholder="Ej: 10000001"
            />
            <FormRow>
              <FormCol>
                <Input
                  label="Nombres *" value={form.nombres} error={errors.nombres}
                  allowPattern={PATTERNS.soloLetras}
                  maxLength={100}
                  onChange={e => set('nombres', e.target.value)}
                  placeholder="Ej: Santiago"
                />
              </FormCol>
              <FormCol>
                <Input
                  label="Apellidos *" value={form.apellidos} error={errors.apellidos}
                  allowPattern={PATTERNS.soloLetras}
                  maxLength={100}
                  onChange={e => set('apellidos', e.target.value)}
                  placeholder="Ej: Torres"
                />
              </FormCol>
            </FormRow>
            <FormRow>
              <FormCol>
                <Input
                  label="Teléfono" value={form.telefono} error={errors.telefono}
                  allowPattern={PATTERNS.soloNumeros}
                  maxLength={15}
                  onChange={e => set('telefono', e.target.value)}
                  placeholder="Ej: 3001234567"
                />
              </FormCol>
              <FormCol>
                <Input
                  label="Ciudad" value={form.ciudad}
                  allowPattern={PATTERNS.soloLetras}
                  maxLength={80}
                  onChange={e => set('ciudad', e.target.value)}
                  placeholder="Ej: Bogotá"
                />
              </FormCol>
            </FormRow>
            <Input
              label="Email" type="email" value={form.email} error={errors.email}
              allowPattern={PATTERNS.email}
              maxLength={150}
              onChange={e => set('email', e.target.value)}
              placeholder="Ej: nombre@correo.com"
            />
            <Input
              label="Dirección" value={form.direccion}
              allowPattern={PATTERNS.direccion}
              maxLength={255}
              onChange={e => set('direccion', e.target.value)}
              placeholder="Ej: Calle 123 # 45-67"
            />
            {apiError && <Alert message={apiError} />}
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
