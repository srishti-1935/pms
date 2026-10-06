import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Spinner from '../components/Spinner.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    api
      .get('/dashboard')
      .then((res) => setData(res.data.dashboard || res.data.stats || res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="alert alert-error">
        {error} <button className="btn btn-ghost" onClick={load}>Retry</button>
      </div>
    );

  const pick = (...keys) => {
    for (const k of keys) if (data[k] !== undefined) return data[k];
    return 0;
  };

  const stats = [
    ['Total projects', pick('totalProjects')],
    ['Projects in progress', pick('projectsInProgress', 'inProgressProjects')],
    ['Total tasks', pick('totalTasks')],
    ['Completed tasks', pick('completedTasks')],
    ['Pending tasks', pick('pendingTasks')],
  ];

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link to="/projects" className="btn btn-primary">View projects</Link>
      </div>
      <div className="stats">
        {stats.map(([name, value]) => (
          <div className="stat" key={name}>
            <div className="stat-value">{value}</div>
            <div className="stat-name">{name}</div>
          </div>
        ))}
      </div>
    </>
  );
}
