import React, { useState } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

const SignOutModal = ({ isVisible, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Sign Out"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button
          key="signOut"
          type="primary"
          danger
          onClick={handleSignOut}
          loading={loading}
          disabled={loading}
        >
          Sign Out
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
      ]}
    >
      <p>Are you sure you want to dismiss this session?</p>
    </Modal>
  );
};

export default SignOutModal;
