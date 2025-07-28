import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import React from 'react';

const AutoRedirect = () => {
  const { user, loading } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'admin') navigate('/Dashboard');
      else if (user?.role === 'staff') navigate('/staffDashboard');
      else if (user?.role === 'approver') navigate('/approDashboard');
      else navigate('/login');
    }
  }, [user, loading, navigate]);

  return null;
};

export default AutoRedirect;