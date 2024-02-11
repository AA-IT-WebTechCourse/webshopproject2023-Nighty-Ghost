import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FileUploader } from "react-drag-drop-files";
import FlashMessage from './FlashMessage'

const ItemEditModal = ({ show, onHide, setItems, item }) => {
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };


  const [isChecked, setIsChecked] = useState(true);

  const choiceCheckbox = () => {
    setIsChecked(!isChecked);
  };
  const TOKEN_KEY = "tokens"
  const [isAuth, setisAuth] = useState(false);
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
     //console.log("checkAuth: ", tokens)

    if (tokens) {
      const res = await fetch("/api/me/", {
        headers: {
          "Authorization": `Bearer ${tokens.access}`
        }
      });

      if (res.ok) {

        setisAuth(true);
         //console.log("User is authenticated", isAuth)
      } else {
        setisAuth(false);
         //console.log("User is not authenticated")
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
  });

  useEffect(() => {

    setFormData({

      title: item.title || '',
      url: item.img_url || '',
      description: item.description || '',
      price: item.price || '',

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
    if (!formData.title || !formData.description || !formData.price) {
      // Flash message
      showFlashMessage("Title, description, and price must be provided", 'error');
      onHide();
      return Promise.reject('Required fields are missing');
    }

    if (!isChecked) {
      if (file && file.length > 0) {
        formDataToSend.append('file', file[0]);
        formDataToSend.append('url', '');
      }
      else {
        //flashMessage
        onHide();
        showFlashMessage("Edit: Image (or url Image) must be provided",'error')
        return Promise.reject('No file provided');
      }
    }
    else {
      formDataToSend.append('url', formData.url);
      formDataToSend.append('file', null);
    }

    try {
      checkAuth();
      const tokens = getToken();
       //console.log("\nForm DATA  SEND:");
       //console.log(formData)
       //console.log("\nForm DATA TO SEND:");
       //console.log(formDataToSend.values)

      const response = await fetch('/api/my-items/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
       //console.log("Response for updating is : ", response);
       //console.log("Data sent back is : ", data);

      if (response.ok) {
        const msg = data['msg']
        showFlashMessage(msg, 'success');
        const updatedItem = data['updated_item']
         //console.log("Updated item is : ", updatedItem)

        setItems(prevItems => prevItems.map(prevItem =>
          prevItem.id === updatedItem.id ? updatedItem : prevItem
        ));
        onHide();
        setFile(null);
      }
      else {
        const msg = data['msg']
        onHide();
        showFlashMessage(msg, 'error');
        setFile(null);

      }

    } catch (error) {
       console.error('Error during update', error);
      onHide();
      showFlashMessage("An error occured while updating", 'error');
      setFormData({

        title: item.title,
        url: item.url,
        description: item.description,
        price: item.price,
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
     //console.log('Validating:', formData);

  };

  return (
    <div>
      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={closeFlashMessage}
        />
      )}
      <Modal id="Modal-Edit-Item" show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="edit-item-form" onSubmit={SubmitForm}>

            <Form.Group controlId="Edit_formTitle" style={{ margin: "10px" }}>
              <Form.Label> <b>Title</b> </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={updateValueForm}
              />
            </Form.Group>

            <Form.Group controlId="Edit_formDescription" style={{ margin: "10px" }}>
              <Form.Label> <b>Description</b> </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                name="description"
                value={formData.description}
                onChange={updateValueForm}
                style={{ height: "150px" }}
              />
            </Form.Group>

            <Form.Group controlId="Edit_formImg" style={{ margin: '10px' }}>
              <Form.Label> <b>Picture</b> </Form.Label>
              <div style={{ margin: '4px', display: 'flex', flexDirection: 'row', width: '100%' }}>
                <div style={{ marginLeft: '6px', display: 'flex', flexDirection: 'column', width: '50%' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={choiceCheckbox}
                      style={{ marginLeft: "5px", width: '20%' }}
                    />
                    Url
                  </label>
                </div>

                <div style={{ marginLeft: '6px', display: 'flex', flexDirection: 'column', width: '50%' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!isChecked}
                      onChange={choiceCheckbox}
                      style={{ marginLeft: "5px", width: '20%' }}
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





            <Form.Group controlId="Edit_formPrice" style={{ margin: "10px" }}>
              <Form.Label> <b>Price (€)</b> </Form.Label>
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            <Button variant="success" onClick={SubmitForm} style={{ width: '100%' }}>
              Update
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemEditModal;