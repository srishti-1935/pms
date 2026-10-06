import { useState } from 'react';
import api, { errorMessage } from '../api';

export const PROJECT_STATUS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
export const label = (s) => s.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function ProjectForm({ project, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'NOT_STARTED',
    startDate: toDateInput(project?.startDate),
    endDate: toDateInput(project?.endDate),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    else if (form.name.length > 150) e.name = 'Name must be 150 characters or fewer.';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date cannot be before the start date.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setServerError('');
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    };
    try {
      if (project) await api.put(`/projects/${project.id}`, payload);
      else await api.post('/projects', payload);
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
      <label>
        Status
        <select value={form.status} onChange={set('status')}>
          {PROJECT_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </label>
      <div className="row">
        <label>
          Start date
          <input type="date" value={form.startDate} onChange={set('startDate')} />
        </label>
        <label>
          End date
          <input type="date" value={form.endDate} onChange={set('endDate')} />
          {errors.endDate && <span className="field-error">{errors.endDate}</span>}
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save project'}</button>
      </div>
    </form>
  );
}
