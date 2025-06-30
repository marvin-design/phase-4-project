import React, { useState } from 'react';
import './App.css';

function App() {
  // Medical and Activity options
  const medicalOptions = [
    'Vaccination',
    'Deworming',
    'Health Check',
    'Medication',
    'Surgery',
    'Other Treatment'
  ];

  const activityOptions = [
    'Walk',
    'Wash',
    'Appointment',
    'Training',
    'Playtime',
    'Other Activity'
  ];

  // State declarations
  const [dogs, setDogs] = useState([]);
  const [newDog, setNewDog] = useState({
    name: '',
    breed: '',
    photo: null,
    medicalRecords: [],
    activities: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({
    email: '',
    password: ''
  });
  const [activeForm, setActiveForm] = useState({
    dogId: null,
    type: null
  });
  const [newRecord, setNewRecord] = useState({
    type: '',
    note: '',
    date: ''
  });

  // Authentication handlers
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    if (authData.email && authData.password) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Please enter both email and password');
    }
    setLoading(false);
  };

  // Dog handlers
  const handleAddDog = (e) => {
    e.preventDefault();
    if (!newDog.name || !newDog.breed) {
      setError('Name and breed are required');
      return;
    }

    const dogToAdd = {
      ...newDog,
      id: Date.now()
    };

    setDogs([...dogs, dogToAdd]);
    setNewDog({
      name: '',
      breed: '',
      photo: null,
      medicalRecords: [],
      activities: []
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDog(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewDog(prev => ({ ...prev, photo: e.target.files[0] }));
  };

  // Record handlers
  const toggleRecordForm = (dogId, type) => {
    setActiveForm(prev => 
      prev.dogId === dogId && prev.type === type 
        ? { dogId: null, type: null } 
        : { dogId, type }
    );
    setNewRecord({ type: '', note: '', date: '' });
  };

  const handleRecordInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = (dogId, recordType) => {
    if ((recordType === 'medical' && (!newRecord.type || !newRecord.date)) ||
        (recordType === 'activity' && !newRecord.date)) {
      setError(recordType === 'medical' ? 'Type and date are required' : 'Date is required');
      return;
    }

    setDogs(dogs.map(dog => {
      if (dog.id === dogId) {
        const newEntry = {
          id: Date.now(),
          type: newRecord.type,
          note: newRecord.note,
          date: newRecord.date
        };

        return {
          ...dog,
          [recordType === 'medical' ? 'medicalRecords' : 'activities']: [
            ...dog[recordType === 'medical' ? 'medicalRecords' : 'activities'],
            newEntry
          ]
        };
      }
      return dog;
    }));

    setActiveForm({ dogId: null, type: null });
    setNewRecord({ type: '', note: '', date: '' });
    setError(null);
  };

  const handleDeleteRecord = (dogId, recordId, type) => {
    setDogs(dogs.map(dog => {
      if (dog.id === dogId) {
        return {
          ...dog,
          [type === 'medical' ? 'medicalRecords' : 'activities']: 
            dog[type === 'medical' ? 'medicalRecords' : 'activities']
              .filter(r => r.id !== recordId)
        };
      }
      return dog;
    }));
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <div className="login-container">
          <div className="login-form">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({...authData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              {error && <div className="error">{error}</div>}
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard">
          <header>
            <h1>Dog Management System</h1>
            <button onClick={() => setIsAuthenticated(false)}>Logout</button>
          </header>

          <div className="add-dog-section">
            <h2>Add New Dog</h2>
            <form onSubmit={handleAddDog}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newDog.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Breed:</label>
                <input
                  type="text"
                  name="breed"
                  value={newDog.breed}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Photo:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              <button type="submit">Add Dog</button>
            </form>
          </div>

          <div className="dogs-list">
            <h2>Your Dogs</h2>
            {dogs.length === 0 ? (
              <p>No dogs added yet.</p>
            ) : (
              dogs.map(dog => (
                <div key={dog.id} className="dog-card">
                  <div className="dog-basic-info">
                    {dog.photo && (
                      <img 
                        src={URL.createObjectURL(dog.photo)} 
                        alt={dog.name}
                        className="dog-image"
                      />
                    )}
                    <div>
                      <h3>{dog.name}</h3>
                      <p><strong>Breed:</strong> {dog.breed}</p>
                    </div>
                  </div>

                  <div className="dog-records">
                    <div className="record-section">
                      <div className="section-header">
                        <h4>Medical Records</h4>
                        <button 
                          onClick={() => toggleRecordForm(dog.id, 'medical')}
                          className="add-record-btn"
                        >
                          Add Medical Record
                        </button>
                      </div>
                      {activeForm.dogId === dog.id && activeForm.type === 'medical' && (
                        <div className="record-form">
                          <select
                            name="type"
                            value={newRecord.type}
                            onChange={handleRecordInputChange}
                            className="record-select"
                            required
                          >
                            <option value="">Select medical type</option>
                            {medicalOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <textarea
                            name="note"
                            value={newRecord.note}
                            onChange={handleRecordInputChange}
                            placeholder="Details"
                            rows="3"
                          />
                          <input
                            type="date"
                            name="date"
                            value={newRecord.date}
                            onChange={handleRecordInputChange}
                            required
                          />
                          <button 
                            onClick={() => handleAddRecord(dog.id, 'medical')}
                            className="submit-btn"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                      <div className="records-container">
                        {dog.medicalRecords.map(record => (
                          <div key={record.id} className="record-item">
                            <p><strong>{record.type}:</strong> {record.note}</p>
                            <small>{new Date(record.date).toLocaleDateString()}</small>
                            <button 
                              onClick={() => handleDeleteRecord(dog.id, record.id, 'medical')}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="record-section">
                      <div className="section-header">
                        <h4>Activities</h4>
                        <button 
                          onClick={() => toggleRecordForm(dog.id, 'activity')}
                          className="add-record-btn"
                        >
                          Add Activity
                        </button>
                      </div>
                      {activeForm.dogId === dog.id && activeForm.type === 'activity' && (
                        <div className="record-form">
                          <select
                            name="type"
                            value={newRecord.type}
                            onChange={handleRecordInputChange}
                            className="record-select"
                            required
                          >
                            <option value="">Select activity type</option>
                            {activityOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <input
                            type="date"
                            name="date"
                            value={newRecord.date}
                            onChange={handleRecordInputChange}
                            required
                          />
                          <textarea
                            name="note"
                            value={newRecord.note}
                            onChange={handleRecordInputChange}
                            placeholder="Details (optional)"
                            rows="2"
                          />
                          <button 
                            onClick={() => handleAddRecord(dog.id, 'activity')}
                            className="submit-btn"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                      <div className="records-container">
                        {dog.activities.map(activity => (
                          <div key={activity.id} className="record-item">
                            <p><strong>{activity.type}:</strong> {activity.note || 'No details'}</p>
                            <small>{new Date(activity.date).toLocaleDateString()}</small>
                            <button 
                              onClick={() => handleDeleteRecord(dog.id, activity.id, 'activity')}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;