'use client';

import EAOrbieLayer from '@/app/components/orbie/EAOrbieLayer';
import { resolveCprOrbieContext } from '@/lib/universal-intelligence';

export default function CprOrbieLayer() {
  return (
    <EAOrbieLayer
      productId="cpr"
      memoryNamespace="cpr"
      resolveContext={resolveCprOrbieContext}
    />
  );
}
