export default function Square(props) {
  const sStyle = {
    width: "100px",
    height: "150px",
    backgroundColor: props.sColor,
  };
  return <div style={sStyle}></div>;
}
