"use client";

export const dynamic = 'force-dynamic';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Archive, Calendar, Heart, PartyPopper, Gift, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface Stats {
  totalMembers: number;
  newAdhesions: number;
  archivedMembers: number;
  upcomingEvents: number;
  birthdaysToday: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    newAdhesions: 0,
    archivedMembers: 0,
    upcomingEvents: 0,
    birthdaysToday: 0,
  });
  const [birthdayMembers, setBirthdayMembers] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [adhesionByYear, setAdhesionByYear] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
      } else {
        setUserEmail(user.email || "");
        await fetchStats();
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const fetchStats = async () => {
    // 1. Total membres actifs
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false)
      .eq('status', 'actif');

    // 2. Nouvelles adhésions
    const { count: newAdhesions } = await supabase
      .from('adhesions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'en_attente');

    // 3. Membres archivés
    const { count: archivedMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', true);

    // 4. Événements à venir
    const { count: upcomingEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'a_venir');

    // 5. Anniversaires du jour
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const { data: birthdayData } = await supabase
      .from('members')
      .select('id, first_name, last_name, birth_date')
      .eq('is_archived', false)
      .eq('status', 'actif');

    const birthdays = birthdayData?.filter(member => {
      const birthDate = new Date(member.birth_date);
      return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
    }) || [];

    setBirthdayMembers(birthdays);
    setStats({
      totalMembers: totalMembers || 0,
      newAdhesions: newAdhesions || 0,
      archivedMembers: archivedMembers || 0,
      upcomingEvents: upcomingEvents || 0,
      birthdaysToday: birthdays.length,
    });

    // 6. Évolution des membres (par mois)
    const { data: membersByMonth } = await supabase
      .from('members')
      .select('admission_date')
      .eq('is_archived', false)
      .eq('status', 'actif');

    const months: { [key: string]: number } = {};
    membersByMonth?.forEach(m => {
      const month = new Date(m.admission_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      months[month] = (months[month] || 0) + 1;
    });
    setEvolutionData(Object.entries(months).map(([month, count]) => ({ month, count })).slice(-6));

    // 7. Répartition par sexe
    const { data: genderStats } = await supabase
      .from('members')
      .select('gender')
      .eq('is_archived', false)
      .eq('status', 'actif'); 

    const maleCount = genderStats?.filter(m => m.gender === 'M').length || 0;
    const femaleCount = genderStats?.filter(m => m.gender === 'F').length || 0;
    const otherCount = genderStats?.filter(m => m.gender === 'Autre').length || 0;
    setGenderData([
      { name: 'Hommes', value: maleCount, color: '#007A2F' },
      { name: 'Femmes', value: femaleCount, color: '#F2BE2E' },
      { name: 'Autre', value: otherCount, color: '#9F2723' },
    ]);

    // 8. Adhésions par année
    const { data: byYear } = await supabase
      .from('members')
      .select('admission_date')
      .eq('is_archived', false)
      .eq('status', 'actif'); 

    const years: { [key: string]: number } = {};
    byYear?.forEach(m => {
      const year = new Date(m.admission_date).getFullYear().toString();
      years[year] = (years[year] || 0) + 1;
    });
    setAdhesionByYear(Object.entries(years).map(([year, count]) => ({ year, count })));
  };

  const statsCards = [
    { title: "Membres actifs", value: stats.totalMembers, icon: Users, color: "#007A2F", bg: "rgba(0, 122, 47, 0.1)" },
    { title: "Nouvelles adhésions", value: stats.newAdhesions, icon: UserPlus, color: "#F2BE2E", bg: "rgba(242, 190, 46, 0.1)" },
    { title: "Membres archivés", value: stats.archivedMembers, icon: Archive, color: "#9F2723", bg: "rgba(159, 39, 35, 0.1)" },
    { title: "Événements", value: stats.upcomingEvents, icon: Calendar, color: "#005A23", bg: "rgba(0, 90, 35, 0.1)" },
    { title: "Anniversaires", value: stats.birthdaysToday, icon: Gift, color: "#D9A520", bg: "rgba(217, 165, 32, 0.1)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="text-center animate-bounce">
          <PartyPopper className="w-16 h-16 mx-auto mb-4" style={{ color: "#F2BE2E" }} />
          <p className="text-primary-green">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header avec animation */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10 animate-slideInDown">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-green flex items-center justify-center animate-pulse">
              <img src="/images/logo.jpeg" alt="ProLife" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>ProLife Community</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: "#333333" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#F2BE2E" }} />
              <span>Bienvenue, {userEmail}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Titre animé */}
        <div className="text-center mb-10 animate-fadeIn">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#005A23" }}>
            Tableau de bord
          </h2>
          <p className="text-text-color mt-2">Bienvenue dans votre espace de gestion</p>
        </div>

        {/* Cartes stats avec animation stagger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              style={{ 
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium" style={{ color: "#333333" }}>{stat.title}</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: stat.bg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">à ce jour</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Graphiques statistiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Évolution des membres */}
          <Card className="border-0 shadow-md p-4 animate-fadeIn">
            <h3 className="font-semibold mb-4" style={{ color: "#007A2F" }}>📈 Évolution des membres</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#007A2F" strokeWidth={2} dot={{ fill: "#007A2F" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Répartition par sexe */}
          <Card className="border-0 shadow-md p-4 animate-fadeIn">
            <h3 className="font-semibold mb-4" style={{ color: "#F2BE2E" }}>👥 Répartition par sexe</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Adhésions par année */}
          <Card className="border-0 shadow-md p-4 animate-fadeIn lg:col-span-2">
            <h3 className="font-semibold mb-4" style={{ color: "#005A23" }}>📊 Adhésions par année</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={adhesionByYear}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#007A2F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bannière anniversaire festive */}
        {stats.birthdaysToday > 0 && (
          <div className="mb-10 animate-bounceIn">
            <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F2BE2E 0%, #D9A520 100%)" }}>
              <div className="absolute top-0 right-0 text-6xl opacity-20">🎂</div>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-bounce">
                    <Gift className="w-6 h-6" style={{ color: "#D9A520" }} />
                  </div>
                  <div>
                    <p className="text-dark-green font-bold text-lg">
                      🎉 {stats.birthdaysToday} membre(s) fêtent leur anniversaire aujourd'hui !
                    </p>
                    <p className="text-dark-green/80 text-sm">
                      {birthdayMembers.map(m => `${m.first_name} ${m.last_name}`).join(", ")}
                    </p>
                  </div>
                </div>
                <button className="bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-transform" style={{ color: "#D9A520" }}>
                  Envoyer un message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation rapide */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "#005A23" }}>
            <PartyPopper className="w-5 h-5" style={{ color: "#F2BE2E" }} />
            Accès rapide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Gestion des membres", href: "/dashboard/members", icon: Users, color: "#007A2F", bg: "rgba(0, 122, 47, 0.1)" },
              { title: "Demandes d'adhésion", href: "/dashboard/adhesions", icon: UserPlus, color: "#F2BE2E", bg: "rgba(242, 190, 46, 0.1)" },
              { title: "Archives", href: "/dashboard/archives", icon: Archive, color: "#9F2723", bg: "rgba(159, 39, 35, 0.1)" },
              { title: "Événements", href: "/dashboard/events", icon: Calendar, color: "#005A23", bg: "rgba(0, 90, 35, 0.1)" },
            ].map((item, index) => (
              <Card
                key={index}
                className="cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ animation: `fadeInUp 0.5s ease-out ${0.5 + index * 0.1}s forwards`, opacity: 0 }}
                onClick={() => router.push(item.href)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="p-3 rounded-full mb-3" style={{ backgroundColor: item.bg }}>
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <p className="font-semibold text-center" style={{ color: "#333333" }}>{item.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}