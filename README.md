# MenuGenie - AI-Powered Menu Translation & Analysis

MenuGenie is a comprehensive web application that transforms restaurant menu photos into intelligent, translated, and analyzed digital menus using advanced AI technologies.

## Features

- **Smart OCR**: Extract text from menu photos using Google Cloud Vision API
- **Multi-Language Translation**: Translate menus to 15+ languages with Google Translate API
- **Intelligent Parsing**: Structure menu items with prices, descriptions, and sections
- **Ingredient Analysis**: Identify proteins, allergens, herbs, and spices
- **Dietary Classification**: Automatic detection of vegetarian, vegan, halal, kosher, and other dietary preferences
- **Visual Food Representation**: Search and display relevant food images using Pexels API
- **Confidence Scoring**: Display reliability ratings for all AI-generated classifications
- **Export Options**: Export processed menus as JSON or offline HTML galleries
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

## API Configuration

To use the full functionality of MenuGenie, you need to configure API keys for the following services:

### Required APIs

1. **Google Cloud Vision API** - For OCR text extraction
2. **Google Translate API** - For language detection and translation
3. **Pexels API** - For food image search

### Setup Instructions

1. **Google Cloud APIs**:
   - Create a Google Cloud Platform account
   - Create a new project or select an existing one
   - Enable the "Cloud Vision API" and "Cloud Translation API"
   - Create API keys and restrict them to these services for security

2. **Pexels API**:
   - Sign up for a free account at [Pexels Developer](https://www.pexels.com/api/)
   - Get your API key from the dashboard

3. **Configure API Keys**:
   - Open `src/config/api.ts`
   - Replace the placeholder values with your actual API keys:

```typescript
export const API_CONFIG = {
  googleVision: {
    apiKey: 'YOUR_ACTUAL_GOOGLE_VISION_API_KEY',
    endpoint: 'https://vision.googleapis.com/v1/images:annotate',
  },
  googleTranslate: {
    apiKey: 'YOUR_ACTUAL_GOOGLE_TRANSLATE_API_KEY',
    endpoint: 'https://translation.googleapis.com/language/translate/v2',
  },
  pexels: {
    apiKey: 'YOUR_ACTUAL_PEXELS_API_KEY',
    endpoint: 'https://api.pexels.com/v1/search',
  },
  // ... rest of configuration
};
```

## Installation & Development

1. **Clone the repository**:
```bash
git clone <repository-url>
cd menugenie
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure API keys** (see API Configuration section above)

4. **Start development server**:
```bash
npm run dev
```

5. **Build for production**:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── MenuUpload.tsx   # File upload interface
│   ├── ProcessingStatus.tsx # Processing progress display
│   ├── MenuCard.tsx     # Individual menu item display
│   ├── MenuGrid.tsx     # Grid layout for menu items
│   ├── SettingsPanel.tsx # User settings and preferences
│   └── DietaryIcons.tsx # Dietary restriction icons
├── services/            # Business logic and API services
│   ├── menuService.ts   # Main menu processing orchestration
│   ├── apiService.ts    # External API integrations
│   └── menuParser.ts    # Menu text parsing and analysis
├── hooks/               # Custom React hooks
│   └── useMenu.ts       # Menu state management
├── types/               # TypeScript type definitions
│   └── menu.ts          # Menu-related interfaces
├── config/              # Configuration files
│   └── api.ts           # API endpoints and keys
└── App.tsx              # Main application component
```

## Supported Languages

MenuGenie supports translation to the following languages:
- English, Spanish, French, German, Italian, Portuguese
- Japanese, Korean, Chinese, Arabic, Hindi, Thai
- Russian, Dutch, Swedish

## Security Considerations

**Important**: The current implementation includes API keys in the client-side bundle, which is suitable for development and demonstration purposes only. For production deployment:

1. **Use a Backend Proxy**: Create a backend service to handle API calls and keep keys secure
2. **Environment Variables**: Use server-side environment variables for API keys
3. **API Key Restrictions**: Restrict API keys to specific domains and services
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Fallback Mode

If API keys are not configured, MenuGenie will automatically fall back to mock data mode, allowing you to explore the interface and functionality without real API integration.

## Browser Compatibility

MenuGenie is compatible with all modern browsers that support:
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- File API for image uploads
- Fetch API for network requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.