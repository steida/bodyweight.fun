import { option, readonlyArray } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { memo, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { MaxLength, NanoID, String32 } from '../codecs/branded';
import { useAppDispatch, useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { OutlineButton } from './buttons/OutlineButton';
import { TextField } from './fields/TextField';
import { Modal } from './Modal';

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

  const handleNameChangeText = (value: string) => {
    // shit, muze empty, to je spatne
    // decode je must!
    appDispatch({ type: 'updateWorkoutName', id, value: value as String32 });
  };

  const handleDeletePress = () => {
    appDispatch({ type: 'deleteWorkout', id });
  };

  return (
    workout && (
      <Modal onRequestClose={onRequestClose}>
        <View style={t.width12}>
          <TextField
            maxLength={MaxLength['32']}
            label={intl.formatMessage({ defaultMessage: 'Workout Name' })}
            value={workout.name}
            onChangeText={handleNameChangeText}
          />
          <View style={[t.flexRow, t.justifyEvenly, t.mt]}>
            <OutlineButton
              title={intl.formatMessage({ defaultMessage: 'Delete' })}
              onPress={handleDeletePress}
            />
          </View>
        </View>
      </Modal>
    )
  );
});
