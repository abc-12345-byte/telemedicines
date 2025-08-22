"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, User, Video, FileText, Plus, Eye, Download, MessageCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        fetch('/api/patient/appointments'),
        fetch('/api/prescriptions')
      ]);

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }

      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const joinVideoCall = (appointment) => {
    // Navigate to the video call page
    router.push(`/video-call/${appointment.id}`);
  };

  const startDemoCall = () => {
    // Create a demo appointment for testing
    const demoAppointment = {
      id: 'demo-' + Date.now(),
      date: new Date().toISOString(),
      status: 'CONFIRMED',
      doctor: {
        user: { email: 'demo@doctor.com' },
        specialization: 'General Medicine'
      }
    };
    // For demo purposes, we'll use a test appointment ID
    router.push(`/video-call/demo-${Date.now()}`);
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadPrescription = async (prescription) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescription.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download prescription');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Prescription downloaded successfully!');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.firstName || 'Patient'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Upcoming Appointments</p>
            <p className="text-2xl font-bold text-blue-600">
              {appointments.filter(apt => 
                apt.status === 'CONFIRMED' && new Date(apt.date) > new Date()
              ).length}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={startDemoCall}
              className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Test Video Call</h3>
                <p className="text-sm text-gray-500">Try the video call feature</p>
              </div>
            </button>
            

          </div>
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
        </div>
        
        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled</p>
              <button
                onClick={startDemoCall}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Video className="w-4 h-4 mr-2" />
                Try Demo Video Call
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Dr. {appointment.doctor?.user?.email?.split('@')[0] || 'Doctor'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.doctor?.specialization || 'General Medicine'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Show video call button for all statuses for demo purposes */}
                      <button
                        onClick={() => joinVideoCall(appointment)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          appointment.status === 'CONFIRMED' 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>{appointment.status === 'CONFIRMED' ? 'Join Call' : 'Demo Call'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Prescriptions</h2>
        </div>
        
        <div className="p-6">
          {prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No prescriptions available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Dr. {prescription.doctor?.user?.email?.split('@')[0] || 'Doctor'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {prescription.diagnosis || 'No diagnosis provided'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(prescription.createdAt)}</span>
                          </div>
                          {prescription.medications && (
                            <span className="text-xs">
                              {JSON.parse(prescription.medications).length} medication(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadPrescription(prescription)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Prescription Details */}
                  {prescription.medications && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Medications:</h4>
                      <div className="space-y-2">
                        {JSON.parse(prescription.medications).map((med, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div><strong>Name:</strong> {med.name}</div>
                              <div><strong>Dosage:</strong> {med.dosage}</div>
                              <div><strong>Frequency:</strong> {med.frequency}</div>
                              <div><strong>Duration:</strong> {med.duration}</div>
                            </div>
                            {med.instructions && (
                              <div className="mt-2 text-sm">
                                <strong>Instructions:</strong> {med.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
