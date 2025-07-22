// frontend-mobile/src/components/TaskListReview.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar as fontes necessárias do @expo-google-fonts
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Anton_400Regular } from '@expo-google-fonts/montserrat';


const TaskListReview = ({ list, onClose, onUpdateList, onDeleteList }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar as fontes
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Anton_400Regular,
  });

  // URL da API, ajuste para o IP da sua máquina
  const API_URL = 'http://192.168.0.23:5000'; 

  // Efeito para carregar os dados do lembrete quando a lista muda
  useEffect(() => {
    if (list?.reminder?.date && list?.reminder?.time) {
      setReminderDate(list.reminder.date);
      setReminderTime(list.reminder.time);
    } else {
      setReminderDate("");
      setReminderTime("");
    }
  }, [list]);

  // Exibir indicador de carregamento ou mensagem se a lista não estiver disponível
  if (!list || !list._id) {
    console.log("TaskListReview: Componente em estado de carregamento (aguardando dados da lista).");
    console.log("  list:", list);
    console.log("  list._id:", list ? list._id : 'N/A (list é nulo/indefinido ou não tem _id)');
    console.log("  fontsLoaded (neste ponto pode ser false, mas não trava a renderização se list estiver ok):", fontsLoaded);
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bfff" />
        <Text style={styles.loadingText}>Carregando detalhes da lista...</Text>
      </View>
    );
  }

  const currentListId = list._id;

  // Função para obter a URL completa da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const fullImageUrl = `${API_URL}${imagePath}`;
    console.log("getImageUrl: URL completa da imagem:", fullImageUrl); // Mantido para depuração
    return fullImageUrl;
  };

  // Função para alternar o status de conclusão de um item
  const handleToggleItemCompletion = async () => {
    if (!selectedItem) return;

    const updatedItems = list.items.map((i) =>
      i._id === selectedItem._id ? { ...i, completed: !i.completed } : i
    );

    const updatedListPayload = { ...list, items: updatedItems };

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado para atualizar a lista.");
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/tasklists/${currentListId}`,
        updatedListPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      onUpdateList(response.data.taskList);
      setSelectedItem(response.data.taskList.items.find(item => item._id === selectedItem._id));

      Alert.alert(
        "Sucesso",
        response.data.taskList.items.find(item => item._id === selectedItem._id).completed
          ? "Item marcado como concluído!"
          : "Item marcado como pendente!"
      );
    } catch (error) {
      console.error("Erro ao atualizar status do item:", error.response ? error.response.data : error.message);
      Alert.alert("Erro", "Erro ao atualizar item. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar o lembrete
  const handleSaveReminder = async () => {
    if (!reminderDate || !reminderTime) {
      Alert.alert("Aviso", "Por favor, selecione a data e a hora para o lembrete.");
      return;
    }

    const updatedListPayload = {
      ...list,
      reminder: {
        date: reminderDate,
        time: reminderTime,
      },
    };

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erro", "Você precisa estar logado para salvar o lembrete.");
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/tasklists/${currentListId}`,
        updatedListPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      onUpdateList(response.data.taskList);
      Alert.alert("Sucesso", "Lembrete salvo com sucesso!");
      setShowNotifyPopup(false);
    } catch (error) {
      console.error("Erro ao salvar lembrete:", error.response ? error.response.data : error.message);
      Alert.alert("Erro", "Erro ao salvar lembrete. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para confirmar e deletar a lista
  const handleConfirmListDeletion = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente excluir esta lista?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert("Erro", "Você precisa estar logado para excluir a lista.");
                setLoading(false);
                return;
              }

              await axios.delete(`${API_URL}/api/tasklists/${currentListId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              onDeleteList(currentListId);
              Alert.alert("Sucesso", "Lista excluída com sucesso!");
              onClose();
            } catch (error) {
              console.error("Erro ao deletar lista:", error.response ? error.response.data : error.message);
              Alert.alert("Erro", "Erro ao deletar lista. Tente novamente.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true} 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tasklistreviewBox}>
          <View style={styles.tasklistreviewHeader}>
            <Text style={styles.tasklistreviewTitle}>
              {selectedItem ? selectedItem.title : list.title}
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={selectedItem ? () => setSelectedItem(null) : onClose}
            >
              {selectedItem ? (
                <Feather name="arrow-left-circle" size={24} color="#fff" />
              ) : (
                <Text style={styles.backButtonText}>X</Text>
              )}
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.overlayLoading}>
              <ActivityIndicator size="large" color="#00bfff" />
              <Text style={styles.loadingText}>Processando...</Text>
            </View>
          )}

          {!selectedItem ? (
            <>
              <Text style={styles.tasklistreviewDescription}>{list.description}</Text>
              <ScrollView style={styles.tasklistreviewItems}>
                {list.items?.length > 0 ? (
                  list.items.map((item, index) => (
                    <TouchableOpacity
                      key={item._id || index}
                      style={[styles.tasklistreviewItem, item.completed ? styles.completedItem : {}]}
                      onPress={() => setSelectedItem(item)}
                    >
                      <Text style={styles.tasklistreviewItemText}>{item.title}</Text>
                      {item.completed ?
                        <Feather name="check-circle" size={18} color="#00bfff" style={styles.itemCompletedIcon} /> :
                        <Feather name="circle" size={18} color="#ccc" style={styles.itemCompletedIcon} />
                      }
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>Nenhum item adicionado.</Text>
                )}
              </ScrollView>

              <View style={styles.dividerSectionItem}>
                <View style={styles.dividerLineUp} />
                <Text style={styles.dividerTextProgram}>AGENDADO PARA</Text>
                <View style={styles.dividerLineDown} />
              </View>

              {list.reminder?.date && list.reminder?.time ? (
                <View style={styles.reminderBox}>
                  <View style={styles.reminderTextContainer}>
                    <Text style={styles.reminderText}>Data: {list.reminder.date}</Text>
                    <Text style={styles.reminderText}>Hora: {list.reminder.time}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.timerprogramButton, styles.editReminderButton]}
                    onPress={() => setShowNotifyPopup(true)}
                  >
                    <Text style={styles.timerprogramButtonText}>Editar Lembrete</Text>
                    <Ionicons name="notifications" size={20} color="#fff" style={styles.alarmIcon} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.timerButton}>
                  <TouchableOpacity
                    style={styles.timerprogramButton}
                    onPress={() => setShowNotifyPopup(true)}
                  >
                    <Text style={styles.timerprogramButtonText}>Adicionar lembrete</Text>
                    <Ionicons name="notifications" size={20} color="#fff" style={styles.alarmIcon} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.deleteListButton}
                onPress={handleConfirmListDeletion}
              >
                <Text style={styles.deleteListButtonText}>Excluir Lista</Text>
              </TouchableOpacity>

            </>
          ) : (
            <ScrollView style={styles.itemDetailsScrollView}>
              <View style={styles.dividerSectionItem}>
                <View style={styles.dividerLine} />
              </View>

              {selectedItem.link && (
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Link:</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(selectedItem.link)}>
                    <Text style={styles.tasklistreviewLink}>{selectedItem.link}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedItem.description && (
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Descrição:</Text>
                  <Text style={styles.tasklistreviewItemDescription}>{selectedItem.description}</Text>
                </View>
              )}

              <View style={styles.dividerSectionItem}>
                <View style={styles.dividerLine} />
              </View>

              {selectedItem.image && (
                <View style={styles.tasklistreviewImageWrapper}>
                  <Image
                    source={{ uri: getImageUrl(selectedItem.image) }} // Revertido para a URL dinâmica
                    style={styles.tasklistreviewImage}
                    // ✅ DEBUG: Log de erros de carregamento da imagem (mantido para depuração)
                    onError={(e) => console.warn('TaskListReview: Erro ao carregar imagem:', e.nativeEvent.error)}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.concludeItemButton, selectedItem.completed ? styles.reopenItemButton : {}]}
                onPress={handleToggleItemCompletion}
              >
                <Text style={styles.concludeItemButtonText}>
                  {selectedItem.completed ? "Reabrir Item" : "Concluir Item"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {showNotifyPopup && (
            <Modal
              animationType="fade"
              transparent={true}
              visible={true}
              onRequestClose={() => setShowNotifyPopup(false)}
            >
              <View style={styles.confirmOverlay}>
                <View style={styles.confirmBox}>
                  <Text style={styles.popupNotifyTitle}>Programar lembrete</Text>

                  <TextInput
                    style={styles.popupInput}
                    placeholder="Data (AAAA-MM-DD)"
                    placeholderTextColor="#aaa"
                    value={reminderDate}
                    onChangeText={setReminderDate}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.popupInput}
                    placeholder="Hora (HH:MM)"
                    placeholderTextColor="#aaa"
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    keyboardType="numeric"
                  />

                  <View style={styles.confirmButtons}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleSaveReminder}>
                      <Text style={styles.confirmButtonText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowNotifyPopup(false)}>
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tasklistreviewBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  overlayLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
  },
  tasklistreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  tasklistreviewTitle: {
    marginTop: 5,
    marginBottom: 0,
    fontFamily: 'Anton_400Regular',
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.71)',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 5,
  },
  backButtonText: {
    color: '#ccc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tasklistreviewDescription: {
    marginVertical: 10,
    color: '#ccc',
    width: '100%',
    fontFamily: 'Montserrat_400Regular',
  },
  tasklistreviewItems: {
    width: '100%',
    maxHeight: 200,
  },
  tasklistreviewItem: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tasklistreviewItemText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    flexShrink: 1,
    fontWeight: 'bold',
  },
  completedItem: {
    backgroundColor: 'transparent',
    borderColor: '#888',
  },
  itemCompletedIcon: {
    marginLeft: 10,
    color: '#00bfff',
  },
  noItemsText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  dividerSectionItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#555',
  },
  dividerLineUp: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 102, 102, 0.15)',
    marginTop: 8,
  },
  dividerLineDown: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 102, 102, 0.15)',
    marginTop: 5,
  },
  dividerTextProgram: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.29)',
    marginHorizontal: 10,
    fontFamily: 'Anton_400Regular',
  },
  reminderBox: {
    width: '100%',
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    marginTop: 0,
  },
  reminderTextContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reminderText: {
    color: '#ccc',
    fontSize: 12,
    marginHorizontal: 5,
    fontFamily: 'Montserrat_600SemiBold',
  },
  timerButton: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  timerprogramButton: {
    backgroundColor: '#00bfff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  timerprogramButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    fontFamily: 'Montserrat_600SemiBold',
  },
  editReminderButton: {
    marginTop: 0,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  alarmIcon: {
    marginLeft: 5,
    fontSize: 13,
    color: '#fff',
  },
  deleteListButton: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  deleteListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  itemDetailsScrollView: {
    width: '100%',
  },
  itemDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  itemDetailLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    fontFamily: 'Montserrat_600SemiBold',
  },
  tasklistreviewLink: {
    color: '#00bfff',
    textDecorationLine: 'underline',
    flexShrink: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  tasklistreviewItemDescription: {
    color: '#ccc',
    fontSize: 9.5,
    marginVertical: 5,
    marginBottom: 10,
    lineHeight: 13.3,
    flexShrink: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  tasklistreviewImageWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#2a2a2a', // Adicionado para ver a área da imagem
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  tasklistreviewImage: {
    width: '100%',
    height: '100%', // Alterado para ocupar 100% do wrapper
    resizeMode: 'cover', // Alterado para 'cover' para preencher a área
    // maxHeight: 300, // Removido, pois height: '100%' já define a altura
    marginTop: 0, // Removido ou ajustado para 0
  },
  concludeItemButton: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#00bfff',
    borderRadius: 8,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concludeItemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  reopenItemButton: {
    backgroundColor: '#ffc107',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmBox: {
    backgroundColor: '#222',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
  },
  popupNotifyTitle: {
    marginTop: 0,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  popupInput: {
    marginVertical: 10,
    padding: 10,
    width: '100%',
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    backgroundColor: '#121212',
    color: '#fff',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#00bfff',
    borderWidth: 0,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#555',
    borderWidth: 0,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default TaskListReview;
