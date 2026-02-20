import { create } from 'zustand';
import { db } from '../lib/firebase';
import {
    collection, query, where, orderBy, onSnapshot,
    addDoc, serverTimestamp, getDocs, doc, updateDoc,
    arrayUnion, setDoc
} from 'firebase/firestore';
import { useAuthStore } from './authStore';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: any;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage: string;
    lastTimestamp: any;
    unreadCount: number;
    otherParticipant: {
        uid: string;
        name: string;
        avatar: string;
    };
}

interface MessagingState {
    conversations: Conversation[];
    activeConversation: Message[];
    loading: boolean;

    fetchConversations: () => () => void;
    sendMessage: (receiverId: string, content: string) => Promise<void>;
    subscribeToMessages: (otherId: string) => () => void;
    markAsRead: () => Promise<void>;
}

export const useMessagingStore = create<MessagingState>((set) => ({
    conversations: [],
    activeConversation: [],
    loading: false,

    fetchConversations: () => {
        const user = useAuthStore.getState().user;
        if (!user) return () => { };

        set({ loading: true });
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', user.uid),
            orderBy('lastTimestamp', 'desc')
        );

        return onSnapshot(q, async (snapshot) => {
            try {
                const convs = await Promise.all(snapshot.docs.map(async (d) => {
                    const data = d.data();
                    const otherId = data.participants.find((p: string) => p !== user.uid);

                    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', otherId)));
                    const userData = userSnap.docs[0]?.data();

                    return {
                        id: d.id,
                        participants: data.participants,
                        lastMessage: data.lastMessage,
                        lastTimestamp: data.lastTimestamp,
                        unreadCount: data.unreadCount?.[user.uid] || 0,
                        otherParticipant: {
                            uid: otherId,
                            name: userData?.name || 'Unknown',
                            avatar: userData?.avatar || ''
                        }
                    } as Conversation;
                }));
                set({ conversations: convs, loading: false });
            } catch (err) {
                console.error("Fetch conversations error:", err);
                set({ loading: false });
            }
        }, (error) => {
            console.error("Conversations snapshot error:", error);
            set({ loading: false });
        });
    },

    sendMessage: async (receiverId, content) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const participants = [user.uid, receiverId].sort();
        const convId = participants.join('_');

        try {
            await addDoc(collection(db, 'messages'), {
                convId,
                senderId: user.uid,
                receiverId,
                content,
                timestamp: serverTimestamp(),
                read: false
            });

            const convRef = doc(db, 'conversations', convId);
            await updateDoc(convRef, {
                participants,
                lastMessage: content,
                lastTimestamp: serverTimestamp(),
                [`unreadCount.${receiverId}`]: arrayUnion(user.uid)
            }).catch(async () => {
                await setDoc(convRef, {
                    participants,
                    lastMessage: content,
                    lastTimestamp: serverTimestamp(),
                    unreadCount: { [receiverId]: 1 }
                });
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    },

    subscribeToMessages: (otherId) => {
        const user = useAuthStore.getState().user;
        if (!user) return () => { };

        const participants = [user.uid, otherId].sort();
        const convId = participants.join('_');

        const q = query(
            collection(db, 'messages'),
            where('convId', '==', convId),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
            set({ activeConversation: msgs });
        }, (error) => {
            console.error("Messages snapshot error:", error);
        });
    },

    markAsRead: async () => {
        // Placeholder
    }
}));
