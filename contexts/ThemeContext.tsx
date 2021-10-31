import { createContext, useContext } from 'react';
import { lightTheme } from '../styles/lightTheme';
import Head from 'next/head';
import { FC } from 'react';
import { ColorValue, StyleSheet } from 'react-native';

const ThemeContext = createContext(lightTheme);

export const useTheme = () => {
  return useContext(ThemeContext);
};

// TODO: Dark mode in the app state, probably persisted in localStorage.
// https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/
// const colorScheme: ColorSchemeName = useColorScheme() || 'light';

export const ThemeProvider: FC = ({ children }) => {
  const theme = lightTheme;
  const { backgroundColor } = StyleSheet.flatten(theme.bgColor) as {
    backgroundColor: ColorValue;
  };

  return (
    <>
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: `body{background-color:${backgroundColor.toString()}}`,
          }}
        />
      </Head>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </>
  );
};
