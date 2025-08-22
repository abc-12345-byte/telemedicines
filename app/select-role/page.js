"use client";

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';   // ⬅️ import useAuth
import { useRouter } from 'next/navigation';
import { User, UserCheck, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SelectRole() {
  const { user } = useUser();
  const { getToken } = useAuth();   // ⬅️ get Clerk token
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'DOCTOR',
      title: 'Doctor',
      description: 'Provide medical consultations and manage patient care',
      icon: UserCheck,
      color: 'bg-blue-500',
      features: [
        'Video consultations with patients',
        'Create electronic prescriptions',
        'Manage appointment schedule',
        'View patient medical history'
      ]
    },
    {
      id: 'PATIENT',
      title: 'Patient',
      description: 'Schedule appointments and receive medical care',
      icon: User,
      color: 'bg-green-500',
      features: [
        'Schedule appointments with doctors',
        'Join video consultations',
        'View prescriptions and medical records',
        'Receive appointment notifications'
      ]
    },
    {
      id: 'ADMIN',
      title: 'Administrator',
      description: 'Manage the platform and view analytics',
      icon: Shield,
      color: 'bg-purple-500',
      features: [
        'View platform analytics',
        'Manage users and appointments',
        'Monitor system performance',
        'Generate reports'
      ]
    }
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setIsLoading(true);

    try {
      // Ensure user is available
      if (!user) {
        toast.error('Please sign in first');
        return;
      }

      // Get Clerk token (optional header)
      const token = await getToken();

      const email =
        user?.emailAddresses?.[0]?.emailAddress ||
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddress ||
        '';

      const response = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          role: selectedRole,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save role');
      }

      toast.success('Role selected successfully!');
      
      // Redirect based on role
      switch (selectedRole) {
        case 'DOCTOR':
          router.push('/complete-profile');
          break;
        case 'PATIENT':
          router.push('/complete-patient-profile');
          break;
        case 'ADMIN':
          router.push('/admin-dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role selection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Choose your role to get started. You&apos;ll be able to access features specific to your role.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-4 ring-blue-500 ring-opacity-50 transform scale-105'
                    : 'hover:shadow-lg hover:scale-105'
                }`}
              >
                <div className="bg-white rounded-xl shadow-md p-8 h-full">
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    {role.description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">What you can do:</h4>
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className={`inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              selectedRole && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            You can change your role later by contacting support
          </p>
        </div>
      </div>
    </div>
  );
}
