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

### Backend (Server)
- **Node.js** with Express for robust API server
- **TypeScript** for type safety and better developer experience
- **Polkadot.js API** for Substrate chain interactions
- **Socket.IO** for real-time WebSocket connections
- **Winston** for structured logging

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "network health dashboard"
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend development server on http://localhost:3000
   - Backend API server on http://localhost:5000

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
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and chain services
│   │   ├── stores/        # State management
│   │   └── types/         # TypeScript definitions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Helper functions
│   └── dist/              # Compiled JavaScript
└── package.json           # Root package configuration
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the frontend for production
- `npm run start` - Start the production server
- `npm run client:dev` - Start only the frontend development server
- `npm run server:dev` - Start only the backend development server

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

---

Built with ❤️ for the Substrate and Polkadot ecosystem