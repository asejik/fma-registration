import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Users, TrendingUp, Calendar, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalRevenue: 0,
    waitlistCount: 0,
    lagosCount: 0,
    ilorinCount: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Paid Students
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, orderBy("registeredAt", "desc"));
        const studentSnapshot = await getDocs(q);
        const students = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Fetch Waitlist (Old Collection)
        const waitlistSnapshot = await getDocs(collection(db, "registrations"));

        // 3. Calculate Stats
        const revenue = students.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
        const lagos = students.filter(s => s.cohort === 'Lagos').length;
        const ilorin = students.filter(s => s.cohort === 'Ilorin').length;

        setStats({
          totalPaid: students.length,
          totalRevenue: revenue,
          waitlistCount: waitlistSnapshot.size,
          lagosCount: lagos,
          ilorinCount: ilorin
        });

        setRecentStudents(students.slice(0, 5)); // Show last 5 paid students

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>;

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="text-sm text-slate-500">Overview</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={CreditCard} color="bg-green-500" />
            <StatCard title="Paid Students" value={stats.totalPaid} icon={Users} color="bg-blue-500" />
            <StatCard title="Waitlist Leads" value={stats.waitlistCount} icon={Calendar} color="bg-purple-500" />
            <StatCard title="Lagos vs Ilorin" value={`${stats.lagosCount} / ${stats.ilorinCount}`} icon={TrendingUp} color="bg-orange-500" />
        </div>

        {/* Recent Paid Students Table */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <h3 className="font-bold text-white">Recent Paid Registrations</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Cohort</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recentStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{student.fullName}</td>
                                <td className="p-4">{student.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${student.cohort === 'Lagos' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                        {student.cohort}
                                    </span>
                                </td>
                                <td className="p-4 text-green-400">₦{student.amountPaid?.toLocaleString()}</td>
                                <td className="p-4">{student.dateString ? new Date(student.dateString).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                        {recentStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">No paid students yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;