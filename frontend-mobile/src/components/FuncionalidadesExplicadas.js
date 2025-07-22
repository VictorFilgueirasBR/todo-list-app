// frontend-mobile/src/components/FuncionalidadesExplicadas.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Se quiser usar um ícone de nuvem como no web, você precisaria de @expo/vector-icons ou imagem
import { Feather } from '@expo/vector-icons'; // Exemplo para o ícone de check

const FuncionalidadesExplicadas = () => {
  return (
    <View style={styles.explicacaoFuncionalidades}>
      <Text 
      style={styles.title}
      numberOfLines={1} // ✅ Garante que o texto fique em uma única linha
      >
        {/* ✅ CORREÇÃO: Combinei o ícone e o texto em um único componente Text */}
        <Text>☁️ Como funciona o TO DO List?</Text> 
      </Text>
      <Text style={styles.paragraph}>
        O TO DO List é uma aplicação desenvolvida para te ajudar a manter o foco nas tarefas que realmente importam. Com uma interface intuitiva e funcionalidades práticas, você pode:
      </Text>

      {/* Usaremos Views para simular a lista (ul/li) */}
      <View style={styles.list}>
        <View style={styles.listItem}>
          <Text style={styles.listItemBullet}>✔️</Text>
          <Text style={styles.listItemText}>
            <Text style={styles.listItemBold}>Criar Tarefas:</Text> Defina um título, descrição, horário e até adicione mídias para organizar melhor.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listItemBullet}>✔️</Text>
          <Text style={styles.listItemText}>
            <Text style={styles.listItemBold}>Agendar Lembretes:</Text> Escolha com quantos minutos de antecedência deseja ser notificado.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listItemBullet}>✔️</Text>
          <Text style={styles.listItemText}>
            <Text style={styles.listItemBold}>Acessar com Login:</Text> Cada usuário tem seu perfil com tarefas organizadas de forma segura.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listItemBullet}>✔️</Text>
          <Text style={styles.listItemText}>
            <Text style={styles.listItemBold}>Responsivo:</Text> Utilize no celular, tablet ou computador, com design que se adapta a qualquer tela.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listItemBullet}>✔️</Text>
          <Text style={styles.listItemText}>
            <Text style={styles.listItemBold}>Dados salvos:</Text> Suas tarefas ficam disponíveis mesmo que você feche o navegador.
          </Text>
        </View>
      </View>

      <Text style={styles.paragraph}>Experimente agora, organize sua rotina com mais leveza e tenha total controle sobre sua TO DO LIST.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // .explicacao-funcionalidades do CSS
  explicacaoFuncionalidades: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 32, // 2rem = 32px
    paddingVertical: 48, // 3rem = 48px
    borderRadius: 12,
    marginTop: 64, // 4rem = 64px
    marginBottom: 64, // 4rem = 64px
    // color: #f0f0f0; -> aplicado em componentes Text
    // box-shadow: 0 0 20px rgba(0, 191, 255, 0.05); -> simulado
    shadowColor: 'rgba(0, 191, 255, 0.05)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, // Opacidade total para a cor do shadow
    shadowRadius: 20,
    elevation: 10, // Para Android, simula box-shadow
    // font-family: 'Montserrat', sans-serif; -> aplicado em componentes Text
  },

  // .explicacao-funcionalidades h2 do CSS
  title: {
    fontSize: 20, // 2rem = 32px
    color: '#00bfff',
    marginBottom: 16, // 1rem = 16px
    textAlign: 'center',
    fontWeight: 'bold', // H2 geralmente é bold
    // fontFamily: 'Montserrat_Bold' ou 'Montserrat_SemiBold' se carregado
  },

  // .explicacao-funcionalidades p do CSS
  paragraph: {
    fontSize: 17.6, // 1.1rem = 17.6px
    lineHeight: 25.6, // 1.6 * 16 (tamanho base para 1rem) = 25.6px
    marginBottom: 24, // 1.5rem = 24px
    textAlign: 'justify', // textAlign: 'justify' funciona para Text
    color: '#d1d1d1',
    // fontFamily: 'Montserrat_Regular'
  },

  // .explicacao-funcionalidades ul (list-style, padding-left, margin-bottom)
  list: {
    // React Native não tem ul/li, usamos View para o container e View/Text para os itens
    paddingLeft: 0, // Não aplica em View, é mais sobre o padding do item
    marginBottom: 24, // 1.5rem = 24px
  },

  // .explicacao-funcionalidades li (margin-bottom, font-size, padding-left, position, relative)
  listItem: {
    flexDirection: 'row', // Para colocar o bullet e o texto lado a lado
    alignItems: 'flex-start', // Alinha o bullet no topo do texto
    marginBottom: 16, // 1rem = 16px
    paddingLeft: 24, // 1.5rem = 24px (espaço para o bullet e padding)
    position: 'relative', // Para o bullet absoluto se necessário (mas faremos inline)
  },

  // .explicacao-funcionalidades li::before (content, position, left, top)
  listItemBullet: {
    position: 'absolute',
    left: 0, // Posiciona o bullet no início da linha
    top: 0, // Alinha com o topo do texto
    fontSize: 16, // Tamanho do bullet
    marginRight: 8, // Espaço entre o bullet e o texto
    color: '#00cc66', // Cor do ✔️
  },

  listItemText: {
    flex: 1, // Faz o texto ocupar o restante do espaço
    fontSize: 16, // 1rem = 16px
    color: '#f0f0f0', // Cor do texto da lista
    lineHeight: 22, // Para melhor leitura
  },
  listItemBold: {
    fontWeight: 'bold', // Para o <strong>
  },
});

export default FuncionalidadesExplicadas;