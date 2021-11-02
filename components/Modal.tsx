import { FC, useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  GestureResponderEvent,
  Modal as NativeModal,
  ModalProps,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { InsetBorder } from './InsetBorder';

// type A = ModalProps['con']

export const Modal: FC<
  ModalProps & {
    contentStyle?: StyleProp<ViewStyle>;
  }
> = ({ contentStyle, children, ...modalProps }) => {
  const t = useTheme();
  const intl = useIntl();

  const pressableRef = useRef<View>(null);

  const handlePressablePress = (e: GestureResponderEvent) => {
    // @ts-expect-error RNfW.
    if (pressableRef.current === e.target) {
      if (modalProps.onRequestClose) modalProps.onRequestClose();
    }
  };

  return (
    <NativeModal transparent visible {...modalProps}>
      <Pressable
        ref={pressableRef}
        accessibilityRole="button"
        accessibilityLabel={intl.formatMessage({ defaultMessage: 'Close' })}
        onPress={handlePressablePress}
        style={[
          t.flexGrow,
          t.justifyCenter,
          t.itemsCenter,
          // @ts-expect-error RNfW
          { cursor: 'default' },
        ]}
      >
        <View style={[t.wLg_10x, t.p, t.bgColor, contentStyle]}>
          <InsetBorder style={t.shadow} />
          {children}
        </View>
      </Pressable>
    </NativeModal>
  );
};
