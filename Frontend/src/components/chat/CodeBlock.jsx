import React, { useState, useCallback, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const LANGUAGE_ALIASES = {
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",
  py: "Python",
  rb: "Ruby",
  rs: "Rust",
  go: "Go",
  java: "Java",
  cpp: "C++",
  c: "C",
  cs: "C#",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  powershell: "PowerShell",
  dockerfile: "Dockerfile",
  markdown: "Markdown",
  md: "Markdown",
  graphql: "GraphQL",
  lua: "Lua",
  r: "R",
  dart: "Dart",
  scala: "Scala",
  perl: "Perl",
  matlab: "MATLAB",
  makefile: "Makefile",
};

const CodeBlock = memo(function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  const lang = language || "";
  const displayName =
    LANGUAGE_ALIASES[lang.toLowerCase()] || lang.toUpperCase() || "CODE";

  return (
    <div className="code-block" role="region" aria-label={`${displayName} code block`}>
      <div className="code-block-header">
        <span className="code-block-lang">{displayName}</span>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block-body">
        <SyntaxHighlighter
          style={oneDark}
          language={lang || "text"}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "16px",
            background: "transparent",
            fontSize: "0.85rem",
            lineHeight: 1.6,
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
            },
          }}
          wrapLongLines={false}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

export default CodeBlock;
