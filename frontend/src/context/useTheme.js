import { useContext } from 'react';
import { ThemeContext } from './themeProviderContext';

export const useTheme = () => useContext(ThemeContext);
