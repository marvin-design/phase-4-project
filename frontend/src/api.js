import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5555',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchOwners = () => API.get('/owners');
export const createOwner = (data) => API.post('/owners', data);
export const fetchDogs = () => API.get('/dogs');
export const createDog = (data) => API.post('/dogs', data);
export const fetchActivities = () => API.get('/activities');
export const createActivity = (data) => API.post('/activities', data);
export const assignActivity = (dogId, activityId, duration) => 
  API.post(`/dogs/${dogId}/activities/${activityId}`, { duration });