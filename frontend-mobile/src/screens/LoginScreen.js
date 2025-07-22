// frontend-mobile/src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator, // ✅ Importado para o indicador de carregamento
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar as fontes se elas forem usadas localmente e não apenas globalmente via App.js
// Embora o App.js carregue globalmente, é bom ter as referências aqui para clareza
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';


const LoginScreen = ({ onLoginSuccess }) => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Novo estado de carregamento

  const [showPassword, setShowPassword] = useState(false);

  // Carrega as fontes (se App.js já carrega, este hook apenas confirma)
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // Retorna um loader ou null se as fontes ainda não carregaram
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bfff" />
        <Text style={styles.loadingText}>Carregando Login...</Text>
      </View>
    );
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true); // ✅ Ativa o carregamento
    try {
      const res = await api.post('/api/auth/login', formData);

      const { token, username } = res.data;

      // ✅ CORREÇÃO CRÍTICA AQUI: Mudar 'userToken' para 'token'
      // Garante que a chave usada para salvar o token seja a mesma usada para recuperá-lo
      if (token) {
        await AsyncStorage.setItem('token', token); // ✅ Alterado de 'userToken' para 'token'
        // Salva o username garantindo que é uma string válida
        await AsyncStorage.setItem('username', username || '');

        Alert.alert('Sucesso!', 'Login bem-sucedido! Bem-vindo.');

        if (onLoginSuccess) {
          onLoginSuccess(username || '');
        }

        // Navegue para a tela de perfil APÓS o estado ter sido atualizado no componente pai
        navigation.replace('Profile'); // ✅ Usando replace para que o usuário não possa voltar para a tela de login
      } else {
        setError('Token de autenticação não recebido.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido ao tentar fazer login.';

      console.error('Erro no login:', errorMessage);

      // Feedback mais detalhado para o usuário
      if (err.response) {
        Alert.alert('Erro no Login', err.response.data.message || 'Credenciais inválidas. Tente novamente.');
      } else if (err.request) {
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
      }
      setError(errorMessage);
    } finally {
      setLoading(false); // ✅ Desativa o carregamento
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subText}>Acesse sua conta para gerenciar suas tarefas.</Text>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        editable={!loading} // ✅ Desabilita input durante o carregamento
      />

      <View style={styles.inputWithIcon}>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          editable={!loading} // ✅ Desabilita input durante o carregamento
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggleIcon} disabled={loading}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" /> // ✅ Indicador de carregamento no botão
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.signUpPrompt}>
        <Text style={styles.signUpText}>Não tem uma conta?</Text>
        <TouchableOpacity onPress={navigateToSignUp} disabled={loading}>
          <Text style={styles.signUpLink}> Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    color: '#00bfff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold', // ✅ Aplicando a fonte
  },
  subText: {
    color: '#d1d1d1',
    fontSize: 14,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular', // ✅ Aplicando a fonte
  },
  input: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    color: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular', // ✅ Aplicando a fonte
  },
  errorMessage: {
    color: 'red',
    backgroundColor: '#ffecec',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
    fontFamily: 'Montserrat_400Regular', // ✅ Aplicando a fonte
  },
  loginButton: {
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold', // ✅ Aplicando a fonte
  },
  signUpPrompt: {
    flexDirection: 'row',
    marginTop: 30,
  },
  signUpText: {
    color: '#d1d1d1',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular', // ✅ Aplicando a fonte
  },
  signUpLink: {
    color: '#00bfff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold', // ✅ Aplicando a fonte
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  passwordToggleIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }], // Ajustado para centralizar melhor o ícone
    padding: 5,
  },
});

export default LoginScreen;