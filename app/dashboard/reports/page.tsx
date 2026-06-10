"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet, Download, Users, Archive, UserPlus } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [archivedMembers, setArchivedMembers] = useState<any[]>([]);
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
    
    setActiveMembers(active || []);
    setArchivedMembers(archived || []);
    setLoading(false);
  };

  const exportToPDF = async (members: any[], title: string) => {
    alert(`Export PDF de ${title} (${members.length} membres) - Fonctionnalité à venir`);
  };

  const exportToExcel = async (members: any[], title: string) => {
    alert(`Export Excel de ${title} (${members.length} membres) - Fonctionnalité à venir`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const reportCards = [
    { title: "Membres actifs", count: activeMembers.length, icon: Users, color: "#007A2F", members: activeMembers },
    { title: "Membres archivés", count: archivedMembers.length, icon: Archive, color: "#9F2723", members: archivedMembers },
    { title: "Total adhésions", count: activeMembers.length + archivedMembers.length, icon: UserPlus, color: "#F2BE2E", members: [...activeMembers, ...archivedMembers] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
        <p>Chargement...</p>
      </div>
    );
  }

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
          {reportCards.map((card, i) => (
            <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-150">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span style={{ color: card.color }}>{card.title}</span>
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4" style={{ color: card.color }}>{card.count}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => exportToPDF(card.members, card.title)}
                    className="flex-1 gap-2 transition-colors duration-150 cursor-pointer"
                    style={{ backgroundColor: card.color, color: "white" }}
                  >
                    <FileText className="w-4 h-4" /> PDF
                  </Button>
                  <Button 
                    onClick={() => exportToExcel(card.members, card.title)}
                    variant="outline"
                    className="flex-1 gap-2 transition-colors duration-150 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" style={{ color: "#007A2F" }} />
              Export complet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => exportToPDF([...activeMembers, ...archivedMembers], "Tous_les_membres")}
                className="flex-1 gap-2 transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: "#007A2F", color: "white" }}
              >
                <FileText className="w-4 h-4" /> Exporter tout en PDF
              </Button>
              <Button 
                onClick={() => exportToExcel([...activeMembers, ...archivedMembers], "Tous_les_membres")}
                variant="outline"
                className="flex-1 gap-2 transition-colors duration-150 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Exporter tout en Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}