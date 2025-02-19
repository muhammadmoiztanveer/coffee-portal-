import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const name = event.request.userAttributes.name;
    const phoneNumber = event.request.userAttributes.phone_number;

    const balance = 0;
    const freeDrinks = 0;
    const coins = 0;
    const stamps = 0;
    const paymentType = "";

    // console.log(
    //   "id",
    //   userId,
    //   "name",
    //   name,
    //   "email",
    //   email,
    //   "phone_number",
    //   phoneNumber,
    //   balance,
    //   freeDrinks,
    //   coins,
    //   stamps
    // );

    const params = {
      TableName: "User-ao43gdqvu5eq5phtwjwwgio3se-coffeepor",
      Item: {
        id: userId,
        email: email,
        name: name,
        paymentType: paymentType,
        phoneNumber: phoneNumber,
        balance: balance,
        freeDrinks: freeDrinks,
        coins: coins,
        stamps: stamps,
        createdAt: new Date().toISOString(),
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
