import React from "react";
import { Modal, Button, Form, Input } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditUserModal = ({
  isVisible,
  onCancel,
  isUserEditingPending,
  initialValues,
  onSubmit,
}) => {
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    name: Yup.string().required("Customer Name is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number cannot exceed 15 digits")
      .required("Phone Number is required"),
    depositBalance: Yup.number()
      .typeError("Deposit Balance must be a number")
      .required("Deposit Balance is required")
      .positive("Deposit Balance must be positive or zero"),
    coins: Yup.number()
      .typeError("Coins must be a number")
      .required("Coins are required")
      .positive("Coins must be positive or zero"),
    stamps: Yup.number()
      .typeError("Stamps must be a number")
      .required("Stamps are required")
      .positive("Stamps must be positive or zero"),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      email: "",
      name: "",
      phoneNumber: "",
      depositBalance: 0,
      coins: 0,
      stamps: 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      onSubmit(values);
      formik.setSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onCancel();
        formik.resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  return (
    <Modal
      title="Edit User"
      centered
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <div className="flex justify-end gap-4">
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={formik.handleSubmit}
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Save Changes
          </Button>
        </div>,
      ]}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item
          label="Email"
          validateStatus={
            formik.touched.email && formik.errors.email ? "error" : ""
          }
          help={
            formik.touched.email && formik.errors.email
              ? formik.errors.email
              : ""
          }
        >
          <Input
            placeholder="Email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
        </Form.Item>

        <Form.Item
          label="Customer Name"
          validateStatus={
            formik.touched.name && formik.errors.name ? "error" : ""
          }
          help={
            formik.touched.name && formik.errors.name ? formik.errors.name : ""
          }
        >
          <Input
            placeholder="Customer Name"
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          validateStatus={
            formik.touched.phoneNumber && formik.errors.phoneNumber
              ? "error"
              : ""
          }
          help={
            formik.touched.phoneNumber && formik.errors.phoneNumber
              ? formik.errors.phoneNumber
              : ""
          }
        >
          <Input
            type="tel"
            placeholder="Phone Number"
            name="phoneNumber"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phoneNumber}
          />
        </Form.Item>

        <Form.Item
          label="Deposit Balance"
          validateStatus={
            formik.touched.depositBalance && formik.errors.depositBalance
              ? "error"
              : ""
          }
          help={
            formik.touched.depositBalance && formik.errors.depositBalance
              ? formik.errors.depositBalance
              : ""
          }
        >
          <Input
            type="number"
            placeholder="Deposit Balance"
            name="depositBalance"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.depositBalance}
          />
        </Form.Item>

        <Form.Item
          label="Coins"
          validateStatus={
            formik.touched.coins && formik.errors.coins ? "error" : ""
          }
          help={
            formik.touched.coins && formik.errors.coins
              ? formik.errors.coins
              : ""
          }
        >
          <Input
            type="number"
            placeholder="Coins"
            name="coins"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.coins}
          />
        </Form.Item>

        <Form.Item
          label="Stamps"
          validateStatus={
            formik.touched.stamps && formik.errors.stamps ? "error" : ""
          }
          help={
            formik.touched.stamps && formik.errors.stamps
              ? formik.errors.stamps
              : ""
          }
        >
          <Input
            type="number"
            placeholder="Stamps"
            name="stamps"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.stamps}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
