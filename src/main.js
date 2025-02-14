// =========================
// Cấu hình chung
// =========================

// Quản lý trạng thái ứng dụng
const state = {
  currentScreen: 'screen1', // 'screen1', 'screen2', 'screen3'
  question: '',
  noCount: 0, // Số lần nhấn nút "No"
  currentPaletteIndex: 0, // theo dõi bảng màu hiện tại cho gradient nền
  autoConfettiInterval: null // lưu interval của auto confetti ở màn 3
};

// Bộ màu cố định: #5E1263, #C88AC3, #BD4E73, #9D152D, #670100  
const palettes = [
  ['#5E1263', '#C88AC3'],
  ['#C88AC3', '#BD4E73'],
  ['#BD4E73', '#9D152D'],
  ['#9D152D', '#670100'],
  ['#670100', '#5E1263']
];

// =========================
// Nhạc nền (Background Music)
// =========================
const backgroundMusic = new Audio('/assets/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
backgroundMusic.play().then(() => {
  console.log('Background music is playing...');
}).catch((err) => {
  console.error('Autoplay failed:', err);
});

// =========================
// Các âm thanh khác
// =========================
const clickSound = new Audio('/assets/click.mp3');
clickSound.volume = 0.5;

const congratsSound = new Audio('/assets/congrats.mp3');
congratsSound.volume = 0.7;

// =========================
// Hàm tiện ích
// =========================

// Trả về số nguyên ngẫu nhiên trong khoảng [min, max]
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Trả về 1 màu ngẫu nhiên từ bộ màu cố định
function getRandomColor() {
  const colors = ['#5E1263', '#C88AC3', '#BD4E73', '#9D152D', '#670100'];
  return colors[getRandomInt(0, colors.length - 1)];
}

/* --- Base64 Encode/Decode --- */
// Mã hóa/giải mã Unicode bằng Base64
function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    console.error("Base64 decode failed:", e);
    return "";
  }
}

/* --- Xử lý URL Parameter --- 
   Nếu URL có parameter "q", giải mã và set câu hỏi từ đó, chuyển sang màn 2.
*/
function checkURLParam() {
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  if (qParam && qParam.trim() !== "") {
    state.question = decodeBase64(qParam);
    state.currentScreen = 'screen2';
  } else {
    state.currentScreen = 'screen1';
  }
}

// =========================
// Lưu trữ câu hỏi vào localStorage (Ver3)
// =========================

const STORAGE_KEY = 'generatedQuestions';

function getSavedQuestions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveQuestion(question) {
  let qs = getSavedQuestions();
  // Thêm mới vào đầu mảng (mới ở trên)
  qs.unshift(question);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
}

function deleteQuestion(index) {
  let qs = getSavedQuestions();
  qs.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
}

function clearQuestions() {
  localStorage.removeItem(STORAGE_KEY);
}

// =========================
// Toast Notification (hiển thị ở giữa bên trên, chữ căn giữa)
// =========================
function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '3000';
  toast.style.fontSize = '1em';
  toast.style.textAlign = 'center';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, duration);
}

// =========================
// Các hiệu ứng & UI
// =========================

// Thay đổi gradient nền khi click ngoài #app (và không ở màn 3)
function changeBackgroundGradient() {
  let newIndex;
  do {
    newIndex = getRandomInt(0, palettes.length - 1);
  } while(newIndex === state.currentPaletteIndex);
  
  state.currentPaletteIndex = newIndex;
  const [color1, color2] = palettes[newIndex];
  document.body.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
}

// Hiệu ứng confetti
function launchConfetti(x, y) {
  const confettiCount = 30;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    
    const dx = (Math.random() - 0.5) * 500 + 'px';
    const dy = Math.random() * 500 + 'px';
    const rot = (Math.random() * 720 - 360) + 'deg';
    confetti.style.setProperty('--dx', dx);
    confetti.style.setProperty('--dy', dy);
    confetti.style.setProperty('--rot', rot);
    confetti.style.backgroundColor = getRandomColor();
    
    document.body.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}

// Hàm render tổng để chuyển đổi màn hình
function render() {
  if (state.autoConfettiInterval) {
    clearInterval(state.autoConfettiInterval);
    state.autoConfettiInterval = null;
  }
  
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.currentScreen === 'screen1') {
    renderScreen1(app);
  } else if (state.currentScreen === 'screen2') {
    backgroundMusic.play().catch(() => {});
    renderScreen2(app);
  } else if (state.currentScreen === 'screen3') {
    renderScreen3(app);
  }
}

// ----------------- MÀN 1: Nhập câu hỏi & Danh sách câu hỏi đã lưu -----------------
function renderScreen1(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in';

  // Phần nhập câu hỏi
  const inputSection = document.createElement('div');
  inputSection.style.marginBottom = '20px';

  const desc = document.createElement('p');
  desc.textContent = 'Nhập câu hỏi dạng Yes/No questition.';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ví dụ: Bạn có yêu tôi không?';

  // Nút "Generate" với màu nền #9D152D
  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate';
  generateBtn.classList.add('submit-btn');
  generateBtn.style.backgroundColor = '#9D152D';
  generateBtn.addEventListener('click', () => {
    const questionValue = input.value.trim() || 'Bạn có yêu tôi không?';
    state.question = questionValue;
    const encoded = encodeBase64(questionValue);
    const newURL = `${window.location.origin}${window.location.pathname}?q=${encoded}`;
    window.history.pushState(null, '', `?q=${encoded}`);
    saveQuestion(questionValue);
    navigator.clipboard.writeText(newURL).then(() => {
      showToast('Link generated and copied to clipboard!');
    }).catch(() => {
      showToast('Link generated, but failed to copy.');
    });
    updateSavedQuestionsList(listContainer);
    input.value = '';
  });

  inputSection.appendChild(desc);
  inputSection.appendChild(input);
  inputSection.appendChild(generateBtn);
  wrapper.appendChild(inputSection);

  // Phần danh sách câu hỏi đã lưu
  const listContainer = document.createElement('div');
  listContainer.style.marginTop = '20px';
  listContainer.style.display = 'flex';
  listContainer.style.flexDirection = 'column';
  listContainer.style.gap = '10px';
  updateSavedQuestionsList(listContainer);
  wrapper.appendChild(listContainer);

  // Nút "Clear" để xóa toàn bộ câu hỏi đã lưu, màu nền #5E1263
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.style.marginTop = '10px';
  clearBtn.style.backgroundColor = '#5E1263';
  clearBtn.addEventListener('click', () => {
    clearQuestions();
    updateSavedQuestionsList(listContainer);
    showToast('All questions cleared!');
  });
  wrapper.appendChild(clearBtn);

  container.appendChild(wrapper);
}

// Hàm cập nhật danh sách câu hỏi đã lưu
function updateSavedQuestionsList(container) {
  container.innerHTML = '';
  const qs = getSavedQuestions();
  if (qs.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'Chưa có câu hỏi nào được lưu.';
    emptyMsg.style.fontStyle = 'italic';
    container.appendChild(emptyMsg);
    return;
  }
  qs.forEach((q, index) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.padding = '5px 10px';
    row.style.border = '1px solid #ccc';
    row.style.borderRadius = '5px';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = q;
    textSpan.style.flex = '1';
    textSpan.style.marginRight = '10px';
    textSpan.style.textAlign = 'left';
    
    // Nút "Copy" với màu nền #C88AC3
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.style.marginRight = '5px';
    copyBtn.style.backgroundColor = '#C88AC3';
    copyBtn.addEventListener('click', () => {
      const encoded = encodeBase64(q);
      const link = `${window.location.origin}${window.location.pathname}?q=${encoded}`;
      navigator.clipboard.writeText(link).then(() => {
        showToast('Link copied!');
      }).catch(() => {
        showToast('Failed to copy link.');
      });
    });
    
    // Nút "Xóa" với màu nền #9D152D
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Xóa';
    deleteBtn.style.backgroundColor = '#9D152D';
    deleteBtn.addEventListener('click', () => {
      deleteQuestion(index);
      updateSavedQuestionsList(container);
      showToast('Question deleted!');
    });
    
    row.appendChild(textSpan);
    row.appendChild(copyBtn);
    row.appendChild(deleteBtn);
    
    container.appendChild(row);
  });
}

// ----------------- MÀN 2: Câu hỏi Yes/No -----------------
function renderScreen2(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in';

  const questionEl = document.createElement('h2');
  questionEl.textContent = state.question;
  questionEl.style.textAlign = 'center';
  wrapper.appendChild(questionEl);
  
  // Container cho 2 nút Yes và No
  const btnContainer = document.createElement('div');
  btnContainer.className = 'btn-container';

  const yesBtn = document.createElement('button');
  yesBtn.textContent = 'Yes';
  yesBtn.classList.add('yes-btn');
  yesBtn.style.backgroundColor = '#BD4E73';

  const noBtn = document.createElement('button');
  noBtn.textContent = 'No';
  noBtn.classList.add('no-btn');
  noBtn.style.backgroundColor = '#670100';

  function updateButtonSizes() {
    if (state.noCount < 5) {
      const scaleYes = 1 + state.noCount * 0.2;
      const scaleNo = 1 - state.noCount * 0.1;
      yesBtn.style.transform = `scale(${scaleYes})`;
      noBtn.style.transform = `scale(${scaleNo})`;
    } else {
      yesBtn.style.position = 'fixed';
      yesBtn.style.top = '0';
      yesBtn.style.width = '100vw';
      yesBtn.style.fontSize = '4em';
      yesBtn.style.zIndex = '1000';
      yesBtn.style.display = 'flex';
      yesBtn.style.alignItems = 'center';
      yesBtn.style.justifyContent = 'center';
      yesBtn.style.boxSizing = 'border-box';
      yesBtn.textContent = 'Yes';
      noBtn.style.display = 'none';
    }
  }

  yesBtn.addEventListener('click', () => {
    state.currentScreen = 'screen3';
    congratsSound.currentTime = 0;
    congratsSound.play();
    render();
  });

  noBtn.addEventListener('click', () => {
    if (state.noCount < 5) {
      state.noCount += 1;
      updateButtonSizes();
    }
  });

  btnContainer.appendChild(yesBtn);
  btnContainer.appendChild(noBtn);
  wrapper.appendChild(btnContainer);
  container.appendChild(wrapper);
}

// ----------------- MÀN 3: Trái tim đập và I love you -----------------
function renderScreen3(container) {
  document.body.style.background = 'linear-gradient(135deg, #C88AC3, #BD4E73)';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in screen3';
  // Tăng padding top gấp đôi (ví dụ từ 30px lên 60px)
  wrapper.style.paddingTop = '60px';
  
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.addEventListener('click', (e) => {
    const rect = heart.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    launchConfetti(centerX, centerY);
  });

  const loveText = document.createElement('h1');
  loveText.textContent = 'I love you';

  wrapper.appendChild(heart);
  wrapper.appendChild(loveText);
  container.appendChild(wrapper);
  
  state.autoConfettiInterval = setInterval(() => {
    const x = getRandomInt(0, window.innerWidth);
    const y = getRandomInt(0, window.innerHeight);
    launchConfetti(x, y);
  }, 1500);
}

// ----------------- Nền: Tạo trái tim bay lên -----------------
function createBgHeart(x, y) {
  const heart = document.createElement('div');
  heart.classList.add('bg-heart');
  const size = Math.random() * 20 + 15;
  heart.style.width = `${size}px`;
  heart.style.height = `${size * 0.9}px`;
  heart.style.left = `${x - size / 2}px`;
  heart.style.top = `${y - size / 2}px`;
  const duration = Math.random() * 3 + 3;
  heart.style.setProperty('--duration', `${duration}s`);
  const allColors = ['#5E1263', '#C88AC3', '#BD4E73', '#9D152D', '#670100'];
  const color = allColors[getRandomInt(0, allColors.length - 1)];
  heart.style.backgroundColor = color;
  heart.style.opacity = Math.random() * 0.5 + 0.5;
  document.getElementById('bg-hearts').appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

function spawnRandomHeart() {
  const x = Math.random() * window.innerWidth;
  const y = window.innerHeight;
  createBgHeart(x, y);
}
const patternInterval = window.innerWidth < 768 ? 400 : 800;
setInterval(spawnRandomHeart, patternInterval);

document.addEventListener('mousemove', (e) => {
  if (window.innerWidth >= 768) {
    createBgHeart(e.clientX, e.clientY);
  }
});

document.addEventListener('click', (e) => {
  clickSound.currentTime = 0;
  clickSound.play();
  if (!e.target.closest('#app') && state.currentScreen !== 'screen3') {
    changeBackgroundGradient();
  }
});

checkURLParam();
window.addEventListener('DOMContentLoaded', render);
