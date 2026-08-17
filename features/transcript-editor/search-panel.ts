import {
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  replaceAll,
  replaceNext,
  SearchQuery,
  setSearchQuery,
  selectMatches,
} from "@codemirror/search";
import type { EditorView, Panel, ViewUpdate } from "@codemirror/view";

type QueryUpdate = Partial<
  Pick<SearchQuery, "caseSensitive" | "regexp" | "replace" | "search" | "wholeWord">
>;

function updateSearchQuery(view: EditorView, update: QueryUpdate) {
  const current = getSearchQuery(view.state);
  view.dispatch({
    effects: setSearchQuery.of(
      new SearchQuery({
        caseSensitive: update.caseSensitive ?? current.caseSensitive,
        literal: current.literal,
        regexp: update.regexp ?? current.regexp,
        replace: update.replace ?? current.replace,
        search: update.search ?? current.search,
        wholeWord: update.wholeWord ?? current.wholeWord,
      }),
    ),
  });
}

function createActionButton(label: string, text: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cm-transcript-search-button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.textContent = text;
  return button;
}

function getMatchStatus(view: EditorView, query: SearchQuery) {
  if (!query.search) {
    return "No query";
  }

  if (!query.valid) {
    return "Invalid pattern";
  }

  const selection = view.state.selection.main;
  const cursor = query.getCursor(view.state);
  let currentMatch = 0;
  let totalMatches = 0;
  let truncated = false;

  while (true) {
    const result = cursor.next();
    if (result.done) {
      break;
    }

    totalMatches += 1;
    if (result.value.from === selection.from && result.value.to === selection.to) {
      currentMatch = totalMatches;
    }

    if (totalMatches === 1000) {
      truncated = true;
      break;
    }
  }

  if (!totalMatches) {
    return "No results";
  }

  if (truncated) {
    return currentMatch ? `${currentMatch} / 1000+` : "1000+ results";
  }

  return currentMatch ? `${currentMatch} / ${totalMatches}` : `${totalMatches} result${totalMatches === 1 ? "" : "s"}`;
}

export function createTranscriptSearchPanel(view: EditorView): Panel {
  const form = document.createElement("form");
  const findRow = document.createElement("div");
  const replaceRow = document.createElement("div");
  const findInput = document.createElement("input");
  const replaceInput = document.createElement("input");
  const status = document.createElement("output");
  const previousButton = createActionButton("Previous match", "↑");
  const nextButton = createActionButton("Next match", "↓");
  const selectAllButton = createActionButton("Select all matches", "All");
  const caseButton = createActionButton("Match case", "Aa");
  const wordButton = createActionButton("Match whole word", "W");
  const regexpButton = createActionButton("Use regular expression", ".*");
  const replaceButton = createActionButton("Replace current match", "Replace");
  const replaceAllButton = createActionButton("Replace all matches", "Replace all");
  const closeButton = createActionButton("Close search", "×");

  form.className = "cm-transcript-search";
  findRow.className = "cm-transcript-search-row";
  replaceRow.className = "cm-transcript-search-row cm-transcript-search-replace-row";
  findInput.className = "cm-transcript-search-input";
  replaceInput.className = "cm-transcript-search-input";
  status.className = "cm-transcript-search-status";
  closeButton.classList.add("cm-transcript-search-close");
  findInput.type = "search";
  findInput.placeholder = "Find in transcript";
  findInput.autocomplete = "off";
  findInput.spellcheck = false;
  findInput.setAttribute("aria-label", "Find in transcript");
  findInput.setAttribute("main-field", "true");
  replaceInput.type = "text";
  replaceInput.placeholder = "Replace with";
  replaceInput.autocomplete = "off";
  replaceInput.spellcheck = false;
  replaceInput.setAttribute("aria-label", "Replace with");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");

  const syncPanel = (editorView: EditorView) => {
    const query = getSearchQuery(editorView.state);
    findInput.value = query.search;
    replaceInput.value = query.replace;
    caseButton.setAttribute("aria-pressed", query.caseSensitive.toString());
    wordButton.setAttribute("aria-pressed", query.wholeWord.toString());
    regexpButton.setAttribute("aria-pressed", query.regexp.toString());
    status.textContent = getMatchStatus(editorView, query);
    const actionsDisabled = !query.valid;
    previousButton.disabled = actionsDisabled;
    nextButton.disabled = actionsDisabled;
    selectAllButton.disabled = actionsDisabled;
    replaceButton.disabled = actionsDisabled;
    replaceAllButton.disabled = actionsDisabled;
  };

  findInput.addEventListener("input", () => updateSearchQuery(view, { search: findInput.value }));
  replaceInput.addEventListener("input", () => updateSearchQuery(view, { replace: replaceInput.value }));
  previousButton.addEventListener("click", () => findPrevious(view));
  nextButton.addEventListener("click", () => findNext(view));
  selectAllButton.addEventListener("click", () => selectMatches(view));
  caseButton.addEventListener("click", () => {
    const query = getSearchQuery(view.state);
    updateSearchQuery(view, { caseSensitive: !query.caseSensitive });
  });
  wordButton.addEventListener("click", () => {
    const query = getSearchQuery(view.state);
    updateSearchQuery(view, { wholeWord: !query.wholeWord });
  });
  regexpButton.addEventListener("click", () => {
    const query = getSearchQuery(view.state);
    updateSearchQuery(view, { regexp: !query.regexp });
  });
  replaceButton.addEventListener("click", () => replaceNext(view));
  replaceAllButton.addEventListener("click", () => replaceAll(view));
  closeButton.addEventListener("click", () => {
    closeSearchPanel(view);
    view.focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event instanceof SubmitEvent && event.submitter === previousButton) {
      findPrevious(view);
    } else {
      findNext(view);
    }
  });
  form.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearchPanel(view);
      view.focus();
    } else if (event.key === "Enter" && (event.target === findInput || event.target === replaceInput)) {
      event.preventDefault();
      if (event.shiftKey) {
        findPrevious(view);
      } else {
        findNext(view);
      }
    }
  });

  findRow.append(findInput, status, previousButton, nextButton, selectAllButton, caseButton, wordButton, regexpButton, closeButton);
  replaceRow.append(replaceInput, replaceButton, replaceAllButton);
  form.append(findRow, replaceRow);
  syncPanel(view);

  return {
    dom: form,
    top: true,
    mount() {
      findInput.focus();
      findInput.select();
    },
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.transactions.some((transaction) => transaction.effects.length > 0)) {
        syncPanel(update.view);
      }
    },
  };
}
