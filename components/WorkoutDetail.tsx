import { option, readonlyArray } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { memo, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { NanoID } from '../codecs/branded';
import { useAppDispatch, useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { OutlineButton } from './buttons/OutlineButton';
import { Heading } from './elements/Heading';
import { Modal } from './Modal';

const DeleteButton = ({ id }: { id: NanoID }) => {
  const intl = useIntl();
  const appDispatch = useAppDispatch();

  const handlePress = () => {
    appDispatch({ type: 'deleteWorkout', id });
  };

  return (
    <OutlineButton
      title={intl.formatMessage({ defaultMessage: 'Delete' })}
      onPress={handlePress}
    />
  );
};

export const WorkoutDetail = memo<{
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

  useEffect(() => {
    if (workout == null) onRequestClose();
  }, [onRequestClose, workout]);

  return (
    workout && (
      <Modal onRequestClose={onRequestClose}>
        <Heading level={2} style={[t.text, t.color]}>
          {workout.name}
        </Heading>
        <View style={[t.flexRow, t.justifyEvenly, t.mt]}>
          <DeleteButton id={id} />
        </View>
      </Modal>
    )
  );
});
