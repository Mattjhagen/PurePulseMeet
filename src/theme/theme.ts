export const PurePulseTheme = {
  colors: {
    background: '#0B0F19',
    cardBg: '#111827',
    cardBgSecondary: '#1F2937',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardBorderActive: 'rgba(124, 58, 237, 0.5)',
    
    // PurePulse Brand Neon Palette
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B21B6',
    accentBlue: '#3B82F6',
    accentPink: '#EC4899',
    accentCyan: '#06B6D4',
    
    // Status & Gamification Colors
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    
    // Tier Colors
    tierBronze: '#CD7F32',
    tierSilver: '#C0C0C0',
    tierGold: '#FFD700',
    tierPlatinum: '#E5E4E2',
    tierBlack: '#A855F7',
    
    // Text Palette
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textHighlight: '#A855F7',
  },
  
  gradients: {
    brandPrimary: ['#7C3AED', '#6366F1'],
    brandNeon: ['#8B5CF6', '#EC4899'],
    cardDark: ['#111827', '#1F2937'],
    goldTier: ['#F59E0B', '#D97706'],
    blackCard: ['#1F2937', '#0F172A', '#581C87'],
    payoutGreen: ['#166534', '#22C55E'],
  },

  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, color: '#F9FAFB' },
    h2: { fontSize: 22, fontWeight: '700' as const, color: '#F9FAFB' },
    h3: { fontSize: 18, fontWeight: '600' as const, color: '#F9FAFB' },
    body: { fontSize: 14, color: '#9CA3AF' },
    caption: { fontSize: 12, color: '#6B7280' },
    badge: { fontSize: 11, fontWeight: '700' as const },
  },

  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999,
  }
};
