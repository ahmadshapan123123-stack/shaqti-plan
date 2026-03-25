/**
 * Design System Tokens
 * Global design tokens for consistent UI across the app
 */

export const colors = {
    // Primary colors
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    // Neutral / Gray colors
    gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        800: '#1e293b',
        900: '#0f172a',
    },
    // Accent colors
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
} as const;

export const typography = {
    fontFamily: {
        sans: ['Cairo', 'Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
    },
    fontSize: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
} as const;

export const spacing = {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
} as const;

export const borderRadius = {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
} as const;

export const shadows = {
    sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
    lg: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
    xl: '0 20px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)',
} as const;

// Room color palette for the app
export const roomColors = [
    '#dbeafe', // blue
    '#dcfce7', // green
    '#fef9c3', // yellow
    '#fce7f3', // pink
    '#ede9fe', // purple
    '#ffedd5', // orange
] as const;

// CSS variable string for inline styles
export const cssVariables = `
  --primary-50: ${colors.primary[50]};
  --primary-100: ${colors.primary[100]};
  --primary-500: ${colors.primary[500]};
  --primary-600: ${colors.primary[600]};
  --primary-700: ${colors.primary[700]};
  --gray-50: ${colors.gray[50]};
  --gray-100: ${colors.gray[100]};
  --gray-200: ${colors.gray[200]};
  --gray-400: ${colors.gray[400]};
  --gray-600: ${colors.gray[600]};
  --gray-800: ${colors.gray[800]};
  --gray-900: ${colors.gray[900]};
  --success: ${colors.success};
  --warning: ${colors.warning};
  --danger: ${colors.danger};
`;
