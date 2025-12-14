import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('App component loaded successfully');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LTP Turf Owner</Text>
      <Text style={styles.subtitle}>Debug Mode - Basic App Working ✅</Text>
      <Text style={styles.info}>If you see this, React Native is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});