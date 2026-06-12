"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Heart, PartyPopper, Upload, Camera, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { notifyNewAdhesion } from "@/lib/email";

export default function AdhesionPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    gender: "M",
    birth_date: "",
    phone: "",
    address: "",
    profession: "",
  });

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.first_name.trim()) newErrors.first_name = "Le prénom est requis";
    if (!form.last_name.trim()) newErrors.last_name = "Le nom est requis";
    if (!form.email.trim()) newErrors.email = "L'email est requis";
    if (!form.email.includes("@")) newErrors.email = "Email invalide";
    if (!form.password) newErrors.password = "Le mot de passe est requis";
    if (form.password.length < 6) newErrors.password = "6 caractères minimum";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!photoFile) {
      newErrors.photo = "La photo est obligatoire";
      setPhotoError(true);
    } else {
      setPhotoError(false);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("La photo ne doit pas dépasser 5 Mo");
      setPhotoError(true);
      return;
    }

    setPhotoFile(file);
    setPhotoError(false);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
  if (!photoFile) return null;
  
  setUploading(true);
  console.log("1. Début upload pour userId:", userId);
  
  const fileExt = photoFile.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `profiles/${fileName}`;
  const supabase = createClient();

  console.log("2. Upload vers:", filePath);
  
  const { error } = await supabase.storage
    .from('member-photos')
    .upload(filePath, photoFile);

  setUploading(false);

  if (error) {
    console.error("3. Erreur upload COMPLETE:", error);
    toast.error("Erreur upload: " + error.message);
    return null;
  }

  console.log("3. Upload réussi");
  
  const { data: { publicUrl } } = supabase.storage
    .from('member-photos')
    .getPublicUrl(filePath);

  console.log("4. URL publique:", publicUrl);
  return publicUrl;
};

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      toast.error("Erreur: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      let photoUrl = null;
      if (photoFile) photoUrl = await uploadPhoto(authData.user.id);

      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
          user_id: authData.user.id,
          first_name: form.first_name,
          last_name: form.last_name,
          gender: form.gender,
          birth_date: form.birth_date || null,
          phone: form.phone,
          email: form.email,
          address: form.address,
          profession: form.profession,
          photo_url: photoUrl,
          admission_date: new Date().toISOString().split('T')[0],
          status: 'en_attente',
        })
        .select()
        .single();

        console.log("memberError:", memberError);  // ← AJOUTER ICI
        console.log("member:", member);            // ← AJOUTER ICI

      if (memberError) {
        console.error("Détail erreur membre:", memberError);  // ← AJOUTER ICI
        toast.error("Erreur création membre");
        setLoading(false);
        return;
      }

      if (member) {
        const { error: adhesionError } = await supabase
          .from('adhesions')
          .insert({
            member_id: member.id,
            status: 'en_attente',
            created_at: new Date().toISOString(),
          });

        console.log("adhesionError:", adhesionError);

        if (adhesionError) {
          console.error("Erreur insertion adhesion:", adhesionError);
        }
      }

      await supabase.from('users_metadata').insert({
        id: authData.user.id,
        email: form.email,
        role: 'membre',
        is_active: false,
      });

      // Envoyer email de notification aux admins
      await notifyNewAdhesion(`${form.first_name} ${form.last_name}`, form.email);
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F8F9FA" }}>
        <Toaster position="top-right" />
        <Card className="max-w-md w-full text-center border-0 shadow-xl animate-bounceIn">
          <CardContent className="pt-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" style={{ color: "#007A2F" }} />
            </div>
            <PartyPopper className="w-12 h-12 mx-auto mb-4" style={{ color: "#F2BE2E" }} />
            <CardTitle className="text-2xl mb-2" style={{ color: "#007A2F" }}>Demande envoyée !</CardTitle>
            <CardDescription className="mb-6">
              Votre demande d&apos;adhésion a été transmise.
              <br />
              <strong>Vous serez notifié par email après validation.</strong>
            </CardDescription>
            <Link href="/">
              <Button className="mt-4" style={{ backgroundColor: "#007A2F", color: "white" }}>Retour à l&apos;accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <Toaster position="top-right" />
      
      <div className="fixed top-4 right-4 z-[9999]">
        <Link href="/">
          <Button variant="outline" className="gap-2 bg-white/90 backdrop-blur-sm shadow-lg">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Button>
        </Link>
      </div>

      <div className="text-white py-12 px-4 text-center" style={{ backgroundColor: "#007A2F" }}>
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src="/images/logo.jpeg" alt="ProLife" width={48} height={48} className="rounded-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Rejoignez notre communauté</h1>
          <p className="text-white/90">&quot;Nous sommes pour la vie.&quot;</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Card className="border-0 shadow-xl animate-fadeIn">
          <CardHeader className="text-center">
            <CardTitle style={{ color: "#007A2F" }}>Formulaire d&apos;adhésion</CardTitle>
            <CardDescription>Remplissez vos informations pour faire partie de ProLife</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Photo */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div 
                    className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 cursor-pointer hover:opacity-80 transition ${
                      photoError ? "border-red-500 bg-red-50" : "border-primary-green bg-gray-200"
                    }`}
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Photo" width={96} height={96} className="object-cover w-full h-full" />
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
                    />
                  </label>
                </div>
                {photoError && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Photo obligatoire</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Cliquez sur la caméra pour ajouter votre photo</p>
                {uploading && <p className="text-xs text-primary-green mt-1">Upload en cours...</p>}
              </div>

              <div className="space-y-4">
                <div><Label>Prénom *</Label><Input className="py-2 px-3" required value={form.first_name} onChange={e => { setForm({...form, first_name: e.target.value}); setErrors({...errors, first_name: ""}); }} /></div>
                {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}

                <div><Label>Nom *</Label><Input className="py-2 px-3" required value={form.last_name} onChange={e => { setForm({...form, last_name: e.target.value}); setErrors({...errors, last_name: ""}); }} /></div>
                {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}

                <div><Label>Email *</Label><Input className="py-2 px-3" type="email" required value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setErrors({...errors, email: ""}); }} /></div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

                <div>
                  <Label>Mot de passe *</Label>
                  <div className="relative">
                    <Input className="py-2 px-3 pr-10" type={showPassword ? "text" : "password"} required value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: ""}); }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </div>

                <div>
                  <Label>Confirmer *</Label>
                  <div className="relative">
                    <Input className="py-2 px-3 pr-10" type={showConfirmPassword ? "text" : "password"} required value={form.confirmPassword} onChange={e => { setForm({...form, confirmPassword: e.target.value}); setErrors({...errors, confirmPassword: ""}); }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Sexe</Label>
                  <select className="w-full border rounded-lg p-2 py-2" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="M">Homme</option><option value="F">Femme</option><option value="Autre">Autre</option>
                  </select>
                </div>
                <div><Label>Date de naissance</Label>
                  <Input type="date" max={new Date().toISOString().split('T')[0]} className="py-2 px-3" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                </div>
                <div><Label>Téléphone</Label><Input className="py-2 px-3" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Adresse</Label><Input className="py-2 px-3" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div><Label>Profession</Label><Input className="py-2 px-3" value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} /></div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg flex gap-3">
                <Heart className="w-5 h-5 text-primary-red flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">En rejoignant ProLife, vous vous engagez à respecter nos valeurs.</p>
              </div>

              <Button type="submit" className="w-full font-semibold text-white py-2" style={{ backgroundColor: "#007A2F" }} disabled={loading || uploading}>
                {loading || uploading ? "Envoi en cours..." : "Envoyer ma demande"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Déjà membre ? <Link href="/auth/login" className="text-primary-green hover:underline">Se connecter</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}