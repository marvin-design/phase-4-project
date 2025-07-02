import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TrainingPage() {
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    command: '',
    date: '',
    status: 'learning',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dogs`);
        setDogs(response.data);
      } catch (err) {
        setError("Failed to fetch dogs");
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, []);

  useEffect(() => {
    if (selectedDog) {
      const fetchTraining = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE_URL}/dogs/${selectedDog}/training`);
          setTrainingRecords(response.data);
        } catch (err) {
          setError("Failed to fetch training records");
        } finally {
          setLoading(false);
        }
      };
      fetchTraining();
    }
  }, [selectedDog]);

  const handleAddTraining = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/dogs/${selectedDog}/training`,
        newRecord
      );
      setTrainingRecords([...trainingRecords, response.data]);
      setNewRecord({
        command: '',
        date: '',
        status: 'learning',
        notes: ''
      });
    } catch (err) {
      setError("Failed to add training record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="training-page">
      <h2>Training Tracker</h2>
      
      <div className="dog-selector">
        <select 
          value={selectedDog || ''} 
          onChange={(e) => setSelectedDog(e.target.value)}
        >
          <option value="">Select a dog</option>
          {dogs.map(dog => (
            <option key={dog.id} value={dog.id}>{dog.name}</option>
          ))}
        </select>
      </div>

      {selectedDog && (
        <>
          <div className="add-training">
            <h3>Add Training Record</h3>
            <input
              placeholder="Command"
              value={newRecord.command}
              onChange={(e) => setNewRecord({...newRecord, command: e.target.value})}
            />
            {/* More form fields */}
            <button onClick={handleAddTraining} disabled={loading}>
              {loading ? "Adding..." : "Add Record"}
            </button>
          </div>

          <div className="training-progress">
            <h3>Training Progress</h3>
            <table>
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {trainingRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.command}</td>
                    <td>{record.status}</td>
                    <td>{record.date}</td>
                    <td>{record.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default TrainingPage;