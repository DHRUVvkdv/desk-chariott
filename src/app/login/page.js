'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const staffTypes = {
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance',
  reception: 'Reception',
  manager: 'Manager'
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const checkUserType = async (email) => {
    try {
      const response = await fetch(`https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/auth/user/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          // 'Authorization': 'dv',
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          'User-ID': email,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error checking user type:', error);
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = await checkUserType(email);

      if (userData.user_type !== 'staff') {
        setError('Access denied. This login is for staff members only.');
        return;
      }

      const loginResponse = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          'User-ID': email
        },
        body: JSON.stringify({ email, password })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        
        Cookies.set('session_token', loginData.token, { expires: 7 });
        Cookies.set('user_type', staffTypes[userData.staff_type] || userData.staff_type, { expires: 7 });
        Cookies.set('user_email', email, { expires: 7 });
        
        console.log('Session token set:', Cookies.get('session_token'));
        console.log('User type set:', Cookies.get('user_type'));
        console.log('User email set:', Cookies.get('user_email'));
        
        router.push('/dashboard');
      } else {
        const errorData = await loginResponse.json();
        setError(errorData.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Staff Log In</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}