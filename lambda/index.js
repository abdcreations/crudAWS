const AWS = require('/var/runtime/node_modules/aws-sdk/lib/aws.js');
const { DynamoDB } = AWS;

const dynamoDb = new DynamoDB.DocumentClient();

exports.main = async (event) => {
  const tableName = process.env.TABLE_NAME;
  try {
    if (!tableName) {
      throw new Error('Table name not specified');
    }
  
    switch (event.httpMethod) {
      case 'GET':
        console.log("inside get");
        return dynamoDb.scan({ TableName: tableName }).promise();
      case 'POST':
        const value = JSON.parse(event.body);
        const userid = value.userid;
        const username = value.username;
        const useremail = value.useremail;
        const mobile = value.mobile;
        
        await dynamoDb.put({ 
          TableName: tableName,
          Item: { userid, username, useremail, mobile },
        }).promise();
        console.log("after promeise");
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', message: 'Record added successfully' }),
        };
      case 'PUT':
        console.log("inside put");
        // const { updatedUserId, updatedUsername, updatedUserEmail, updatedMobile } = JSON.parse(event.body);
        const valueUpdate = JSON.parse(event.body);
        const updatedUserId = valueUpdate.userid;
        const updatedUsername = valueUpdate.username;
        const updatedUserEmail = valueUpdate.useremail;
        const updatedMobile = valueUpdate.mobile;
        console.log(updatedUserId, updatedUsername, updatedUserEmail , updatedMobile);
        await dynamoDb.update({
          TableName: tableName,
          Key: { userid: updatedUserId },
          UpdateExpression: 'SET username = :username, useremail = :useremail, mobile = :mobile',
          ExpressionAttributeValues: {
            ':username': updatedUsername,
            ':useremail': updatedUserEmail,
            ':mobile': updatedMobile,
          },
        }).promise();
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', message: 'Record updated successfully' }),
        };
      case 'DELETE':
        const valueDelete = JSON.parse(event.body);
        const deleteUserId = valueDelete.userid;
        await dynamoDb.delete({
          TableName: tableName,
          Key: { userid: deleteUserId },
        }).promise();
        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success', message: 'Record deleted successfully' }),
        };
      default:
        return { statusCode: 400, body: 'Invalid operation' };
    }
  } catch (error) {
    // Handle errors and return an error response
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', message: 'Internal Server Error from code' }) };
  }
  
};
