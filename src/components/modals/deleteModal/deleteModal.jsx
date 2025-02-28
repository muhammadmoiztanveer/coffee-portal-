import React from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const deleteModal = ({ isVisible, onCancel, onConfirm }) => {
  const navigate = useNavigate();

  return (
    <Modal
      title="Delete Record"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="delete" type="primary" danger onClick={onConfirm}> 
          Delete Record
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
      ]}
    >
      <p>This action will delete this customer record permanently !!</p>
      <p className="text-red-600">Do you want to continue?</p>
    </Modal>
  );
};

export default deleteModal;
