import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { validate, rules } from '../services/validation'
import {
  PageHeader, Card, Table, Badge, Btn, Modal, Input, Select,
  Spinner, Alert, ROL_BADGE, SearchInput, FormRow, FormCol, PATTERNS,
} from '../components/ui'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

/* ── VETERINARIOS ────────────────────────────────────────────── */
const VET_SCHEMA = {
  cedula:         [rules.cedula],
  nombres:        [rules.required, rules.soloLetras, rules.minLen(2)],
  apellidos:      [rules.required, rules.soloLetras, rules.minLen(2)],
  telefono:       [rules.telefono],
  email:          [rules.emailRequerido],
  id_especialidad:[rules.selectRequerido],
}
const VET_EMPTY = { cedula: '', nombres: '', apellidos: '', telefono: '', email: '', id_especialidad: '', activo: 'true' }

export function VeterinariosPage() {
  const { can } = useAuth()
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const { data, loading, refetch } = useFetch(`/veterinarios?activo=${filtroActivo}`, [filtroActivo])
  const { data: especialidades } = useFetch('/especialidades')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ ...VET_EMPTY })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const openCreate = () => { setEditing(null); setForm({ ...VET_EMPTY }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (v) => {
    setEditing(v)
    setForm({ cedula: v.cedula, nombres: v.nombres, apellidos: v.apellidos, telefono: v.telefono ?? '', email: v.email, id_especialidad: String(v.id_especialidad), activo: String(v.activo) })
    setErrors({}); setApiError(''); setShowModal(true)
  }
  const handleSave = async () => {
    const schema = editing ? { ...VET_SCHEMA, cedula: [] } : VET_SCHEMA
    const errs = validate(form, schema)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    const body = { ...form, id_especialidad: Number(form.id_especialidad), activo: form.activo === 'true' }
    try {
      editing ? await api.put(`/veterinarios/${editing.id_veterinario}`, body) : await api.post('/veterinarios', body)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }
  const handleDesactivar = async (v) => {
    if (!confirm(`¿Desactivar a "${v.nombres} ${v.apellidos}"?\nSeguirá visible con estado Inactivo.`)) return
    try { await api.patch(`/veterinarios/${v.id_veterinario}/desactivar`, {}); refetch() }
    catch (e) { alert(e.message) }
  }
  const handleActivar = async (v) => {
    if (!confirm(`¿Reactivar a "${v.nombres} ${v.apellidos}"?`)) return
    try { await api.patch(`/veterinarios/${v.id_veterinario}/activar`, {}); refetch() }
    catch (e) { alert(e.message) }
  }
  const handleEliminar = async (v) => {
    if (!confirm(`⚠ ELIMINAR permanentemente a "${v.nombres} ${v.apellidos}".\n\nEsta acción NO se puede deshacer.`)) return
    try { await api.del(`/veterinarios/${v.id_veterinario}`); refetch() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Veterinarios</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }}>
            <option value="todas">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          {can('ADMIN') && <Btn onClick={openCreate}>+ Nuevo veterinario</Btn>}
        </div>
      </div>
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Cédula', 'Nombre', 'Especialidad', 'Email', 'Teléfono', 'Estado', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(v => {
              const activo = v.activo !== false
              return [
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: activo ? 1 : 0.5 }}>{v.cedula}</span>,
                <strong style={{ opacity: activo ? 1 : 0.5 }}>{v.nombres} {v.apellidos}</strong>,
                v.especialidad_nombre, v.email, v.telefono ?? '—',
                <Badge label={activo ? 'Activo' : 'Inactivo'} variant={activo ? 'green' : 'gray'} />,
                ...(can('ADMIN') ? [
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn size="sm" variant="secondary" onClick={() => openEdit(v)}>Editar</Btn>
                    {activo
                      ? <Btn size="sm" variant="danger" onClick={() => handleDesactivar(v)}>Desactivar</Btn>
                      : <Btn size="sm" variant="secondary" onClick={() => handleActivar(v)}>Activar</Btn>}
                    {can('SUPERADMIN') && <Btn size="sm" variant="danger" onClick={() => handleEliminar(v)}>🗑 Eliminar</Btn>}
                  </div>
                ] : []),
              ]
            })}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Veterinario' : 'Nuevo Veterinario'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Cédula *" value={form.cedula} error={errors.cedula} allowPattern={PATTERNS.soloNumeros} maxLength={12} onChange={e => set('cedula', e.target.value)} disabled={!!editing} placeholder="Ej: 11111111" />
            <FormRow>
              <FormCol><Input label="Nombres *" value={form.nombres} error={errors.nombres} allowPattern={PATTERNS.soloLetras} maxLength={100} onChange={e => set('nombres', e.target.value)} /></FormCol>
              <FormCol><Input label="Apellidos *" value={form.apellidos} error={errors.apellidos} allowPattern={PATTERNS.soloLetras} maxLength={100} onChange={e => set('apellidos', e.target.value)} /></FormCol>
            </FormRow>
            <FormRow>
              <FormCol><Input label="Teléfono" value={form.telefono} error={errors.telefono} allowPattern={PATTERNS.soloNumeros} maxLength={15} onChange={e => set('telefono', e.target.value)} placeholder="3001234567" /></FormCol>
              <FormCol><Input label="Email *" type="email" value={form.email} error={errors.email} allowPattern={PATTERNS.email} maxLength={150} onChange={e => set('email', e.target.value)} placeholder="dr@vetcore.com" /></FormCol>
            </FormRow>
            <Select label="Especialidad *" value={form.id_especialidad} error={errors.id_especialidad} onChange={e => set('id_especialidad', e.target.value)}>
              <option value="">Seleccionar…</option>
              {(especialidades ?? []).map(e => <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre}</option>)}
            </Select>
            {editing && <Select label="Estado" value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </Select>}
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

