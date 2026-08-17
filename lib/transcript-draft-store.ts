import "client-only";

// Keep the original database name so the rebrand does not hide existing local drafts.
const DATABASE_NAME = "transcript-editor";
const DATABASE_VERSION = 1;
const DRAFT_KEY = "current";
const HISTORY_KEY = "history";
const HISTORY_LIMIT = 20;
const STORE_NAME = "drafts";

export type TranscriptDraft = {
  content: string;
  fileName: string;
  savedAt: string;
};

export type TranscriptRevision = TranscriptDraft & {
  id: string;
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

export async function getTranscriptHistory() {
  const database = await openDraftDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const history = await requestResult(
      transaction.objectStore(STORE_NAME).get(HISTORY_KEY) as IDBRequest<
        TranscriptRevision[] | undefined
      >,
    );

    return history ?? [];
  } finally {
    database.close();
  }
}

export async function saveTranscriptDraft(draft: TranscriptDraft) {
  const database = await openDraftDatabase();

  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const [currentDraft, storedHistory] = await Promise.all([
      requestResult(store.get(DRAFT_KEY) as IDBRequest<TranscriptDraft | undefined>),
      requestResult(store.get(HISTORY_KEY) as IDBRequest<TranscriptRevision[] | undefined>),
    ]);
    let history = (storedHistory ?? []).filter(
      (revision) => revision.content !== draft.content || revision.fileName !== draft.fileName,
    );

    if (
      currentDraft &&
      (currentDraft.content !== draft.content || currentDraft.fileName !== draft.fileName)
    ) {
      const revision: TranscriptRevision = {
        ...currentDraft,
        id: `${currentDraft.savedAt}-${crypto.randomUUID()}`,
      };
      history = [
        revision,
        ...history.filter(
          (storedRevision) =>
            storedRevision.content !== revision.content ||
            storedRevision.fileName !== revision.fileName,
        ),
      ].slice(0, HISTORY_LIMIT);
    }

    store.put(draft, DRAFT_KEY);
    store.put(history, HISTORY_KEY);
    await transactionComplete(transaction);

    return history;
  } finally {
    database.close();
  }
}
