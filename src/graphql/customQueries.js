export const getNextTokenForUsers = /* GraphQL */ `
  query GetNextTokenForUsers(
    $filter: ModelUsersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      nextToken # Only request the nextToken
      __typename # Still include __typename for proper GraphQL operation
    }
  }
`;

export const getNextTokenForDrinks = /* GraphQL */ `
  query getNextTokenForDrinks(
    $filter: ModelDrinksFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDrinks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      nextToken
      __typename
    }
  }
`;

export const GetUserWithAllDeposits = /* GraphQL */ `
  query GetUserWithAllDeposits($userId: ID!, $limit: Int, $nextToken: String) {
    getUsers(id: $userId) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      deposits(limit: $limit, nextToken: $nextToken, sortDirection: DESC) {
        items {
          id
          amount
          createdAt
          updatedAt
        }
        nextToken
      }
    }
  }
`;

export const GetUserWithLastDeposit = /* GraphQL */ `
  query GetUserWithLastDeposit($userId: ID!) {
    getUsers(id: $userId) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      deposits(
        sortDirection: ASC # Oldest first
        limit: 1 # Get only the last deposit
      ) {
        items {
          id
          amount
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const GetUserWithAllPayments = /* GraphQL */ `
  query GetUserWithAllPayments($userId: ID!, $limit: Int, $nextToken: String) {
    getUsers(id: $userId) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      payments(limit: $limit, nextToken: $nextToken, sortDirection: DESC) {
        items {
          id
          amount
          stamps
          createdAt
        }
        nextToken
      }
    }
  }
`;

export const GetUserWithLastPayment = `
  query GetUserWithLastPayment($userId: ID!) {
    getUsers(id: $userId) {
      id
      email
      name
      phoneNumber
      paymentType
      balance
      purchaseCount
      freeDrinks
      coins
      stamps
      createdAt
      updatedAt
      payments(limit: $limit, nextToken: $nextToken, sortDirection: ASC) {
        items {
          id
          amount
          stamps
          createdAt
        }
        nextToken
      }
    }
  }
`;

export const getNextTokensForUsersByNameAndFullPhoneNumber = /* GraphQL */ `
  query UsersByNameAndFullPhoneNumber(
    $name: String!
    $fullPhoneNumber: String!
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
      nextToken
      __typename
    }
  }
`;

export const getNextTokensForUsersByNameAndCreatedAt = /* GraphQL */ `
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
      nextToken
      __typename
    }
  }
`;

export const getNextTokensForUsersByFullPhoneNumberAndCreatedAt = /* GraphQL */ `
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
      nextToken
      __typename
    }
  }
`;
