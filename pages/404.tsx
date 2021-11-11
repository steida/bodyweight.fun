import { useIntl } from 'react-intl';
import { Text } from 'react-native';
import { Heading } from '../components/elements/Heading';
import { Link } from '../components/elements/Link';
import { Paragraph } from '../components/elements/Paragraph';
import { Stack } from '../components/Stack';
import { Title } from '../components/Title';
import { useTheme } from '../contexts/ThemeContext';

const Page404 = () => {
  const t = useTheme();
  const intl = useIntl();
  const title = intl.formatMessage({
    defaultMessage: "This Page Isn't Available",
  });

  return (
    <>
      <Title title={title} />
      <Stack>
        <Heading style={[t.textLg, t.color]}>{title}</Heading>
        <Paragraph style={[t.text, t.color]}>
          {intl.formatMessage({
            defaultMessage:
              'The link may be broken, or the page may have been removed.',
          })}
        </Paragraph>
        <Paragraph style={[t.text, t.color]}>
          <Link href={{ pathname: '/' }}>
            <Text style={[t.text, t.color, t.underline]}>
              {intl.formatMessage({ defaultMessage: 'Home' })}
            </Text>
          </Link>
        </Paragraph>
      </Stack>
    </>
  );
};

export default Page404;
