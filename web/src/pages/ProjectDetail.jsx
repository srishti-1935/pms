import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import TaskForm, { PRIORITY, TASK_STATUS } from '../components/TaskForm.jsx';
import { label } from '../components/ProjectForm.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : 'No due date');

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data.project))
      .catch((err) => {
        if (err.response?.status === 404) navigate('/projects', { replace: true });
        else setError(errorMessage(err));
      })
      .finally(() => setLoadingProject(false));
  }, [id, navigate]);

  const loadTasks = useCallback(() => {
    setLoadingTasks(true);
    const params = { projectId: id };
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (priority) params.priority = priority;
    return api
      .get('/tasks', { params })
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingTasks(false));
  }, [id, search, status, priority]);

  useEffect(() => {
    const t = setTimeout(loadTasks, 300);
    return () => clearTimeout(t);
  }, [loadTasks, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const complete = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: 'COMPLETED' });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (task) => {
    if (!window.confirm(`Delete task "${task.name}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (loadingProject) return <Spinner />;
  if (!project) return <div className="alert alert-error">{error || 'Project not found.'}</div>;

  return (
    <>
      <p><Link to="/projects" className="muted">Back to projects</Link></p>
      <div className="page-head">
        <div>
          <h1>{project.name}</h1>
          <span className={`badge s-${project.status}`}>{label(project.status)}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>New task</button>
      </div>
      {project.description && <p className="item-desc">{project.description}</p>}

      <h2>Tasks</h2>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search tasks by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tasks"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {TASK_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
          <option value="">All priorities</option>
          {PRIORITY.map((p) => <option key={p} value={p}>{label(p)}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loadingTasks ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <div className="empty">
          {search || status || priority ? 'No tasks match your filters.' : 'No tasks yet. Add the first task to this project.'}
        </div>
      ) : (
        <div className="list">
          {tasks.map((t) => (
            <article className="item" key={t.id}>
              <div className="item-head">
                <span className={t.status === 'COMPLETED' ? 'item-title done' : 'item-title'}>{t.name}</span>
                <span>
                  <span className={`badge p-${t.priority}`}>{label(t.priority)}</span>{' '}
                  <span className={`badge s-${t.status}`}>{label(t.status)}</span>
                </span>
              </div>
              {t.description && <p className="item-desc">{t.description}</p>}
              <p className="muted small">Due: {fmt(t.dueDate)}</p>
              <div className="item-actions">
                {t.status !== 'COMPLETED' && (
                  <button className="btn btn-ghost" onClick={() => complete(t)}>Mark complete</button>
                )}
                <button className="btn btn-ghost" onClick={() => setEditing(t)}>Edit</button>
                <button className="btn btn-danger" onClick={() => remove(t)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'New task' : 'Edit task'} onClose={() => setEditing(null)}>
          <TaskForm
            projectId={id}
            task={editing === 'new' ? null : editing}
            onSaved={() => { setEditing(null); reload(); }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
