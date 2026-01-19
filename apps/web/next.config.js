/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    // Handle .aleo files as raw text for Leo programs
    config.module.rules.push({
      test: /\.aleo$/i,
      use: 'raw-loader',
    });

    // Enable WebAssembly for Aleo SDK
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle web workers for ZK proof generation
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  // Optimize for production
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
