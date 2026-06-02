import { useState } from "react"
import { PawPrint } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const CTRL = new Set(['Backspace','Delete','Tab','Enter','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Shift','Control','Alt','Meta','CapsLock'])
const SOLO_LETRAS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]$/
const EMAIL_CHARS = /^[a-zA-Z0-9._%+\-@]$/
const USER_CHARS  = /^[a-zA-Z0-9._\-]$/
const SOLO_NUMS   = /^\d$/

function Field({ label, name, type = "text", value, onChange, error, placeholder, allowPattern, maxLength }) {
  const [focused, setFocused] = useState(false)
  const handleKeyDown = (e) => {
    if (e.repeat && e.key !== 'Backspace' && e.key !== 'Delete') { e.preventDefault(); return }
    if (CTRL.has(e.key) || e.ctrlKey || e.metaKey) return
    if (allowPattern && !allowPattern.test(e.key)) { e.preventDefault(); return }
    if (maxLength && e.target.value.length >= maxLength) {
      const { selectionStart, selectionEnd } = e.target
      if (selectionStart === selectionEnd) { e.preventDefault(); return }
    }
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-gray-700 pl-1">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        onKeyDown={handleKeyDown} placeholder={placeholder} maxLength={maxLength}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ border: `1.5px solid ${error ? '#dc2626' : focused ? '#047857' : '#d1d5db'}`, transition: 'border-color .15s' }}
        className="w-full px-4 py-2.5 bg-[#f4f3ea]/60 rounded-2xl focus:outline-none font-medium text-gray-700 placeholder-gray-400/80 text-sm"
      />
      {error && <span className="text-xs text-red-600 font-medium pl-1">⚠ {error}</span>}
    </div>
  )
}

export default function RegistroForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', nombres: '', apellidos: '', telefono: '', ciudad: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (name, value) => { setForm(f => ({ ...f, [name]: value })); setErrors(e => ({ ...e, [name]: '' })); setApiError('') }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const validateForm = () => {
    const errs = {}
    if (!form.nombres.trim()) errs.nombres = 'Los nombres son obligatorios'
    else if (form.nombres.trim().length < 2) errs.nombres = 'Mínimo 2 caracteres'
    else if (!/[aeiouáéíóúü]/i.test(form.nombres)) errs.nombres = 'Ingresa un nombre válido'
    else if (/[^aeiouáéíóúü\s]{4,}/i.test(form.nombres)) errs.nombres = 'Ingresa un nombre válido'
    if (!form.apellidos.trim()) errs.apellidos = 'Los apellidos son obligatorios'
    else if (form.apellidos.trim().length < 2) errs.apellidos = 'Mínimo 2 caracteres'
    else if (!/[aeiouáéíóúü]/i.test(form.apellidos)) errs.apellidos = 'Ingresa un nombre válido'
    else if (/[^aeiouáéíóúü\s]{4,}/i.test(form.apellidos)) errs.apellidos = 'Ingresa un nombre válido'
    if (!form.username.trim()) errs.username = 'El usuario es obligatorio'
    else if (form.username.trim().length < 3) errs.username = 'Mínimo 3 caracteres'
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.username)) errs.username = 'Solo letras, números, puntos y guiones'
    else if (!/[a-zA-Z]/.test(form.username)) errs.username = 'El usuario debe contener al menos una letra'
    else if (/(.){4,}/.test(form.username.toLowerCase())) errs.username = 'Ingresa un usuario válido'
    if (!form.email.trim()) errs.email = 'El correo es obligatorio'
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email)) errs.email = 'Correo no válido'
    if (!form.password) errs.password = 'La contraseña es obligatoria'
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (!form.confirmPassword) errs.confirmPassword = 'Confirma tu contraseña'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setApiError('')
    const errs = validateForm()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:  form.username.trim(),
          email:     form.email.trim(),
          password:  form.password,
          nombres:   form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          telefono:  form.telefono.trim() || undefined,
          ciudad:    form.ciudad.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) { setApiError(data.message || (data.errors?.[0]) || 'Error al registrar'); return }
      navigate('/login')
    } catch { setApiError('Error de conexión con el servidor') }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-lg bg-[#fafaf6] border border-gray-200/60 rounded-[32px] p-8 flex flex-col items-center gap-5 shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-700 text-white shadow-sm">
        <PawPrint className="w-6 h-6" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Regístrate para gestionar tus mascotas y citas</p>
      </div>

      {apiError && (
        <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium text-center">{apiError}</div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-1" noValidate>
        {/* Datos personales */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Datos personales</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombres *" name="nombres" value={form.nombres} onChange={handleChange} error={errors.nombres} placeholder="María" allowPattern={SOLO_LETRAS} maxLength={100} />
          <Field label="Apellidos *" name="apellidos" value={form.apellidos} onChange={handleChange} error={errors.apellidos} placeholder="García" allowPattern={SOLO_LETRAS} maxLength={100} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="3001234567" allowPattern={SOLO_NUMS} maxLength={15} />
          <Field label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Bogotá" allowPattern={SOLO_LETRAS} maxLength={80} />
        </div>

        {/* Datos de acceso */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 mt-1">Datos de acceso</p>
        <Field label="Usuario *" name="username" value={form.username} onChange={handleChange} error={errors.username} placeholder="maria_garcia" allowPattern={USER_CHARS} maxLength={60} />
        <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="tu@email.com" allowPattern={EMAIL_CHARS} maxLength={150} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contraseña *" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Mín. 6 caracteres" maxLength={128} />
          <Field label="Confirmar *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Repite" maxLength={128} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-all shadow-md text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <div className="text-sm text-gray-600 font-medium">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-emerald-700 font-bold hover:underline">Inicia sesión</Link>
      </div>
    </div>
  )
}
