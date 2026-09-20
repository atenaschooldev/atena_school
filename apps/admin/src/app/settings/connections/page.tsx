import { BaseLayout } from "@/components/layouts/base-layout";
import { StripeSettingsCard } from "@/components/shared/stripe-settings-card";
import { WhiteLabelIntegrations } from "@/components/shared/white-label-integrations";

export default function ConnectionSettings() {
  return (
    <BaseLayout>
      <div className="space-y-6 px-4 lg:px-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold">Integrazioni & White-Label</h1>
          <p className="text-muted-foreground">
            Configurazione centralizzata delle credenziali per Resend (Email), Telegram Bot e Stripe.
            I valori salvati nel database hanno priorità rispetto alle variabili d'ambiente (.env).
          </p>
        </div>

        {/* Stripe Gateway Activation Controller */}
        <StripeSettingsCard />

        {/* Dynamic Integration Secrets Management */}
        <WhiteLabelIntegrations />
      </div>
    </BaseLayout>
  );
}
