import { useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc,
  updateDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

export function useObjects() {
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "objects"), (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setObjects(items);
    });
    return () => unsub();
  }, []);

  const addObject = async ({ x, y, text }) => {
    await addDoc(collection(db, "objects"), {
      x, y, text,
      createdAt: serverTimestamp(),
    });
  };

  const updatePosition = async (id, x, y) => {
    await updateDoc(doc(db, "objects", id), { x, y });
  };

  return { objects, addObject, updatePosition };
}