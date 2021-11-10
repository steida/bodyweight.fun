import { FC } from 'react';
import { View } from 'react-native';

export const ViewHiddenUntilStorageIsRehydrated: FC = ({ children }) => {
  return (
    <View
      // @ts-expect-error RNfW
      dataSet={{ loading: 'hidden' }}
    >
      {children}
    </View>
  );
};
