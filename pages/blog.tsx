import { useIntl } from 'react-intl';
import { Pressable, Text, View } from 'react-native';
import { Heading } from '../components/elements/Heading';
import { Link } from '../components/elements/Link';
import { Paragraph } from '../components/elements/Paragraph';
import { Stack } from '../components/Stack';
import { Title } from '../components/Title';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const t = useTheme();
  const intl = useIntl();
  const title = intl.formatMessage({ defaultMessage: 'Blog' });

  return (
    <View style={[t.mt, t.mbLg]}>
      <Title title={title} />
      <Stack direction="row">
        <Link href={{ pathname: '/' }}>
          {({ hovered }) => (
            <Text style={[t.textLg, hovered ? t.color : t.colorGray]}>App</Text>
          )}
        </Link>
        <Text style={[t.textLg, t.color]}>{title}</Text>
      </Stack>
    </View>
  );
};

const BlogPost1 = () => {
  const t = useTheme();
  const intl = useIntl();

  return (
    <>
      <Stack direction="row" space="XS">
        <Text style={[t.textSm, t.colorGray]}>
          {intl.formatDate('2021-11-12T13:47:02.050Z', {
            dateStyle: 'medium',
          })}
        </Text>
        <Text style={[t.textSm, t.colorGray]}>·</Text>
        <Pressable>
          {({ hovered }) => (
            <Text
              // @ts-expect-error RNfW
              href="https://twitter.com/steida"
              hrefAttrs={{ target: 'blank' }}
              style={[t.textSm, hovered ? t.color : t.colorGray]}
            >
              steida
            </Text>
          )}
        </Pressable>
      </Stack>
      <Heading level={2} style={[t.textLg, t.color, t.mb]}>
        {intl.formatMessage({
          defaultMessage: `
            Bodyweight Fun – Your Calisthenics Trainer`,
        })}
      </Heading>
      <Stack>
        <Paragraph style={[t.text, t.color]}>
          {intl.formatMessage({
            defaultMessage: `
              A small app for great pleasure. For all those who
              do not remember exercises.`,
          })}
        </Paragraph>
        <Paragraph style={[t.text, t.color]}>
          {intl.formatMessage(
            {
              defaultMessage: `
                Bodyweight Fun is <link>local-first</link> software. It means
                that you do not have to log in, and all your data remains in
                your browser or mobile phone. That's why the app is so fast
                and so secure at the same time. You can write whatever you
                want, no one will see it.`,
            },
            {
              link: (s) => (
                <Text
                  style={t.underline}
                  // @ts-expect-error RNfW
                  href="https://www.inkandswitch.com/local-first/"
                  hrefAttrs={{ target: 'blank' }}
                >
                  {s[0]}
                </Text>
              ),
            },
          )}
        </Paragraph>
        <Paragraph style={[t.text, t.color]}>
          {intl.formatMessage({
            defaultMessage: `
              However, if you want to share your exercises, you can.
              Create one, click to Share, and send it to the world.`,
          })}
        </Paragraph>
        <Paragraph style={[t.text, t.color]}>
          {intl.formatMessage({
            defaultMessage: `
              Happy workouts!`,
          })}
        </Paragraph>
        <Stack direction="row">
          <Text
            // @ts-expect-error RNfW
            href="https://twitter.com/search?q=https%3A%2F%2Fwww.bodyweight.fun"
            hrefAttrs={{ target: 'blank' }}
            style={[t.text, t.colorGray, t.underline]}
          >
            Discuss on Twitter
          </Text>
        </Stack>
      </Stack>
    </>
  );
};

const Blog = () => {
  const t = useTheme();

  return (
    <View style={[t.maxWXL_10x, t.mhAuto, t.ph, t.mb]}>
      <Header />
      <BlogPost1 />
    </View>
  );
};

export default Blog;
