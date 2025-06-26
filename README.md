# 🛍️ Wildberries Analyzer

Простой сервис аналитики товаров Wildberries с визуализацией данных на фронтенде.

---

## 📌 Цель проекта

Реализовать парсер и веб-интерфейс для получения и анализа информации о товарах с сайта Wildberries по пользовательскому запросу. Отображать результаты в виде таблицы и графиков с поддержкой фильтрации и сортировки.

---

## ⚙️ Функциональность

### 🔎 Backend

- Парсинг данных с Wildberries по поисковому запросу (до ~6000 товаров).
- Сохраняются следующие поля:
  - Название товара
  - Цена без скидки
  - Цена со скидкой
  - Рейтинг
  - Количество отзывов
- REST API с поддержкой фильтрации:
  - `min_price`
  - `max_price`
  - `min_rating`
  - `min_feedbacks`

---

### 💻 Frontend

- Поисковая строка для ввода запроса
- Таблица товаров с колонками:
  - Название товара
  - Цена
  - Цена со скидкой
  - Рейтинг
  - Количество отзывов
- **Фильтры**:
  - Диапазон цен (слайдер + ручной ввод)
  - Минимальный рейтинг
  - Минимальное количество отзывов
- **Сортировка** по:
  - Рейтингу
  - Количеству отзывов
  - Цене
  - Названию
- **Динамическое обновление** таблицы и графиков при изменении фильтров
- **Графики**:
  - 📊 Гистограмма: распределение товаров по диапазонам цен
  - 📈 Линейный график: зависимость средней скидки от рейтинга

---

## 🛠️ Используемые технологии

**Backend:**
- Python 3
- Django
- Django REST Framework
- SQLite
- Requests

**Frontend:**
- HTML5, CSS3, Bootstrap
- JavaScript (Vanilla)
- jQuery, jQuery UI
- Chart.js
- DataTables

---

![Снимок экрана 2025-06-25 200057](https://github.com/user-attachments/assets/7c98aad9-7856-4df3-bb8a-e40bd6e09aa6)

![Снимок экрана 2025-06-25 200106](https://github.com/user-attachments/assets/09363d12-2b8e-46ac-8062-dfa7ba9440cc)

![Снимок экрана 2025-06-25 200112](https://github.com/user-attachments/assets/56f7987f-8dad-4680-9400-81bd53fdd873)

---

## 🚀 Установка и запуск

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/wildberries-analyzer.git
cd wildberries-analyzer

# Создать и активировать виртуальное окружение
python -m venv venv
source venv/bin/activate  # для Windows: venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt

# Выполнить миграции
python manage.py migrate

# Запустить сервер
python manage.py runserver
```
---

## Как пользоваться

1. Введите поисковый запрос (например: `ноутбук`)
2. Дождитесь окончания загрузки (~0–10 сек)
3. Используйте фильтры и сортировку таблицы
4. Анализируйте графики (автообновление при фильтрации)

---

🌐 API с фильтрацией по параметрам
Также реализован API-эндпоинт, который позволяет получать уже отфильтрованные данные по следующим параметрам:
1. query — ключевое слово (обязательно);
2. min_price / max_price — диапазон цен;
3. min_rating / max_rating — рейтинг;
4. min_feedbacks / max_feedbacks — количество отзывов.

Примерный путь к API: GET /api/filterproducts/?query=ноутбук&min_price=10000&max_price=20000

![image](https://github.com/user-attachments/assets/4ae521c4-eb46-4a12-a8c3-cb4d4575ab05)

🔍 Примеры запросов
1. Только по ключевому слову:
GET /api/filterproducts/?query=пылесос
2. По ключевому слову и цене:
GET /api/filterproducts/?query=пылесос&min_price=5000&max_price=10000
3. Фильтр по рейтингу:
GET /api/filterproducts/?query=телевизор&min_rating=4.5
4. Фильтр по количеству отзывов:
GET /api/filterproducts/?query=телефон&min_feedbacks=100&max_feedbacks=1000
5. Комбинированный запрос:
GET /api/filterproducts/?query=холодильник&min_price=20000&max_price=60000&min_rating=4.2&min_feedbacks=50
6. Только верхняя граница по цене:
GET /api/filterproducts/?query=микроволновка&max_price=8000
7. Минимальный рейтинг и минимум отзывов:
GET /api/filterproducts/?query=монитор&min_rating=4&min_feedbacks=30
8. Только максимальный рейтинг:
GET /api/filterproducts/?query=мышка&max_rating=4.5
9. Только минимальное количество отзывов:
GET /api/filterproducts/?query=наушники&min_feedbacks=200
10. Без дополнительных фильтров:
GET /api/filterproducts/?query=стол
