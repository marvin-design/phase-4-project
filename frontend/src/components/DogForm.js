import React, { useState } from 'react';

const DogForm = ({ onAddDog }) => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PNG, JPEG, or GIF image');
        return;
      }
      
      // Validate file size (e.g., 2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      setError(null);
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !breed) {
      setError('Name and breed are required!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newDog = {
        name,
        breed,
        image
      };

      await onAddDog(newDog);
      setName('');
      setBreed('');
      setImage(null);
      setImagePreview('');
    } catch (err) {
      setError(err.message || 'Failed to add dog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dog-form">
      <h2>Add a New Dog</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Breed:</label>
          <input 
            type="text" 
            value={breed} 
            onChange={(e) => setBreed(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Photo:</label>
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/gif" 
            onChange={handleImageChange} 
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="image-preview"
              style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
            />
          )}
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Dog'}
        </button>
      </form>
    </div>
  );
};

export default DogForm;