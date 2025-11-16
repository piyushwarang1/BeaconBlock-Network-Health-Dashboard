# BeaconBlock: Dynamic Substrate Chain Integration Dashboard

BeaconBlock is a next-generation network health dashboard and blockchain explorer specifically engineered for the Substrate and Polkadot ecosystem. The platform represents a paradigm shift in how blockchain explorers and monitoring tools approach multi-chain support, moving away from static, hardcoded chain configurations toward a fully dynamic, metadata-driven architecture.

## 🚀 Key Features

- **Dynamic Chain Discovery**: Add any Substrate-based blockchain by simply providing a WebSocket RPC endpoint
- **Automatic Adaptation**: Automatically detects and adapts to runtime upgrades without user intervention
- **Universal Compatibility**: Works with Polkadot, Kusama, all parachains, independent Substrate chains, and private networks
- **Real-time Monitoring**: Live block updates, validator performance tracking, and network health metrics
- **Unified Experience**: Monitor multiple chains through a single, consistent interface

## 🏗️ Architecture

### Frontend (Client)
- **React 18** with TypeScript for modern, type-safe UI development
- **Tailwind CSS** for responsive, utility-first styling
- **Vite** for fast development and optimized builds
- **React Query** for efficient data fetching and caching
- **Zustand** for lightweight state management
- **Recharts** for beautiful data visualizations

### Backend (Serverless)
- **Vercel Serverless Functions** for scalable API endpoints
- **TypeScript** for type safety and better developer experience
- **Polkadot.js API** for Substrate chain interactions
- **Winston** for structured logging

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BeaconBlock-Network-Health-Dashboard
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for the root, client, and server components.

3. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both the client (React) on http://localhost:5173 and the server (Express) on http://localhost:3001 concurrently.

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   cd client
   vercel --prod
   ```

   Follow the prompts to link your Vercel account and deploy the application.

3. **Environment Variables**
   Configure environment variables in your Vercel dashboard or using the CLI:
   ```bash
   vercel env add LOG_LEVEL
   ```

## 🎯 Usage

### Adding a New Chain

1. Navigate to the dashboard
2. Click "Add Chain" in the sidebar
3. Enter the WebSocket RPC endpoint (e.g., `wss://rpc.polkadot.io`)
4. BeaconBlock will automatically:
   - Query chain metadata
   - Detect runtime version
   - Configure chain properties
   - Start real-time monitoring

### Monitoring Features

- **Network Health**: Block production rate, finalization time, validator count
- **Validator Analytics**: Performance metrics, slash events, staking rewards
- **Chain Statistics**: Total issuance, active accounts, transaction volume
- **Real-time Updates**: Live block feeds and network events

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend with Vercel serverless functions
│   ├── api/               # Serverless API routes
│   │   ├── _lib/          # Shared services and utilities
│   │   └── chains/        # Chain-related API endpoints
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # API client and utilities
│   │   └── types/        # TypeScript definitions
│   ├── public/           # Static assets
│   └── package.json      # Client dependencies
├── server/               # Express.js backend API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic services
│   │   ├── types/        # TypeScript definitions
│   │   └── index.ts      # Server entry point
│   ├── migrations/       # Database migrations
│   └── package.json      # Server dependencies
├── serverless/           # Vercel serverless functions
│   ├── functions/        # Serverless function handlers
│   └── package.json      # Serverless dependencies
├── predictive-analytics/ # Python ML service
│   ├── app.py           # Flask API
│   ├── sentiment_overlay.py # Sentiment analysis
│   └── requirements.txt # Python dependencies
└── package.json          # Root package.json with workspace scripts
```

## 🌐 Supported Networks

BeaconBlock works with any Substrate-based blockchain, including:

- **Relay Chains**: Polkadot, Kusama, Westend
- **Parachains**: Acala, Moonbeam, Astar, Parallel, and 100+ others
- **Solo Chains**: Any independent Substrate chain
- **Private Networks**: Custom enterprise deployments
- **Test Networks**: Development and staging environments

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to:

- Report bugs and request features
- Submit pull requests
- Follow our coding standards
- Run tests and ensure quality

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Substrate Documentation](https://docs.substrate.io/)
- [Polkadot.js API Documentation](https://polkadot.js.org/docs/)
- [Polkadot Network](https://polkadot.network/)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Join our community discussions

### Available Scripts

**Root (in project root directory):**
- `npm run install:all` - Install dependencies for all components
- `npm run dev` - Start both client and server development servers concurrently
- `npm run client:dev` - Start only the client development server
- `npm run server:dev` - Start only the server development server
- `npm run build` - Build the client for production

**Client (in client/ directory):**
- `npm run dev` - Start the frontend development server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally

**Server (in server/ directory):**
- `npm run dev` - Start the Express server in development mode
- `npm run build` - Build the server for production
- `npm run start` - Start the production server

**Vercel Commands:**
- `vercel dev` - Start local development server with Vercel functions
- `vercel --prod` - Deploy to production
- `vercel env add VARIABLE_NAME` - Add environment variables

## 🤖 Predictive Analytics

The predictive analytics component provides machine learning-powered insights for network health monitoring:

- **Price Prediction**: Forecast token price movements using historical data
- **Volume Analysis**: Predict trading volume patterns
- **Sentiment Analysis**: Analyze market sentiment from social media and news
- **Network Health Forecasting**: Predict potential network issues before they occur

To run the predictive analytics service:
```bash
cd predictive-analytics
pip install -r requirements.txt
python app.py
```

---

# BeaconBlock-Network-Health-Dashboard
Real-time visualization dashboard for Polkadot network - built for Polkadot Hackathon

# BeaconBlock-Network-Health-Dashboard
Real-time visualization dashboard for Polkadot network - built for Polkadot Hackathon

# BeaconBlock-Network-Health-Dashboard
Real-time visualization dashboard for Polkadot network - built for Polkadot Hackathon

Built with ❤️ for the Substrate and Polkadot ecosystem
=======
# BeaconBlock-Network-Health-Dashboard
Real-time visualization dashbord for Polkadot network - built for Polkadot Hackathon
>>>>>>> 0f46ba0943d3833c09494d3afbadfd2e5d3c56e9
