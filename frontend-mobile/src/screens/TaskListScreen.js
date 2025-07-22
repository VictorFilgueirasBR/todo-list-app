// frontend-mobile/src/screens/TaskListScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Minhas Tarefas (TaskListScreen)</Text>
      <Text style={styles.subText}>Em breve, suas tarefas aparecerão aqui!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a', // Fundo escuro consistente com o restante do app
    padding: 20, // Um pouco de padding para o conteúdo
  },
  text: {
    color: '#00bfff', // Cor de destaque para o título
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    color: '#d1d1d1', // Cor mais suave para o texto secundário
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TaskListScreen;