import AWS from "aws-sdk";
import { faker } from "@faker-js/faker";

// Configure the DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "Users-zg3kajqqjrembjsufgsptkldcm-dev"; // Replace with your actual table name

// Function to generate a single user record
const generateUser = () => {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    paymentType: faker.person.fullName(),
    phoneNumber: faker.phone.number(),
    balance: parseFloat(faker.finance.amount(0, 1000, 2)),
    freeDrinks: faker.number.int({ min: 0, max: 10 }),
    coins: faker.number.int({ min: 0, max: 500 }),
    stamps: faker.number.int({ min: 0, max: 200 }),
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
};

// Function to generate and insert 200 dummy records
export const handler = async (event) => {
  console.log("Seeding database with 200 users...");

  const batch = [];
  for (let i = 0; i < 200; i++) {
    const user = generateUser();
    batch.push({
      PutRequest: {
        Item: user,
      },
    });

    // Batch write in chunks of 25 (DynamoDB limit)
    if (batch.length === 25 || i === 199) {
      const params = {
        RequestItems: {
          [tableName]: batch,
        },
      };

      try {
        await dynamoDB.batchWrite(params).promise();
        console.log(`Inserted ${batch.length} records`);
      } catch (error) {
        console.error("Error inserting records:", error);
      }

      batch.length = 0; // Clear the batch
    }
  }

  console.log("Database seeding completed!");
  return {
    statusCode: 200,
    body: "Database seeding completed!",
  };
};
