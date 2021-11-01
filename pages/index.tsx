import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { CreateWorkoutForm } from '../components/CreateWorkoutForm';
import { Title } from '../components/Title';
import { WorkoutsList } from '../components/WorkoutsList';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const intl = useIntl();
  const t = useTheme();

  return (
    <>
      <Title
        title={intl.formatMessage({
          defaultMessage: 'Your calisthenics trainer',
        })}
      />
      <View
        style={[
          t.itemsCenter,
          t.justifyCenter,
          // height: 100vh is tricky with iOS Safari <15 but
          // it seems it works well with Safari 15.
          // https://medium.com/rbi-tech/safaris-100vh-problem-3412e6f13716
          // Nothing is cropped.
          { minHeight: '100vh' },
        ]}
      >
        <WorkoutsList />
        <CreateWorkoutForm />
      </View>
    </>
  );
};

export default Home;
