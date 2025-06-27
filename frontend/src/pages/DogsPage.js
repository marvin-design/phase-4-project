import { useState, useEffect } from 'react';
import axios from 'axios';
import DogList from '../components/DogList';
import DogForm from '../components/DogForm';
import { Box, Typography } from '@mui/material';

const DogsPage = () => {
  const [dogs, setDogs] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5555/dogs')
      .then(res => setDogs(res.data))
      .catch(console.error);
  }, [refresh]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dogs</Typography>
      <DogForm onSuccess={() => setRefresh(!refresh)} />
      <DogList dogs={dogs} />
    </Box>
  );
};

export default DogsPage;