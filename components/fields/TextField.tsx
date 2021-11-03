import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { InsetBorder } from '../InsetBorder';

export interface TextFieldRef {
  focus: () => void;
}

export interface TextFieldProps extends TextInputProps {
  // Enforce it.
  maxLength: number;

  label: string;
  afterLabel?: JSX.Element | false;
  description?: string;
  descriptionStyle?: Text['props']['style'];
  error?: string;

  // https://web.dev/sign-in-form-best-practices/#checklist
  webAuthType?: 'username' | 'new-password' | 'current-password';
}

export const TextField = forwardRef<TextFieldRef, TextFieldProps>(
  (
    {
      label,
      afterLabel,
      description,
      descriptionStyle,
      error,

      webAuthType,
      ...props
    },
    ref,
  ) => {
    const t = useTheme();
    const disabled = props.value == null || props.editable === false;
    const [hasFocus, setHasFocus] = useState(false);

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setHasFocus(true);
      if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setHasFocus(false);
      if (props.onBlur) props.onBlur(e);
    };

    const textInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (textInputRef.current) textInputRef.current.focus();
      },
    }));

    // https://twitter.com/jordwalke/status/1356195754692382727
    // https://gist.github.com/kiding/72721a0553fa93198ae2bb6eefaa3299
    const [iosScrollFixEnabled, setIosScrollFixEnabled] = useState(
      props.autoFocus || false,
    );
    useEffect(() => {
      const timeout = setTimeout(() => {
        setIosScrollFixEnabled(false);
      }, 100); // 100 seems to be safe enough, 10 works, 1 not.
      return () => {
        clearTimeout(timeout);
      };
    }, []);

    return (
      <View
        // @ts-expect-error RNfW
        accessibilityRole="label"
        style={t.wFull}
      >
        <View style={[t.flexRow, afterLabel && t.justifyBetween]}>
          <Text style={[t.textSm, t.color]}>{label}</Text>
          {afterLabel}
        </View>
        <View style={t.mvXS}>
          <InsetBorder style={[hasFocus && t.borderGray]} />
          <TextInput
            ref={textInputRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
            autoCorrect={false}
            {...props}
            {...(webAuthType && { autoCompleteType: webAuthType as never })}
            value={props.value || ''}
            editable={!disabled}
            style={[
              t.color,
              t.text,
              t.pvXS,
              t.phSm,
              t.rounded,
              disabled && t.opacityDisabled,
              props.style,
              iosScrollFixEnabled && t.opacity0,
              t.maxWFull,
            ]}
          />
        </View>
        <View style={t.flexRow}>
          {error ? (
            // Note keys used to force DOM Element change to stop CSS transition.
            <Text key="a" style={[t.textSm, t.colorError]}>
              {error}
            </Text>
          ) : (
            description && (
              <Text key="c" style={[t.textSm, t.colorGray, descriptionStyle]}>
                {description}
              </Text>
            )
          )}
        </View>
      </View>
    );
  },
);
