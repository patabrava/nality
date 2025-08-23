const nextConfig = {
  eslint: {
    // Do not fail production builds on ESLint errors
    ignoreDuringBuilds: true,
  },
  // Ensure workspace packages are transpiled in the app
  transpilePackages: ["@nality/schema"],
};

export default nextConfig;
