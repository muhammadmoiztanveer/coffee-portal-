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
        sortDirection: DESC # Newest first
        limit: 1 # Get only the last deposit
      ) {
        items {
          id
          amount
          createdAt
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

export const GetUserWithLastPayment = /* GraphQL */ `
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
