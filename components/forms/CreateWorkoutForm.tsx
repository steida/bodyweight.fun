import { either } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { emptyString1024, MaxLength, String32 } from '../../codecs/branded';
import { useAppDispatch } from '../../contexts/AppStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import { createWorkout } from '../../utils/createWorkout';
import { OutlineButton } from '../buttons/OutlineButton';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { TextField, TextFieldRef } from '../fields/TextField';
import { Modal } from '../Modal';
import { Stack } from '../Stack';

const CreateWorkoutFormModal = ({
  onRequestClose,
}: {
  onRequestClose: () => void;
}) => {
  const intl = useIntl();
  const t = useTheme();

  const [name, setName] = useState('');

  const textFieldRef = useRef<TextFieldRef>(null);
  const appDispatch = useAppDispatch();

  const submit = () => {
    pipe(
      String32.decode(name),
      either.filterOrElseW(
        (n) => n.length > 0,
        () => 'empty',
      ),
      either.match(
        () => {
          textFieldRef.current?.focus();
        },
        (name) => {
          appDispatch({
            type: 'createWorkout',
            workout: createWorkout(name, emptyString1024),
          });
          onRequestClose();
        },
      ),
    );
  };

  return (
    <Modal onRequestClose={onRequestClose}>
      <View style={t.width13}>
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
        <Stack direction="row" style={t.justifyCenter}>
          <PrimaryButton
            title={intl.formatMessage({ defaultMessage: 'Create' })}
            onPress={submit}
          />
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: 'Cancel' })}
            onPress={onRequestClose}
          />
        </Stack>
      </View>
    </Modal>
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

  return (
    <>
      <PrimaryButton
        title={intl.formatMessage({ defaultMessage: 'Create Workout' })}
        onPress={handleCreateWorkoutPress}
      />
      {isEdited && (
        <CreateWorkoutFormModal onRequestClose={handleRequestClose} />
      )}
    </>
  );
};
