"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Upload, Camera, ArrowLeft, Trash2 } from "lucide-react";

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "M",
    birth_date: "",
    phone: "",
    email: "",
    address: "",
    profession: "",
    photo_url: "",
  });

  useEffect(() => {
    fetchMember();
  }, []);

  const fetchMember = async () => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (data) {
      setForm(data);
      if (data.photo_url) setPhotoPreview(data.photo_url);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (memberId: string): Promise<string | null> => {
    if (!photoFile) return null;
    
    setUploading(true);
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${memberId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Supprimer l'ancienne photo si elle existe
    if (form.photo_url) {
      const oldPath = form.photo_url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('member-photos').remove([`profiles/${oldPath}`]);
      }
    }

    const { error } = await supabase.storage
      .from('member-photos')
      .upload(filePath, photoFile);

    setUploading(false);

    if (error) {
      alert("Erreur upload: " + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('member-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let photoUrl = form.photo_url;
    if (photoFile) {
      photoUrl = await uploadPhoto(params.id as string) || photoUrl;
    }

    const { error } = await supabase
      .from('members')
      .update({ ...form, photo_url: photoUrl })
      .eq('id', params.id);

    setLoading(false);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      router.push("/dashboard/members");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-primary-green hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <h1 className="text-xl font-bold mt-2" style={{ color: "#007A2F" }}>Modifier le membre</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" style={{ color: "#007A2F" }} />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo upload */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-primary-green cursor-pointer hover:opacity-80 transition"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-green p-2 rounded-full cursor-pointer hover:bg-dark-green transition">
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Cliquez sur la photo ou sur l'icône pour modifier</p>
                {uploading && <p className="text-xs text-primary-green mt-1">Upload en cours...</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Prénom *</Label><Input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div><Label>Nom *</Label><Input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Sexe</Label>
                  <select className="w-full border rounded-lg p-2" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="M">Homme</option><option value="F">Femme</option><option value="Autre">Autre</option>
                  </select>
                </div>
                <div><Label>Date de naissance</Label><Input type="date" value={form.birth_date?.split('T')[0] || ''} onChange={e => setForm({...form, birth_date: e.target.value})} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div><Label>Profession</Label><Input value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} /></div>
              
              <Button type="submit" className="w-full" style={{ backgroundColor: "#007A2F", color: "white" }} disabled={loading || uploading}>
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}