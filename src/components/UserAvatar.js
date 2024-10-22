import React from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ src, alt, size = 40 }) => {
  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt || "User avatar"}
          className="rounded-full object-cover"
          width={size}
          height={size}
        />
      ) : (
        <div 
          className="flex items-center justify-center bg-gray-200 rounded-full"
          style={{ width: size, height: size }}
        >
          <User size={size * 0.6} className="text-gray-500" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;