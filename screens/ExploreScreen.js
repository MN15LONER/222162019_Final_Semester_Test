import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useUser } from '../context/userContext';

export default function ExploreScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price'); // 'price' or 'rating'
  const { user, logout } = useUser();

  const fetchHotels = async (city = 'mumbai') => {
    try {
      setLoading(true);

      // Get today's date and tomorrow's date for check-in/out
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const checkinDate = today.toISOString().split('T')[0];
      const checkoutDate = tomorrow.toISOString().split('T')[0];

      // Use RapidAPI for hotel search
      const response = await axios.get('https://booking-com18.p.rapidapi.com/stays/search', {
        params: {
          dest_id: '-2092174', // Mumbai dest_id
          search_type: 'CITY',
          arrival_date: checkinDate,
          departure_date: checkoutDate,
          adults: '1',
          room_qty: '1',
          page_number: '1',
          units: 'metric',
          temperature_unit: 'c',
          languagecode: 'en-us',
          currency_code: 'INR'
        },
        headers: {
          'X-RapidAPI-Key': 'ae245928dcmshe21e654ab68e750p1233c5jsn2eff680f21d8',
          'X-RapidAPI-Host': 'booking-com18.p.rapidapi.com'
        }
      });

      if (response.data.status && response.data.data?.hotels) {
        const hotelData = response.data.data.hotels.slice(0, 10).map((hotel, index) => ({
          id: hotel.id.toString(),
          name: hotel.name,
          location: hotel.wishlistName || city,
          price: hotel.priceBreakdown?.grossPrice?.value || 5000,
          rating: hotel.property?.reviewScore || Math.floor(Math.random() * 5) + 1,
          image: hotel.photoUrls?.[0] || `https://picsum.photos/300/200?random=${index}`,
          reviewCount: hotel.property?.reviewCount || 0,
          reviewScoreWord: hotel.property?.reviewScoreWord || '',
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          checkin: hotel.checkin,
          checkout: hotel.checkout
        }));
        setHotels(hotelData);
        setError(null);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.warn('API Error:', err);
      setError('Failed to load hotels');
      Alert.alert('Error', 'Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return b.rating - a.rating;
  });

  const renderHotelCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('HotelDetail', { hotel: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={i < item.rating ? styles.starFilled : styles.starEmpty}>
              ★
            </Text>
          ))}
        </View>
        <Text style={styles.price}>${item.price}/night</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading hotels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchHotels()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Hotels</Text>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.activeSort]}
            onPress={() => setSortBy('price')}
          >
            <Text style={styles.sortText}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'rating' && styles.activeSort]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={styles.sortText}>Rating</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={sortedHotels}
        renderItem={renderHotelCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red', marginBottom: 20 },
  retryButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5 },
  retryText: { color: 'white', fontWeight: 'bold' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  sortContainer: { flexDirection: 'row' },
  sortButton: { padding: 8, marginRight: 10, borderRadius: 5, backgroundColor: '#f0f0f0' },
  activeSort: { backgroundColor: '#007AFF' },
  sortText: { color: '#333' },
  list: { padding: 10 },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: '100%', height: 150, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  cardContent: { padding: 15 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  location: { fontSize: 14, color: '#666', marginBottom: 5 },
  ratingContainer: { flexDirection: 'row', marginBottom: 5 },
  starFilled: { color: '#FFD700', fontSize: 16 },
  starEmpty: { color: '#ddd', fontSize: 16 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
});
