import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Layout from "../components/Layout.jsx";
import Loading from "../components/Loading.jsx";
import Toast from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const [statsRes, projectsRes] = await Promise.all([api.get("/tasks/stats"), api.get("/projects")]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createProject = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data } = await api.post("/projects", { name });
      setProjects((current) => [data, ...current]);
      setName("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not create project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading label="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Track project work and your assigned tasks.</p>
          </div>

          {user?.role === "Admin" && (
            <form className="flex w-full gap-2 sm:w-auto" onSubmit={createProject}>
              <input
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 sm:w-64"
                placeholder="New project name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={saving}
              >
                <Plus size={16} />
                Add
              </button>
            </form>
          )}
        </div>

        <Toast message={message} />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total tasks" value={stats?.totalTasks || 0} />
          <StatCard label="Completed" value={stats?.completedTasks || 0} />
          <StatCard label="Overdue" value={stats?.overdueTasks || 0} danger />
          <StatCard label="Assigned to me" value={stats?.assignedToMe?.length || 0} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="rounded-md border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-300"
              >
                <h3 className="font-semibold text-slate-950">{project.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{project.members?.length || 0} members</p>
              </Link>
            ))}
          </div>
          {projects.length === 0 && <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">No projects yet.</p>}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-950">My tasks</h2>
          <div className="grid gap-3">
            {(stats?.assignedToMe || []).map((task) => (
              <div key={task._id} className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-slate-950">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{task.projectId?.name}</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, danger = false }) => (
  <div className={`rounded-md border bg-white p-4 shadow-sm ${danger ? "border-red-200" : "border-slate-200"}`}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-semibold ${danger ? "text-red-600" : "text-slate-950"}`}>{value}</p>
  </div>
);

export default Dashboard;
