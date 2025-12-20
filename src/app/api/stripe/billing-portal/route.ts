import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userType } = body as { userType: 'employer' | 'talent' };

    // Get subscription with Stripe customer ID
    const tableName = userType === 'employer' ? 'employer_subscriptions' : 'talent_subscriptions';
    const idColumn = userType === 'employer' ? 'employer_id' : 'talent_id';

    const { data: subscription } = await supabase
      .from(tableName)
      .select('stripe_customer_id')
      .eq(idColumn, user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard/${userType}/billing`;

    const session = await createBillingPortalSession(
      subscription.stripe_customer_id,
      returnUrl
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create billing portal session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
