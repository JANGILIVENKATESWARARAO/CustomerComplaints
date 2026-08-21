import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Status, Screen, TimelineEntry } from "../../types";
import { COMPLAINTS, EMAIL_THREADS } from "../../data";
import { ALL_STATUSES, nowStamp } from "../../utils";
import { SSO_USER } from "../../constants";
import { Card, StatusBadge } from "../../components/shared.tsx";
import { MiniSelect } from "../../components/ui/mini-select";
import * as Icons from "../../services/iconService";
import {
  useEditor,
  EditorContent,
  StarterKit,
  UnderlineExt,
  Placeholder,
  TextStyle,
  FontSize,
  Color,
  Highlight,
  TextAlign,
  TableExt,
  TableRow,
  TableCell,
  TableHeader,
  Link,
  Strike,
} from "../../services/tiptapService";

// ─── Local Helpers ─────────────────────────────────────────────────────────────

function RequiredLabel({ label }: { label: string }) {
  return (
    <label className="block text-xs font-semibold text-foreground mb-1.5">
      {label} <span className="text-red-500">*</span>
    </label>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const pct = current / max;
  return (
    <span
      className={`text-xs ${pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-muted-foreground"}`}
    >
      {current}/{max}
    </span>
  );
}

// ─── Timeline segment types ────────────────────────────────────────────────────

type TimelineSegment =
  | { kind: "entry"; entry: TimelineEntry }
  | { kind: "group"; entries: TimelineEntry[]; groupId: string };

function buildSegments(timeline: TimelineEntry[]): TimelineSegment[] {
  const isImportant = (e: TimelineEntry) =>
    e.type === "created" || e.type === "status" || e.type === "reopen";
  const segments: TimelineSegment[] = [];
  let groupBuf: TimelineEntry[] = [];
  const flushGroup = () => {
    if (groupBuf.length === 1) {
      segments.push({ kind: "entry", entry: groupBuf[0] });
    } else if (groupBuf.length > 1) {
      segments.push({
        kind: "group",
        entries: [...groupBuf],
        groupId: groupBuf[0].id,
      });
    }
    groupBuf = [];
  };
  for (const entry of timeline) {
    if (isImportant(entry)) {
      flushGroup();
      segments.push({ kind: "entry", entry });
    } else groupBuf.push(entry);
  }
  flushGroup();
  return segments;
}

// ─── Timeline Configuration ────────────────────────────────────────────────────

const TIMELINE_CFG: Record<
  string,
  {
    icon: (p: { size: number; className: string }) => ReactNode;
    iconBg: string;
    iconColor: string;
  }
> = {
  note: {
    icon: (p) => <Icons.MessageSquare {...p} />,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  call: {
    icon: (p) => <Icons.Phone {...p} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  phone: {
    icon: (p) => <Icons.Phone {...p} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  email: {
    icon: (p) => <Icons.Mail {...p} />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  status: {
    icon: (p) => <Icons.Activity {...p} />,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  reopen: {
    icon: (p) => <Icons.RefreshCcwDot {...p} />,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  resolved: {
    icon: (p) => <Icons.CheckCircle2 {...p} />,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  closed: {
    icon: (p) => <Icons.X {...p} />,
    iconBg: "bg-gray-200",
    iconColor: "text-gray-700",
  },
  created: {
    icon: (p) => <Icons.PlusCircle {...p} />,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
  },
  assigned: {
    icon: (p) => <Icons.UserCheck {...p} />,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
};

// ─── Rich Editor ───────────────────────────────────────────────────────────────

const FONT_SIZES = [
  "10", "11", "12", "13", "14", "16", "18", "20", "24", "28", "32", "36", "48",
];
const TEXT_COLORS = [
  "#111827", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff",
];
const BG_COLORS = [
  "transparent", "#fef9c3", "#dcfce7", "#dbeafe", "#fce7f3", "#ffe4e6", "#f3e8ff", "#ffedd5", "#374151",
];

function useRichEditor(placeholder: string, content = "") {
  const [isEmpty, setIsEmpty] = useState(true);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false, underline: false, link: false }),
      Strike,
      UnderlineExt,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableExt.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    autofocus: "end",
    onUpdate: ({ editor: e }) => setIsEmpty(e.isEmpty),
  });
  return { editor, isEmpty };
}

function RichEditor({
  editor,
}: {
  editor: ReturnType<typeof useEditor>;
  placeholder?: string;
}) {
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [alignOpen, setAlignOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const fsRef = useRef<HTMLDivElement>(null);
  const clRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const alRef = useRef<HTMLDivElement>(null);
  const liRef = useRef<HTMLDivElement>(null);
  const tbRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
 
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = editorHeight;
 
    e.currentTarget.setPointerCapture(e.pointerId);
  };
 
  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing.current) return;
 
    const diff = e.clientY - startY.current;
 
    const newHeight = Math.min(
      Math.max(startHeight.current + diff, 128),
      500
    );
 
    setEditorHeight(newHeight);
  };
 
  const handleResizeEnd = () => {
    isResizing.current = false;
  };
  const [editorHeight, setEditorHeight] = useState(128);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(128);
 

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!fsRef.current?.contains(e.target as Node)) setFontSizeOpen(false);
      if (!clRef.current?.contains(e.target as Node)) setColorOpen(false);
      if (!bgRef.current?.contains(e.target as Node)) setBgColorOpen(false);
      if (!alRef.current?.contains(e.target as Node)) setAlignOpen(false);
      if (!liRef.current?.contains(e.target as Node)) setListOpen(false);
      if (!tbRef.current?.contains(e.target as Node)) setTableOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!editor) return null;

  const btn = (
    label: string,
    icon: ReactNode,
    action: () => void,
    active = false,
    extra = "",
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      className={`p-1.5 rounded transition-colors flex-shrink-0 ${active ? "bg-primary/15 text-primary" : `text-muted-foreground hover:bg-muted ${extra}`}`}
    >
      {icon}
    </button>
  );

  const sep = () => <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />;

  const currentAlign =
    (["left", "center", "right", "justify"] as const).find((a) =>
      editor.isActive({ textAlign: a }),
    ) ?? "left";
  const alignIcons: Record<string, ReactNode> = {
    left: <Icons.AlignLeft size={12} />,
    center: <Icons.AlignCenter size={12} />,
    right: <Icons.AlignRight size={12} />,
    justify: <Icons.AlignJustify size={12} />,
  };

  return (
    <>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        {btn("Undo", <Icons.Undo2 size={12} />, () => editor.chain().focus().undo().run())}
        {btn("Redo", <Icons.Redo2 size={12} />, () => editor.chain().focus().redo().run())}
        {sep()}
        {btn("Bold", <Icons.Bold size={12} />, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("Italic", <Icons.Italic size={12} />, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("Underline", <Icons.UnderlineIcon size={12} />, () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
        {btn("Strikethrough", <Icons.Strikethrough size={12} />, () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
        {sep()}
        <div ref={fsRef} className="relative flex-shrink-0">
          <button type="button" title="Font size" onMouseDown={(e) => { e.preventDefault(); setFontSizeOpen((v) => !v); }} className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors">
            <Icons.Type size={11} /><Icons.ChevronDown size={9} />
          </button>
          {fontSizeOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-16 max-h-48 overflow-y-auto">
              {FONT_SIZES.map((s) => (
                <button key={s} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).setFontSize(s + "px").run(); setFontSizeOpen(false); }} className="w-full text-left px-3 py-1 text-xs hover:bg-muted transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
        <div ref={clRef} className="relative flex-shrink-0">
          <button type="button" title="Text color" onMouseDown={(e) => { e.preventDefault(); setColorOpen((v) => !v); }} className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors">
            <span className="font-bold text-xs" style={{ color: editor.getAttributes("textStyle").color ?? "#111827" }}>A</span><Icons.ChevronDown size={9} />
          </button>
          {colorOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl p-2 flex flex-wrap gap-1 w-28">
              {TEXT_COLORS.map((c) => (
                <button key={c} type="button" title={c} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setColorOpen(false); }} className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform" style={{ background: c === "#ffffff" ? "#f3f4f6" : c }} />
              ))}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setColorOpen(false); }} className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 text-center">Reset</button>
            </div>
          )}
        </div>
        <div ref={bgRef} className="relative flex-shrink-0">
          <button type="button" title="Highlight color" onMouseDown={(e) => { e.preventDefault(); setBgColorOpen((v) => !v); }} className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors">
            <Icons.Highlighter size={12} /><Icons.ChevronDown size={9} />
          </button>
          {bgColorOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl p-2 flex flex-wrap gap-1 w-28">
              {BG_COLORS.map((c) => (
                <button key={c} type="button" title={c} onMouseDown={(e) => { e.preventDefault(); c === "transparent" ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().setHighlight({ color: c }).run(); setBgColorOpen(false); }} className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform" style={{ background: c === "transparent" ? "linear-gradient(135deg,#fff 40%,#e5e7eb 40%)" : c }} />
              ))}
            </div>
          )}
        </div>
        {sep()}
        <div ref={alRef} className="relative flex-shrink-0">
          <button type="button" title="Text alignment" onMouseDown={(e) => { e.preventDefault(); setAlignOpen((v) => !v); }} className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors">
            {alignIcons[currentAlign]}<Icons.ChevronDown size={9} />
          </button>
          {alignOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-32">
              {(["left", "center", "right", "justify"] as const).map((a) => (
                <button key={a} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign(a).run(); setAlignOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${editor.isActive({ textAlign: a }) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  {alignIcons[a]}{a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
        {sep()}
        {btn("Outdent", <Icons.Outdent size={12} />, () => editor.chain().focus().liftListItem("listItem").run())}
        {btn("Indent", <Icons.Indent size={12} />, () => editor.chain().focus().sinkListItem("listItem").run())}
        {sep()}
        <div ref={liRef} className="relative flex-shrink-0">
          <button type="button" title="Lists" onMouseDown={(e) => { e.preventDefault(); setListOpen((v) => !v); }} className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors">
            <Icons.List size={12} /><Icons.ChevronDown size={9} />
          </button>
          {listOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-36">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); setListOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${editor.isActive("bulletList") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}><Icons.List size={11} />Bullet List</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); setListOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${editor.isActive("orderedList") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}><Icons.ListOrdered size={11} />Ordered List</button>
            </div>
          )}
        </div>
        <div ref={tbRef} className="relative flex-shrink-0">
          <button type="button" title="Table" onMouseDown={(e) => { e.preventDefault(); setTableOpen((v) => !v); }} className="flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors">
            <Icons.TableIcon size={12} /><Icons.ChevronDown size={9} />
          </button>
          {tableOpen && (
            <div className="absolute z-[500] top-full mt-0.5 left-0 bg-card border border-border rounded-lg shadow-xl py-1 w-44">
              {[
                ["Insert table", () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()],
                ["Add row above", () => editor.chain().focus().addRowBefore().run()],
                ["Add row below", () => editor.chain().focus().addRowAfter().run()],
                ["Delete row", () => editor.chain().focus().deleteRow().run()],
                ["Add column before", () => editor.chain().focus().addColumnBefore().run()],
                ["Add column after", () => editor.chain().focus().addColumnAfter().run()],
                ["Delete column", () => editor.chain().focus().deleteColumn().run()],
                ["Delete table", () => editor.chain().focus().deleteTable().run()],
              ].map(([label, action]) => (
                <button key={label as string} type="button" onMouseDown={(e) => { e.preventDefault(); (action as () => void)(); setTableOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors">{label as string}</button>
              ))}
            </div>
          )}
        </div>
        {sep()}
        {btn("Blockquote", <Icons.Quote size={12} />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
        {btn("Link", <Icons.LinkIcon size={12} />, () => {
          const prev = editor.getAttributes("link").href;
          const url = window.prompt("Enter URL", prev ?? "https://");
          if (url === null) return;
          url === "" ? editor.chain().focus().unsetLink().run() : editor.chain().focus().setLink({ href: url }).run();
        }, editor.isActive("link"))}
        {sep()}
        {btn("Clear formatting", <Icons.RemoveFormatting size={12} />, () => editor.chain().focus().clearNodes().unsetAllMarks().run())}
      </div>
      {/* <div className="bg-white min-h-32 max-h-64 overflow-y-auto px-4 py-3 [&_.tiptap]:outline-none [&_.tiptap]:min-h-28 [&_.tiptap]:text-sm [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-primary/30 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:my-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_strong]:font-bold [&_.tiptap_em]:italic [&_.tiptap_u]:underline [&_.tiptap_s]:line-through [&_.tiptap_a]:text-primary [&_.tiptap_a]:underline [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse [&_.tiptap_table]:my-2 [&_.tiptap_td]:border [&_.tiptap_td]:border-border [&_.tiptap_td]:px-2 [&_.tiptap_td]:py-1.5 [&_.tiptap_td]:text-xs [&_.tiptap_th]:border [&_.tiptap_th]:border-border [&_.tiptap_th]:px-2 [&_.tiptap_th]:py-1.5 [&_.tiptap_th]:text-xs [&_.tiptap_th]:bg-muted [&_.tiptap_th]:font-semibold">
        <EditorContent editor={editor} />
      </div> */}
      <div
        className="relative bg-white overflow-auto px-4 py-3"
        style={{ height: `${editorHeight}px` }}
      >
        <div
          className="h-full overflow-y-auto
      [&_.tiptap]:outline-none
      [&_.tiptap]:min-h-28
      [&_.tiptap]:text-sm
      [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
      [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground
      [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none
      [&_.tiptap_p.is-editor-empty:first-child::before]:float-left
      [&_.tiptap_blockquote]:border-l-4
      [&_.tiptap_blockquote]:border-primary/30
      [&_.tiptap_blockquote]:pl-4
      [&_.tiptap_blockquote]:text-muted-foreground
      [&_.tiptap_blockquote]:italic
      [&_.tiptap_blockquote]:my-2
      [&_.tiptap_ul]:list-disc
      [&_.tiptap_ul]:pl-5
      [&_.tiptap_ol]:list-decimal
      [&_.tiptap_ol]:pl-5
      [&_.tiptap_strong]:font-bold
      [&_.tiptap_em]:italic
      [&_.tiptap_u]:underline
      [&_.tiptap_s]:line-through
      [&_.tiptap_a]:text-primary
      [&_.tiptap_a]:underline
      [&_.tiptap_table]:w-full
      [&_.tiptap_table]:border-collapse
      [&_.tiptap_table]:my-2
      [&_.tiptap_td]:border
      [&_.tiptap_td]:border-border
      [&_.tiptap_td]:px-2
      [&_.tiptap_td]:py-1.5
      [&_.tiptap_td]:text-xs
      [&_.tiptap_th]:border
      [&_.tiptap_th]:border-border
      [&_.tiptap_th]:px-2
      [&_.tiptap_th]:py-1.5
      [&_.tiptap_th]:text-xs
      [&_.tiptap_th]:bg-muted
      [&_.tiptap_th]:font-semibold"
        >
          <EditorContent editor={editor} />
        </div>
 
        {/* Custom resize handle */}
        <div
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          className="absolute bottom-1 left-1/2 -translate-x-1/2
      w-8 h-2
      rounded-full
      bg-gray-300
      hover:bg-gray-400
      cursor-ns-resize
      select-none
      touch-none
      z-10"
        />
      </div>
      
      
    </>
  );
}

// ─── NotePanel ─────────────────────────────────────────────────────────────────

function NotePanel({ onSave, onCancel }: { onSave: (html: string, text: string) => void; onCancel: () => void }) {
  const { editor, isEmpty } = useRichEditor("Add an internal note visible only to your team…");
  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-right">
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-3 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => { if (!editor || isEmpty) return; onSave(editor.getHTML(), editor.getText()); }} disabled={isEmpty} className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 font-medium">Save Note</button>
        </div>
      </div>
      <RichEditor editor={editor} />
    </div>
  );
}

// ─── CallPanel ─────────────────────────────────────────────────────────────────

function CallPanel({
  callOutcome, setCallOutcome, callDir, setCallDir, onSave, onCancel,
}: {
  callOutcome: string; setCallOutcome: (v: string) => void;
  callDir: string; setCallDir: (v: string) => void;
  onSave: (html: string, text: string) => void; onCancel: () => void;
}) {
  const { editor, isEmpty } = useRichEditor("Call notes…");
  return (
    <div className="mt-4 border border-green-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2.5 border-b border-green-200 bg-green-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <MiniSelect value={callOutcome} onChange={setCallOutcome} options={["Spoke with customer", "No answer — voicemail left", "No answer — no voicemail", "Inbound call from customer"]} />
          {/* <MiniSelect value={callDir} onChange={setCallDir} options={["Inbound", "Online Booking", "Email", "Company Portal", "Telephonic System"]} /> */}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-3 py-1 text-xs rounded-lg border border-green-200 text-green-700 hover:bg-green-100 transition-colors">Cancel</button>
          <button onClick={() => { if (!editor || isEmpty) return; onSave(editor.getHTML(), editor.getText()); }} disabled={isEmpty} className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"><Icons.Mic size={11} />Save Call</button>
        </div>
      </div>
      <RichEditor editor={editor} />
    </div>
  );
}

// ─── RichEmailEditor ───────────────────────────────────────────────────────────

function RichEmailEditor({
  onSend, onCancel, toEmail, toName: _toName, defaultSubject, quotedHtml,
}: {
  onSend: (subject: string, html: string, text: string, attachments: { name: string; size: number; type: string }[]) => void;
  onCancel: () => void;
  toEmail: string;
  toName: string;
  defaultSubject: string;
  quotedHtml?: string;
}) {
  const [to, setTo] = useState(toEmail);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [editorEmpty, setEditorEmpty] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false, underline: false, link: false }),
      Strike, UnderlineExt, TextStyle, FontSize, Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableExt.configure({ resizable: false }),
      TableRow, TableCell, TableHeader,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Enter message…" }),
    ],
    content: quotedHtml ? `<p></p><blockquote>${quotedHtml}</blockquote>` : "",
    autofocus: "start",
    onUpdate: ({ editor: e }) => setEditorEmpty(e.isEmpty),
    onCreate: ({ editor: e }) => setEditorEmpty(e.isEmpty),
  });

  const handleSend = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) return;
    onSend(subject, html, text, attachments.map((f) => ({ name: f.name, size: f.size, type: f.type })));
  };

  return (
    <div className="mt-4 border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-blue-100 bg-blue-50">
        <button onClick={handleSend} disabled={editorEmpty} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 font-semibold"><Icons.Send size={11} />Send</button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"><Icons.Paperclip size={11} />Attach file</button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => setAttachments((prev) => [...prev, ...Array.from(e.target.files ?? [])])} />
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Icons.X size={14} className="text-muted-foreground" /></button>
        </div>
      </div>
      <div className="border-b border-blue-100">
        {[{ label: "To:", value: to, setter: setTo, required: true }, { label: "Cc:", value: cc, setter: setCc }, { label: "Bcc:", value: bcc, setter: setBcc }].map(({ label, value, setter, required }) => (
          <div key={label} className="flex items-center border-b border-blue-50 last:border-b-0">
            <span className="px-4 py-2 text-xs font-semibold text-blue-700 w-12 flex-shrink-0">{label}</span>
            <input value={value} onChange={(e) => setter(e.target.value)} placeholder={required ? "Required" : "Optional"} className="flex-1 py-2 pr-4 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        ))}
        <div className="flex items-center border-t border-blue-100">
          <span className="px-4 py-2 text-xs font-semibold text-blue-700 w-20 flex-shrink-0">Subject:</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Add a subject" className="flex-1 py-2 pr-4 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground font-medium" />
        </div>
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-blue-100 bg-blue-50/50">
          {attachments.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs text-blue-700">
              <Icons.Paperclip size={10} />
              <span className="max-w-32 truncate">{f.name}</span>
              <button onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}><Icons.X size={9} /></button>
            </div>
          ))}
        </div>
      )}
      <RichEditor editor={editor} placeholder="Enter message…" />
    </div>
  );
}

// ─── EmailThreadModal ──────────────────────────────────────────────────────────

function EmailThreadModal({ complaintId, subject, onClose }: { complaintId: string; subject: string; onClose: () => void }) {
  const thread = EMAIL_THREADS[complaintId] ?? [];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Email Thread</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{complaintId} — {subject}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Icons.X size={15} className="text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No email thread found for this complaint.</p>
          ) : thread.map((msg, idx) => (
            <div key={msg.id} className={`rounded-lg border p-4 ${msg.isOutgoing ? "bg-blue-50 border-blue-100 ml-6" : "bg-muted/40 border-border mr-6"}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{msg.from}</p>
                  <p className="text-xs text-muted-foreground truncate">To: {msg.to}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${msg.isOutgoing ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>{msg.isOutgoing ? "Sent" : "Received"}</span>
                  <span className="text-xs text-muted-foreground">{msg.date}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-foreground mb-2 pb-2 border-b border-border/60">{msg.subject}</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{msg.body}</pre>
              {idx < thread.length - 1 && <p className="text-xs text-muted-foreground mt-2 italic">In reply to message below</p>}
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{thread.length} message{thread.length !== 1 ? "s" : ""} in thread</p>
          <button onClick={onClose} className="px-4 py-1.5 text-xs bg-muted rounded-lg hover:bg-muted/80 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modals ────────────────────────────────────────────────────────────────────

function ResolveModal({ onConfirm, onCancel }: { onConfirm: (summary: string) => void; onCancel: () => void }) {
  const [summary, setSummary] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><Icons.CheckCircle2 size={18} className="text-green-600" /></div>
          <div><h3 className="text-sm font-semibold text-foreground">Resolve Complaint</h3><p className="text-xs text-muted-foreground">Provide a resolution summary before marking as resolved.</p></div>
        </div>
        <div>
          <RequiredLabel label="Resolution Summary" />
          <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={2000} placeholder="Describe how the complaint was resolved and any actions taken..." className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 resize-none transition" />
          <div className="flex justify-end mt-1"><CharCounter current={summary.length} max={2000} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => summary.trim() && onConfirm(summary.trim())} disabled={!summary.trim()} className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"><Icons.CheckCircle2 size={13} />Resolve Complaint</button>
        </div>
      </Card>
    </div>
  );
}

function CloseModal({ onConfirm, onCancel, isResolved }: { onConfirm: (summary: string, awaitingCustomer: boolean) => void; onCancel: () => void; isResolved: boolean }) {
  const [summary, setSummary] = useState("");
  const [awaitingCustomer, setAwaitingCustomer] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><Icons.X size={18} className="text-gray-600" /></div>
          <div><h3 className="text-sm font-semibold text-foreground">Close Complaint</h3><p className="text-xs text-muted-foreground">Provide a closing summary before marking as closed.</p></div>
        </div>
        {!isResolved && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <Icons.AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">This complaint has not been resolved. Closing without resolving may affect reporting.</p>
          </div>
        )}
        <div className="mb-4">
          <RequiredLabel label="Close Summary" />
          <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={2000} placeholder="Describe the outcome and reason for closing this complaint..." className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none transition" />
          <div className="flex justify-end mt-1"><CharCounter current={summary.length} max={2000} /></div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none mb-5">
          <div onClick={() => setAwaitingCustomer((v) => !v)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${awaitingCustomer ? "bg-primary border-primary" : "border-border bg-card"}`}>
            {awaitingCustomer && <Icons.Check size={10} className="text-white" />}
          </div>
          <div><span className="text-xs font-medium text-foreground">Awaiting Customer</span><p className="text-xs text-muted-foreground">Customer response or action is still pending at close.</p></div>
        </label>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => summary.trim() && onConfirm(summary.trim(), awaitingCustomer)} disabled={!summary.trim()} className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"><Icons.X size={13} />Close Complaint</button>
        </div>
      </Card>
    </div>
  );
}

function ReopenModal({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Icons.RefreshCcwDot size={18} className="text-primary" /></div>
          <div><h3 className="text-sm font-semibold text-foreground">Reopen Complaint</h3><p className="text-xs text-muted-foreground">Provide a reason for reopening this complaint.</p></div>
        </div>
        <div className="mb-5">
          <RequiredLabel label="Reason for Reopening" />
          <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} placeholder="Explain why this complaint is being reopened..." className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition" />
          <div className="flex justify-end mt-1"><CharCounter current={reason.length} max={2000} /></div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => reason.trim() && onConfirm(reason.trim())} disabled={!reason.trim()} className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"><Icons.RefreshCcwDot size={13} />Reopen Complaint</button>
        </div>
      </Card>
    </div>
  );
}

