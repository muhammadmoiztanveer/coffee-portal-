/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUsers = /* GraphQL */ `
  mutation CreateUsers(
    $input: CreateUsersInput!
    $condition: ModelUsersConditionInput
  ) {
    createUsers(input: $input, condition: $condition) {
      id
      email
      name
      nameLower
      fullPhoneNumber
      countryCode
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      deposits {
        nextToken
        __typename
      }
      payments {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const updateUsers = /* GraphQL */ `
  mutation UpdateUsers(
    $input: UpdateUsersInput!
    $condition: ModelUsersConditionInput
  ) {
    updateUsers(input: $input, condition: $condition) {
      id
      email
      name
      nameLower
      fullPhoneNumber
      countryCode
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      deposits {
        nextToken
        __typename
      }
      payments {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const deleteUsers = /* GraphQL */ `
  mutation DeleteUsers(
    $input: DeleteUsersInput!
    $condition: ModelUsersConditionInput
  ) {
    deleteUsers(input: $input, condition: $condition) {
      id
      email
      name
      nameLower
      fullPhoneNumber
      countryCode
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      deposits {
        nextToken
        __typename
      }
      payments {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const createDeposits = /* GraphQL */ `
  mutation CreateDeposits(
    $input: CreateDepositsInput!
    $condition: ModelDepositsConditionInput
  ) {
    createDeposits(input: $input, condition: $condition) {
      id
      userID
      amount
      createdAt
      updatedAt
      user {
        id
        email
        name
        nameLower
        fullPhoneNumber
        countryCode
        phoneNumber
        paymentType
        balance
        purchaseCount
        freeDrinks
        coins
        stamps
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const updateDeposits = /* GraphQL */ `
  mutation UpdateDeposits(
    $input: UpdateDepositsInput!
    $condition: ModelDepositsConditionInput
  ) {
    updateDeposits(input: $input, condition: $condition) {
      id
      userID
      amount
      createdAt
      updatedAt
      user {
        id
        email
        name
        nameLower
        fullPhoneNumber
        countryCode
        phoneNumber
        paymentType
        balance
        purchaseCount
        freeDrinks
        coins
        stamps
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const deleteDeposits = /* GraphQL */ `
  mutation DeleteDeposits(
    $input: DeleteDepositsInput!
    $condition: ModelDepositsConditionInput
  ) {
    deleteDeposits(input: $input, condition: $condition) {
      id
      userID
      amount
      createdAt
      updatedAt
      user {
        id
        email
        name
        nameLower
        fullPhoneNumber
        countryCode
        phoneNumber
        paymentType
        balance
        purchaseCount
        freeDrinks
        coins
        stamps
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const createPayments = /* GraphQL */ `
  mutation CreatePayments(
    $input: CreatePaymentsInput!
    $condition: ModelPaymentsConditionInput
  ) {
    createPayments(input: $input, condition: $condition) {
      id
      userID
      stamps
      amount
      createdAt
      updatedAt
      user {
        id
        email
        name
        nameLower
        fullPhoneNumber
        countryCode
        phoneNumber
        paymentType
        balance
        purchaseCount
        freeDrinks
        coins
        stamps
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const updatePayments = /* GraphQL */ `
  mutation UpdatePayments(
    $input: UpdatePaymentsInput!
    $condition: ModelPaymentsConditionInput
  ) {
    updatePayments(input: $input, condition: $condition) {
      id
      userID
      stamps
      amount
      createdAt
      updatedAt
      user {
        id
        email
        name
        nameLower
        fullPhoneNumber
        countryCode
        phoneNumber
        paymentType
        balance
        purchaseCount
        freeDrinks
        coins
        stamps
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const deletePayments = /* GraphQL */ `
  mutation DeletePayments(
    $input: DeletePaymentsInput!
    $condition: ModelPaymentsConditionInput
  ) {
    deletePayments(input: $input, condition: $condition) {
      id
      userID
      stamps
      amount
      createdAt
      updatedAt
      user {
        id
        email
        name
        nameLower
        fullPhoneNumber
        countryCode
        phoneNumber
        paymentType
        balance
        purchaseCount
        freeDrinks
        coins
        stamps
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const createDrinks = /* GraphQL */ `
  mutation CreateDrinks(
    $input: CreateDrinksInput!
    $condition: ModelDrinksConditionInput
  ) {
    createDrinks(input: $input, condition: $condition) {
      id
      name
      nameLower
      price
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateDrinks = /* GraphQL */ `
  mutation UpdateDrinks(
    $input: UpdateDrinksInput!
    $condition: ModelDrinksConditionInput
  ) {
    updateDrinks(input: $input, condition: $condition) {
      id
      name
      nameLower
      price
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteDrinks = /* GraphQL */ `
  mutation DeleteDrinks(
    $input: DeleteDrinksInput!
    $condition: ModelDrinksConditionInput
  ) {
    deleteDrinks(input: $input, condition: $condition) {
      id
      name
      nameLower
      price
      createdAt
      updatedAt
      __typename
    }
  }
`;
