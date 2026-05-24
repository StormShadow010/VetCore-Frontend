export type Rol = 'SUPERADMIN' | 'ADMIN' | 'USUARIO' | 'CONSULTA'
export type EstadoCita = 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO'
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'NEQUI'
export type SexoTipo = 'M' | 'F'

export interface User {
  id: number
  username: string
  email: string
  rol: Rol
  id_veterinario?: number | null
  nombre_veterinario?: string | null
}

export interface Especialidad {
  id_especialidad: number
  nombre: string
  descripcion: string | null
}

export interface Especie {
  id_especie: number
  nombre: string
  descripcion: string | null
}

export interface Veterinario {
  id_veterinario: number
  cedula: string
  nombres: string
  apellidos: string
  telefono: string | null
  email: string
  id_especialidad: number
  especialidad_nombre: string
  activo: boolean
  fecha_ingreso: string
}

export interface Propietario {
  id_propietario: number
  cedula: string
  nombres: string
  apellidos: string
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  fecha_registro: string
}

export interface Mascota {
  id_mascota: number
  nombre: string
  id_especie: number
  especie_nombre: string
  raza: string | null
  sexo: SexoTipo
  fecha_nac: string | null
  peso_kg: number | null
  color: string | null
  id_propietario: number
  propietario_nombre: string
  propietario_telefono: string | null
  propietario_cedula: string
  activa: boolean
}

export interface Cita {
  id_cita: number
  id_mascota: number
  mascota_nombre: string
  especie_nombre: string
  propietario_nombre: string
  propietario_telefono: string | null
  id_veterinario: number
  veterinario_nombre: string
  especialidad_nombre: string
  fecha_hora: string
  motivo: string | null
  estado: EstadoCita
  observaciones: string | null
}

export interface Consulta {
  id_consulta: number
  id_cita: number
  diagnostico: string | null
  sintomas: string | null
  temperatura: number | null
  peso_consulta: number | null
  proxima_cita: string | null
  costo_consulta: number
  tratamientos: Tratamiento[] | null
}

export interface Tratamiento {
  id_tratamiento: number
  id_medicamento: number
  medicamento: string
  presentacion: string | null
  dosis: string | null
  frecuencia: string | null
  duracion_dias: number | null
  cantidad: number | null
}

export interface Medicamento {
  id_medicamento: number
  nombre: string
  principio_act: string | null
  presentacion: string | null
  stock: number
  precio_unit: number
  activo: boolean
}

export interface Factura {
  id_factura: number
  id_cita: number
  mascota_nombre: string
  propietario: string
  veterinario: string
  fecha_emision: string
  subtotal: number
  descuento_pct: number
  total: number
  pagado: boolean
  metodo_pago: MetodoPago | null
}

export interface UsuarioAdmin {
  id_usuario: number
  username: string
  email: string
  rol: Rol
  veterinario: string | null
  activo: boolean
  creado_en: string
}

export interface DashboardData {
  citas: { pendientes: number; atendidas: number; hoy: number }
  mascotas: { total: number }
  ingresos: { total_mes: number; cobrado_mes: number }
  stock: { bajo_stock: number }
}
