import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

export const registerRequest = {
    email: 'gixefat781@mailop7.com',
    password: '1234qwer',
};

export const registerUser = (registerData = registerRequest) => {
    return new Promise((resolve, reject) => {

        this.userPool.signUp(
            registerData.email,
            registerData.password, [
                new CognitoUserAttribute({
                    'Name': 'website',
                    'Value': '181801.pl'
                }),
                new CognitoUserAttribute({
                    'Name': 'nickname',
                    'Value': 'gwynbleidd'
                })
            ],
            null,
            (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            }
        );
    });
};