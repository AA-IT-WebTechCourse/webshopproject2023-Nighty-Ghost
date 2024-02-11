import React from 'react';
import { BiCartAdd } from 'react-icons/bi';
import { BsBagPlus } from "react-icons/bs";
import { LiaEditSolid } from 'react-icons/lia';
import { RiDeleteBin2Line } from 'react-icons/ri';
import { RiDeleteBin3Fill, RiDeleteBin3Line } from "react-icons/ri";
import { useEffect, useState } from 'react';

const ItemCard = ({ item, itemFunction, DeleteIemFunction = null, filter = false }) => {
  const [isAddFunction, setIsAddFunction] = useState(false);
  const [isDeleteFunction, setIsDeleteFunction] = useState(false);
  const [isEditFunction, setIsEditFunction] = useState(false);
  //console.log(item)
  const functionName = itemFunction.name;

  let iconComponent;

  if (filter) {
    switch (functionName) {
      case 'addItemToCart':
        iconComponent = <BsBagPlus size={18} key={item.id} onClick={() => itemFunction(item)} />;
        break;
      case 'editItem':
        iconComponent = <div style={{ display: "flex", flexDirection: 'row' }}> <LiaEditSolid size={15} key={item.id} onClick={() => itemFunction(item)} /> <RiDeleteBin3Line size={15} key={`delete_${item.id}`} onClick={() => DeleteIemFunction(item)} /></div>;
        break;
        break;
      default:
        iconComponent = <BsBagPlus size={18} key={item.id} onClick={() => itemFunction(item)} />;
    }
  } else {
    iconComponent = <p></p>;
  }

  const cardStyle = {
    width: '202px',
    height: '295px',
    padding: '0px',
    margin: '6px',
    cursor: 'pointer',
    fontSize: '9px',
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {item.img_url ? (
          <img
            src={item.img_url}
            alt={item.title}
            style={{
              background: '#F2F2F2',
              width: '200px',
              height: '200px',
              marginTop: '0px',
              padding: '0px',
            }}
          />
        ) : (
          <img
            src={`${item.image}`}
            alt={item.title}
            style={{
              background: '#F2F2F2',
              width: '200px',
              height: '200px',
              marginTop: '0px',
              padding: '0px',
            }}
          />
        )}
      </div>
      <div>
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
          <div title={`${item.description}`} style={{
            fontSize: "9px",
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
    </div>

  );
};

export default ItemCard;
