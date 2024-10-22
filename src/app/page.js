import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { ArrowRight, CheckCircle, Star, Users } from 'lucide-react';

export default function Home() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token');
  const userType = cookieStore.get('user_type');

  const features = [
    { icon: <CheckCircle className="w-8 h-8 text-indigo-600" />, title: 'Streamlined Booking', description: 'Effortlessly manage reservations and check-ins' },
    { icon: <Users className="w-8 h-8 text-indigo-600" />, title: 'Staff Management', description: 'Organize schedules and tasks efficiently' },
    { icon: <Star className="w-8 h-8 text-indigo-600" />, title: 'Guest Experience', description: 'Enhance customer satisfaction with personalized service' },
  ];

  const byChariottText = "by Chariott".split('').map((char, i) => (
    <span 
      key={i} 
      className="opacity-0 inline-block animate-fadeIn"
      style={{ 
        animationDelay: `${1000 + (i * 40)}ms`,
        animationFillMode: 'forwards',
        ...(char === ' ' ? { marginRight: '0.07em' } : {})  // Reduced from 0.25em to 0.15em
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow">
        {/* Home Page Section */}
        <section className="h-screen flex items-center justify-center animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center mb-8">
              <div className="relative w-[200px] h-[200px]">
                <Image 
                  src="https://chariott-assets.s3.amazonaws.com/logo.png"
                  alt="Chariott logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-2 animate-slideInDown">
              Desk
              <span className="text-2xl font-normal text-gray-500 ml-2">
                {byChariottText}
              </span>
            </h1>
            <p className="text-2xl text-gray-600 mb-8 animate-slideInUp">Streamlined Hotel Management for the Modern Hotelier</p>
            <Link href={sessionToken ? "/dashboard" : "/login"} className="inline-flex items-center text-xl bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-all duration-300 hover:scale-105 transform">
              {sessionToken ? "Access Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 animate-bounce" size={24} />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="h-screen bg-indigo-50 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16 animate-slideInDown">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 transform animate-fadeIn" style={{animationDelay: `${index * 200}ms`}}>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-2xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}