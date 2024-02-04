"use client";
// @ts-ignore
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
// @ts-ignore
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import ItemContainer from './../../components/ItemsContainer.js';
import { useEffect, useState } from "react";
import NvBar from '../../components/Navbar'
import UserMenuBar from "../../components/UserMenu";
import FlashMessage from '../../components/FlashMessage'
import ItemCard from './../../components/ItemCard'
import ItemModal from './../../components/addNewItem'
import ItemEditModal from './../../components/ediItem'
import { IoIosAddCircleOutline } from "react-icons/io";
// @ts-ignore

export default function Home() {

  // @ts-ignore
  const [ItemCartCount, setItemCartCount] = useState(0);
  const TOKEN_KEY = "tokens"
  const [isAuth, setisAuth] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };
  const [onSaleFilter, setOnSaleFilter] = useState(true);
  const [soldFilter, setSoldFilter] = useState(false);
  const [purchasedFilter, setPurchasedFilter] = useState(false);

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

  const [showModalAddItem, setShowModalAddItem] = useState(false);

  const openModalNewItem = () => {
    setShowModalAddItem(true);
    console.log(showModalAddItem)
  };

  const closeModalNewItem = () => {
    setShowModalAddItem(false);
    console.log(showModalAddItem)
  };

  const [showModalEditItem, setShowModalEditItem] = useState(false);

  const openModalEditItem = () => {
    setShowModalEditItem(true);
    console.log(showModalEditItem)
  };

  const closeModalEditItem = () => {
    setShowModalEditItem(false);
    console.log(showModalEditItem)
  };

  const getToken = () => {

    if (typeof window !== 'undefined') {

      const value = localStorage.getItem(TOKEN_KEY);
      if (!value) return
      const tokens = JSON.parse(value)
      return tokens
    }
    else {
      return
    }
  }

  const checkAuth = async () => {
    const tokens = getToken();
    console.log("checkAuth: ", tokens)

    if (tokens) {
      const res = await fetch("/api/me/", {
        headers: {
          "Authorization": `Bearer ${tokens.access}`
        }
      });

      if (res.ok) {

        setisAuth(true);
        console.log("User is authenticated", isAuth)
      } else {
        setisAuth(false);
        console.log("User is not authenticated")
      }
      return tokens
    } else {
      console.error("Tokens or access token is undefined");
      return
    }
  };


  const [isHoveredOnSaleFilter, setIsHoveredOnSaleFilter] = useState(false);
  const [isHoveredSoldFilter, setIsHoveredSoldFilter] = useState(false);
  const [isHoveredPurchasedFilter, setIsHoveredPurchasedFilter] = useState(false);


  const [itemToEdit, setItemToEdit] = useState([]);


  const [items, setItems] = useState([]);

  const FilterItems = (category) => {
    if (category === 'onSale') {
      setOnSaleFilter(true);
      setSoldFilter(false);
      setPurchasedFilter(false);
    } else if (category === 'Sold') {
      setOnSaleFilter(false);
      setSoldFilter(true);
      setPurchasedFilter(false);
    } else if (category === 'Purchased') {
      setOnSaleFilter(false);
      setSoldFilter(false);
      setPurchasedFilter(true);
    };
  }





  // @ts-ignore
  const editItem = async (item) => {
    setItemToEdit(item)
    openModalEditItem();
    checkAuth();
    const tokens = getToken();
    console.log("item is : ", item)
  };

  const myItemsFilterstyles = {
    myItemsFilterMenuCtn: {
      width: '60%',
      display: 'flex',
      alignContent: 'stretch',
      marginTop: "40px",
    },
    myItemsFilterMenu: {
      display: 'inline-block',
      padding: '10px 5px',
      flex: 1,
      color: 'whitesmoke',
      textDecoration: 'none',
      justifyContent: "center",
      textAlign: 'center',
      fontWeight: 600,
      lineHeight: '30px',
      verticalAlign: 'middle',
      transition: 'transform 0.3s ease-in-out',
    },
    myItemsFilterMenuLink: {
      color: 'whitesmoke',
    },
    myItemsFilterMenu0: {
      backgroundColor: 'darkblue',
      color: 'white',
      borderRadius: '5px 0px 0px 5px',
      cursor: 'pointer',
      transform: onSaleFilter ? 'scale(1.2)' : ''
    },
    myItemsFilterMenu1: {
      backgroundColor: '#C0E410',
      cursor: 'pointer',
      transform: soldFilter ? 'scale(1.2)' : ''
    },
    myItemsFilterMenu2: {
      backgroundColor: '#4F9E30',
      borderRadius: '0px 5px 5px 0px',
      cursor: 'pointer',
      transform: purchasedFilter ? 'scale(1.2)' : ''
    },
    myItemsFilterMenuHover: {
      transform: 'scale(1.4)',
      zIndex: 9999,
    },
  };

  // @ts-ignore

  useEffect(() => {
    checkAuth();
    const tokens = getToken();

    const fetchData = async () => {
      try {
        const response = await fetch("/api/my_items/", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.access}`,
          },

        });

        const data = await response.json();
        console.log(typeof data.items); // Using typeof for a quick check
        console.log(Object.keys(data.items).length);
        setItems(data.items.not_sold);
        console.log(data.items.not_sold)
        if (soldFilter) {
          setItems(data.items.sold);
        } else if (onSaleFilter) {
          setItems(data.items.onsale);
        } else if (purchasedFilter) {
          setItems(data.items.purchased);
        } else {
          // Handle the case where none of the filters is true
          console.error("No valid filter is true.");
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchData();
  }, [onSaleFilter, soldFilter, purchasedFilter])

  const deleteItem = async (item) => {

    try {
      const tokens = getToken();

      const response = await fetch('/api/my_items/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access}`,
        },

        body: JSON.stringify({
          item: item,
        }),
      });

      const data = await response.json();
      console.log("Response for deleting item is : ", response);


      if (response.ok) {
        showFlashMessage('Item deleted successfully!', 'success');
        setItems((prevItems) => prevItems.filter((previtem) => previtem.id !== item.id));

      }
      else {
        showFlashMessage('Could not delete', 'error');
      }

    } catch (error) {
      console.error('Not authenticated', error);

    }
  };



  return (
    <div>
      <UserMenuBar />
      <NvBar cartCount={ItemCartCount} setCartCount={setItemCartCount} />

      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={closeFlashMessage}
        />
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: "5px",
        marginBottom: "40px",
        width: '98%',
      }}>

        <div style={myItemsFilterstyles.myItemsFilterMenuCtn}>
          <div
            // @ts-ignore
            style={{
              ...myItemsFilterstyles.myItemsFilterMenu,
              ...myItemsFilterstyles.myItemsFilterMenu0,
              ...(isHoveredOnSaleFilter && myItemsFilterstyles.myItemsFilterMenuHover),

            }}
            onMouseEnter={() => setIsHoveredOnSaleFilter(true)}
            onMouseLeave={() => setIsHoveredOnSaleFilter(false)}
            onClick={() => FilterItems('onSale')}
          >
            On sale
          </div>
          <div
            // @ts-ignore
            style={{
              ...myItemsFilterstyles.myItemsFilterMenu,
              ...myItemsFilterstyles.myItemsFilterMenu1,
              ...(isHoveredSoldFilter && myItemsFilterstyles.myItemsFilterMenuHover),
            }}
            onMouseEnter={() => setIsHoveredSoldFilter(true)}
            onMouseLeave={() => setIsHoveredSoldFilter(false)}
            onClick={() => FilterItems('Sold')}
          >
            Sold
          </div>
          <div
            // @ts-ignore
            style={{
              ...myItemsFilterstyles.myItemsFilterMenu,
              ...myItemsFilterstyles.myItemsFilterMenu2,
              ...(isHoveredPurchasedFilter && myItemsFilterstyles.myItemsFilterMenuHover),
            }}
            onMouseEnter={() => setIsHoveredPurchasedFilter(true)}
            onMouseLeave={() => setIsHoveredPurchasedFilter(false)}
            onClick={() => FilterItems('Purchased')}
          >
            Purchased
          </div>
        </div>

      </div>

      {itemToEdit ? (<ItemEditModal item={itemToEdit} show={showModalEditItem} onHide={closeModalEditItem} setItems={setItems} />) : <div></div>}

      {onSaleFilter ? (<div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }}>
        <Button variant="secondary" onClick={openModalNewItem} className="mb-4" style={{ border: "none", width: "200px" }}>
          New Item <IoIosAddCircleOutline />
        </Button>
      </div>) : <div></div>}

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '20px',
      }}>
        <ItemContainer items={items} itemFunction={editItem} DeleteIemFunction={deleteItem} filter={onSaleFilter} />
      </div>
    </div>





  );
}
