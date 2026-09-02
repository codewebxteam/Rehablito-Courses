import { createOrder } from "../firebase/orders.service";

export const RAZORPAY_KEY_ID = "rzp_test_TX7SGbS6xXovyE";

// Dynamically load Razorpay SDK if not present
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay Payment Checkout
 * Upon successful payment, records order in Firestore and triggers `onSuccess` to grant automatic course access.
 */
export const initiateRazorpayPayment = async ({
  item,
  type = "course",
  currentUser,
  onSuccess,
  onError,
}) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay Payment Gateway. Please check your internet connection.");
      if (onError) onError(new Error("Razorpay SDK load failed"));
      return;
    }

    const rawPrice = item.price || 0;
    const numericPrice = Number(String(rawPrice).replace(/[^0-9]/g, "")) || 0;

    // Free items bypass payment gateway
    if (numericPrice === 0 || String(rawPrice).toLowerCase() === "free") {
      if (onSuccess) await onSuccess({ isFree: true });
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: numericPrice * 100, // Amount in paise
      currency: "INR",
      name: "Rehablito Academy",
      description: item.title || "Rehablito Course",
      image: "https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp",
      handler: async function (response) {
        try {
          await createOrder({
            studentName: currentUser?.displayName || currentUser?.email || "Student",
            studentEmail: currentUser?.email || "",
            userId: currentUser?.uid || null,
            assetName: item.title || "Untitled Course",
            type: type,
            saleValue: numericPrice,
            courseId: type === "course" ? (item.id || item.courseId) : null,
            ebookId: type === "ebook" ? (item.id || item.ebookId) : null,
            razorpayPaymentId: response.razorpay_payment_id,
          });

          if (onSuccess) {
            await onSuccess(response);
          }
        } catch (err) {
          console.error("Post payment enrollment error:", err);
          if (onSuccess) await onSuccess(response);
        }
      },
      prefill: {
        name: currentUser?.displayName || "",
        email: currentUser?.email || "",
        contact: currentUser?.phoneNumber || currentUser?.phone || "",
      },
      theme: {
        color: "#0F1B3D",
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay modal dismissed by user");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      alert(`Payment Failed: ${response.error.description || "Transaction failed"}`);
      if (onError) onError(response.error);
    });
    rzp.open();
  } catch (error) {
    console.error("Razorpay initiation error:", error);
    alert("Could not start Razorpay payment. Please try again.");
    if (onError) onError(error);
  }
};
