import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import type { Veterinario, Medicamento, Factura, UsuarioAdmin, Especialidad, Especie } from '../types'
import { PageHeader, Card, Table, Badge, Btn, Modal, Input, Select, Spinner, Alert, ROL_BADGE, SearchInput } from '../components/ui'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// ── VETERINARIOS ─────────────────────────────────────────────
export function VeterinariosPage() {
  const { can } = useAuth()
  const { data, loading, refetch } = useFetch<Veterinario[]>('/veterinarios')
  const { data: especialidades } = useFetch<Especialidad[]>('/especialidades')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Veterinario | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const EMPTY = { cedula: '', nombres: '', apellidos: '', telefono: '', email: '', id_especialidad: '', activo: 'true' }
  const [form, setForm] = useState({ ...EMPTY })
  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setFormError(''); setShowModal(true) }
  const openEdit = (v: Veterinario) => {
    setEditing(v)
    setForm({ cedula: v.cedula, nombres: v.nombres, apellidos: v.apellidos, telefono: v.telefono ?? '', email: v.email, id_especialidad: String(v.id_especialidad), activo: String(v.activo) })
    setFormError(''); setShowModal(true)
  }
  const handleSave = async () => {
    if (!form.cedula || !form.nombres || !form.apellidos || !form.id_especialidad) { setFormError('Todos los campos marcados son obligatorios'); return }
    setSaving(true); setFormError('')
    const body = { ...form, id_especialidad: Number(form.id_especialidad), activo: form.activo === 'true' }
    try {
      editing ? await api.put(`/veterinarios/${editing.id_veterinario}`, body) : await api.post('/veterinarios', body)
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Veterinarios" action={can('ADMIN') && <Btn onClick={openCreate}>+ Nuevo veterinario</Btn>} />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Cédula', 'Nombre', 'Especialidad', 'Email', 'Teléfono', 'Estado', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(v => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v.cedula}</span>,
              <strong>{v.nombres} {v.apellidos}</strong>,
              v.especialidad_nombre, v.email, v.telefono ?? '—',
              <Badge label={v.activo ? 'Activo' : 'Inactivo'} variant={v.activo ? 'green' : 'gray'} />,
              ...(can('ADMIN') ? [<Btn size="sm" variant="secondary" onClick={() => openEdit(v)}>Editar</Btn>] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Veterinario' : 'Nuevo Veterinario'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Cédula *" value={form.cedula} onChange={e => set('cedula', e.target.value)} disabled={!!editing} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Nombres *" value={form.nombres} onChange={e => set('nombres', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Apellidos *" value={form.apellidos} onChange={e => set('apellidos', e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Teléfono" value={form.telefono} onChange={e => set('telefono', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            </div>
            <Select label="Especialidad *" value={form.id_especialidad} onChange={e => set('id_especialidad', e.target.value)}>
              <option value="">Seleccionar…</option>
              {(especialidades ?? []).map(e => <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre}</option>)}
            </Select>
            {editing && <Select label="Estado" value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </Select>}
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

// ── ESPECIALIDADES ────────────────────────────────────────────
export function EspecialidadesPage() {
  const { can } = useAuth()
  const { data, loading, refetch } = useFetch<Especialidad[]>('/especialidades')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Especialidad | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setFormError(''); setShowModal(true) }
  const openEdit = (e: Especialidad) => { setEditing(e); setForm({ nombre: e.nombre, descripcion: e.descripcion ?? '' }); setFormError(''); setShowModal(true) }
  const handleSave = async () => {
    if (!form.nombre) { setFormError('El nombre es obligatorio'); return }
    setSaving(true); setFormError('')
    try {
      editing ? await api.put(`/especialidades/${editing.id_especialidad}`, form) : await api.post('/especialidades', form)
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
  }
  const handleDelete = async (e: Especialidad) => {
    if (!confirm(`¿Eliminar especialidad "${e.nombre}"?`)) return
    try { await api.del(`/especialidades/${e.id_especialidad}`); refetch() }
    catch (err) { alert((err as Error).message) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Especialidades" action={can('ADMIN') && <Btn onClick={openCreate}>+ Nueva especialidad</Btn>} />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['ID', 'Nombre', 'Descripción', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(e => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{e.id_especialidad}</span>,
              <strong>{e.nombre}</strong>,
              e.descripcion ?? '—',
              ...(can('ADMIN') ? [<div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" variant="secondary" onClick={() => openEdit(e)}>Editar</Btn>
                {can('SUPERADMIN') && <Btn size="sm" variant="danger" onClick={() => handleDelete(e)}>Eliminar</Btn>}
              </div>] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Especialidad' : 'Nueva Especialidad'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Nombre *" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            <Input label="Descripción" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
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

// ── ESPECIES ──────────────────────────────────────────────────
export function EspeciesPage() {
  const { can } = useAuth()
  const { data, loading, refetch } = useFetch<Especie[]>('/especies')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Especie | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setFormError(''); setShowModal(true) }
  const openEdit = (e: Especie) => { setEditing(e); setForm({ nombre: e.nombre, descripcion: e.descripcion ?? '' }); setFormError(''); setShowModal(true) }
  const handleSave = async () => {
    if (!form.nombre) { setFormError('El nombre es obligatorio'); return }
    setSaving(true); setFormError('')
    try {
      editing ? await api.put(`/especies/${editing.id_especie}`, form) : await api.post('/especies', form)
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
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
              <strong>{e.nombre}</strong>,
              e.descripcion ?? '—',
              ...(can('ADMIN') ? [<Btn size="sm" variant="secondary" onClick={() => openEdit(e)}>Editar</Btn>] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Especie' : 'Nueva Especie'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Nombre *" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            <Input label="Descripción" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
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

// ── MEDICAMENTOS ─────────────────────────────────────────────
export function MedicamentosPage() {
  const { can } = useAuth()
  const { data, loading, refetch } = useFetch<Medicamento[]>('/medicamentos')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Medicamento | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const EMPTY = { nombre: '', principio_act: '', presentacion: '', stock: '', precio_unit: '', activo: 'true' }
  const [form, setForm] = useState({ ...EMPTY })
  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setFormError(''); setShowModal(true) }
  const openEdit = (m: Medicamento) => {
    setEditing(m)
    setForm({ nombre: m.nombre, principio_act: m.principio_act ?? '', presentacion: m.presentacion ?? '', stock: String(m.stock), precio_unit: String(m.precio_unit), activo: String(m.activo) })
    setFormError(''); setShowModal(true)
  }
  const handleSave = async () => {
    if (!form.nombre || !form.precio_unit) { setFormError('Nombre y precio son obligatorios'); return }
    setSaving(true); setFormError('')
    const body = { ...form, stock: Number(form.stock), precio_unit: Number(form.precio_unit), activo: form.activo === 'true' }
    try {
      editing ? await api.put(`/medicamentos/${editing.id_medicamento}`, body) : await api.post('/medicamentos', body)
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Medicamentos" action={can('ADMIN') && <Btn onClick={openCreate}>+ Nuevo medicamento</Btn>} />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Nombre', 'Principio activo', 'Presentación', 'Stock', 'Precio unit.', ...(can('ADMIN') ? ['Acciones'] : [])]}
            rows={(data ?? []).map(m => [
              <strong>{m.nombre}</strong>,
              m.principio_act ?? '—', m.presentacion ?? '—',
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: m.stock < 20 ? 'var(--red)' : 'var(--green)' }}>{m.stock}</span>
                {m.stock < 20 && <Badge label="bajo" variant="red" />}
              </div>,
              fmt(m.precio_unit),
              ...(can('ADMIN') ? [<Btn size="sm" variant="secondary" onClick={() => openEdit(m)}>Editar</Btn>] : []),
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? 'Editar Medicamento' : 'Nuevo Medicamento'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Nombre *" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Principio activo" value={form.principio_act} onChange={e => set('principio_act', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Presentación" value={form.presentacion} onChange={e => set('presentacion', e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Stock" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} /></div>
              <div style={{ flex: 1 }}><Input label="Precio unitario *" type="number" value={form.precio_unit} onChange={e => set('precio_unit', e.target.value)} /></div>
            </div>
            {editing && <Select label="Estado" value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </Select>}
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

// ── FACTURAS ─────────────────────────────────────────────────
export function FacturasPage() {
  const { data, loading } = useFetch<Factura[]>('/facturas')
  return (
    <div className="fade-in">
      <PageHeader title="Facturas" />
      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['#', 'Mascota', 'Propietario', 'Veterinario', 'Fecha', 'Subtotal', 'Desc.', 'Total', 'Método', 'Estado']}
            rows={(data ?? []).map(f => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>#{f.id_factura}</span>,
              f.mascota_nombre, f.propietario, f.veterinario,
              new Date(f.fecha_emision).toLocaleDateString('es-CO'),
              fmt(f.subtotal),
              f.descuento_pct > 0 ? `${f.descuento_pct}%` : '—',
              <strong>{fmt(f.total)}</strong>,
              f.metodo_pago ?? '—',
              <Badge label={f.pagado ? 'Pagado' : 'Pendiente'} variant={f.pagado ? 'green' : 'yellow'} />,
            ])}
          />
        )}
      </Card>
    </div>
  )
}

// ── USUARIOS ─────────────────────────────────────────────────
export function UsuariosPage() {
  const { data, loading, refetch } = useFetch<UsuarioAdmin[]>('/usuarios')
  const { data: veterinarios } = useFetch<Veterinario[]>('/veterinarios')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<UsuarioAdmin | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const EMPTY = { username: '', email: '', password: '', rol: 'CONSULTA', id_veterinario: '', activo: 'true' }
  const [form, setForm] = useState({ ...EMPTY })
  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), [])

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setFormError(''); setShowModal(true) }
  const openEdit = (u: UsuarioAdmin) => {
    setEditing(u)
    setForm({ username: u.username, email: u.email, password: '', rol: u.rol, id_veterinario: '', activo: String(u.activo) })
    setFormError(''); setShowModal(true)
  }
  const handleSave = async () => {
    if (!editing && (!form.username || !form.email || !form.password)) { setFormError('Username, email y contraseña son obligatorios'); return }
    setSaving(true); setFormError('')
    try {
      if (editing) {
        await api.put(`/usuarios/${editing.id_usuario}`, { rol: form.rol, activo: form.activo === 'true', id_veterinario: form.id_veterinario ? Number(form.id_veterinario) : null })
      } else {
        await api.post('/usuarios', { ...form, id_veterinario: form.id_veterinario ? Number(form.id_veterinario) : null })
      }
      setShowModal(false); refetch()
    } catch (e) { setFormError((e as Error).message) }
    finally { setSaving(false) }
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
              <Badge label={u.rol} variant={ROL_BADGE[u.rol]} />,
              u.veterinario ?? '—',
              <Badge label={u.activo ? 'Activo' : 'Inactivo'} variant={u.activo ? 'green' : 'gray'} />,
              new Date(u.creado_en).toLocaleDateString('es-CO'),
              <Btn size="sm" variant="secondary" onClick={() => openEdit(u)}>Editar</Btn>,
            ])}
          />
        )}
      </Card>
      {showModal && (
        <Modal title={editing ? `Editar: ${editing.username}` : 'Nuevo Usuario'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {!editing && <>
              <Input label="Username *" value={form.username} onChange={e => set('username', e.target.value)} />
              <Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              <Input label="Contraseña *" type="password" value={form.password} onChange={e => set('password', e.target.value)} />
            </>}
            <Select label="Rol" value={form.rol} onChange={e => set('rol', e.target.value)}>
              {['SUPERADMIN', 'ADMIN', 'USUARIO', 'CONSULTA'].map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select label="Veterinario vinculado" value={form.id_veterinario} onChange={e => set('id_veterinario', e.target.value)}>
              <option value="">Ninguno</option>
              {(veterinarios ?? []).map(v => <option key={v.id_veterinario} value={v.id_veterinario}>{v.nombres} {v.apellidos}</option>)}
            </Select>
            {editing && <Select label="Estado" value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </Select>}
            {formError && <Alert message={formError} />}
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

// ── CONSULTAS SQL ─────────────────────────────────────────────
const QUERIES_PREDEFINIDAS = [
  { label: 'Q1 — Historial clínico de mascota ID 1', sql: `SELECT m.nombre AS mascota, e.nombre AS especie, c.fecha_hora, c.motivo, c.estado, co.diagnostico, co.temperatura, co.peso_consulta, co.costo_consulta, v.nombres || ' ' || v.apellidos AS veterinario FROM citas c JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN especies e ON e.id_especie = m.id_especie JOIN veterinarios v ON v.id_veterinario = c.id_veterinario LEFT JOIN consultas co ON co.id_cita = c.id_cita WHERE m.id_mascota = 1 ORDER BY c.fecha_hora DESC;` },
  { label: 'Q2 — Medicamentos recetados en consulta ID 1', sql: `SELECT med.nombre AS medicamento, med.presentacion, t.dosis, t.frecuencia, t.duracion_dias, t.cantidad FROM tratamientos t JOIN medicamentos med ON med.id_medicamento = t.id_medicamento WHERE t.id_consulta = 1;` },
  { label: 'Q3 — Agenda del día de hoy', sql: `SELECT c.id_cita, c.fecha_hora, m.nombre AS mascota, e.nombre AS especie, p.nombres || ' ' || p.apellidos AS propietario, p.telefono, v.nombres || ' ' || v.apellidos AS veterinario, c.motivo, c.estado FROM citas c JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN especies e ON e.id_especie = m.id_especie JOIN propietarios p ON p.id_propietario = m.id_propietario JOIN veterinarios v ON v.id_veterinario = c.id_veterinario WHERE DATE(c.fecha_hora) = CURRENT_DATE ORDER BY c.fecha_hora;` },
  { label: 'Q4 — Ingresos totales por mes', sql: `SELECT TO_CHAR(f.fecha_emision, 'YYYY-MM') AS mes, COUNT(*) AS facturas, SUM(f.total) AS ingresos_totales, SUM(CASE WHEN f.pagado THEN f.total ELSE 0 END) AS cobrado FROM facturas f GROUP BY 1 ORDER BY 1 DESC;` },
  { label: 'Q5 — Veterinario con más citas atendidas', sql: `SELECT v.nombres || ' ' || v.apellidos AS veterinario, esp.nombre AS especialidad, COUNT(c.id_cita) AS total_citas FROM citas c JOIN veterinarios v ON v.id_veterinario = c.id_veterinario JOIN especialidades esp ON esp.id_especialidad = v.id_especialidad WHERE c.estado = 'ATENDIDA' GROUP BY v.id_veterinario, esp.nombre ORDER BY total_citas DESC;` },
  { label: 'Q6 — Inventario bajo mínimo (stock < 20)', sql: `SELECT id_medicamento, nombre, presentacion, stock, precio_unit FROM medicamentos WHERE activo = TRUE AND stock < 20 ORDER BY stock ASC;` },
  { label: 'Q7 — Mascotas por especie', sql: `SELECT e.nombre AS especie, COUNT(m.id_mascota) AS total FROM especies e LEFT JOIN mascotas m ON m.id_especie = e.id_especie AND m.activa = TRUE GROUP BY e.id_especie, e.nombre ORDER BY total DESC;` },
  { label: 'Q8 — Propietarios con sus mascotas activas', sql: `SELECT p.nombres || ' ' || p.apellidos AS propietario, p.telefono, p.ciudad, STRING_AGG(m.nombre || ' (' || e.nombre || ')', ', ') AS mascotas FROM propietarios p JOIN mascotas m ON m.id_propietario = p.id_propietario AND m.activa = TRUE JOIN especies e ON e.id_especie = m.id_especie GROUP BY p.id_propietario ORDER BY propietario;` },
  { label: 'Q9 — Citas pendientes próximos 7 días', sql: `SELECT c.id_cita, c.fecha_hora, m.nombre AS mascota, p.nombres || ' ' || p.apellidos AS propietario, p.telefono, v.nombres || ' ' || v.apellidos AS veterinario, c.motivo FROM citas c JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN propietarios p ON p.id_propietario = m.id_propietario JOIN veterinarios v ON v.id_veterinario = c.id_veterinario WHERE c.estado = 'PENDIENTE' AND c.fecha_hora BETWEEN NOW() AND NOW() + INTERVAL '7 days' ORDER BY c.fecha_hora;` },
  { label: 'Q10 — Resumen financiero general', sql: `SELECT COUNT(*) AS total_facturas, SUM(subtotal) AS suma_subtotales, SUM(subtotal - total) AS total_descuentos, SUM(total) AS suma_totales, SUM(CASE WHEN pagado THEN total ELSE 0 END) AS total_cobrado, SUM(CASE WHEN NOT pagado THEN total ELSE 0 END) AS total_pendiente, ROUND(AVG(total), 2) AS ticket_promedio FROM facturas;` },
  { label: 'Q11 — Todas las citas con detalle completo', sql: `SELECT c.id_cita, c.fecha_hora, c.estado, c.motivo, m.nombre AS mascota, e.nombre AS especie, p.nombres || ' ' || p.apellidos AS propietario, v.nombres || ' ' || v.apellidos AS veterinario, esp.nombre AS especialidad FROM citas c JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN especies e ON e.id_especie = m.id_especie JOIN propietarios p ON p.id_propietario = m.id_propietario JOIN veterinarios v ON v.id_veterinario = c.id_veterinario JOIN especialidades esp ON esp.id_especialidad = v.id_especialidad ORDER BY c.fecha_hora DESC;` },
  { label: 'Q12 — Todas las consultas médicas', sql: `SELECT co.id_consulta, co.diagnostico, co.temperatura, co.peso_consulta, co.costo_consulta, co.proxima_cita, m.nombre AS mascota, c.fecha_hora, v.nombres || ' ' || v.apellidos AS veterinario FROM consultas co JOIN citas c ON c.id_cita = co.id_cita JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN veterinarios v ON v.id_veterinario = c.id_veterinario ORDER BY c.fecha_hora DESC;` },
  { label: 'Q13 — Todos los tratamientos con medicamentos', sql: `SELECT t.id_tratamiento, m.nombre AS mascota, med.nombre AS medicamento, t.dosis, t.frecuencia, t.duracion_dias, t.cantidad, c.fecha_hora FROM tratamientos t JOIN consultas co ON co.id_consulta = t.id_consulta JOIN citas c ON c.id_cita = co.id_cita JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN medicamentos med ON med.id_medicamento = t.id_medicamento ORDER BY c.fecha_hora DESC;` },
  { label: 'Q14 — Facturas pagadas vs pendientes', sql: `SELECT pagado, COUNT(*) AS cantidad, SUM(total) AS total FROM facturas GROUP BY pagado;` },
  { label: 'Q15 — Mascotas sin citas en los últimos 30 días', sql: `SELECT m.nombre, e.nombre AS especie, p.nombres || ' ' || p.apellidos AS propietario, p.telefono FROM mascotas m JOIN especies e ON e.id_especie = m.id_especie JOIN propietarios p ON p.id_propietario = m.id_propietario WHERE m.activa = TRUE AND m.id_mascota NOT IN (SELECT DISTINCT id_mascota FROM citas WHERE fecha_hora >= NOW() - INTERVAL '30 days') ORDER BY m.nombre;` },
  { label: 'Q16 — Todos los propietarios con cantidad de mascotas', sql: `SELECT p.cedula, p.nombres || ' ' || p.apellidos AS propietario, p.ciudad, p.telefono, COUNT(m.id_mascota) AS total_mascotas FROM propietarios p LEFT JOIN mascotas m ON m.id_propietario = p.id_propietario AND m.activa = TRUE GROUP BY p.id_propietario ORDER BY total_mascotas DESC;` },
  { label: 'Q17 — Citas canceladas o no asistidas', sql: `SELECT c.id_cita, c.fecha_hora, c.estado, m.nombre AS mascota, p.nombres || ' ' || p.apellidos AS propietario, v.nombres || ' ' || v.apellidos AS veterinario FROM citas c JOIN mascotas m ON m.id_mascota = c.id_mascota JOIN propietarios p ON p.id_propietario = m.id_propietario JOIN veterinarios v ON v.id_veterinario = c.id_veterinario WHERE c.estado IN ('CANCELADA','NO_ASISTIO') ORDER BY c.fecha_hora DESC;` },
  { label: 'Q18 — Uso de medicamentos (más recetados)', sql: `SELECT med.nombre, med.presentacion, COUNT(t.id_tratamiento) AS veces_recetado, SUM(t.cantidad) AS unidades_totales FROM tratamientos t JOIN medicamentos med ON med.id_medicamento = t.id_medicamento GROUP BY med.id_medicamento ORDER BY veces_recetado DESC;` },
  { label: 'Q19 — Listado completo de usuarios del sistema', sql: `SELECT u.username, u.email, u.rol, u.activo, v.nombres || ' ' || v.apellidos AS veterinario_vinculado, u.creado_en FROM usuarios u LEFT JOIN veterinarios v ON v.id_veterinario = u.id_veterinario ORDER BY u.rol, u.username;` },
  { label: 'Q20 — Ingresos por veterinario', sql: `SELECT v.nombres || ' ' || v.apellidos AS veterinario, COUNT(f.id_factura) AS facturas, SUM(f.total) AS ingresos_totales, SUM(CASE WHEN f.pagado THEN f.total ELSE 0 END) AS cobrado FROM facturas f JOIN citas c ON c.id_cita = f.id_cita JOIN veterinarios v ON v.id_veterinario = c.id_veterinario GROUP BY v.id_veterinario ORDER BY ingresos_totales DESC;` },
]

export function ConsultasSQLPage() {
  const [sqlInput, setSqlInput] = useState('')
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [activeQuery, setActiveQuery] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const runQuery = async (sql: string) => {
    if (!sql.trim()) return
    setRunning(true); setError(''); setResults(null)
    try {
      const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'
      const token = localStorage.getItem('vetcore_token')
      const res = await fetch(`${BASE}/sql/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ sql }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? 'Error ejecutando consulta')
      const rows: Record<string, unknown>[] = json.data ?? []
      setResults(rows)
      setColumns(rows.length > 0 ? Object.keys(rows[0]) : [])
    } catch (e) { setError((e as Error).message) }
    finally { setRunning(false) }
  }

  const filteredQueries = QUERIES_PREDEFINIDAS.filter(q =>
    q.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 20, height: 'calc(100vh - 80px)' }}>
      {/* Panel izquierdo: consultas predefinidas */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Card style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>
            20 Consultas predefinidas
          </p>
          <SearchInput value={search} onChange={setSearch} placeholder="Filtrar consultas…" />
        </Card>
        <Card style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredQueries.map((q, i) => {
            const idx = QUERIES_PREDEFINIDAS.indexOf(q)
            return (
              <button key={idx} onClick={() => { setSqlInput(q.sql); setActiveQuery(idx); runQuery(q.sql) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 10px', borderRadius: 7, border: 'none',
                  background: activeQuery === idx ? 'var(--accent-light)' : 'transparent',
                  color: activeQuery === idx ? 'var(--accent-dark)' : 'var(--ink-soft)',
                  fontSize: 12, cursor: 'pointer', marginBottom: 2,
                  fontWeight: activeQuery === idx ? 600 : 400,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => { if (activeQuery !== idx) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-inset)' }}
                onMouseLeave={e => { if (activeQuery !== idx) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {q.label}
              </button>
            )
          })}
        </Card>
      </div>

      {/* Panel derecho: editor + resultados */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Editor SQL</span>
            <Btn onClick={() => runQuery(sqlInput)} disabled={running || !sqlInput.trim()}>
              {running ? '⏳ Ejecutando…' : '▶ Ejecutar'}
            </Btn>
          </div>
          <textarea
            value={sqlInput}
            onChange={e => setSqlInput(e.target.value)}
            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery(sqlInput) } }}
            placeholder="Escribe tu consulta SQL aquí… (Ctrl+Enter para ejecutar)"
            style={{
              width: '100%', minHeight: 120, fontFamily: 'var(--font-mono)',
              fontSize: 12, padding: '10px 12px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', resize: 'vertical', outline: 'none',
              background: '#0f172a', color: '#e2e8f0', lineHeight: 1.6,
            }}
          />
        </Card>

        {error && <Alert message={error} variant="red" />}

        {results !== null && (
          <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                Resultados
              </span>
              <Badge label={`${results.length} fila${results.length !== 1 ? 's' : ''}`} variant="teal" />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {results.length === 0
                ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>La consulta no retornó resultados</div>
                : <Table
                    headers={columns}
                    rows={results.map(row =>
                      columns.map(col => {
                        const v = row[col]
                        if (v === null || v === undefined) return <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>null</span>
                        if (typeof v === 'boolean') return <Badge label={String(v)} variant={v ? 'green' : 'red'} />
                        if (typeof v === 'number') return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v.toLocaleString('es-CO')}</span>
                        const s = String(v)
                        if (s.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(s).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                        return s
                      })
                    )}
                  />
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
