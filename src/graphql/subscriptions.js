/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateDeposit = /* GraphQL */ `
  subscription OnCreateDeposit($filter: ModelSubscriptionDepositFilterInput) {
    onCreateDeposit(filter: $filter) {
      id
      userID
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateDeposit = /* GraphQL */ `
  subscription OnUpdateDeposit($filter: ModelSubscriptionDepositFilterInput) {
    onUpdateDeposit(filter: $filter) {
      id
      userID
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteDeposit = /* GraphQL */ `
  subscription OnDeleteDeposit($filter: ModelSubscriptionDepositFilterInput) {
    onDeleteDeposit(filter: $filter) {
      id
      userID
      amount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreatePayment = /* GraphQL */ `
  subscription OnCreatePayment($filter: ModelSubscriptionPaymentFilterInput) {
    onCreatePayment(filter: $filter) {
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
export const onUpdatePayment = /* GraphQL */ `
  subscription OnUpdatePayment($filter: ModelSubscriptionPaymentFilterInput) {
    onUpdatePayment(filter: $filter) {
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
export const onDeletePayment = /* GraphQL */ `
  subscription OnDeletePayment($filter: ModelSubscriptionPaymentFilterInput) {
    onDeletePayment(filter: $filter) {
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
