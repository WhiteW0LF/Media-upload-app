import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
}
from 'amazon-cognito-identity-js';
import { CognitoIdentityCredentials } from 'aws-sdk/global';

export class AuthorizationService {

    constructor(authCfg, awsConfig) {
        this.userPool = new CognitoUserPool({
            UserPoolId: authCfg.userPoolId,
            ClientId: authCfg.clientId
        });
        this.awsConfig = awsConfig;
        this.authCfg = authCfg;
    }

    registerUser(registerData) {
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
    }

    confirmAccount(confirmRequest) {
        const cognitoUser = new CognitoUser({
            Username: confirmRequest.username,
            Pool: this.userPool
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
    }

    login(loginRequest) {

        return new Promise((resolve, reject) => {
            const cognitoUser = new CognitoUser({
                Username: loginRequest.username,
                Pool: this.userPool
            });

            cognitoUser.authenticateUser(
                new AuthenticationDetails({
                    Username: loginRequest.username,
                    Password: loginRequest.password
                }), {
                    onSuccess: (result) => {
                        this.awsConfig.credentials = new CognitoIdentityCredentials({
                            IdentityPoolId: this.authCfg.identityPoolId,
                            Logins: {
                                [this.authCfg.credentialName]: result.getIdToken().getJwtToken(),
                            }
                        });

                        resolve(result);
                    },
                    onFailure: (error) => reject(error)
                }
            );
        });
    }

    logout(loginRequest) {
        const cognitoUser = new CognitoUser({
            Username: loginRequest.username,
            Pool: this.userPool
        });

        cognitoUser.signOut();
        document.location.reload();
    }

    refreshSession() {
        return new Promise((resolve, reject) => {
            const cognitoUser = this.userPool.getCurrentUser();

            if (cognitoUser == null) {
                reject('User not authorized');
            }

            cognitoUser.getSession((err, result) => {
                if (err) {
                    reject(err);
                }
                // if (AWS.config.credentials) {
                //     AWS.config.credentials.clearCachedId();
                // }

                this.awsConfig.credentials = new CognitoIdentityCredentials({
                    IdentityPoolId: this.authCfg.identityPoolId,
                    Logins: {
                        [this.authCfg.credentialName]: result.getIdToken().getJwtToken(),
                    }
                });

                this.awsConfig.credentials.refresh((error) => {
                    if (error) {
                        console.error(error);
                    }
                    else {
                        console.log('Succesfully logged!');
                    }
                });

                cognitoUser.getUserAttributes((err, userDataresult) => {
                    if (err) {
                        reject(err);
                    }

                    const userData = userDataresult.reduce((user, item) => {
                        return { ...user, [item.Name]: item.Value };
                    }, {});

                    resolve(userData);
                });
            });
        });
    }

    getAccesToken() {
        return new Promise((resolve, reject) => {
            const cognitoUser = this.userPool.getCurrentUser();

            if (cognitoUser == null) {
                reject('User not authorized');
            }

            cognitoUser.getSession((err, result) => {
                if (err) {
                    reject(err);
                }
                
                resolve(result.getIdToken().getJwtToken()); 
            });
        });
    }

}
