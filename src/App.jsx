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
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

function App() {
  /* CUSTOMER ID */

  const [customerId] = useState(() => {
    let savedId =
      localStorage.getItem("customerId");

    if (!savedId) {
      savedId =
        "customer_" +
        Math.random()
          .toString(36)
          .substring(2, 12);

      localStorage.setItem(
        "customerId",
        savedId
      );
    }

    return savedId;
  });

  /* STATES */

  const [marketName, setMarketName] = useState(
    localStorage.getItem("marketName") || ""
  );

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [products, setProducts] = useState([]);

  const [myOrders, setMyOrders] = useState([]);

  const [activeTab, setActiveTab] =
    useState("products");

  const [editingOrderId, setEditingOrderId] =
    useState(null);

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
    if (!customerId) return;

    const q = query(
      collection(db, "orders"),
      where("customerId", "==", customerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];

      snapshot.forEach((docItem) => {
        list.push({
          firebaseId: docItem.id,
          ...docItem.data(),
        });
      });

      list.sort((a, b) => {
        if (!a.createdAt || !b.createdAt)
          return 0;

        return (
          b.createdAt.seconds -
          a.createdAt.seconds
        );
      });

      setMyOrders(list);
    });

    return () => unsubscribe();
  }, [customerId]);

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
                Number(item.quantity) +
                Number(quantity),
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

    setSuccessMessage(
      "✅ Ürün siparişe eklendi"
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 1500);
  };

  /* TOTAL */

  const totalQuantity = orders.reduce(
    (total, item) =>
      total + Number(item.quantity),
    0
  );

  /* SEND ORDER */

  const sendOrder = async () => {
    if (!marketName || orders.length === 0) {
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "orders"), {
        marketName,
        customerId,
        orders,
        totalQuantity,
        createdAt: serverTimestamp(),
        status: "Aktif",
      });

      setSuccessMessage(
        "✅ Sipariş başarıyla gönderildi"
      );

      setOrders([]);

      setActiveTab("orders");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setSuccessMessage(
        "❌ Sipariş gönderilemedi"
      );
    } finally {
      setLoading(false);
    }
  };

  /* EDIT MODE */

  const editOrder = (firebaseId) => {
    setEditingOrderId(firebaseId);

    setSuccessMessage(
      "✏️ Sipariş düzenleme modunda"
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  /* INCREASE */

  const increaseQuantity = (
    orderId,
    itemIndex
  ) => {
    setMyOrders((prev) =>
      prev.map((order) => {
        if (order.firebaseId !== orderId)
          return order;

        const updatedOrders = [
          ...order.orders,
        ];

        updatedOrders[itemIndex].quantity =
          Number(
            updatedOrders[itemIndex].quantity
          ) + 1;

        return {
          ...order,
          orders: updatedOrders,
        };
      })
    );
  };

  /* DECREASE */

  const decreaseQuantity = (
    orderId,
    itemIndex
  ) => {
    setMyOrders((prev) =>
      prev.map((order) => {
        if (order.firebaseId !== orderId)
          return order;

        const updatedOrders = [
          ...order.orders,
        ];

        if (
          updatedOrders[itemIndex].quantity > 1
        ) {
          updatedOrders[itemIndex].quantity =
            Number(
              updatedOrders[itemIndex]
                .quantity
            ) - 1;
        }

        return {
          ...order,
          orders: updatedOrders,
        };
      })
    );
  };

  /* CHANGE QUANTITY */

  const changeQuantity = (
    orderId,
    itemIndex,
    value
  ) => {
    setMyOrders((prev) =>
      prev.map((order) => {
        if (order.firebaseId !== orderId)
          return order;

        const updatedOrders = [
          ...order.orders,
        ];

        updatedOrders[itemIndex].quantity =
          Number(value);

        return {
          ...order,
          orders: updatedOrders,
        };
      })
    );
  };

  /* REMOVE ITEM */

  const removeItem = (
    orderId,
    itemIndex
  ) => {
    const confirmDelete =
      window.confirm(
        "Ürünü siparişten kaldırmak istiyor musunuz?"
      );

    if (!confirmDelete) return;

    setMyOrders((prev) =>
      prev.map((order) => {
        if (order.firebaseId !== orderId)
          return order;

        const updatedOrders =
          order.orders.filter(
            (_, index) =>
              index !== itemIndex
          );

        return {
          ...order,
          orders: updatedOrders,
        };
      })
    );
  };

  /* SAVE */

  const saveEditedOrder = async (
    order
  ) => {
    try {
      const totalQuantity =
        order.orders.reduce(
          (total, item) =>
            total +
            Number(item.quantity),
          0
        );

      await updateDoc(
        doc(db, "orders", order.firebaseId),
        {
          orders: order.orders,
          totalQuantity,
        }
      );

      setEditingOrderId(null);

      setSuccessMessage(
        "✅ Sipariş güncellendi"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      console.log(error);
    }
  };

  /* CANCEL */

  const cancelOrder = async (
    firebaseId
  ) => {
    const confirmCancel =
      window.confirm(
        "Siparişi iptal etmek istediğinize emin misiniz?"
      );

    if (!confirmCancel) return;

    try {
      await deleteDoc(
        doc(db, "orders", firebaseId)
      );

      setSuccessMessage(
        "❌ Sipariş iptal edildi"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
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
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto 18px auto",
        }}
      >
        <input
          type="text"
          placeholder="Market / Şarküteri Adı"
          value={marketName}
          onChange={(e) => {
            setMarketName(e.target.value);

            localStorage.setItem(
              "marketName",
              e.target.value
            );
          }}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid #ddd",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <h1
        style={{
          textAlign: "center",
          color: "#0B63C9",
          fontSize: isMobile
            ? "28px"
            : "42px",
          marginBottom: "22px",
          fontWeight: "900",
        }}
      >
        AKMEMBA TOPTAN SİPARİŞ
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "25px",
        }}
      >
        <button
          onClick={() =>
            setActiveTab("products")
          }
          style={{
            padding: "14px 20px",
            borderRadius: "14px",
            border: "none",
            backgroundColor:
              activeTab === "products"
                ? "#0B63C9"
                : "#fff",
            color:
              activeTab === "products"
                ? "#fff"
                : "#111",
            fontWeight: "700",
          }}
        >
          Ürünler
        </button>

        <button
          onClick={() =>
            setActiveTab("orders")
          }
          style={{
            padding: "14px 20px",
            borderRadius: "14px",
            border: "none",
            backgroundColor:
              activeTab === "orders"
                ? "#0B63C9"
                : "#fff",
            color:
              activeTab === "orders"
                ? "#fff"
                : "#111",
            fontWeight: "700",
          }}
        >
          Siparişlerim
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto 20px auto",
            backgroundColor: "#16a34a",
            color: "#fff",
            padding: "15px",
            borderRadius: "16px",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          {successMessage}
        </div>
      )}

      {activeTab === "products" && (
        <>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto 24px auto",
              backgroundColor: "#fff",
              borderRadius: "22px",
              padding: "22px",
            }}
          >
            <h2
              style={{
                color: "#0B63C9",
                marginBottom: "18px",
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
                    <span>
                      {item.title}
                    </span>

                    <strong>
                      {item.quantity} adet
                    </strong>
                  </div>
                ))}

                <hr
                  style={{
                    margin: "20px 0",
                  }}
                />

                <h3>
                  Toplam Ürün:
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
                    backgroundColor:
                      "#0B63C9",
                    color: "#fff",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  {loading
                    ? "Gönderiliyor..."
                    : "Siparişi Gönder"}
                </button>
              </>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fit, minmax(320px, 1fr))",
              gap: isMobile
                ? "12px"
                : "25px",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.firebaseId}
                image={product.image}
                title={product.title}
                description={
                  product.description
                }
                onAddToOrder={(
                  quantity
                ) =>
                  addToOrder(
                    product,
                    quantity
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {myOrders.map((order) => (
            <div
              key={order.firebaseId}
              style={{
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: "22px",
                marginBottom: "22px",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "20px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  {order.status}
                </div>

                <div
                  style={{
                    backgroundColor:
                      "#eff6ff",
                    color: "#0B63C9",
                    padding:
                      "10px 14px",
                    borderRadius:
                      "12px",
                    fontWeight: "700",
                  }}
                >
                  {order.totalQuantity}
                  {" "}adet
                </div>
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
                      gap: "12px",
                      paddingBottom:
                        "16px",
                      marginBottom:
                        "16px",
                      borderBottom:
                        "1px solid #f1f1f1",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            "700",
                          color:
                            "#111827",
                          lineHeight:
                            "1.4",
                          marginBottom:
                            "10px",
                        }}
                      >
                        {item.title}
                      </div>

                      {editingOrderId ===
                      order.firebaseId ? (
                        <input
                          type="number"
                          value={
                            item.quantity
                          }
                          onChange={(
                            e
                          ) =>
                            changeQuantity(
                              order.firebaseId,
                              index,
                              e.target
                                .value
                            )
                          }
                          style={{
                            width:
                              "90px",
                            height:
                              "42px",
                            borderRadius:
                              "12px",
                            border:
                              "1px solid #d1d5db",
                            textAlign:
                              "center",
                            fontSize:
                              "17px",
                            fontWeight:
                              "700",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            color:
                              "#0B63C9",
                            fontWeight:
                              "700",
                          }}
                        >
                          {
                            item.quantity
                          }{" "}
                          adet
                        </div>
                      )}
                    </div>

                    {editingOrderId ===
                      order.firebaseId && (
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() =>
                            decreaseQuantity(
                              order.firebaseId,
                              index
                            )
                          }
                          style={{
                            width:
                              "42px",
                            height:
                              "42px",
                            borderRadius:
                              "12px",
                            border:
                              "none",
                            backgroundColor:
                              "#eef2ff",
                            color:
                              "#0B63C9",
                            fontSize:
                              "22px",
                            fontWeight:
                              "900",
                          }}
                        >
                          −
                        </button>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              order.firebaseId,
                              index
                            )
                          }
                          style={{
                            width:
                              "42px",
                            height:
                              "42px",
                            borderRadius:
                              "12px",
                            border:
                              "none",
                            backgroundColor:
                              "#0B63C9",
                            color:
                              "#fff",
                            fontSize:
                              "22px",
                            fontWeight:
                              "900",
                          }}
                        >
                          +
                        </button>

                        <button
                          onClick={() =>
                            removeItem(
                              order.firebaseId,
                              index
                            )
                          }
                          style={{
                            width:
                              "42px",
                            height:
                              "42px",
                            borderRadius:
                              "12px",
                            border:
                              "none",
                            backgroundColor:
                              "#fee2e2",
                            color:
                              "#dc2626",
                            fontSize:
                              "18px",
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <button
                  disabled={
                    order.status !==
                    "Aktif"
                  }
                  onClick={() =>
                    editOrder(
                      order.firebaseId
                    )
                  }
                  style={{
                    flex: 1,
                    backgroundColor:
                      "#0B63C9",
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius:
                      "16px",
                    fontWeight: "800",
                    fontSize: "16px",
                  }}
                >
                  Düzenle
                </button>

                <button
                  disabled={
                    order.status !==
                    "Aktif"
                  }
                  onClick={() =>
                    cancelOrder(
                      order.firebaseId
                    )
                  }
                  style={{
                    flex: 1,
                    backgroundColor:
                      "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "16px",
                    borderRadius:
                      "16px",
                    fontWeight: "800",
                    fontSize: "16px",
                  }}
                >
                  İptal Et
                </button>
              </div>

              {editingOrderId ===
                order.firebaseId && (
                <button
                  onClick={() =>
                    saveEditedOrder(order)
                  }
                  style={{
                    width: "100%",
                    marginTop: "14px",
                    backgroundColor:
                      "#16a34a",
                    color: "#fff",
                    border: "none",
                    padding: "18px",
                    borderRadius: "16px",
                    fontWeight: "800",
                    fontSize: "18px",
                  }}
                >
                  Kaydet
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;