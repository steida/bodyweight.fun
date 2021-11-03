import { FC } from 'react';
import { SafeAreaView, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const Layout: FC = ({ children }) => {
  const t = useTheme();

  // SafeAreaView is for Safari < 15.
  // With Safari 15, it makes no difference and it seems it's not
  // required except home full-screen mode (a web link as icon on
  // home screen), but it makes sense a full-screen without any safe area.

  return (
    <SafeAreaView>
      {/* I don't think we need vertical padding. */}
      <View style={t.ph}>{children}</View>
    </SafeAreaView>
  );
};
