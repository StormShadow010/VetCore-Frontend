// ── REGLAS DE VALIDACIÓN ─────────────────────────────────────

export const rules = {
  required: (v) => (!v || !String(v).trim()) ? 'Este campo es obligatorio' : '',

  soloLetras: (v) => {
    if (!v) return ''
    if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(v)) return 'Solo se permiten letras y espacios'
    return ''
  },

  // Valida que un nombre (persona, ciudad, etc.) sea real y no basura
  nombreReal: (v) => {
    if (!v || !v.trim()) return ''
    const s = v.trim().toLowerCase()

    // Debe tener al menos una vocal
    const VOCALES = /[aeiouáéíóúü]/i
    if (!VOCALES.test(s)) return 'Ingresa un nombre válido'

    // No puede tener más de 3 consonantes seguidas sin vocal (evita "sdfghj", "asdasd")
    const CONSONANTES_SEQ = /[^aeiouáéíóúü\s]{4,}/i
    if (CONSONANTES_SEQ.test(s)) return 'Ingresa un nombre válido'

    // No puede ser la misma letra repetida ("aaaa", "bbbbb")
    if (/^(.)\1+$/.test(s.replace(/\s/g, ''))) return 'Ingresa un nombre válido'

    // No puede tener el mismo bloque de letras repetido ("asas", "abab", "adadad")
    if (/^(.{1,4})\1{2,}$/.test(s.replace(/\s/g, ''))) return 'Ingresa un nombre válido'

    // Mínimo debe tener 2 letras distintas
    const letrasUnicas = new Set(s.replace(/[\s]/g, '').split(''))
    if (letrasUnicas.size < 2) return 'Ingresa un nombre válido'

    return ''
  },

  soloNumeros: (v) => {
    if (!v) return ''
    return /^\d+$/.test(v) ? '' : 'Solo se permiten números'
  },

  cedula: (v) => {
    if (!v) return 'La cédula es obligatoria'
    if (!/^\d+$/.test(v)) return 'La cédula solo debe contener números'
    if (v.length < 6 || v.length > 12) return 'La cédula debe tener entre 6 y 12 dígitos'
    return ''
  },

  email: (v) => {
    if (!v) return ''
    // Validación estricta: usuario@dominio.ext
    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
    if (!re.test(v)) return 'Ingresa un correo válido (ej: nombre@dominio.com)'
    const partes = v.split('@')
    if (partes[0].length < 2) return 'El usuario del correo es muy corto'
    if (!partes[1]?.includes('.')) return 'El dominio del correo no es válido'
    return ''
  },

  emailRequerido: (v) => {
    if (!v || !v.trim()) return 'El correo es obligatorio'
    return rules.email(v)
  },

  telefono: (v) => {
    if (!v) return ''
    if (!/^\d+$/.test(v)) return 'El teléfono solo debe contener números'
    if (v.length < 7 || v.length > 15) return 'El teléfono debe tener entre 7 y 15 dígitos'
    return ''
  },

  password: (v) => {
    if (!v) return 'La contraseña es obligatoria'
    if (v.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    return ''
  },

  numero: (v, min = 0) => {
    if (v === '' || v === null || v === undefined) return ''
    const n = Number(v)
    if (isNaN(n)) return 'Debe ser un número válido'
    if (n < min) return `El valor mínimo es ${min}`
    return ''
  },

  decimal: (v, min = 0) => {
    if (v === '' || v === null || v === undefined) return ''
    const n = parseFloat(v)
    if (isNaN(n)) return 'Debe ser un número válido'
    if (n < min) return `El valor mínimo es ${min}`
    return ''
  },

  selectRequerido: (v) => (!v || v === '') ? 'Selecciona una opción' : '',

  fechaHora: (v) => (!v || !v.trim()) ? 'La fecha y hora son obligatorias' : '',

  // Texto libre: no puede ser pura basura sin vocales ni repeticiones absurdas
  textoLibre: (v) => {
    if (!v || !v.trim()) return ''
    const s = v.trim()
    if (s.length < 3) return ''  // muy corto, minLen lo maneja
    if (!/[aeiouáéíóúü0-9]/i.test(s)) return 'Ingresa un texto válido'
    if (/(.){5,}/.test(s.toLowerCase())) return 'Ingresa un texto válido'
    return ''
  },

  // Username: sin basura de teclas
  usernameValido: (v) => {
    if (!v || !v.trim()) return ''
    if (!/[a-zA-Z]/.test(v)) return 'El usuario debe contener al menos una letra'
    if (/(.){4,}/.test(v.toLowerCase())) return 'Ingresa un usuario válido'
    if (/^[^aeiou]{8,}$/i.test(v)) return 'Ingresa un usuario válido'
    return ''
  },

  minLen: (min) => (v) => {
    if (!v) return ''
    return v.trim().length >= min ? '' : `Mínimo ${min} caracteres`
  },

  maxLen: (max) => (v) => {
    if (!v) return ''
    return v.trim().length <= max ? '' : `Máximo ${max} caracteres`
  },
}

// Validar un objeto completo: { campo: [regla1, regla2] }
export function validate(values, schema) {
  const errors = {}
  for (const [field, fieldRules] of Object.entries(schema)) {
    for (const rule of fieldRules) {
      const err = rule(values[field])
      if (err) { errors[field] = err; break }
    }
  }
  return errors
}

// Filtros de input (bloquean caracteres en tiempo real)
export const filters = {
  soloNumeros:      (v) => v.replace(/\D/g, ''),
  soloLetras:       (v) => v.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, ''),
  soloLetrasNumeros:(v) => v.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, ''),
  telefono:         (v) => v.replace(/\D/g, '').slice(0, 15),
  cedula:           (v) => v.replace(/\D/g, '').slice(0, 12),
  sinEspaciosIniciales: (v) => v.replace(/^\s+/, ''),
}
