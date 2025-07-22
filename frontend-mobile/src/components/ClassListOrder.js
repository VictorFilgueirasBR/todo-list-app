// frontend-mobile/src/components/ClassListOrder.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat'; // Importar fontes Montserrat

// Usar Dimensions para a responsividade, se necessário, mas por enquanto para estilos básicos
const { width: screenWidth } = Dimensions.get('window');

const ClassListOrder = () => {
  // Carregar as fontes Montserrat, se ainda não estiverem carregadas globalmente (ex: em App.js)
  // Se elas já estiverem carregadas em App.js, você pode remover este useFonts aqui
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold, // Para o h3 que pode usar uma fonte mais bold
  });

  if (!fontsLoaded) {
    return null; // Retorna null enquanto as fontes não carregam
  }

  return (
    <View style={styles.classListOrderLegend}>
      <Text style={styles.legendTitle}>Lembretes inteligentes definidos por cores.</Text>

      <View style={styles.legendItem}>
        <View style={[styles.legendColorDot, styles.urgentRedBorder]}></View>
        <Text style={styles.legendText}>Faltam 6 horas ou menos para a conclusão da lista.</Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColorDot, styles.urgentOrangeBorder]}></View>
        <Text style={styles.legendText}>Faltam 36 horas ou menos para a conclusão da lista.</Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColorDot, styles.urgentGreenBorder]}></View>
        <Text style={styles.legendText}>Faltam 5 dias ou menos para conclusão da lista.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  classListOrderLegend: {
    backgroundColor: '#121212', // Fundo escuro para a caixa da legenda
    borderWidth: 1, // border: solid 1px
    borderColor: '#6666662d', // #6666662d em RN pode ser 'rgba(102, 102, 102, 0.18)'
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    // box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5, // Para Android
    // media query @media (max-width: 500px) margin: 1rem 0.5rem;
    // Podemos aplicar margem horizontal aqui para mobile
    marginHorizontal: screenWidth > 500 ? 0 : 10, // 0.5rem aprox. 10px
  },
  legendTitle: {
    marginTop: 0, // Garante que não haja margin-top extra
    marginBottom: 15,
    color: '#ffffff',
    fontSize: 18, // 1.1rem aprox. 17.6px, arredondado para 18px
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold', // Fonte para o título, se preferir mais bold
  },
  legendItem: {
    flexDirection: 'row', // display: flex
    alignItems: 'center', // Centraliza verticalmente
    marginBottom: 5, // Espaçamento entre os itens da lista
  },
  legendColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9, // Metade da largura/altura para 50%
    marginRight: 10,
    borderWidth: 1, // Para a borda que virá das classes de cor
  },
  legendText: {
    color: '#f0f0f0',
    fontSize: 14, // 0.9rem aprox. 14.4px, arredondado para 14px
    fontFamily: 'Montserrat_400Regular', // Fonte para o texto
    flexShrink: 1, // Permite que o texto quebre linha se for muito longo
  },
  // Cores das bordas (agora como background-color e borderColor)
  urgentRedBorder: {
    backgroundColor: '#f44336',
    borderColor: '#d32f2f',
  },
  urgentOrangeBorder: {
    backgroundColor: '#ff9800',
    borderColor: '#f57c00',
  },
  urgentGreenBorder: {
    backgroundColor: '#4CAF50',
    borderColor: '#388e3c',
  },
});

export default ClassListOrder;