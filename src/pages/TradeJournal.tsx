import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchTrades, addTrade, updateTrade, deleteTrade, closeTrade, importTrades } from '../api/trades';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit2, Trash2, Upload } from 'lucide-react';
import { Tab } from '@headlessui/react';

type Trade = {
  id: string;
  symbol: string;
  entryDate: string;
  instrumentType: 'stock' | 'option';
  optionType: 'call' | 'put' | null;
  quantity: number;
  entryPrice: number;
  strategy: string;
  isOpen: boolean;
  exits: Exit[];
  notes: string;
};

type Exit = {
  date: string;
  quantity: number;
  price: number;
};

type TradeFormData = Omit<Trade, 'id' | 'isOpen' | 'exits'>;

const TradeJournal: React.FC = () => {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTab, setSelectedTab] = useState<'open' | 'closed'>('open');
  const { register, handleSubmit, reset, setValue } = useForm<TradeFormData>();
  const queryClient = useQueryClient();

  const { data: trades, isLoading, error } = useQuery(['trades', selectedTab], () => fetchTrades(selectedTab));

  const addTradeMutation = useMutation(addTrade, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trades', 'open']);
      reset();
    },
  });

  const updateTradeMutation = useMutation(updateTrade, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trades', selectedTab]);
      setEditingTrade(null);
      reset();
    },
  });

  const deleteTradeMutation = useMutation(deleteTrade, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trades', selectedTab]);
    },
  });

  const closeTradeMutation = useMutation(closeTrade, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trades', selectedTab]);
    },
  });

  const importTradesMutation = useMutation(importTrades, {
    onSuccess: () => {
      queryClient.invalidateQueries(['trades', 'open']);
    },
  });

  const onSubmit = (data: TradeFormData) => {
    if (editingTrade) {
      updateTradeMutation.mutate({ id: editingTrade.id, ...data });
    } else {
      addTradeMutation.mutate(data);
    }
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    Object.keys(trade).forEach((key) => {
      setValue(key as keyof TradeFormData, trade[key as keyof Trade]);
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      deleteTradeMutation.mutate(id);
    }
  };

  const handleClose = (id: string) => {
    const exit = {
      date: new Date().toISOString().split('T')[0],
      quantity: 0,
      price: 0,
    };
    closeTradeMutation.mutate({ id, exit });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      importTradesMutation.mutate(formData);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trade Journal</h1>

      <Tab.Group onChange={(index) => setSelectedTab(index === 0 ? 'open' : 'closed')}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
             ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>
            Open Trades
          </Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
             ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>
            Closed Trades
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <TradeTable trades={trades} onEdit={handleEdit} onDelete={handleDelete} onClose={handleClose} />
          </Tab.Panel>
          <Tab.Panel>
            <TradeTable trades={trades} onEdit={handleEdit} onDelete={handleDelete} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">Symbol</label>
            <input
              type="text"
              id="symbol"
              {...register('symbol', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">Entry Date</label>
            <input
              type="date"
              id="entryDate"
              {...register('entryDate', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="instrumentType" className="block text-sm font-medium text-gray-700">Instrument Type</label>
            <select
              id="instrumentType"
              {...register('instrumentType', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="stock">Stock</option>
              <option value="option">Option</option>
            </select>
          </div>
          <div>
            <label htmlFor="optionType" className="block text-sm font-medium text-gray-700">Option Type</label>
            <select
              id="optionType"
              {...register('optionType')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">N/A</option>
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="quantity"
              {...register('quantity', { required: true, min: 1 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700">Entry Price</label>
            <input
              type="number"
              id="entryPrice"
              step="0.01"
              {...register('entryPrice', { required: true, min: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700">Strategy</label>
            <input
              type="text"
              id="strategy"
              {...register('strategy', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {editingTrade ? 'Update Trade' : 'Add Trade'}
          <PlusCircle className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-4">
        <label htmlFor="importFile" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
          Import Trades
          <Upload className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </label>
        <input
          type="file"
          id="importFile"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
};

const TradeTable: React.FC<{
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onClose?: (id: string) => void;
}> = ({ trades, onEdit, onDelete, onClose }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trades?.map((trade) => (
            <tr key={trade.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.symbol}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(trade.entryDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {trade.instrumentType} {trade.optionType && `(${trade.optionType})`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${trade.entryPrice.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.strategy}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <ProfitLoss tradeId={trade.id} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(trade)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(trade.id)}
                  className="text-red-600 hover:text-red-900 mr-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                {onClose && trade.isOpen && (
                  <button
                    onClick={() => onClose(trade.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Close
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProfitLoss: React.FC<{ tradeId: string }> = ({ tradeId }) => {
  const { data, isLoading } = useQuery(['profitLoss', tradeId], () => fetchProfitLoss(tradeId));

  if (isLoading) return <span>Calculating...</span>;

  const { profitLoss, profitLossPercentage } = data;
  const isProfit = profitLoss >= 0;
  const color = isProfit ? 'text-green-600' : 'text-red-600';

  return (
    <span className={color}>
      {profitLossPercentage.toFixed(2)}% (${Math.abs(profitLoss).toFixed(2)})
    </span>
  );
};

export default TradeJournal;