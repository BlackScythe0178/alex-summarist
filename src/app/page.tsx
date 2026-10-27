import HomeNav from "@/components/home/HomeNav";
import Landing from "@/components/home/Landing";
import Features from "@/components/home/Features";
import Reviews from "@/components/home/Reviews";
import Numbers from "@/components/home/Numbers";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <HomeNav />
      <Landing />
      <Features />
      <Reviews />
      <Numbers />
      <Footer />
    </>
  );
}
