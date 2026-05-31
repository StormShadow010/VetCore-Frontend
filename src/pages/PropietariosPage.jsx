import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { validate, rules } from '../services/validation'
import { PageHeader, Card, Table, Badge, Btn, Modal, Input, SearchInput, Spinner, Alert, FormRow, FormCol, PATTERNS } from '../components/ui'

const EMPTY = { cedula: '', nombres: '', apellidos: '', telefono: '', email: '', direccion: '', ciudad: '' }
const SCHEMA = {
  cedula:    [rules.cedula],
  nombres:   [rules.required, rules.soloLetras, rules.minLen(2), rules.maxLen(100)],
  apellidos: [rules.required, rules.soloLetras, rules.minLen(2), rules.maxLen(100)],
  telefono:  [rules.telefono],
  email:     [rules.email],
}

export default function PropietariosPage() {
  const { user } = useAuth()
  const rol     = user?.rol ?? 'CONSULTA'
  const isSuper = rol === 'SUPERADMIN'
  const isAdmin = rol === 'ADMIN' || isSuper

  const [search,    setSearch]    = useState('')
  const [filtro,    setFiltro]    = useState('todas')
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [form,      setForm]      = useState({ ...EMPTY })
  const [errors,    setErrors]    = useState({})

  const buildUrl = () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    p.set('activo', filtro)  // siempre explícito: 'todas', 'true' o 'false'
    const q = p.toString()
    return `/propietarios${q ? `?${q}` : ''}`
  }

  const { data: propietarios, loading, refetch } = useFetch(buildUrl(), [search, filtro])
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit   = (p) => {
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

  // ADMIN → borrado lógico (sigue en tabla, estado Inactivo)
  const handleDesactivar = async (p) => {
    if (!confirm(`¿Desactivar a "${p.nombres} ${p.apellidos}"?\nSeguirá visible en la tabla con estado Inactivo.`)) return
    try { await api.patch(`/propietarios/${p.id_propietario}/desactivar`, {}); refetch() }
    catch (e) { alert(e.message) }
  }

  // ADMIN → reactivar
  const handleActivar = async (p) => {
    if (!confirm(`¿Reactivar a "${p.nombres} ${p.apellidos}"?`)) return
    try { await api.patch(`/propietarios/${p.id_propietario}/activar`, {}); refetch() }
    catch (e) { alert(e.message) }
  }

  // SUPERADMIN → elimina permanentemente
  const handleEliminar = async (p) => {
    if (!confirm(`⚠ ELIMINAR permanentemente a "${p.nombres} ${p.apellidos}".\n\nEsta acción NO se puede deshacer.`)) return
    try { await api.del(`/propietarios/${p.id_propietario}`); refetch() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Propietarios" action={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Nombre, cédula…" />
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }}>
            <option value="todas">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          {isAdmin && <Btn onClick={openCreate}>+ Nuevo propietario</Btn>}
        </div>
      } />

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Cédula', 'Nombre completo', 'Teléfono', 'Email', 'Ciudad', 'Estado', ...(isAdmin ? ['Acciones'] : [])]}
            rows={(propietarios ?? []).map(p => {
              const activo = p.activo !== false
              return [
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: activo ? 1 : 0.5 }}>{p.cedula}</span>,
                <strong style={{ opacity: activo ? 1 : 0.5 }}>{p.nombres} {p.apellidos}</strong>,
                p.telefono ?? '—', p.email ?? '—', p.ciudad ?? '—',
                <Badge label={activo ? 'Activo' : 'Inactivo'} variant={activo ? 'green' : 'gray'} />,
                ...(isAdmin ? [
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn size="sm" variant="secondary" onClick={() => openEdit(p)}>Editar</Btn>
                    {activo
                      ? <Btn size="sm" variant="danger" onClick={() => handleDesactivar(p)}>Desactivar</Btn>
                      : <Btn size="sm" variant="secondary" onClick={() => handleActivar(p)}>Activar</Btn>}
                    {isSuper && <Btn size="sm" variant="danger" onClick={() => handleEliminar(p)}>🗑 Eliminar</Btn>}
                  </div>,
                ] : []),
              ]
            })}
          />
        )}
      </Card>

      {showModal && (
        <Modal title={editing ? 'Editar Propietario' : 'Nuevo Propietario'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Cédula *" value={form.cedula} error={errors.cedula} allowPattern={PATTERNS.soloNumeros} maxLength={12} onChange={e => set('cedula', e.target.value)} disabled={!!editing} placeholder="Ej: 10000001" />
            <FormRow>
              <FormCol><Input label="Nombres *" value={form.nombres} error={errors.nombres} allowPattern={PATTERNS.soloLetras} maxLength={100} onChange={e => set('nombres', e.target.value)} placeholder="Ej: Santiago" /></FormCol>
              <FormCol><Input label="Apellidos *" value={form.apellidos} error={errors.apellidos} allowPattern={PATTERNS.soloLetras} maxLength={100} onChange={e => set('apellidos', e.target.value)} placeholder="Ej: Torres" /></FormCol>
            </FormRow>
            <FormRow>
              <FormCol><Input label="Teléfono" value={form.telefono} error={errors.telefono} allowPattern={PATTERNS.soloNumeros} maxLength={15} onChange={e => set('telefono', e.target.value)} placeholder="Ej: 3001234567" /></FormCol>
              <FormCol><Input label="Ciudad" value={form.ciudad} allowPattern={PATTERNS.soloLetras} maxLength={80} onChange={e => set('ciudad', e.target.value)} placeholder="Ej: Bogotá" /></FormCol>
            </FormRow>
            <Input label="Email" type="email" value={form.email} error={errors.email} allowPattern={PATTERNS.email} maxLength={150} onChange={e => set('email', e.target.value)} placeholder="Ej: nombre@correo.com" />
            <Input label="Dirección" value={form.direccion} allowPattern={PATTERNS.direccion} maxLength={255} onChange={e => set('direccion', e.target.value)} placeholder="Ej: Calle 123 # 45-67" />
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
