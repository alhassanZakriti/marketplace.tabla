import type { NextConfig } from "next";

const { i18n } = require('./config/i18n');


const nextConfig: NextConfig = {
    i18n,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'api.dev.tabla.ma',
                port: '',
                pathname: '/media/**',
            },
            {
                protocol: 'https',
                hostname: 'api.dev.tabla.ma',
                port: '',
                pathname: '/media/**',
            }
        ],
    },
};

export default nextConfig;
