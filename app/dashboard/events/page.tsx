"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Plus, Eye, Edit, Trash2, RefreshCw, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  status: string;
  created_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error("Erreur:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
    setConfirmDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'a_venir': return { bg: 'rgba(242, 190, 46, 0.1)', text: '#D9A520', label: 'À venir' };
      case 'en_cours': return { bg: 'rgba(0, 122, 47, 0.1)', text: '#007A2F', label: 'En cours' };
      case 'termine': return { bg: 'rgba(159, 39, 35, 0.1)', text: '#9F2723', label: 'Terminé' };
      default: return { bg: '#F8F9FA', text: '#333333', label: status };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
              <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>Gestion des événements</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchEvents} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Rafraîchir
              </Button>
              <Link href="/dashboard/events/new">
                <Link href="/dashboard/events/new" prefetch={true}>
                  <Button className="gap-2 transition-colors duration-150" style={{ backgroundColor: "#007A2F" }}>
                    <Plus className="w-4 h-4" /> Nouvel événement
                  </Button>
                </Link>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Grille des événements */}
        {loading ? (
          <div className="text-center py-20">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Aucun événement pour le moment</p>
            <Link href="/dashboard/events/new">
              <Button className="mt-4 font-semibold text-white" style={{ backgroundColor: "#007A2F" }}>
                Créer le premier événement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const statusStyle = getStatusColor(event.status);
              return (
                <Card key={event.id} className="border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeIn overflow-hidden" style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Bandeau couleur selon statut */}
                  <div className="h-2" style={{ backgroundColor: statusStyle.text }}></div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg" style={{ color: "#007A2F" }}>{event.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description || "Pas de description"}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.event_date).toLocaleDateString('fr-FR')}</span>
                        {event.event_time && (
                          <>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{event.event_time}</span>
                          </>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => router.push(`/dashboard/events/${event.id}`)} className="flex-1 p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors duration-150">
                        <Eye className="w-4 h-4 text-blue-600" /> Voir
                      </button>
                      <button onClick={() => router.push(`/dashboard/events/${event.id}/edit`)} className="flex-1 p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                        <Edit className="w-4 h-4" style={{ color: "#F2BE2E" }} /> Modifier
                      </button>
                      <button onClick={() => setConfirmDelete(event.id)} className="flex-1 p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" style={{ color: "#9F2723" }} /> Supprimer
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modale confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(159,39,35,0.1)" }}>
              <Trash2 className="w-8 h-8" style={{ color: "#9F2723" }} />
            </div>
            <h3 className="text-xl font-bold mb-2">Supprimer l'événement ?</h3>
            <p className="text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">Annuler</Button>
              <Button onClick={() => handleDelete(confirmDelete)} className="flex-1" style={{ backgroundColor: "#9F2723" }}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
}