import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { api } from '../services/api'
import { validate, rules } from '../services/validation'
import { PageHeader, Card, Table, Badge, Btn, Modal, Input, Select, SearchInput, Spinner, Alert, FormRow, FormCol, PATTERNS } from '../components/ui'

const EMPTY = { nombre: '', id_especie: '', raza: '', sexo: 'M', peso_kg: '', color: '', id_propietario: '' }
const SCHEMA = {
  nombre:        [rules.required, rules.soloLetras, rules.minLen(2), rules.maxLen(80)],
  id_especie:    [rules.selectRequerido],
  id_propietario:[rules.selectRequerido],
  peso_kg:       [(v) => v ? rules.decimal(v, 0.01)(v) : ''],
}

export default function MascotasPage() {
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState({})

  const { data: mascotas, loading, refetch } = useFetch(`/mascotas?search=${encodeURIComponent(search)}`, [search])
  const { data: especies } = useFetch('/especies')
  const { data: propietarios } = useFetch('/propietarios')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setApiError(''); setShowModal(true) }
  const openEdit = (m) => {
    setEditing(m)
    setForm({ nombre: m.nombre, id_especie: String(m.id_especie), raza: m.raza ?? '', sexo: m.sexo, peso_kg: m.peso_kg ? String(m.peso_kg) : '', color: m.color ?? '', id_propietario: String(m.id_propietario) })
    setErrors({}); setApiError(''); setShowModal(true)
  }

  const handleSave = async () => {
    const errs = validate(form, SCHEMA)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setApiError('')
    const body = { ...form, id_especie: Number(form.id_especie), id_propietario: Number(form.id_propietario), peso_kg: form.peso_kg ? Number(form.peso_kg) : null }
    try {
      editing ? await api.put(`/mascotas/${editing.id_mascota}`, body) : await api.post('/mascotas', body)
      setShowModal(false); refetch()
    } catch (e) { setApiError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (m) => {
    if (!confirm(`¿Desactivar a ${m.nombre}?`)) return
    try { await api.patch(`/mascotas/${m.id_mascota}/desactivar`, {}); refetch() }
    catch (e) { alert(e.message) }
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
              ...(can('ADMIN') ? [
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="secondary" onClick={() => openEdit(m)}>Editar</Btn>
                  <Btn size="sm" variant="danger" onClick={() => handleDelete(m)}>Desact.</Btn>
                </div>
              ] : []),
            ])}
          />
        )}
      </Card>

      {showModal && (
        <Modal title={editing ? `Editar: ${editing.nombre}` : 'Nueva Mascota'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Nombre *" value={form.nombre} error={errors.nombre}
              allowPattern={PATTERNS.soloLetras}
              maxLength={80}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Firulais"
            />
            <FormRow>
              <FormCol>
                <Select label="Especie *" value={form.id_especie} error={errors.id_especie} onChange={e => set('id_especie', e.target.value)}>
                  <option value="">Seleccionar…</option>
                  {(especies ?? []).map(e => <option key={e.id_especie} value={e.id_especie}>{e.nombre}</option>)}
                </Select>
              </FormCol>
              <FormCol>
                <Input
                  label="Raza" value={form.raza} error={errors.raza}
                  allowPattern={PATTERNS.alfanumerico}
                  maxLength={80}
                  onChange={e => set('raza', e.target.value)}
                  placeholder="Ej: Labrador"
                />
              </FormCol>
            </FormRow>
            <FormRow>
              <FormCol>
                <Select label="Sexo" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                </Select>
              </FormCol>
              <FormCol>
                <Input
                  label="Peso (kg)" value={form.peso_kg} error={errors.peso_kg}
                  allowPattern={PATTERNS.decimal}
                  maxLength={6}
                  onChange={e => set('peso_kg', e.target.value)}
                  placeholder="Ej: 28.5"
                />
              </FormCol>
              <FormCol>
                <Input
                  label="Color" value={form.color}
                  allowPattern={PATTERNS.soloLetras}
                  maxLength={60}
                  onChange={e => set('color', e.target.value)}
                  placeholder="Ej: Amarillo"
                />
              </FormCol>
            </FormRow>
            <Select label="Propietario *" value={form.id_propietario} error={errors.id_propietario} onChange={e => set('id_propietario', e.target.value)}>
              <option value="">Seleccionar…</option>
              {(propietarios ?? []).map(p => <option key={p.id_propietario} value={p.id_propietario}>{p.nombres} {p.apellidos} — {p.cedula}</option>)}
            </Select>
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
