// Utility function สำหรับเล่นเสียงคลิก
let clickSound = null;
let userInteracted = false;

// ตั้งค่าให้รู้ว่า user ได้ interact แล้ว (เพื่อผ่าน browser autoplay policy)
if (typeof window !== 'undefined') {
  const enableSound = () => {
    userInteracted = true;
    // ลองเล่นเสียงเบาๆ เพื่อ unlock audio context
    if (clickSound) {
      clickSound.volume = 0.01;
      clickSound.play().then(() => {
        clickSound.pause();
        clickSound.currentTime = 0;
        clickSound.volume = 0.7;
      }).catch(() => {});
    }
  };
  
  // ฟัง user interaction ครั้งแรก
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, enableSound, { once: true, passive: true });
  });
}

// โหลดเสียงครั้งแรก
const loadClickSound = () => {
  if (!clickSound && typeof window !== 'undefined') {
    clickSound = new Audio('/mouse-click.mp3');
    clickSound.volume = 0.7; // ตั้งค่าระดับเสียง 70%
    clickSound.preload = 'auto';
    
    // ลองโหลดเสียงทันที
    clickSound.load().catch(() => {});
  }
  return clickSound;
};

// ฟังก์ชันเล่นเสียงคลิก
export const playClickSound = () => {
  try {
    if (typeof window === 'undefined') return;
    
    const sound = loadClickSound();
    if (!sound) return;
    
    // รีเซ็ตเสียงถ้ายังเล่นอยู่
    sound.currentTime = 0;
    
    // พยายามเล่นเสียง
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // ถ้าเล่นไม่ได้ (เช่น browser autoplay policy)
        // ไม่ต้อง log error เพราะอาจเป็นเรื่องปกติ
        if (err.name !== 'NotAllowedError') {
          console.debug('Could not play click sound:', err);
        }
      });
    }
  } catch (error) {
    // ไม่ต้อง log error เพราะอาจเป็นเรื่องปกติ
    console.debug('Error in playClickSound:', error);
  }
};

// Hook สำหรับใช้ใน React components
export const useClickSound = () => {
  return playClickSound;
};

