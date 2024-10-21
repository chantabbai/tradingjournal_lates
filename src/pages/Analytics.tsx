import React from 'react';
import { useQuery } from 'react-query';
import { fetchAnalyticsData } from '../api/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics: React.FC = () => {
  const { data, isLoading, error } = useQuery('analyticsData', fetchAnalyticsData);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trading Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cumulative Profit/Loss</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.cumulativeProfitLoss}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Win/Loss Ratio</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.winLossRatio}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data?.winLossRatio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Average Trade Duration</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.averageTradeDuration}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="duration" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Performing Symbols</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.topPerformingSymbols}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data?.topPerformingSymbols.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard title="Total Profit/Loss" value={`$${data?.totalProfitLoss.toFixed(2)}`} />
          <KPICard title="Win Rate" value={`${(data?.winRate * 100).toFixed(2)}%`} />
          <KPICard title="Average Profit per Trade" value={`$${data?.averageProfitPerTrade.toFixed(2)}`} />
          <KPICard title="Largest Win" value={`$${data?.largestWin.toFixed(2)}`} />
          <KPICard title="Largest Loss" value={`$${data?.largestLoss.toFixed(2)}`} />
          <KPICard title="Sharpe Ratio" value={data?.sharpeRatio.toFixed(2)} />
        </div>
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};

export default Analytics;