import { KEYS, getLS, setLS } from '../utils/storage';
import { MAINTENANCE_DATA } from '../data/mockData';
import { uid } from '../utils/helpers';

export function seedMaintenance() {
  if (!getLS(KEYS.MAINTENANCE).length) setLS(KEYS.MAINTENANCE, MAINTENANCE_DATA);
  return getLS(KEYS.MAINTENANCE);
}

export function getMaintenance() {
  const m = getLS(KEYS.MAINTENANCE);
  if (!m.length) return seedMaintenance();
  return m;
}

export function getMaintenanceByCar(carId) {
  return getMaintenance().filter((r) => r.carId === carId);
}

export function addMaintenance(data) {
  const records = getMaintenance();
  const record = {
    id: uid('MN'),
    ...data,
    status: data.status || (data.endDate ? 'completed' : 'in-progress'),
  };
  records.unshift(record);
  setLS(KEYS.MAINTENANCE, records);
  return record;
}

export function updateMaintenance(id, data) {
  const records = getMaintenance();
  const idx = records.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  records[idx] = { ...records[idx], ...data };
  setLS(KEYS.MAINTENANCE, records);
  return records[idx];
}

export function markMaintenanceCompleted(id) {
  const record = updateMaintenance(id, { status: 'completed', endDate: new Date().toISOString().split('T')[0] });
  return record;
}

export function deleteMaintenance(id) {
  setLS(KEYS.MAINTENANCE, getMaintenance().filter((r) => r.id !== id));
}

export function isCarInMaintenance(carId) {
  return getMaintenance().some(
    (r) => r.carId === carId && ['in-progress', 'scheduled'].includes(r.status)
  );
}