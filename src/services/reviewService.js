import { KEYS, getLS, setLS } from '../utils/storage';
import { REVIEW_DATA } from '../data/mockData';
import { uid } from '../utils/helpers';

export function seedReviews() {
  if (!getLS(KEYS.REVIEWS).length) setLS(KEYS.REVIEWS, REVIEW_DATA);
  return getLS(KEYS.REVIEWS);
}

export function getReviews() {
  const r = getLS(KEYS.REVIEWS);
  if (!r.length) return seedReviews();
  return r;
}

export function getApprovedReviews() {
  return getReviews().filter((r) => r.status === 'approved');
}

export function getReviewsByCar(carId) {
  return getReviews().filter((r) => r.carId === carId && r.status === 'approved');
}

export function getReviewsByUser(userId) {
  return getReviews().filter((r) => r.userId === userId);
}

export function addReview({ carId, userId, userName, rating, comment }) {
  const reviews = getReviews();
  const review = {
    id: uid('RV'),
    carId,
    userId,
    userName,
    rating,
    comment,
    status: 'approved',
    date: new Date().toISOString().split('T')[0],
  };
  reviews.unshift(review);
  setLS(KEYS.REVIEWS, reviews);
  return review;
}

export function setReviewStatus(id, status) {
  const reviews = getReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  reviews[idx].status = status;
  setLS(KEYS.REVIEWS, reviews);
  return reviews[idx];
}

export function deleteReview(id) {
  setLS(KEYS.REVIEWS, getReviews().filter((r) => r.id !== id));
}