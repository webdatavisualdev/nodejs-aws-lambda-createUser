const AWS = require('aws-sdk');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
AWS.config.update({ 
    "accessKeyId": process.env.ACCESS_KEY_ID, 
    "secretAccessKey": process.env.SECRET_ACCESS_KEY, 
    "region": process.env.REGION 
});
const document = new AWS.DynamoDB.DocumentClient();

exports.createUser = (event, context, callback) => {
    bcrypt.hash(event.Password, 10, function(err, hash) {
        if (err) {
            callback(err, null);
        }
        
        const params = {
            TableName: 'Users',
            Item: {
                UserId: uuid.v4(),
                Email: event.Email,
                UserName: event.UserName,
                Password: hash,
                Activated: event.Activated,
                LastLoginTime: new Date().toISOString(),
                CreatedDate: new Date().toISOString(),
                RoleId: event.RoleId
            }
        };
    
        document.scan({
            TableName: 'Users'
        }, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                data.Items.forEach(d => {
                    if (d.Email === event.Email) {
                        callback('User already exists', null);     
                    }
                });
    
                document.put(params, function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, data.Items);
                    }
                });
            }
        });
    });
};
