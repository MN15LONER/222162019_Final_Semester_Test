import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useUser } from '../context/userContext';

export default function BookingScreen({ route, navigation }) {
  const { hotel, arrival_date, departure_date } = route.params;
  const { addBooking } = useUser();
  const [checkInDate, setCheckInDate] = useState(arrival_date && arrival_date !== '' ? new Date(arrival_date) : new Date());
  const [checkOutDate, setCheckOutDate] = useState(departure_date && departure_date !== '' ? new Date(departure_date) : new Date(Date.now() + 86400000)); // Tomorrow
  const [rooms, setRooms] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const nights = checkInDate && checkOutDate ? Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) : 1;
  const pricePerNight = parseFloat(hotel.price.toString().replace(/[^\d.]/g, '')) || 0;
  const totalPrice = pricePerNight * rooms * Math.max(nights, 1);

  const handleConfirmBooking = async () => {
    if (nights <= 0) {
      Alert.alert('Error', 'Check-out date must be after check-in date.');
      return;
    }
    const booking = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      rooms,
      totalPrice,
      status: 'confirmed',
    };
    await addBooking(booking);
    Alert.alert('Success', 'Booking confirmed!', [
      { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Profile' }) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book {hotel.name}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check-in Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCheckInPicker(true)}
        >
          <Text style={styles.dateText}>{checkInDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check-out Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCheckOutPicker(true)}
        >
          <Text style={styles.dateText}>{checkOutDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Rooms</Text>
        <View style={styles.roomSelector}>
          <TouchableOpacity
            style={styles.roomButton}
            onPress={() => setRooms(Math.max(1, rooms - 1))}
          >
            <Text style={styles.roomButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.roomCount}>{rooms}</Text>
          <TouchableOpacity
            style={styles.roomButton}
            onPress={() => setRooms(rooms + 1)}
          >
            <Text style={styles.roomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <Text>Hotel: {hotel.name}</Text>
        <Text>Price per night: ${hotel.price}</Text>
        <Text>Nights: {Math.max(nights, 1)}</Text>
        <Text>Rooms: {rooms}</Text>
        <Text style={styles.priceBreakdown}>
          ${hotel.price} × {Math.max(nights, 1)} nights × {rooms} rooms
        </Text>
        <Text style={styles.totalPrice}>Total: ${totalPrice.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
        <Text style={styles.confirmText}>Confirm Booking</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showCheckInPicker}
        mode="date"
        date={checkInDate}
        onConfirm={(date) => {
          setCheckInDate(date);
          setShowCheckInPicker(false);
        }}
        onCancel={() => setShowCheckInPicker(false)}
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        isVisible={showCheckOutPicker}
        mode="date"
        date={checkOutDate}
        onConfirm={(date) => {
          setCheckOutDate(date);
          setShowCheckOutPicker(false);
        }}
        onCancel={() => setShowCheckOutPicker(false)}
        minimumDate={checkInDate || new Date()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dateButton: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8 },
  dateText: { fontSize: 16 },
  roomSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  roomButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, marginHorizontal: 20 },
  roomButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  roomCount: { fontSize: 18, fontWeight: 'bold' },
  summary: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  priceBreakdown: { fontSize: 14, color: '#666', marginTop: 5 },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginTop: 10 },
  confirmButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
