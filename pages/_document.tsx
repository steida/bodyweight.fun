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

  // RNfW documentation recommends height: '100%' to mimic native
  // device, but it requires ScrollView with flex: 1 which:
  // 1) Makes desktop scroll animation ugly in Chrome.
  // 2) Breaks Safari 15 rendering via wrong body height which
  //    makes screen cropped by navigation bar sometimes.
  //    It's well described problem for Safari < 15 and still
  //    buggy OK with Safari 15.
  // That's why can't use height: '100%'.
  // https://samuelkraft.com/blog/safari-15-bottom-tab-bars-web
  // Luckily, RNfW does need ScrollView anymore.
  // Fixed bottom bar via position: 'fixed', bottom: 0 works well
  // as I manually tested on Safari 15 normal and full-screen modes.

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
