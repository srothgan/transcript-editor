"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  redo as redoCommand,
  redoDepth,
  undo as undoCommand,
  undoDepth,
} from "@codemirror/commands";
import { openSearchPanel, search } from "@codemirror/search";
import { basicSetup } from "codemirror";
import { EditorView, placeholder } from "@codemirror/view";

import { timestampJumpExtension } from "./timestamp-jump-extension";
import { createTranscriptSearchPanel } from "./search-panel";

export type EditorHistoryState = {
  canRedo: boolean;
  canUndo: boolean;
};

export type TranscriptEditorHandle = {
  focus: () => void;
  insertSpeaker: (name: string) => void;
  insertText: (text: string) => void;
  openSearch: () => void;
  redo: () => void;
  undo: () => void;
};

type TranscriptEditorProps = {
  value: string;
  onHistoryStateChange: (state: EditorHistoryState) => void;
  onChange: (value: string) => void;
  onJumpToTime: (seconds: number) => void;
};

export const TranscriptEditor = forwardRef<
  TranscriptEditorHandle,
  TranscriptEditorProps
>(function TranscriptEditor(
  { value, onChange, onHistoryStateChange, onJumpToTime },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onHistoryStateChangeRef = useRef(onHistoryStateChange);
  const onJumpToTimeRef = useRef(onJumpToTime);
  const initialValueRef = useRef(value);
  const externalUpdateRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onHistoryStateChangeRef.current = onHistoryStateChange;
  }, [onHistoryStateChange]);

  useEffect(() => {
    onJumpToTimeRef.current = onJumpToTime;
  }, [onJumpToTime]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const editor = new EditorView({
      doc: initialValueRef.current,
      parent: containerRef.current,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          "aria-label": "Transcript editor",
          spellcheck: "true",
        }),
        placeholder("Start typing or open a .txt transcript…"),
        search({ createPanel: createTranscriptSearchPanel, top: true }),
        timestampJumpExtension((seconds) => onJumpToTimeRef.current(seconds)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !externalUpdateRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }

          if (update.docChanged || update.transactions.some((transaction) => transaction.selection)) {
            onHistoryStateChangeRef.current({
              canRedo: redoDepth(update.state) > 0,
              canUndo: undoDepth(update.state) > 0,
            });
          }
        }),
        EditorView.theme({
          "&": { backgroundColor: "transparent", color: "var(--foreground)" },
          ".cm-cursor": { borderLeftColor: "var(--primary)" },
          ".cm-placeholder": { color: "var(--muted-foreground)" },
          ".cm-gutterElement": { paddingInline: "0.65rem" },
        }),
      ],
    });

    editorRef.current = editor;
    onHistoryStateChangeRef.current({ canRedo: false, canUndo: false });

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || editor.state.doc.toString() === value) {
      return;
    }

    externalUpdateRef.current = true;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: value },
      selection: { anchor: 0 },
    });
    externalUpdateRef.current = false;
  }, [value]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      focus() {
        editorRef.current?.focus();
      },
      insertSpeaker(name: string) {
        const editor = editorRef.current;

        if (!editor) {
          return;
        }

        const selection = editor.state.selection.main;
        const line = editor.state.doc.lineAt(selection.from);
        const lineIsEmpty = line.text.trim().length === 0;
        const text = `${lineIsEmpty ? "" : "\n"}${name}`;
        const from = lineIsEmpty ? line.from : selection.from;
        const to = lineIsEmpty ? line.to : selection.to;
        editor.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
          scrollIntoView: true,
        });
        editor.focus();
      },
      insertText(text: string) {
        const editor = editorRef.current;

        if (!editor) {
          return;
        }

        const selection = editor.state.selection.main;
        editor.dispatch({
          changes: { from: selection.from, to: selection.to, insert: text },
          selection: { anchor: selection.from + text.length },
          scrollIntoView: true,
        });
        editor.focus();
      },
      openSearch() {
        const editor = editorRef.current;
        if (editor) {
          openSearchPanel(editor);
        }
      },
      redo() {
        const editor = editorRef.current;
        if (editor) {
          redoCommand(editor);
          editor.focus();
        }
      },
      undo() {
        const editor = editorRef.current;
        if (editor) {
          undoCommand(editor);
          editor.focus();
        }
      },
    }),
    [],
  );

  return <div ref={containerRef} className="editor-shell h-full min-h-0" />;
});
