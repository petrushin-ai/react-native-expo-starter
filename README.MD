<div align="center">
  <img src="PLACEHOLDER_WITH_IMAGE_NAME_LOGO" alt="React Native Expo Bootstrap" width="120" height="120">
  
  <h1 align="center">React Native Expo Bootstrap</h1>
  
  <p align="center">
    <strong>🚀 Production-Ready Mobile App Starter Kit</strong>
  </p>
  
  <p align="center">
    A carefully crafted React Native Expo bootstrap that combines the latest technologies with battle-tested components
  </p>
  
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#project-structure">Structure</a> •
    <a href="#contributing">Contributing</a>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native">
    <img src="https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
    <img src="https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </p>
</div>

---

## ✨ Features

### 🎨 **Modern UI/UX Design**
Experience a beautifully crafted interface with smooth animations, gesture support, and responsive layouts. The app features a floating tab bar design, custom drawer navigation, and carefully designed components that adapt seamlessly to different screen sizes and orientations.

### 🌓 **Dark Mode Support**
Comprehensive dark and light theme implementation with automatic system detection. Every component is optimized for both themes, ensuring a consistent and comfortable viewing experience across all lighting conditions.

### 🔐 **Authentication System**
Flexible authentication system with environment-based configuration. Features secure session management, form validation, and beautiful sign-in/sign-up screens with animated transitions between login and registration modes.

### 📊 **Interactive Charts**
Powered by Victory Native XL, the app includes various interactive chart components:
- **Gesture-enabled Bar Charts** with real-time selection and enhanced tooltips
- **Line Charts** with multiple interpolation types (natural, cardinal, step, linear)
- **Ring Charts** with interactive legends and center value display
- **Thin Ring Charts** for compact data visualization

### 📱 **Rich Component Library**
An extensive collection of reusable UI components including:
- **Buttons** with multiple variants, sizes, and loading states
- **Inputs** with comprehensive validation and error handling
- **Modals** with different types (info, warning, error, success)
- **Date Pickers** with single date and range selection
- **Dropdowns** with single and multi-select support
- **Phone Input** with international country code support
- **Switches** and toggles with smooth animations
- **Avatar** components with badge support
- **Expandable Views** with smooth height animations
- **Clipboard Input** for easy copy functionality
- **PDF Viewer** with download capabilities
- **Lottie Animations** for delightful micro-interactions

### 📅 **Calendar Component**
A sophisticated calendar implementation featuring:
- Smooth scrolling between months
- Booking management visualization
- Multi-day event spans
- Availability status indicators
- Lazy loading for performance
- Gesture support for navigation

### 🔔 **Push Notifications**
Complete push notification setup with:
- Expo push notification integration
- Permission management with user-friendly prompts
- Test notification functionality
- Token generation and management
- Background notification handling

### ⚡ **Performance Optimized**
Built with performance in mind:
- Lazy loading and code splitting
- Optimized list rendering with FlatList
- Memoized components to prevent unnecessary re-renders
- Efficient animation handling with Reanimated 3
- Proper cleanup and memory management

### 🛡️ **Permission Management**
Smart permission handling system for:
- Camera access
- Location services
- Notification permissions
- Photo library access
- With user-friendly prompts and settings navigation

### 🎯 **Developer Experience**
- TypeScript for type safety
- ESLint configuration for code quality
- Organized project structure
- Custom hooks for common functionality
- Comprehensive error handling
- Debug mode for development

---

## 📱 Screenshots

### 🏠 Home Screen
PLACEHOLDER_WITH_IMAGE_NAME_HOME_SCREEN

The home screen welcomes users with a clean, modern interface featuring quick action buttons, feature highlights, and a delightful animated greeting. The screen includes pull-to-refresh functionality and showcases the app's key features with beautiful card layouts.

### 📊 Charts Dashboard
PLACEHOLDER_WITH_IMAGE_NAME_CHARTS_SCREEN

