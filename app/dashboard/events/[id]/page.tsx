"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, Save, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    status: "a_venir",
  });

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      toast.error("Erreur chargement");
      router.push("/dashboard/events");
    } else if (data) {
      setForm({
        title: data.title,
        description: data.description || "",
        event_date: data.event_date,
        event_time: data.event_time || "",
        location: data.location || "",
        status: data.status,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('events')
      .update({
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        event_time: form.event_time,
        location: form.location,
        status: form.status,
      })
      .eq('id', params.id);

    setSaving(false);

    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success("Événement modifié !");
      router.push("/dashboard/events");
    }
  };

  const handleDelete = async () => {
    if (confirm("Supprimer définitivement cet événement ?")) {
      const { error } = await supabase.from('events').delete().eq('id', params.id);
      if (error) {
        toast.error("Erreur suppression");
      } else {
        toast.success("Événement supprimé");
        router.push("/dashboard/events");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <Toaster position="top-right" />

      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-primary-green hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour aux événements
          </Link>
          <h1 className="text-xl font-bold mt-2" style={{ color: "#007A2F" }}>Modifier l'événement</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "#007A2F" }} />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-white">Titre *</Label>
                <Input 
                  className="bg-white text-gray-900 py-2 px-3"
                  required 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Textarea 
                  className="bg-white text-gray-900"
                  rows={4}
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Date *</Label>
                  <Input 
                    className="bg-white text-gray-900 py-2 px-3"
                    type="date" 
                    required
                    value={form.event_date} 
                    onChange={e => setForm({...form, event_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-white">Heure</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      className="bg-white text-gray-900 pl-10 py-2 px-3"
                      type="time" 
                      value={form.event_time} 
                      onChange={e => setForm({...form, event_time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-white">Lieu</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input 
                    className="bg-white text-gray-900 pl-10 py-2 px-3"
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Statut</Label>
                <select 
                  className="w-full border rounded-lg p-2 py-2 px-3 bg-white text-gray-900"
                  value={form.status} 
                  onChange={e => setForm({...form, status: e.target.value})}
                >
                  <option value="a_venir">À venir</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 gap-2 font-semibold text-white"
                  style={{ backgroundColor: "#007A2F" }}
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1 gap-2 font-semibold text-white"
                  style={{ backgroundColor: "#9F2723" }}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <style jsx>{`
        .text-white {
          color: white !important;
        }
      `}</style>
    </div>
  );
}