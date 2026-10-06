import { useState } from 'react';
import api, { errorMessage } from '../api';
import { label } from './ProjectForm.jsx';

export const TASK_STATUS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TaskForm({ projectId, task, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'PENDING',
    dueDate: toDateInput(task?.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    else if (form.name.length > 150) e.name = 'Name must be 150 characters or fewer.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setServerError('');
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };
    try {
      if (task) await api.put(`/tasks/${task.id}`, payload);
      else await api.post('/tasks', { ...payload, projectId: Number(projectId) });
      onSaved();
    } catch (err) {
      setServerError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="form">
      {serverError && <div className="alert alert-error">{serverError}</div>}
      <label>
        Name
        <input value={form.name} onChange={set('name')} autoFocus />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>
      <label>
        Description
        <textarea rows="3" value={form.description} onChange={set('description')} />
      </label>
      <div className="row">
        <label>
          Priority
          <select value={form.priority} onChange={set('priority')}>
            {PRIORITY.map((p) => <option key={p} value={p}>{label(p)}</option>)}
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={set('status')}>
            {TASK_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </label>
      </div>
      <label>
        Due date
        <input type="date" value={form.dueDate} onChange={set('dueDate')} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save task'}</button>
      </div>
    </form>
  );
}
