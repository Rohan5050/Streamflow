import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Clock, Users, BarChart, Settings, Plus } from 'lucide-react';

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    // Fetch workflows from API
    const fetchWorkflows = async () => {
      // Replace with actual API call
      setWorkflows([
        { id: 1, name: 'Monthly Team Payouts', status: 'active', recipients: 12, nextExecution: '2025-03-22' },
        { id: 2, name: 'Contributor Bounties', status: 'active', recipients: 8, nextExecution: '2025-03-19' },
        { id: 3, name: 'Marketing Budget', status: 'paused', recipients: 3, nextExecution: '2025-04-01' }
      ]);
    };
    
    fetchWorkflows();
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-4">
        <h1 className="text-xl font-bold mb-8">Streamflow</h1>
        <nav>
          <ul>
            <li onClick={() => setActiveTab('workflows')} className={`flex items-center p-3 rounded mb-2 cursor-pointer ${activeTab === 'workflows' ? 'bg-blue-700' : ''}`}>
              <Clock size={20} className="mr-3" />
              <span>Workflows</span>
            </li>
            <li onClick={() => setActiveTab('budgets')} className={`flex items-center p-3 rounded mb-2 cursor-pointer ${activeTab === 'budgets' ? 'bg-blue-700' : ''}`}>
              <CircleDollarSign size={20} className="mr-3" />
              <span>Budgets</span>
            </li>
            <li onClick={() => setActiveTab('recipients')} className={`flex items-center p-3 rounded mb-2 cursor-pointer ${activeTab === 'recipients' ? 'bg-blue-700' : ''}`}>
              <Users size={20} className="mr-3" />
              <span>Recipients</span>
            </li>
            <li onClick={() => setActiveTab('analytics')} className={`flex items-center p-3 rounded mb-2 cursor-pointer ${activeTab === 'analytics' ? 'bg-blue-700' : ''}`}>
              <BarChart size={20} className="mr-3" />
              <span>Analytics</span>
            </li>
            <li onClick={() => setActiveTab('settings')} className={`flex items-center p-3 rounded mb-2 cursor-pointer ${activeTab === 'settings' ? 'bg-blue-700' : ''}`}>
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Automated Workflows</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded"
          >
            <Plus size={18} className="mr-2" /> Create Workflow
          </button>
        </div>
        
        {/* Workflows Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Execution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workflow.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{workflow.recipients}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{workflow.nextExecution}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Pause</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-2/3 max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Create New Workflow</h3>
            <WorkflowCreator onClose={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// Workflow Creator Component
const WorkflowCreator = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [recipients] = useState([]);
  
  const handleSave = () => {
    // Save workflow logic
    onClose();
  };
  
  return (
    <div>
      {/* Step Navigation */}
      <div className="flex mb-6">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className="rounded-full border p-2 mr-2">1</div>
          <span>Basic Info</span>
        </div>
        <div className="border-t border-gray-300 flex-1 h-0 my-auto mx-2"></div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className="rounded-full border p-2 mr-2">2</div>
          <span>Recipients</span>
        </div>
        <div className="border-t border-gray-300 flex-1 h-0 my-auto mx-2"></div>
        <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className="rounded-full border p-2 mr-2">3</div>
          <span>Schedule</span>
        </div>
      </div>
      
      {/* Step Content */}
      {currentStep === 1 && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
            <input 
              type="text" 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="border rounded w-full p-2"
              placeholder="e.g. Monthly Team Payouts"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Type</label>
            <select 
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
              className="border rounded w-full p-2"
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <div className="border rounded p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Wallet Address</th>
                    <th className="text-left pb-2">Amount</th>
                    <th className="text-left pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-500">No recipients added yet</td>
                    </tr>
                  ) : (
                    recipients.map((recipient, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{recipient.address}</td>
                        <td className="py-2">{recipient.amount}</td>
                        <td className="py-2">
                          <button className="text-red-600">Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <button className="mt-4 bg-blue-600 text-white px-3 py-1 rounded text-sm">
                + Add Recipient
              </button>
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 3 && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Execution Schedule</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                <select className="border rounded w-full p-2">
                  <option>One-time</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input type="date" className="border rounded w-full p-2" />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Advanced Options</label>
            <div className="border rounded p-4">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="autoWithdraw" className="mr-2" />
                <label htmlFor="autoWithdraw">Enable automatic withdrawal</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="cancelable" className="mr-2" />
                <label htmlFor="cancelable">Allow sender to cancel stream</label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          onClick={onClose}
          className="border border-gray-300 rounded px-4 py-2 text-gray-700"
        >
          Cancel
        </button>
        <div>
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="border border-gray-300 rounded px-4 py-2 text-gray-700 mr-2"
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-blue-600 text-white rounded px-4 py-2"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="bg-blue-600 text-white rounded px-4 py-2"
            >
              Create Workflow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
