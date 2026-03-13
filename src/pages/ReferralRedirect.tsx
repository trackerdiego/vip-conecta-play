import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MENU_URL = 'https://pedir.delivery/paradadoacai';
const COOKIE_NAME = 'ref_code';
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) {
      // Save referral code in cookie for attribution
      setCookie(COOKIE_NAME, code, COOKIE_DAYS);
      // Also save in localStorage as backup
      localStorage.setItem(COOKIE_NAME, code);
    }
    // Redirect to menu with referral UTM
    const url = code
      ? `${MENU_URL}?utm_source=influencer&utm_medium=referral&utm_campaign=${code}`
      : MENU_URL;
    window.location.href = url;
  }, [code]);

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center dark">
      <div className="text-center">
        <div className="h-10 w-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Redirecionando para o cardápio...</p>
      </div>
    </div>
  );
}
