import "../css/Login.css";
import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login({ QR,visib }) {
  const { instance } = useMsal();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [flag, setFlag] = useState(
    JSON.parse(localStorage.getItem("isLoggedIn")) || false
  );
  const [decodedToken, setDecodedToken] = useState(
    localStorage.getItem("decodedToken") || null
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [ime, setIme] = useState(localStorage.getItem("ime") || null);
  let navigate = useNavigate();

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken") || null);
    setFlag(JSON.parse(localStorage.getItem("isLoggedIn")) || null);
    setIme(localStorage.getItem("ime") || null);
    const numberOfActiveAccounts = instance.getAllAccounts().length;

    if (!numberOfActiveAccounts) {
      localStorage.setItem("ime", "neautorizovano");
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("decodedToken");
      setFlag(false);
    }

    if (!flag) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("decodedToken");
      setAccessToken(null);
    }

    /*console.log(accessToken)
        console.log(flag);*/

    if (accessToken) {
      setDecodedToken(localStorage.getItem("decodedToken") || null);
    }
  }, []);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken") || null);
    setFlag(JSON.parse(localStorage.getItem("isLoggedIn")) || null);
    setIme(localStorage.getItem("ime") || null);

    if (!flag) {
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("decodedToken");
    }

    const checkLoginStatus = async () => {
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const decoded = jwtDecode(accessToken);
            setDecodedToken(decoded);
            localStorage.setItem("decodedToken", decoded);
            setFlag(true);
          } catch (error) {
            console.error("Token nije validan:", error);
            setFlag(false);
            localStorage.removeItem("accessToken");
            localStorage.setItem("isLoggedIn", "false");
          }
        }
      } else {
        localStorage.removeItem("decodedToken");
        localStorage.setItem("isLoggedIn", "false");
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
          scopes: ["https://graph.microsoft.com/.default"],
        };

        instance
          .acquireTokenSilent(request)
          .then((response) => {
            console.log("Access Token:", response.accessToken);
            console.log("Id Token:", response.idToken);
            const decodedAcc = jwtDecode(response.accessToken);
            const decodedId = jwtDecode(response.idToken);
            localStorage.setItem("accessToken", response.accessToken);
            resolve({
              decodedAcc,
              decodedId,
              accessToken: response.accessToken,
            });
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
      } else {
        reject("No accounts found");
      }
    });
  };

  const handleLogin = (loginType) => {
    if (loginType === "popup") {
      instance
        .loginPopup()
        .then((response) => {
          if (response.account.username.endsWith("@etf.unsa.ba")) {
            //console.log(response);
            localStorage.setItem("isLoggedIn", "true");
            setFlag(true);

            getAccessToken()
              .then(({ decodedAcc, decodedId, accessToken }) => {
                localStorage.setItem("ime", `Welcome ${decodedAcc.name}`);
                setIme(`Welcome ${decodedAcc.name}`);
                setDecodedToken(decodedAcc);
                console.log("Decoded Token:", decodedAcc);
                localStorage.setItem('isLoggedInVia2fa', 'false');


                if (decodedId.roles !== undefined) {
                  console.log("Role:", decodedId.roles[0]);
                }

                navigate("/home");
              })
              .catch((error) => {
                console.error("Error fetching access token:", error);
              });
          } else {
            handleLogout();
          }
        })
        .catch((e) => {
          console.error(e);
          //handleLogout();
        });
    }
  };


  const handleLog = (e) => {
    e.preventDefault();

    console.log(user);
    console.log(pass);
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);

    axios.post('/api/login', {
      Username: user,
      Password: pass,
    })
      .then(response => {
        console.log('Uspješno logiranje:', response.data);
        localStorage.setItem("ime", `Welcome ${response.data.fullName}`);
        localStorage.setItem("accessToken", response.data.token);
        //console.log(response.data.token);

        if (response.data.secretKey == '' || response.data.secretKey == null || response.data.secretKey ==undefined ) {
          visib(true);
          axios.post('/api/login/setup/2fa', {
            Username: user,
            Password: pass,
          })
          .then(response => {
            console.log("uslo");
            console.log('Uspješno:', response.data);
            localStorage.setItem("QR", response.data.qrCodeImageUrl);
            localStorage.setItem("key", response.data.manualEntryKey);
            QR(response.data.qrCodeImageUrl)
            localStorage.setItem("logged", true);
            navigate('/twofactor')



          })
          .catch(error => {
            console.error('Greška prilikom logiranja:', error);
          });
        }

        else {
          console.log("ovdje");
          localStorage.setItem("logged", false);
          console.log(localStorage.getItem('logged'));
          visib(false);
          navigate('/twofactor')


        }


      })
      .catch(error => {
        console.error('Greška prilikom logiranja:', error);
      });
  }





  const handleLogout = () => {
    instance.logoutPopup();
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("decodedToken");
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("ime", "neautorizovano");
    setDecodedToken(null);
    setFlag(false);
  };

  return (
    <>
      <div className="main">
        <div className="cover-frame">
          <div className="login-frame">
            <h2>Login to your account</h2>
            <form id="loginForm" className="login-form">
              <input
                type="text"
                placeholder="Username or phone number"
                id="username"
                value={user} onChange={(e) => setUser(e.target.value)}
                className="inputs"
              />
              <input type="password" className="inputs"
                placeholder="Password" id="password" value={pass} onChange={(e) => setPass(e.target.value)} />
              <button onClick={(e) => { handleLog(e) }} type="submit">Log in</button>
            </form>
            <button
              className="microsoft-button"
              onClick={() => handleLogin("popup")}
            >
              <img
                src="https://avatars.githubusercontent.com/u/31075795?s=280&v=4"
                alt="Microsoft Logo"
                className="button-logo"
              ></img>
              Log in with Microsoft
            </button>
            <p>
              Don't have an account?{" "}
              <Link id="linkToRegister" to="/register">
                Sign up here!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
