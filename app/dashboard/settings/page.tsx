"use client";

export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Bell, Database, Save } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("Mot de passe mis à jour avec succès !");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#007A2F" }}>Paramètres</h1>
        
        <div className="grid gap-6 max-w-2xl">
          {/* Changement mot de passe */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: "#007A2F" }} />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label>Nouveau mot de passe</Label>
                  <Input type="password" name="password" required minLength={6} />
                </div>
                <Button type="submit" disabled={loading} style={{ backgroundColor: "#007A2F"}}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Mise à jour..." : "Changer le mot de passe"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informations compte */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" style={{ color: "#F2BE2E" }} />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Email :</strong> {user?.email}</p>
              <p><strong>ID utilisateur :</strong> {user?.id?.slice(0, 8)}...</p>
              <p><strong>Compte créé :</strong> {new Date(user?.created_at).toLocaleDateString('fr-FR')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}