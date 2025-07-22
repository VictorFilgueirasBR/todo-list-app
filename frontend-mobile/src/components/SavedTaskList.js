// frontend-mobile/src/components/SavedTaskList.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import CustomizeListPopup from "./CustomizeListPopup";
import savedTaskListRawCode from "../utils/savedTaskListCode";

import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

const SavedTaskList = ({ list, onOpen, onDelete }) => {
  const [completed, setCompleted] = useState(false);
  const [urgencyClass, setUrgencyClass] = useState("");
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    // Verifica se list e reminder existem antes de tentar acessar suas propriedades
    const reminderDate = list?.reminder?.date;
    const reminderTime = list?.reminder?.time;

    if (!reminderDate || !reminderTime) {
      setUrgencyClass("");
      return;
    }

    const deadline = new Date(`${reminderDate}T${reminderTime}`);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours <= 6) {
      setUrgencyClass("urgent-red");
    } else if (diffHours <= 36) {
      setUrgencyClass("urgent-orange");
    } else if (diffDays <= 5) {
      setUrgencyClass("urgent-green");
    } else {
      setUrgencyClass("");
    }
  }, [list]); // Adiciona 'list' como dependência para reavaliar quando a lista muda

  const handleConfirmCompletion = () => {
    Alert.alert(
      "Confirmar Conclusão",
      "Deseja mesmo concluir essa lista?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Concluir",
          onPress: () => {
            setCompleted(true);
            if (typeof onDelete === "function") {
              onDelete(list._id);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenCodePopup = () => {
    setShowCustomizePopup(true);
  };

  // Se as fontes não carregaram ou a lista é nula/indefinida, mostre um indicador de carregamento
  if (!fontsLoaded || !list) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00bfff" />
        <Text style={styles.loadingText}>Carregando lista...</Text>
      </View>
    );
  }

  // Se a lista está carregada e as fontes também, renderize o conteúdo
  return (
    <>
      <TouchableOpacity
        style={[styles.savedTaskList, styles[urgencyClass]]}
        onPress={() => onOpen(list)}
      >
        <View style={styles.listActionsLeft}>
          <TouchableOpacity
            style={styles.checkIcon}
            onPress={handleConfirmCompletion}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {completed ? (
              <Feather name="check-circle" size={24} color="#00bfff" />
            ) : (
              <Feather name="circle" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.savedTaskTitle}>
          {list.title}
        </Text>

        <Text style={styles.savedTaskDescription}>
          {list.description && list.description.length > 60
            ? `${list.description.slice(0, 60)}...`
            : list.description}
        </Text>

        <ScrollView style={styles.savedItems}>
          {Array.isArray(list.items) && list.items.length > 0 ? (
            list.items.map((item, index) => (
              <TouchableOpacity
                key={item._id || index}
                style={styles.savedTaskItem}
                onPress={() => onOpen(list)}
              >
                {/* ✅ Garante que o item.title esteja dentro de <Text> */}
                <Text style={styles.savedTaskItemText}>{item.title}</Text>
                {item.completed && (
                  <Feather
                    name="check-circle"
                    size={18}
                    color="#00bfff"
                    style={{ marginLeft: 10 }}
                  />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noItemsText}>Nenhum item.</Text>
          )}
        </ScrollView>

        <View style={styles.listBottomActions}>
          <TouchableOpacity
            style={styles.actionCustomizeIcon}
            onPress={handleOpenCodePopup}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="code" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {showCustomizePopup && (
        <CustomizeListPopup
          onClose={() => setShowCustomizePopup(false)}
          code={savedTaskListRawCode}
        />
      )}
    </>
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
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  savedTaskList: {
    backgroundColor: '#222222',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 16,
    width: '95%',
    maxWidth: 400,
    maxHeight: 250,
    marginVertical: 16,
    marginHorizontal: 'auto',
    position: 'relative',
    flexDirection: 'column',
    gap: 16,
    shadowColor: 'rgba(49, 49, 49, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  'urgent-red': {
    borderWidth: 2,
    borderColor: '#ff0000',
    shadowColor: 'rgba(255, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  'urgent-orange': {
    borderWidth: 2,
    borderColor: '#ff8800',
  },
  'urgent-green': {
    borderWidth: 2,
    borderColor: '#00cc66',
  },
  savedTaskTitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.71)',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 5,
  },
  checkIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 24,
    color: '#fff',
    zIndex: 1,
  },
  actionCustomizeIcon: {
    fontSize: 24,
    color: '#fff',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  savedTaskDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  savedItems: {
    flexGrow: 0,
    maxHeight: 150,
  },
  savedTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 11,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  savedTaskItemText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
    flexShrink: 1,
  },
  noItemsText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  listBottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
});

export default SavedTaskList;
