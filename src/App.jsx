import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  User,
  Clock,
  Shield,
  Bell,
  Timer,
  TrendingUp
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
      status: Math.random() > 0.8 ? 'Critical' : 'Normal',
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
  const [dataLog, setDataLog] = useState([]);
  const startTime = useRef(new Date());

  // Calculate uptime
  const [uptime, setUptime] = useState('0h 0m');

  useEffect(() => {
    const updateUptime = () => {
      const now = new Date();
      const diff = Math.floor((now - startTime.current) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      setUptime(`${hours}h ${minutes}m`);
    };

    const timer = setInterval(updateUptime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // KPI calculations
  const avgRiskScore = sensors.reduce((acc, s) => acc + s.risk, 0) / sensors.length;
  const alertCount = sensors.filter(s => s.status === 'Critical').length;
  const systemStatus = alertCount === 0 ? 'NORMAL' : alertCount < 5 ? 'WARNING' : 'CRITICAL';

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => {
        const updated = prev.map(s => ({
          ...s,
          value: Math.max(0, Math.min(100, s.value + (Math.random() - 0.5) * 5)),
          risk: Math.max(0, Math.min(100, s.risk + (Math.random() - 0.5) * 3)),
          status: Math.random() > 0.85 ? 'Critical' : 'Normal'
        }));
        return updated.sort((a, b) => b.risk - a.risk);
      });

      // Update chart data
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

      // Update data log
      setDataLog(prev => {
        const recentSensors = sensors.slice(0, 5).map((s, idx) => ({
          no: prev.length + idx + 1,
          time: new Date().toLocaleTimeString(),
          sensorName: s.name,
          value: s.value.toFixed(2),
          status: s.status
        }));
        return [...recentSensors, ...prev].slice(0, 100);
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
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                systemStatus === 'NORMAL'
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : systemStatus === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                {systemStatus === 'NORMAL' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <span className={`text-sm font-medium ${
                  systemStatus === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  System {systemStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Zone 1: KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {/* 현재상태 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  systemStatus === 'NORMAL' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    systemStatus === 'NORMAL' ? 'text-emerald-400' : 'text-red-400'
                  }`} />
                </div>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  systemStatus === 'NORMAL' ? 'bg-emerald-400' : 'bg-red-400'
                }`}></div>
              </div>
              <p className="text-slate-400 text-sm mb-1">현재상태</p>
              <p className={`text-3xl font-semibold font-mono ${
                systemStatus === 'NORMAL' ? 'text-emerald-400' : 'text-red-400'
              }`}>{systemStatus}</p>
            </div>

            {/* 위험점수 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-slate-400 text-sm mb-1">위험점수</p>
              <p className="text-3xl font-semibold text-white font-mono">{avgRiskScore.toFixed(0)}</p>
            </div>

            {/* 가동시간 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Timer className="w-6 h-6 text-blue-400" />
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm mb-1">가동시간</p>
              <p className="text-3xl font-semibold text-white font-mono">{uptime}</p>
            </div>

            {/* 알림수 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Bell className="w-6 h-6 text-purple-400" />
                </div>
                {alertCount > 0 && <AlertCircle className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-slate-400 text-sm mb-1">알림수</p>
              <p className={`text-3xl font-semibold font-mono ${
                alertCount > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>{alertCount}</p>
            </div>
          </div>

          {/* Zone 2: 메인 분석 영역 */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left: 실시간 메인 그래프 (66% / 2 columns) */}
            <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">실시간 메인 그래프 (Global Trend)</h3>
                <p className="text-sm text-slate-400">오른쪽 센서를 클릭하여 차트에 표시 (최대 3개)</p>
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
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {/* Selected Sensors - Below Chart */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-3">선택된 센서 (클릭하여 제거)</p>
                <div className="flex gap-2 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {selectedSensors.map((sensorId, idx) => (
                      <motion.button
                        key={sensorId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelectedSensors(selectedSensors.filter(id => id !== sensorId))}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-600 transition-all cursor-pointer"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sensorColors[idx] }}></div>
                        <span className="text-sm text-slate-300 font-mono">XMEAS_{sensorId}</span>
                        <span className="text-slate-500 hover:text-slate-300 ml-1">×</span>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  {selectedSensors.length === 0 && (
                    <p className="text-sm text-slate-500 italic">센서를 선택해주세요</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: 위험도 랭킹 (33% / 1 column) */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">위험도 랭킹 (Ranking)</h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                <AnimatePresence>
                  {sensors.slice(0, 15).map((sensor, index) => (
                    <motion.div
                      key={sensor.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15, layout: { duration: 0.2 } }}
                      onClick={() => handleSensorClick(sensor.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSensors.includes(sensor.id)
                          ? 'bg-blue-500/10 border-blue-500/50'
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white font-mono">{sensor.name}</span>
                        {sensor.status === 'Critical' ? (
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
                            className={`h-1.5 rounded-full transition-all duration-200 ${
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

          {/* Zone 3: 상세 데이터 (Data Grid/Log) */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">상세 데이터 (Data Grid/Log)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-sm font-medium text-slate-400 pb-3 px-4">No</th>
                    <th className="text-left text-sm font-medium text-slate-400 pb-3 px-4">Time</th>
                    <th className="text-left text-sm font-medium text-slate-400 pb-3 px-4">Sensor Name</th>
                    <th className="text-left text-sm font-medium text-slate-400 pb-3 px-4">Value</th>
                    <th className="text-left text-sm font-medium text-slate-400 pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataLog.slice(0, 20).map((row, idx) => (
                    <motion.tr
                      key={`${row.no}-${idx}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-300 font-mono">{String(row.no).padStart(2, '0')}</td>
                      <td className="py-3 px-4 text-sm text-slate-300 font-mono">{row.time}</td>
                      <td className="py-3 px-4 text-sm text-white font-mono">{row.sensorName}</td>
                      <td className="py-3 px-4 text-sm text-slate-300 font-mono">{row.value}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          row.status === 'Critical'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
