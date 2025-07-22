// frontend-mobile/src/screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
} from 'react-native';

import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { Anton_400Regular } from '@expo-google-fonts/anton';

import headerGif from '../assets/header-img.png';
import ClassListOrder from '../components/ClassListOrder';
import FuncionalidadesExplicadas from '../components/FuncionalidadesExplicadas'; // ✅ Importado o componente

// Obtém a largura da tela para uso responsivo
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Anton_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando Home...</Text>
      </View>
    );
  }

  const handleCtaPress = () => {
    alert('Navegação para a tela de cadastro em desenvolvimento!');
  };

  const handleGithubPress = () => {
    Linking.openURL('https://github.com/VictorFilgueirasBR/');
  };

  return (
    <ScrollView style={styles.homeWrapper}>
      {/* Header GIF / Capa Animada */}
      <View style={styles.headerGif}>
        <Image source={headerGif} style={styles.headerGifImage} resizeMode="cover" />
      </View>

      <View style={styles.homeContainer}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Organize sua rotina com eficiência</Text>
            <Text style={styles.heroParagraph}>Crie, edite e receba lembretes das suas tarefas de forma intuitiva e prática.</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={handleCtaPress}>
              <Text style={styles.ctaButtonText}>Começar Agora</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divisor visual entre Header e nova body */}
        <View style={styles.dividerSectionHome}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>TO DO LIST</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Principais Funcionalidades</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureCardTitle}>Criação de Tarefas</Text>
              <Text style={styles.featureCardParagraph}>Adicione novas tarefas com título, descrição, mídia e horário definido.</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureCardTitle}>Lembretes Inteligentes</Text>
              <Text style={styles.featureCardParagraph}>Receba alertas antes do prazo expirar com base no horário definido.</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureCardTitle}>Design Responsivo</Text>
              <Text style={styles.featureCardParagraph}>Acesse sua lista de tarefas com visual limpo e adaptado para qualquer tela.</Text>
            </View>
          </View>
        </View>

        {/* ✅ Componente FuncionalidadesExplicadas adicionado */}
        <FuncionalidadesExplicadas />

        {/* ✅ Componente ClassListOrder no lugar correto, sem duplicação */}
        <ClassListOrder />

        {/* About Section */}
        <View style={styles.about}>
          <Text style={styles.aboutTitle}>Sobre o Projeto</Text>
          <Text style={styles.aboutParagraph}>
            Meu primeiro projeto publico como Engenheiro de Software e desenvolvedor fullstack. Analisando sempre as melhores opções para aplicação de boas práticas de desenvolvimento web/mobile com designs intuitívo e sou um entusiasta de tecnologias de Inteligências Artificiais, Machine Learning, Chunk, Criptografia e metodologia DEVOPS.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 TO DO LIST App. Todos os direitos reservados.{' '}
            <Text
              style={styles.footerLink}
              onPress={handleGithubPress}
            >
              GitHub
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
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
  homeWrapper: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerGif: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: 0,
    marginBottom: 0,
  },
  headerGifImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  homeContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#121212',
    paddingHorizontal: 20, // Mantido para padding lateral do conteúdo
  },
  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 32,
    marginBottom: 64,
  },
  heroText: {
    paddingTop: 15,
    flex: 1,
    minWidth: 280,
  },
  heroTitle: {
    fontSize: width > 768 ? 44.8 : 32,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 16,
    color: '#ffff',
  },
  heroParagraph: {
    fontSize: width > 768 ? 19.2 : 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#d1d1d1',
    marginBottom: 32,
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  dividerSectionHome: {
    paddingTop: 10,
    width: '100%', // Alterado de 90% para 100% para ocupar o padding horizontal do homeContainer
    maxWidth: 1200,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#555',
  },
  dividerText: {
    fontFamily: 'Anton_400Regular',
    fontSize: 17.6,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  features: {
    marginBottom: 64,
  },
  featuresTitle: {
    color: '#fff',
    fontSize: width > 600 ? 32 : 27.2,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 32,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'column',
    gap: 32,
  },
  featureCard: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 10,
    shadowColor: 'rgba(0, 191, 255, 0.05)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  featureCardTitle: {
    marginBottom: 12.8,
    fontSize: 19.2,
    color: '#00bfff',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  featureCardParagraph: {
    color: '#bdbdbd',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  about: {
    paddingVertical: 32,
  },
  aboutTitle: {
    fontSize: 32,
    color: '#00bfff',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutParagraph: {
    fontSize: 17.6,
    maxWidth: 800,
    alignSelf: 'center',
    color: '#d1d1d1',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2c',
    alignItems: 'center',
  },
  footerText: {
    color: '#aaa',
    fontSize: 15.2,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  footerLink: {
    color: '#00bfff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default HomeScreen;