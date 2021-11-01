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
          // https://twitter.com/estejs/status/1455272409385340936
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
