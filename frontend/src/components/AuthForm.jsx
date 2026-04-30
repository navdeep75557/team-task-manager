import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "./Toast.jsx";

const AuthForm = ({ mode, onSubmit }) => {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(form);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 502) {
        setError("The backend is temporarily unavailable on Railway. Wait a moment, then try again.");
      } else if (err.response?.status) {
        setError(`Request failed with status ${err.response.status}. Please try again.`);
      } else if (err.request) {
        setError("Cannot reach the backend API. Please check the Railway backend URL and CORS settings.");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-sky-700">Team Task Manager</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Toast message={error} />

          {isSignup && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>

          {isSignup && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option>Member</option>
                <option>Admin</option>
              </select>
            </label>
          )}

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-medium text-sky-700 hover:text-sky-800" to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create account"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
