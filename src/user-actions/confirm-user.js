import { registerRequest } from './register-user';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { userPool } from '../env';

const myConfirmRequest = {
    username: registerRequest.email,
    confirmationCode: '022590'
};

export const confirmAccount = (confirmRequest = myConfirmRequest) => {
    const cognitoUser = new CognitoUser({
        Username: confirmRequest.username,
        Pool: userPool
    });

    return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(
            confirmRequest.confirmationCode,
            true,
            (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            }
        );
    });
};