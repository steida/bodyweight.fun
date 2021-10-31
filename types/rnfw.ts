// For some reason, something has to be imported.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PressableStateCallbackType } from 'react-native';

// We can merge web only properties safely because they are optional.
declare module 'react-native' {
  interface PressableStateCallbackType {
    readonly hovered?: boolean;
    // We don't use focused, because:
    // https://github.com/necolas/react-native-web/issues/2074
    // readonly focused?: boolean;
  }
}
