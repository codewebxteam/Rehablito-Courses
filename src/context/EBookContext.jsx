import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { createOrder } from "../firebase/orders.service";

const EBookContext = createContext();

export const useEBook = () => useContext(EBookContext);

export const EBookProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [purchasedBooks, setPurchasedBooks] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadPurchasedBooks();
    } else {
      setPurchasedBooks([]);
    }
  }, [currentUser]);

  const loadPurchasedBooks = async () => {
    if (!currentUser) return;
    const docRef = doc(db, "purchasedBooks", currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const bookIds = docSnap.data().bookIds || [];
      setPurchasedBooks(bookIds);

      // Sync with dashboard
      const dashboardRef = doc(db, "dashboard", currentUser.uid);
      const dashboardSnap = await getDoc(dashboardRef);
      if (dashboardSnap.exists()) {
        await updateDoc(dashboardRef, {
          "stats.ebooks": bookIds.length,
        });
      }
    }
  };

  const purchaseBook = async (bookId, bookData) => {
    if (!currentUser) return;
    const newPurchased = [...purchasedBooks, bookId];
    setPurchasedBooks(newPurchased);

    const docRef = doc(db, "purchasedBooks", currentUser.uid);
    await setDoc(docRef, { bookIds: newPurchased }, { merge: true });

    // Update dashboard stats
    const dashboardRef = doc(db, "dashboard", currentUser.uid);
    const dashboardSnap = await getDoc(dashboardRef);
    if (dashboardSnap.exists()) {
      await updateDoc(dashboardRef, {
        "stats.ebooks": newPurchased.length,
      });
    }

    // Add to orders collection for admin tracking
    const price = bookData?.price || 0;
    await createOrder({
      studentName: currentUser.displayName || currentUser.email,
      studentEmail: currentUser.email,
      userId: currentUser.uid,
      assetName: bookData?.title || "E-Book",
      type: "ebook",
      saleValue: price,
      commission: 0,
      partnerId: "direct",
      partnerName: "Direct",
      courseId: null,
      ebookId: bookId,
    });
  };

  return (
    <EBookContext.Provider value={{ purchasedBooks, purchaseBook }}>
      {children}
    </EBookContext.Provider>
  );
};
