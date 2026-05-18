import { useEffect, useState } from "react";

import { db } from "./firebase";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

function DriverPanel() {
  const [orders, setOrders] = useState([]);

  const [products, setProducts] = useState([]);

  const [activeTab, setActiveTab] =
    useState("orders");

  const [newTitle, setNewTitle] = useState("");

  const [newDescription, setNewDescription] =
    useState("");

  const [newImage, setNewImage] = useState("");

  const isMobile = window.innerWidth < 700;

  /* SİPARİŞLER */

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];

        snapshot.forEach((docItem) => {
          list.push({
            firebaseId: docItem.id,
            ...docItem.data(),
          });
        });

        setOrders(list);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ÜRÜNLER */

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];

        snapshot.forEach((docItem) => {
          list.push({
            firebaseId: docItem.id,
            ...docItem.data(),
          });
        });

        setProducts(list);
      }
    );

    return () => unsubscribe();
  }, []);

  /* HAZIRLANIYOR */

  const preparingOrder = async (
    firebaseId
  ) => {
    try {
      const orderRef = doc(
        db,
        "orders",
        firebaseId
      );

      await updateDoc(orderRef, {
        status: "Hazırlanıyor",
      });
    } catch (error) {
      console.log(error);
    }
  };

  /* YOLDA */

  const onRoadOrder = async (
    firebaseId
  ) => {
    try {
      const orderRef = doc(
        db,
        "orders",
        firebaseId
      );

      await updateDoc(orderRef, {
        status: "Yolda",
      });
    } catch (error) {
      console.log(error);
    }
  };

  /* TESLİM */

  const completeOrder = async (
    firebaseId
  ) => {
    try {
      const orderRef = doc(
        db,
        "orders",
        firebaseId
      );

      await updateDoc(orderRef, {
        status: "Teslim Edildi",
        deliveredAt: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  /* ÜRÜN EKLE */

  const addProduct = async () => {
    if (!newTitle || !newImage) return;

    try {
      await addDoc(collection(db, "products"), {
        title: newTitle,
        description: newDescription,
        image: newImage,
        createdAt: serverTimestamp(),
      });

      setNewTitle("");
      setNewDescription("");
      setNewImage("");
    } catch (error) {
      console.log(error);
    }
  };

  /* ÜRÜN SİL */

  const deleteProduct = async (
    firebaseId
  ) => {
    const confirmDelete = window.confirm(
      "Ürünü silmek istediğinize emin misiniz?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "products", firebaseId)
      );
    } catch (error) {
      console.log(error);
    }
  };

  /* AKTİF */

  const activeOrders = orders.filter(
    (item) =>
      item.status === "Aktif" ||
      item.status === "Hazırlanıyor" ||
      item.status === "Yolda"
  );

  /* TESLİM */

  const completedOrders = orders.filter(
    (item) =>
      item.status === "Teslim Edildi"
  );

  /* TOPLAM */

  const productTotals = {};

  activeOrders.forEach((order) => {
    order.orders.forEach((item) => {
      if (productTotals[item.title]) {
        productTotals[item.title] += Number(
          item.quantity
        );
      } else {
        productTotals[item.title] = Number(
          item.quantity
        );
      }
    });
  });

  const totalMarkets = activeOrders.length;

  const totalProducts = Object.values(
    productTotals
  ).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        backgroundColor: "#f4f7fb",
        minHeight: "100vh",
        padding: isMobile
          ? "14px"
          : "20px",
        fontFamily: "Arial",
      }}
    >
      {/* BAŞLIK */}

      <h1
        style={{
          textAlign: "center",
          color: "#0B63C9",
          marginBottom: "30px",
          fontSize: isMobile
            ? "28px"
            : "38px",
          fontWeight: "800",
        }}
      >
        ŞOFÖR PANELİ
      </h1>

      {/* MENÜ */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "35px",
        }}
      >
        {[
          {
            key: "orders",
            label: "Aktif Siparişler",
          },
          {
            key: "summary",
            label: "Günlük Özet",
          },
          {
            key: "products",
            label: "Ürün Yönetimi",
          },
          {
            key: "completed",
            label: "Teslim Edilenler",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveTab(tab.key)
            }
            style={{
              padding: isMobile
                ? "12px 16px"
                : "14px 22px",
              borderRadius: "14px",
              border: "none",
              backgroundColor:
                activeTab === tab.key
                  ? "#0B63C9"
                  : "#fff",
              color:
                activeTab === tab.key
                  ? "#fff"
                  : "#111",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.06)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AKTİF SİPARİŞLER */}

      {activeTab === "orders" && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {activeOrders.length === 0 && (
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "22px",
                padding: "30px",
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              Aktif sipariş yok.
            </div>
          )}

          {activeOrders.map((order) => (
            <div
              key={order.firebaseId}
              style={{
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: isMobile
                  ? "18px"
                  : "24px",
                marginBottom: "24px",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f5f7fb",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: isMobile
                        ? "22px"
                        : "26px",
                    }}
                  >
                    {order.marketName}
                  </h3>

                  <div
                    style={{
                      backgroundColor:
                        order.status ===
                        "Hazırlanıyor"
                          ? "#f59e0b"
                          : order.status ===
                            "Yolda"
                          ? "#2563eb"
                          : "#16a34a",
                      color: "#fff",
                      padding:
                        "8px 14px",
                      borderRadius: "999px",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                <p
                  style={{
                    color: "#666",
                    marginTop: "12px",
                    marginBottom: 0,
                  }}
                >
                  Sipariş Tarihi:
                  {" "}
                  {order.createdAt?.seconds
                    ? new Date(
                        order.createdAt.seconds *
                          1000
                      ).toLocaleDateString(
                        "tr-TR"
                      )
                    : "-"}
                </p>
              </div>

              {order.orders.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor:
                        "#fafafa",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                      }}
                    >
                      {item.title}
                    </span>

                    <strong
                      style={{
                        color: "#0B63C9",
                        fontSize: "17px",
                      }}
                    >
                      {item.quantity} adet
                    </strong>
                  </div>
                )
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "22px",
                }}
              >
                <button
                  onClick={() =>
                    preparingOrder(
                      order.firebaseId
                    )
                  }
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    backgroundColor:
                      "#f59e0b",
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Hazırlanıyor
                </button>

                <button
                  onClick={() =>
                    onRoadOrder(
                      order.firebaseId
                    )
                  }
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    backgroundColor:
                      "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Yolda
                </button>

                <button
                  onClick={() =>
                    completeOrder(
                      order.firebaseId
                    )
                  }
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    backgroundColor:
                      "#16a34a",
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Teslim Edildi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GÜNLÜK ÖZET */}

      {activeTab === "summary" && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "22px",
              padding: "24px",
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                color: "#0B63C9",
                marginBottom: "25px",
              }}
            >
              Günlük Operasyon Özeti
            </h2>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: "220px",
                  backgroundColor:
                    "#f5f7fb",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3>Toplam Market</h3>

                <strong
                  style={{
                    fontSize: "28px",
                    color: "#0B63C9",
                  }}
                >
                  {totalMarkets}
                </strong>
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: "220px",
                  backgroundColor:
                    "#f5f7fb",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3>Toplam Ürün</h3>

                <strong
                  style={{
                    fontSize: "28px",
                    color: "#0B63C9",
                  }}
                >
                  {totalProducts}
                </strong>
              </div>
            </div>

            {Object.entries(
              productTotals
            ).map(
              ([title, quantity]) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    padding: "16px",
                    borderRadius: "14px",
                    backgroundColor:
                      "#fafafa",
                    marginBottom: "12px",
                  }}
                >
                  <span>{title}</span>

                  <strong
                    style={{
                      color: "#0B63C9",
                    }}
                  >
                    {quantity} adet
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ÜRÜN YÖNETİMİ */}

      {activeTab === "products" && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "22px",
              padding: "24px",
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
              Ürün Yönetimi
            </h2>

            <input
              type="text"
              placeholder="Ürün Adı"
              value={newTitle}
              onChange={(e) =>
                setNewTitle(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "15px",
                borderRadius: "14px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />

            <input
              type="text"
              placeholder="Ürün Açıklaması"
              value={newDescription}
              onChange={(e) =>
                setNewDescription(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "15px",
                borderRadius: "14px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />

            <input
              type="text"
              placeholder="Görsel Linki"
              value={newImage}
              onChange={(e) =>
                setNewImage(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "15px",
                borderRadius: "14px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />

            <button
              onClick={addProduct}
              style={{
                width: "100%",
                backgroundColor:
                  "#0B63C9",
                color: "#fff",
                border: "none",
                padding: "16px",
                borderRadius: "14px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "30px",
              }}
            >
              Ürün Ekle
            </button>

            {products.map((product) => (
              <div
                key={product.firebaseId}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  backgroundColor:
                    "#fafafa",
                  padding: "18px",
                  borderRadius: "16px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <strong>
                    {product.title}
                  </strong>

                  <p
                    style={{
                      color: "#666",
                      marginTop: "6px",
                    }}
                  >
                    {
                      product.description
                    }
                  </p>
                </div>

                <button
                  onClick={() =>
                    deleteProduct(
                      product.firebaseId
                    )
                  }
                  style={{
                    backgroundColor:
                      "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding:
                      "12px 18px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TESLİM EDİLENLER */}

      {activeTab === "completed" && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {completedOrders.map((order) => (
            <div
              key={order.firebaseId}
              style={{
                backgroundColor: "#fff",
                borderRadius: "22px",
                padding: "24px",
                marginBottom: "25px",
                boxShadow:
                  "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  backgroundColor:
                    "#f5f7fb",
                  borderRadius: "14px",
                  padding: "14px",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  {order.marketName}
                </h3>

                <p
                  style={{
                    color: "#666",
                  }}
                >
                  Teslim Tarihi:
                  {" "}
                  {order.deliveredAt
                    ?.seconds
                    ? new Date(
                        order.deliveredAt
                          .seconds * 1000
                      ).toLocaleDateString(
                        "tr-TR"
                      )
                    : "-"}
                </p>
              </div>

              {order.orders.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "14px",
                      borderRadius:
                        "12px",
                      backgroundColor:
                        "#fafafa",
                      marginBottom: "10px",
                    }}
                  >
                    <span>
                      {item.title}
                    </span>

                    <strong>
                      {item.quantity} adet
                    </strong>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DriverPanel;