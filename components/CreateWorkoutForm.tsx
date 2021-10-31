import { either } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { MaxLength, String32 } from '../codecs/branded';
import { CancelButton } from '../components/buttons/CancelButton';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { TextField, TextFieldRef } from '../components/fields/TextField';
import { useAppDispatch } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { createNanoID } from '../utils/createNanoID';

const CreateWorkoutFormShown = ({
  onRequestClose,
}: {
  onRequestClose: () => void;
}) => {
  const intl = useIntl();
  const t = useTheme();

  const [name, setName] = useState('');

  const handleCancelPress = () => {
    onRequestClose();
  };

  const textFieldRef = useRef<TextFieldRef>(null);
  const appDispatch = useAppDispatch();

  const submit = () => {
    pipe(
      String32.decode(name),
      either.match(
        () => {
          textFieldRef.current?.focus();
        },
        (name) => {
          appDispatch({
            type: 'createWorkout',
            workout: {
              id: createNanoID(),
              createdAt: new Date(),
              name,
            },
          });
          onRequestClose();
        },
      ),
    );
  };

  return (
    <View style={[t.wLg_10x, t.phXXL]}>
      <TextField
        autoFocus
        maxLength={MaxLength['32']}
        label={intl.formatMessage({ defaultMessage: 'Workout Name' })}
        value={name}
        onChangeText={setName}
        onSubmitEditing={submit}
        ref={textFieldRef}
        blurOnSubmit={false}
      />
      <View style={[t.flexRow, t.justifyAround]}>
        <PrimaryButton
          title={intl.formatMessage({ defaultMessage: 'Create' })}
          onPress={submit}
        />
        <CancelButton onPress={handleCancelPress} />
      </View>
    </View>
  );
};

export const CreateWorkoutForm = () => {
  const intl = useIntl();
  const [isEdited, setIsEdited] = useState(false);

  const handleCreateWorkoutPress = () => {
    setIsEdited(true);
  };

  const handleRequestClose = () => {
    setIsEdited(false);
  };

  return !isEdited ? (
    <PrimaryButton
      title={intl.formatMessage({ defaultMessage: 'Create Workout' })}
      onPress={handleCreateWorkoutPress}
    />
  ) : (
    <CreateWorkoutFormShown onRequestClose={handleRequestClose} />
  );
};
