# Каталог Манделы — полный сюжет (трибьют)

Интерактивный аналоговый хоррор в браузере: пересказ сюжета **The Mandela Catalogue**.

Неофициальный трибьют. Не связан с Alex Kister.

## Играть онлайн

Репозиторий: https://github.com/eldar-p/arg  

После включения GitHub Pages сайт будет здесь:

### https://eldar-p.github.io/arg/

### Включить хостинг (1 клик, владелец репо)

1. Открой **[Settings → Pages](https://github.com/eldar-p/arg/settings/pages)**  
2. **Build and deployment → Source** → **Deploy from a branch**  
3. Branch: **`main`** / folder: **`/ (root)`** → **Save**  

Через 1–2 минуты игра откроется по ссылке выше.

## Локально

```bash
python3 -m http.server 8080
```

http://localhost:8080

## Сюжет

1. **Ep.0 — Overcast** — «Гавриил», *Think of someone you love*  
2. **Ep.1 — Vol.1** — Марк, Сезар, Тэтчер, APS  
3. **Ep.2 — Vol.2** — Адам и Джона (Bythorne)  
4. **Ep.3 — Падение Манделы** — Сара, пустой округ, финал  

## Мини-игры = ворота сюжета

Это не отдельный режим. Чтобы открыть следующую кассету, нужно пройти протокол:

| Эпизод | Протоколы |
|--------|-----------|
| Ep.0 | Не смотри в глаза |
| Ep.1 | Голос → дверь → тест APS → сверка лиц |
| Ep.2 | Рация → взгляд/камера → сверка лиц |
| Ep.3 | Голос 911 → память каталога → финальная сверка |

Провал критичных протоколов = **повтор**, пока не пройдёшь. Сюжетные выборы остаются, но без мини-игры дальше нельзя.

## Медиа (честно)

**Нельзя** класть кадры/OST The Mandela Catalogue — это чужой копирайт. Здесь только легальные замены:

### Портреты
Реальные фотографии людей с **Unsplash** (`assets/portraits/*_photo.jpg`). Alternate — та же фотобаза с пустыми глазами.  
Пересборка: `python3 scripts/build_portraits.py` · источники: `assets/portraits/ATTRIBUTION.txt`

### Звук
Полноценные музыкальные дорожки Mixkit Music в `assets/music/` (dark shadows, piano horror, echoes, delirium…) + SFX в `assets/sfx/`.  
Это **не** саундтрек сериала. Источники: `assets/music/ATTRIBUTION.txt`, `assets/sfx/ATTRIBUTION.txt`.
