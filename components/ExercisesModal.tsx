import { option, readonlyArray } from 'fp-ts';
import { increment, pipe } from 'fp-ts/function';
import { FC, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Exercises } from '../utils/stringToExercises';
import { MaxTextWithoutWrap } from './MaxTextWithoutWrap';

export const ExercisesModal: FC<{
  exercises: Exercises;
  onRequestClose: () => void;
}> = ({ exercises: { exercises }, onRequestClose }) => {
  const intl = useIntl();
  const t = useTheme();

  const [index, setIndex] = useState(0);
  const exercise = pipe(exercises, readonlyArray.lookup(index));

  useEffect(() => {
    if (option.isNone(exercise)) onRequestClose();
  }, [exercise, onRequestClose]);

  const handlePressablePress = useCallback(() => {
    setIndex(increment);
  }, []);

  if (option.isNone(exercise)) return null;

  return (
    <Modal transparent visible onRequestClose={onRequestClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={intl.formatMessage({
          defaultMessage: 'Next Exercise',
        })}
        style={[t.flexGrow, t.bgColor, t.justifyCenter, t.itemsCenter]}
        onPress={handlePressablePress}
      >
        <MaxTextWithoutWrap text={exercise.value.name} />
      </Pressable>
    </Modal>
  );
};
