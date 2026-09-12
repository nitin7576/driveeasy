import { useState } from 'react';

export default function PaymentForm({ amount, onPay, processing }) {
  const [method, setMethod] = useState('credit');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmParking, setConfirmParking] = useState(false);

  const methods = [
    { id: 'credit', label: 'Credit Card', icon: 'bi-credit-card-2-front-fill' },
    { id: 'debit', label: 'Debit Card', icon: 'bi-credit-card-fill' },
    { id: 'upi', label: 'UPI', icon: 'bi-phone-fill' },
    { id: 'cash', label: 'Cash on Pickup', icon: 'bi-cash-coin' },
  ];

  const validate = () => {
    const errs = {};
    if (method === 'upi' && !upi.trim()) errs.upi = 'Enter UPI ID';
    if (method === 'cash' && !confirmParking) errs.parking = 'Accept pickup instructions';
    if (method === 'credit' || method === 'debit') {
      if (!card.number.trim() || card.number.replace(/\s/g, '').length < 12) errs.cardNumber = 'Enter a valid card number';
      if (!card.name.trim()) errs.cardName = 'Name on card required';
      if (!card.expiry.trim()) errs.expiry = 'Expiry required';
      if (!card.cvv.trim() || card.cvv.length < 3) errs.cvv = 'CVV required';
    }
    return errs;
  };

  const handlePay = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onPay(method);
  };

  return (
    <div>
      <div className="d-flex flex-column gap-2 mb-3">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`btn d-flex align-items-center gap-3 text-start ${method === m.id ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setMethod(m.id)}
          >
            <i className={`bi ${m.icon} fs-5`} />
            <span className="fw-semibold flex-grow-1">{m.label}</span>
            <i className={`bi ${method === m.id ? 'bi-check-circle-fill' : 'bi-circle'}`} />
          </button>
        ))}
      </div>

      {(method === 'credit' || method === 'debit') && (
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-semibold">Card Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
            />
            {errors.cardNumber && <small className="text-danger">{errors.cardNumber}</small>}
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Name on Card</label>
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
            />
            {errors.cardName && <small className="text-danger">{errors.cardName}</small>}
          </div>
          <div className="col-6">
            <label className="form-label fw-semibold">Expiry</label>
            <input type="month" className="form-control" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
            {errors.expiry && <small className="text-danger">{errors.expiry}</small>}
          </div>
          <div className="col-6">
            <label className="form-label fw-semibold">CVV</label>
            <input type="password" className="form-control" placeholder="123" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
            {errors.cvv && <small className="text-danger">{errors.cvv}</small>}
          </div>
        </div>
      )}

      {method === 'upi' && (
        <div>
          <label className="form-label fw-semibold">UPI ID</label>
          <input type="text" className="form-control" placeholder="name@bank" value={upi} onChange={(e) => setUpi(e.target.value)} />
          {errors.upi && <small className="text-danger">{errors.upi}</small>}
        </div>
      )}

      {method === 'cash' && (
        <div className="alert alert-warning small mb-0">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={confirmParking}
              onChange={(e) => setConfirmParking(e.target.checked)}
              id="parkingConfirm"
            />
            <label className="form-check-label" htmlFor="parkingConfirm">
              I will carry a valid driving license and ID proof at pickup.
            </label>
          </div>
          {errors.parking && <small className="text-danger d-block mt-1">{errors.parking}</small>}
        </div>
      )}

      <hr />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-semibold">Amount to pay</span>
        <span className="fs-4 fw-bold text-primary">₹{Number(amount).toLocaleString('en-IN')}</span>
      </div>

      <button className="btn btn-de w-100 py-2" onClick={handlePay} disabled={processing}>
        {processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" /> Processing…
          </>
        ) : (
          <>
            <i className="bi bi-shield-lock-fill me-2" /> Pay Now (Demo)
          </>
        )}
      </button>
      <p className="text-muted small text-center mt-2 mb-0">
        <i className="bi bi-info-circle me-1" /> This is a demo payment. No real money is transferred.
      </p>
    </div>
  );
}