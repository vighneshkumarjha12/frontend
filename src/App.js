import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const API_URL = "https://farm-backend-1-3eyq.onrender.com/api/v1";

  const getTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/get`);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");
    try {
      await axios.post(`${API_URL}/create`, { title, desc, is_complete: false });
      setTitle(''); setDesc('');
      getTasks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      getTasks();
    } catch (err) { console.error(err); }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.patch(`${API_URL}/patch/${task.id}`, { is_complete: !task.is_complete });
      getTasks();
    } catch (err) { console.error(err); }
  };

  // --- UPDATE LOGIC ---

  // 1. Enter Edit Mode
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.desc);
  };

  // 2. Cancel Edit Mode
  const cancelEdit = () => {
    setEditingId(null);
  };

  // 3. Save Edit (PUT)
  const saveUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/update/${id}`, {
        title: editTitle,
        desc: editDesc,
        is_complete: false // Or keep original status
      });
      setEditingId(null);
      getTasks();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="app-container">
      <h2> Task Manager</h2>
      <form className="input-section" onSubmit={handleAddTask}>
        <div className="field">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows="4" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>

      <h1 className="total-count">Total({tasks.length})</h1>

      <div className="task-grid">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.is_complete ? 'completed-card' : ''}`}>
            
            {editingId === task.id ? (
              /* EDIT MODE UI */
              <div className="edit-mode">
                <input className="edit-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <textarea className="edit-input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                <div className="card-actions">
                  <button className="complete-btn" onClick={() => saveUpdate(task.id)}>Save</button>
                  <button className="undo-btn" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              /* VIEW MODE UI */
              <>
                <h2>{task.is_complete ? <del>{task.title}</del> : task.title}</h2>
                <p>{task.is_complete ? <del>{task.desc}</del> : task.desc}</p>
                
                <div className="card-actions">
                  <button className={task.is_complete ? 'undo-btn' : 'complete-btn'} onClick={() => toggleComplete(task)}>
                    {task.is_complete ? 'Undo' : 'Complete'}
                  </button>
                  <button className="update-btn" onClick={() => startEdit(task)}>Update</button>
                  <button className="delete-btn" onClick={() => handleDelete(task.id)}>delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;