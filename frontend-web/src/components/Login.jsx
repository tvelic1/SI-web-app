import '../css/Login.css'
import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate,Link } from 'react-router-dom';


function Login() {

    const { instance } = useMsal();
    const [flag, setFlag] = useState(JSON.parse(localStorage.getItem('isLoggedIn')) || false);
    const [decodedToken, setDecodedToken] = useState(localStorage.getItem('decodedToken') || null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
    const [ime, setIme] = useState(localStorage.getItem('ime') || null);
    let navigate = useNavigate();


    useEffect(() => {

        setAccessToken(localStorage.getItem('accessToken') || null);
        setFlag(JSON.parse(localStorage.getItem('isLoggedIn')) || null);
        setIme(localStorage.getItem('ime') || null)
        const numberOfActiveAccounts = instance.getAllAccounts().length;

        if (!numberOfActiveAccounts) {

            localStorage.setItem('ime', "neautorizovano");
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('decodedToken');
            setFlag(false);

        }



        if (!flag) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('decodedToken');
            setAccessToken(null);
        }

        /*console.log(accessToken)
        console.log(flag);*/

        if (accessToken) {
            setDecodedToken(localStorage.getItem('decodedToken') || null)
        }

    }, []);


    useEffect(() => {

        setAccessToken(localStorage.getItem('accessToken') || null);
        setFlag(JSON.parse(localStorage.getItem('isLoggedIn')) || null);
        setIme(localStorage.getItem('ime') || null)

        if (!flag) {
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('decodedToken');
        }

        const checkLoginStatus = async () => {
            const accounts = instance.getAllAccounts();
            if (accounts.length > 0) {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    try {
                        const decoded = jwtDecode(accessToken);
                        setDecodedToken(decoded);
                        localStorage.setItem('decodedToken', decoded);
                        setFlag(true);
                    } catch (error) {
                        console.error("Token nije validan:", error);
                        setFlag(false);
                        localStorage.removeItem('accessToken');
                        localStorage.setItem('isLoggedIn', 'false');
                    }
                }
            } else {

                localStorage.removeItem('decodedToken');
                localStorage.setItem('isLoggedIn', 'false');
                setFlag(false);
                setDecodedToken(null);
            }
        };

        checkLoginStatus();

    }, [instance]);


    const getAccessToken = () => {

        return new Promise((resolve, reject) => {

            const accounts = instance.getAllAccounts();
            //console.log(accounts.length - 1);

            if (accounts.length > 0) {

                const request = {
                    account: accounts[accounts.length - 1],
                    scopes: ["https://graph.microsoft.com/.default"]
                };

                instance.acquireTokenSilent(request)
                    .then(response => {
                        console.log("Access Token:", response.accessToken);
                        console.log("Id Token:", response.idToken);
                        const decodedAcc = jwtDecode(response.accessToken);
                        const decodedId = jwtDecode(response.idToken);
                        localStorage.setItem('accessToken', response.accessToken);
                        resolve({ decodedAcc, decodedId, accessToken: response.accessToken });
                    })
                    .catch(error => {

                        console.error(error);
                        reject(error);

                    });
            }

            else {
                reject('No accounts found');
            }

        });
    };


    const handleLogin = (loginType) => {

        if (loginType === "popup") {
            instance.loginPopup().then(response => {
                if (response.account.username.endsWith("@etf.unsa.ba")) {

                    //console.log(response);
                    localStorage.setItem('isLoggedIn', 'true');
                    setFlag(true);

                    getAccessToken()
                        .then(({ decodedAcc, decodedId, accessToken }) => {

                            
                            localStorage.setItem('ime', `Welcome ${decodedAcc.name}`);
                            setIme(`Welcome ${decodedAcc.name}`)
                            setDecodedToken(decodedAcc);
                            console.log("Decoded Token:", decodedAcc);

                            if (decodedId.roles !== undefined) {
                                console.log("Role:", decodedId.roles[0]);
                            }

                            navigate('/home');
                        })
                        .catch(error => {
                            console.error('Error fetching access token:', error);
                        });
                } else {

                    handleLogout();
                }
            }).catch(e => {
                console.error(e);
                //handleLogout();
            });
        }
    };


    const handleLogout = () => {

        instance.logoutPopup();
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('decodedToken');
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.setItem('ime', "neautorizovano");
        setDecodedToken(null);
        setFlag(false);

    };

    return (
        <>
            <div className='container'>
                <button className='recommended-button' onClick={() => handleLogin("popup")}>
                    <img src="https://developer.microsoft.com/_devcom/images/logo-ms-social.png" alt="Microsoft Logo" className="button-logo"></img>
                    Login via Microsoft
                </button>

                <form id="loginForm" className="login-form">
                    <input type="text" placeholder="Username or phone number" id="username" />
                    <input type="password" placeholder="Password" id="password" />
                    <button type="submit">Login</button>
                    <Link id="linkToRegister" to='/register'>If you don't have account, SIGN-UP here!</Link>
                </form>
            </div>
        </>
    );
}

export default Login;
