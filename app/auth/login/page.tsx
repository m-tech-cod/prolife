"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erreur de connexion : " + error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-x-hidden">
      {/* Bouton retour accueil - en haut à droite */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/">
          <Button variant="outline" className="gap-2 bg-white/90 backdrop-blur-sm">
            <Home className="w-4 h-4" /> Accueil
          </Button>
        </Link>
      </div>

      {/* Côté gauche - Logo et Slogan AVEC DÉGRADÉ ANIMÉ */}
      <div 
        className="hidden lg:flex flex-col items-center justify-center p-8 text-white overflow-y-auto relative"
        style={{ 
          background: 'linear-gradient(135deg, #007A2F 0%, #005A23 50%, #003818 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite'
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ maxWidth: '100%' }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 6 + 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-md text-center animate-slideInLeft">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
              <img src="/images/logo.jpeg" alt="ProLife" className="w-20 h-20 object-contain rounded-full" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">Nous ne sommes pas pour la mort</h1>
          <p className="text-xl md:text-2xl font-semibold" style={{ color: "#F2BE2E" }}>Nous sommes pour la vie.</p>
          <div className="w-20 h-1 mx-auto my-8" style={{ backgroundColor: "#F2BE2E" }}></div>
          <p className="text-white/80 text-sm md:text-base">
            Rejoignez notre communauté et participons ensemble à la protection et à la valorisation de la vie.
          </p>
        </div>
      </div>

      {/* Côté droit - Formulaire */}
      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
        <Card className="w-full max-w-md shadow-xl border-0 mx-4 sm:mx-0 animate-slideInRight">
          <CardHeader className="space-y-1 text-center">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: "#007A2F" }}>
                <img src="/images/logo.jpeg" alt="ProLife" className="w-10 h-10 object-contain rounded-full" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold" style={{ color: "#007A2F" }}>
              Bienvenue
            </CardTitle>
            <CardDescription style={{ color: "#333333" }}>
              Connectez-vous à votre espace ProLife
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: "#333333" }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-gray-300 focus:border-[#007A2F] focus:ring-[#007A2F] py-2 px-3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: "#333333" }}>Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-gray-300 focus:border-[#007A2F] focus:ring-[#007A2F] pr-10 py-2 px-3"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#007A2F]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-sm hover:underline" style={{ color: "#007A2F" }}>
                  Mot de passe oublié ?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full font-semibold transition-colors duration-150 cursor-pointer py-2" 
                style={{ backgroundColor: "#007A2F", color: "white" }}
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              <Link href="/adhesion" prefetch={true} className="font-semibold hover:underline" style={{ color: "#9F2723" }}>
                Faire une demande d'adhésion
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}