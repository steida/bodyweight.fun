import * as Fathom from 'fathom-client';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Layout } from '../components/Layout';
import { AppStateProvider } from '../contexts/AppStateContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/global.css';

Router.events.on('routeChangeComplete', () => {
  Fathom.trackPageview();
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    Fathom.load('KMFMXCNL', { includedDomains: ['www.bodyweight.fun'] });
  }, []);

  return (
    <AppStateProvider>
      <ThemeProvider>
        <IntlProvider locale="en">
          <Head>
            <meta
              name="description"
              content="A simple app to manage your calisthenics workouts."
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            {/* <link rel="stylesheet" href="//basehold.it/27"></link> */}
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicon-16x16.png"
            />
            <link rel="manifest" href="/site.webmanifest"></link>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </IntlProvider>
      </ThemeProvider>
    </AppStateProvider>
  );
};

export default MyApp;
