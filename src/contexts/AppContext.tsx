import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { Language, Currency, TRANSLATIONS } from '@/lib/index';

interface AppContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  /**
   * 多语言翻译函数，支持嵌套路径如 'nav.home'
   */
  t: (path: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider 负责全局语言和货币状态的管理与持久化
 * 现在集成了用户偏好设置
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');
  const [currency, setCurrencyState] = useState<Currency>('IDR');

  /**
   * 使用 useLayoutEffect 在首帧绘制前从 localStorage 恢复，避免在 Next.js 中依赖 useEffect
   * 导致整棵子树被 `isLoaded` 挡在「Loading...」后（SSR 不执行 useEffect，且水合后若 effect 未跑会一直卡住）。
   */
  useLayoutEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    const savedCurrency = localStorage.getItem('app_currency') as Currency;

    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang === 'zh' ? 'zh-Hans' : 'en';
    }

    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'IDR' || savedCurrency === 'CNY')) {
      setCurrencyState(savedCurrency);
    } else {
      setCurrencyState('IDR');
    }
  }, []);

  useEffect(() => {
    const handleUserPreferences = (event: CustomEvent) => {
      const { language: prefLang, currency: prefCur } = event.detail;
      console.log('Applying user preferences:', { language: prefLang, currency: prefCur });

      if (prefLang && (prefLang === 'zh' || prefLang === 'en')) {
        setLanguageState(prefLang);
        localStorage.setItem('app_language', prefLang);
        document.documentElement.lang = prefLang === 'zh' ? 'zh-Hans' : 'en';
      }

      if (prefCur && (prefCur === 'USD' || prefCur === 'IDR' || prefCur === 'CNY')) {
        setCurrencyState(prefCur);
        localStorage.setItem('app_currency', prefCur);
      }
    };

    window.addEventListener('userPreferencesLoaded', handleUserPreferences as EventListener);

    return () => {
      window.removeEventListener('userPreferencesLoaded', handleUserPreferences as EventListener);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    console.log(`[AppContext] Setting language to: ${lang}`);
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    // 更改 HTML lang 属性以便无障碍与 SEO（BCP 47）
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
    // ⚠️ 注意：不再主动修改 URL，URL 由路由层控制
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('app_currency', curr);
  };

  /**
   * 递归查找翻译字典中的路径
   */
  const t = (path: string): string => {
    const keys = path.split('.');
    const safeLanguage = (language === 'zh' || language === 'en') ? language : 'zh';
    let result: any = TRANSLATIONS[safeLanguage];

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // 如果当前语言缺失，尝试回退到英语
        let fallback: any = TRANSLATIONS['en'];
        for (const fallbackKey of keys) {
          if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
            fallback = fallback[fallbackKey];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }

    return typeof result === 'string' ? result : path;
  };

  return (
    <AppContext.Provider
      value={{
        language: (language === 'zh' || language === 'en') ? language : 'zh',
        currency,
        setLanguage,
        setCurrency,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * 使用应用上下文的 Hook
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}