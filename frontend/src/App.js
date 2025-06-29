import React, { useState, useEffect } from 'react';
import DogForm from './components/DogForm';
import DogList from './components/DogList';
import './App.css';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api'; // For production

function App() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      const response = await fetch(`${API_URL}/dogs`);
      if (!response.ok) throw new Error('Failed to fetch dogs');
      const data = await response.json();
      setDogs(data);
    } catch (error) {
      console.error('Error fetching dogs:', error);
    }
  };

  const addDog = async (newDog) => {
    const formData = new FormData();
    formData.append('name', newDog.name);
    formData.append('breed', newDog.breed);
    if (newDog.image) {
      formData.append('image', newDog.image);
    }

    try {
      const response = await fetch(`${API_URL}/dogs`, {
        method: 'POST',
        headers: {
          'X-API-PASSWORD': prompt('Enter password to add a dog:') || ''
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add dog');
      }
      
      const data = await response.json();
      setDogs([...dogs, data]);
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteDog = async (id) => {
    const enteredPassword = prompt('Enter password to delete:');
    
    try {
      const response = await fetch(`${API_URL}/dogs/${id}`, {
        method: 'DELETE',
        headers: {
          'X-API-PASSWORD': enteredPassword,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete dog');
      }
      
      setDogs(dogs.filter(dog => dog.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const addActivity = async (dogId, activity) => {
    try {
      const response = await fetch(`${API_URL}/dogs/${dogId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add activity');
      }
      
      const data = await response.json();
      setDogs(dogs.map(dog => 
        dog.id === dogId 
          ? { ...dog, activities: [...dog.activities, data] } 
          : dog
      ));
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const addMedicalReport = async (dogId, report) => {
    try {
      const response = await fetch(`${API_URL}/dogs/${dogId}/medical-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add medical report');
      }
      
      const data = await response.json();
      setDogs(dogs.map(dog => 
        dog.id === dogId 
          ? { ...dog, medicalReports: [...dog.medicalReports, data] } 
          : dog
      ));
    } catch (error) {
      console.error('Error adding medical report:', error);
    }
  };
  return (
    <div className="App">
      <h1>Dog Management System</h1>
      <DogForm onAddDog={addDog} />
      <DogList 
        dogs={dogs} 
        onDeleteDog={deleteDog}
        onAddActivity={addActivity}
        onAddMedicalReport={addMedicalReport}
      />
    </div>
  );
}

export default App;