import { useState } from "react";
import { toast } from "react-toastify";

const API = "http://localhost:3000";

const ResetPassword = ({ token, onDone }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Reset failed");
      toast.success(data.message || "Password updated");
      onDone();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:px-50 py-8 md:mycontainer flex justify-center">
      <div className="w-full max-w-md rounded-3xl border-2 border-purple-400 bg-purple-100/40 p-6 shadow-lg">
        <h2 className="text-center text-xl font-bold text-purple-900 mb-1">
          Set a new password
        </h2>
        <p className="text-center text-sm text-purple-800 mb-6">
          Choose a new password for your account. This link expires after one
          hour.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            className="rounded-3xl border-2 border-purple-400 w-full p-3 py-2 focus:border-purple-600 outline-none bg-white"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <input
            className="rounded-3xl border-2 border-purple-400 w-full p-3 py-2 focus:border-purple-600 outline-none bg-white"
            type="password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
          >
            {submitting ? "Please wait…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
