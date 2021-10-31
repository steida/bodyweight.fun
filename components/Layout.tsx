import { FC } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const Layout: FC = ({ children }) => {
  const t = useTheme();

  return (
    <SafeAreaView style={t.flexGrow}>
      <ScrollView
        contentContainerStyle={[t.flexGrow, t.justifyCenter]}
        style={[t.p, t.flexGrow]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};
