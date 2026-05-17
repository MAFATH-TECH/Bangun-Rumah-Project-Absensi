import supabase from '@/lib/supabase';

export async function getServerNow(): Promise<Date> {
  const { data, error } = await supabase.rpc('get_server_now');
  if (!error && data) {
    return new Date(data);
  }
  return new Date();
}

export async function validateSlotUploadServer(
  slot: number,
): Promise<{ valid: boolean; reason?: string }> {
  const { data, error } = await supabase.rpc('validate_slot_upload', {
    p_slot: slot,
  });

  if (error) {
    return { valid: true };
  }

  const payload = data as { valid?: boolean; reason?: string } | null;
  if (!payload) return { valid: true };
  return {
    valid: Boolean(payload.valid),
    reason: payload.reason,
  };
}
