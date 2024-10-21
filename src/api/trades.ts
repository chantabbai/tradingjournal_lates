import axios from 'axios';

const API_URL = 'http://localhost:8080/api/trades'; // Replace with your actual API URL

export const fetchTrades = async (status: 'open' | 'closed') => {
  const response = await axios.get(`${API_URL}/${status}`);
  return response.data;
};

export const addTrade = async (trade: any) => {
  const response = await axios.post(`${API_URL}`, trade);
  return response.data;
};

export const updateTrade = async (trade: any) => {
  const response = await axios.put(`${API_URL}/${trade.id}`, trade);
  return response.data;
};

export const deleteTrade = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};

export const closeTrade = async ({ id, exit }: { id: string; exit: any }) => {
  const response = await axios.post(`${API_URL}/${id}/close`, exit);
  return response.data;
};

export const fetchProfitLoss = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}/profit-loss`);
  return response.data;
};

export const importTrades = async (formData: FormData) => {
  const response = await axios.post(`${API_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};