import { doc, getDoc, setDoc, updateDoc, increment, collection, getCountFromServer, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  lastUpdated: any;
}

const STATS_DOC_ID = "general";
const STATS_COLLECTION = "stats";

export const AdminStatsService = {
  /**
   * Reads the aggregated stats from a single document.
   * If the document doesn't exist, it triggers a recalculation (fallback).
   */
  getStats: async (): Promise<AdminStats> => {
    try {
      const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as AdminStats;
      } else {
        // First time run or missing stats: Recalculate
        return await AdminStatsService.recalculateStats();
      }
    } catch (error) {
      console.error("Error getting admin stats:", error);
      throw error;
    }
  },

  /**
   * Heavy operation: Counts everything from scratch and saves to the stats document.
   * Should only be used for initialization or manual sync.
   */
  recalculateStats: async (): Promise<AdminStats> => {
    console.log("Recalculating admin stats (Heavy Operation)...");
    
    const usersCount = await getCountFromServer(collection(db, "users"));
    const productsCount = await getCountFromServer(collection(db, "products"));
    
    // Mocking sales/revenue for now as we don't have a full order system yet
    const mockSales = 124;
    const mockRevenue = 4590.50;

    const newStats: AdminStats = {
      totalUsers: usersCount.data().count,
      totalProducts: productsCount.data().count,
      totalSales: mockSales,
      totalRevenue: mockRevenue,
      lastUpdated: new Date()
    };

    await setDoc(doc(db, STATS_COLLECTION, STATS_DOC_ID), newStats);
    return newStats;
  },

  /**
   * Call this when a new user registers
   */
  incrementUserCount: async () => {
    const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
    await updateDoc(docRef, {
      totalUsers: increment(1)
    });
  },

  /**
   * Call this when a new product is created
   */
  incrementProductCount: async () => {
    const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
    await updateDoc(docRef, {
      totalProducts: increment(1)
    });
  }
};
