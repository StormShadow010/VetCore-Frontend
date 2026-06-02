// ── REGLAS DE VALIDACIÓN ─────────────────────────────────────

export const rules = {
  required: (v) => (!v || !String(v).trim() ? "Este campo es obligatorio" : ""),

  soloLetras: (v) => {
    if (!v) return "";
    if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(v))
      return "Solo se permiten letras y espacios";
    return "";
  },

  // Valida que un texto sea real y no basura de teclado
  nombreReal: (v) => {
    if (!v || !v.trim()) return "";
    const s = v.trim().toLowerCase();
    const sinEsp = s.replace(/\s/g, "");

    // 1. Debe tener al menos una vocal
    if (!/[aeiouáéíóúü]/i.test(s)) return "Ingresa un valor válido";

    // 2. No puede tener 4+ consonantes seguidas sin vocal
    if (/[^aeiouáéíóúü\s]{4,}/i.test(s)) return "Ingresa un valor válido";

    // 3. No puede ser la misma letra repetida (aaaaaaa)
    if (sinEsp.length > 1 && new Set(sinEsp.split("")).size === 1)
      return "Ingresa un valor válido";

    // 4. No puede tener el mismo bloque corto repetido (asas, ababab, adadad)
    if (/^(.{1,3})\1{2,}$/.test(sinEsp)) return "Ingresa un valor válido";

    // 5. Mínimo 2 letras distintas
    if (new Set(sinEsp.split("")).size < 2) return "Ingresa un valor válido";

    // 6. En strings largos (8+): mínimo 25% de vocales
    //    (el español tiene ~40% vocales; 25% es el mínimo razonable)
    if (sinEsp.length >= 8) {
      const vocales = (sinEsp.match(/[aeiouáéíóúü]/gi) || []).length;
      if (vocales / sinEsp.length < 0.25) return "Ingresa un valor válido";
    }

    return "";
  },

  // Texto libre (observaciones, direccion, presentacion, motivo)
  textoLibre: (v) => {
    if (!v || !v.trim()) return "";
    const s = v.trim();
    if (s.length < 3) return "";
    // Debe tener al menos una vocal o número
    if (!/[aeiouáéíóúü0-9]/i.test(s)) return "Ingresa un texto válido";
    // No puede ser 6+ del mismo carácter seguido
    if (/(.)\1{5,}/.test(s.toLowerCase())) return "Ingresa un texto válido";
    return "";
  },

  // Username: al menos una letra, sin repeticiones absurdas
  usernameValido: (v) => {
    if (!v || !v.trim()) return "";
    if (!/[a-zA-Z]/.test(v))
      return "El usuario debe contener al menos una letra";
    if (/(.)\1{4,}/.test(v.toLowerCase())) return "Ingresa un usuario válido";
    if (/^[^aeiou]{8,}$/i.test(v)) return "Ingresa un usuario válido";
    return "";
  },

  soloNumeros: (v) => {
    if (!v) return "";
    return /^\d+$/.test(v) ? "" : "Solo se permiten números";
  },

  cedula: (v) => {
    if (!v) return "La cédula es obligatoria";
    if (!/^\d+$/.test(v)) return "La cédula solo debe contener números";
    if (v.length < 6 || v.length > 12)
      return "La cédula debe tener entre 6 y 12 dígitos";
    return "";
  },

  email: (v) => {
    if (!v) return "";
    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(v)) return "Ingresa un correo válido (ej: nombre@dominio.com)";
    const partes = v.split("@");
    if (partes[0].length < 2) return "El usuario del correo es muy corto";
    if (!partes[1]?.includes(".")) return "El dominio del correo no es válido";
    return "";
  },

  emailRequerido: (v) => {
    if (!v || !v.trim()) return "El correo es obligatorio";
    return rules.email(v);
  },

  telefono: (v) => {
    if (!v) return "";
    if (!/^\d+$/.test(v)) return "El teléfono solo debe contener números";
    if (v.length < 7 || v.length > 15)
      return "El teléfono debe tener entre 7 y 15 dígitos";
    return "";
  },

  password: (v) => {
    if (!v) return "La contraseña es obligatoria";
    if (v.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    return "";
  },

  numero: (v, min = 0) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = Number(v);
    if (isNaN(n)) return "Debe ser un número válido";
    if (n < min) return `El valor mínimo es ${min}`;
    return "";
  },

  decimal: (v, min = 0) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = parseFloat(v);
    if (isNaN(n)) return "Debe ser un número válido";
    if (n < min) return `El valor mínimo es ${min}`;
    return "";
  },

  selectRequerido: (v) => (!v || v === "" ? "Selecciona una opción" : ""),

  fechaHora: (v) => (!v || !v.trim() ? "La fecha y hora son obligatorias" : ""),

  minLen: (min) => (v) => {
    if (!v) return "";
    return v.trim().length >= min ? "" : `Mínimo ${min} caracteres`;
  },

  maxLen: (max) => (v) => {
    if (!v) return "";
    return v.trim().length <= max ? "" : `Máximo ${max} caracteres`;
  },
};

// Validar un objeto completo: { campo: [regla1, regla2] }
export function validate(values, schema) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(schema)) {
    for (const rule of fieldRules) {
      const err = rule(values[field]);
      if (err) {
        errors[field] = err;
        break;
      }
    }
  }
  return errors;
}

// Filtros de input (bloquean caracteres en tiempo real)
export const filters = {
  soloNumeros: (v) => v.replace(/\D/g, ""),
  soloLetras: (v) => v.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, ""),
  soloLetrasNumeros: (v) => v.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, ""),
  telefono: (v) => v.replace(/\D/g, "").slice(0, 15),
  cedula: (v) => v.replace(/\D/g, "").slice(0, 12),
  sinEspaciosIniciales: (v) => v.replace(/^\s+/, ""),
};
