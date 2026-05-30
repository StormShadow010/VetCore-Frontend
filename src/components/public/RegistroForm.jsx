import { useState } from "react";
import { PawPrint } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function RegistroForm() {
  const navigate = useNavigate();
  const [registroData, setRegistroData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setRegistroData({
      ...registroData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (registroData.password !== registroData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch(
        "/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            username: registroData.username,
            email: registroData.email,
            password: registroData.password,
          }),
        },
      );

      clearTimeout(timeout);
      const data = await res.json();

      if (!data.success) {
        setError(data.message || (data.errors && data.errors[0]) || "Error al registrar");
        return;
      }

      navigate("/login");
    } catch (err) {
      if (err.name === "AbortError") {
        setError("El servidor tardó demasiado. Intenta de nuevo.");
      } else {
        setError("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#fafaf6] border border-gray-200/60 rounded-[32px] p-10 flex flex-col items-center gap-6 shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-700 text-white shadow-sm">
        <PawPrint className="w-6 h-6" />
      </div>

      <div className="text-center flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Únete a la familia Huellitas
        </p>
      </div>

      {error && (
        <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium text-center">
          {error}
        </div>
      )}

      {loading && (
        <div className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700 font-medium text-center">
          ⏳ Conectando al servidor, puede tardar unos segundos...
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700 pl-1">
            Usuario
          </label>
          <input
            type="text"
            name="username"
            value={registroData.username}
            onChange={handleChange}
            placeholder="maria_garcia"
            className="w-full px-4 py-3 bg-[#f4f3ea]/60 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-600 font-medium text-gray-700 placeholder-gray-400/80 transition-colors"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700 pl-1">Email</label>
          <input
            type="email"
            name="email"
            value={registroData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 bg-[#f4f3ea]/60 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-600 font-medium text-gray-700 placeholder-gray-400/80 transition-colors"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700 pl-1">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={registroData.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 bg-[#f4f3ea]/60 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-600 font-medium text-gray-700 placeholder-gray-400/80 transition-colors"
            minLength="6"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700 pl-1">
            Confirmar contraseña
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={registroData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            className="w-full px-4 py-3 bg-[#f4f3ea]/60 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-600 font-medium text-gray-700 placeholder-gray-400/80 transition-colors"
            required
          />
        </div>

        <div className="mt-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-all shadow-md text-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </div>
      </form>

      <div className="text-sm text-gray-600 font-medium mt-1">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="text-emerald-700 font-bold hover:underline"
        >
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
