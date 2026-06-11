"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet, Download, Users, Archive, UserPlus } from "lucide-react";
import Link from "next/link";
import { exportToPDF, exportToExcel } from "@/lib/utils/exports";

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  address: string;
  profession: string;
  admission_date: string;
  status: string;
}

export default function ReportsPage() {
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [archivedMembers, setArchivedMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    
    const { data: active } = await supabase
      .from('members')
      .select('*')
      .eq('is_archived', false);
    
    const { data: archived } = await supabase
      .from('members')
      .select('*')
      .eq('is_archived', true);
    
    setActiveMembers((active as Member[]) || []);
    setArchivedMembers((archived as Member[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const allMembers = [...activeMembers, ...archivedMembers];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <img src="/images/logo.jpeg" alt="ProLife" className="w-10 h-10 rounded-full" />
            </Link>
            <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>Rapports et exports</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Carte Membres actifs */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-150">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span style={{ color: "#007A2F" }}>Membres actifs</span>
                <Users className="w-6 h-6" style={{ color: "#007A2F" }} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4" style={{ color: "#007A2F" }}>{activeMembers.length}</p>
              <div className="flex gap-2">
                <Button onClick={() => exportToPDF(activeMembers, "Membres_actifs")} className="flex-1 gap-2" style={{ backgroundColor: "#007A2F", color: "white" }}>
                  <FileText className="w-4 h-4" /> PDF
                </Button>
                <Button onClick={() => exportToExcel(activeMembers, "Membres_actifs")} variant="outline" className="flex-1 gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Membres archivés */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-150">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span style={{ color: "#9F2723" }}>Membres archivés</span>
                <Archive className="w-6 h-6" style={{ color: "#9F2723" }} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4" style={{ color: "#9F2723" }}>{archivedMembers.length}</p>
              <div className="flex gap-2">
                <Button onClick={() => exportToPDF(archivedMembers, "Membres_archives")} className="flex-1 gap-2" style={{ backgroundColor: "#9F2723", color: "white" }}>
                  <FileText className="w-4 h-4" /> PDF
                </Button>
                <Button onClick={() => exportToExcel(archivedMembers, "Membres_archives")} variant="outline" className="flex-1 gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Total adhésions */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-150">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span style={{ color: "#F2BE2E" }}>Total adhésions</span>
                <UserPlus className="w-6 h-6" style={{ color: "#F2BE2E" }} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4" style={{ color: "#F2BE2E" }}>{allMembers.length}</p>
              <div className="flex gap-2">
                <Button onClick={() => exportToPDF(allMembers, "Total_adhésions")} className="flex-1 gap-2" style={{ backgroundColor: "#F2BE2E", color: "#005A23" }}>
                  <FileText className="w-4 h-4" /> PDF
                </Button>
                <Button onClick={() => exportToExcel(allMembers, "Total_adhésions")} variant="outline" className="flex-1 gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export complet */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" style={{ color: "#007A2F" }} />
              Export complet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => exportToPDF(allMembers, "Tous_les_membres")} className="flex-1 gap-2" style={{ backgroundColor: "#007A2F", color: "white" }}>
                <FileText className="w-4 h-4" /> Exporter tout en PDF
              </Button>
              <Button onClick={() => exportToExcel(allMembers, "Tous_les_membres")} variant="outline" className="flex-1 gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Exporter tout en Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}