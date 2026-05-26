import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled' | 'loading';

interface Subscription {
  id: string;
  user_identifier: string;
  user_id: string | null;
  status: SubscriptionStatus;
  plan: string;
  amount_cents: number;
  trial_started_at: string;
  trial_ends_at: string;
  activated_at: string | null;
  next_billing_at: string | null;
}

interface SubscriptionContextValue {
  subscription: Subscription | null;
  status: SubscriptionStatus;
  isActive: boolean;
  isTrial: boolean;
  trialDaysLeft: number;
  showPaywall: () => void;
  hidePaywall: () => void;
  paywallVisible: boolean;
  paywallFeature: string;
  requireActive: (featureName: string, callback?: () => void) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function getOrCreateIdentifier(): string {
  const key = 'zippy_uid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  useEffect(() => {
    const init = async () => {
      setStatus('loading');
      const uid = getOrCreateIdentifier();

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_identifier', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const now = new Date();
        let resolvedStatus: SubscriptionStatus = data.status;

        if (data.status === 'trial' && new Date(data.trial_ends_at) < now) {
          resolvedStatus = 'expired';
          await supabase.from('subscriptions').update({ status: 'expired' }).eq('id', data.id);
        }

        setSubscription({ ...data, status: resolvedStatus });
        setStatus(resolvedStatus);
      } else {
        const { data: created } = await supabase
          .from('subscriptions')
          .insert({ user_identifier: uid, user_id: null })
          .select()
          .single();

        if (created) {
          setSubscription(created);
          setStatus('trial');
        }
      }
    };

    init();
  }, []);

  const trialDaysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 14;

  const isActive = true;
  const isTrial = status === 'trial';

  const showPaywall = () => {};
  const hidePaywall = () => setPaywallVisible(false);

  const requireActive = (_featureName: string, callback?: () => void) => {
    callback?.();
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription, status, isActive, isTrial, trialDaysLeft,
      showPaywall, hidePaywall, paywallVisible, paywallFeature, requireActive,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
