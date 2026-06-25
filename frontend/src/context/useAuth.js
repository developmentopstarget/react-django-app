import { useContext } from 'react';
import { AuthContext } from './authProviderContext';

export const useAuth = () => useContext(AuthContext);
