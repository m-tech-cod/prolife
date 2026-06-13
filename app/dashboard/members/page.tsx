"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Eye, Edit, Archive, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  status: string;
  admission_date: string;
}

const months = [
  { name: "Janvier", value: 1, color: "#007A2F" },
  { name: "Février", value: 2, color: "#005A23" },
  { name: "Mars", value: 3, color: "#007A2F" },
  { name: "Avril", value: 4, color: "#F2BE2E" },
  { name: "Mai", value: 5, color: "#D9A520" },
  { name: "Juin", value: 6, color: "#007A2F" },
  { name: "Juillet", value: 7, color: "#9F2723" },
  { name: "Août", value: 8, color: "#7A1D1A" },
  { name: "Septembre", value: 9, color: "#F2BE2E" },
  { name: "Octobre", value: 10, color: "#D9A520" },
  { name: "Novembre", value: 11, color: "#007A2F" },
  { name: "Décembre", value: 12, color: "#005A23" },
];

// Fonction pour extraire le jour/mois d'une date YYYY-MM-DD
const formatBirthday = (dateString: string | null) => {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}`;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, selectedMonth]);

  const fetchMembers = async () => {
  setLoading(true);
  let query = supabase
    .from('members')
    .select('id, member_number, first_name, last_name, email, phone, birth_date, status, admission_date', { count: 'exact' })
    .eq('is_archived', false)
    .eq('status', 'actif');
    
    // Filtre par recherche
    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%`);
    }

    // Filtre par mois de naissance
    if (selectedMonth) {
      // Format: extraire le mois de birth_date (YYYY-MM-DD)
      query = query.filter('birth_date', 'not.is', null);
      // Note: Supabase ne supporte pas EXTRACT(MONTH) directement
      // On récupère tous puis on filtre côté client pour ce filtre
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    let { data, count, error } = await query;

    // Filtrage par mois côté client (car Supabase ne supporte pas EXTRACT)
    if (selectedMonth && data) {
      data = data.filter(member => {
        if (!member.birth_date) return false;
        const month = parseInt(member.birth_date.split('-')[1]);
        return month === selectedMonth;
      });
      count = data.length;
    }

    if (error) {
      console.error("Erreur:", error);
    } else {
      setMembers(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }
    setLoading(false);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Confirmer l'archivage de ce membre ?")) {
      await supabase.from('members').update({ is_archived: true, archived_at: new Date().toISOString() }).eq('id', id);
      fetchMembers();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/dashboard">
                <img src="/images/logo.jpeg" alt="ProLife" className="w-10 h-10 rounded-full" />
              </Link>
              <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>Gestion des membres</h1>
            </div>
            <Link href="/dashboard/members/new" prefetch={true} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto gap-2 transition-colors duration-150 cursor-pointer" style={{ backgroundColor: "#007A2F", color: "white" }}>
                <Plus className="w-4 h-4" /> Nouveau membre
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Barre de recherche */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, prénom ou numéro..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 border-gray-300 focus:border-[#007A2F]"
          />
        </div>

        {/* Filtres par mois d'anniversaire */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5" style={{ color: "#007A2F" }} />
            <span className="font-semibold text-sm" style={{ color: "#333333" }}>Filtrer par mois de naissance :</span>
            {selectedMonth && (
              <button
                onClick={() => { setSelectedMonth(null); setCurrentPage(1); }}
                className="text-xs px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                Effacer
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {months.map((month) => (
              <button
                key={month.value}
                onClick={() => { setSelectedMonth(month.value); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedMonth === month.value
                    ? "text-white shadow-md scale-105"
                    : "bg-white text-gray-700 hover:shadow border border-gray-200"
                }`}
                style={selectedMonth === month.value ? { backgroundColor: month.color } : {}}
              >
                {month.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table responsive */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#007A2F" }}>
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold">N° membre</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Nom complet</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Anniversaire</th>
                  <th className="px-4 py-3 text-left text-white font-semibold hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-white font-semibold hidden sm:table-cell">Téléphone</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10">Chargement...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Aucun membre trouvé</p>
                  </td></tr>
                ) : (
                  members.map((member, i) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ animation: `fadeIn 0.3s ease-out ${i * 0.03}s forwards`, opacity: 0 }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "#007A2F" }}>{member.member_number}</td>
                      <td className="px-4 py-3">{member.first_name} {member.last_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(242, 190, 46, 0.1)", color: "#D9A520" }}>
                          <CalendarDays className="w-3 h-3" />
                          {formatBirthday(member.birth_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{member.email || "-"}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{member.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/dashboard/members/${member.id}`)} className="p-1 rounded hover:bg-blue-50 transition-colors duration-150">
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                          <button onClick={() => router.push(`/dashboard/members/${member.id}`)} className="p-1 rounded hover:bg-green-50 transition-colors">
                            <Edit className="w-5 h-5" style={{ color: "#F2BE2E" }} />
                          </button>
                          <button onClick={() => handleArchive(member.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                            <Archive className="w-5 h-5" style={{ color: "#9F2723" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 gap-4 flex-wrap">
            <span className="text-sm text-gray-500">Page {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="transition-colors duration-150">
                <ChevronLeft className="w-4 h-4" /> Précédent
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}