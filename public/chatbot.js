// public/chatbot.js
(function () {
  function initializeChatbot() {
    console.log("[Chatbot] Initializing...");

    if (!window.ChatbotConfig || !window.ChatbotConfig.companyId || !window.ChatbotConfig.apiUrl) {
      console.error("[Chatbot] Config missing!");
      return;
    }

    const { companyId, apiUrl } = window.ChatbotConfig;

    // ─── Bubble (floating button) ───
    const bubble = document.createElement("div");
    bubble.innerHTML = "💬";
    bubble.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
      z-index: 10000;
      transition: all 0.3s ease;
    `;

    bubble.addEventListener("mouseenter", () => {
      bubble.style.transform = "scale(1.12)";
      bubble.style.boxShadow = "0 12px 35px rgba(99, 102, 241, 0.6)";
    });
    bubble.addEventListener("mouseleave", () => {
      bubble.style.transform = "scale(1)";
      bubble.style.boxShadow = "0 8px 25px rgba(99, 102, 241, 0.5)";
    });

    // ─── Chat Window ───
    const chatWindow = document.createElement("div");
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      max-height: 70vh;
      height: 520px;
      background: #0f172a;
      border-radius: 20px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.55);
      overflow: hidden;
      display: none;
      flex-direction: column;
      z-index: 9999;
      border: 1px solid #334155;
      animation: fadeIn 0.4s ease;
    `;

    chatWindow.innerHTML = `
      <style>
        @keyframes fadeIn { from {opacity:0; transform:scale(0.95);} to {opacity:1; transform:scale(1);} }
        @keyframes typing { 0%,100% {opacity:0.4;} 50% {opacity:1;} }
        #messages::-webkit-scrollbar { width: 6px; }
        #messages::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      </style>

      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #6366f1, #7c3aed);
        color: white;
        padding: 14px 18px;
        font-weight: 600;
        font-size: 17px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #4f46e5;
      ">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">🤖</span>
          <span>AI Assistant</span>
        </div>
        <button id="close-btn" style="
          background:none;
          border:none;
          color:white;
          font-size:26px;
          cursor:pointer;
          padding:0 8px;
          line-height:1;
        ">×</button>
      </div>

      <!-- Messages Area -->
      <div id="messages" style="
        flex:1;
        padding:18px;
        overflow-y:auto;
        background:#020617;
        display:flex;
        flex-direction:column;
      "></div>

      <!-- Typing Loader -->
      <div id="loader" style="
        display:none;
        padding:12px 18px;
        color:#a5b4fc;
        font-size:14px;
        font-style:italic;
        animation: typing 1.4s infinite;
      ">AI is thinking...</div>

      <!-- Input Area -->
      <div style="
        padding:12px 16px;
        border-top:1px solid #1e293b;
        background:#0f172a;
        display:flex;
        gap:10px;
      ">
        <input id="input" placeholder="Type your message..." style="
          flex:1;
          padding:12px 16px;
          border:1px solid #334155;
          border-radius:12px;
          background:#1e293b;
          color:#e2e8f0;
          outline:none;
          font-size:15px;
          transition:border 0.2s;
        " />
        <button id="send" style="
          padding:12px 20px;
          background:linear-gradient(135deg,#6366f1,#7c3aed);
          color:white;
          border:none;
          border-radius:12px;
          cursor:pointer;
          font-weight:600;
          min-width:60px;
          transition:all 0.2s;
        ">➤</button>
      </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(chatWindow);

    // Events
    bubble.onclick = () => {
      chatWindow.style.display = "flex";
      bubble.style.display = "none";
    };

    document.getElementById("close-btn").onclick = () => {
      chatWindow.style.display = "none";
      bubble.style.display = "flex";
    };

    const messagesDiv = document.getElementById("messages");
    const inputEl = document.getElementById("input");
    const sendBtn = document.getElementById("send");
    const loader = document.getElementById("loader");

    function addMessage(text, isUser = false) {
      const msg = document.createElement("div");
      msg.style.cssText = `
        margin-bottom: 14px;
        padding: 12px 16px;
        border-radius: 16px;
        max-width: 82%;
        background: ${isUser ? "linear-gradient(135deg, #6366f1, #7c3aed)" : "#1e293b"};
        color: white;
        align-self: ${isUser ? "flex-end" : "flex-start"};
        border-bottom-right-radius: ${isUser ? "4px" : "16px"};
        border-bottom-left-radius: ${isUser ? "16px" : "4px"};
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        animation: fadeIn 0.3s ease;
      `;
      msg.textContent = text;
      messagesDiv.appendChild(msg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
      const question = inputEl.value.trim();
      if (!question) {
        inputEl.style.borderColor = "#ef4444";
        setTimeout(() => inputEl.style.borderColor = "#334155", 1500);
        return;
      }

      addMessage(question, true);
      inputEl.value = "";
      loader.style.display = "block";
      sendBtn.disabled = true;
      sendBtn.style.opacity = "0.6";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, companyId })
        });

        const data = await response.json();
        loader.style.display = "none";

        if (data.success) {
          addMessage(data.answer || "No response received");
        } else {
          addMessage("⚠️ " + (data.error || "Something went wrong"));
        }
      } catch (err) {
        loader.style.display = "none";
        addMessage("⚠️ Network error – please check connection");
      } finally {
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
      }
    }

    sendBtn.onclick = sendMessage;
    inputEl.onkeypress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    // Welcome message
    addMessage("👋 Hello! How can I help you today?");

    console.log("[Chatbot] Ready – bubble & chatbox initialized");
  }

  // Safe initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeChatbot);
  } else {
    initializeChatbot();
  }

  // Extra safety (in case of hydration delay)
  // setTimeout(initializeChatbot, 1500);
})();