import AWS from 'aws-sdk/global';
import { CognitoIdentityCredentials } from 'aws-sdk/global';
import { identityPoolId, credentialName } from '../env';
import { userPool } from '../env';

export const refreshSession = () => {
    return new Promise((resolve, reject) => {
        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser == null) {
            reject('User not authorized');
        }

        cognitoUser.getSession((err, result) => {
            if (err) {
                reject(err);
            }

            AWS.config.credentials = new CognitoIdentityCredentials({
                IdentityPoolId: identityPoolId,
                Logins: {
                    [credentialName]: result.getIdToken().getJwtToken(),
                }
            });

            AWS.config.credentials.refresh((error) => {
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
};