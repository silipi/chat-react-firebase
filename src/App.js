import React, { useState, useRef } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const configFirebaseApp = {
  //sua config do firebase aqui
};

firebase.initializeApp(configFirebaseApp);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return <div className="App">{user ? <ChatRoom /> : <SignIn />}</div>;
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef("");

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const submitMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <div ref={dummy}></div>

      <form onSubmit={submitMessage}>
        <input
          placeholder="Digite uma mensagem..."
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Enviar mensagem</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageCSSClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className="messageContainer">
      <img
        src={photoURL || "https://api.adorable.io/avatars/285/user.png"}
        alt="Foto de perfil"
        className="profilePic"
      />
      <p className={`message ${messageCSSClass}`}>{text}</p>
    </div>
  );
}

export default App;
