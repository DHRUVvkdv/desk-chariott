import { HelpCircle } from 'lucide-react';

export const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-lg 
         shadow-lg -translate-x-1/2 left-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {text}
    </div>
  </div>
);