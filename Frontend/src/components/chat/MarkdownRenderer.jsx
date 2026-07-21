import React, { useState, useCallback, useEffect, useRef, memo, Component } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import CodeBlock from "./CodeBlock.jsx";
import ImageLightbox from "./ImageLightbox.jsx";
import "./MarkdownRenderer.css";

/* ── Mermaid configuration ── */
let mermaidInitialized = false;
function ensureMermaidInit() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "strict",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
  });
  mermaidInitialized = true;
}

/* ── Mermaid diagram renderer ── */
let mermaidCounter = 0;
const MermaidBlock = memo(function MermaidBlock({ chart }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureMermaidInit();
    const id = `mermaid-diagram-${++mermaidCounter}`;

    (async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return <CodeBlock language="mermaid">{chart}</CodeBlock>;
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      role="img"
      aria-label="Mermaid diagram"
    />
  );
});

/* ── Error boundary ── */
class MarkdownErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <pre className="md-error-fallback">{this.props.fallbackText}</pre>
      );
    }
    return this.props.children;
  }
}

/* ── Link safety ── */
function isSafeUrl(href) {
  if (!href) return false;
  try {
    const url = new URL(href, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

/* ── Custom renderers ── */
function CustomLink({ href, children, ...props }) {
  if (!isSafeUrl(href)) {
    return <span>{children}</span>;
  }
  const isExternal =
    href && (href.startsWith("http://") || href.startsWith("https://"));
  return (
    <a
      href={href}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="md-link"
      {...props}
    >
      {children}
      {isExternal && (
        <svg
          className="md-external-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
    </a>
  );
}

function CustomImage({ src, alt }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt || ""}
        className="md-image"
        loading="lazy"
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
          }
        }}
        aria-label={alt ? `Image: ${alt}. Click to enlarge` : "Click to enlarge image"}
      />
      {lightboxOpen && (
        <ImageLightbox
          src={src}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

function CustomTable({ children }) {
  return (
    <div className="md-table-wrapper" role="region" aria-label="Data table" tabIndex={0}>
      <table className="md-table">{children}</table>
    </div>
  );
}

function CustomThead({ children }) {
  return <thead className="md-thead">{children}</thead>;
}

function CustomCode({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  /* Inline code (no className means it's inline) */
  if (!className) {
    return (
      <code className="md-inline-code" {...props}>
        {children}
      </code>
    );
  }

  /* Mermaid diagram */
  if (lang === "mermaid") {
    return <MermaidBlock chart={codeString} />;
  }

  /* Fenced code block */
  return <CodeBlock language={lang}>{codeString}</CodeBlock>;
}

/* react-markdown renders <pre><code>...</code></pre> for fenced blocks.
   We need to intercept `pre` to just pass through children so CodeBlock
   is not wrapped in a <pre> tag. */
function CustomPre({ children }) {
  return <>{children}</>;
}

/* ── Main component ── */
const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [[rehypeKatex, { strict: false, trust: false }]];

const markdownComponents = {
  code: CustomCode,
  pre: CustomPre,
  a: CustomLink,
  img: CustomImage,
  table: CustomTable,
  thead: CustomThead,
};

const MarkdownRenderer = memo(function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <MarkdownErrorBoundary fallbackText={content}>
      <div className="md-content">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </MarkdownErrorBoundary>
  );
});

export default MarkdownRenderer;
