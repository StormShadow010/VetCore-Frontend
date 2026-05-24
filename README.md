# 🐾 VetCore — Frontend

Aplicación web desarrollada en **React JS + Vite** para el sistema de gestión de clínica veterinaria VetCore.

---

## 📑 Tabla de contenido

1. [Tecnologías](#1-tecnologías)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Instalación y ejecución](#3-instalación-y-ejecución)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Páginas y módulos](#5-páginas-y-módulos)
6. [Sistema de roles y permisos](#6-sistema-de-roles-y-permisos)
7. [Usuarios de prueba](#7-usuarios-de-prueba)
8. [Validaciones de formularios](#8-validaciones-de-formularios)
9. [Consultas SQL](#9-consultas-sql)
10. [Componentes reutilizables](#10-componentes-reutilizables)

---

## 1. Tecnologías

| Herramienta   | Versión | Uso                              |
| ------------- | ------- | -------------------------------- |
| React JS      | 18.x    | Librería de UI                   |
| Vite          | 5.x     | Bundler y servidor de desarrollo |
| CSS Variables | —       | Design tokens y estilos globales |
| Context API   | —       | Estado global de autenticación   |
| Fetch API     | —       | Comunicación con el backend      |

No se usa ninguna librería externa de componentes ni de estilos (sin Tailwind, sin MUI, sin Bootstrap).

---

## 2. Estructura del proyecto

```
vetcore-frontend-js/
├── index.html
├── vite.config.js           ← proxy /api → localhost:5000
├── package.json
├── .env                     ← VITE_API_URL
└── src/
    ├── main.jsx             ← entry point
    ├── App.jsx              ← layout principal + router por estado
    ├── index.css            ← design tokens CSS (variables globales)
    │
    ├── components/
    │   ├── ui.jsx           ← todos los componentes reutilizables
    │   └── Sidebar.jsx      ← navegación lateral filtrada por rol
    │
    ├── context/
    │   └── AuthContext.jsx  ← JWT, usuario, login, logout, can(rol)
    │
    ├── hooks/
    │   └── useFetch.js      ← hook genérico para peticiones GET
    │
    ├── services/
    │   ├── api.js           ← fetch centralizado con JWT automático
    │   └── validation.js    ← reglas y patrones de validación
    │
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── MascotasPage.jsx
        ├── CitasPage.jsx
        ├── PropietariosPage.jsx
        └── OtherPages.jsx   ← Veterinarios, Especialidades, Especies,
                                Medicamentos, Facturas, Usuarios, SQL
```

---

## 3. Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Editar VITE_API_URL con la URL del backend

# 3. Correr en desarrollo
npm run dev
# → http://localhost:5173

# 4. Build para producción
npm run build

# 5. Previsualizar el build
npm run preview
```

> El `vite.config.js` tiene un proxy configurado: peticiones a `/api` se redirigen automáticamente a `http://localhost:5000`, por lo que no hay problemas de CORS en desarrollo.

---

## 4. Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Si el backend corre en otro puerto, actualizar este valor. El proxy en `vite.config.js` también debe actualizarse:

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5000', // ← cambiar aquí también
    changeOrigin: true,
  },
},
```

---

## 5. Páginas y módulos

| Página         | Archivo                | Descripción                                              |
| -------------- | ---------------------- | -------------------------------------------------------- |
| Login          | `LoginPage.jsx`        | Autenticación con cuentas de demo clickeables            |
| Dashboard      | `DashboardPage.jsx`    | Estadísticas generales: citas, mascotas, ingresos, stock |
| Mascotas       | `MascotasPage.jsx`     | CRUD completo de pacientes                               |
| Citas          | `CitasPage.jsx`        | Agenda médica con filtros por estado                     |
| Propietarios   | `PropietariosPage.jsx` | Registro de dueños de mascotas                           |
| Veterinarios   | `OtherPages.jsx`       | Personal médico de la clínica                            |
| Especialidades | `OtherPages.jsx`       | Catálogo de áreas médicas                                |
| Especies       | `OtherPages.jsx`       | Tipos de animales atendidos                              |
| Medicamentos   | `OtherPages.jsx`       | Inventario con alertas de stock bajo                     |
| Facturas       | `OtherPages.jsx`       | Registro financiero de citas atendidas                   |
| Consultas SQL  | `OtherPages.jsx`       | 20 queries predefinidas + editor libre                   |
| Usuarios       | `OtherPages.jsx`       | Gestión de accesos (solo SUPERADMIN)                     |

---

## 6. Sistema de roles y permisos

Los roles son **jerárquicos**: SUPERADMIN hereda todo, ADMIN hereda USUARIO y CONSULTA. El sidebar muestra solo las páginas accesibles según el rol del usuario.

| Acción                                                        | CONSULTA | USUARIO | ADMIN | SUPERADMIN |
| ------------------------------------------------------------- | :------: | :-----: | :---: | :--------: |
| Ver mascotas, propietarios, citas, veterinarios, medicamentos |    ✅    |   ✅    |  ✅   |     ✅     |
| Crear mascotas y propietarios                                 |    —     |   ✅    |  ✅   |     ✅     |
| Agendar y cancelar citas                                      |    —     |   ✅    |  ✅   |     ✅     |
| Editar mascotas, propietarios, veterinarios, medicamentos     |    —     |    —    |  ✅   |     ✅     |
| Marcar cita como ATENDIDA                                     |    —     |    —    |  ✅   |     ✅     |
| Desactivar mascotas (borrado lógico)                          |    —     |    —    |  ✅   |     ✅     |
| Crear/editar especialidades y especies                        |    —     |    —    |  ✅   |     ✅     |
| Ver facturas                                                  |    —     |    —    |  ✅   |     ✅     |
| Eliminar especialidades                                       |    —     |    —    |  ❌   |     ✅     |
| Gestionar usuarios del sistema                                |    —     |    —    |  ❌   |     ✅     |
| Consultas SQL predefinidas y editor libre                     |    ✅    |   ✅    |  ✅   |     ✅     |

La función `can(rol)` del `AuthContext` compara niveles numéricos:

```js
const ROL_LEVEL = { CONSULTA: 1, USUARIO: 2, ADMIN: 3, SUPERADMIN: 4 };
```

---

## 7. Usuarios de prueba

> Contraseña para todos: `password`

| Username     | Rol        | Descripción                            |
| ------------ | ---------- | -------------------------------------- |
| `superadmin` | SUPERADMIN | Acceso total, gestión de usuarios      |
| `admin`      | ADMIN      | CRUD operativo, facturas, reportes     |
| `dr_ana`     | ADMIN      | CRUD operativo (veterinaria vinculada) |
| `usuario`    | USUARIO    | Crear mascotas, propietarios y citas   |
| `consulta`   | CONSULTA   | Solo lectura y consultas SQL           |

En la pantalla de login hay botones de acceso rápido para cada cuenta de demo.

> Si las contraseñas no funcionan, ejecutar en TablePlus:
>
> ```sql
> UPDATE usuarios
> SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
> WHERE username IN ('superadmin', 'admin', 'dr_ana', 'usuario', 'consulta');
> ```
>
> Este hash corresponde a la contraseña `password`.

---

## 8. Validaciones de formularios

La validación funciona en dos niveles:

**1. Bloqueo en `onKeyDown`** — el carácter inválido nunca llega al input, sin importar cuánto tiempo se mantenga presionada la tecla. Las teclas de control (`Backspace`, `Delete`, `Tab`, flechas, `Ctrl+C`, `Ctrl+V`, `Ctrl+A`) siempre se permiten.

**2. Validación en submit** — al intentar guardar, se validan todas las reglas y se muestran los errores en rojo debajo de cada campo.

| Campo                        | Patrón permitido                       | Bloquea                      |
| ---------------------------- | -------------------------------------- | ---------------------------- |
| Cédula                       | Solo dígitos, 6–12 caracteres          | Letras, símbolos, espacios   |
| Nombres / Apellidos / Ciudad | Letras y espacios (tildes, ñ)          | Números, símbolos            |
| Teléfono                     | Solo dígitos, 7–15 caracteres          | Letras, símbolos             |
| Email                        | Formato estricto `usuario@dominio.ext` | `t@`, `abc@`, `@gmail.com`   |
| Contraseña                   | Mínimo 8 caracteres                    | Contraseñas cortas           |
| Peso / Precio                | Dígitos y un punto decimal             | Letras, múltiples puntos     |
| Stock                        | Solo dígitos enteros positivos         | Letras, decimales, negativos |
| Nombres de catálogos         | Letras y espacios                      | Números, símbolos            |

Los patrones se definen en `src/services/validation.js` y se pasan al componente `Input` mediante el prop `allowPattern`:

```js
// Ejemplo de uso en un formulario
<Input
  label="Cédula *"
  value={form.cedula}
  error={errors.cedula}
  allowPattern={PATTERNS.soloNumeros} // /^\d$/
  maxLength={12}
  onChange={(e) => set("cedula", e.target.value)}
/>
```

---

## 9. Consultas SQL

El módulo **Consultas SQL** está disponible para todos los roles desde el sidebar.

### 20 consultas predefinidas

| #   | Consulta                                    |
| --- | ------------------------------------------- |
| Q1  | Historial clínico completo de mascota ID 1  |
| Q2  | Medicamentos recetados en consulta ID 1     |
| Q3  | Agenda de citas del día de hoy              |
| Q4  | Ingresos totales agrupados por mes          |
| Q5  | Veterinario con más citas atendidas         |
| Q6  | Medicamentos con stock bajo (< 20 unidades) |
| Q7  | Conteo de mascotas activas por especie      |
| Q8  | Propietarios con sus mascotas activas       |
| Q9  | Citas pendientes en los próximos 7 días     |
| Q10 | Resumen financiero general                  |
| Q11 | Todas las citas con detalle completo        |
| Q12 | Todas las consultas médicas registradas     |
| Q13 | Todos los tratamientos con medicamentos     |
| Q14 | Facturas pagadas vs pendientes              |
| Q15 | Mascotas sin citas en los últimos 30 días   |
| Q16 | Propietarios con cantidad de mascotas       |
| Q17 | Citas canceladas o con no asistencia        |
| Q18 | Medicamentos más recetados                  |
| Q19 | Listado de usuarios del sistema             |
| Q20 | Ingresos totales por veterinario            |

### Editor SQL libre

- Escribir cualquier `SELECT` personalizado en el editor de texto
- `Ctrl+Enter` para ejecutar
- Los resultados se muestran en tabla con formato de fechas y monedas colombianas
- Las sentencias `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER` y similares están bloqueadas por seguridad

---

## 10. Componentes reutilizables

Todos los componentes están en `src/components/ui.jsx`.

| Componente    | Props principales                             | Descripción                                           |
| ------------- | --------------------------------------------- | ----------------------------------------------------- |
| `Badge`       | `label`, `variant`                            | Etiqueta de colores (green, red, blue, purple…)       |
| `Btn`         | `variant`, `size`, `disabled`, `fullWidth`    | Botón con variantes primary, secondary, danger, ghost |
| `Card`        | `style`                                       | Contenedor con borde y sombra                         |
| `StatCard`    | `icon`, `label`, `value`, `variant`           | Tarjeta de estadística para el dashboard              |
| `Input`       | `label`, `error`, `allowPattern`, `maxLength` | Campo con bloqueo de caracteres y validación visual   |
| `Select`      | `label`, `error`                              | Selector con validación visual                        |
| `Modal`       | `title`, `onClose`, `width`                   | Ventana modal centrada con animación                  |
| `Table`       | `headers`, `rows`                             | Tabla responsive con hover                            |
| `PageHeader`  | `title`, `action`                             | Cabecera de página con botón de acción                |
| `Spinner`     | —                                             | Indicador de carga                                    |
| `SearchInput` | `value`, `onChange`, `placeholder`            | Campo de búsqueda con ícono                           |
| `Alert`       | `message`, `variant`                          | Mensaje de error o advertencia                        |
| `FormRow`     | —                                             | Contenedor flex para campos en fila                   |
| `FormCol`     | —                                             | Columna flexible dentro de FormRow                    |
| `PATTERNS`    | —                                             | Objeto con RegExp exportadas para `allowPattern`      |

### Patrones disponibles (`PATTERNS`)

```js
PATTERNS.soloLetras; // /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]$/
PATTERNS.soloNumeros; // /^\d$/
PATTERNS.alfanumerico; // /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]$/
PATTERNS.decimal; // /^[\d.]$/
PATTERNS.email; // /^[a-zA-Z0-9._%+\-@]$/
PATTERNS.direccion; // /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s#/\-.]$/
```

### Hook `useFetch`

```js
const { data, loading, error, refetch } = useFetch("/mascotas", [search]);
```

- `data` — resultado de la petición
- `loading` — booleano mientras carga
- `error` — mensaje de error si falló
- `refetch` — función para volver a cargar manualmente

### Servicio `api.js`

```js
api.get("/mascotas"); // GET
api.post("/mascotas", body); // POST
api.put("/mascotas/1", body); // PUT
api.patch("/mascotas/1/desactivar", {}); // PATCH
api.del("/especialidades/1"); // DELETE
```

El token JWT se adjunta automáticamente en el header `Authorization: Bearer ...` en cada petición.

---

_VetCore Frontend — ETITC Facultad de Sistemas — Bogotá, mayo 2026_
