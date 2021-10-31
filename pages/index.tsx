import type { NextPage } from 'next';
import { useIntl } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
});

const Home: NextPage = () => {
  const intl = useIntl();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {intl.formatMessage({ defaultMessage: 'Soon' })}
      </Text>
    </View>
  );
};

export default Home;
