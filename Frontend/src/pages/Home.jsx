import React, { useCallback, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import ChatMobileBar from "../components/chat/ChatMobileBar.jsx";
import ChatSidebar from "../components/chat/ChatSideBar.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatComposer from "../components/chat/ChatComposer.jsx";
import "../components/chat/ChatLayout.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ensureInitialChat,
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  addUserMessage,
  addAIMessage,
  setChats,
} from "../store/chatSlice.js";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector((state) => state.chat.chats);
  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const input = useSelector((state) => state.chat.input);
  const isSending = useSelector((state) => state.chat.isSending);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [socket, setSocket] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Step 1: Verify authentication via API call (no client-side cookie reading)
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .then(() => {
        setAuthChecked(true);
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  // Step 2: Only after auth is confirmed, fetch chats and connect Socket.IO
  useEffect(() => {
    if (!authChecked) return;

    // Fetch existing chats
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/chat`, {
        withCredentials: true,
      })
      .then((response) => {
        dispatch(setChats(response.data.chats.reverse()));
      });

    // Connect Socket.IO only after auth is verified
    const tempSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    tempSocket.on("ai-response", (messagePayload) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: messagePayload.content,
        },
      ]);
      dispatch(sendingFinished());
    });

    socketRef.current = tempSocket;
    setSocket(tempSocket);

    // Cleanup on unmount
    return () => {
      tempSocket.disconnect();
      socketRef.current = null;
    };
  }, [authChecked, dispatch]);

  const handleNewChat = async () => {
    let title = window.prompt("Enter a title for the new chat:", "");
    if (title) title = title.trim();
    if (!title) return;

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/chat`,
      { title },
      { withCredentials: true }
    );
    getMessages(response.data.chat._id);
    dispatch(startNewChat(response.data.chat));
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [
      ...messages,
      {
        type: "user",
        content: trimmed,
      },
    ];

    setMessages(newMessages);
    dispatch(setInput(""));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed,
    });
  };

  const getMessages = async (chatId) => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/chat/messages/${chatId}`,
      { withCredentials: true }
    );

    setMessages(
      response.data.messages.map((m) => ({
        type: m.role === "user" ? "user" : "ai",
        content: m.content,
      }))
    );
  };

  const handleDelete = async () => {
    await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/delete`, {
      withCredentials: true,
    });
    navigate("/register");
  };

  const handleLogout = async () => {
    await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
      withCredentials: true,
    });
    navigate("/login");
  };

  const handleRegenerate = useCallback(() => {
    if (!socket || !activeChatId || isSending) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.type === "user");
    if (!lastUserMsg) return;
    /* Remove the last AI message so a fresh response can replace it */
    setMessages((prev) => {
      const lastAiIdx = prev.map((m) => m.type).lastIndexOf("ai");
      if (lastAiIdx === -1) return prev;
      return [...prev.slice(0, lastAiIdx), ...prev.slice(lastAiIdx + 1)];
    });
    dispatch(sendingStarted());
    socket.emit("ai-message", {
      chat: activeChatId,
      content: lastUserMsg.content,
    });
  }, [socket, activeChatId, isSending, messages, dispatch]);

  // Show nothing while verifying authentication
  if (!authChecked) return null;

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onNewChat={handleNewChat}
      />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat}
        open={sidebarOpen}
      />
      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>Prompt Hub</h1>
            <p>
              Ask anything. Paste text, brainstorm ideas, or get quick
              explanations. Your chats stay in the sidebar so you can pick up
              where you left off.
            </p>
          </div>
        )}

        <div className="btn-flex">
          <button onClick={handleLogout}>Logout</button>
          <button onClick={handleDelete}>Delete Account</button>
        </div>

        <ChatMessages
          messages={messages}
          isSending={isSending}
          socket={socket}
          activeChatId={activeChatId}
          onRegenerate={handleRegenerate}
        />
        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;