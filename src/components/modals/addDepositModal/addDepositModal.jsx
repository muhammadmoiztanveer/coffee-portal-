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
    depositAmount: Yup.number()
      .typeError("Deposit Balance must be a number")
      .required("Deposit Balance is required")
      .moreThan(0, "Deposit Balance must be greater than 0"), // Ensure value is greater than 0
  });

  const formik = useFormik({
    initialValues: initialValues || {
      depositAmount: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // Mark all fields as touched to ensure validation errors are displayed
      formik.setTouched({
        depositAmount: true,
      });
      if (formik.isValid) {
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
      }
    },
  });

  return (
    <Modal
      title="Add Deposited Amount"
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
            Add Deposited Amount
          </Button>
        </div>,
      ]}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item label="Email">
          <Input placeholder="Email" name="email" disabled />
        </Form.Item>
        <Form.Item label="Customer Name">
          <Input placeholder="Customer Name" name="name" disabled />
        </Form.Item>
        <Form.Item label="Current Balance">
          <Input
            type="number"
            placeholder="Current Balance"
            name="currentBalance"
            disabled
          />
        </Form.Item>
        <Form.Item
          label="Deposit Amount"
          validateStatus={
            formik.touched.depositAmount && formik.errors.depositAmount
              ? "error"
              : ""
          }
          help={
            formik.touched.depositAmount && formik.errors.depositAmount
              ? formik.errors.depositAmount
              : ""
          }
        >
          <Input
            type="number"
            placeholder="Deposit Amount"
            name="depositAmount"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.depositAmount}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;