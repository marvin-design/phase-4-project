// src/components/PasswordModal.js
import React, { useState } from 'react';

const PasswordModal = ({ onVerify, onCancel }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(password);
    setPassword('');
  };

  return (
    <div className="password-modal">
      <div className="modal-content">
        <h3>Enter Password</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          <div className="modal-buttons">
            <button type="submit">Verify</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;