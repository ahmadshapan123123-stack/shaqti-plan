import { CheckCircle, Info, XCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const Toast = () => {
  const { message, type = 'info', visible } = useToast();

  if (!message) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-danger" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-3 border-success';
      case 'error':
        return 'border-l-3 border-danger';
      case 'info':
      default:
        return 'border-l-3 border-primary-500';
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-12 left-1/2 z-[60] -translate-x-1/2">
      <div
        className={`
          flex min-w-[200px] items-center gap-2.5 rounded-xl bg-gray-800 px-5 py-3 
          text-sm font-medium text-white shadow-xl
          ${getBorderColor()}
          transition-all duration-300
          ${visible ? 'animate-slide-up' : 'animate-slide-down opacity-0'}
        `}
      >
        {getIcon()}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
