'use client'

import Link from 'next/link';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
          <FileQuestion className="w-12 h-12 text-blue-600" />
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        
        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          The page might have been removed, renamed, or doesn&apos;t exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Or try one of these pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Login
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/register"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Register
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/dashboard/talent"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Talent Dashboard
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/dashboard/employer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Employer Dashboard
            </Link>
          </div>
        </div>

        {/* Logo/Branding */}
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O1</span>
            </div>
            <span className="font-semibold">O1DMatch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}