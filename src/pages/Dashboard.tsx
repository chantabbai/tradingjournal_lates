import React from 'react';
import { useQuery } from 'react-query';
import { fetchDashboardData } from '../api/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery('dashboardData', fetchDashboardData);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trading Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Profit/Loss"
          value={`$${data?.totalProfitLoss.toFixed(2)}`}
          icon={<DollarSign size={24} />}
          trend={data?.totalProfitLoss >= 0 ? 'up' : 'down'}
        />
        <DashboardCard
          title="Win Rate"
          value={`${(data?.winRate * 100).toFixed(2)}%`}
          icon={<TrendingUp size={24} />}
          trend="up"
        />
        <DashboardCard
          title="Total Trades"
          value={data?.totalTrades.toString()}
          icon={<TrendingDown size={24} />}
          trend="neutral"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Profit/Loss Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.profitLossOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="profit" fill="#4CAF50" />
            <Bar dataKey="loss" fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-md ${trendColor} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <div className={`mt-4 flex items-center ${trendColor}`}>
        {trend === 'up' && <TrendingUp size={20} className="mr-1" />}
        {trend === 'down' && <TrendingDown size={20} className="mr-1" />}
        <span className="text-sm font-medium">
          {trend === 'up' && 'Increasing'}
          {trend === 'down' && 'Decreasing'}
          {trend === 'neutral' && 'Stable'}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;