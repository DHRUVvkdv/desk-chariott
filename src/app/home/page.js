"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Send, MenuIcon, Share2, HelpCircle, User, LogOut, LogIn } from 'lucide-react';

const samplePrompts = [
  "Tell me a joke",
  "What's the weather like today?",
  "How can I learn programming?"
];

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Chariott, an AI assistant. How can I help you today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (text) => {
    if (text.trim()) {
      setMessages([...messages, { text, isUser: true }, { text: "This is a placeholder response.", isUser: false }]);
      setInputText('');
      setShowPrompts(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserName("John Doe");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  const goToUserInfo = () => {
    console.log("Navigating to user info screen");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left panel for user information */}
      <div className="w-64 bg-white p-4 shadow-md flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Chariott</h1>
        <div className="flex-grow">
          {isLoggedIn ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <User size={40} />
              </div>
              <h2 className="text-lg font-semibold mb-2">{userName}</h2>
              <button
                onClick={goToUserInfo}
                className="w-full bg-blue-500 text-white py-2 rounded-md mb-2"
              >
                User Info
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded-md flex items-center justify-center"
              >
                <LogOut size={16} className="mr-2" /> Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <User size={40} />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-green-500 text-white py-2 rounded-md flex items-center justify-center"
              >
                <LogIn size={16} className="mr-2" /> Log In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center">
            <MenuIcon className="mr-2" />
            <span>Chat from AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Share2 />
            <HelpCircle />
          </div>
        </div>

        {/* Chat content area */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden">
          {/* Sample prompts */}
          {showPrompts && (
            <div className="bg-gray-100 p-4 flex justify-center space-x-2">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt)}
                  className="px-4 py-2 bg-white hover:bg-gray-200 rounded-full text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat messages */}
          <div className="overflow-y-auto p-4 flex-grow">
            <div className="flex flex-col justify-end min-h-full">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg ${message.isUser ? 'bg-blue-100' : 'bg-white shadow'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white p-4 shadow-md">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(inputText)}
              className="flex-1 p-2 outline-none"
              placeholder="Reply to Chariott..."
            />
            <button onClick={() => handleSend(inputText)} className="p-2 bg-gray-100 hover:bg-gray-200">
              <Send size={20} />
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Chariott AI</div>
        </div>
      </div>
    </div>
  );
}