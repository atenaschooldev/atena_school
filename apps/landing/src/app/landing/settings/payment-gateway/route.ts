import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/lib/server/checkout-service';
import { logLandingApi } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const settings = await getSystemSettings();
    const resPayload = { success: true, settings };

    logLandingApi({
      controller: 'SettingsLandingController',
      action: 'getPaymentGatewaySettings',
      httpMethod: 'GET',
      endpoint: '/landing/settings/payment-gateway',
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
      response: resPayload,
      statusCode: 200,
    });

    return NextResponse.json(resPayload);
  } catch (err: any) {
    console.error('[GET /landing/settings/payment-gateway error]:', err);
    const resPayload = { success: true, settings: { stripeEnabled: false, subscriptionsEnabled: false } };

    logLandingApi({
      controller: 'SettingsLandingController',
      action: 'getPaymentGatewaySettings',
      httpMethod: 'GET',
      endpoint: '/landing/settings/payment-gateway',
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
      response: { error: err.message },
      statusCode: 500,
    });

    return NextResponse.json(resPayload);
  }
}

export async function PATCH(request: NextRequest) {
  let body: any = null;
  try {
    body = await request.json();
    const payload: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean } = {};
    if (body.stripeEnabled !== undefined) payload.stripeEnabled = Boolean(body.stripeEnabled);
    if (body.subscriptionsEnabled !== undefined) payload.subscriptionsEnabled = Boolean(body.subscriptionsEnabled);

    const updated = await updateSystemSettings(payload);
    const resPayload = { success: true, settings: updated };

    logLandingApi({
      controller: 'SettingsLandingController',
      action: 'updatePaymentGatewaySettings',
      httpMethod: 'PATCH',
      endpoint: '/landing/settings/payment-gateway',
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
      request: body,
      response: resPayload,
      statusCode: 200,
    });

    return NextResponse.json(resPayload);
  } catch (err: any) {
    console.error('[PATCH /landing/settings/payment-gateway error]:', err);
    const errPayload = { success: false, error: err.message || 'Failed to update system settings' };

    logLandingApi({
      controller: 'SettingsLandingController',
      action: 'updatePaymentGatewaySettings',
      httpMethod: 'PATCH',
      endpoint: '/landing/settings/payment-gateway',
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
      request: body,
      response: errPayload,
      statusCode: 500,
    });

    return NextResponse.json(errPayload, { status: 500 });
  }
}

