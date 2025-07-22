// frontend-mobile/src/screens/SignUpScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

function SignUpScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [usernameAvailability, setUsernameAvailability] = useState(null);
  const [emailAvailability, setEmailAvailability] = useState(null);

  const usernameTimer = useRef(null);
  const emailTimer = useRef(null);

  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    let errors = [];
    if (password.length < 8) errors.push('A senha deve ter pelo menos 8 caracteres.');
    if (!/[A-Z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra maiúscula.');
    if (!/[a-z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra minúscula.');
    if (!/[0-9]/.test(password)) errors.push('A senha deve conter pelo menos um número.');
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) errors.push('A senha deve conter pelo menos um caractere especial (ex: !@#$%).');
    
    if (errors.length > 0) {
      setPasswordError(errors.join('\n'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailability(null);
      return;
    }
    setUsernameAvailability('checking');
    try {
      const res = await api.post('/api/auth/check-username', { username }); 
      if (res.data.available) {
        setUsernameAvailability('available');
      } else {
        setUsernameAvailability('taken');
        Alert.alert('Erro', 'Nome de usuário não disponível.');
      }
    } catch (err) {
      console.error('Erro ao verificar nome de usuário:', err);
      setUsernameAvailability('error');
    }
  };

  const checkEmailAvailability = async (email) => {
    if (!email.includes('@') || email.length < 5) {
      setEmailAvailability(null);
      return;
    }
    setEmailAvailability('checking');
    try {
      const res = await api.post('/api/auth/check-email', { email });
      if (res.data.available) {
        setEmailAvailability('available');
      } else {
        setEmailAvailability('taken');
        Alert.alert('Erro', 'Esse email já está cadastrado.');
      }
    } catch (err) {
      console.error('Erro ao verificar email:', err);
      setEmailAvailability('error');
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');

    if (name === 'password') {
      validatePassword(value);
    } else if (name === 'username') {
      if (usernameTimer.current) {
        clearTimeout(usernameTimer.current);
      }
      usernameTimer.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    } else if (name === 'email') {
      if (emailTimer.current) {
        clearTimeout(emailTimer.current);
      }
      emailTimer.current = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setPasswordError('');

    const isPasswordValid = validatePassword(formData.password);
    if (!isPasswordValid) {
      return;
    }

    if (usernameAvailability === 'taken') {
      Alert.alert('Erro', 'Por favor, escolha outro nome de usuário.');
      return;
    }
    if (emailAvailability === 'taken') {
      Alert.alert('Erro', 'Por favor, use um email diferente.');
      return;
    }
    if (usernameAvailability === 'checking' || emailAvailability === 'checking') {
      Alert.alert('Aguarde', 'Aguarde a verificação de disponibilidade.');
      return;
    }

    try {
      const res = await api.post('/api/auth/signup', formData);

      if (res.data.token) {
        // await AsyncStorage.setItem('token', res.data.token);
        Alert.alert('Sucesso!', 'Cadastro realizado com sucesso! Faça login.');
      }
      
      navigation.navigate('Login');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro desconhecido ao criar conta';

      if (err.response && err.response.status === 409) {
        if (errorMessage.includes('username')) {
          setUsernameAvailability('taken');
          Alert.alert('Erro', 'Nome de usuário não disponível.');
        } else if (errorMessage.includes('email')) {
          setEmailAvailability('taken');
          Alert.alert('Erro', 'Esse email já está cadastrado.');
        } else {
          setError(errorMessage);
          Alert.alert('Erro', errorMessage);
        }
      } else {
        setError(errorMessage);
        Alert.alert('Erro', errorMessage);
      }
      console.error('Erro detalhado:', err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View style={styles.inputWithIcon}>
        <TextInput
          style={styles.input}
          placeholder="Nome de usuário"
          placeholderTextColor="#aaa"
          value={formData.username}
          onChangeText={(text) => handleChange('username', text)}
          autoCapitalize="none"
        />
        {usernameAvailability === 'checking' && (
          <ActivityIndicator size="small" color="#00bfff" style={styles.inputIcon} />
        )}
        {usernameAvailability === 'available' && (
          <Ionicons name="checkmark-circle" size={24} color="#00bfff" style={styles.inputIcon} />
        )}
        {usernameAvailability === 'taken' && (
          <Ionicons name="close-circle" size={24} color="#f44336" style={styles.inputIcon} />
        )}
      </View>
      {usernameAvailability === 'checking' && (
        <Text style={styles.checkingMessage}>Verificando...</Text>
      )}
      {usernameAvailability === 'available' && (
        <Text style={styles.availableMessage}>Nome de usuário disponível!</Text>
      )}
      {usernameAvailability === 'taken' && (
        <Text style={styles.takenMessage}>Nome de usuário não disponível.</Text>
      )}

      <View style={styles.inputWithIcon}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailAvailability === 'checking' && (
          <ActivityIndicator size="small" color="#00bfff" style={styles.inputIcon} />
        )}
        {emailAvailability === 'available' && (
          <Ionicons name="checkmark-circle" size={24} color="#00bfff" style={styles.inputIcon} />
        )}
        {emailAvailability === 'taken' && (
          <Ionicons name="close-circle" size={24} color="#f44336" style={styles.inputIcon} />
        )}
      </View>
      {emailAvailability === 'checking' && (
        <Text style={styles.checkingMessage}>Verificando...</Text>
      )}
      {emailAvailability === 'available' && (
        <Text style={styles.availableMessage}>Email disponível!</Text>
      )}
      {emailAvailability === 'taken' && (
        <Text style={styles.takenMessage}>Esse email já está cadastrado.</Text>
      )}

      <View style={styles.inputWithIcon}>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#aaa"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggleIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#888" />
        </TouchableOpacity>
      </View>
      {passwordError ? (
        <View style={styles.passwordRequirements}>
          <Text style={styles.passwordRequirementsTitle}>Requisitos da senha:</Text>
          {passwordError.split('\n').map((msg, index) => (
            <Text key={index} style={styles.passwordErrorMessage}>
              - {msg}
            </Text>
          ))}
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <Text style={styles.explanation}>
        Já tem conta?{' '}
        <Text style={styles.optionText} onPress={() => navigation.navigate('Login')}>
          Entrar
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 50, // Garante espaço para o ícone
  },
  errorMessage: {
    color: 'red',
    backgroundColor: '#ffecec',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  passwordRequirements: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffe0b2',
    borderColor: '#ff9800',
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
    marginBottom: 15,
  },
  passwordRequirementsTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  passwordErrorMessage: {
    color: '#d32f2f',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#00bfff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  explanation: {
    color: '#f0f0f0',
    marginTop: 20,
  },
  optionText: {
    color: '#00bfff',
    fontWeight: 'bold',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }], // Centraliza verticalmente o ícone (24/2)
  },
  passwordToggleIcon: {
    position: 'absolute',
    right: 15, // Posiciona o ícone a 15px da direita
    top: '50%',
    transform: [{ translateY: -15 }], // Centraliza verticalmente o ícone (24/2)
    padding: 5, // Aumenta a área clicável
  },
  checkingMessage: {
    color: 'gray',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
  availableMessage: {
    color: '#00bfff', 
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
  takenMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
});

export default SignUpScreen;