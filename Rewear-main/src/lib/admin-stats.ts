import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
}

const STATS_DOC_ID = "general";
const STATS_COLLECTION = "stats";

export const AdminStatsService = {
  /**
   * Reads the aggregated stats from a single document.
   * This is extremely fast (<200ms) as it avoids counting collections.
   */
  getStats: async (): Promise<AdminStats> => {
    try {
      const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as AdminStats;
      } else {
        // Return zeros if stats document doesn't exist yet (Cloud Functions will create it eventually)
        return {
          totalUsers: 0,
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0
        };
      }
    } catch (error) {
      console.error("Error getting admin stats:", error);
      throw error;
    }
  }
};
