// src/lib/types.ts

import { Timestamp } from "firebase/firestore";

export type NotificationType = 'offer' | 'system' | 'sale' | 'info';

export type Notification = {
  id: string;
  userId: string; 
  type: NotificationType;
  title: string;
  message: string;
  link?: string; 
  read: boolean;
  createdAt: Timestamp;
  metadata?: any; // Para dados extras como preço da oferta, etc.
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  imageUrls: string[];
  imageHint: string;
  userEmail: string;
  userName: string;
  userId: string;
  quantity: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  sizes?: string[];
  brand?: string;
  material?: string;
  style?: string;
  color?: string;
  location?: string; // Localização do artigo (cidade/região)
  status?: 'disponível' | 'vendido';
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
};

export interface AddToCartPayload {
  product: Product;
  quantity: number;
  size?: string;
}

export type CartItem = AddToCartPayload & {
  id: string; 
};

export type Review = {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: Timestamp;
};

export type Conversation = {
    id: string;
    participantIds: string[];
    participants: { [key: string]: { name: string; avatar: string } };
    lastMessage?: {
        text: string;
        createdAt: Timestamp;
        senderId?: string;
        read?: boolean;
    };
    product?: {
        id: string;
        name: string;
        image: string;
    };
    unreadCount?: { [key: string]: number };
    createdAt: Timestamp;
    updatedAt?: Timestamp;
};

// TIPO AppUser (CORRIGIDO: Extendido com novos campos e createdAt)
export interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  favorites: string[];
  preferredBrands?: string[];
  preferredSizes?: string[];
  // Saldos da carteira
  walletBalance?: number; // legacy: manter para retrocompatibilidade
  wallet?: {
    available: number; // saldo disponível
    pending: number;   // saldo pendente (aguarda confirmação do comprador)
  };
  bio?: string;
  location?: string;
  phone?: string;
  photoURL?: string;
  iban?: string; // IBAN para levantamentos
  role?: 'user' | 'admin'; // Role do utilizador
  createdAt?: Timestamp; // Adicionado para a data de registo
  addresses?: Address[];
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email_marketing: boolean;
  email_orders: boolean;
  email_messages: boolean;
  push_messages: boolean;
  push_sales: boolean;
}

export interface Address {
  id: string;
  name: string; // e.g., "Casa", "Trabalho"
  fullName: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// NOVOS TIPOS PARA HISTÓRICO (para a aba de Transações)
export type Sale = {
    id: string;
    productName: string;
    price: number;
    sellerId: string;
    buyerId: string;
    buyerName: string;
    date: Timestamp;
};

export type Purchase = {
    id: string;
    productName: string;
    price: number;
    sellerId: string;
    sellerName: string;
    buyerId: string;
    date: Timestamp;
};

// Transações da carteira
export type WalletTransaction = {
  id: string;
  type: 'venda' | 'compra' | 'levantamento' | 'ajuste' | 'taxa' | 'bonus';
  amount: number; // positivo crédito, negativo débito
  description: string;
  createdAt: Timestamp;
  status?: 'pendente' | 'confirmado' | 'cancelado';
  relatedProductId?: string;
  userId?: string;
};