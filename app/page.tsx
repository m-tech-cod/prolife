"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Heart, Shield, Users, Award, FileText, ArrowRight, Sparkles, ChevronRight } from "lucide-react";

export default function HomePage() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && typedRef.current) {
      const texts = [
        'Rejoignez une communauté engagée pour la protection de la vie.',
        'Ensemble, faisons la différence pour la valorisation de la vie.',
        'Une communauté solidaire et bienveillante vous attend.',
      ];
      let textIndex = 0;
      let charIndex = 0;
      let currentText = '';

      const type = () => {
        if (!typedRef.current) return;
        
        const fullText = texts[textIndex];
        
        if (charIndex <= fullText.length) {
          currentText = fullText.slice(0, charIndex);
          typedRef.current.textContent = currentText;
          charIndex++;
          setTimeout(type, 80);
        } else {
          setTimeout(() => {
            const erase = () => {
              if (!typedRef.current) return;
              if (charIndex > 0) {
                currentText = currentText.slice(0, -1);
                typedRef.current.textContent = currentText;
                charIndex--;
                setTimeout(erase, 40);
              } else {
                textIndex = (textIndex + 1) % texts.length;
                charIndex = 0;
                setTimeout(type, 200);
              }
            };
            erase();
          }, 1500);
        }
      };
      
      type();
    }
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section avec image d'arrière-plan */}
      <section className="relative min-h-[650px] flex items-center overflow-hidden">
        {/* Image d'arrière-plan */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/images/hero.jpeg')",
            backgroundPosition: "center 30%",
          }}
        />
        
        {/* Overlay dégradé PLUS CLAIR (opacité réduite) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#007A2F]/60 to-[#007A2F]/40" />
        
        {/* Logo en haut à gauche */}
        <div className="absolute top-6 left-6 z-20 animate-slideInLeft">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300">
            <Image src="/images/logo.jpeg" alt="ProLife" width={64} height={64} className="rounded-full" />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="relative container mx-auto px-4 py-20 lg:py-32 text-center z-10 animate-fadeIn">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg animate-slideInDown">
            Nous ne sommes pas pour la mort
          </h1>
          <p className="text-2xl lg:text-3xl font-semibold mb-8 animate-slideInUp" style={{ color: "#F2BE2E" }}>
            Nous sommes pour la vie.
          </p>
          
          {/* Texte animé */}
          <div className="text-lg lg:text-xl max-w-[90%] sm:max-w-2xl mx-auto mb-10 text-white/90 min-h-[100px] sm:min-h-[80px] px-4 animate-fadeIn">
            <span ref={typedRef}></span>
            <span className="animate-pulse">|</span>
          </div>
          
          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login" prefetch={true}>
              <Button 
                size="lg" 
                className="font-semibold transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: "#F2BE2E", color: "#005A23" }}
              >
                Accéder à mon espace
              </Button>
            </Link>
            <Link href="/adhesion" prefetch={true}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 font-semibold transition-colors duration-150 cursor-pointer"
              >
                Faire une demande d'adhésion
              </Button>
            </Link>
          </div>

          {/* Indicateur de défilement */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12" style={{ color: "#005A23" }}>
          Nos engagements
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Heart, title: "Bienveillance", desc: "Une communauté solidaire et respectueuse", color: "#9F2723" },
            { icon: Shield, title: "Protection", desc: "Défense active de la vie sous toutes ses formes", color: "#007A2F" },
            { icon: Users, title: "Entraide", desc: "Soutien mutuel entre les membres", color: "#F2BE2E" },
            { icon: Award, title: "Excellence", desc: "Des actions de qualité et responsables", color: "#9F2723" },
            { icon: Calendar, title: "Événements", desc: "Rencontres et moments de partage", color: "#007A2F" },
            { icon: FileText, title: "Transparence", desc: "Une gestion claire et rigoureuse", color: "#F2BE2E" },
          ].map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 animate-fadeIn text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="w-8 h-8" style={{ color: item.color }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "#005A23" }}>{item.title}</h3>
              <p style={{ color: "#333333" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#005A23" }} className="text-white py-8 text-center">
        <p className="text-sm">© 2026 Communauté ProLife - Tous droits réservés</p>
        <p className="text-xs mt-2 text-white/60">&quot;Nous sommes pour la vie&quot;</p>
        <p className="text-xs mt-4 text-white/40">Conçu et développé par NovaWeb Labs</p>
      </footer>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
        .animate-slideInUp { animation: slideInUp 0.7s ease-out forwards; }
        .animate-slideInDown { animation: slideInDown 0.7s ease-out forwards; }
      `}</style>
    </div>
  );
}