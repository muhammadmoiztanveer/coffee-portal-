/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createDeposit = /* GraphQL */ `
  mutation CreateDeposit(
    $input: CreateDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    createDeposit(input: $input, condition: $condition) {
      id
      userID
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDeposit = /* GraphQL */ `
  mutation UpdateDeposit(
    $input: UpdateDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    updateDeposit(input: $input, condition: $condition) {
      id
      userID
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDeposit = /* GraphQL */ `
  mutation DeleteDeposit(
    $input: DeleteDepositInput!
    $condition: ModelDepositConditionInput
  ) {
    deleteDeposit(input: $input, condition: $condition) {
      id
      userID
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPayment = /* GraphQL */ `
  mutation CreatePayment(
    $input: CreatePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    createPayment(input: $input, condition: $condition) {
      id
      userID
      stamps
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePayment = /* GraphQL */ `
  mutation UpdatePayment(
    $input: UpdatePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    updatePayment(input: $input, condition: $condition) {
      id
      userID
      stamps
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePayment = /* GraphQL */ `
  mutation DeletePayment(
    $input: DeletePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    deletePayment(input: $input, condition: $condition) {
      id
      userID
      stamps
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
