export const LoadingSkeleton = ({ type }) => {
    switch (type) {
      case 'chart':
        return (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        );
      case 'card':
        return (
          <div className="animate-pulse space-y-4">
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
          </div>
        );
      default:
        return null;
    }
  };