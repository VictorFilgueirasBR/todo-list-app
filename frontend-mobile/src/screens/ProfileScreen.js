// frontend-mobile/src/screens/ProfileScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import SettingsModal from '../components/SettingsModal';
import { Feather } from '@expo/vector-icons';

import headerGif from '../assets/header-img.png';

import TaskListBox from '../components/TaskListBox';
import SavedTaskList from '../components/SavedTaskList';
import TaskListReview from '../components/TaskListReview';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { height: windowHeight } = useWindowDimensions();

  const [loadingProfile, setLoadingProfile] = useState(true); // Estado de carregamento para o perfil
  const [profileError, setProfileError] = useState(''); // Erro para o perfil
  const [username, setUsername] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const [savedLists, setSavedLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true); // Estado de carregamento para as listas
  const [errorLists, setErrorLists] = useState(null); // Erro para as listas

  const [showListBox, setShowListBox] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  // Função para buscar o perfil do usuário
  const fetchProfileData = useCallback(async () => { // ✅ Envolvido em useCallback
    setLoadingProfile(true); // ✅ Usando setLoadingProfile
    setProfileError(''); // ✅ Usando setProfileError
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const res = await api.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.username) {
        setUsername(res.data.username);
        await AsyncStorage.setItem('username', res.data.username);

        if (res.data.profileImage) {
          const imageUrl = res.data.profileImage.startsWith('http')
            ? res.data.profileImage
            : `${api.defaults.baseURL}${res.data.profileImage}`;
          setProfileImage(imageUrl);
        } else {
          setProfileImage(null);
        }
      } else {
        setProfileError('Dados do perfil incompletos.');
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
      }
    } catch (err) {
      console.error('Erro ao buscar dados do perfil:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
      } else {
        setProfileError('Não foi possível carregar o perfil. Erro de conexão ou servidor.');
      }
    } finally {
      setLoadingProfile(false); // ✅ Usando setLoadingProfile
    }
  }, [navigation]); // ✅ Adicionado navigation como dependência

  // Função para carregar as listas do backend (MongoDB)
  const fetchTaskLists = useCallback(async () => {
    setLoadingLists(true);
    setErrorLists(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn("fetchTaskLists: Token de autenticação não encontrado. Redirecionando para Login.");
        navigation.replace('Login');
        return; 
      }

      console.log('fetchTaskLists: Tentando buscar listas de tarefas...');
      console.log(`fetchTaskLists: URL da API: ${api.defaults.baseURL}/api/tasklists`);
      console.log(`fetchTaskLists: Token de autorização: Bearer ${token.substring(0, 10)}...`);

      const response = await api.get('/api/tasklists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('fetchTaskLists: Resposta da API recebida!');
      console.log('fetchTaskLists: Dados recebidos:', JSON.stringify(response.data, null, 2));

      if (response.data && Array.isArray(response.data)) {
        setSavedLists(response.data);
        console.log(`fetchTaskLists: ${response.data.length} listas carregadas.`);
      } else {
        console.warn("fetchTaskLists: Resposta da API não é um array ou está vazia.", response.data);
        setErrorLists("Nenhuma lista encontrada ou formato de dados inesperado.");
      }
    } catch (error) {
      console.error("fetchTaskLists: Erro ao carregar listas de tarefas:", error.response ? error.response.data : error.message);
      if (error.response) {
        console.error("fetchTaskLists: Status do erro:", error.response.status);
        console.error("fetchTaskLists: Dados do erro:", error.response.data);
      } else if (error.request) {
        console.error("fetchTaskLists: Nenhuma resposta recebida:", error.request);
      } else {
        console.error("fetchTaskLists: Erro de configuração da requisição:", error.message);
      }
      setErrorLists("Falha ao carregar as listas de tarefas. Verifique sua conexão ou o servidor.");
    } finally {
      setLoadingLists(false);
      console.log("fetchTaskLists: Carregamento de listas finalizado.");
    }
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      fetchProfileData();
      fetchTaskLists();
    }
  }, [isFocused, fetchProfileData, fetchTaskLists]);

  const openSettings = () => {
    setIsSettingsModalVisible(true);
  };

  const closeSettings = () => {
    setIsSettingsModalVisible(false);
    fetchProfileData();
  };

  const handleTaskListSavedSuccess = (newList) => {
    setShowListBox(false);
    fetchTaskLists();
  };

  const handleUpdateList = useCallback(async (updatedListFromChild) => {
    setSavedLists(prevLists =>
      prevLists.map((l) => (l._id === updatedListFromChild._id ? updatedListFromChild : l))
    );
    setSelectedList(updatedListFromChild);
    fetchTaskLists();
  }, [fetchTaskLists]);

  const handleDeleteList = useCallback(async (listId) => {
    setSavedLists(prevLists => prevLists.filter((l) => l._id !== listId));
    setSelectedList(null);
    fetchTaskLists();
  }, [fetchTaskLists]);

  const sortedLists = React.useMemo(() => {
    const listsCopy = [...savedLists];
    return listsCopy.sort((a, b) => {
      const reminderA = a.reminder;
      const reminderB = b.reminder;

      const hasReminderA = reminderA && reminderA.date && reminderA.time;
      const hasReminderB = reminderB && reminderB.date && reminderB.time;

      let dateA, dateB;

      if (hasReminderA) {
        dateA = new Date(`${reminderA.date}T${reminderA.time}`);
      }
      if (hasReminderB) {
        dateB = new Date(`${reminderB.date}T${reminderB.time}`);
      }

      if (hasReminderA && hasReminderB) {
        return dateA.getTime() - dateB.getTime();
      }

      if (hasReminderA && !hasReminderB) {
        return -1;
      }
      if (!hasReminderA && hasReminderB) {
        return 1;
      }

      const createdAtA = new Date(a.createdAt);
      const createdAtB = new Date(b.createdAt);
      return createdAtB.getTime() - createdAtA.getTime();
    });
  }, [savedLists]);


  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.profileWrapper}>
          <View style={styles.profileBanner}>
            <Image source={headerGif} style={styles.bannerImage} resizeMode="cover" />
          </View>

          <TouchableOpacity
            style={styles.profilePicture}
            onPress={() => openSettings()}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePictureImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadPlaceholderText}>+</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.profileUsername}>{username}</Text>

          <TouchableOpacity
            style={styles.uploadIcon}
            onPress={() => openSettings()}
          >
            <Feather name="more-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.dividerSectionHome}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>TO DO LIST</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.savedListsSection}>
          {loadingLists ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00bfff" />
              <Text style={styles.loadingMessage}>Carregando listas...</Text>
            </View>
          ) : errorLists ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessageLists}>{errorLists}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTaskLists}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : savedLists.length === 0 ? (
            <Text style={styles.noListsText}>Adicione suas listas aqui.</Text>
          ) : (
            sortedLists.map((list) => (
              <SavedTaskList
                key={list._id}
                list={list}
                onOpen={() => setSelectedList(list)}
                onDelete={() => handleDeleteList(list._id)}
              />
            ))
          )}
        </View>

        <View style={styles.contentPlaceholder} />

      </ScrollView>

      <View style={styles.floatingButtonAndModalContainer}>
        {showListBox && (
          <TaskListBox
            onCancel={() => setShowListBox(false)}
            onSaveListSuccess={handleTaskListSavedSuccess}
          />
        )}
        <TouchableOpacity
          style={styles.floatingNewListButton}
          onPress={() => setShowListBox(!showListBox)}
        >
          <Text style={styles.floatingNewListButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <SettingsModal
        isVisible={isSettingsModalVisible}
        onClose={closeSettings}
        username={username}
        setUsername={setUsername}
        setProfileImage={setProfileImage}
        initialSection={null}
        setInitialSection={() => {}}
      />

      {selectedList && (
        <TaskListReview
          list={selectedList}
          onClose={() => setSelectedList(null)}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#1a1a1a',
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    minHeight: 150,
  },
  loadingText: {
    color: '#00bfff',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    minHeight: 150,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00bfff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  profileWrapper: {
    width: '100%',
    position: 'relative',
    paddingTop: 0,
    marginBottom: 0,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  profileBanner: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  uploadIcon: {
    position: 'absolute',
    top: 10,
    right: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  profilePicture: {
    position: 'absolute',
    top: 200 - (100 / 2),
    left: (width * 0.05) + 15,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#121212',
    overflow: 'hidden',
    zIndex: 10,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  uploadPlaceholderText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileUsername: {
    marginTop: 50,
    marginLeft: (width * 0.05) + 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f0f0',
    alignSelf: 'flex-start',
    paddingLeft: 0,
    fontFamily: 'Montserrat_600SemiBold',
  },
  dividerSectionHome: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 20,
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
  contentPlaceholder: {
    height: 300,
    width: '100%',
  },
  savedListsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  loadingMessage: {
    color: '#00bfff',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  errorMessageLists: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  noListsText: {
    color: '#d1d1d1',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  floatingButtonAndModalContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'flex-end',
    paddingRight: 30,
  },
  floatingNewListButton: {
    width: Math.min(width * 0.4, 250),
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  floatingNewListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default ProfileScreen;
