import React from "react";
import { Modal, Button, Form, Input, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditDrinkModal = ({ isVisible, onCancel, initialValues, onSubmit }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Drink Name is required"),
    price: Yup.number()
      .typeError("Drink price must be a number")
      .required("Drink price is required")
      .positive("Drink price must be positive"),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: "",
      price: "",
      id: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values, formik.setSubmitting);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
    enableReinitialize: true,
  });

  return (
    <Modal
      title="Edit Drink"
      centered
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <div className="flex justify-end gap-4" key="footer">
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
            Update Drink
          </Button>
        </div>,
      ]}
      width={600}
    >
      {contextHolder}
      <Form layout="vertical" className="flex flex-col">
        {/* Name Field */}
        <Form.Item
          label="Name"
          validateStatus={
            formik.touched.name && formik.errors.name ? "error" : ""
          }
          help={
            formik.touched.name && formik.errors.name ? formik.errors.name : ""
          }
        >
          <Input
            type="text"
            placeholder="Drink Name"
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
        </Form.Item>

        {/* Price Field */}
        <Form.Item
          label="Price"
          validateStatus={
            formik.touched.price && formik.errors.price ? "error" : ""
          }
          help={
            formik.touched.price && formik.errors.price
              ? formik.errors.price
              : ""
          }
        >
          <Input
            type="number"
            placeholder="Drink Price"
            name="price"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.price}
          />
        </Form.Item>

        {/* General Error Display */}
        {formik.errors.submit && (
          <div className="ant-form-item-explain ant-form-item-explain-error">
            {formik.errors.submit}
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default EditDrinkModal;
