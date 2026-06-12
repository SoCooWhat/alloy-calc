import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开发服务器优化
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
