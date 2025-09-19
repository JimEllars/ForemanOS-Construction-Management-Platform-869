import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { quoteService } from '../../services/quoteService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const { FiFileText, FiPlus } = FiIcons;

const QuotesScreen: React.FC = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoading(true);
      try {
        const data = await quoteService.getQuotesByCompany();
        setQuotes(data);
      } catch (error) {
        console.error("Failed to fetch quotes", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
      case 'invoiced':
        return 'bg-success-100 text-success-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-danger-100 text-danger-700';
      default: // draft
        return 'bg-secondary-100 text-secondary-700';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading quotes..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Quotes</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Create and manage your project quotes.</p>
        </div>
        <Button asChild>
          <Link to="/app/quotes/new">
            <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
            New Quote
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Quote #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Issue Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      <Link to={`/app/quotes/edit/${quote.id}`}>{quote.quote_number}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{quote.clients_fos2025.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">${parseFloat(quote.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{new Date(quote.issue_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/app/quotes/edit/${quote.id}`} className="text-primary-600 hover:text-primary-900">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {quotes.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-medium">No quotes found</h3>
              <p className="text-sm text-secondary-500 mb-4">Get started by creating your first quote.</p>
              <Button asChild>
                <Link to="/app/quotes/new">
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                  Create Quote
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotesScreen;
