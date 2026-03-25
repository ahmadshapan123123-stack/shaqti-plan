import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import kashifLogo from '../KASHif logo-02.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email.trim() || !password) {
      setLocalError('جميع الحقول مطلوبة');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError('الاسم مطلوب');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('كلمتا المرور غير متطابقتين');
        return;
      }
    }

    setSubmitting(true);
    let success = false;

    if (mode === 'login') {
      success = await login(email, password, rememberMe);
    } else {
      success = await register(name, email, password);
    }

    setSubmitting(false);

    if (success) {
      navigate('/projects', { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-blue-800 shadow-lg">
            <img src={kashifLogo} alt="الكاشف" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">شقتي</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">صمّم شقتك بسهولة واحترافية</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-xl">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-800 dark:text-white">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>

          {displayError && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 transition focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 transition focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                dir="ltr"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 transition focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                dir="ltr"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 transition focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
            )}

            {mode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">تذكرني</span>
              </label>
            )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-press w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting
                  ? 'جاري المعالجة...'
                  : mode === 'login'
                    ? 'دخول'
                    : 'إنشاء حساب'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-400">أو</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('تسجيل الدخول بواسطة جوجل سيتوفر قريباً (حالياً متاح الدخول بالبريد الإلكتروني فقط لحماية خصوصية بياناتك المحلية)')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="h-4 w-4" />
              الدخول بواسطة جوجل
            </button>


          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
            >
              {mode === 'login' ? 'ليس لديك حساب؟ أنشئ حساب جديد' : 'لديك حساب بالفعل؟ سجّل دخولك'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} الكاشف. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
