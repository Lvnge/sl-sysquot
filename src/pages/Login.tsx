import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import logo from "../assets/logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) return setError("Ingresa usuario y contraseña");
    setLoading(true);
    setError("");
    try {
      const r = await login(username, password);
      localStorage.setItem("token", r.data.token);
      navigate("/");
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-16 object-contain mb-4" />
          <h1 className="text-lg font-semibold text-gray-800">
            Persa Industrial
          </h1>
          <p className="text-xs text-gray-400 mt-1">Sistema de cotizaciones</p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Usuario
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
