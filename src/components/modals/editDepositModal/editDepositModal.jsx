import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Input } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProductSelect from "../../ui/productsSelect/productsSelect";

const EditDepositModal = ({ isVisible, onCancel, initialValues, onSubmit }) => {
  const [adjustedBalance, setAdjustedBalance] = useState(0);
  const [originalBalance, setOriginalBalance] = useState(0);
  const [difference, setDifference] = useState(0);
  const [selectedProductPrice, setSelectedProductPrice] = useState(null);
  const initialDepositAmount = initialValues?.deposits?.items?.[0]?.amount || 0;

  const validationSchema = Yup.object().shape({
    depositAmount: Yup.number()
      .typeError("Deposit Amount must be a number")
      .required("Deposit Amount is required")
      .moreThan(0, "Must be greater than 0")
      .test(
        "same-value",
        "New amount cannot be same as current",
        (value) => value !== initialDepositAmount
      ),
    productPrice: Yup.string().required("Product selection is required"),
  });

  const calculateStamps = useMemo(() => {
    if (!selectedProductPrice || selectedProductPrice <= 0) return 0;
    return Math.floor(adjustedBalance / selectedProductPrice);
  }, [adjustedBalance, selectedProductPrice]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      depositAmount: initialDepositAmount,
      productPrice: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const updatedValues = {
          ...initialValues,
          balance: adjustedBalance,
          stamps: calculateStamps,
          deposits: {
            items: [
              {
                id: initialValues.deposits.items[0].id,
                amount: parseFloat(values.depositAmount),
                createdAt: initialValues.deposits.items[0].id,
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        };

        await onSubmit(updatedValues);
        onCancel();
        formik.resetForm();
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const initialBalance = initialValues?.balance || 0;
    setOriginalBalance(initialBalance);
    setAdjustedBalance(initialBalance);
    setDifference(0);
  }, [initialValues]);

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    formik.handleChange(e);

    if (rawValue === "") {
      setDifference(0);
      setAdjustedBalance(originalBalance);
      return;
    }

    const value = parseFloat(rawValue) || 0;
    const newDifference = value - initialDepositAmount;

    setDifference(newDifference);
    setAdjustedBalance(originalBalance + newDifference);
  };

  const handleProductChange = (price) => {
    const numericPrice = parseFloat(price);
    setSelectedProductPrice(numericPrice);
    formik.setFieldValue("productPrice", price);
  };

  const getDifferenceMessage = () => {
    if (!formik.values.depositAmount || difference === 0) return null;

    const absoluteDiff = Math.abs(difference).toFixed(2);
    const isPositive = difference > 0;

    return (
      <div
        className={`text-sm mt-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive
          ? `+PKR ${absoluteDiff} will be added to balance`
          : `-PKR ${absoluteDiff} will be deducted from balance`}
      </div>
    );
  };

  const walletDisplay = (
    <div className="border flex items-center justify-center rounded-lg text-3xl font-bold p-6 bg-white text-black">
      <span className={difference !== 0 ? "text-xl transition-all" : ""}>
        {formik.values.depositAmount === "" || difference === 0 ? (
          `PKR ${originalBalance.toFixed(2)}`
        ) : (
          <>
            PKR {originalBalance.toFixed(2)}
            <span
              className={`mx-2 text-2xl ${
                difference > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {difference > 0 ? "↑" : "↓"}
            </span>
            <br />
            PKR {adjustedBalance.toFixed(2)}
          </>
        )}
      </span>
    </div>
  );

  return (
    <Modal
      title="Edit Last Deposit"
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
            disabled={
              formik.isSubmitting ||
              difference === 0 ||
              !!formik.errors.depositAmount ||
              !!formik.errors.productPrice
            }
          >
            Update Deposit
          </Button>
        </div>,
      ]}
      width={600}
    >
      <Form layout="vertical" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 mb-6 border border-black rounded-lg overflow-hidden">
          <div className="col-span-1 p-4 bg-gray-100">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold mb-2">
                Customer Information
              </h3>
              <div>
                <strong>Email:</strong> {initialValues?.email || "-"}
              </div>
              <div>
                <strong>Name:</strong> {initialValues?.name || "-"}
              </div>
              <div>
                <strong>Last Deposit:</strong> PKR{" "}
                {initialDepositAmount.toFixed(2)}
              </div>
              <div>
                <strong>New Stamps:</strong> {calculateStamps}
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-black p-4 text-white">
            <h3 className="text-lg font-semibold text-center mb-2">
              Wallet Balance
            </h3>
            {walletDisplay}
          </div>
        </div>

        <Form.Item
          label="Select Product"
          validateStatus={formik.errors.productPrice ? "error" : ""}
          help={formik.errors.productPrice || ""}
        >
          <ProductSelect
            value={formik.values.productPrice}
            onChange={handleProductChange}
          />
        </Form.Item>

        <Form.Item
          label="New Deposit Amount"
          validateStatus={formik.errors.depositAmount ? "error" : ""}
          help={formik.errors.depositAmount || ""}
        >
          <Input
            type="number"
            placeholder="Enter new amount"
            name="depositAmount"
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            value={formik.values.depositAmount}
            step="0.01"
            prefix="PKR"
          />
          {getDifferenceMessage()}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDepositModal;
