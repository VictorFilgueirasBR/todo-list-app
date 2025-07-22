// frontend-mobile/src/components/HeaderBanner.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

// Obtém a largura da tela para redimensionamento responsivo
const { width } = Dimensions.get('window');

const HeaderBanner = ({ gifSrc }) => {
  return (
    <View style={styles.headerBanner}>
      <Image
        source={gifSrc}
        style={styles.headerBannerImage}
        resizeMode="cover" // Usamos 'cover' para que a imagem preencha a área, semelhante ao object-fit: cover
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // .header-banner do CSS
  headerBanner: {
    width: '100%',
    height: 200, // Altura fixa de 200px (dp)
    overflow: 'hidden', // Equivale a overflow: hidden
    flexDirection: 'row', // display: flex
    justifyContent: 'center', // justify-content: center
    alignItems: 'center', // align-items: center
    backgroundColor: '#000', // background-color: #000
    borderBottomLeftRadius: 15, // border-radius: 0 0 15px 15px
    borderBottomRightRadius: 15, // border-radius: 0 0 15px 15px
    marginBottom: 32, // 2rem = 32px
    // margin-top: 75px do Home.css era aplicado no elemento que CONTÉM o HeaderBanner.
    // Aqui no componente HeaderBanner, só temos o margin-bottom.
    // O margin-top na Home Screen deve vir do componente que renderiza o HeaderBanner.
  },

  // .header-banner img do CSS
  headerBannerImage: {
    width: '100%',
    height: '100%',
    // object-fit: cover -> em React Native é 'cover' para resizeMode
    // Note: resizeMode é uma prop do componente Image, não um estilo.
    // Mas para o StyleSheet, é assim que se "traduz" o comportamento.
    // O border-radius também precisa ser aplicado na imagem se ela tiver o mesmo arredondamento
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
});

export default HeaderBanner;