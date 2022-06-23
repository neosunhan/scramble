import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js'
    
// Add Firebase products that you want to use
// import { auth } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'
import {getDatabase, set, ref, get, child} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDM3Z4pMrvZkQh6ue6RGdXhG0LZqUq9n-U",
    authDomain: "scramble-18f08.firebaseapp.com",
    databaseURL: "https://scramble-18f08-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "scramble-18f08",
    storageBucket: "scramble-18f08.appspot.com",
    messagingSenderId: "332173910294",
    appId: "1:332173910294:web:070e9362c1834b5f8ab037",
    measurementId: "G-4YHFVX8HCN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
window.database = getDatabase(app);
window.db_set = set;
window.db_ref = ref;
window.db_get = get;
window.db_child = child;
console.log("Imported firebase");