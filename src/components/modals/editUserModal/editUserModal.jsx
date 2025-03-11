import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Input, Divider } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const EditUserModal = ({
  isVisible,
  onCancel,
  isUserEditingPending,
  initialValues,
  onSubmit,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] = useState("");
  const [availableFreeDrinks, setAvailableFreeDrinks] = useState(0);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    name: Yup.string().required("Customer Name is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .min(8, "Phone number too short"),
    balance: Yup.number()
      .typeError("Deposit Balance must be a number")
      .required("Deposit Balance is required"),
    coins: Yup.number()
      .typeError("Coins must be a number")
      .required("Coins are required"),
    stamps: Yup.number()
      .typeError("Stamps must be a number")
      .required("Stamps are required"),
    redeemedDrinks: Yup.number()
      .typeError("Must be a number")
      .min(0, "Cannot redeem negative drinks")
      .test(
        'max-redeem',
        'Required and cannot redeem more than available free drinks',
        function(value) {
          return value <= availableFreeDrinks;
        }
      )
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: initialValues?.email || "",
      name: initialValues?.name || "",
      countryCode: initialValues?.countryCode || "",
      phoneNumber: initialValues?.phoneNumber || "",
      phone: initialValues?.fullPhoneNumber
        ? initialValues.fullPhoneNumber.replace(/\D/g, "")
        : "",
      balance: initialValues?.balance || 0,
      coins: initialValues?.coins || 0,
      stamps: initialValues?.stamps || 0,
      redeemedDrinks: 0
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const newFreeDrinks = availableFreeDrinks - values.redeemedDrinks;
        
        await onSubmit(
          {
            ...values,
            freeDrinks: newFreeDrinks,
            phoneNumber: `+${values.phone}`,
            countryCode: selectedCountryCode,
            phoneNumberWithoutCountryCode,
          },
          setSubmitting
        );
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
      const fullPhone = initialValues.fullPhoneNumber || "";
      setPhoneNumber(fullPhone);
      setAvailableFreeDrinks(initialValues.freeDrinks || 0);

      if (fullPhone) {
        const dialCodeMatch = fullPhone.match(/^\+\d+/);
        if (dialCodeMatch) {
          const dialCode = dialCodeMatch[0].slice(1);
          const numberWithoutCode = fullPhone
            .slice(dialCodeMatch[0].length)
            .replace(/\D/g, "");
          setSelectedCountryCode(`+${dialCode}`);
          setPhoneNumberWithoutCountryCode(numberWithoutCode);
        }
      }
    }
  }, [initialValues]);

  return (
    <Modal
      title="Edit Record"
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
            disabled={formik.isSubmitting || !!formik.errors.redeemedDrinks}
          >
            Save Changes
          </Button>
        </div>,
      ]}
      width={700}
    >
      <Form layout="vertical">
        <h3 className="text-lg font-semibold mb-4">User Information :</h3>

        <div className="grid grid-cols-2 gap-x-4">
          {/* Email Field */}
          <Form.Item
            label="Email"
            validateStatus={formik.errors.email && "error"}
            help={formik.errors.email}
            className="col-span-1"
          >
            <Input
              placeholder="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          {/* Customer Name Field */}
          <Form.Item
            label="Customer Name"
            validateStatus={formik.errors.name && "error"}
            help={formik.errors.name}
            className="col-span-1"
          >
            <Input
              placeholder="Customer Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          {/* Phone Number Field */}
          <Form.Item
            label="Phone Number"
            className="col-span-1"
            validateStatus={formik.errors.phone && "error"}
            help={formik.errors.phone}
          >
            <PhoneInput
              value={phoneNumber}
              onChange={(phone, data) => {
                const rawPhone = phone.replace(/\D/g, "");
                setPhoneNumber(phone);
                formik.setFieldValue("phone", rawPhone);

                if (data?.dialCode && rawPhone) {
                  const dialCode = data.dialCode;
                  const number = rawPhone.startsWith(dialCode)
                    ? rawPhone.slice(dialCode.length)
                    : rawPhone;
                  const code = `+${dialCode}`;
                  setSelectedCountryCode(code);
                  setPhoneNumberWithoutCountryCode(number);
                }
              }}
              inputStyle={{
                width: "100%",
                height: "40px",
                borderRadius: "10px",
                paddingLeft: "55px",
              }}
              buttonStyle={{
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
                padding: "5px",
              }}
            />
          </Form.Item>

          {/* Deposit Balance Field */}
          <Form.Item
            label="Deposit Balance"
            validateStatus={formik.errors.balance && "error"}
            help={formik.errors.balance}
            className="col-span-1"
          >
            <Input
              type="number"
              placeholder="Deposit Balance"
              name="balance"
              value={formik.values.balance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          {/* Coins Field */}
          <Form.Item
            label="Coins"
            validateStatus={formik.errors.coins && "error"}
            help={formik.errors.coins}
            className="col-span-1"
          >
            <Input
              type="number"
              placeholder="Coins"
              name="coins"
              value={formik.values.coins}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          {/* Stamps Field */}
          <Form.Item
            label="Stamps"
            validateStatus={formik.errors.stamps && "error"}
            help={formik.errors.stamps}
            className="col-span-1"
          >
            <Input
              type="number"
              placeholder="Stamps"
              name="stamps"
              value={formik.values.stamps}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>
        </div>
      </Form>

      <Divider />

      <Form layout="vertical">
        <h3 className="text-lg font-semibold mb-4">Track Free Drinks :</h3>

        <div className="grid grid-cols-2 gap-x-4">
          {/* Available Free Drinks Field */}
          <Form.Item label="Available Free Drinks">
            <Input
              type="number"
              value={availableFreeDrinks}
              disabled
            />
          </Form.Item>

          {/* Redeemed Drinks Field */}
          <Form.Item
            label="Drinks Redeemed"
            validateStatus={formik.errors.redeemedDrinks && "error"}
            help={formik.errors.redeemedDrinks}
          >
            <Input
              type="number"
              placeholder="Drinks to redeem"
              name="redeemedDrinks"
              value={formik.values.redeemedDrinks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default EditUserModal;