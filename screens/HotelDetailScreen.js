import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useUser } from '../context/userContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function HotelDetailScreen({ route, navigation }) {
  const { hotel, arrival_date, departure_date } = route.params;
  const { user, addReview } = useUser();
  const [reviews, setReviews] = useState([]);
  const [serpapiReviews, setSerpapiReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [detailedHotel, setDetailedHotel] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchHotelDetails();
  }, [hotel.id, arrival_date, departure_date]);

  const fetchHotelDetails = async () => {
    try {
      setLoadingDetails(true);
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_hotels',
          q: 'Bali Resorts',
          property_token: hotel.property_token,
          check_in_date: arrival_date,
          check_out_date: departure_date,
          api_key: '07e304de5fc10e010f15c7e4b9723542221b8c485c0e792f70b3fa0cc42f3d67'
        }
      });
      console.log('Hotel Details API Response:', response.data);
      if (response.data) {
        setDetailedHotel(response.data);
        // Extract SerpApi reviews if available
        if (response.data.reviews && Array.isArray(response.data.reviews)) {
          const apiReviews = response.data.reviews.map((review, index) => ({
            id: `api-${index}`,
            userId: review.author || 'Anonymous',
            rating: review.rating || 5,
            text: review.snippet || review.text || 'No review text available.',
            date: review.date || 'N/A'
          }));
          setSerpapiReviews(apiReviews);
        }
        setDetailsError(null);
      } else {
        console.log('API Response structure:', response.data);
        // Handle API error gracefully - show error but don't crash
        setDetailsError('Hotel details not available. Please try again later.');
        return;
      }
    } catch (err) {
      console.warn('Hotel Details API Error:', err);
      setDetailsError('Failed to load hotel details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('hotelId', '==', hotel.id)
      );
      const querySnap = await getDocs(reviewsQuery);
      const reviewsData = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
    } catch (err) {
      console.warn('Failed to fetch reviews', err);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to book a hotel.');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Booking', { hotel });
  };

  const handleAddReview = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add a review.');
      navigation.navigate('Login');
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please enter a review text.');
      return;
    }
    await addReview(hotel.id, { text: reviewText, rating: reviewRating });
    setReviewText('');
    setReviewRating(5);
    setShowReviewModal(false);
    fetchReviews(); // Refresh reviews
    Alert.alert('Success', 'Review added!');
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUser}>{item.userId}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={i < item.rating ? styles.starFilled : styles.starEmpty}>
              ★
            </Text>
          ))}
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  const hasUserReviewed = reviews.some(review => review.userId === user?.uid);

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: hotel.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.location}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={i < hotel.rating ? styles.starFilled : styles.starEmpty}>
              ★
            </Text>
          ))}
        </View>
        <Text style={styles.price}>${hotel.price}/night</Text>

        {loadingDetails ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text>Loading hotel details...</Text>
          </View>
        ) : detailsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{detailsError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHotelDetails}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : detailedHotel ? (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Hotel Details</Text>
            <Text style={styles.detailText}>Address: {detailedHotel.address || detailedHotel.location || 'N/A'}</Text>
            <Text style={styles.detailText}>City: {detailedHotel.city || 'N/A'}</Text>
            <Text style={styles.detailText}>Country: {detailedHotel.country || detailedHotel.country_trans || 'N/A'}</Text>
            <Text style={styles.detailText}>Available Rooms: {detailedHotel.available_rooms || 'N/A'}</Text>
            <Text style={styles.detailText}>Review Count: {detailedHotel.reviews || detailedHotel.review_nr || 'N/A'}</Text>
            <Text style={styles.detailText}>Check-in Time: {detailedHotel.check_in_time || 'N/A'}</Text>
            <Text style={styles.detailText}>Check-out Time: {detailedHotel.check_out_time || 'N/A'}</Text>
            {(detailedHotel.amenities || detailedHotel.family_facilities) && (
              <View style={styles.facilitiesSection}>
                <Text style={styles.facilityTitle}>Facilities:</Text>
                {(detailedHotel.amenities || detailedHotel.family_facilities).map((facility, index) => (
                  <Text key={index} style={styles.facilityText}>• {facility}</Text>
                ))}
              </View>
            )}
            {(detailedHotel.price_breakdown || detailedHotel.product_price_breakdown) && (
              <View style={styles.priceBreakdownSection}>
                <Text style={styles.priceBreakdownTitle}>Price Breakdown:</Text>
                <Text style={styles.priceBreakdownText}>
                  Gross Amount: {(detailedHotel.price_breakdown || detailedHotel.product_price_breakdown).gross_amount?.value || 'N/A'} {(detailedHotel.price_breakdown || detailedHotel.product_price_breakdown).gross_amount?.currency || 'EUR'}
                </Text>
                <Text style={styles.priceBreakdownText}>
                  Net Amount: {(detailedHotel.price_breakdown || detailedHotel.product_price_breakdown).net_amount?.value || 'N/A'} {(detailedHotel.price_breakdown || detailedHotel.product_price_breakdown).net_amount?.currency || 'EUR'}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>User Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No user reviews yet.</Text>
          ) : (
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
          {!hasUserReviewed && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Text style={styles.addReviewText}>Add Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {serpapiReviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>SerpApi Reviews</Text>
            <FlatList
              data={serpapiReviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Review</Text>
            <View style={styles.ratingInput}>
              <Text>Rating: </Text>
              <View style={styles.starInput}>
                {[...Array(5)].map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setReviewRating(i + 1)}>
                    <Text style={i < reviewRating ? styles.starFilled : styles.starEmpty}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddReview}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  image: { width: '100%', height: 250 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  location: { fontSize: 16, color: '#666', marginBottom: 10 },
  ratingContainer: { flexDirection: 'row', marginBottom: 10 },
  starFilled: { color: '#FFD700', fontSize: 18 },
  starEmpty: { color: '#ddd', fontSize: 18 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 20 },
  bookButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
  bookButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  reviewsSection: { marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  noReviews: { fontSize: 16, color: '#666', fontStyle: 'italic' },
  reviewItem: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  reviewUser: { fontWeight: 'bold' },
  reviewText: { fontSize: 14 },
  addReviewButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  addReviewText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  ratingInput: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  starInput: { flexDirection: 'row' },
  reviewInput: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelText: { color: 'white', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  errorContainer: { alignItems: 'center', marginVertical: 20 },
  errorText: { color: 'red', fontSize: 16, marginBottom: 10 },
  retryButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5 },
  retryText: { color: 'white', fontWeight: 'bold' },
  detailsSection: { marginVertical: 20 },
  detailText: { fontSize: 16, marginBottom: 5 },
  facilitiesSection: { marginTop: 10 },
  facilityTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  facilityText: { fontSize: 14, marginBottom: 2 },
  priceBreakdownSection: { marginTop: 10 },
  priceBreakdownTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  priceBreakdownText: { fontSize: 14, marginBottom: 2 },
});
