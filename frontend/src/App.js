// src/App.js
import React, { useState } from 'react';
import DogForm from './components/DogForm';
import DogList from './components/DogList';
import './App.css';

const App = () => {
  const [dogs, setDogs] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [currentDogId, setCurrentDogId] = useState(null);

  const PASSWORD = 'dog123'; // In a real app, this would be more secure

  const addDog = (dog) => {
    setDogs([...dogs, { ...dog, id: Date.now(), activities: [], medicalReports: [] }]);
  };

  const deleteDog = (id) => {
    setDogs(dogs.filter(dog => dog.id !== id));
  };

  const addActivity = (dogId, activity) => {
    setDogs(dogs.map(dog => 
      dog.id === dogId 
        ? { ...dog, activities: [...dog.activities, activity] } 
        : dog
    ));
  };

  const addMedicalReport = (dogId, report) => {
    setDogs(dogs.map(dog => 
      dog.id === dogId 
        ? { ...dog, medicalReports: [...dog.medicalReports, report] } 
        : dog
    ));
  };

  const verifyPassword = (password, callback) => {
    if (password === PASSWORD) {
      callback();
      setShowPasswordModal(false);
    } else {
      alert('Incorrect password!');
    }
  };

  const handleProtectedAction = (type, dogId = null) => {
    setActionType(type);
    setCurrentDogId(dogId);
    setShowPasswordModal(true);
  };

  return (
    <div className="app">
      <h1>Dog Management System</h1>
      
      <DogForm 
        onAddDog={(dog) => handleProtectedAction('add', null, () => addDog(dog))}
        showPasswordModal={showPasswordModal && actionType === 'add'}
        onVerifyPassword={(password) => verifyPassword(password, () => addDog(pendingDog))}
      />
      
      <DogList 
        dogs={dogs} 
        onDeleteDog={(id) => handleProtectedAction('delete', id)}
        onAddActivity={addActivity}
        onAddMedicalReport={addMedicalReport}
      />
      
      {showPasswordModal && (
        <PasswordModal 
          onVerify={(password) => {
            if (actionType === 'add') {
              verifyPassword(password, () => addDog(pendingDog));
            } else if (actionType === 'delete') {
              verifyPassword(password, () => deleteDog(currentDogId));
            }
          }}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default App;