import styles from "../../page.module.css";

export default function Label(props) {
  // console.log("DEUBG LABEL")
  // console.log(props)
  return <div className={styles.Label}>
            <p>{props.label_item.title}</p>
            {/*<p>{props.label_item.description}</p>*/}
            <p>Price: {props.label_item.price}</p>
          </div>;
}
