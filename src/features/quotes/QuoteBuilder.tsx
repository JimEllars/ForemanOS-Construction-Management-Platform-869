import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiPlus, FiTrash2, FiSave, FiDollarSign, FiDownload } = FiIcons;

// This would typically come from the store or be passed as a prop
const mockClients = [{ id: 'client-1', name: 'Metro Development Corp' }];
const mockProjects = [{ id: 'project-1', name: 'Downtown Office Building' }];

const QuoteBuilder: React.FC = () => {
  const [quoteDetails, setQuoteDetails] = useState({
    clientId: '',
    projectId: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: 0 },
  ]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuoteDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const list = [...lineItems];
    list[index][name] = value;
    setLineItems(list);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    const list = [...lineItems];
    list.splice(index, 1);
    setLineItems(list);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return acc + (quantity * unitPrice);
    }, 0);

    // Assuming a simple tax for now
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    console.log("Saving quote...", { quoteDetails, lineItems, totals });
    // This would call quoteService.createQuote or updateQuote
  };

  const handleDownloadPdf = () => {
    console.log("Simulating PDF download for quote...");
    alert("PDF download is not yet implemented. This is a placeholder.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Quote</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Quote Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium">Client</label>
                <select id="clientId" name="clientId" value={quoteDetails.clientId} onChange={handleDetailChange} className="mt-1 block w-full form-select">
                  <option value="">Select a client</option>
                  {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium">Project (Optional)</label>
                <select id="projectId" name="projectId" value={quoteDetails.projectId} onChange={handleDetailChange} className="mt-1 block w-full form-select">
                  <option value="">Select a project</option>
                  {mockProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium">Issue Date</label>
                <Input type="date" id="issueDate" name="issueDate" value={quoteDetails.issueDate} onChange={handleDetailChange} />
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium">Expiry Date</label>
                <Input type="date" id="expiryDate" name="expiryDate" value={quoteDetails.expiryDate} onChange={handleDetailChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Totals */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>Subtotal:</span><span>${totals.subtotal}</span></div>
              <div className="flex justify-between"><span>Tax (8%):</span><span>${totals.tax}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${totals.total}</span></div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleSave} className="w-full"><SafeIcon icon={FiSave} className="mr-2" /> Save Quote</Button>
              <Button onClick={handleDownloadPdf} variant="outline" className="w-full"><SafeIcon icon={FiDownload} className="mr-2" /> Download PDF</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Line Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="flex-grow">
                  <Input type="text" name="description" placeholder="Item description" value={item.description} onChange={e => handleLineItemChange(index, e)} />
                </div>
                <div className="w-24">
                  <Input type="number" name="quantity" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, e)} />
                </div>
                <div className="w-32">
                  <Input type="number" name="unitPrice" placeholder="Unit Price" value={item.unitPrice} onChange={e => handleLineItemChange(index, e)} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeLineItem(index)} className="text-danger-500">
                  <SafeIcon icon={FiTrash2} />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addLineItem} className="mt-4">
            <SafeIcon icon={FiPlus} className="mr-2" /> Add Line Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteBuilder;
