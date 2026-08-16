"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { basicSetup } from "codemirror";
import { EditorView, placeholder } from "@codemirror/view";

export type TranscriptEditorHandle = {
  focus: () => void;
  insertText: (text: string) => void;
};

type TranscriptEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export const TranscriptEditor = forwardRef<
  TranscriptEditorHandle,
  TranscriptEditorProps
>(function TranscriptEditor({ value, onChange }, forwardedRef) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const externalUpdateRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !externalUpdateRef.current) {
            onChangeRef.current(update.state.doc.toString());
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
    }),
    [],
  );

  return <div ref={containerRef} className="editor-shell h-full min-h-0" />;
});