/* ── ESPECIALIDADES ──────────────────────────────────────────── */
export function EspecialidadesPage() {
  const { can } = useAuth()
  const { data, loading, refetch } = useFetch('/especialidades')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (e) => { setEditing(e); setForm({ nombre: e.nombre, descripcion: e.descripcion ?? '' }); setErrors({}); setApiError(''); setShowModal(true) }
  const handleSave = async () => {
    const errs = validate(form, { nombre: [rules.required, rules.soloLetras, rules.minLen(3), rules.maxLen(100)] })
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    try {
      editing ? await api.put(`/especialidades/${editing.id_especialidad}`, form) : await api.post('/especialidades', form)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }
  const handleDelete = async (e) => {
    if (!confirm(`¿Eliminar la especialidad "${e.nombre}"?`)) return
    try { await api.del(`/especialidades/${e.id_especialidad}`); refetch() }
    catch (err) { alert(err.message) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Especialidades" action={can('ADMIN') && <Btn onClick={openCreate}>+ Nueva especialidad</Btn>} />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Nombre', 'Descripción', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(e => [
              <strong>{e.nombre}</strong>, e.descripcion ?? '—',
              ...(can('ADMIN') ? [
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(e)}>Editar</Btn>
                  {can('SUPERADMIN') && <Btn size="sm" variant="danger" onClick={() => handleDelete(e)}>Eliminar</Btn>}
                </div>
              ] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Especialidad' : 'Nueva Especialidad'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nombre *" value={form.nombre} error={errors.nombre} allowPattern={PATTERNS.soloLetras} maxLength={100} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Cardiología" />
            <Input label="Descripción" value={form.descripcion} allowPattern={PATTERNS.soloLetras} maxLength={255} onChange={e => set('descripcion', e.target.value)} placeholder="Ej: Enfermedades del corazón" />
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

/* ── ESPECIES ─────────────────────────────────────────────────── */
export function EspeciesPage() {
  const { can } = useAuth()
  const { data, loading, refetch } = useFetch('/especies')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (e) => { setEditing(e); setForm({ nombre: e.nombre, descripcion: e.descripcion ?? '' }); setErrors({}); setApiError(''); setShowModal(true) }
  const handleSave = async () => {
    const errs = validate(form, { nombre: [rules.required, rules.soloLetras, rules.minLen(2), rules.maxLen(80)] })
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    try {
      editing ? await api.put(`/especies/${editing.id_especie}`, form) : await api.post('/especies', form)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }
  const handleDelete = async (e) => {
    if (!confirm(`¿Eliminar la especie "${e.nombre}"?\n\nSolo es posible si no tiene mascotas asociadas.`)) return
    try { await api.del(`/especies/${e.id_especie}`); refetch() }
    catch (err) { alert(err.message) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Especies" action={can('ADMIN') && <Btn onClick={openCreate}>+ Nueva especie</Btn>} />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['ID', 'Nombre', 'Descripción', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(e => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{e.id_especie}</span>,
              <strong>{e.nombre}</strong>, e.descripcion ?? '—',
              ...(can('ADMIN') ? [
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(e)}>Editar</Btn>
                  {can('SUPERADMIN') && <Btn size="sm" variant="danger" onClick={() => handleDelete(e)}>Eliminar</Btn>}
                </div>
              ] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Especie' : 'Nueva Especie'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nombre *" value={form.nombre} error={errors.nombre} allowPattern={PATTERNS.soloLetras} maxLength={80} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Conejo" />
            <Input label="Descripción" value={form.descripcion} maxLength={255} onChange={e => set('descripcion', e.target.value)} placeholder="Nombre científico o descripción" />
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

/* ── MEDICAMENTOS ────────────────────────────────────────────── */
const MED_EMPTY = { nombre: '', principio_act: '', presentacion: '', stock: '', precio_unit: '', activo: 'true' }
const MED_SCHEMA = {
  nombre:      [rules.required, rules.minLen(2), rules.maxLen(150)],
  precio_unit: [rules.required, (v) => {
    if (!v && v !== 0) return 'El precio es obligatorio'
    const n = Number(v)
    if (isNaN(n)) return 'Debe ser un número válido'
    if (n < 0) return 'El precio no puede ser negativo'
    return ''
  }],
  stock: [(v) => {
    if (v === '' || v === null || v === undefined) return ''
    const n = Number(v)
    if (isNaN(n)) return 'Debe ser un número entero'
    if (n < 0) return 'El stock no puede ser negativo'
    return ''
  }],
}

export function MedicamentosPage() {
  const { can } = useAuth()
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const { data, loading, refetch } = useFetch(`/medicamentos?activo=${filtroActivo}`, [filtroActivo])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ ...MED_EMPTY })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const openCreate = () => { setEditing(null); setForm({ ...MED_EMPTY }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (m) => {
    setEditing(m)
    setForm({ nombre: m.nombre, principio_act: m.principio_act ?? '', presentacion: m.presentacion ?? '', stock: String(m.stock), precio_unit: String(m.precio_unit), activo: String(m.activo) })
    setErrors({}); setApiError(''); setShowModal(true)
  }
  const handleToggle = async (m) => {
    const accion = m.activo ? 'Desactivar' : 'Activar'
    if (!confirm(`¿${accion} el medicamento "${m.nombre}"?`)) return
    try {
      m.activo
        ? await api.patch(`/medicamentos/${m.id_medicamento}/desactivar`, {})
        : await api.patch(`/medicamentos/${m.id_medicamento}/activar`, {})
      refetch()
    } catch (e) { alert(e.message) }
  }

  const handleSave = async () => {
    const errs = validate(form, MED_SCHEMA)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    const body = { ...form, stock: Number(form.stock || 0), precio_unit: Number(form.precio_unit), activo: form.activo === 'true' }
    try {
      editing ? await api.put(`/medicamentos/${editing.id_medicamento}`, body) : await api.post('/medicamentos', body)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Medicamentos</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }}>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
            <option value="todas">Todos</option>
          </select>
          {can('ADMIN') && <Btn onClick={openCreate}>+ Nuevo medicamento</Btn>}
        </div>
      </div>
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Nombre', 'Principio activo', 'Presentación', 'Stock', 'Precio unit.', 'Estado', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(m => [
              <strong>{m.nombre}</strong>,
              m.principio_act ?? '—', m.presentacion ?? '—',
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: m.stock < 20 ? 'var(--red)' : 'var(--green)' }}>{m.stock}</span>
                {m.stock < 20 && <Badge label="bajo" variant="red" />}
              </div>,
              fmt(m.precio_unit),
              <Badge label={m.activo ? 'Activo' : 'Inactivo'} variant={m.activo ? 'green' : 'gray'} />,
              ...(can('ADMIN') ? [
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(m)}>Editar</Btn>
                  {(can('ADMIN')) && (
                    m.activo
                      ? <Btn size="sm" variant="danger" onClick={() => handleToggle(m)}>Desactivar</Btn>
                      : <Btn size="sm" variant="secondary" onClick={() => handleToggle(m)}>Activar</Btn>
                  )}
                  {can('SUPERADMIN') && <Btn size="sm" variant="danger" onClick={() => handleEliminarMed(m)}>Eliminar</Btn>}
                </div>
              ] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Medicamento' : 'Nuevo Medicamento'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nombre *" value={form.nombre} error={errors.nombre} maxLength={150} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Amoxicilina 500mg" />
            <FormRow>
              <FormCol><Input label="Principio activo" value={form.principio_act} maxLength={150} onChange={e => set('principio_act', e.target.value)} placeholder="Ej: Amoxicilina" /></FormCol>
              <FormCol><Input label="Presentación" value={form.presentacion} maxLength={80} onChange={e => set('presentacion', e.target.value)} placeholder="Cápsulas, Inyectable…" /></FormCol>
            </FormRow>
            <FormRow>
              <FormCol><Input label="Stock" value={form.stock} error={errors.stock} allowPattern={PATTERNS.soloNumeros} maxLength={6} onChange={e => set('stock', e.target.value)} placeholder="0" /></FormCol>
              <FormCol><Input label="Precio unitario (COP) *" value={form.precio_unit} error={errors.precio_unit} allowPattern={PATTERNS.soloNumeros} maxLength={10} onChange={e => set('precio_unit', e.target.value)} placeholder="15000" /></FormCol>
            </FormRow>
            {editing && <Select label="Estado" value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </Select>}
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

/* ── FACTURAS ────────────────────────────────────────────────── */
export function FacturasPage() {
  const { can } = useAuth()
  const isSuper  = can('SUPERADMIN')
  const canEdit  = can('ADMIN')   // ADMIN y SUPERADMIN pueden crear/editar
  const { data, loading, refetch } = useFetch('/facturas')
  const { data: citas } = useFetch(canEdit ? '/citas' : null, [canEdit])

  const EMPTY_F = { id_cita: '', subtotal: '', descuento_pct: '0', metodo_pago: '', pagado: 'false' }
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [form,      setForm]      = useState({ ...EMPTY_F })
  const [errors,    setErrors]    = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const openCreate = () => {
    setEditing(null); setForm({ ...EMPTY_F }); setErrors({}); setApiError(''); setShowModal(true)
  }
  const openEdit = (f) => {
    setEditing(f)
    setForm({
      id_cita:       String(f.id_cita),
      subtotal:      String(f.subtotal),
      descuento_pct: String(f.descuento_pct ?? 0),
      metodo_pago:   f.metodo_pago ?? '',
      pagado:        String(f.pagado),
    })
    setErrors({}); setApiError(''); setShowModal(true)
  }

  const handleSave = async () => {
    const errs = {}
    if (!form.subtotal || isNaN(Number(form.subtotal)) || Number(form.subtotal) < 0) errs.subtotal = 'Subtotal inválido'
    if (!editing && !form.id_cita) errs.id_cita = 'Selecciona una cita'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    const body = {
      id_cita:       editing ? undefined : Number(form.id_cita),
      subtotal:      Number(form.subtotal),
      descuento_pct: Number(form.descuento_pct || 0),
      metodo_pago:   form.metodo_pago || null,
      pagado:        form.pagado === 'true',
    }
    try {
      editing
        ? await api.put(`/facturas/${editing.id_factura}`, body)
        : await api.post('/facturas', body)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (f) => {
    if (!confirm(`⚠ ELIMINAR la factura #${f.id_factura} de "${f.mascota_nombre}"?\n\nEsta acción NO se puede deshacer.`)) return
    try { await api.del(`/facturas/${f.id_factura}`); refetch() }
    catch (e) { alert(e.message) }
  }

  // Citas sin factura (para el selector al crear)
  // Citas atendidas que aún no tienen factura
  const citasSinFactura = (citas ?? []).filter(c =>
    c.estado === 'ATENDIDA' &&
    !(data ?? []).some(f => Number(f.id_cita) === Number(c.id_cita))
  )

  return (
    <div className="fade-in">
      <PageHeader title="Facturas" action={
        canEdit ? <Btn onClick={openCreate}>+ Nueva factura</Btn> : null
      } />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['#', 'Mascota', 'Propietario', 'Veterinario', 'Fecha', 'Subtotal', 'Desc.', 'Total', 'Método', 'Estado', ...(canEdit ? ['Acciones'] : [])]}
            rows={(data ?? []).map(f => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>#{f.id_factura}</span>,
              f.mascota_nombre, f.propietario, f.veterinario,
              new Date(f.fecha_emision).toLocaleDateString('es-CO'),
              fmt(f.subtotal),
              f.descuento_pct > 0 ? `${f.descuento_pct}%` : '—',
              <strong>{fmt(f.total)}</strong>,
              f.metodo_pago ?? '—',
              <Badge label={f.pagado ? 'Pagado' : 'Pendiente'} variant={f.pagado ? 'green' : 'yellow'} />,
              ...(canEdit ? [
                <div style={{ display: 'flex', gap: 4 }}>
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(f)}>Editar</Btn>
                  {isSuper && <Btn size="sm" variant="danger" onClick={() => handleDelete(f)}>🗑 Eliminar</Btn>}
                </div>
              ] : []),
            ])}
          />
        )}
      </Card>

      {showModal && (
        <Modal title={editing ? `Editar Factura #${editing.id_factura}` : 'Nueva Factura'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!editing && (
              <Select label="Cita *" value={form.id_cita} error={errors.id_cita} onChange={e => set('id_cita', e.target.value)}>
                <option value="">Seleccionar cita atendida…</option>
                {citasSinFactura.map(c => (
                  <option key={c.id_cita} value={c.id_cita}>
                    #{c.id_cita} — {c.mascota_nombre} ({c.propietario_nombre}) — {new Date(c.fecha_hora).toLocaleDateString('es-CO')}
                  </option>
                ))}
              {citasSinFactura.length === 0 && (
                <option disabled value="">No hay citas atendidas sin factura</option>
              )}
              </Select>
            )}
            <Input
              label="Subtotal (COP) *" value={form.subtotal} error={errors.subtotal}
              allowPattern={PATTERNS.soloNumeros} maxLength={12}
              onChange={e => set('subtotal', e.target.value)} placeholder="Ej: 80000"
            />
            <FormRow>
              <FormCol>
                <Input
                  label="Descuento (%)" value={form.descuento_pct}
                  allowPattern={PATTERNS.soloNumeros} maxLength={3}
                  onChange={e => { const v = e.target.value; if (Number(v) > 100) return; set('descuento_pct', v) }}
                  placeholder="0"
                />
              </FormCol>
              <FormCol>
                <Select label="Método de pago" value={form.metodo_pago} onChange={e => set('metodo_pago', e.target.value)}>
                  <option value="">Sin registrar</option>
                  {['EFECTIVO','TARJETA','TRANSFERENCIA','NEQUI'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </FormCol>
            </FormRow>
            <Select label="Estado de pago" value={form.pagado} onChange={e => set('pagado', e.target.value)}>
              <option value="false">Pendiente</option>
              <option value="true">Pagado</option>
            </Select>

            {/* Vista previa del total */}
            {form.subtotal && !isNaN(Number(form.subtotal)) && (
              <div style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13 }}>
                <span style={{ color: 'var(--ink-muted)' }}>Total con descuento: </span>
                <strong style={{ color: 'var(--ink)' }}>
                  {fmt(Number(form.subtotal) * (1 - Number(form.descuento_pct || 0) / 100))}
                </strong>
              </div>
            )}

            {apiError && <Alert message={apiError} />}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Btn>
              <Btn onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : editing ? 'Actualizar' : 'Crear factura'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── USUARIOS (SUPERADMIN) ───────────────────────────────────── */
const USR_SCHEMA_CREATE = {
  username: [rules.required, rules.minLen(3), rules.maxLen(60)],
  email:    [rules.emailRequerido],
  password: [rules.password],
  rol:      [rules.selectRequerido],
}
const USR_SCHEMA_EDIT = { rol: [rules.selectRequerido] }

export function UsuariosPage() {
  const { data, loading, refetch } = useFetch('/usuarios')
  const { data: veterinarios } = useFetch('/veterinarios')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const EMPTY = { username: '', email: '', password: '', rol: 'CONSULTA', id_veterinario: '', activo: 'true' }
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ username: u.username, email: u.email, password: '', rol: u.rol, id_veterinario: '', activo: String(u.activo) })
    setErrors({}); setApiError(''); setShowModal(true)
  }
  const handleSave = async () => {
    const errs = validate(form, editing ? USR_SCHEMA_EDIT : USR_SCHEMA_CREATE)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    try {
      if (editing) {
        await api.put(`/usuarios/${editing.id_usuario}`, { rol: form.rol, activo: form.activo === 'true', id_veterinario: form.id_veterinario ? Number(form.id_veterinario) : null })
      } else {
        await api.post('/usuarios', { username: form.username, email: form.email, password: form.password, rol: form.rol, id_veterinario: form.id_veterinario ? Number(form.id_veterinario) : null })
      }
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }
  const handleDelete = async (u) => {
    if (!confirm(`⚠ ELIMINAR permanentemente al usuario "${u.username}"?\n\nEsta acción NO se puede deshacer.`)) return
    try { await api.del(`/usuarios/${u.id_usuario}`); refetch() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Usuarios del Sistema" action={<Btn onClick={openCreate}>+ Nuevo usuario</Btn>} />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Username', 'Email', 'Rol', 'Veterinario', 'Estado', 'Creado', 'Acciones']}
            rows={(data ?? []).map(u => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.username}</span>,
              u.email,
              <Badge label={u.rol} variant={ROL_BADGE[u.rol] ?? 'gray'} />,
              u.veterinario ?? '—',
              <Badge label={u.activo ? 'Activo' : 'Inactivo'} variant={u.activo ? 'green' : 'gray'} />,
              new Date(u.creado_en).toLocaleDateString('es-CO'),
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" variant="secondary" onClick={() => openEdit(u)}>Editar</Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(u)}>Eliminar</Btn>
              </div>,
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? `Editar: ${editing.username}` : 'Nuevo Usuario'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!editing && <>
              <Input label="Username *" value={form.username} error={errors.username} maxLength={60} onChange={e => set('username', e.target.value)} placeholder="Ej: dr_carlos" />
              <Input label="Email *" type="email" value={form.email} error={errors.email} allowPattern={PATTERNS.email} maxLength={150} onChange={e => set('email', e.target.value)} placeholder="carlos@vetcore.com" />
              <Input label="Contraseña * (mín. 8 caracteres)" type="password" value={form.password} error={errors.password} maxLength={128} onChange={e => set('password', e.target.value)} />
            </>}
            <Select label="Rol *" value={form.rol} error={errors.rol} onChange={e => set('rol', e.target.value)}>
              {['SUPERADMIN', 'ADMIN', 'USUARIO', 'CONSULTA'].map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select label="Veterinario vinculado (opcional)" value={form.id_veterinario} onChange={e => set('id_veterinario', e.target.value)}>
              <option value="">Ninguno</option>
              {(veterinarios ?? []).map(v => <option key={v.id_veterinario} value={v.id_veterinario}>{v.nombres} {v.apellidos}</option>)}
            </Select>
            {editing && <Select label="Estado" value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </Select>}
            {apiError && <Alert message={apiError} />}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Btn>
              <Btn onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : editing ? 'Actualizar' : 'Crear usuario'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── CONSULTAS SQL ────────────────────────────────────────────── */
const QUERIES = [
  { label: 'Q1 — Historial clínico mascota ID 1',         sql: `SELECT m.nombre AS mascota, e.nombre AS especie, c.fecha_hora, c.motivo, c.estado, co.diagnostico, co.temperatura, co.peso_consulta, co.costo_consulta, v.nombres || ' ' || v.apellidos AS veterinario FROM citas c JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN especies e ON e.id_especie=m.id_especie JOIN veterinarios v ON v.id_veterinario=c.id_veterinario LEFT JOIN consultas co ON co.id_cita=c.id_cita WHERE m.id_mascota=1 ORDER BY c.fecha_hora DESC;` },
  { label: 'Q2 — Medicamentos en consulta ID 1',          sql: `SELECT med.nombre AS medicamento, med.presentacion, t.dosis, t.frecuencia, t.duracion_dias, t.cantidad FROM tratamientos t JOIN medicamentos med ON med.id_medicamento=t.id_medicamento WHERE t.id_consulta=1;` },
  { label: 'Q3 — Agenda de hoy',                          sql: `SELECT c.id_cita, c.fecha_hora, m.nombre AS mascota, e.nombre AS especie, p.nombres||' '||p.apellidos AS propietario, p.telefono, v.nombres||' '||v.apellidos AS veterinario, c.motivo, c.estado FROM citas c JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN especies e ON e.id_especie=m.id_especie JOIN propietarios p ON p.id_propietario=m.id_propietario JOIN veterinarios v ON v.id_veterinario=c.id_veterinario WHERE DATE(c.fecha_hora)=CURRENT_DATE ORDER BY c.fecha_hora;` },
  { label: 'Q4 — Ingresos totales por mes',               sql: `SELECT TO_CHAR(f.fecha_emision,'YYYY-MM') AS mes, COUNT(*) AS facturas, SUM(f.total) AS ingresos, SUM(CASE WHEN f.pagado THEN f.total ELSE 0 END) AS cobrado FROM facturas f GROUP BY 1 ORDER BY 1 DESC;` },
  { label: 'Q5 — Veterinario con más citas atendidas',    sql: `SELECT v.nombres||' '||v.apellidos AS veterinario, esp.nombre AS especialidad, COUNT(*) AS total_citas FROM citas c JOIN veterinarios v ON v.id_veterinario=c.id_veterinario JOIN especialidades esp ON esp.id_especialidad=v.id_especialidad WHERE c.estado='ATENDIDA' GROUP BY v.id_veterinario,esp.nombre ORDER BY total_citas DESC;` },
  { label: 'Q6 — Stock bajo mínimo (< 20)',               sql: `SELECT id_medicamento, nombre, presentacion, stock, precio_unit FROM medicamentos WHERE activo=TRUE AND stock<20 ORDER BY stock ASC;` },
  { label: 'Q7 — Mascotas por especie',                   sql: `SELECT e.nombre AS especie, COUNT(m.id_mascota) AS total FROM especies e LEFT JOIN mascotas m ON m.id_especie=e.id_especie AND m.activa=TRUE GROUP BY e.id_especie,e.nombre ORDER BY total DESC;` },
  { label: 'Q8 — Propietarios con sus mascotas',          sql: `SELECT p.nombres||' '||p.apellidos AS propietario, p.telefono, p.ciudad, STRING_AGG(m.nombre||' ('||e.nombre||')',', ') AS mascotas FROM propietarios p JOIN mascotas m ON m.id_propietario=p.id_propietario AND m.activa=TRUE JOIN especies e ON e.id_especie=m.id_especie GROUP BY p.id_propietario ORDER BY propietario;` },
  { label: 'Q9 — Citas pendientes próximos 7 días',       sql: `SELECT c.id_cita, c.fecha_hora, m.nombre AS mascota, p.nombres||' '||p.apellidos AS propietario, p.telefono, v.nombres||' '||v.apellidos AS veterinario, c.motivo FROM citas c JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN propietarios p ON p.id_propietario=m.id_propietario JOIN veterinarios v ON v.id_veterinario=c.id_veterinario WHERE c.estado='PENDIENTE' AND c.fecha_hora BETWEEN NOW() AND NOW()+INTERVAL '7 days' ORDER BY c.fecha_hora;` },
  { label: 'Q10 — Resumen financiero general',            sql: `SELECT COUNT(*) AS total_facturas, SUM(subtotal) AS subtotales, SUM(subtotal-total) AS descuentos, SUM(total) AS totales, SUM(CASE WHEN pagado THEN total ELSE 0 END) AS cobrado, SUM(CASE WHEN NOT pagado THEN total ELSE 0 END) AS pendiente, ROUND(AVG(total),2) AS ticket_promedio FROM facturas;` },
  { label: 'Q11 — Todas las citas con detalle',           sql: `SELECT c.id_cita, c.fecha_hora, c.estado, c.motivo, m.nombre AS mascota, e.nombre AS especie, p.nombres||' '||p.apellidos AS propietario, v.nombres||' '||v.apellidos AS veterinario, esp.nombre AS especialidad FROM citas c JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN especies e ON e.id_especie=m.id_especie JOIN propietarios p ON p.id_propietario=m.id_propietario JOIN veterinarios v ON v.id_veterinario=c.id_veterinario JOIN especialidades esp ON esp.id_especialidad=v.id_especialidad ORDER BY c.fecha_hora DESC;` },
  { label: 'Q12 — Todas las consultas médicas',           sql: `SELECT co.id_consulta, co.diagnostico, co.temperatura, co.peso_consulta, co.costo_consulta, m.nombre AS mascota, c.fecha_hora, v.nombres||' '||v.apellidos AS veterinario FROM consultas co JOIN citas c ON c.id_cita=co.id_cita JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN veterinarios v ON v.id_veterinario=c.id_veterinario ORDER BY c.fecha_hora DESC;` },
  { label: 'Q13 — Todos los tratamientos',                sql: `SELECT t.id_tratamiento, m.nombre AS mascota, med.nombre AS medicamento, t.dosis, t.frecuencia, t.duracion_dias, t.cantidad, c.fecha_hora FROM tratamientos t JOIN consultas co ON co.id_consulta=t.id_consulta JOIN citas c ON c.id_cita=co.id_cita JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN medicamentos med ON med.id_medicamento=t.id_medicamento ORDER BY c.fecha_hora DESC;` },
  { label: 'Q14 — Facturas pagadas vs pendientes',        sql: `SELECT pagado, COUNT(*) AS cantidad, SUM(total) AS total FROM facturas GROUP BY pagado;` },
  { label: 'Q15 — Mascotas sin citas en 30 días',         sql: `SELECT m.nombre, e.nombre AS especie, p.nombres||' '||p.apellidos AS propietario, p.telefono FROM mascotas m JOIN especies e ON e.id_especie=m.id_especie JOIN propietarios p ON p.id_propietario=m.id_propietario WHERE m.activa=TRUE AND m.id_mascota NOT IN (SELECT DISTINCT id_mascota FROM citas WHERE fecha_hora>=NOW()-INTERVAL '30 days') ORDER BY m.nombre;` },
  { label: 'Q16 — Propietarios con cantidad de mascotas', sql: `SELECT p.cedula, p.nombres||' '||p.apellidos AS propietario, p.ciudad, p.telefono, COUNT(m.id_mascota) AS total_mascotas FROM propietarios p LEFT JOIN mascotas m ON m.id_propietario=p.id_propietario AND m.activa=TRUE GROUP BY p.id_propietario ORDER BY total_mascotas DESC;` },
  { label: 'Q17 — Citas canceladas o no asistidas',       sql: `SELECT c.id_cita, c.fecha_hora, c.estado, m.nombre AS mascota, p.nombres||' '||p.apellidos AS propietario, v.nombres||' '||v.apellidos AS veterinario FROM citas c JOIN mascotas m ON m.id_mascota=c.id_mascota JOIN propietarios p ON p.id_propietario=m.id_propietario JOIN veterinarios v ON v.id_veterinario=c.id_veterinario WHERE c.estado IN ('CANCELADA','NO_ASISTIO') ORDER BY c.fecha_hora DESC;` },
  { label: 'Q18 — Medicamentos más recetados',            sql: `SELECT med.nombre, med.presentacion, COUNT(t.id_tratamiento) AS veces_recetado, SUM(t.cantidad) AS unidades_totales FROM tratamientos t JOIN medicamentos med ON med.id_medicamento=t.id_medicamento GROUP BY med.id_medicamento ORDER BY veces_recetado DESC;` },
  { label: 'Q19 — Listado de usuarios del sistema',       sql: `SELECT u.username, u.email, u.rol, u.activo, v.nombres||' '||v.apellidos AS veterinario_vinculado, u.creado_en FROM usuarios u LEFT JOIN veterinarios v ON v.id_veterinario=u.id_veterinario ORDER BY u.rol, u.username;` },
  { label: 'Q20 — Ingresos por veterinario',              sql: `SELECT v.nombres||' '||v.apellidos AS veterinario, COUNT(f.id_factura) AS facturas, SUM(f.total) AS ingresos_totales, SUM(CASE WHEN f.pagado THEN f.total ELSE 0 END) AS cobrado FROM facturas f JOIN citas c ON c.id_cita=f.id_cita JOIN veterinarios v ON v.id_veterinario=c.id_veterinario GROUP BY v.id_veterinario ORDER BY ingresos_totales DESC;` },
  // ── DEMOSTRACIÓN DE SEGURIDAD ──────────────────────────────
  { label: '🔒 DEMO — DROP TABLE mascotas (bloqueado)',   sql: `DROP TABLE mascotas;` },
  { label: '🔒 DEMO — DELETE FROM mascotas (bloqueado)',  sql: `DELETE FROM mascotas;` },
  { label: '🔒 DEMO — UPDATE mascotas (bloqueado)',       sql: `UPDATE mascotas SET nombre = 'hackeado';` },
  { label: '🔒 DEMO — TRUNCATE facturas (bloqueado)',     sql: `TRUNCATE TABLE facturas;` },
  { label: '🔒 DEMO — INSERT falso (bloqueado)',          sql: `INSERT INTO usuarios (username, email, password_hash, rol) VALUES ('hacker', 'h@h.com', '123', 'SUPERADMIN');` },
]

export function ConsultasSQLPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.rol === 'SUPERADMIN'
  const [sqlInput, setSqlInput] = useState('')
  const [results, setResults] = useState(null)
  const [columns, setColumns] = useState([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [activeQuery, setActiveQuery] = useState(null)
  const [search, setSearch] = useState('')
  const [rowsAffected, setRowsAffected] = useState(null)

  const runQuery = async (sql) => {
    if (!sql?.trim()) return
    setRunning(true); setError(''); setResults(null); setRowsAffected(null)
    try {
      const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'
      const token = localStorage.getItem('vetcore_token')
      const res = await fetch(`${BASE}/sql/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ sql }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? 'Error al ejecutar')
      const rows = json.data ?? []
      setResults(rows)
      setColumns(rows.length > 0 ? Object.keys(rows[0]) : [])
      if (json.rowsAffected !== undefined && rows.length === 0) setRowsAffected(json.rowsAffected)
    } catch (e) { setError(e.message) }
    finally { setRunning(false) }
  }

  const filtered = QUERIES.filter(q => q.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 20, height: 'calc(100vh - 80px)' }}>
      {/* Panel izquierdo */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Card style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>Consultas predefinidas</p>
          <SearchInput value={search} onChange={setSearch} placeholder="Filtrar…" />
        </Card>
        <Card style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtered.map((q) => {
            const idx = QUERIES.indexOf(q)
            const isDemo = q.label.startsWith('🔒')
            return (
              <button key={idx} onClick={() => { setSqlInput(q.sql); setActiveQuery(idx); runQuery(q.sql) }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 7, border: 'none',
                background: activeQuery === idx ? (isDemo ? 'var(--red-bg)' : 'var(--accent-light)') : 'transparent',
                color: activeQuery === idx ? (isDemo ? 'var(--red)' : 'var(--accent-dark)') : isDemo ? 'var(--red)' : 'var(--ink-soft)',
                fontSize: 12, cursor: 'pointer', marginBottom: 2,
                fontWeight: activeQuery === idx ? 600 : 400, transition: 'background .15s',
              }}
                onMouseEnter={e => { if (activeQuery !== idx) e.currentTarget.style.background = 'var(--surface-inset)' }}
                onMouseLeave={e => { if (activeQuery !== idx) e.currentTarget.style.background = 'transparent' }}
              >{q.label}</button>
            )
          })}
        </Card>
      </div>

      {/* Panel derecho */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Editor SQL</span>
              {isSuperAdmin && <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--purple-bg)', color: 'var(--purple)', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '.3px' }}>Modo SUPERADMIN — acceso total</span>}
            </div>
            <Btn onClick={() => runQuery(sqlInput)} disabled={running || !sqlInput.trim()}>
              {running ? '⏳ Ejecutando…' : '▶ Ejecutar'}
            </Btn>
          </div>
          <textarea
            value={sqlInput}
            onChange={e => setSqlInput(e.target.value)}
            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery(sqlInput) } }}
            placeholder={isSuperAdmin ? "Modo SUPERADMIN: puedes ejecutar SELECT, INSERT, UPDATE, DELETE, DROP… (Ctrl+Enter)" : "Solo SELECT permitido… (Ctrl+Enter para ejecutar)"}
            style={{ width: '100%', minHeight: 120, fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', resize: 'vertical', outline: 'none', background: '#0f172a', color: '#e2e8f0', lineHeight: 1.6 }}
          />
        </Card>

        {error && <Alert message={error} variant="red" />}

        {results !== null && (
          <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Resultados</span>
              <Badge label={`${results.length} fila${results.length !== 1 ? 's' : ''}`} variant="teal" />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {results.length === 0
                ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
                    {rowsAffected !== null
                      ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>✅ Operación ejecutada — {rowsAffected} fila(s) afectada(s)</span>
                      : 'La consulta no retornó resultados'}
                  </div>
                : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>{columns.map(c => <th key={c} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--ink-muted)', borderBottom: '1px solid var(--border)', background: 'var(--surface-raised)', whiteSpace: 'nowrap' }}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {results.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}>
                          {columns.map(col => {
                            const v = row[col]
                            let cell
                            if (v === null || v === undefined) cell = <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>null</span>
                            else if (typeof v === 'boolean') cell = <Badge label={String(v)} variant={v ? 'green' : 'red'} />
                            else if (typeof v === 'number') cell = <span style={{ fontFamily: 'var(--font-mono)' }}>{v.toLocaleString('es-CO')}</span>
                            else { const s = String(v); cell = s.match(/^\d{4}-\d{2}-\d{2}/) ? new Date(s).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : s }
                            return <td key={col} style={{ padding: '9px 12px', color: 'var(--ink-soft)', verticalAlign: 'middle' }}>{cell}</td>
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </Card>
        )}

        {results === null && !error && (
          <Card style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⌨</div>
              <p style={{ fontSize: 13 }}>Selecciona una consulta predefinida o escribe tu propio SQL</p>
              <p style={{ fontSize: 11, marginTop: 6 }}>Ctrl+Enter para ejecutar</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
