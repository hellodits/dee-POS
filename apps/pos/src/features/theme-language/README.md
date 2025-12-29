# Theme & Language Features

DEEPOS mendukung dark/light mode dan multi-language (EN/ID).

## 🎨 Theme Switcher

### Features
- **Light Mode**: Default theme dengan background putih
- **Dark Mode**: Dark theme untuk penggunaan malam
- **Auto Detection**: Deteksi system preference
- **Persistent**: Tersimpan di localStorage
- **Smooth Transition**: Animasi transisi yang halus

### Usage
```tsx
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { useTheme } from '@/contexts/ThemeContext'

// Component
<ThemeSwitcher />

// Hook
const { theme, toggleTheme, setTheme } = useTheme()
```

### CSS Variables
Theme menggunakan CSS custom properties:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 0 72.2% 50.6%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

## 🌍 Language Switcher

### Supported Languages
- **English (EN)** 🇺🇸 - Default
- **Indonesian (ID)** 🇮🇩

### Features
- **Auto Detection**: Browser language detection
- **Persistent**: Tersimpan di localStorage
- **Dropdown UI**: Elegant dropdown dengan flags
- **Real-time**: Perubahan langsung tanpa reload

### Usage
```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useTranslation } from 'react-i18next'

// Component
<LanguageSwitcher />

// Hook
const { t, i18n } = useTranslation()
const text = t('dashboard.title') // "Dashboard" or "Dashboard"
```

## 📁 File Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx          # Theme provider & hook
├── components/ui/
│   ├── theme-switcher.tsx        # Theme toggle button
│   └── language-switcher.tsx     # Language dropdown
├── i18n/
│   ├── index.ts                  # i18n configuration
│   └── locales/
│       ├── en.json              # English translations
│       └── id.json              # Indonesian translations
└── features/theme-language/
    └── README.md                # This documentation
```

## 🔧 Configuration

### Theme Context
```tsx
// main.tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

### i18n Setup
```tsx
// main.tsx
import './i18n'

// i18n/index.ts
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, id },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })
```

## 📝 Translation Keys

### Common
```json
{
  "common": {
    "loading": "Loading...",
    "export": "Export",
    "save": "Save"
  }
}
```

### Auth
```json
{
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password"
  }
}
```

### Dashboard
```json
{
  "dashboard": {
    "title": "Dashboard",
    "dailySales": "Daily Sales",
    "popularDishes": "Popular Dishes"
  }
}
```

### Navigation
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "menu": "Menu",
    "staff": "Staff"
  }
}
```

## 🎯 Implementation

### Theme-Aware Components
```tsx
// Gunakan CSS variables
className="bg-background text-foreground"
className="bg-card border-border"
className="text-primary hover:text-primary/80"
```

### Translated Text
```tsx
// Gunakan translation hook
const { t } = useTranslation()

return (
  <h1>{t('dashboard.title')}</h1>
  <Button>{t('common.save')}</Button>
)
```

## 🚀 Features Ready

### Theme Switcher
- ✅ Moon/Sun icon toggle
- ✅ Tooltip dengan translated text
- ✅ Smooth transitions
- ✅ System preference detection

### Language Switcher
- ✅ Flag icons (🇺🇸 🇮🇩)
- ✅ Dropdown dengan backdrop
- ✅ Current language indicator
- ✅ Translated language names

### Integration
- ✅ Sidebar dengan theme & language controls
- ✅ Auth pages dengan switchers
- ✅ Dashboard dengan full translation
- ✅ All components theme-aware

## 📱 Responsive

- Desktop: Switchers di sidebar dan auth pages
- Mobile: Compact icons dan dropdown
- Touch-friendly: Proper touch targets

Ready untuk production! 🚀