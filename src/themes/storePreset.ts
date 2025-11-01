import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const StorePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f8fafc',
      100: '#e2e8f0',
      200: '#cbd5f5',
      300: '#94a3b8',
      400: '#475569',
      500: '#111827',
      600: '#0f172a',
      700: '#0b1220',
      800: '#070a16',
      900: '#020617',
      950: '#01030b',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          color: '#111827',
          contrastColor: '#ffffff',
          hoverColor: '#0b1220',
          activeColor: '#000000',
        },
        highlight: {
          background: '#e2e8f0',
          focusBackground: '#cbd5f5',
          color: '#0f172a',
          focusColor: '#020617',
        },
        text: {
          color: '#0f172a',
          hoverColor: '#020617',
          mutedColor: '#475569',
          hoverMutedColor: '#334155',
        },
        formField: {
          background: '#ffffff',
          disabledBackground: '#e2e8f0',
          filledBackground: '#f8fafc',
          filledHoverBackground: '#eef2f6',
          filledFocusBackground: '#f8fafc',
          borderColor: '#e2e8f0',
          hoverBorderColor: '#cbd5f5',
          focusBorderColor: '#111827',
          invalidBorderColor: '#ef4444',
          color: '#0f172a',
          disabledColor: '#94a3b8',
          placeholderColor: '#64748b',
          invalidPlaceholderColor: '#dc2626',
          floatLabelColor: '#64748b',
          floatLabelFocusColor: '#111827',
          floatLabelActiveColor: '#475569',
          floatLabelInvalidColor: '#ef4444',
          iconColor: '#94a3b8',
          shadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        },
        content: {
          background: '#ffffff',
          hoverBackground: '#f8fafc',
          borderColor: '#e2e8f0',
          color: '#0f172a',
          hoverColor: '#020617',
        },
        overlay: {
          select: {
            background: '#ffffff',
            borderColor: '#e2e8f0',
            color: '#0f172a',
          },
          popover: {
            background: '#ffffff',
            borderColor: '#e2e8f0',
            color: '#0f172a',
          },
          modal: {
            background: '#ffffff',
            borderColor: '#e2e8f0',
            color: '#0f172a',
          },
        },
      },
    },
  },
})

export default StorePreset
