import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubLight } from "@uiw/codemirror-theme-github";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import {
  Play,
  Copy,
  RotateCcw,
  Trash2,
  Check,
  Loader2,
  Clock,
  Cpu,
  CircleAlert,
  CircleCheck,
  Settings,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";

const DEFAULT_CODE = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // // Uncomment below to use Scanner input
        // Scanner sc = new Scanner(System.in);
        // String str = sc.next();
        System.out.println("Welcome to Java Playground!");
    }
}
`;

type RunResult = {
  output?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
  message?: string;
  compile_output?: string;
  data?: {
    output?: string;
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    time?: string;
    memory?: string | number;
    codeStatus?: { id?: number; description?: string };
  };
  time?: string;
  memory?: string | number;
};

function extractOutput(r: RunResult) {
  const d = r.data ?? (r as any);
  const stdout = d.stdout ?? d.output ?? "";
  const stderr = d.stderr ?? "";
  const compile = d.compile_output ?? "";
  const msg = d.message ?? "";
  const err = d.error ?? (r as any).error ?? "";
  const status: string | undefined = d.codeStatus?.description;
  const ok = !stderr && !err && !compile && (!status || status === "Accepted");

  const parts: string[] = [];
  if (stdout) parts.push(stdout);
  if (!ok) {
    if (compile) parts.push(`Compilation Error:\n${compile}`);
    if (err) parts.push(err);
    if (stderr) parts.push(`Runtime Error:\n${stderr}`);
    if (msg && !compile && !stderr && !err) parts.push(msg);
    if (status && status !== "Accepted" && !parts.some((p) => p.includes(status))) {
      parts.unshift(`Status: ${status}`);
    }
  }

  return {
    text: parts.join("\n\n").trim(),
    ok,
    time: d.time,
    memory: d.memory != null ? String(d.memory) : undefined,
    status,
  };
}

const FONTS = [
  { label: "JetBrains Mono", value: "'JetBrains Mono', ui-monospace, monospace" },
  { label: "Fira Code", value: "'Fira Code', ui-monospace, monospace" },
  { label: "Menlo", value: "Menlo, ui-monospace, monospace" },
  { label: "Consolas", value: "Consolas, ui-monospace, monospace" },
  { label: "System Mono", value: "ui-monospace, SFMono-Regular, monospace" },
];

const SIZES = [12, 13, 14, 15, 16, 18, 20];
const TABS = [2, 4, 8];

export default function JavaEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [meta, setMeta] = useState<{ time?: string; memory?: string; status?: string }>({});
  const [copied, setCopied] = useState(false);
  const [copiedOut, setCopiedOut] = useState(false);

  const [dark, setDark] = useState(true);
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const run = useCallback(async () => {
    setStatus("running");
    setOutput("");
    setMeta({});
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, stdin }),
      });
      const data: RunResult = await res.json();
      const { text, ok, time, memory, status: s } = extractOutput(data);
      setOutput(text || (ok ? "(no output)" : "Execution failed with no details returned"));
      setMeta({ time, memory, status: s });
      setStatus(ok ? "success" : "error");
    } catch (e) {
      setOutput(`Network Error:\n${(e as Error).message}`);
      setStatus("error");
    }
  }, [code, stdin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const copyOut = async () => {
    await navigator.clipboard.writeText(output);
    setCopiedOut(true);
    setTimeout(() => setCopiedOut(false), 1500);
  };
  const reset = () => setCode(DEFAULT_CODE);

  const editorBg = dark ? "#0a0a0a" : "#ffffff";

  const extensions = useMemo(
    () => [
      java(),
      EditorState.tabSize.of(tabSize),
      indentUnit.of(" ".repeat(tabSize)),
      keymap.of([indentWithTab]),
      ...(wordWrap ? [EditorView.lineWrapping] : []),
      EditorView.theme({
        "&": {
          fontSize: `${fontSize}px`,
          height: "100%",
          backgroundColor: editorBg,
        },
        ".cm-scroller": { fontFamily: `${fontFamily} !important`, backgroundColor: editorBg },
        ".cm-content": { fontFamily: `${fontFamily} !important`, caretColor: dark ? "#fff" : "#000" },
        ".cm-gutters": {
          backgroundColor: editorBg,
          border: "none",
          color: dark ? "#4b5363" : "#94a3b8",
          fontFamily: `${fontFamily} !important`,
        },
        ".cm-activeLineGutter, .cm-activeLine": {
          backgroundColor: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)",
        },
        ".cm-focused": { outline: "none" },
      }),
    ],
    [fontFamily, fontSize, dark, wordWrap, editorBg, tabSize],
  );

  // Theme-aware classes
  const bg = dark ? "bg-black" : "bg-slate-50";
  const panel = dark ? "bg-[#0a0a0a]" : "bg-white";
  const panel2 = dark ? "bg-[#0a0a0a]" : "bg-white";
  const border = dark ? "border-white/[0.06]" : "border-slate-200";
  const textMain = dark ? "text-slate-100" : "text-slate-900";
  const textMuted = dark ? "text-slate-400" : "text-slate-500";
  const textSubtle = dark ? "text-slate-500" : "text-slate-400";
  const hover = dark ? "hover:bg-white/5" : "hover:bg-slate-100";
  const editorTheme = dark ? vscodeDark : githubLight;
  const inputBg = dark ? "bg-black" : "bg-white";

  return (
    <div className={`flex h-dvh flex-col ${bg} ${textMain} transition-colors`}>
      {/* Header */}
      <header
        className={`relative flex flex-shrink-0 items-center justify-between gap-3 border-b ${border} ${dark ? "bg-black/80" : "bg-white/80"} px-3 py-2 backdrop-blur sm:px-5`}
      >
        {/* Left: logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30">
            <Coffee className="h-4 w-4 text-blue-300 drop-shadow" strokeWidth={2.5} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-black/80" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Java Playground
            </h1>
            <span className={`text-[10px] font-medium ${textSubtle}`}>Compile · Run · Share</span>
          </div>
        </div>

        {/* Center: Run button — glassmorphism */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={run}
            disabled={status === "running"}
            className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-300 disabled:opacity-60
              ${dark
                ? "bg-white/[0.08] text-white ring-1 ring-white/20 shadow-[0_8px_32px_rgba(59,130,246,0.35)] hover:bg-white/[0.14] hover:ring-white/30"
                : "bg-white/40 text-slate-900 ring-1 ring-slate-900/10 shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:bg-white/60"}
            `}
          >
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/30 via-cyan-400/10 to-transparent opacity-80" />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            {status === "running" ? (
              <Loader2 className="relative h-4 w-4 animate-spin" />
            ) : (
              <Play className="relative h-4 w-4 fill-current" />
            )}
            <span className="relative">{status === "running" ? "Running…" : "Run Code"}</span>
            <span className={`relative ml-1 hidden rounded border px-1.5 py-0.5 text-[10px] font-normal opacity-80 md:inline ${dark ? "border-white/20" : "border-slate-900/15"}`}>
              Ctrl+↵
            </span>
          </button>
        </div>

        {/* Right: theme switcher + settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDark((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-md ${hover} ${textMuted}`}
            aria-label="Toggle theme"
            title={dark ? "Switch to light" : "Switch to dark"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className={`flex h-9 w-9 items-center justify-center rounded-md ${hover} ${textMuted}`}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            {settingsOpen && (
              <div
                className={`absolute right-0 top-11 z-50 w-72 rounded-lg border ${border} ${panel} p-4 shadow-2xl`}
              >
                <div className={`mb-3 text-[11px] font-semibold uppercase tracking-wider ${textSubtle}`}>
                  Editor Settings
                </div>

                <label className={`mb-1.5 block text-xs ${textMuted}`}>Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={`mb-3 w-full rounded-md border ${border} ${inputBg} px-2 py-1.5 text-sm ${textMain} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <label className={`mb-1.5 block text-xs ${textMuted}`}>Font Size</label>
                <div className="mb-3 flex flex-wrap gap-1">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`min-w-[32px] rounded-md px-2 py-1 text-xs transition ${
                        fontSize === s ? "bg-blue-600 text-white" : `${textMuted} ${hover}`
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <label className={`mb-1.5 block text-xs ${textMuted}`}>Tab Size</label>
                <div className="mb-3 flex gap-1">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTabSize(t)}
                      className={`min-w-[32px] rounded-md px-2 py-1 text-xs transition ${
                        tabSize === t ? "bg-blue-600 text-white" : `${textMuted} ${hover}`
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <label className={`mb-1.5 block text-xs ${textMuted}`}>Theme</label>
                <div className="mb-3 flex gap-1">
                  <button
                    onClick={() => setDark(true)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs transition ${
                      dark ? "bg-blue-600 text-white" : `${textMuted} ${hover}`
                    }`}
                  >
                    <Moon className="mr-1 inline h-3 w-3" /> Dark
                  </button>
                  <button
                    onClick={() => setDark(false)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs transition ${
                      !dark ? "bg-blue-600 text-white" : `${textMuted} ${hover}`
                    }`}
                  >
                    <Sun className="mr-1 inline h-3 w-3" /> Light
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center justify-between text-xs">
                    <span className={textMuted}>Word Wrap</span>
                    <input
                      type="checkbox"
                      checked={wordWrap}
                      onChange={(e) => setWordWrap(e.target.checked)}
                      className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between text-xs">
                    <span className={textMuted}>Line Numbers</span>
                    <input
                      type="checkbox"
                      checked={lineNumbers}
                      onChange={(e) => setLineNumbers(e.target.checked)}
                      className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[1.6fr_1fr]">
        {/* Editor */}
        <section
          className={`flex min-h-0 flex-col overflow-hidden rounded-xl border ${border} ${panel}`}
        >
          <div className={`flex items-center justify-between border-b ${border} px-3 py-2`}>
            <div className={`border-b-2 border-blue-500 px-2 pb-1 text-sm font-medium ${textMain}`}>
              Main.java
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={copyCode}
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${textMuted} ${hover}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={reset}
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${textMuted} ${hover}`}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto" style={{ backgroundColor: editorBg }}>
            <CodeMirror
              value={code}
              onChange={setCode}
              theme={editorTheme}
              extensions={extensions}
              basicSetup={{
                lineNumbers,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                tabSize,
              }}
              height="100%"
              style={{ height: "100%", backgroundColor: editorBg }}
            />
          </div>

          <div
            className={`flex flex-shrink-0 items-center gap-4 border-t ${border} px-3 py-1.5 text-[11px] ${textSubtle}`}
          >
            <span>Spaces: {tabSize}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Java</span>
          </div>
        </section>

        {/* Right side */}
        <section className="flex min-h-0 flex-col gap-3">
          {/* Output */}
          <div
            className={`flex min-h-0 flex-[1.4] flex-col overflow-hidden rounded-xl border ${border} ${panel2}`}
          >
            <div className={`flex items-center justify-between border-b ${border} px-3 py-2`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === "error"
                      ? "bg-rose-500"
                      : status === "running"
                        ? "animate-pulse bg-amber-400"
                        : status === "success"
                          ? "bg-emerald-500"
                          : dark
                            ? "bg-slate-600"
                            : "bg-slate-300"
                  }`}
                />
                Output
                {status === "error" && (
                  <span className="ml-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                    {meta.status || "Failed"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setOutput("");
                    setStatus("idle");
                    setMeta({});
                  }}
                  className={`rounded-md p-1.5 ${textMuted} ${hover}`}
                  aria-label="Clear output"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={copyOut}
                  className={`rounded-md p-1.5 ${textMuted} ${hover}`}
                  aria-label="Copy output"
                >
                  {copiedOut ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <pre
              className={`min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 text-sm ${
                status === "error" ? "text-rose-300" : textMain
              }`}
              style={{ fontFamily, fontSize: `${fontSize}px` }}
            >
              {output || (
                <span className={textSubtle}>Run your code to see the output…</span>
              )}
            </pre>

            {status !== "idle" && status !== "running" && (
              <div
                className={`flex flex-shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-t ${border} px-3 py-2 text-xs`}
              >
                {status === "success" ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <CircleCheck className="h-3.5 w-3.5" /> Execution Successful
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-rose-400">
                    <CircleAlert className="h-3.5 w-3.5" />
                    {meta.status ? `Execution Failed · ${meta.status}` : "Execution Failed"}
                  </span>
                )}
                {meta.time && (
                  <span className={`inline-flex items-center gap-1 ${textMuted}`}>
                    <Clock className="h-3.5 w-3.5" /> Time:{" "}
                    <span className={textMain}>{meta.time}s</span>
                  </span>
                )}
                {meta.memory && (
                  <span className={`inline-flex items-center gap-1 ${textMuted}`}>
                    <Cpu className="h-3.5 w-3.5" /> Memory:{" "}
                    <span className={textMain}>{meta.memory} KB</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border ${border} ${panel2}`}
          >
            <div
              className={`flex items-center justify-between border-b ${border} px-3 py-2 text-sm font-medium`}
            >
              Input
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input (stdin) here…"
              className={`min-h-0 flex-1 resize-none bg-transparent p-3 ${textMain} placeholder:${textSubtle} focus:outline-none`}
              style={{ fontFamily, fontSize: `${fontSize}px` }}
              spellCheck={false}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`flex-shrink-0 border-t ${border} ${dark ? "bg-black/80" : "bg-white/80"} px-4 py-2.5 text-center text-[11px] ${textSubtle}`}
      >
        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-4">
          <span>&copy; {new Date().getFullYear()} Java Playground. All rights reserved.</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/geetansh810/"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold hover:underline ${textMain} text-blue-400`}
            >
              Geetansh Agrawal
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
