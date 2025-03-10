import AWS from "aws-sdk";
import { faker } from "@faker-js/faker";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "Users-zg3kajqqjrembjsufgsptkldcm-dev";

const generateUser = () => {
  const phoneNumber = faker.phone.number("3#########");
  const countryCode = "+92";
  const fullPhoneNumber = countryCode + phoneNumber;

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    nameLower: faker.person.fullName().toLowerCase().replace(/\s/g, ''),
    paymentType: faker.helpers.arrayElement([
      "Credit Card",
      "Debit Card",
      "Cash",
      "Mobile Wallet",
    ]),
    phoneNumber: phoneNumber,
    countryCode: countryCode,
    fullPhoneNumber: fullPhoneNumber,
    balance: parseFloat(faker.finance.amount(0, 1000, 2)),
    freeDrinks: faker.number.int({ min: 0, max: 10 }),
    coins: faker.number.int({ min: 0, max: 500 }),
    stamps: faker.number.int({ min: 0, max: 200 }),
    purchaseCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
