import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const name = event.request.userAttributes.name;
    const nameLower = event.request.userAttributes.name.toLowerCase().replace(/\s/g, '');
    const phoneNumber = event.request.userAttributes["custom:phoneNumber"];
    const countryCode = event.request.userAttributes["custom:countryCode"];
    const fullPhoneNumber = event.request.userAttributes.phone_number;

    const balance = 0;
    const freeDrinks = 0;
    const coins = 0;
    const stamps = 0;
    const purchaseCount = 0;
    const paymentType = "";

    const params = {
      TableName: "Users-zg3kajqqjrembjsufgsptkldcm-dev",
      Item: {
        id: userId,
        email: email,
        name: name,
        nameLower: nameLower,
        paymentType: paymentType,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        fullPhoneNumber: fullPhoneNumber,
        balance: balance,
        freeDrinks: freeDrinks,
        purchaseCount: purchaseCount,
        coins: coins,
        stamps: stamps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamodb.put(params).promise();
    console.log("User data inserted into DynamoDB:", params.Item);

    return event;
  } catch (error) {
    console.error("Error inserting user data into DynamoDB:", error);
    throw new Error("Unable to insert user data into DynamoDB");
  }
};
