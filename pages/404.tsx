import { useIntl } from 'react-intl';
import { Heading } from '../components/elements/Heading';
import { Paragraph } from '../components/elements/Paragraph';
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
      <Heading style={[t.textLg, t.color, t.mb]}>{title}</Heading>
      <Paragraph style={[t.text, t.color]}>
        {intl.formatMessage({
          defaultMessage:
            'The link may be broken, or the page may have been removed.',
        })}
      </Paragraph>
    </>
  );
};

export default Page404;
