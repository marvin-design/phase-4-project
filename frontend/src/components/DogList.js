// src/components/DogList.js
import React from 'react';
import DogCard from './DogCard';

const DogList = ({ dogs, onDeleteDog, onAddActivity, onAddMedicalReport }) => {
  return (
    <div className="dog-list">
      <h2>Your Dogs</h2>
      {dogs.length === 0 ? (
        <p>No dogs added yet.</p>
      ) : (
        <div className="dog-cards">
          {dogs.map(dog => (
            <DogCard 
              key={dog.id}
              dog={dog}
              onDelete={() => onDeleteDog(dog.id)}
              onAddActivity={(activity) => onAddActivity(dog.id, activity)}
              onAddMedicalReport={(report) => onAddMedicalReport(dog.id, report)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DogList;