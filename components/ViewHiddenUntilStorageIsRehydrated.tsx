import { FC } from 'react';
import { View, ViewProps } from 'react-native';

export const ViewHiddenUntilStorageIsRehydrated: FC<ViewProps> = (props) => {
  return (
    <View
      // @ts-expect-error RNfW
      dataSet={{ loading: 'hidden' }}
      {...props}
    />
  );
};
