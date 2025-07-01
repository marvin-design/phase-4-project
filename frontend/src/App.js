import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Medical and Activity options
  const medicalOptions = [
    "Vaccination",
    "Deworming",
    "Health Check",
    "Medication",
    "Surgery",
    "Other Treatment",
  ];

  const activityOptions = [
    "Walk",
    "Wash",
    "Appointment",
    "Training",
    "Playtime",
    "Other Activity",
  ];

  // State declarations
  const [dogs, setDogs] = useState([]);
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    photo: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });
  const [activeForm, setActiveForm] = useState({
    dogId: null,
    type: null,
  });
  const [newRecord, setNewRecord] = useState({
    type: "",
    note: "",
    date: "",
  });

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";
  const API_PASSWORD = "dog123";

  // Set up axios defaults
  useEffect(() => {
    if (isAuthenticated) {
      axios.defaults.headers.common["X-API-PASSWORD"] = API_PASSWORD;
    } else {
      delete axios.defaults.headers.common["X-API-PASSWORD"];
    }
  }, [isAuthenticated]);

  // Fetch dogs from API
  const fetchDogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dogs`);
      setDogs(response.data.dogs);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch dogs: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Load dogs on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchDogs();
    }
  }, [isAuthenticated]);

  // Authentication handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation - in a real app, you'd validate against backend
    if (authData.email && authData.password) {
      // Test API connection
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        if (response.data.status === "healthy") {
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (err) {
        setError(
          "Cannot connect to server. Please check if the backend is running."
        );
      }
    } else {
      setError("Please enter both email and password");
    }
    setLoading(false);
  };

  // Dog handlers
  const handleAddDog = async (e) => {
    e.preventDefault();
    if (!newDog.name || !newDog.breed) {
      setError("Name and breed are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newDog.name);
      formData.append("breed", newDog.breed);
      if (newDog.photo) {
        formData.append("image", newDog.photo);
      }

      const response = await axios.post(`${API_BASE_URL}/dogs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-API-PASSWORD": API_PASSWORD,
        },
      });

      // Refresh dogs list
      await fetchDogs();
      setNewDog({ name: "", breed: "", photo: null });
      setError(null);
    } catch (err) {
      setError(
        "Failed to add dog: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDog((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewDog((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleDeleteDog = async (dogId) => {
    if (!window.confirm("Are you sure you want to delete this dog?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/dogs/${dogId}`, {
        headers: { "X-API-PASSWORD": API_PASSWORD },
      });
      await fetchDogs();
      setError(null);
    } catch (err) {
      setError(
        "Failed to delete dog: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Record handlers
  const toggleRecordForm = (dogId, type) => {
    setActiveForm((prev) =>
      prev.dogId === dogId && prev.type === type
        ? { dogId: null, type: null }
        : { dogId, type }
    );
    setNewRecord({ type: "", note: "", date: "" });
  };

  const handleRecordInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async (dogId, recordType) => {
    if (
      (recordType === "medical" && (!newRecord.type || !newRecord.date)) ||
      (recordType === "activity" && !newRecord.date)
    ) {
      setError(
        recordType === "medical"
          ? "Type and date are required"
          : "Date is required"
      );
      return;
    }

    try {
      setLoading(true);
      const endpoint =
        recordType === "medical" ? "medical-reports" : "activities";
      const payload =
        recordType === "medical"
          ? {
              type: newRecord.type,
              details: newRecord.note,
              date: newRecord.date,
            }
          : {
              type: newRecord.type,
              description: newRecord.note,
              date: newRecord.date,
            };

      await axios.post(`${API_BASE_URL}/dogs/${dogId}/${endpoint}`, payload);
      await fetchDogs();
      setActiveForm({ dogId: null, type: null });
      setNewRecord({ type: "", note: "", date: "" });
      setError(null);
    } catch (err) {
      setError(
        `Failed to add ${recordType}: ` +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='app'>
      {!isAuthenticated ? (
        <div className='login-container'>
          <div className='login-form'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className='form-group'>
                <label>Email:</label>
                <input
                  type='email'
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className='form-group'>
                <label>Password:</label>
                <input
                  type='password'
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  required
                />
              </div>
              <button type='submit' disabled={loading}>
                {loading ? "Connecting..." : "Login"}
              </button>
              {error && <div className='error'>{error}</div>}
            </form>
          </div>
        </div>
      ) : (
        <div className='dashboard'>
          <header>
            <h1>Dog Management System</h1>
            <button onClick={() => setIsAuthenticated(false)}>Logout</button>
          </header>

          <div className='add-dog-section'>
            <h2>Add New Dog</h2>
            <form onSubmit={handleAddDog}>
              <div className='form-group'>
                <label>Name:</label>
                <input
                  type='text'
                  name='name'
                  value={newDog.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Breed:</label>
                <input
                  type='text'
                  name='breed'
                  value={newDog.breed}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label>Photo:</label>
                <input
                  type='file'
                  onChange={handleFileChange}
                  accept='image/*'
                />
              </div>
              <button type='submit' disabled={loading}>
                {loading ? "Adding..." : "Add Dog"}
              </button>
            </form>
          </div>

          <div className='dogs-list'>
            <h2>Your Dogs</h2>
            {loading && <p>Loading...</p>}
            {error && <div className='error'>{error}</div>}
            {dogs.length === 0 && !loading ? (
              <p>No dogs added yet.</p>
            ) : (
              dogs.map((dog) => (
                <div key={dog.id} className='dog-card'>
                  <div className='dog-basic-info'>
                    {dog.image && (
                      <img
                        src={dog.image}
                        alt={dog.name}
                        className='dog-image'
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      <h3>{dog.name}</h3>
                      <p>
                        <strong>Breed:</strong> {dog.breed}
                      </p>
                      <p>
                        <strong>Added:</strong>{" "}
                        {new Date(dog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDog(dog.id)}
                      className='delete-btn'
                      disabled={loading}>
                      Delete
                    </button>
                  </div>

                  <div className='dog-records'>
                    <div className='record-section'>
                      <div className='section-header'>
                        <h4>
                          Medical Records ({dog.medical_reports?.length || 0})
                        </h4>
                        <button
                          onClick={() => toggleRecordForm(dog.id, "medical")}
                          className='add-record-btn'>
                          Add Medical Record
                        </button>
                      </div>
                      {activeForm.dogId === dog.id &&
                        activeForm.type === "medical" && (
                          <div className='record-form'>
                            <select
                              name='type'
                              value={newRecord.type}
                              onChange={handleRecordInputChange}
                              className='record-select'
                              required>
                              <option value=''>Select medical type</option>
                              {medicalOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <textarea
                              name='note'
                              value={newRecord.note}
                              onChange={handleRecordInputChange}
                              placeholder='Details'
                              rows='3'
                            />
                            <input
                              type='date'
                              name='date'
                              value={newRecord.date}
                              onChange={handleRecordInputChange}
                              required
                            />
                            <button
                              onClick={() => handleAddRecord(dog.id, "medical")}
                              className='submit-btn'
                              disabled={loading}>
                              {loading ? "Adding..." : "Submit"}
                            </button>
                          </div>
                        )}
                      <div className='records-container'>
                        {dog.medical_reports?.map((record) => (
                          <div key={record.id} className='record-item'>
                            <p>
                              <strong>{record.type}:</strong> {record.details}
                            </p>
                            <small>
                              {new Date(record.date).toLocaleDateString()}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='record-section'>
                      <div className='section-header'>
                        <h4>Activities ({dog.activities?.length || 0})</h4>
                        <button
                          onClick={() => toggleRecordForm(dog.id, "activity")}
                          className='add-record-btn'>
                          Add Activity
                        </button>
                      </div>
                      {activeForm.dogId === dog.id &&
                        activeForm.type === "activity" && (
                          <div className='record-form'>
                            <select
                              name='type'
                              value={newRecord.type}
                              onChange={handleRecordInputChange}
                              className='record-select'
                              required>
                              <option value=''>Select activity type</option>
                              {activityOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <input
                              type='date'
                              name='date'
                              value={newRecord.date}
                              onChange={handleRecordInputChange}
                              required
                            />
                            <textarea
                              name='note'
                              value={newRecord.note}
                              onChange={handleRecordInputChange}
                              placeholder='Details (optional)'
                              rows='2'
                            />
                            <button
                              onClick={() =>
                                handleAddRecord(dog.id, "activity")
                              }
                              className='submit-btn'
                              disabled={loading}>
                              {loading ? "Adding..." : "Submit"}
                            </button>
                          </div>
                        )}
                      <div className='records-container'>
                        {dog.activities?.map((activity) => (
                          <div key={activity.id} className='record-item'>
                            <p>
                              <strong>{activity.type}:</strong>{" "}
                              {activity.description || "No details"}
                            </p>
                            <small>
                              {new Date(activity.date).toLocaleDateString()}
                            </small>
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
