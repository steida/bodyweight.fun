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

export const Modal: FC<
  ModalProps & {
    contentStyle?: StyleProp<ViewStyle>;
    shadowColor?: string;
  }
> = ({ contentStyle, shadowColor, children, ...modalProps }) => {
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
          t.phSm,
          // @ts-expect-error RNfW
          { cursor: 'default' },
        ]}
      >
        <View style={[t.pv, t.phLg, contentStyle]}>
          <InsetBorder
            style={[
              t.shadow,
              t.bgColor,
              shadowColor != null && { shadowColor },
            ]}
            slowTransition={!!shadowColor}
          />
          {children}
        </View>
      </Pressable>
    </NativeModal>
  );
};
