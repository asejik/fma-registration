import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LogOut, User, RefreshCw, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "registrations"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic Auth Check
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/admin');
      else fetchData();
    });
    return () => unsubscribe();
  }, [navigate]);

  // Calculate Stats
  const lagosCount = registrations.filter(r => r.cohort === 'Lagos').length;
  const ilorinCount = registrations.filter(r => r.cohort === 'Ilorin').length;

  const chartData = [
    { name: 'Lagos', value: lagosCount },
    { name: 'Ilorin', value: ilorinCount },
  ];
  const COLORS = ['#F97316', '#06B6D4']; // Orange for Lagos, Cyan for Ilorin

  const handleLogout = () => {
    signOut(auth);
    navigate('/admin');
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold">FMA Overview</h1>
          <p className="text-slate-400">Live Registration Data</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Total Card */}
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider">Total Leads</p>
              <h2 className="text-4xl font-bold mt-2">{registrations.length}</h2>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><User /></div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="md:col-span-2 bg-slate-900 border border-white/10 p-6 rounded-2xl flex items-center justify-center">
          <div className="w-full h-[200px] flex items-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                  <Legend verticalAlign="middle" align="right" />
                </PieChart>
             </ResponsiveContainer>
             <div className="ml-8 text-sm">
                <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Lagos: <strong>{lagosCount}</strong></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div> Ilorin: <strong>{ilorinCount}</strong></div>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-xl">Recent Registrations</h3>
          <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-full"><RefreshCw size={18}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase text-xs">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Cohort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/5 transition">
                  <td className="p-4 font-medium text-white">{reg.fullName}</td>
                  <td className="p-4">{reg.email}</td>
                  <td className="p-4">{reg.phone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${reg.cohort === 'Lagos' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      {reg.cohort}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;