import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('[GET /api/v1/checkout/settings error]:', err);
    return NextResponse.json({ success: true, settings: { stripeEnabled: false } });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const stripeEnabled = Boolean(body.stripeEnabled);
    const updated = await updateSystemSettings({ stripeEnabled });
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('[PATCH /api/v1/checkout/settings error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
