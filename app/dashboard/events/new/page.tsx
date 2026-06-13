"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";

export default function NewEventPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    status: "a_venir",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('events').insert({
      ...form,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    setLoading(false);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      router.push("/dashboard/events");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-primary-green hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour aux événements
          </Link>
          <h1 className="text-xl font-bold mt-2" style={{ color: "#007A2F" }}>Créer un événement</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "#007A2F" }} />
              Nouvel événement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Titre *</Label>
                <Input 
                  required 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Ex: Rassemblement annuel"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  rows={4}
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Décrivez l'événement..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input 
                    type="date" 
                    required
                    value={form.event_date} 
                    onChange={e => setForm({...form, event_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Heure</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      type="time" 
                      className="pl-10"
                      value={form.event_time} 
                      onChange={e => setForm({...form, event_time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Lieu</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    className="pl-10"
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})}
                    placeholder="Ex: Salle polyvalente, Paris"
                  />
                </div>
              </div>

              <div>
                <Label>Statut</Label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={form.status} 
                  onChange={e => setForm({...form, status: e.target.value})}
                >
                  <option value="a_venir">À venir</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                style={{ backgroundColor: "#007A2F", color: "white"}} 
                disabled={loading}
              >
                {loading ? "Création en cours..." : "Créer l'événement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}