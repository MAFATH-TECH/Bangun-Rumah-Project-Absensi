import supabase from '@/lib/supabase';

export async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

export async function uploadToStorage(
  bucket: 'foto-progress' | 'foto-selfie-absensi',
  path: string,
  uri: string,
  contentType = 'image/jpeg',
): Promise<{ path: string; publicUrl: string } | { error: string }> {
  try {
    const buffer = await uriToArrayBuffer(uri);
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      return { error: error.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Gagal upload foto' };
  }
}
