export default function Cart(props) {
  return (
    <div style={{ backgroundColor: "lightgray", minWidth: "300px" }}>
      <h1>Cart: {props.items.length} items</h1>
      <div style={{ display: "block" }}>
        {props.items.map((item) => (
          <div key={item.id} onClick={() => props.deleteHandler(item.id)}>
            {item.color}
          </div>
        ))}
      </div>
    </div>
  );
}
