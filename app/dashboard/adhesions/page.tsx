"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Mail } from "lucide-react";
import Link from "next/link";

interface Adhesion {
  id: string;
  member_id: string;
  status: string;
  created_at: string;
  members: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function AdhesionsPage() {
  const [adhesions, setAdhesions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ 
    id: string; 
    memberId: string; 
    action: 'valide' | 'rejete';
    email: string;
    name: string;
  } | null>(null);

  const supabase = createClient();

  const fetchAdhesions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('adhesions')
      .select(`
        id,
        member_id,
        status,
        created_at,
        members!inner(first_name, last_name, email, phone)
      `)
      .eq('status', 'en_attente')
      .order('created_at', { ascending: false });

    setAdhesions(data || []);
    setLoading(false);
  };

  const handleAction = async (id: string, memberId: string, action: 'valide' | 'rejete', email: string, name: string) => {
    setSendingEmail(true);
    const status = action === 'valide' ? 'valide' : 'rejete';
    
    await supabase
      .from('adhesions')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (action === 'valide') {
      await supabase
        .from('members')
        .update({ status: 'actif' })
        .eq('id', memberId);
    }

    setSendingEmail(false);
    fetchAdhesions();
    setConfirmAction(null);
  };

  useEffect(() => {
    fetchAdhesions();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <img src="/images/logo.jpeg" alt="ProLife" className="w-10 h-10 rounded-full" />
              </Link>
              <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>Demandes d'adhésion</h1>
            </div>
            <Button variant="outline" onClick={fetchAdhesions} className="gap-2 transition-colors duration-150">
              <RefreshCw className="w-4 h-4" /> Rafraîchir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-10">Chargement...</div>
            ) : adhesions.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#007A2F" }} />
                <p className="text-gray-500">Aucune demande en attente</p>
              </div>
            ) : (
              <div className="divide-y">
                {adhesions.map((item, i) => (
                  <div key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg" style={{ color: "#007A2F" }}>
                          {item.members?.first_name} {item.members?.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{item.members?.email}</p>
                        <p className="text-sm text-gray-500">{item.members?.phone || "Pas de téléphone"}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Demandé le : {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          onClick={() => setConfirmAction({ 
                            id: item.id, 
                            memberId: item.member_id, 
                            action: 'valide',
                            email: item.members?.email,
                            name: `${item.members?.first_name} ${item.members?.last_name}`
                          })}
                          className="flex-1 sm:flex-none gap-2 transition-colors duration-150" 
                          style={{ backgroundColor: "#007A2F", color: "white" }}
                        >
                          <CheckCircle className="w-4 h-4" /> Valider
                        </Button>
                        <Button 
                          onClick={() => setConfirmAction({ 
                            id: item.id, 
                            memberId: item.member_id, 
                            action: 'rejete',
                            email: item.members?.email,
                            name: `${item.members?.first_name} ${item.members?.last_name}`
                          })}
                          className="flex-1 sm:flex-none gap-2 transition-colors duration-150"
                          style={{ backgroundColor: "#9F2723", color: "white" }}
                        >
                          <XCircle className="w-4 h-4" /> Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: confirmAction.action === 'valide' ? 'rgba(0,122,47,0.1)' : 'rgba(159,39,35,0.1)' }}>
              <AlertTriangle className="w-8 h-8" style={{ color: confirmAction.action === 'valide' ? '#007A2F' : '#9F2723' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#333333" }}>
              {confirmAction.action === 'valide' ? "Valider l'adhésion ?" : "Rejeter l'adhésion ?"}
            </h3>
            <p className="text-gray-500 mb-4">
              {confirmAction.action === 'valide' 
                ? "Cette action va activer le compte du membre."
                : "Cette action va refuser la demande."}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmAction(null)} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={() => handleAction(confirmAction.id, confirmAction.memberId, confirmAction.action, confirmAction.email, confirmAction.name)}
                className="flex-1"
                style={{ backgroundColor: confirmAction.action === 'valide' ? "#007A2F" : "#9F2723", color: "white" }}
                disabled={sendingEmail}
              >
                {sendingEmail ? "Envoi en cours..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}