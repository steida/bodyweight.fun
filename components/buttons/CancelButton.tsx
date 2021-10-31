import { useIntl } from 'react-intl';
import { OutlineButton, OutlineButtonProps } from './OutlineButton';

export const CancelButton = (props: Omit<OutlineButtonProps, 'title'>) => {
  const intl = useIntl();

  return (
    <OutlineButton
      {...props}
      title={intl.formatMessage({ defaultMessage: 'Cancel' })}
    />
  );
};
