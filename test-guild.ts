import { setDoc, doc, collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "./src/lib/firebase";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import * as dotenv from "dotenv";

dotenv.config();

async function test() {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, process.env.VITE_TEST_USER_EMAIL!, process.env.VITE_TEST_USER_PASSWORD!);
    const user = auth.currentUser;

    if (!user) {
        console.log("No user!");
        return;
    }
    console.log("Logged in as", user.uid);

    try {
        const guildId = "test_guild_" + Date.now();

        console.log("1. Creating guild document...");
        await setDoc(doc(db, "guilds", guildId), { name: "Test", leaderId: user.uid, memberIds: [user.uid] });
        console.log("Guild created successfully");

        console.log("2. Testing Subscriptions to missing rules (raids)...");
        onSnapshot(doc(db, 'guilds', guildId, 'raids', 'active'), {
            next: (snap) => console.log("raids snapshot success"),
            error: (e) => console.error("raids snapshot Error:", e.message)
        });

    } catch (e: any) {
        console.error("FAILED OPERATIONS:", e.message);
    }

    setTimeout(() => process.exit(0), 2000);
}

test();
