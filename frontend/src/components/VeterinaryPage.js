import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VeterinaryPage() {
  const [clinics, setClinics] = useState([]);
  const [newClinic, setNewClinic] = useState({
    name: '',
    address: '',
    phone: '',
    vetName: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/veterinary`);
        setClinics(response.data);
      } catch (err) {
        setError("Failed to fetch veterinary clinics");
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClinic(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClinic = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/veterinary`, newClinic);
      setClinics([...clinics, response.data]);
      setNewClinic({
        name: '',
        address: '',
        phone: '',
        vetName: '',
        notes: ''
      });
    } catch (err) {
      setError("Failed to add clinic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="veterinary-page">
      <h2>Veterinary Contacts</h2>
      
      <div className="add-clinic-form">
        <h3>Add New Clinic</h3>
        <div className="form-group">
          <label>Clinic Name:</label>
          <input
            name="name"
            value={newClinic.name}
            onChange={handleInputChange}
          />
        </div>
        {/* More form fields for address, phone, etc. */}
        <button onClick={handleAddClinic} disabled={loading}>
          {loading ? "Adding..." : "Add Clinic"}
        </button>
      </div>

      <div className="clinics-list">
        {clinics.map(clinic => (
          <div key={clinic.id} className="clinic-card">
            <h3>{clinic.name}</h3>
            <p>Vet: {clinic.vetName}</p>
            <p>Phone: {clinic.phone}</p>
            <p>Address: {clinic.address}</p>
            <p>Notes: {clinic.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VeterinaryPage;