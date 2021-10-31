import { FC } from 'react';
import { SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const Layout: FC = ({ children }) => {
  const t = useTheme();
  return <SafeAreaView style={t.flexGrow}>{children}</SafeAreaView>;
};
