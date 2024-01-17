import React from 'react';
import { BiCartAdd } from 'react-icons/bi';
import { LiaEditSolid } from "react-icons/lia";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useEffect, useState } from "react";
const ItemCard = ({ item, itemFunction }) => {
  
  const [isAddFunction, setIsAddFunction] = useState(false);
  const [isDeleteFunction, setIsDeleteFunction] = useState(false);
  const [isEditFunction, setIsEditFunction] = useState(false);
  
  const functionName = itemFunction.name
  let iconComponent;

switch (functionName) {
  case 'addItemToCart':
    iconComponent = <BiCartAdd size={18} key={item.id} onClick={() => itemFunction(item.id)} />;
    break;
  case 'editItem':
    iconComponent = <LiaEditSolid size={18} key={item.id} onClick={() => itemFunction(item.id)} />;
    break;
  default:
    iconComponent = <BiCartAdd size={18} key={item.id} onClick={() => itemFunction(item.id)} />;
}

  const cardStyle = {
    width: "202px",
    height: "295px",
    padding: "0px",
    margin: "6px",
    cursor: "pointer",
    fontSize: "9px",
  };

  return (
    <div style={cardStyle}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img src={item.img_url} alt={item.title} style={{
          background: "#F2F2F2",
          maxWidth: "200px",
          maxHeight: "200px",
          marginTop: "0px",
          padding: "0px",
        }} />
      </div>
      <div>
        <div style={{ display: 'flex', flexDirection: "row", alignItems: 'center', }}>
          <div style={{
            width: "88%",
            fontSize: "11px",
            margin: "5px 0px 5px 2px",
            display: 'flex',
            flexDirection: "column",
          }}>
            <b>{item.title}</b>
          </div>
          <div style={{
            display: 'flex',
            cursor: 'pointer',
            flexDirection: "column",
          }}>
            {iconComponent}
          </div>
        </div>
        <div style={{
          "fontSize": "8px",
          margin: "5px 0px 5px 2px",
          lineHeight: "1.5em",
          height: "4.2em",
          overflow: "hidden",
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
          marginBottom: "10px",
        }}>
          {item.description}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: "row",
          width: "100%",
          fontSize: "11px",
          marginLeft: "2px"
        }}>
          <div style={{
            display: 'flex',
            flexDirection: "column",
            width: "50%"
          }}>
            <b> {item.price} € </b>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: "column",
            alignItems: 'flex-end',
            width: "48%",
            fontSize: "10px"
          }}>
            {new Date(item.date_added).toISOString().split('T')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
