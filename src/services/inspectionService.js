import { KEYS, getLS, setLS } from '../utils/storage';

export function saveInspection(record) {
  const records = getLS(KEYS.INSPECTIONS);
  const idx = records.findIndex((r) => r.bookingId === record.bookingId && r.type === record.type);
  const saved = {
    ...record,
    recordedAt: new Date().toISOString(),
  };
  if (idx >= 0) records[idx] = saved;
  else records.unshift(saved);
  setLS(KEYS.INSPECTIONS, records);
  return saved;
}

export function getInspections() {
  return getLS(KEYS.INSPECTIONS);
}

export function getInspection(bookingId, type) {
  return getInspections().find((r) => r.bookingId === bookingId && r.type === type) || null;
}