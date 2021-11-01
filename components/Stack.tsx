import { Children, forwardRef, Fragment, ReactNode } from 'react';
import { FlexStyle, View, ViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

import { RhythmSize } from '../styles/createTheme';

// https://next.material-ui.com/components/stack
// CSS gap is great, but RN (yoga) does not support it
// and we don't want two probably different behaviours.

export interface StackProps extends ViewProps {
  /** Default: column */
  direction?: FlexStyle['flexDirection'];
  space?: RhythmSize;
  style?: View['props']['style'];
  children: ReactNode;
}

export const Stack = forwardRef<View, StackProps>(
  ({ direction = 'column', space = '', style, children, ...props }, ref) => {
    const t = useTheme();

    const prop =
      direction === 'column' || direction === 'column-reverse' ? 'h' : 'w';

    const spacerStyle = t[`${prop}${space}`] as View['props']['style'];

    return (
      <View style={[{ flexDirection: direction }, style]} {...props} ref={ref}>
        {Children.toArray(children).map((child, index, array) => {
          if (index === array.length - 1) return child;
          return (
            <Fragment key={index}>
              {child}
              <View style={spacerStyle} />
            </Fragment>
          );
        })}
      </View>
    );
  },
);
