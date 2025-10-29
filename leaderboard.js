// leaderboard.js

class Leaderboard {
  constructor() {
    this.storageKey = 'belarusguessor_leaderboard';
    this.loadLeaderboard();
  }
  
  /**
   * Загружает таблицу рекордов из LocalStorage
   */
  loadLeaderboard() {
    const stored = localStorage.getItem(this.storageKey);
    this.leaderboard = stored ? JSON.parse(stored) : [];
    this.sortLeaderboard();
  }
  
  /**
   * Сохраняет результат игрока
   * @param {string} playerName - Имя игрока
   * @param {number} score - Количество очков
   */
  saveScore(playerName, score) {
    const entry = {
      name: playerName || 'Аноним',
      score: score,
      date: new Date().toISOString(),
      id: Date.now() + Math.random()
    };
    
    this.leaderboard.push(entry);
    this.sortLeaderboard();
    
    // Сохраняем только топ-20 результатов
    if (this.leaderboard.length > 20) {
      this.leaderboard = this.leaderboard.slice(0, 20);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(this.leaderboard));
  }
  
  /**
   * Сортирует таблицу рекордов по убыванию очков
   */
  sortLeaderboard() {
    this.leaderboard.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Возвращает топ-N результатов
   * @param {number} limit - Количество результатов
   * @returns {Array} Массив результатов
   */
  getTopScores(limit = 10) {
    return this.leaderboard.slice(0, limit);
  }
  
  /**
   * Очищает таблицу рекордов
   */
  clearLeaderboard() {
    this.leaderboard = [];
    localStorage.removeItem(this.storageKey);
  }
  
  /**
   * Рендерит таблицу рекордов в DOM элемент
   * @param {HTMLElement} container - Контейнер для таблицы
   */
  renderLeaderboard(container) {
    const topScores = this.getTopScores(10);
    
    const html = `
      <div class="leaderboard">
        <h2>Таблица рекордов</h2>
        ${topScores.length === 0 ? 
          '<p class="no-scores">Пока нет результатов</p>' :
          `<table class="scores-table">
            <thead>
              <tr>
                <th>Место</th>
                <th>Игрок</th>
                <th>Очки</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              ${topScores.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${this.escapeHtml(entry.name)}</td>
                  <td>${entry.score.toLocaleString()}</td>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>`
        }
        <div class="leaderboard-actions">
          <button id="clearLeaderboard" class="btn-danger">Сбросить рекорды</button>
          <button id="closeLeaderboard" class="btn-secondary">Закрыть</button>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Добавляем обработчики событий
    document.getElementById('clearLeaderboard')?.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите сбросить все рекорды?')) {
        this.clearLeaderboard();
        this.renderLeaderboard(container);
      }
    });
    
    document.getElementById('closeLeaderboard')?.addEventListener('click', () => {
      container.style.display = 'none';
    });
  }
  
  /**
   * Экранирует HTML символы для безопасности
   */
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Использование:
// const leaderboard = new Leaderboard();
// leaderboard.saveScore('Игрок', 4500);
// leaderboard.renderLeaderboard(document.getElementById('leaderboard-container'));
