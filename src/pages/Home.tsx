import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const heroImages = [
  "/placeholder.svg",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
];

const galleryImages = [
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=600&q=80",
  "/placeholder.svg"
];

const Home = () => {
  const navigate = useNavigate();
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    galleryRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.style.transition = 'opacity 0.8s cubic-bezier(.4,2,.2,1), transform 0.8s cubic-bezier(.4,2,.2,1)';
        ref.style.opacity = '0';
        ref.style.transform = 'translateY(40px)';
        setTimeout(() => {
          ref.style.opacity = '1';
          ref.style.transform = 'translateY(0px)';
        }, 300 + i * 120);
      }
    });
  }, []);
  const features = [
    { title: "Modern Amenities", description: "Fully equipped rooms with all modern facilities" },
    { title: "Prime Location", description: "Centrally located with easy access to the city" },
    { title: "24/7 Security", description: "Round-the-clock security for your peace of mind" },
    { title: "Affordable Rates", description: "Competitive pricing with flexible payment options" }
  ];
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center bg-black">
        <img 
          src={heroImages[1]} 
          alt="Madona Heights Hero" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-75" 
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow">Discover Madona Heights</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow">
            Premier modern living in Nairobi. Book, manage, and experience comfort and safety in the heart of the city.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/rooms")}
            className="text-lg px-8"
          >
            View Our Rooms
          </Button>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Madona Heights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Gallery Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Property</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} ref={el => galleryRefs.current[i] = el} className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={src}
                  alt={`Madona Heights property image ${i+1}`}
                  className="w-full h-full object-cover object-center" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="flex mt-8 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = 'tel:+254700000000'}
              className="text-lg px-8"
              variant="default"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
