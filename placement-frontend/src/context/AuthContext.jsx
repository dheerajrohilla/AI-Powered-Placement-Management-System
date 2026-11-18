import { useState } from 'react';
import { authAPI } from '../services/api';
import { AuthContext } from './authContextValue';
export { useAuth } from './useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (name, email, password, role, additionalData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register({
        name,
        email,
        password,
        role,
        additionalData
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || (err.request ? 'Server is offline or unreachable. Ensure backend is running on port 5000.' : 'Registration failed');
      setError(errorMessage);
      const registrationError = new Error(errorMessage, { cause: err });
      throw registrationError;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || (err.request ? 'Server is offline or unreachable. Ensure backend is running on port 5000.' : 'Login failed');
      setError(errorMessage);
      const loginError = new Error(errorMessage, { cause: err });
      throw loginError;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if sessionStorage restricted
    }
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

