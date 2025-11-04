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
} from 'react-native';
import { useUser } from '../context/userContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function HotelDetailScreen({ route, navigation }) {
  const { hotel } = route.params;
  const { user, addReview } = useUser();
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, [hotel.id]);

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
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet.</Text>
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
});
