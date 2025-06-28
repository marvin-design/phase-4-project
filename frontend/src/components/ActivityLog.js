// src/components/ActivityLog.js
import React, { useState } from 'react';

const ActivityLog = ({ activities, onAddActivity }) => {
  const [newActivity, setNewActivity] = useState('');
  const [activityType, setActivityType] = useState('walk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newActivity) return;
    
    const activity = {
      type: activityType,
      description: newActivity,
      date,
      timestamp: new Date().toISOString()
    };
    
    onAddActivity(activity);
    setNewActivity('');
  };

  return (
    <div className="activity-log">
      <h4>Activities</h4>
      <form onSubmit={handleSubmit}>
        <select 
          value={activityType} 
          onChange={(e) => setActivityType(e.target.value)}
        >
          <option value="walk">Walk</option>
          <option value="wash">Wash</option>
          <option value="training">Training</option>
          <option value="vet">Vet Visit</option>
          <option value="other">Other</option>
        </select>
        <input
          type="text"
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
          placeholder="Activity description"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">Add Activity</button>
      </form>
      
      <div className="activities-list">
        {activities.length === 0 ? (
          <p>No activities recorded yet.</p>
        ) : (
          <ul>
            {activities.map((activity, index) => (
              <li key={index}>
                <strong>{activity.type}</strong>: {activity.description} 
                <span> (on {activity.date})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;