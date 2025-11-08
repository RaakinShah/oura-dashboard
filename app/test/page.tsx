'use client';

import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    console.log('TEST PAGE LOADED - Browser is loading fresh code!');
    alert('TEST: If you see this alert, your browser is working correctly!');
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-xl">Check your browser console (F12)</p>
        <p className="text-lg text-gray-600 mt-4">You should see a log message and an alert</p>
      </div>
    </div>
  );
}
