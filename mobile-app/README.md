# Chan Theory Mobile App

A React + Capacitor mobile app that connects to your Flask backend for Chan Theory stock analysis.

## 🚀 Quick Start

### 1. Test the Web Version
```bash
# Open index.html in your browser
# It should connect to: https://chan-stock-theory.onrender.com
```

### 2. Install Capacitor (if Node.js is working)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init ChanTheoryApp com.chantheory.app
```

### 3. Add Mobile Platforms
```bash
# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android

# Copy web assets to native projects
npx cap copy
```

### 4. Open in Native IDEs
```bash
# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio
npx cap open android
```

## 📱 Mobile App Features

- **Stock Analysis**: Input symbol, timeframe, and date range
- **Real-time API**: Connects to your Flask backend
- **Responsive Design**: Optimized for mobile screens
- **Chart Display**: Shows Chan Theory analysis charts
- **Report View**: Displays analysis results

## 🔧 Configuration

### API Endpoint
The app connects to: `https://chan-stock-theory.onrender.com`

### Capacitor Config
```typescript
// capacitor.config.ts
{
  appId: 'com.chantheory.app',
  appName: 'ChanTheoryApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}
```

## 📦 Build Commands

```bash
# Build web assets
npm run build

# Copy to native projects
npx cap copy

# Sync plugins
npx cap sync

# Open platforms
npm run cap:open:ios
npm run cap:open:android
```

## 🎯 Next Steps

1. **Test Web Version**: Open `index.html` in browser
2. **Install Capacitor**: Run the npm commands above
3. **Add Platforms**: iOS and Android
4. **Build & Test**: Use Xcode/Android Studio
5. **Deploy**: Follow app store guidelines

## 📋 App Store Requirements

### iOS
- Apple Developer Account ($99/year)
- Xcode for building
- App Store Connect for submission

### Android  
- Google Play Console ($25 one-time)
- Android Studio for building
- Signed APK/AAB for upload

## 🔗 Backend Integration

The mobile app makes these API calls:
- `GET /` - Health check
- `POST /analyze` - Run stock analysis
- `POST /validate` - Validate accuracy

All requests go to your deployed Flask backend at `chan-stock-theory.onrender.com`.

## 📱 Mobile-Specific Features

- Touch-optimized interface
- Responsive design for all screen sizes
- Native app performance
- Offline capability (cached data)
- Push notifications (can be added)

## 🛠️ Troubleshooting

### Node.js Issues
If npm commands don't work, use the web version directly:
1. Open `index.html` in browser
2. Test API connection
3. Use Capacitor later when Node.js is fixed

### API Connection
- Ensure Flask backend is running
- Check CORS settings
- Verify HTTPS certificate

### Build Issues
- Clear node_modules and reinstall
- Check Capacitor version compatibility
- Ensure all dependencies are installed

## 📞 Support

This mobile app is ready to use! The web version works immediately, and the mobile version can be built once Capacitor is properly installed.