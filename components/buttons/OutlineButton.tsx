import { forwardRef } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ButtonProps } from './Button';

export interface OutlineButtonProps extends ButtonProps {
  grayBorder?: boolean;
}

export const OutlineButton = forwardRef<View, OutlineButtonProps>(
  ({ style, borderStyle, textStyle, grayBorder, ...props }, ref) => {
    const t = useTheme();
    return (
      <Button
        style={(state) => [
          t.transition,
          t.ph,
          t.pvXS,
          t.mvXS,
          t.rounded,
          t.bgColor,
          state.disabled
            ? t.opacityDisabled
            : state.pressed
            ? t.opacityPressed
            : [],
          style && style(state),
        ]}
        borderStyle={(state) => [
          state.disabled
            ? []
            : state.pressed || state.hovered
            ? grayBorder
              ? t.borderGray
              : t.borderBlack
            : t.borderLightGray,
          borderStyle && borderStyle(state),
        ]}
        textStyle={(state) => [
          t.transition,
          t.textSm,
          t.textBold,
          t.textCenter,
          t.color,
          textStyle && textStyle(state),
        ]}
        {...props}
        ref={ref}
      />
    );
  },
);
