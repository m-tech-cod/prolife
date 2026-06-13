"use client";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Upload, Camera, User, Phone, MapPin, Briefcase, Save, LogOut, AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function MonProfilPage() {
  const [form, setForm] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    profession: "",
    photo_url: "",
    role: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: userMeta } = await supabase
      .from('users_metadata')
      .select('role')
      .eq('id', user.id)
      .single();

    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (member) {
      setForm({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone || "",
        address: member.address || "",
        profession: member.profession || "",
        photo_url: member.photo_url || "",
        role: userMeta?.role || "membre",
      });
      setPhotoPreview(member.photo_url);
      setUserRole(userMeta?.role || "membre");
      setPhotoError(!member.photo_url);
    }
    setLoading(false);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    setSaving(true);

    let photoUrl = form.photo_url;
    if (photoFile) {
      photoUrl = await uploadPhoto(form.id) || photoUrl;
    }

    const { error } = await supabase
      .from('members')
      .update({
        phone: form.phone,
        address: form.address,
        profession: form.profession,
        photo_url: photoUrl,
      })
      .eq('id', form.id);

    setSaving(false);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("Profil mis à jour avec succès !");
      setPhotoFile(null);
      setPhotoError(!photoUrl);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAdminOrSecretaire = form.role === "admin" || form.role === "secretaire";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Bouton retour accueil flottant */}
      <div className="fixed top-4 right-4 z-[9999]">
        <Link href="/">
          <Button variant="outline" className="gap-2 bg-white/90 backdrop-blur-sm shadow-lg">
            <Home className="w-4 h-4" /> Accueil
          </Button>
        </Link>
      </div>

      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {isAdminOrSecretaire && (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-primary-green hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
            )}
            <div className="flex items-center gap-3">
              <img src="/images/logo.jpeg" alt="ProLife" className="w-10 h-10 rounded-full" />
              <h1 className="text-xl font-bold" style={{ color: "#007A2F" }}>Mon profil</h1>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 border-primary-red text-primary-red hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: "#007A2F" }} />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div 
                    className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 cursor-pointer hover:opacity-80 transition ${
                      photoError ? "border-red-500 bg-red-50" : "border-primary-green bg-gray-200"
                    }`}
                    onClick={() => document.getElementById('profile-photo')?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className={`w-10 h-10 ${photoError ? "text-red-400" : "text-gray-400"}`} />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-green p-2 rounded-full cursor-pointer hover:bg-dark-green transition">
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {photoError && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Photo obligatoire</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Cliquez sur la photo pour modifier</p>
                {uploading && <p className="text-xs text-primary-green mt-1">Upload en cours...</p>}
              </div>

              {/* Champs non modifiables */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Prénom</Label><Input value={form.first_name} disabled className="bg-gray-100" /></div>
                <div><Label>Nom</Label><Input value={form.last_name} disabled className="bg-gray-100" /></div>
              </div>
              <div><Label>Email</Label><Input type="email" value={form.email} disabled className="bg-gray-100" /></div>

              {/* Champs modifiables */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#007A2F" }}>
                  <Phone className="w-4 h-4" /> Coordonnées modifiables
                </h3>
                <div className="space-y-4">
                  <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Votre numéro" /></div>
                  <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Votre adresse" /></div>
                  <div><Label>Profession</Label><Input value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} placeholder="Votre profession" /></div>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2 font-semibold text-white" style={{ backgroundColor: "#007A2F" }} disabled={saving || uploading}>
                <Save className="w-4 h-4" />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-gray-400 mt-6">
          Les informations en grisé ne peuvent pas être modifiées. Contactez l&apos;administrateur pour toute modification.
        </p>
      </main>
    </div>
  );
}