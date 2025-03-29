import React from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface ProjectProps {
  name: string;
  budget: number;
  startDate: string;
  finishDate: string;
  buyer: {
    name: string;
    company: string;
  };
  todos: Todo[];
}

export default function Project({ name, budget, startDate, finishDate, buyer, todos }: ProjectProps) {
  return (
    <div className="project-card">
      <div className="project-header">
        <h2>{name}</h2>
        <span className="budget">${budget.toLocaleString()}</span>
      </div>
      
      <div className="project-info">
        <div className="info-group">
          <label>Timeline</label>
          <span>{startDate} - {finishDate}</span>
        </div>
        
        <div className="info-group">
          <label>Client</label>
          <span>{buyer.name}</span>
          <span className="sub-text">{buyer.company}</span>
        </div>
      </div>

      <div className="project-todos">
        <h3>Project Tasks</h3>
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