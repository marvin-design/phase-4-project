import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { TextField, Button, Box } from '@mui/material';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  breed: Yup.string().required('Required'),
  age: Yup.number().positive('Must be positive').required('Required'),
  owner_name: Yup.string().required('Required'),
});

const DogForm = ({ onSuccess }) => {
  return (
    <Formik
      initialValues={{ name: '', breed: '', age: 0, owner_name: '' }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        axios.post('http://localhost:5555/dogs', values)
          .then(() => {
            resetForm();
            onSuccess();
          })
          .catch(console.error)
          .finally(() => setSubmitting(false));
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Field name="name" as={TextField} label="Dog Name" />
            <ErrorMessage name="name" component="div" />
            
            <Field name="breed" as={TextField} label="Breed" />
            <ErrorMessage name="breed" component="div" />
            
            <Field name="age" as={TextField} type="number" label="Age" />
            <ErrorMessage name="age" component="div" />
            
            <Field name="owner_name" as={TextField} label="Owner Name" />
            <ErrorMessage name="owner_name" component="div" />
            
            <Button type="submit" disabled={isSubmitting}>
              Add Dog
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default DogForm;