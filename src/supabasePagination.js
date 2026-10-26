// A stable, unique order must be applied by makeQuery. Continue until empty:
// a project may enforce a page limit lower than the requested pageSize.
export async function fetchAllRows(makeQuery, { pageSize = 500, timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const rows = [];
  try {
    while (true) {
      if (controller.signal.aborted) throw new Error('Caricamento progressi scaduto. Riprova.');
      const { data, error } = await makeQuery()
        .range(rows.length, rows.length + pageSize - 1)
        .abortSignal(controller.signal);
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Risposta progressi non valida.');
      if (!data.length) return rows;
      rows.push(...data);
    }
  } finally {
    clearTimeout(timer);
  }
}
