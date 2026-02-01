// public/chatbot.js
(function () {

  // 🔐 Token / Active status check
  async function checkTokenStatus(companyId) {
    try {
      const res = await fetch(
        `http://localhost:1000/api/token-status/${companyId}`
      );
      const data = await res.json();

      return data?.success && data?.active && data?.tokens > 0;
    } catch (e) {
      console.error("[Chatbot] Token status check failed");
      return false;
    }
  }

  async function initializeChatbot() {
    console.log("[Chatbot] Initializing...");

    if (
      !window.ChatbotConfig ||
      !window.ChatbotConfig.companyId ||
      !window.ChatbotConfig.apiUrl
    ) {
      console.error("[Chatbot] Config missing!");
      return;
    }

    const { companyId, apiUrl } = window.ChatbotConfig;

    // 🚨 IMPORTANT: token-status check
    const isActive = await checkTokenStatus(companyId);
    if (!isActive) {
      console.warn("[Chatbot] Company inactive or tokens exhausted");
      return; // ❌ chatbot render hi nahi hoga
    }

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
      height: 520px;
      background: #0f172a;
      border-radius: 20px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.55);
      overflow: hidden;
      display: none;
      flex-direction: column;
      z-index: 9999;
      border: 1px solid #334155;
    `;

    chatWindow.innerHTML = `
      <style>
        @keyframes fadeIn { from {opacity:0; transform:scale(0.95);} to {opacity:1;} }
        @keyframes typing { 0%,100% {opacity:0.4;} 50% {opacity:1;} }
      </style>

      <div style="background:linear-gradient(135deg,#6366f1,#7c3aed);
        color:white;padding:14px 18px;
        display:flex;justify-content:space-between;align-items:center;">
        <span>🤖 AI Assistant</span>
        <button id="close-btn" style="background:none;border:none;color:white;font-size:26px;cursor:pointer;">×</button>
      </div>

      <div id="messages" style="flex:1;padding:16px;overflow-y:auto;background:#020617;display:flex;flex-direction:column;"></div>

      <div id="loader" style="display:none;padding:10px;color:#a5b4fc;font-style:italic;">
        AI is thinking...
      </div>

      <div style="padding:12px;border-top:1px solid #1e293b;display:flex;gap:8px;">
        <input id="input" placeholder="Type your message..."
          style="flex:1;padding:10px;border-radius:10px;border:1px solid #334155;
          background:#1e293b;color:white;outline:none;" />
        <button id="send"
          style="padding:10px 16px;background:#6366f1;color:white;border:none;border-radius:10px;">
          ➤
        </button>
      </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(chatWindow);

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
        margin-bottom:10px;padding:10px 14px;border-radius:14px;
        background:${isUser ? "#6366f1" : "#1e293b"};
        color:white;align-self:${isUser ? "flex-end" : "flex-start"};
      `;
      msg.textContent = text;
      messagesDiv.appendChild(msg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
      const q = inputEl.value.trim();
      if (!q) return;

      addMessage(q, true);
      inputEl.value = "";
      loader.style.display = "block";

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, companyId })
        });

        const data = await res.json();
        loader.style.display = "none";

        if (data.success) addMessage(data.answer);
        else addMessage("⚠️ " + data.error);
      } catch {
        loader.style.display = "none";
        addMessage("⚠️ Network error");
      }
    }

    sendBtn.onclick = sendMessage;
    inputEl.onkeypress = e => {
      if (e.key === "Enter") sendMessage();
    };

    addMessage("👋 Hello! How can I help you today?");
    console.log("[Chatbot] Ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeChatbot);
  } else {
    initializeChatbot();
  }
})();
