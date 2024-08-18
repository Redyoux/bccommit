import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Link,
  Paper,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import LoadingButton from "../components/LoadingButton.tsx";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import * as bookcarsTypes from ":bookcars-types";
import { strings as commonStrings } from "../lang/common";
import { strings } from "../lang/sign-in";
import * as UserService from "../services/UserService";
import Error from "../components/Error";
import Layout from "../components/Layout";
import FacebookIcon from "../assets/img/facebook-icon.png";
import AppleIcon from "../assets/img/apple-icon.png";
import GoogleIcon from "../assets/img/google-icon.png";
import SocialLogin from "../components/SocialLogin";

import {
  LoginSocialFacebook,
  LoginSocialApple,
  LoginSocialGoogle,
} from "reactjs-social-login";
import * as env from "../config/env.config";
import { deepPurple } from "@mui/material/colors";

const REDIRECT_URI = window.location.href;

// Define the IResolveParams interface if it's not available
interface IResolveParams {
  data?: any;
  provider?: string;
  status?: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [blacklisted, setBlacklisted] = useState(false);
  const [stayConnected, setStayConnected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { email, password, stayConnected };

      const res = await UserService.signin(data);
      if (res.status === 200) {
        if (res.data.blacklisted) {
          await UserService.signout(false);
          setError(false);
          setBlacklisted(true);
        } else {
          setError(false);

          const params = new URLSearchParams(window.location.search);
          if (params.has("from")) {
            const from = params.get("from");
            if (from === "checkout") {
              navigate(`/checkout${window.location.search}`);
            } else {
              navigate(0);
            }
          } else {
            navigate(0);
          }
        }
      } else {
        setError(true);
        setBlacklisted(false);
      }
    } catch {
      setError(true);
      setBlacklisted(false);
    } finally {
      setLoading(false);
    }
  };

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("from")) {
        const from = params.get("from");
        if (from === "checkout") {
          navigate(`/checkout${window.location.search}`);
        } else {
          navigate(`/${window.location.search}`);
        }
      } else {
        navigate(`/${window.location.search}`);
      }
    } else {
      setVisible(true);
    }
  };

  const loginSuccess = async (
    socialSignInType: bookcarsTypes.SocialSignInType,
    accessToken: string,
    email: string,
    fullName: string,
    avatar?: string
  ) => {
    try {
      const data = { socialSignInType, accessToken, email, fullName, avatar };
      const res = await UserService.socialSignin(data);
      if (res.status === 200) {
        if (res.data.blacklisted) {
          await UserService.signout(false);
          setBlacklisted(true);
        } else {
          navigate(0);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    }
  };

  const loginError = (err: any) => {
    console.log(err);
    setError(true);
  };

  return (
    <Layout strict={false} onLoad={onLoad}>
      {visible && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(to right bottom, #430089, #82ffa1)",
          }}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%", maxWidth: 520 }}
          >
            <Paper
              elevation={10}
              sx={{
                p: 5,
                width: "100%",

                background:
                  "linear-gradient(to right bottom, #F7EFE5, #674188)",
              }}
            >
              <Typography variant="h4" align="center" gutterBottom>
                {strings.SIGN_IN_HEADING}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    name="email"
                    label={commonStrings.EMAIL}
                    value={email}
                    onChange={handleEmailChange}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    label={commonStrings.PASSWORD}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ my: 2 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={stayConnected}
                        onChange={(e) => setStayConnected(e.target.checked)}
                      />
                    }
                    label={strings.STAY_CONNECTED}
                  />
                  <Link
                    variant="subtitle2"
                    underline="hover"
                    href="/forgot-password"
                    color={"#003"}
                  >
                    {strings.RESET_PASSWORD}
                  </Link>
                </Stack>

                <LoadingButton
                  sx={{
                    backgroundColor: "#9268A5",
                    color: "#203541",
                    ":hover": {
                      backgroundColor: "#7B77FF",
                      color: "#003",
                    },
                  }}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={loading}
                >
                  {strings.SIGN_IN}
                </LoadingButton>
              </form>

              <SocialLogin />

              <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                {strings.NEW_USER}{" "}
                <Link variant="subtitle2" href="/sign-up" color={"#003"}>
                  {strings.SIGN_UP}
                </Link>
              </Typography>

              {error && (
                <Box sx={{ mt: 3 }}>
                  <Error message={strings.ERROR_IN_SIGN_IN} />
                </Box>
              )}
              {blacklisted && (
                <Box sx={{ mt: 3 }}>
                  <Error message={strings.IS_BLACKLISTED} />
                </Box>
              )}
            </Paper>
          </Stack>
        </Box>
      )}
    </Layout>
  );
};

export default SignIn;
