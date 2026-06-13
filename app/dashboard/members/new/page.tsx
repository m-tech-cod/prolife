"use client";

export const dynamic = 'force-dynamic';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Camera, ArrowLeft, AlertCircle } from "lucide-react";

export default function NewMemberPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "M",
    birth_date: "",
    phone: "",
    email: "",
    address: "",
    profession: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("La photo ne doit pas dépasser 5 Mo");
      return;
    }

    setPhotoFile(file);
    setPhotoError(false);
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

    const { error } = await supabase.storage
      .from('member-photos')
      .upload(filePath, photoFile);

    setUploading(false);

    if (error) {
      console.error("Erreur upload:", error);
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
    
    if (!photoFile) {
      setPhotoError(true);
      setLoading(false);
      return;
    }

    // Créer le membre
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        ...form,
        admission_date: new Date().toISOString().split('T')[0],
        status: 'actif',
      })
      .select()
      .single();

    if (memberError) {
      alert("Erreur: " + memberError.message);
      setLoading(false);
      return;
    }

    // Upload photo si présente
    if (photoFile && member) {
      const photoUrl = await uploadPhoto(member.id);
      if (photoUrl) {
        await supabase
          .from('members')
          .update({ photo_url: photoUrl })
          .eq('id', member.id);
      }
    }

    setLoading(false);
    router.push("/dashboard/members");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-primary-green hover:underline transition-colors duration-150">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <h1 className="text-xl font-bold mt-2" style={{ color: "#007A2F" }}>Ajouter un membre</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo upload avec message d'erreur */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div 
                    className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 cursor-pointer hover:opacity-80 transition ${
                      photoError ? "border-red-500 bg-red-50" : "border-primary-green bg-gray-200"
                    }`}
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className={`w-8 h-8 ${photoError ? "text-red-400" : "text-gray-400"}`} />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-green p-1.5 rounded-full cursor-pointer hover:bg-dark-green transition">
                    <Upload className="w-3 h-3 text-white" />
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
                {photoError && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Photo obligatoire</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Cliquez sur la caméra pour ajouter la photo du membre</p>
                {uploading && <p className="text-xs text-primary-green mt-1">Upload en cours...</p>}
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Prénom *</Label><Input className="py-2 px-3" required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                  <div><Label>Nom *</Label><Input className="py-2 px-3" required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Sexe</Label>
                    <select className="w-full border rounded-lg p-2 py-2 px-3" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <Label>Date de naissance</Label>
                    <Input 
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      className="py-2 px-3"
                      value={form.birth_date} 
                      onChange={e => setForm({...form, birth_date: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Téléphone</Label><Input className="py-2 px-3" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div><Label>Email</Label><Input className="py-2 px-3" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                </div>

                <div><Label>Adresse</Label><Input className="py-2 px-3" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div><Label>Profession</Label><Input className="py-2 px-3" value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} /></div>
              </div>

              <Button type="submit" className="w-full transition-colors duration-150 py-2" style={{ backgroundColor: "#007A2F", color: "white" }} disabled={loading || uploading}>
                {loading || uploading ? "Création en cours..." : "Créer le membre"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}