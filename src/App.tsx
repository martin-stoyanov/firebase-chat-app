import React from 'react';
import './App.css';

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

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
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

  return (
    <div>
      {messages &&
        messages.map((msg: any) => <ChatMessage key={msg.id} message={msg} />)}
    </div>
  );
};

const ChatMessage = (props: any) => {
  const { text, uid } = props.message;

  return <p>{text}</p>;
};

export default App;
