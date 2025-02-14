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

/* 
   Thiết lập background music để chạy tự động toàn cục.
   Vì trình duyệt thường chặn auto-play không muted, ta sẽ set muted ban đầu rồi unmute sau 500ms.
*/
const backgroundMusic = new Audio('/assets/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.8;
backgroundMusic.muted = true;
backgroundMusic.play().then(() => {
  setTimeout(() => { backgroundMusic.muted = false; }, 100);
}).catch(() => {});

const clickSound = new Audio('/assets/click.mp3');
clickSound.volume = 0.5;

const congratsSound = new Audio('/assets/congrats.mp3');
congratsSound.volume = 0.7;

// Hàm tiện ích: trả về số nguyên ngẫu nhiên trong khoảng [min, max]
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm tiện ích: trả về 1 màu ngẫu nhiên từ bộ màu cố định
function getRandomColor() {
  const colors = ['#5E1263', '#C88AC3', '#BD4E73', '#9D152D', '#670100'];
  return colors[getRandomInt(0, colors.length - 1)];
}

// Hàm thay đổi gradient nền một cách từ từ khi click vào nền (nếu click ngoài #app và không ở màn 3)
function changeBackgroundGradient() {
  let newIndex;
  do {
    newIndex = getRandomInt(0, palettes.length - 1);
  } while(newIndex === state.currentPaletteIndex);
  
  state.currentPaletteIndex = newIndex;
  const [color1, color2] = palettes[newIndex];
  document.body.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
}

// Tính năng bất ngờ: hiệu ứng confetti với độ tỏa lớn và z-index cao
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
    renderScreen2(app);
  } else if (state.currentScreen === 'screen3') {
    renderScreen3(app);
  }
}

function encodeToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}

function decodeFromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array([...binary].map(char => char.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
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

  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit';
  submitBtn.classList.add('submit-btn');
  submitBtn.addEventListener('click', () => {
    state.question = input.value.trim();
    // Mã hóa câu hỏi bằng Base64
    const encodedQuestion = encodeURIComponent(encodeToBase64(state.question));
    console.log('Câu hỏi mã hóa:', encodeToBase64(state.question));
    const newUrl = `${window.location.pathname}?q=${encodedQuestion}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    state.currentScreen = 'screen2';
    render();
  });

  wrapper.appendChild(desc);
  wrapper.appendChild(input);
  wrapper.appendChild(submitBtn);
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
      // yesBtn.style.left = '0';
      yesBtn.style.width = '100vw';
      // yesBtn.style.height = '100vh';
      yesBtn.style.fontSize = '4em';
      yesBtn.style.zIndex = '1000';
      yesBtn.style.display = 'flex';
      yesBtn.style.alignItems = 'center';
      yesBtn.style.justifyContent = 'center';
      // Đảm bảo không có margin hay padding làm lệch
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
  // Đặt nền màn 3 với gradient từ #C88AC3 sang #BD4E73
  document.body.style.background = 'linear-gradient(135deg, #C88AC3, #BD4E73)';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'card fade-in screen3';

  const heart = document.createElement('div');
  heart.className = 'heart';
  // Click vào trái tim chính cũng bùng nổ confetti tại vị trí đó
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

// Hàm tạo trái tim nền tại vị trí (x, y)
function createBgHeart(x, y) {
  const heart = document.createElement('div');
  heart.classList.add('bg-heart');
  // Kích thước từ 15 đến 35px
  const size = Math.random() * 20 + 15;
  heart.style.width = `${size}px`;
  heart.style.height = `${size * 0.9}px`;
  heart.style.left = `${x - size / 2}px`;
  heart.style.top = `${y - size / 2}px`;
  const duration = Math.random() * 3 + 3; // thời gian 3-6 giây
  heart.style.setProperty('--duration', `${duration}s`);
  // Chọn màu ngẫu nhiên từ bộ màu cố định
  const allColors = ['#5E1263', '#C88AC3', '#BD4E73', '#9D152D', '#670100'];
  const color = allColors[getRandomInt(0, allColors.length - 1)];
  heart.style.backgroundColor = color;
  heart.style.opacity = Math.random() * 0.5 + 0.5;
  document.getElementById('bg-hearts').appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

// Tạo trái tim nền ngẫu nhiên từ dưới lên
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
  
  // Nếu click ngoài vùng #app và không ở màn 3, thay đổi gradient nền
  if (!e.target.closest('#app') && state.currentScreen !== 'screen3') {
    changeBackgroundGradient();
  }
});

// Khởi chạy render khi DOM được load
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedQuestion = urlParams.get('q');
  if (encodedQuestion) {
    try {
      state.question = decodeFromBase64(decodeURIComponent(encodedQuestion));
      state.currentScreen = 'screen2';
    } catch (e) {
      console.error('Lỗi giải mã câu hỏi:', e);
    }
  }

  render();
});
