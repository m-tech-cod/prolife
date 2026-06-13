"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RefreshCw, UserCheck, Archive, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ArchivedMember {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  archived_at: string;
}

export default function ArchivesPage() {
  const [members, setMembers] = useState<ArchivedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchArchivedMembers = async () => {
    setLoading(true);
    let query = supabase
      .from('members')
      .select('id, member_number, first_name, last_name, email, phone, archived_at')
      .eq('is_archived', true);

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('archived_at', { ascending: false });

    if (error) {
      console.error("Erreur:", error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const handleRestore = async (id: string) => {
    await supabase
      .from('members')
      .update({ is_archived: false, archived_at: null })
      .eq('id', id);
    
    fetchArchivedMembers();
    setConfirmRestore(null);
  };

  useEffect(() => {
    fetchArchivedMembers();
  }, [searchTerm]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <img src="/images/logo.jpeg" alt="ProLife" className="w-10 h-10" />
              </Link>
              <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>Archives</h1>
            </div>
            <Button variant="outline" onClick={fetchArchivedMembers} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Rafraîchir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Barre de recherche */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un membre archivé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#007A2F]"
          />
        </div>

        {/* Liste */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#9F2723" }}>
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold">N° membre</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Nom complet</th>
                  <th className="px-4 py-3 text-left text-white font-semibold hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Date archivage</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10">Chargement...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10">
                    <Archive className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">Aucun membre archivé</p>
                  </td></tr>
                ) : (
                  members.map((member, i) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "#9F2723" }}>{member.member_number}</td>
                      <td className="px-4 py-3">{member.first_name} {member.last_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{member.email || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{member.archived_at ? new Date(member.archived_at).toLocaleDateString('fr-FR') : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/dashboard/members/${member.id}`)} className="p-1 rounded hover:bg-blue-50">
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                          <button onClick={() => setConfirmRestore(member.id)} className="p-1 rounded hover:bg-green-50">
                            <UserCheck className="w-5 h-5" style={{ color: "#007A2F" }} />
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
      </main>

      {/* Modale confirmation restauration */}
      {confirmRestore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,122,47,0.1)" }}>
              <UserCheck className="w-8 h-8" style={{ color: "#007A2F" }} />
            </div>
            <h3 className="text-xl font-bold mb-2">Restaurer ce membre ?</h3>
            <p className="text-gray-500 mb-6">Le membre sera réactivé et réapparaîtra dans la liste des membres actifs.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmRestore(null)} className="flex-1">Annuler</Button>
              <Button onClick={() => handleRestore(confirmRestore)} className="flex-1" style={{ backgroundColor: "#007A2F" }}>Restaurer</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}