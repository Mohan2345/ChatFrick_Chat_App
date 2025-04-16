import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import { collection, doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc, updateDoc, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVOdUXgjt6DyBsvQXRs2m1rVGmiwRWujY",
  authDomain: "chat-application-18ef8.firebaseapp.com",
  projectId: "chat-application-18ef8",
  storageBucket: "chat-application-18ef8.firebasestorage.app",
  messagingSenderId: "247253665741",
  appId: "1:247253665741:web:5bef033ef3a41228816684"
};

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export const listenForChats = (setChats) => {
      const chatsRef = collection(db, "chats");
      const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
          const chatList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
          }));
  
          const filteredChats = chatList.filter((chat) => chat?.users?.some((user) => user.email === auth.currentUser.email));
  
          setChats(filteredChats);
      });
  
      return unsubscribe;
  };
  
  export const sendMessage = async (messageText, chatId, user1, user2) => {
      const chatRef = doc(db, "chats", chatId);
  
      const user1Doc = await getDoc(doc(db, "users", user1));
      const user2Doc = await getDoc(doc(db, "users", user2));
  
      console.log(user1Doc);
      console.log(user2Doc);
  
      const user1Data = user1Doc.data();
      const user2Data = user2Doc.data();
  
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
          await setDoc(chatRef, {
              users: [user1Data, user2Data],
              lastMessage: messageText,
              lastMessageTimestamp: serverTimestamp(),
          });
      } else {
          await updateDoc(chatRef, {
              lastMessage: messageText,
              lastMessageTimestamp: serverTimestamp(),
          });
      }
  
      const messageRef = collection(db, "chats", chatId, "messages");
  
      await addDoc(messageRef, {
          text: messageText,
          sender: auth.currentUser.email,
          timestamp: serverTimestamp(),
      });
  };
  
  export const listenForMessages = (chatId, setMessages) => {
      const chatRef = collection(db, "chats", chatId, "messages");
      onSnapshot(chatRef, (snapshot) => {
          const messages = snapshot.docs.map((doc) => doc.data());
          setMessages(messages);
      });
  };

  export { auth, db };