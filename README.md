# Oura Ring Dashboard - Advanced Health Analytics

A next-generation health analytics dashboard for Oura Ring with AI-powered insights, predictive modeling, and comprehensive data visualization.

## ✨ Features

### 🧠 **Next-Generation AI Engine**
- **Advanced Statistical Analysis**: Linear regression, correlation analysis, anomaly detection, time series decomposition
- **Personalized Baselines**: Adaptive thresholds based on your personal history
- **Illness Prediction**: Multi-factor early warning system using HRV, RHR, temperature, and sleep patterns
- **Performance Forecasting**: 7-day predictions with confidence intervals
- **Training Load Analysis**: Acute:chronic workload ratio, overtraining detection
- **Chronotype Detection**: Automatic identification of your sleep-wake preference
- **Recovery Optimization**: Personalized recovery recommendations

### 📊 **Comprehensive Analytics**
- **Multi-Metric Dashboard**: Sleep, Activity, and Readiness scores with trends
- **30-Day Health Overview**: Area charts with trend lines
- **Week-over-Week Comparison**: Radar charts for performance analysis
- **Sleep Architecture**: Deep, REM, and light sleep phase breakdown
- **Activity Tracking**: Steps, calories, and activity patterns
- **Heatmap Calendar**: Year-round visualization of all metrics

### 🎯 **Smart Features**
- **Goal Tracking**: Set and track personalized health goals
- **Sleep Debt Calculator**: Cumulative sleep deficit tracking
- **AI-Powered Insights**: Natural language health recommendations
- **PDF Export**: Generate comprehensive health reports
- **Dark Mode**: Full dark theme support
- **Error Boundaries**: Robust error handling throughout the app

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- An Oura Ring account
- Oura API Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RaakinShah/oura-dashboard.git
   cd oura-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting Your Oura API Token

1. Go to [Oura Cloud Personal Access Tokens](https://cloud.ouraring.com/personal-access-tokens)
2. Log in with your Oura account
3. Click "Create A New Personal Access Token"
4. Give it a name (e.g., "Dashboard")
5. **Copy the ENTIRE token** (100+ characters - make sure you get it all!)
6. Paste it into the Settings page in the app
7. Click "Test Before Saving" to verify it works

## 🏗️ Architecture

### AI Engine Modules
```
lib/ai-engine/
├── core.ts              # Main AI coordinator
├── statistics.ts        # Advanced statistical methods
├── personalization.ts   # Adaptive baselines & user profiling
├── predictions.ts       # Forecasting & illness prediction
└── types.ts             # Shared TypeScript interfaces
```

### Key Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Storage**: Browser localStorage (client-side only)

## 🧪 AI Capabilities

### Statistical Analysis
- **Linear Regression**: Trend detection with p-values and R²
- **Correlation Analysis**: Pearson correlation with significance testing
- **Anomaly Detection**: Z-score and isolation-based outlier detection
- **Change Point Detection**: CUSUM algorithm for trend shifts
- **Time Series Decomposition**: Trend, seasonal, and residual components
- **Autocorrelation**: Periodicity detection

### Predictive Models
- **7-Day Forecast**: Multi-factor predictions with confidence intervals
- **Illness Risk**: Early warning system (24-72h ahead)
- **Performance Trajectory**: Future performance estimation
- **Recovery Time**: Estimated days to full recovery

### Personalization
- **Adaptive Thresholds**: Based on your personal history
- **Chronotype Detection**: Early bird vs night owl identification
- **Optimal Sleep Duration**: Calculated from your readiness patterns
- **Training Load Balance**: Personalized acute:chronic ratios

## 📈 Code Quality Improvements

### What Was Fixed
✅ Removed all console.log statements from production code
✅ Fixed inefficient page reload in data refetch
✅ Resolved potential infinite loop in goals page
✅ Removed duplicated theme logic
✅ Fixed TypeScript `any` types with proper interfaces
✅ Added memoization to expensive AI calculations
✅ Implemented error boundaries at route level
✅ Split monolithic 1500-line AI file into modular structure

### Code Architecture
- **Modular**: Clean separation of concerns across modules
- **Type-Safe**: Comprehensive TypeScript interfaces throughout
- **Performant**: Memoization, efficient algorithms
- **Maintainable**: Well-documented, organized code structure
- **Robust**: Error boundaries and graceful error handling

## 📊 Data Privacy & Security

- **100% Client-Side**: All data processing happens in your browser
- **No Server**: Your health data never touches our servers
- **Local Storage**: Data stored only on your device
- **Secure API**: Direct connection to Oura API with your personal token
- **No Tracking**: No analytics, no third-party scripts

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Full dark theme support with system preference detection
- **Smooth Animations**: Polished transitions and loading states
- **Intuitive Navigation**: Clear sidebar with active state indicators
- **Error States**: Helpful error messages and recovery options
- **Loading States**: Skeleton screens and spinners

## 🔧 Development

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📝 License

MIT License - feel free to use this project for your own health tracking!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- **Oura Health**: For the amazing Oura Ring and API
- **Next.js Team**: For the excellent React framework
- **Open Source Community**: For the libraries that make this possible

## 📧 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/RaakinShah/oura-dashboard/issues) on GitHub.

---

**Built with ❤️ for better health insights**
