import { useState } from "react";

function ProductCard({
  image,
  title,
  description,
  onAddToOrder,
}) {
  const [quantity, setQuantity] = useState("");

  const handleAdd = () => {
    if (!quantity || quantity <= 0) {
      return;
    }

    onAddToOrder(quantity);

    setQuantity("");
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* RESİM ALANI */}

      <div
  style={{
    width: "100%",
    height: "260px",
    backgroundColor: "#f4f4f4",
    borderRadius: "22px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <img
    src={image}
    alt={title}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
      borderRadius: "22px",
    }}
  />
</div>

      {/* BAŞLIK */}

      <h2
        style={{
          fontSize: "24px",
          marginTop: "18px",
          color: "#111827",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      {/* AÇIKLAMA */}

      <p
        style={{
          color: "#6B7280",
          marginTop: "10px",
          fontSize: "16px",
          textAlign: "center",
          minHeight: "40px",
        }}
      >
        {description}
      </p>

      {/* ADET */}

      <input
        type="number"
        placeholder="Kaç adet istiyorsunuz?"
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value)
        }
        style={{
          width: "100%",
          padding: "16px",
          marginTop: "22px",
          borderRadius: "14px",
          border: "1px solid #D1D5DB",
          fontSize: "18px",
          boxSizing: "border-box",
          outline: "none",
          backgroundColor: "#F9FAFB",
          color: "#111",
        }}
      />

      {/* BUTON */}

      <button
        onClick={handleAdd}
        style={{
          width: "100%",
          marginTop: "18px",
          backgroundColor: "#0B63C9",
          color: "#ffffff",
          border: "none",
          padding: "16px",
          borderRadius: "14px",
          fontSize: "18px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Siparişe Ekle
      </button>
    </div>
  );
}

export default ProductCard;