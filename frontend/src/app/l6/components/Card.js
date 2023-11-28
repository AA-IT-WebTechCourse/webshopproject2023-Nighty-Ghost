import Label from "./Label";
import Square from "./Square";

export default function Card(props) {
  const cStyle = {
    width: "100px",
    height: "200px",
    padding: "0",
    margin: "10px",
    filter: "drop-shadow(0px 0px 5px #666)",
  };
  console.log("[Debug function Card]")
  console.log(props)
  
  console.log("[End debug Card]")
  return (
    <div style={cStyle} onClick={() => props.clickHandler(props.item)}>
      {/*<Square sColor={props.cColor} />*/}
      <Square sColor={"cyan"} />

      <Label label_item={props.item} />
    </div>
  );
}
