import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";

const API = "http://localhost:3000";

const AuthForm = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const res = await fetch(`${API}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Request failed");
        toast.success(data.message || "Check your email");
        setMode("signin");
      } else if (mode === "signin") {
        await login(email, password);
        toast.success("Signed in");
        setPassword("");
      } else {
        await register(email, password);
        toast.success("Account created");
        setPassword("");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border-2 border-purple-400 bg-purple-100/40 p-6 shadow-lg">
      <h2 className="text-center text-xl font-bold text-purple-900 mb-1">
        {mode === "forgot" ? "Reset your password" : "Your vault is private"}
      </h2>
      <p className="text-center text-sm text-purple-800 mb-6">
        {mode === "forgot"
          ? "We will email you a reset password link."
          : "Sign in or create an account to save and view your passwords."}
      </p>
      {mode !== "forgot" && (
        <div className="flex rounded-full bg-purple-200/80 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-purple-500 text-white shadow"
                : "text-purple-900"
            }`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-purple-500 text-white shadow"
                : "text-purple-900"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>
      )}
      {mode === "forgot" && (
        <button
          type="button"
          className="mb-4 text-sm text-purple-800 hover:text-purple-950 underline w-full text-left"
          onClick={() => setMode("signin")}
        >
          ← Back to sign in
        </button>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          className="rounded-3xl border-2 border-purple-400 w-full p-3 py-2 focus:border-purple-600 outline-none bg-white"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode !== "forgot" && (
          <input
            className="rounded-3xl border-2 border-purple-400 w-full p-3 py-2 focus:border-purple-600 outline-none bg-white"
            type="password"
            name="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
        >
          {submitting
            ? "Please wait…"
            : mode === "forgot"
              ? "Send reset link"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
        </button>
      </form>
      {mode === "signin" && (
        <button
          type="button"
          className="mt-4 text-sm text-purple-800 hover:text-purple-950 underline w-full text-center"
          onClick={() => setMode("forgot")}
        >
          Forgot password?
        </button>
      )}
    </div>
  );
};

export default AuthForm;
