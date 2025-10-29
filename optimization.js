// Оптимизация для мобильных устройств
class MobileOptimizer {
  constructor() {
    this.setupTouchEvents();
    this.optimizePerformance();
  }
  
  setupTouchEvents() {
    // Заменяем hover события на touch для мобильных
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', this.handleTouch, { passive: true });
    }
  }
  
  optimizePerformance() {
    // Отключаем дорогие операции на слабых устройствах
    if (this.isLowEndDevice()) {
      this.reduceAnimations();
      this.lowerRenderQuality();
    }
  }
  
  isLowEndDevice() {
    // Простая проверка на слабые устройства
    return !('ontouchstart' in window) || 
           navigator.hardwareConcurrency < 4 ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  reduceAnimations() {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
  }
  
  lowerRenderQuality() {
    // Можно уменьшить качество панорам или карт
    const panorama = document.getElementById('panorama');
    if (panorama) {
      panorama.style.imageRendering = 'pixelated';
    }
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new MobileOptimizer();
});
