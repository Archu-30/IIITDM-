import toast from 'react-hot-toast';

export const toastSuccess = (message) => {
  toast.success(message, {
    style: {
      border: '1px solid #DCFCE7',
      padding: '16px',
      color: '#16A34A',
      background: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#16A34A',
      secondary: '#FFFFFF',
    },
  });
};

export const toastError = (message) => {
  toast.error(message, {
    style: {
      border: '1px solid #FEE2E2',
      padding: '16px',
      color: '#DC2626',
      background: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#DC2626',
      secondary: '#FFFFFF',
    },
  });
};

export const toastInfo = (message) => {
  toast(message, {
    style: {
      border: '1px solid #DBEAFE',
      padding: '16px',
      color: '#2563EB',
      background: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: '500',
    },
    icon: 'ℹ️',
  });
};
