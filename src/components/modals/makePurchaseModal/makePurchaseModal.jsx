import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Divider } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProductSelect from "../../ui/productsSelect/productsSelect";

const MakePurchaseModal = ({
  isVisible,
  onCancel,
  initialValues,
  onSubmit,
}) => {
  const [selectedProductPrice, setSelectedProductPrice] = useState(null);
  const [totalBill, setTotalBill] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validationSchema = Yup.object().shape({
    productPrice: Yup.string().required("Product selection is required"),
    stamps: Yup.number()
      .typeError("Stamps must be a number")
      .required("Stamps quantity is required")
      .min(1, "Minimum 1 stamp required")
      .max(initialValues?.stamps || 0, "Not enough stamps available"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      productPrice: "",
      stamps: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const stampsUsed = parseInt(values.stamps);
        const productPrice = parseFloat(values.productPrice);
        const calculatedBill = stampsUsed * productPrice;
        const currentBalance = initialValues?.balance || 0;

        if (calculatedBill > currentBalance) {
          setErrorMessage("Insufficient balance for this purchase");
          return;
        }

        // Calculate coins reward
        const coinsReward = Math.floor(calculatedBill / 100);

        // Handle purchase count and free drinks
        const currentPurchaseCount = initialValues?.purchaseCount || 0;
        const newPurchaseCount = currentPurchaseCount + stampsUsed;
        const completedCycles = Math.floor(newPurchaseCount / 10);
        const remainingCount = newPurchaseCount % 10;

        const updatedValues = {
          ...initialValues,
          balance: currentBalance - calculatedBill,
          stamps: (initialValues?.stamps || 0) - stampsUsed,
          coins: (initialValues?.coins || 0) + coinsReward,
          purchaseCount: remainingCount,
          freeDrinks: (initialValues?.freeDrinks || 0) + completedCycles,
          purchaseBill: calculatedBill,
          userStamps: parseInt(values.stamps, 10),
        };

        await onSubmit(updatedValues);
        setSuccessMessage("Purchase successful!");
        setTimeout(() => {
          onCancel();
          formik.resetForm();
          setErrorMessage("");
          setSuccessMessage("");
        }, 2000);
      } catch (error) {
        console.error("Purchase failed:", error);
        setErrorMessage("Purchase failed. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (formik.values.productPrice && formik.values.stamps) {
      const price = parseFloat(formik.values.productPrice);
      const stamps = parseInt(formik.values.stamps);
      setTotalBill(price * stamps);
    } else {
      setTotalBill(0);
    }
  }, [formik.values.productPrice, formik.values.stamps]);

  const handleProductChange = (price) => {
    setSelectedProductPrice(parseFloat(price));
    formik.setFieldValue("productPrice", price);
  };

  return (
    <Modal
      title="Make a New Purchase"
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
            disabled={formik.isSubmitting || !!errorMessage}
          >
            Confirm Purchase
          </Button>
        </div>,
      ]}
      width={1200}
    >
      <div className="grid grid-cols-2 gap-6">
        <Form layout="vertical" className="col-span-1">
          <div className="border border-slate-100 rounded-lg bg-gray-100 p-4 mb-6 h-40">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold mb-2">
                Customer Information
              </span>
              <div>
                <span className="font-semibold">Email: </span>
                {initialValues?.email || "-"}
              </div>
              <div>
                <span className="font-semibold">Name: </span>
                {initialValues?.name || "-"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border border-black rounded-lg bg-black text-white shadow-lg p-4 h-40 mb-6">
            <div className="col-span-1 flex flex-col gap-2">
              <span className="text-lg font-semibold text-center">
                Wallet Balance
              </span>
              <div className="border flex items-center justify-center rounded-lg text-3xl font-bold p-6 bg-gray-100 text-black">
                $ {initialValues?.balance?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="col-span-1 flex flex-col gap-2">
              <span className="text-lg font-semibold text-center">
                Total Bill
              </span>
              <div className="border flex items-center justify-center rounded-lg text-3xl font-bold p-6 bg-gray-100 text-black">
                $ {totalBill.toFixed(2)}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}

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
            label={`Number of Stamps (Available: ${
              initialValues?.stamps || 0
            })`}
            validateStatus={formik.errors.stamps ? "error" : ""}
            help={formik.errors.stamps || ""}
          >
            <Input
              type="number"
              placeholder="Enter stamps quantity"
              name="stamps"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.stamps}
              min={1}
              max={initialValues?.stamps || 0}
            />
          </Form.Item>
        </Form>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="p-4 bg-gray-100 rounded-lg h-full flex flex-col gap-4">
            <div className="text-lg font-semibold mb-4">Purchase Summary:</div>
            <div className="bg-white p-4 rounded-lg flex justify-between">
              <span className="font-semibold">Selected Product Price: </span>${" "}
              {selectedProductPrice?.toFixed(2) || "0.00"}
            </div>
            <div className="bg-white p-4 rounded-lg flex justify-between">
              <span className="font-semibold">Stamps Being Used: </span>{" "}
              {formik.values.stamps || 0}
            </div>
            <div className="bg-white p-4 rounded-lg flex justify-between">
              <span className="font-semibold">Coins Reward:</span>{" "}
              {Math.floor(totalBill / 100)}
            </div>
            <div className="bg-white p-4 rounded-lg flex justify-between">
              <span className="font-semibold">Remaining Stamps: </span>
              {(initialValues?.stamps || 0) - (formik.values.stamps || 0)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MakePurchaseModal;
