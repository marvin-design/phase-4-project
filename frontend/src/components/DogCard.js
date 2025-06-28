// src/components/DogCard.js
import React, { useState } from 'react';
import ActivityLog from './ActivityLog';
import MedicalReport from './MedicalReport';

const DogCard = ({ dog, onDelete, onAddActivity, onAddMedicalReport }) => {
  const [showActivities, setShowActivities] = useState(false);
  const [showMedical, setShowMedical] = useState(false);

  return (
    <div className="dog-card">
      <div className="dog-info">
        {dog.image && (
          <img 
            src={dog.image} 
            alt={dog.name} 
            className="dog-image" 
          />
        )}
        <h3>{dog.name}</h3>
        <p>Breed: {dog.breed}</p>
      </div>
      
      <div className="dog-actions">
        <button onClick={() => setShowActivities(!showActivities)}>
          {showActivities ? 'Hide Activities' : 'Show Activities'}
        </button>
        <button onClick={() => setShowMedical(!showMedical)}>
          {showMedical ? 'Hide Medical' : 'Show Medical'}
        </button>
        <button onClick={onDelete} className="delete-btn">
          Delete Dog
        </button>
      </div>
      
      {showActivities && (
        <ActivityLog 
          activities={dog.activities}
          onAddActivity={onAddActivity}
        />
      )}
      
      {showMedical && (
        <MedicalReport 
          reports={dog.medicalReports}
          onAddReport={onAddMedicalReport}
        />
      )}
    </div>
  );
};

export default DogCard;