import Chrome from "@/components/Chrome";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import About from "@/components/About";
import Overlays from "@/components/Overlays";
import Scene from "@/components/Scene";

export default function Page() {
  return (
    <>
      <Chrome />
      <main>
        <Hero />
        <Work />
        <About />
      </main>
      <Overlays />
      <canvas id="trail" aria-hidden="true"></canvas>
      <Scene />
    </>
  );
}
