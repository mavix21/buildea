import type { Arcade } from "./types";

export const featuredArcades: Arcade[] = [
  {
    id: "btc-basics",
    title: "Blockchain Fundamentals",
    description:
      "Learn the fundamentals of Bitcoin blockchain, transactions, and the underlying cryptography…",
    imageUrl: "/arcade/blockchain-fundamentals.jpg",
    difficulty: "beginner",
  },
  {
    id: "smart-contracts",
    title: "Ethereum 101",
    description:
      "Understand the Ethereum network, gas fees, and how to interact with the blockchain…",
    imageUrl: "/arcade/ethereum-101.jpg",
    difficulty: "beginner",
  },
];

export const allArcades: Arcade[] = [
  {
    id: "btc-basics",
    title: "Blockchain Fundamentals",
    description:
      "Learn the fundamentals of Bitcoin blockchain, transactions, and the underlying cryptography…",
    imageUrl: "/arcade/blockchain-fundamentals.jpg",
    difficulty: "beginner",
  },
  {
    id: "smart-contracts",
    title: "Ethereum 101",
    description:
      "Understand the Ethereum network, gas fees, and how to interact with the blockchain…",
    imageUrl: "/arcade/ethereum-101.jpg",
    difficulty: "beginner",
  },
];

export const arcadeCategories = [
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "NFTs",
  "Security",
  "Beginner",
  "Intermediate",
] as const;

export type ArcadeCategory = (typeof arcadeCategories)[number];
