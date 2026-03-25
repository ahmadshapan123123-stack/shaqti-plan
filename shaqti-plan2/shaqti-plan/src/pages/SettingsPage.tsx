import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Key, Shield, Moon, Sun, Monitor } from 'lucide-react';
import kashifLogo from '../KASHif logo-02.png';
import { useSettingsStore, type ThemeMode } from '../store/useSettingsStore';

const SettingsPage = () => {
  const removeBgKey = useSettingsStore((state) => state.removeBgKey);
  const setRemoveBgKey = useSettingsStore((state) => state.setRemoveBgKey);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const [draftKey, setDraftKey] = useState(removeBgKey);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setRemoveBgKey(draftKey.trim());
  };

  const themeOptions: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'نهاري', icon: <Sun size={16} /> },
    { value: 'dark', label: 'ليلي', icon: <Moon size={16} /> },
    { value: 'system', label: 'تلقائي', icon: <Monitor size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 shadow-sm">
        <Link
          to="/"
          className="btn-press flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowRight className="h-4 w-4" />
          الرئيسية
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">الإعدادات</h1>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[600px] space-y-6 p-6">

        {/* Theme Card */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">المظهر</h2>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  theme === opt.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Remove.bg API Key Card */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-blue-900/40">
              <Key className="h-5 w-5 text-primary-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">مفتاح Remove.bg</h2>
              <span className="text-xs font-medium text-success">مجاني</span>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">
                مفتاح API الخاص بـ Remove.bg
              </label>
              <input
                type="password"
                value={draftKey}
                onChange={(event) => setDraftKey(event.target.value)}
                placeholder="ضع المفتاح هنا..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white transition focus:border-primary-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-blue-900"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              يتم حفظ المفتاح محليًا فقط. لا تشاركه مع أحد لاستخدام Remove.bg داخل التطبيق.
            </p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-press rounded-xl border border-primary-500 bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                حفظ المفتاح
              </button>
            </div>
          </form>
        </section>

        {/* Info Card */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200">ماذا يفعل هذا المفتاح؟</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                يسمح للمكوّن برفع الأثاث بإزالة الخلفية تلقائيًا من صور الأثاث قبل حفظها في المكتبة.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-blue-800">
            <img
              src={kashifLogo}
              alt="الكاشف"
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="mt-3 text-xl font-bold text-gray-800 dark:text-white">شقتي</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">تطبيق تصميم المساقط</p>
          <p className="mt-3 text-xs text-gray-300 dark:text-gray-600">© 2026 الكاشف. جميع الحقوق محفوظة.</p>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;

