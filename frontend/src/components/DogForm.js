// src/components/DogForm.js
import React, { useState } from 'react';

const DogForm = ({ onAddDog }) => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !breed) {
      alert('Name and breed are required!');
      return;
    }

    const newDog = {
      name,
      breed,
      image: imagePreview
    };

    onAddDog(newDog);
    setName('');
    setBreed('');
    setImage(null);
    setImagePreview('');
  };

  return (
    <div className="dog-form">
      <h2>Add a New Dog</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Breed:</label>
          <input 
            type="text" 
            value={breed} 
            onChange={(e) => setBreed(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Photo:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
            />
          )}
        </div>
        <button type="submit">Add Dog</button>
      </form>
    </div>
  );
};

export default DogForm;