import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/lib/server/checkout-service';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

async function getHandler() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('[GET /landing/settings/payment-gateway error]:', err);
    return NextResponse.json(
      { success: true, settings: { stripeEnabled: false, subscriptionsEnabled: false } },
      { status: 500 }
    );
  }
}

async function patchHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const payload: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean } = {};
    if (body.stripeEnabled !== undefined) payload.stripeEnabled = Boolean(body.stripeEnabled);
    if (body.subscriptionsEnabled !== undefined) payload.subscriptionsEnabled = Boolean(body.subscriptionsEnabled);

    const updated = await updateSystemSettings(payload);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('[PATCH /landing/settings/payment-gateway error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update system settings' },
      { status: 500 }
    );
  }
}

export const GET = withLandingApiLog(getHandler, {
  controller: 'SettingsLandingController',
  action: 'getPaymentGatewaySettings',
});

export const PATCH = withLandingApiLog(patchHandler, {
  controller: 'SettingsLandingController',
  action: 'updatePaymentGatewaySettings',
});


