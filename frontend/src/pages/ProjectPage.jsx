import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import Layout from "../components/Layout.jsx";
import Loading from "../components/Loading.jsx";
import Toast from "../components/Toast.jsx";
import TaskModal from "../components/TaskModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const statuses = ["Todo", "In Progress", "Done"];

const ProjectPage = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMembers, setSavingMembers] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const project = useMemo(() => projects.find((item) => item._id === projectId), [projects, projectId]);

  const loadData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const requests = [
        api.get("/projects"),
        api.get(`/tasks?projectId=${projectId}`)
      ];

      if (user?.role === "Admin") {
        requests.push(api.get("/auth/users"));
      }

      const [projectsRes, tasksRes, usersRes] = await Promise.all(requests);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes?.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    if (project?.members) {
      setSelectedMembers(project.members.map((member) => member._id));
    }
  }, [project]);

  const updateStatus = async (taskId, status) => {
    setMessage("");

    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks((current) => current.map((task) => (task._id === taskId ? data : task)));
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update task");
    }
  };

  const handleTaskCreated = (task) => {
    setTasks((current) => [task, ...current]);
    setModalOpen(false);
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId]
    );
  };

  const saveMembers = async () => {
    setSavingMembers(true);
    setMessage("");

    try {
      const { data } = await api.put(`/projects/${projectId}/members`, { memberIds: selectedMembers });
      setProjects((current) => current.map((item) => (item._id === projectId ? data : item)));
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update members");
    } finally {
      setSavingMembers(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading label="Loading project..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Back to dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">{project?.name || "Project"}</h1>
            <p className="mt-1 text-sm text-slate-600">{project?.members?.length || 0} project members</p>
          </div>

          {user?.role === "Admin" && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} />
              Create task
            </button>
          )}
        </div>

        <Toast message={message} />

        {user?.role === "Admin" && (
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-950">Project members</h2>
                <p className="mt-1 text-sm text-slate-500">Choose who belongs to this project.</p>
              </div>
              <button
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                onClick={saveMembers}
                disabled={savingMembers}
              >
                {savingMembers ? "Saving..." : "Save members"}
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((member) => (
                <label
                  key={member._id}
                  className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => toggleMember(member._id)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800">{member.name}</span>
                    <span className="block truncate text-xs text-slate-500">{member.email}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {statuses.map((status) => (
            <section key={status} className="min-h-80 rounded-md border border-slate-200 bg-slate-100 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">{status}</h2>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">
                  {tasks.filter((task) => task.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {modalOpen && (
        <TaskModal
          project={project}
          onClose={() => setModalOpen(false)}
          onCreated={handleTaskCreated}
          onError={setMessage}
        />
      )}
    </Layout>
  );
};

const TaskCard = ({ task, onStatusChange }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <article className={`rounded-md border bg-white p-4 shadow-sm ${isOverdue ? "border-red-300" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{task.title}</h3>
        {isOverdue && <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Overdue</span>}
      </div>
      {task.description && <p className="mt-2 text-sm text-slate-600">{task.description}</p>}
      <div className="mt-4 space-y-3">
        <p className="text-sm text-slate-500">Assigned to {task.assignedTo?.name}</p>
        <p className="text-sm text-slate-500">Due {new Date(task.dueDate).toLocaleDateString()}</p>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
          value={task.status}
          onChange={(event) => onStatusChange(task._id, event.target.value)}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>
    </article>
  );
};

export default ProjectPage;
