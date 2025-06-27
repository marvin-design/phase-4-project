import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, MenuItem } from '@mui/material';
import { createDog, fetchOwners } from '../api';
import { useEffect, useState } from 'react';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z ]+$/, 'Only letters allowed'),
  breed: Yup.string().required('Breed is required'),
  age: Yup.number()
    .min(0, 'Age must be positive')
    .required('Age is required'),
  owner_id: Yup.number().required('Owner is required')
});

export default function DogForm({ onSuccess }) {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchOwners().then(res => setOwners(res.data));
  }, []);

  return (
    <Formik
      initialValues={{ name: '', breed: '', age: 0, owner_id: '' }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        createDog(values)
          .then(() => {
            onSuccess();
            setSubmitting(false);
          })
          .catch(console.error);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="name" as={TextField} label="Dog Name" fullWidth margin="normal" />
          <ErrorMessage name="name" component="div" className="error" />
          
          <Field name="breed" as={TextField} label="Breed" fullWidth margin="normal" />
          <ErrorMessage name="breed" component="div" className="error" />
          
          <Field name="age" as={TextField} type="number" label="Age" fullWidth margin="normal" />
          <ErrorMessage name="age" component="div" className="error" />
          
          <Field name="owner_id" as={TextField} select label="Owner" fullWidth margin="normal">
            <MenuItem value=""><em>Select Owner</em></MenuItem>
            {owners.map(owner => (
              <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>
            ))}
          </Field>
          <ErrorMessage name="owner_id" component="div" className="error" />
          
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Add Dog
          </Button>
        </Form>
      )}
    </Formik>
  );
}