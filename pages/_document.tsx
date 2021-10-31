import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { Children } from 'react';
import { AppRegistry } from 'react-native';
import config from '../app.json';

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }: DocumentContext) {
    AppRegistry.registerComponent(config.name, () => Main);
    // @ts-expect-error A web-only method for server-side rendering to HTML and CSS.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { getStyleElement } = AppRegistry.getApplication(config.name);
    const page = await renderPage();
    const styles = [
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      getStyleElement(),
    ];
    return { ...page, styles: Children.toArray(styles) };
  }

  render() {
    return (
      <Html lang="en" style={{ height: '100%' }}>
        <Head />
        <body style={{ height: '100%', overflow: 'hidden' }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
