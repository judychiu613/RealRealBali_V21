import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const routeMessagingEnabled = JSON.stringify(
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_ENABLE_ROUTE_MESSAGING === "true"
    : process.env.NEXT_PUBLIC_ENABLE_ROUTE_MESSAGING !== "false"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 项目使用 ESLint 9 扁平配置，先不在构建时强行走 Next 默认 lint，避免与 eslint-config 形态不一致
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-router-dom": path.join(__dirname, "src/lib/react-router-dom-proxy.tsx"),
      "react-router-dom-original": require.resolve("react-router-dom"),
    };
    config.plugins.push(
      new webpack.DefinePlugin({
        __ROUTE_MESSAGING_ENABLED__: routeMessagingEnabled,
      })
    );
    return config;
  },
};

export default nextConfig;
