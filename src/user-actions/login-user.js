import { registerRequest } from './register-user';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk/global';
import { CognitoIdentityCredentials } from 'aws-sdk/global';
import { identityPoolId, credentialName, userPool } from '../env';

const myLoginRequest = {
    username: registerRequest.email,
    password: registerRequest.password,
};


export const login = (loginRequest = myLoginRequest) => {
    const cognitoUser = new CognitoUser({
        Username: loginRequest.username,
        Pool: userPool
    });

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(
            new AuthenticationDetails({
                Username: loginRequest.username,
                Password: loginRequest.password
            }), {
                onSuccess: (result) => {
                    AWS.config.credentials = new CognitoIdentityCredentials({
                        IdentityPoolId: identityPoolId,
                        Logins: {
                            [credentialName]: result.getIdToken().getJwtToken(),
                        }
                    });

                    // AWS.config.credentials.refresh((error) => {
                    //     if (error) {
                    //         console.error(error);
                    //     }
                    //     else {
                    //         console.log('Succesfully logged!');
                    //     }
                    // });

                    resolve(result);
                },
                onFailure: (error) => reject(error)
            }
        );
    });
};