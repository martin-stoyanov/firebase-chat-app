import React, { FormEvent, useState } from 'react';
import './App.css';

import dayjs from 'dayjs';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'martys-chat-app.firebaseapp.com',
  databaseURL: 'https://martys-chat-app.firebaseio.com',
  projectId: 'martys-chat-app',
  storageBucket: 'martys-chat-app.appspot.com',
  messagingSenderId: '139112056949',
  appId: '1:139112056949:web:8a72ad6f1bf43cfec5103c',
  measurementId: 'G-EX3C7P59NN',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>~Marty chat~</h1>
        <SignOut />
      </header>
      <section style={{ paddingBottom: '12vh' }}>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

const SignOut = () => {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

const ChatRoom = () => {
  // referencing the firestore "collection" aka the specific area in the database
  const messagesRef = firestore.collection('messages');

  // querying the saved messages to display them to the user
  const query = messagesRef.orderBy('createdAt').limit(25);

  // making query and listening to all updates with this hook
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState<string>('');

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser || {};

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue('');
  };
  return (
    <>
      {messages &&
        messages.map((msg: any) => <ChatMessage key={msg.id} message={msg} />)}
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">
          <span role="img" aria-label="Submit">
            👉
          </span>
        </button>
      </form>
    </>
  );
};

const ChatMessage = (props: any) => {
  const { text, uid, photoURL, createdAt } = props.message;

  //console.log(createdAt.toDate().toTimeString());

  // need to know whether each message has been sent by the user to style
  // it appropriately
  const messageType = uid === auth?.currentUser?.uid ? 'sent' : 'received';

  const chatTime = dayjs(createdAt?.toDate()).format('hh:mm A');

  return (
    <div className={`message ${messageType}`}>
      <img
        src={photoURL || 'https://api.adorable.io/avatars/130/funny-guy.png'}
        alt=""
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p className="message-text">{text}</p>

        {messageType === 'sent' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <p className="time-sent">{chatTime}</p>
            <span
              role="img"
              aria-label="delete message"
              style={{ color: 'white', position: 'relative', top: '-3px' }}
            >
              ✖️
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
