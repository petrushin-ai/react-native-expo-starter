# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## UI Components

The project includes a comprehensive set of reusable UI components:

### Core Components
- **Button** - Interactive buttons with variants, sizes, and loading states
- **Input** - Form input fields with validation and error states
- **PhoneInput** - International phone number input with country selection
- **Dropdown** - Single and multi-select dropdowns with search
- **DatePicker** - Date selection with single date and range modes
- **Modal** - Overlay dialogs for content and confirmations
- **Switch** - Toggle switches for binary settings

### PhoneInput Component

The PhoneInput component provides international phone number input with the following features:

#### Features
- 🌍 **International Support** - Support for all countries with flag icons
- 🎨 **Theme Aware** - Automatic light/dark theme adaptation
- ✅ **Validation** - Built-in phone number validation
- 🔍 **Search** - Country search functionality in dropdown
- 📱 **Formatting** - Automatic number formatting per country
- ♿ **Accessible** - Full accessibility support

#### Usage

```typescript
import { PhoneInput, isValidPhoneNumber, ICountry } from '@/components/ui/PhoneInput';

const [phoneValue, setPhoneValue] = useState<string>('');
const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

<PhoneInput
  label="Phone Number"
  placeholder="Enter your phone number"
  value={phoneValue}
  onChangePhoneNumber={setPhoneValue}
  selectedCountry={selectedCountry}
  onChangeSelectedCountry={setSelectedCountry}
  defaultCountry="US"
  error={error}
  touched={touched}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Label text for the input |
| `placeholder` | `string` | Placeholder text |
| `value` | `string` | Current phone number value |
| `onChangePhoneNumber` | `(value: string) => void` | Phone number change handler |
| `selectedCountry` | `ICountry \| null` | Currently selected country |
| `onChangeSelectedCountry` | `(country: ICountry) => void` | Country change handler |
| `error` | `string` | Error message |
| `touched` | `boolean` | Whether the field has been touched |
| `disabled` | `boolean` | Disable the input |
| `defaultCountry` | `string` | Default country code (e.g., "US") |
| `showOnly` | `string[]` | Show only specific countries |
| `popularCountries` | `string[]` | Countries to show at the top |
| `language` | `string` | Interface language |

#### Validation

Use the `isValidPhoneNumber` function to validate phone numbers:

```typescript
const isValid = isValidPhoneNumber(phoneValue, selectedCountry);
```

### Examples

The `/components` tab in the app showcases all UI components with interactive examples including:

- Basic phone input with validation
- Error states and form integration
- Pre-filled values and default countries
- Limited country selection
- Disabled states
- Real-time validation feedback

### Styling

All components follow the design system with:
- Consistent spacing and typography
- Theme-aware color schemes
- Smooth animations and transitions
- Accessibility-first design
- Mobile-optimized touch targets
