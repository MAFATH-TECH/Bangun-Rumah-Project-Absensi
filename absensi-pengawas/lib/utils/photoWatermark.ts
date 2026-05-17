import * as ImageManipulator from 'expo-image-manipulator';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export type WatermarkMeta = {
  nama: string;
  tanggalJam: string;
  koordinat: string;
};

export function formatWatermarkKoordinat(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return 'GPS tidak tersedia';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export async function captureWatermarkedPhoto(
  viewRef: RefObject<View | null>,
): Promise<string | null> {
  if (!viewRef.current) return null;
  try {
    const uri = await captureRef(viewRef, {
      format: 'jpg',
      quality: 0.85,
      result: 'tmpfile',
    });
    const compressed = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return compressed.uri;
  } catch {
    return null;
  }
}
