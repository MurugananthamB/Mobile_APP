# Tailwind CSS Setup with NativeWind

This project has been configured to use Tailwind CSS with NativeWind for React Native.

## What's Been Installed

- `nativewind` - React Native implementation of Tailwind CSS
- `tailwindcss` - Tailwind CSS framework

## Configuration Files Created

1. **`tailwind.config.js`** - Tailwind configuration
2. **`babel.config.js`** - Babel configuration with NativeWind plugin
3. **`global.css`** - Global CSS with Tailwind directives
4. **`nativewind-env.d.ts`** - TypeScript declarations
5. **`tsconfig.json`** - TypeScript configuration

## How to Use Tailwind CSS

### Basic Usage

Instead of using inline styles, you can now use Tailwind classes:

```jsx
// Before (inline styles)
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
  <Text style={{ marginTop: 10, color: '#6b7280' }}>Hello World</Text>
</View>

// After (Tailwind classes)
<View className="flex-1 justify-center items-center bg-slate-50">
  <Text className="mt-2 text-gray-500">Hello World</Text>
</View>
```

### Common Tailwind Classes for React Native

#### Layout
- `flex-1` - flex: 1
- `flex-row` - flexDirection: 'row'
- `flex-col` - flexDirection: 'column'
- `justify-center` - justifyContent: 'center'
- `items-center` - alignItems: 'center'

#### Spacing
- `p-4` - padding: 16
- `px-4` - paddingHorizontal: 16
- `py-2` - paddingVertical: 8
- `m-2` - margin: 8
- `mt-4` - marginTop: 16
- `mb-2` - marginBottom: 8

#### Colors
- `bg-blue-500` - backgroundColor: '#3b82f6'
- `text-white` - color: '#ffffff'
- `text-gray-500` - color: '#6b7280'

#### Typography
- `text-lg` - fontSize: 18
- `text-sm` - fontSize: 14
- `font-bold` - fontWeight: 'bold'
- `text-center` - textAlign: 'center'

#### Borders
- `border` - borderWidth: 1
- `border-gray-300` - borderColor: '#d1d5db'
- `rounded-lg` - borderRadius: 8

## Example Component

```jsx
import { View, Text, TouchableOpacity } from 'react-native';

export default function ExampleComponent() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to School App
      </Text>
      
      <TouchableOpacity className="bg-blue-500 p-3 rounded-lg">
        <Text className="text-white text-center font-semibold">
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Notes

- NativeWind automatically converts Tailwind classes to React Native styles
- All standard Tailwind classes work as expected
- You can still use inline styles alongside Tailwind classes
- The configuration supports both JavaScript and TypeScript files

## Troubleshooting

If you encounter any issues:

1. Make sure the babel plugin is properly configured in `babel.config.js`
2. Verify that `global.css` is imported in your root layout
3. Check that the TypeScript declarations are included in your `tsconfig.json`
4. Restart your development server after configuration changes
