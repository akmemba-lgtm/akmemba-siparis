import { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";

import { db } from "./firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

function App() {
  const [marketName, setMarketName] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [products, setProducts] = useState([]);

  const isMobile = window.innerWidth < 700;

  /* PRODUCTS */

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];

      snapshot.forEach((docItem) => {
        list.push({
          firebaseId: docItem.id,
          ...docItem.data(),
        });
      });

      setProducts(list);
    });

    return () => unsubscribe();
  }, []);

  /* ADD PRODUCT */

  const addToOrder = (product, quantity) => {
    const existingProduct = orders.find(
      (item) => item.firebaseId === product.firebaseId
    );

    if (existingProduct) {
      const updatedOrders = orders.map((item) =>
        item.firebaseId === product.firebaseId
          ? {
              ...item,
              quantity:
                Number(item.quantity) + Number(quantity),
            }
          : item
      );

      setOrders(updatedOrders);
    } else {
      setOrders([
        ...orders,
        {
          ...product,
          quantity,
        },
      ]);
    }
  };

  /* TOTAL */

  const totalQuantity = orders.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  /* SEND ORDER */

  const sendOrder = async () => {
    if (!marketName || orders.length === 0) {
      return;
    }

    try {
      setLoading(true);

      const q = query(
        collection(db, "orders"),
        where("marketName", "==", marketName),
        where("status", "==", "Aktif")
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];

        await updateDoc(
          doc(db, "orders", existingDoc.id),
          {
            orders,
            totalQuantity,
          }
        );

        setSuccessMessage(
          "✅ Sipariş güncellendi"
        );
      } else {
        await addDoc(collection(db, "orders"), {
          marketName,
          orders,
          totalQuantity,
          createdAt: serverTimestamp(),
          status: "Aktif",
        });

        setSuccessMessage(
          "✅ Sipariş başarıyla gönderildi"
        );
      }

      setOrders([]);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setSuccessMessage(
        "❌ Sipariş gönderilemedi"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
        padding: isMobile ? "12px" : "20px",
        fontFamily: "Arial",
      }}
    >
      {/* MARKET */}

      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto 20px auto",
        }}
      >
        <input
          type="text"
          placeholder="Market / Şarküteri Adı"
          value={marketName}
          onChange={(e) =>
            setMarketName(e.target.value)
          }
          style={{
            width: "100%",
            padding: isMobile
              ? "15px"
              : "18px",
            borderRadius: "16px",
            border: "1px solid #ddd",
            fontSize: isMobile
              ? "16px"
              : "18px",
            boxSizing: "border-box",
            color: "#111",
            backgroundColor: "#fff",
          }}
        />
      </div>

      {/* TITLE */}

      <h1
        style={{
          textAlign: "center",
          color: "#0B63C9",
          fontSize: isMobile
            ? "28px"
            : "42px",
          lineHeight: "1.1",
          marginBottom: "22px",
          fontWeight: "900",
          padding: "0 10px",
        }}
      >
        AKMEMBA TOPTAN SİPARİŞ
      </h1>

      {/* SUCCESS */}

      {successMessage && (
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto 25px auto",
            backgroundColor: "#16a34a",
            color: "#fff",
            padding: "15px",
            borderRadius: "16px",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "16px",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* ORDER SUMMARY */}

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 24px auto",
          backgroundColor: "#ffffff",
          borderRadius: "22px",
          padding: isMobile
            ? "18px"
            : "25px",
          boxShadow:
            "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            marginBottom: "18px",
            color: "#0B63C9",
            fontSize: isMobile
              ? "24px"
              : "30px",
          }}
        >
          Sipariş Özeti
        </h2>

        {orders.length === 0 ? (
          <p
            style={{
              color: "#777",
              fontSize: "16px",
            }}
          >
            Henüz ürün eklenmedi.
          </p>
        ) : (
          <>
            {orders.map((item) => (
              <div
                key={item.firebaseId}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "10px",
                  marginBottom: "12px",
                  borderBottom:
                    "1px solid #eee",
                  paddingBottom: "10px",
                  fontSize: isMobile
                    ? "14px"
                    : "16px",
                }}
              >
                <span>{item.title}</span>

                <strong>
                  {item.quantity} adet
                </strong>
              </div>
            ))}

            <hr style={{ margin: "20px 0" }} />

            <h3
              style={{
                color: "#111",
                fontSize: isMobile
                  ? "18px"
                  : "22px",
              }}
            >
              Toplam Ürün Adedi:
              {" "}
              {totalQuantity}
            </h3>

            <button
              onClick={sendOrder}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: isMobile
                  ? "16px"
                  : "18px",
                backgroundColor: "#0B63C9",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                fontSize: isMobile
                  ? "16px"
                  : "18px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {loading
                ? "Sipariş Gönderiliyor..."
                : "Siparişi Gönder"}
            </button>
          </>
        )}
      </div>

      {/* PRODUCTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: isMobile ? "12px" : "25px",
          maxWidth: "1400px",
          margin: "0 auto",
          alignItems: "start",
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.firebaseId}
            image={product.image}
            title={product.title}
            description={product.description}
            onAddToOrder={(quantity) =>
              addToOrder(product, quantity)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default App;