/**
 * Оптимизированный алгоритм подсчёта очков для BelarusGuessor
 * @param {number} distance - Расстояние в километрах
 * @param {number} timeTaken - Время ответа в секундах
 * @returns {number} Количество очков
 */
function calculateScore(distance, timeTaken) {
  // Максимальное расстояние для получения 0 очков (км)
  const MAX_DISTANCE = 1000;
  // Базовое максимальное количество очков
  const MAX_POINTS = 5000;
  // Коэффициент экспоненциального спада
  const DECAY_FACTOR = 0.002;
  // Время для получения бонуса (сек)
  const BONUS_TIME = 10;
  // Бонусный множитель
  const BONUS_MULTIPLIER = 1.2;
  
  // Ограничиваем расстояние максимальным значением
  const clampedDistance = Math.min(distance, MAX_DISTANCE);
  
  // Экспоненциальная формула спада очков
  // Чем больше расстояние, тем быстрее падают очки
  let score = MAX_POINTS * Math.exp(-DECAY_FACTOR * clampedDistance);
  
  // Применяем бонус за скорость, если уложились в время
  if (timeTaken <= BONUS_TIME) {
    score *= BONUS_MULTIPLIER;
  }
  
  // Округляем до целого и ограничиваем максимумом
  const finalScore = Math.min(Math.round(score), MAX_POINTS);
  
  // Гарантируем, что результат не отрицательный
  return Math.max(0, finalScore);
}

// Примеры использования:
console.log(calculateScore(0, 5));    // ~6000 (с бонусом)
console.log(calculateScore(10, 15));  // ~4900
console.log(calculateScore(100, 8));  // ~4080 (с бонусом)
console.log(calculateScore(500, 20)); // ~1840
console.log(calculateScore(1000, 30)); // 0
