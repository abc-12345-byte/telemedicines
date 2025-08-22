"use client";

import { useState, useEffect } from 'react';

export default function MonitorPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitor/patients');
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrity = async () => {
    try {
      const response = await fetch('/api/monitor/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'check_integrity' }),
      });
      const result = await response.json();
      
      if (response.ok) {
        alert(`Integrity Check Results:\n- Orphaned Patients: ${result.integrity.orphanedPatients}\n- Users without Patients: ${result.integrity.usersWithoutPatients}`);
      } else {
        alert('Integrity check failed: ' + result.error);
      }
    } catch (err) {
      alert('Integrity check error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Database Monitor</h1>
              <p className="text-gray-600">Real-time monitoring of patient records</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={checkIntegrity}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Check Integrity
              </button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdate}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Patients:</span>
                  <span className="font-semibold text-blue-600">{data.totalPatients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users:</span>
                  <span className="font-semibold text-green-600">{data.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="text-sm text-gray-500">{new Date(data.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Patient List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Records ({data.patients.length})</h2>
              {data.patients.length === 0 ? (
                <p className="text-gray-500">No patient records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.patients.map((patient, index) => (
                        <tr key={patient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-sm text-gray-900 font-mono">{patient.id.slice(0, 8)}...</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{patient.userEmail}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{patient.address || 'N/A'}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{patient.phoneNumber || 'N/A'}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{new Date(patient.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


