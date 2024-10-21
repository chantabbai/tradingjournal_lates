import axios from 'axios';

const API_URL = 'http://localhost:8080/api/trades'; // Replace with your actual API URL

export const fetchDashboardData = async () => {
  const response = await axios.get(`${API_URL}/dashboard`);
  return response.data;
};