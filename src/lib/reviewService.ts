import { 
  collection, 
  doc, 
  runTransaction, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  limit,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface Review {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
  productId: string;
}

export const reviewService = {
  /**
   * Adiciona uma avaliação e atualiza a média do produto atomicamente
   */
  async addReview(productId: string, review: Omit<Review, "id" | "createdAt">) {
    const productRef = doc(db, "products", productId);
    const reviewRef = doc(collection(db, "reviews", productId, "user_reviews"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error("Produto não encontrado");
        }

        const productData = productDoc.data();
        const currentRating = productData.rating || 0;
        const currentCount = productData.reviewCount || 0;

        // Calcular nova média
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + review.rating) / newCount;

        // Criar a review
        transaction.set(reviewRef, {
          ...review,
          createdAt: Timestamp.now(),
        });

        // Atualizar o produto
        transaction.update(productRef, {
          rating: newRating,
          reviewCount: newCount,
        });
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar avaliação:", error);
      throw error;
    }
  },

  /**
   * Busca as avaliações de um produto
   */
  async getReviews(productId: string) {
    try {
      const q = query(
        collection(db, "reviews", productId, "user_reviews"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      return [];
    }
  },

  /**
   * Verifica se o usuário já avaliou este produto
   */
  async getUserReview(productId: string, userId: string) {
    try {
      const q = query(
        collection(db, "reviews", productId, "user_reviews"),
        where("userId", "==", userId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Review) : null;
    } catch (error) {
      console.error("Erro ao verificar avaliação do usuário:", error);
      return null;
    }
  }
};
