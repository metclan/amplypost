import Navigation from "../components/navigation";
import Hero from "../components/hero";
import Pricing from "../components/pricing";
import FAQ from "../components/faq";
import Footer from "../components/footer";

export default function GlobalPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <Navigation />

            {/* Hero Section */}
            <Hero />

            {/* Pricing Section */}
            <Pricing />

            {/* FAQ Section */}
            <FAQ />

            {/* Footer */}
            <Footer />
        </div>
    );
}
