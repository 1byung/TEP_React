import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Activity,
  Thermometer,
  Gauge,
  Droplets,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  User,
  Clock
} from 'lucide-react';

// TEP Data Generation
const generateTEPData = () => {
  const sensors = [];
  for (let i = 1; i <= 52; i++) {
    sensors.push({
      id: i,
      name: `XMEAS_${i}`,
      value: Math.random() * 100,
      risk: Math.random() * 100,
      status: Math.random() > 0.8 ? 'warning' : 'normal',
      type: i <= 13 ? 'temperature' : i <= 26 ? 'pressure' : i <= 39 ? 'flow' : 'composition'
    });
  }
  return sensors.sort((a, b) => b.risk - a.risk);
};

function App() {
  const [sensors, setSensors] = useState(generateTEPData());
  const [chartData, setChartData] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState([1, 2, 3]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activeNav, setActiveNav] = useState('dashboard');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // KPI calculations
  const avgTemperature = sensors.filter(s => s.type === 'temperature').reduce((acc, s) => acc + s.value, 0) / sensors.filter(s => s.type === 'temperature').length;
  const avgPressure = sensors.filter(s => s.type === 'pressure').reduce((acc, s) => acc + s.value, 0) / sensors.filter(s => s.type === 'pressure').length;
  const avgFlow = sensors.filter(s => s.type === 'flow').reduce((acc, s) => acc + s.value, 0) / sensors.filter(s => s.type === 'flow').length;
  const systemHealth = sensors.filter(s => s.status === 'normal').length / sensors.length * 100;

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => {
        const updated = prev.map(s => ({
          ...s,
          value: Math.max(0, Math.min(100, s.value + (Math.random() - 0.5) * 5)),
          risk: Math.max(0, Math.min(100, s.risk + (Math.random() - 0.5) * 3)),
          status: Math.random() > 0.9 ? 'warning' : s.value > 80 ? 'warning' : 'normal'
        }));
        return updated.sort((a, b) => b.risk - a.risk);
      });

      setChartData(prev => {
        const newData = [...prev.slice(-29)];
        const dataPoint = {
          time: new Date().toLocaleTimeString(),
        };

        selectedSensors.forEach(sensorId => {
          const sensor = sensors.find(s => s.id === sensorId);
          if (sensor) {
            dataPoint[`sensor_${sensorId}`] = sensor.value;
          }
        });

        newData.push(dataPoint);
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sensors, selectedSensors]);

  const handleSensorClick = (sensorId) => {
    if (selectedSensors.includes(sensorId)) {
      setSelectedSensors(selectedSensors.filter(id => id !== sensorId));
    } else {
      if (selectedSensors.length < 3) {
        setSelectedSensors([...selectedSensors, sensorId]);
      } else {
        setSelectedSensors([...selectedSensors.slice(1), sensorId]);
      }
    }
  };

  const sensorColors = {
    0: '#3b82f6', // blue
    1: '#8b5cf6', // purple
    2: '#10b981', // green
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-900 font-sans">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">TEP Monitor</h1>
              <p className="text-slate-400 text-xs">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeNav === item.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-700/50 rounded-lg">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Admin</p>
              <p className="text-slate-400 text-xs">admin@tep.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Dashboard Overview</h2>
              <p className="text-slate-400 text-sm mt-1">Tennessee Eastman Process Monitoring</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-sm">{currentTime}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {/* Temperature KPI */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Thermometer className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Avg Temperature</p>
              <p className="text-3xl font-semibold text-white font-mono">{avgTemperature.toFixed(1)}<span className="text-lg text-slate-500">°C</span></p>
            </div>

            {/* Pressure KPI */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Gauge className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Avg Pressure</p>
              <p className="text-3xl font-semibold text-white font-mono">{avgPressure.toFixed(1)}<span className="text-lg text-slate-500"> kPa</span></p>
            </div>

            {/* Flow KPI */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Droplets className="w-6 h-6 text-emerald-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Avg Flow Rate</p>
              <p className="text-3xl font-semibold text-white font-mono">{avgFlow.toFixed(1)}<span className="text-lg text-slate-500"> L/h</span></p>
            </div>

            {/* Health KPI */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-slate-400 text-sm mb-1">System Health</p>
              <p className="text-3xl font-semibold text-white font-mono">{systemHealth.toFixed(0)}<span className="text-lg text-slate-500">%</span></p>
            </div>
          </div>

          {/* Row 2: Chart + Sensor Ranking */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Real-time Chart (65% / 2 columns) */}
            <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Sensor Data</h3>
                <p className="text-sm text-slate-400">Click sensors on the right to display (max 3)</p>
                <div className="flex gap-2 mt-3">
                  {selectedSensors.map((sensorId, idx) => (
                    <div key={sensorId} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded border border-slate-600">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sensorColors[idx] }}></div>
                      <span className="text-xs text-slate-300 font-mono">XMEAS_{sensorId}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  {selectedSensors.map((sensorId, idx) => (
                    <Line
                      key={sensorId}
                      type="monotone"
                      dataKey={`sensor_${sensorId}`}
                      stroke={sensorColors[idx]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Top Risk Sensors (35% / 1 column) */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Risk Sensors</h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                <AnimatePresence>
                  {sensors.slice(0, 15).map((sensor, index) => (
                    <motion.div
                      key={sensor.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleSensorClick(sensor.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSensors.includes(sensor.id)
                          ? 'bg-blue-500/10 border-blue-500/50'
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white font-mono">{sensor.name}</span>
                        {sensor.status === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Risk Score</span>
                          <span className={`font-mono ${sensor.risk > 70 ? 'text-red-400' : sensor.risk > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {sensor.risk.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              sensor.risk > 70 ? 'bg-red-500' : sensor.risk > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${sensor.risk}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
