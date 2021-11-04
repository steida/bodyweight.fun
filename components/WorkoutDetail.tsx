import { either, option, readonlyArray } from 'fp-ts';
import { constVoid, pipe } from 'fp-ts/function';
import { memo, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { MaxLength, NanoID, String32 } from '../codecs/branded';
import { useAppDispatch, useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { OutlineButton } from './buttons/OutlineButton';
import { PrimaryButton } from './buttons/PrimaryButton';
import { TextField } from './fields/TextField';
import { Modal } from './Modal';
import { Stack } from './Stack';

const Buttons = memo<{ id: NanoID; onRequestClose: () => void }>(
  ({ id, onRequestClose }) => {
    const t = useTheme();
    const intl = useIntl();
    const appDispatch = useAppDispatch();

    const handleDeletePress = () => {
      appDispatch({ type: 'deleteWorkout', id });
    };

    const [showOtherButtons, setShowOtherButtons] = useState(false);

    if (showOtherButtons)
      return (
        <Stack direction="row" style={t.justifyCenter}>
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: '←' })}
            onPress={() => setShowOtherButtons(false)}
          />
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: 'Delete' })}
            onPress={handleDeletePress}
          />
        </Stack>
      );

    return (
      <Stack direction="row" style={t.justifyCenter}>
        <PrimaryButton
          title={intl.formatMessage({ defaultMessage: 'Start' })}
          // onPress={handleDeletePress}
        />
        <OutlineButton
          title={intl.formatMessage({ defaultMessage: 'Close' })}
          onPress={onRequestClose}
        />
        <OutlineButton
          title={intl.formatMessage({ defaultMessage: '…' })}
          onPress={() => setShowOtherButtons(true)}
        />
      </Stack>
    );
  },
);

export const WorkoutDetail = memo<{
  id: NanoID;
  onRequestClose: () => void;
}>(({ id, onRequestClose }) => {
  const t = useTheme();
  const intl = useIntl();
  const appDispatch = useAppDispatch();

  const workout = useAppState((s) =>
    pipe(
      s.workouts,
      readonlyArray.findFirst((w) => w.id === id),
      option.toNullable,
    ),
  );

  // When a workout is deleted.
  useEffect(() => {
    if (workout == null) onRequestClose();
  }, [onRequestClose, workout]);

  const [name, setName] = useState(workout?.name || '');
  useEffect(() => {
    pipe(
      String32.decode(name),
      either.match(constVoid, (value) => {
        appDispatch({ type: 'updateWorkoutName', id, value });
      }),
    );
  }, [appDispatch, id, name]);

  return (
    workout && (
      <Modal onRequestClose={onRequestClose}>
        <View style={[t.width12, t.mh]}>
          <TextField
            maxLength={MaxLength['32']}
            label={intl.formatMessage({ defaultMessage: 'Workout Name' })}
            value={name}
            onChangeText={setName}
          />
        </View>
        <Buttons id={id} onRequestClose={onRequestClose} />
      </Modal>
    )
  );
});
