const QUEUE_KEY = 'campushub_offline_attendance_queue';

export const getOfflineQueue = () => {
  const data = localStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveToOfflineQueue = (record) => {
  const queue = getOfflineQueue();
  queue.push({ ...record, queuedAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const syncOfflineAttendance = async (token) => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, success: true };

  try {
    const res = await fetch('http://localhost:5000/api/attendance/mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ records: queue })
    });

    if (res.ok) {
      clearOfflineQueue();
      return { synced: queue.length, success: true };
    }
  } catch (err) {
    console.warn('[Offline Engine] Cloud unreachable. Queue preserved.');
  }
  return { synced: 0, success: false };
};