# Android 15 Migration Analyzer

A comprehensive web-based tool to analyze Android projects for Android 15 (API level 35) compatibility issues and migration requirements.

## Features

- **File Upload Support**: Drag and drop or browse for Android project files (.java, .kt, .xml, .gradle, .json)
- **Comprehensive Analysis**: Detects potential compatibility issues with Android 15
- **Severity Classification**: Issues categorized as Critical, Warning, or Info
- **Interactive Results**: Filter and browse detected issues
- **Migration Guidance**: Built-in Android 15 migration guide
- **Compatibility Score**: Overall project compatibility assessment
- **Demo Mode**: Try the analyzer with sample data

## Analysis Categories

### 🔒 Privacy & Security Changes
- Enhanced security for partial photo and video access
- Private space functionality impact
- Background activity restrictions

### 📱 User Experience
- Predictive back gesture improvements
- Edge-to-edge enforcement for API 35+
- New notification experience

### ⚡ Performance & Graphics
- OpenJDK 17 features and API updates
- Camera and media improvements
- Dynamic performance framework

## How to Use

1. **Upload Files**: Drag and drop your Android project files or click "Browse Files"
2. **View Results**: Review the analysis results with severity indicators
3. **Filter Issues**: Use category tabs to filter by Critical, Warning, or Info issues
4. **Follow Guidance**: Read recommendations for each detected issue
5. **Check Migration Guide**: Review the comprehensive Android 15 migration guide

## Supported File Types

- `.java` - Java source files
- `.kt` - Kotlin source files
- `.xml` - Android XML layout and manifest files
- `.gradle` - Gradle build scripts
- `.json` - Configuration files

## Detection Rules

The analyzer checks for:

- Target SDK version compatibility
- Deprecated API usage
- Privacy and security changes
- Background activity restrictions
- Edge-to-edge display requirements
- Notification system updates
- Camera and media API changes
- Performance optimization opportunities

## Live Demo

Try the analyzer at: [Your GitHub Pages URL]

## Local Development

1. Clone this repository
2. Open `index.html` in a web browser
3. No build process required - it's a client-side application

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Additional detection rules
- UI/UX improvements
- Bug fixes
- Documentation updates

## Resources

- [Android 15 Developer Guide](https://developer.android.com/about/versions/15)
- [Android 15 Behavior Changes](https://developer.android.com/about/versions/15/behavior-changes-15)
- [Migration Guide](https://developer.android.com/about/versions/15/migration)

## License

This project is open source and available under the [MIT License](LICENSE).

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Privacy

This tool processes files entirely in your browser. No files are uploaded to any server, ensuring your code privacy and security.

---

Built with ❤️ for the Android developer community
