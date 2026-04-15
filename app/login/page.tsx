import { loginAction } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-white text-3xl shadow-lg">
            🐯
          </div>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">TigerFix</h1>
          <p className="text-sm text-slate-500 mt-1">
            Inicia sesión para continuar
          </p>
        </div>
        <form
          action={loginAction}
          className="card p-6 space-y-4 shadow-xl"
        >
          <input
            type="hidden"
            name="from"
            value={searchParams.from ?? "/"}
          />
          <div>
            <label className="label">Correo</label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              className="input"
              placeholder="admin@tigerfix.dev"
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>
          {searchParams.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {searchParams.error === "invalid"
                ? "Credenciales inválidas"
                : "Error de sesión"}
            </div>
          )}
          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>
        <div className="mt-6 text-xs text-center text-slate-500 space-y-1">
          <div className="font-medium">Demo accounts:</div>
          <div>admin@tigerfix.dev / tigerfix (ADMIN)</div>
          <div>recepcion@tigerfix.dev / tigerfix (RECEPTION)</div>
          <div>luis@tigerfix.dev / tigerfix (TECHNICIAN)</div>
        </div>
      </div>
    </div>
  );
}
