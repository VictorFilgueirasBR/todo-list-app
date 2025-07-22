// frontend-mobile/src/components/AppHeader.js
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native'; // Adicionado Text
import { useNavigation } from '@react-navigation/native';
import logoImage from '../assets/images/logo.png';
import Sidebar from './Sidebar';
import { Feather } from '@expo/vector-icons'; // Importar Feather se for usar ícones como engrenagem, etc.

const { width: screenWidth } = Dimensions.get('window');

// ✅ Adicionado 'username' nas props recebidas
const AppHeader = ({ isLoggedIn, onOpenSettings, onLogout, username }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.header}>
      {/* Logo */}
      <TouchableOpacity onPress={navigateToHome} style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logo} />
      </TouchableOpacity>

      {/* Seção da Direita: Nome de Usuário (Opcional) e Menu Hamburguer */}
      <View style={styles.rightSection}>
        {/* ✅ Opcional: Mostrar o nome de usuário no cabeçalho global se logado */}
        {/*{isLoggedIn && username && (
          <Text style={styles.usernameText}>{username}</Text>
        )}*/}

        {/* Menu Hamburguer */}
        <TouchableOpacity style={styles.hamburgerMenu} onPress={toggleMenu}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </TouchableOpacity>
      </View>

      {/* Sidebar (Menu Lateral) */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        isLoggedIn={isLoggedIn}
        onOpenSettings={onOpenSettings} // Esta prop ainda é passada para o Sidebar
        onLogout={onLogout}
        username={username} // ✅ Passando username para o Sidebar também, se ele precisar
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: '#000',
    zIndex: 1000,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%',
  },
  logo: {
    height: 50,
    width: 150,
    resizeMode: 'contain',
  },
  rightSection: { // Novo estilo para agrupar elementos da direita
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: { // Estilo para o texto do username (se implementado)
    color: '#fff',
    fontSize: 16,
    marginRight: 15, // Espaçamento entre o username e o menu hambúrguer
  },
  hamburgerMenu: {
    zIndex: 1001,
    padding: 5,
  },
  bar: {
    width: 25,
    height: 3,
    marginVertical: 4,
    backgroundColor: 'white',
  },
});

export default AppHeader;