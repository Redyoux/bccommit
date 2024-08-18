import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  [x: string]: any; // This allows for any additional props that Button accepts
}

const URLConditionalLoadingButton: React.FC<LoadingButtonProps> = ({ loading, children, ...props }) => {
  const location = useLocation();
  
  // Check if the current URL path ends with 'search', 'signin', or 'signup'
  const isValidPage = ['search', 'sign-in', 'sign-up'].some(path => 
    location.pathname.endsWith(path)
  );

  // If not on a valid page, don't render anything
  if (!isValidPage) {
    return null;
  }

  return (
    <Button disabled={loading} {...props}>
      {loading ? <CircularProgress size={24} /> : children}
    </Button>
  );
};

export default URLConditionalLoadingButton;