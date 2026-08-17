import "client-only";

// Keep the original database name so the rebrand does not hide existing local drafts.
const DATABASE_NAME = "transcript-editor";
const DATABASE_VERSION = 1;
const DRAFT_KEY = "current";
const STORE_NAME = "drafts";

export type TranscriptDraft = {
  content: string;
  fileName: string;
  savedAt: string;
};

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
  });
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    transaction.addEventListener("error", () => reject(transaction.error), { once: true });
  });
}

async function openDraftDatabase() {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

  request.addEventListener("upgradeneeded", () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME);
    }
  });

  return requestResult(request);
}

export async function getTranscriptDraft() {
  const database = await openDraftDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    return await requestResult(
      transaction.objectStore(STORE_NAME).get(DRAFT_KEY) as IDBRequest<TranscriptDraft | undefined>,
    );
  } finally {
    database.close();
  }
}

export async function saveTranscriptDraft(draft: TranscriptDraft) {
  const database = await openDraftDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(draft, DRAFT_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}
