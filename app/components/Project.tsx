import React from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface ProjectProps {
  id: string;
  title: string;
  owner: string;
  budget: string;
  startDate: string;
  endDate: string;
  status?: 'done' | 'active' | 'pending';
  todos: Todo[];
}

export default function Project({ id, title, owner, budget, startDate, endDate, status, todos }: ProjectProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h2>{title}</h2>
        <div className={`status-badge ${status}`}>
          <span className={`status-indicator ${status}`}></span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <div className="project-info">
        <div className="info-group">
          <label>Budget</label>
          <span>{budget}</span>
        </div>
        <div className="info-group">
          <label>Client</label>
          <span>{owner}</span>
        </div>
        <div className="info-group">
          <label>Timeline</label>
          <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
        </div>
      </div>
      <div className="project-todos">
        <h3>Tasks</h3>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 