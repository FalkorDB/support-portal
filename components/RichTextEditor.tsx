"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { cn } from "@/lib/utils";

// Custom extension for Ctrl+Enter submit
function createCtrlEnterExtension(onCtrlEnter: () => void) {
  return Extension.create({
    name: "ctrlEnterSubmit",
    addKeyboardShortcuts() {
      return {
        "Mod-Enter": () => {
          onCtrlEnter();
          return true;
        },
      };
    },
  });
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px"];

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  onCtrlEnter?: () => void;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "",
  minHeight = "150px",
  disabled = false,
  onCtrlEnter,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      ...(onCtrlEnter ? [createCtrlEnterExtension(onCtrlEnter)] : []),
    ],
    content,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-2 text-sm",
        style: `min-height: ${minHeight}`,
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const currentFontSize = editor?.getAttributes("textStyle")?.fontSize || "";

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={disabled || !editor}
          className={cn(
            "rounded px-2 py-1 text-sm font-bold transition-colors",
            editor?.isActive("bold")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200",
          )}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor}
          className={cn(
            "rounded px-2 py-1 text-sm italic transition-colors",
            editor?.isActive("italic")
              ? "bg-gray-300 text-gray-900"
              : "text-gray-600 hover:bg-gray-200",
          )}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <select
          value={currentFontSize}
          onChange={(e) => {
            if (!editor) return;
            if (e.target.value) {
              editor.chain().focus().setFontSize(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          disabled={disabled || !editor}
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
        >
          <option value="">Font size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p {
          margin: 0.25em 0;
        }
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
