import { 
  collection, 
  doc, 
  runTransaction, 
  addDoc, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// --- Interfaces ---

interface ProductData {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  size: string;
  condition: string;
  material?: string;
  sellerInfo: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
}

interface TransactionData {
  buyerId: string;
  sellerId: string;
  productId: string;
  amount: number;
  timestamp: any;
  status: 'completed' | 'pending' | 'failed';
}

// --- Helper: Generate Search Keywords ---
const generateKeywords = (text: string): string[] => {
  if (!text) return [];
  // Remove special chars, lowercase, split by space
  const words = text.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/);
  
  // Filter empty strings and duplicates
  return [...new Set(words.filter(w => w.length > 0))];
};

// --- Function: Create Product ---
export const createProduct = async (data: ProductData) => {
  try {
    // 1. Generate Keywords for Search
    const keywords = [
      ...generateKeywords(data.title),
      ...generateKeywords(data.description),
      ...generateKeywords(data.category),
      data.condition,
      data.size.toLowerCase()
    ];

    // 2. Prepare Payload
    const payload = {
      ...data,
      searchKeywords: [...new Set(keywords)], // Remove duplicates
      status: 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      views: 0
    };

    // 3. Add to Firestore
    const docRef = await addDoc(collection(db, "products"), payload);
    console.log("Product created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating product: ", error);
    throw error;
  }
};

// --- Function: Purchase Item (Atomic Transaction) ---
export const purchaseItem = async (productId: string, buyerId: string) => {
  if (!productId || !buyerId) throw new Error("Missing productId or buyerId");

  const productRef = doc(db, "products", productId);
  const transactionRef = doc(collection(db, "transactions")); // Auto-ID for transaction

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Read Product State (Must come before writes)
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error("Product does not exist!");
      }

      const productData = productDoc.data();

      // 2. Validate Availability
      if (productData.status !== 'available') {
        throw new Error(`Product is not available. Status: ${productData.status}`);
      }

      if (productData.sellerInfo.uid === buyerId) {
        throw new Error("You cannot buy your own product.");
      }

      // 3. Prepare Transaction Record
      const transactionRecord: TransactionData = {
        buyerId: buyerId,
        sellerId: productData.sellerInfo.uid,
        productId: productId,
        amount: productData.price,
        timestamp: serverTimestamp(),
        status: 'completed'
      };

      // 4. Execute Atomic Writes
      // Update Product Status
      transaction.update(productRef, {
        status: 'sold',
        buyerId: buyerId,
        updatedAt: serverTimestamp()
      });

      // Create Transaction Record
      transaction.set(transactionRef, transactionRecord);
    });

    console.log("Transaction completed successfully!");
    return { success: true, transactionId: transactionRef.id };

  } catch (error: any) {
    console.error("Transaction failed: ", error);
    return { success: false, error: error.message };
  }
};
