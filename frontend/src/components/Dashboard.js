import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const Dashboard = ({ user, onLogout }) => {
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

  const [dogs, setDogs] = useState([]);
  const [newDog, setNewDog] = useState({ name: "", breed: "", photo: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState({ dogId: null, type: null });
  const [newRecord, setNewRecord] = useState({ type: "", note: "", date: "" });

  // Fetch all dogs from the server
  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/dogs");
      setDogs(response.data.dogs);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch dogs: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dogs when component mounts
  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

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

      const response = await api.post("/dogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

  const handleDeleteDog = async (dogId) => {
    if (!window.confirm("Are you sure you want to delete this dog?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/dogs/${dogId}`);
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

      await api.post(`/dogs/${dogId}/${endpoint}`, payload);
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

  const toggleRecordForm = (dogId, type) => {
    setActiveForm((prev) =>
      prev.dogId === dogId && prev.type === type
        ? { dogId: null, type: null }
        : { dogId, type }
    );
    setNewRecord({ type: "", note: "", date: "" });
  };

  return (
    <div className='dashboard'>
      <header>
        <h1>Dog Management System</h1>
        {user && <span className='user-email'>Welcome, {user.email}</span>}
        <button onClick={onLogout}>Logout</button>
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
              onChange={(e) =>
                setNewDog((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className='form-group'>
            <label>Breed:</label>
            <input
              type='text'
              name='breed'
              value={newDog.breed}
              onChange={(e) =>
                setNewDog((prev) => ({ ...prev, breed: e.target.value }))
              }
              required
            />
          </div>
          <div className='form-group'>
            <label>Photo:</label>
            <input
              type='file'
              onChange={(e) =>
                setNewDog((prev) => ({ ...prev, photo: e.target.files[0] }))
              }
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
                {/* Medical Records Section */}
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
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
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
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              note: e.target.value,
                            }))
                          }
                          placeholder='Details'
                          rows='3'
                        />
                        <input
                          type='date'
                          name='date'
                          value={newRecord.date}
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
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

                {/* Activities Section */}
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
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
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
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          required
                        />
                        <textarea
                          name='note'
                          value={newRecord.note}
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              note: e.target.value,
                            }))
                          }
                          placeholder='Details (optional)'
                          rows='2'
                        />
                        <button
                          onClick={() => handleAddRecord(dog.id, "activity")}
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
  );
};

export default Dashboard;
