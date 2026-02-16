import { Hero } from '@/components/landing';
import { HowScoreWorks } from '@/components/landing/HowScoreWorks';
import { TrustDerivation } from '@/components/landing/TrustDerivation';
import { DeploymentProof } from '@/components/landing/DeploymentProof';

export default function Home() {
  return (
    <main>
      <Hero />
      <HowScoreWorks />
      <TrustDerivation />
      <DeploymentProof />
    </main>
  );
}
