import { FC } from 'react';
import { useIntl } from 'react-intl';
import { SafeAreaView, View } from 'react-native';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { isSeriousStorageGetError } from '../hooks/useStorage';
import { PrimaryButton } from './buttons/PrimaryButton';
import { Paragraph } from './elements/Paragraph';
import { Modal } from './Modal';
import { Stack } from './Stack';
import { Title } from './Title';

const DemandReloadModal = () => {
  const intl = useIntl();
  const t = useTheme();

  const handleReloadPagePress = () => {
    // The location.reload() method reloads the current URL,
    // like the Refresh button.
    // https://developer.mozilla.org/en-US/docs/Web/API/Location/reload
    location.reload();
  };

  return (
    <Modal noClosableBackground>
      <Stack style={t.width13}>
        <Paragraph style={[t.text, t.color]}>
          {intl.formatMessage({
            defaultMessage: `
              There is a new version of the app.
              Please click to button to reload page.
          `,
          })}
        </Paragraph>
        <View style={[t.flexRow, t.justifyCenter]}>
          <PrimaryButton title="Reload Page" onPress={handleReloadPagePress} />
        </View>
      </Stack>
    </Modal>
  );
};

export const Layout: FC = ({ children }) => {
  const intl = useIntl();
  const storageGetError = useAppState((s) => s.storageGetError);

  return (
    <SafeAreaView>
      {storageGetError && isSeriousStorageGetError(storageGetError) ? (
        <>
          <Title
            title={intl.formatMessage({
              defaultMessage: 'New version',
            })}
          />
          <DemandReloadModal />
        </>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};
