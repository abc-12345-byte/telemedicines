"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestVideoPage() {
  const router = useRouter();
  const [channelName, setChannelName] = useState('test-channel-' + Date.now());

  const joinAsUser1 = () => {
    router.push(`/video-call/${channelName}?user=1`);
  };

  const joinAsUser2 = () => {
    router.push(`/video-call/${channelName}?user=2`);
  };

  const generateNewChannel = () => {
    setChannelName('test-channel-' + Date.now());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Video Call Test
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel Name
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter channel name"
            />
          </div>
          
          <button
            onClick={generateNewChannel}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Generate New Channel
          </button>
          
          <div className="space-y-3">
            <button
              onClick={joinAsUser1}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join as User 1 (Doctor)
            </button>
            
            <button
              onClick={joinAsUser2}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Join as User 2 (Patient)
            </button>
          </div>
          
          <div className="text-sm text-gray-600 text-center mt-4">
            <p>1. Open two browser tabs/windows</p>
            <p>2. Join the same channel from both</p>
            <p>3. You should see both video feeds</p>
          </div>
        </div>
      </div>
    </div>
  );
}





