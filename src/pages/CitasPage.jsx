import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { validate, rules } from '../services/validation'
import { PageHeader, Card, Table, Badge, Btn, Modal, Input, Select, SearchInput, Spinner, Alert, ESTADO_BADGE } from '../components/ui'

const EMPTY = { id_mascota: '', id_veterinario: '', fecha_hora: '', motivo: '', observaciones: '' }

// Fecha mínima: hoy a las 00:00 en formato YYYY-MM-DDTHH:mm (para el atributo min del input)
const getTodayMin = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')
  const dd   = String(now.getDate()).padStart(2, '0')
  const hh   = String(now.getHours()).padStart(2, '0')
  const min  = String(now.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}
const SCHEMA = {
  id_mascota:     [rules.selectRequerido],
  id_veterinario: [rules.selectRequerido],
  fecha_hora: [
    rules.fechaHora,
    (v) => {
      if (!v) return ''
      const selected = new Date(v)
      const now      = new Date()
      if (selected <= now) return 'La fecha debe ser posterior a la fecha y hora actual'
      return ''
    },
  ],
}

export default function CitasPage() {
  const { user } = useAuth()
  const rol      = user?.rol ?? 'CONSULTA'
  const isSuper  = rol === 'SUPERADMIN'
  const isAdmin  = rol === 'ADMIN' || isSuper
  const isUsuario = rol === 'USUARIO'
  // CONSULTA puede ver pero no hacer nada
  const canWrite = isAdmin || isUsuario

  const [estado,    setEstado]    = useState('')
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [form,      setForm]      = useState({ ...EMPTY })
  const [errors,    setErrors]    = useState({})
  const [submitted, setSubmitted] = useState(false)

  // USUARIO → solo sus citas (filtramos por id_propietario del usuario si existe)
  // El backend necesita soporte para filtrar por propietario — usamos id del usuario
  const buildUrl = () => {
    const p = new URLSearchParams()
    if (estado)   p.set('estado', estado)
    // Para USUARIO: el backend filtra por id del usuario autenticado con ?mis_citas=true
    if (isUsuario) p.set('mis_citas', 'true')
    const q = p.toString()
    return `/citas${q ? `?${q}` : ''}`
  }

  const { data: citas,       loading,  refetch }   = useFetch(buildUrl(), [estado, rol])
  const { data: mascotas } = useFetch(isUsuario ? '/mascotas?activa=true&mis_mascotas=true' : '/mascotas?activa=true')
  const { data: veterinarios }                      = useFetch('/veterinarios')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const filtered = (citas ?? []).filter(c =>
    !search ||
    c.mascota_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.propietario_nombre?.toLowerCase().includes(search.toLowerCase())
  )

  const cambiarEstado = async (id, nuevoEstado) => {
    try { await api.patch(`/citas/${id}/estado`, { estado: nuevoEstado }); refetch() }
    catch (e) { alert(e.message) }
  }

  const handleCreate = async () => {
    setSubmitted(true)
    const errs = validate(form, SCHEMA)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    try {
      await api.post('/citas', { ...form, id_mascota: Number(form.id_mascota), id_veterinario: Number(form.id_veterinario) })
      setShowModal(false); setForm({ ...EMPTY }); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title={isUsuario ? 'Mis Citas' : 'Citas Médicas'} action={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!isUsuario && <SearchInput value={search} onChange={setSearch} placeholder="Mascota, propietario…" />}
          <select value={estado} onChange={e => setEstado(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }}>
            <option value="">Todos los estados</option>
            {['PENDIENTE','ATENDIDA','CANCELADA','NO_ASISTIO'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {canWrite && (
            <Btn onClick={() => { setErrors({}); setApiError(''); setSubmitted(false); setShowModal(true) }}>+ Nueva cita</Btn>
          )}
        </div>
      } />

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={[
              'Fecha', 'Mascota', 'Especie',
              ...(isUsuario ? [] : ['Propietario', 'Tel.']),
              'Veterinario', 'Motivo', 'Estado',
              ...(canWrite ? ['Acción'] : []),
            ]}
            rows={filtered.map(c => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {new Date(c.fecha_hora).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
              </span>,
              <strong>{c.mascota_nombre}</strong>,
              c.especie_nombre,
              ...(isUsuario ? [] : [c.propietario_nombre, c.propietario_telefono ?? '—']),
              c.veterinario_nombre, c.motivo ?? '—',
              <Badge label={c.estado} variant={ESTADO_BADGE[c.estado] ?? 'gray'} />,
              ...(canWrite ? [
                c.estado === 'PENDIENTE'
                  ? <div style={{ display: 'flex', gap: 4 }}>
                      {isAdmin && <Btn size="sm" variant="secondary" onClick={() => cambiarEstado(c.id_cita, 'ATENDIDA')}>Atendida</Btn>}
                      <Btn size="sm" variant="danger" onClick={() => cambiarEstado(c.id_cita, 'CANCELADA')}>Cancelar</Btn>
                    </div>
                  : <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>—</span>,
              ] : []),
            ])}
          />
        )}
      </Card>

      {showModal && (
        <Modal title="Nueva Cita" onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Mascota *" value={form.id_mascota} error={errors.id_mascota} onChange={e => set('id_mascota', e.target.value)}>
              <option value="">Seleccionar…</option>
              {(mascotas ?? []).map(m => <option key={m.id_mascota} value={m.id_mascota}>{m.nombre} — {m.propietario_nombre}</option>)}
            </Select>
            <Select label="Veterinario *" value={form.id_veterinario} error={errors.id_veterinario} onChange={e => set('id_veterinario', e.target.value)}>
              <option value="">Seleccionar…</option>
              {(veterinarios ?? []).map(v => <option key={v.id_veterinario} value={v.id_veterinario}>{v.nombres} {v.apellidos} — {v.especialidad_nombre}</option>)}
            </Select>
            <Input label="Fecha y hora *" type="datetime-local" value={form.fecha_hora} error={errors.fecha_hora} onChange={e => set('fecha_hora', e.target.value)} min={getTodayMin()} />
            <Input label="Motivo" value={form.motivo} maxLength={200} onChange={e => set('motivo', e.target.value)} placeholder="Vacunación, revisión general…" />
            <Input label="Observaciones" value={form.observaciones} maxLength={500} onChange={e => set('observaciones', e.target.value)} />
            {apiError && <Alert message={apiError} />}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Btn>
              <Btn onClick={handleCreate} disabled={saving}>{saving ? 'Guardando…' : 'Agendar cita'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
