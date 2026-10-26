export const SOCIAL_PROFILE_COLUMNS = 'user_id,username,nickname,avatar_url,featured_badge_id,profile_background_image';

export async function fetchSocialProfilesByIds(client, userIds, timeoutMs = 6000) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  if (!ids.length) return [];
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Caricamento profili social scaduto.'));
    }, timeoutMs);
  });
  try {
    const result = (async () => {
      const rows = [];
      for (let offset = 0; offset < ids.length; offset += 200) {
        if (controller.signal.aborted) throw new Error('Caricamento profili social scaduto.');
        const batch = ids.slice(offset, offset + 200);
        let query = client.rpc('get_social_profiles', { p_user_ids: batch });
        let response = await (query.abortSignal ? query.abortSignal(controller.signal) : query);
        // Rolling deploy compatibility only. An authorization error must not
        // fall back to a broader query, and we never request private columns.
        if (['PGRST202', '42883'].includes(response.error?.code)) {
          response = await client.from('user_profiles').select(SOCIAL_PROFILE_COLUMNS)
            .in('user_id', batch).abortSignal(controller.signal);
        }
        if (response.error) throw response.error;
        rows.push(...(response.data || []));
      }
      return rows;
    })();
    return await Promise.race([result, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
