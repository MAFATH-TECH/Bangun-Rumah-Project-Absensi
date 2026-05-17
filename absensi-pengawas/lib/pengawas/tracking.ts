import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { insertLokasiTracking } from './api';

export const PENGAWAS_LOCATION_TASK = 'pengawas-location-tracking';

let foregroundInterval: ReturnType<typeof setInterval> | null = null;
let activePengawasId: string | null = null;

async function sendCurrentLocation(pengawasId: string) {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await insertLokasiTracking(
      pengawasId,
      position.coords.latitude,
      position.coords.longitude,
      position.coords.accuracy,
    );
  } catch {
    // abaikan error lokasi sementara
  }
}

if (!TaskManager.isTaskDefined(PENGAWAS_LOCATION_TASK)) {
  TaskManager.defineTask(PENGAWAS_LOCATION_TASK, async ({ data, error }) => {
    if (error || !activePengawasId) return;
    const locations = (data as { locations?: Location.LocationObject[] })?.locations;
    const latest = locations?.[locations.length - 1];
    if (!latest) return;
    await insertLokasiTracking(
      activePengawasId,
      latest.coords.latitude,
      latest.coords.longitude,
      latest.coords.accuracy,
    );
  });
}

export async function startPengawasTracking(pengawasId: string) {
  activePengawasId = pengawasId;
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  await sendCurrentLocation(pengawasId);

  if (foregroundInterval) {
    clearInterval(foregroundInterval);
  }
  foregroundInterval = setInterval(() => {
    if (activePengawasId) {
      void sendCurrentLocation(activePengawasId);
    }
  }, 5 * 60 * 1000);

  const hasBg = await Location.requestBackgroundPermissionsAsync();
  if (hasBg.status === 'granted') {
    const started = await Location.hasStartedLocationUpdatesAsync(PENGAWAS_LOCATION_TASK);
    if (!started) {
      await Location.startLocationUpdatesAsync(PENGAWAS_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Pelacakan lokasi pengawas',
          notificationBody: 'Lokasi dikirim setiap 5 menit',
        },
      });
    }
  }
}

export async function stopPengawasTracking() {
  activePengawasId = null;
  if (foregroundInterval) {
    clearInterval(foregroundInterval);
    foregroundInterval = null;
  }
  const started = await Location.hasStartedLocationUpdatesAsync(PENGAWAS_LOCATION_TASK);
  if (started) {
    await Location.stopLocationUpdatesAsync(PENGAWAS_LOCATION_TASK);
  }
}
