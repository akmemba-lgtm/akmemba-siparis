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
  deleteDoc,
} from "firebase/firestore";

function App() {
  const [marketName, setMarketName] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [products, setProducts] = useState([]);

  const [myOrders, setMyOrders] = useState([]);

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

  /* MY ORDERS */

  useEffect(() => {
    if (!marketName) return;

    const q = query(
      collection(db, "orders"),
      where("marketName", "==", marketName)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];

      snapshot.forEach((docItem) => {
        list.push({
          firebaseId: docItem.id,
          ...docItem.data(),
        });
      });

      setMyOrders(list);
    });

    return () => unsubscribe();
  }, [marketName]);

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

  /* EDIT ORDER */

  const editOrder = (order) => {
    if (order.status !== "Aktif") return;

    setOrders(order.orders);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setSuccessMessage(
      "✏️ Sipariş düzenleme modunda"
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  /* CANCEL ORDER */

  const cancelOrder = async (firebaseId) => {
    try {
      await deleteDoc(
        doc(db, "orders", firebaseId)
      );

      setSuccessMessage(
        "❌ Sipariş iptal edildi"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);
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
          }}
        >
          {successMessage}
        </div>
      )}

      {/* MY ORDERS */}

      {marketName && myOrders.length > 0 && (
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 24px auto",
            backgroundColor: "#fff",
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
              color: "#0B63C9",
              marginBottom: "20px",
            }}
          >
            Siparişlerim
          </h2>

          {myOrders.map((order) => (
            <div
              key={order.firebaseId}
              style={{
                border:
                  "1px solid rgba(0,0,0,0.08)",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "18px",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "12px",
                }}
              >
                <strong>
                  {order.status}
                </strong>

                <span>
                  {order.totalQuantity} adet
                </span>
              </div>

              {order.orders.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      {item.title}
                    </span>

                    <strong>
                      {item.quantity}
                    </strong>
                  </div>
                )
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                <button
                  disabled={
                    order.status !== "Aktif"
                  }
                  onClick={() =>
                    editOrder(order)
                  }
                  style={{
                    flex: 1,
                    backgroundColor:
                      order.status !== "Aktif"
                        ? "#ccc"
                        : "#0B63C9",
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Düzenle
                </button>

                <button
                  disabled={
                    order.status !== "Aktif"
                  }
                  onClick={() =>
                    cancelOrder(
                      order.firebaseId
                    )
                  }
                  style={{
                    flex: 1,
                    backgroundColor:
                      order.status !== "Aktif"
                        ? "#ccc"
                        : "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  İptal Et
                </button>
              </div>
            </div>
          ))}
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
          }}
        >
          Sipariş Özeti
        </h2>

        {orders.length === 0 ? (
          <p>Henüz ürün eklenmedi.</p>
        ) : (
          <>
            {orders.map((item) => (
              <div
                key={item.firebaseId}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "12px",
                  borderBottom:
                    "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                <span>{item.title}</span>

                <strong>
                  {item.quantity} adet
                </strong>
              </div>
            ))}

            <hr style={{ margin: "20px 0" }} />

            <h3>
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
                padding: "18px",
                backgroundColor: "#0B63C9",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                fontSize: "18px",
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