Interactive charts powered by Victory Native XL provide smooth gestures, real-time data updates, and beautiful animations. Users can interact with bar charts by dragging to see values, toggle data points on line charts, and explore different interpolation types.

### 🎨 UI Components Showcase
PLACEHOLDER_WITH_IMAGE_NAME_COMPONENTS_SCREEN

A comprehensive showcase of all UI components available in the kit. From buttons and inputs to complex components like date pickers and phone inputs, everything is interactive and theme-aware.

### 📅 Calendar View
PLACEHOLDER_WITH_IMAGE_NAME_CALENDAR_SCREEN

The calendar component displays booking information with color-coded statuses, multi-day event spans, and smooth month navigation. Perfect for booking apps, scheduling, or event management.

### 👤 Profile Management
PLACEHOLDER_WITH_IMAGE_NAME_PROFILE_SCREEN

User profile screen with account status, quick actions, and settings overview. Features authentication status display and secure sign-out functionality.

### ⚙️ Settings
PLACEHOLDER_WITH_IMAGE_NAME_SETTINGS_SCREEN

Comprehensive settings screen with theme selection, notification preferences, and permission management. All settings are persisted and apply immediately.

### 🔐 Authentication
PLACEHOLDER_WITH_IMAGE_NAME_SIGNIN_SCREEN

Beautiful authentication screens with smooth animations between login and signup modes. Features form validation, password visibility toggle, and social login placeholders.

### 🍔 Navigation Drawer
PLACEHOLDER_WITH_IMAGE_NAME_DRAWER_SCREEN

Custom drawer navigation with user profile, navigation links, and theme toggle. Smooth animations and gesture support for an intuitive navigation experience.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Expo Go app on your physical device (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/petrushin-ai/react-native-expo-bootstrap.git
   cd react-native-expo-bootstrap
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Configure your environment variables:
   ```env
   EXPO_PUBLIC_AUTH_ENABLED=false  # Set to true to enable authentication
   EXPO_PUBLIC_API_URL=https://your-api-url.com
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

### Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

---

## 🛠️ Tech Stack

### Core
- **React Native** 0.74.5 - Cross-platform mobile framework
- **Expo** SDK 51 - Development platform and tooling
- **TypeScript** 5.3.3 - Type safety and better DX
- **React Navigation** 6 - Navigation solution

### UI & Styling
- **React Native Reanimated** 3 - Smooth animations
- **React Native Gesture Handler** - Touch gestures
- **Victory Native XL** - Data visualization
- **Lottie React Native** - Vector animations
- **React Native SVG** - SVG support

### State & Data
- **React Context API** - Global state management
- **Async Storage** - Local data persistence
- **Expo Secure Store** - Secure storage

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Expo Dev Client** - Custom development builds

---

## 📁 Project Structure

```
react-native-expo/
├── app/                    # Expo Router app directory
│   ├── (protected)/       # Protected routes
│   │   ├── (tabs)/       # Tab navigation screens
│   │   └── calendar.tsx  # Calendar screen
│   ├── _layout.tsx       # Root layout
│   ├── index.tsx         # Entry point
│   └── sign-in.tsx       # Authentication
├── components/            # Reusable components
│   ├── charts/           # Chart components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── constants/            # App constants
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── types/                # TypeScript types
├── utils/                # Utility functions
└── assets/               # Images, fonts, etc.
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Credits

<div align="center">
  <p>Made with ❤️ by</p>
  
  <a href="https://t.me/wedigital">
    <img src="https://img.shields.io/badge/Telegram-@wedigital-0088cc?style=for-the-badge&logo=telegram" alt="Telegram">
  </a>
  
  <a href="https://github.com/petrushin-ai">
    <img src="https://img.shields.io/badge/GitHub-petrushin.ai-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  
  <a href="mailto:petrushin.a@live.ru">
    <img src="https://img.shields.io/badge/Email-petrushin.a@live.ru-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
</div>

---

<div align="center">
  <p>If you found this project helpful, please consider giving it a ⭐️</p>
  <p>頑張って！ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧</p>
</div>
