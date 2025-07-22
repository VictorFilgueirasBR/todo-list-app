// frontend-mobile/src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react'; // Importe useState e useEffect
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet, Alert } from 'react-native'; // Importe Alert para mensagens
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importe AsyncStorage

// Importe suas telas
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
// import SettingsModal from '../components/SettingsModal'; // ✅ REMOVIDO: SettingsModal não é mais global aqui
import DashboardScreen from '../screens/DashboardScreen';
import TaskListScreen from '../screens/TaskListScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';

import AppHeader from '../components/AppHeader';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Usa useState
  const [username, setUsername] = useState(null); // ✅ NOVO ESTADO: Para armazenar o username
  // const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false); // ✅ REMOVIDO: Gerenciado pela ProfileScreen

  // Efeito para carregar o username e o token ao iniciar o aplicativo
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUsername = await AsyncStorage.getItem('username');

        if (storedToken) {
          setIsLoggedIn(true);
        }
        if (storedUsername) {
          setUsername(storedUsername); // ✅ Carrega o username do AsyncStorage
        }
      } catch (e) {
        console.error('Falha ao carregar dados do usuário no AppNavigator:', e);
      }
    };
    loadUserData();
  }, []); // Executa apenas uma vez ao montar o componente

  const handleLogout = async () => { // ✅ Tornando assíncrona para usar await no AsyncStorage
    try {
      await AsyncStorage.removeItem('userToken'); // Limpa o token
      await AsyncStorage.removeItem('username'); // Limpa o username
      setIsLoggedIn(false);
      setUsername(null); // Limpar o username ao deslogar
      Alert.alert('Desconectado', 'Você foi desconectado com sucesso!');
      // navigation.navigate('Home'); // Se precisar navegar após o logout (AppNavigator não tem acesso direto a navigation, teria que passar ou usar useNavigation)
    } catch (e) {
      console.error('Erro ao fazer logout:', e);
      Alert.alert('Erro', 'Erro ao desconectar.');
    }
  };

  const handleLoginSuccess = async (loggedInUsername) => { // ✅ Aceita username como parâmetro
    setIsLoggedIn(true);
    if (loggedInUsername) {
      setUsername(loggedInUsername); // ✅ Define o username após o login
      await AsyncStorage.setItem('username', loggedInUsername); // Salva no AsyncStorage
    }
  };

  // const openSettings = () => { // ✅ REMOVIDO: Gerenciado pela ProfileScreen
  //   setIsSettingsModalVisible(true);
  // };

  // const closeSettings = () => { // ✅ REMOVIDO: Gerenciado pela ProfileScreen
  //   setIsSettingsModalVisible(false);
  // };

  return (
    <NavigationContainer>
      {/* O SafeAreaView engloba todo o conteúdo da tela, incluindo o Header e o Navigator */}
      <SafeAreaView style={styles.safeArea}>
        {/* AppHeader renderizado aqui, fora do Stack.Navigator, como um componente fixo */}
        <AppHeader
          isLoggedIn={isLoggedIn}
          onOpenSettings={() => { /* ProfileScreen gerencia seu próprio modal */ }} // Função vazia ou lógica para um modal global diferente
          onLogout={handleLogout}
          username={username} // ✅ Passando o username para o AppHeader
        />
        {/* O Stack.Navigator vem logo abaixo do Header */}
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // Esconde o cabeçalho padrão do Stack Navigator
            cardStyle: styles.stackCard,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="TaskList" component={TaskListScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          {/* ✅ Passa a prop onLoginSuccess para LoginScreen */}
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        </Stack.Navigator>
      </SafeAreaView>

      {/* ✅ REMOVIDO: O SettingsModal é gerenciado e renderizado pela ProfileScreen agora.
          Deixando-o aqui causaria o erro de username novamente e comportamento duplicado.
      <SettingsModal
        isVisible={isSettingsModalVisible}
        onClose={closeSettings}
        username={username}
        setUsername={setUsername}
        setProfileImage={setProfileImage}
        initialSection={null}
        setInitialSection={() => {}}
      />
      */}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  stackCard: {
    // Este paddingTop é crucial para que o conteúdo das telas não fique atrás do AppHeader
    paddingTop: 80, // Ajustado para acomodar o cabeçalho mais alto (70 original + 10 do AppHeader)
    backgroundColor: '#1a1a1a',
  },
});

export default AppNavigator;