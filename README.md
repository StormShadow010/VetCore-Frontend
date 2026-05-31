# 🐾 VetCore — Frontend

Aplicación web desarrollada en **React JS + Vite**, sin librerías de componentes externas.

---

## 📑 Tabla de contenido

1. [Tecnologías](#1-tecnologías)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Instalación y ejecución](#3-instalación-y-ejecución)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Páginas y módulos](#5-páginas-y-módulos)
6. [Roles y permisos](#6-roles-y-permisos)
7. [Usuarios de prueba](#7-usuarios-de-prueba)
8. [Validaciones de formularios](#8-validaciones-de-formularios)
9. [Sistema de temas](#9-sistema-de-temas)
10. [Componentes reutilizables](#10-componentes-reutilizables)
11. [Consultas SQL](#11-consultas-sql)

---

## 1. Tecnologías

| Herramienta      | Versión | Uso                                 |
| ---------------- | ------- | ----------------------------------- |
| React JS         | 18.x    | Librería de UI                      |
| Vite             | 5.x     | Bundler y servidor de desarrollo    |
| React Router DOM | 7.x     | Enrutamiento                        |
| Tailwind CSS     | 4.x     | Estilos en páginas públicas         |
| CSS Variables    | —       | Design tokens y temas del dashboard |
| Context API      | —       | Estado global de autenticación      |
| Fetch API        | —       | Comunicación con el backend         |

No se usa ninguna librería externa de componentes (sin Bootstrap, sin MUI, sin shadcn en el dashboard).

---

## 2. Estructura del proyecto

```
vetcore-frontend/
├── index.html
├── vite.config.js              ← proxy /api → localhost:5000
├── package.json
├── .env
└── src/
    ├── main.jsx
    ├── App.jsx                 ← router principal + ThemeToggle global
    ├── index.css               ← design tokens CSS (variables de tema)
    │
    ├── components/
    │   ├── ui.jsx              ← todos los componentes del dashboard
    │   ├── Sidebar.jsx         ← navegación lateral por rol
    │   └── public/
    │       ├── Navbar.jsx      ← navegación pública (home, servicios, contacto)
    │       ├── Hero.jsx
    │       ├── Servicios.jsx
    │       ├── CTA.jsx
    │       ├── Footer.jsx
    │       ├── ContactoInfo.jsx
    │       └── RegistroForm.jsx
    │
    ├── context/
    │   └── AuthContext.jsx     ← JWT, user, login, logout, can(rol)
    │
    ├── hooks/
    │   └── useFetch.js         ← hook GET con loading/error/refetch por tick
    │
    ├── services/
    │   ├── api.js              ← fetch centralizado con JWT automático
    │   └── validation.js       ← reglas de validación y patrones
    │
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx   ← estadísticas personalizadas por rol
        ├── MascotasPage.jsx
        ├── CitasPage.jsx
        ├── PropietariosPage.jsx
        ├── Home.jsx
        ├── ServiciosPage.jsx
        ├── ContactoPage.jsx
        ├── RegistroPage.jsx
        └── OtherPages.jsx      ← Veterinarios, Especialidades, Especies,
                                   Medicamentos, Facturas, Usuarios, SQL
```

---

## 3. Instalación y ejecución

```bash
cd vetcore-frontend
npm install

# Desarrollo
npm run dev
# → http://localhost:5173

# Build producción
npm run build

# Previsualizar build
npm run preview
```

> El `vite.config.js` tiene un proxy: peticiones a `/api` se redirigen a `http://localhost:5000`, evitando problemas de CORS en desarrollo.

---

## 4. Variables de entorno

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Si el backend corre en otro puerto, actualizar este valor **y** el proxy en `vite.config.js`:

```js
proxy: {
  '/api': { target: 'http://localhost:5000', changeOrigin: true }
}
```

---

## 5. Páginas y módulos

### Páginas públicas (sin autenticación)

| Ruta         | Página        | Descripción                                         |
| ------------ | ------------- | --------------------------------------------------- |
| `/`          | Home          | Landing page con Hero, Servicios y CTA              |
| `/servicios` | ServiciosPage | Catálogo de servicios de la clínica                 |
| `/contacto`  | ContactoPage  | Información de contacto                             |
| `/registro`  | RegistroPage  | Formulario de registro (crea usuario + propietario) |
| `/login`     | LoginPage     | Inicio de sesión con cuentas de demo                |

### Dashboard protegido (requiere autenticación)

| Módulo         | Archivo                | Descripción                                                 |
| -------------- | ---------------------- | ----------------------------------------------------------- |
| Dashboard      | `DashboardPage.jsx`    | Estadísticas: citas del día, mascotas, ingresos, stock bajo |
| Mascotas       | `MascotasPage.jsx`     | CRUD con filtros Todas/Activas/Inactivas y estado visual    |
| Citas          | `CitasPage.jsx`        | Agenda médica con filtro por estado                         |
| Propietarios   | `PropietariosPage.jsx` | Registro de dueños con activar/desactivar                   |
| Veterinarios   | `OtherPages.jsx`       | Personal médico con estado                                  |
| Especialidades | `OtherPages.jsx`       | Catálogo de áreas médicas                                   |
| Especies       | `OtherPages.jsx`       | Tipos de animales atendidos                                 |
| Medicamentos   | `OtherPages.jsx`       | Inventario con alerta de stock bajo                         |
| Facturas       | `OtherPages.jsx`       | Registro financiero con crear/editar/eliminar               |
| Consultas SQL  | `OtherPages.jsx`       | 20 queries predefinidas + editor libre                      |
| Usuarios       | `OtherPages.jsx`       | Gestión de accesos (solo SUPERADMIN)                        |

---

## 6. Roles y permisos

### Sidebar visible por rol

| Módulo         | SUPERADMIN | ADMIN | USUARIO | CONSULTA |
| -------------- | :--------: | :---: | :-----: | :------: |
| Dashboard      |     ✅     |  ✅   |   ✅    |    ✅    |
| Citas          |     ✅     |  ✅   |   ✅    |    ✅    |
| Mascotas       |     ✅     |  ✅   |   ✅    |    ✅    |
| Propietarios   |     ✅     |  ✅   |    —    |    ✅    |
| Veterinarios   |     ✅     |  ✅   |   ✅    |    ✅    |
| Especialidades |     ✅     |  ✅   |   ✅    |    ✅    |
| Especies       |     ✅     |  ✅   |   ✅    |    ✅    |
| Medicamentos   |     ✅     |  ✅   |    —    |    ✅    |
| Facturas       |     ✅     |  ✅   |    —    |    ✅    |
| Consultas SQL  |     ✅     |  ✅   |    —    |    ✅    |
| Usuarios       |     ✅     |   —   |    —    |    —     |

### Acciones por rol en tablas

| Acción                                       | CONSULTA | USUARIO | ADMIN | SUPERADMIN |
| -------------------------------------------- | :------: | :-----: | :---: | :--------: |
| Ver registros                                |    ✅    |   ✅    |  ✅   |     ✅     |
| Crear mascotas propias                       |    —     |   ✅    |  ✅   |     ✅     |
| Agendar y cancelar citas propias             |    —     |   ✅    |  ✅   |     ✅     |
| Crear/editar propietarios, vet, medicamentos |    —     |    —    |  ✅   |     ✅     |
| Marcar cita como ATENDIDA                    |    —     |    —    |  ✅   |     ✅     |
| **Desactivar** registros (borrado lógico)    |    —     |    —    |  ✅   |     ✅     |
| **Activar** registros desactivados           |    —     |    —    |  ✅   |     ✅     |
| **Eliminar** permanente de la BD             |    —     |    —    |   —   |     ✅     |
| Editor SQL sin restricciones                 |    —     |    —    |   —   |     ✅     |
| Gestionar usuarios                           |    —     |    —    |   —   |     ✅     |

### Comportamiento especial de USUARIO

- Ve **solo sus propias mascotas** (vinculadas por email del propietario)
- Ve **solo sus propias citas**
- Al registrarse, se crea automáticamente un propietario a su nombre
- Al crear una mascota, se asigna automáticamente a su propietario
- Su Dashboard muestra solo sus estadísticas personales

### Comportamiento especial de CONSULTA

- Ve el sidebar completo pero sin ningún botón de acción
- No aparece columna "Acciones" en ninguna tabla
- Puede ejecutar consultas SQL pero solo SELECT

---

## 7. Usuarios de prueba

> Contraseña para todos: `password`

| Username     | Rol        | Descripción                            |
| ------------ | ---------- | -------------------------------------- |
| `superadmin` | SUPERADMIN | Acceso total, elimina permanentemente  |
| `admin`      | ADMIN      | CRUD operativo, facturas, desactiva    |
| `dr_ana`     | ADMIN      | CRUD operativo (veterinaria vinculada) |
| `usuario`    | USUARIO    | Solo sus mascotas y citas              |
| `consulta`   | CONSULTA   | Solo lectura y SQL                     |

En la pantalla de login hay botones de acceso rápido para cada cuenta de demo.

> Si las contraseñas no funcionan, ejecutar en TablePlus:
>
> ```sql
> UPDATE usuarios
> SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
> WHERE username IN ('superadmin', 'admin', 'dr_ana', 'usuario', 'consulta');
> ```

---

## 8. Validaciones de formularios

La validación funciona en **dos niveles**:

**Nivel 1 — Bloqueo en `onKeyDown`:** el carácter inválido nunca llega al input. Las teclas de control (`Backspace`, `Delete`, `Tab`, flechas, `Ctrl+C`, `Ctrl+V`) siempre se permiten. Mantener una tecla presionada solo escribe un carácter (bloqueado con `e.repeat`), excepto `Backspace` y `Delete` que sí se repiten.

**Nivel 2 — Validación en submit:** al intentar guardar, se validan todas las reglas y se muestran los errores en rojo debajo de cada campo. El banner de error solo aparece después de presionar Guardar por primera vez.

| Campo                        | Patrón permitido               | Bloquea                  |
| ---------------------------- | ------------------------------ | ------------------------ |
| Cédula                       | Solo dígitos, 6–12 caracteres  | Letras, símbolos         |
| Nombres / Apellidos / Ciudad | Letras y espacios (tildes, ñ)  | Números, símbolos        |
| Teléfono                     | Solo dígitos, 7–15 caracteres  | Letras, símbolos         |
| Email                        | Formato `usuario@dominio.ext`  | Formatos inválidos       |
| Contraseña                   | Mínimo 6 caracteres            | Contraseñas cortas       |
| Peso / Precio                | Dígitos y un punto decimal     | Letras, múltiples puntos |
| Stock                        | Solo dígitos enteros positivos | Letras, decimales        |
| Nombre de mascota            | Letras, números y espacios     | Símbolos especiales      |
| Username (registro)          | Letras, números, `.`, `-`, `_` | Espacios, símbolos       |

---

## 9. Sistema de temas

El toggle de tema es un **botón circular flotante** en la esquina inferior derecha, visible en todas las páginas (públicas y dashboard).

- 🌙 en tema claro → al hacer click cambia a oscuro
- ☀️ en tema oscuro → al hacer click cambia a claro
- Guarda la preferencia en `localStorage`
- Respeta el tema del sistema operativo la primera vez
- La transición es suave (0.25s) en todos los elementos

### Modificar colores

Los colores de cada tema se definen en `src/index.css`:

```css
/* Tema claro (por defecto) */
:root {
  --background: #edf2e8;
  --foreground: #08211b;
  --ink:        /* texto principal */ --ink-soft: /* texto secundario */
    --surface: /* fondo de cards */ --accent: /* color verde principal */
    --sidebar-bg: /* fondo del sidebar */
    --sidebar-text: /* texto del sidebar */;
}

/* Tema oscuro */
[data-theme="dark"] {
  --background: #1a2622;
  --foreground: #e2ebd9;
  /* ... mismas variables con valores oscuros */
}
```

Para cambiar el color de los títulos del navbar público, editar directamente `src/components/public/Navbar.jsx` — los colores están en los estilos inline usando `var(--foreground)` y `var(--ink)`.

---

## 10. Componentes reutilizables

Todos los componentes del dashboard están en `src/components/ui.jsx`.

| Componente            | Props principales                             | Descripción                                          |
| --------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `Badge`               | `label`, `variant`                            | Etiqueta coloreada (green, red, blue, purple, gray…) |
| `Btn`                 | `variant`, `size`, `disabled`, `fullWidth`    | Botón: primary, secondary, danger, ghost             |
| `Card`                | `style`                                       | Contenedor con borde y sombra                        |
| `StatCard`            | `icon`, `label`, `value`, `variant`           | Tarjeta de estadística para Dashboard                |
| `Input`               | `label`, `error`, `allowPattern`, `maxLength` | Campo con bloqueo de teclas y error visual           |
| `Select`              | `label`, `error`                              | Selector con error visual                            |
| `Modal`               | `title`, `onClose`, `width`                   | Ventana modal via **React Portal** (no se corta)     |
| `Table`               | `headers`, `rows`                             | Tabla responsive con hover                           |
| `PageHeader`          | `title`, `action`                             | Cabecera de sección                                  |
| `Spinner`             | —                                             | Indicador de carga                                   |
| `SearchInput`         | `value`, `onChange`, `placeholder`            | Campo de búsqueda                                    |
| `Alert`               | `message`, `variant`                          | Mensaje de error o advertencia                       |
| `FormRow` / `FormCol` | —                                             | Layout de formulario en columnas                     |
| `PATTERNS`            | —                                             | RegExp exportadas para `allowPattern`                |
| `ESTADO_BADGE`        | —                                             | Mapa estado → variante de badge                      |
| `ROL_BADGE`           | —                                             | Mapa rol → variante de badge                         |

### Por qué Modal usa React Portal

El `<main>` del layout tiene `overflowY: auto`, lo que crea un **stacking context** que atrapa `position: fixed`. Sin el Portal, el modal queda fijo relativo al `<main>` y se corta. Con `createPortal(content, document.body)`, el modal se renderiza fuera del árbol del layout, directamente en `<body>`, y se ve completo siempre.

### Hook `useFetch`

```js
const { data, loading, error, refetch } = useFetch("/mascotas?activa=todas", [
  filtro,
]);
```

- Recibe el path y un array de dependencias
- Usa un contador `tick` interno para garantizar que `refetch()` siempre recarga, incluso si el path no cambió
- `pathRef` se actualiza en cada render para capturar el path más reciente

### Servicio `api.js`

```js
api.get("/mascotas");
api.post("/mascotas", body);
api.put("/mascotas/1", body);
api.patch("/mascotas/1/desactivar", {});
api.del("/mascotas/1");
```

El token JWT se adjunta automáticamente en `Authorization: Bearer ...` en cada petición.

---

## 11. Consultas SQL

El módulo **Consultas SQL** está disponible para SUPERADMIN, ADMIN y CONSULTA.

### 20 consultas predefinidas

| #       | Consulta                                |
| ------- | --------------------------------------- |
| Q1      | Historial clínico de mascota            |
| Q2      | Medicamentos por consulta               |
| Q3      | Agenda de citas del día                 |
| Q4      | Ingresos totales por mes                |
| Q5      | Veterinario con más citas atendidas     |
| Q6      | Medicamentos con stock bajo (< 20)      |
| Q7      | Mascotas activas por especie            |
| Q8      | Propietarios con sus mascotas           |
| Q9      | Citas pendientes próximos 7 días        |
| Q10     | Resumen financiero general              |
| Q11     | Todas las citas con detalle completo    |
| Q12     | Todas las consultas médicas             |
| Q13     | Todos los tratamientos con medicamentos |
| Q14     | Facturas pagadas vs pendientes          |
| Q15     | Mascotas sin citas en 30 días           |
| Q16     | Propietarios con cantidad de mascotas   |
| Q17     | Citas canceladas o no asistidas         |
| Q18     | Medicamentos más recetados              |
| Q19     | Listado de usuarios del sistema         |
| Q20     | Ingresos por veterinario                |
| 🔒 DEMO | DROP TABLE mascotas (bloqueado)         |
| 🔒 DEMO | DELETE FROM mascotas (bloqueado)        |
| 🔒 DEMO | UPDATE mascotas (bloqueado)             |
| 🔒 DEMO | TRUNCATE facturas (bloqueado)           |
| 🔒 DEMO | INSERT usuario falso (bloqueado)        |

Las consultas demo muestran que el sistema bloquea sentencias peligrosas para todos los roles excepto SUPERADMIN. SUPERADMIN ve la etiqueta **"Modo SUPERADMIN — acceso total"** y puede ejecutar cualquier SQL.

---

_VetCore Frontend — ETITC Facultad de Sistemas — Bogotá, mayo 2026_
