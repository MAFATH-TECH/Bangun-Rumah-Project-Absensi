const tintColorLight = '#0d9488';
const tintColorDark = '#5eead4';

const Colors = {
  light: {
    text: '#0f172a',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: tintColorDark,
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
  },
} as const;

export const colors = {
  primary: '#FACC15',
  background: '#FFFFFF',
  text: '#000000',
};

export default Colors;
