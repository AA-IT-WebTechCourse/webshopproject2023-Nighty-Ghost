export default function Square(props) {
  const squareStyle = {
    width: "500px",
    height: "600px",
    backgroundColor: props.sColor,
  };

  return <div style={squareStyle}></div>;
}