// ─── TimelineEntry_ ────────────────────────────────────────────────────────────

function TimelineEntry_({
  entry, isLast, onViewEmailThread, onReply, onEdit,
}: {
  entry: TimelineEntry; isLast: boolean;
  onViewEmailThread: (id: string) => void;
  onReply: (entry: TimelineEntry) => void;
  onEdit: (id: string, html: string, text: string) => void;
}) {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const isClosedEntry = entry.type === "status" && entry.text.startsWith("Complaint closed");
  const [awaitingEdit, setAwaitingEdit] = useState(() => isClosedEntry && entry.text.includes("(Awaiting customer response)"));
  const [awaitingBase, setAwaitingBase] = useState(() => isClosedEntry && entry.text.includes("(Awaiting customer response)"));
  const cfgKey = entry.type === "status"
    ? entry.text.startsWith("Complaint closed") ? "closed" : entry.text.startsWith("Complaint resolved") ? "resolved" : "status"
    : entry.type;
  const cfg = TIMELINE_CFG[cfgKey] ?? TIMELINE_CFG.created;
  const hasBody = entry.type === "email" && entry.emailHtml;
  const canEdit = entry.type === "note" || entry.type === "call" || entry.type === "email" || entry.type === "reopen" ||
    (entry.type === "status" && (entry.text.startsWith("Complaint resolved") || entry.text.startsWith("Complaint closed")));

  const closedSummary = isClosedEntry ? (() => { const i = entry.text.indexOf(": "); return i >= 0 ? entry.text.slice(i + 2) : entry.text; })() : "";
  const editInitContent = isClosedEntry ? `<p>${closedSummary}</p>` : (entry.emailHtml ?? `<p>${entry.text}</p>`);
  const { editor: editEditor, isEmpty: editEmpty } = useRichEditor("Edit your content…", editInitContent);

  useEffect(() => {
    if (editing && editEditor) {
      editEditor.commands.setContent(editInitContent);
      if (isClosedEntry) {
        const cur = entry.text.includes("(Awaiting customer response)");
        setAwaitingEdit(cur);
        setAwaitingBase(cur);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const canSaveEdit = !editEmpty || (isClosedEntry && awaitingEdit !== awaitingBase);
  const handleSaveEdit = () => {
    if (!editEditor || !canSaveEdit) return;
    if (isClosedEntry) {
      const summary = editEditor.getText().trim();
      const suffix = awaitingEdit ? " (Awaiting customer response)" : "";
      const newText = `Complaint closed${suffix}: ${summary}`;
      onEdit(entry.id, editEditor.getHTML(), newText);
    } else {
      onEdit(entry.id, editEditor.getHTML(), editEditor.getText());
    }
    setEditing(false);
  };

  return (
    <div className="flex gap-3 min-w-0 overflow-hidden">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.iconBg}`}>
          {cfg.icon({ size: 13, className: cfg.iconColor })}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1 min-h-3" />}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
        <div className="flex items-center gap-2 mb-0.5 min-w-0">
          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
            <span className="text-xs font-semibold text-foreground flex-shrink-0">{entry.author}</span>
            {entry.emailSubject && <span className="text-xs text-muted-foreground truncate cursor-default" title={entry.emailSubject}>— {entry.emailSubject}</span>}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5">
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)} title="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Icons.PencilLine size={11} /></button>
            )}
            <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
          </div>
        </div>

        {editing ? (
          <div className="mt-2 border border-border rounded-lg overflow-hidden bg-white shadow-sm">
            {isClosedEntry && (
              <div className="px-3 pt-2 pb-1 border-b border-border bg-muted/10">
                <button type="button" onClick={() => setAwaitingEdit((v) => !v)} className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${awaitingEdit ? "bg-primary border-primary" : "border-border bg-white"}`}>
                    {awaitingEdit && <Icons.Check size={10} className="text-white" />}
                  </span>
                  Awaiting Customer
                </button>
              </div>
            )}
            <RichEditor editor={editEditor} />
            <div className="flex justify-end gap-2 px-3 py-2 border-t border-border bg-muted/20">
              <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} disabled={!canSaveEdit} className="px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 font-medium">Save</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">{entry.text}</p>
            {hasBody && (
              <div className="mt-2">
                {bodyExpanded ? (
                  <div className="border border-blue-100 rounded-lg bg-blue-50 overflow-hidden">
                    <div className="px-4 py-3 text-xs text-foreground leading-relaxed [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-300 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic" dangerouslySetInnerHTML={{ __html: entry.emailHtml! }} />
                    {entry.emailAttachments && entry.emailAttachments.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-blue-100 space-y-1.5">
                        <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5"><Icons.Paperclip size={10} />{entry.emailAttachments.length} Attachment{entry.emailAttachments.length > 1 ? "s" : ""}</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.emailAttachments.map((a, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs text-blue-800 max-w-[200px]">
                              {/* <Icons.Paperclip size={10} className="text-blue-500 flex-shrink-0" /> */}
                              <span className="truncate font-medium">{a.name}</span>
                              <span className="text-[10px] text-blue-400 flex-shrink-0">{a.size < 1024 ? `${a.size}B` : a.size < 1048576 ? `${(a.size / 1024).toFixed(1)}KB` : `${(a.size / 1048576).toFixed(1)}MB`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 border-t border-blue-100 bg-blue-100/50">
                      <button onClick={() => setBodyExpanded(false)} className="text-xs text-blue-700 hover:underline">Hide message</button>
                      <div className="flex-1" />
                      <button onClick={() => onReply(entry)} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"><Icons.Reply size={11} />Reply</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => setBodyExpanded(true)} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Icons.Mail size={11} />View message</button>
                    <button onClick={() => onReply(entry)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><Icons.Reply size={11} />Reply</button>
                  </div>
                )}
              </div>
            )}
            {entry.type === "email" && entry.emailId && EMAIL_THREADS[entry.emailId] && !hasBody && (
              <button onClick={() => onViewEmailThread(entry.emailId!)} className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"><Icons.Mail size={11} />View email thread</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── TimelineList ──────────────────────────────────────────────────────────────

function TimelineList({
  timeline, onViewEmailThread, onReply, onEdit,
}: {
  timeline: TimelineEntry[];
  onViewEmailThread: (id: string) => void;
  onReply: (entry: TimelineEntry) => void;
  onEdit: (id: string, html: string, text: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const segments = useMemo(() => buildSegments(timeline), [timeline]);

  useEffect(() => {
    if (timeline.length === 0) return;
    const newestId = timeline[0].id;
    const group = segments.find((s) => s.kind === "group" && (s as { kind: "group"; entries: TimelineEntry[]; groupId: string }).entries.some((e) => e.id === newestId));
    if (group && group.kind === "group") {
      setExpanded((prev) => new Set([...prev, group.groupId]));
    }
  }, [timeline]);

  return (
    <>
      {segments.map((seg, si) => {
        const isLastSegment = si === segments.length - 1;
        if (seg.kind === "entry") {
          return <TimelineEntry_ key={seg.entry.id} entry={seg.entry} isLast={isLastSegment} onViewEmailThread={onViewEmailThread} onReply={onReply} onEdit={onEdit} />;
        }
        const isOpen = expanded.has(seg.groupId);
        const toggle = () => setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(seg.groupId)) next.delete(seg.groupId);
          else next.add(seg.groupId);
          return next;
        });
        return (
          <div key={seg.groupId} className="flex gap-3 min-w-0 overflow-hidden">
            <div className="flex flex-col items-center flex-shrink-0 w-7">
              <div className="w-px flex-1 bg-border" />
              {!isLastSegment && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden flex items-center ${isLastSegment ? "pb-0" : "pb-2"}`}>
              {isOpen ? (
                <div className="w-full border border-border rounded-lg overflow-hidden">
                  {seg.entries.map((e, ei) => (
                    <div key={e.id} className={`px-4 py-3 min-w-0 overflow-hidden ${ei < seg.entries.length - 1 ? "border-b border-border" : ""}`}>
                      <TimelineEntry_ entry={e} isLast={ei === seg.entries.length - 1} onViewEmailThread={onViewEmailThread} onReply={onReply} onEdit={onEdit} />
                    </div>
                  ))}
                  <button onClick={toggle} className="w-full px-4 py-2 text-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-t border-border">
                    <Icons.ChevronUp size={12} className="inline mr-1" />Collapse {seg.entries.length} items
                  </button>
                </div>
              ) : (
                <button onClick={toggle} className="w-full group">
                  {(() => {
                    const counts = seg.entries.reduce<Record<string, number>>((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
                    const chips: { type: string; icon: ReactNode; count: number; color: string }[] = [
                      counts.note && { type: "note", icon: <Icons.MessageSquare size={10} />, count: counts.note, color: "bg-gray-100 text-gray-600 border-gray-200" },
                      counts.call && { type: "call", icon: <Icons.Phone size={10} />, count: counts.call, color: "bg-green-50 text-green-700 border-green-200" },
                      counts.email && { type: "email", icon: <Icons.Mail size={10} />, count: counts.email, color: "bg-blue-50 text-blue-700 border-blue-200" },
                    ].filter(Boolean) as { type: string; icon: ReactNode; count: number; color: string }[];
                    const authors = [...new Map(seg.entries.map(e => [e.author, e.author])).values()].slice(0, 3);
                    return (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/30 group-hover:bg-muted/60 group-hover:border-primary/20 transition-all shadow-sm">
                        {/* Avatars */}
                        <div className="flex -space-x-2 flex-shrink-0">
                          {authors.map(a => (
                            <span key={a} className="w-6 h-6 rounded-full bg-primary/15 border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary">
                              {a.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                        {/* Count label */}
                        <span className="text-xs font-medium text-foreground flex-shrink-0">
                          {seg.entries.length} hidden
                        </span>
                        {/* Type chips */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {chips.map(chip => (
                            <span key={chip.type} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${chip.color}`}>
                              {chip.icon}×{chip.count}
                            </span>
                          ))}
                        </div>
                        <Icons.ChevronDown size={13} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    );
                  })()}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── ComplaintDetailsScreen ────────────────────────────────────────────────────

interface ComplaintDetailsScreenProps {
  complaintId: string;
  onNavigate: (s: Screen, id?: string) => void;
}

export function ComplaintDetailsScreen({ complaintId, onNavigate }: ComplaintDetailsScreenProps) {
  const base = COMPLAINTS.find((c) => c.id === complaintId) ?? COMPLAINTS[0];
  const [status, setStatus] = useState<Status>(base.status);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([...base.timeline]);
  const [action, setAction] = useState<"note" | "email" | "call" | null>(null);
  const [showResolve, setShowResolve] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showReopen, setShowReopen] = useState(false);
  const [showEmailThread, setShowEmailThread] = useState<string | null>(null);
  const [callOutcome, setCallOutcome] = useState("Spoke with customer");
  const [callDir, setCallDir] = useState("Inbound");
  const [descExpanded, setDescExpanded] = useState(false);
  const [replyToEntry, setReplyToEntry] = useState<TimelineEntry | null>(null);
  

  function addEntry(partial: Omit<TimelineEntry, "id" | "timestamp">) {
    setTimeline((prev) => [{ id: String(Date.now()), timestamp: nowStamp(), ...partial }, ...prev]);
  }

  function handleDropdownStatusChange(newStatus: Status) {
    if (newStatus === "Resolved") { setShowResolve(true); return; }
    if (newStatus === "Closed") { setShowClose(true); return; }
    setStatus(newStatus);
    addEntry({ type: "status", author: SSO_USER.name, text: `Status changed to ${newStatus}.` });
  }

  function handleSendEmail(subject: string, html: string, text: string, attachments: { name: string; size: number; type: string }[]) {
    addEntry({ type: "email", author: SSO_USER.name, emailId: base.id, emailSubject: subject, emailHtml: html, emailTo: base.customer.email, emailAttachments: attachments.length > 0 ? attachments : undefined, text: `Email sent to ${base.customer.name}.` });
    setAction(null);
    setReplyToEntry(null);
    toast.success("Email sent successfully.");
  }

  function handleResolve(summary: string) {
    setStatus("Resolved");
    addEntry({ type: "status", author: SSO_USER.name, text: `Complaint resolved. ${summary}` });
    setShowResolve(false);
    toast.success("Complaint marked as resolved.");
  }

  function handleEditEntry(id: string, html: string, text: string) {
    setTimeline((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      if (e.type === "email") return { ...e, emailHtml: html };
      if (e.type === "status") return { ...e, text };
      return { ...e, emailHtml: html, text: text.slice(0, 120) + (text.length > 120 ? "…" : "") };
    }));
    toast.success("Entry updated.");
  }

  function handleReopen(reason: string) {
    setStatus("In Progress");
    addEntry({ type: "reopen", author: SSO_USER.name, text: `Complaint reopened. ${reason}` });
    setShowReopen(false);
    toast.success("Complaint reopened.");
  }

  function handleClose(summary: string, awaitingCustomer: boolean) {
    setStatus("Closed");
    const suffix = awaitingCustomer ? " (Awaiting customer response)" : "";
    addEntry({ type: "status", author: SSO_USER.name, text: `Complaint closed${suffix}: ${summary}` });
    setShowClose(false);
    toast.success("Complaint closed.");
  }
  function TimelineFilterBar({ timeline, activeFilters, onFilter }: {
  timeline: TimelineEntry[];
  activeFilters: string[];
  onFilter: (fs: string[]) => void;
}) {
  const counts = useMemo(() => ({
    email: timeline.filter(e => e.type === "email").length,
    call:  timeline.filter(e => e.type === "call").length,
    note:  timeline.filter(e => e.type === "note").length,
    other: timeline.filter(e => !["note","call","email"].includes(e.type)).length,
  }), [timeline]);

  const allActive = activeFilters.length === 0;

  const toggleFilter = (key: string) => {
    if (activeFilters.includes(key)) {
      const next = activeFilters.filter(f => f !== key);
      onFilter(next);
    } else {
      onFilter([...activeFilters, key]);
    }
  };

  const typedFilters: { key: string; label: string; icon: ReactNode; count: number }[] = [
    { key: "email", label: "Emails", icon: <Icons.Mail size={11} />,          count: counts.email },
    { key: "call",  label: "Calls",  icon: <Icons.Phone size={11} />,         count: counts.call  },
    { key: "note",  label: "Notes",  icon: <Icons.MessageSquare size={11} />, count: counts.note  },
    { key: "other", label: "Other",  icon: <Icons.Activity size={11} />,      count: counts.other },
  ].filter(f => f.count > 0);

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activity &amp; Communication Timeline</h3>
      <div className="flex items-center gap-1">
        <button onClick={() => onFilter([])}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors
            ${allActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            All
          <span className={`text-[10px] ${allActive ? "text-white/80" : "text-muted-foreground/70"}`}>({timeline.length})</span>
        </button>
        {typedFilters.map(f => {
          const active = activeFilters.includes(f.key);
          return (
            <button key={f.key} onClick={() => toggleFilter(f.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors
                ${active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {f.icon}{f.label}
              <span className={`text-[10px] ${active ? "text-white/80" : "text-muted-foreground/70"}`}>({f.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


  const isClosed = status === "Closed";
  const isResolved = status === "Resolved";

  return (
    <>
      {showResolve && <ResolveModal onConfirm={handleResolve} onCancel={() => setShowResolve(false)} />}
      {showClose && <CloseModal onConfirm={handleClose} onCancel={() => setShowClose(false)} isResolved={isResolved} />}
      {showReopen && <ReopenModal onConfirm={handleReopen} onCancel={() => setShowReopen(false)} />}
      {showEmailThread && <EmailThreadModal complaintId={showEmailThread} subject={base.subject} onClose={() => setShowEmailThread(null)} />}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <button onClick={() => onNavigate("complaints")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Icons.ArrowLeft size={13} />Back to Complaints
        </button>

        <div className="flex gap-4 items-stretch">
          <Card className="p-5 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm font-bold text-primary">{base.id}</span>
                <StatusBadge status={status} />
                {isClosed
                  // && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">Locked</span>
                }
              </div>
              {!isClosed && (
                <select value={status} onChange={(e) => handleDropdownStatusChange(e.target.value as Status)} className="px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground font-medium flex-shrink-0">
                  {ALL_STATUSES.filter((s) => s !== "Pending").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
            <h2 className="text-sm font-semibold text-foreground mb-1">{base.subject}</h2>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {base.description.length > 120 && !descExpanded ? (
                  <>{base.description.slice(0, 120)}<button onClick={() => setDescExpanded(true)} className="text-primary text-sm hover:underline font-medium ml-0.5">…more</button></>
                ) : (
                  <>{base.description}{base.description.length > 120 && <button onClick={() => setDescExpanded(false)} className="text-primary text-sm hover:underline font-medium ml-1">less</button>}</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Icons.Tag size={11} />{base.category}</span>
              <span className="flex items-center gap-1.5"><Icons.Building2 size={11} />{base.dealer}</span>
              {base.vehicle && <span className="flex items-center gap-1.5"><Icons.Car size={11} />{base.vehicle}</span>}
              <span className="flex items-center gap-1.5"><Icons.Clock size={11} />Created {base.created}</span>
              <span className="flex items-center gap-1.5"><Icons.UserCheck size={11} />{base.assignedTo}</span>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
              {isClosed ? (
                <button onClick={() => setShowReopen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"><Icons.RefreshCcwDot size={12} />Reopen Complaint</button>
              ) : (
                <>
                  <button onClick={() => setAction(action === "note" ? null : "note")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "note" ? "bg-gray-100 border-gray-300 text-gray-700" : "border-border text-muted-foreground hover:bg-muted"}`}><Icons.MessageSquare size={12} />Add Note</button>
                  <button onClick={() => setAction(action === "call" ? null : "call")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "call" ? "bg-green-50 border-green-200 text-green-700" : "border-border text-muted-foreground hover:bg-muted"}`}><Icons.Phone size={12} />Record Call</button>
                  <button onClick={() => setAction(action === "email" ? null : "email")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "email" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-border text-muted-foreground hover:bg-muted"}`}><Icons.Mail size={12} />Send Email</button>
                  <div className="flex-1" />
                  {!isResolved && <button onClick={() => setShowResolve(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"><Icons.CheckCircle2 size={12} />Resolve</button>}
                  <button onClick={() => setShowClose(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"><Icons.X size={12} />Close</button>
                </>
              )}
            </div>

            {action === "note" && (
              <NotePanel key="note-panel" onSave={(html, text) => { addEntry({ type: "note", author: SSO_USER.name, text: text.slice(0, 120) + (text.length > 120 ? "…" : ""), emailHtml: html }); setAction(null); toast.success("Note saved."); }} onCancel={() => setAction(null)} />
            )}
            {(action === "email" || replyToEntry) && (
              <RichEmailEditor key={replyToEntry?.id ?? "new"} toEmail={base.customer.email} toName={base.customer.name} defaultSubject={replyToEntry?.emailSubject ? `Re: ${replyToEntry.emailSubject}` : `Re: Complaint ${base.id}`} quotedHtml={replyToEntry?.emailHtml} onSend={handleSendEmail} onCancel={() => { setAction(null); setReplyToEntry(null); }} />
            )}
            {action === "call" && (
              <CallPanel key="call-panel" callOutcome={callOutcome} setCallOutcome={setCallOutcome} callDir={callDir} setCallDir={setCallDir} onSave={(html, text) => { addEntry({ type: "call", author: SSO_USER.name, text: `${callDir} call — ${callOutcome}.${text.trim() ? " Notes: " + text.slice(0, 80) : ""}`, emailHtml: html }); setAction(null); toast.success("Call recorded."); }} onCancel={() => setAction(null)} />
            )}
          </Card>

          <Card className="p-5 w-64 flex-shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer</h3>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {base.customer.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <span className="text-xs font-semibold text-foreground">{base.customer.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Icons.Mail size={11} className="text-muted-foreground flex-shrink-0" /><span className="text-xs text-foreground truncate">{base.customer.email}</span></div>
              <div className="flex items-center gap-2"><Icons.Phone size={11} className="text-muted-foreground flex-shrink-0" /><span className="text-xs text-foreground">{base.customer.mobile}</span></div>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Activity &amp; Communication Timeline</h3>
          <TimelineList timeline={timeline} onViewEmailThread={setShowEmailThread} onReply={(entry) => { setReplyToEntry(entry); setAction("email"); }} onEdit={handleEditEntry} />
        </Card>
      </div>
    </>
  );
}
