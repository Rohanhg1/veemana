export const REAL_DATA = {
  schemes: {
    MGNREGA: {
      allocated: 86000, // crores
      reached: 71240,
      flagged: 169.75,
      states: {
        Rajasthan: 59.3, Maharashtra: 54.1,
        AndhraPradesh: 45.6, TamilNadu: 36.9,
        Karnataka: 41.6, Bihar: 2.7
      },
      utilisation: 82.8,
      source: "CAG Report 2023-24"
    },
    Healthcare: {
      allocated: 37800,
      reached: 31200,
      flagged: 892,
      states: {
        UttarPradesh: 234, Jharkhand: 189,
        Odisha: 156, Chhattisgarh: 143,
        WestBengal: 98, Bihar: 72
      },
      utilisation: 74.3,
      source: "CAG Report 2022-23"
    },
    Agriculture: {
      allocated: 60000,
      reached: 54800,
      flagged: 1364,
      states: {
        UttarPradesh: 412, Maharashtra: 287,
        Karnataka: 198, Punjab: 167,
        Haryana: 143, TamilNadu: 157
      },
      utilisation: 91.3,
      source: "DBT Mission Report 2023"
    },
    Education: {
      allocated: 37383,
      reached: 28900,
      flagged: 2100,
      states: {
        Bihar: 567, UttarPradesh: 489,
        Rajasthan: 312, MadhyaPradesh: 287,
        Jharkhand: 245, Odisha: 200
      },
      utilisation: 61.5,
      source: "CAG Report 2022-23"
    }
  }
};

export const VILLAGES = [
  { name: "Kolar", state: "Karnataka", domain: "MGNREGA",
    allocated: 5728000, received: 5170000, workers: 1847,
    blockNumber: 4829103, txHash: "0x937b...0477" },
  { name: "Piparia", state: "Madhya Pradesh", domain: "MGNREGA",
    allocated: 1850000, received: 1850000, workers: 423,
    blockNumber: 4829201, txHash: "0x2b3c...1f4a" },
  { name: "Dharwad", state: "Karnataka", domain: "Healthcare",
    allocated: 6500000, received: 5200000, workers: 0,
    blockNumber: 4829287, txHash: "0x9a8b...2c3d" },
  { name: "Madhubani", state: "Bihar", domain: "Education",
    allocated: 3200000, received: 2900000, workers: 0,
    blockNumber: 4829312, txHash: "0x5c6d...3e4f" },
  { name: "Ludhiana", state: "Punjab", domain: "Agriculture",
    allocated: 12000000, received: 12000000, workers: 0,
    blockNumber: 4829398, txHash: "0x1e2f...4g5h" },
  { name: "Barmer", state: "Rajasthan", domain: "MGNREGA",
    allocated: 8900000, received: 6200000, workers: 2341,
    blockNumber: 4829445, txHash: "0x3f4g...5h6i" },
  { name: "Warangal", state: "Telangana", domain: "Agriculture",
    allocated: 4500000, received: 4500000, workers: 0,
    blockNumber: 4829512, txHash: "0x7j8k...9l0m" },
  { name: "Nashik", state: "Maharashtra", domain: "Healthcare",
    allocated: 9200000, received: 7100000, workers: 0,
    blockNumber: 4829587, txHash: "0x2n3o...4p5q" }
];

export const MAP_VILLAGES = [
  { name: "Barmer", state: "Rajasthan", lat: 25.7521, lng: 71.3967,
    status: "flagged", domain: "MGNREGA", allocated: 8900000, received: 6200000 },
  { name: "Sidhi", state: "Madhya Pradesh", lat: 24.4159, lng: 81.8812,
    status: "flagged", domain: "Education", allocated: 4200000, received: 2900000 },
  { name: "Nashik", state: "Maharashtra", lat: 20.0059, lng: 73.7898,
    status: "flagged", domain: "Healthcare", allocated: 9200000, received: 7100000 },
  { name: "Muzaffarpur", state: "Bihar", lat: 26.1197, lng: 85.3910,
    status: "pending", domain: "Education", allocated: 5600000, received: 0 },
  { name: "Nandyal", state: "Andhra Pradesh", lat: 15.4786, lng: 78.4836,
    status: "pending", domain: "Agriculture", allocated: 3800000, received: 0 },
  { name: "Kolar", state: "Karnataka", lat: 13.1360, lng: 78.1294,
    status: "verified", domain: "MGNREGA", allocated: 5728000, received: 5170000 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460,
    status: "verified", domain: "Agriculture", allocated: 4100000, received: 4100000 },
  { name: "Warangal", state: "Telangana", lat: 17.9784, lng: 79.5941,
    status: "verified", domain: "MGNREGA", allocated: 4500000, received: 4500000 },
  { name: "Dharwad", state: "Karnataka", lat: 15.4589, lng: 74.0074,
    status: "flagged", domain: "Healthcare", allocated: 6500000, received: 5200000 },
  { name: "Madhubani", state: "Bihar", lat: 26.3534, lng: 86.0713,
    status: "pending", domain: "Education", allocated: 3200000, received: 2900000 }
];
