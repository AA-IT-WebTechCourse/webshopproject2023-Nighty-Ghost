import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FileUploader } from "react-drag-drop-files";

const ItemEditModal =  ({ show, onHide, item })=> {
    
  const [isChecked, setIsChecked] = useState(true);
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
    
    title: '',
    url: '',
    description: '',
    price: '',
    quantity: '',
  });

  useEffect(() => {
    
    setFormData({
      
      title: item.title || '',
      url: item.img_url || '',
      description: item.description || '',
      price: item.price || '',
      quantity: item.item_quantity || '',
    });
  }, [item]);


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
  const editItem = async () => {
    formDataToSend.append('id', item.id);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('url', formData.url);
    formDataToSend.append('quantity', formData.quantity);
  
    if (!isChecked) {
      formDataToSend.append('file', file[0]);
    }
  
    try {
      checkAuth();
      const tokens = getToken();
      console.log("Sent form data:");
      console.log(formData)
  
      const response = await fetch('/api/my_items/', {
        method: 'PUT',
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
            
            title: item.title,
            url: item.url,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
          });

          setFile(null);
      }
      else{

      }
  
    } catch (error) {
      console.error('Error during new item creation:', error);
      setFormData({
        
        title: item.title,
        url: item.url,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
      });

      setFile(null);
    }
  };
  

  const SubmitForm = async (event) => {
    event.preventDefault();
    await editItem();
  };

  const ValidateAdd = () => {
    // Add your validation logic here
    console.log('Validating:', formData);

  };

  return (
    <div>
      <Modal id="Modal-Edit-Item" show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="edit-item-form" onSubmit={SubmitForm}>

            <Form.Group controlId="Edit_formTitle" style={{margin:"10px"}}>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={updateValueForm}
              />
            </Form.Group>
            
            <Form.Group controlId="Edit_formDescription" style={{margin:"10px"}}>
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
            
            <Form.Group controlId="Edit_formImg" style={{ margin: '10px' }}>
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
                        types={fileTypes} 
                    />
                    <b>
                        <p style={{ margin: '10px' }}>
                        {file ? `File name: ${file[0].name}` : 'Picture not uploaded yet'}
                        </p>
                    </b>
                    </>
                )}
            </Form.Group>



            <Form.Group controlId="Edit_formQuantity" style={{ margin: '10px' }}>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter quantity"
                name="quantity"
                value={formData.quantity}
                onChange={updateValueForm}
              />
            </Form.Group>

            <Form.Group controlId="Edit_formPrice" style={{margin:"10px"}}>
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

          <Button variant="primary" onClick={SubmitForm}>
            Validate
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemEditModal;