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
// Cố gắng tự động phát (nếu trình duyệt cho phép)
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
// Toast Notification
// =========================
function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '30%';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '3000';
  toast.style.fontSize = '1em';
  toast.style.textAlign = 'center'; // Chữ được căn giữa
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
    
    // Tăng độ tỏa: khoảng cách lớn hơn
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
  // Nếu không ở màn 3, dừng auto confetti
  if (state.autoConfettiInterval) {
    clearInterval(state.autoConfettiInterval);
    state.autoConfettiInterval = null;
  }
  
  const app = document.getElementById('app');
  app.innerHTML = ''; // Xoá nội dung cũ

  if (state.currentScreen === 'screen1') {
    renderScreen1(app);
  } else if (state.currentScreen === 'screen2') {
    // Khi mở màn 2, đảm bảo nhạc nền đang chạy
    backgroundMusic.play().catch(() => {});
    renderScreen2(app);
  } else if (state.currentScreen === 'screen3') {
    renderScreen3(app);
  }
}

// ----------------- MÀN 1: Nhập câu hỏi -----------------
function renderScreen1(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in';

  const desc = document.createElement('p');
  desc.textContent = 'Nhập câu hỏi dạng Yes/No questition.';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ví dụ: Bạn có yêu tôi không?';

  // Nút "Generate" thay vì "Submit"
  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate';
  generateBtn.classList.add('submit-btn');
  generateBtn.addEventListener('click', () => {
    // Lấy giá trị input (nếu trống, dùng mặc định)
    const questionValue = input.value.trim() || 'Bạn có yêu tôi không?';
    state.question = questionValue;
    // Mã hóa câu hỏi bằng Base64 và cập nhật URL với parameter "q"
    const encoded = encodeBase64(questionValue);
    const newURL = `${window.location.origin}${window.location.pathname}?q=${encoded}`;
    // window.history.pushState(null, '', `?q=${encoded}`);
    // Copy link vào clipboard và hiển thị toast
    navigator.clipboard.writeText(newURL).then(() => {
      showToast('Tạo link thành công và đã copy vào clipboard! Gửi cho người ấy thôi!');
    }).catch(() => {
      showToast('Link generated, but failed to copy.');
    });
    // Không chuyển qua màn 2; người dùng sẽ chia sẻ link
  });

  wrapper.appendChild(desc);
  wrapper.appendChild(input);
  wrapper.appendChild(generateBtn);
  container.appendChild(wrapper);
}

// ----------------- MÀN 2: Câu hỏi Yes/No -----------------
function renderScreen2(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in';

  const questionEl = document.createElement('h2');
  questionEl.textContent = state.question;
  wrapper.appendChild(questionEl);
  
  // Container cho 2 nút Yes và No
  const btnContainer = document.createElement('div');
  btnContainer.className = 'btn-container';

  const yesBtn = document.createElement('button');
  yesBtn.textContent = 'Yes';
  yesBtn.classList.add('yes-btn');

  const noBtn = document.createElement('button');
  noBtn.textContent = 'No';
  noBtn.classList.add('no-btn');

  // Hàm updateButtonSizes theo snippet bạn cung cấp
  function updateButtonSizes() {
    if (state.noCount < 5) {
      const scaleYes = 1 + state.noCount * 0.2;
      const scaleNo = 1 - state.noCount * 0.1;
      yesBtn.style.transform = `scale(${scaleYes})`;
      noBtn.style.transform = `scale(${scaleNo})`;
    } else {
      // Khi nút Yes full màn: đảm bảo chiếm toàn bộ viewport và chữ luôn căn giữa
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
    // backgroundMusic.play().catch(() => {});
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
  // Đặt nền màn 3 với gradient từ #C88AC3 sang #BD4E73
  document.body.style.background = 'linear-gradient(135deg, #C88AC3, #BD4E73)';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in screen3';

  const heart = document.createElement('div');
  heart.className = 'heart';
  // Khi click vào trái tim chính, bùng nổ confetti tại vị trí đó
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
  
  // Bật chế độ confetti tự động, lặp lại mỗi 1.5 giây
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
  const size = Math.random() * 20 + 15; // kích thước từ 15 đến 35px
  heart.style.width = `${size}px`;
  heart.style.height = `${size * 0.9}px`;
  heart.style.left = `${x - size / 2}px`;
  heart.style.top = `${y - size / 2}px`;
  const duration = Math.random() * 3 + 3; // thời gian 3-6 giây
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
// Nếu màn hình nhỏ (tablet, điện thoại), tăng tần suất spawn pattern
const patternInterval = window.innerWidth < 768 ? 400 : 800;
setInterval(spawnRandomHeart, patternInterval);

// Tạo trái tim theo hành động di chuột (chỉ có trên desktop)
document.addEventListener('mousemove', (e) => {
  if (window.innerWidth >= 768) {
    createBgHeart(e.clientX, e.clientY);
  }
});

// Global: Lắng nghe click chuột ở bất kỳ đâu để phát tiếng click và thay đổi gradient nếu cần
document.addEventListener('click', (e) => {
  clickSound.currentTime = 0;
  clickSound.play();
  backgroundMusic.play().catch(() => {});
  if (!e.target.closest('#app') && state.currentScreen !== 'screen3') {
    changeBackgroundGradient();
  }
});

// Kiểm tra URL parameter "q" để xác định màn hiển thị ban đầu
checkURLParam();

// Khởi chạy render khi DOM được load
window.addEventListener('DOMContentLoaded', render);
