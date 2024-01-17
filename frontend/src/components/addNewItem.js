import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const ItemModal =  ({ show, onHide })=> {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    description: '',
    price: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const ValidateAdd = () => {
    // Add your validation logic here
    console.log('Validating:', formData);
    //CloseModal();
  };

  return (
    <div>
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>

            <Form.Group controlId="formTitle" style={{margin:"10px"}}>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formPrice" style={{margin:"10px"}}>
              <Form.Label>Price (€)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter price"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" >
            Discard
          </Button>
          <Button variant="primary" onClick={ValidateAdd}>
            Validate
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemModal;