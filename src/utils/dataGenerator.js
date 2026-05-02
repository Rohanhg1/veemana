// Deterministic simple hash function for strings
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Seeded random number generator
const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const generateVillageData = (villageName) => {
  const hash = hashString(villageName.toLowerCase().trim() || 'default');

  // Domains
  const domains = ['Healthcare', 'Education', 'Agriculture', 'Infrastructure'];
  
  let totalAllocated = 0;
  let totalUtilized = 0;
  let totalFlagged = 0;

  // Generate Domain Data
  const domainData = domains.map((domain, index) => {
    // Generate an allocated amount between 5 and 50 Crores
    const baseAmount = 5 + (seededRandom(hash + index) * 45); 
    const allocated = parseFloat(baseAmount.toFixed(2));
    
    // Utilization is usually between 60% and 95% of allocated
    const utilRatio = 0.6 + (seededRandom(hash + index + 10) * 0.35);
    const utilized = parseFloat((allocated * utilRatio).toFixed(2));

    // Flagged is usually a small fraction or zero
    const isFlagged = seededRandom(hash + index + 20) > 0.7; // 30% chance
    const flaggedAmount = isFlagged ? parseFloat((utilized * (seededRandom(hash + index + 30) * 0.2)).toFixed(2)) : 0;

    totalAllocated += allocated;
    totalUtilized += utilized;
    totalFlagged += flaggedAmount;

    return {
      domain,
      allocated,
      utilized,
      flaggedAmount
    };
  });

  // Calculate percentages for Sector Focus
  const sectorFocusData = domainData.map(d => ({
    name: d.domain,
    value: parseFloat(((d.allocated / totalAllocated) * 100).toFixed(1))
  }));

  // Generate 6 Month Historical Burn Rate Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let runningSpend = 0;
  const monthlyBurnRateData = months.map((month, index) => {
    // Distributed spending across 6 months
    const monthSpend = parseFloat(((totalUtilized / 6) * (0.8 + seededRandom(hash + index + 40) * 0.4)).toFixed(2));
    runningSpend += monthSpend;
    
    // Also generate a baseline expected spend
    const expectedSpend = parseFloat((totalAllocated / 12 * (index + 1)).toFixed(2));
    
    return {
      name: month,
      actual: parseFloat(runningSpend.toFixed(2)),
      expected: expectedSpend,
      monthlyBurn: monthSpend
    };
  });

  // Generate a mock health score
  const healthScore = Math.floor(70 + seededRandom(hash + 50) * 30);
  
  // Generate Anomaly Radar Data (Risk Factors)
  const radarData = [
    { subject: 'Timing', A: Math.floor(20 + seededRandom(hash + 100) * 80), fullMark: 100 },
    { subject: 'Volume', A: Math.floor(20 + seededRandom(hash + 101) * 80), fullMark: 100 },
    { subject: 'Frequency', A: Math.floor(20 + seededRandom(hash + 102) * 80), fullMark: 100 },
    { subject: 'Age', A: Math.floor(20 + seededRandom(hash + 103) * 80), fullMark: 100 },
    { subject: 'Network', A: Math.floor(20 + seededRandom(hash + 104) * 80), fullMark: 100 },
  ];

  // Calculate top-level metrics
  return {
    villageName: villageName || 'Global Average',
    metrics: {
      totalAllocated: totalAllocated.toFixed(2),
      totalUtilized: totalUtilized.toFixed(2),
      utilizationPercent: ((totalUtilized / totalAllocated) * 100).toFixed(1),
      totalFlagged: totalFlagged.toFixed(2),
      healthScore
    },
    domainData,
    sectorFocusData,
    monthlyBurnRateData,
    radarData,
    activeAlerts: Math.floor(seededRandom(hash + 60) * 15)
  };
};
