import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form, Input, Select } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProductSelect from "@/components/ui/productsSelect/productsSelect";

const AddDepositModal = ({ isVisible, onCancel, initialValues, onSubmit }) => {
  const [selectedProductPrice, setSelectedProductPrice] = useState(null);
  const [formKey, setFormKey] = useState(Date.now());

  useEffect(() => {
    if (isVisible) {
      formik.resetForm();
      setSelectedProductPrice(null);
      setFormKey(Date.now());
    }
  }, [isVisible, initialValues]);

  const validationSchema = Yup.object().shape({
    depositBalance: Yup.number()
      .typeError("Deposit Amount must be a number")
      .required("Deposit Amount is required")
      .moreThan(0, "Deposit Amount must be greater than 0"),
    paymentType: Yup.string().required("Payment Type is required"),
    productPrice: Yup.string().required("Product is required"),
  });

  const handleProductChange = (price) => {
    setSelectedProductPrice(parseFloat(price));
    formik.setFieldValue("productPrice", price);
    console.log("Selected Product price:", price);
  };

  const formik = useFormik({
    initialValues: initialValues || {
      email: "",
      name: "",
      balance: "",
      depositBalance: "",
      paymentType: "",
      productPrice: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        let stampsToAdd = 0;
        if (selectedProductPrice && values.depositBalance) {
          stampsToAdd = Math.floor(
            parseFloat(values.depositBalance) / selectedProductPrice
          );
        }

        const updatedValues = {
          ...initialValues,
          ...values,
          balance:
            parseFloat(initialValues?.balance || 0) +
            parseFloat(values.depositBalance || 0),
          stamps: (initialValues?.stamps || 0) + stampsToAdd,
        };

        await onSubmit(updatedValues);
        onCancel();
        formik.resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  const totalBalance = useMemo(() => {
    const initialBalance = parseFloat(initialValues?.balance || 0);
    const deposit = parseFloat(formik.values.depositBalance || 0);
    return initialBalance + deposit;
  }, [initialValues?.balance, formik.values.depositBalance]);

  return (
    <Modal
      key={formKey}
      title="Add New Deposit"
      centered
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          color="default"
          variant="solid"
          onClick={formik.handleSubmit}
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        >
          Add New Deposit
        </Button>,
      ]}
      width={600}
    >
      <Form layout="vertical" className="flex flex-col">
        <div className="grid grid-cols-2 mb-6 border border-black rounded-lg overflow-hidden">
          <div className="col-span-1 h-full border border-slate-100 flex justify-between bg-gray-100 shadow-lg p-4">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold mb-1">
                Customer Information :
              </span>

              <div>
                <span className="font-semibold">Email: </span>
                {initialValues?.email || ""}
              </div>

              <div>
                <span className="font-semibold">Name: </span>
                {initialValues?.name || ""}
              </div>
            </div>
          </div>

          <div className="col-span-1 flex flex-col gap-2 bg-black p-4 text-white">
            <span className="text-lg font-semibold text-center">
              Wallet Balance
            </span>

            <div className="border flex items-center justify-center rounded-lg text-3xl font-bold p-6 bg-white text-black">
              PKR {totalBalance.toFixed(2)}
            </div>
          </div>
        </div>

        <Form.Item label="Select Product" name="productPrice">
          <ProductSelect
            id="productSelect"
            value={formik.values.productPrice}
            onChange={handleProductChange}
          />

          {formik.touched.productPrice && formik.errors.productPrice && (
            <div className="ant-form-item-explain ant-form-item-explain-error">
              {formik.errors.productPrice}
            </div>
          )}
        </Form.Item>

        <Form.Item label="Payment Type" name="paymentType">
          <Select
            placeholder="Select Payment Type"
            onChange={(value) => formik.setFieldValue("paymentType", value)}
            onBlur={formik.handleBlur}
            value={formik.values.paymentType}
          >
            <Select.Option value="Cash">Cash</Select.Option>
            <Select.Option value="Card">Card</Select.Option>
          </Select>
          {formik.touched.paymentType && formik.errors.paymentType && (
            <div className="ant-form-item-explain ant-form-item-explain-error">
              {formik.errors.paymentType}
            </div>
          )}
        </Form.Item>

        <Form.Item
          label="Add Deposit Amount"
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
            placeholder="Add Deposit Amount"
            name="depositBalance"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.depositBalance}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepositModal;
