// frontend-mobile/src/components/SettingsModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator, 
  Image, 
  Platform, 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; 

const { width, height } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.23:5000'; // Substitua

const SettingsModal = ({ isVisible, onClose, username, setUsername, setProfileImage, initialSection, setInitialSection }) => {
  const [activeSection, setActiveSection] = useState(initialSection || 'main');
  const [newUsername, setNewUsername] = useState(username || '');

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setActiveSection(initialSection || 'main');
      setNewUsername(username || ''); 
      setAvatarPreview(null);
    }
  }, [isVisible, initialSection, username]);

  const handleUsernameSave = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Erro', 'O nome de usuário não pode estar vazio.');
      return;
    }
    if (newUsername === username) {
      Alert.alert('Informação', 'O novo nome de usuário é o mesmo que o atual.');
      setActiveSection('main');
      if (setInitialSection) setInitialSection('main');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.put(
        `${API_BASE_URL}/api/profile/username`,
        { username: newUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        setUsername(newUsername);
        await AsyncStorage.setItem('username', newUsername);
        Alert.alert('Sucesso!', 'Nome de usuário atualizado com sucesso!');
        setActiveSection('main');
        if (setInitialSection) setInitialSection('main');
      }
    } catch (err) {
      console.error('Erro ao atualizar nome de usuário:', err.response ? err.response.data : err.message);
      Alert.alert('Erro', `Erro ao atualizar nome de usuário: ${err.response?.data?.message || err.response?.data?.error || err.message || 'Erro desconhecido.'}`);
    }
  };

  const pickImage = async () => {
    console.log('Tentando abrir o seletor de imagens...');
    console.log('ImagePicker object:', ImagePicker);
    console.log('ImagePicker.MediaType object:', ImagePicker.MediaType);

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Desculpe, precisamos de permissões de biblioteca de mídia para fazer isso!');
        return; 
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        // ✅ CORREÇÃO AQUI: Usar MediaTypeOptions conforme o log mostrou
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setAvatarPreview(result.assets[0].uri);
        console.log('Imagem selecionada:', result.assets[0].uri);
      } else {
        console.log('Seleção de imagem cancelada.');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro ao selecionar imagem', 'Não foi possível abrir a galeria. Verifique as permissões ou tente novamente.');
    }
  };

  const handleRemoveAvatarPreview = () => {
    setAvatarPreview(null);
  };

  const handleConfirmSendAvatar = async () => {
    if (!avatarPreview) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    const uri = avatarPreview;
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = uri.split('/').pop();

    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      name: fileName,
      type: `image/${fileType}`,
    });

    try {
      setAvatarLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const res = await axios.put(`${API_BASE_URL}/api/profile/uploads/avatars`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        const imagePath = res.data.avatar;
        if (imagePath) {
          setProfileImage(`${API_BASE_URL}${imagePath}`); 
          Alert.alert('Sucesso!', 'Avatar enviado com sucesso!');
          setAvatarPreview(null);
          setActiveSection('main');
          if (setInitialSection) setInitialSection('main');
        }
      }
    } catch (err) {
      console.error('Erro ao enviar avatar:', err.response ? err.response.data : err.message);
      Alert.alert('Erro', `Erro ao enviar avatar: ${err.response?.data?.error || err.response?.data?.message || err.message || 'Erro desconhecido.'}`);
    } finally {
      setAvatarLoading(false);
    }
  };

  const renderMainSettings = () => (
    <View style={styles.popupContent}>
      <Text style={styles.sectionTitle}>Configurações</Text>
      <View style={styles.settingsOptions}>
        <TouchableOpacity style={styles.optionButton} onPress={() => setActiveSection('username')}>
          <Feather name="user" size={20} color="#00bfff" />
          <Text style={styles.optionButtonText}>Alterar Nome de Usuário</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => setActiveSection('avatar')}>
          <Feather name="upload" size={20} color="#00bfff" />
          <Text style={styles.optionButtonText}>Enviar Foto de Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUsernameEdit = () => (
    <View style={styles.popupContent}>
      <Text style={styles.sectionTitle}>Alterar Nome de Usuário</Text>
      <TextInput
        style={styles.textInput}
        value={newUsername}
        onChangeText={setNewUsername}
        placeholder="Novo nome de usuário"
        placeholderTextColor="#aaa"
      />
      <View style={styles.popupButtons}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => setActiveSection('main')}>
          <Text style={styles.ctaButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaButton} onPress={handleUsernameSave}>
          <Text style={styles.ctaButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploadSection = () => (
    <View style={styles.popupContent}>
      <Text style={styles.sectionTitle}>Alterar Foto de Perfil</Text>

      <TouchableOpacity style={styles.uploadPreview} onPress={pickImage}>
        {avatarLoading ? (
          <ActivityIndicator size="large" color="#00bfff" />
        ) : avatarPreview ? (
          <>
            <Image source={{ uri: avatarPreview }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeButton} onPress={(e) => {
              e.stopPropagation(); 
              handleRemoveAvatarPreview();
            }}>
              <Feather name="trash-2" size={20} color="#ccc" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Feather name="plus" size={36} color="#777" style={styles.uploadIconLarge} />
            <Text style={styles.uploadHint}>Toque para selecionar sua imagem JPG, PNG ou GIF</Text>
          </>
        )}
      </TouchableOpacity>

      {avatarPreview && ( 
        <Text style={styles.uploadSuccess}>Clique em "Enviar" para confirmar.</Text>
      )}

      <View style={styles.popupButtons}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => setActiveSection('main')}>
          <Text style={styles.ctaButtonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaButton} onPress={handleConfirmSendAvatar} disabled={avatarLoading}>
          <Text style={styles.ctaButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade" 
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        onClose();
        if (setInitialSection) setInitialSection('main');
      }}
    >
      <View style={styles.popupOverlay}>
        <View style={styles.popup}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              onClose();
              if (setInitialSection) setInitialSection('main');
            }}
          >
            <Feather name="x" size={24} color="#aaa" />
          </TouchableOpacity>

          {activeSection === 'main'
            ? renderMainSettings()
            : activeSection === 'username'
            ? renderUsernameEdit()
            : renderUploadSection()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    width: width * 0.9, 
    maxWidth: 400, 
    padding: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5, 
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1, 
    padding: 5, 
  },
  popupContent: {
    // Estilos gerais para o conteúdo dentro do popup
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  settingsOptions: {
    flexDirection: 'column',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    backgroundColor: '#1e1e1e',
    marginBottom: 12, 
  },
  optionButtonText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 12, 
  },
  textInput: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    color: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16, 
    fontSize: 16,
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#00bfff', 
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5, 
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  uploadPreview: {
    borderWidth: 2,
    borderColor: '#646464ad',
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#1e1e1e',
    height: 200, 
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10, 
    resizeMode: 'cover',
  },
  uploadIconLarge: {
    color: '#777',
    marginBottom: 8,
  },
  uploadHint: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
  },
  uploadSuccess: {
    marginTop: 0,
    marginBottom: 16,
    color: '#ffffffb0',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
});

export default SettingsModal;