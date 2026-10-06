import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import ProjectForm, { PROJECT_STATUS, label } from '../components/ProjectForm.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : 'Not set');

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | project
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    return api
      .get('/projects', { params })
      .then((res) => setProjects(res.data.projects))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce typing
    return () => clearTimeout(t);
  }, [load, reloadKey]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}" and all its tasks?`)) return;
    try {
      await api.delete(`/projects/${p.id}`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saved = () => {
    setEditing(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <>
      <div className="page-head">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>New project</button>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search projects by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search projects"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {PROJECT_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <div className="empty">
          {search || status ? 'No projects match your filters.' : 'No projects yet. Create your first project to get started.'}
        </div>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <article className="item" key={p.id}>
              <div className="item-head">
                <Link to={`/projects/${p.id}`} className="item-title">{p.name}</Link>
                <span className={`badge s-${p.status}`}>{label(p.status)}</span>
              </div>
              {p.description && <p className="item-desc">{p.description}</p>}
              <p className="muted small">{fmt(p.startDate)} to {fmt(p.endDate)}</p>
              <div className="item-actions">
                <Link to={`/projects/${p.id}`} className="btn btn-ghost">Open</Link>
                <button className="btn btn-ghost" onClick={() => setEditing(p)}>Edit</button>
                <button className="btn btn-danger" onClick={() => remove(p)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'New project' : 'Edit project'} onClose={() => setEditing(null)}>
          <ProjectForm project={editing === 'new' ? null : editing} onSaved={saved} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
