"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Calendar, User, Shield, Home, Menu, X, Bell, Search, Video, MessageCircle } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'DOCTOR':
        return '/doctor-dashboard';
      case 'PATIENT':
        return '/patient-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/select-role';
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'DOCTOR':
        return 'Doctor Dashboard';
      case 'PATIENT':
        return 'Patient Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      default:
        return 'Select Role';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">MediConnect</span>
                <span className="text-xs text-gray-500 block -mt-1">Professional</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <SignedIn>
              {!isLoading && (
                <>
                  <Link 
                    href="/" 
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  
                  {/* Dashboard Links */}
                  <div className="flex items-center space-x-2">
                    <Link 
                      href="/admin-dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                    
                    <Link 
                      href="/doctor-dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>Doctor</span>
                    </Link>
                    
                    <Link 
                      href="/patient-dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Patient</span>
                    </Link>
                    
                    <Link 
                      href="/test-video" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <Video className="w-4 h-4" />
                      <span>Test Video</span>
                    </Link>
                  </div>

                  {!userRole && (
                    <Link 
                      href="/select-role" 
                      className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <span>Get Started</span>
                    </Link>
                  )}
                </>
              )}
            </SignedIn>
            
            <SignedOut>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                
                <SignInButton>
                  <button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-6 py-2 rounded-lg text-sm font-medium shadow-sm">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <div className="flex items-center space-x-3">
                {/* Video Call Quick Access */}
                {(userRole === 'DOCTOR' || userRole === 'PATIENT') && (
                  <Link
                    href={userRole === 'DOCTOR' ? '/doctor-dashboard' : '/patient-dashboard'}
                    className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 transition-colors px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    <Video className="w-4 h-4" />
                    <span>Video Call</span>
                  </Link>
                )}
                

                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full shadow-sm"
                    }
                  }}
                />
              </div>
            </SignedIn>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <SignedIn>
                {!isLoading && (
                  <>
                    <Link 
                      href="/" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </Link>
                    
                    {/* Dashboard Links */}
                    <Link 
                      href="/admin-dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                    
                    <Link 
                      href="/doctor-dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Doctor Dashboard</span>
                    </Link>
                    
                    <Link 
                      href="/patient-dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Patient Dashboard</span>
                    </Link>
                    
                    {/* Video Call Quick Access for Mobile */}
                    {(userRole === 'DOCTOR' || userRole === 'PATIENT') && (
                      <Link
                        href={userRole === 'DOCTOR' ? '/doctor-dashboard' : '/patient-dashboard'}
                        className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 transition-colors px-3 py-2 rounded-lg text-sm font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Video className="w-4 h-4" />
                        <span>Video Call</span>
                      </Link>
                    )}
                    


                    {!userRole && (
                      <Link 
                        href="/select-role" 
                        className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Get Started</span>
                      </Link>
                    )}
                  </>
                )}
              </SignedIn>
              
              <SignedOut>
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className="block text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  
                  <SignInButton>
                    <button 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

