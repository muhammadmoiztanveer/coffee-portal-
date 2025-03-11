/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUsers = /* GraphQL */ `
  query GetUsers($id: ID!) {
    getUsers(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUsersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getDeposits = /* GraphQL */ `
  query GetDeposits($id: ID!) {
    getDeposits(id: $id) {
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
export const listDeposits = /* GraphQL */ `
  query ListDeposits(
    $filter: ModelDepositsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDeposits(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        amount
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPayments = /* GraphQL */ `
  query GetPayments($id: ID!) {
    getPayments(id: $id) {
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
export const listPayments = /* GraphQL */ `
  query ListPayments(
    $filter: ModelPaymentsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPayments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        stamps
        amount
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDrinks = /* GraphQL */ `
  query GetDrinks($id: ID!) {
    getDrinks(id: $id) {
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
export const listDrinks = /* GraphQL */ `
  query ListDrinks(
    $filter: ModelDrinksFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDrinks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        nameLower
        price
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const usersByNameAndCreatedAt = /* GraphQL */ `
  query UsersByNameAndCreatedAt(
    $name: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelUsersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByNameAndCreatedAt(
      name: $name
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const usersByNameAndFullPhoneNumber = /* GraphQL */ `
  query UsersByNameAndFullPhoneNumber(
    $name: String!
    $fullPhoneNumber: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelUsersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByNameAndFullPhoneNumber(
      name: $name
      fullPhoneNumber: $fullPhoneNumber
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const usersByFullPhoneNumberAndCreatedAt = /* GraphQL */ `
  query UsersByFullPhoneNumberAndCreatedAt(
    $fullPhoneNumber: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelUsersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByFullPhoneNumberAndCreatedAt(
      fullPhoneNumber: $fullPhoneNumber
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const depositsByUserID = /* GraphQL */ `
  query DepositsByUserID(
    $userID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelDepositsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    depositsByUserID(
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        amount
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const paymentsByUserID = /* GraphQL */ `
  query PaymentsByUserID(
    $userID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByUserID(
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        stamps
        amount
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
