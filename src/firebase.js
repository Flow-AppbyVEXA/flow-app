import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBNhNTc7Si9g7bX4fST2en2H820AcyuDY4",
  authDomain: "flow-app-193e5.firebaseapp.com",
  projectId: "flow-app-193e5",
  storageBucket: "flow-app-193e5.firebasestorage.app",
  messagingSenderId: "446344903925",
  appId: "1:446344903925:web:3b12ae211fdc78932519bc"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
