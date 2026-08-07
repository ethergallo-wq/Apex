let fullWorker = null;
let fullWorkerSequence = 0;
const pendingFullAnimals = new Map();

function rejectPendingFullAnimals(error) {
  pendingFullAnimals.forEach(({ reject, timer }) => {
    window.clearTimeout(timer);
    reject(error);
  });
  pendingFullAnimals.clear();
}

function getFullWorker() {
  if (fullWorker) return fullWorker;
  fullWorker = new Worker(new URL('./animalsFull.worker.js', import.meta.url));
  fullWorker.onmessage = event => {
    const requestId = event?.data?.requestId;
    const pending = pendingFullAnimals.get(requestId);
    if (!pending) return;
    window.clearTimeout(pending.timer);
    pendingFullAnimals.delete(requestId);
    pending.resolve(event?.data?.animal || null);
  };
  fullWorker.onerror = event => {
    rejectPendingFullAnimals(new Error(event?.message || 'Worker scheda completa non riuscito'));
    try { fullWorker.terminate(); } catch {}
    fullWorker = null;
  };
  return fullWorker;
}

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

export function loadFullAnimalInWorker(animalId) {
  return new Promise((resolve, reject) => {
    const worker = getFullWorker();
    const requestId = `animal-${++fullWorkerSequence}`;
    const timer = window.setTimeout(() => {
      pendingFullAnimals.delete(requestId);
      reject(new Error('Timeout scheda completa Worker'));
    }, 20000);
    pendingFullAnimals.set(requestId, { resolve, reject, timer });
    worker.postMessage({ requestId, animalId:String(animalId) });
  });
}
