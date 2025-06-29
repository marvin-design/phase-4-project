import React, { useState } from 'react';

const MedicalReport = ({ reports, onAddReport }) => {
  const [reportType, setReportType] = useState('vaccination');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details) return;
    
    const report = {
      type: reportType,
      details,
      date
    };
    
    onAddReport(report);
    setDetails('');
  };

  return (
    <div className="medical-report">
      <h4>Medical Reports</h4>
      <form onSubmit={handleSubmit}>
        <select 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="vaccination">Vaccination</option>
          <option value="checkup">Checkup</option>
          <option value="surgery">Surgery</option>
          <option value="medication">Medication</option>
          <option value="other">Other</option>
        </select>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Medical details"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">Add Report</button>
      </form>
      
      <div className="reports-list">
        {reports.length === 0 ? (
          <p>No medical reports yet.</p>
        ) : (
          <ul>
            {reports.map((report, index) => (
              <li key={index}>
                <strong>{report.type}</strong>: {report.details} 
                <span> (on {report.date})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MedicalReport;