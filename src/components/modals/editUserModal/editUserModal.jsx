import React, { useEffect } from "react";
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
    balance: Yup.number()
      .typeError("Deposit Balance must be a number")
      .required("Deposit Balance is required"),
    coins: Yup.number()
      .typeError("Coins must be a number")
      .required("Coins are required"),
    stamps: Yup.number()
      .typeError("Stamps must be a number")
      .required("Stamps are required"),
    freeDrinks: Yup.number().typeError("Free Drinks must be a number"),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      email: "",
      name: "",
      phoneNumber: "",
      freeDrinks: 0,
      balance: 0,
      coins: 0,
      stamps: 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values, setSubmitting);
        onCancel();
        formik.resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (initialValues) {
      formik.setValues(initialValues);
    }
  }, [initialValues]);

  return (
    <Modal
      title="Edit Record"
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
            color="default"
            variant="solid"
            onClick={formik.handleSubmit}
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Save Changes
          </Button>
        </div>,
      ]}
      width={700}
    >
      <Form layout="vertical" className="grid grid-cols-2 gap-x-4">
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
          className="col-span-1 "
        >
          <Input
            placeholder="Email"
            name="email"
            type="email"
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
          className="col-span-1"
        >
          <Input
            placeholder="Customer Name"
            name="name"
            type="text"
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
          className="col-span-1 "
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
            formik.touched.balance && formik.errors.balance ? "error" : ""
          }
          help={
            formik.touched.balance && formik.errors.balance
              ? formik.errors.balance
              : ""
          }
          className="col-span-1"
        >
          <Input
            type="number"
            placeholder="Deposit Balance"
            name="balance"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.balance}
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
          className="col-span-1"
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
          className="col-span-1"
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

        <Form.Item
          label="Free Drinks"
          validateStatus={
            formik.touched.freeDrinks && formik.errors.freeDrinks ? "error" : ""
          }
          help={
            formik.touched.freeDrinks && formik.errors.freeDrinks
              ? formik.errors.freeDrinks
              : ""
          }
        >
          <Input
            type="number"
            placeholder="Free Drinks"
            name="freeDrinks"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.freeDrinks}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
