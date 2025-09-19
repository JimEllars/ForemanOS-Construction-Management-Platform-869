import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { useStore } from '../../store';
// import { invoiceService } from '../../services/invoiceService'; // To be created
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const { FiPlus, FiTrash2, FiSave, FiDollarSign, FiDownload } = FiIcons;

const InvoiceBuilder: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { clients, projects, company } = useStore(state => ({
    clients: state.data.clients,
    projects: state.data.projects,
    company: state.auth.company,
  }));

  const [invoiceDetails, setInvoiceDetails] = useState({
    client_id: '',
    project_id: null,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit_price: 0 },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // useEffect to fetch invoice data in edit mode would go here

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceDetails(prev => ({ ...prev, [name]: value || null }));
  };

  const handleLineItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const list = [...lineItems];
    list[index][name] = value;
    setLineItems(list);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index: number) => {
    const list = [...lineItems];
    list.splice(index, 1);
    setLineItems(list);
  };

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => {
      const quantity = parseFloat(String(item.quantity)) || 0;
      const unitPrice = parseFloat(String(item.unit_price)) || 0;
      return acc + (quantity * unitPrice);
    }, 0);

    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [lineItems]);

  const handleSave = async () => {
    setIsSaving(true);
    console.log("Saving invoice...", { invoiceDetails, lineItems, totals });
    // This will call invoiceService.createInvoice or updateInvoice
    await new Promise(res => setTimeout(res, 1000)); // Simulate save
    setIsSaving(false);
    navigate('/app/invoices');
  };

  const handleDownloadPdf = () => {
    console.log("Simulating PDF download for invoice...");
    alert("PDF download is not yet implemented. This is a placeholder.");
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message={invoiceId ? "Loading invoice..." : "Preparing invoice builder..."} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{invoiceId ? "Edit Invoice" : "Create New Invoice"}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client_id" className="block text-sm font-medium">Client</label>
                <select id="client_id" name="client_id" value={invoiceDetails.client_id} onChange={handleDetailChange} className="mt-1 block w-full form-select">
                  <option value="">Select a client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="project_id" className="block text-sm font-medium">Project (Optional)</label>
                <select id="project_id" name="project_id" value={invoiceDetails.project_id || ''} onChange={handleDetailChange} className="mt-1 block w-full form-select">
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium">Issue Date</label>
                <Input type="date" id="issue_date" name="issue_date" value={invoiceDetails.issue_date} onChange={handleDetailChange} />
              </div>
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium">Due Date</label>
                <Input type="date" id="due_date" name="due_date" value={invoiceDetails.due_date || ''} onChange={handleDetailChange} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
                <textarea id="notes" name="notes" value={invoiceDetails.notes || ''} onChange={handleDetailChange} rows={3} className="mt-1 block w-full form-textarea"></textarea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Totals */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>Subtotal:</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (8%):</span><span>${totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${totals.total.toFixed(2)}</span></div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                {isSaving ? 'Saving...' : <><SafeIcon icon={FiSave} className="mr-2" /> Save Invoice</>}
              </Button>
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
              <div key={index} className="flex items-center gap-4">
                <div className="flex-grow">
                  <Input type="text" name="description" placeholder="Item description" value={item.description} onChange={e => handleLineItemChange(index, e)} />
                </div>
                <div className="w-24">
                  <Input type="number" name="quantity" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(index, e)} />
                </div>
                <div className="w-32">
                  <Input type="number" name="unit_price" placeholder="Unit Price" value={item.unit_price} onChange={e => handleLineItemChange(index, e)} />
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

export default InvoiceBuilder;
