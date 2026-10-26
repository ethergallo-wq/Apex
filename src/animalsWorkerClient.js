export function loadAnimalsGridInWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./animalsGrid.worker.js', import.meta.url));
    const timer = window.setTimeout(() => {
      try { worker.terminate(); } catch {}
      reject(new Error('Timeout caricamento dataset Worker'));
    }, 20000);
    worker.onmessage = event => {
      window.clearTimeout(timer);
      try { worker.terminate(); } catch {}
      const animals = event?.data?.animals;
      if (!Array.isArray(animals)) {
        reject(new Error('Dataset Worker non valido'));
        return;
      }
      resolve(animals);
    };
    worker.onerror = event => {
      window.clearTimeout(timer);
      try { worker.terminate(); } catch {}
      reject(new Error(event?.message || 'Worker dataset non riuscito'));
    };
  });
}
