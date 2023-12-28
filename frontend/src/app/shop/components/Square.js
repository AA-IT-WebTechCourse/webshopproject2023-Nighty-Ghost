export default function Square(props) {
  const sStyle = {
    width: "200px",
    height: "200px",
    backgroundColor: props.sColor,
  };
  return <div style={sStyle}></div>;
}
