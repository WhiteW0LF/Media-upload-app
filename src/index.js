import { authCfg } from './env';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const registerButton = document.querySelector('.registerUser');
const confirmButton = document.querySelector('.confirmUser');
const loginButton = document.querySelector('.loginUser');

const userPool = new CognitoUserPool({
    UserPoolId: authCfg.userPoolId,
    ClientId: authCfg.clientId
})

const registerRequest = {
    email: 'gixefat781@mailop7.com',
    password: '1234qwer'
}

const confirmRequest = {
    username: registerRequest.email,
    confirmationCode: '022590'
}

const loginRequest = {
    username: registerRequest.email,
    password: registerRequest.password,
}

const registerUser = (registerData) => {
    return new Promise((resolve, reject) => {

        userPool.signUp(
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
        )
    });
}

const confirmAccount = (confirmRequest) => {
    const cognitoUser = new CognitoUser({
        Username: confirmRequest.username,
        Pool: userPool
    })

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
        )
    })
}

const login = (loginRequest) => {
    const cognitoUser = new CognitoUser({
        Username: loginRequest.username,
        Pool: userPool
    })

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(
            new AuthenticationDetails({
                Username: loginRequest.username,
                Password: loginRequest.password
            }), {
                onSuccess: (result) => resolve(result),
                onFailure: (error) => reject(error)
            }
        )
    });
}

registerButton.addEventListener('click', () => {
    registerUser(registerRequest)
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        })
})

confirmButton.addEventListener('click', () => {
    confirmAccount(confirmRequest)
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        })
})

loginButton.addEventListener('click', () => {
    login(loginRequest)
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        })
})

