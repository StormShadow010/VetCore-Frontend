import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { validate, rules } from '../services/validation'
import { PageHeader, Card, Table, Badge, Btn, Modal, Input, Select, SearchInput, Spinner, Alert, FormRow, FormCol, PATTERNS } from '../components/ui'

const SCHEMA_BASE = {
  nombre:     [rules.required, rules.minLen(2), rules.maxLen(80)],
  id_especie: [rules.selectRequerido],
  peso_kg: [(v) => {
    if (!v || v === '') return ''
    const n = parseFloat(v)
    if (isNaN(n)) return 'Debe ser un número válido'
    if (n <= 0)   return 'El peso debe ser mayor a 0'
    return ''
  }],
}
const SCHEMA_ADMIN = { ...SCHEMA_BASE, id_propietario: [rules.selectRequerido] }

export default function MascotasPage() {
  const { user } = useAuth()
  const rol      = user?.rol ?? 'CONSULTA'
  const isSuper  = rol === 'SUPERADMIN'
  const isAdmin  = rol === 'ADMIN' || isSuper
  const isUsuario = rol === 'USUARIO'
  const canWrite  = isAdmin || isUsuario

  const [search,    setSearch]    = useState('')
  const [filtro,    setFiltro]    = useState('todas')
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError,  setApiError]  = useState('')
  const [form,      setForm]      = useState({ nombre: '', id_especie: '', raza: '', sexo: 'M', peso_kg: '', color: '' })
  const [errors,    setErrors]    = useState({})

  const buildUrl = () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (isUsuario) {
      p.set('activa', 'true')
      p.set('mis_mascotas', 'true')
    } else {
      p.set('activa', filtro)
    }
    return `/mascotas?${p.toString()}`
  }

  const { data: mascotas, loading, refetch } = useFetch(buildUrl(), [search, filtro, rol])
  const { data: especies }     = useFetch('/especies')
  // Admin/Super necesitan lista de propietarios; USUARIO no
  const { data: propietarios } = useFetch(isAdmin ? '/propietarios' : null, [isAdmin])

  const EMPTY = { nombre: '', id_especie: '', raza: '', sexo: 'M', peso_kg: '', color: '', ...(isAdmin ? { id_propietario: '' } : {}) }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: '', id_especie: '', raza: '', sexo: 'M', peso_kg: '', color: '', ...(isAdmin ? { id_propietario: '' } : {}) })
    setErrors({}); setApiError(''); setSubmitted(false); setShowModal(true)
  }
  const openEdit = (m) => {
    setEditing(m)
    setForm({
      nombre: m.nombre, id_especie: String(m.id_especie),
      raza: m.raza ?? '', sexo: m.sexo,
      peso_kg: m.peso_kg ? String(m.peso_kg) : '',
      color: m.color ?? '',
      ...(isAdmin ? { id_propietario: String(m.id_propietario) } : {}),
    })
    setErrors({}); setApiError(''); setSubmitted(false); setShowModal(true)
  }

  const handleSave = async () => {
    setSubmitted(true)
    const schema = isAdmin ? SCHEMA_ADMIN : SCHEMA_BASE
    const errs = validate(form, schema)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')

    const body = {
      nombre:     form.nombre,
      id_especie: Number(form.id_especie),
      raza:       form.raza || null,
      sexo:       form.sexo,
      peso_kg:    form.peso_kg ? Number(form.peso_kg) : null,
      color:      form.color || null,
      // USUARIO: el backend busca el propietario vinculado a su email
      // ADMIN: usa el propietario seleccionado
      ...(isAdmin ? { id_propietario: Number(form.id_propietario) } : {}),
    }
    try {
      editing ? await api.put(`/mascotas/${editing.id_mascota}`, body) : await api.post('/mascotas', body)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }

  const handleDesactivar = async (m) => {
    if (!confirm(`¿Desactivar a "${m.nombre}"?\nSeguirá visible con estado Inactiva.`)) return
    try { await api.patch(`/mascotas/${m.id_mascota}/desactivar`, {}); refetch() }
    catch (e) { alert(e.message) }
  }
  const handleActivar = async (m) => {
    if (!confirm(`¿Reactivar a "${m.nombre}"?`)) return
    try { await api.patch(`/mascotas/${m.id_mascota}/activar`, {}); refetch() }
    catch (e) { alert(e.message) }
  }
  const handleEliminar = async (m) => {
    if (!confirm(`⚠ ELIMINAR permanentemente a "${m.nombre}".\n\nEsta acción NO se puede deshacer.`)) return
    try { await api.del(`/mascotas/${m.id_mascota}`); refetch() }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title={isUsuario ? 'Mis Mascotas' : 'Mascotas'}
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar…" />
            {isAdmin && (
              <select value={filtro} onChange={e => setFiltro(e.target.value)}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }}>
                <option value="todas">Todas</option>
                <option value="true">Activas</option>
                <option value="false">Inactivas</option>
              </select>
            )}
            {canWrite && <Btn onClick={openCreate}>+ Nueva mascota</Btn>}
          </div>
        }
      />

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={[
              'Nombre', 'Especie', 'Raza', 'Sexo', 'Peso', 'Color',
              ...(isAdmin ? ['Propietario', 'Tel.'] : []),
              ...(isAdmin ? ['Estado', 'Acciones'] : []),
            ]}
            rows={(mascotas ?? []).map(m => {
              const activa = m.activa !== false
              return [
                <strong style={{ opacity: activa ? 1 : 0.5 }}>{m.nombre}</strong>,
                m.especie_nombre,
                m.raza ?? '—',
                <Badge label={m.sexo === 'M' ? 'Macho' : 'Hembra'} variant={m.sexo === 'M' ? 'blue' : 'purple'} />,
                m.peso_kg ? `${m.peso_kg} kg` : '—',
                m.color ?? '—',
                ...(isAdmin ? [m.propietario_nombre, m.propietario_telefono ?? '—'] : []),
                ...(isAdmin ? [
                  <Badge label={activa ? 'Activa' : 'Inactiva'} variant={activa ? 'green' : 'gray'} />,
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn size="sm" variant="secondary" onClick={() => openEdit(m)}>Editar</Btn>
                    {activa
                      ? <Btn size="sm" variant="danger" onClick={() => handleDesactivar(m)}>Desactivar</Btn>
                      : <Btn size="sm" variant="secondary" onClick={() => handleActivar(m)}>Activar</Btn>}
                    {isSuper && <Btn size="sm" variant="danger" onClick={() => handleEliminar(m)}>🗑 Eliminar</Btn>}
                  </div>,
                ] : []),
              ]
            })}
          />
        )}
      </Card>

      {showModal && (
        <Modal
          title={editing ? `Editar: ${editing.nombre}` : 'Nueva Mascota'}
          onClose={() => setShowModal(false)}
          width={480}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              label="Nombre *" value={form.nombre} error={errors.nombre}
              allowPattern={PATTERNS.alfanumerico} maxLength={80}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Firulais, Rocky 2"
            />
            <FormRow>
              <FormCol>
                <Select label="Especie *" value={form.id_especie} error={errors.id_especie} onChange={e => set('id_especie', e.target.value)}>
                  <option value="">Seleccionar…</option>
                  {(especies ?? []).map(e => <option key={e.id_especie} value={e.id_especie}>{e.nombre}</option>)}
                </Select>
              </FormCol>
              <FormCol>
                <Select label="Sexo" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                </Select>
              </FormCol>
            </FormRow>
            <FormRow>
              <FormCol>
                <Input label="Raza" value={form.raza} allowPattern={PATTERNS.alfanumerico} maxLength={80} onChange={e => set('raza', e.target.value)} placeholder="Ej: Labrador" />
              </FormCol>
              <FormCol>
                <Input label="Color" value={form.color} allowPattern={PATTERNS.soloLetras} maxLength={60} onChange={e => set('color', e.target.value)} placeholder="Ej: Amarillo" />
              </FormCol>
            </FormRow>
            <Input
              label="Peso (kg)" value={form.peso_kg} error={errors.peso_kg}
              allowPattern={PATTERNS.decimal} maxLength={6}
              onChange={e => { const v = e.target.value; if ((v.match(/\./g)||[]).length > 1) return; set('peso_kg', v) }}
              placeholder="Ej: 28.5"
            />

            {/* Solo ADMIN/SUPER ven el selector de propietario */}
            {isAdmin && (
              <Select label="Propietario *" value={form.id_propietario} error={errors.id_propietario} onChange={e => set('id_propietario', e.target.value)}>
                <option value="">Seleccionar…</option>
                {(propietarios ?? []).map(p => (
                  <option key={p.id_propietario} value={p.id_propietario}>
                    {p.nombres} {p.apellidos} — {p.cedula}
                  </option>
                ))}
              </Select>
            )}

            {/* USUARIO: informar que la mascota queda a su nombre */}
            {isUsuario && (
              <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: 'var(--accent-dark)' }}>
                🐾 La mascota quedará registrada a tu nombre automáticamente.
              </div>
            )}

            {submitted && Object.keys(errors).length > 0 && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: 'var(--red)' }}>
                ⚠ Corrige los campos marcados antes de guardar.
              </div>
            )}
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
