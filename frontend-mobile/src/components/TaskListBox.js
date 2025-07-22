// frontend-mobile/src/components/TaskListBox.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Importação do ImagePicker
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { Anton_400Regular } from '@expo-google-fonts/anton';

const TaskListBox = ({ onCancel, onSaveListSuccess }) => {
  const { width, height } = useWindowDimensions();

  const [step, setStep] = useState("form");
  const [listTitle, setListTitle] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemLink, setItemLink] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const maxChars = 150;
  const remainingChars = maxChars - listDescription.length;
  const itemRemainingChars = maxChars - itemDescription.length;

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Anton_400Regular,
  });

  const API_URL = 'http://192.168.0.23:5000'; // Ajuste para o IP da sua máquina, se necessário.

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Precisamos de permissão para acessar sua galeria de fotos para fazer upload de imagens.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      // ✅ CORREÇÃO: Usando ImagePicker.MediaType.Images em vez de ImagePicker.MediaTypeOptions.Images
      mediaTypes: ImagePicker.MediaType.Images, 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setLoading(true);
      const base64Image = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
      setPreviewImage(base64Image);
      setLoading(false);
      Alert.alert('Sucesso!', 'Imagem carregada para visualização.');
    } else {
      Alert.alert('Cancelado', 'Seleção de imagem cancelada.');
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    Alert.alert("Removido", "Imagem removida.");
  };

  const handleAddItemToList = () => {
    if (!itemTitle.trim()) {
      Alert.alert("Aviso", "Dê um título ao item!");
      return;
    }
    const newItem = {
      title: itemTitle,
      link: itemLink,
      description: itemDescription,
      image: previewImage,
    };
    setItems([...items, newItem]);
    setItemTitle("");
    setItemLink("");
    setItemDescription("");
    setPreviewImage(null);
    setStep("items");
    Alert.alert("Sucesso", "Item adicionado à lista.");
  };

  const handleRemoveItem = (indexToRemove) => {
    const updatedItems = items.filter((_, i) => i !== indexToRemove);
    setItems(updatedItems);
    Alert.alert("Informação", "Item removido da lista.");
  };

  const handleEditItem = (index) => {
    const item = items[index];
    setItemTitle(item.title);
    setItemLink(item.link);
    setItemDescription(item.description || "");
    setPreviewImage(item.image);
    setEditingIndex(index);
    setStep("configItem");
  };

  const handleSaveEditedItem = () => {
    if (!itemTitle.trim()) {
      Alert.alert("Aviso", "O título do item não pode ser vazio.");
      return;
    }
    const updated = [...items];
    updated[editingIndex] = {
      title: itemTitle,
      link: itemLink,
      description: itemDescription,
      image: previewImage,
    };
    setItems(updated);
    setItemTitle("");
    setItemLink("");
    setItemDescription("");
    setPreviewImage(null);
    setEditingIndex(null);
    setStep("items");
    Alert.alert("Sucesso", "Item atualizado com sucesso!");
  };

  const handleSaveListToBackend = async () => {
    if (!listTitle.trim()) {
      Alert.alert("Aviso", "O título da lista não pode ser vazio.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Aviso", "Adicione pelo menos um item à lista.");
      return;
    }

    setIsSaving(true);

    const newListData = {
      title: listTitle,
      description: listDescription,
      items: items,
    };

    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert("Erro", "Você precisa estar logado para salvar a lista.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/tasklists`,
        newListData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Lista salva com sucesso no Backend:", response.data);
      Alert.alert("Sucesso", "Lista de tarefas criada com sucesso!");

      if (onSaveListSuccess) {
        onSaveListSuccess(response.data.taskList);
      }
      onCancel();

    } catch (error) {
      console.error("Erro ao salvar lista no Backend:", error.response ? error.response.data : error.message);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Erro ao salvar a lista. Tente novamente.';
      Alert.alert("Erro", `Erro: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bfff" />
        <Text style={styles.loadingText}>Carregando formulário...</Text>
      </View>
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.listBox, { maxHeight: height ? height * 0.9 : '90%' }]}>
          {step === "form" && (
            <>
              <TextInput
                style={styles.listTitleInput}
                placeholder="Título da Lista"
                placeholderTextColor="#aaa"
                value={listTitle}
                onChangeText={setListTitle}
              />
              <View style={styles.descriptionWrapper}>
                <TextInput
                  style={styles.listDescriptionInput}
                  placeholder="Descrição da Lista..."
                  placeholderTextColor="#aaa"
                  value={listDescription}
                  onChangeText={setListDescription}
                  maxLength={maxChars}
                  multiline={true}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, remainingChars <= 10 ? styles.dangerText : remainingChars <= 50 ? styles.warningText : null]}>
                  {remainingChars} restantes
                </Text>
              </View>
              <View style={styles.listButtons}>
                <TouchableOpacity style={styles.taskActionButton} onPress={() => setStep("items")}>
                  <Text style={styles.taskActionButtonText}>Criar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.taskActionButton, styles.cancelButton]} onPress={onCancel}>
                  <Text style={styles.taskActionButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === "items" && (
            <>
              <View style={styles.tasklistHeader}>
                <Text style={styles.listtitleStepAdditem}>{listTitle}</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setStep("form")}>
                  <Feather name="arrow-left-circle" size={24} color="#00bfff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={[styles.itemsScrollView, { maxHeight: height ? height * 0.4 : 200 }]}>
                {items.length === 0 ? (
                  <Text style={styles.noItemsText}>Nenhum item adicionado ainda.</Text>
                ) : (
                  items.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.reviewItemBox} onPress={() => handleEditItem(index)}>
                      <Text style={styles.reviewItemTitle}>{item.title}</Text>
                      <TouchableOpacity style={styles.reviewTrashIcon} onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(index);
                      }}>
                        <Feather name="trash-2" size={18} color="#ff4d4d" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
              <View style={styles.listButtons}>
                <TouchableOpacity
                  style={[styles.taskActionButton, items.length === 0 ? styles.fullWidthButton : null]}
                  onPress={() => setStep("addItem")}
                >
                  <Text style={styles.taskActionButtonText}>+ Novo Item</Text>
                </TouchableOpacity>
                {items.length > 0 && (
                  <TouchableOpacity
                    style={styles.taskActionButton}
                    onPress={handleSaveListToBackend}
                    disabled={isSaving}
                  >
                    <Text style={styles.taskActionButtonText}>{isSaving ? "Salvando..." : "Salvar"}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {step === "addItem" && (
            <>
              <View style={styles.tasklistHeader}>
                <Text style={styles.headerTitle}>Novo Item</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setStep("items")}>
                  <Feather name="arrow-left-circle" size={24} color="#00bfff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.listTitleInput}
                placeholder="Título do Item..."
                placeholderTextColor="#aaa"
                value={itemTitle}
                onChangeText={setItemTitle}
              />
              <TextInput
                style={styles.listTitleInput}
                placeholder="Link..."
                placeholderTextColor="#aaa"
                value={itemLink}
                onChangeText={setItemLink}
              />

              <View style={styles.descriptionWrapper}>
                <TextInput
                  style={styles.listDescriptionInput}
                  placeholder="Descrição do item..."
                  placeholderTextColor="#aaa"
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  maxLength={maxChars}
                  multiline={true}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, itemRemainingChars <= 10 ? styles.dangerText : itemRemainingChars <= 50 ? styles.warningText : null]}>
                  {itemRemainingChars} restantes
                </Text>
              </View>

              <TouchableOpacity style={[styles.uploadPreview, loading ? styles.loadingUpload : null]} onPress={handleImageUpload}>
                {loading ? (
                  <ActivityIndicator size="small" color="#00bfff" />
                ) : previewImage ? (
                  <>
                    <Image source={{ uri: previewImage }} style={styles.uploadPreviewImage} />
                    <TouchableOpacity style={styles.removeButton} onPress={(e) => { e.stopPropagation(); handleRemoveImage(); }}>
                      <Feather name="trash-2" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.uploadIconLarge}>+</Text>
                    <Text style={styles.uploadHint}>Faça o upload do seu arquivo JPG, PNG ou GIF</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.listButtons}>
                <TouchableOpacity style={styles.taskActionButton} onPress={() => setStep("items")}>
                  <Text style={styles.taskActionButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.taskActionButton} onPress={handleAddItemToList}>
                  <Text style={styles.taskActionButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === "configItem" && (
            <>
              <View style={styles.tasklistHeader}>
                <Text style={styles.headerTitle}>Editar Item</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setStep("items")}>
                  <Feather name="arrow-left-circle" size={24} color="#00bfff" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.listTitleInput}
                placeholder="Título do Item..."
                placeholderTextColor="#aaa"
                value={itemTitle}
                onChangeText={setItemTitle}
              />
              <TextInput
                style={styles.listTitleInput}
                placeholder="Link..."
                placeholderTextColor="#aaa"
                value={itemLink}
                onChangeText={setItemLink}
              />

              <View style={styles.descriptionWrapper}>
                <TextInput
                  style={styles.listDescriptionInput}
                  placeholder="Descrição do item..."
                  placeholderTextColor="#aaa"
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  maxLength={maxChars}
                  multiline={true}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, itemRemainingChars <= 10 ? styles.dangerText : itemRemainingChars <= 50 ? styles.warningText : null]}>
                  {itemRemainingChars} restantes
                </Text>
              </View>

              <TouchableOpacity style={[styles.uploadPreview, loading ? styles.loadingUpload : null]} onPress={handleImageUpload}>
                {loading ? (
                  <ActivityIndicator size="small" color="#00bfff" />
                ) : previewImage ? (
                  <>
                    <Image source={{ uri: previewImage }} style={styles.uploadPreviewImage} />
                    <TouchableOpacity style={styles.removeButton} onPress={(e) => { e.stopPropagation(); handleRemoveImage(); }}>
                      <Feather name="trash-2" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.uploadIconLarge}>+</Text>
                    <Text style={styles.uploadHint}>Faça o upload do seu arquivo JPG, PNG ou GIF</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.listButtons}>
                <TouchableOpacity style={styles.taskActionButton} onPress={() => setStep("items")}>
                  <Text style={styles.taskActionButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.taskActionButton} onPress={handleSaveEditedItem}>
                  <Text style={styles.taskActionButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  listBox: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 450,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  listTitleInput: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  descriptionWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  listDescriptionInput: {
    width: '100%',
    height: 80,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    paddingBottom: 25,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Montserrat_400Regular',
  },
  dangerText: {
    color: 'red',
  },
  warningText: {
    color: 'orange',
  },
  listButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  taskActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#00bfff',
    borderWidth: 1,
    borderColor: '#00bfff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskActionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#aaa',
  },
  fullWidthButton: {
    width: '100%',
  },
  tasklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listtitleStepAdditem: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
  },
  iconBtn: {
    padding: 5,
  },
  itemsScrollView: {
    marginBottom: 10,
    paddingRight: 5,
  },
  noItemsText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  reviewItemBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewItemTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  reviewTrashIcon: {
    padding: 5,
    marginLeft: 10,
  },
  uploadPreview: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  loadingUpload: {
    opacity: 0.7,
  },
  uploadPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
  uploadIconLarge: {
    fontSize: 48,
    color: '#aaa',
    fontWeight: 'bold',
  },
  uploadHint: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
});

export default TaskListBox;
