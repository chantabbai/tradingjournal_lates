import axios from 'axios';

const API_URL = 'https://api.example.com'; // Replace with your actual API URL

export const fetchAnalyticsData = async () => {
  const response = await axios.get(`${API_URL}/analytics`);
  return response.data;
};