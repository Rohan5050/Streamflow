import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircleDollarSign, Clock, Users, BarChart, Settings, Plus, CheckCircle } from 'lucide-react';

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  
  const fetchWorkflows = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/workflows');
      if (response.data) {
        setWorkflows(response.data);
      } else {
        console.warn('No workflow data received');
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setWorkflows([]);
    }
  };
  
  useEffect(() => {
    fetchWorkflows();
  }, []);
  
  const handleToggleStatus = async (workflowId) => {
    try {
      await axios.patch(`http://localhost:3001/api/workflows/${workflowId}/toggle-status`);
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow status:', error);
    }
  };

  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowCreateModal(true);
  };
  
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedWorkflow(null);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-8 flex items-center">
          <span className="bg-white text-indigo-900 p-1 rounded mr-2">SF</span>
          Streamflow
        </h1>
        <nav>
          <ul className="space-y-1">
            <li onClick={() => setActiveTab('workflows')} className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 hover:bg-indigo-800 ${activeTab === 'workflows' ? 'bg-indigo-800 shadow-md' : ''}`}>
              <Clock size={20} className="mr-3" />
              <span>Workflows</span>
            </li>
            <li onClick={() => setActiveTab('budgets')} className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 hover:bg-indigo-800 ${activeTab === 'budgets' ? 'bg-indigo-800 shadow-md' : ''}`}>
              <CircleDollarSign size={20} className="mr-3" />
              <span>Budgets</span>
            </li>
            <li onClick={() => setActiveTab('recipients')} className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 hover:bg-indigo-800 ${activeTab === 'recipients' ? 'bg-indigo-800 shadow-md' : ''}`}>
              <Users size={20} className="mr-3" />
              <span>Recipients</span>
            </li>
            <li onClick={() => setActiveTab('analytics')} className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 hover:bg-indigo-800 ${activeTab === 'analytics' ? 'bg-indigo-800 shadow-md' : ''}`}>
              <BarChart size={20} className="mr-3" />
              <span>Analytics</span>
            </li>
            <li onClick={() => setActiveTab('settings')} className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 hover:bg-indigo-800 ${activeTab === 'settings' ? 'bg-indigo-800 shadow-md' : ''}`}>
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Automated Workflows</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" /> Create Workflow
          </button>
        </div>
        
        {/* Workflows Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Execution</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <Clock size={40} className="text-gray-300 mb-2" />
                      <p>No workflows found. Create one to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workflow.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{workflow.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {workflow.status === 'active' ? 
                          <><CheckCircle size={12} className="mr-1" /> Active</> : 
                          <>Paused</>
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-gray-400" />
                        {workflow.recipients.length} Recipients
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{workflow.nextExecution || 'Not scheduled'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 font-medium mr-3 transition-colors duration-150"
                        onClick={() => handleEditWorkflow(workflow)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`${workflow.status === 'active' ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'} font-medium transition-colors duration-150`}
                        onClick={() => handleToggleStatus(workflow.id)}
                      >
                        {workflow.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create/Edit Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-2/3 max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-xl font-bold mb-6 border-b pb-3">
              {selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
            </h3>
            <WorkflowCreator 
              onClose={handleCloseModal} 
              onWorkflowCreated={fetchWorkflows} 
              existingWorkflow={selectedWorkflow}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Workflow Creator Component
const WorkflowCreator = ({ onClose, onWorkflowCreated, existingWorkflow }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowName, setWorkflowName] = useState(existingWorkflow?.name || '');
  const [workflowType, setWorkflowType] = useState(existingWorkflow?.type || '');
  const [recipients, setRecipients] = useState(existingWorkflow?.recipients || []);
  const [newRecipient, setNewRecipient] = useState({ walletAddress: '', amount: '' });
  const [frequency, setFrequency] = useState(existingWorkflow?.schedule?.frequency || 'monthly');
  
  const [startDate, setStartDate] = useState(
    existingWorkflow?.schedule?.startDate 
      ? new Date(existingWorkflow.schedule.startDate) // Store Date object
      : new Date()
  );
  
  const addRecipient = () => {
    if (newRecipient.walletAddress && newRecipient.amount) {
      setRecipients([...recipients, { 
        walletAddress: newRecipient.walletAddress, 
        amount: parseFloat(newRecipient.amount) 
      }]);
      setNewRecipient({ walletAddress: '', amount: '' });
    }
  };
  
  const removeRecipient = (index) => {
    const updatedRecipients = [...recipients];
    updatedRecipients.splice(index, 1);
    setRecipients(updatedRecipients);
  };
  
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!workflowName) {
        alert('Workflow name is required');
        setCurrentStep(1);
        return;
      }
      
      if (!workflowType) {
        alert('Workflow type is required');
        setCurrentStep(1);
        return;
      }
      
      if (recipients.length === 0) {
        alert('At least one recipient is required');
        setCurrentStep(2);
        return;
      }
      
      if (!startDate) {
        alert('Start date is required');
        setCurrentStep(3);
        return;
      }
      
      // Format the data to match backend Zod schema
      const workflowData = {
        name: workflowName,
        type: workflowType,
        recipients: recipients,
        schedule: {
          frequency: frequency,
          startDate: new Date(startDate).toISOString()
        }
      };
      
      if (existingWorkflow) {
        // Update existing workflow
        await axios.put(`http://localhost:3001/api/workflows/${existingWorkflow.id}`, workflowData);
      } else {
        // Create new workflow
        await axios.post('http://localhost:3001/api/workflows', workflowData);
      }
      
      onWorkflowCreated(); // Refresh workflows list
      onClose(); // Close modal
    } catch (error) {
      console.error('Error saving workflow:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        if (error.response.data.errors) {
          alert(`Validation error: ${JSON.stringify(error.response.data.errors)}`);
        } else {
          alert(`Error: ${error.response.data.message || 'Unknown error'}`);
        }
      } else {
        alert('Error saving workflow. Please check your network connection.');
      }
    }
  };
  
  // Check if valid to move to next step
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return workflowName && workflowType;
    }
    if (currentStep === 2) {
      return recipients.length > 0;
    }
    return true;
  };
  
  return (
    <div>
      {/* Step Navigation */}
      <div className="flex mb-8">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`rounded-full border h-10 w-10 flex items-center justify-center mr-2 ${
            currentStep >= 1 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
          }`}>1</div>
          <span className="font-medium">Basic Info</span>
        </div>
        <div className="border-t border-gray-300 flex-1 h-0 my-auto mx-2"></div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`rounded-full border h-10 w-10 flex items-center justify-center mr-2 ${
            currentStep >= 2 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
          }`}>2</div>
          <span className="font-medium">Recipients</span>
        </div>
        <div className="border-t border-gray-300 flex-1 h-0 my-auto mx-2"></div>
        <div className={`flex items-center ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
          <div className={`rounded-full border h-10 w-10 flex items-center justify-center mr-2 ${
            currentStep >= 3 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
          }`}>3</div>
          <span className="font-medium">Schedule</span>
        </div>
      </div>
      
      {/* Step Content */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name *</label>
            <input 
              type="text" 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
              placeholder="e.g. Monthly Team Payouts"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Type *</label>
            <select 
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
              required
            >
              <option value="">Select a type</option>
              <option value="fixed">Fixed Distribution</option>
              <option value="percentage">Percentage Distribution</option>
              <option value="milestone">Milestone-based</option>
            </select>
          </div>
        </div>
      )}
      
      {currentStep === 2 && (
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients *</label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="mb-4 space-y-3">
                <input 
                  type="text" 
                  placeholder="Wallet Address"
                  value={newRecipient.walletAddress}
                  onChange={(e) => setNewRecipient({...newRecipient, walletAddress: e.target.value})}
                  className="border border-gray-300 rounded-lg w-full p-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                />
                <input 
                  type="number" 
                  placeholder="Amount"
                  value={newRecipient.amount}
                  onChange={(e) => setNewRecipient({...newRecipient, amount: e.target.value})}
                  className="border border-gray-300 rounded-lg w-full p-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                />
                <button 
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={addRecipient}
                  disabled={!newRecipient.walletAddress || !newRecipient.amount}
                >
                  Add Recipient
                </button>
              </div>

              {recipients.length === 0 ? (
                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Users size={24} className="mx-auto mb-2 text-gray-400" />
                  No recipients added yet
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-800">{recipient.walletAddress}</div>
                        <div className="text-sm text-gray-500">{recipient.amount} tokens</div>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-700 transition-colors duration-150"
                        onClick={() => removeRecipient(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Execution Schedule *</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                <select 
                  className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date *</label>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advanced Options</label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-3">
                <input type="checkbox" id="autoWithdraw" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded mr-3" />
                <label htmlFor="autoWithdraw" className="text-gray-700">Enable automatic withdrawal</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="cancelable" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded mr-3" />
                <label htmlFor="cancelable" className="text-gray-700">Allow sender to cancel stream</label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button 
          onClick={onClose}
          className="border border-gray-300 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <div>
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="border border-gray-300 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 mr-2"
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-indigo-600 text-white rounded-lg px-5 py-2 hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canProceedToNextStep()}
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white rounded-lg px-5 py-2 hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!startDate}
            >
              {existingWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
