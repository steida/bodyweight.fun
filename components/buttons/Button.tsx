import { constTrue } from 'fp-ts/function';
import { forwardRef } from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  Text,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { InsetBorder } from '../InsetBorder';

export interface ButttonStateCallbackType extends PressableStateCallbackType {
  disabled: boolean | null | undefined;
}

export type ButtonProps = Pick<PressableProps, 'onPress' | 'disabled'> & {
  title: string | JSX.Element;
  style?: (state: ButttonStateCallbackType) => StyleProp<ViewStyle>;
  borderStyle?: (state: ButttonStateCallbackType) => StyleProp<ViewStyle>;
  renderBorder?: (state: PressableStateCallbackType) => boolean;
  textStyle?: (state: ButttonStateCallbackType) => Text['props']['style'];
  pressableProps?: PressableProps;
  textProps?: TextProps;
};

// View because Pressable Ref is View.
// https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/Pressable/index.js#L229
export const Button = forwardRef<View, ButtonProps>(
  (
    {
      title,
      onPress,
      disabled,
      style,
      borderStyle,
      renderBorder = constTrue,
      textStyle,
      pressableProps,
      textProps,
    },
    ref,
  ) => {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={(state) => style && style({ ...state, disabled })}
        {...pressableProps}
        ref={ref}
      >
        {(state) => (
          <>
            {renderBorder(state) && (
              <InsetBorder
                style={borderStyle && borderStyle({ ...state, disabled })}
              />
            )}
            <Text
              selectable={false}
              style={textStyle && textStyle({ ...state, disabled })}
              {...textProps}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    );
  },
);
