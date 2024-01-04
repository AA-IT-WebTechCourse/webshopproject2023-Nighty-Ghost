import Square from "./Square";
import Label from "./Label";

export default function Card(props) {
  const { title, description, price, img_url, date_added, is_sold, seller_id } = props;

  const cardStyle = {
    width: "200px",
    height: "300px",
    padding: "10px",
    margin: "40px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0px 0px 5px #666",
    cursor: "pointer",
  };

  return (
    <div style={cardStyle} onClick={() => props.clickHandler(props.cColor)}>

      <h3>{title}</h3>
      <p>{description}</p>
      <p>Price: ${price}</p>
      <img src={img_url} alt={title} style={{ maxWidth: "100%", maxHeight: "100px" }} />
      <p>Date Added: {date_added}</p>
      <p>{is_sold ? "Sold" : "Available"}</p>
      <p>Seller ID: {seller_id}</p>
    </div>
  );
}
