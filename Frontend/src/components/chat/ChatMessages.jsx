import React, { useEffect, useRef, useState, useCallback, memo, Component } from "react";
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import "./ChatMessages.css";

/* ── Error boundary for entire message list ── */
class MessagesErrorBoundary extends Component {
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
        <div className="messages" role="alert">
          <div className="msg msg-ai">
            <div className="msg-bubble" style={{ color: "#ff6b6b" }}>
              Something went wrong rendering messages. Please try refreshing.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Memoized single message row ── */
const MessageItem = memo(function MessageItem({
  message,
  index,
  copiedId,
  onCopy,
  likeState,
  onLike,
  onDislike,
  onSpeak,
  onRegenerate,
  speechSupported,
}) {
  const isAI = message.type === "ai";

  return (
    <div className={`msg msg-${message.type} msg-enter`}>
      <div className="msg-role" aria-hidden="true">
        {message.type === "user" ? "You" : "AI"}
      </div>
      <div className="msg-bubble">
        {isAI ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          message.content
        )}
      </div>
      <div
        className="msg-actions"
        role="group"
        aria-label="Message actions"
      >
        {/* Copy */}
        <button
          type="button"
          id={`copy-msg-${index}`}
          className="msg-action-btn"
          aria-label={copiedId === index ? "Copied" : "Copy message"}
          onClick={() => onCopy(index, message.content)}
        >
          {copiedId === index ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="action-tooltip">Copied!</span>
            </>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>

        {isAI && (
          <>
            {/* Like */}
            <button
              type="button"
              id={`like-msg-${index}`}
              className={`msg-action-btn ${likeState === "liked" ? "like-active" : ""}`}
              aria-label="Like response"
              aria-pressed={likeState === "liked"}
              onClick={() => onLike(index)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M7 10v11" />
                <path d="M15 21H9a2 2 0 0 1-2-2v-9l5-7 1 1a2 2 0 0 1 .5 1.3V9h5a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2Z" />
              </svg>
            </button>

            {/* Dislike */}
            <button
              type="button"
              id={`dislike-msg-${index}`}
              className={`msg-action-btn ${likeState === "disliked" ? "dislike-active" : ""}`}
              aria-label="Dislike response"
              aria-pressed={likeState === "disliked"}
              onClick={() => onDislike(index)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M17 14V3" />
                <path d="M9 3h6a2 2 0 0 1 2 2v9l-5 7-1-1a2 2 0 0 1-.5-1.3V15H5a2 2 0 0 1-2-2l2-8a2 2 0 0 1 2-2Z" />
              </svg>
            </button>

            {/* Speak */}
            {speechSupported && (
              <button
                type="button"
                id={`speak-msg-${index}`}
                className="msg-action-btn"
                aria-label="Speak message"
                onClick={() => onSpeak(message.content)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M5 8v8" />
                  <path d="M8 4v16" />
                  <path d="M12 2v20" />
                  <path d="M19 5c1.5 2 1.5 12 0 14" />
                  <path d="M16 8c.8 1 1 7 0 8" />
                </svg>
              </button>
            )}

            {/* Regenerate */}
            <button
              type="button"
              id={`regen-msg-${index}`}
              className="msg-action-btn"
              aria-label="Regenerate response"
              onClick={onRegenerate}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M2 12A10 10 0 0 1 12 2c2.5 0 4.8 1 6.5 2.5L22 8" />
                <path d="M22 2v6h-6" />
                <path d="M22 12a10 10 0 0 1-10 10c-2.5 0-4.8-1-6.5-2.5L2 16" />
                <path d="M2 22v-6h6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
});

/* ── Main component ── */
const ChatMessages = ({ messages, isSending, socket, activeChatId, onRegenerate }) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [likes, setLikes] = useState({});

  /* Speech synthesis support check */
  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  /* ── Smart auto-scroll ── */
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 120;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsNearBottom(atBottom);
  }, []);

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isSending, isNearBottom]);

  /* ── Copy message handler ── */
  const handleCopy = useCallback((id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  /* ── Like / Dislike handlers ── */
  const handleLike = useCallback((id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: prev[id] === "liked" ? null : "liked",
    }));
  }, []);

  const handleDislike = useCallback((id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: prev[id] === "disliked" ? null : "disliked",
    }));
  }, []);

  /* ── Speak handler ── */
  const handleSpeak = useCallback((content) => {
    try {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(content);
      speechSynthesis.speak(utterance);
    } catch {
      /* gracefully ignore if unsupported */
    }
  }, []);

  return (
    <MessagesErrorBoundary>
      <div
        className="messages"
        ref={containerRef}
        onScroll={handleScroll}
        aria-live="polite"
      >
        {messages.map((m, index) => (
          <MessageItem
            key={index}
            message={m}
            index={index}
            copiedId={copiedId}
            onCopy={handleCopy}
            likeState={likes[index] || null}
            onLike={handleLike}
            onDislike={handleDislike}
            onSpeak={handleSpeak}
            onRegenerate={onRegenerate}
            speechSupported={speechSupported}
          />
        ))}
        {isSending && (
          <div className="msg msg-ai pending msg-enter">
            <div className="msg-role" aria-hidden="true">
              AI
            </div>
            <div className="msg-bubble typing-dots" aria-label="AI is typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </MessagesErrorBoundary>
  );
};

export default ChatMessages;