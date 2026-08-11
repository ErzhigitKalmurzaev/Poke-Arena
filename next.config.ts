import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sprite URLs come straight from the PokeAPI-hosted sprite repo baked
    // into public/data/pokemon.json at build time.
    remotePatterns: [{ protocol: "https", hostname: "raw.githubusercontent.com" }],
  },
};

export default nextConfig;
