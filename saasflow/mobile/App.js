import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';

const API_HOST = 'http://localhost:5000/api'; // Replace with local machine IP for Expo Go on physical phone

export default function App() {
  const [tab, setTab] = useState('tenants'); // 'tenants' | 'requests'
  const [tenants, setTenants] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        fetch(`${API_HOST}/tenants`).then(r => r.json()),
        fetch(`${API_HOST}/requests?limit=20`).then(r => r.json())
      ]);
      if (Array.isArray(tRes)) setTenants(tRes);
      if (Array.isArray(rRes)) setRequests(rRes);
    } catch (e) {
      console.log('Mobile fetch fallback to demo seed:', e.message);
      // Fallback seed when offline
      setTenants([
        { id: 'tenant-shopkart', name: 'ShopKart eCommerce', planName: 'Starter', monthCalls: 61250, monthlyLimit: 50000, percentUsed: 100 },
        { id: 'tenant-acmedata', name: 'AcmeData AI', planName: 'Starter', monthCalls: 48650, monthlyLimit: 50000, percentUsed: 97.3 },
        { id: 'tenant-weatherwise', name: 'WeatherWise App', planName: 'Free', monthCalls: 920, monthlyLimit: 1000, percentUsed: 92.0 },
        { id: 'tenant-swiftpay', name: 'SwiftPay Gateway', planName: 'Starter', monthCalls: 34500, monthlyLimit: 50000, percentUsed: 69.0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>SaaSFlow Mobile</Text>
        <Text style={styles.subtitle}>Companion Metrics (PST_PD_004 Stretch)</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setTab('tenants')}
          style={[styles.tabButton, tab === 'tenants' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, tab === 'tenants' && styles.tabTextActive]}>
            Tenants & Quotas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('requests')}
          style={[styles.tabButton, tab === 'requests' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>
            Live Telemetry
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#1C1917" /></View>
      ) : tab === 'tenants' ? (
        <FlatList
          data={tenants}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isCritical = item.percentUsed >= 90;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.tenantName}>{item.name}</Text>
                  <Text style={styles.planBadge}>{item.planName}</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View style={[
                    styles.progressFill,
                    { width: `${Math.min(100, item.percentUsed)}%` },
                    isCritical ? styles.fillRed : styles.fillGreen
                  ]} />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.metricText}>
                    {item.monthCalls.toLocaleString()} / {item.monthlyLimit.toLocaleString()} calls
                  </Text>
                  <Text style={[styles.percentText, isCritical && { color: '#B91C1C' }]}>
                    {item.percentUsed}%
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item, index) => item.id || String(index)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.endpointText}>{item.endpoint || '/v1/weather/current'}</Text>
                <Text style={[
                  styles.statusBadge,
                  item.status === 200 ? styles.badgeGreen : styles.badgeRed
                ]}>
                  {item.status || 200}
                </Text>
              </View>
              <Text style={styles.metaText}>
                Tenant: {item.tenantId} · Latency: {item.latencyMs}ms
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1ECE2' },
  header: { padding: 16, backgroundColor: '#FAF7F2', borderBottomWidth: 1, borderBottomColor: '#E2D9CC' },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#1C1917' },
  subtitle: { fontSize: 12, color: '#57534E', marginTop: 2 },
  tabBar: { flexDirection: 'row', padding: 8, backgroundColor: '#FAF7F2', borderBottomWidth: 1, borderBottomColor: '#E2D9CC' },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  tabButtonActive: { backgroundColor: '#1C1917' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#57534E' },
  tabTextActive: { color: '#FAF7F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FAF7F2', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2D9CC' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tenantName: { fontSize: 15, fontWeight: '700', color: '#1C1917' },
  planBadge: { fontSize: 11, fontWeight: '700', backgroundColor: '#ECE6DA', color: '#1C1917', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  progressTrack: { height: 6, backgroundColor: '#E2D9CC', borderRadius: 3, overflow: 'hidden', marginVertical: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  fillGreen: { backgroundColor: '#2D5A27' },
  fillRed: { backgroundColor: '#B91C1C' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  metricText: { fontSize: 12, color: '#57534E' },
  percentText: { fontSize: 12, fontWeight: '700', color: '#2D5A27' },
  endpointText: { fontSize: 13, fontFamily: 'monospace', fontWeight: '600', color: '#1C1917' },
  statusBadge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeGreen: { backgroundColor: '#DCFCE7', color: '#15803D' },
  badgeRed: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  metaText: { fontSize: 11, color: '#78716C', marginTop: 4 }
});
