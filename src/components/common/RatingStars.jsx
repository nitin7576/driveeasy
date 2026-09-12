export default function RatingStars({ value = 0, size = '' }) {
  const rounded = Math.round(value);
  return (
    <span className="stars d-inline-flex align-items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={`bi ${i <= rounded ? 'bi-star-fill' : 'bi-star empty'} ${size}`} />
      ))}
    </span>
  );
}