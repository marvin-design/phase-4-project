import React from 'react';
import { List, ListItem, Typography } from '@mui/material';

const DogList = ({ dogs }) => {
  return (
    <List>
      {dogs.map((dog) => (
        <ListItem key={dog.id}>
          <Typography>
            {dog.name} ({dog.breed}), Age: {dog.age} - Owner: {dog.owner}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
};

export default DogList;