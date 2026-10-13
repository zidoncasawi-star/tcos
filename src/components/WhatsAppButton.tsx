import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { IptvPlan } from '../types';

let cachedWhatsAppNumber: string | null = null;
let activeConfigFetch: Promise<string> | null = null;

export async function getGlobalWhatsAppNumber(): Promise<string> {
  if (cachedWhatsAppNumber) return cachedWhatsAppNumber;
  if (activeConfigFetch) return activeConfigFetch;

  activeConfigFetch = fetch('/api/config')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.whatsappNumber) {
        cachedWhatsAppNumber = data.whatsappNumber;
        return data.whatsappNumber;
      }
      return '212691606844';
    })
    .catch(() => '212691606844');

  return activeConfigFetch;
}

interface Props {
  plan?: IptvPlan;
  orderNumber?: string;
  deviceType?: string;
  customerName?: string;
  variant?: 'inline' | 'floating';
  label?: string;
  className?: string;
  whatsappNumber?: string;
}

export const WhatsAppButton: React.FC<Props> = ({
  plan,
  orderNumber,
  deviceType,
  customerName,
  variant = 'inline',
  label = 'Commander via WhatsApp',
  className = '',
  whatsappNumber: propWhatsappNumber
}) => {
  const [activeNumber, setActiveNumber] = useState<string>(propWhatsappNumber || '212691606844');

  useEffect(() => {
    if (propWhatsappNumber) {
      setActiveNumber(propWhatsappNumber);
      return;
    }
    getGlobalWhatsAppNumber().then(num => {
      setActiveNumber(num);
    });
  }, [propWhatsappNumber]);

  let message = 'Bonjour, je souhaite des informations sur vos abonnements TV.';

  if (plan) {
    const formattedPrice = `${plan.price.toFixed(2).replace('.', ',')} €`;
    message =
      `Bonjour, je souhaite commander l'offre IPTV ${plan.durationMonths} mois à ${formattedPrice}.\n\n` +
      `Offre : ${plan.name}\n` +
      `Durée : ${plan.durationMonths} mois\n` +
      `Prix : ${formattedPrice}\n` +
      `Nombre d'appareils : ${plan.devices} appareil${plan.devices > 1 ? 's' : ''}`;

    if (orderNumber) {
      message += `\nRéférence : ${orderNumber}`;
    }
    if (customerName) {
      message += `\nClient : ${customerName}`;
    }
    if (deviceType) {
      message += `\nAppareil : ${deviceType}`;
    }
  }

  const cleanNumber = activeNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  if (variant === 'floating') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all group"
        aria-label="Contacter le support par WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="hidden sm:inline">Assistance WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer text-center whitespace-normal break-words leading-tight ${className}`}
    >
      <MessageCircle className="w-4 h-4 text-white shrink-0" />
      <span className="text-center font-bold">{label}</span>
    </a>
  );
};
