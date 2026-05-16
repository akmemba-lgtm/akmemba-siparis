import { useState } from "react";

function ProductCard({
  image,
  title,
  description,
  onAddToOrder,
}) {
  const [quantity, setQuantity] = useState("");

  const isMobile = window.innerWidth < 700;

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
        padding: isMobile ? "10px" : "18px",
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: isMobile ? "390px" : "520px",
      }}
    >
      {/* RESİM */}

      <div
        style={{
          width: "100%",
          aspectRatio: "1/1",
          borderRadius: "26px",
          overflow: "hidden",
          backgroundColor: "#f4f4f4",
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* BAŞLIK */}

      <div
        style={{
          minHeight: isMobile
            ? "60px"
            : "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: isMobile
            ? "10px"
            : "18px",
        }}
      >
        <h2
          style={{
            fontSize: isMobile
              ? "18px"
              : "25px",
            color: "#111827",
            fontWeight: "800",
            textAlign: "center",
            lineHeight: "1.15",
            margin: 0,
            wordBreak: "break-word",
          }}
        >
          {title}
        </h2>
      </div>

      {/* AÇIKLAMA */}

      <p
        style={{
          color: "#6B7280",
          marginTop: "8px",
          marginBottom: "14px",
          fontSize: isMobile
            ? "14px"
            : "16px",
          textAlign: "center",
          lineHeight: "1.3",
          minHeight: isMobile
            ? "38px"
            : "45px",
        }}
      >
        {description}
      </p>

      {/* INPUT */}

      <input
        type="number"
        placeholder="Adet"
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value)
        }
        style={{
          width: "100%",
          padding: isMobile
            ? "13px"
            : "16px",
          borderRadius: "16px",
          border: "1px solid #D1D5DB",
          fontSize: isMobile
            ? "15px"
            : "18px",
          boxSizing: "border-box",
          outline: "none",
          backgroundColor: "#F9FAFB",
          color: "#111",
          textAlign: "center",
        }}
      />

      {/* BUTON */}

      <button
        onClick={handleAdd}
        style={{
          width: "100%",
          marginTop: "12px",
          backgroundColor: "#0B63C9",
          color: "#ffffff",
          border: "none",
          padding: isMobile
            ? "14px"
            : "16px",
          borderRadius: "18px",
          fontSize: isMobile
            ? "16px"
            : "18px",
          fontWeight: "800",
          cursor: "pointer",
        }}
      >
        Siparişe Ekle
      </button>
    </div>
  );
}

export default ProductCard;