import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Para navegação
import Icon from 'react-native-vector-icons/Feather'; // Ícone de sino

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      notifierName: 'Usuário 1',
      commentId: null,
      message: 'Curtiu sua publicação',
      notificationPost: 123, // Exemplo de postId
    },
    {
      id: 2,
      notifierName: 'Usuário 2',
      commentId: 456,
      message: 'Comentou sua publicação',
      notificationPost: 123, // Exemplo de postId
    },
    {
      id: 3,
      notifierName: 'Usuário 3',
      commentId: null,
      message: 'Curtiu sua publicação',
      notificationPost: 456, // Exemplo de postId
    },
  ]);
  const [showPopup, setShowPopup] = useState(null);
  const navigation = useNavigation();

  // Função simulada para deletar notificação
  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Ícone de Sino */}
        <TouchableOpacity onPress={() => console.log('Abrir notificações')}>
          <Icon name="bell" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Título "Notificações" */}
        <Text style={styles.headerText}>Notificações</Text>
      </View>

      {/* Lista de Notificações */}
      <ScrollView style={styles.notificationsList}>
        {notifications.length > 0 ? (
          notifications
            .slice()
            .reverse()
            .map((notification, index) => (
              <View key={notification.id} style={styles.notificationItem}>
                {/* Conteúdo da Notificação */}
                <View style={styles.notificationContent}>
                  {/* Avatar */}
                  <View style={styles.avatar} />
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationText}>
                      {notification.commentId
                        ? `${notification.notifierName} comentou sua publicação`
                        : `${notification.notifierName} curtiu sua publicação`}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message ||
                        'Uma nova interação foi realizada'}
                    </Text>
                  </View>
                </View>

                {/* Botão de Opções (Três Pontinhos) */}
                <TouchableOpacity
                  style={styles.optionsButton}
                  onPress={() => setShowPopup(showPopup === index ? null : index)}
                >
                  <Text style={styles.optionsText}>...</Text>
                </TouchableOpacity>

                {/* Popup de Opções */}
                {showPopup === index && (
                  <View style={styles.popup}>
                    <TouchableOpacity
                      style={styles.popupItem}
                      onPress={() => handleDeleteNotification(notification.id)}
                    >
                      <Text style={styles.popupText}>Marcar como lido</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Linha de Separação */}
                {index < notifications.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))
        ) : (
          <Text style={styles.noNotificationsText}>
            Nenhuma notificação encontrada.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#000', // Fundo preto
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center', // Alinha os itens verticalmente
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Texto branco
    marginLeft: 16, // Espaço entre o ícone e o texto
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    position: 'relative', // Para posicionar o popup corretamente
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  optionsButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  optionsText: {
    fontSize: 24,
    color: '#666',
  },
  popup: {
    position: 'absolute',
    right: 16,
    top: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 8,
  },
  popupItem: {
    padding: 8,
  },
  popupText: {
    fontSize: 14,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 16,
  },
  noNotificationsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
});

export default Notifications;