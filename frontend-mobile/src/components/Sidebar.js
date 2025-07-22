// frontend-mobile/src/components/Sidebar.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions, // Importar Dimensions para obter largura da tela
  Animated,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';

// Obter a largura e altura total da tela
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ✅ NOVIDADE: Largura do Sidebar agora é 50% da largura da tela
const SIDEBAR_WIDTH = screenWidth * 0.5;

const Sidebar = ({ isMenuOpen, toggleMenu, isLoggedIn, onOpenSettings, onLogout }) => {
  const navigation = useNavigation();
  // Valor inicial da animação para fora da tela (SIDEBAR_WIDTH)
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

  const [fontsLoaded] = useFonts({
    Anton_400Regular,
  });

  useEffect(() => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SIDEBAR_WIDTH,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isMenuOpen, slideAnim]);

  if (!fontsLoaded) {
    return null; // Retorna null enquanto as fontes não carregam
  }

  const handleNavigation = (screenName) => {
    toggleMenu();
    navigation.navigate(screenName);
  };

  const handleOpenSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
    toggleMenu();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    toggleMenu();
    navigation.navigate('Home');
  };

  // Se o menu não estiver aberto e já estiver totalmente escondido, não renderiza para otimização
  if (!isMenuOpen && slideAnim.__getValue() === SIDEBAR_WIDTH) {
    return null;
  }

  return (
    // Overlay transparente de tela cheia para fechar o menu ao tocar fora.
    <Pressable style={styles.transparentOverlay} onPress={toggleMenu}>
      {/* Animated.View para o sidebar com a animação de translateX */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Pressable interno para impedir que cliques DENTRO do sidebar fechem o menu. */}
        <Pressable onPress={() => {}} style={styles.menuContentWrapper}>
          <View style={styles.navList}>
            <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Home')}>
              <Text style={styles.navLink}>Home</Text>
            </TouchableOpacity>

            {isLoggedIn ? (
              <>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Profile')}>
                  <Text style={styles.navLink}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={handleOpenSettingsClick}>
                  <Text style={styles.navLink}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, styles.logoutButton]} onPress={handleLogout}>
                  <Text style={styles.navLink}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Login')}>
                  <Text style={styles.navLink}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('SignUp')}>
                  <Text style={styles.navLink}>SignUp</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  transparentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    // ✅ NOVIDADE: Largura definida como 50% da largura da tela
    width: SIDEBAR_WIDTH, 
    // ✅ NOVIDADE: Altura definida como 100% da altura da tela
    height: screenHeight, 
    backgroundColor: '#000000',
    paddingTop: 90,
    zIndex: 1000,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  menuContentWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    backgroundColor: '#000000',
  },
  navList: {
    width: '100%',
  },
  navItem: {
    paddingVertical: 15,
    paddingLeft: 20,
    width: '100%',
  },
  navLink: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Anton_400Regular',
  },
  logoutButton: {
    // Estilos adicionais se necessário
  },
  sidebarButton: {
    // Estilos adicionais se necessário
  },
});

export default Sidebar;