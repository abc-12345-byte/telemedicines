import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { 
  Video, 
  FileText, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Stethoscope,
  Smartphone,
  BarChart3,
  Zap,
  Globe,
  Award
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 border border-blue-400/30 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                Enterprise-Grade Telemedicine Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Professional
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Healthcare</span>
                <br />
                Management
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Streamline your healthcare practice with our comprehensive telemedicine platform. 
                Built for healthcare professionals who demand excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SignedOut>
                  <SignInButton>
                    <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      Start Free Trial
                    </button>
                  </SignInButton>
                </SignedOut>
                
                <SignedIn>
                  <Link 
                    href="/select-role"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                  >
                    Access Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </SignedIn>
                
                <Link 
                  href="#features"
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold text-blue-400">10K+</div>
                  <div className="text-sm text-gray-300">Healthcare Providers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400">50K+</div>
                  <div className="text-sm text-gray-300">Patients Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">99.9%</div>
                  <div className="text-sm text-gray-300">Uptime</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <Video className="w-8 h-8 text-blue-400 mb-2" />
                    <h3 className="font-semibold text-white">Video Calls</h3>
                    <p className="text-sm text-gray-300">HD Quality</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <FileText className="w-8 h-8 text-green-400 mb-2" />
                    <h3 className="font-semibold text-white">E-Prescriptions</h3>
                    <p className="text-sm text-gray-300">Digital Records</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
                    <h3 className="font-semibold text-white">Analytics</h3>
                    <p className="text-sm text-gray-300">Real-time Data</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <Shield className="w-8 h-8 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white">Security</h3>
                    <p className="text-sm text-gray-300">HIPAA Compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Features for Modern Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed to streamline your healthcare practice and enhance patient care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Video Consultations */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Professional Video Consultations
              </h3>
              <p className="text-gray-600 mb-6">
                High-definition video calls with advanced features like screen sharing, recording, and virtual waiting rooms.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  HD video quality with noise cancellation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Screen sharing for medical records
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Virtual waiting rooms and scheduling
                </li>
              </ul>
            </div>

            {/* Electronic Prescriptions */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Digital Prescription Management
              </h3>
              <p className="text-gray-600 mb-6">
                Complete electronic prescription system with medication tracking, refill management, and pharmacy integration.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Instant prescription delivery
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Medication interaction checking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Automated refill reminders
                </li>
              </ul>
            </div>

            {/* Analytics Dashboard */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Advanced Analytics & Reporting
              </h3>
              <p className="text-gray-600 mb-6">
                Comprehensive analytics dashboard with real-time insights, performance metrics, and business intelligence.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Real-time performance metrics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Custom report generation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Patient engagement analytics
                </li>
              </ul>
            </div>

            {/* Security & Compliance */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Enterprise Security & Compliance
              </h3>
              <p className="text-gray-600 mb-6">
                Bank-level security with full HIPAA compliance, data encryption, and audit trails for healthcare regulations.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  HIPAA & GDPR compliant
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Complete audit trails
                </li>
              </ul>
            </div>

            {/* 24/7 Availability */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                24/7 Platform Availability
              </h3>
              <p className="text-gray-600 mb-6">
                Round-the-clock platform availability with automatic scaling, backup systems, and disaster recovery.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  99.9% uptime guarantee
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Automatic scaling
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Global CDN distribution
                </li>
              </ul>
            </div>

            {/* Multi-Platform */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Multi-Platform Access
              </h3>
              <p className="text-gray-600 mb-6">
                Access your practice from anywhere with our responsive web platform and mobile-optimized interface.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Responsive web design
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Mobile-optimized interface
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  Cross-browser compatibility
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Practice?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of healthcare professionals who trust MediConnect for their telemedicine needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignInButton>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <Link 
                href="/select-role"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
              >
                Access Platform
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <span className="font-semibold text-xl">MediConnect</span>
                  <span className="text-xs text-gray-400 block">Professional</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Enterprise-grade telemedicine platform designed for healthcare professionals who demand excellence.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs">📧</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs">📱</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs">💬</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Healthcare Providers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Practice Management</li>
                <li>Patient Scheduling</li>
                <li>Video Consultations</li>
                <li>Prescription Tools</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Patients</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Find Doctors</li>
                <li>Book Appointments</li>
                <li>Video Consultations</li>
                <li>Prescription Access</li>
                <li>Medical Records</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support & Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>API Documentation</li>
                <li>Security & Compliance</li>
                <li>Training Resources</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 MediConnect Professional. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
