import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FileUploader } from "react-drag-drop-files";

const ItemModal =  ({ show, onHide })=> {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const choiceCheckbox = () => {
    setIsChecked(!isChecked);
  };
  const TOKEN_KEY = "tokens"
  const [isAuth, setisAuth] = useState(false);
  const getToken = () => {

    if (typeof window !== 'undefined') {
      
      const value = localStorage.getItem(TOKEN_KEY);
      if(!value) return
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

  const formDataToSend = new FormData();

  const [formData, setFormData] = useState({
    image: '',
    title: '',
    url: '',
    description: '',
    price: '',
    quantity: '1',
  });

  

  const updateValueForm = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const fileTypes = ["JPEG", "PNG"];
  const [file, setFile] = useState(null);
  const UpdateFile = (file) => {
    setFile(file);
  };
  const addNewItem = async () => {
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('url', formData.url);
    formDataToSend.append('quantity', formData.quantity);
  
    if (isChecked) {
      formDataToSend.append('pictureUrl', formData.title);
    } else {
      formDataToSend.append('file', file[0]);
    }
  
    try {
      checkAuth();
      const tokens = getToken();
      console.log("Sent form data:");
  
    //   for (let [key, value] of formDataToSend.entries()) {
    //     console.log(`${key}:`, value);
    //   }
  
      const response = await fetch('/api/my_items/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
        },
        body: formDataToSend,
      });
  
      const data = await response.json();
      console.log("Response for loggin is : ", response);
      console.log("Data sent back is : ", data);
  
      if (response.ok) {
        //showFlashMessage('Item added successfully!', 'success');
        setFormData({
            image: '',
            title: '',
            url: '',
            description: '',
            price: '',
            quantity: '1',
          });

          setFile(null);
      }
      else{

      }
  
    } catch (error) {
      console.error('Error during new item creation:', error);
      setFormData({
        image: '',
        title: '',
        url: '',
        description: '',
        price: '',
        quantity: '1',
      });

      setFile(null);
    }
  };
  

  const SubmitForm = async (event) => {
    event.preventDefault();
    await addNewItem();
  };

  const ValidateAdd = () => {
    // Add your validation logic here
    console.log('Validating:', formData);
    //CloseModal();
  };

  return (
    <div>
      <Modal id="Modal-Add-Item" show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={SubmitForm}>

            <Form.Group controlId="formTitle" style={{margin:"10px"}}>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={updateValueForm}
              />
            </Form.Group>
            
            <Form.Group controlId="formDescription" style={{margin:"10px"}}>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                name="description"
                value={formData.description}
                onChange={updateValueForm}
              />
            </Form.Group>
            
            <Form.Group controlId="formImg" style={{ margin: '10px' }}>
                <Form.Label>Picture</Form.Label>
                <div style={{ margin: '4px', display:'flex', flexDirection:'row', width:'100%' }}>
                    <div style={{ marginLeft: '6px', display:'flex', flexDirection:'column',  width: '50%' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={choiceCheckbox}
                            style={{marginLeft:"5px", width:'20%'}}
                        />
                        Url
                    </label>
                    </div>

                    <div style={{ marginLeft: '6px', display:'flex', flexDirection:'column', width: '50%' }}>
                    <label>
                            <input
                            type="checkbox"
                            checked={!isChecked}
                            onChange={choiceCheckbox}
                            style={{marginLeft:"5px", width:'20%'}}
                            />
                            Upload picture
                    </label>
                    </div>
                </div>
                {isChecked ? (
                    <Form.Control
                    type="text"
                    placeholder="Picture Url"
                    name="url"
                    value={formData.url}
                    onChange={updateValueForm}
                    />
                ) : (
                    <>
                    <FileUploader
                        multiple={true}
                        handleChange={UpdateFile}
                        name="file"
                        types={fileTypes} // Make sure fileTypes is defined
                    />
                    <b>
                        <p style={{ margin: '10px' }}>
                        {file ? `File name: ${file[0].name}` : 'Picture not uploaded yet'}
                        </p>
                    </b>
                    </>
                )}
            </Form.Group>



            <Form.Group controlId="formQuantity" style={{ margin: '10px' }}>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter quantity"
                name="quantity"
                value={formData.quantity}
                onChange={updateValueForm}
              />
            </Form.Group>

            <Form.Group controlId="formPrice" style={{margin:"10px"}}>
              <Form.Label>Price (€)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter price"
                name="price"
                value={formData.price}
                onChange={updateValueForm}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" >
            Discard
          </Button>
          <Button variant="primary" onClick={SubmitForm}>
            Validate
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemModal;