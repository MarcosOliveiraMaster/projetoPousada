import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAM4fQ5hV-nWDQrnaZd0fllPpLZ8-v94v8",
  authDomain: "projetopousada.firebaseapp.com",
  databaseURL: "https://projetopousada-default-rtdb.firebaseio.com",
  projectId: "projetopousada",
  storageBucket: "projetopousada.firebasestorage.app",
  messagingSenderId: "132616743187",
  appId: "1:132616743187:web:d82bbf2c871e74588152e6",
  measurementId: "G-N9267J8XHR"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export default app
