// --- Main Lexi Object to manage the entire application ---
const LexiApp = {
  // --- STATE ---
  fabButton: null,
  chatWindow: null,
  isChatOpen: false,
  lastFabPosition: { bottom: "30px", right: "30px", top: "auto", left: "auto" },
  conversationHistory: [],
  consecutiveHintCount: 0,
  isChargingIconVisible: false, // NEW: Track if charging icon has been shown

  // --- UI CREATION ---
  createFab() {
    this.fabButton = document.createElement("button");
    this.fabButton.id = "lexi-fab";
    

    Object.assign(this.fabButton.style, {
      position: "fixed", ...this.lastFabPosition, width: "67px", height: "67px",
      background: '#F5A623', border: "none",
      borderRadius: "50%", boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      cursor: "grab", display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: "10000", transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
    });

    // Drag and Click Logic (remains the same)
    let isDragging = false, dragStartX, dragStartY, initialLeft, initialTop;
    const onMouseDown = (e) => {
      if (this.isChatOpen) { this.toggleChat(); return; }
      e.preventDefault(); isDragging = false; this.fabButton.style.cursor = 'grabbing';
      this.fabButton.style.transition = 'none'; const rect = this.fabButton.getBoundingClientRect();
      dragStartX = e.clientX; dragStartY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
      window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e) => {
      const dx = e.clientX - dragStartX; const dy = e.clientY - dragStartY;
      if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) { isDragging = true; }
      if (isDragging) {
        const newLeft = Math.max(0, Math.min(window.innerWidth - 67, initialLeft + dx));
        const newTop = Math.max(0, Math.min(window.innerHeight - 67, initialTop + dy));
        this.fabButton.style.left = `${newLeft}px`; this.fabButton.style.top = `${newTop}px`;
        this.fabButton.style.bottom = 'auto'; this.fabButton.style.right = 'auto';
      }
    };
    const onMouseUp = () => {
      this.fabButton.style.cursor = 'grab'; this.fabButton.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp);
      if (isDragging) {
        this.lastFabPosition = { left: this.fabButton.style.left, top: this.fabButton.style.top, bottom: 'auto', right: 'auto' };
      } else {
        this.toggleChat();
      }
    };
    this.fabButton.addEventListener('mousedown', onMouseDown);
    document.body.appendChild(this.fabButton);
  },

  createChatWindow() {
    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'lexi-chat-window';
    
    const onboardingView = document.createElement('div'); onboardingView.className = 'onboarding-view';
    const chatView = document.createElement('div'); chatView.className = 'chat-view';

    onboardingView.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="font-size: 48px;">🦉</div>
        <h2 style="font-weight: 600; margin: 10px 0;">Welcome to Lexi!</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">I'm your personal coding buddy. To make things friendly, what should I call you?</p>
        <input type="text" id="lexi-name-input" placeholder="Enter your name..." style="width: 80%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; margin-top: 20px; font-size: 14px;">
        <button id="lexi-onboard-button" style="width: 85%; padding: 12px; border-radius: 8px; border: none; background: #F5A623; color: white; font-weight: 600; margin-top: 10px; cursor: pointer;">Let's Go!</button>
      </div>
    `;
    
    const header = document.createElement('div'); header.className = 'lexi-header'; header.innerHTML = '<strong>Lexi</strong>';
    const messageHistory = document.createElement("div"); messageHistory.className = "message-history";
    const quickRepliesContainer = document.createElement('div'); quickRepliesContainer.className = 'quick-replies';
    const inputForm = document.createElement("form");
    const inputField = document.createElement("input"); inputField.placeholder = "Or type a message...";
    const sendButton = document.createElement("button"); sendButton.innerText = "Send";
    chatView.appendChild(header); chatView.appendChild(messageHistory);
    chatView.appendChild(quickRepliesContainer); chatView.appendChild(inputForm);
    Object.assign(chatView.style, { display: 'none', flexDirection: 'column', height: '100%' });

    Object.assign(this.chatWindow.style, {
      position: "fixed", bottom: "20px", right: "20px", width: "350px", height: "550px",
      backgroundColor: "#fdf6e3", color: "#333", border: "1px solid #e0e0e0",
      borderRadius: "16px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      zIndex: "9999", fontFamily: '"Inter", sans-serif',
      transform: "translateY(20px) scale(0.95)", opacity: "0", visibility: "hidden",
      transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    });
    Object.assign(header.style, { position: 'relative', padding: '20px 16px 20px 100px', backgroundColor: '#f7f0e0', borderBottom: '1px solid #e0e0e0', fontSize: '16px' });
    Object.assign(messageHistory.style, { flexGrow: "1", padding: "16px", overflowY: "auto" });
    Object.assign(quickRepliesContainer.style, { padding: "10px", display: "flex", flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #e0e0e0' });
    Object.assign(inputForm.style, { display: "flex", gap: "10px", padding: "10px", borderTop: '1px solid #e0e0e0' });
    Object.assign(inputField.style, { flexGrow: "1", border: "1px solid #ccc", borderRadius: "8px", padding: "10px", backgroundColor: "#fff", color: "#333", fontSize: "14px" });
    Object.assign(sendButton.style, { border: "none", background: '#F5A623', color: "white", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontWeight: "600" });

    inputForm.addEventListener("submit", (e) => { e.preventDefault(); this.handleUserMessage(inputField.value); inputField.value = ''; });
    onboardingView.querySelector('#lexi-onboard-button').addEventListener('click', () => {
        const nameInput = onboardingView.querySelector('#lexi-name-input');
        if (nameInput.value) {
            localStorage.setItem('lexiUserName', nameInput.value);
            onboardingView.style.display = 'none';
            chatView.style.display = 'flex';
            this.startConversation();
        }
    });

    this.chatWindow.appendChild(onboardingView);
    this.chatWindow.appendChild(chatView);
    document.body.appendChild(this.chatWindow);
  },
  
  updateQuickReplies(state = 'initial') {
    if (!this.chatWindow) return;
    const container = this.chatWindow.querySelector('.quick-replies');
    container.innerHTML = '';
    let replies = [];
    if (state === 'initial') {
        replies = [ { text: "First hint?", type: 'focus' }, { text: "Programmer joke?", type: 'fun' }, { text: "Roast my code", type: 'fun' }];
    } else if (state === 'after_hint') {
        replies = [ { text: "Another hint", type: 'focus' }, { text: "Explain that.", type: 'focus' }, { text: "Check complexity", type: 'focus' }, { text: "Any bugs?", type: 'focus' }];
    }
    replies.forEach(({ text, type }) => {
        const button = document.createElement('button');
        button.innerText = text;
        Object.assign(button.style, { background: 'transparent', border: '1px solid #F5A623', color: '#F5A623', padding: '8px 12px', borderRadius: '16px', cursor: 'pointer' });
        button.addEventListener('click', () => { this.handleUserMessage(text, type); });
        container.appendChild(button);
    });
  },

  async updateFabMood() {
    if (!this.fabButton) return;
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    let mood = 'default';
    if (hour >= 6 && hour < 8) mood = 'workout';
    else if (hour >= 8 && hour < 12) mood = 'coffee';
    else if (hour >= 12 && hour < 18) mood = 'standard';
    else if (hour >= 18 && hour < 22) mood = 'headphones';
    else mood = 'sleeping';
    if (day === 1 && hour >= 8 && hour < 12) { mood = 'monday-morning'; }
    try {
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        if (battery.level <= 0.2 && !battery.charging) { mood = 'low-power'; }
        else if (battery.charging) {
            if (!this.isChargingIconVisible) { mood = 'charging'; this.isChargingIconVisible = true; }
        } else { this.isChargingIconVisible = false; }
      }
    } catch (error) { console.log("Could not access battery status."); }
    
    // --- UPDATED ICON PATHS ---
    const iconMap = {
      'default': 'icon/standard.png', 
      'workout': 'icon/workout.png', 
      'coffee': 'icon/coffee.png',
      'standard': 'icon/standard.png', 
      'headphones': 'icon/headphones.png', 
      'sleeping': 'icon/sleeping.png',
      'monday-morning': 'icon/mondaymor.jpg', 
      'low-power': 'icon/battery-low.png', 
      'charging': 'icon/charging.png',
      'tgif': 'icon/side-eye.png',
    };
    const iconFilename = iconMap[mood] || iconMap['default'];
    const iconUrl = chrome.runtime.getURL(iconFilename);
    this.fabButton.style.backgroundImage = `url(${iconUrl})`;
  },

  toggleChat() { this.isChatOpen = !this.isChatOpen; this.isChatOpen ? this.openChat() : this.closeChat(); },
  
  openChat() {
    if (!this.chatWindow) this.createChatWindow();
    const onboardingView = this.chatWindow.querySelector('.onboarding-view');
    const chatView = this.chatWindow.querySelector('.chat-view');
    if (localStorage.getItem('lexiUserName')) {
      onboardingView.style.display = 'none'; chatView.style.display = 'flex';
      if (this.conversationHistory.length === 0) { this.startConversation(); }
    } else {
      onboardingView.style.display = 'flex'; chatView.style.display = 'none';
    }
    const header = this.chatWindow.querySelector('.lexi-header');
    header.appendChild(this.fabButton);
    Object.assign(this.fabButton.style, { position: 'absolute', top: '-22px', left: '15px', width: '75px', height: '75px', transform: 'rotate(360deg) scale(1)', cursor: 'pointer' });
    Object.assign(this.chatWindow.style, { transform: "translateY(0) scale(1)", opacity: "1", visibility: "visible" });
  },

  closeChat() {
    document.body.appendChild(this.fabButton);
    Object.assign(this.fabButton.style, { position: "fixed", ...this.lastFabPosition, width: "67px", height: "67px", transform: "rotate(0deg) scale(1)", cursor: 'grab' });
    Object.assign(this.chatWindow.style, { transform: "translateY(20px) scale(0.95)", opacity: "0" });
    setTimeout(() => { if (!this.isChatOpen) this.chatWindow.style.visibility = "hidden"; }, 400);
  },

  addMessageToChat(sender, text) {
    if (!this.chatWindow) return;
    const messageHistory = this.chatWindow.querySelector(".message-history");
    const messageDiv = document.createElement("div");
    if (sender === "Lexi") { messageDiv.innerHTML = `<strong>Lexi:</strong> ${text}`; }
    else { messageDiv.innerHTML = `<strong>You:</strong> ${text}`; messageDiv.style.color = "#555"; }
    messageDiv.style.marginBottom = "12px"; messageDiv.style.lineHeight = "1.6";
    messageHistory.appendChild(messageDiv);
    messageHistory.scrollTop = messageHistory.scrollHeight;
  },

  handleUserMessage(messageText, type = "focus") {
    if (!messageText) return;
    this.addMessageToChat("You", messageText);
    const isHintRequest = messageText.toLowerCase().includes("hint");
    if (isHintRequest) { this.consecutiveHintCount++; }
    else { this.consecutiveHintCount = 0; }
    this.callLexiApi(messageText, type);
  },

  async callLexiApi(userMessage, type) {
    if (this.consecutiveHintCount > 2) {
      this.addMessageToChat("Lexi", "Hoot! I've given you a couple of hints already. Give it a try on your own for a bit. You've got this!");
      this.consecutiveHintCount = 0;
      return;
    }
    const userCode = document.querySelector(".view-lines.monaco-mouse-cursor-text")?.innerText || "The user has not written any code yet.";
    const codeContext = `(My current code is:\n\`\`\`\n${userCode}\n\`\`\`)`;
    const fullUserMessage = `${userMessage}\n${codeContext}`;
    this.conversationHistory.push({ role: "user", parts: [{ text: fullUserMessage }] });

    const YOUR_SERVER_URL = "http://localhost:3000/api/getHint";

    let systemPrompt;
    if (type === "fun") {
      systemPrompt = `You are Lexi, a wise, calm and sarcastic coding tutor who is an owl and is very ironical when in fun mode. The user has made a fun request. Your goal is to be as witty and pun-filled as possible. If asked for a joke, tell a joke. If asked to roast code, be mercilessly witty, even if the code is empty. Challenge user by roasting them if they are being silly. Reply should be short, crispy and to the point not in big paragraphs`;
    } else {
      systemPrompt = `You are Lexi, a highly intelligent and helpful coding tutor who is an owl. Your primary goal is to provide clear, concise, and accurate technical hints based on the user's code.But you will have to do it like you will give the hints one by one, Provide a very short and basic hint only for brute-force solution at first, little more detail but still lot less than complete solution then more hint like that. Nudge the user in the right direction without giving away the solution. Challenge user to solve. Deny telling hint if user asks just after 2 consecutive hints. You have a serious personality with a little touch of sarcasm, you only show it with a small pun or irony at the end of your very helpful and serious response. But its not necessary to always reply with some sarcasm, at times you can be very serious and strict if user makes silly or nonsense mistakes. Try to reply in short/crisp and not too big paragraphs.`;
    }

    const requestBody = { history: this.conversationHistory, systemPrompt: systemPrompt };

    try {
      const response = await fetch(YOUR_SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data = await response.json();
      const hint = data.hint;
      this.addMessageToChat("Lexi", hint);
      this.conversationHistory.push({ role: "model", parts: [{ text: hint }] });
      this.updateQuickReplies("after_hint");
    } catch (error) {
      console.error("Error calling your server:", error);
      this.addMessageToChat("Lexi", "Hoot! I couldn't connect to my brain (the server). Is it running?");
    }
  },

  startConversation() {
    const messageHistory = this.chatWindow.querySelector(".message-history");
    messageHistory.innerHTML = "";
    this.conversationHistory = [];
    const problemTitle = document.querySelector(".text-title-large a")?.textContent || "the current problem";
    const userName = localStorage.getItem("lexiUserName");
    const initialContext = `I'm starting a new LeetCode session. My name is ${userName} and the problem is "${problemTitle}".`;
    this.conversationHistory.push({ role: "user", parts: [{ text: initialContext }] });
    this.addMessageToChat("Lexi", "Alright, I'm loaded up. Ready when you are.");
    this.updateQuickReplies("initial");
  },

  init() {
    this.createFab();
    this.updateFabMood();
    setInterval(() => this.updateFabMood(), 60000);
  },
};

// --- Run the app ---
setTimeout(() => LexiApp.init(), 1000);
