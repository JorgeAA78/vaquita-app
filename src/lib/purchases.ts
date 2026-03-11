import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

type Purchase = {
  id: string;
  from: string;
  amount: number;
  message: string;
  date: Date;
  status: string;
};

export async function getConfirmedPayments(): Promise<Purchase[]> {
  try {
    const q = query(
      collection(db, "purchases"),
      where("status", "==", "confirmed")
    );
    const querySnapshot = await getDocs(q);
    const purchases: Purchase[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      purchases.push({
        id: doc.id,
        from: data.from,
        amount: data.amount,
        message: data.message,
        date: data.date.toDate(),
        status: data.status,
      });
    });
    return purchases;
  } catch (error) {
    console.error("Error fetching confirmed payments:", error);
    return [];
  }
}

export async function createPurchase(
  newPurchInput: Pick<Purchase, "from" | "amount" | "message">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "purchases"), {
      ...newPurchInput,
      date: new Date(),
      status: "pending",
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to create purchase");
  }
}

export async function confirmPurchase(purchaseId: string) {
  try {
    const purchaseRef = doc(db, "purchases", purchaseId);
    await updateDoc(purchaseRef, {
      status: "confirmed",
    });
    console.log(`Purchase ${purchaseId} confirmed in db`);
    return true;
  } catch (error) {
    console.error(`Error confirming purchase ${purchaseId}:`, error);
    return false;
  }
}
