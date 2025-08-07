import { StyleSheet } from 'react-native';

// Tailwind color palette
const colors = {
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  blue: {
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  green: {
    500: '#10b981',
    600: '#059669',
  },
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
  yellow: {
    500: '#f59e0b',
  },
  purple: {
    500: '#8b5cf6',
  },
  orange: {
    500: '#f97316',
  },
};

// Spacing scale
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

// Font sizes
const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

// Border radius
const borderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// Parse Tailwind classes and convert to React Native styles
export function tw(classes) {
  if (!classes) return {};
  
  const classArray = classes.split(' ').filter(Boolean);
  const styles = {};

  classArray.forEach(className => {
    // Handle responsive classes (sm:, md:, lg:)
    const responsiveMatch = className.match(/^(sm|md|lg):(.+)$/);
    if (responsiveMatch) {
      // For now, we'll apply the responsive styles as regular styles
      // In a real implementation, you'd check screen size
      const responsiveClass = responsiveMatch[2];
      processClass(responsiveClass, styles);
      return;
    }

    processClass(className, styles);
  });

  return styles;
}

function processClass(className, styles) {
  // Layout
  if (className === 'flex-1') styles.flex = 1;
  if (className === 'flex-row') styles.flexDirection = 'row';
  if (className === 'flex-col') styles.flexDirection = 'column';
  if (className === 'justify-center') styles.justifyContent = 'center';
  if (className === 'justify-between') styles.justifyContent = 'space-between';
  if (className === 'items-center') styles.alignItems = 'center';
  if (className === 'items-start') styles.alignItems = 'flex-start';
  if (className === 'items-end') styles.alignItems = 'flex-end';

  // Spacing
  const paddingMatch = className.match(/^p-(\d+)$/);
  if (paddingMatch) styles.padding = spacing[paddingMatch[1]];

  const paddingXMatch = className.match(/^px-(\d+)$/);
  if (paddingXMatch) styles.paddingHorizontal = spacing[paddingXMatch[1]];

  const paddingYMatch = className.match(/^py-(\d+)$/);
  if (paddingYMatch) styles.paddingVertical = spacing[paddingYMatch[1]];

  const marginMatch = className.match(/^m-(\d+)$/);
  if (marginMatch) styles.margin = spacing[marginMatch[1]];

  const marginTopMatch = className.match(/^mt-(\d+)$/);
  if (marginTopMatch) styles.marginTop = spacing[marginTopMatch[1]];

  const marginBottomMatch = className.match(/^mb-(\d+)$/);
  if (marginBottomMatch) styles.marginBottom = spacing[marginBottomMatch[1]];

  const marginLeftMatch = className.match(/^ml-(\d+)$/);
  if (marginLeftMatch) styles.marginLeft = spacing[marginLeftMatch[1]];

  const marginRightMatch = className.match(/^mr-(\d+)$/);
  if (marginRightMatch) styles.marginRight = spacing[marginRightMatch[1]];

  // Colors
  const bgColorMatch = className.match(/^bg-(\w+)-(\d+)$/);
  if (bgColorMatch) {
    const color = bgColorMatch[1];
    const shade = bgColorMatch[2];
    if (colors[color] && colors[color][shade]) {
      styles.backgroundColor = colors[color][shade];
    }
  }

  if (className === 'bg-white') styles.backgroundColor = colors.white;

  const textColorMatch = className.match(/^text-(\w+)-(\d+)$/);
  if (textColorMatch) {
    const color = textColorMatch[1];
    const shade = textColorMatch[2];
    if (colors[color] && colors[color][shade]) {
      styles.color = colors[color][shade];
    }
  }

  if (className === 'text-white') styles.color = colors.white;

  // Typography
  const fontSizeMatch = className.match(/^text-(\w+)$/);
  if (fontSizeMatch && fontSize[fontSizeMatch[1]]) {
    styles.fontSize = fontSize[fontSizeMatch[1]];
  }

  if (className === 'font-bold') styles.fontWeight = 'bold';
  if (className === 'font-semibold') styles.fontWeight = '600';
  if (className === 'font-medium') styles.fontWeight = '500';
  if (className === 'text-center') styles.textAlign = 'center';
  if (className === 'text-left') styles.textAlign = 'left';
  if (className === 'text-right') styles.textAlign = 'right';

  // Borders
  if (className === 'border') styles.borderWidth = 1;
  
  const borderColorMatch = className.match(/^border-(\w+)-(\d+)$/);
  if (borderColorMatch) {
    const color = borderColorMatch[1];
    const shade = borderColorMatch[2];
    if (colors[color] && colors[color][shade]) {
      styles.borderColor = colors[color][shade];
    }
  }

  const borderRadiusMatch = className.match(/^rounded-(\w+)$/);
  if (borderRadiusMatch && borderRadius[borderRadiusMatch[1]]) {
    styles.borderRadius = borderRadius[borderRadiusMatch[1]];
  }

  // Shadows
  if (className === 'shadow-sm') {
    styles.shadowColor = '#000';
    styles.shadowOffset = { width: 0, height: 1 };
    styles.shadowOpacity = 0.05;
    styles.shadowRadius = 2;
    styles.elevation = 1;
  }

  if (className === 'shadow-lg') {
    styles.shadowColor = '#000';
    styles.shadowOffset = { width: 0, height: 4 };
    styles.shadowOpacity = 0.1;
    styles.shadowRadius = 8;
    styles.elevation = 5;
  }

  // Opacity
  const opacityMatch = className.match(/^opacity-(\d+)$/);
  if (opacityMatch) {
    styles.opacity = parseInt(opacityMatch[1]) / 100;
  }

  // Width/Height
  const widthMatch = className.match(/^w-(\d+)$/);
  if (widthMatch) styles.width = spacing[widthMatch[1]];

  const heightMatch = className.match(/^h-(\d+)$/);
  if (heightMatch) styles.height = spacing[heightMatch[1]];

  if (className === 'w-full') styles.width = '100%';
  if (className === 'h-full') styles.height = '100%';

  // Max width and centering
  if (className === 'max-w-sm') styles.maxWidth = 384; // 24rem
  if (className === 'max-w-md') styles.maxWidth = 448; // 28rem
  if (className === 'mx-auto') styles.alignSelf = 'center';
}

// Create a StyleSheet with Tailwind classes
export function createTwStyle(styles) {
  return StyleSheet.create(styles);
}
