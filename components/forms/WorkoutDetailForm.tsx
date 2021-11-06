import { either, option, readonlyArray } from 'fp-ts';
import { constVoid, flow, pipe } from 'fp-ts/function';
import { memo, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { MaxLength, NanoID, String1024, String32 } from '../../codecs/branded';
import { useAppDispatch, useAppState } from '../../contexts/AppStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import { OutlineButton } from '../buttons/OutlineButton';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { TextButton } from '../buttons/TextButton';
import { TextField } from '../fields/TextField';
import { Modal } from '../Modal';
import { Stack } from '../Stack';

const WorkoutNameField = memo<{ id: NanoID; value: String32 }>(
  ({ id, value }) => {
    const intl = useIntl();
    const appDispatch = useAppDispatch();

    const handleChangeText = flow(
      String32.decode,
      either.match(constVoid, (value) => {
        appDispatch({ type: 'updateWorkoutName', id, value });
      }),
    );

    return (
      <TextField
        maxLength={MaxLength['32']}
        label={intl.formatMessage({ defaultMessage: 'Workout Name' })}
        value={value}
        onChangeText={handleChangeText}
      />
    );
  },
);

const WorkoutExercisesField = memo<{ id: NanoID; value: String1024 }>(
  ({ id, value }) => {
    const intl = useIntl();
    const appDispatch = useAppDispatch();

    const handleChangeText = (s: string) =>
      pipe(
        String1024.decode(s),
        either.match(constVoid, (value) => {
          appDispatch({ type: 'updateWorkoutExercises', id, value });
        }),
      );

    const handleHelpPress = () => {
      const help = intl.formatMessage(
        {
          defaultMessage: `
            stretching 1m{newLine}push-ups 20x{newLine}whatever{newLine}{newLine}2 rounds (this is optional)`,
        },
        { newLine: '\n' },
      );

      handleChangeText(value.length === 0 ? help : `${value}\n\n${help}`);
    };

    return (
      <TextField
        maxLength={MaxLength['1024']}
        multiline
        numberOfLines={8}
        label={intl.formatMessage({ defaultMessage: 'Workout Exercises' })}
        value={value}
        onChangeText={handleChangeText}
        afterLabel={
          <TextButton
            title={intl.formatMessage({ defaultMessage: 'Help' })}
            onPress={handleHelpPress}
          />
        }
      />
    );
  },
);

const Buttons = memo<{
  id: NanoID;
  exercises: String1024;
  onRequestClose: () => void;
}>(({ id, onRequestClose }) => {
  const t = useTheme();
  const intl = useIntl();
  const appDispatch = useAppDispatch();

  const handleDeletePress = () => {
    appDispatch({ type: 'deleteWorkout', id });
  };

  // const exercisesModel = useMemo(
  //   () => stringToExercises(exercises),
  //   [exercises],
  // );

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
        // disabled={exercisesModel.exercises.length === 0}
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
});

export const WorkoutDetailForm = memo<{
  id: NanoID;
  onRequestClose: () => void;
}>(({ id, onRequestClose }) => {
  const t = useTheme();

  const workout = useAppState((s) =>
    pipe(
      s.workouts,
      readonlyArray.findFirst((w) => w.id === id),
      option.toNullable,
    ),
  );

  // Close WorkoutDetailForm when a workout is deleted.
  useEffect(() => {
    if (workout == null) onRequestClose();
  }, [onRequestClose, workout]);

  return (
    workout && (
      <Modal onRequestClose={onRequestClose}>
        <View style={[t.width13, t.mh, t.mb]}>
          <Stack>
            <WorkoutNameField id={workout.id} value={workout.name} />
            <WorkoutExercisesField id={workout.id} value={workout.exercises} />
          </Stack>
        </View>
        <Buttons
          id={id}
          exercises={workout.exercises}
          onRequestClose={onRequestClose}
        />
      </Modal>
    )
  );
});
