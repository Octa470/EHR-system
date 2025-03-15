import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-gray-800">404</h1>
        <div className="w-16 h-1 mx-auto my-6 bg-gray-800 rounded"></div>
        
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Page Not Found</h2>
        
        <p className="text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
          >
            Go Back Home
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 ml-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;