import React, { useState } from "react";
import ActivityLog from "./ActivityLog";
import MedicalReport from "./MedicalReport";

const DogCard = ({ dog, onDelete, onAddActivity, onAddMedicalReport }) => {
  const [showActivities, setShowActivities] = useState(false);
  const [showMedical, setShowMedical] = useState(false);

  return (
    <div className='dog-card'>
      <div className='dog-info'>
        {dog.image && (
          <img
            src={dog.image}
            alt={dog.name}
            className='dog-image'
            onError={(e) => {
              e.target.src = "/placeholder-dog.jpg";
            }}
          />
        )}
        <h3>{dog.name}</h3>
        <p>Breed: {dog.breed}</p>
      </div>

      
<div className="dog-actions">
    <button 
      onClick={() => handleEditDog(dog)}
      className="edit-btn"
      disabled={loading}>
      Edit
    </button>
    <button
      onClick={() => handleDeleteDog(dog.id)}
      className="delete-btn"
      disabled={loading}>
      Delete
    </button>
  </div>


      {showActivities && (
        <ActivityLog
          activities={dog.activities}
          onAddActivity={(activity) => onAddActivity(dog.id, activity)}
        />
      )}

      {showMedical && (
        <MedicalReport
          reports={dog.medicalReports}
          onAddReport={(report) => onAddMedicalReport(dog.id, report)}
        />
      )}
  {editingDog === dog.id && (
  <div className="edit-dog-form">
    <h4>Edit Dog</h4>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={editDogData.name}
        onChange={handleEditInputChange}
        required
      />
    </div>
    <div className="form-group">
      <label>Breed:</label>
      <input
        type="text"
        name="breed"
        value={editDogData.breed}
        onChange={handleEditInputChange}
        required
      />
    </div>
    <div className="form-group">
      <label>Photo:</label>
      {editDogData.existingPhoto && (
        <img 
          src={editDogData.existingPhoto} 
          alt="Current" 
          className="current-photo" 
        />
      )}
      <input
        type="file"
        onChange={handleEditFileChange}
        accept="image/*"
      />
    </div>
    <div className="form-actions">
      <button
        onClick={() => handleUpdateDog(dog.id)}
        className="submit-btn"
        disabled={loading}>
        {loading ? "Updating..." : "Update"}
      </button>
      <button
        onClick={handleCancelEdit}
        className="cancel-btn">
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default DogCard;
