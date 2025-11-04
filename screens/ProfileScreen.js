import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useUser } from '../context/userContext';

export default function ProfileScreen({ navigation }) {
  const { user, bookings, reviews, updateUserProfile, logout } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required.');
      return;
    }
    await updateUserProfile(user.uid, { displayName: name, email });
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.bookingTitle}>{item.hotelName}</Text>
      <Text>Check-in: {new Date(item.checkIn).toDateString()}</Text>
      <Text>Check-out: {new Date(item.checkOut).toDateString()}</Text>
      <Text>Rooms: {item.rooms}</Text>
      <Text style={styles.bookingPrice}>Total: ${item.totalPrice}</Text>
      <Text style={styles.bookingStatus}>Status: {item.status}</Text>
    </View>
  );

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewHotel}>Hotel ID: {item.hotelId}</Text>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Text key={i} style={i < item.rating ? styles.starFilled : styles.starEmpty}>
            ★
          </Text>
        ))}
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.infoLabel}>Name:</Text>
        <Text style={styles.infoValue}>{user?.displayName || 'Not set'}</Text>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{user?.email}</Text>
        <Text style={styles.infoLabel}>Currency:</Text>
        <Text style={styles.infoValue}>South African Rand (R)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        {bookings.length === 0 ? (
          <Text style={styles.noData}>No bookings yet.</Text>
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderBooking}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noData}>No reviews yet.</Text>
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  profileTitle: { fontSize: 24, fontWeight: 'bold' },
  editButton: { backgroundColor: '#007AFF', padding: 8, borderRadius: 5 },
  editText: { color: 'white', fontWeight: 'bold' },
  profileInfo: { marginBottom: 20 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  infoValue: { fontSize: 16, marginBottom: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  noData: { fontSize: 16, color: '#666', fontStyle: 'italic' },
  list: { maxHeight: 200 },
  bookingItem: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 10 },
  bookingTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  bookingPrice: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  bookingStatus: { fontSize: 14, color: '#666' },
  reviewItem: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 10 },
  reviewHotel: { fontWeight: 'bold', marginBottom: 5 },
  ratingContainer: { flexDirection: 'row', marginBottom: 5 },
  starFilled: { color: '#FFD700', fontSize: 16 },
  starEmpty: { color: '#ddd', fontSize: 16 },
  reviewText: { fontSize: 14 },
  logoutButton: { backgroundColor: '#dc3545', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelText: { color: 'white', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold' },
});
