import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as FirebaseRecaptcha from "expo-firebase-recaptcha";
import { initializeApp } from "firebase/app";
import {
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import Constants from "expo-constants";
import { doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

// const FIREBASE_CONFIG: any = {
//   /*apiKey: "api-key",
//   authDomain: "project-id.firebaseapp.com",
//   databaseURL: "https://project-id.firebaseio.com",
//   projectId: "project-id",
//   storageBucket: "project-id.appspot.com",
//   messagingSenderId: "sender-id",
//   appId: "app-id",
//   measurementId: "G-measurement-id",*/
//   apiKey: "AIzaSyC76vcLxmP2xtQ1xOjMKc0QGDulRCOWhIc",
//   authDomain: "sign-up-phone-93e96.firebaseapp.com",
//   projectId: "sign-up-phone-93e96",
//   storageBucket: "sign-up-phone-93e96.appspot.com",
//   messagingSenderId: "212960350636",
//   appId: "1:212960350636:web:e0f8329942928b3e7b6a09",
// };

// try {
//   if (FIREBASE_CONFIG.apiKey) {
//     initializeApp(FIREBASE_CONFIG);

//   }
// } catch (err) {
//   // ignore app already initialized error on snack
// }

// Firebase references
// const auth = getAuth();
// const db = getFirestore( initializeApp(FIREBASE_CONFIG))

export default function App() {
  const recaptchaVerifier = React.useRef(null);
  const verificationCodeTextInput = React.useRef(null);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verificationId, setVerificationId] = React.useState("");
  const [verifyError, setVerifyError] = React.useState();
  const [verifyInProgress, setVerifyInProgress] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [confirmError, setConfirmError] = React.useState();
  const [confirmInProgress, setConfirmInProgress] = React.useState(false);
  const isConfigValid = !!Constants.manifest.extra.firebase.apiKey;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FirebaseRecaptcha.FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={Constants.manifest.extra.firebase}
        />
        <Text style={styles.title}>Firebase Phone Auth</Text>
        <Text style={styles.text}>Enter name</Text>
        <TextInput
          style={styles.textInput}
          autoFocus={isConfigValid}
          // autoCompleteType="tel"
          // keyboardType="phone-pad"
          // textContentType="telephoneNumber"
          placeholder="john doe"
          editable={!verificationId}
          onChangeText={(name: string) => setName(name)}
        />
        <Text style={styles.text}>Enter phone number</Text>
        <TextInput
          style={styles.textInput}
          autoFocus={isConfigValid}
          autoCompleteType="tel"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          placeholder="+84933183817"
          editable={!verificationId}
          onChangeText={(phoneNumber: string) => setPhoneNumber(phoneNumber)}
        />
         <Text style={styles.text}>Enter password</Text>
        <TextInput
          // style={styles.textInput}
          autoFocus={isConfigValid}
          // autoCompleteType="tel"
          // keyboardType="phone-pad"
          textContentType="password"
          // placeholder="+84933183817"
          editable={!verificationId}
          secureTextEntry={true}
          onChangeText={(password: string) => setPassword(password)}
        />
        <Button
          title={`${verificationId ? "Resend" : "Send"} Verification Code`}
          disabled={!phoneNumber}
          onPress={async () => {
            const phoneProvider = new PhoneAuthProvider(auth);
            try {
              setVerifyError(undefined);
              setVerifyInProgress(true);
              setVerificationId("");
              const verificationId = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                // @ts-ignore
                recaptchaVerifier.current
              );
              setVerifyInProgress(false);
              setVerificationId(verificationId);
              verificationCodeTextInput.current?.focus();
            } catch (err) {
              setVerifyError(err);
              setVerifyInProgress(false);
            }
          }}
        />
        {verifyError && (
          <Text style={styles.error}>{`Error: ${verifyError.message}`}</Text>
        )}
        {verifyInProgress && <ActivityIndicator style={styles.loader} />}
        {verificationId ? (
          <Text style={styles.success}>
            A verification code has been sent to your phone
          </Text>
        ) : undefined}
        {verificationId ? (
          <>
            <Text style={styles.text}>Enter verification code</Text>
            <TextInput
              ref={verificationCodeTextInput}
              style={styles.textInput}
              editable={!!verificationId}
              placeholder="12356"
              onChangeText={(verificationCode: string) =>
                setVerificationCode(verificationCode)
              }
            />
          </>
        ) : (
          <Text>Type phone number like that Ex: +84933183817</Text>
        )}
        <Button
          title="Confirm Verification Code"
          disabled={!verificationCode}
          onPress={async () => {
            try {
              setConfirmError(undefined);
              setConfirmInProgress(true);
              const credential = PhoneAuthProvider.credential(
                verificationId,
                verificationCode
              );
              const authResult = await signInWithCredential(auth, credential);
              setConfirmInProgress(false);
              setVerificationId("");
              setVerificationCode("");
              verificationCodeTextInput.current?.clear();
              Alert.alert("Dang nhap thanh cong");
              console.log("authResult", authResult)
              if(authResult) {
                setDoc(doc(db, "user", authResult.user.uid), {
                  id: authResult.user.uid,
                  name: name,
                  phone_number: authResult.user.phoneNumber,
                  location: [],
                });
              }
            } catch (err) {
              setConfirmError(err);
              setConfirmInProgress(false);
            }
          }}
        />
        {confirmError && (
          <Text style={styles.error}>{`Error: ${confirmError.message}`}</Text>
        )}
        {confirmInProgress && <ActivityIndicator style={styles.loader} />}
      </View>
      {!isConfigValid && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>
            To get started, set a valid FIREBASE_CONFIG in App.tsx.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    marginTop: 50,
  },
  title: {
    marginBottom: 2,
    fontSize: 29,
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: 10,
    opacity: 0.35,
    fontWeight: "bold",
  },
  text: {
    marginTop: 30,
    marginBottom: 4,
  },
  textInput: {
    marginBottom: 8,
    fontSize: 17,
    fontWeight: "bold",
  },
  error: {
    marginTop: 10,
    fontWeight: "bold",
    color: "red",
  },
  success: {
    marginTop: 10,
    fontWeight: "bold",
    color: "blue",
  },
  loader: {
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFFC0",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    fontWeight: "bold",
  },
});
