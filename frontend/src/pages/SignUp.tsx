import React, { useCallback, useState } from "react";
import { Grid } from "@mui/material";

import { GoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Checkbox,
  FormControlLabel,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LoadingButton from "../components/LoadingButton.tsx";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import validator from "validator";
import { intervalToDuration } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as bookcarsTypes from ":bookcars-types";
import * as bookcarsHelper from ":bookcars-helper";
import env from "../config/env.config";
import * as helper from "../common/helper";
import { strings as commonStrings } from "../lang/common";
import { strings } from "../lang/sign-up";
import * as UserService from "../services/UserService";
import Layout from "../components/Layout";
import Error from "../components/Error";
import DatePicker from "../components/DatePicker";
import ReCaptchaProvider from "../components/ReCaptchaProvider";
import SocialLogin from "../components/SocialLogin";

const SignUp = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [tosChecked, setTosChecked] = useState(false);
  const [tosError, setTosError] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);
  const [phone, setPhone] = useState("");
  const [birthDateValid, setBirthDateValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userIdentification, setUserIdentification] = useState("");
  const [userDrivingLicence, setUserDrivingLicence] = useState("");
  const [nationality, setNationality] = useState("");

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!e.target.value) {
      setEmailError(false);
      setEmailValid(true);
    }
  };

  const validateEmail = async (_email?: string) => {
    if (_email) {
      if (validator.isEmail(_email)) {
        try {
          const status = await UserService.validateEmail({ email: _email });
          if (status === 200) {
            setEmailError(false);
            setEmailValid(true);
            return true;
          }
          setEmailError(true);
          setEmailValid(true);
          setError(false);
          return false;
        } catch (err) {
          helper.error(err);
          setEmailError(false);
          setEmailValid(true);
          return false;
        }
      } else {
        setEmailError(false);
        setEmailValid(false);
        return false;
      }
    } else {
      setEmailError(false);
      setEmailValid(true);
      return false;
    }
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (!e.target.value) {
      setPhoneValid(true);
    }
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    const valid = validator.isMobilePhone(phoneNumber);
    setPhoneValid(valid);
  };

  const validateBirthDate = (date?: Date) => {
    if (date && bookcarsHelper.isDate(date)) {
      const now = new Date();
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0;
      const _birthDateValid = sub >= env.MINIMUM_AGE;
      setBirthDateValid(_birthDateValid);
      return _birthDateValid;
    }
    setBirthDateValid(true);
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleUserIdentificationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserIdentification(e.target.value);
  };

  const handleUserDrivingLicenceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserDrivingLicence(e.target.value);
  };

  const handleNationalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNationality(e.target.value);
  };

  const handleTosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTosChecked(e.target.checked);
    if (e.target.checked) {
      setTosError(false);
    }
  };

  const handleRecaptchaVerify = useCallback(async (token: string) => {
    try {
      const ip = await UserService.getIP();
      const status = await UserService.verifyRecaptcha(token, ip);
      const valid = status === 200;
      setRecaptchaError(!valid);
    } catch (err) {
      helper.error(err);
      setRecaptchaError(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const _emailValid = await validateEmail(email);
      if (!_emailValid) {
        return;
      }

      const _phoneValid = validator.isMobilePhone(phone);
      if (!_phoneValid) {
        setPhoneValid(false);
        return;
      }

      const _birthDateValid = validateBirthDate(birthDate);
      if (!birthDate || !_birthDateValid) {
        return;
      }

      if (password.length < 6) {
        setPasswordError(true);
        setPasswordsDontMatch(false);
        return;
      }

      if (password !== confirmPassword) {
        setPasswordError(false);
        setPasswordsDontMatch(true);
        return;
      }

      if (!tosChecked) {
        setTosError(true);
        return;
      }

      setLoading(true);

      const data: bookcarsTypes.SignUpPayload = {
        email,
        phone,
        password,
        fullName,
        birthDate,
        language: UserService.getLanguage(),
        userIdentification,
        userDrivingLicence,
        nationality,
      };

      const status = await UserService.signup(data);

      if (status === 200) {
        const signInResult = await UserService.signin({
          email,
          password,
        });

        if (signInResult.status === 200) {
          navigate(`/${window.location.search}`);
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      helper.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      navigate("/");
    } else {
      setLanguage(UserService.getLanguage());
      setVisible(true);
    }
  };

  return (
    <ReCaptchaProvider>
      <Layout strict={false} onLoad={onLoad}>
        {visible && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              background: "linear-gradient(to right bottom, #430089, #82ffa1)",
              padding: 2,
            }}
          >
            <Paper
              elevation={10}
              sx={{
                padding: 4,
                maxWidth: 600,
                width: "100%",
                background:
                  "linear-gradient(to right bottom, #F7EFE5, #E1ACAC)",
              }}
            >
              <Typography variant="h4" align="center" gutterBottom>
                {strings.SIGN_UP_HEADING}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label={commonStrings.FULL_NAME}
                    value={fullName}
                    onChange={handleFullNameChange}
                    required
                    autoComplete="off"
                  />
                  <TextField
                    fullWidth
                    label={commonStrings.EMAIL}
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    error={!emailValid || emailError}
                    helperText={
                      (!emailValid && commonStrings.EMAIL_NOT_VALID) ||
                      (emailError && commonStrings.EMAIL_ALREADY_REGISTERED)
                    }
                    required
                    autoComplete="off"
                  />
                  <Grid container spacing={0} columns={16}>
                    <Grid item xs={7}>
                      <TextField
                        fullWidth
                        label={commonStrings.PHONE}
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        error={!phoneValid}
                        helperText={
                          !phoneValid && commonStrings.PHONE_NOT_VALID
                        }
                        required
                        autoComplete="off"
                      />
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={7}>
                      <DatePicker
                        label={commonStrings.BIRTH_DATE}
                        value={birthDate}
                        onChange={(_birthDate) => {
                          if (_birthDate) {
                            const _birthDateValid =
                              validateBirthDate(_birthDate);
                            setBirthDate(_birthDate);
                            setBirthDateValid(_birthDateValid);
                          }
                        }}
                        language={language}
                      />
                    </Grid>
                  </Grid>
                  {!birthDateValid && (
                    <Typography color="error">
                      {commonStrings.BIRTH_DATE_NOT_VALID}
                    </Typography>
                  )}

                  <Grid container columns={16} padding={"none"}>
                    <Grid item xs={7.5}>
                      <TextField
                        fullWidth
                        label={commonStrings.PASSWORD}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <Visibility />
                                ) : (
                                  <VisibilityOff />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={7.5}>
                      <TextField
                        fullWidth
                        label={commonStrings.CONFIRM_PASSWORD}
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <Visibility />
                                ) : (
                                  <VisibilityOff />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container columns={16}>
                    <Grid item xs={7.5}>
                      <TextField
                        fullWidth
                        label={commonStrings.USER_IDENTIFICATION}
                        value={userIdentification}
                        onChange={handleUserIdentificationChange}
                        required
                        autoComplete="off"
                      />
                    </Grid>
                    <Grid item xs={1}>
                      {/* Spacer */}
                    </Grid>
                    <Grid item xs={7.5}>
                      <TextField
                        fullWidth
                        label={commonStrings.USER_DRIVING_LICENCE}
                        value={userDrivingLicence}
                        onChange={handleUserDrivingLicenceChange}
                        required
                        autoComplete="off"
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label={commonStrings.NATIONALITY}
                    value={nationality}
                    onChange={handleNationalityChange}
                    required
                    autoComplete="off"
                  />
                  {env.RECAPTCHA_ENABLED && (
                    <Box sx={{ my: 2 }}>
                      <GoogleReCaptcha onVerify={handleRecaptchaVerify} />
                    </Box>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tosChecked}
                        onChange={handleTosChange}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        <Link
                          href="/tos"
                          target="_blank"
                          rel="noreferrer"
                          color={"#003"}
                        >
                          {commonStrings.TOS}
                        </Link>
                      </Typography>
                    }
                  />

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
                    variant="contained"
                    color="primary"
                    type="submit"
                    loading={loading}
                  >
                    {strings.SIGN_UP}
                  </LoadingButton>
                  <Button fullWidth variant="outlined" color="primary" href="/">
                    {commonStrings.CANCEL}
                  </Button>
                  <SocialLogin />
                </Stack>
              </form>

              {(passwordError ||
                passwordsDontMatch ||
                recaptchaError ||
                tosError ||
                error) && (
                <Box sx={{ mt: 2 }}>
                  {passwordError && (
                    <Error message={commonStrings.PASSWORD_ERROR} />
                  )}
                  {passwordsDontMatch && (
                    <Error message={commonStrings.PASSWORDS_DONT_MATCH} />
                  )}
                  {recaptchaError && (
                    <Error message={commonStrings.RECAPTCHA_ERROR} />
                  )}
                  {tosError && <Error message={commonStrings.TOS_ERROR} />}
                  {error && <Error message={strings.SIGN_UP_ERROR} />}
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Layout>
    </ReCaptchaProvider>
  );
};

export default SignUp;
