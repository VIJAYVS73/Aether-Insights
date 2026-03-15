import React, { useEffect, useState } from 'react';
import { MapPin, TrendingUp, AlertTriangle, Zap, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GeoLocation {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  postal: string;
  timezone: string;
}

export interface LocationProduct {
  name: string;
  category: string;
  demand: number;
  icon: string;
  imageUrl?: string;
}

export interface DemandSurgeAlert {
  id: string;
  city: string;
  region: string;
  country: string;
  surgePercentage: number;
  demandLevel: 'Critical' | 'High' | 'Medium';
  timestamp: string;
  coordinates: { lat: number; lng: number };
  products?: LocationProduct[];
}

interface GeoDemandAlertsProps {
  products: any[];
  isLoading?: boolean;
}

export const GeoDemandAlerts: React.FC<GeoDemandAlertsProps> = ({ products, isLoading = false }) => {
  const [geolocation, setGeolocation] = useState<GeoLocation | null>(null);
  const [demandAlerts, setDemandAlerts] = useState<DemandSurgeAlert[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [aiAlerts, setAiAlerts] = useState<Record<string, any>>({});
  const [generatingAI, setGeneratingAI] = useState<Set<string>>(new Set());

  // Fetch geolocation data using ip-api
  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const geoData: GeoLocation = {
          ip: data.ip || 'Unknown',
          hostname: data.org || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          country: data.country_name || 'Unknown',
          loc: `${data.latitude},${data.longitude}`,
          postal: data.postal || 'Unknown',
          timezone: data.timezone || 'Unknown',
        };
        
        setGeolocation(geoData);
        generateDemandAlerts(geoData);
      } catch (error) {
        console.error('Failed to fetch geolocation:', error);
        // Fallback to mock data
        const mockGeo: GeoLocation = {
          ip: '8.8.8.8',
          hostname: 'dns.google',
          city: 'Mountain View',
          region: 'California',
          country: 'US',
          loc: '37.4056,-122.0775',
          postal: '94043',
          timezone: 'America/Los_Angeles',
        };
        setGeolocation(mockGeo);
        generateDemandAlerts(mockGeo);
      }
    };

    fetchGeolocation();
  }, []);

  const fetchLocationProducts = async (city: string, region: string, country: string, lat: number, lng: number) => {
    try {
      const response = await fetch('/api/geo/location-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, region, country, lat, lng }),
      });

      if (!response.ok) throw new Error('Failed to fetch location products');
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch location products:', error);
      return [];
    }
  };

  const fetchAIDemandAlert = async (alertId: string, city: string, region: string, country: string, lat: number, lng: number, locationProducts: any[]) => {
    if (aiAlerts[alertId] || generatingAI.has(alertId)) return; // Already fetched or generating

    setGeneratingAI(prev => new Set(prev).add(alertId));
    try {
      const response = await fetch('/api/geo/demand-surge-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city, 
          region, 
          country, 
          lat, 
          lng,
          products: locationProducts
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI alert');
      
      const data = await response.json();
      setAiAlerts(prev => ({
        ...prev,
        [alertId]: data.alert
      }));
      console.log('AI Alert generated for', city, data.alert);
    } catch (error) {
      console.error('Failed to fetch AI demand alert:', error);
    } finally {
      setGeneratingAI(prev => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const generateDemandAlerts = async (geo: GeoLocation) => {
    const cities = [
      { name: 'New York', region: 'New York', country: 'US', lat: 40.7128, lng: -74.006 },
      { name: 'Los Angeles', region: 'California', country: 'US', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', region: 'Illinois', country: 'US', lat: 41.8781, lng: -87.6298 },
      { name: 'Mumbai', region: 'Maharashtra', country: 'IN', lat: 19.076, lng: 72.8777 },
      { name: 'Bangalore', region: 'Karnataka', country: 'IN', lat: 12.9716, lng: 77.5946 },
      { name: 'London', region: 'England', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', region: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
    ];

    const alerts: DemandSurgeAlert[] = [];
    const alertCount = Math.min(4, Math.floor(Math.random() * 3) + 2); // 2-4 alerts

    for (let i = 0; i < alertCount; i++) {
      const city = cities[i % cities.length];
      const surge = Math.floor(Math.random() * 60) + 20; // 20-80% surge
      
      let demandLevel: 'Critical' | 'High' | 'Medium' = 'Medium';
      if (surge >= 60) demandLevel = 'Critical';
      else if (surge >= 40) demandLevel = 'High';

      // Fetch location-specific products
      const locationProducts = await fetchLocationProducts(city.name, city.region, city.country, city.lat, city.lng);

      alerts.push({
        id: `alert-${i}`,
        city: city.name,
        region: city.region,
        country: city.country,
        surgePercentage: surge,
        demandLevel,
        timestamp: new Date().toLocaleTimeString(),
        coordinates: { lat: city.lat, lng: city.lng },
        products: locationProducts,
      });
    }

    setDemandAlerts(alerts);
  };

  const getDemandColor = (level: 'Critical' | 'High' | 'Medium') => {
    switch (level) {
      case 'Critical':
        return 'from-red-500/20 to-red-600/20 border-red-500/50 bg-red-500/10';
      case 'High':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50 bg-orange-500/10';
      case 'Medium':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 bg-yellow-500/10';
    }
  };

  const getBadgeColor = (level: 'Critical' | 'High' | 'Medium') => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Current Location */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Regional Demand Surge Alerts
          </h2>
          <p className="text-slate-400 text-sm mt-1">GeoClip-powered location intelligence for product demand</p>
        </div>
        {geolocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <p className="text-xs text-slate-400">Your Location</p>
            <p className="text-sm font-semibold text-white">{geolocation.city}, {geolocation.region}</p>
            <p className="text-xs text-slate-500">{geolocation.country} • IP: {geolocation.ip}</p>
          </motion.div>
        )}
      </div>

      {/* Demand Surge Alerts Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 gap-4">
          {demandAlerts.map((alert, idx) => (
            <div key={alert.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  if (expandedAlert === alert.id) {
                    setExpandedAlert(null);
                  } else {
                    setExpandedAlert(alert.id);
                    // Fetch AI alert when expanding
                    if (!aiAlerts[alert.id]) {
                      fetchAIDemandAlert(alert.id, alert.city, alert.region, alert.country, alert.coordinates.lat, alert.coordinates.lng, alert.products || []);
                    }
                  }
                }}
                className={`relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] ${getDemandColor(
                  alert.demandLevel
                )}`}
              >
              {/* Animated border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="relative z-10 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold text-white">
                        {alert.city}, {alert.region}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">{alert.country}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${getBadgeColor(alert.demandLevel)} flex items-center gap-1`}>
                    <AlertTriangle className="w-3 h-3" />
                    {alert.demandLevel}
                  </div>
                </div>

                {/* Top Demand Products with Icons */}
                {alert.products && alert.products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.1 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      High Demand Products
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {alert.products.map((product, pIdx) => (
                        <motion.div
                          key={pIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 + pIdx * 0.05 }}
                          className="bg-white/5 hover:bg-white/10 rounded-lg p-2.5 transition-all flex items-center gap-2"
                        >
                          <img
                            src={product.imageUrl || `https://picsum.photos/seed/${product.icon}/24/24`}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.category}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-green-400">+{product.demand}%</span>
                            <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden mt-0.5">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
                                style={{ width: `${Math.min(product.demand / 100 * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Surge Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Regional Demand Surge</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">+{alert.surgePercentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(alert.surgePercentage, 100)}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 via-red-400 to-red-500"
                    />
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-slate-500 text-right">{alert.timestamp}</p>
              </div>

              {/* Expand indicator */}
              <motion.div
                animate={{ rotate: expandedAlert === alert.id ? 180 : 0 }}
                className="absolute bottom-2 right-2 text-slate-400 opacity-50"
              >
                <TrendingUp className="w-4 h-4" />
              </motion.div>
              </motion.div>

              {/* Expanded AI Alert Details */}
              {expandedAlert === alert.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-lg bg-slate-900/50 border border-white/10 p-6 space-y-4">
                  {generatingAI.has(alert.id) ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"
                      />
                      <p className="text-sm text-slate-400">Generating AI-powered insights...</p>
                    </div>
                  ) : aiAlerts[alert.id] ? (
                    <div className="space-y-4">
                      {/* AI Alert Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🤖</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">{aiAlerts[alert.id].surge_title}</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{aiAlerts[alert.id].alert_message}</p>
                        </div>
                      </div>

                      {/* Market Insight */}
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">📊 Market Insight</p>
                        <p className="text-sm text-slate-300">{aiAlerts[alert.id].market_insight}</p>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase">💡 Recommended Actions</p>
                        <div className="space-y-2">
                          {aiAlerts[alert.id].recommendations?.map((rec: string, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-2 bg-white/5 rounded p-2"
                            >
                              <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                              <span className="text-xs text-slate-300">{rec}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Alert Metadata */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 rounded p-2 text-center">
                          <p className="text-xs text-slate-500 mb-1">Severity</p>
                          <p className="text-sm font-bold text-orange-400 uppercase">{aiAlerts[alert.id].alert_severity}</p>
                        </div>
                        <div className="bg-white/5 rounded p-2 text-center">
                          <p className="text-xs text-slate-500 mb-1">Generated</p>
                          <p className="text-xs text-slate-300 truncate">{new Date(aiAlerts[alert.id].timestamp).toLocaleTimeString()}</p>
                        </div>
                        <div className="bg-white/5 rounded p-2 text-center">
                          <p className="text-xs text-slate-500 mb-1">Valid For</p>
                          <p className="text-xs text-slate-300">24 hours</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No AI insights available for this region yet.</p>
                  )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs mb-1">Active Alerts</p>
          <p className="text-2xl font-bold text-white">{demandAlerts.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs mb-1">Avg Surge</p>
          <p className="text-2xl font-bold text-green-400">
            {demandAlerts.length > 0
              ? Math.round(demandAlerts.reduce((sum, a) => sum + a.surgePercentage, 0) / demandAlerts.length)
              : 0}
            %
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs mb-1">Regions</p>
          <p className="text-2xl font-bold text-blue-400">{new Set(demandAlerts.map(a => a.region)).size}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs mb-1">Peak Demand</p>
          <p className="text-2xl font-bold text-red-400">
            {demandAlerts.length > 0 ? Math.max(...demandAlerts.map(a => a.surgePercentage)) : 0}%
          </p>
        </div>
      </motion.div>

      {/* Geographic Heat Map Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-blue-500/20 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">GeoClip Location Intelligence</h4>
            <p className="text-xs text-slate-400">
              Location-encoded product demand detected across {new Set(demandAlerts.map(a => a.country)).size} countries.
              {demandAlerts.length > 0 && (
                <>
                  {' '}Peak activity in {demandAlerts[0].city} with +{demandAlerts[0].surgePercentage}% surge.
                </>
              )}
              {demandAlerts[0]?.products && demandAlerts[0]?.products?.length > 0 && (
                <>
                  {' '}Top product: <span className="font-semibold text-blue-300">{demandAlerts[0].products[0].name}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
