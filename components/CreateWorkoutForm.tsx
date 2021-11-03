import * as Fathom from 'fathom-client';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { MaxLength, String32 } from '../codecs/branded';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { TextField, TextFieldRef } from '../components/fields/TextField';
import { useAppDispatch } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { createNanoID } from '../utils/createNanoID';
import { Modal } from './Modal';

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
      either.match(
        () => {
          textFieldRef.current?.focus();
        },
        (name) => {
          Fathom.trackGoal('8NAL5VZS', 0);
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
    <Modal contentStyle={t._top} onRequestClose={onRequestClose}>
      <View style={t.shortTextInput}>
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
        </View>
      </View>
    </Modal>
  );
};

export const CreateWorkoutForm = () => {
  const intl = useIntl();
  const t = useTheme();
  const [isEdited, setIsEdited] = useState(false);

  const handleCreateWorkoutPress = () => {
    Fathom.trackGoal('IBXUJQUK', 0);
    setIsEdited(true);
  };

  const handleRequestClose = () => {
    setIsEdited(false);
  };

  return (
    <View style={t.pv}>
      <PrimaryButton
        title={intl.formatMessage({ defaultMessage: 'Create Workout' })}
        onPress={handleCreateWorkoutPress}
      />
      {isEdited && (
        <CreateWorkoutFormModal onRequestClose={handleRequestClose} />
      )}
    </View>
  );
};
