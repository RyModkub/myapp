import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, update } from 'firebase/database';
import { getAuth } from 'firebase/auth'; // Import getAuth

const firebaseConfig = {
    apiKey: "AIzaSyA0PqQhWnUJRj4h-zS7I-bkRiheeetE1x4",
    authDomain: "visitor-management-syste-24342.firebaseapp.com",
    databaseURL: "https://visitor-management-syste-24342-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "visitor-management-syste-24342",
    storageBucket: "visitor-management-syste-24342.appspot.com",
    messagingSenderId: "762483250151",
    appId: "1:762483250151:web:0d94351f2c399406ce2342",
    measurementId: "G-3YLZ82BZ6B"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Initialize Firebase Auth

export { auth, db, ref, set, get, remove, update };