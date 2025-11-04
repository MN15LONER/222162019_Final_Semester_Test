import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { useUser } from '../context/userContext';

export default function ExploreScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price'); // 'price' or 'rating'
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useUser();
  const timeoutRef = useRef(null);

  // Define check-in and check-out dates at component level (future dates for API compatibility)
  const futureCheckin = new Date();
  futureCheckin.setDate(futureCheckin.getDate() + 30); // 30 days from now
  const futureCheckout = new Date(futureCheckin);
  futureCheckout.setDate(futureCheckin.getDate() + 1); // Next day
  const checkinDate = futureCheckin.toISOString().split('T')[0];
  const checkoutDate = futureCheckout.toISOString().split('T')[0];

  // fetchDestinations removed as SerpApi doesn't have separate destination API

  const fetchHotels = async (query = 'Cape Town') => {
    try {
      setLoading(true);

      // Use SerpApi for hotel search
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_hotels',
          q: query,
          check_in_date: checkinDate,
          check_out_date: checkoutDate,
          currency: 'ZAR',
          api_key: '07e304de5fc10e010f15c7e4b9723542221b8c485c0e792f70b3fa0cc42f3d67'
        }
      });

      console.log('API Response:', response.data); // Debug log
      if (response.data.properties && Array.isArray(response.data.properties)) {
        const hotelData = response.data.properties.slice(0, 10).map((property, index) => ({
          id: property.property_token || property.id || index.toString(),
          name: property.name || 'Hotel ' + index,
          location: property.location || query,
          price: property.rate_per_night?.lowest || property.price || 5000,
          rating: property.overall_rating || Math.floor(Math.random() * 5) + 1,
          image: property.images?.[0]?.original_image || `https://picsum.photos/300/200?random=${index}`,
          reviewCount: property.reviews || 0,
          reviewScoreWord: property.overall_rating ? `${property.overall_rating}/5` : '',
          latitude: property.gps_coordinates?.latitude,
          longitude: property.gps_coordinates?.longitude,
          checkin: property.check_in_time,
          checkout: property.check_out_time,
          property_token: property.property_token
        }));
        console.log('Processed hotels:', hotelData.length);
        setHotels(hotelData);
        setError(null);
      } else {
        console.log('Response structure:', response.data);
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

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        fetchHotels(text);
      }
    }, 500); // 500ms delay
  };



  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return b.rating - a.rating;
  });

  const renderHotelCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('HotelDetail', { hotel: item, arrival_date: checkinDate, departure_date: checkoutDate })}
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
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations..."
          value={searchQuery}
          onChangeText={handleSearchChange}
        />

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
  searchInput: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },

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
