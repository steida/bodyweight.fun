import { either } from 'fp-ts';
import * as Fathom from 'fathom-client';
import { pipe } from 'fp-ts/function';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, View } from 'react-native';
import { MaxLength, String32 } from '../codecs/branded';
import { CancelButton } from '../components/buttons/CancelButton';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { TextField, TextFieldRef } from '../components/fields/TextField';
import { useAppDispatch } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { useIosScrollFix } from '../hooks/useIosScrollFix';
import { createNanoID } from '../utils/createNanoID';
import { InsetBorder } from './InsetBorder';

const CreateWorkoutFormModal = ({
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

  const iosScrollFix = useIosScrollFix();

  return (
    <Modal transparent visible>
      <View style={[t.flexGrow, t.justifyCenter, t.itemsCenter]}>
        <View style={[t.wLg_10x, t.pv, t.phXXL, t.bgColor, t.bgColor, t._top]}>
          <InsetBorder style={t.shadow} />
          <TextField
            autoFocus
            maxLength={MaxLength['32']}
            label={intl.formatMessage({ defaultMessage: 'Workout Name' })}
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
            ref={textFieldRef}
            blurOnSubmit={false}
            style={iosScrollFix}
          />
          <View style={[t.flexRow, t.justifyAround]}>
            <CancelButton onPress={handleCancelPress} />
            <PrimaryButton
              title={intl.formatMessage({ defaultMessage: 'Create' })}
              onPress={submit}
            />
          </View>
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
